import React from 'react';
import { HistoryItem, AppMode, MetadataResult, PromptResult } from '../types';
import { XCircleIcon, TrashIcon } from './icons';

interface HistoryPanelProps {
  isVisible: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ isVisible, onClose, history, onSelect, onClear }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  }
  
  const renderItem = (item: HistoryItem) => {
    const isMetadata = item.type === AppMode.MetadataGenerator;
    let title: string;
    let subtitle: string | undefined;

    if (isMetadata) {
        title = (item.result as MetadataResult).title;
        subtitle = (item.result as MetadataResult).description;
    } else {
        const promptData = item.result as PromptResult;
        title = item.userIdea ? `Prompt: "${item.userIdea}"` : "Image-to-Prompt Result";
        subtitle = promptData.positive;
    }
    
    return (
       <button
          onClick={() => onSelect(item)}
          className="w-full flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200 text-left"
        >
          <img src={item.imagePreview} alt="History preview" className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{title}</p>
            {subtitle && <p className="text-xs text-slate-400 truncate mt-0.5">{subtitle}</p>}
            <p className="text-xs text-slate-500 mt-1">{formatDate(item.timestamp)}</p>
            <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full ${isMetadata ? 'bg-indigo-500/50 text-indigo-200' : 'bg-teal-500/50 text-teal-200'}`}>
              {item.type}
            </span>
          </div>
        </button>
    );
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-full max-w-sm sm:max-w-md bg-slate-900/80 backdrop-blur-xl border-r border-white/20 shadow-2xl transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between p-4 border-b border-white/20">
            <h2 className="text-xl font-semibold text-white">History</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors duration-200">
              <XCircleIcon className="w-7 h-7" />
            </button>
          </header>

          <div className="flex-grow p-4 overflow-y-auto">
            {history.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-400">No history yet.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {history.map(item => (
                  <li key={item.id}>
                    {renderItem(item)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <footer className="p-4 border-t border-white/20">
            <button
              onClick={onClear}
              disabled={history.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/50 hover:bg-red-600/70 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
            >
              <TrashIcon className="w-5 h-5" />
              Clear History
            </button>
          </footer>
        </div>
      </aside>
    </>
  );
};
