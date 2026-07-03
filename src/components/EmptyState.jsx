import React from 'react';

/**
 * Empty state display with icon, title, message, and optional call-to-action.
 */
export const EmptyState = ({
  icon,
  title,
  message,
  action,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center text-center py-12 sm:py-16 px-6 ${className}`}>
    {icon && (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-br from-primary-light to-secondary flex items-center justify-center mb-5 shadow-sm">
        {typeof icon === 'string' ? (
          <span className="text-3xl sm:text-4xl">{icon}</span>
        ) : (
          icon
        )}
      </div>
    )}
    <h3 className="text-lg sm:text-xl font-semibold text-foreground">{title}</h3>
    {message && (
      <p className="text-muted-foreground text-sm mt-2 max-w-sm leading-relaxed">{message}</p>
    )}
    {action && <div className="mt-6 flex gap-3 flex-wrap justify-center">{action}</div>}
  </div>
);
