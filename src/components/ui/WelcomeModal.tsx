import { useState, useEffect } from 'react';
import { Heart, Calculator, BookOpen, Shield, AlertTriangle, FileText, Lock, CheckCircle } from 'lucide-react';
import { SimpleModal, Button } from '../temp-ui';
import { DisclaimerModal, TermsModal, PrivacyModal } from '../legal';
import { legalConsentManager, needsLegalConsent } from '../../utils/legalConsent';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal = ({ isOpen, onClose }: WelcomeModalProps) => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'legal'>('welcome');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [consentStatus, setConsentStatus] = useState({
    disclaimer: false,
    terms: false,
    privacy: false,
  });

  // Check legal consent status on mount
  useEffect(() => {
    const consent = legalConsentManager.getConsentStatus();
    setConsentStatus({
      disclaimer: consent.disclaimer,
      terms: consent.terms,
      privacy: consent.privacy,
    });
    
    // If user needs legal consent, start with legal step
    if (needsLegalConsent()) {
      setCurrentStep('legal');
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    legalConsentManager.acceptDisclaimer();
    setConsentStatus(prev => ({ ...prev, disclaimer: true }));
    setShowDisclaimer(false);
  };

  const handleAcceptTerms = () => {
    legalConsentManager.acceptTerms();
    setConsentStatus(prev => ({ ...prev, terms: true }));
    setShowTerms(false);
  };

  const handleAcceptPrivacy = () => {
    legalConsentManager.acceptPrivacy();
    setConsentStatus(prev => ({ ...prev, privacy: true }));
    setShowPrivacy(false);
  };

  const handleProceedToApp = () => {
    if (currentStep === 'legal' && hasAllConsents()) {
      setCurrentStep('welcome');
    } else if (currentStep === 'welcome') {
      onClose();
    }
  };

  const hasAllConsents = () => {
    return consentStatus.disclaimer && consentStatus.terms && consentStatus.privacy;
  };

  // Debug logging
  console.log('WelcomeModal state:', {
    currentStep,
    showDisclaimer,
    showTerms,
    showPrivacy,
    consentStatus,
    isOpen
  });

  const canProceed = () => {
    if (currentStep === 'legal') {
      return hasAllConsents();
    }
    return true;
  };

  const footerContent = (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      {currentStep === 'legal' ? (
        <>
          <Button
            onClick={handleProceedToApp}
            className="flex-1"
            size="lg"
            disabled={!canProceed()}
          >
            {hasAllConsents() ? 'Continue to App' : 'Accept All Required Documents'}
          </Button>
          <div className="text-xs text-gray-500 text-center sm:text-left mt-2">
            You must accept all legal documents to use the application
          </div>
        </>
      ) : (
        <>
          <Button
            onClick={handleProceedToApp}
            className="flex-1"
            size="lg"
          >
            Get Started
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            size="lg"
            className="sm:w-auto"
          >
            Skip intro
          </Button>
        </>
      )}
    </div>
  );

  const renderLegalStep = () => (
    <>
      {/* Header Icon and Description */}
      <div className="flex items-center justify-center mb-6">
        <div className="bg-red-500/10 p-4 rounded-full">
          <Shield className="w-12 h-12 text-red-600" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <p className="text-base text-muted-foreground leading-relaxed">
            Before using Clinical Wizard, please review and accept our legal documents. 
            These protect both you and us, and ensure you understand how to use this educational tool safely.
          </p>
        </div>

        {/* Legal Documents */}
        <div className="space-y-3">
          {/* Medical Disclaimer */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Medical Disclaimer</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Important medical and educational limitations
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {consentStatus.disclaimer && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                <Button
                  size="sm"
                  variant={consentStatus.disclaimer ? "outline" : "default"}
                  onClick={() => {
                    console.log('Disclaimer button clicked');
                    setShowDisclaimer(true);
                  }}
                >
                  {consentStatus.disclaimer ? 'Review' : 'Read & Accept'}
                </Button>
              </div>
            </div>
          </div>

          {/* Terms of Service */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Terms of Service</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Usage guidelines and service boundaries
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {consentStatus.terms && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                <Button
                  size="sm"
                  variant={consentStatus.terms ? "outline" : "default"}
                  onClick={() => {
                    console.log('Terms button clicked');
                    setShowTerms(true);
                  }}
                >
                  {consentStatus.terms ? 'Review' : 'Read & Accept'}
                </Button>
              </div>
            </div>
          </div>

          {/* Privacy Policy */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Privacy Policy</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    How we handle your data and privacy
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {consentStatus.privacy && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                <Button
                  size="sm"
                  variant={consentStatus.privacy ? "outline" : "default"}
                  onClick={() => {
                    console.log('Privacy button clicked');
                    setShowPrivacy(true);
                  }}
                >
                  {consentStatus.privacy ? 'Review' : 'Read & Accept'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Progress</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Object.values(consentStatus).filter(Boolean).length} of 3 completed
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(Object.values(consentStatus).filter(Boolean).length / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Legal Requirements Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Legal Requirement:</strong> You must accept all three documents to use Clinical Wizard. 
                This ensures you understand the educational nature of this tool and your responsibilities when using it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderWelcomeStep = () => (
    <>
      {/* Header Icon and Description */}
      <div className="flex items-center justify-center mb-6">
        <div className="bg-primary/10 p-4 rounded-full">
          <Heart className="w-12 h-12 text-primary" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <p className="text-base text-muted-foreground leading-relaxed">
            Think of this as your <strong>pocket health reference</strong> - whether you're a curious parent, 
            someone managing a health condition, or a healthcare professional looking for quick answers.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-info/5 rounded-lg p-4 border border-info/20">
            <div className="flex items-center space-x-3 mb-2">
              <BookOpen className="w-5 h-5 text-info" />
              <h3 className="font-semibold text-card-foreground">Easy to Understand</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Medical information explained in plain English. No confusing jargon!
            </p>
          </div>

          <div className="bg-success/5 rounded-lg p-4 border border-success/20">
            <div className="flex items-center space-x-3 mb-2">
              <Calculator className="w-5 h-5 text-success" />
              <h3 className="font-semibold text-card-foreground">Helpful Tools</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Interactive calculators and assessments to track your health.
            </p>
          </div>

          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-card-foreground">Trusted Information</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Based on official medical guidelines from trusted organizations.
            </p>
          </div>

          <div className="bg-warning/5 rounded-lg p-4 border border-warning/20">
            <div className="flex items-center space-x-3 mb-2">
              <Heart className="w-5 h-5 text-warning" />
              <h3 className="font-semibold text-card-foreground">Works Anywhere</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              No internet? No problem! Install it on your phone or computer.
            </p>
          </div>
        </div>

        {/* What You Can Do */}
        <div className="bg-muted/50 rounded-lg p-5 border border-border/50">
          <h3 className="font-semibold text-card-foreground mb-3">What can you do here?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start space-x-2">
              <span className="text-info mt-1">•</span>
              <span><strong>Learn about health conditions</strong> in simple terms</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-success mt-1">•</span>
              <span><strong>Use health calculators</strong> like blood pressure trackers and risk assessments</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary mt-1">•</span>
              <span><strong>Take self-assessments</strong> for anxiety, depression, and other conditions</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-warning mt-1">•</span>
              <span><strong>Get evidence-based information</strong> to discuss with your doctor</span>
            </li>
          </ul>
        </div>

        {/* Important Disclaimer */}
        <div className="bg-warning/5 border border-warning/30 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <p className="text-sm text-warning-foreground">
                <strong>Important:</strong> This tool is for educational purposes only. 
                Always consult with healthcare professionals for medical advice, diagnosis, or treatment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <SimpleModal
        open={isOpen}
        onOpenChange={onClose}
        title={currentStep === 'legal' ? 'Legal Requirements' : 'Welcome to Clinical Wizard!'}
        description={currentStep === 'legal' ? 'Please review and accept our legal documents' : 'Your friendly health companion'}
        size="lg"
        variant="medical"
        footer={footerContent}
      >
        {currentStep === 'legal' ? renderLegalStep() : renderWelcomeStep()}
      </SimpleModal>

      {/* Legal Document Modals */}
      <DisclaimerModal
        isOpen={showDisclaimer}
        onClose={() => {
          console.log('Disclaimer modal closing');
          setShowDisclaimer(false);
        }}
        showAcceptButton={true}
        onAccept={handleAcceptDisclaimer}
        isAccepted={consentStatus.disclaimer}
      />
      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        showAcceptButton={true}
        onAccept={handleAcceptTerms}
        isAccepted={consentStatus.terms}
      />
      <PrivacyModal
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        showAcceptButton={true}
        onAccept={handleAcceptPrivacy}
        isAccepted={consentStatus.privacy}
      />
    </>
  );
};