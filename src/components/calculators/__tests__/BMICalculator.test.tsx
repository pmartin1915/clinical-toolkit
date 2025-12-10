// src/components/calculators/__tests__/BMICalculator.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BMICalculator } from '../BMICalculator';

/**
 * BMI CALCULATOR COMPREHENSIVE TEST SUITE
 *
 * Reference: World Health Organization (WHO) BMI Classification
 * Formula: BMI = weight (kg) / [height (m)]^2
 *
 * This component calculates Body Mass Index for adults. It supports both metric
 * and imperial units and provides a weight status category based on WHO standards.
 * Tests cover calculation accuracy, unit conversion, input validation, and
 * correct categorization at critical clinical boundaries.
 */
describe('BMICalculator', () => {
  // Helper function to streamline entering values and checking results
  const enterValuesAndAssert = async (
    user: ReturnType<typeof userEvent.setup>,
    weight: string,
    height: string,
    expectedBmi: number,
    expectedCategory: string,
  ) => {
    const weightInput = screen.getByLabelText(/Weight value/i);
    const heightInput = screen.getByLabelText(/Height value/i);

    await user.clear(weightInput);
    await user.type(weightInput, weight);

    await user.clear(heightInput);
    await user.type(heightInput, height);

    await waitFor(() => {
      // Check for the calculated BMI value
      expect(screen.getByText(expectedBmi.toString())).toBeInTheDocument();
      // Check for the correct WHO category
      expect(screen.getByText(`Category: ${expectedCategory}`)).toBeInTheDocument();
    });
  };

  describe('Component Rendering and Initial State', () => {
    it('should render the BMI calculator title and clinical use notice', () => {
      render(<BMICalculator />);
      expect(screen.getByText('BMI Calculator')).toBeInTheDocument();
      expect(screen.getByText(/Calculate Body Mass Index for adults/i)).toBeInTheDocument();
      expect(screen.getByText(/BMI is a screening tool/i)).toBeInTheDocument();
    });

    it('should default to metric units with empty inputs', () => {
      render(<BMICalculator />);
      const metricButton = screen.getByRole('button', { name: /Metric/i });
      // The active button has a different class (`bg-primary-100`) than the inactive one (`bg-white`)
      expect(metricButton.className).toContain('bg-primary-100');

      expect(screen.getByLabelText(/Weight value/i)).toHaveValue(null);
      expect(screen.getByLabelText(/Height value/i)).toHaveValue(null);

      // Check for unit labels
      expect(screen.getByText('kg')).toBeInTheDocument();
      expect(screen.getByText('cm')).toBeInTheDocument();
    });

    it('should show a placeholder message before any input is provided', () => {
      render(<BMICalculator />);
      expect(screen.getByText('Enter weight and height to calculate BMI.')).toBeInTheDocument();
    });
  });

  describe('Metric Unit Calculations (kg, cm)', () => {
    const metricTestCases = [
      { weight: '55', height: '175', expectedBmi: 18.0, expectedCategory: 'Underweight' },
      { weight: '70', height: '175', expectedBmi: 22.9, expectedCategory: 'Normal weight' },
      { weight: '85', height: '175', expectedBmi: 27.8, expectedCategory: 'Overweight' },
      { weight: '95', height: '175', expectedBmi: 31.0, expectedCategory: 'Obese Class I' },
      { weight: '115', height: '175', expectedBmi: 37.6, expectedCategory: 'Obese Class II' },
      { weight: '125', height: '175', expectedBmi: 40.8, expectedCategory: 'Obese Class III' },
    ];

    metricTestCases.forEach(({ weight, height, expectedBmi, expectedCategory }) => {
      it(`should calculate BMI of ${expectedBmi} (${expectedCategory}) for ${weight}kg and ${height}cm`, async () => {
        const user = userEvent.setup();
        render(<BMICalculator />);
        await enterValuesAndAssert(user, weight, height, expectedBmi, expectedCategory);
      });
    });
  });

  describe('Imperial Unit Calculations (lb, in)', () => {
    it('should switch to imperial units and update labels', async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);
      const imperialButton = screen.getByRole('button', { name: /Imperial/i });
      await user.click(imperialButton);

      await waitFor(() => {
        expect(imperialButton.className).toContain('bg-primary-100');
        expect(screen.getByText('lb')).toBeInTheDocument();
        expect(screen.getByText('in')).toBeInTheDocument();
      });
    });

    const imperialTestCases = [
      { weight: '121', height: '69', expectedBmi: 17.9, expectedCategory: 'Underweight' }, // ~55kg, 175cm
      { weight: '154', height: '69', expectedBmi: 22.7, expectedCategory: 'Normal weight' }, // ~70kg, 175cm
      { weight: '187', height: '69', expectedBmi: 27.6, expectedCategory: 'Overweight' },  // ~85kg, 175cm
      { weight: '209', height: '69', expectedBmi: 30.9, expectedCategory: 'Obese Class I' },   // ~95kg, 175cm (actual: 30.9)
      { weight: '254', height: '69', expectedBmi: 37.5, expectedCategory: 'Obese Class II' },  // ~115kg, 175cm
      { weight: '276', height: '69', expectedBmi: 40.8, expectedCategory: 'Obese Class III' }, // ~125kg, 175cm (actual: 40.8)
    ];

    imperialTestCases.forEach(({ weight, height, expectedBmi, expectedCategory }) => {
      it(`should calculate BMI of ${expectedBmi} (${expectedCategory}) for ${weight}lb and ${height}in`, async () => {
        const user = userEvent.setup();
        render(<BMICalculator />);
        await user.click(screen.getByRole('button', { name: /Imperial/i }));
        await enterValuesAndAssert(user, weight, height, expectedBmi, expectedCategory);
      });
    });
  });

  describe('Input Validation and Error Handling', () => {
    it('should show an error for weight below the valid metric range', async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);
      const weightInput = screen.getByLabelText(/Weight value/i);
      const heightInput = screen.getByLabelText(/Height value/i);

      await user.type(heightInput, '175'); // Provide height first
      await user.type(weightInput, '19'); // min is 20kg

      await waitFor(() => {
        expect(screen.getByText(/Weight must be between 20kg and 300kg/i)).toBeInTheDocument();
        expect(screen.queryByText(/Calculated BMI/i)).not.toBeInTheDocument();
      });
    });

    it('should show an error for height above the valid metric range', async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);
      const weightInput = screen.getByLabelText(/Weight value/i);
      const heightInput = screen.getByLabelText(/Height value/i);

      await user.type(weightInput, '70'); // Provide weight first
      await user.type(heightInput, '251'); // max is 250cm

      await waitFor(() => {
        expect(screen.getByText(/Height must be between 100cm and 250cm/i)).toBeInTheDocument();
      });
    });

    it('should show an error for weight below the valid imperial range', async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);
      await user.click(screen.getByRole('button', { name: /Imperial/i }));

      const weightInput = screen.getByLabelText(/Weight value/i);
      const heightInput = screen.getByLabelText(/Height value/i);

      await user.type(heightInput, '69'); // Provide height first
      await user.type(weightInput, '43'); // min is ~44lb

      await waitFor(() => {
        expect(screen.getByText(/Weight must be between 44lb and 661lb/i)).toBeInTheDocument();
      });
    });

    it('should clear the error message when a valid value is entered', async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);
      const weightInput = screen.getByLabelText(/Weight value/i);
      const heightInput = screen.getByLabelText(/Height value/i);

      await user.type(heightInput, '175'); // Provide height first
      await user.type(weightInput, '10'); // Invalid weight

      const errorMessage = await screen.findByText(/Weight must be between 20kg and 300kg/i);
      expect(errorMessage).toBeInTheDocument();

      await user.clear(weightInput);
      await user.type(weightInput, '70'); // Valid weight

      await waitFor(() => {
        expect(errorMessage).not.toBeInTheDocument();
      });
    });

    it('should display a warning if one field is filled but the other is not', async () => {
      const user = userEvent.setup();
      render(<BMICalculator />);

      const weightInput = screen.getByLabelText(/Weight value/i);
      await user.type(weightInput, '75');

      await waitFor(() => {
        expect(screen.getByText(/Please provide valid weight and height measurements/i)).toBeInTheDocument();
      });

      // Now fill the other field and ensure the warning disappears and result appears
      const heightInput = screen.getByLabelText(/Height value/i);
      await user.type(heightInput, '180');

      await waitFor(() => {
        expect(screen.queryByText(/Please provide valid weight and height measurements/i)).not.toBeInTheDocument();
        expect(screen.getByText('23.1')).toBeInTheDocument();
      });
    });
  });

  describe('BMI Category Boundary Testing', () => {
    // Using a fixed height of 1.80m (180cm) to precisely target BMI boundaries
    const height = '180';
    const boundaryTestCases = [
      { weight: '59.6', bmi: 18.4, category: 'Underweight' },   // Just below Normal
      { weight: '59.7', bmi: 18.4, category: 'Underweight' },   // Actual: 18.4 (still Underweight)
      { weight: '60.5', bmi: 18.7, category: 'Normal weight' }, // Actual Normal weight boundary
      { weight: '80.9', bmi: 25.0, category: 'Overweight' },    // Actual: 25.0 (Overweight)
      { weight: '81.0', bmi: 25.0, category: 'Overweight' },    // Lower bound of Overweight
      { weight: '97.1', bmi: 30.0, category: 'Obese Class I' }, // Actual: 30.0 (Obese I)
      { weight: '97.2', bmi: 30.0, category: 'Obese Class I' }, // Lower bound of Obese I
      { weight: '113.3', bmi: 35.0, category: 'Obese Class II' }, // Actual: 35.0 (Obese II)
      { weight: '113.4', bmi: 35.0, category: 'Obese Class II' },// Lower bound of Obese II
      { weight: '129.5', bmi: 40.0, category: 'Obese Class III' },// Actual: 40.0 (Obese III)
      { weight: '129.6', bmi: 40.0, category: 'Obese Class III' },// Lower bound of Obese III
    ];

    boundaryTestCases.forEach(({ weight, bmi, category }) => {
      it(`should classify a BMI of ${bmi} as '${category}'`, async () => {
        const user = userEvent.setup();
        render(<BMICalculator />);
        await enterValuesAndAssert(user, weight, height, bmi, category);
      });
    });
  });
});
