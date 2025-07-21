import React from 'react';
import { PromptRefinementType, Theme } from '../types';

interface PromptRefinementSelectorProps {
  onSelect: (type: PromptRefinementType) => void;
  isLoading: boolean;
  theme: Theme;
}

export const PromptRefinementSelector: React.FC<PromptRefinementSelectorProps> = React.memo(({
  onSelect,
  isLoading,
  theme,
}) => {
  // Filter out the 'General' type to have a clean 3x3 grid
  const refinementTypes = Object.values(PromptRefinementType).filter(type => type !== PromptRefinementType.General);
  
  // A simple helper to format enum keys like "ThreeDRender" to "3D Render"
  const formatLabel = (label: string) => {
    return label
      .replace(/([A-Z])/g, ' $1')
      .replace('Three D', '3D')
      .trim();
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {refinementTypes.map((type) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          disabled={isLoading}
          className={`px-3 py-3 text-sm font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 ${theme.ring} focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed ${theme.bg} ${theme.text} ${theme.hover} shadow-lg`}
        >
          {formatLabel(type)}
        </button>
      ))}
    </div>
  );
});
PromptRefinementSelector.displayName = 'PromptRefinementSelector';