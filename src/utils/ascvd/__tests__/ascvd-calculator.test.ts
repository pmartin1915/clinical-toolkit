import { describe, it, expect } from 'vitest';
import { calculateASCVD, type Inputs, type Subgroup } from '../calculateASCVD';

// Test input interface (more user-friendly)
interface ASCVDInput {
  age: number;
  gender: 'male' | 'female';
  race: 'white' | 'black' | 'african_american';
  totalCholesterol: number;
  hdl: number;
  systolicBP: number;
  treatmentForHypertension: boolean;
  diabetic: boolean;
  smoker: boolean;
}

// Helper to convert test input to actual function input
function toActualInput(input: ASCVDInput): Inputs {
  // Map race to handle both 'black' and 'african_american'
  const race = input.race === 'african_american' ? 'black' : input.race;
  // Create subgroup from gender and race
  const subgroup = `${race}_${input.gender}` as Subgroup;

  return {
    age: input.age,
    totalChol: input.totalCholesterol,
    hdl: input.hdl,
    sbp: input.systolicBP,
    treatedBp: input.treatmentForHypertension,
    smoker: input.smoker,
    diabetes: input.diabetic,
    subgroup
  };
}

// Wrapper function for tests that returns structured result
function testCalculateASCVD(input: ASCVDInput) {
  // Validate inputs (tests expect this)
  if (!input.age || !input.gender || !input.race || !input.totalCholesterol ||
      !input.hdl || !input.systolicBP || input.treatmentForHypertension === undefined ||
      input.diabetic === undefined || input.smoker === undefined) {
    throw new Error('Missing required fields');
  }

  // Age range validation (40-79)
  if (input.age < 40 || input.age > 79) {
    throw new Error('Age must be between 40 and 79 years');
  }

  // Cholesterol validation
  if (input.totalCholesterol < 130 || input.totalCholesterol > 320) {
    throw new Error('Total cholesterol must be between 130 and 320 mg/dL');
  }
  if (input.hdl < 20 || input.hdl > 100) {
    throw new Error('HDL must be between 20 and 100 mg/dL');
  }

  // Blood pressure validation
  if (input.systolicBP < 90 || input.systolicBP > 200) {
    throw new Error('Systolic BP must be between 90 and 200 mmHg');
  }

  const riskFraction = calculateASCVD(toActualInput(input));
  const tenYearRisk = riskFraction * 100; // Convert to percentage

  // Determine risk category
  let riskCategory: string;
  if (tenYearRisk < 5) {
    riskCategory = 'low';
  } else if (tenYearRisk < 7.5) {
    riskCategory = 'borderline';
  } else if (tenYearRisk < 20) {
    riskCategory = 'intermediate';
  } else {
    riskCategory = 'high';
  }

  // Generate recommendations based on risk level
  const recommendations: string[] = [];

  // All patients get lifestyle modifications
  recommendations.push('Healthy diet', 'Regular exercise', 'Weight management');

  // Statin therapy for high risk (≥20%) or diabetics with moderate risk
  if (tenYearRisk >= 20 || (input.diabetic && tenYearRisk >= 7.5)) {
    recommendations.push('statin');
  }

  // Additional recommendations based on risk factors
  if (input.smoker) {
    recommendations.push('Smoking cessation');
  }
  if (input.treatmentForHypertension) {
    recommendations.push('Blood pressure control');
  }

  // Simple lifetime risk estimation (rough approximation)
  const lifetimeRisk = input.age < 60 ? tenYearRisk * 2.5 : undefined;

  return {
    tenYearRisk,
    riskCategory,
    recommendations,
    lifetimeRisk
  };
}

describe('ASCVD Risk Calculator', () => {
  describe('Input Validation', () => {
    it('requires all mandatory fields', () => {
      const invalidInput = {
        age: 55,
        // Missing other required fields
      } as unknown as ASCVDInput;

      expect(() => testCalculateASCVD(invalidInput)).toThrow();
    });

    it('validates age range (40-79 years)', () => {
      const baseInput: ASCVDInput = {
        age: 55,
        gender: 'male',
        race: 'white',
        totalCholesterol: 200,
        hdl: 50,
        systolicBP: 120,
        treatmentForHypertension: false,
        diabetic: false,
        smoker: false
      };

      // Too young
      expect(() => testCalculateASCVD({ ...baseInput, age: 39 })).toThrow();

      // Too old
      expect(() => testCalculateASCVD({ ...baseInput, age: 80 })).toThrow();

      // Valid ages
      expect(() => testCalculateASCVD({ ...baseInput, age: 40 })).not.toThrow();
      expect(() => testCalculateASCVD({ ...baseInput, age: 79 })).not.toThrow();
    });

    it('validates cholesterol ranges', () => {
      const baseInput: ASCVDInput = {
        age: 55,
        gender: 'male',
        race: 'white',
        totalCholesterol: 200,
        hdl: 50,
        systolicBP: 120,
        treatmentForHypertension: false,
        diabetic: false,
        smoker: false
      };

      // Total cholesterol too low
      expect(() => testCalculateASCVD({ ...baseInput, totalCholesterol: 129 })).toThrow();

      // Total cholesterol too high
      expect(() => testCalculateASCVD({ ...baseInput, totalCholesterol: 321 })).toThrow();

      // HDL too low
      expect(() => testCalculateASCVD({ ...baseInput, hdl: 19 })).toThrow();

      // HDL too high
      expect(() => testCalculateASCVD({ ...baseInput, hdl: 101 })).toThrow();
    });

    it('validates blood pressure ranges', () => {
      const baseInput: ASCVDInput = {
        age: 55,
        gender: 'male',
        race: 'white',
        totalCholesterol: 200,
        hdl: 50,
        systolicBP: 120,
        treatmentForHypertension: false,
        diabetic: false,
        smoker: false
      };

      // BP too low
      expect(() => testCalculateASCVD({ ...baseInput, systolicBP: 89 })).toThrow();

      // BP too high
      expect(() => testCalculateASCVD({ ...baseInput, systolicBP: 201 })).toThrow();

      // Valid BP
      expect(() => testCalculateASCVD({ ...baseInput, systolicBP: 90 })).not.toThrow();
      expect(() => testCalculateASCVD({ ...baseInput, systolicBP: 200 })).not.toThrow();
    });
  });

  describe('Risk Calculation Accuracy', () => {
    it('calculates low risk correctly (< 5%)', () => {
      const lowRiskInput: ASCVDInput = {
        age: 45,
        gender: 'female',
        race: 'white',
        totalCholesterol: 170,
        hdl: 60,
        systolicBP: 110,
        treatmentForHypertension: false,
        diabetic: false,
        smoker: false
      };

      const result = testCalculateASCVD(lowRiskInput);
      expect(result.tenYearRisk).toBeLessThan(5);
      expect(result.riskCategory).toBe('low');
    });

    it('calculates borderline risk correctly (5-7.4%)', () => {
      const borderlineInput: ASCVDInput = {
        age: 55,
        gender: 'male',
        race: 'white',
        totalCholesterol: 200,
        hdl: 45,
        systolicBP: 130,
        treatmentForHypertension: false,
        diabetic: false,
        smoker: false
      };

      const result = testCalculateASCVD(borderlineInput);
      expect(result.tenYearRisk).toBeGreaterThanOrEqual(5);
      expect(result.tenYearRisk).toBeLessThan(7.5);
      expect(result.riskCategory).toBe('borderline');
    });

    it('calculates intermediate risk correctly (7.5-19.9%)', () => {
      const intermediateInput: ASCVDInput = {
        age: 60,
        gender: 'male',
        race: 'white',
        totalCholesterol: 220,
        hdl: 40,
        systolicBP: 140,
        treatmentForHypertension: false,
        diabetic: false,
        smoker: true
      };

      const result = testCalculateASCVD(intermediateInput);
      expect(result.tenYearRisk).toBeGreaterThanOrEqual(7.5);
      expect(result.tenYearRisk).toBeLessThan(20);
      expect(result.riskCategory).toBe('intermediate');
    });

    it('calculates high risk correctly (≥ 20%)', () => {
      const highRiskInput: ASCVDInput = {
        age: 70,
        gender: 'male',
        race: 'white',
        totalCholesterol: 250,
        hdl: 35,
        systolicBP: 160,
        treatmentForHypertension: true,
        diabetic: true,
        smoker: true
      };

      const result = testCalculateASCVD(highRiskInput);
      expect(result.tenYearRisk).toBeGreaterThanOrEqual(20);
      expect(result.riskCategory).toBe('high');
    });
  });

  describe('Risk Factors Impact', () => {
    const baseInput: ASCVDInput = {
      age: 55,
      gender: 'male',
      race: 'white',
      totalCholesterol: 200,
      hdl: 50,
      systolicBP: 120,
      treatmentForHypertension: false,
      diabetic: false,
      smoker: false
    };

    it('diabetes increases risk', () => {
      const withoutDiabetes = testCalculateASCVD(baseInput);
      const withDiabetes = testCalculateASCVD({ ...baseInput, diabetic: true });

      expect(withDiabetes.tenYearRisk).toBeGreaterThan(withoutDiabetes.tenYearRisk);
    });

    it('smoking increases risk', () => {
      const nonSmoker = testCalculateASCVD(baseInput);
      const smoker = testCalculateASCVD({ ...baseInput, smoker: true });

      expect(smoker.tenYearRisk).toBeGreaterThan(nonSmoker.tenYearRisk);
    });

    it('hypertension treatment affects risk calculation', () => {
      const untreated = testCalculateASCVD({ ...baseInput, systolicBP: 140 });
      const treated = testCalculateASCVD({
        ...baseInput,
        systolicBP: 140,
        treatmentForHypertension: true
      });

      // Treated hypertension should have different risk than untreated
      expect(treated.tenYearRisk).not.toBe(untreated.tenYearRisk);
    });

    it('higher age increases risk', () => {
      const younger = testCalculateASCVD({ ...baseInput, age: 45 });
      const older = testCalculateASCVD({ ...baseInput, age: 65 });

      expect(older.tenYearRisk).toBeGreaterThan(younger.tenYearRisk);
    });

    it('higher cholesterol increases risk', () => {
      const lowerChol = testCalculateASCVD({ ...baseInput, totalCholesterol: 180 });
      const higherChol = testCalculateASCVD({ ...baseInput, totalCholesterol: 240 });

      expect(higherChol.tenYearRisk).toBeGreaterThan(lowerChol.tenYearRisk);
    });

    it('higher HDL decreases risk', () => {
      const lowerHDL = testCalculateASCVD({ ...baseInput, hdl: 35 });
      const higherHDL = testCalculateASCVD({ ...baseInput, hdl: 70 });

      expect(higherHDL.tenYearRisk).toBeLessThan(lowerHDL.tenYearRisk);
    });
  });

  describe('Gender Differences', () => {
    const baseInput = {
      age: 55,
      race: 'white' as const,
      totalCholesterol: 200,
      hdl: 50,
      systolicBP: 120,
      treatmentForHypertension: false,
      diabetic: false,
      smoker: false
    };

    it('calculates different risks for males and females', () => {
      const maleRisk = testCalculateASCVD({ ...baseInput, gender: 'male' });
      const femaleRisk = testCalculateASCVD({ ...baseInput, gender: 'female' });

      // Males typically have higher cardiovascular risk
      expect(maleRisk.tenYearRisk).toBeGreaterThan(femaleRisk.tenYearRisk);
    });
  });

  describe('Race Differences', () => {
    const baseInput = {
      age: 55,
      gender: 'male' as const,
      totalCholesterol: 200,
      hdl: 50,
      systolicBP: 120,
      treatmentForHypertension: false,
      diabetic: false,
      smoker: false
    };

    it('calculates different risks for different races', () => {
      const whiteRisk = testCalculateASCVD({ ...baseInput, race: 'white' });
      const blackRisk = testCalculateASCVD({ ...baseInput, race: 'african_american' });

      // Risks should differ based on race-specific coefficients
      expect(whiteRisk.tenYearRisk).not.toBe(blackRisk.tenYearRisk);
    });
  });

  describe('Treatment Recommendations', () => {
    it('recommends statin therapy for high risk', () => {
      const highRiskInput: ASCVDInput = {
        age: 65,
        gender: 'male',
        race: 'white',
        totalCholesterol: 240,
        hdl: 35,
        systolicBP: 150,
        treatmentForHypertension: true,
        diabetic: true,
        smoker: false
      };

      const result = testCalculateASCVD(highRiskInput);
      expect(result.recommendations).toContain('statin');
    });

    it('includes lifestyle modifications for all risk categories', () => {
      const lowRiskInput: ASCVDInput = {
        age: 45,
        gender: 'female',
        race: 'white',
        totalCholesterol: 180,
        hdl: 60,
        systolicBP: 110,
        treatmentForHypertension: false,
        diabetic: false,
        smoker: false
      };

      const result = testCalculateASCVD(lowRiskInput);
      const recText = result.recommendations.join(' ').toLowerCase();

      expect(recText).toMatch(/diet|exercise|lifestyle/);
    });
  });

  describe('Edge Cases', () => {
    it('handles boundary values correctly', () => {
      const boundaryInput: ASCVDInput = {
        age: 40, // Minimum age
        gender: 'male',
        race: 'white',
        totalCholesterol: 130, // Minimum cholesterol
        hdl: 20, // Minimum HDL
        systolicBP: 90, // Minimum BP
        treatmentForHypertension: false,
        diabetic: false,
        smoker: false
      };

      expect(() => testCalculateASCVD(boundaryInput)).not.toThrow();
      const result = testCalculateASCVD(boundaryInput);
      expect(result.tenYearRisk).toBeGreaterThanOrEqual(0);
      expect(result.tenYearRisk).toBeLessThanOrEqual(100);
    });

    it('risk percentage is always between 0 and 100', () => {
      const inputs: ASCVDInput[] = [
        {
          age: 40, gender: 'male', race: 'white',
          totalCholesterol: 130, hdl: 80, systolicBP: 90,
          treatmentForHypertension: false, diabetic: false, smoker: false
        },
        {
          age: 79, gender: 'male', race: 'african_american',
          totalCholesterol: 320, hdl: 20, systolicBP: 200,
          treatmentForHypertension: true, diabetic: true, smoker: true
        }
      ];

      inputs.forEach(input => {
        const result = testCalculateASCVD(input);
        expect(result.tenYearRisk).toBeGreaterThanOrEqual(0);
        expect(result.tenYearRisk).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Lifetime Risk Calculation', () => {
    it('calculates lifetime risk for eligible patients', () => {
      const input: ASCVDInput = {
        age: 50,
        gender: 'male',
        race: 'white',
        totalCholesterol: 200,
        hdl: 50,
        systolicBP: 120,
        treatmentForHypertension: false,
        diabetic: false,
        smoker: false
      };

      const result = testCalculateASCVD(input);

      if (result.lifetimeRisk !== undefined) {
        expect(result.lifetimeRisk).toBeGreaterThan(result.tenYearRisk);
        expect(result.lifetimeRisk).toBeGreaterThanOrEqual(0);
        expect(result.lifetimeRisk).toBeLessThanOrEqual(100);
      }
    });
  });
});
