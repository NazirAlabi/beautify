import React from 'react';

/**
 * Form select field with label and glass styling.
 */
export const SelectField = ({
  label,
  required = false,
  options = [],
  placeholder,
  className = '',
  ...selectProps
}) => (
  <div className={`space-y-2 ${className}`}>
    {label && (
      <label className="text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
    )}
    <div className="relative">
      <select
        className="glass-input h-12 appearance-none pr-10"
        {...selectProps}
      >
        {placeholder && (
          <option value="" disabled>{placeholder}</option>
        )}
        {options.map((opt) =>
          typeof opt === 'string' ? (
            <option key={opt} value={opt}>{opt}</option>
          ) : (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          )
        )}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  </div>
);
