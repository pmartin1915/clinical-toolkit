/**
 * Legal consent tracking and storage utilities
 * Manages user acceptance of legal documents (Disclaimer, Terms, Privacy Policy)
 */

export interface LegalConsent {
  disclaimer: boolean;
  terms: boolean;
  privacy: boolean;
  timestamp: number;
  version: string;
}

export interface LegalConsentRecord {
  accepted: boolean;
  timestamp: number;
  version: string;
  documentVersion: string;
}

const STORAGE_KEYS = {
  LEGAL_CONSENT: 'clinical_wizard_legal_consent',
  DISCLAIMER_CONSENT: 'clinical_wizard_disclaimer_consent',
  TERMS_CONSENT: 'clinical_wizard_terms_consent',
  PRIVACY_CONSENT: 'clinical_wizard_privacy_consent',
  CONSENT_VERSION: '1.0.0', // Update this when legal documents change
} as const;

/**
 * Legal consent manager class
 */
class LegalConsentManager {
  private getStorageItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
      return null;
    }
  }

  private setStorageItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('Failed to write to localStorage:', error);
      return false;
    }
  }

  /**
   * Get current consent status for all legal documents
   */
  getConsentStatus(): LegalConsent {
    const defaultConsent: LegalConsent = {
      disclaimer: false,
      terms: false,
      privacy: false,
      timestamp: 0,
      version: STORAGE_KEYS.CONSENT_VERSION,
    };

    try {
      const stored = this.getStorageItem(STORAGE_KEYS.LEGAL_CONSENT);
      if (!stored) return defaultConsent;

      const parsed = JSON.parse(stored) as LegalConsent;
      
      // Check if stored consent is for current version
      if (parsed.version !== STORAGE_KEYS.CONSENT_VERSION) {
        // Version mismatch - require re-consent
        return defaultConsent;
      }

      return {
        ...defaultConsent,
        ...parsed,
      };
    } catch (error) {
      console.warn('Failed to parse stored consent:', error);
      return defaultConsent;
    }
  }

  /**
   * Check if user has accepted all required legal documents
   */
  hasFullConsent(): boolean {
    const consent = this.getConsentStatus();
    return consent.disclaimer && consent.terms && consent.privacy;
  }

  /**
   * Check if user needs to accept legal documents (first time or version update)
   */
  needsConsent(): boolean {
    return !this.hasFullConsent();
  }

  /**
   * Record consent for disclaimer
   */
  acceptDisclaimer(): boolean {
    const currentConsent = this.getConsentStatus();
    const updatedConsent: LegalConsent = {
      ...currentConsent,
      disclaimer: true,
      timestamp: Date.now(),
      version: STORAGE_KEYS.CONSENT_VERSION,
    };

    const success = this.setStorageItem(STORAGE_KEYS.LEGAL_CONSENT, JSON.stringify(updatedConsent));
    
    // Also store individual disclaimer consent record
    if (success) {
      const disclaimerRecord: LegalConsentRecord = {
        accepted: true,
        timestamp: Date.now(),
        version: STORAGE_KEYS.CONSENT_VERSION,
        documentVersion: '2025-09-11', // Match disclaimer document version
      };
      this.setStorageItem(STORAGE_KEYS.DISCLAIMER_CONSENT, JSON.stringify(disclaimerRecord));
    }

    return success;
  }

  /**
   * Record consent for terms of service
   */
  acceptTerms(): boolean {
    const currentConsent = this.getConsentStatus();
    const updatedConsent: LegalConsent = {
      ...currentConsent,
      terms: true,
      timestamp: Date.now(),
      version: STORAGE_KEYS.CONSENT_VERSION,
    };

    const success = this.setStorageItem(STORAGE_KEYS.LEGAL_CONSENT, JSON.stringify(updatedConsent));
    
    // Also store individual terms consent record
    if (success) {
      const termsRecord: LegalConsentRecord = {
        accepted: true,
        timestamp: Date.now(),
        version: STORAGE_KEYS.CONSENT_VERSION,
        documentVersion: '2025-09-11', // Match terms document version
      };
      this.setStorageItem(STORAGE_KEYS.TERMS_CONSENT, JSON.stringify(termsRecord));
    }

    return success;
  }

  /**
   * Record consent for privacy policy
   */
  acceptPrivacy(): boolean {
    const currentConsent = this.getConsentStatus();
    const updatedConsent: LegalConsent = {
      ...currentConsent,
      privacy: true,
      timestamp: Date.now(),
      version: STORAGE_KEYS.CONSENT_VERSION,
    };

    const success = this.setStorageItem(STORAGE_KEYS.LEGAL_CONSENT, JSON.stringify(updatedConsent));
    
    // Also store individual privacy consent record
    if (success) {
      const privacyRecord: LegalConsentRecord = {
        accepted: true,
        timestamp: Date.now(),
        version: STORAGE_KEYS.CONSENT_VERSION,
        documentVersion: '2025-09-11', // Match privacy document version
      };
      this.setStorageItem(STORAGE_KEYS.PRIVACY_CONSENT, JSON.stringify(privacyRecord));
    }

    return success;
  }

  /**
   * Record consent for all documents at once
   */
  acceptAll(): boolean {
    const allConsent: LegalConsent = {
      disclaimer: true,
      terms: true,
      privacy: true,
      timestamp: Date.now(),
      version: STORAGE_KEYS.CONSENT_VERSION,
    };

    const success = this.setStorageItem(STORAGE_KEYS.LEGAL_CONSENT, JSON.stringify(allConsent));
    
    // Store individual consent records
    if (success) {
      const timestamp = Date.now();
      const documentVersion = '2025-09-11';
      
      const record: LegalConsentRecord = {
        accepted: true,
        timestamp,
        version: STORAGE_KEYS.CONSENT_VERSION,
        documentVersion,
      };

      this.setStorageItem(STORAGE_KEYS.DISCLAIMER_CONSENT, JSON.stringify(record));
      this.setStorageItem(STORAGE_KEYS.TERMS_CONSENT, JSON.stringify(record));
      this.setStorageItem(STORAGE_KEYS.PRIVACY_CONSENT, JSON.stringify(record));
    }

    return success;
  }

  /**
   * Get consent record for a specific document
   */
  getConsentRecord(documentType: 'disclaimer' | 'terms' | 'privacy'): LegalConsentRecord | null {
    const keyMap = {
      disclaimer: STORAGE_KEYS.DISCLAIMER_CONSENT,
      terms: STORAGE_KEYS.TERMS_CONSENT,
      privacy: STORAGE_KEYS.PRIVACY_CONSENT,
    };

    try {
      const stored = this.getStorageItem(keyMap[documentType]);
      if (!stored) return null;

      return JSON.parse(stored) as LegalConsentRecord;
    } catch (error) {
      console.warn(`Failed to parse ${documentType} consent record:`, error);
      return null;
    }
  }

  /**
   * Clear all consent data (for testing or reset purposes)
   */
  clearAllConsent(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEYS.LEGAL_CONSENT);
      localStorage.removeItem(STORAGE_KEYS.DISCLAIMER_CONSENT);
      localStorage.removeItem(STORAGE_KEYS.TERMS_CONSENT);
      localStorage.removeItem(STORAGE_KEYS.PRIVACY_CONSENT);
      return true;
    } catch (error) {
      console.warn('Failed to clear consent data:', error);
      return false;
    }
  }

  /**
   * Get consent timestamp for display purposes
   */
  getConsentTimestamp(): Date | null {
    const consent = this.getConsentStatus();
    return consent.timestamp > 0 ? new Date(consent.timestamp) : null;
  }

  /**
   * Check if consent is required due to document version updates
   */
  isConsentExpired(): boolean {
    const consent = this.getConsentStatus();
    return consent.version !== STORAGE_KEYS.CONSENT_VERSION;
  }

  /**
   * Get user-friendly consent status summary
   */
  getConsentSummary(): {
    hasFullConsent: boolean;
    needsConsent: boolean;
    consentDate: Date | null;
    missingConsents: string[];
    version: string;
  } {
    const consent = this.getConsentStatus();
    const missingConsents: string[] = [];

    if (!consent.disclaimer) missingConsents.push('Medical Disclaimer');
    if (!consent.terms) missingConsents.push('Terms of Service');
    if (!consent.privacy) missingConsents.push('Privacy Policy');

    return {
      hasFullConsent: this.hasFullConsent(),
      needsConsent: this.needsConsent(),
      consentDate: this.getConsentTimestamp(),
      missingConsents,
      version: consent.version,
    };
  }
}

// Export singleton instance
export const legalConsentManager = new LegalConsentManager();

// Export convenience functions
export const hasFullLegalConsent = (): boolean => legalConsentManager.hasFullConsent();
export const needsLegalConsent = (): boolean => legalConsentManager.needsConsent();
export const acceptAllLegalConsent = (): boolean => legalConsentManager.acceptAll();
export const getLegalConsentSummary = () => legalConsentManager.getConsentSummary();