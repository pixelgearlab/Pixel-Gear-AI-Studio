export enum AppMode {
  MetadataGenerator = 'Metadata Generator',
  ImageToPrompt = 'Image to Prompt',
}

export enum StylePreset {
  Short = 'Short',
  Long = 'Long',
  SEO = 'SEO',
  Creative = 'Creative',
}

export enum PromptRefinementType {
    Refine = 'Refine',
    Cinematic = 'Cinematic',
    PixelArt = 'Pixel Art',
    ThreeDRender = '3D Render',
    Anime = 'Anime',
    Cartoon = 'Cartoon',
    Realistic = 'Realistic',
    Watercolor = 'Watercolor',
    Fantasy = 'Fantasy',
    General = 'General',
}

export interface MetadataResult {
  title: string;
  tags: string[];
  description: string;
}

export interface PromptResult {
  positive: string;
  negative: string;
  styleAnalysis: string[];
}


export interface HistoryItem {
  id: number;
  timestamp: number;
  imagePreview: string;
  type: AppMode;
  result: MetadataResult | PromptResult;
  // Metadata-specific fields
  stylePreset?: StylePreset;
  // Prompt-specific fields
  userIdea?: string;
}

export interface Theme {
  name: string;
  bg: string;
  text: string;
  ring: string;
  hover: string;
}

export interface AppSettings {
  themeName: string;
  backgroundUrl: string;
  apiKey: string;
}
