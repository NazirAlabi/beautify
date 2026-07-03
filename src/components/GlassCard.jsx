import React from 'react';

/**
 * Glass-morphism card container.
 * @param {'default'|'heavy'} variant
 * @param {boolean} hover – enable lift-on-hover
 * @param {'primary'|'success'|'destructive'|'gold'|'lavender'|null} accent – left-edge gradient accent
 */
export const GlassCard = ({
  children,
  className = '',
  variant = 'default',
  hover = false,
  accent = null,
  ...props
}) => {
  const base = variant === 'heavy' ? 'glass-panel-heavy' : 'glass-panel';
  const hoverCls = hover ? 'card-hover' : '';

  const accentColors = {
    primary:     'from-primary to-accent-coral',
    success:     'from-success to-emerald-400',
    destructive: 'from-destructive to-orange-400',
    gold:        'from-accent-gold to-amber-400',
    lavender:    'from-accent-lavender to-indigo-400',
    info:        'from-info to-cyan-400',
  };

  return (
    <div className={`${base} ${hoverCls} relative overflow-hidden ${className}`} {...props}>
      {accent && (
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b ${accentColors[accent] || accentColors.primary} rounded-l-2xl`}
        />
      )}
      {children}
    </div>
  );
};
