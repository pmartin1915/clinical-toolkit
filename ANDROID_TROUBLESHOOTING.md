# Android Testing - Troubleshooting Guide

Quick reference for common issues and solutions.

## 🚨 Quick Diagnostics

Run these commands to diagnose issues:

```bash
# Check Node.js
node --version

# Check Java
java -version

# Check Android devices
%ANDROID_HOME%\platform-tools\adb.exe devices

# Check Capacitor
npx cap doctor

# List emulators
%ANDROID_HOME%\emulator\emulator.exe -list-avds
```

---

## ❌ Error: "Android SDK not found"

### Symptoms
```
✗ Android SDK not found at: D:\Android\SDK
```

### Solutions

**Option 1: Set ANDROID_HOME**
```cmd
setx ANDROID_HOME "D:\Android\SDK"
```

**Option 2: Update Config**
Edit `android-test-config.json`:
```json
{
  "androidSDKPath": "C:\\Your\\Actual\\Path\\To\\SDK"
}
```

**Option 3: Verify SDK Installation**
1. Open Android Studio
2. Tools → SDK Manager
3. Note "Android SDK Location"
4. Use that path in config

---

## ❌ Error: "No emulators found"

### Symptoms
```
✗ No emulators found!
ℹ Create an emulator in Android Studio first
```

### Solutions

**Create Emulator:**
1. Android Studio → Tools → Device Manager
2. Click "Create Device"
3. Select "Pixel 6"
4. Choose "R" (API 30) or "S" (API 31)
5. Click "Finish"

**Verify:**
```bash
%ANDROID_HOME%\emulator\emulator.exe -list-avds
```

Should list your emulator name.

**Update Config:**
```json
{
  "emulatorName": "Your_Actual_Emulator_Name"
}
```

---

## ❌ Error: "Emulator won't start"

### Symptoms
```
✗ Failed to start emulator
or
Emulator window opens but hangs
```

### Solutions

**1. Enable Hardware Acceleration (CRITICAL)**

**For Intel:**
- Android Studio → SDK Manager → SDK Tools
- Check "Intel x86 Emulator Accelerator (HAXM)"
- Install
- Restart PC

**For AMD:**
- Enable SVM in BIOS
- Use Android Emulator Hypervisor (AEHD)

**Verify BIOS settings:**
- Intel: VT-x enabled
- AMD: SVM enabled

**2. Close Conflicting Software**
- Close VirtualBox, VMware, Hyper-V
- These conflict with emulator acceleration

**3. Increase Emulator Resources**
Android Studio → Device Manager → Edit emulator:
- RAM: 2048 MB → 4096 MB
- Graphics: Automatic → Hardware
- Boot option: Cold Boot → Quick Boot

**4. Try Lighter Emulator**
- Use Pixel 5 instead of Pixel 6
- API 30 instead of 33
- Less RAM intensive

**5. Manual Start Test**
```bash
%ANDROID_HOME%\emulator\emulator.exe -avd Pixel_6_API_30 -verbose
```

Check output for specific errors.

---

## ❌ Error: "Build failed"

### Symptoms
```
✗ Build failed with code 1
npm ERR! code ELIFECYCLE
```

### Solutions

**1. Check for Type Errors**
```bash
npm run build
```
Review error output for TypeScript issues.

**2. Clean Install**
```bash
# Delete node_modules and reinstall
rmdir /s /q node_modules
del package-lock.json
npm install
```

**3. Check React Version**
```json
// package.json should have:
"react": "^19.1.1",
"react-dom": "^19.1.1"
```

**4. Clear Build Cache**
```bash
rmdir /s /q dist
npm run build
```

**5. Check Disk Space**
Ensure you have at least 2 GB free space.

---

## ❌ Error: "Sync failed"

### Symptoms
```
✗ Sync failed with code 1
[error] Could not find the web assets directory
```

### Solutions

**1. Ensure Build Completed**
```bash
# Build must run first
npm run build

# Verify dist exists
dir dist
```

**2. Check Capacitor Config**
```typescript
// capacitor.config.ts
webDir: 'dist',  // Must match build output
```

**3. Reinstall Capacitor**
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

**4. Manual Sync**
```bash
npx cap sync android --verbose
```

Review verbose output for specific issues.

---

## ❌ Error: "Android Studio won't open"

### Symptoms
```
✗ Android Studio not found in common locations
```

### Solutions

**1. Manual Open**
- Open Android Studio manually
- File → Open → Select `android` folder in your project

**2. Update Script Path**
Find your Android Studio installation:
```cmd
dir "C:\Program Files\Android\Android Studio\bin\studio64.exe"
```

Edit `android-test.js` line 580 with correct path.

**3. Add to PATH**
Add Android Studio `bin` directory to Windows PATH.

---

## ❌ Error: "App won't run in emulator"

### Symptoms
- Android Studio opens
- Emulator runs
- But app doesn't launch or crashes

### Solutions

**1. First Build Takes Time**
- First build: 2-3 minutes (be patient!)
- Watch Gradle build output in Android Studio

**2. Gradle Errors**
Check "Build" tab in Android Studio for specific errors.

**3. Clean Project**
Android Studio:
- Build → Clean Project
- Build → Rebuild Project
- Then Run (▶)

**4. Check Gradle Sync**
File → Sync Project with Gradle Files

**5. Invalidate Caches**
File → Invalidate Caches / Restart → Invalidate and Restart

**6. Check Logs**
```bash
%ANDROID_HOME%\platform-tools\adb.exe logcat | findstr Clinical
```

---

## ❌ Error: "Java not found"

### Symptoms
```
✗ Java: Not detected (needed for Android builds)
or
BUILD FAILED: Java not found
```

### Solutions

**1. Install Java**
Download Java JDK 11 or 17:
- https://adoptium.net/
- Install with default settings

**2. Set JAVA_HOME**
```cmd
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot"
```

**3. Add to PATH**
```cmd
setx PATH "%PATH%;%JAVA_HOME%\bin"
```

**4. Restart Terminal**
Close and reopen terminal/PowerShell.

**5. Verify**
```bash
java -version
```

Should show version 11 or 17.

---

## 🐌 Issue: Emulator is very slow

### Solutions

**1. Use Physical Device Instead**
Much faster than emulator!
- Enable USB Debugging
- Connect via USB
- Run automation

**2. Enable Hardware Acceleration**
See "Emulator won't start" solutions above.

**3. Reduce Emulator Resources**
- Use Pixel 5 instead of Pixel 6
- Lower screen resolution
- Reduce RAM allocation

**4. Disable Animations**
In emulator:
- Settings → Developer Options
- Window animation scale → 0.5x
- Transition animation scale → 0.5x
- Animator duration scale → 0.5x

**5. Use Quick Boot**
Device Manager → Edit emulator → Show Advanced:
- Boot option → Quick Boot
- Much faster after first boot

**6. Close Antivirus Temporarily**
Can significantly slow emulator.

---

## 🔌 Issue: Port conflicts

### Symptoms
```
Error: Port 5173 already in use
EADDRINUSE
```

### Solutions

**1. Find Process Using Port**
```powershell
netstat -ano | findstr :5173
```

Note the PID (last column).

**2. Kill Process**
```cmd
taskkill /PID <PID> /F
```

**3. Use Different Port**
Edit `vite.config.ts`:
```typescript
server: {
  port: 8080  // Change to available port
}
```

---

## 💾 Issue: Disk space errors

### Symptoms
```
Error: ENOSPC: no space left on device
or
Build fails with disk errors
```

### Solutions

**1. Free Up Space**
Need at least 2 GB free:
- Delete unnecessary files
- Empty Recycle Bin
- Clean temp folders

**2. Clean npm Cache**
```bash
npm cache clean --force
```

**3. Clean Android Build**
```bash
cd android
gradlew clean
```

**4. Delete Old Emulator Snapshots**
Android Studio → Device Manager → Edit → Wipe Data

---

## 🔄 Issue: Changes not appearing

### Symptoms
- Made code changes
- Rebuilt and synced
- But app shows old version

### Solutions

**1. Hard Refresh**
In emulator/device:
- Swipe down from top
- Tap app notification
- Force Stop
- Relaunch app

**2. Clear App Data**
```bash
%ANDROID_HOME%\platform-tools\adb.exe shell pm clear com.perrymartin.clinicalwizard
```

**3. Uninstall and Reinstall**
Device Manager → Right-click app → Uninstall
Then Run (▶) again.

**4. Verify Build Ran**
Check console output for:
```
✓ Build completed successfully
✓ Sync completed successfully
```

**5. Check Cache**
Android Studio:
- File → Invalidate Caches / Restart

---

## 🔍 Debug Tools

### Check Capacitor Status
```bash
npx cap doctor
```

Shows plugins, platforms, and issues.

### View Android Logs
```bash
%ANDROID_HOME%\platform-tools\adb.exe logcat
```

Filter for your app:
```bash
adb logcat | findstr Clinical
```

### Check Device Status
```bash
adb devices -l
```

### Check Device Properties
```bash
adb shell getprop
```

### Monitor Network
```bash
adb shell dumpsys wifi
```

---

## 📊 Performance Diagnostics

### Check Build Performance
```bash
npm run build -- --debug
```

### Check Gradle Build
```bash
cd android
gradlew assembleDebug --profile
```

Creates profiling report.

### Monitor Memory
```bash
adb shell dumpsys meminfo com.perrymartin.clinicalwizard
```

---

## 🆘 Last Resort Solutions

### Nuclear Option 1: Complete Reinstall
```bash
# Delete everything
rmdir /s /q node_modules
rmdir /s /q android
rmdir /s /q dist
del package-lock.json

# Reinstall
npm install
npx cap add android
npm run build
npx cap sync android
```

### Nuclear Option 2: Fresh Emulator
- Delete current emulator
- Create new one from scratch
- Use recommended settings (Pixel 5, API 30)

### Nuclear Option 3: Clean Android Studio
- File → Invalidate Caches / Restart
- Delete `.gradle` folder in project
- Delete `.idea` folder
- Restart Android Studio
- File → Sync Project with Gradle Files

---

## 📞 Getting Help

### Information to Collect

When asking for help, provide:

1. **Error message** (exact text)
2. **Log file** (`android-test.log`)
3. **System info:**
   - Windows version
   - Node.js version: `node --version`
   - Java version: `java -version`
   - Android SDK location
4. **What you tried** (list troubleshooting steps)

### Useful Commands for Diagnostics

```bash
# Full system report
npx cap doctor > capacitor-report.txt

# Environment variables
set | findstr ANDROID
set | findstr JAVA

# Android build info
cd android
gradlew -v

# Node/npm info
node --version
npm --version
npx --version
```

---

## ✅ Prevention Checklist

**Before Every Session:**
- [ ] Enough disk space (2+ GB free)
- [ ] Emulator works (test manually)
- [ ] Android Studio updated
- [ ] Node packages updated: `npm outdated`

**After System Updates:**
- [ ] Verify ANDROID_HOME still set
- [ ] Verify Java still works
- [ ] Verify emulator still runs
- [ ] Rebuild if needed

**Weekly Maintenance:**
- [ ] Clean npm cache
- [ ] Clean Gradle cache
- [ ] Update dependencies
- [ ] Clean emulator snapshots

---

**Still stuck? Check:** `ANDROID_TESTING_GUIDE.md` (full documentation)

---

*Part of Clinical Wizard Android Testing Suite*
*DNP Project by Perry Martin, MSN*
