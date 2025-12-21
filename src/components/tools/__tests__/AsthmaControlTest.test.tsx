import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AsthmaControlTest } from '../AsthmaControlTest';

const mockSaveAssessment = vi.fn();
const mockGenerateId = vi.fn(() => 'test-id-123');

vi.mock('../../../store/clinicalStore', () => ({
  useClinicalStore: vi.fn(() => ({
    saveAssessment: mockSaveAssessment,
    generateId: mockGenerateId
  })),
  useClinicalStore: Object.assign(
    vi.fn(() => ({
      saveAssessment: mockSaveAssessment,
      generateId: mockGenerateId
    })),
    {
      getState: () => ({
        saveAssessment: mockSaveAssessment,
        generateId: mockGenerateId
      })
    }
  )
}));

describe('AsthmaControlTest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSaveAssessment.mockResolvedValue(undefined);
    mockGenerateId.mockReturnValue('test-id-123');
  });

  it('renders the initial assessment form', () => {
    render(<AsthmaControlTest />);
    
    expect(screen.getByText('Asthma Control Test (ACT)')).toBeInTheDocument();
    expect(screen.getByText('Take Assessment')).toBeInTheDocument();
    expect(screen.getByText(/comprehensive 5-question assessment/)).toBeInTheDocument();
  });

  it('shows first question when starting assessment', async () => {
    const user = userEvent.setup();
    render(<AsthmaControlTest />);
    
    await user.click(screen.getByText('Take Assessment'));
    
    expect(screen.getByText(/In the past 4 weeks, how much of the time did your asthma keep you from getting as much done/)).toBeInTheDocument();
    expect(screen.getByText('All of the time')).toBeInTheDocument();
    expect(screen.getByText('Most of the time')).toBeInTheDocument();
  });

  it('allows answering questions and progressing through assessment', async () => {
    const user = userEvent.setup();
    render(<AsthmaControlTest />);
    
    await user.click(screen.getByText('Take Assessment'));
    
    // Answer first question
    await user.click(screen.getByText('None of the time'));
    await user.click(screen.getByText('Next Question'));
    
    expect(screen.getByText(/During the past 4 weeks, how often have you had shortness of breath/)).toBeInTheDocument();
  });

  it('calculates and displays results after completing all questions', async () => {
    const user = userEvent.setup();
    render(<AsthmaControlTest />);

    await user.click(screen.getByText('Take Assessment'));

    // Answer all 5 questions with maximum scores (5 points each = 25 total)
    const maxScoreOptions = [
      'None of the time',        // Q1: work activities
      'Not at all',               // Q2: shortness of breath
      'Not at all',               // Q3: night symptoms
      'Not at all',               // Q4: rescue inhaler
      'Completely controlled'     // Q5: control rating
    ];

    for (let i = 0; i < 5; i++) {
      await user.click(screen.getByText(maxScoreOptions[i]));

      if (i < 4) {
        await user.click(screen.getByText('Next Question'));
      } else {
        await user.click(screen.getByText('Complete Assessment'));
      }
    }

    expect(screen.getByText(/Your ACT Score:/)).toBeInTheDocument();
    expect(screen.getByText('Well-Controlled Asthma')).toBeInTheDocument();
  });

  it('saves results when save button is clicked', async () => {
    const user = userEvent.setup();
    render(<AsthmaControlTest />);

    await user.click(screen.getByText('Take Assessment'));

    // Complete assessment quickly with maximum scores
    const maxScoreOptions = [
      'None of the time',        // Q1: work activities
      'Not at all',               // Q2: shortness of breath
      'Not at all',               // Q3: night symptoms
      'Not at all',               // Q4: rescue inhaler
      'Completely controlled'     // Q5: control rating
    ];

    for (let i = 0; i < 5; i++) {
      await user.click(screen.getByText(maxScoreOptions[i]));

      if (i < 4) {
        await user.click(screen.getByText('Next Question'));
      } else {
        await user.click(screen.getByText('Complete Assessment'));
      }
    }

    // Save results
    await user.click(screen.getByText('Save Results'));

    await waitFor(() => {
      expect(mockSaveAssessment).toHaveBeenCalledWith(
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

  it('allows restarting the assessment', async () => {
    const user = userEvent.setup();
    render(<AsthmaControlTest />);
    
    await user.click(screen.getByText('Take Assessment'));
    await user.click(screen.getByText('None of the time'));
    await user.click(screen.getByText('Next Question'));
    
    // Go back to start
    await user.click(screen.getByText('← Back'));
    
    expect(screen.getByText('Take Assessment')).toBeInTheDocument();
  });

  it('handles errors gracefully when saving fails', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock saveAssessment to reject BEFORE rendering
    mockSaveAssessment.mockReset();
    mockSaveAssessment.mockRejectedValue(new Error('Save failed'));

    render(<AsthmaControlTest />);

    await user.click(screen.getByText('Take Assessment'));

    // Complete assessment with maximum scores
    const maxScoreOptions = [
      'None of the time',        // Q1: work activities
      'Not at all',               // Q2: shortness of breath
      'Not at all',               // Q3: night symptoms
      'Not at all',               // Q4: rescue inhaler
      'Completely controlled'     // Q5: control rating
    ];

    for (let i = 0; i < 5; i++) {
      await user.click(screen.getByText(maxScoreOptions[i]));

      if (i < 4) {
        await user.click(screen.getByText('Next Question'));
      } else {
        await user.click(screen.getByText('Complete Assessment'));
      }
    }

    await user.click(screen.getByText('Save Results'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error saving ACT results:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});