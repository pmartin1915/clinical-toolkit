# Android Testing - Quick Start Guide

## 🚀 Get Started in 30 Seconds

### Step 1: Double-Click to Run
```
📁 clinical-toolkit/
   └─ android-test.bat  ← Double-click this!
```

### Step 2: Wait for Automation
The script will automatically:
- ✓ Find your Android SDK
- ✓ Start the Pixel 6 emulator
- ✓ Build your app
- ✓ Sync to Android
- ✓ Open Android Studio

### Step 3: Click Run in Android Studio
Look for the green **▶ Run** button in the toolbar and click it.

### Step 4: Wait for First Build
⏱️ First time: 2-3 minutes (downloads dependencies)
⏱️ Next time: 30-60 seconds

---

## 📋 Before You Start

### ✅ Prerequisites Checklist

- [ ] **Node.js installed** (check: `node --version`)
- [ ] **Android Studio installed**
- [ ] **Android SDK at** `D:\Android\SDK` (or set `ANDROID_HOME`)
- [ ] **Pixel 6 emulator created** (Android Studio → Device Manager)
- [ ] **Java JDK installed** (check: `java -version`)

**Missing something?** See full guide: `ANDROID_TESTING_GUIDE.md`

---

## 🎯 What to Expect

### Console Output
```
════════════════════════════════════════════════════════════
   CLINICAL WIZARD - ANDROID TEST AUTOMATION
════════════════════════════════════════════════════════════

[1/10] Detecting Android SDK...
✓ Android SDK detected at: D:\Android\SDK

[2/10] Starting Android emulator...
ℹ Using emulator: Pixel_6_API_30
ℹ Waiting for emulator to boot...
....................
✓ Emulator is ready!

[4/10] Building web assets...
.................
✓ Build completed successfully

[5/10] Syncing to Android...
✓ Sync completed successfully

[6/10] Launching Android Studio...
✓ Android Studio launched

════════════════════════════════════════════════════════════
   SUCCESS! Android Studio should be opening...
════════════════════════════════════════════════════════════

Next Steps:
1. Android Studio should be open with your project
2. Click the green "Run" button (▶) in the toolbar
3. Select your Pixel 6 emulator if prompted
4. Wait for the app to build and launch
```

---

## 🔧 Common Issues & Quick Fixes

### Issue: "Android SDK not found"
**Fix:** Set environment variable
```cmd
setx ANDROID_HOME "D:\Android\SDK"
```
Then restart terminal and try again.

### Issue: "No emulators found"
**Fix:** Create emulator
1. Open Android Studio
2. Tools → Device Manager
3. Create Device → Pixel 6 → API 30 → Finish

### Issue: Emulator is very slow
**Fix 1:** Use Pixel 5 instead of Pixel 6
**Fix 2:** Enable hardware acceleration (HAXM)
**Fix 3:** Use a physical Android device instead

### Issue: Build failed
**Fix:** Reinstall dependencies
```bash
npm install
npm run build
```

### Issue: "Port already in use"
**Fix:** Kill the process or use different port
```powershell
# Find process on port 5173
netstat -ano | findstr :5173

# Kill process (replace PID)
taskkill /PID <PID> /F
```

---

## 📱 Using a Physical Device (FASTER!)

### Setup (One Time)
1. Enable **Developer Mode** on phone
   - Settings → About Phone → Tap "Build Number" 7 times

2. Enable **USB Debugging**
   - Settings → Developer Options → USB Debugging → ON

3. Connect phone to PC via USB

4. Accept authorization prompt on phone

### Run
Same as emulator! Just run `android-test.bat`

The script auto-detects physical devices and uses them instead.

---

## 🎓 Workflow Tips

### Daily Development Cycle
```
1. Make code changes in src/
2. Run: android-test.bat
3. Click Run (▶) in Android Studio
4. Test changes on emulator
5. Repeat!
```

### Keep Emulator Running
Don't close the emulator between tests - much faster startup!

### Skip Build If Unchanged
Edit `android-test.js` line 350 to skip build step if you didn't change code.

---

## 📊 Expected Timings

| Scenario | Time |
|----------|------|
| First run (cold start) | 3-5 minutes |
| Subsequent runs (emulator already open) | 1-2 minutes |
| Physical device | 30-60 seconds |
| Just sync (no rebuild) | 10-15 seconds |

---

## 🆘 Need Help?

### Check the Log
All details are in: `android-test.log`
```bash
notepad android-test.log
```

### Full Documentation
See: `ANDROID_TESTING_GUIDE.md` (comprehensive guide with troubleshooting)

### Manual Commands
If automation fails, run manually:
```bash
# 1. Build
npm run build

# 2. Sync
npx cap sync android

# 3. Open Android Studio
# Open the 'android' folder in Android Studio

# 4. Click Run (▶)
```

---

## ✨ Pro Tips

### 1. Create Desktop Shortcut
Right-click `android-test.bat` → Send to → Desktop (create shortcut)

### 2. Customize Emulator Name
Edit `android-test-config.json`:
```json
{
  "emulatorName": "Your_Emulator_Name"
}
```

### 3. Speed Up Builds
Close unnecessary applications while building.

### 4. Use PowerShell for More Options
```powershell
.\android-test.ps1 -SkipBuild -Verbose
```

---

## 🎉 Success Indicators

**You're ready when you see:**
- ✓ All green checkmarks in console
- ✓ Android Studio opens automatically
- ✓ Emulator is running
- ✓ "SUCCESS!" message displayed
- ✓ Ready to click Run (▶)

**In Android Studio, click the green Run button and watch your app launch!**

---

## 📞 Quick Reference Commands

```bash
# Run automation
android-test.bat

# Check if emulator is running
%ANDROID_HOME%\platform-tools\adb.exe devices

# List available emulators
%ANDROID_HOME%\emulator\emulator.exe -list-avds

# Start emulator manually
%ANDROID_HOME%\emulator\emulator.exe -avd Pixel_6_API_30

# Build only
npm run build

# Sync only
npx cap sync android

# Check Capacitor health
npx cap doctor
```

---

**You're all set! Double-click `android-test.bat` and let the magic happen! ✨**

---

*Part of Clinical Wizard - Professional Android Development*
*DNP Project by Perry Martin, MSN*
