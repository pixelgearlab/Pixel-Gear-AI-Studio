import React, { useState, useEffect } from 'react';
import { XCircleIcon, CheckIcon, QuestionMarkCircleIcon } from './icons';
import { THEMES, BACKGROUNDS } from '../constants';
import { Theme, AppSettings } from '../types';
import { ApiGuideModal } from './ApiGuideModal';

interface SettingsPanelProps {
  isVisible: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isVisible, onClose, settings, onSettingsChange }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [isGuideVisible, setIsGuideVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setLocalSettings(settings);
    }
  }, [isVisible, settings]);

  const handleThemeSelect = (theme: Theme) => {
    setLocalSettings(prev => ({ ...prev, themeName: theme.name }));
  };

  const handleBackgroundSelect = (bg: { name: string; url: string }) => {
    setLocalSettings(prev => ({ ...prev, backgroundUrl: bg.url }));
  };
  
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSettings(prev => ({ ...prev, apiKey: e.target.value }));
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };


  return (
    <>
      <ApiGuideModal isVisible={isGuideVisible} onClose={() => setIsGuideVisible(false)} />
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm sm:max-w-md bg-slate-900/80 backdrop-blur-xl border-l border-white/20 shadow-2xl transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between p-4 border-b border-white/20">
            <h2 className="text-xl font-semibold text-white">Settings</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors duration-200">
              <XCircleIcon className="w-7 h-7" />
            </button>
          </header>

          <div className="flex-grow p-4 overflow-y-auto space-y-8">
            {/* API Key Input Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                 <h3 className="text-lg font-semibold text-white">API Configuration</h3>
                 <button onClick={() => setIsGuideVisible(true)} className="text-slate-400 hover:text-indigo-300 transition-colors" aria-label="Open API key guide">
                    <QuestionMarkCircleIcon className="w-6 h-6" />
                 </button>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg space-y-3">
                  <label htmlFor="apiKey" className="font-semibold text-slate-200">Gemini API Key</label>
                  <p className="text-sm text-slate-400">
                      Your API key is stored in your browser's local storage and is not sent to our servers.
                  </p>
                  <input
                      id="apiKey"
                      type="password"
                      value={localSettings.apiKey || ''}
                      onChange={handleApiKeyChange}
                      placeholder="Enter your Gemini API Key"
                      className="w-full bg-slate-900/70 border border-slate-600 p-2 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
              </div>
            </div>
            
            {/* Theme Selector */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Theme</h3>
              <div className="grid grid-cols-3 gap-3">
                {THEMES.map(theme => (
                  <button key={theme.name} onClick={() => handleThemeSelect(theme)} className="flex flex-col items-center justify-center gap-2 p-2 rounded-lg transition-all duration-200" style={{ outline: localSettings.themeName === theme.name ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.2)' }}>
                    <div className={`w-full h-8 rounded-md ${theme.bg}`}></div>
                    <span className={`text-xs ${localSettings.themeName === theme.name ? 'text-indigo-300' : 'text-slate-400'}`}>{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Selector */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Background</h3>
              <div className="grid grid-cols-3 gap-3">
                {BACKGROUNDS.map(bg => (
                  <button key={bg.name} onClick={() => handleBackgroundSelect(bg)} className="aspect-square rounded-lg overflow-hidden transition-all duration-200" style={{ outline: localSettings.backgroundUrl === bg.url ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.2)' }}>
                    <img src={bg.url} alt={bg.name} className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            </div>

          </div>

          <footer className="p-4 border-t border-white/20">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors duration-200 text-base"
            >
              <CheckIcon className="w-6 h-6" />
              Save & Close
            </button>
          </footer>
        </div>
      </aside>
    </>
  );
};