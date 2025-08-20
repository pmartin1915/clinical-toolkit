// 2013 Pooled Cohort Equations coefficients
// Source: Goff DC et al. 2013 ACC/AHA Guideline on the Assessment of CVD Risk

export type Subgroup = "white_male" | "white_female" | "black_male" | "black_female";

export interface Coefficients {
  beta: Record<string, number>;
  meanLP: number;
  baselineSurvival: number;
}

export const COEFFICIENTS: Record<Subgroup, Coefficients> = {
  white_male: {
    beta: {
      ln_age: 12.344,
      ln_total_chol: 11.853,
      ln_age_ln_total_chol: -2.664,
      ln_hdl: -7.99,
      ln_age_ln_hdl: 1.769,
      ln_treated_sbp: 1.797,
      ln_untreated_sbp: 1.764,
      smoker: 7.837,
      ln_age_smoker: -1.795,
      diabetes: 0.658,
    },
    meanLP: 61.18,
    baselineSurvival: 0.9144,
  },

  white_female: {
    beta: {
      ln_age: -29.799,
      ln_age_sq: 4.884,
      ln_total_chol: 13.54,
      ln_age_ln_total_chol: -3.114,
      ln_hdl: -13.578,
      ln_age_ln_hdl: 3.149,
      ln_treated_sbp: 2.019,
      ln_untreated_sbp: 1.957,
      smoker: 7.574,
      ln_age_smoker: -1.665,
      diabetes: 0.661,
    },
    meanLP: -29.18,
    baselineSurvival: 0.9665,
  },

  black_male: {
    beta: {
      ln_age: 2.469,
      ln_total_chol: 0.302,
      ln_hdl: -0.307,
      ln_treated_sbp: 1.916,
      ln_untreated_sbp: 1.809,
      smoker: 0.549,
      diabetes: 0.645,
    },
    meanLP: 19.54,
    baselineSurvival: 0.8954,
  },

  black_female: {
    beta: {
      ln_age: 17.114,
      ln_total_chol: 0.94,
      ln_hdl: -18.92,
      ln_age_ln_hdl: 4.475,
      ln_treated_sbp: 29.291,
      ln_untreated_sbp: 27.82,
      smoker: 0.691,
      diabetes: 0.874,
    },
    meanLP: 86.61,
    baselineSurvival: 0.9533,
  },
};