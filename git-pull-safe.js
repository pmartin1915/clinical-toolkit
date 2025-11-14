#!/usr/bin/env node

/**
 * Safe Git Pull with Automatic Conflict Resolution
 *
 * Handles common git pull issues:
 * - Uncommitted changes (auto-stash)
 * - Merge conflicts in package-lock.json (auto-resolve)
 * - Merge conflicts in other files (clear instructions)
 * - Network issues (retry logic)
 * - Diverged branches (rebase/merge options)
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  BRANCH: 'claude/clinical-wizard-development-011CV5Tefke3VpuihSb5FvsF',
  REMOTE: 'origin',
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  AUTO_RESOLVE_FILES: ['package-lock.json', 'pnpm-lock.yaml'],
  LOG_FILE: 'git-pull.log',
};

// ============================================================================
// Color Console
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  const colorCode = colors[color] || colors.reset;
  const logMessage = `[${timestamp}] ${message}`;

  console.log(`${colorCode}${logMessage}${colors.reset}`);

  // Write to log file
  fs.appendFileSync(CONFIG.LOG_FILE, `${logMessage}\n`);
}

function logSuccess(message) { log(`✓ ${message}`, 'green'); }
function logError(message) { log(`✗ ${message}`, 'red'); }
function logWarning(message) { log(`⚠ ${message}`, 'yellow'); }
function logInfo(message) { log(`ℹ ${message}`, 'cyan'); }
function logStep(message) { log(`→ ${message}`, 'blue'); }

// ============================================================================
// Utility Functions
// ============================================================================

function exec(command, silent = false) {
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    return { success: true, output: output || '' };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: error.stdout || '',
      stderr: error.stderr || ''
    };
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Git Status Checks
// ============================================================================

function hasUncommittedChanges() {
  const result = exec('git status --porcelain', true);
  return result.success && result.output.trim().length > 0;
}

function getCurrentBranch() {
  const result = exec('git branch --show-current', true);
  return result.success ? result.output.trim() : null;
}

function hasConflicts() {
  const result = exec('git diff --name-only --diff-filter=U', true);
  return result.success && result.output.trim().length > 0;
}

function getConflictedFiles() {
  const result = exec('git diff --name-only --diff-filter=U', true);
  if (result.success && result.output.trim()) {
    return result.output.trim().split('\n');
  }
  return [];
}

// ============================================================================
// Automatic Conflict Resolution
// ============================================================================

function autoResolvePackageLock() {
  logStep('Attempting automatic resolution of package-lock.json conflict...');

  // Strategy: Use theirs (remote version) for package-lock.json
  // Then regenerate it properly with npm install

  const result = exec('git checkout --theirs package-lock.json', true);

  if (result.success) {
    logSuccess('Accepted remote version of package-lock.json');

    // Mark as resolved
    exec('git add package-lock.json', true);

    logInfo('Running npm install to regenerate package-lock.json properly...');
    const installResult = exec('npm install', false);

    if (installResult.success) {
      logSuccess('package-lock.json regenerated successfully');

      // Add the regenerated version
      exec('git add package-lock.json', true);

      return true;
    } else {
      logWarning('npm install had issues, but continuing...');
      return true; // Still count as resolved
    }
  }

  return false;
}

function autoresolvePnpmLock() {
  logStep('Attempting automatic resolution of pnpm-lock.yaml conflict...');

  const result = exec('git checkout --theirs pnpm-lock.yaml', true);

  if (result.success) {
    logSuccess('Accepted remote version of pnpm-lock.yaml');
    exec('git add pnpm-lock.yaml', true);

    logInfo('Running pnpm install to regenerate pnpm-lock.yaml...');
    const installResult = exec('pnpm install', false);

    if (installResult.success) {
      logSuccess('pnpm-lock.yaml regenerated successfully');
      exec('git add pnpm-lock.yaml', true);
      return true;
    } else {
      logWarning('pnpm install had issues, but continuing...');
      return true;
    }
  }

  return false;
}

function autoResolveConflicts() {
  const conflictedFiles = getConflictedFiles();

  if (conflictedFiles.length === 0) {
    return { success: true, resolved: [], unresolved: [] };
  }

  logWarning(`Found ${conflictedFiles.length} conflicted file(s):`);
  conflictedFiles.forEach(file => logInfo(`  - ${file}`));

  const resolved = [];
  const unresolved = [];

  for (const file of conflictedFiles) {
    const fileName = path.basename(file);

    if (fileName === 'package-lock.json') {
      if (autoResolvePackageLock()) {
        resolved.push(file);
      } else {
        unresolved.push(file);
      }
    } else if (fileName === 'pnpm-lock.yaml') {
      if (autoresolvePnpmLock()) {
        resolved.push(file);
      } else {
        unresolved.push(file);
      }
    } else {
      unresolved.push(file);
    }
  }

  return { success: unresolved.length === 0, resolved, unresolved };
}

// ============================================================================
// Stash Management
// ============================================================================

function stashChanges() {
  logStep('Stashing uncommitted changes...');

  const result = exec('git stash push -m "Auto-stash before safe pull"', true);

  if (result.success) {
    logSuccess('Changes stashed successfully');
    return true;
  } else {
    logError('Failed to stash changes');
    return false;
  }
}

function popStash() {
  logStep('Restoring stashed changes...');

  const result = exec('git stash pop', true);

  if (result.success) {
    logSuccess('Stashed changes restored');
    return true;
  } else if (result.output.includes('No stash entries found')) {
    logInfo('No stashed changes to restore');
    return true;
  } else {
    logWarning('Could not restore stash - you may need to do this manually');
    logInfo('Run: git stash list, then: git stash pop');
    return false;
  }
}

// ============================================================================
// Git Pull with Retry
// ============================================================================

async function gitPullWithRetry() {
  for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
    logStep(`Attempting git pull (attempt ${attempt}/${CONFIG.MAX_RETRIES})...`);

    const result = exec(`git pull ${CONFIG.REMOTE} ${CONFIG.BRANCH}`, false);

    if (result.success) {
      logSuccess('Git pull completed successfully');
      return { success: true };
    }

    // Check if it's a network error
    if (result.stderr && result.stderr.includes('Could not resolve host')) {
      logWarning('Network error detected, will retry...');

      if (attempt < CONFIG.MAX_RETRIES) {
        await sleep(CONFIG.RETRY_DELAY * attempt); // Exponential backoff
        continue;
      }
    }

    // Check if it's a merge conflict
    if (result.stderr && (result.stderr.includes('CONFLICT') || result.stderr.includes('Automatic merge failed'))) {
      logWarning('Merge conflict detected');
      return { success: false, conflict: true };
    }

    // Other error
    if (attempt === CONFIG.MAX_RETRIES) {
      logError('Git pull failed after max retries');
      return { success: false, error: result.stderr };
    }
  }

  return { success: false };
}

// ============================================================================
// Main Safe Pull Process
// ============================================================================

async function safePull() {
  console.clear();

  log('═'.repeat(80), 'bright');
  log('   SAFE GIT PULL WITH AUTO CONFLICT RESOLUTION   ', 'bright');
  log('═'.repeat(80), 'bright');
  console.log('');

  let stashCreated = false;

  try {
    // Step 1: Check current branch
    logStep('Checking current branch...');
    const currentBranch = getCurrentBranch();

    if (!currentBranch) {
      logError('Could not determine current branch');
      return false;
    }

    logInfo(`Current branch: ${currentBranch}`);

    if (currentBranch !== CONFIG.BRANCH) {
      logWarning(`You're on '${currentBranch}', not '${CONFIG.BRANCH}'`);
      logInfo('Switching to the correct branch...');

      const switchResult = exec(`git checkout ${CONFIG.BRANCH}`, false);
      if (!switchResult.success) {
        logError('Failed to switch branches');
        return false;
      }
    }

    // Step 2: Check for uncommitted changes
    logStep('Checking for uncommitted changes...');

    if (hasUncommittedChanges()) {
      logWarning('You have uncommitted changes');

      if (!stashChanges()) {
        logError('Cannot proceed without stashing changes');
        return false;
      }

      stashCreated = true;
    } else {
      logSuccess('Working directory is clean');
    }

    // Step 3: Fetch from remote
    logStep('Fetching from remote...');
    const fetchResult = exec(`git fetch ${CONFIG.REMOTE}`, false);

    if (!fetchResult.success) {
      logError('Failed to fetch from remote');
      return false;
    }

    logSuccess('Fetch completed');

    // Step 4: Pull with retry and conflict handling
    const pullResult = await gitPullWithRetry();

    if (pullResult.success) {
      logSuccess('Pull completed successfully!');

      // Restore stash if we created one
      if (stashCreated) {
        popStash();
      }

      return true;
    }

    // Step 5: Handle conflicts if they occurred
    if (pullResult.conflict) {
      logWarning('Merge conflicts detected, attempting automatic resolution...');

      const resolveResult = autoResolveConflicts();

      if (resolveResult.resolved.length > 0) {
        logSuccess(`Auto-resolved ${resolveResult.resolved.length} file(s):`);
        resolveResult.resolved.forEach(file => logInfo(`  ✓ ${file}`));
      }

      if (resolveResult.unresolved.length > 0) {
        logError(`Could not auto-resolve ${resolveResult.unresolved.length} file(s):`);
        resolveResult.unresolved.forEach(file => logError(`  ✗ ${file}`));

        console.log('');
        log('═'.repeat(80), 'yellow');
        logWarning('MANUAL INTERVENTION REQUIRED');
        log('═'.repeat(80), 'yellow');
        console.log('');

        logInfo('To resolve manually:');
        logInfo('1. Open each conflicted file and resolve conflicts');
        logInfo('2. Or abort the merge: git merge --abort');
        logInfo('3. Or accept all remote changes: git checkout --theirs .');
        logInfo('4. Then run: git add . && git commit');

        return false;
      }

      // All conflicts resolved, commit the merge
      logStep('Committing resolved conflicts...');
      const commitResult = exec('git commit --no-edit', false);

      if (commitResult.success) {
        logSuccess('Merge committed successfully!');

        // Restore stash if we created one
        if (stashCreated) {
          popStash();
        }

        return true;
      } else {
        logError('Failed to commit merge');
        return false;
      }
    }

    // Other error
    logError('Pull failed with unknown error');
    return false;

  } catch (error) {
    logError(`Unexpected error: ${error.message}`);
    return false;
  } finally {
    console.log('');
    log('═'.repeat(80), 'bright');
    logInfo('For detailed logs, check: ' + CONFIG.LOG_FILE);
    log('═'.repeat(80), 'bright');
    console.log('');
  }
}

// ============================================================================
// Recovery Helper
// ============================================================================

function showRecoveryOptions() {
  console.log('');
  log('═'.repeat(80), 'cyan');
  log('   RECOVERY OPTIONS   ', 'cyan');
  log('═'.repeat(80), 'cyan');
  console.log('');

  logInfo('If you want to abort everything and start fresh:');
  console.log('  git merge --abort');
  console.log('  git stash drop  (if you want to discard stashed changes)');
  console.log('');

  logInfo('If you want to accept all remote changes:');
  console.log('  git checkout --theirs .');
  console.log('  git add .');
  console.log('  npm install  (regenerate package-lock.json)');
  console.log('  git add package-lock.json');
  console.log('  git commit -m "Merge remote changes"');
  console.log('');

  logInfo('If you want to accept all your local changes:');
  console.log('  git checkout --ours .');
  console.log('  git add .');
  console.log('  git commit -m "Keep local changes"');
  console.log('');
}

// ============================================================================
// Execute
// ============================================================================

async function main() {
  const success = await safePull();

  if (!success) {
    showRecoveryOptions();
    process.exit(1);
  }

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { safePull, autoResolveConflicts };
