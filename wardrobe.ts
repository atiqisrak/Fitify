/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { WardrobeItem } from './types';
import wardrobeData from './data/wardrobe.json';

// Default wardrobe items hosted for easy access
const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || '';

export interface CategorizedWardrobe {
  women: WardrobeItem[];
  men: WardrobeItem[];
  unisex: WardrobeItem[];
}

// Function to process URLs - add MEDIA_URL prefix if not already a full URL
const processUrl = (url: string): string => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${MEDIA_URL}${url}`;
};

// Function to load categorized wardrobe from JSON file
export const loadCategorizedWardrobe = (): CategorizedWardrobe => {
  try {
    const data = wardrobeData as { women: WardrobeItem[]; men: WardrobeItem[]; unisex: WardrobeItem[] };
    
    return {
      women: data.women.map(item => ({ ...item, url: processUrl(item.url) })),
      men: data.men.map(item => ({ ...item, url: processUrl(item.url) })),
      unisex: data.unisex.map(item => ({ ...item, url: processUrl(item.url) }))
    };
  } catch (error) {
    console.error('Failed to load wardrobe from JSON:', error);
    return { women: [], men: [], unisex: [] };
  }
};

// Get all items as a flat array (for backward compatibility)
export const defaultWardrobe: WardrobeItem[] = (() => {
  const categorized = loadCategorizedWardrobe();
  return [...categorized.women, ...categorized.men, ...categorized.unisex];
})();

// Export categorized version
export const categorizedWardrobe = loadCategorizedWardrobe();