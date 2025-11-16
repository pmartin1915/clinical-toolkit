# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Clinical Wizard** is a Progressive Web App (PWA) and Android mobile application providing evidence-based clinical reference tools for healthcare professionals, students, and the general public. The application features offline functionality, interactive clinical calculators, assessment tools, and comprehensive condition information.

**Key Tech Stack:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Capacitor 7 (Android native)
- Vitest (testing)
- GitHub Actions (CI/CD)

## Essential Commands

### Development
```bash
# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Build and preview production build
npm run build && npm run preview

# Lint code
npm run lint
```

### Testing
```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Test specific file
npm run test:run src/utils/__tests__/ascvd-calculator.test.ts

# Test by pattern
npm run test:run -- calculator
```

### Android Development
```bash
# Build web assets and sync to Android
npm run build && npx cap sync android

# Open in Android Studio
npx cap open android

# One-click automation (Windows only)
./android-test.bat
# or
./android-test.ps1

# Run Capacitor doctor (check configuration)
npx cap doctor
```

### Desktop (Legacy)
```bash
# Run desktop app
npm run desktop
```

## Architecture

### Application Structure

The app uses a **condition-centric architecture** where each medical condition is a self-contained module with its own data, tools, and resources.

**Core Navigation Flow:**
```
App.tsx (ThemeProvider + routing logic)
  ├─ Dashboard (condition cards + search)
  ├─ ConditionDetail (displays selected condition)
  │   ├─ Overview tab
  │   ├─ Guidelines tab
  │   ├─ Tools tab (dynamic tool rendering)
  │   └─ Resources tab
  └─ PatientManager (patient data management)
```

**State Management:**
- **No Redux/Zustand for app state** - Uses React hooks and local state
- **Persistence**: localStorage via `src/utils/storage.ts`
- **Sync**: Service worker + `src/utils/syncManager.ts`

### Key Files & Directories

```
src/
├── App.tsx                    # Main app component with routing logic
├── pages/
│   ├── Dashboard.tsx          # Home page with condition cards
│   └── ConditionDetail.tsx    # Condition detail view (tabs + tools)
├── components/
│   ├── layout/               # Header, Footer
│   ├── ui/                   # Reusable UI components
│   └── tools/                # Clinical calculator components
├── data/
│   └── conditions/           # Condition data modules (*.ts)
├── types/
│   └── index.ts              # Core TypeScript interfaces
├── utils/
│   ├── storage.ts            # localStorage abstraction
│   ├── syncManager.ts        # PWA sync logic
│   └── ascvd/               # ASCVD calculator utilities
└── contexts/
    └── ThemeContext.tsx      # Dark mode theme provider
```

### Data Model

**Core Type: `Condition`** (see [src/types/index.ts](src/types/index.ts))

Each condition module exports a `Condition` object with:
- `id`: Unique identifier (kebab-case)
- `category`: One of 6 categories (cardiovascular, endocrine, mental-health, infectious, metabolic, orthopedic)
- `overview`: Definition, prevalence, key points
- `guidelines`: Diagnosis criteria, treatment options, monitoring
- `tools`: Array of interactive tools (calculators, assessments, trackers)
- `resources`: Citations and references

**Adding a New Condition:**
1. Create `src/data/conditions/your-condition.ts` following the `Condition` interface
2. Import in [src/App.tsx](src/App.tsx) and add to `conditions` object
3. Import in [src/pages/Dashboard.tsx](src/pages/Dashboard.tsx) and add to `conditions` array
4. Add prevalence data in Dashboard.tsx's `prevalenceData` object

### Tool Rendering System

Tools are dynamically rendered in [src/pages/ConditionDetail.tsx](src/pages/ConditionDetail.tsx) based on the `component` field in the tool definition.

**Adding a New Tool:**
1. Create component in `src/components/tools/YourTool.tsx`
2. Add to the switch statement in ConditionDetail.tsx's tool rendering logic
3. Reference the component name in the condition's `tools` array

Example:
```typescript
// In condition data:
tools: [
  {
    id: 'my-calculator',
    name: 'My Calculator',
    description: 'Calculates something useful',
    type: 'calculator',
    component: 'MyCalculator'  // ← Must match switch case
  }
]

// In ConditionDetail.tsx:
case 'MyCalculator':
  return <MyCalculator />;
```

## Testing Standards

### Test Requirements

**All clinical calculators MUST have comprehensive tests** covering:
- Input validation
- Calculation accuracy
- Clinical scenarios
- Edge cases
- Boundary values

**Test Location Pattern:**
- Component tests: `src/components/*/__tests__/*.test.tsx`
- Utility tests: `src/utils/__tests__/*.test.ts`

**CI/CD Pipeline:** GitHub Actions runs on every push
- Lint → Test → Build → Capacitor Sync → Android Build → Quality Gates

**Quality Gates (ALL must pass):**
- Zero lint errors
- All tests passing
- Successful production build
- Successful Capacitor sync

## PWA Configuration

**Service Worker:** [vite.config.ts](vite.config.ts) - VitePWA plugin
- Auto-update on new versions
- Cache ID: `clinical-toolkit-v1`
- Offline-first caching strategy

**Manifest:** Configured in vite.config.ts
- App name: "Clinical Toolkit"
- Theme color: #0ea5e9 (primary blue)
- Scope: `/clinical-toolkit/`

**Important:** PWA caching can be aggressive. If making changes to static assets or manifest, consider incrementing the cache ID in vite.config.ts.

## Android-Specific Notes

**App ID:** `com.perrymartin.clinicalwizard`

**Configuration:** [capacitor.config.ts](capacitor.config.ts)
- Web directory: `dist/`
- Android scheme: HTTPS
- Hostname: `clinical-wizard.app`

**Native Plugins Used:**
- SplashScreen
- StatusBar
- Keyboard
- Haptics
- App (lifecycle)

**Build Process:**
1. Build web assets: `npm run build`
2. Sync to Android: `npx cap sync android`
3. Open Android Studio: `npx cap open android`
4. Build APK/AAB from Android Studio

**Automation Scripts:**
- `android-test.bat` - Windows batch automation
- `android-test.cjs` - Node.js automation script
- `android-test.ps1` - PowerShell automation
- See [ANDROID_QUICK_START.md](ANDROID_QUICK_START.md) for details

## Medical Content Guidelines

**All medical content must be:**
- Evidence-based (cite reputable sources: AHA, ACC, ADA, NICE, IDSA, etc.)
- Accurate and current
- Include proper disclaimers
- Follow established clinical guidelines

**Citations Format:**
```typescript
resources: [
  {
    title: 'Guideline Title',
    type: 'guideline',
    citation: 'Organization. Publication. Year.',
    url: 'https://...' // Optional
  }
]
```

**Disclaimer:** App is for educational/reference purposes only, not for direct patient care. See extensive disclaimer in README.md.

## Build Optimization

**Code Splitting:** [vite.config.ts](vite.config.ts) uses manual chunks:
- `vendor-react`: React core
- `vendor-ui`: UI libraries (Lucide, Headless UI)
- `vendor-charts`: Chart.js
- `vendor-utils`: Date-fns, Zustand
- `vendor-export`: Export libraries (html2canvas, jsPDF, etc.)
- `tools`: Clinical calculators
- `conditions`: Condition data

**Lazy Loading:** Heavy components in App.tsx:
- Dashboard
- ConditionDetail
- PatientManager

## Common Patterns

### Storage
```typescript
import { storageManager } from './utils/storage';

// Save data
storageManager.saveConditionData(conditionId, data);

// Retrieve data
const data = storageManager.getConditionData(conditionId);

// Check first visit
if (storageManager.isFirstVisit()) { ... }
```

### Theme
```typescript
import { useTheme } from './contexts/ThemeContext';

const { theme, toggleTheme } = useTheme();
// theme is 'light' or 'dark'
```

### Clinical Calculations
See [src/utils/ascvd/](src/utils/ascvd/) for example of well-structured calculator with separate concerns:
- `calculateASCVD.ts` - Core calculation logic
- `coefficients.ts` - Clinical coefficients
- `__tests__/ascvd-calculator.test.ts` - Comprehensive tests

## Git Safety Net System

**Location:** `.git-safety-net/` and `scripts/`

Automated workflow management scripts for safe git operations:
- `scripts/work.ps1` - Start new work
- `scripts/done.ps1` - Complete work (commit + push)
- `scripts/status.ps1` - Check status
- `scripts/sync-devices.ps1` - Sync across devices

See [scripts/README.md](scripts/README.md) for details.

## CI/CD Pipeline Details

**Workflow:** [.github/workflows/ci.yml](.github/workflows/ci.yml)

**Stages:**
1. **Lint** - ESLint validation
2. **Test** - Vitest suite + coverage upload to Codecov
3. **Build Web** - Production build + bundle size analysis
4. **Capacitor Sync** - Android sync + cap doctor
5. **Android Build** - Debug APK compilation
6. **Quality Gates** - Validation summary

**Artifacts (downloadable from GitHub Actions):**
- Coverage reports (30 day retention)
- Web build (7 day retention)
- Android debug APK (7 day retention)

## Performance Considerations

- **Bundle size warning limit:** 600KB (configurable in vite.config.ts)
- **Lazy load heavy components** to improve initial load time
- **Use code splitting** for condition data and tools
- **PWA caching** for offline performance

## Troubleshooting

### Android Build Issues
See [ANDROID_TROUBLESHOOTING.md](ANDROID_TROUBLESHOOTING.md)

### Test Failures
- Check Node version (CI uses Node 18)
- Run `npm ci` to ensure clean dependency install
- Check [TESTING_GUIDE.md](TESTING_GUIDE.md) for debugging commands

### PWA Cache Issues
- Increment `cacheId` in vite.config.ts
- Clear browser cache and service workers
- Use `npm run build` to generate new service worker

## Development Workflow

1. **Start work:** `npm run dev`
2. **Make changes** to code
3. **Test changes:** `npm test` (watch mode)
4. **Lint:** `npm run lint` (fix issues)
5. **Build:** `npm run build` (ensure no build errors)
6. **Test production build:** `npm run preview`
7. **For Android:** `npx cap sync android` then test in Android Studio

**Before committing:**
- All tests passing
- No lint errors
- Production build successful
- Manual testing completed (especially for calculators)
