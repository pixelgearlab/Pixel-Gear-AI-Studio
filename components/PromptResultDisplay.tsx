import React, { useState, useEffect } from 'react';
import { PromptResult, Theme } from '../types';
import { CopyIcon, CheckIcon, XCircleIcon, PlusIcon } from './icons';

const CopyButton: React.FC<{ textToCopy: string; showToast: (message: string, type?: 'success' | 'error') => void; }> = ({ textToCopy, showToast }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!textToCopy) return;
    if (!navigator.clipboard) {
      showToast('Clipboard API not available in this browser.', 'error');
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      showToast('Prompt copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showToast('Failed to copy. Please try again.', 'error');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 bg-white/10 hover:bg-white/20 rounded-md transition-all duration-200"
      aria-label="Copy Prompt"
    >
      {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5 text-slate-300" />}
    </button>
  );
};

interface PromptResultDisplayProps {
  result: PromptResult;
  showToast: (message: string, type?: 'success' | 'error') => void;
  theme: Theme;
}

export const PromptResultDisplay: React.FC<PromptResultDisplayProps> = ({ result, showToast, theme }) => {
  const [styleTags, setStyleTags] = useState<string[]>(result.styleAnalysis);
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    setStyleTags(result.styleAnalysis);
  }, [result]);

  const handleRemoveTag = (tagToRemove: string) => {
    setStyleTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
  };
  
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const newTag = newTagInput.trim().toLowerCase();
    if (newTag && !styleTags.map(t => t.toLowerCase()).includes(newTag)) {
        setStyleTags(prevTags => [...prevTags, newTag]);
        setNewTagInput('');
        showToast(`Tag "${newTag}" added!`, 'success');
    } else if (styleTags.map(t => t.toLowerCase()).includes(newTag)) {
        showToast(`Tag "${newTag}" already exists.`, 'error');
    }
  };


  return (
    <div className="w-full flex flex-col space-y-4 animate-fade-in">
      <div className="relative bg-black/20 p-4 rounded-lg">
        <label className="text-sm font-semibold text-slate-400">Positive Prompt</label>
        <p className="text-base text-slate-200 mt-2 whitespace-pre-wrap pr-12">{result.positive}</p>
        <div className="absolute top-3 right-3">
          <CopyButton textToCopy={result.positive} showToast={showToast} />
        </div>
      </div>
      
      <div className="relative bg-black/20 p-4 rounded-lg">
        <label className="text-sm font-semibold text-slate-400">Negative Prompt</label>
        <p className="text-base text-slate-400 mt-2 whitespace-pre-wrap pr-12">{result.negative}</p>
        <div className="absolute top-3 right-3">
          <CopyButton textToCopy={result.negative} showToast={showToast} />
        </div>
      </div>
      
      <div className="relative bg-black/20 p-4 rounded-lg flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-semibold text-slate-400">Style & Keyword Analysis</label>
          <CopyButton textToCopy={styleTags.join(', ')} showToast={showToast} />
        </div>
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {styleTags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className={`flex items-center ${theme.bg} ${theme.text} text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-full animate-fade-in`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {tag}
              <button 
                onClick={() => handleRemoveTag(tag)} 
                className={`ml-1.5 ${theme.text} opacity-70 hover:opacity-100 transition-colors duration-200`}
                aria-label={`Remove tag ${tag}`}
              >
                <XCircleIcon className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
        <form onSubmit={handleAddTag} className="mt-4 flex gap-2 border-t border-white/10 pt-4">
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            placeholder="Add a custom style/keyword..."
            className="flex-grow bg-black/30 border border-slate-600 rounded-md px-3 py-1.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            aria-label="Add a custom style or keyword"
          />
          <button
            type="submit"
            className={`${theme.bg} ${theme.hover} text-white font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50`}
            aria-label="Add tag"
            disabled={!newTagInput.trim()}
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add</span>
          </button>
        </form>
      </div>
    </div>
  );
};
