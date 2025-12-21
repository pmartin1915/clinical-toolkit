/**
 * Medical Test Data Fixtures
 * HIPAA-compliant fake patient data for E2E testing
 *
 * IMPORTANT: This data is completely fictitious and generated for testing purposes only.
 * Do NOT use real patient data in tests.
 */

export const testPatients = {
  lowRiskMale: {
    age: 45,
    gender: 'male',
    race: 'white',
    totalCholesterol: 170,
    hdlCholesterol: 50,
    systolicBP: 120,
    onBPMeds: false,
    diabetic: false,
    smoker: false,
  },
  highRiskFemale: {
    age: 65,
    gender: 'female',
    race: 'black',
    totalCholesterol: 240,
    hdlCholesterol: 35,
    systolicBP: 150,
    onBPMeds: true,
    diabetic: true,
    smoker: true,
  },
  moderateRiskMale: {
    age: 55,
    gender: 'male',
    race: 'white',
    totalCholesterol: 200,
    hdlCholesterol: 45,
    systolicBP: 135,
    onBPMeds: false,
    diabetic: false,
    smoker: false,
  },
};

export const testVitals = {
  normal: {
    systolicBP: 120,
    diastolicBP: 80,
    heartRate: 72,
    temperature: 98.6,
    respiratoryRate: 16,
    oxygenSaturation: 98,
  },
  hypertensive: {
    systolicBP: 160,
    diastolicBP: 100,
    heartRate: 85,
    temperature: 98.6,
    respiratoryRate: 18,
    oxygenSaturation: 97,
  },
};

export const testBMIData = {
  underweight: {
    weight: 110, // lbs
    height: 70, // inches
    expectedBMI: 15.8,
    expectedCategory: 'Underweight',
  },
  normal: {
    weight: 150,
    height: 68,
    expectedBMI: 22.8,
    expectedCategory: 'Normal',
  },
  overweight: {
    weight: 190,
    height: 68,
    expectedBMI: 28.9,
    expectedCategory: 'Overweight',
  },
  obese: {
    weight: 230,
    height: 68,
    expectedBMI: 35.0,
    expectedCategory: 'Obese',
  },
};

export const testCHA2DS2VAScData = {
  lowRisk: {
    age: 50,
    gender: 'male',
    chf: false,
    hypertension: false,
    stroke: false,
    vascularDisease: false,
    diabetes: false,
    expectedScore: 0,
    expectedRisk: 'Low',
  },
  moderateRisk: {
    age: 70,
    gender: 'female',
    chf: false,
    hypertension: true,
    stroke: false,
    vascularDisease: false,
    diabetes: true,
    expectedScore: 4,
    expectedRisk: 'Moderate',
  },
  highRisk: {
    age: 75,
    gender: 'male',
    chf: true,
    hypertension: true,
    stroke: true,
    vascularDisease: true,
    diabetes: true,
    expectedScore: 8,
    expectedRisk: 'High',
  },
};

export const testA1CData = {
  normal: {
    a1c: 5.0,
    expectedGlucose: 97,
  },
  prediabetic: {
    a1c: 6.0,
    expectedGlucose: 126,
  },
  diabetic: {
    a1c: 8.0,
    expectedGlucose: 183,
  },
};

/**
 * Helper to generate random HIPAA-compliant test patient
 */
export function generateTestPatient(riskLevel: 'low' | 'moderate' | 'high' = 'moderate') {
  const ages = { low: 40, moderate: 55, high: 70 };
  const cholesterols = { low: 170, moderate: 200, high: 240 };
  const systolicBPs = { low: 120, moderate: 140, high: 160 };

  return {
    age: ages[riskLevel],
    gender: Math.random() > 0.5 ? 'male' : 'female',
    race: ['white', 'black', 'other'][Math.floor(Math.random() * 3)],
    totalCholesterol: cholesterols[riskLevel],
    hdlCholesterol: riskLevel === 'high' ? 35 : 50,
    systolicBP: systolicBPs[riskLevel],
    onBPMeds: riskLevel === 'high',
    diabetic: riskLevel === 'high',
    smoker: riskLevel !== 'low',
  };
}
