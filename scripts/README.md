# Git Safety Net - Scripts Reference

Quick reference for all Git Safety Net scripts.

## Installation

```powershell
.\scripts\install-safety-net.ps1
```

Restart PowerShell after installation.

## Daily Workflow

### Start Work
```powershell
work
# or
.\scripts\work.ps1
```

**What it does:**
- Checks you're on main branch
- Warns about uncommitted changes
- Pulls latest from origin
- Shows last commit
- Logs session start

### Finish Work
```powershell
done "Your commit message"
# or
.\scripts\done.ps1 "Your commit message"
```

**What it does:**
- Runs tests (if configured)
- Stages all changes
- Commits with your message
- Pushes to origin/main
- Logs session end

### Check Status
```powershell
status
# or
.\scripts\status.ps1
```

**What it does:**
- Shows current branch
- Lists uncommitted changes
- Shows last 3 commits
- Displays device info
- Checks if pull needed

### Sync Devices
```powershell
sync
# or
.\scripts\sync-devices.ps1
```

**What it does:**
- Commits any uncommitted changes
- Pushes unpushed commits
- Updates device tracking
- Shows instructions for other device

## Common Scenarios

### Switching from Laptop to PC

**On Laptop:**
```powershell
sync
```

**On PC:**
```powershell
git pull origin main
work
```

### Quick commit without tests
```powershell
done "Quick fix" --no-verify
```

### Check what changed
```powershell
status
git diff
```

## Configuration

Edit `.git-safety-net/config.json`:

```json
{
  "autoSaveInterval": 1800,
  "testBeforeCommit": true,
  "deviceName": "PC",
  "notifications": {
    "autoSave": true,
    "testFailures": true,
    "pushSuccess": true
  }
}
```

## Troubleshooting

**Profile not loading?**
- Check: `Test-Path $PROFILE`
- Reload: `. $PROFILE`

**Scripts not found?**
- Use full path: `.\scripts\work.ps1`
- Check aliases: `Get-Alias work`

**Tests failing?**
- Fix tests first
- Or use: `done "message" --no-verify`

**Merge conflicts?**
- Run: `git status`
- Resolve conflicts manually
- Then: `done "Resolved conflicts"`
