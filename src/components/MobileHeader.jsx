import React from 'react';
import { Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Mobile header with "Beautify by Ramat" branding and theme toggle.
 */
export const MobileHeader = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="md:hidden flex items-center justify-between mb-6 px-1">
      <div className="flex items-center gap-2.5">
        <div className="bg-linear-to-br from-primary to-accent-coral p-2 rounded-lg text-white shadow-lg shadow-primary/25">
          <Sparkles size={18} />
        </div>
        <div className="leading-tight">
          <span className="font-display text-2xl bg-linear-to-r from-primary to-accent-coral bg-clip-text text-transparent">
            Beautify
          </span>
          <p className="text-xs text-muted-foreground font-medium -mt-0.5 tracking-wide">by Ramat</p>
        </div>
      </div>
      <button
        onClick={toggleTheme}
        className="glass-panel p-2.5 text-muted-foreground hover:text-foreground transition-all duration-300"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
};
