import { LegalDocument } from './LegalDocument';
import { medicalDisclaimer } from '../../data/legal/disclaimer';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  showAcceptButton?: boolean;
  onAccept?: () => void;
  isAccepted?: boolean;
}

export const DisclaimerModal = ({
  isOpen,
  onClose,
  showAcceptButton = false,
  onAccept,
  isAccepted = false
}: DisclaimerModalProps) => {
  if (!isOpen) return null;

  return (
    <LegalDocument
      title={medicalDisclaimer.title}
      lastUpdated={medicalDisclaimer.lastUpdated}
      effectiveDate={medicalDisclaimer.effectiveDate}
      content={medicalDisclaimer.content}
      onClose={onClose}
      showAcceptButton={showAcceptButton}
      onAccept={onAccept}
      isAccepted={isAccepted}
    />
  );
};