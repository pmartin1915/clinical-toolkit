import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

export interface SimpleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'medical' | 'destructive';
  footer?: React.ReactNode;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

const modalSizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full',
};

const modalVariants = {
  default: 'bg-white dark:bg-gray-800',
  medical: 'bg-white dark:bg-gray-800 border-t-4 border-t-primary-600',
  destructive: 'bg-white dark:bg-gray-800 border-t-4 border-t-red-600',
};

export const SimpleModal: React.FC<SimpleModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  variant = 'default',
  footer,
  children,
  showCloseButton = true,
}) => {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal */}
      <div className={clsx(
        'relative w-full mx-4 rounded-lg shadow-2xl transition-all flex flex-col',
        'max-h-[85vh] sm:max-h-[90vh]',
        modalSizes[size],
        modalVariants[variant]
      )}>

        {/* Header */}
        {(title || description || showCloseButton) && (
          <div className="flex items-start justify-between p-6 pb-4 flex-shrink-0">
            <div className="flex-1">
              {title && (
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={() => onOpenChange(false)}
                className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        )}

        {/* Content - Scrollable */}
        <div className={clsx(
          'px-6 overflow-y-auto flex-1',
          (!title && !description) ? 'pt-6' : '',
          !footer ? 'pb-6' : ''
        )}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg border-t border-gray-200 dark:border-gray-600 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Render to portal - fallback to document.body if modal-root doesn't exist
  try {
    const modalRoot = document.getElementById('modal-root') || document.body;
    return createPortal(modalContent, modalRoot);
  } catch (error) {
    console.error('Portal rendering error:', error);
    return modalContent; // Fallback to direct rendering
  }
};