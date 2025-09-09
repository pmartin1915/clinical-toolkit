import { Heart, Calculator, BookOpen, Shield, AlertTriangle } from 'lucide-react';
import { SimpleModal, Button } from '@medical-wizards/ui';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal = ({ isOpen, onClose }: WelcomeModalProps) => {

  const footerContent = (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <Button
        onClick={onClose}
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
    </div>
  );

  return (
    <SimpleModal
      open={isOpen}
      onOpenChange={onClose}
      title="Welcome to Clinical Wizard!"
      description="Your friendly health companion"
      size="lg"
      variant="medical"
      footer={footerContent}
    >
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
    </SimpleModal>
  );
};