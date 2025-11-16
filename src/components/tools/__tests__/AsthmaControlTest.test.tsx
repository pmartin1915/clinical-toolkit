import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AsthmaControlTest } from '../AsthmaControlTest';
import { storageManager } from '../../../utils/storage';

describe('AsthmaControlTest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the initial assessment form', () => {
    render(<AsthmaControlTest />);

    expect(screen.getByText('Asthma Control Test (ACT)')).toBeInTheDocument();
    expect(screen.getByText(/Assess how well your asthma has been controlled in the past 4 weeks/)).toBeInTheDocument();
    expect(screen.getByText(/In the past 4 weeks, how much of the time did your asthma keep you from getting as much done/)).toBeInTheDocument();
  });

  it('shows all questions immediately', () => {
    render(<AsthmaControlTest />);

    // All 5 questions should be visible
    expect(screen.getByText(/In the past 4 weeks, how much of the time did your asthma keep you from getting as much done/)).toBeInTheDocument();
    expect(screen.getByText(/During the past 4 weeks, how often have you had shortness of breath/)).toBeInTheDocument();
    expect(screen.getByText(/how often did your asthma symptoms .* wake you up at night/)).toBeInTheDocument();
    expect(screen.getByText(/how often have you used your rescue inhaler/)).toBeInTheDocument();
    expect(screen.getByText(/How would you rate your asthma control/)).toBeInTheDocument();
  });

  it('allows answering questions and updates progress', async () => {
    const user = userEvent.setup();
    render(<AsthmaControlTest />);

    // Initially shows 0 of 5
    expect(screen.getByText('0 of 5')).toBeInTheDocument();

    // Answer first question
    const noneOfTimeOptions = screen.getAllByText('None of the time');
    await user.click(noneOfTimeOptions[0]); // First question

    // Progress should update to 1 of 5
    expect(screen.getByText('1 of 5')).toBeInTheDocument();
  });

  it('calculates and displays results after completing all questions', async () => {
    const user = userEvent.setup();
    render(<AsthmaControlTest />);

    // Calculate button should be disabled initially
    const calculateButton = screen.getByText('Calculate ACT Score');
    expect(calculateButton).toBeDisabled();

    // Answer all 5 questions with maximum scores (5 points each = 25 total)
    // Question 1: "None of the time" (appears twice - once per question)
    const noneOfTimeOptions = screen.getAllByText('None of the time');
    await user.click(noneOfTimeOptions[0]);

    // Question 2: "Not at all" (for shortness of breath)
    const notAtAllOptions = screen.getAllByText('Not at all');
    await user.click(notAtAllOptions[0]);

    // Question 3: "Not at all" (for night symptoms)
    await user.click(notAtAllOptions[1]);

    // Question 4: "Not at all" (for rescue inhaler)
    await user.click(notAtAllOptions[2]);

    // Question 5: "Completely controlled"
    await user.click(screen.getByText('Completely controlled'));

    // Now calculate button should be enabled
    await user.click(calculateButton);

    // Should show results
    await waitFor(() => {
      expect(screen.getByText(/ACT Score: 25/)).toBeInTheDocument();
      expect(screen.getByText('Well-Controlled Asthma')).toBeInTheDocument();
    });
  });

  it('saves results when save button is clicked', async () => {
    const user = userEvent.setup();
    render(<AsthmaControlTest />);

    // Answer all questions
    const noneOfTimeOptions = screen.getAllByText('None of the time');
    await user.click(noneOfTimeOptions[0]);

    const notAtAllOptions = screen.getAllByText('Not at all');
    await user.click(notAtAllOptions[0]);
    await user.click(notAtAllOptions[1]);
    await user.click(notAtAllOptions[2]);

    await user.click(screen.getByText('Completely controlled'));

    // Calculate results
    await user.click(screen.getByText('Calculate ACT Score'));

    // Save results
    await waitFor(() => {
      expect(screen.getByText('Save Results')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Save Results'));

    await waitFor(() => {
      expect(storageManager.saveAssessment).toHaveBeenCalledWith(
        expect.objectContaining({
          conditionId: 'asthma',
          toolId: 'act',
          toolName: 'Asthma Control Test',
          score: expect.any(Number),
          severity: expect.any(String)
        })
      );
    });
  });

  it('allows restarting the assessment after viewing results', async () => {
    const user = userEvent.setup();
    render(<AsthmaControlTest />);

    // Complete assessment
    const noneOfTimeOptions = screen.getAllByText('None of the time');
    await user.click(noneOfTimeOptions[0]);

    const notAtAllOptions = screen.getAllByText('Not at all');
    await user.click(notAtAllOptions[0]);
    await user.click(notAtAllOptions[1]);
    await user.click(notAtAllOptions[2]);

    await user.click(screen.getByText('Completely controlled'));
    await user.click(screen.getByText('Calculate ACT Score'));

    // Should show results
    await waitFor(() => {
      expect(screen.getByText('Take Test Again')).toBeInTheDocument();
    });

    // Restart assessment
    await user.click(screen.getByText('Take Test Again'));

    // Should be back to initial state
    expect(screen.getByText('0 of 5')).toBeInTheDocument();
    expect(screen.getByText('Calculate ACT Score')).toBeDisabled();
  });

  it('handles errors gracefully when saving fails', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock saveAssessment to reject
    vi.mocked(storageManager.saveAssessment).mockRejectedValueOnce(new Error('Save failed'));

    render(<AsthmaControlTest />);

    // Complete assessment
    const noneOfTimeOptions = screen.getAllByText('None of the time');
    await user.click(noneOfTimeOptions[0]);

    const notAtAllOptions = screen.getAllByText('Not at all');
    await user.click(notAtAllOptions[0]);
    await user.click(notAtAllOptions[1]);
    await user.click(notAtAllOptions[2]);

    await user.click(screen.getByText('Completely controlled'));
    await user.click(screen.getByText('Calculate ACT Score'));

    await waitFor(() => {
      expect(screen.getByText('Save Results')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Save Results'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error saving ACT results:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});