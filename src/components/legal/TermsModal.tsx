import { LegalDocument } from './LegalDocument';
import { termsOfService } from '../../data/legal/terms';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showAcceptButton?: boolean;
  onAccept?: () => void;
  isAccepted?: boolean;
}

export const TermsModal = ({
  isOpen,
  onClose,
  showAcceptButton = false,
  onAccept,
  isAccepted = false
}: TermsModalProps) => {
  if (!isOpen) return null;

  return (
    <LegalDocument
      title={termsOfService.title}
      lastUpdated={termsOfService.lastUpdated}
      effectiveDate={termsOfService.effectiveDate}
      content={termsOfService.content}
      onClose={onClose}
      showAcceptButton={showAcceptButton}
      onAccept={onAccept}
      isAccepted={isAccepted}
    />
  );
};