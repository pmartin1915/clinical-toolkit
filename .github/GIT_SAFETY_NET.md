# Git Safety Net System

Automated git workflow system that prevents mistakes and reduces cognitive load for solo developers working across multiple devices.

## Overview

The Git Safety Net provides:
- ✅ Visual git status in terminal prompt
- ✅ Automated pre-work safety checks
- ✅ One-command workflows for starting/finishing work
- ✅ Device switching automation
- ✅ Prevention of common git mistakes

## Installation

### One-Time Setup

```powershell
cd d:\projects\clinical-toolkit
.\scripts\install-safety-net.ps1
```

**What this does:**
1. Configures PowerShell profile with custom prompt
2. Sets up git hooks (pre-commit, pre-push)
3. Creates configuration files
4. Adds command aliases
5. Initializes device tracking

**After installation:**
- Restart PowerShell
- Your prompt will now show git status

## Custom Prompt

After installation, your prompt shows:

```
[clinical-toolkit] (main ✓) d:\projects\clinical-toolkit>
```

**Status indicators:**
- `✓` (Green) = Clean working directory
- `✗` (Yellow) = Uncommitted changes
- `⚠` (Red) = Unpushed commits

## Commands

### work - Start Work Session

```powershell
work
```

**What it does:**
1. Verifies you're on main branch
2. Warns about uncommitted changes
3. Pulls latest from origin/main
4. Shows last commit info
5. Displays device tracking
6. Logs session start

**Example output:**
```
🚀 Starting Work Session
========================

✅ Branch: main
⬇️  Pulling latest changes...
✅ Up to date with origin/main

📊 Last commit:
a1b2c3d - fix: rename android-test.js to .cjs (2 hours ago) <Perry>

📱 Device: PC

✅ Ready to work!
```

### done - Finish Work Session

```powershell
done "Your commit message"
```

**What it does:**
1. Shows changes to be committed
2. Runs test suite (if configured)
3. Stages all changes
4. Commits with your message
5. Pushes to origin/main
6. Logs session end with stats

**Example output:**
```
💾 Finishing Work Session
=========================

📝 Changes to commit:
 M scripts/work.ps1
 M scripts/done.ps1

🧪 Running tests...
✅ Tests passed

📦 Staging changes...
💾 Committing...
✅ Committed

⬆️  Pushing to origin/main...
✅ Pushed successfully

📊 Session Summary:
Files changed: 2
Duration: 1h 23m

✅ Work session complete!
```

**If tests fail:**
```
❌ Tests failed!

Options:
1. Review and fix tests
2. Commit anyway (not recommended)
3. Commit with --no-verify (skip tests)

Choice (1/2/3):
```

### status - Quick Status Check

```powershell
status
```

**What it does:**
1. Shows current branch
2. Lists uncommitted changes
3. Shows last 3 commits
4. Displays device info
5. Checks if pull needed

**Example output:**
```
📊 Git Status
=============

📍 Branch: main
✅ Working directory clean

📜 Recent commits:
a1b2c3d - fix: rename android-test.js to .cjs (2 hours ago) <Perry>
b2c3d4e - docs: add consolidation completion report (3 hours ago) <Perry>
c3d4e5f - Consolidate all work: CI/CD, Android, tests (4 hours ago) <Perry>

📱 Device: PC
Last sync: 2024-11-14T20:30:00Z
```

### sync - Sync Devices

```powershell
sync
```

**What it does:**
1. Checks for uncommitted changes
2. Prompts to commit if changes exist
3. Pushes any unpushed commits
4. Updates device tracking
5. Shows instructions for other device

**Example output:**
```
🔄 Device Sync
==============

Current device: PC

⬆️  Pushing unpushed commits...
✅ Pushed

✅ Sync complete!

📱 On your Laptop, run:
   git pull origin main
```

## Device Switching Workflow

### Leaving Current Device

**On PC:**
```powershell
sync
```

### Arriving at Other Device

**On Laptop:**
```powershell
git pull origin main
work
```

## Configuration

Edit `.git-safety-net/config.json`:

```json
{
  "autoSaveInterval": 1800,
  "testBeforeCommit": true,
  "deviceName": "PC",
  "lastDevice": "PC",
  "lastSync": "2024-11-14T20:30:00Z",
  "notifications": {
    "autoSave": true,
    "testFailures": true,
    "pushSuccess": true
  }
}
```

**Options:**
- `autoSaveInterval`: Seconds between auto-save reminders (1800 = 30 min)
- `testBeforeCommit`: Run tests before committing (true/false)
- `deviceName`: Current device name
- `notifications`: Enable/disable various notifications

## Safety Features

### Pre-Commit Hook
- Warns about TODO/FIXME comments
- Shows files being committed

### Pre-Push Hook
- Confirms push to main branch
- Prevents accidental pushes

### Automatic Checks
- Verifies on main branch before work
- Pulls latest before starting
- Runs tests before committing
- Prevents commits with failing tests

## Troubleshooting

### Profile Not Loading

**Check if profile exists:**
```powershell
Test-Path $PROFILE
```

**Reload profile:**
```powershell
. $PROFILE
```

**View profile location:**
```powershell
$PROFILE
```

### Aliases Not Working

**Check aliases:**
```powershell
Get-Alias work
Get-Alias done
Get-Alias status
Get-Alias sync
```

**Use full paths:**
```powershell
.\scripts\work.ps1
.\scripts\done.ps1
```

### Tests Failing

**Skip tests temporarily:**
```powershell
done "message" --no-verify
```

**Disable test requirement:**
Edit `.git-safety-net/config.json`:
```json
{
  "testBeforeCommit": false
}
```

### Merge Conflicts

**Check status:**
```powershell
git status
```

**Resolve conflicts manually, then:**
```powershell
done "Resolved merge conflicts"
```

## FAQ

**Q: Can I use this on multiple projects?**  
A: Yes! Run `install-safety-net.ps1` in each project.

**Q: What if I forget to run `sync`?**  
A: The system will warn you if the last device was different.

**Q: Can I customize the prompt?**  
A: Yes! Edit the prompt function in your PowerShell profile.

**Q: Does this work on Mac/Linux?**  
A: Currently Windows only (PowerShell). Bash version coming soon.

**Q: What if I need to work on a feature branch?**  
A: The system will warn you but allow it. Just be aware you're not on main.

## Best Practices

1. **Always run `work` when starting**
2. **Always run `done` when finishing**
3. **Use `sync` before switching devices**
4. **Check `status` frequently**
5. **Commit often with clear messages**
6. **Let tests run (don't skip unless necessary)**

## Session Logging

All work sessions are logged in `.git-safety-net/session-log.json`:

```json
{
  "sessions": [
    {
      "device": "PC",
      "start": "2024-11-14T09:00:00Z",
      "end": "2024-11-14T12:30:00Z",
      "duration": "3h 30m",
      "commits": 2,
      "filesChanged": 8
    }
  ]
}
```

Use this to track your productivity and work patterns.

## Credits

Built for Clinical Toolkit project to prevent git mistakes and reduce cognitive load for solo developers working across multiple devices.
