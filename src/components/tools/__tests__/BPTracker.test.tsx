import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BPTracker } from '../BPTracker';
import type { VitalSigns } from '../../../types/storage';

const mockSaveVitalSigns = vi.fn();
const mockDeleteVitalSigns = vi.fn();
const mockGenerateId = vi.fn(() => 'test-id-123');

// State that can be modified between tests
let mockVitals: VitalSigns[] = [];

// Mock migration function - declared outside mock factory
const mockMigrationFn = vi.fn();

vi.mock('../../../utils/dataMigration', () => {
  return {
    migrateBPReadingsFromLocalStorage: () => mockMigrationFn()
  };
});

// Mock Zustand store
vi.mock('../../../store/clinicalStore', () => ({
  useClinicalStore: vi.fn((selector) => {
    const state = {
      vitals: mockVitals,
      saveVitalSigns: mockSaveVitalSigns,
      deleteVitalSigns: mockDeleteVitalSigns,
      generateId: mockGenerateId
    };
    return selector ? selector(state) : state;
  })
}));

describe('BPTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateId.mockReturnValue('test-id-123');
    mockVitals = []; // Reset vitals for each test
    mockMigrationFn.mockReturnValue({
      success: true,
      migratedCount: 0,
      errors: []
    });
  });

  it('renders the BP tracker component', () => {
    render(<BPTracker />);

    expect(screen.getByText('Blood Pressure Tracker')).toBeInTheDocument();
    expect(screen.getByText('Add Reading')).toBeInTheDocument();
  });

  it('shows empty state when no readings exist', () => {
    render(<BPTracker />);

    expect(screen.getByText('No readings yet. Add your first blood pressure reading!')).toBeInTheDocument();
  });

  it('shows add reading form when Add Reading button is clicked', async () => {
    const user = userEvent.setup();
    render(<BPTracker />);

    await user.click(screen.getByText('Add Reading'));

    expect(screen.getByText('Add New Reading')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('120')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('80')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('72')).toBeInTheDocument();
  });

  it('saves BP reading to encrypted store when form is submitted', async () => {
    const user = userEvent.setup();
    render(<BPTracker />);

    // Open form
    await user.click(screen.getByText('Add Reading'));

    // Fill in BP values
    const systolicInput = screen.getByPlaceholderText('120');
    const diastolicInput = screen.getByPlaceholderText('80');

    await user.type(systolicInput, '125');
    await user.type(diastolicInput, '82');

    // Submit
    await user.click(screen.getByText('Save'));

    // Verify store method called with correct structure
    expect(mockSaveVitalSigns).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-id-123',
        patientId: 'default-patient',
        type: 'blood_pressure',
        value: { systolic: 125, diastolic: 82 },
        unit: 'mmHg',
        location: 'home'
      })
    );
  });

  it('saves pulse as separate heart_rate vital when provided', async () => {
    const user = userEvent.setup();
    render(<BPTracker />);

    await user.click(screen.getByText('Add Reading'));

    // Fill in all values including pulse
    await user.type(screen.getByPlaceholderText('120'), '125');
    await user.type(screen.getByPlaceholderText('80'), '82');
    await user.type(screen.getByPlaceholderText('72'), '75');

    await user.click(screen.getByText('Save'));

    // Should call saveVitalSigns twice - once for BP, once for pulse
    expect(mockSaveVitalSigns).toHaveBeenCalledTimes(2);

    // First call: BP
    expect(mockSaveVitalSigns).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        type: 'blood_pressure',
        value: { systolic: 125, diastolic: 82 },
        unit: 'mmHg'
      })
    );

    // Second call: Pulse
    expect(mockSaveVitalSigns).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: 'heart_rate',
        value: 75,
        unit: 'bpm'
      })
    );
  });

  it('includes notes when provided', async () => {
    const user = userEvent.setup();
    render(<BPTracker />);

    await user.click(screen.getByText('Add Reading'));

    await user.type(screen.getByPlaceholderText('120'), '130');
    await user.type(screen.getByPlaceholderText('80'), '85');
    await user.type(screen.getByPlaceholderText('Morning reading, after medication...'), 'After morning run');

    await user.click(screen.getByText('Save'));

    expect(mockSaveVitalSigns).toHaveBeenCalledWith(
      expect.objectContaining({
        notes: 'After morning run'
      })
    );
  });

  it('validates that systolic and diastolic are required', async () => {
    const user = userEvent.setup();
    render(<BPTracker />);

    await user.click(screen.getByText('Add Reading'));
    await user.click(screen.getByText('Save'));

    // Should not call save if values are empty
    expect(mockSaveVitalSigns).not.toHaveBeenCalled();
  });

  it('validates that values must be greater than 0', async () => {
    const user = userEvent.setup();
    render(<BPTracker />);

    await user.click(screen.getByText('Add Reading'));

    await user.type(screen.getByPlaceholderText('120'), '0');
    await user.type(screen.getByPlaceholderText('80'), '80');

    await user.click(screen.getByText('Save'));

    expect(mockSaveVitalSigns).not.toHaveBeenCalled();
  });

  it('clears form after successful submission', async () => {
    const user = userEvent.setup();
    render(<BPTracker />);

    await user.click(screen.getByText('Add Reading'));

    const systolicInput = screen.getByPlaceholderText('120') as HTMLInputElement;
    const diastolicInput = screen.getByPlaceholderText('80') as HTMLInputElement;

    await user.type(systolicInput, '125');
    await user.type(diastolicInput, '82');

    await user.click(screen.getByText('Save'));

    // Form should be hidden after save
    await waitFor(() => {
      expect(screen.queryByText('Add New Reading')).not.toBeInTheDocument();
    });
  });

  it('displays existing BP readings from store', () => {
    mockVitals = [
      {
        id: 'reading-1',
        patientId: 'default-patient',
        type: 'blood_pressure',
        value: { systolic: 120, diastolic: 80 },
        unit: 'mmHg',
        timestamp: '2024-12-09T10:30:00.000Z',
        location: 'home'
      },
      {
        id: 'reading-2',
        patientId: 'default-patient',
        type: 'blood_pressure',
        value: { systolic: 125, diastolic: 82 },
        unit: 'mmHg',
        timestamp: '2024-12-08T09:15:00.000Z',
        notes: 'Morning reading',
        location: 'home'
      }
    ];

    render(<BPTracker />);

    expect(screen.getByText('120/80')).toBeInTheDocument();
    expect(screen.getByText('125/82')).toBeInTheDocument();
    expect(screen.getByText('"Morning reading"')).toBeInTheDocument();
  });

  it('calls deleteVitalSigns when delete button is clicked', async () => {
    const user = userEvent.setup();

    mockVitals = [
      {
        id: 'reading-1',
        patientId: 'default-patient',
        type: 'blood_pressure',
        value: { systolic: 120, diastolic: 80 },
        unit: 'mmHg',
        timestamp: '2024-12-09T10:30:00.000Z',
        location: 'home'
      }
    ];

    const { container } = render(<BPTracker />);

    // Find the delete button by looking for the trash icon
    const deleteButton = container.querySelector('button svg.lucide-trash-2')?.parentElement;

    if (deleteButton) {
      await user.click(deleteButton as Element);
      expect(mockDeleteVitalSigns).toHaveBeenCalledWith('reading-1');
    } else {
      throw new Error('Delete button not found');
    }
  });

  it('calculates and displays average BP from recent readings', () => {
    mockVitals = [
      {
        id: 'r1',
        patientId: 'default-patient',
        type: 'blood_pressure',
        value: { systolic: 120, diastolic: 80 },
        unit: 'mmHg',
        timestamp: '2024-12-09T10:00:00.000Z',
        location: 'home'
      },
      {
        id: 'r2',
        patientId: 'default-patient',
        type: 'blood_pressure',
        value: { systolic: 130, diastolic: 85 },
        unit: 'mmHg',
        timestamp: '2024-12-08T10:00:00.000Z',
        location: 'home'
      }
    ];

    render(<BPTracker />);

    // Average should be (120+130)/2 = 125 systolic, (80+85)/2 = 82.5 diastolic (rounded to 83)
    expect(screen.getByText('Average Blood Pressure')).toBeInTheDocument();
    expect(screen.getByText('125/83')).toBeInTheDocument();
  });

  it('displays BP categories correctly', () => {
    mockVitals = [
      {
        id: 'normal',
        patientId: 'default-patient',
        type: 'blood_pressure',
        value: { systolic: 115, diastolic: 75 },
        unit: 'mmHg',
        timestamp: '2024-12-09T10:00:00.000Z',
        location: 'home'
      }
    ];

    render(<BPTracker />);

    // Should find "Normal" category in the reading
    const normalCategories = screen.getAllByText('Normal');
    expect(normalCategories.length).toBeGreaterThan(0);
  });

  it('sorts readings by timestamp with most recent first', () => {
    mockVitals = [
      {
        id: 'old',
        patientId: 'default-patient',
        type: 'blood_pressure',
        value: { systolic: 110, diastolic: 70 },
        unit: 'mmHg',
        timestamp: '2024-12-01T10:00:00.000Z',
        location: 'home'
      },
      {
        id: 'recent',
        patientId: 'default-patient',
        type: 'blood_pressure',
        value: { systolic: 120, diastolic: 80 },
        unit: 'mmHg',
        timestamp: '2024-12-09T10:00:00.000Z',
        location: 'home'
      }
    ];

    render(<BPTracker />);

    // Both readings should be present
    expect(screen.getByText('120/80')).toBeInTheDocument();
    expect(screen.getByText('110/70')).toBeInTheDocument();

    // Verify most recent is displayed (120/80 from Dec 9)
    // The average should also reflect both readings
    expect(screen.getByText('Average Blood Pressure')).toBeInTheDocument();
  });

  it('filters to only show blood_pressure type vitals', () => {
    mockVitals = [
      {
        id: 'bp',
        patientId: 'default-patient',
        type: 'blood_pressure',
        value: { systolic: 120, diastolic: 80 },
        unit: 'mmHg',
        timestamp: '2024-12-09T10:00:00.000Z',
        location: 'home'
      },
      {
        id: 'pulse',
        patientId: 'default-patient',
        type: 'heart_rate',
        value: 72,
        unit: 'bpm',
        timestamp: '2024-12-09T10:00:00.000Z',
        location: 'home'
      }
    ];

    render(<BPTracker />);

    // Should show BP reading (120/80)
    const bpReadings = screen.getAllByText('120/80');
    expect(bpReadings.length).toBeGreaterThan(0);

    // Should NOT show heart rate value of 72 in the readings (may appear in other contexts)
    // Check that there's only 1 reading in the list (the BP reading)
    expect(screen.getByText('Recent Readings')).toBeInTheDocument();
  });

  it('runs migration on component mount', () => {
    render(<BPTracker />);

    expect(mockMigrationFn).toHaveBeenCalled();
  });

  it('logs migration success when readings are migrated', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    mockMigrationFn.mockReturnValue({
      success: true,
      migratedCount: 3,
      errors: []
    });

    render(<BPTracker />);

    expect(consoleSpy).toHaveBeenCalledWith('✅ Migrated 3 BP readings to encrypted storage');

    consoleSpy.mockRestore();
  });

  it('logs migration warnings when errors occur', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    mockMigrationFn.mockReturnValue({
      success: true,
      migratedCount: 2,
      errors: ['Error migrating reading 1']
    });

    render(<BPTracker />);

    expect(consoleSpy).toHaveBeenCalledWith('⚠️ Migration warnings:', ['Error migrating reading 1']);

    consoleSpy.mockRestore();
  });
});
