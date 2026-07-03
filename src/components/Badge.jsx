import React from 'react';

/**
 * Colored badge/pill for status and type indicators.
 * @param {'income'|'expense'|'success'|'warning'|'info'|'neutral'} variant
 */
export const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const styles = {
    income:  'bg-success-light text-success',
    expense: 'bg-destructive-light text-destructive',
    success: 'bg-success-light text-success',
    warning: 'bg-warning-light text-warning',
    info:    'bg-info-light text-info',
    neutral: 'bg-muted text-muted-foreground',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${styles[variant] || styles.neutral} ${className}`}>
      {children}
    </span>
  );
};
