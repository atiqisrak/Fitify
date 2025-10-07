/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  UploadCloudIcon,
  CheckCircleIcon,
  ShirtIcon,
  WandIcon,
} from "../icons";

interface UploadScreenProps {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
  error: string | null;
}

const UploadScreen: React.FC<UploadScreenProps> = ({
  onFileSelect,
  onBack,
  error,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const screenVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const syntheticEvent = {
        target: {
          files: files,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onFileSelect(syntheticEvent);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div
      key="upload"
      className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center gap-8 md:gap-12 mt-8 md:mt-0 px-4 md:px-8"
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <div className="text-center max-w-2xl">
        <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 leading-tight">
          Upload Your Photo
        </h2>
        <p className="mt-6 text-lg md:text-xl text-gray-600 leading-relaxed">
          Let's see how you look in different outfits! Upload a clear photo to
          get started.
        </p>
      </div>

      <div className="w-full max-w-3xl space-y-6">
        {/* Drag and Drop Area */}
        <motion.div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`
            relative overflow-hidden rounded-3xl border-2 border-dashed 
            cursor-pointer transition-all duration-300 ease-in-out
            ${
              isDragging
                ? "border-gray-900 bg-gray-50 scale-105"
                : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
            }
          `}
        >
          <div className="p-12 md:p-20 flex flex-col items-center justify-center text-center space-y-6">
            <motion.div
              animate={{
                y: isDragging ? -10 : 0,
                scale: isDragging ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <UploadCloudIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
              </div>
            </motion.div>

            <div className="space-y-3">
              <p className="text-xl md:text-2xl font-semibold text-gray-900">
                {isDragging
                  ? "Drop your photo here"
                  : "Drag & drop your photo here"}
              </p>
              <p className="text-base md:text-lg text-gray-500">or</p>
              <div className="inline-block">
                <span className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                  Browse Files
                </span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              id="image-upload-start"
              type="file"
              className="hidden"
              accept="image/png, image/jpeg, image/jpg"
              onChange={onFileSelect}
            />
          </div>

          {/* Animated Background Pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.1)_0%,transparent_50%)]" />
          </div>
        </motion.div>

        {/* Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-8">
          <div className="group flex items-start gap-3 p-4 rounded-xl hover:bg-gray-50/50 transition-colors">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <CheckCircleIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Clear Photo
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Well-lit, high-quality image
              </p>
            </div>
          </div>
          <div className="group flex items-start gap-3 p-4 rounded-xl hover:bg-gray-50/50 transition-colors">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <ShirtIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Full Body
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Full-body preferred, face works too
              </p>
            </div>
          </div>
          <div className="group flex items-start gap-3 p-4 rounded-xl hover:bg-gray-50/50 transition-colors">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <WandIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Best Results
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Stand straight, front-facing
              </p>
            </div>
          </div>
        </div>

        {/* Supported Formats */}
        <p className="text-center text-xs text-gray-400 tracking-wide">
          PNG, JPEG, JPG
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 text-center"
          >
            <p className="text-red-600 font-medium">{error}</p>
          </motion.div>
        )}

        {/* Back Button */}
        <div className="pt-4">
          <button
            onClick={onBack}
            className="w-full md:w-auto px-8 py-3 text-base font-semibold text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default UploadScreen;
