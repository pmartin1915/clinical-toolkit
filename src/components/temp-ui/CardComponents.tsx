import React from 'react';
import { clsx } from 'clsx';

// CardHeader Component
export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'clinical' | 'compact';
  padding?: 'none' | 'sm' | 'default' | 'lg';
}

const headerVariants = {
  default: '',
  clinical: 'border-b border-gray-200 dark:border-gray-600',
  compact: '',
};

const headerPadding = {
  none: '',
  sm: 'p-3',
  default: 'p-4',
  lg: 'p-6',
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'default',
}) => {
  return (
    <div className={clsx(
      headerVariants[variant],
      headerPadding[padding],
      className
    )}>
      {children}
    </div>
  );
};

// CardTitle Component  
export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'clinical' | 'large';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const titleVariants = {
  default: 'text-gray-900 dark:text-gray-100',
  clinical: 'text-gray-900 dark:text-gray-100 font-semibold',
  large: 'text-gray-900 dark:text-gray-100 font-bold',
};

const titleSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
}) => {
  return (
    <h3 className={clsx(
      titleVariants[variant],
      titleSizes[size],
      className
    )}>
      {children}
    </h3>
  );
};

// CardContent Component
export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'default' | 'lg';
}

const contentPadding = {
  none: '',
  sm: 'p-3',
  default: 'p-4',
  lg: 'p-6',
};

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
  padding = 'default',
}) => {
  return (
    <div className={clsx(
      contentPadding[padding],
      className
    )}>
      {children}
    </div>
  );
};