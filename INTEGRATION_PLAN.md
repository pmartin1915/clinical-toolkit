# Clinical Wizard - Master Integration & Testing Plan
## Created: November 13, 2025
## Session Goal: Professional-Grade Mobile Application with Automated Testing

---

## 1. CURRENT STATE ANALYSIS

### Current Branch: `claude/clinical-wizard-integration-plan-011CV5rwbtdPvUCiwNCnKUf9`

**What We Have:**
- ✅ Complete clinical toolkit functionality
- ✅ Temp-ui components (Button, Card, Modal) - self-contained
- ✅ Legal framework (disclaimers, terms, privacy)
- ✅ Desktop/Tauri support
- ✅ PWA capabilities
- ⚠️ Empty `medical-wizards-shared/` directory (needs removal)
- ⚠️ @medical-wizards dependencies in package.json (needs removal)
- ❌ No Android/Capacitor setup
- ❌ No automated testing CI/CD

**Package.json Issues:**
```json
Line 25: "@medical-wizards/design-system": "file:../medical-wizards-shared/packages/design-system",
Line 26: "@medical-wizards/ui": "file:../medical-wizards-shared/packages/ui",
```
These point to non-existent packages and break the build.

---

## 2. AVAILABLE RESOURCES FROM OTHER BRANCHES

### Branch: `claude/clinical-wizard-development-011CV5Tefke3VpuihSb5FvsF`

**What It Has:**
- ✅ Complete Android/Capacitor setup
- ✅ Full `android/` directory with Gradle configuration
- ✅ Android automation scripts:
  - `android-test.bat` - Windows one-click testing
  - `android-test.ps1` - PowerShell automation
  - `android-test.js` - Node.js automation (550+ lines)
  - `android-test-config.json` - Configuration
- ✅ Comprehensive documentation:
  - `ANDROID_QUICK_START.md`
  - `ANDROID_TESTING_GUIDE.md`
  - `ANDROID_TROUBLESHOOTING.md`
  - `ANDROID_AUTOMATION_README.md`
- ✅ Git safety tools (`git-pull-safe.*`)
- ✅ Temp-ui components
- ⚠️ Still has @medical-wizards dependencies (will not copy this)

**Capacitor Dependencies Added:**
```json
"@capacitor/android": "^7.4.4",
"@capacitor/app": "^7.1.0",
"@capacitor/cli": "^7.4.4",
"@capacitor/core": "^7.4.4",
"@capacitor/haptics": "^7.0.2",
"@capacitor/keyboard": "^7.0.3",
"@capacitor/splash-screen": "^7.0.3",
"@capacitor/status-bar": "^7.0.3"
```

### Branch: `claude/clinical-wizard-shared-removal-011CV5m6GBGSixdwiFEz5L8j`

**What It Has:**
- ✅ Clean package.json without @medical-wizards dependencies
- ✅ Capacitor core dependencies
- ✅ Working Windows build
- ✅ Temp-ui components
- ✅ `capacitor.config.ts`
- ❌ No complete Android setup (android/ directory)
- ❌ No automation scripts

---

## 3. INTEGRATION STRATEGY

### Approach: Surgical File-by-File Integration

**Why This Approach:**
- Maximum control over every change
- Avoid merge conflicts
- Cherry-pick only what works
- Test incrementally

### Phase 1: Fix Current Branch (30 minutes)
**Goal:** Remove broken dependencies, add Capacitor

1. ✅ Backup current state
2. ✅ Remove `medical-wizards-shared/` directory
3. ✅ Update package.json:
   - Remove @medical-wizards dependencies (lines 25-26)
   - Add Capacitor dependencies from development branch
4. ✅ Copy `capacitor.config.ts` from shared-removal branch
5. ✅ Run `npm install` to verify clean install
6. ✅ Run `npm run build` to verify working build
7. ✅ Commit: "fix: remove medical-wizards dependencies and add Capacitor"

### Phase 2: Add Android Infrastructure (45 minutes)
**Goal:** Complete mobile setup with automation

1. ✅ Copy `android/` directory from development branch
2. ✅ Copy Android automation scripts:
   - `android-test.bat`
   - `android-test.ps1`
   - `android-test.js`
   - `android-test-config.json`
3. ✅ Copy Git safety tools:
   - `git-pull-safe.bat`
   - `git-pull-safe.js`
   - `git-pull-safe.ps1`
4. ✅ Copy Android documentation:
   - `ANDROID_QUICK_START.md`
   - `ANDROID_TESTING_GUIDE.md`
   - `ANDROID_TROUBLESHOOTING.md`
   - `ANDROID_AUTOMATION_README.md`
   - `GIT_PULL_SAFE_GUIDE.md`
   - `NEXT_CLAUDE_PROMPT.md`
5. ✅ Update `.gitignore` from development branch
6. ✅ Run `npm install` to add new dependencies
7. ✅ Run `npx cap sync android`
8. ✅ Run `npx cap doctor` for health check
9. ✅ Commit: "feat: add complete Android/Capacitor infrastructure"

### Phase 3: Automated Testing Setup (1 hour)
**Goal:** "Validate as much as possible with automatic tests in CI"

#### 3.1 Test Framework Setup
1. ✅ Verify Vitest is configured (already in package.json)
2. ✅ Add test scripts to package.json:
   ```json
   "test": "vitest",
   "test:ui": "vitest --ui",
   "test:run": "vitest run",
   "test:coverage": "vitest run --coverage"
   ```
3. ✅ Create `vitest.config.ts` with proper configuration
4. ✅ Add testing utilities and helpers

#### 3.2 Write Core Tests
1. ✅ Unit tests for clinical calculators
2. ✅ Component tests for UI elements
3. ✅ Integration tests for key workflows
4. ✅ Legal framework validation tests
5. ✅ Build validation tests

#### 3.3 CI/CD Setup
1. ✅ Create `.github/workflows/ci.yml`
2. ✅ Configure workflow to run on:
   - Push to any branch
   - Pull request creation
   - Manual trigger
3. ✅ CI Pipeline steps:
   - Install dependencies
   - Run linter
   - Run all tests
   - Generate coverage report
   - Build web application
   - Sync Capacitor
   - Build Android (basic validation)
   - Upload artifacts

#### 3.4 Quality Gates
1. ✅ Require tests to pass before merge
2. ✅ Enforce minimum code coverage (70%)
3. ✅ No lint errors allowed
4. ✅ Successful build required

### Phase 4: Documentation & Finalization (30 minutes)
**Goal:** Clear handoff for next steps

1. ✅ Create comprehensive TESTING_GUIDE.md
2. ✅ Update README.md with testing instructions
3. ✅ Document CI/CD pipeline
4. ✅ Create HANDOFF document for next session
5. ✅ Final commit and push

---

## 4. AUTOMATED TESTING STRATEGY

### Test Categories

#### A. Unit Tests
**Location:** `src/components/**/__tests__/*.test.tsx`

**Coverage:**
- Clinical calculators (ASCVD, eGFR, CHA2DS2-VASc, Wells Score, etc.)
- Utility functions
- Data validation
- Business logic

**Example:**
```typescript
describe('ASCVD Calculator', () => {
  it('calculates 10-year risk correctly for known values', () => {
    const result = calculateASCVD({ age: 55, cholesterol: 200, ... });
    expect(result).toBeCloseTo(7.5, 1);
  });

  it('validates input ranges', () => {
    expect(() => calculateASCVD({ age: 20, ... })).toThrow();
  });
});
```

#### B. Component Tests
**Location:** `src/components/**/__tests__/*.test.tsx`

**Coverage:**
- UI components render correctly
- User interactions work
- State management
- Error boundaries

**Example:**
```typescript
describe('DisclaimerModal', () => {
  it('renders and displays disclaimer text', () => {
    render(<DisclaimerModal open={true} />);
    expect(screen.getByText(/not a substitute/i)).toBeInTheDocument();
  });

  it('closes when user accepts', async () => {
    const onClose = vi.fn();
    render(<DisclaimerModal open={true} onClose={onClose} />);
    await userEvent.click(screen.getByText(/I understand/i));
    expect(onClose).toHaveBeenCalled();
  });
});
```

#### C. Integration Tests
**Coverage:**
- Complete user workflows
- Multi-component interactions
- Data persistence
- Navigation

#### D. Build Validation Tests
**Coverage:**
- Web build completes without errors
- Android sync succeeds
- No TypeScript errors
- No lint violations
- All assets present

### CI/CD Pipeline Structure

```yaml
name: Clinical Wizard CI/CD

on:
  push:
    branches: [ "**" ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 18
      - Install dependencies
      - Run linter
      - Run unit tests
      - Run component tests
      - Run integration tests
      - Generate coverage report
      - Upload coverage to Codecov

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 18
      - Install dependencies
      - Build web application
      - Sync Capacitor
      - Validate Android project
      - Upload build artifacts

  android-build:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - Setup Java 17
      - Setup Android SDK
      - Build Android APK
      - Upload APK artifact
```

---

## 5. SUCCESS CRITERIA

### Integration Success ✅

- [ ] `npm install` completes without errors
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] `npx cap sync android` works
- [ ] `npx cap doctor` shows all green
- [ ] `android/` directory exists and is complete
- [ ] All automation scripts present
- [ ] All documentation included

### Testing Success ✅

- [ ] Test framework configured
- [ ] At least 20 unit tests written
- [ ] At least 10 component tests written
- [ ] Code coverage > 70%
- [ ] CI/CD pipeline configured
- [ ] CI passes on test run
- [ ] Coverage report generated

### Professional Mobile App ✅

- [ ] App runs in browser (dev mode)
- [ ] App builds to production bundle
- [ ] App syncs to Android
- [ ] No console errors in production
- [ ] Legal framework intact
- [ ] All clinical tools functional

---

## 6. RISK MITIGATION

### Risks & Solutions

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Dependency conflicts | Medium | High | Test after each package.json change |
| Android build fails | Low | Medium | Copy working config from dev branch |
| Tests break build | Medium | Medium | Fix tests before enabling CI |
| Missing documentation | Low | Low | Copy all docs from dev branch |
| Git conflicts | Low | High | Use file copying instead of merge |

### Backup Strategy

1. ✅ Create backup branch before starting
2. ✅ Commit after each major phase
3. ✅ Test incrementally
4. ✅ Push to remote frequently
5. ✅ Keep detailed notes of changes

---

## 7. NEXT STEPS AFTER THIS SESSION

### On Windows PC (D:\projects\clinical-toolkit)

1. **Pull Latest Changes**
   ```powershell
   cd D:\projects\clinical-toolkit
   git fetch origin
   git checkout claude/clinical-wizard-integration-plan-011CV5rwbtdPvUCiwNCnKUf9
   git pull
   ```

2. **Install Dependencies**
   ```powershell
   npm install
   ```

3. **Test Android Build**
   ```powershell
   .\android-test.bat
   ```

4. **Open in Android Studio**
   - Open the `android/` directory
   - Let Gradle sync complete
   - Click Run ▶️
   - Test on emulator or device

5. **Run Tests**
   ```powershell
   npm run test:run
   npm run test:coverage
   ```

6. **Verify CI**
   - Check GitHub Actions
   - Review test results
   - Download coverage report

---

## 8. TIMELINE

**Total Estimated Time: 2.5 - 3 hours**

- Phase 1 (Fix Dependencies): 30 minutes
- Phase 2 (Android Setup): 45 minutes
- Phase 3 (Testing/CI): 1 hour
- Phase 4 (Documentation): 30 minutes
- Buffer for issues: 15-30 minutes

---

## 9. DELIVERABLES

### Code
- ✅ Clean package.json without broken dependencies
- ✅ Complete Android/Capacitor setup
- ✅ Comprehensive test suite
- ✅ CI/CD pipeline

### Documentation
- ✅ This integration plan
- ✅ Testing guide
- ✅ CI/CD documentation
- ✅ Updated README
- ✅ Handoff document

### Infrastructure
- ✅ GitHub Actions workflow
- ✅ Android automation scripts
- ✅ Test configuration
- ✅ Build validation

---

## 10. QUESTIONS ANSWERED

**Q: How do we ensure quality?**
A: Automated testing in CI - "Validate as much as possible with automatic tests in CI"

**Q: What's the integration approach?**
A: Surgical file-by-file copying to avoid conflicts and maintain control

**Q: How do we test Android?**
A: Use automation scripts from dev branch, test in Android Studio on Windows

**Q: What about documentation?**
A: Copy all documentation from dev branch, create additional testing docs

**Q: How do we prevent regression?**
A: CI pipeline runs on every push, blocks merges if tests fail

---

**READY TO EXECUTE! 🚀**

---

*Integration Plan by Claude Code | November 13, 2025*
*Clinical Wizard - Professional Medical Mobile Application*
*DNP Project by Perry Martin, MSN*
