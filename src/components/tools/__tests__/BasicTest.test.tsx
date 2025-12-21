import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useClinicalStore } from '../../../store/clinicalStore';
import type { AssessmentResult } from '../../../types/storage';

// Simple test component
const TestComponent = ({ title }: { title: string }) => {
  return <div data-testid="test-component">{title}</div>;
};

describe('Basic Testing Framework', () => {
  // Reset the store before each test
  beforeEach(() => {
    useClinicalStore.getState().clearAllData();
    localStorage.clear();
  });

  it('renders a simple component', () => {
    render(<TestComponent title="Test Title" />);
    
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('can access the clinical store', () => {
    const { getState } = useClinicalStore;
    const { generateId, saveAssessment } = getState();

    expect(generateId).toBeDefined();
    expect(saveAssessment).toBeDefined();

    const id = generateId();
    expect(typeof id).toBe('string');
    // The new generateId is different, so the regex needs to be updated
    expect(id).toMatch(/^[0-9a-z]+$/);
  });

  it('can perform operations with the clinical store', () => {
    const { getState } = useClinicalStore;

    const mockAssessment: AssessmentResult = {
      id: 'test-assessment',
      patientId: 'test-patient',
      conditionId: 'test-condition',
      toolId: 'test-tool',
      toolName: 'Test Tool',
      responses: { q1: 5 },
      score: 5,
      severity: 'test',
      recommendations: ['test'],
      timestamp: new Date().toISOString()
    };

    // saveAssessment is synchronous in the store
    getState().saveAssessment(mockAssessment);

    const assessments = getState().getPatientAssessments('test-patient');
    expect(assessments).toHaveLength(1);
    expect(assessments[0]).toEqual(mockAssessment);
  });

  it('can mock localStorage operations', () => {
    const testKey = 'test-key';
    const testValue = 'test-value';

    localStorage.setItem(testKey, testValue);
    expect(localStorage.setItem).toHaveBeenCalledWith(testKey, testValue);

    localStorage.getItem(testKey);
    expect(localStorage.getItem).toHaveBeenCalledWith(testKey);
  });

  it('can mock window methods', () => {
    window.alert('test message');
    expect(window.alert).toHaveBeenCalledWith('test message');

    const confirmed = window.confirm('test confirmation');
    expect(window.confirm).toHaveBeenCalledWith('test confirmation');
    expect(confirmed).toBe(true);
  });
});