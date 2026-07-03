import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, MinusCircle, Users, List, BarChart3, Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/income/new', icon: PlusCircle, label: 'Income' },
  { path: '/expense/new', icon: MinusCircle, label: 'Expense' },
  { path: '/transactions', icon: List, label: 'History' },
  { path: '/clients', icon: Users, label: 'Clients' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
];

export { navItems };

/**
 * Desktop sidebar navigation with logo, nav links, and theme toggle.
 */
export const Sidebar = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <aside className="hidden md:flex flex-col w-64 glass-panel-heavy fixed h-full z-20"
      style={{ borderRadius: 0, borderLeft: 'none', borderTop: 'none', borderBottom: 'none' }}
    >
      {/* Gradient accent line on right edge */}
      <div className="absolute right-0 top-8 bottom-8 w-[2px] bg-linear-to-b from-primary via-accent-lavender to-accent-gold opacity-20 rounded-full" />

      {/* Logo */}
      <div className="p-6 pb-4 flex items-center gap-3">
        <div className="bg-linear-to-br from-primary to-accent-coral p-2.5 rounded-xl text-white shadow-lg shadow-primary/25">
          <Sparkles size={20} />
        </div>
        <div className="leading-tight">
          <span className="font-display text-2xl bg-linear-to-r from-primary to-accent-coral bg-clip-text text-transparent">
            Beautify
          </span>
          <p className="text-[11px] text-muted-foreground font-medium -mt-0.5 tracking-wide">by Ramat</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-linear-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-(--surface-hover)'
              }`}
            >
              <Icon
                size={19}
                className={`transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`}
              />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.6)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="p-3 border-t border-border/40 mx-3 mb-3">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-(--surface-hover) transition-all duration-300"
        >
          <div className="relative w-5 h-5">
            <Sun
              size={18}
              className={`absolute inset-0 transition-all duration-500 ${isDark ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}
            />
            <Moon
              size={18}
              className={`absolute inset-0 transition-all duration-500 ${isDark ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`}
            />
          </div>
          <span className="font-medium text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </aside>
  );
};
