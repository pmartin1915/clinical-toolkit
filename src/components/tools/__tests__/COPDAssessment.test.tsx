import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { COPDAssessment } from '../COPDAssessment';
import { storageManager } from '../../../utils/storage';

describe('COPDAssessment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the initial COPD assessment interface', () => {
    render(<COPDAssessment />);

    expect(screen.getByText('COPD Assessment Test (CAT)')).toBeInTheDocument();
    expect(screen.getByText(/Measure the impact of COPD on your daily life/)).toBeInTheDocument();
    expect(screen.getByText(/I never cough \/ I cough all the time/)).toBeInTheDocument();
  });

  it('displays all questions immediately', () => {
    render(<COPDAssessment />);

    // All 8 questions should be visible
    expect(screen.getByText(/I never cough \/ I cough all the time/)).toBeInTheDocument();
    expect(screen.getByText(/I have no phlegm in my chest \/ My chest is completely full of phlegm/)).toBeInTheDocument();
    expect(screen.getByText(/My chest does not feel tight \/ My chest feels very tight/)).toBeInTheDocument();
    expect(screen.getByText(/When I walk up a hill or flight of stairs I am not breathless/)).toBeInTheDocument();
  });

  it('allows selecting responses with buttons', async () => {
    const user = userEvent.setup();
    render(<COPDAssessment />);

    // Initially shows 0 of 8
    expect(screen.getByText('0 of 8')).toBeInTheDocument();

    // Click score button for first question (score 2)
    const allButtons = screen.getAllByRole('button');
    const scoreButton = allButtons.find(btn => btn.textContent === '2');
    if (scoreButton) await user.click(scoreButton);

    // Progress should update to 1 of 8
    expect(screen.getByText('1 of 8')).toBeInTheDocument();
  });

  it('calculates total score correctly', async () => {
    const user = userEvent.setup();
    render(<COPDAssessment />);

    const calculateButton = screen.getByText('Calculate CAT Score');
    expect(calculateButton).toBeDisabled();

    // Answer all 8 questions with score of 2 each (total should be 16)
    const allButtons = screen.getAllByRole('button');
    const score2Buttons = allButtons.filter(btn => btn.textContent === '2');

    // Click each score "2" button for each of the 8 questions
    for (let i = 0; i < 8; i++) {
      await user.click(score2Buttons[i]);
    }

    // Calculate results
    await user.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText(/CAT Score: 16\/40/)).toBeInTheDocument();
    });
  });

  it('shows appropriate interpretation for different score ranges', async () => {
    const user = userEvent.setup();
    render(<COPDAssessment />);

    // Answer all questions with score 0 (should be low impact)
    const allButtons = screen.getAllByRole('button');
    const score0Buttons = allButtons.filter(btn => btn.textContent === '0');

    for (let i = 0; i < 8; i++) {
      await user.click(score0Buttons[i]);
    }

    await user.click(screen.getByText('Calculate CAT Score'));

    await waitFor(() => {
      expect(screen.getByText(/Low Impact/)).toBeInTheDocument();
    });
  });

  it('saves assessment results successfully', async () => {
    const user = userEvent.setup();
    render(<COPDAssessment />);

    // Answer all questions with score 2
    const allButtons = screen.getAllByRole('button');
    const score2Buttons = allButtons.filter(btn => btn.textContent === '2');

    for (let i = 0; i < 8; i++) {
      await user.click(score2Buttons[i]);
    }

    await user.click(screen.getByText('Calculate CAT Score'));

    await waitFor(() => {
      expect(screen.getByText('Save Results')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Save Results'));

    await waitFor(() => {
      expect(storageManager.saveAssessment).toHaveBeenCalledWith(
        expect.objectContaining({
          conditionId: 'copd',
          toolId: 'cat',
          toolName: 'COPD Assessment Test',
          score: 16,
          severity: expect.any(String)
        })
      );
    });
  });

  it('allows changing answers for questions', async () => {
    const user = userEvent.setup();
    render(<COPDAssessment />);

    // Answer first question with score 2
    const allButtons = screen.getAllByRole('button');
    const score2Buttons = allButtons.filter(btn => btn.textContent === '2');
    await user.click(score2Buttons[0]);

    expect(screen.getByText('1 of 8')).toBeInTheDocument();

    // Change answer to score 3
    const score3Buttons = allButtons.filter(btn => btn.textContent === '3');
    await user.click(score3Buttons[0]);

    // Still should be 1 of 8 (just changed the answer)
    expect(screen.getByText('1 of 8')).toBeInTheDocument();
  });

  it('prevents calculation without answering all questions', () => {
    render(<COPDAssessment />);

    // Calculate button should be disabled when not all questions answered
    const calculateButton = screen.getByText('Calculate CAT Score');
    expect(calculateButton).toBeDisabled();
  });

  it('resets assessment when taking test again', async () => {
    const user = userEvent.setup();
    render(<COPDAssessment />);

    // Complete assessment
    const allButtons = screen.getAllByRole('button');
    const score2Buttons = allButtons.filter(btn => btn.textContent === '2');

    for (let i = 0; i < 8; i++) {
      await user.click(score2Buttons[i]);
    }

    await user.click(screen.getByText('Calculate CAT Score'));

    await waitFor(() => {
      expect(screen.getByText('Take Test Again')).toBeInTheDocument();
    });

    // Restart
    await user.click(screen.getByText('Take Test Again'));

    // Should be back to initial state
    expect(screen.getByText('0 of 8')).toBeInTheDocument();
    expect(screen.getByText('Calculate CAT Score')).toBeDisabled();
  });
});