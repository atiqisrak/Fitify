/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon, DownloadIcon } from './icons';
import { imageStorageService, GeneratedImage } from '../services/imageStorageService';

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userImageUrl?: string;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({ isOpen, onClose, userImageUrl }) => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    if (isOpen) {
      const allImages = userImageUrl 
        ? imageStorageService.getImagesForUser(userImageUrl)
        : imageStorageService.getAllImages();
      setImages(allImages.reverse()); // Most recent first
    }
  }, [isOpen, userImageUrl]);

  const handleDownload = (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.generatedImageUrl;
    link.download = `fitify_${image.garmentName || 'image'}_${new Date(image.timestamp).toISOString()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      imageStorageService.deleteImage(id);
      setImages(prev => prev.filter(img => img.id !== id));
      if (selectedImage?.id === id) {
        setSelectedImage(null);
      }
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-xl"
          >
            <div className="flex items-center justify-between p-4 md:p-6 border-b">
              <h2 className="text-2xl md:text-3xl font-serif tracking-wider text-gray-800">Your Fitify Gallery</h2>
              <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                <XIcon className="w-6 h-6"/>
              </button>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto flex-grow">
              {images.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No saved images yet. Start trying on outfits!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 hover:border-gray-400 transition-all cursor-pointer group"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img 
                        src={image.generatedImageUrl} 
                        alt={image.garmentName || 'Generated outfit'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(image);
                          }}
                          className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                        >
                          <DownloadIcon className="w-5 h-5 text-gray-800" />
                        </button>
                      </div>
                      {image.garmentName && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-white text-xs font-semibold truncate">{image.garmentName}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image Preview Modal */}
            <AnimatePresence>
              {selectedImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedImage(null)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 rounded-2xl"
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative max-w-2xl max-h-full"
                  >
                    <img 
                      src={selectedImage.generatedImageUrl} 
                      alt={selectedImage.garmentName || 'Generated outfit'}
                      className="max-h-[80vh] rounded-lg shadow-2xl"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => handleDownload(selectedImage)}
                        className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                      >
                        <DownloadIcon className="w-5 h-5 text-gray-800" />
                      </button>
                      <button
                        onClick={() => handleDelete(selectedImage.id)}
                        className="p-2 bg-red-500 rounded-full shadow-lg hover:scale-110 transition-transform"
                      >
                        <XIcon className="w-5 h-5 text-white" />
                      </button>
                    </div>
                    {selectedImage.garmentName && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 rounded-b-lg">
                        <p className="text-white text-lg font-bold">{selectedImage.garmentName}</p>
                        <p className="text-white/80 text-sm">
                          {new Date(selectedImage.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageGalleryModal;

