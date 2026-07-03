import React from 'react';

/**
 * Consistent page header with title, subtitle, and optional right-side action.
 */
export const PageHeader = ({
  title,
  subtitle,
  titleClassName = '',
  action,
  className = '',
}) => (
  <header className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 ${className}`}>
    <div>
      <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight text-foreground ${titleClassName}`}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground mt-1 font-medium text-sm sm:text-base">{subtitle}</p>
      )}
    </div>
    {action && <div>{action}</div>}
  </header>
);
