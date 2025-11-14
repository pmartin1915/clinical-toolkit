import { describe, it, expect } from 'vitest';

// eGFR calculation functions
function calculateCKDEPI(creatinine: number, age: number, gender: 'male' | 'female', race: 'african_american' | 'other'): number {
  const kappa = gender === 'female' ? 0.7 : 0.9;
  const alpha = gender === 'female' ? -0.329 : -0.411;
  const minRatio = Math.min(creatinine / kappa, 1);
  const maxRatio = Math.max(creatinine / kappa, 1);

  let egfr = 141 * Math.pow(minRatio, alpha) * Math.pow(maxRatio, -1.209) * Math.pow(0.993, age);

  if (gender === 'female') {
    egfr *= 1.018;
  }

  if (race === 'african_american') {
    egfr *= 1.159;
  }

  return Math.round(egfr);
}

function calculateMDRD(creatinine: number, age: number, gender: 'male' | 'female', race: 'african_american' | 'other'): number {
  let egfr = 175 * Math.pow(creatinine, -1.154) * Math.pow(age, -0.203);

  if (gender === 'female') {
    egfr *= 0.742;
  }

  if (race === 'african_american') {
    egfr *= 1.212;
  }

  return Math.round(egfr);
}

function getCKDStage(egfr: number): { stage: string; description: string } {
  if (egfr >= 90) {
    return { stage: 'G1', description: 'Normal or high kidney function' };
  } else if (egfr >= 60) {
    return { stage: 'G2', description: 'Mildly decreased kidney function' };
  } else if (egfr >= 45) {
    return { stage: 'G3a', description: 'Mild to moderate decrease in kidney function' };
  } else if (egfr >= 30) {
    return { stage: 'G3b', description: 'Moderate to severe decrease in kidney function' };
  } else if (egfr >= 15) {
    return { stage: 'G4', description: 'Severe decrease in kidney function' };
  } else {
    return { stage: 'G5', description: 'Kidney failure' };
  }
}

describe('eGFR Calculator', () => {
  describe('CKD-EPI Formula', () => {
    it('calculates normal kidney function correctly', () => {
      const egfr = calculateCKDEPI(0.9, 30, 'male', 'other');
      expect(egfr).toBeGreaterThan(90);
    });

    it('calculates decreased kidney function', () => {
      const egfr = calculateCKDEPI(2.5, 70, 'male', 'other');
      expect(egfr).toBeLessThan(60);
    });

    it('applies gender-specific calculation', () => {
      const maleEgfr = calculateCKDEPI(1.2, 55, 'male', 'other');
      const femaleEgfr = calculateCKDEPI(1.2, 55, 'female', 'other');

      // Calculations differ based on gender (different kappa and alpha values)
      expect(maleEgfr).not.toBe(femaleEgfr);
      expect(maleEgfr).toBeGreaterThan(0);
      expect(femaleEgfr).toBeGreaterThan(0);
    });

    it('adjusts for African American race', () => {
      const otherRaceEgfr = calculateCKDEPI(1.2, 55, 'male', 'other');
      const africanAmericanEgfr = calculateCKDEPI(1.2, 55, 'male', 'african_american');

      expect(africanAmericanEgfr).toBeGreaterThan(otherRaceEgfr);
    });

    it('decreases with age', () => {
      const youngerEgfr = calculateCKDEPI(1.0, 30, 'male', 'other');
      const olderEgfr = calculateCKDEPI(1.0, 70, 'male', 'other');

      expect(olderEgfr).toBeLessThan(youngerEgfr);
    });

    it('decreases with higher creatinine', () => {
      const lowerCreat = calculateCKDEPI(0.8, 50, 'male', 'other');
      const higherCreat = calculateCKDEPI(2.0, 50, 'male', 'other');

      expect(higherCreat).toBeLessThan(lowerCreat);
    });
  });

  describe('MDRD Formula', () => {
    it('calculates eGFR for typical patient', () => {
      const egfr = calculateMDRD(1.0, 50, 'male', 'other');
      expect(egfr).toBeGreaterThan(0);
      expect(egfr).toBeLessThan(200);
    });

    it('adjusts for female gender', () => {
      const maleEgfr = calculateMDRD(1.2, 55, 'male', 'other');
      const femaleEgfr = calculateMDRD(1.2, 55, 'female', 'other');

      expect(femaleEgfr).toBeLessThan(maleEgfr);
    });

    it('adjusts for African American race', () => {
      const otherRaceEgfr = calculateMDRD(1.2, 55, 'male', 'other');
      const africanAmericanEgfr = calculateMDRD(1.2, 55, 'male', 'african_american');

      expect(africanAmericanEgfr).toBeGreaterThan(otherRaceEgfr);
    });
  });

  describe('CKD Staging', () => {
    it('classifies G1 (normal) correctly', () => {
      const stage = getCKDStage(95);
      expect(stage.stage).toBe('G1');
      expect(stage.description).toContain('Normal');
    });

    it('classifies G2 (mildly decreased) correctly', () => {
      const stage = getCKDStage(75);
      expect(stage.stage).toBe('G2');
      expect(stage.description).toContain('Mildly');
    });

    it('classifies G3a (mild to moderate) correctly', () => {
      const stage = getCKDStage(50);
      expect(stage.stage).toBe('G3a');
      expect(stage.description).toContain('Mild to moderate');
    });

    it('classifies G3b (moderate to severe) correctly', () => {
      const stage = getCKDStage(35);
      expect(stage.stage).toBe('G3b');
      expect(stage.description).toContain('Moderate to severe');
    });

    it('classifies G4 (severe) correctly', () => {
      const stage = getCKDStage(20);
      expect(stage.stage).toBe('G4');
      expect(stage.description).toContain('Severe');
    });

    it('classifies G5 (kidney failure) correctly', () => {
      const stage = getCKDStage(10);
      expect(stage.stage).toBe('G5');
      expect(stage.description).toContain('failure');
    });
  });

  describe('Clinical Scenarios', () => {
    it('identifies normal kidney function in young healthy patient', () => {
      const egfr = calculateCKDEPI(0.9, 25, 'male', 'other');
      const stage = getCKDStage(egfr);

      expect(egfr).toBeGreaterThan(90);
      expect(stage.stage).toBe('G1');
    });

    it('identifies moderate CKD in elderly patient', () => {
      const egfr = calculateCKDEPI(1.5, 75, 'female', 'other');
      const stage = getCKDStage(egfr);

      expect(egfr).toBeLessThan(60);
      expect(['G3a', 'G3b', 'G4', 'G5']).toContain(stage.stage);
    });

    it('identifies severe CKD requiring nephrology referral', () => {
      const egfr = calculateCKDEPI(3.5, 65, 'male', 'other');
      const stage = getCKDStage(egfr);

      expect(egfr).toBeLessThan(30);
      expect(['G4', 'G5']).toContain(stage.stage);
    });
  });

  describe('Edge Cases', () => {
    it('handles very low creatinine', () => {
      const egfr = calculateCKDEPI(0.5, 30, 'female', 'other');
      expect(egfr).toBeGreaterThan(0);
      expect(egfr).toBeLessThan(200);
    });

    it('handles very high creatinine', () => {
      const egfr = calculateCKDEPI(8.0, 60, 'male', 'other');
      expect(egfr).toBeGreaterThan(0);
      expect(egfr).toBeLessThan(30);
    });

    it('handles elderly patients', () => {
      const egfr = calculateCKDEPI(1.2, 90, 'female', 'other');
      expect(egfr).toBeGreaterThan(0);
      expect(egfr).toBeLessThan(150);
    });

    it('handles young adults', () => {
      const egfr = calculateCKDEPI(1.0, 18, 'male', 'other');
      expect(egfr).toBeGreaterThan(0);
      expect(egfr).toBeLessThan(200);
    });
  });

  describe('Formula Comparison', () => {
    it('CKD-EPI and MDRD produce similar results', () => {
      const ckdEpiResult = calculateCKDEPI(1.2, 60, 'male', 'other');
      const mdrdResult = calculateMDRD(1.2, 60, 'male', 'other');

      // Results should be within 20% of each other
      const difference = Math.abs(ckdEpiResult - mdrdResult);
      const average = (ckdEpiResult + mdrdResult) / 2;
      const percentDifference = (difference / average) * 100;

      expect(percentDifference).toBeLessThan(20);
    });

    it('both formulas identify severe CKD', () => {
      const creatinine = 4.0;
      const age = 70;
      const gender = 'male';
      const race = 'other';

      const ckdEpiResult = calculateCKDEPI(creatinine, age, gender, race);
      const mdrdResult = calculateMDRD(creatinine, age, gender, race);

      const ckdEpiStage = getCKDStage(ckdEpiResult);
      const mdrdStage = getCKDStage(mdrdResult);

      // Both should identify severe disease
      expect(ckdEpiResult).toBeLessThan(30);
      expect(mdrdResult).toBeLessThan(30);
      expect(['G4', 'G5']).toContain(ckdEpiStage.stage);
      expect(['G4', 'G5']).toContain(mdrdStage.stage);
    });
  });
});
