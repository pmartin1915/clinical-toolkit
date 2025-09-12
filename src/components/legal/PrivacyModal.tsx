import { LegalDocument } from './LegalDocument';
import { privacyPolicy } from '../../data/legal/privacy';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  showAcceptButton?: boolean;
  onAccept?: () => void;
  isAccepted?: boolean;
}

export const PrivacyModal = ({
  isOpen,
  onClose,
  showAcceptButton = false,
  onAccept,
  isAccepted = false
}: PrivacyModalProps) => {
  if (!isOpen) return null;

  return (
    <LegalDocument
      title={privacyPolicy.title}
      lastUpdated={privacyPolicy.lastUpdated}
      effectiveDate={privacyPolicy.effectiveDate}
      content={privacyPolicy.content}
      onClose={onClose}
      showAcceptButton={showAcceptButton}
      onAccept={onAccept}
      isAccepted={isAccepted}
    />
  );
};