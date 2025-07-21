import React from 'react';
import { StylePreset, Theme } from '../types';

interface StyleSelectorProps {
  selected: StylePreset;
  onSelect: (preset: StylePreset) => void;
  isLoading: boolean;
  theme: Theme;
}

export const StyleSelector: React.FC<StyleSelectorProps> = React.memo(({
  selected,
  onSelect,
  isLoading,
  theme,
}) => {
  const presets = Object.values(StylePreset);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {presets.map((preset) => (
        <button
          key={preset}
          onClick={() => onSelect(preset)}
          disabled={isLoading}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 ${theme.ring} focus:ring-opacity-75 ${
            selected === preset
              ? `${theme.bg} ${theme.text} shadow-lg`
              : 'bg-white/10 text-slate-300 hover:bg-white/20'
          }`}
        >
          {preset}
        </button>
      ))}
    </div>
  );
});
StyleSelector.displayName = 'StyleSelector';
