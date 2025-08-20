// Remove unused imports
import { X, Heart, Calculator, BookOpen, Shield, AlertTriangle } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal = ({ isOpen, onClose }: WelcomeModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome to Clinical Toolkit!</h2>
                <p className="text-gray-600">Your friendly health companion</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 leading-relaxed">
                Think of this as your <strong>pocket health reference</strong> - whether you're a curious parent, 
                someone managing a health condition, or a healthcare professional looking for quick answers.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Easy to Understand</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Medical information explained in plain English. No confusing jargon!
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Calculator className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Helpful Tools</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Interactive calculators and assessments to track your health.
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Trusted Information</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Based on official medical guidelines from trusted organizations.
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Heart className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-gray-900">Works Anywhere</h3>
                </div>
                <p className="text-sm text-gray-600">
                  No internet? No problem! Install it on your phone or computer.
                </p>
              </div>
            </div>

            {/* What You Can Do */}
            <div className="bg-gray-50 rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-3">What can you do here?</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Learn about health conditions</strong> in simple terms</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Use health calculators</strong> like blood pressure trackers and risk assessments</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span><strong>Take self-assessments</strong> for anxiety, depression, and other conditions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span><strong>Get evidence-based information</strong> to discuss with your doctor</span>
                </li>
              </ul>
            </div>

            {/* Important Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> This tool is for educational purposes only. 
                    Always consult with healthcare professionals for medical advice, diagnosis, or treatment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Got it! Let's explore
            </button>
            <button
              onClick={onClose}
              className="sm:w-auto px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};