/**
 * PII Masking Utilities for HIPAA Compliance
 *
 * Provides functions to hash and mask Protected Health Information (PHI)
 * to prevent exposure in logs, error messages, or AI processing pipelines.
 *
 * HIPAA Requirements Addressed:
 * - De-identification of patient data (§164.514(a))
 * - Safe Harbor method for age generalization (§164.514(b)(2))
 * - Minimum necessary standard (§164.502(b))
 *
 * @module piiMasking
 */

import type { PatientProfile } from '../../types/storage';

/**
 * Configuration for PII masking operations
 */
export interface PIIMaskingConfig {
  /** Hash algorithm - SHA-256 is HIPAA-compliant */
  hashAlgorithm: 'SHA-256';
  /** Include timestamp in hash to prevent rainbow table attacks */
  includeTimestamp: boolean;
  /** Application-level pepper for additional security */
  pepper: string;
}

/**
 * Masked patient data safe for logging and display
 */
export interface MaskedPatientData {
  /** Hashed combination of identifying information */
  hashedId: string;
  /** Display initials (e.g., "J.D." for John Doe) */
  displayInitials: string;
  /** Age group bucket (e.g., "25-34" instead of exact age) */
  ageGroup: string;
  /** Original UUID for internal lookups */
  originalId: string;
  /** Masked medical record number (last 4 digits only) */
  maskedMRN?: string;
}

/**
 * Default configuration for PII masking
 */
const DEFAULT_CONFIG: PIIMaskingConfig = {
  hashAlgorithm: 'SHA-256',
  includeTimestamp: false, // Deterministic hashing for consistency
  pepper: 'clinical-toolkit-v1-pepper' // Should be in .env for production
};

/**
 * Hash a sensitive string using SHA-256
 *
 * @param input - The sensitive string to hash
 * @param config - Masking configuration
 * @returns Hex-encoded hash string
 *
 * @example
 * ```typescript
 * const hash = await hashString('John Doe|1990-01-01', DEFAULT_CONFIG);
 * // Returns: "a3c5f7e9..."
 * ```
 */
async function hashString(
  input: string,
  config: PIIMaskingConfig = DEFAULT_CONFIG
): Promise<string> {
  // Validate Web Crypto API availability
  if (!globalThis.crypto?.subtle) {
    console.warn('⚠️  Web Crypto API not available, using fallback hash');
    return fallbackHash(input);
  }

  try {
    const encoder = new TextEncoder();
    const timestamp = config.includeTimestamp ? Date.now().toString() : '';
    const dataString = input + timestamp + config.pepper;
    const data = encoder.encode(dataString);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('🔒 Hashing failed, using fallback:', error);
    return fallbackHash(input);
  }
}

/**
 * Fallback hash function for environments without Web Crypto API
 * Uses simple string hashing (NOT cryptographically secure)
 */
function fallbackHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

/**
 * Calculate age from date of birth string
 *
 * @param dob - Date of birth in ISO format (YYYY-MM-DD)
 * @returns Age in years
 */
function calculateAge(dob: string): number {
  try {
    const birthDate = new Date(dob);

    // Check for invalid date
    if (isNaN(birthDate.getTime())) {
      return -1; // Signal invalid date
    }

    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return Math.max(0, age); // Prevent negative ages
  } catch (error) {
    console.error('🔒 Age calculation failed:', error);
    return -1; // Signal invalid date
  }
}

/**
 * Convert age to age group bucket (HIPAA Safe Harbor method)
 *
 * Per HIPAA §164.514(b)(2)(i)(A): Ages > 89 must be aggregated
 *
 * @param age - Age in years
 * @returns Age group string (e.g., "25-34")
 */
function getAgeGroup(age: number): string {
  if (age < 0) return 'Invalid';
  if (age < 5) return '0-4';
  if (age < 12) return '5-11';
  if (age < 18) return '12-17';
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  if (age < 65) return '55-64';
  if (age < 75) return '65-74';
  if (age < 90) return '75-89';
  return '90+'; // HIPAA requires aggregation of ages > 89
}

/**
 * Mask medical record number (show last 4 digits only)
 *
 * @param mrn - Full medical record number
 * @returns Masked MRN (e.g., "****5678")
 */
function maskMRN(mrn: string | undefined): string | undefined {
  if (!mrn) return undefined;

  const cleaned = mrn.replace(/[^0-9]/g, ''); // Remove non-numeric characters
  if (cleaned.length <= 4) {
    return '****'; // Too short to show partial
  }

  const lastFour = cleaned.slice(-4);
  // Always show exactly 4 asterisks regardless of input length
  return '****' + lastFour;
}

/**
 * Mask patient personally identifiable information
 *
 * Creates a hashed identifier and displayable masked data that can be
 * safely used in logs, error messages, and UI without exposing PHI.
 *
 * @param patient - Patient profile containing PII
 * @param config - Optional masking configuration
 * @returns Masked patient data safe for non-secure contexts
 *
 * @example
 * ```typescript
 * const masked = await maskPatientPII(patient);
 * console.log(masked.displayInitials); // "J.D."
 * console.log(masked.ageGroup); // "25-34"
 * console.log(masked.hashedId); // "a3c5f7e9..."
 * ```
 */
export async function maskPatientPII(
  patient: PatientProfile,
  config: PIIMaskingConfig = DEFAULT_CONFIG
): Promise<MaskedPatientData> {
  // Create deterministic hashed ID from identifying information
  const identityString = [
    patient.firstName,
    patient.lastName,
    patient.dateOfBirth,
    patient.medicalRecordNumber || ''
  ].join('|');

  const hashedId = await hashString(identityString, config);

  // Create displayable initials
  const firstInitial = (patient.firstName || '?').charAt(0).toUpperCase();
  const lastInitial = (patient.lastName || '?').charAt(0).toUpperCase();
  const displayInitials = `${firstInitial}.${lastInitial}.`;

  // Convert DOB to age group (HIPAA Safe Harbor)
  const age = calculateAge(patient.dateOfBirth);
  const ageGroup = getAgeGroup(age);

  // Mask MRN if present
  const maskedMRN = maskMRN(patient.medicalRecordNumber);

  return {
    hashedId,
    displayInitials,
    ageGroup,
    originalId: patient.id,
    maskedMRN
  };
}

/**
 * Create a safe display name for UI elements
 *
 * Format: "J.D. (25-34)" instead of "John Doe (32 years old)"
 *
 * @param maskedData - Masked patient data
 * @returns Display-safe string
 *
 * @example
 * ```typescript
 * const displayName = createSafeDisplayName(masked);
 * // Returns: "J.D. (25-34)"
 * ```
 */
export function createSafeDisplayName(maskedData: MaskedPatientData): string {
  return `${maskedData.displayInitials} (${maskedData.ageGroup})`;
}

/**
 * Create a safe display name with masked MRN
 *
 * Format: "J.D. (25-34) [****5678]"
 *
 * @param maskedData - Masked patient data
 * @returns Display-safe string with MRN
 */
export function createSafeDisplayNameWithMRN(maskedData: MaskedPatientData): string {
  const baseName = createSafeDisplayName(maskedData);
  return maskedData.maskedMRN
    ? `${baseName} [${maskedData.maskedMRN}]`
    : baseName;
}

/**
 * Check if a string contains potential PII
 *
 * Useful for validation before logging or error reporting.
 *
 * @param text - Text to check for PII
 * @returns True if potential PII detected
 *
 * @example
 * ```typescript
 * if (containsPotentialPII(errorMessage)) {
 *   console.error('Error occurred for patient:', maskedData.hashedId);
 * } else {
 *   console.error(errorMessage);
 * }
 * ```
 */
export function containsPotentialPII(text: string): boolean {
  // Check for common PII patterns
  const patterns = [
    /\b[A-Z][a-z]+ [A-Z][a-z]+\b/, // Full names (e.g., "John Doe")
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN format
    /\b\d{4}-\d{2}-\d{2}\b/, // Date format (potential DOB)
    /\b[A-Z0-9]{6,}\b/, // Potential MRN
    /\b\d{10}\b/, // Phone numbers
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i // Email addresses
  ];

  return patterns.some(pattern => pattern.test(text));
}

/**
 * Sanitize error message to remove potential PII
 *
 * @param error - Error object or message
 * @param maskedData - Masked patient data for replacement
 * @returns Sanitized error message
 */
export function sanitizeErrorMessage(
  error: Error | string,
  maskedData?: MaskedPatientData
): string {
  const message = typeof error === 'string' ? error : error.message;

  if (!containsPotentialPII(message)) {
    return message;
  }

  // Replace with safe identifier if available
  if (maskedData) {
    return `Error for patient ${maskedData.displayInitials} (ID: ${maskedData.hashedId.substring(0, 8)}...)`;
  }

  return 'Error occurred (PII redacted from message)';
}

/**
 * Create audit log entry with masked PII
 *
 * @param action - Action performed
 * @param maskedData - Masked patient data
 * @param details - Additional non-PII details
 * @returns Audit log entry object
 */
export interface AuditLogEntry {
  timestamp: string;
  action: string;
  patientHashedId: string;
  patientDisplay: string;
  details?: Record<string, unknown>;
}

export function createAuditLogEntry(
  action: string,
  maskedData: MaskedPatientData,
  details?: Record<string, unknown>
): AuditLogEntry {
  return {
    timestamp: new Date().toISOString(),
    action,
    patientHashedId: maskedData.hashedId,
    patientDisplay: createSafeDisplayName(maskedData),
    details
  };
}

/**
 * Export only masked data for analytics or external systems
 *
 * @param patients - Array of patient profiles
 * @param config - Optional masking configuration
 * @returns Array of masked patient data
 */
export async function maskPatientBatch(
  patients: PatientProfile[],
  config: PIIMaskingConfig = DEFAULT_CONFIG
): Promise<MaskedPatientData[]> {
  return Promise.all(
    patients.map(patient => maskPatientPII(patient, config))
  );
}
