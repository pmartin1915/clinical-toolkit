import { describe, it, expect } from 'vitest';

// CHA2DS2-VASc calculation
interface CHA2DS2VAScInput {
  age: number;
  gender: 'male' | 'female';
  congestiveHeartFailure: boolean;
  hypertension: boolean;
  stroke: boolean;
  vascularDisease: boolean;
  diabetes: boolean;
}

function calculateCHA2DS2VASc(input: CHA2DS2VAScInput): {
  score: number;
  riskCategory: string;
  strokeRiskPercent: number;
  recommendations: string[];
} {
  let score = 0;

  // Age
  if (input.age >= 75) {
    score += 2;
  } else if (input.age >= 65) {
    score += 1;
  }

  // Female gender
  if (input.gender === 'female') {
    score += 1;
  }

  // CHF
  if (input.congestiveHeartFailure) {
    score += 1;
  }

  // Hypertension
  if (input.hypertension) {
    score += 1;
  }

  // Stroke/TIA/Thromboembolism
  if (input.stroke) {
    score += 2;
  }

  // Vascular disease
  if (input.vascularDisease) {
    score += 1;
  }

  // Diabetes
  if (input.diabetes) {
    score += 1;
  }

  // Risk categorization
  let riskCategory: string;
  let strokeRiskPercent: number;
  let recommendations: string[];

  if (score === 0) {
    riskCategory = 'Low';
    strokeRiskPercent = 0;
    recommendations = ['No anticoagulation recommended', 'Aspirin may be considered'];
  } else if (score === 1 && input.gender === 'male') {
    riskCategory = 'Low';
    strokeRiskPercent = 1.3;
    recommendations = ['Consider anticoagulation or aspirin', 'Discuss risks and benefits with patient'];
  } else if (score === 1) {
    // Female with no other risk factors
    riskCategory = 'Low';
    strokeRiskPercent = 0;
    recommendations = ['No anticoagulation recommended based on gender alone'];
  } else {
    riskCategory = 'Moderate to High';
    // Approximate stroke risk based on score
    strokeRiskPercent = [0, 1.3, 2.2, 3.2, 4.0, 6.7, 9.8, 9.6, 6.7, 15.2][Math.min(score, 9)] || 15.2;
    recommendations = [
      'Oral anticoagulation recommended',
      'Consider warfarin or DOAC (apixaban, rivaroxaban, edoxaban, dabigatran)',
      'Regular monitoring required'
    ];
  }

  return {
    score,
    riskCategory,
    strokeRiskPercent,
    recommendations
  };
}

describe('CHA2DS2-VASc Calculator', () => {
  describe('Score Calculation', () => {
    it('calculates score of 0 for low-risk young male', () => {
      const result = calculateCHA2DS2VASc({
        age: 50,
        gender: 'male',
        congestiveHeartFailure: false,
        hypertension: false,
        stroke: false,
        vascularDisease: false,
        diabetes: false
      });

      expect(result.score).toBe(0);
      expect(result.riskCategory).toBe('Low');
    });

    it('calculates score of 1 for young female with no other risks', () => {
      const result = calculateCHA2DS2VASc({
        age: 50,
        gender: 'female',
        congestiveHeartFailure: false,
        hypertension: false,
        stroke: false,
        vascularDisease: false,
        diabetes: false
      });

      expect(result.score).toBe(1);
      expect(result.riskCategory).toBe('Low');
    });

    it('adds 2 points for age >= 75', () => {
      const result = calculateCHA2DS2VASc({
        age: 76,
        gender: 'male',
        congestiveHeartFailure: false,
        hypertension: false,
        stroke: false,
        vascularDisease: false,
        diabetes: false
      });

      expect(result.score).toBe(2);
    });

    it('adds 1 point for age 65-74', () => {
      const result = calculateCHA2DS2VASc({
        age: 70,
        gender: 'male',
        congestiveHeartFailure: false,
        hypertension: false,
        stroke: false,
        vascularDisease: false,
        diabetes: false
      });

      expect(result.score).toBe(1);
    });

    it('adds 2 points for prior stroke', () => {
      const result = calculateCHA2DS2VASc({
        age: 50,
        gender: 'male',
        congestiveHeartFailure: false,
        hypertension: false,
        stroke: true,
        vascularDisease: false,
        diabetes: false
      });

      expect(result.score).toBe(2);
    });

    it('adds 1 point for CHF', () => {
      const result = calculateCHA2DS2VASc({
        age: 50,
        gender: 'male',
        congestiveHeartFailure: true,
        hypertension: false,
        stroke: false,
        vascularDisease: false,
        diabetes: false
      });

      expect(result.score).toBe(1);
    });

    it('adds 1 point for hypertension', () => {
      const result = calculateCHA2DS2VASc({
        age: 50,
        gender: 'male',
        congestiveHeartFailure: false,
        hypertension: true,
        stroke: false,
        vascularDisease: false,
        diabetes: false
      });

      expect(result.score).toBe(1);
    });

    it('adds 1 point for vascular disease', () => {
      const result = calculateCHA2DS2VASc({
        age: 50,
        gender: 'male',
        congestiveHeartFailure: false,
        hypertension: false,
        stroke: false,
        vascularDisease: true,
        diabetes: false
      });

      expect(result.score).toBe(1);
    });

    it('adds 1 point for diabetes', () => {
      const result = calculateCHA2DS2VASc({
        age: 50,
        gender: 'male',
        congestiveHeartFailure: false,
        hypertension: false,
        stroke: false,
        vascularDisease: false,
        diabetes: true
      });

      expect(result.score).toBe(1);
    });
  });

  describe('Risk Stratification', () => {
    it('identifies low risk (score 0)', () => {
      const result = calculateCHA2DS2VASc({
        age: 55,
        gender: 'male',
        congestiveHeartFailure: false,
        hypertension: false,
        stroke: false,
        vascularDisease: false,
        diabetes: false
      });

      expect(result.riskCategory).toBe('Low');
      expect(result.strokeRiskPercent).toBe(0);
    });

    it('identifies moderate to high risk (score >= 2)', () => {
      const result = calculateCHA2DS2VASc({
        age: 70,
        gender: 'male',
        congestiveHeartFailure: true,
        hypertension: false,
        stroke: false,
        vascularDisease: false,
        diabetes: false
      });

      expect(result.score).toBeGreaterThanOrEqual(2);
      expect(result.riskCategory).toBe('Moderate to High');
    });

    it('identifies very high risk with multiple factors', () => {
      const result = calculateCHA2DS2VASc({
        age: 80,
        gender: 'female',
        congestiveHeartFailure: true,
        hypertension: true,
        stroke: true,
        vascularDisease: true,
        diabetes: true
      });

      expect(result.score).toBeGreaterThanOrEqual(7);
      expect(result.riskCategory).toBe('Moderate to High');
      expect(result.strokeRiskPercent).toBeGreaterThan(5);
    });
  });

  describe('Treatment Recommendations', () => {
    it('recommends no anticoagulation for score 0', () => {
      const result = calculateCHA2DS2VASc({
        age: 50,
        gender: 'male',
        congestiveHeartFailure: false,
        hypertension: false,
        stroke: false,
        vascularDisease: false,
        diabetes: false
      });

      const recText = result.recommendations.join(' ').toLowerCase();
      expect(recText).toContain('no anticoagulation');
    });

    it('recommends anticoagulation for score >= 2', () => {
      const result = calculateCHA2DS2VASc({
        age: 70,
        gender: 'male',
        congestiveHeartFailure: true,
        hypertension: false,
        stroke: false,
        vascularDisease: false,
        diabetes: false
      });

      const recText = result.recommendations.join(' ').toLowerCase();
      expect(recText).toContain('anticoagulation');
    });

    it('mentions DOACs for high-risk patients', () => {
      const result = calculateCHA2DS2VASc({
        age: 75,
        gender: 'male',
        congestiveHeartFailure: true,
        hypertension: true,
        stroke: false,
        vascularDisease: false,
        diabetes: false
      });

      const recText = result.recommendations.join(' ').toLowerCase();
      expect(recText).toMatch(/warfarin|doac|apixaban|rivaroxaban|dabigatran/);
    });
  });

  describe('Clinical Scenarios', () => {
    it('handles elderly patient with multiple comorbidities', () => {
      const result = calculateCHA2DS2VASc({
        age: 78,
        gender: 'female',
        congestiveHeartFailure: true,
        hypertension: true,
        stroke: false,
        vascularDisease: true,
        diabetes: true
      });

      expect(result.score).toBe(7); // 2 (age) + 1 (female) + 1 (CHF) + 1 (HTN) + 1 (vascular) + 1 (DM)
      expect(result.riskCategory).toBe('Moderate to High');
      expect(result.recommendations).toContain('Oral anticoagulation recommended');
    });

    it('handles patient with prior stroke (highest risk factor)', () => {
      const result = calculateCHA2DS2VASc({
        age: 60,
        gender: 'male',
        congestiveHeartFailure: false,
        hypertension: false,
        stroke: true,
        vascularDisease: false,
        diabetes: false
      });

      expect(result.score).toBe(2);
      expect(result.riskCategory).toBe('Moderate to High');
      expect(result.recommendations).toContain('Oral anticoagulation recommended');
    });

    it('handles young patient with single risk factor', () => {
      const result = calculateCHA2DS2VASc({
        age: 55,
        gender: 'male',
        congestiveHeartFailure: false,
        hypertension: true,
        stroke: false,
        vascularDisease: false,
        diabetes: false
      });

      expect(result.score).toBe(1);
      const recText = result.recommendations.join(' ').toLowerCase();
      expect(recText).toContain('consider');
    });
  });

  describe('Gender-Specific Considerations', () => {
    it('female gender alone does not warrant anticoagulation', () => {
      const result = calculateCHA2DS2VASc({
        age: 55,
        gender: 'female',
        congestiveHeartFailure: false,
        hypertension: false,
        stroke: false,
        vascularDisease: false,
        diabetes: false
      });

      expect(result.score).toBe(1);
      expect(result.riskCategory).toBe('Low');
      const recText = result.recommendations.join(' ').toLowerCase();
      expect(recText).toContain('no anticoagulation');
    });

    it('female with additional risk factors warrants anticoagulation', () => {
      const result = calculateCHA2DS2VASc({
        age: 55,
        gender: 'female',
        congestiveHeartFailure: false,
        hypertension: true,
        stroke: false,
        vascularDisease: false,
        diabetes: false
      });

      expect(result.score).toBe(2);
      expect(result.riskCategory).toBe('Moderate to High');
      expect(result.recommendations).toContain('Oral anticoagulation recommended');
    });
  });

  describe('Score Ranges', () => {
    it('maximum score is calculated correctly', () => {
      const result = calculateCHA2DS2VASc({
        age: 80,
        gender: 'female',
        congestiveHeartFailure: true,
        hypertension: true,
        stroke: true,
        vascularDisease: true,
        diabetes: true
      });

      expect(result.score).toBe(9); // Maximum possible score
    });

    it('minimum score is 0 for young male', () => {
      const result = calculateCHA2DS2VASc({
        age: 18,
        gender: 'male',
        congestiveHeartFailure: false,
        hypertension: false,
        stroke: false,
        vascularDisease: false,
        diabetes: false
      });

      expect(result.score).toBe(0);
    });

    it('minimum score is 1 for young female', () => {
      const result = calculateCHA2DS2VASc({
        age: 18,
        gender: 'female',
        congestiveHeartFailure: false,
        hypertension: false,
        stroke: false,
        vascularDisease: false,
        diabetes: false
      });

      expect(result.score).toBe(1);
    });
  });

  describe('Stroke Risk Percentages', () => {
    it('provides stroke risk estimates', () => {
      const scores = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

      scores.forEach(targetScore => {
        // Create a scenario that produces the target score
        let age = 50;
        let factors = 0;

        if (targetScore >= 2) age = 75; // Adds 2 points
        if (targetScore >= 3) factors++;

        const result = calculateCHA2DS2VASc({
          age: age,
          gender: 'male',
          congestiveHeartFailure: factors >= 1,
          hypertension: factors >= 2,
          stroke: false,
          vascularDisease: factors >= 3,
          diabetes: factors >= 4
        });

        expect(result.strokeRiskPercent).toBeGreaterThanOrEqual(0);
        expect(result.strokeRiskPercent).toBeLessThanOrEqual(20);
      });
    });
  });
});
