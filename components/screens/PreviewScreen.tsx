/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compare } from "../ui/compare";

interface PreviewScreenProps {
  userImageUrl: string;
  generatedModelUrl: string;
  isGenerating: boolean;
  error: string | null;
  onReset: () => void;
  onStartStyling: () => void;
}

const PreviewScreen: React.FC<PreviewScreenProps> = ({
  userImageUrl,
  generatedModelUrl,
  isGenerating,
  error,
  onReset,
  onStartStyling,
}) => {
  const screenVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  return (
    <motion.div
      key="preview"
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
            Ready to Style
          </h2>
          <p className="mt-2 text-md text-gray-600">
            Your photo is uploaded. Let's try on some outfits!
          </p>
        </div>

        {error && (
          <div className="text-center md:text-left text-red-600 max-w-md mt-6">
            <p className="font-semibold">Upload Failed</p>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={onReset}
              className="text-sm font-semibold text-gray-700 hover:underline"
            >
              Try Again
            </button>
          </div>
        )}

        <AnimatePresence>
          {generatedModelUrl && !error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center gap-4 mt-8"
            >
              <button
                onClick={onReset}
                className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-gray-700 bg-gray-200 rounded-md cursor-pointer hover:bg-gray-300 transition-colors"
              >
                Use Different Photo
              </button>
              <button
                onClick={onStartStyling}
                className="w-full sm:w-auto relative inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-gray-900 rounded-md cursor-pointer group hover:bg-gray-700 transition-colors"
              >
                Start Styling &rarr;
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="md:w-1/2 w-full flex items-center justify-center">
        <div
          className={`relative rounded-[1.25rem] transition-all duration-700 ease-in-out ${
            isGenerating
              ? "border border-gray-300 animate-pulse"
              : "border border-transparent"
          }`}
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
  );
};

export default PreviewScreen;
