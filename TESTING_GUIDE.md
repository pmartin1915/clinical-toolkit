# Clinical Wizard - Testing Guide

## Overview

This document describes the automated testing framework for Clinical Wizard, implementing the requirement: **"Validate as much as possible with automatic tests in CI"**.

## Test Framework

**Framework**: Vitest 3.2.4
**Test Runner**: Fast, ESM-native test runner
**Coverage Provider**: V8
**Test Environment**: jsdom (browser simulation)

## Test Structure

### Current Test Coverage

```
src/
├── components/
│   ├── tools/__tests__/
│   │   ├── AsthmaControlTest.test.tsx
│   │   ├── COPDAssessment.test.tsx
│   │   └── BasicTest.test.tsx
│   └── ui/__tests__/
│       └── ErrorBoundary.test.tsx
└── utils/__tests__/
    ├── ascvd-calculator.test.ts (NEW)
    ├── egfr-calculator.test.ts (NEW)
    ├── cha2ds2vasc-calculator.test.ts (NEW)
    └── storage.test.ts
```

### Test Categories

#### 1. Clinical Calculator Tests (NEW)

**Location**: `src/utils/__tests__/`

**ASCVD Risk Calculator** (`ascvd-calculator.test.ts`):
- ✅ Input validation (age, cholesterol, blood pressure ranges)
- ✅ Risk calculation accuracy (low, borderline, intermediate, high risk)
- ✅ Risk factors impact (diabetes, smoking, hypertension)
- ✅ Gender differences in risk
- ✅ Race-specific coefficients
- ✅ Treatment recommendations
- ✅ Edge cases and boundary values
- ✅ Lifetime risk calculation

**Total Tests**: 28 comprehensive scenarios

**eGFR Calculator** (`egfr-calculator.test.ts`):
- ✅ CKD-EPI formula accuracy
- ✅ MDRD formula accuracy
- ✅ Gender and race adjustments
- ✅ CKD staging (G1-G5)
- ✅ Age-related decline
- ✅ Clinical scenarios (normal, moderate CKD, severe CKD)
- ✅ Edge cases (extreme creatinine values, elderly patients)
- ✅ Formula comparison

**Total Tests**: 24 test scenarios

**CHA2DS2-VASc Calculator** (`cha2ds2vasc-calculator.test.ts`):
- ✅ Score calculation (0-9 point range)
- ✅ Risk stratification (low, moderate, high)
- ✅ Individual risk factor contributions
- ✅ Treatment recommendations
- ✅ Gender-specific considerations
- ✅ Clinical scenarios (multiple comorbidities, prior stroke)
- ✅ Stroke risk percentages

**Total Tests**: 24 test scenarios

**New Calculator Tests Total**: 76 tests covering critical clinical calculations

#### 2. Component Tests

**UI Components**:
- Error boundary handling
- Modal components
- Interactive assessments

**Clinical Tools**:
- Asthma Control Test
- COPD Assessment
- Form interactions
- Result calculations

#### 3. Integration Tests

- Storage management
- Data persistence
- Patient management workflows

## Running Tests

### Local Development

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Specific Files

```bash
# Test specific file
npm run test:run src/utils/__tests__/ascvd-calculator.test.ts

# Test specific pattern
npm run test:run -- calculator
```

### Coverage Reports

Coverage reports are generated in three formats:
- **Text**: Console output
- **JSON**: `coverage/coverage-final.json`
- **HTML**: `coverage/index.html`

## CI/CD Pipeline

### GitHub Actions Workflow

**File**: `.github/workflows/ci.yml`

### Pipeline Stages

#### 1. Lint (Code Quality)
- Runs ESLint on all code
- Enforces code style standards
- Must pass before tests run

#### 2. Test (Validation)
- Runs complete test suite
- Generates coverage reports
- Uploads to Codecov
- Archives coverage artifacts

#### 3. Build Web
- Builds production bundle
- Verifies build output
- Analyzes bundle size
- Uploads build artifacts

#### 4. Capacitor Sync
- Syncs web assets to Android
- Verifies Android directory structure
- Runs `cap doctor` health check

#### 5. Android Build (Optional)
- Builds debug APK
- Verifies APK creation
- Uploads APK artifact

#### 6. Quality Gates
- Validates all previous stages passed
- Generates pipeline summary
- Blocks merge if any stage fails

### Trigger Conditions

The CI pipeline runs on:
- ✅ Every push to any branch
- ✅ Pull requests to main/master
- ✅ Manual workflow dispatch

### Quality Standards

**Minimum Requirements**:
- ✅ Zero lint errors
- ✅ All tests must pass
- ✅ Successful production build
- ✅ Successful Capacitor sync
- 🎯 Target: 70% code coverage

## Test Configuration

### vitest.config.ts

```typescript
{
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.d.ts',
        '**/*.config.{js,ts}',
        'dist/'
      ]
    }
  }
}
```

### Test Setup (src/test/setup.ts)

Provides:
- Mock storage manager
- Mock localStorage
- Mock window methods (alert, confirm)
- Console error suppression for known warnings

## Writing New Tests

### Clinical Calculator Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('New Calculator', () => {
  describe('Input Validation', () => {
    it('validates required fields', () => {
      // Test input validation
    });

    it('validates ranges', () => {
      // Test min/max values
    });
  });

  describe('Calculation Accuracy', () => {
    it('calculates correctly for known values', () => {
      const result = calculateSomething(input);
      expect(result).toBeCloseTo(expectedValue, precision);
    });
  });

  describe('Clinical Scenarios', () => {
    it('handles typical patient', () => {
      // Test real-world scenario
    });
  });

  describe('Edge Cases', () => {
    it('handles boundary values', () => {
      // Test edge cases
    });
  });
});
```

### Component Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Updated Text')).toBeInTheDocument();
  });
});
```

## Test Best Practices

### 1. Test Structure
- Use descriptive test names
- Group related tests with `describe` blocks
- Follow AAA pattern: Arrange, Act, Assert

### 2. Clinical Accuracy
- Use evidence-based expected values
- Test boundary conditions
- Validate against clinical guidelines
- Document sources for expected values

### 3. Coverage Goals
- **Unit Tests**: All clinical calculators
- **Component Tests**: All interactive components
- **Integration Tests**: Critical user workflows
- **Build Tests**: All build configurations

### 4. Maintenance
- Update tests when calculator logic changes
- Add tests for bug fixes
- Review failing tests before merging
- Keep tests focused and independent

## Continuous Improvement

### Adding More Tests

Priority areas for additional testing:
1. Remaining clinical calculators
2. More UI components
3. Data validation logic
4. API integrations
5. Mobile-specific features

### Coverage Targets

**Current Status**:
- Calculator tests: 76 tests
- Component tests: 12 tests
- Integration tests: 16 tests
- **Total**: 104+ tests

**Target Coverage**:
- Overall: 70%+
- Clinical calculators: 90%+
- UI components: 75%+
- Utilities: 80%+

## Debugging Tests

### Common Issues

**1. Test Fails Locally But Passes in CI**
- Check Node version (CI uses Node 18)
- Clear node_modules and reinstall
- Check for timing issues

**2. Component Not Rendering**
- Verify imports
- Check test setup file
- Ensure mocks are configured

**3. Async Test Failures**
- Use `await` with userEvent actions
- Use `waitFor` for async operations
- Check timeout settings

### Debug Commands

```bash
# Run tests with verbose output
npm run test:run -- --reporter=verbose

# Run single test file in watch mode
npm test -- src/path/to/test.ts

# Run with coverage and open report
npm run test:coverage && open coverage/index.html
```

## CI/CD Dashboard

### Monitoring

**GitHub Actions**: View pipeline status at:
```
https://github.com/[username]/clinical-toolkit/actions
```

**Artifacts**: Download from completed workflows:
- Coverage reports (30 day retention)
- Web build artifacts (7 day retention)
- Android APK (7 day retention)

### Status Badges

Add to README.md:
```markdown
![CI Status](https://github.com/[username]/clinical-toolkit/workflows/Clinical%20Wizard%20CI%2FCD/badge.svg)
```

## Resources

### Documentation
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [GitHub Actions](https://docs.github.com/en/actions)

### Clinical Guidelines
- [ACC/AHA ASCVD Risk Calculator](https://tools.acc.org/ascvd-risk-estimator-plus/)
- [KDIGO CKD Guidelines](https://kdigo.org/)
- [ESC Atrial Fibrillation Guidelines](https://www.escardio.org/)

---

**Last Updated**: November 13, 2025
**Version**: 1.0.0
**Status**: ✅ Active CI/CD Pipeline

---

*Automated testing ensures Clinical Wizard maintains the highest standards of accuracy and reliability for clinical decision support.*
