import { useState } from 'react';
import { Stethoscope, Shield, FileText, Lock, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from '../temp-ui';
import { DisclaimerModal, TermsModal, PrivacyModal } from '../legal';

export const Footer = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Clinical Wizard</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Educational Medical Reference</p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                A comprehensive, evidence-based clinical reference application for healthcare professionals, 
                students, and anyone interested in medical knowledge.
              </p>

              {/* Important Notice */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200 text-sm mb-1">
                      Educational Use Only
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      This application is for educational and informational purposes only. 
                      Always consult healthcare professionals for medical advice.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Legal Information</h4>
              <ul className="space-y-3">
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDisclaimer(true)}
                    icon={<Shield className="w-4 h-4" />}
                    iconPosition="left"
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 justify-start p-0 h-auto"
                  >
                    Medical Disclaimer
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTerms(true)}
                    icon={<FileText className="w-4 h-4" />}
                    iconPosition="left"
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 justify-start p-0 h-auto"
                  >
                    Terms of Service
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPrivacy(true)}
                    icon={<Lock className="w-4 h-4" />}
                    iconPosition="left"
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 justify-start p-0 h-auto"
                  >
                    Privacy Policy
                  </Button>
                </li>
              </ul>
            </div>

            {/* Medical Sources */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Evidence-Based Sources</h4>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-center space-x-2">
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  <span>American Heart Association (AHA)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  <span>American College of Cardiology (ACC)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  <span>American Diabetes Association (ADA)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  <span>American Psychological Association (APA)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  <span>Infectious Diseases Society (IDSA)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  <span>NICE Guidelines</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              
              {/* Copyright */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                © {currentYear} Clinical Wizard. All rights reserved.
              </div>

              {/* Version and Build Info */}
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <span>Version 1.0.0</span>
                <span>•</span>
                <span>Built with ❤️ for healthcare education</span>
              </div>
            </div>

            {/* Final Legal Notice */}
            <div className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
              <p>
                This application is for educational purposes only and is not intended to replace professional medical advice, 
                diagnosis, or treatment. Always seek the advice of qualified healthcare providers with any questions you may have 
                regarding a medical condition.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      <DisclaimerModal
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
      />
      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
      />
      <PrivacyModal
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />
    </>
  );
};