import { describe, it, expect } from 'vitest';
import { calculateASCVD } from '../calculator';
import type { ASCVDInput } from '../types';

describe('ASCVD Risk Calculator', () => {
  describe('Input Validation', () => {
    it('requires all mandatory fields', () => {
      const invalidInput = {
        age: 55,
        // Missing other required fields
      } as any;

      expect(() => calculateASCVD(invalidInput)).toThrow();
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
      expect(() => calculateASCVD({ ...baseInput, age: 39 })).toThrow();

      // Too old
      expect(() => calculateASCVD({ ...baseInput, age: 80 })).toThrow();

      // Valid ages
      expect(() => calculateASCVD({ ...baseInput, age: 40 })).not.toThrow();
      expect(() => calculateASCVD({ ...baseInput, age: 79 })).not.toThrow();
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
      expect(() => calculateASCVD({ ...baseInput, totalCholesterol: 129 })).toThrow();

      // Total cholesterol too high
      expect(() => calculateASCVD({ ...baseInput, totalCholesterol: 321 })).toThrow();

      // HDL too low
      expect(() => calculateASCVD({ ...baseInput, hdl: 19 })).toThrow();

      // HDL too high
      expect(() => calculateASCVD({ ...baseInput, hdl: 101 })).toThrow();
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
      expect(() => calculateASCVD({ ...baseInput, systolicBP: 89 })).toThrow();

      // BP too high
      expect(() => calculateASCVD({ ...baseInput, systolicBP: 201 })).toThrow();

      // Valid BP
      expect(() => calculateASCVD({ ...baseInput, systolicBP: 90 })).not.toThrow();
      expect(() => calculateASCVD({ ...baseInput, systolicBP: 200 })).not.toThrow();
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

      const result = calculateASCVD(lowRiskInput);
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

      const result = calculateASCVD(borderlineInput);
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

      const result = calculateASCVD(intermediateInput);
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

      const result = calculateASCVD(highRiskInput);
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
      const withoutDiabetes = calculateASCVD(baseInput);
      const withDiabetes = calculateASCVD({ ...baseInput, diabetic: true });

      expect(withDiabetes.tenYearRisk).toBeGreaterThan(withoutDiabetes.tenYearRisk);
    });

    it('smoking increases risk', () => {
      const nonSmoker = calculateASCVD(baseInput);
      const smoker = calculateASCVD({ ...baseInput, smoker: true });

      expect(smoker.tenYearRisk).toBeGreaterThan(nonSmoker.tenYearRisk);
    });

    it('hypertension treatment affects risk calculation', () => {
      const untreated = calculateASCVD({ ...baseInput, systolicBP: 140 });
      const treated = calculateASCVD({
        ...baseInput,
        systolicBP: 140,
        treatmentForHypertension: true
      });

      // Treated hypertension should have different risk than untreated
      expect(treated.tenYearRisk).not.toBe(untreated.tenYearRisk);
    });

    it('higher age increases risk', () => {
      const younger = calculateASCVD({ ...baseInput, age: 45 });
      const older = calculateASCVD({ ...baseInput, age: 65 });

      expect(older.tenYearRisk).toBeGreaterThan(younger.tenYearRisk);
    });

    it('higher cholesterol increases risk', () => {
      const lowerChol = calculateASCVD({ ...baseInput, totalCholesterol: 180 });
      const higherChol = calculateASCVD({ ...baseInput, totalCholesterol: 240 });

      expect(higherChol.tenYearRisk).toBeGreaterThan(lowerChol.tenYearRisk);
    });

    it('higher HDL decreases risk', () => {
      const lowerHDL = calculateASCVD({ ...baseInput, hdl: 35 });
      const higherHDL = calculateASCVD({ ...baseInput, hdl: 70 });

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
      const maleRisk = calculateASCVD({ ...baseInput, gender: 'male' });
      const femaleRisk = calculateASCVD({ ...baseInput, gender: 'female' });

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
      const whiteRisk = calculateASCVD({ ...baseInput, race: 'white' });
      const blackRisk = calculateASCVD({ ...baseInput, race: 'african_american' });

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

      const result = calculateASCVD(highRiskInput);
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

      const result = calculateASCVD(lowRiskInput);
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

      expect(() => calculateASCVD(boundaryInput)).not.toThrow();
      const result = calculateASCVD(boundaryInput);
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
        const result = calculateASCVD(input);
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

      const result = calculateASCVD(input);

      if (result.lifetimeRisk !== undefined) {
        expect(result.lifetimeRisk).toBeGreaterThan(result.tenYearRisk);
        expect(result.lifetimeRisk).toBeGreaterThanOrEqual(0);
        expect(result.lifetimeRisk).toBeLessThanOrEqual(100);
      }
    });
  });
});
