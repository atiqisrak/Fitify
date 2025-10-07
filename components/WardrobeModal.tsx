/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import type { WardrobeItem } from '../types';
import { UploadCloudIcon, CheckCircleIcon } from './icons';
import { coinService } from '../services/coinService';
import CoinModal from './CoinModal';
import { categorizedWardrobe, type CategorizedWardrobe } from '../wardrobe';

interface WardrobePanelProps {
  onGarmentSelect: (garmentFile: File, garmentInfo: WardrobeItem) => void;
  activeGarmentIds: string[];
  isLoading: boolean;
  wardrobe: WardrobeItem[];
}

type Category = 'women' | 'men' | 'unisex';

// Helper to convert image URL to a File object with CORS support
const urlToFile = async (url: string, filename: string): Promise<File> => {
    // Check if this is an external URL that might have CORS issues
    const isExternalUrl = url.startsWith('http://') || url.startsWith('https://');
    const isBlobUrl = url.startsWith('blob:');
    
    // For blob URLs or local URLs, fetch directly
    if (isBlobUrl || !isExternalUrl) {
        const response = await fetch(url);
        const blob = await response.blob();
        const mimeType = blob.type || 'image/jpeg';
        return new File([blob], filename, { type: mimeType });
    }
    
    // For external URLs, try direct fetch first
    try {
        const response = await fetch(url, { 
            mode: 'cors',
            credentials: 'omit'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const mimeType = blob.type || 'image/jpeg';
        return new File([blob], filename, { type: mimeType });
    } catch (directFetchError) {
        // Expected behavior: External images often block direct CORS requests
        // We'll try CORS proxies as fallback (this is normal and not an error)
        console.log('Direct fetch blocked (expected for external images), using CORS proxy...');
        
        // Try using a CORS proxy
        const corsProxies = [
            `https://corsproxy.io/?${encodeURIComponent(url)}`,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        ];
        
        for (const proxyUrl of corsProxies) {
            try {
                const response = await fetch(proxyUrl);
                if (response.ok) {
                    const blob = await response.blob();
                    const mimeType = blob.type || 'image/jpeg';
                    return new File([blob], filename, { type: mimeType });
                }
            } catch (proxyError) {
                // Try next proxy silently
                continue;
            }
        }
        
        // Last resort: Canvas approach
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }
                
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Canvas toBlob failed'));
                        return;
                    }
                    const file = new File([blob], filename, { type: 'image/png' });
                    resolve(file);
                }, 'image/png');
            };
            
            img.onerror = () => {
                reject(new Error('Unable to load image. The image server does not allow cross-origin requests. Please use the Upload button to add custom garments.'));
            };
            
            img.src = url;
        });
    }
};

const WardrobePanel: React.FC<WardrobePanelProps> = ({ onGarmentSelect, activeGarmentIds, isLoading, wardrobe }) => {
    const [error, setError] = useState<string | null>(null);
    const [showCoinModal, setShowCoinModal] = useState(false);
    const [currentCoins, setCurrentCoins] = useState(coinService.getCoins());
    const [activeCategory, setActiveCategory] = useState<Category>('women');

    const handleGarmentClick = async (item: WardrobeItem) => {
        if (isLoading || activeGarmentIds.includes(item.id)) return;
        
        if (!coinService.hasCoins()) {
            setCurrentCoins(coinService.getCoins());
            setShowCoinModal(true);
            return;
        }
        
        setError(null);
        try {
            // If the item was from an upload, its URL is a blob URL. We need to fetch it to create a file.
            // If it was a default item, it's a regular URL. This handles both.
            const file = await urlToFile(item.url, item.name);
            onGarmentSelect(file, item);
            setCurrentCoins(coinService.getCoins());
        } catch (err) {
            if ((err as Error).message === 'INSUFFICIENT_COINS') {
                setCurrentCoins(coinService.getCoins());
                setShowCoinModal(true);
                return;
            }
            console.error(`[CORS Check] Failed to load and convert wardrobe item from URL: ${item.url}`, err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to load wardrobe item. This is often a CORS issue.';
            setError(errorMessage);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file.');
                return;
            }
            
            if (!coinService.hasCoins()) {
                setCurrentCoins(coinService.getCoins());
                setShowCoinModal(true);
                e.target.value = '';
                return;
            }
            
            const customGarmentInfo: WardrobeItem = {
                id: `custom-${Date.now()}`,
                name: file.name,
                url: URL.createObjectURL(file),
            };
            onGarmentSelect(file, customGarmentInfo);
            setCurrentCoins(coinService.getCoins());
            e.target.value = '';
        }
    };

  const currentItems = categorizedWardrobe[activeCategory];

  return (
    <div className="pt-4 md:pt-6 border-t border-gray-400/50">
        <CoinModal 
            isOpen={showCoinModal} 
            onClose={() => setShowCoinModal(false)} 
            currentCoins={currentCoins}
        />
        
        <h2 className="text-lg md:text-xl font-serif tracking-wider text-gray-800 mb-3 md:mb-4">Wardrobe</h2>
        
        {/* Category Tabs */}
        <div className="flex gap-2 mb-3 md:mb-4">
            <button
                onClick={() => setActiveCategory('women')}
                className={`flex-1 py-2 px-3 md:px-4 rounded-lg font-semibold text-xs md:text-sm transition-all ${
                    activeCategory === 'women'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
                Women
            </button>
            <button
                onClick={() => setActiveCategory('men')}
                className={`flex-1 py-2 px-3 md:px-4 rounded-lg font-semibold text-xs md:text-sm transition-all ${
                    activeCategory === 'men'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
                Men
            </button>
            <button
                onClick={() => setActiveCategory('unisex')}
                className={`flex-1 py-2 px-3 md:px-4 rounded-lg font-semibold text-xs md:text-sm transition-all ${
                    activeCategory === 'unisex'
                        ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-md'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
                Unisex
            </button>
        </div>
        
        {/* Wardrobe Grid */}
        <div className="grid grid-cols-3 gap-2 md:gap-3">
            <label htmlFor="custom-garment-upload" className={`relative aspect-square border-2 border-dashed rounded-md md:rounded-lg flex flex-col items-center justify-center text-gray-500 transition-colors ${isLoading ? 'cursor-not-allowed bg-gray-100' : 'hover:border-gray-400 hover:text-gray-600 cursor-pointer'}`}>
                <UploadCloudIcon className="w-5 h-5 md:w-6 md:h-6 mb-0.5 md:mb-1"/>
                <span className="text-[10px] md:text-xs text-center">Upload</span>
                <input id="custom-garment-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif" onChange={handleFileChange} disabled={isLoading}/>
            </label>
            
            {currentItems.map((item) => {
                const isActive = activeGarmentIds.includes(item.id);
                return (
                    <button
                        key={item.id}
                        onClick={() => handleGarmentClick(item)}
                        disabled={isLoading || isActive}
                        className="relative aspect-square border rounded-md md:rounded-lg overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 group disabled:opacity-60 disabled:cursor-not-allowed"
                        aria-label={`Select ${item.name}`}
                    >
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white text-[10px] md:text-xs font-bold text-center p-1">{item.name}</p>
                        </div>
                        {isActive && (
                            <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center">
                                <CheckCircleIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
        
        {currentItems.length === 0 && (
             <p className="text-center text-xs md:text-sm text-gray-500 mt-3 md:mt-4">No items in this category yet.</p>
        )}
        {error && <p className="text-red-500 text-xs md:text-sm mt-3 md:mt-4">{error}</p>}
    </div>
  );
};

export default WardrobePanel;