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
  }
];