import React from 'react';

/**
 * Reusable button component with variant support.
 * @param {'primary'|'secondary'|'destructive'|'ghost'} variant
 * @param {'sm'|'md'|'lg'} size
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  iconRight: IconRight,
  ...props
}) => {
  const base = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    destructive: 'btn-destructive',
    ghost: 'font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-[var(--surface-hover)]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <button
      className={`${base[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : 18} />}
      {children}
      {IconRight && <IconRight size={size === 'sm' ? 16 : 18} />}
    </button>
  );
};
