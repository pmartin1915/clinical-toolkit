# Clinical Toolkit Architecture

## Overview

Clinical Toolkit is a Progressive Web App (PWA) and Android mobile application providing evidence-based clinical reference tools. The application is designed for offline-first functionality with a condition-centric architecture.

## Architecture Layers

### 1. Data Layer (`/src/data/conditions/`)

Each medical condition is a self-contained module exporting a `Condition` object:

```
src/data/conditions/
├── hypertension.ts     # HTN guidelines, ASCVD calculator
├── diabetes.ts         # T2DM management, A1C conversion
├── heart-failure.ts    # HF classification, monitoring
├── copd.ts            # COPD assessment, staging
└── ... (12+ conditions)
```

**Condition Interface:**
- `id`: Unique identifier (kebab-case)
- `category`: cardiovascular, endocrine, mental-health, infectious, metabolic, orthopedic
- `overview`: Definition, prevalence, key points
- `guidelines`: Diagnosis criteria, treatment options
- `tools`: Array of interactive tools (calculators, assessments)
- `resources`: Citations and references

### 2. UI Layer

**Pages (`/src/pages/`):**
- `Dashboard.tsx` - Condition cards with search/filter
- `ConditionDetail.tsx` - Tabbed condition view (Overview, Guidelines, Tools, Resources)
- `PatientManager.tsx` - Patient data management

**Components (`/src/components/`):**
- `layout/` - Header, Footer, Navigation
- `ui/` - Reusable UI primitives
- `tools/` - Clinical calculator components (20+ tools)

**Tool Rendering:**
Tools are dynamically rendered in ConditionDetail based on the `component` field in the tool definition:
```typescript
case 'ASCVDCalculator':
  return <ASCVDCalculator />;
case 'BMICalculator':
  return <BMICalculator />;
```

### 3. State Management

**Local State:** React hooks for component-level state
**Persistence:** localStorage via `src/utils/storage.ts`
**Encrypted Storage:** Sensitive data via `@healthcare-apps/core`:
```typescript
import { EncryptedStorage } from '@healthcare-apps/core';
const storage = new EncryptedStorage('clinical-toolkit-key');
```

### 4. Core Services (`/src/core/`)

- `encryptedStorage.ts` - Secure data wrapper (uses @healthcare-apps/core)
- `errorHandling.ts` - Error capture and logging
- `safety.ts` - Clinical safety disclaimers
- `sessionManager.ts` - Session lifecycle management

## Data Flow

```
User Input → Form Validation → Component State → localStorage/EncryptedStorage
     ↓
Service Worker Cache ← PWA Manifest
```

## PWA Architecture

### Service Worker
- **Plugin:** VitePWA in `vite.config.ts`
- **Cache ID:** `clinical-toolkit-v1`
- **Strategy:** Offline-first with network fallback

### Manifest Configuration
- **App Name:** "Clinical Toolkit"
- **Theme Color:** #0ea5e9 (primary blue)
- **Display:** standalone
- **Scope:** `/clinical-toolkit/`

### Update Flow
1. Service worker detects new version
2. User prompted to refresh
3. Cache invalidated and replaced

## Mobile Architecture (Capacitor)

### Configuration
```typescript
// capacitor.config.ts
{
  appId: 'com.perrymartin.clinicalwizard',
  appName: 'Clinical Toolkit',
  webDir: 'dist',
  plugins: { SplashScreen, StatusBar, Keyboard, Haptics, App }
}
```

### Build Process
1. `npm run build` - Vite production build
2. `npx cap sync android` - Sync web assets
3. Android Studio - Build APK/AAB

## Testing Strategy

### Unit Tests (Vitest)
- **321 tests passing**
- Domain logic: `src/utils/__tests__/`
- Components: `src/components/**/__tests__/`
- Coverage: 85%+ target

### E2E Tests (Playwright)
- 3 viewports: Mobile, Tablet, Desktop
- Visual regression baselines
- Critical user flows

### CI/CD Pipeline (GitHub Actions)
1. Lint → 2. Test → 3. Build → 4. Capacitor Sync → 5. Android Build → 6. Quality Gates

## Security

### Encryption
- **Algorithm:** AES-256-GCM
- **Key Derivation:** PBKDF2 (600,000 iterations)
- **Implementation:** `@healthcare-apps/core`

### Data Handling
- No PHI transmission over network
- Local storage only
- Encrypted sensitive fields
- Audit logging enabled

### Quality Gates
All deployments require:
- 0 lint errors
- All tests passing
- Successful production build
- Successful Capacitor sync

## Build Optimization

### Code Splitting (`vite.config.ts`)
```javascript
manualChunks: {
  'vendor-react': ['react', 'react-dom'],
  'vendor-ui': ['lucide-react', '@headlessui/react'],
  'vendor-charts': ['chart.js'],
  'tools': [/* calculator components */],
  'conditions': [/* condition data */]
}
```

### Lazy Loading
- Dashboard, ConditionDetail, PatientManager loaded on demand
- Route-based code splitting

### Bundle Limits
- Warning threshold: 600KB per chunk

## Related Documentation

- [CLAUDE.md](../CLAUDE.md) - AI assistant guidance
- [TESTING_GUIDE.md](../TESTING_GUIDE.md) - Testing procedures
- [ANDROID_QUICK_START.md](../ANDROID_QUICK_START.md) - Android development
