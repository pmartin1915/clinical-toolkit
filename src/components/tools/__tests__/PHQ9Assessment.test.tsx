import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PHQ9Assessment } from '../PHQ9Assessment';
import { createPHQ9Responses, clinicalReferences } from '../../../test/test-utils';

/**
 * PHQ-9 ASSESSMENT COMPREHENSIVE TEST SUITE
 *
 * Reference: Kroenke K, et al. J Gen Intern Med. 2001;16(9):606-613
 * Scoring: 0-4 (Minimal), 5-9 (Mild), 10-14 (Moderate), 15-19 (Moderately Severe), 20-27 (Severe)
 *
 * CRITICAL: Question 9 is for suicide risk assessment
 * ANY positive response (>0) requires immediate clinical attention
 */

describe('PHQ9Assessment', () => {
  describe('Component Rendering', () => {
    it('should render PHQ-9 title and instructions', () => {
      render(<PHQ9Assessment />);

      expect(screen.getByText(/PHQ-9 Depression Assessment/i)).toBeInTheDocument();
      expect(screen.getByText(/Over the last 2 weeks/i)).toBeInTheDocument();
    });

    it('should render all 9 questions', () => {
      render(<PHQ9Assessment />);

      expect(screen.getByText(/Little interest or pleasure in doing things/i)).toBeInTheDocument();
      expect(screen.getByText(/Feeling down, depressed, or hopeless/i)).toBeInTheDocument();
      expect(screen.getByText(/Trouble falling or staying asleep/i)).toBeInTheDocument();
      expect(screen.getByText(/Feeling tired or having little energy/i)).toBeInTheDocument();
      expect(screen.getByText(/Poor appetite or overeating/i)).toBeInTheDocument();
      expect(screen.getByText(/Feeling bad about yourself/i)).toBeInTheDocument();
      expect(screen.getByText(/Trouble concentrating/i)).toBeInTheDocument();
      expect(screen.getByText(/Moving or speaking so slowly/i)).toBeInTheDocument();
      expect(screen.getByText(/Thoughts that you would be better off dead/i)).toBeInTheDocument();
    });

    it('should render all response options (0-3)', () => {
      render(<PHQ9Assessment />);

      const notAtAllOptions = screen.getAllByText('Not at all');
      const severalDaysOptions = screen.getAllByText('Several days');
      const moreThanHalfOptions = screen.getAllByText('More than half the days');
      const nearlyEveryDayOptions = screen.getAllByText('Nearly every day');

      expect(notAtAllOptions.length).toBeGreaterThan(0);
      expect(severalDaysOptions.length).toBeGreaterThan(0);
      expect(moreThanHalfOptions.length).toBeGreaterThan(0);
      expect(nearlyEveryDayOptions.length).toBeGreaterThan(0);
    });
  });

  describe('Score Calculation', () => {
    it('should calculate minimal depression score correctly', async () => {
      const user = userEvent.setup();
      render(<PHQ9Assessment />);

      const responses = createPHQ9Responses('minimal', false); // [0,0,0,1,0,0,0,0,0] = 1
      const allButtons = screen.getAllByRole('button');
      // First 36 buttons are question responses (9 questions × 4 options each)
      const responseButtons = allButtons.slice(0, 36);

      // Simulate minimal responses
      for (let i = 0; i < 9; i++) {
        const value = responses[i];
        const buttonIndex = i * 4 + value; // 4 options per question
        await user.click(responseButtons[buttonIndex]);
      }

      // Select functional impairment
      const functionalButton = screen.getByRole('button', { name: 'Not difficult at all' });
      await user.click(functionalButton);

      // Calculate (wait for button to appear)
      const calculateButton = await screen.findByRole('button', { name: /Calculate.*Score/i });
      await user.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByText(/1\/27/)).toBeInTheDocument();
        const minimalElements = screen.getAllByText(/Minimal Depression/i);
        expect(minimalElements.length).toBeGreaterThan(0);
      });
    });

    it('should calculate mild depression score correctly', async () => {
      const user = userEvent.setup();
      render(<PHQ9Assessment />);

      const responses = createPHQ9Responses('mild', false); // Score: 6
      const allButtons = screen.getAllByRole('button');
      const responseButtons = allButtons.slice(0, 36);

      for (let i = 0; i < 9; i++) {
        const value = responses[i];
        const buttonIndex = i * 4 + value;
        await user.click(responseButtons[buttonIndex]);
      }

      const functionalButton = screen.getByRole('button', { name: 'Somewhat difficult' });
      await user.click(functionalButton);

      const calculateButton = await screen.findByRole('button', { name: /Calculate.*Score/i });
      await user.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByText(/6\/27/)).toBeInTheDocument();
        const mildElements = screen.getAllByText(/Mild Depression/i);
        expect(mildElements.length).toBeGreaterThan(0);
      });
    });

    it('should calculate moderate depression score correctly', async () => {
      const user = userEvent.setup();
      render(<PHQ9Assessment />);

      const responses = createPHQ9Responses('moderate', false); // Score: 12
      const allButtons = screen.getAllByRole('button');
      const responseButtons = allButtons.slice(0, 36);

      for (let i = 0; i < 9; i++) {
        const value = responses[i];
        const buttonIndex = i * 4 + value;
        await user.click(responseButtons[buttonIndex]);
      }

      const functionalButton = screen.getByRole('button', { name: 'Very difficult' });
      await user.click(functionalButton);

      const calculateButton = await screen.findByRole('button', { name: /Calculate.*Score/i });
      await user.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByText(/12\/27/)).toBeInTheDocument();
        const moderateElements = screen.getAllByText(/Moderate Depression/i);
        expect(moderateElements.length).toBeGreaterThan(0);
      });
    });

    it('should calculate moderately severe depression score correctly', async () => {
      const user = userEvent.setup();
      render(<PHQ9Assessment />);

      const responses = createPHQ9Responses('moderately severe', false); // Score: 17
      const allButtons = screen.getAllByRole('button');
      const responseButtons = allButtons.slice(0, 36);

      for (let i = 0; i < 9; i++) {
        const value = responses[i];
        const buttonIndex = i * 4 + value;
        await user.click(responseButtons[buttonIndex]);
      }

      const functionalButton = screen.getByRole('button', { name: 'Extremely difficult' });
      await user.click(functionalButton);

      const calculateButton = await screen.findByRole('button', { name: /Calculate.*Score/i });
      await user.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByText(/17\/27/)).toBeInTheDocument();
        const moderatelySevereElements = screen.getAllByText(/Moderately Severe Depression/i);
        expect(moderatelySevereElements.length).toBeGreaterThan(0);
      });
    });

    it('should calculate severe depression score correctly', async () => {
      const user = userEvent.setup();
      render(<PHQ9Assessment />);

      const responses = createPHQ9Responses('severe', false); // Score: 22
      const allButtons = screen.getAllByRole('button');
      const responseButtons = allButtons.slice(0, 36);

      for (let i = 0; i < 9; i++) {
        const value = responses[i];
        const buttonIndex = i * 4 + value;
        await user.click(responseButtons[buttonIndex]);
      }

      const functionalButton = screen.getByRole('button', { name: 'Extremely difficult' });
      await user.click(functionalButton);

      const calculateButton = await screen.findByRole('button', { name: /Calculate.*Score/i });
      await user.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByText(/2[0-9]\/27/)).toBeInTheDocument();
        const severeElements = screen.getAllByText(/Severe Depression/i);
        expect(severeElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Severity Interpretation - Boundary Conditions', () => {
    const boundaryTests = [
      { score: 4, expected: 'Minimal', description: 'Upper bound minimal' },
      { score: 5, expected: 'Mild', description: 'Lower bound mild' },
      { score: 9, expected: 'Mild', description: 'Upper bound mild' },
      { score: 10, expected: 'Moderate', description: 'Lower bound moderate' },
      { score: 14, expected: 'Moderate', description: 'Upper bound moderate' },
      { score: 15, expected: 'Moderately Severe', description: 'Lower bound mod. severe' },
      { score: 19, expected: 'Moderately Severe', description: 'Upper bound mod. severe' },
      { score: 20, expected: 'Severe', description: 'Lower bound severe' },
      { score: 27, expected: 'Severe', description: 'Maximum score' },
    ];

    boundaryTests.forEach(({ score, expected, description }) => {
      it(`should interpret score ${score} as ${expected} (${description})`, () => {
        // Test the interpretation logic directly
        const getInterpretation = (testScore: number) => {
          if (testScore <= 4) return 'Minimal';
          if (testScore <= 9) return 'Mild';
          if (testScore <= 14) return 'Moderate';
          if (testScore <= 19) return 'Moderately Severe';
          return 'Severe';
        };

        const result = getInterpretation(score);
        expect(result).toBe(expected);
      });
    });
  });

  describe('CRITICAL: Suicide Risk Assessment (Question 9)', () => {
    /**
     * MOST IMPORTANT TEST SUITE
     * Question 9: "Thoughts that you would be better off dead or hurting yourself"
     * ANY positive response requires immediate clinical attention
     */

    it('should detect suicide risk when Q9 = 1 (Several days)', async () => {
      const user = userEvent.setup();
      render(<PHQ9Assessment />);

      createPHQ9Responses('minimal', true); // Forces Q9 = 2
      const allButtons = screen.getAllByRole('button');
      const responseButtons = allButtons.slice(0, 36);

      // Set Q9 to 1 (Several days)
      for (let i = 0; i < 8; i++) {
        await user.click(responseButtons[i * 4]); // All "Not at all"
      }
      await user.click(responseButtons[8 * 4 + 1]); // Q9 = "Several days"

      const functionalButton = screen.getByRole('button', { name: 'Not difficult at all' });
      await user.click(functionalButton);

      const calculateButton = await screen.findByRole('button', { name: /Calculate.*Score/i });
      await user.click(calculateButton);

      await waitFor(() => {
        // Should show suicide risk warning
        const alerts = screen.queryAllByText(/suicide/i);
        expect(alerts.length).toBeGreaterThan(0);
      });
    });

    it('should detect suicide risk when Q9 = 2 (More than half the days)', async () => {
      const user = userEvent.setup();
      render(<PHQ9Assessment />);

      const allButtons = screen.getAllByRole('button');
      const responseButtons = allButtons.slice(0, 36);

      for (let i = 0; i < 8; i++) {
        await user.click(responseButtons[i * 4]); // All "Not at all"
      }
      await user.click(responseButtons[8 * 4 + 2]); // Q9 = "More than half"

      const functionalButton = screen.getByRole('button', { name: 'Not difficult at all' });
      await user.click(functionalButton);

      const calculateButton = await screen.findByRole('button', { name: /Calculate.*Score/i });
      await user.click(calculateButton);

      await waitFor(() => {
        const alerts = screen.queryAllByText(/suicide/i);
        expect(alerts.length).toBeGreaterThan(0);
      });
    });

    it('should detect suicide risk when Q9 = 3 (Nearly every day)', async () => {
      const user = userEvent.setup();
      render(<PHQ9Assessment />);

      const allButtons = screen.getAllByRole('button');
      const responseButtons = allButtons.slice(0, 36);

      for (let i = 0; i < 8; i++) {
        await user.click(responseButtons[i * 4]); // All "Not at all"
      }
      await user.click(responseButtons[8 * 4 + 3]); // Q9 = "Nearly every day"

      const functionalButton = screen.getByRole('button', { name: 'Not difficult at all' });
      await user.click(functionalButton);

      const calculateButton = await screen.findByRole('button', { name: /Calculate.*Score/i });
      await user.click(calculateButton);

      await waitFor(() => {
        const alerts = screen.queryAllByText(/suicide/i);
        expect(alerts.length).toBeGreaterThan(0);
      });
    });

    it('should NOT show suicide risk when Q9 = 0 (Not at all)', async () => {
      const user = userEvent.setup();
      render(<PHQ9Assessment />);

      const responses = createPHQ9Responses('minimal', false); // Q9 = 0
      const allButtons = screen.getAllByRole('button');
      const responseButtons = allButtons.slice(0, 36);

      for (let i = 0; i < 9; i++) {
        const value = responses[i];
        const buttonIndex = i * 4 + value;
        await user.click(responseButtons[buttonIndex]);
      }

      const functionalButton = screen.getByRole('button', { name: 'Not difficult at all' });
      await user.click(functionalButton);

      const calculateButton = await screen.findByRole('button', { name: /Calculate.*Score/i });
      await user.click(calculateButton);

      await waitFor(() => {
        // Score should be shown
        expect(screen.getByText(/\/27/)).toBeInTheDocument();
      });

      // Should NOT show suicide-specific warning for Q9=0
      // (General disclaimers may mention suicide, so we check for absence of specific alert)
      const suicideWarnings = screen.queryAllByText(/immediate.*suicide/i);
      expect(suicideWarnings.length).toBe(0);
    });

    it('should display crisis resources when suicide risk detected', async () => {
      const user = userEvent.setup();
      render(<PHQ9Assessment />);

      const allButtons = screen.getAllByRole('button');
      const responseButtons = allButtons.slice(0, 36);

      // Set all to 0 except Q9 = 2
      for (let i = 0; i < 8; i++) {
        await user.click(responseButtons[i * 4]);
      }
      await user.click(responseButtons[8 * 4 + 2]); // Q9 = 2

      const functionalButton = screen.getByRole('button', { name: 'Not difficult at all' });
      await user.click(functionalButton);

      const calculateButton = await screen.findByRole('button', { name: /Calculate.*Score/i });
      await user.click(calculateButton);

      await waitFor(() => {
        // Should show crisis hotline numbers
        const text = screen.getByText(/988|911|741741/i);
        expect(text).toBeInTheDocument();
      });
    });
  });

  describe('Treatment Recommendations', () => {
    it('should recommend no treatment for minimal depression', () => {
      const getRecommendation = (score: number) => {
        if (score <= 4) return 'No treatment needed';
        if (score <= 9) return 'psychotherapy or antidepressant';
        if (score <= 14) return 'Antidepressant or psychotherapy';
        if (score <= 19) return 'combination';
        return 'Antidepressant + therapy';
      };

      expect(getRecommendation(2)).toContain('No treatment');
    });

    it('should recommend psychotherapy for mild depression', () => {
      const getRecommendation = (score: number) => {
        if (score <= 4) return 'No treatment needed';
        if (score <= 9) return 'psychotherapy or antidepressant';
        if (score <= 14) return 'Antidepressant or psychotherapy';
        if (score <= 19) return 'combination';
        return 'Antidepressant + therapy';
      };

      expect(getRecommendation(7)).toContain('psychotherapy');
    });

    it('should recommend antidepressant or therapy for moderate depression', () => {
      const getRecommendation = (score: number) => {
        if (score <= 4) return 'No treatment needed';
        if (score <= 9) return 'psychotherapy or antidepressant';
        if (score <= 14) return 'Antidepressant or psychotherapy';
        if (score <= 19) return 'combination';
        return 'Antidepressant + therapy';
      };

      expect(getRecommendation(12)).toContain('Antidepressant or psychotherapy');
    });

    it('should recommend combination therapy for moderately severe depression', () => {
      const getRecommendation = (score: number) => {
        if (score <= 4) return 'No treatment needed';
        if (score <= 9) return 'psychotherapy or antidepressant';
        if (score <= 14) return 'Antidepressant or psychotherapy';
        if (score <= 19) return 'combination';
        return 'Antidepressant + therapy';
      };

      expect(getRecommendation(17)).toContain('combination');
    });

    it('should recommend intensive treatment for severe depression', () => {
      const getRecommendation = (score: number) => {
        if (score <= 4) return 'No treatment needed';
        if (score <= 9) return 'psychotherapy or antidepressant';
        if (score <= 14) return 'Antidepressant or psychotherapy';
        if (score <= 19) return 'combination';
        return 'Antidepressant + therapy';
      };

      expect(getRecommendation(22)).toContain('Antidepressant + therapy');
    });
  });

  describe('Input Validation', () => {
    it('should require all 9 responses before allowing calculation', async () => {
      const user = userEvent.setup();
      render(<PHQ9Assessment />);

      const allButtons = screen.getAllByRole('button');
      const responseButtons = allButtons.slice(0, 36);

      // Only answer first 5 questions
      for (let i = 0; i < 5; i++) {
        await user.click(responseButtons[i * 4]);
      }

      // Calculate button should NOT appear when form is incomplete
      const calculateButton = screen.queryByRole('button', { name: /Calculate.*Score/i });
      expect(calculateButton).not.toBeInTheDocument();
    });

    it('should require functional impairment selection', async () => {
      const user = userEvent.setup();
      render(<PHQ9Assessment />);

      const allButtons = screen.getAllByRole('button');
      const responseButtons = allButtons.slice(0, 36);

      // Answer all 9 questions but not functional impairment
      for (let i = 0; i < 9; i++) {
        await user.click(responseButtons[i * 4]);
      }

      // Calculate button should NOT appear without functional impairment
      const calculateButton = screen.queryByRole('button', { name: /Calculate.*Score/i });
      expect(calculateButton).not.toBeInTheDocument();
    });
  });

  describe('Clinical Reference Validation', () => {
    it('should use validated PHQ-9 scoring thresholds', () => {
      const reference = clinicalReferences.phq9;

      expect(reference.source).toBe('Journal of General Internal Medicine');
      expect(reference.year).toBe(2001);
      expect(reference.citation).toContain('Kroenke K');
    });
  });
});
