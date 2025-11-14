#!/bin/bash

# Script to delete all obsolete Claude Code branches
# Run this after the consolidation is complete and you've verified main has all the work

echo "=================================================="
echo "Delete Obsolete Claude Code Branches"
echo "=================================================="
echo ""
echo "This script will delete 18 obsolete Claude branches."
echo "WARNING: This action cannot be undone."
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "Deleting remote branches..."
echo ""

# List of branches to delete
branches=(
    "claude/clinical-toolkit-dev-011CV3m6VqHpPLvmJmm38gKX"
    "claude/clinical-toolkit-documentation-complete-011CUzAJL6A1wxNRKAZm9iJ4"
    "claude/clinical-toolkit-fix-011CV4JmZuYjfJic8WnTu76p"
    "claude/clinical-toolkit-medical-wizards-011CUyoi3zVur3r3bsa8h44Y"
    "claude/clinical-toolkit-phase-1-5-complete-011CUyviLcwK6ATakCEoJVJb"
    "claude/clinical-wizard-android-run-011CV5qbqm8NhNyWBk57de1w"
    "claude/clinical-wizard-android-testing-011CV5dQFcrWrS7oazB2vHwU"
    "claude/clinical-wizard-development-011CV5Tefke3VpuihSb5FvsF"
    "claude/clinical-wizard-integration-plan-011CV5rwbtdPvUCiwNCnKUf9"
    "claude/clinical-wizard-shared-removal-011CV5m6GBGSixdwiFEz5L8j"
    "claude/clinical-wizard-work-011CUzg2nm4eefmCbJaxk4Cd"
    "claude/fix-lucide-icon-export-011CV21DBkBDVfNM2WkVCYA5"
    "claude/healthcare-vocabulary-app-011CUxb5UZfzTocYn9ZNvyf1"
    "claude/hello-fri-011CV3updtpZJNx2CvdeoyYb"
    "claude/mobile-dev-setup-011CUz7VfomXtdw2Q8zwmTtK"
    "claude/mobile-toolkit-launch-011CV26LiRArYTrgYWPamsHj"
    "claude/planning-implementation-questions-019F6ak6gbyFrej8hY2qaHpr"
    "claude/fix-failing-tests-019F6ak6gbyFrej8hY2qaHpr"
)

deleted_count=0
failed_count=0

for branch in "${branches[@]}"; do
    echo "Deleting $branch..."
    if git push origin --delete "$branch" 2>/dev/null; then
        echo "  ✓ Deleted $branch"
        ((deleted_count++))
    else
        echo "  ✗ Failed to delete $branch (may not exist or no permission)"
        ((failed_count++))
    fi
done

echo ""
echo "=================================================="
echo "Summary"
echo "=================================================="
echo "Deleted: $deleted_count branches"
echo "Failed: $failed_count branches"
echo ""

# Delete local branches
echo "Cleaning up local branches..."
for branch in "${branches[@]}"; do
    git branch -d "$branch" 2>/dev/null
done

echo ""
echo "Verifying remaining Claude branches..."
remaining=$(git branch -a | grep "claude/" | wc -l)
if [ "$remaining" -eq 0 ]; then
    echo "✓ All Claude branches successfully deleted!"
else
    echo "⚠ $remaining Claude branches remain:"
    git branch -a | grep "claude/"
fi

echo ""
echo "Done!"
