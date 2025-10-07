/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { categorizedWardrobe } from '../wardrobe';
import type { WardrobeItem } from '../types';
import { UploadCloudIcon, CheckCircleIcon, XIcon } from './icons';
import { AnimatePresence, motion } from 'framer-motion';


interface WardrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGarmentSelect: (garmentFile: File, garmentInfo: WardrobeItem) => void;
  activeGarmentIds: string[];
  isLoading: boolean;
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

const WardrobeModal: React.FC<WardrobeModalProps> = ({ isOpen, onClose, onGarmentSelect, activeGarmentIds, isLoading }) => {
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<Category>('women');

    const handleGarmentClick = async (item: WardrobeItem) => {
        if (isLoading || activeGarmentIds.includes(item.id)) return;
        setError(null);
        try {
            const file = await urlToFile(item.url, `${item.id}.png`);
            onGarmentSelect(file, item);
        } catch (err) {
            console.error('Failed to load wardrobe item:', err);
            const errorMessage = err instanceof Error ? err.message : 'Could not load wardrobe item. Please try again.';
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
            const customGarmentInfo: WardrobeItem = {
                id: `custom-${Date.now()}`,
                name: file.name,
                url: URL.createObjectURL(file), // for preview, not used by API
            };
            onGarmentSelect(file, customGarmentInfo);
        }
    };

  return (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl"
                >
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-2xl font-serif tracking-wider text-gray-800">Add Garment</h2>
                        <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                            <XIcon className="w-6 h-6"/>
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto">
                        {/* Category Tabs */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setActiveCategory('women')}
                                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                                    activeCategory === 'women'
                                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Women
                            </button>
                            <button
                                onClick={() => setActiveCategory('men')}
                                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                                    activeCategory === 'men'
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Men
                            </button>
                            <button
                                onClick={() => setActiveCategory('unisex')}
                                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                                    activeCategory === 'unisex'
                                        ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-md'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Unisex
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {categorizedWardrobe[activeCategory].map((item) => {
                            const isActive = activeGarmentIds.includes(item.id);
                            return (
                                <button
                                key={item.id}
                                onClick={() => handleGarmentClick(item)}
                                disabled={isLoading || isActive}
                                className="relative aspect-square border rounded-lg overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 group disabled:opacity-60 disabled:cursor-not-allowed"
                                aria-label={`Select ${item.name}`}
                                >
                                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white text-xs font-bold text-center p-1">{item.name}</p>
                                </div>
                                {isActive && (
                                    <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center">
                                        <CheckCircleIcon className="w-8 h-8 text-white" />
                                    </div>
                                )}
                                </button>
                            );
                            })}
                            <label htmlFor="custom-garment-upload" className={`relative aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-500 transition-colors ${isLoading ? 'cursor-not-allowed bg-gray-100' : 'hover:border-gray-400 hover:text-gray-600 cursor-pointer'}`}>
                                <UploadCloudIcon className="w-6 h-6 mb-1"/>
                                <span className="text-xs text-center">Upload</span>
                                <input id="custom-garment-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif" onChange={handleFileChange} disabled={isLoading}/>
                            </label>
                        </div>
                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
  );
};

export default WardrobeModal;