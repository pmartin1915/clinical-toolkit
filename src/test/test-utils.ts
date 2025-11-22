/**
 * TEST UTILITIES FOR CLINICAL TOOLKIT
 *
 * Helper functions for creating test data, mocking patients,
 * and validating clinical calculations
 */

export interface TestPatient {
  age: number;
  sex: 'male' | 'female';
  race?: 'white' | 'black' | 'other';
  conditions?: string[];
  medications?: string[];
}

/**
 * Generate realistic test patient data
 */
export function createTestPatient(overrides: Partial<TestPatient> = {}): TestPatient {
  return {
    age: 55,
    sex: 'male',
    race: 'white',
    conditions: [],
    medications: [],
    ...overrides
  };
}

/**
 * Generate test data for GAD-7 assessment
 */
export function createGAD7Responses(severity: 'minimal' | 'mild' | 'moderate' | 'severe'): number[] {
  const patterns = {
    minimal: [0, 0, 0, 1, 0, 0, 0],  // Score: 1
    mild: [1, 1, 1, 1, 1, 1, 1],      // Score: 7
    moderate: [2, 2, 2, 2, 1, 1, 2],  // Score: 12
    severe: [3, 3, 3, 3, 2, 2, 2]     // Score: 18
  };
  return patterns[severity];
}

/**
 * Generate test data for PHQ-9 assessment
 */
export function createPHQ9Responses(
  severity: 'minimal' | 'mild' | 'moderate' | 'moderately severe' | 'severe',
  suicideRisk = false
): number[] {
  const patterns = {
    minimal: [0, 0, 0, 1, 0, 0, 0, 0, 0],           // Score: 1
    mild: [1, 1, 1, 1, 1, 0, 1, 0, 0],              // Score: 6
    moderate: [2, 2, 2, 1, 1, 1, 1, 1, 1],          // Score: 12
    'moderately severe': [2, 2, 3, 2, 2, 2, 2, 1, 1], // Score: 17
    severe: [3, 3, 3, 3, 2, 2, 2, 2, 2]             // Score: 22
  };

  const responses = patterns[severity];

  // Override question 9 if suicide risk should be present
  if (suicideRisk) {
    responses[8] = 2; // Set Q9 to "More than half the days"
  }

  return responses;
}

/**
 * Generate ASCVD test patient
 */
export function createASCVDPatient(riskLevel: 'low' | 'intermediate' | 'high') {
  const profiles = {
    low: {
      age: 45,
      sex: 'male' as const,
      race: 'white' as const,
      totalCholesterol: 180,
      hdl: 50,
      systolicBP: 120,
      treatedForBP: false,
      diabetes: false,
      smoker: false
    },
    intermediate: {
      age: 55,
      sex: 'male' as const,
      race: 'white' as const,
      totalCholesterol: 213,
      hdl: 46,
      systolicBP: 140,
      treatedForBP: true,
      diabetes: false,
      smoker: false
    },
    high: {
      age: 65,
      sex: 'male' as const,
      race: 'white' as const,
      totalCholesterol: 240,
      hdl: 35,
      systolicBP: 150,
      treatedForBP: true,
      diabetes: true,
      smoker: true
    }
  };

  return profiles[riskLevel];
}

/**
 * Validate that a number is within clinical tolerance
 */
export function isWithinClinicalTolerance(
  actual: number,
  expected: number,
  tolerance: number = 0.1
): boolean {
  return Math.abs(actual - expected) <= tolerance;
}

/**
 * Format clinical test failure message
 */
export function formatClinicalError(
  calculator: string,
  inputs: Record<string, any>,
  expected: any,
  actual: any,
  reference: string,
  suggestions: string[]
): string {
  const lines = [
    `\n❌ ${calculator} Failed`,
    `\n📥 Inputs:`,
    JSON.stringify(inputs, null, 2),
    `\n✓ Expected: ${JSON.stringify(expected)}`,
    `✗ Actual: ${JSON.stringify(actual)}`,
    `\n📚 Reference: ${reference}`,
    `\n💡 Possible Issues:`,
    ...suggestions.map((s, i) => `   ${i + 1}. ${s}`)
  ];

  return lines.join('\n');
}

/**
 * Generate comprehensive A1C test data
 */
export function getA1CReferenceData() {
  return [
    { a1c: 5.0, glucose: 97, clinical: 'Normal glucose tolerance' },
    { a1c: 5.7, glucose: 117, clinical: 'Prediabetes threshold' },
    { a1c: 6.0, glucose: 126, clinical: 'Diabetes diagnostic threshold' },
    { a1c: 6.5, glucose: 140, clinical: 'Diabetes confirmed' },
    { a1c: 7.0, glucose: 154, clinical: 'ADA treatment target' },
    { a1c: 8.0, glucose: 183, clinical: 'Above target, intensify' },
    { a1c: 9.0, glucose: 212, clinical: 'Poor control' },
    { a1c: 10.0, glucose: 240, clinical: 'Very poor control' },
  ];
}

/**
 * Blood pressure classification helper
 */
export function classifyBloodPressure(systolic: number, diastolic: number): string {
  if (systolic < 120 && diastolic < 80) return 'Normal';
  if (systolic < 130 && diastolic < 80) return 'Elevated';
  if ((systolic >= 130 && systolic < 140) || (diastolic >= 80 && diastolic < 90)) {
    return 'Stage 1 Hypertension';
  }
  if (systolic >= 140 || diastolic >= 90) return 'Stage 2 Hypertension';
  if (systolic >= 180 || diastolic >= 120) return 'Hypertensive Crisis';
  return 'Unknown';
}

/**
 * Validate calculator input ranges
 */
export const validationRanges = {
  age: { min: 0, max: 120 },
  a1c: { min: 4, max: 15 },
  glucose: { min: 40, max: 600 },
  systolicBP: { min: 60, max: 250 },
  diastolicBP: { min: 40, max: 150 },
  totalCholesterol: { min: 100, max: 400 },
  hdl: { min: 20, max: 100 },
  ldl: { min: 40, max: 300 },
  triglycerides: { min: 50, max: 1000 }
};

/**
 * Check if value is in valid clinical range
 */
export function isInValidRange(
  value: number,
  parameter: keyof typeof validationRanges
): boolean {
  const range = validationRanges[parameter];
  return value >= range.min && value <= range.max;
}

/**
 * Mock clinical guideline references
 */
export const clinicalReferences = {
  a1c: {
    source: 'American Diabetes Association',
    year: 2008,
    citation: 'Nathan DM, et al. Diabetes Care. 2008;31(8):1473-1478',
    url: 'https://doi.org/10.2337/dc08-0545'
  },
  ascvd: {
    source: 'ACC/AHA',
    year: 2013,
    citation: 'Goff DC Jr, et al. Circulation. 2014;129(25 Suppl 2):S49-73',
    url: 'https://doi.org/10.1161/01.cir.0000437738.63853.7a'
  },
  gad7: {
    source: 'Archives of Internal Medicine',
    year: 2006,
    citation: 'Spitzer RL, et al. Arch Intern Med. 2006;166(10):1092-1097',
    url: 'https://doi.org/10.1001/archinte.166.10.1092'
  },
  phq9: {
    source: 'Journal of General Internal Medicine',
    year: 2001,
    citation: 'Kroenke K, et al. J Gen Intern Med. 2001;16(9):606-613',
    url: 'https://doi.org/10.1046/j.1525-1497.2001.016009606.x'
  },
  hypertension: {
    source: 'ACC/AHA',
    year: 2017,
    citation: '2017 ACC/AHA Hypertension Guidelines',
    url: 'https://doi.org/10.1161/HYP.0000000000000065'
  }
};

/**
 * Generate test suite metadata for reporter
 */
export function createTestMetadata(
  calculator: string,
  inputs: Record<string, any>,
  expected: any,
  reference: keyof typeof clinicalReferences,
  suggestions: string[]
) {
  return {
    calculator,
    inputs,
    expected,
    reference: `${clinicalReferences[reference].source} (${clinicalReferences[reference].year})`,
    suggestions
  };
}
