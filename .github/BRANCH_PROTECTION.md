# Branch Protection Rules

## For Repository Owner (Manual Setup Required)

Go to GitHub: Settings → Branches → Add Rule

**Branch name pattern**: `main`

Enable:
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require linear history
- ✅ Do not allow bypassing the above settings

**Status checks required**:
- CI: Lint
- CI: Test
- CI: Build

This prevents:
- Direct commits to main
- Merging broken code
- Creating branch divergence

## Why These Rules Matter

### Problem This Solves

Without branch protection, we end up with:
- 18+ orphaned Claude Code branches
- Divergent history across sessions
- Lost work scattered across branches
- Credit waste re-explaining context

### How Protection Helps

1. **Forces PRs**: All changes must go through pull requests
2. **Ensures Quality**: CI must pass before merging
3. **Linear History**: No merge confusion or divergence
4. **Clear State**: Main always represents the "current" state

## Alternative: Working Directly on Main

If you prefer to skip PRs and work directly on main (faster iteration):

1. **Don't enable** "Require pull request reviews before merging"
2. **Do enable** "Require status checks to pass before merging"
3. **Allow** direct pushes to main (but CI must pass)

This allows Claude Code to push directly to main, but only if tests pass.

## Setting Up for Claude Code Sessions

### Option A: PR-Based Workflow (Recommended for Production)

1. Enable full branch protection on `main`
2. Claude creates feature branches for each session
3. Merge via PR when CI passes
4. Delete feature branch after merge

Pros:
- Clean history
- Review opportunity
- Rollback capability

Cons:
- Extra PR step
- Slightly slower

### Option B: Direct Push Workflow (Recommended for Solo Development)

1. Enable CI status checks only
2. Allow direct pushes if tests pass
3. Claude works directly on `main`
4. No PR overhead

Pros:
- Faster iteration
- No PR ceremony
- Simpler workflow

Cons:
- Less formal review
- Harder to rollback

## Recommended Setup for This Project

Given that you're the sole developer and want fast iteration:

**Use Option B: Direct Push Workflow**

1. Go to GitHub Settings → Branches → Add Rule
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require linear history
4. Do NOT enable:
   - ❌ Require pull request reviews
   - ❌ Require signed commits
   - ❌ Restrict who can push

This allows Claude to push directly to main, but only if CI passes.

## Deleting Obsolete Claude Branches

After consolidation, delete all orphaned branches:

```bash
# Remote branches (requires GitHub permissions)
git push origin --delete claude/clinical-toolkit-dev-011CV3m6VqHpPLvmJmm38gKX
git push origin --delete claude/clinical-toolkit-documentation-complete-011CUzAJL6A1wxNRKAZm9iJ4
git push origin --delete claude/clinical-toolkit-fix-011CV4JmZuYjfJic8WnTu76p
git push origin --delete claude/clinical-toolkit-medical-wizards-011CUyoi3zVur3r3bsa8h44Y
git push origin --delete claude/clinical-toolkit-phase-1-5-complete-011CUyviLcwK6ATakCEoJVJb
git push origin --delete claude/clinical-wizard-android-run-011CV5qbqm8NhNyWBk57de1w
git push origin --delete claude/clinical-wizard-android-testing-011CV5dQFcrWrS7oazB2vHwU
git push origin --delete claude/clinical-wizard-development-011CV5Tefke3VpuihSb5FvsF
git push origin --delete claude/clinical-wizard-integration-plan-011CV5rwbtdPvUCiwNCnKUf9
git push origin --delete claude/clinical-wizard-shared-removal-011CV5m6GBGSixdwiFEz5L8j
git push origin --delete claude/clinical-wizard-work-011CUzg2nm4eefmCbJaxk4Cd
git push origin --delete claude/fix-lucide-icon-export-011CV21DBkBDVfNM2WkVCYA5
git push origin --delete claude/healthcare-vocabulary-app-011CUxb5UZfzTocYn9ZNvyf1
git push origin --delete claude/hello-fri-011CV3updtpZJNx2CvdeoyYb
git push origin --delete claude/mobile-dev-setup-011CUz7VfomXtdw2Q8zwmTtK
git push origin --delete claude/mobile-toolkit-launch-011CV26LiRArYTrgYWPamsHj
git push origin --delete claude/planning-implementation-questions-019F6ak6gbyFrej8hY2qaHpr
git push origin --delete claude/fix-failing-tests-019F6ak6gbyFrej8hY2qaHpr

# Local branches
git branch -d claude/clinical-toolkit-dev-011CV3m6VqHpPLvmJmm38gKX 2>/dev/null
git branch -d claude/clinical-wizard-integration-plan-011CV5rwbtdPvUCiwNCnKUf9 2>/dev/null
git branch -d claude/fix-failing-tests-019F6ak6gbyFrej8hY2qaHpr 2>/dev/null
# ... continue for all branches
```

Or use GitHub UI:
1. Go to: https://github.com/pmartin1915/clinical-toolkit/branches
2. Find each `claude/*` branch
3. Click the trash icon to delete

## Future Prevention

To prevent this problem from recurring:

1. **Read `.github/CLAUDE_CODE_WORKFLOW.md`** at start of each session
2. **Always work on `main`** (unless doing risky experiments)
3. **Never create auto-generated Claude branches** (e.g., `claude/task-name-randomid`)
4. **Pull before starting**, **push when done**
5. **Verify you're on main**: `git branch --show-current` should say `main`

## Emergency Recovery

If branches get messy again:

1. **Identify the "winner" branch** (has the most complete work)
2. **Merge winner into `main`**
3. **Delete all other Claude branches**
4. **Start fresh on `main`**

Refer to `GIT_CONSOLIDATION_TASK.md` for detailed instructions.
