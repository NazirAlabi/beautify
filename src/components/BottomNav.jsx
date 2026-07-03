import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navItems } from './Sidebar';

/**
 * Mobile bottom navigation bar with glass effect and gradient active indicator.
 */
export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 glass-panel-heavy p-1.5 z-50 flex justify-around">
      {navItems.slice(0, 5).map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 relative min-w-[48px] ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {/* Gradient active indicator bar */}
            {isActive && (
              <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-gradient-to-r from-primary to-accent-coral rounded-full" />
            )}
            <Icon
              size={22}
              className={`transition-all duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}
            />
            <span
              className={`text-[10px] mt-1 font-semibold transition-all ${
                isActive ? 'text-primary' : 'opacity-50'
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
