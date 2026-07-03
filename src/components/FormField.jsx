import React from 'react';

/**
 * Form field with label and glass-styled input.
 */
export const FormField = ({
  label,
  required = false,
  prefix,
  className = '',
  inputClassName = '',
  children, // for custom content inside
  ...inputProps
}) => (
  <div className={`space-y-2 ${className}`}>
    {label && (
      <label className="text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
    )}
    {children ? (
      children
    ) : prefix ? (
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
          {prefix}
        </span>
        <input
          className={`glass-input h-12 pl-8 ${inputClassName}`}
          {...inputProps}
        />
      </div>
    ) : (
      <input
        className={`glass-input h-12 ${inputClassName}`}
        {...inputProps}
      />
    )}
  </div>
);
