import React from 'react';
import { clsx } from 'clsx';

export interface MedicalCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'filled' | 'medical';
  size?: 'sm' | 'md' | 'lg';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export interface MedicalCardComponent extends React.FC<MedicalCardProps> {
  Interactive: React.FC<MedicalCardProps>;
}

const cardVariants = {
  default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
  outline: 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600',
  filled: 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600',
  medical: 'bg-white dark:bg-gray-800 border border-primary-200 dark:border-primary-700 border-l-4 border-l-primary-600',
};

const cardSizes = {
  sm: 'p-4',
  md: 'p-6', 
  lg: 'p-8',
};

const MedicalCardBase: React.FC<MedicalCardProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  header,
  footer,
  onClick,
  disabled = false,
}) => {
  const Component = onClick ? 'button' : 'div';
  
  const cardClasses = clsx(
    'rounded-lg shadow-sm transition-all',
    cardVariants[variant],
    cardSizes[size],
    onClick && !disabled && 'cursor-pointer hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600',
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  return (
    <Component
      className={cardClasses}
      onClick={onClick && !disabled ? onClick : undefined}
      disabled={disabled}
    >
      {header && (
        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
          {header}
        </div>
      )}
      
      <div>
        {children}
      </div>
      
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          {footer}
        </div>
      )}
    </Component>
  );
};

// Interactive sub-component for clickable cards
const Interactive: React.FC<MedicalCardProps> = (props) => {
  return <MedicalCardBase {...props} />;
};

// Create the main component with Interactive property
export const MedicalCard = MedicalCardBase as MedicalCardComponent;
MedicalCard.Interactive = Interactive;