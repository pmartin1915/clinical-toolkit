// Health metrics utility functions
import type { IndicatorLevel } from '../components/ui/HealthIndicator';

// Utility function to determine BP level
export const getBPLevel = (systolic: number, diastolic: number): IndicatorLevel => {
  if (systolic >= 180 || diastolic >= 120) return 'critical';
  if (systolic >= 140 || diastolic >= 90) return 'warning';
  if (systolic >= 130 || diastolic >= 80) return 'caution';
  return 'normal';
};

// Utility function to determine A1C level
export const getA1CLevel = (a1c: number): IndicatorLevel => {
  if (a1c >= 10) return 'critical';
  if (a1c >= 8) return 'warning';
  if (a1c >= 7) return 'caution';
  return 'normal';
};

// Utility function to determine BMI level
export const getBMILevel = (bmi: number): IndicatorLevel => {
  if (bmi >= 40) return 'critical';
  if (bmi >= 30) return 'warning';
  if (bmi >= 25) return 'caution';
  return 'normal';
};
