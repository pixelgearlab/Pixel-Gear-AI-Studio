
import React from 'react';
import { AppMode, Theme } from '../types';

interface ModeTogglerProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  theme: Theme;
}

export const ModeToggler: React.FC<ModeTogglerProps> = ({ currentMode, onModeChange, theme }) => {
  const modes = Object.values(AppMode);

  return (
    <div className="flex w-full max-w-md mx-auto p-1 bg-white/10 rounded-xl backdrop-blur-lg mb-8">
      {modes.map((mode) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          className={`w-1/2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 ${theme.ring} focus:ring-offset-2 focus:ring-offset-slate-900/50 ${
            currentMode === mode
              ? `${theme.bg} text-white shadow-lg`
              : 'text-slate-300 hover:bg-white/5'
          }`}
        >
          {mode}
        </button>
      ))}
    </div>
  );
};
