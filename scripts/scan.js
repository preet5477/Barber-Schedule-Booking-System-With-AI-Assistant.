#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const report = { envFiles: [], buildDirs: [], packageChecks: [], syntaxErrors: [] };

function findFiles(dir, pattern) {
  const results = [];
  function walk(d) {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) { 
        // skip node_modules for speed
        if (e.name === 'node_modules' || e.name === '.git') continue;
        walk(full);
      } else if (pattern.test(e.name)) results.push(full);
    }
  }
  try { walk(dir); } catch (e) {}
  return results;
}

// 1) env files
['backend', 'frontend', root].forEach((p) => {
  const dir = path.resolve(root, p === root ? '.' : p);
  const files = findFiles(dir, /^\.env($|\.)/);
  files.forEach(f => report.envFiles.push(path.relative(root, f)));
});

// 2) build dirs
['frontend/build', 'build', 'dist'].forEach(d => {
  const target = path.join(root, d);
  if (fs.existsSync(target)) report.buildDirs.push(d);
});

// 3) package.json checks
['package.json', 'backend/package.json', 'frontend/package.json'].forEach(p => {
  const file = path.join(root, p);
  if (!fs.existsSync(file)) {
    report.packageChecks.push({ file: p, ok: false, reason: 'missing' });
    return;
  }
  try {
    const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
    const hasStart = pkg.scripts && (pkg.scripts.start || pkg.scripts.dev || pkg.scripts.build);
    report.packageChecks.push({ file: p, ok: !!hasStart, scripts: Object.keys(pkg.scripts || {} ) });
  } catch (err) {
    report.packageChecks.push({ file: p, ok: false, reason: 'invalid json', error: err.message });
  }
});

// 4) quick syntax check for common JS files (node --check)
const jsTargets = ['backend/server.js', 'backend/config/database.js'];
jsTargets.forEach(rel => {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) return;
  try {
    execSync(`node --check "${file}"`, { stdio: 'ignore' });
  } catch (err) {
    report.syntaxErrors.push({ file: rel, message: (err && err.message) || 'syntax error' });
  }
});

// 5) quick JSON checks for package-locks
['frontend/package-lock.json', 'package-lock.json', 'backend/package-lock.json'].forEach(rel => {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) return;
  try {
    JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    report.packageChecks.push({ file: rel, ok: false, reason: 'invalid json', error: err.message });
  }
});

const argv = process.argv.slice(2);
if (argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
  const hasCritical = report.syntaxErrors.length || report.packageChecks.some(p => p.ok === false && p.reason === 'missing');
  process.exit(hasCritical ? 2 : 0);
} else {
  // Print human-friendly summary
  console.log('=== Workspace Scan Report ===');
  console.log('Root:', root);
  console.log('Found .env files:', report.envFiles.length ? '\n  ' + report.envFiles.join('\n  ') : ' none');
  console.log('Found build/dist directories:', report.buildDirs.length ? '\n  ' + report.buildDirs.join('\n  ') : ' none');
  console.log('\nPackage checks:');
  report.packageChecks.forEach(p => {
    if (p.ok) console.log('  ✓', p.file, '- scripts:', p.scripts ? p.scripts.join(', ') : 'none');
    else console.log('  ✗', p.file, '-', p.reason || p.error || 'problem');
  });

  if (report.syntaxErrors.length) {
    console.log('\nSyntax errors:');
    report.syntaxErrors.forEach(e => console.log('  ✗', e.file, '-', e.message));
  } else {
    console.log('\nSyntax errors: none detected for checked files');
  }

  console.log('\nNext steps:');
  console.log('- Review the items above. For each problem, open the file and fix it.');
  console.log('- To create a safe commit and push, run:');
  console.log('\n  git checkout -b fix/describe-issue');
  console.log('  git add <files>');
  console.log('  git commit -m "fix: short description\n\nDetailed explanation"');
  console.log('  git push -u origin fix/describe-issue\n');

  const hasCritical = report.syntaxErrors.length || report.packageChecks.some(p => p.ok === false && p.reason === 'missing');
  process.exit(hasCritical ? 2 : 0);
}
