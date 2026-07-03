import React from 'react';

const gradients = [
  'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-sky-400 to-blue-500',
  'from-fuchsia-400 to-pink-600',
  'from-lime-400 to-green-500',
  'from-cyan-400 to-blue-500',
];

/**
 * Avatar circle with initials and deterministic gradient based on name.
 * @param {'sm'|'md'|'lg'} size
 */
export const Avatar = ({ name = '', size = 'md', className = '' }) => {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Deterministic gradient based on name
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const gradient = gradients[hash % gradients.length];

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
  };

  return (
    <div
      className={`bg-linear-to-br ${gradient} rounded-full flex items-center justify-center text-white font-bold shadow-md ${sizes[size]} ${className}`}
    >
      {initials || '?'}
    </div>
  );
};
