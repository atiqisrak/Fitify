/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "framer-motion";
import { Compare } from "../ui/compare";

interface HeroScreenProps {
  onGetStarted: () => void;
}

const HeroScreen: React.FC<HeroScreenProps> = ({ onGetStarted }) => {
  const screenVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  return (
    <motion.div
      key="hero"
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
            Try On Any Look Instantly.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Ever wondered how an outfit would look on you? Upload your photo and
            explore our wardrobe. Use the Magic button to transform your look
            with AI.
          </p>
          <hr className="my-8 border-gray-200" />
          <div className="flex flex-col items-center lg:items-start w-full gap-3">
            <button
              onClick={onGetStarted}
              className="w-full relative flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-gray-900 rounded-md cursor-pointer group hover:bg-gray-700 transition-colors"
            >
              Get Started
            </button>
            <p className="text-gray-500 text-xs mt-1">
              By continuing, you agree not to create harmful, explicit, or
              unlawful content. This service is for creative and responsible use
              only.
            </p>
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
  );
};

export default HeroScreen;
