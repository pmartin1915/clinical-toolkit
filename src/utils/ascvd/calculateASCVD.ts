import { COEFFICIENTS, type Subgroup } from "./coefficients";

export type { Subgroup };

// Helper: natural log, guarding against bad inputs
const ln = (x: number) => Math.log(x);

export interface Inputs {
  age: number;              // years
  totalChol: number;        // mg/dL
  hdl: number;              // mg/dL
  sbp: number;              // mmHg
  treatedBp: boolean;       // true if on antihypertensives
  smoker: boolean;
  diabetes: boolean;
  subgroup: Subgroup;       // "white_male" | "white_female" | "black_male" | "black_female"
}

export function calculateASCVD(inputs: Inputs): number {
  const { age, totalChol, hdl, sbp, treatedBp, smoker, diabetes, subgroup } = inputs;
  const { beta, meanLP, baselineSurvival } = COEFFICIENTS[subgroup];

  const lnAge = ln(age);
  const lnAgeSq = lnAge * lnAge;
  const lnTC = ln(totalChol);
  const lnHDL = ln(hdl);
  const lnSBP = ln(sbp);

  let LP = 0;

  switch (subgroup) {
    case "white_male":
      LP =
        beta.ln_age * lnAge +
        beta.ln_total_chol * lnTC +
        beta.ln_age_ln_total_chol * lnAge * lnTC +
        beta.ln_hdl * lnHDL +
        beta.ln_age_ln_hdl * lnAge * lnHDL +
        (treatedBp ? beta.ln_treated_sbp : beta.ln_untreated_sbp) * lnSBP +
        beta.smoker * (smoker ? 1 : 0) +
        beta.ln_age_smoker * lnAge * (smoker ? 1 : 0) +
        beta.diabetes * (diabetes ? 1 : 0);
      break;

    case "white_female":
      LP =
        beta.ln_age * lnAge +
        beta.ln_age_sq * lnAgeSq +
        beta.ln_total_chol * lnTC +
        beta.ln_age_ln_total_chol * lnAge * lnTC +
        beta.ln_hdl * lnHDL +
        beta.ln_age_ln_hdl * lnAge * lnHDL +
        (treatedBp ? beta.ln_treated_sbp : beta.ln_untreated_sbp) * lnSBP +
        beta.smoker * (smoker ? 1 : 0) +
        beta.ln_age_smoker * lnAge * (smoker ? 1 : 0) +
        beta.diabetes * (diabetes ? 1 : 0);
      break;

    case "black_male":
      LP =
        beta.ln_age * lnAge +
        beta.ln_total_chol * lnTC +
        beta.ln_hdl * lnHDL +
        (treatedBp ? beta.ln_treated_sbp : beta.ln_untreated_sbp) * lnSBP +
        beta.smoker * (smoker ? 1 : 0) +
        beta.diabetes * (diabetes ? 1 : 0);
      break;

    case "black_female":
      LP =
        beta.ln_age * lnAge +
        beta.ln_total_chol * lnTC +
        beta.ln_hdl * lnHDL +
        beta.ln_age_ln_hdl * lnAge * lnHDL +
        (treatedBp ? beta.ln_treated_sbp : beta.ln_untreated_sbp) * lnSBP +
        beta.smoker * (smoker ? 1 : 0) +
        beta.diabetes * (diabetes ? 1 : 0);
      break;
  }

  // Risk formula: 1 - S0^(exp(LP - meanLP))
  const risk = 1 - Math.pow(baselineSurvival, Math.exp(LP - meanLP));

  return risk; // 0–1
}

// Helper function to convert percentage to risk interpretation
export function getRiskInterpretation(risk: number) {
  const percentage = risk * 100;
  
  if (percentage < 5) {
    return {
      category: 'Low Risk',
      description: 'Low 10-year ASCVD risk',
      color: 'text-green-600',
      bg: 'bg-green-50'
    };
  } else if (percentage < 7.5) {
    return {
      category: 'Borderline Risk',
      description: 'Borderline 10-year ASCVD risk',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    };
  } else if (percentage < 20) {
    return {
      category: 'Intermediate Risk',
      description: 'Intermediate 10-year ASCVD risk',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    };
  } else {
    return {
      category: 'High Risk',
      description: 'High 10-year ASCVD risk',
      color: 'text-red-600',
      bg: 'bg-red-50'
    };
  }
}