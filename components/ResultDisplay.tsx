
import React, { useState, useEffect, useRef } from 'react';
import { MetadataResult, Theme } from '../types';
import { CopyIcon, CheckIcon, XCircleIcon, DownloadIcon, ChevronDownIcon, PlusIcon } from './icons';

const CopyButton: React.FC<{ textToCopy: string; showToast: (message: string, type?: 'success' | 'error') => void; }> = ({ textToCopy, showToast }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!textToCopy) return;
    if (!navigator.clipboard) {
      showToast('Clipboard API not available in this browser.', 'error');
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      showToast('Copied to clipboard!', 'success');
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
      aria-label="Copy"
    >
      {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5 text-slate-300" />}
    </button>
  );
};

const ExportMenu: React.FC<{ title: string; tags: string[]; description: string; }> = ({ title, tags, description }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const exportAsTxt = () => {
    const content = `Title: ${title}\n\nDescription: ${description}\n\nTags: ${tags.join(', ')}`;
    downloadFile(content, `${title.replace(/\s+/g, '_')}_metadata.txt`, 'text/plain');
  };

  const exportAsJson = () => {
    const content = JSON.stringify({ title, description, tags }, null, 2);
    downloadFile(content, `${title.replace(/\s+/g, '_')}_metadata.json`, 'application/json');
  };

  const exportAsCsv = () => {
    const csvContent = `"title","description","tags"\n"${title.replace(/"/g, '""')}","${description.replace(/"/g, '""')}","${tags.map(t => t.replace(/"/g, '""')).join(',')}"`;
    downloadFile(csvContent, `${title.replace(/\s+/g, '_')}_metadata.csv`, 'text/csv');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1 p-2 bg-white/10 hover:bg-white/20 rounded-md transition-all duration-200 text-slate-300">
        <DownloadIcon className="w-5 h-5" />
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-40 bg-slate-800/90 backdrop-blur-md border border-white/20 rounded-lg shadow-xl z-10">
          <ul className="py-1">
            <li><button onClick={exportAsTxt} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-indigo-500/50">Export as TXT</button></li>
            <li><button onClick={exportAsJson} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-indigo-500/50">Export as JSON</button></li>
            <li><button onClick={exportAsCsv} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-indigo-500/50">Export as CSV</button></li>
          </ul>
        </div>
      )}
    </div>
  );
};


export const ResultDisplay: React.FC<{ metadata: MetadataResult; showToast: (message: string, type?: 'success' | 'error') => void; theme: Theme; }> = ({ metadata, showToast, theme }) => {
  const [currentTitle, setCurrentTitle] = useState(metadata.title);
  const [currentDescription, setCurrentDescription] = useState(metadata.description);
  const [currentTags, setCurrentTags] = useState<string[]>(metadata.tags);
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    setCurrentTitle(metadata.title);
    setCurrentDescription(metadata.description);
    setCurrentTags(metadata.tags);
  }, [metadata]);
  
  const handleRemoveTag = (tagToRemove: string) => {
    setCurrentTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
  };
  
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const newTag = newTagInput.trim().toLowerCase();
    if (newTag && !currentTags.map(t => t.toLowerCase()).includes(newTag)) {
        setCurrentTags(prevTags => [...prevTags, newTag]);
        setNewTagInput('');
        showToast(`Tag "${newTag}" added!`, 'success');
    } else if (currentTags.map(t => t.toLowerCase()).includes(newTag)) {
        showToast(`Tag "${newTag}" already exists.`, 'error');
    }
  };

  return (
    <div className="w-full flex flex-col space-y-4 animate-fade-in">
      <div className="relative bg-black/20 p-4 rounded-lg">
        <label className="text-sm font-semibold text-slate-400">Title</label>
        <p className="text-lg text-white pr-16">{currentTitle}</p>
        <div className="absolute top-3 right-3">
          <CopyButton textToCopy={currentTitle} showToast={showToast} />
        </div>
      </div>
      
      <div className="relative bg-black/20 p-4 rounded-lg">
        <label className="text-sm font-semibold text-slate-400">Description</label>
        <p className="text-base text-slate-200 pr-16">{currentDescription}</p>
        <div className="absolute top-3 right-3">
          <CopyButton textToCopy={currentDescription} showToast={showToast} />
        </div>
      </div>

      <div className="relative bg-black/20 p-4 rounded-lg flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-semibold text-slate-400">Interactive Tags</label>
          <div className="flex items-center gap-2">
            <CopyButton textToCopy={currentTags.join(', ')} showToast={showToast} />
            <ExportMenu title={currentTitle} description={currentDescription} tags={currentTags} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {currentTags.length > 0 ? (
            currentTags.map((tag, index) => (
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
            ))
          ) : (
            <p className="text-slate-400 text-sm w-full text-center py-2">No tags to display.</p>
          )}
        </div>
        
        <form onSubmit={handleAddTag} className="mt-4 flex gap-2 border-t border-white/10 pt-4">
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            placeholder="Add a custom tag..."
            className="flex-grow bg-black/30 border border-slate-600 rounded-md px-3 py-1.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            aria-label="Add a custom tag"
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