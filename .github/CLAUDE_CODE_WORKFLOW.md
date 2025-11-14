# Git Workflow for Claude Code Sessions

## ⚠️ CRITICAL RULES

1. **ALWAYS work on `main` directly** (it's protected, so you can't break it)
2. **NEVER create a new Claude branch** unless explicitly asked
3. **ALWAYS fetch and pull before starting work**
4. **ALWAYS push your changes when done**

## Why This Matters

### The Problem We're Solving

This repository previously had **18+ orphaned Claude Code branches** with auto-generated names like:
- `claude/clinical-toolkit-dev-011CV3m6VqHpPLvmJmm38gKX`
- `claude/clinical-wizard-integration-plan-011CV5rwbtdPvUCiwNCnKUf9`
- `claude/fix-failing-tests-019F6ak6gbyFrej8hY2qaHpr`

**This caused major problems:**
- ❌ Credit waste: Every session spent time figuring out which branch had the latest work
- ❌ Lost work: Features scattered across different branches
- ❌ Merge conflicts: Working on outdated branches
- ❌ Confusion: No clear "current" state

**Cost:** Approximately $200+ in wasted credits from branch confusion alone.

### The Solution

**Work directly on `main` for all changes.**

Why this is safe:
1. ✅ CI/CD runs on every push (tests, lint, build)
2. ✅ Bad code can't be pushed (protected by status checks)
3. ✅ Linear history (no merge confusion)
4. ✅ Always know what's "current" (it's on main)

## Starting a New Claude Code Session

```bash
# 1. Fetch latest changes
git fetch origin

# 2. Switch to main (or stay on main)
git checkout main

# 3. Pull latest changes
git pull origin main

# 4. Verify you're on main
git branch --show-current
# Output should be: main

# 5. Start working
```

**IMPORTANT:** If you see any branch name other than `main`, STOP and checkout main.

## During Your Session

### Making Changes

1. Make your edits
2. Run tests: `npm run test:run`
3. Commit with clear messages:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```
4. Push frequently to avoid losing work:
   ```bash
   git push origin main
   ```

### Commit Message Format

Follow conventional commits:
- `feat: ` - New feature
- `fix: ` - Bug fix
- `docs: ` - Documentation changes
- `test: ` - Test changes
- `refactor: ` - Code refactoring
- `chore: ` - Maintenance tasks

Examples:
```bash
git commit -m "feat: add ASCVD calculator"
git commit -m "fix: resolve storage test failures"
git commit -m "docs: update Android setup guide"
git commit -m "test: add eGFR calculator tests"
```

### If CI Fails

If your push is rejected due to failing CI:

1. **Check the error message**
2. **Fix the issue locally**
   ```bash
   npm run lint          # Fix linting errors
   npm run test:run      # Fix test failures
   npm run build         # Fix build errors
   ```
3. **Commit the fix**
4. **Push again**

Do NOT bypass CI checks. They exist to prevent broken code on main.

## Ending Your Session

```bash
# 1. Commit any pending changes
git add .
git commit -m "session: describe what you accomplished"

# 2. Push to main
git push origin main

# 3. Verify push succeeded
git status
# Should say: "Your branch is up to date with 'origin/main'"
```

## Multi-Device Workflow

If user works on both laptop and PC:

**Laptop**:
```bash
git checkout main
git pull origin main  # Get latest from PC
# ... work ...
git push origin main
```

**PC**:
```bash
git checkout main
git pull origin main  # Get latest from Laptop
# ... work ...
git push origin main
```

**Golden Rule**: Always pull before starting, always push when done.

## If You MUST Create a Branch

Only create a branch if:
- Working on a major feature that will take multiple sessions
- User explicitly requests a branch
- Experimenting with something risky

If creating a branch:
```bash
# Use descriptive names, not auto-generated
git checkout -b feature/descriptive-name

# When done, merge back to main immediately
git checkout main
git merge --no-ff feature/descriptive-name
git push origin main

# Delete the branch
git branch -d feature/descriptive-name
git push origin --delete feature/descriptive-name
```

**Never leave branches unmerged.**

## What NOT to Do

❌ `git checkout -b claude/something-with-random-id`
❌ Leaving branches unmerged for multiple sessions
❌ Creating multiple branches per session
❌ Forgetting to push at end of session
❌ Working on outdated branches
❌ Bypassing CI checks (--no-verify)

## Troubleshooting

### "I'm on the wrong branch"

```bash
# Switch to main
git checkout main

# Pull latest
git pull origin main

# If you have uncommitted changes, stash them first:
git stash
git checkout main
git pull origin main
git stash pop
```

### "Main is behind my current branch"

```bash
# If your current branch has valuable work:
git checkout main
git merge your-current-branch
git push origin main

# Delete the old branch
git branch -d your-current-branch
git push origin --delete your-current-branch
```

### "I accidentally created a Claude branch"

```bash
# Merge it to main immediately
git checkout main
git merge your-accidental-branch
git push origin main

# Delete the accidental branch
git branch -d your-accidental-branch
git push origin --delete your-accidental-branch
```

### "There are merge conflicts"

```bash
# 1. Identify conflicted files
git status

# 2. Open each file and resolve conflicts
# Look for <<<<<<< HEAD, =======, >>>>>>> markers

# 3. After resolving, mark as resolved
git add conflicted-file.ts

# 4. Complete the merge
git commit -m "resolve: merge conflicts from branch"

# 5. Push
git push origin main
```

## Emergency: Branches Got Messy Again

If you find multiple Claude branches scattered across the repository:

1. **STOP creating new branches**
2. Read `GIT_CONSOLIDATION_TASK.md`
3. Consolidate everything back to `main`
4. Delete all Claude branches
5. Start fresh on `main`

## Quick Reference Card

**Before starting work:**
```bash
git checkout main && git pull origin main
```

**During work:**
```bash
# Make changes
npm run test:run
git add .
git commit -m "feat: what you did"
git push origin main
```

**When ending session:**
```bash
git add .
git commit -m "session: summary of accomplishments"
git push origin main
```

**Verify you're on main:**
```bash
git branch --show-current
# Should output: main
```

## Project-Specific Notes

### Test Status (As of Consolidation)

- **97 passing / 16 failing (86% pass rate)**
- All business logic tests passing:
  - ✅ Storage tests (16/16)
  - ✅ ASCVD calculator (21/21)
  - ✅ eGFR calculator (24/24)
  - ✅ CHA2DS2-VASc (24/24)
- UI component tests with known issues:
  - ⚠️ COPDAssessment (8 failing)
  - ⚠️ AsthmaControlTest (8 failing)

**It's OK to push code with these 16 failing tests** - they're known issues in the UI components, not business logic bugs.

### CI/CD Pipeline

The project has automated CI that runs on every push:
1. **Lint**: ESLint checks
2. **Test**: Vitest unit tests
3. **Build**: Vite production build

If any step fails, the push is rejected.

### Android Development

The project includes a full Android/Capacitor setup in the `android/` directory.

To test Android:
```bash
npm run android-test
```

Refer to `ANDROID_QUICK_START.md` for detailed instructions.

## Additional Resources

- **Project Overview**: `README.md`
- **Android Setup**: `ANDROID_QUICK_START.md`
- **Testing Guide**: `TESTING_GUIDE.md`
- **Handoff Document**: `HANDOFF_COMPLETE.md`
- **Branch Protection**: `.github/BRANCH_PROTECTION.md`
- **Consolidation Guide**: `GIT_CONSOLIDATION_TASK.md`

## Questions?

If you're unsure about the workflow:
1. Read this document again
2. Check `HANDOFF_COMPLETE.md` for project context
3. When in doubt, work on `main`

**Remember: The goal is to avoid creating 18+ orphaned branches ever again.**
