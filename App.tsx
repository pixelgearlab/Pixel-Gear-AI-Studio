import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { generateMetadata, generateStyledPrompt } from './services/geminiService';
import { StylePreset, MetadataResult, HistoryItem, AppSettings, Theme, AppMode, PromptResult, PromptRefinementType } from './types';
import { Spinner } from './components/Spinner';
import { UploadIcon, HistoryIcon, GearIcon } from './components/icons';
import { HistoryPanel } from './components/HistoryPanel';
import { Toast } from './components/Toast';
import { SettingsPanel } from './components/SettingsPanel';
import { StyleSelector } from './components/StyleSelector';
import { THEMES, BACKGROUNDS } from './constants';
import { ModeToggler } from './components/ModeToggler';
import { PromptResultDisplay } from './components/PromptResultDisplay';
import { PromptRefinementSelector } from './components/PromptRefinementSelector';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

const resizeImageForPreview = (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_DIMENSION = 400;
            let { width, height } = img;

            if (width > height) {
                if (width > MAX_DIMENSION) {
                    height = Math.round(height * (MAX_DIMENSION / width));
                    width = MAX_DIMENSION;
                }
            } else {
                if (height > MAX_DIMENSION) {
                    width = Math.round(width * (MAX_DIMENSION / height));
                    height = MAX_DIMENSION;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Failed to get canvas context'));

            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85)); // Use JPEG and compression
        };
        img.onerror = (err) => reject(err);
    });
};

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.MetadataGenerator);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [stylePreset, setStylePreset] = useState<StylePreset>(StylePreset.Short);
  const [userIdea, setUserIdea] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<MetadataResult | null>(null);
  const [promptResult, setPromptResult] = useState<PromptResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    themeName: THEMES[0].name,
    backgroundUrl: BACKGROUNDS[0].url,
    apiKey: '',
  });

  const activeTheme = THEMES.find(t => t.name === settings.themeName) || THEMES[0];
  
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('pg-metadata-history');
      if (storedHistory) setHistory(JSON.parse(storedHistory));

      const storedSettings = localStorage.getItem('pg-app-settings');
      if(storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(prev => ({...prev, ...parsedSettings}));
      }

    } catch (e) {
      console.error("Failed to parse from localStorage", e);
    }
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);
  
  const handleSettingsChange = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
        localStorage.setItem('pg-app-settings', JSON.stringify(newSettings));
        showToast("Settings saved!", "success");
    } catch (e) {
        console.error("Failed to save settings to localStorage", e);
        showToast("Couldn't save settings. Storage might be full.", "error");
    }
  }, [showToast]);

  const handleImageUpload = useCallback((file: File) => {
    setImageFile(file);
    setMetadata(null);
    setPromptResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
        try {
            const fullDataUrl = reader.result as string;
            if (!fullDataUrl) throw new Error("Could not read file data.");
            
            const base64String = fullDataUrl.split(',')[1];
            setImageBase64(base64String);

            const smallPreview = await resizeImageForPreview(fullDataUrl);
            setImagePreview(smallPreview);

        } catch (e) {
            console.error("Failed to process image preview:", e);
            showToast("Couldn't create image preview.", "error");
            setImagePreview(reader.result as string);
        }
    };
    reader.readAsDataURL(file);
  }, [showToast]);

  const handleImageRemove = useCallback(() => {
    setImageFile(null);
    setImageBase64(null);
    setImagePreview(null);
    setMetadata(null);
    setPromptResult(null);
    setError(null);
  }, []);
  
  const handleModeChange = useCallback((mode: AppMode) => {
    if (mode === appMode) return;
    setAppMode(mode);
    setMetadata(null);
    setPromptResult(null);
    setUserIdea('');
    setError(null);
  }, [appMode]);
  
  const checkApiKey = () => {
    if (!settings.apiKey) {
        setError('Please set your Gemini API key in the settings panel.');
        showToast('API Key is missing.', 'error');
        setIsSettingsVisible(true);
        return false;
    }
    return true;
  }

  const handleGenerateMetadata = useCallback(async () => {
    if (!imageBase64 || !imagePreview) {
      setError('Please upload an image first.');
      return;
    }
    if (!checkApiKey()) return;

    setIsLoading(true);
    setError(null);
    setMetadata(null);

    try {
      const result = await generateMetadata(settings.apiKey, imageBase64, stylePreset);
      setMetadata(result);
      const newHistoryItem: HistoryItem = {
          id: Date.now(),
          timestamp: Date.now(),
          imagePreview: imagePreview,
          type: AppMode.MetadataGenerator,
          result: result,
          stylePreset: stylePreset,
      };

      setHistory(prev => {
          const updatedHistory = [newHistoryItem, ...prev];
          try {
            localStorage.setItem('pg-metadata-history', JSON.stringify(updatedHistory));
          } catch(e) {
            console.error("Failed to save history to localStorage", e);
            showToast("Couldn't save to history. Storage might be full.", "error");
          }
          return updatedHistory;
      });

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate content. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [imageBase64, stylePreset, imagePreview, showToast, settings.apiKey]);
  
  const handleGenerateStyledPrompt = useCallback(async (refinementType: PromptRefinementType) => {
     if (!imagePreview && !userIdea) {
      setError('Please upload an image or write an idea first.');
      return;
    }
    if (!checkApiKey()) return;

    setIsLoading(true);
    setError(null);
    setPromptResult(null);

    try {
        const result = await generateStyledPrompt(settings.apiKey, refinementType, imageBase64 ?? undefined, userIdea.trim() || undefined);
        setPromptResult(result);
        const newHistoryItem: HistoryItem = {
            id: Date.now(),
            timestamp: Date.now(),
            imagePreview: imagePreview || 'https://i.ibb.co/67jVc9Lv/Whisk-da103b5523.jpg', // Use a default if no image
            type: AppMode.ImageToPrompt,
            result: result,
            userIdea: userIdea,
        };
        
        setHistory(prev => {
            const updatedHistory = [newHistoryItem, ...prev];
            try {
              localStorage.setItem('pg-metadata-history', JSON.stringify(updatedHistory));
            } catch(e) {
              console.error("Failed to save history to localStorage", e);
              showToast("Couldn't save to history. Storage might be full.", "error");
            }
            return updatedHistory;
        });

    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`Failed to generate content. ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [imageBase64, imagePreview, userIdea, showToast, settings.apiKey]);

  const handleSelectHistoryItem = useCallback((item: HistoryItem) => {
    setAppMode(item.type);
    setImagePreview(item.imagePreview);
    setImageFile(null);
    setImageBase64(null); // Will be re-generated on demand if needed, for now keep it simple
    setError(null);
    setIsHistoryVisible(false);

    if (item.type === AppMode.MetadataGenerator) {
        setMetadata(item.result as MetadataResult);
        setStylePreset(item.stylePreset || StylePreset.Short);
        setPromptResult(null);
        setUserIdea('');
    } else {
        setPromptResult(item.result as PromptResult);
        setMetadata(null);
        setUserIdea(item.userIdea || '');
    }
  }, []);
  
  const handleClearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem('pg-metadata-history');
    } catch (e) {
      console.error("Failed to clear history from localStorage", e);
    }
    showToast('History cleared successfully.', 'success');
  }, [showToast]);


  return (
    <main className="min-h-screen w-full bg-slate-900 bg-cover bg-center bg-fixed text-white transition-all duration-500" style={{ backgroundImage: `url(${settings.backgroundUrl})` }}>
      <HistoryPanel 
        isVisible={isHistoryVisible}
        onClose={() => setIsHistoryVisible(false)}
        history={history}
        onSelect={handleSelectHistoryItem}
        onClear={handleClearHistory}
      />
      <SettingsPanel
        isVisible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
      <div className="min-h-screen w-full bg-black/50 backdrop-blur-sm flex flex-col items-center p-4 sm:p-6 lg:p-8 relative">
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
          <button onClick={() => setIsHistoryVisible(true)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-300 backdrop-blur-lg" aria-label="View history">
            <HistoryIcon className="w-6 h-6 text-white"/>
          </button>
        </div>
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <button onClick={() => setIsSettingsVisible(true)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-300 backdrop-blur-lg" aria-label="Open settings">
              <GearIcon className="w-6 h-6 text-white"/>
            </button>
        </div>

        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
          <header className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
              Pixel Gear AI Studio
            </h1>
            <p className="text-slate-300 mt-2 text-lg">Your AI-Powered Image Assistant</p>
          </header>

          <ModeToggler currentMode={appMode} onModeChange={handleModeChange} theme={activeTheme} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div className="flex flex-col space-y-6">
              {appMode === AppMode.MetadataGenerator ? (
                <>
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                    <h2 className="text-xl font-semibold mb-4 text-center">Upload Image</h2>
                    <ImageUploader onImageUpload={handleImageUpload} imagePreview={imagePreview} onImageRemove={handleImageRemove} />
                  </div>

                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl animate-fade-in">
                    <h2 className="text-xl font-semibold mb-4 text-center">Select Style</h2>
                    <StyleSelector selected={stylePreset} onSelect={setStylePreset} isLoading={isLoading} theme={activeTheme} />
                  </div>
                   <button
                    onClick={handleGenerateMetadata}
                    disabled={!imagePreview || isLoading}
                    className={`w-full ${activeTheme.bg} ${activeTheme.hover} text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? <Spinner /> : 'Generate Metadata'}
                  </button>
                </>
              ) : (
                 <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl animate-fade-in flex flex-col gap-4">
                    <h2 className="text-xl font-semibold text-center">Prompt Studio</h2>
                    
                    <ImageUploader onImageUpload={handleImageUpload} imagePreview={imagePreview} onImageRemove={handleImageRemove} />

                    <div>
                      <label htmlFor="user-idea" className="block text-sm font-medium text-slate-300 mb-2">Or write your idea: in any language</label>
                      <textarea
                        id="user-idea"
                        rows={3}
                        value={userIdea}
                        onChange={(e) => setUserIdea(e.target.value)}
                        placeholder="e.g., a knight fighting a dragon, epic fantasy style..."
                        className="w-full bg-black/30 border border-slate-600 rounded-md px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    
                    <div className="border-t border-white/10"></div>

                    <h3 className="text-md font-semibold text-center text-slate-200">Select Prompt Style</h3>
                    <PromptRefinementSelector onSelect={handleGenerateStyledPrompt} isLoading={isLoading} theme={activeTheme} />
                    
                    <button
                      onClick={() => handleGenerateStyledPrompt(PromptRefinementType.General)}
                      disabled={(!imagePreview && !userIdea) || isLoading}
                      className={`w-full ${activeTheme.bg} ${activeTheme.hover} text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isLoading ? <Spinner /> : 'Generate Prompt'}
                  </button>
                 </div>
              )}
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl min-h-[300px] flex flex-col">
              <h2 className="text-xl font-semibold mb-4 text-center">
                {appMode === AppMode.MetadataGenerator ? 'Generated Results' : 'Generated Prompt'}
              </h2>
              <div className="flex-grow flex items-center justify-center">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center text-center animate-fade-in">
                    <Spinner size="lg" />
                    <p className="mt-4 text-slate-200 text-lg animate-pulse">AI is analyzing your input...</p>
                  </div>
                ) : error ? (
                  <div className="text-center text-red-400 bg-red-900/30 p-4 rounded-lg animate-fade-in">
                    <p className="font-semibold">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                ) : appMode === AppMode.MetadataGenerator && metadata ? (
                  <ResultDisplay metadata={metadata} showToast={showToast} theme={activeTheme} />
                ) : appMode === AppMode.ImageToPrompt && promptResult ? (
                  <PromptResultDisplay result={promptResult} showToast={showToast} theme={activeTheme} />
                ) : (
                  <div className="text-center text-slate-400">
                    <UploadIcon className="w-16 h-16 mx-auto opacity-20" />
                    <p className="mt-4">Your results will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center mt-auto pt-8 pb-6 text-slate-400 text-sm">
          <p>Powered by <span className="font-semibold text-slate-300">Pixel Gear</span></p>
        </footer>
        
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </main>
  );
}