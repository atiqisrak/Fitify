/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { RotateCcwIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from './icons';
import Spinner from './Spinner';
import { AnimatePresence, motion } from 'framer-motion';

interface CanvasProps {
  displayImageUrl: string | null;
  onStartOver: () => void;
  isLoading: boolean;
  loadingMessage: string;
  onSelectPose: (index: number) => void;
  poseInstructions: string[];
  currentPoseIndex: number;
  availablePoseKeys: string[];
}

const Canvas: React.FC<CanvasProps> = ({ displayImageUrl, onStartOver, isLoading, loadingMessage, onSelectPose, poseInstructions, currentPoseIndex, availablePoseKeys }) => {
  const [isPoseMenuOpen, setIsPoseMenuOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleDownload = async () => {
    if (!displayImageUrl || isDownloading) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(displayImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fitify-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handlePreviousPose = () => {
    if (isLoading || availablePoseKeys.length <= 1) return;

    const currentPoseInstruction = poseInstructions[currentPoseIndex];
    const currentIndexInAvailable = availablePoseKeys.indexOf(currentPoseInstruction);
    
    // Fallback if current pose not in available list (shouldn't happen)
    if (currentIndexInAvailable === -1) {
        onSelectPose((currentPoseIndex - 1 + poseInstructions.length) % poseInstructions.length);
        return;
    }

    const prevIndexInAvailable = (currentIndexInAvailable - 1 + availablePoseKeys.length) % availablePoseKeys.length;
    const prevPoseInstruction = availablePoseKeys[prevIndexInAvailable];
    const newGlobalPoseIndex = poseInstructions.indexOf(prevPoseInstruction);
    
    if (newGlobalPoseIndex !== -1) {
        onSelectPose(newGlobalPoseIndex);
    }
  };

  const handleNextPose = () => {
    if (isLoading) return;

    const currentPoseInstruction = poseInstructions[currentPoseIndex];
    const currentIndexInAvailable = availablePoseKeys.indexOf(currentPoseInstruction);

    // Fallback or if there are no generated poses yet
    if (currentIndexInAvailable === -1 || availablePoseKeys.length === 0) {
        onSelectPose((currentPoseIndex + 1) % poseInstructions.length);
        return;
    }
    
    const nextIndexInAvailable = currentIndexInAvailable + 1;
    if (nextIndexInAvailable < availablePoseKeys.length) {
        // There is another generated pose, navigate to it
        const nextPoseInstruction = availablePoseKeys[nextIndexInAvailable];
        const newGlobalPoseIndex = poseInstructions.indexOf(nextPoseInstruction);
        if (newGlobalPoseIndex !== -1) {
            onSelectPose(newGlobalPoseIndex);
        }
    } else {
        // At the end of generated poses, generate the next one from the master list
        const newGlobalPoseIndex = (currentPoseIndex + 1) % poseInstructions.length;
        onSelectPose(newGlobalPoseIndex);
    }
  };
  
  return (
    <div className="w-full h-full flex items-center justify-center p-2 md:p-4 relative animate-zoom-in group">
      {/* Start Over Button */}
      <button 
          onClick={onStartOver}
          className="absolute top-2 left-2 md:top-4 md:left-4 z-30 flex items-center justify-center text-center bg-white/60 border border-gray-300/80 text-gray-700 font-semibold py-1.5 px-3 md:py-2 md:px-4 rounded-full transition-all duration-200 ease-in-out hover:bg-white hover:border-gray-400 active:scale-95 text-xs md:text-sm backdrop-blur-sm"
      >
          <RotateCcwIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
          Start Over
      </button>

      {/* Image Display or Placeholder */}
      <div className="relative w-full h-full flex items-center justify-center">
        {displayImageUrl ? (
          <img
            key={displayImageUrl} // Use key to force re-render and trigger animation on image change
            src={displayImageUrl}
            alt="Virtual try-on model"
            className="max-w-full max-h-full object-contain transition-opacity duration-500 animate-fade-in rounded-lg"
          />
        ) : (
            <div className="w-[400px] h-[600px] bg-gray-100 border border-gray-200 rounded-lg flex flex-col items-center justify-center">
              <Spinner />
              <p className="text-md font-serif text-gray-600 mt-4">Loading Model...</p>
            </div>
        )}
        
        <AnimatePresence>
          {isLoading && (
              <motion.div
                  className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-20 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
              >
                  <Spinner />
                  {loadingMessage && (
                      <p className="text-lg font-serif text-gray-700 mt-4 text-center px-4">{loadingMessage}</p>
                  )}
              </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pose Controls */}
      {displayImageUrl && !isLoading && (
        <div 
          className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-2"
          onMouseEnter={() => setIsPoseMenuOpen(true)}
          onMouseLeave={() => setIsPoseMenuOpen(false)}
        >
          {/* Pose popover menu */}
          <AnimatePresence>
              {isPoseMenuOpen && (
                  <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute bottom-full mb-2 md:mb-3 w-56 md:w-64 bg-white/80 backdrop-blur-lg rounded-lg md:rounded-xl p-1.5 md:p-2 border border-gray-200/80"
                  >
                      <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                          {poseInstructions.map((pose, index) => (
                              <button
                                  key={pose}
                                  onClick={() => onSelectPose(index)}
                                  disabled={isLoading || index === currentPoseIndex}
                                  className="w-full text-left text-xs md:text-sm font-medium text-gray-800 p-1.5 md:p-2 rounded-md hover:bg-gray-200/70 disabled:opacity-50 disabled:bg-gray-200/70 disabled:font-bold disabled:cursor-not-allowed"
                              >
                                  {pose}
                              </button>
                          ))}
                      </div>
                  </motion.div>
              )}
          </AnimatePresence>
          
          <div className="flex items-center justify-center gap-1 md:gap-2 bg-white/60 backdrop-blur-md rounded-full p-1.5 md:p-2 border border-gray-300/50">
            <button 
              onClick={handlePreviousPose}
              aria-label="Previous pose"
              className="p-1.5 md:p-2 rounded-full hover:bg-white/80 active:scale-90 transition-all disabled:opacity-50"
              disabled={isLoading}
            >
              <ChevronLeftIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-800" />
            </button>
            <span className="text-xs md:text-sm font-semibold text-gray-800 w-32 md:w-48 text-center truncate" title={poseInstructions[currentPoseIndex]}>
              {poseInstructions[currentPoseIndex]}
            </span>
            <button 
              onClick={handleNextPose}
              aria-label="Next pose"
              className="p-1.5 md:p-2 rounded-full hover:bg-white/80 active:scale-90 transition-all disabled:opacity-50"
              disabled={isLoading}
            >
              <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-800" />
            </button>
          </div>

          {/* Download Button */}
          <motion.div
            className="relative p-[2px] rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg hover:shadow-xl transition-shadow duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="relative group/download bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-800 font-semibold py-2 md:py-2.5 px-4 md:px-6 rounded-full transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full"
              aria-label="Download image"
            >
              <DownloadIcon className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 ${isDownloading ? 'animate-bounce' : 'group-hover/download:translate-y-0.5'}`} />
              <span className="text-xs md:text-sm font-semibold">
                {isDownloading ? 'Downloading...' : 'Download'}
              </span>
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Canvas;