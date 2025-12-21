import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { COPDAssessment } from '../COPDAssessment';

const mockSaveAssessment = vi.fn();
const mockGenerateId = vi.fn(() => 'test-id-456');

vi.mock('../../../store/clinicalStore', () => ({
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

describe('COPDAssessment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSaveAssessment.mockResolvedValue(undefined);
    mockGenerateId.mockReturnValue('test-id-456');
  });

  it('renders the initial COPD assessment interface', () => {
    render(<COPDAssessment />);
    
    expect(screen.getByText('COPD Assessment Test (CAT)')).toBeInTheDocument();
    expect(screen.getByText('Start Assessment')).toBeInTheDocument();
    expect(screen.getByText(/comprehensive tool for assessing the impact of COPD/)).toBeInTheDocument();
  });

  it('displays the first question when starting assessment', async () => {
    const user = userEvent.setup();
    render(<COPDAssessment />);
    
    await user.click(screen.getByText('Start Assessment'));
    
    expect(screen.getByText(/I never cough/)).toBeInTheDocument();
    expect(screen.getByText(/I cough all the time/)).toBeInTheDocument();
  });

  it('allows selecting responses on the slider scale', async () => {
    const user = userEvent.setup();
    render(<COPDAssessment />);
    
    await user.click(screen.getByText('Start Assessment'));
    
    // Find and interact with the slider input
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(1);
    
    fireEvent.change(sliders[0], { target: { value: '3' } });
    
    await user.click(screen.getByText('Next Question'));
    
    // Should move to second question
    expect(screen.getByText(/I have no phlegm/)).toBeInTheDocument();
  });

  it('calculates total score correctly', async () => {
    const user = userEvent.setup();
    render(<COPDAssessment />);
    
    await user.click(screen.getByText('Start Assessment'));
    
    // Answer all 8 questions with score of 2 each (total should be 16)
    for (let i = 0; i < 8; i++) {
      const sliders = screen.getAllByRole('slider');
      fireEvent.change(sliders[0], { target: { value: '2' } });
      
      if (i < 7) {
        await user.click(screen.getByText('Next Question'));
      } else {
        await user.click(screen.getByText('Complete Assessment'));
      }
    }
    
    expect(screen.getByText(/Your CAT Score: 16/)).toBeInTheDocument();
  });

  it('shows appropriate interpretation for different score ranges', async () => {
    const user = userEvent.setup();
    render(<COPDAssessment />);

    await user.click(screen.getByText('Start Assessment'));

    // Complete with low scores (should be low impact)
    for (let i = 0; i < 8; i++) {
      const sliders = screen.getAllByRole('slider');
      // Fire both input and change events to ensure state update
      fireEvent.input(sliders[0], { target: { value: '0' } });
      fireEvent.change(sliders[0], { target: { value: '0' } });

      if (i < 7) {
        await user.click(screen.getByText('Next Question'));
      } else {
        await user.click(screen.getByText('Complete Assessment'));
      }
    }

    expect(screen.getByText(/Low Impact/)).toBeInTheDocument();
  });

  it('saves assessment results successfully', async () => {
    const user = userEvent.setup();
    render(<COPDAssessment />);
    
    await user.click(screen.getByText('Start Assessment'));
    
    // Complete assessment
    for (let i = 0; i < 8; i++) {
      const sliders = screen.getAllByRole('slider');
      fireEvent.change(sliders[0], { target: { value: '2' } });
      
      if (i < 7) {
        await user.click(screen.getByText('Next Question'));
      } else {
        await user.click(screen.getByText('Complete Assessment'));
      }
    }
    
    await user.click(screen.getByText('Save Results'));
    
    await waitFor(() => {
      expect(mockSaveAssessment).toHaveBeenCalledWith(
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

  it('allows navigating back through questions', async () => {
    const user = userEvent.setup();
    render(<COPDAssessment />);

    await user.click(screen.getByText('Start Assessment'));

    // Answer first question to allow progression
    const sliders = screen.getAllByRole('slider');
    fireEvent.input(sliders[0], { target: { value: '2' } });
    fireEvent.change(sliders[0], { target: { value: '2' } });

    await user.click(screen.getByText('Next Question'));

    // Should be on question 2
    expect(screen.getByText(/I have no phlegm/)).toBeInTheDocument();

    await user.click(screen.getByText('← Previous'));

    // Should be back on question 1
    expect(screen.getByText(/I never cough/)).toBeInTheDocument();
  });

  it('prevents progression without answering current question', async () => {
    const user = userEvent.setup();
    render(<COPDAssessment />);
    
    await user.click(screen.getByText('Start Assessment'));
    
    // Try to go to next question without answering
    const nextButton = screen.getByText('Next Question');
    
    // Button should be disabled or clicking should not progress
    await user.click(nextButton);
    
    // Should still be on first question
    expect(screen.getByText(/I never cough/)).toBeInTheDocument();
  });

  it('resets assessment when taking test again', async () => {
    const user = userEvent.setup();
    render(<COPDAssessment />);

    await user.click(screen.getByText('Start Assessment'));

    // Answer first question
    const sliders = screen.getAllByRole('slider');
    fireEvent.input(sliders[0], { target: { value: '3' } });
    fireEvent.change(sliders[0], { target: { value: '3' } });
    await user.click(screen.getByText('Next Question'));

    // Go back to start
    await user.click(screen.getByText('← Previous'));
    await user.click(screen.getByText('← Back'));

    expect(screen.getByText('Start Assessment')).toBeInTheDocument();
  });
});