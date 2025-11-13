# Windows Testing Procedures

**For**: D:\projects\clinical-toolkit on Windows PC
**Branch**: `claude/clinical-wizard-integration-plan-011CV5rwbtdPvUCiwNCnKUf9`
**Goal**: Test Android application after integration complete

---

## Quick Start (5 Minutes)

### Option 1: One-Click Automation (Recommended)

```powershell
# 1. Pull latest changes
cd D:\projects\clinical-toolkit
git fetch origin
git checkout claude/clinical-wizard-integration-plan-011CV5rwbtdPvUCiwNCnKUf9
git pull

# 2. Run one-click automation
.\android-test.bat
```

**What happens**:
- Installs dependencies (if needed)
- Builds web application
- Syncs to Android
- Checks for Android emulator
- Launches Android Studio automatically

### Option 2: Manual Steps

```powershell
# 1. Pull latest
cd D:\projects\clinical-toolkit
git pull

# 2. Install dependencies
npm install

# 3. Run tests
npm run test:run

# 4. Build
npm run build

# 5. Sync to Android
npx cap sync android

# 6. Open Android Studio
npx cap open android
```

---

## Detailed Testing Workflow

### Step 1: Git Operations (2 minutes)

```powershell
# Navigate to project
cd D:\projects\clinical-toolkit

# Fetch all branches
git fetch origin

# Checkout integration branch
git checkout claude/clinical-wizard-integration-plan-011CV5rwbtdPvUCiwNCnKUf9

# Pull latest changes
git pull

# Verify branch
git branch
git log --oneline -5
```

**Expected Output**:
```
* claude/clinical-wizard-integration-plan-011CV5rwbtdPvUCiwNCnKUf9
[commit hash] docs: add final handoff documentation
[commit hash] feat: add comprehensive automated testing and CI/CD pipeline
[commit hash] feat: add complete Android/Capacitor infrastructure
[commit hash] fix: remove medical-wizards dependencies and add Capacitor support
```

### Step 2: Verify Dependencies (3 minutes)

```powershell
# Check Node version (should be 18+)
node --version

# Check npm version
npm --version

# Install/update dependencies
npm install

# Verify no vulnerabilities
```

**Expected Output**:
```
added/updated packages in [X]s
found 0 vulnerabilities
```

### Step 3: Run Tests (5 minutes)

```powershell
# Run all tests
npm run test:run

# Run with coverage
npm run test:coverage

# Open coverage report
start coverage\index.html
```

**Expected Results**:
- 104+ tests should pass
- Calculator tests: 76/76 passing
- Component tests: 12/12 passing
- Coverage report generated

### Step 4: Build Web Application (2 minutes)

```powershell
# Build for production
npm run build

# Verify dist directory created
dir dist

# Check build output
```

**Expected Output**:
```
✓ built in [X]s
PWA v1.1.0
precache  24 entries (1.77 MB)
```

**Verify Files**:
- `dist\index.html` exists
- `dist\assets\` directory exists
- `dist\sw.js` (service worker) exists

### Step 5: Capacitor Sync (1 minute)

```powershell
# Sync web assets to Android
npx cap sync android

# Run health check
npx cap doctor
```

**Expected Output**:
```
✔ Copying web assets from dist to android/app/src/main/assets/public
✔ Creating capacitor.config.json
✔ copy android
✔ Updating Android plugins
[info] Found 5 Capacitor plugins for android
✔ update android
[info] Sync finished in [X]s

💊   Capacitor Doctor  💊
[success] Android looking great! 👌
```

### Step 6: Android Studio Testing (15 minutes)

#### Option A: Automatic Launch

```powershell
# Launch Android Studio automatically
npx cap open android
```

#### Option B: Manual Launch

1. Open Android Studio
2. File → Open
3. Navigate to: `D:\projects\clinical-toolkit\android`
4. Click OK

#### In Android Studio:

**1. Wait for Gradle Sync** (2-3 minutes first time)
- Status bar at bottom shows progress
- Wait for "Gradle sync finished" message

**2. Configure Emulator** (if needed)
- Tools → Device Manager
- Create Virtual Device (if none exist)
- Select Pixel 5 or similar
- Download system image (if needed)
- Finish setup

**3. Run Application**
- Select emulator from device dropdown
- Click Run ▶️ button (green triangle)
- Wait for build and installation (2-3 minutes first time)

**4. What to Test**:

**Launch**:
- ✅ App launches successfully
- ✅ Splash screen appears
- ✅ Main dashboard loads

**Navigation**:
- ✅ Can navigate between pages
- ✅ Buttons respond to touch
- ✅ Smooth scrolling

**Clinical Tools**:
- ✅ A1C Converter works
- ✅ GAD-7 Assessment loads
- ✅ PHQ-9 Assessment loads
- ✅ ASCVD Calculator accessible
- ✅ BP Tracker functional

**Mobile Features**:
- ✅ Keyboard appears when typing
- ✅ Back button works
- ✅ Status bar displays correctly
- ✅ Haptic feedback (if enabled)

**Performance**:
- ✅ No lag or stuttering
- ✅ Fast page transitions
- ✅ Responsive UI

**Offline**:
- Turn off WiFi in emulator
- ✅ App still works
- ✅ All content available
- ✅ PWA service worker active

### Step 7: Build APK (Optional, 5 minutes)

```powershell
# Navigate to android directory
cd android

# Build debug APK
.\gradlew assembleDebug

# Find APK
dir app\build\outputs\apk\debug

# APK location:
# app\build\outputs\apk\debug\app-debug.apk
```

**Install on Device**:
```powershell
# If device connected via USB
adb install app\build\outputs\apk\debug\app-debug.apk
```

---

## Troubleshooting

### Issue: Git pull fails

**Solution**:
```powershell
# Check current status
git status

# If uncommitted changes:
git stash
git pull
git stash pop

# If conflicts persist, use git-pull-safe
.\git-pull-safe.bat
```

### Issue: npm install fails

**Solution**:
```powershell
# Clear cache
npm cache clean --force

# Remove node_modules
rm -r -fo node_modules
rm package-lock.json

# Reinstall
npm install
```

### Issue: Build fails

**Solution**:
```powershell
# Check for errors
npm run lint

# Fix any TypeScript errors
npm run build -- --mode development

# Check logs
```

### Issue: Android Studio won't open project

**Solution**:
1. Verify Android Studio installed
2. Check Java installed (Java 17 recommended)
3. Try manual open:
   - File → Open
   - Navigate to `android/` directory
   - Click OK

### Issue: Emulator not starting

**Solution**:
1. Tools → Device Manager
2. Click ▶️ next to virtual device
3. Wait 2-3 minutes for cold boot
4. If still fails:
   - Delete virtual device
   - Create new one
   - Download fresh system image

### Issue: App crashes on launch

**Check**:
1. Android Studio Logcat (View → Tool Windows → Logcat)
2. Look for error messages (red text)
3. Common issues:
   - Missing native dependencies
   - Corrupted build
   - Emulator out of memory

**Solution**:
```powershell
# Clean and rebuild
cd android
.\gradlew clean
cd ..
npm run build
npx cap sync android
```

### Issue: Tests fail locally

**Solution**:
```powershell
# Run specific test file
npm run test:run -- src/utils/__tests__/egfr-calculator.test.ts

# Run with verbose output
npm run test:run -- --reporter=verbose

# Check test setup
type src\test\setup.ts
```

---

## Automation Scripts

### android-test.bat

**What it does**:
1. Checks for npm
2. Installs dependencies if needed
3. Runs build
4. Syncs to Android
5. Checks for emulator
6. Launches Android Studio

**Usage**:
```powershell
.\android-test.bat
```

**Configuration**: Edit `android-test-config.json` to customize

### android-test.ps1

**PowerShell version with more features**:
- Better error handling
- Emulator auto-start
- Progress indicators
- Color-coded output

**Usage**:
```powershell
.\android-test.ps1
```

### android-test.js

**Node.js version** (most comprehensive):
```powershell
node android-test.js
```

**Features**:
- 550+ lines of automation
- Complete error handling
- SDK detection
- Emulator management
- Build validation
- Android Studio integration

---

## Performance Testing

### Load Time Test

1. Launch app in emulator
2. Time from tap to dashboard visible
3. Target: < 3 seconds

### Memory Usage

1. In Android Studio: View → Tool Windows → Profiler
2. Select "Memory" profiler
3. Launch app
4. Monitor memory usage
5. Target: < 100 MB

### Battery Usage

1. Let app run for 10 minutes
2. Check battery drain
3. Target: < 5% per hour

---

## Quality Checklist

### Before Committing Changes

- [ ] All tests pass (`npm run test:run`)
- [ ] No lint errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Capacitor sync works (`npx cap sync android`)
- [ ] App launches in emulator
- [ ] No console errors
- [ ] All features functional

### Before Creating Release

- [ ] All quality checklist items above
- [ ] Tested on physical device
- [ ] Tested offline mode
- [ ] All clinical calculators tested with known values
- [ ] Legal disclaimers display correctly
- [ ] App icons and splash screens correct
- [ ] Version number updated
- [ ] Release notes written

---

## Next Steps After Testing

### If Everything Works

1. **Document Success**
   - Note any issues encountered
   - Record testing results
   - Update testing log

2. **Plan Next Features**
   - Review roadmap
   - Prioritize calculators
   - Plan UI enhancements

3. **Prepare for Release**
   - Generate signed APK
   - Create Play Store assets
   - Write app description

### If Issues Found

1. **Document Issues**
   - What failed
   - Error messages
   - Steps to reproduce

2. **Check Documentation**
   - ANDROID_TROUBLESHOOTING.md
   - TESTING_GUIDE.md
   - This file

3. **Seek Solutions**
   - Review logs carefully
   - Check GitHub Actions runs
   - Test incrementally

---

## Resources

### Documentation
- **ANDROID_QUICK_START.md** - 30-second guide
- **ANDROID_TESTING_GUIDE.md** - Complete reference
- **ANDROID_TROUBLESHOOTING.md** - Problem solving
- **TESTING_GUIDE.md** - Testing framework
- **HANDOFF_COMPLETE.md** - Session summary

### Tools
- **Android Studio**: Full IDE
- **Emulator**: Virtual device testing
- **adb**: Android Debug Bridge
- **Gradle**: Build system

### Commands Quick Reference

```powershell
# Git
git pull
git status
git log --oneline -5

# npm
npm install
npm run build
npm run test:run
npm run test:coverage

# Capacitor
npx cap sync android
npx cap open android
npx cap doctor

# Android
cd android
.\gradlew assembleDebug
.\gradlew clean

# Automation
.\android-test.bat
.\android-test.ps1
node android-test.js
```

---

## Success Indicators

✅ **Integration Successful**:
- No git conflicts
- Dependencies install cleanly
- All tests pass
- Build completes
- Android sync works

✅ **Android Working**:
- Emulator launches
- App installs
- App opens without crashes
- All features functional
- Good performance

✅ **Ready for Production**:
- Tested on physical device
- All clinical tools working
- Offline mode functional
- No critical bugs
- Professional appearance

---

**Testing Complete**: [Date]
**Tested By**: [Name]
**Device**: [Emulator/Physical Device]
**Result**: [Pass/Fail]
**Notes**: [Any observations]

---

*Clinical Wizard Windows Testing Procedures*
*Last Updated: November 13, 2025*
