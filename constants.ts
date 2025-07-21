import { Theme } from './types';

export const THEMES: Theme[] = [
  { name: 'Default', bg: 'bg-indigo-600', text: 'text-indigo-100', ring: 'focus:ring-indigo-400', hover: 'hover:bg-indigo-500' },
  { name: 'Sunset', bg: 'bg-gradient-to-r from-red-500 to-orange-500', text: 'text-white', ring: 'focus:ring-red-400', hover: 'hover:from-red-600 hover:to-orange-600' },
  { name: 'Ocean', bg: 'bg-gradient-to-r from-cyan-500 to-blue-500', text: 'text-white', ring: 'focus:ring-cyan-400', hover: 'hover:from-cyan-600 hover:to-blue-600' },
  { name: 'Forest', bg: 'bg-gradient-to-r from-emerald-500 to-green-600', text: 'text-white', ring: 'focus:ring-emerald-400', hover: 'hover:from-emerald-600 hover:to-green-700' },
  { name: 'Twilight', bg: 'bg-gradient-to-r from-violet-600 to-purple-700', text: 'text-white', ring: 'focus:ring-violet-400', hover: 'hover:from-violet-700 hover:to-purple-800' },
  { name: 'Sunrise', bg: 'bg-gradient-to-r from-amber-400 to-yellow-500', text: 'text-gray-900', ring: 'focus:ring-amber-300', hover: 'hover:from-amber-500 hover:to-yellow-600' },
];

export const BACKGROUNDS: { name: string, url: string }[] = [
  { name: 'Whisk', url: 'https://i.ibb.co/67jVc9Lv/Whisk-da103b5523.jpg' },
  { name: 'Abstract 1', url: 'https://i.ibb.co/Hp7K1vRX/PG-meta-1.jpg' },
  { name: 'Abstract 2', url: 'https://i.ibb.co/twctR0Wf/PG-meta-2.jpg' },
  { name: 'Abstract 3', url: 'https://i.ibb.co/C5TQ2bDq/PG-meta-3.jpg' },
  { name: 'Abstract 4', url: 'https://i.ibb.co/yFRCLQJv/PG-meta-4.jpg' },
  { name: 'Abstract 5', url: 'https://i.ibb.co/2076Zjy6/PG-meta-5.jpg' },
  { name: 'Abstract 6', url: 'https://i.ibb.co/9H7NW8HP/PG-meta-6.jpg' },
];
