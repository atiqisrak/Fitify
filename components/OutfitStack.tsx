/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { OutfitLayer } from '../types';
import { Trash2Icon } from './icons';

interface OutfitStackProps {
  outfitHistory: OutfitLayer[];
  onRemoveLastGarment: () => void;
}

const OutfitStack: React.FC<OutfitStackProps> = ({ outfitHistory, onRemoveLastGarment }) => {
  return (
    <div className="flex flex-col">
      <h2 className="text-lg md:text-xl font-serif tracking-wider text-gray-800 border-b border-gray-400/50 pb-2 mb-2 md:mb-3">Outfit Stack</h2>
      <div className="space-y-1.5 md:space-y-2">
        {outfitHistory.map((layer, index) => (
          <div
            key={layer.garment?.id || 'base'}
            className="flex items-center justify-between bg-white/50 p-1.5 md:p-2 rounded-md md:rounded-lg animate-fade-in border border-gray-200/80"
          >
            <div className="flex items-center overflow-hidden">
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-[10px] md:text-xs font-bold text-gray-600 bg-gray-200 rounded-full">
                  {index + 1}
                </span>
                {layer.garment && (
                    <img src={layer.garment.url} alt={layer.garment.name} className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 object-cover rounded-sm md:rounded-md mr-2 md:mr-3" />
                )}
                <span className="font-semibold text-sm md:text-base text-gray-800 truncate" title={layer.garment?.name}>
                  {layer.garment ? layer.garment.name : 'Base Model'}
                </span>
            </div>
            {index > 0 && index === outfitHistory.length - 1 && (
               <button
                onClick={onRemoveLastGarment}
                className="flex-shrink-0 text-gray-500 hover:text-red-600 transition-colors p-1.5 md:p-2 rounded-md hover:bg-red-50"
                aria-label={`Remove ${layer.garment?.name}`}
              >
                <Trash2Icon className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}
          </div>
        ))}
        {outfitHistory.length === 1 && (
            <p className="text-center text-xs md:text-sm text-gray-500 pt-3 md:pt-4">Your stacked items will appear here. Select an item from the wardrobe below.</p>
        )}
      </div>
    </div>
  );
};

export default OutfitStack;