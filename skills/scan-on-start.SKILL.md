---
title: Scan-On-Start Skill
summary: |
  Scans the workspace (frontend + backend) when the project starts, reports likely bugs, asks the user to fix them, and—after the user confirms fixes—prompts to push the changes to GitHub with a clear commit and PR description. Runs non-blocking, read-only checks and never modifies project files without explicit user approval.
scope: repository 
triggers:
  - on: workspace/startup
    description: Run a background scan when the project environment is detected as "started" (IDE open or dev server launched).
permissions: read-only by default; write actions require explicit user confirmation
---

## Purpose

This skill performs a lightweight, non-intrusive health check across the frontend and backend each time the project starts. It aims to detect common, actionable problems (missing env variables, accidentally-committed secrets, obvious dependency/script mismatches, and simple lint/test failures when runnable) and guide the developer through resolving them. After the developer confirms fixes, the skill offers a safe, recommended git workflow to commit and push the fix with a descriptive message.

## Non-interrupting design principles
- Run in background and yield notifications only; never kill or alter running dev servers.
- Default to read-only analysis: file reads, static checks, and script dry-runs. No automatic edits or pushes.
- Only suggest fixes; apply changes only if the user explicitly approves a concrete edit or patch.
- Rate-limit scans (once per workspace startup) and keep CPU/disk usage minimal.

## What the skill checks (initial set)
- Presence of `.env` files and accidental secrets in tracked files.
- Typical Node/React issues: missing `node_modules`, mismatched `package.json` scripts, `build/` or `dist/` present.
- Common backend issues: missing `MONGODB_URI` usage, unreachable config references, obvious syntax errors found via a quick parse.
- Frontend issues: production build artifacts accidentally committed under `build/` or `public/`.
- Simple static issues: `package.json`/`package-lock.json` mismatch, missing `start` script for each package.

## Execution flow
1. Detect workspace start (triggered on IDE open or when user asks to run the scan).
2. Run read-only scans in parallel for `frontend/` and `backend`:
   - list environment files (`**/.env`)
   - check for large build artifacts (`frontend/build`, `build/`, `dist/`)
   - check `package.json` presence and scripts
   - run a lightweight parser to detect obvious JS/JSON syntax errors
3. Aggregate findings and present them in a concise report with prioritized suggestions.
4. For each suggested fix the skill offers:
   - a short explanation of the issue
   - recommended commands or code changes (display only)
   - an option to apply an automated change (ONLY after explicit user approval)
5. After user confirms a fix is applied, the skill asks whether to create a commit and push. If confirmed, the skill shows the exact git commands it will run and asks permission to run them.

## Safe push workflow (suggested)
- Create a descriptive commit message: `fix: <short-description>\n\n<detailed description of bug + fix + affected modules>`
- Branch off `main` with: `git checkout -b fix/<short-description>`
- Stage and commit the selected changes.
- Push and open a PR with a template describing the bug, reproduction steps, and the fix.

Example commands (presented to the user before execution):
```powershell
git checkout -b fix/<short-description>
git add <files>
git commit -m "fix: <short description>\n\nDetailed explanation of bug and fix"
git push -u origin fix/<short-description>
```

## Prompts and user interactions
- When scan completes: "I found X potential issues in frontend and Y in backend. Would you like to review fixes?"
- For each issue: "Explain" | "Show commands" | "Apply suggested change" | "Skip"
- After fixes: "Create commit and push these changes to GitHub?" (Yes/No)

## Configuration (workspace-level)
- `skills.scan-on-start.enabled` (boolean, default: true)
- `skills.scan-on-start.runOnStartup` (boolean, default: true)
- `skills.scan-on-start.excludes` (array of glob patterns to skip)
- `skills.scan-on-start.scanDepth` (number, default: 3)

## Safety & privacy
- Never print detected secret values; only report their presence and file path.
- By default the skill avoids running tests or heavy builds. If the user requests a deeper check (lint, tests), require confirmation.

## Example assistant prompts to trigger the skill
- "Run the project-start scan and show issues."
- "Scan frontend and backend for accidental secrets and missing env vars."
- "After I fix the reported bug, show git commands to push the fix."

## Notes for implementers / maintainers
- This SKILL is a high-level instruction for the assistant/agent. The assistant must map the steps above to concrete file-system and git operations available in the environment.
- The assistant must confirm any write or git command before execution.

---
Generated by agent-customization guidance; tuned to run read-only on startup and to request confirmation before applying or pushing fixes.
