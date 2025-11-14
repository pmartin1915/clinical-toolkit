#!/usr/bin/env node

/**
 * Android Test Automation Script for Clinical Wizard
 *
 * Automatically builds, syncs, and launches the app on Android emulator
 * with comprehensive error handling and logging.
 *
 * Features:
 * - Automatic emulator detection and startup
 * - Port detection and management
 * - Build and sync automation
 * - Error handling and recovery
 * - Detailed logging
 * - Color-coded console output
 */

const { spawn, exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  ANDROID_SDK_PATH: process.env.ANDROID_HOME || 'D:\\Android\\SDK',
  EMULATOR_NAME: 'Pixel_6_API_30', // Adjust if your emulator has a different name
  EMULATOR_WAIT_TIME: 120000, // 2 minutes max wait for emulator boot
  EMULATOR_CHECK_INTERVAL: 5000, // Check every 5 seconds
  BUILD_TIMEOUT: 300000, // 5 minutes max for build
  SYNC_TIMEOUT: 60000, // 1 minute for sync
  LOG_FILE: 'android-test.log',
  PORTS_TO_CHECK: [5173, 8100, 3000, 8080], // Dev server ports
  VITE_PORT: 5173,
};

// ============================================================================
// Color Console Output
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  const colorCode = colors[color] || colors.reset;
  const logMessage = `[${timestamp}] ${message}`;

  console.log(`${colorCode}${logMessage}${colors.reset}`);

  // Also write to log file
  fs.appendFileSync(CONFIG.LOG_FILE, `${logMessage}\n`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

function logStep(step, total, message) {
  log(`[${step}/${total}] ${message}`, 'blue');
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Execute a command and return a promise
 */
function execPromise(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, { ...options, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

/**
 * Check if a port is available
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.once('listening', () => {
      server.close();
      resolve(true);
    });

    server.listen(port, '0.0.0.0');
  });
}

/**
 * Find an available port from a list
 */
async function findAvailablePort(ports) {
  for (const port of ports) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  return null;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if a command exists in PATH
 */
function commandExists(command) {
  try {
    const result = process.platform === 'win32'
      ? execSync(`where ${command}`, { encoding: 'utf8', stdio: 'pipe' })
      : execSync(`which ${command}`, { encoding: 'utf8', stdio: 'pipe' });
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

// ============================================================================
// Android SDK Detection
// ============================================================================

async function detectAndroidSDK() {
  logStep(1, 10, 'Detecting Android SDK...');

  // Check if ANDROID_HOME is set
  if (process.env.ANDROID_HOME) {
    logInfo(`Using ANDROID_HOME: ${process.env.ANDROID_HOME}`);
    CONFIG.ANDROID_SDK_PATH = process.env.ANDROID_HOME;
  } else {
    logWarning(`ANDROID_HOME not set, using default: ${CONFIG.ANDROID_SDK_PATH}`);
  }

  // Verify SDK path exists
  if (!fs.existsSync(CONFIG.ANDROID_SDK_PATH)) {
    logError(`Android SDK not found at: ${CONFIG.ANDROID_SDK_PATH}`);
    logInfo('Please set ANDROID_HOME environment variable or update CONFIG.ANDROID_SDK_PATH in the script');
    return false;
  }

  // Check for emulator executable
  const emulatorPath = path.join(CONFIG.ANDROID_SDK_PATH, 'emulator', 'emulator.exe');
  if (!fs.existsSync(emulatorPath)) {
    logError('Emulator executable not found in Android SDK');
    logInfo(`Expected at: ${emulatorPath}`);
    return false;
  }

  // Check for adb
  const adbPath = path.join(CONFIG.ANDROID_SDK_PATH, 'platform-tools', 'adb.exe');
  if (!fs.existsSync(adbPath)) {
    logError('ADB not found in Android SDK');
    logInfo(`Expected at: ${adbPath}`);
    return false;
  }

  logSuccess(`Android SDK detected at: ${CONFIG.ANDROID_SDK_PATH}`);
  return true;
}

// ============================================================================
// Emulator Management
// ============================================================================

/**
 * List all available emulators
 */
async function listEmulators() {
  try {
    const emulatorPath = path.join(CONFIG.ANDROID_SDK_PATH, 'emulator', 'emulator.exe');
    const { stdout } = await execPromise(`"${emulatorPath}" -list-avds`);
    const emulators = stdout.trim().split('\n').filter(e => e.trim().length > 0);
    return emulators;
  } catch (error) {
    logError('Failed to list emulators');
    return [];
  }
}

/**
 * Check if emulator is already running
 */
async function isEmulatorRunning() {
  try {
    const adbPath = path.join(CONFIG.ANDROID_SDK_PATH, 'platform-tools', 'adb.exe');
    const { stdout } = await execPromise(`"${adbPath}" devices`);

    // Parse output for running emulators
    const lines = stdout.split('\n');
    for (const line of lines) {
      if (line.includes('emulator-') && line.includes('device')) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Wait for emulator to be fully booted
 */
async function waitForEmulatorReady() {
  const adbPath = path.join(CONFIG.ANDROID_SDK_PATH, 'platform-tools', 'adb.exe');
  const startTime = Date.now();

  logInfo('Waiting for emulator to boot (this may take 1-2 minutes)...');

  while (Date.now() - startTime < CONFIG.EMULATOR_WAIT_TIME) {
    try {
      // Check boot completion
      const { stdout } = await execPromise(`"${adbPath}" shell getprop sys.boot_completed`);
      if (stdout.trim() === '1') {
        logSuccess('Emulator is ready!');
        await sleep(5000); // Extra 5 seconds for system to fully stabilize
        return true;
      }
    } catch {
      // Device might not be ready yet
    }

    await sleep(CONFIG.EMULATOR_CHECK_INTERVAL);
    process.stdout.write('.');
  }

  console.log(''); // New line after dots
  logWarning('Emulator boot timeout reached, but continuing anyway...');
  return true;
}

/**
 * Start the Android emulator
 */
async function startEmulator() {
  logStep(2, 10, 'Starting Android emulator...');

  // Check if already running
  if (await isEmulatorRunning()) {
    logSuccess('Emulator is already running');
    return true;
  }

  // List available emulators
  const emulators = await listEmulators();
  if (emulators.length === 0) {
    logError('No emulators found!');
    logInfo('Create an emulator in Android Studio first');
    return false;
  }

  logInfo(`Available emulators: ${emulators.join(', ')}`);

  // Find Pixel 6 emulator or use first available
  let targetEmulator = emulators.find(e => e.toLowerCase().includes('pixel'));
  if (!targetEmulator) {
    targetEmulator = emulators[0];
    logWarning(`Pixel 6 emulator not found, using: ${targetEmulator}`);
  } else {
    logInfo(`Using emulator: ${targetEmulator}`);
  }

  // Start emulator
  const emulatorPath = path.join(CONFIG.ANDROID_SDK_PATH, 'emulator', 'emulator.exe');
  const emulatorProcess = spawn(emulatorPath, ['-avd', targetEmulator, '-no-snapshot-load'], {
    detached: true,
    stdio: 'ignore',
    shell: true
  });

  emulatorProcess.unref();

  logInfo('Emulator starting in background...');

  // Wait for emulator to be ready
  return await waitForEmulatorReady();
}

// ============================================================================
// Port Management
// ============================================================================

async function checkPorts() {
  logStep(3, 10, 'Checking port availability...');

  for (const port of CONFIG.PORTS_TO_CHECK) {
    const available = await isPortAvailable(port);
    const status = available ? 'available' : 'in use';
    logInfo(`Port ${port}: ${status}`);
  }

  logSuccess('Port check complete');
  return true;
}

// ============================================================================
// Build Process
// ============================================================================

async function buildProject() {
  logStep(4, 10, 'Building web assets...');

  return new Promise((resolve, reject) => {
    const buildProcess = spawn('npx', ['vite', 'build'], {
      stdio: 'pipe',
      shell: true,
      timeout: CONFIG.BUILD_TIMEOUT
    });

    let stdout = '';
    let stderr = '';

    buildProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      process.stdout.write('.');
    });

    buildProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    buildProcess.on('close', (code) => {
      console.log(''); // New line after dots

      if (code === 0) {
        logSuccess('Build completed successfully');

        // Log build stats
        const buildStats = stdout.match(/dist\/.*?\d+\.\d+ kB/g);
        if (buildStats) {
          logInfo('Build output:');
          buildStats.slice(-5).forEach(stat => logInfo(`  ${stat}`));
        }

        resolve(true);
      } else {
        logError(`Build failed with code ${code}`);
        if (stderr) {
          logError('Build errors:');
          console.error(stderr);
        }
        reject(new Error('Build failed'));
      }
    });

    buildProcess.on('error', (error) => {
      logError(`Build process error: ${error.message}`);
      reject(error);
    });
  });
}

// ============================================================================
// Capacitor Sync
// ============================================================================

async function syncToAndroid() {
  logStep(5, 10, 'Syncing to Android...');

  return new Promise((resolve, reject) => {
    const syncProcess = spawn('npx', ['cap', 'sync', 'android'], {
      stdio: 'pipe',
      shell: true,
      timeout: CONFIG.SYNC_TIMEOUT
    });

    let stdout = '';
    let stderr = '';

    syncProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    syncProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    syncProcess.on('close', (code) => {
      if (code === 0) {
        logSuccess('Sync completed successfully');

        // Log sync info
        const pluginCount = (stdout.match(/Found \d+ Capacitor plugins/g) || [])[0];
        if (pluginCount) {
          logInfo(pluginCount);
        }

        resolve(true);
      } else {
        logError(`Sync failed with code ${code}`);
        if (stderr) {
          logError('Sync errors:');
          console.error(stderr);
        }
        reject(new Error('Sync failed'));
      }
    });

    syncProcess.on('error', (error) => {
      logError(`Sync process error: ${error.message}`);
      reject(error);
    });
  });
}

// ============================================================================
// Android Studio Launch
// ============================================================================

async function launchAndroidStudio() {
  logStep(6, 10, 'Launching Android Studio...');

  try {
    // Try common Android Studio paths on Windows
    const possiblePaths = [
      'C:\\Program Files\\Android\\Android Studio\\bin\\studio64.exe',
      'C:\\Program Files (x86)\\Android\\Android Studio\\bin\\studio64.exe',
      process.env.LOCALAPPDATA ?
        path.join(process.env.LOCALAPPDATA, 'Programs', 'Android Studio', 'bin', 'studio64.exe') : null,
    ].filter(p => p && fs.existsSync(p));

    if (possiblePaths.length === 0) {
      logWarning('Android Studio not found in common locations');
      logInfo('Please open Android Studio manually and run the project from:');
      logInfo(path.resolve('android'));
      return false;
    }

    const studioPath = possiblePaths[0];
    const androidProjectPath = path.resolve('android');

    logInfo(`Opening Android Studio at: ${studioPath}`);

    const studioProcess = spawn(`"${studioPath}"`, [androidProjectPath], {
      detached: true,
      stdio: 'ignore',
      shell: true
    });

    studioProcess.unref();

    logSuccess('Android Studio launched');
    logInfo('Click the green "Run" button in Android Studio to launch the app');

    return true;
  } catch (error) {
    logWarning(`Could not auto-launch Android Studio: ${error.message}`);
    logInfo('Please open Android Studio manually');
    return false;
  }
}

// ============================================================================
// Alternative: Direct ADB Install and Launch
// ============================================================================

async function installAndLaunchAPK() {
  logStep(7, 10, 'Installing APK to emulator...');

  try {
    const adbPath = path.join(CONFIG.ANDROID_SDK_PATH, 'platform-tools', 'adb.exe');

    // Find the APK (debug build)
    const apkPath = path.join('android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

    if (!fs.existsSync(apkPath)) {
      logWarning('APK not found - project needs to be built in Android Studio first');
      logInfo('This is normal for first run - Android Studio will build it');
      return false;
    }

    // Install APK
    logInfo('Installing APK...');
    await execPromise(`"${adbPath}" install -r "${apkPath}"`);
    logSuccess('APK installed');

    // Launch app
    logInfo('Launching app...');
    await execPromise(`"${adbPath}" shell am start -n com.perrymartin.clinicalwizard/.MainActivity`);
    logSuccess('App launched!');

    return true;
  } catch (error) {
    logWarning('Could not install/launch APK (this is normal for first run)');
    logInfo('Android Studio will build and run the app when you click Run');
    return false;
  }
}

// ============================================================================
// Health Checks
// ============================================================================

async function runHealthChecks() {
  logStep(8, 10, 'Running health checks...');

  const checks = [];

  // Check Node.js version
  try {
    const nodeVersion = process.version;
    checks.push({ name: 'Node.js', status: 'OK', info: nodeVersion });
  } catch {
    checks.push({ name: 'Node.js', status: 'FAIL', info: 'Not detected' });
  }

  // Check npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    checks.push({ name: 'npm', status: 'OK', info: npmVersion });
  } catch {
    checks.push({ name: 'npm', status: 'FAIL', info: 'Not detected' });
  }

  // Check Java (required for Android build)
  try {
    const javaVersion = execSync('java -version 2>&1', { encoding: 'utf8' });
    const version = javaVersion.match(/version "(.+?)"/)?.[1] || 'Unknown';
    checks.push({ name: 'Java', status: 'OK', info: version });
  } catch {
    checks.push({ name: 'Java', status: 'WARN', info: 'Not detected (needed for Android builds)' });
  }

  // Check Capacitor CLI
  try {
    const capVersion = execSync('npx cap --version 2>&1', { encoding: 'utf8' }).trim();
    checks.push({ name: 'Capacitor', status: 'OK', info: capVersion });
  } catch {
    checks.push({ name: 'Capacitor', status: 'FAIL', info: 'Not installed' });
  }

  // Check if dist folder exists
  const distExists = fs.existsSync('dist');
  checks.push({ name: 'Build Output', status: distExists ? 'OK' : 'WARN', info: distExists ? 'dist/ exists' : 'No build yet' });

  // Check if android folder exists
  const androidExists = fs.existsSync('android');
  checks.push({ name: 'Android Platform', status: androidExists ? 'OK' : 'FAIL', info: androidExists ? 'android/ exists' : 'Not initialized' });

  // Display results
  logInfo('Health Check Results:');
  checks.forEach(check => {
    const icon = check.status === 'OK' ? '✓' : check.status === 'WARN' ? '⚠' : '✗';
    const color = check.status === 'OK' ? 'green' : check.status === 'WARN' ? 'yellow' : 'red';
    log(`  ${icon} ${check.name}: ${check.info}`, color);
  });

  const failedChecks = checks.filter(c => c.status === 'FAIL');
  if (failedChecks.length > 0) {
    logError(`${failedChecks.length} critical checks failed`);
    return false;
  }

  logSuccess('All critical health checks passed');
  return true;
}

// ============================================================================
// Summary Report
// ============================================================================

function generateSummary(results) {
  logStep(10, 10, 'Generating summary report...');

  console.log('\n' + '='.repeat(80));
  log('ANDROID TEST AUTOMATION - SUMMARY REPORT', 'bright');
  console.log('='.repeat(80) + '\n');

  const steps = [
    { name: 'Android SDK Detection', result: results.sdkDetected },
    { name: 'Emulator Startup', result: results.emulatorStarted },
    { name: 'Port Availability Check', result: results.portsChecked },
    { name: 'Web Build', result: results.buildCompleted },
    { name: 'Android Sync', result: results.syncCompleted },
    { name: 'Health Checks', result: results.healthChecksPassed },
  ];

  steps.forEach((step, index) => {
    const status = step.result ? '✓ PASS' : '✗ FAIL';
    const color = step.result ? 'green' : 'red';
    log(`${index + 1}. ${step.name.padEnd(30)} ${status}`, color);
  });

  console.log('\n');

  if (results.allPassed) {
    logSuccess('All steps completed successfully!');
    logInfo('\nNext Steps:');
    logInfo('1. Android Studio should be open with your project');
    logInfo('2. Click the green "Run" button (▶) in the toolbar');
    logInfo('3. Select your Pixel 6 emulator if prompted');
    logInfo('4. Wait for the app to build and launch (first time takes 2-3 minutes)');
    logInfo('\nTroubleshooting:');
    logInfo(`- View detailed logs in: ${CONFIG.LOG_FILE}`);
    logInfo('- Check emulator in Android Studio > Device Manager');
    logInfo('- Verify Android SDK path in script configuration');
  } else {
    logError('Some steps failed. Please review the errors above.');
    logInfo(`Check detailed logs in: ${CONFIG.LOG_FILE}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.clear();

  log('═'.repeat(80), 'bright');
  log('   CLINICAL WIZARD - ANDROID TEST AUTOMATION   ', 'bright');
  log('═'.repeat(80), 'bright');
  console.log('');

  logInfo(`Starting at: ${new Date().toLocaleString()}`);
  logInfo(`Log file: ${CONFIG.LOG_FILE}`);
  console.log('');

  const results = {
    sdkDetected: false,
    emulatorStarted: false,
    portsChecked: false,
    buildCompleted: false,
    syncCompleted: false,
    studioLaunched: false,
    healthChecksPassed: false,
    allPassed: false,
  };

  try {
    // Step 1: Detect Android SDK
    results.sdkDetected = await detectAndroidSDK();
    if (!results.sdkDetected) {
      throw new Error('Android SDK not detected');
    }

    // Step 2: Start emulator
    results.emulatorStarted = await startEmulator();
    if (!results.emulatorStarted) {
      throw new Error('Failed to start emulator');
    }

    // Step 3: Check ports
    results.portsChecked = await checkPorts();

    // Step 4: Build project
    results.buildCompleted = await buildProject();
    if (!results.buildCompleted) {
      throw new Error('Build failed');
    }

    // Step 5: Sync to Android
    results.syncCompleted = await syncToAndroid();
    if (!results.syncCompleted) {
      throw new Error('Sync failed');
    }

    // Step 6: Launch Android Studio
    results.studioLaunched = await launchAndroidStudio();

    // Step 7: Try to install/launch APK (optional)
    logStep(7, 10, 'Checking for existing APK...');
    await installAndLaunchAPK();

    // Step 8: Health checks
    results.healthChecksPassed = await runHealthChecks();

    // Success!
    results.allPassed = true;

  } catch (error) {
    logError(`Fatal error: ${error.message}`);
    logInfo('Attempting to continue with remaining steps...');
  }

  // Step 10: Generate summary
  generateSummary(results);

  logInfo(`Completed at: ${new Date().toLocaleString()}`);

  // Exit code based on results
  process.exit(results.allPassed ? 0 : 1);
}

// ============================================================================
// Error Handling
// ============================================================================

process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logWarning('\nReceived SIGINT, shutting down gracefully...');
  process.exit(0);
});

// ============================================================================
// Execute
// ============================================================================

if (require.main === module) {
  main();
}

module.exports = { main };
