
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon, ArrowPathIcon, TrashIcon } from './icons';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imagePreview: string | null;
  onImageRemove: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imagePreview, onImageRemove }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  }, [onImageUpload]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div 
        className="relative group w-full h-48 rounded-lg"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input ref={fileInputRef} id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
        {imagePreview ? (
          <>
            <img src={imagePreview} alt="Preview" className="object-cover h-full w-full rounded-lg" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 rounded-lg">
                <button 
                  onClick={triggerFileSelect}
                  className="flex flex-col items-center gap-1 text-white hover:text-indigo-300 transition-colors p-2 rounded-lg"
                  aria-label="Change image"
                >
                   <ArrowPathIcon className="w-7 h-7"/>
                   <span className="text-xs font-semibold uppercase tracking-wider">Change</span>
                </button>
                <button 
                  onClick={onImageRemove}
                  className="flex flex-col items-center gap-1 text-white hover:text-red-400 transition-colors p-2 rounded-lg"
                  aria-label="Remove image"
                >
                   <TrashIcon className="w-7 h-7"/>
                   <span className="text-xs font-semibold uppercase tracking-wider">Remove</span>
                </button>
            </div>
          </>
        ) : (
          <div 
            onClick={triggerFileSelect}
            className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300
              ${isDragging ? 'border-indigo-400 bg-indigo-900/30' : 'border-slate-500 hover:border-slate-400 hover:bg-white/5'}`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400">
              <UploadIcon className="w-10 h-10 mb-3" />
              <p className="mb-2 text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs">PNG, JPG, WEBP</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
