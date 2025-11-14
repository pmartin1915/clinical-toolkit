import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple test component
const TestComponent = ({ title }: { title: string }) => {
  return <div data-testid="test-component">{title}</div>;
};

describe('Basic Testing Framework', () => {
  it('renders a simple component', () => {
    render(<TestComponent title="Test Title" />);
    
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('can access mocked storage manager', async () => {
    const { storageManager } = await import('../../../utils/storage');
    
    expect(storageManager.generateId).toBeDefined();
    expect(storageManager.saveAssessment).toBeDefined();
    
    const id = storageManager.generateId();
    expect(typeof id).toBe('string');
    expect(id).toMatch(/^test-id-/);
  });

  it('can test async operations', async () => {
    const { storageManager } = await import('../../../utils/storage');
    
    const mockAssessment = {
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

    await expect(storageManager.saveAssessment(mockAssessment)).resolves.toBeUndefined();
    expect(storageManager.saveAssessment).toHaveBeenCalledWith(mockAssessment);
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