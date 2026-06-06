const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const root = path.resolve(__dirname, '..');
function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { stdio: opts.stdio || 'pipe' }).toString();
  } catch (err) {
    // execSync throws when the child exits non-zero. If the command
    // wrote JSON to stdout before exiting, capture and return it so
    // the caller can still parse the scan output.
    if (err && err.stdout) {
      try { return err.stdout.toString(); } catch (e) { /* fallthrough */ }
    }
    return null;
  }
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

async function main() {
  // check if inside git repo
  const inside = run('git rev-parse --is-inside-work-tree');
  const isGit = !!inside && inside.trim() === 'true';

  // run the scan and parse JSON
  const scanOut = run(`node "${path.join(root, 'scripts', 'scan.js')}" --json`);
  if (!scanOut) {
    console.log('Scan failed or produced no output. Skipping prestart checks.');
    return;
  }
  let report;
  try { report = JSON.parse(scanOut); } catch (e) { console.log('Could not parse scan output:', e.message); return; }

  const fixes = [];

  // --- Project-wide JS syntax scan and conservative auto-fix attempts ---
  // Find .js files under backend and frontend/src (skip node_modules and build)
  function findJSFiles(startDir) {
    const results = [];
    function walk(dir) {
      let entries;
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          if (e.name === 'node_modules' || e.name === '.git' || e.name === 'build' || e.name === 'dist') continue;
          walk(full);
        } else if (e.isFile() && full.endsWith('.js')) results.push(full);
      }
    }
    walk(startDir);
    return results;
  }

  function checkSyntaxFile(file) {
    try {
      const r = spawnSync('node', ['--check', file], { encoding: 'utf8' });
      if (r.status === 0) return null;
      const stderr = r.stderr || r.stdout || '';
      return stderr.toString();
    } catch (e) { return String(e.message || e); }
  }

  function parseErrorLocation(errText, filePath) {
    // try to find line:col patterns like filename:line:col
    const regex = new RegExp(`${filePath.replace(/[-\\/\\^$*+?.()|[\]{}]/g, '\\$&')}:(\\d+):(\\d+)`);
    const m = regex.exec(errText);
    if (m) return { line: parseInt(m[1], 10), col: parseInt(m[2], 10) };
    // fallback: look for :line) or :line\n
    const regex2 = /:(\d+)(?::(\d+))?/;
    const m2 = regex2.exec(errText);
    if (m2) return { line: parseInt(m2[1], 10), col: m2[2] ? parseInt(m2[2], 10) : null };
    return null;
  }

  function attemptFixSyntax(file, location) {
    // Conservative fix: append a closing paren if counts unbalanced
    try {
      const src = fs.readFileSync(file, 'utf8');
      const backup = file + '.bak_autofix';
      fs.writeFileSync(backup, src, 'utf8');
      const lines = src.split(/\r?\n/);
      const idx = location && location.line ? Math.max(0, location.line - 1) : lines.length - 1;
      // special-case: app.listen(...) missing closing paren
      const hasAppListen = /app\.listen\s*\(/.test(src);
      if (hasAppListen) {
        // find the line with app.listen
        const listenIdx = lines.findIndex(l => /app\.listen\s*\(/.test(l));
        if (listenIdx !== -1) {
          const line = lines[listenIdx];
          const text = src;
          const openPar = (text.match(/\(/g) || []).length;
          const closePar = (text.match(/\)/g) || []).length;
          if (openPar > closePar) {
            // If the line already ends with ');', insert an extra ')' before the semicolon -> '));'
            if (/\)\s*;\s*$/.test(lines[listenIdx]) && !/\)\)\s*;\s*$/.test(lines[listenIdx])) {
              lines[listenIdx] = lines[listenIdx].replace(/\)\s*;\s*$/, '));');
            } else {
              // otherwise append a single closing paren
              lines[listenIdx] = lines[listenIdx] + ')';
            }
          }
        }
      } else {
        // simple heuristics: balance parentheses, braces, brackets globally
        const text = src;
        const openPar = (text.match(/\(/g) || []).length;
        const closePar = (text.match(/\)/g) || []).length;
        const openBr = (text.match(/\{/g) || []).length;
        const closeBr = (text.match(/\}/g) || []).length;
        const openSq = (text.match(/\[/g) || []).length;
        const closeSq = (text.match(/\]/g) || []).length;
        if (openPar > closePar) {
          lines[idx] = lines[idx] + ')';
        } else if (openBr > closeBr) {
          lines[idx] = lines[idx] + '\n}';
        } else if (openSq > closeSq) {
          lines[idx] = lines[idx] + ']';
        } else {
          // nothing to do
          return false;
        }
      }
      fs.writeFileSync(file, lines.join('\n'), 'utf8');
      // re-check syntax
      const after = checkSyntaxFile(file);
      if (!after) return true;
      // revert
      fs.copyFileSync(backup, file);
      fs.unlinkSync(backup);
      return false;
    } catch (e) {
      return false;
    }
  }

  // collect files from backend and frontend/src
  const jsFiles = [];
  jsFiles.push(...findJSFiles(path.join(root, 'backend')));
  jsFiles.push(...findJSFiles(path.join(root, 'frontend')));
  const syntaxIssues = [];
  for (const f of jsFiles) {
    const err = checkSyntaxFile(f);
    if (err) syntaxIssues.push({ file: f, err });
  }
  if (syntaxIssues.length) {
    console.log('Detected syntax issues in the project:');
    for (const s of syntaxIssues) {
      console.log('-', path.relative(root, s.file));
      console.log('  Error:', s.err.split('\n').slice(0,3).join('\n'));
      const loc = parseErrorLocation(s.err, s.file);
      const ans = await ask(`Attempt a conservative auto-fix for ${path.relative(root, s.file)}? (y/N): `);
      if (ans.toLowerCase() === 'y') {
        const ok = attemptFixSyntax(s.file, loc);
        if (ok) {
          console.log('Auto-fix applied to', path.relative(root, s.file));
          fixes.push({ type: 'syntax_fix', file: path.relative(root, s.file) });
        } else {
          console.log('Auto-fix failed for', path.relative(root, s.file));
        }
      }
    }
  }

  // handle tracked build dirs
  for (const d of report.buildDirs) {
    // check if any file under the dir is tracked
    if (!isGit) continue;
    const listed = run(`git ls-files "${d}"`);
    if (listed && listed.trim()) {
      console.log(`Detected tracked build directory: ${d}`);
      const ans = await ask(`Remove ${d} from git and add to .gitignore? (y/N): `);
      if (ans.toLowerCase() === 'y') {
        // ensure .gitignore contains the entry
        const gi = path.join(root, '.gitignore');
        let giText = '';
        try { giText = fs.readFileSync(gi, 'utf8'); } catch (e) { giText = ''; }
        if (!giText.includes(d)) {
          giText = giText + '\n' + d + '\n';
          fs.writeFileSync(gi, giText, 'utf8');
          console.log('Updated .gitignore');
        }
        // remove tracked files
        run(`git rm -r --cached "${d}"`, { stdio: 'inherit' });
        fixes.push({ type: 'remove_build', dir: d });
      }
    }
  }

  // handle tracked .env files
  for (const f of report.envFiles) {
    if (!isGit) continue;
    const tracked = run(`git ls-files "${f}"`);
    if (tracked && tracked.trim()) {
      console.log(`Detected tracked env file: ${f}`);
      const ans = await ask(`Remove ${f} from git and create ${f}.example? (y/N): `);
      if (ans.toLowerCase() === 'y') {
        // create example file by replacing values with placeholders
        try {
          const full = path.join(root, f);
          const contents = fs.readFileSync(full, 'utf8');
          const example = contents.split(/\r?\n/).map(line => {
            if (!line || line.trim().startsWith('#')) return line;
            const idx = line.indexOf('=');
            if (idx === -1) return line;
            const key = line.slice(0, idx).trim();
            return `${key}=`;
          }).join('\n');
          const examplePath = full + '.example';
          fs.writeFileSync(examplePath, example, 'utf8');
          console.log(`Wrote ${path.relative(root, examplePath)}`);
          // remove tracked env file from git
          run(`git rm --cached "${f}"`, { stdio: 'inherit' });
          fixes.push({ type: 'remove_env', file: f, example: path.relative(root, examplePath) });
        } catch (e) { console.log('Failed to create example file:', e.message); }
      }
    }
  }

  if (fixes.length === 0) {
    console.log('No automatic fixes applied. Continuing start.');
    return;
  }

  // Stage changes and commit
  if (!isGit) { console.log('Not a git repository; manual commits required.'); return; }
  // create branch
  const ts = Date.now();
  const branch = `fix/auto-scan-${ts}`;
  run(`git checkout -b ${branch}`, { stdio: 'inherit' });
  run('git add -A', { stdio: 'inherit' });
  const summary = fixes.map(f => f.type + ':' + (f.dir || f.file)).join(', ');
  const commitMsg = `chore: apply auto-scan fixes\n\nApplied fixes: ${summary}`;
  run(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });

  const ansPush = await ask('Push the fix branch to origin now? (y/N): ');
  if (ansPush.toLowerCase() === 'y') {
    const pushed = run(`git push -u origin ${branch}`, { stdio: 'inherit' });
    console.log('Pushed branch:', branch);
  } else {
    console.log('Branch created locally:', branch);
  }
}

main().catch(err => { console.error('prestart error:', err); process.exit(0); });
