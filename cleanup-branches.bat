@echo off
echo ========================================
echo Deleting Obsolete Claude Branches
echo ========================================
echo.

echo Deleting remote branches...
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
git push origin --delete claude/clinical-toolkit-work-017Gw5bY5STZWZAREUSuXT3C

echo.
echo Deleting local branches...
git branch -D claude/clinical-toolkit-dev-011CV3m6VqHpPLvmJmm38gKX 2>nul
git branch -D claude/clinical-toolkit-fix-011CV4JmZuYjfJic8WnTu76p 2>nul
git branch -D claude/clinical-wizard-android-testing-011CV5dQFcrWrS7oazB2vHwU 2>nul
git branch -D claude/clinical-wizard-integration-plan-011CV5rwbtdPvUCiwNCnKUf9 2>nul
git branch -D claude/clinical-wizard-shared-removal-011CV5m6GBGSixdwiFEz5L8j 2>nul
git branch -D claude/hello-fri-011CV3updtpZJNx2CvdeoyYb 2>nul
git branch -D claude/mobile-toolkit-launch-011CV26LiRArYTrgYWPamsHj 2>nul
git branch -D claude/setup-clinical-toolkit-011CUxgrzGwcqfyW6dy1hXNX 2>nul
git branch -D claude/clinical-toolkit-work-017Gw5bY5STZWZAREUSuXT3C 2>nul

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Remaining branches:
git branch -a | findstr claude
echo.
echo If no branches listed above, cleanup was successful!
pause
