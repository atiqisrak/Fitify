/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloudIcon, CoinIcon } from './icons';
import { Compare } from './ui/compare';
import { generateModelImage } from '../services/geminiService';
import Spinner from './Spinner';
import { getFriendlyErrorMessage } from '../lib/utils';
import { coinService } from '../services/coinService';
import CoinModal from './CoinModal';

interface StartScreenProps {
  onModelFinalized: (modelUrl: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onModelFinalized }) => {
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [currentCoins, setCurrentCoins] = useState(coinService.getCoins());

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
    }

    if (!coinService.hasCoins()) {
        setCurrentCoins(coinService.getCoins());
        setShowCoinModal(true);
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setUserImageUrl(dataUrl);
        setIsGenerating(true);
        setGeneratedModelUrl(null);
        setError(null);
        try {
            const result = await generateModelImage(file);
            setGeneratedModelUrl(result);
            setCurrentCoins(coinService.getCoins());
        } catch (err) {
            if ((err as Error).message === 'INSUFFICIENT_COINS') {
                setCurrentCoins(coinService.getCoins());
                setShowCoinModal(true);
            }
            setError(getFriendlyErrorMessage(err, 'Failed to create model'));
            setUserImageUrl(null);
        } finally {
            setIsGenerating(false);
        }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const reset = () => {
    setUserImageUrl(null);
    setGeneratedModelUrl(null);
    setIsGenerating(false);
    setError(null);
    setCurrentCoins(coinService.getCoins());
  };

  const screenVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  return (
    <div className="w-full">
      <CoinModal 
        isOpen={showCoinModal} 
        onClose={() => setShowCoinModal(false)} 
        currentCoins={currentCoins}
      />
      {/* Floating Coin Display */}
      <button
        onClick={() => setShowCoinModal(true)}
        className="fixed top-6 right-6 md:top-8 md:right-8 z-50 flex items-center gap-2 px-2 py-1 bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all cursor-pointer border border-white/30 hover:bg-white/30"
        aria-label="View coins"
      >
        <CoinIcon className="w-7 h-7 md:w-8 md:h-8 drop-shadow-lg" />
        <span className="text-lg md:text-xl font-bold text-gray-800 drop-shadow-sm">{currentCoins}</span>
      </button>
      {/* Logo Header */}
      <div className="w-full flex justify-center pt-6 pb-4">
        <div className="absolute top-6 gap-2">
          <img src="/Fitify.svg" alt="Fitify Logo" className="w-28 h-8 md:w-64 md:h-26" />
          {/* <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-wide text-gray-900">
            Fitify
          </h1> */}
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {!userImageUrl ? (
          <motion.div
            key="uploader"
            className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 mt-12 md:mt-0"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="max-w-lg">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
                  Create Your Model for Any Look.
                </h2>
              <p className="mt-4 text-lg text-gray-600">
                Ever wondered how an outfit would look on you? Stop guessing. Upload a photo and see for yourself. Our AI creates your personal model, ready to try on anything.
              </p>
              <hr className="my-8 border-gray-200" />
              <div className="flex flex-col items-center lg:items-start w-full gap-3">
                <label htmlFor="image-upload-start" className="w-full relative flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-gray-900 rounded-md cursor-pointer group hover:bg-gray-700 transition-colors">
                  <UploadCloudIcon className="w-5 h-5 mr-3" />
                  Upload Photo
                </label>
                <input id="image-upload-start" type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif" onChange={handleFileChange} />
                <p className="text-gray-500 text-sm">Select a clear, full-body photo. Face-only photos also work, but full-body is preferred for best results.</p>
                <p className="text-gray-500 text-xs mt-1">By uploading, you agree not to create harmful, explicit, or unlawful content. This service is for creative and responsible use only.</p>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
            <Compare
              firstImage={`${import.meta.env.VITE_MEDIA_URL}atiqisrak.png`}
              secondImage={`${import.meta.env.VITE_MEDIA_URL}atiq-transformed.png`}
              slideMode="drag"
              className="w-full max-w-sm aspect-[2/3] rounded-2xl bg-gray-200"
            />
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="compare"
          className="w-full max-w-6xl mx-auto h-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <div className="md:w-1/2 flex-shrink-0 flex flex-col items-center md:items-start">
            <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
                The New You
              </h2>
              <p className="mt-2 text-md text-gray-600">
                Drag the slider to see your transformation.
              </p>
            </div>
            
            {isGenerating && (
              <div className="flex items-center gap-3 text-lg text-gray-700 font-serif mt-6">
                <Spinner />
                <span>Generating your model...</span>
              </div>
            )}

            {error && 
              <div className="text-center md:text-left text-red-600 max-w-md mt-6">
                <p className="font-semibold">Generation Failed</p>
                <p className="text-sm mb-4">{error}</p>
                <button onClick={reset} className="text-sm font-semibold text-gray-700 hover:underline">Try Again</button>
              </div>
            }
            
            <AnimatePresence>
              {generatedModelUrl && !isGenerating && !error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col sm:flex-row items-center gap-4 mt-8"
                >
                  <button 
                    onClick={reset}
                    className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-gray-700 bg-gray-200 rounded-md cursor-pointer hover:bg-gray-300 transition-colors"
                  >
                    Use Different Photo
                  </button>
                  <button 
                    onClick={() => onModelFinalized(generatedModelUrl)}
                    className="w-full sm:w-auto relative inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-gray-900 rounded-md cursor-pointer group hover:bg-gray-700 transition-colors"
                  >
                    Proceed to Styling &rarr;
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="md:w-1/2 w-full flex items-center justify-center">
            <div 
              className={`relative rounded-[1.25rem] transition-all duration-700 ease-in-out ${isGenerating ? 'border border-gray-300 animate-pulse' : 'border border-transparent'}`}
            >
              <Compare
                firstImage={userImageUrl}
                secondImage={generatedModelUrl ?? userImageUrl}
                slideMode="drag"
                className="w-[280px] h-[420px] sm:w-[320px] sm:h-[480px] lg:w-[400px] lg:h-[600px] rounded-2xl bg-gray-200"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  );
};

export default StartScreen;
