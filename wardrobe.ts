/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { WardrobeItem } from './types';

// Default wardrobe items hosted for easy access
const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || '';

export const defaultWardrobe: WardrobeItem[] = [
  {
    id: 'polo-tripping',
    name: 'Polo (Tripping)',
    url: `${MEDIA_URL}polo1.jpg`,
  },
  {
    id: 'sweat-shirt',
    name: 'Sweat Shirt',
    url: `${MEDIA_URL}sweat1.jpg`,
  },
  {
    id: 'dress-blue',
    name: 'Dress Blue',
    url: `${MEDIA_URL}f1.png`,
  },
  {
    id: 'dress-green',
    name: 'Dress Green',
    url: `${MEDIA_URL}f2.png`,
  },
  {
    id: 'dress-red',
    name: 'Dress Red',
    url: `${MEDIA_URL}f5.png`,
  },
  {
    id: 'dress-orange',
    name: 'Dress Orange',
    url: `${MEDIA_URL}f3.png`,
  },
  {
    id: 'dress-teal',
    name: 'Dress Teal',
    url: `${MEDIA_URL}f4.png`,
  },
  {
    id: 'men-drop',
    name: 'Men Drop Shoulder',
    url: `${MEDIA_URL}m1.png`,
  },
  {
    id: 'men-drop-shoulder',
    name: 'Men Drop Shoulder',
    url: `${MEDIA_URL}m2.png`,
  },
  {
    id: 'men-formal-red',
    name: 'Men Formal Red',
    url: `${MEDIA_URL}m3.png`,
  },
  {
    id: 'men-formal-blue',
    name: 'Men Formal Blue',
    url: `${MEDIA_URL}m4.png`,
  },
  {
    id: 'men-formal-ash',
    name: 'Men Formal Ash',
    url: `${MEDIA_URL}m5.png`,
  },
  {
    id: 'women-saree-red',
    name: 'Women Saree Red',
    url: `${MEDIA_URL}s1.png`,
  },
  {
    id: 'women-saree-yellow',
    name: 'Women Saree Yellow',
    url: `${MEDIA_URL}s2.png`,
  }
];