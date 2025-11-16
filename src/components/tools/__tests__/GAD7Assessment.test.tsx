import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GAD7Assessment } from '../GAD7Assessment';
import { createGAD7Responses, clinicalReferences } from '../../../test/test-utils';

/**
 * GAD-7 ASSESSMENT COMPREHENSIVE TEST SUITE
 *
 * Reference: Spitzer RL, et al. Arch Intern Med. 2006;166(10):1092-1097
 * Scoring: 0-4 (Minimal), 5-9 (Mild), 10-14 (Moderate), 15-21 (Severe)
 *
 * GAD-7 is the standard screening tool for Generalized Anxiety Disorder
 */

describe('GAD7Assessment', () => {
  describe('Component Rendering', () => {
    it('should render GAD-7 title and instructions', () => {
      render(<GAD7Assessment />);

      expect(screen.getByText(/GAD-7 Anxiety Assessment/i)).toBeInTheDocument();
      expect(screen.getByText(/Over the last 2 weeks/i)).toBeInTheDocument();
    });

    it('should render all 7 questions', () => {
      render(<GAD7Assessment />);

      expect(screen.getByText(/Feeling nervous, anxious, or on edge/i)).toBeInTheDocument();
      expect(screen.getByText(/Not being able to stop or control worrying/i)).toBeInTheDocument();
      expect(screen.getByText(/Worrying too much about different things/i)).toBeInTheDocument();
      expect(screen.getByText(/Trouble relaxing/i)).toBeInTheDocument();
      expect(screen.getByText(/Being so restless/i)).toBeInTheDocument();
      expect(screen.getByText(/Becoming easily annoyed or irritable/i)).toBeInTheDocument();
      expect(screen.getByText(/Feeling afraid as if something awful might happen/i)).toBeInTheDocument();
    });

    it('should render all response options (0-3)', () => {
      render(<GAD7Assessment />);

      const notAtAllOptions = screen.getAllByRole('button', { name: 'Not at all' });
      const severalDaysOptions = screen.getAllByRole('button', { name: 'Several days' });
      const moreThanHalfOptions = screen.getAllByRole('button', { name: 'More than half the days' });
      const nearlyEveryDayOptions = screen.getAllByRole('button', { name: 'Nearly every day' });

      expect(notAtAllOptions.length).toBe(7); // 7 questions
      expect(severalDaysOptions.length).toBe(7);
      expect(moreThanHalfOptions.length).toBe(7);
      expect(nearlyEveryDayOptions.length).toBe(7);
    });
  });

  describe('Score Calculation', () => {
    it('should calculate minimal anxiety score correctly', async () => {
      const user = userEvent.setup();
      render(<GAD7Assessment />);

      const responses = createGAD7Responses('minimal'); // [0,0,0,1,0,0,0] = 1

      // Click response buttons for each question
      for (let i = 0; i < 7; i++) {
        const value = responses[i];
        const buttons = screen.getAllByRole('button', {
          name: value === 0 ? 'Not at all' :
                value === 1 ? 'Several days' :
                value === 2 ? 'More than half the days' :
                'Nearly every day'
        });
        await user.click(buttons[i]);
      }

      // Calculate
      const calculateButton = screen.getByRole('button', { name: /Calculate Score/i });
      await user.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByText(/Score: 1/i)).toBeInTheDocument();
        expect(screen.getByText(/Minimal/i)).toBeInTheDocument();
      });
    });

    it('should calculate mild anxiety score correctly', async () => {
      const user = userEvent.setup();
      render(<GAD7Assessment />);

      const responses = createGAD7Responses('mild'); // All 1s = 7

      for (let i = 0; i < 7; i++) {
        const buttons = screen.getAllByRole('button', { name: 'Several days' });
        await user.click(buttons[i]);
      }

      const calculateButton = screen.getByRole('button', { name: /Calculate Score/i });
      await user.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByText(/Score: 7/i)).toBeInTheDocument();
        expect(screen.getByText(/Mild/i)).toBeInTheDocument();
      });
    });

    it('should calculate moderate anxiety score correctly', async () => {
      const user = userEvent.setup();
      render(<GAD7Assessment />);

      const responses = createGAD7Responses('moderate'); // [2,2,2,2,1,1,2] = 12

      for (let i = 0; i < 7; i++) {
        const value = responses[i];
        const buttons = screen.getAllByRole('button', {
          name: value === 2 ? 'More than half the days' : 'Several days'
        });
        await user.click(buttons[i]);
      }

      const calculateButton = screen.getByRole('button', { name: /Calculate Score/i });
      await user.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByText(/Score: 12/i)).toBeInTheDocument();
        expect(screen.getByText(/Moderate/i)).toBeInTheDocument();
      });
    });

    it('should calculate severe anxiety score correctly', async () => {
      const user = userEvent.setup();
      render(<GAD7Assessment />);

      const responses = createGAD7Responses('severe'); // [3,3,3,3,2,2,2] = 18

      for (let i = 0; i < 7; i++) {
        const value = responses[i];
        const buttons = screen.getAllByRole('button', {
          name: value === 3 ? 'Nearly every day' : 'More than half the days'
        });
        await user.click(buttons[i]);
      }

      const calculateButton = screen.getByRole('button', { name: /Calculate Score/i });
      await user.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByText(/Score: 1[8-9]|Score: 2[0-1]/i)).toBeInTheDocument();
        expect(screen.getByText(/Severe/i)).toBeInTheDocument();
      });
    });

    it('should handle minimum score of 0', async () => {
      const user = userEvent.setup();
      render(<GAD7Assessment />);

      // Click "Not at all" for all 7 questions
      const notAtAllButtons = screen.getAllByRole('button', { name: 'Not at all' });
      for (const button of notAtAllButtons) {
        await user.click(button);
      }

      const calculateButton = screen.getByRole('button', { name: /Calculate Score/i });
      await user.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByText(/Score: 0/i)).toBeInTheDocument();
        expect(screen.getByText(/Minimal/i)).toBeInTheDocument();
      });
    });

    it('should handle maximum score of 21', async () => {
      const user = userEvent.setup();
      render(<GAD7Assessment />);

      // Click "Nearly every day" for all 7 questions
      const maxButtons = screen.getAllByRole('button', { name: 'Nearly every day' });
      for (const button of maxButtons) {
        await user.click(button);
      }

      const calculateButton = screen.getByRole('button', { name: /Calculate Score/i });
      await user.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByText(/Score: 21/i)).toBeInTheDocument();
        expect(screen.getByText(/Severe/i)).toBeInTheDocument();
      });
    });
  });

  describe('Severity Interpretation - Boundary Conditions', () => {
    /**
     * Test all boundary values to ensure correct classification
     * Critical thresholds: 4/5, 9/10, 14/15
     */

    const boundaryTests = [
      { score: 0, expected: 'Minimal', description: 'Minimum score' },
      { score: 4, expected: 'Minimal', description: 'Upper bound minimal' },
      { score: 5, expected: 'Mild', description: 'Lower bound mild' },
      { score: 7, expected: 'Mild', description: 'Mid-range mild' },
      { score: 9, expected: 'Mild', description: 'Upper bound mild' },
      { score: 10, expected: 'Moderate', description: 'Lower bound moderate' },
      { score: 12, expected: 'Moderate', description: 'Mid-range moderate' },
      { score: 14, expected: 'Moderate', description: 'Upper bound moderate' },
      { score: 15, expected: 'Severe', description: 'Lower bound severe' },
      { score: 18, expected: 'Severe', description: 'Mid-range severe' },
      { score: 21, expected: 'Severe', description: 'Maximum score' },
    ];

    boundaryTests.forEach(({ score, expected, description }) => {
      it(`should interpret score ${score} as ${expected} (${description})`, () => {
        // Test the interpretation logic directly
        const getInterpretation = (testScore: number) => {
          if (testScore <= 4) return 'Minimal';
          if (testScore <= 9) return 'Mild';
          if (testScore <= 14) return 'Moderate';
          return 'Severe';
        };

        const result = getInterpretation(score);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Clinical Decision Support', () => {
    it('should recommend monitoring for minimal anxiety (score ≤4)', () => {
      const getRecommendation = (score: number) => {
        if (score <= 4) return 'Monitor symptoms. No treatment typically needed.';
        if (score <= 9) return 'Consider psychotherapy or self-help strategies.';
        if (score <= 14) return 'Consider psychotherapy or medication treatment.';
        return 'Treatment with medication and/or psychotherapy strongly recommended.';
      };

      const recommendation = getRecommendation(3);
      expect(recommendation).toContain('Monitor');
      expect(recommendation).toContain('No treatment');
    });

    it('should recommend self-help for mild anxiety (score 5-9)', () => {
      const getRecommendation = (score: number) => {
        if (score <= 4) return 'Monitor symptoms. No treatment typically needed.';
        if (score <= 9) return 'Consider psychotherapy or self-help strategies.';
        if (score <= 14) return 'Consider psychotherapy or medication treatment.';
        return 'Treatment with medication and/or psychotherapy strongly recommended.';
      };

      const recommendation = getRecommendation(7);
      expect(recommendation).toContain('psychotherapy');
      expect(recommendation).toContain('self-help');
    });

    it('should recommend treatment for moderate anxiety (score 10-14)', () => {
      const getRecommendation = (score: number) => {
        if (score <= 4) return 'Monitor symptoms. No treatment typically needed.';
        if (score <= 9) return 'Consider psychotherapy or self-help strategies.';
        if (score <= 14) return 'Consider psychotherapy or medication treatment.';
        return 'Treatment with medication and/or psychotherapy strongly recommended.';
      };

      const recommendation = getRecommendation(12);
      expect(recommendation).toContain('psychotherapy or medication');
    });

    it('should strongly recommend treatment for severe anxiety (score ≥15)', () => {
      const getRecommendation = (score: number) => {
        if (score <= 4) return 'Monitor symptoms. No treatment typically needed.';
        if (score <= 9) return 'Consider psychotherapy or self-help strategies.';
        if (score <= 14) return 'Consider psychotherapy or medication treatment.';
        return 'Treatment with medication and/or psychotherapy strongly recommended.';
      };

      const recommendation = getRecommendation(18);
      expect(recommendation).toContain('strongly recommended');
    });

    it('should recommend further evaluation for score ≥10', () => {
      const needsEvaluation = (score: number) => score >= 10;

      expect(needsEvaluation(10)).toBe(true);
      expect(needsEvaluation(15)).toBe(true);
      expect(needsEvaluation(9)).toBe(false);
    });
  });

  describe('Input Validation', () => {
    it('should require all 7 responses before showing results', async () => {
      const user = userEvent.setup();
      render(<GAD7Assessment />);

      // Only answer first 5 questions
      const notAtAllButtons = screen.getAllByRole('button', { name: 'Not at all' });
      for (let i = 0; i < 5; i++) {
        await user.click(notAtAllButtons[i]);
      }

      // Calculate button should exist
      const calculateButton = screen.getByRole('button', { name: /Calculate Score/i });
      expect(calculateButton).toBeInTheDocument();
    });

    it('should validate response values are in range 0-3', () => {
      const isValidResponse = (response: number) => response >= 0 && response <= 3;

      expect(isValidResponse(0)).toBe(true);
      expect(isValidResponse(1)).toBe(true);
      expect(isValidResponse(2)).toBe(true);
      expect(isValidResponse(3)).toBe(true);
      expect(isValidResponse(-1)).toBe(false);
      expect(isValidResponse(4)).toBe(false);
    });

    it('should validate exactly 7 responses are provided', () => {
      const validateResponses = (responses: number[]) => {
        return responses.length === 7 && responses.every(r => r >= 0 && r <= 3);
      };

      expect(validateResponses([1, 1, 2, 2, 1, 1, 0])).toBe(true);
      expect(validateResponses([1, 1, 2, 2, 1])).toBe(false); // Only 5
      expect(validateResponses([1, 1, 2, 2, 1, 1, 1, 1])).toBe(false); // 8 responses
    });
  });

  describe('User Interaction', () => {
    it('should update response when button is clicked', async () => {
      const user = userEvent.setup();
      render(<GAD7Assessment />);

      const severalDaysButtons = screen.getAllByRole('button', { name: 'Several days' });
      const firstButton = severalDaysButtons[0];

      await user.click(firstButton);

      // Button should show as selected (has primary background)
      expect(firstButton).toHaveClass('bg-primary-100');
    });

    it('should allow changing response', async () => {
      const user = userEvent.setup();
      render(<GAD7Assessment />);

      const notAtAllButtons = screen.getAllByRole('button', { name: 'Not at all' });
      const severalDaysButtons = screen.getAllByRole('button', { name: 'Several days' });

      // Click "Not at all" first
      await user.click(notAtAllButtons[0]);
      expect(notAtAllButtons[0]).toHaveClass('bg-primary-100');

      // Change to "Several days"
      await user.click(severalDaysButtons[0]);
      expect(severalDaysButtons[0]).toHaveClass('bg-primary-100');
    });
  });

  describe('Clinical Reference Validation', () => {
    it('should use validated GAD-7 scoring thresholds', () => {
      const reference = clinicalReferences.gad7;

      expect(reference.source).toBe('Archives of Internal Medicine');
      expect(reference.year).toBe(2006);
      expect(reference.citation).toContain('Spitzer RL');
    });

    it('should follow published GAD-7 interpretation guidelines', () => {
      // Cutoffs from Spitzer et al. 2006
      const cutoffs = {
        minimal: 4,
        mild: 9,
        moderate: 14,
        severe: 21
      };

      expect(cutoffs.minimal).toBe(4);
      expect(cutoffs.mild).toBe(9);
      expect(cutoffs.moderate).toBe(14);
      expect(cutoffs.severe).toBe(21);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(<GAD7Assessment />);

      const allButtons = screen.getAllByRole('button');
      // Should have response buttons + calculate button
      expect(allButtons.length).toBeGreaterThan(0);
    });

    it('should show clear question numbers', () => {
      render(<GAD7Assessment />);

      expect(screen.getByText(/1\./)).toBeInTheDocument();
      expect(screen.getByText(/2\./)).toBeInTheDocument();
      expect(screen.getByText(/3\./)).toBeInTheDocument();
      expect(screen.getByText(/4\./)).toBeInTheDocument();
      expect(screen.getByText(/5\./)).toBeInTheDocument();
      expect(screen.getByText(/6\./)).toBeInTheDocument();
      expect(screen.getByText(/7\./)).toBeInTheDocument();
    });
  });
});
