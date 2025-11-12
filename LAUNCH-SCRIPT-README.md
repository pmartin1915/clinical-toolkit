# 🚀 Clinical Toolkit Development Launcher

## Overview

The `launch.ps1` script is a comprehensive, automated launcher for the Clinical Toolkit development environment. It handles all the complexity of git operations, dependency management, and dev server startup in a single command.

## Features

✅ **Automated Git Management**
- Checks current branch status
- Auto-commits uncommitted changes
- Pulls latest changes from remote
- Automatically resolves common merge conflicts (like package-lock.json)
- Switches to correct branch automatically

✅ **Smart Dependency Management**
- Detects if node_modules needs installation
- Checks for outdated dependencies
- Handles npm installation with proper error reporting
- Option to force clean reinstall

✅ **Dev Server Control**
- Stops any running dev servers automatically
- Starts Vite dev server
- Verifies successful startup
- Provides clear status messages

✅ **AI-Friendly Error Reporting**
- Captures all errors with context
- Formats errors for easy copy-paste to AI
- Saves error reports to timestamped files
- Includes system information for debugging

✅ **User Experience**
- Color-coded console output
- Progress indicators for each step
- Detailed logging to file
- Clear success/failure messages

## Quick Start

### Basic Usage

Simply run the script from your project directory:

```powershell
.\launch.ps1
```

That's it! The script will:
1. Check git status and commit any changes
2. Pull latest updates
3. Install/update dependencies if needed
4. Start the dev server

### Advanced Usage

**Skip git operations:**
```powershell
.\launch.ps1 -SkipGitOperations
```

**Force reinstall dependencies:**
```powershell
.\launch.ps1 -ForceReinstall
```

**Specify a branch:**
```powershell
.\launch.ps1 -BranchName "claude/mobile-toolkit-launch-011CV26LiRArYTrgYWPamsHj"
```

**Specify a port:**
```powershell
.\launch.ps1 -Port 3000
```

**Combine options:**
```powershell
.\launch.ps1 -ForceReinstall -Port 8080 -Verbose
```

## Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `-SkipGitOperations` | Switch | Skip all git operations (commit, pull, etc.) | False |
| `-ForceReinstall` | Switch | Delete node_modules and reinstall all dependencies | False |
| `-BranchName` | String | Specify which branch to use | Auto-detect |
| `-Port` | Integer | Specify port for dev server | Auto (Vite default) |
| `-Verbose` | Switch | Show detailed progress information | False |

## Error Handling

When errors occur, the script generates a comprehensive error report:

```
================================================================================
ERROR REPORT - 2025-11-12 14:30:45
================================================================================

ERROR #1
-------------------
Type:     Git Pull
Location: D:\projects\clinical-toolkit
Message:  Merge conflict in package-lock.json
Fix:      Run: git merge --abort, then try again
Time:     2025-11-12 14:30:45

================================================================================
Project: Clinical Toolkit
Path:    D:\projects\clinical-toolkit
Branch:  claude/mobile-toolkit-launch-011CV26LiRArYTrgYWPamsHj
Node:    v22.18.0
NPM:     10.9.3
================================================================================
```

**This error report is:**
- ✅ Saved to a timestamped file (e.g., `error-report-2025-11-12-143045.txt`)
- ✅ Formatted for easy copy-paste to AI assistants
- ✅ Includes all necessary context for debugging
- ✅ Provides suggested fixes for common issues

## Workflow Steps

The script executes the following workflow:

```
1. Prerequisites Check
   ├─ Verify git is installed
   ├─ Verify Node.js is installed
   └─ Verify npm is installed

2. Git Operations (unless -SkipGitOperations)
   ├─ Check current branch
   ├─ Auto-commit uncommitted changes
   ├─ Switch to target branch if needed
   ├─ Fetch latest from remote
   ├─ Pull and merge changes
   └─ Auto-resolve common conflicts

3. Dependency Management
   ├─ Check if node_modules exists
   ├─ Check if package-lock.json changed
   ├─ Clean install if -ForceReinstall
   └─ Install/update dependencies

4. Dev Server
   ├─ Stop any running dev servers
   ├─ Start Vite dev server
   └─ Verify successful startup
```

## Common Scenarios

### Scenario 1: First Time Setup

You've just cloned the repository:

```powershell
cd D:\projects\clinical-toolkit
.\launch.ps1
```

The script will:
- Detect missing node_modules
- Install all dependencies
- Start the dev server

### Scenario 2: Pulling Updates

Someone pushed new changes to the remote:

```powershell
.\launch.ps1
```

The script will:
- Detect you're behind remote
- Pull and merge changes
- Update dependencies if package.json changed
- Start the dev server

### Scenario 3: Merge Conflicts

You have local changes and remote has updates:

```powershell
.\launch.ps1
```

The script will:
- Auto-commit your local changes
- Pull remote changes
- Auto-resolve package-lock.json conflicts
- Notify you of any unresolvable conflicts

### Scenario 4: Clean Start

Something's not working and you want a fresh install:

```powershell
.\launch.ps1 -ForceReinstall
```

The script will:
- Delete node_modules
- Clear npm cache
- Reinstall all dependencies from scratch
- Start the dev server

### Scenario 5: Quick Launch (Skip Git)

You know everything is up to date:

```powershell
.\launch.ps1 -SkipGitOperations
```

The script will:
- Skip all git operations
- Check dependencies
- Start the dev server immediately

## Troubleshooting

### Script Execution Policy Error

If you get an error like "cannot be loaded because running scripts is disabled":

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Git Authentication Issues

If git pull fails due to authentication:
1. Check your SSH keys or credentials
2. Run the script with `-SkipGitOperations`
3. Manually pull: `git pull origin <branch>`
4. Then run: `.\launch.ps1 -SkipGitOperations`

### Port Already in Use

If the dev server port is already taken:
```powershell
.\launch.ps1 -Port 8080
```

### Dependencies Won't Install

If npm install keeps failing:
```powershell
.\launch.ps1 -ForceReinstall
```

## Log Files

The script creates two types of log files:

1. **Launch Logs** (every run)
   - Format: `launch-log-YYYY-MM-DD-HHmmss.txt`
   - Contains: All output from the script execution

2. **Error Reports** (only on errors)
   - Format: `error-report-YYYY-MM-DD-HHmmss.txt`
   - Contains: AI-friendly error report with context

## AI Integration

When you encounter errors, the script generates a formatted error report designed for AI assistants:

1. Copy the error report from the console OR open the generated error report file
2. Paste it directly to your AI assistant with this prompt:

```
I encountered errors while launching my clinical toolkit. Here's the error report:

[PASTE ERROR REPORT HERE]

Please help me resolve these issues.
```

The AI will have all the context needed to help you resolve the issue quickly.

## Best Practices

✅ **Run the script from the project root directory**
```powershell
cd D:\projects\clinical-toolkit
.\launch.ps1
```

✅ **Let the script handle git operations automatically**
- The script is designed to handle most common scenarios
- Only use `-SkipGitOperations` if you know what you're doing

✅ **Use `-ForceReinstall` when in doubt**
- If you're experiencing weird dependency issues
- After pulling major updates
- When switching between branches with different dependencies

✅ **Check the log files when troubleshooting**
- Launch logs contain detailed execution information
- Error reports provide AI-friendly error context

❌ **Don't manually stop the script during git operations**
- Let it complete or you may leave git in an inconsistent state
- Use `git status` to check if recovery is needed

## System Requirements

- **PowerShell**: 5.1 or higher
- **Git**: Any recent version
- **Node.js**: v18 or higher
- **NPM**: v9 or higher
- **Operating System**: Windows 10/11

## Version History

### Version 1.0.0 (2025-11-12)
- Initial release
- Automated git operations
- Smart dependency management
- AI-friendly error reporting
- Color-coded console output
- Comprehensive logging

## Support

If you encounter issues:

1. **Check the error report** - It contains helpful fix suggestions
2. **Review the log file** - Look for detailed error messages
3. **Copy error report to AI** - Paste the formatted report to get help
4. **Check git status** - Run `git status` to see current state
5. **Try clean install** - Run `.\launch.ps1 -ForceReinstall`

## License

Part of the Clinical Toolkit project.
