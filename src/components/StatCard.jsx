import React from 'react';
import { GlassCard } from './GlassCard';

/**
 * Dashboard / report stat card with icon, label, value, and accent.
 */
export const StatCard = ({
  title,
  value,
  icon: Icon,
  accent = 'primary',
  isCurrency = false,
  valueClassName = '',
  delay = 0,
}) => {
  const iconBg = {
    primary:     'bg-primary-light text-primary',
    success:     'bg-success-light text-success',
    destructive: 'bg-destructive-light text-destructive',
    gold:        'bg-amber-50 text-accent-gold',
    lavender:    'bg-purple-50 text-accent-lavender',
    info:        'bg-info-light text-info',
  };

  const formatted = isCurrency && typeof value === 'number'
    ? `₵${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : value;

  return (
    <GlassCard
      hover
      accent={accent}
      className="p-5 sm:p-6 flex flex-col gap-3 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
        {Icon && (
          <div className={`p-2 rounded-lg ${iconBg[accent] || iconBg.primary}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight ${valueClassName || 'text-foreground'}`}>
        {formatted}
      </h3>
    </GlassCard>
  );
};
