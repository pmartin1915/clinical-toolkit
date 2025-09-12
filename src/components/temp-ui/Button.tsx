import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
}

const buttonVariants = {
  default: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
  ghost: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-primary-500',
  destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  icon: 'p-2',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'default', 
    size = 'md', 
    icon, 
    iconPosition = 'left', 
    className = '', 
    children, 
    disabled = false,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const classes = clsx(
      baseClasses,
      buttonVariants[variant],
      buttonSizes[size],
      className
    );

    const renderContent = () => {
      if (!icon) {
        return children;
      }

      const iconElement = (
        <span className={clsx(
          size === 'icon' ? '' : children && iconPosition === 'left' ? 'mr-2' : children && iconPosition === 'right' ? 'ml-2' : ''
        )}>
          {icon}
        </span>
      );

      if (iconPosition === 'right') {
        return (
          <>
            {children}
            {iconElement}
          </>
        );
      }

      return (
        <>
          {iconElement}
          {children}
        </>
      );
    };

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled}
        {...props}
      >
        {renderContent()}
      </button>
    );
  }
);

Button.displayName = 'Button';