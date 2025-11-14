# 🚨 START HERE - NEXT CLAUDE CODE SESSION

**READ THIS FIRST BEFORE DOING ANYTHING**

---

## Your First Task: Git Branch Consolidation

This repository has **18 orphaned Claude Code branches** causing confusion and wasted credits.

**Your mission**: Consolidate all branches into `main` and delete the obsolete ones.

---

## 📖 READ THIS FILE:

**`GIT_CONSOLIDATION_TASK.md`** - Complete step-by-step instructions

---

## ⚠️ CRITICAL WARNING:

**DO NOT CREATE A NEW BRANCH**

The problem is too many branches. Don't make it worse by creating branch #19.

Work on `main` directly (it's protected by CI, so you can't break it).

---

## Quick Start (if you must skip the full doc):

```bash
# 1. Fetch everything
git fetch --all

# 2. Switch to main (DO NOT create new branch)
git checkout main
git pull origin main

# 3. Merge the integration-plan branch (has all the good work)
git merge --no-ff origin/claude/clinical-wizard-integration-plan-011CV5rwbtdPvUCiwNCnKUf9

# 4. Cherry-pick test fixes
git cherry-pick 930f021

# 5. Push consolidated main
git push origin main

# 6. Delete all 18 Claude branches (see full doc for commands)

# 7. Create workflow documentation
```

But seriously, **read `GIT_CONSOLIDATION_TASK.md`** - it explains everything clearly.

---

## After Consolidation:

Once you've consolidated everything:
1. Read `.github/CLAUDE_CODE_WORKFLOW.md` for future workflow
2. Work on the 16 remaining UI test failures (optional)
3. Or move on to other features

---

**Estimated Time**: 30-45 minutes
**Priority**: URGENT - Do this before any other work
**Credit Cost**: $8-12

**Then you can do real feature work without branch confusion!**
