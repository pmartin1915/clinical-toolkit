# Android Testing Automation Guide

## Overview

The Android Test Automation system automatically builds, syncs, and launches the Clinical Wizard app on your Android emulator with comprehensive error handling and logging.

## Quick Start

### Option 1: Windows Batch File (Easiest)

**Just double-click:**
```
android-test.bat
```

This will:
- Check prerequisites
- Start the emulator if needed
- Build your app
- Sync to Android
- Open Android Studio
- Provide clear next steps

### Option 2: PowerShell (More Features)

```powershell
.\android-test.ps1
```

**With options:**
```powershell
# Skip build if you already built
.\android-test.ps1 -SkipBuild

# Skip emulator if already running
.\android-test.ps1 -SkipEmulator

# Verbose output
.\android-test.ps1 -Verbose
```

### Option 3: Direct Node.js (Cross-Platform)

```bash
node android-test.js
```

## What It Does

The automation script performs the following steps:

### 1. Android SDK Detection
- Locates your Android SDK
- Uses `ANDROID_HOME` environment variable or default path
- Verifies emulator and ADB tools are available

### 2. Emulator Management
- Lists all available emulators
- Finds Pixel 6 emulator (or first available)
- Starts emulator if not running
- Waits for emulator to fully boot (with progress indicator)
- Verifies emulator is ready

### 3. Port Availability Check
- Checks common development ports
- Reports which ports are available/in use
- Helps identify port conflicts

### 4. Web Build
- Runs `npx vite build`
- Compiles React app for production
- Shows build progress and output size
- Handles build errors gracefully

### 5. Android Sync
- Runs `npx cap sync android`
- Copies web assets to Android project
- Updates Capacitor plugins
- Verifies sync completion

### 6. Android Studio Launch
- Auto-detects Android Studio installation
- Opens project in Android Studio
- Provides instructions for next steps

### 7. APK Installation (Optional)
- Checks if APK already exists
- Installs to emulator if available
- Launches app automatically

### 8. Health Checks
- Verifies Node.js, npm, Java, Capacitor
- Checks project structure
- Reports any issues

### 9. Summary Report
- Shows status of all steps
- Provides troubleshooting tips
- Suggests next actions

### 10. Detailed Logging
- Writes all output to `android-test.log`
- Color-coded console output
- Timestamps for all operations
- Error details for debugging

## Configuration

### Basic Configuration

Edit `android-test-config.json` to customize:

```json
{
  "androidSDKPath": "D:\\Android\\SDK",
  "emulatorName": "Pixel_6_API_30",
  "emulatorWaitTime": 120000,
  "autoLaunchStudio": true
}
```

### Advanced Configuration

**In `android-test.js`, modify the CONFIG object:**

```javascript
const CONFIG = {
  ANDROID_SDK_PATH: 'D:\\Android\\SDK',
  EMULATOR_NAME: 'Your_Emulator_Name',
  EMULATOR_WAIT_TIME: 180000, // 3 minutes
  BUILD_TIMEOUT: 300000,
  SYNC_TIMEOUT: 60000,
  // ... more options
};
```

## Prerequisites

### Required Software

1. **Node.js** (v18+)
   - Download: https://nodejs.org/

2. **Android Studio**
   - Download: https://developer.android.com/studio

3. **Android SDK**
   - Usually at: `D:\Android\SDK` (Windows)
   - Set `ANDROID_HOME` environment variable

4. **Java JDK** (11 or 17)
   - Required for Android builds
   - Download: https://adoptium.net/

5. **Android Emulator**
   - Create in Android Studio > Device Manager
   - Recommended: Pixel 5 or 6, API Level 30-33

### Environment Variables

**Set `ANDROID_HOME` (recommended):**

**Windows:**
```powershell
# PowerShell (Admin)
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "D:\Android\SDK", "User")
```

**Command Prompt:**
```cmd
setx ANDROID_HOME "D:\Android\SDK"
```

## Emulator Setup

### Creating an Emulator in Android Studio

1. Open Android Studio
2. Tools → Device Manager
3. Click "Create Device"
4. Select "Pixel 6" (recommended)
5. Choose API Level 30, 31, or 33
6. Advanced Settings:
   - RAM: 2048 MB minimum (4096 MB ideal)
   - Internal Storage: 2048 MB
   - SD Card: 512 MB
   - Enable "Hardware - GLES 2.0"
7. Finish

### Optimizing Emulator Performance

**Enable Hardware Acceleration (CRITICAL):**

**Windows - HAXM:**
1. Android Studio → SDK Manager → SDK Tools
2. Check "Intel x86 Emulator Accelerator (HAXM)"
3. Install
4. May need BIOS settings: Enable VT-x/AMD-V

**Emulator Settings:**
- Use "Cold Boot" for first start
- Then "Quick Boot" for subsequent starts
- Disable animations: Developer Options → Window/Transition/Animator scale → 0.5x

### Finding Your Emulator Name

**List emulators:**
```bash
%ANDROID_HOME%\emulator\emulator.exe -list-avds
```

**Update config with your emulator name:**
```json
{
  "emulatorName": "Your_Emulator_Name_Here"
}
```

## Troubleshooting

### Common Issues

#### 1. "Android SDK not found"

**Solutions:**
- Set `ANDROID_HOME` environment variable
- Update `androidSDKPath` in config
- Install Android Studio SDK

**Verify SDK:**
```powershell
dir $env:ANDROID_HOME\emulator
dir $env:ANDROID_HOME\platform-tools
```

#### 2. "No emulators found"

**Solutions:**
- Create emulator in Android Studio → Device Manager
- Check emulator list: `emulator -list-avds`
- Reinstall Android Emulator via SDK Manager

#### 3. "Emulator won't start"

**Solutions:**
- Enable VT-x/AMD-V in BIOS
- Install HAXM (SDK Tools)
- Close other VMs (VirtualBox, VMware)
- Try different emulator (Pixel 5 instead of 6)
- Increase RAM allocation

**Manual start:**
```bash
%ANDROID_HOME%\emulator\emulator.exe -avd Pixel_6_API_30
```

#### 4. "Build failed"

**Solutions:**
- Run `npm install` to ensure dependencies
- Delete `node_modules` and reinstall
- Check for TypeScript errors: `npm run build`
- Ensure React 19 compatibility

#### 5. "Sync failed"

**Solutions:**
- Verify `dist/` folder exists
- Run build first: `npm run build`
- Check Capacitor installation: `npx cap doctor`
- Reinstall Capacitor: `npm install @capacitor/core @capacitor/cli`

#### 6. "Android Studio won't launch"

**Solutions:**
- Install Android Studio if missing
- Update path in script if installed elsewhere
- Open manually: `android/` folder in Android Studio
- Check log: `android-test.log`

#### 7. "App won't run in emulator"

**Solutions:**
- Click "Run" (▶) button in Android Studio
- First build takes 2-3 minutes (be patient!)
- Check Gradle build output in Android Studio
- Try Build → Clean Project → Rebuild Project

#### 8. "Java not found"

**Solutions:**
- Install Java JDK 11 or 17
- Set `JAVA_HOME` environment variable
- Add Java to PATH
- Restart terminal after installation

### Slow Emulator Performance

**Optimization strategies:**

1. **Use Lighter Emulator:**
   - Pixel 5 instead of Pixel 6
   - API 30 instead of 33
   - Lower RAM (2048 MB)

2. **System Resources:**
   - Close other applications
   - Disable antivirus temporarily
   - Increase RAM allocation to emulator

3. **Graphics Acceleration:**
   - Emulator Settings → Graphics → Hardware
   - Enable HAXM/KVM acceleration

4. **Use Physical Device Instead:**
   - Much faster than emulator
   - Enable USB Debugging
   - Connect via USB
   - Script will detect automatically

### Using Physical Android Device

**Setup:**

1. **Enable Developer Mode:**
   - Settings → About Phone
   - Tap "Build Number" 7 times

2. **Enable USB Debugging:**
   - Settings → Developer Options
   - Enable "USB Debugging"

3. **Connect Device:**
   - Use USB cable
   - Accept authorization on device

4. **Verify Connection:**
   ```bash
   %ANDROID_HOME%\platform-tools\adb.exe devices
   ```

5. **Run Script:**
   - Same as emulator: `android-test.bat`
   - Script auto-detects physical device

## Log Analysis

### Reading the Log File

**Open log:**
```bash
notepad android-test.log
```

**Key sections:**
- `[1/10] Detecting Android SDK...` - SDK detection
- `[2/10] Starting Android emulator...` - Emulator startup
- `[4/10] Building web assets...` - Build process
- `[5/10] Syncing to Android...` - Capacitor sync
- `SUMMARY REPORT` - Final status

**Look for:**
- ❌ Error messages with details
- ⚠ Warnings about issues
- ✓ Successful steps
- Exit codes (0 = success)

### Common Log Patterns

**Success:**
```
✓ Android SDK detected at: D:\Android\SDK
✓ Emulator is ready!
✓ Build completed successfully
✓ Sync completed successfully
```

**Failure:**
```
✗ Android SDK not found at: D:\Android\SDK
✗ Build failed with code 1
✗ Sync failed with code 1
```

## Advanced Usage

### Command-Line Arguments

**Skip steps:**
```javascript
// Modify android-test.js
const SKIP_BUILD = process.argv.includes('--skip-build');
const SKIP_EMULATOR = process.argv.includes('--skip-emulator');
```

**Usage:**
```bash
node android-test.js --skip-build
node android-test.js --skip-emulator
```

### Continuous Development

**Quick iteration cycle:**

1. Make code changes in `src/`
2. Run: `npm run build && npx cap sync android`
3. In Android Studio: Run (▶)
4. Changes appear in emulator

**Or use the script:**
```bash
android-test.bat
```

### Debugging

**Enable debug mode in script:**
```javascript
const CONFIG = {
  // ... other config
  DEBUG: true,
  VERBOSE_LOGGING: true,
};
```

**Check Capacitor status:**
```bash
npx cap doctor
```

**Check Android project:**
```bash
cd android
./gradlew tasks
```

## Performance Benchmarks

**Expected timings:**

| Step | First Run | Subsequent |
|------|-----------|------------|
| SDK Detection | 1s | 1s |
| Emulator Start | 60-90s | 0s (if running) |
| Web Build | 15-20s | 15-20s |
| Android Sync | 5-10s | 5-10s |
| Studio Launch | 5-10s | 5-10s |
| APK Build | 120-180s | 30-60s |
| **TOTAL** | **3-5 min** | **1-2 min** |

**Optimization tips:**
- Keep emulator running between tests
- Use `--skip-build` if code unchanged
- Use physical device (much faster)

## Integration with CI/CD

**For automated testing:**

```yaml
# GitHub Actions example
- name: Run Android Tests
  run: node android-test.js
  env:
    ANDROID_HOME: ${{ env.ANDROID_SDK_ROOT }}
    CI: true
```

## FAQ

**Q: Do I need Android Studio open?**
A: No, but it will open automatically to build/run the app.

**Q: Can I use a different emulator?**
A: Yes! Update `emulatorName` in config or script will use first available.

**Q: Will this work on Mac/Linux?**
A: The Node.js script works cross-platform. Update paths for your OS.

**Q: How do I stop the emulator?**
A: Android Studio → Device Manager → Stop, or close emulator window.

**Q: Can I run multiple emulators?**
A: Yes, but script targets first running emulator.

**Q: Does this push to device automatically?**
A: No, it prepares everything. Click Run (▶) in Android Studio to push.

**Q: What if my Android SDK is elsewhere?**
A: Set `ANDROID_HOME` env var or update config JSON.

**Q: Why does first build take so long?**
A: Gradle downloads dependencies (100+ MB). Subsequent builds are faster.

**Q: Can I automate the Android Studio "Run" click?**
A: Possible with Gradle, but Android Studio provides better debugging.

## Best Practices

### Daily Workflow

**Morning startup:**
```bash
1. Start emulator (Device Manager)
2. Run android-test.bat
3. Click Run in Android Studio
4. Start coding!
```

**After code changes:**
```bash
1. Save files
2. android-test.bat
3. Click Run
4. Test changes
```

### Before Committing

**Checklist:**
```bash
✓ npm run build (no errors)
✓ npm run lint (no errors)
✓ Test on emulator
✓ Test on physical device (if available)
✓ Check android-test.log
```

### Production Builds

**For release:**
```bash
1. Update version in android/app/build.gradle
2. Build → Generate Signed Bundle/APK
3. Select "Android App Bundle" (AAB)
4. Upload to Play Console
```

## Support

**If you encounter issues:**

1. Check `android-test.log` for details
2. Review this guide's Troubleshooting section
3. Run health checks: `node android-test.js` (step 8)
4. Search Android Studio build output
5. Check Capacitor docs: https://capacitorjs.com/docs/android

**Helpful commands:**
```bash
# Check Capacitor health
npx cap doctor

# List devices/emulators
%ANDROID_HOME%\platform-tools\adb.exe devices

# View emulator logs
%ANDROID_HOME%\platform-tools\adb.exe logcat

# Clear app data
%ANDROID_HOME%\platform-tools\adb.exe shell pm clear com.perrymartin.clinicalwizard
```

## Version History

- **v1.0.0** - Initial release with full automation
- Comprehensive error handling
- Multi-platform support (Windows batch, PowerShell, Node.js)
- Detailed logging and reporting
- Auto-detection of SDK, emulators, and tools

---

**Built for Clinical Wizard - Professional Android Development**
**DNP Project by Perry Martin, MSN**
