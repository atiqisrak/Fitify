/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StartScreen from "./components/StartScreen";
import Canvas from "./components/Canvas";
import WardrobePanel from "./components/WardrobeModal";
import OutfitStack from "./components/OutfitStack";
import Header from "./components/Header";
import {
  generateVirtualTryOnImage,
  generatePoseVariation,
  generateModelImage,
} from "./services/geminiService";
import { OutfitLayer, WardrobeItem } from "./types";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CoinIcon,
  WandIcon,
} from "./components/icons";
import { defaultWardrobe } from "./wardrobe";
import Footer from "./components/Footer";
import { getFriendlyErrorMessage } from "./lib/utils";
import Spinner from "./components/Spinner";
import { coinService } from "./services/coinService";
import CoinModal from "./components/CoinModal";
import { imageStorageService } from "./services/imageStorageService";
import ImageGalleryModal from "./components/ImageGalleryModal";

const POSE_INSTRUCTIONS = [
  "Full frontal view, hands on hips",
  "Slightly turned, 3/4 view",
  "Side profile view",
  "Jumping in the air, mid-action shot",
  "Walking towards camera",
  "Leaning against a wall",
];

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    // DEPRECATED: mediaQueryList.addListener(listener);
    mediaQueryList.addEventListener("change", listener);

    // Check again on mount in case it changed between initial state and effect runs
    if (mediaQueryList.matches !== matches) {
      setMatches(mediaQueryList.matches);
    }

    return () => {
      // DEPRECATED: mediaQueryList.removeListener(listener);
      mediaQueryList.removeEventListener("change", listener);
    };
  }, [query, matches]);

  return matches;
};

const App: React.FC = () => {
  const [modelImageUrl, setModelImageUrl] = useState<string | null>(null);
  const [originalUserImageUrl, setOriginalUserImageUrl] = useState<
    string | null
  >(null);
  const [isModelTransformed, setIsModelTransformed] = useState(false);
  const [outfitHistory, setOutfitHistory] = useState<OutfitLayer[]>([]);
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [isSheetCollapsed, setIsSheetCollapsed] = useState(false);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(defaultWardrobe);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [currentCoins, setCurrentCoins] = useState(coinService.getCoins());
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  const activeOutfitLayers = useMemo(
    () => outfitHistory.slice(0, currentOutfitIndex + 1),
    [outfitHistory, currentOutfitIndex]
  );

  const activeGarmentIds = useMemo(() => {
    // Only mark the most recent garment as active in the wardrobe
    const lastLayer = activeOutfitLayers[activeOutfitLayers.length - 1];
    return lastLayer?.garment?.id ? [lastLayer.garment.id] : [];
  }, [activeOutfitLayers]);

  const displayImageUrl = useMemo(() => {
    if (outfitHistory.length === 0) return modelImageUrl;
    const currentLayer = outfitHistory[currentOutfitIndex];
    if (!currentLayer) return modelImageUrl;

    const poseInstruction = POSE_INSTRUCTIONS[currentPoseIndex];
    // Return the image for the current pose, or fallback to the first available image for the current layer.
    // This ensures an image is shown even while a new pose is generating.
    return (
      currentLayer.poseImages[poseInstruction] ??
      Object.values(currentLayer.poseImages)[0]
    );
  }, [outfitHistory, currentOutfitIndex, currentPoseIndex, modelImageUrl]);

  const availablePoseKeys = useMemo(() => {
    if (outfitHistory.length === 0) return [];
    const currentLayer = outfitHistory[currentOutfitIndex];
    return currentLayer ? Object.keys(currentLayer.poseImages) : [];
  }, [outfitHistory, currentOutfitIndex]);

  // Prevent accidental page refresh when user has an active session
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (modelImageUrl) {
        e.preventDefault();
        e.returnValue = ""; // Chrome requires returnValue to be set
        return ""; // Some browsers show this message
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [modelImageUrl]);

  const handleModelFinalized = (url: string) => {
    setModelImageUrl(url);
    setOriginalUserImageUrl(url);
    setIsModelTransformed(false);
    setOutfitHistory([
      {
        garment: null,
        poseImages: { [POSE_INSTRUCTIONS[0]]: url },
      },
    ]);
    setCurrentOutfitIndex(0);
  };

  const handleMagicTransform = async () => {
    if (!originalUserImageUrl || isLoading || !coinService.hasCoins()) {
      if (!coinService.hasCoins()) {
        setShowCoinModal(true);
      }
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Creating your AI model...");
    setError(null);

    try {
      // Convert data URL to File
      const response = await fetch(originalUserImageUrl);
      const blob = await response.blob();
      const file = new File([blob], "user-image.jpg", { type: "image/jpeg" });

      const transformedUrl = await generateModelImage(file);

      // Store the transformation
      imageStorageService.storeImage({
        userImageUrl: originalUserImageUrl,
        modelImageUrl: transformedUrl,
        generatedImageUrl: transformedUrl,
      });

      setModelImageUrl(transformedUrl);
      setIsModelTransformed(true);
      setOutfitHistory([
        {
          garment: null,
          poseImages: { [POSE_INSTRUCTIONS[0]]: transformedUrl },
        },
      ]);
      setCurrentOutfitIndex(0);
      setCurrentCoins(coinService.getCoins());
    } catch (err) {
      if ((err as Error).message === "INSUFFICIENT_COINS") {
        setCurrentCoins(coinService.getCoins());
        setShowCoinModal(true);
      }
      setError(getFriendlyErrorMessage(err, "Failed to transform image"));
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleStartOver = () => {
    setModelImageUrl(null);
    setOutfitHistory([]);
    setCurrentOutfitIndex(0);
    setIsLoading(false);
    setLoadingMessage("");
    setError(null);
    setCurrentPoseIndex(0);
    setIsSheetCollapsed(false);
    setWardrobe(defaultWardrobe);
  };

  const handleGarmentSelect = useCallback(
    async (garmentFile: File, garmentInfo: WardrobeItem) => {
      if (!displayImageUrl || isLoading) return;

      const currentPoseInstruction = POSE_INSTRUCTIONS[currentPoseIndex];

      // Check cache first
      const cachedImage = imageStorageService.getCachedImage(
        originalUserImageUrl || displayImageUrl,
        garmentInfo.id,
        currentPoseInstruction
      );

      if (cachedImage) {
        // Use cached image - no coin cost!
        const newLayer: OutfitLayer = {
          garment: garmentInfo,
          poseImages: { [currentPoseInstruction]: cachedImage },
        };

        setOutfitHistory((prevHistory) => {
          const newHistory = prevHistory.slice(0, currentOutfitIndex + 1);
          return [...newHistory, newLayer];
        });
        setCurrentOutfitIndex((prev) => prev + 1);
        setCurrentPoseIndex(0);
        return;
      }

      // Caching: Check if we are re-applying a previously generated layer
      const nextLayer = outfitHistory[currentOutfitIndex + 1];
      if (nextLayer && nextLayer.garment?.id === garmentInfo.id) {
        setCurrentOutfitIndex((prev) => prev + 1);
        setCurrentPoseIndex(0);
        return;
      }

      setError(null);
      setIsLoading(true);
      setLoadingMessage(`Adding ${garmentInfo.name}...`);

      try {
        const newImageUrl = await generateVirtualTryOnImage(
          displayImageUrl,
          garmentFile
        );

        // Store in cache
        imageStorageService.storeImage({
          userImageUrl: originalUserImageUrl || displayImageUrl,
          modelImageUrl: displayImageUrl,
          garmentId: garmentInfo.id,
          garmentName: garmentInfo.name,
          generatedImageUrl: newImageUrl,
          poseInstruction: currentPoseInstruction,
        });

        const newLayer: OutfitLayer = {
          garment: garmentInfo,
          poseImages: { [currentPoseInstruction]: newImageUrl },
        };

        setOutfitHistory((prevHistory) => {
          const newHistory = prevHistory.slice(0, currentOutfitIndex + 1);
          return [...newHistory, newLayer];
        });
        setCurrentOutfitIndex((prev) => prev + 1);
        setCurrentCoins(coinService.getCoins());

        // Add to personal wardrobe if it's not already there
        setWardrobe((prev) => {
          if (prev.find((item) => item.id === garmentInfo.id)) {
            return prev;
          }
          return [...prev, garmentInfo];
        });
      } catch (err) {
        if ((err as Error).message === "INSUFFICIENT_COINS") {
          setCurrentCoins(coinService.getCoins());
          setShowCoinModal(true);
        }
        setError(getFriendlyErrorMessage(err, "Failed to apply garment"));
      } finally {
        setIsLoading(false);
        setLoadingMessage("");
      }
    },
    [
      displayImageUrl,
      isLoading,
      currentPoseIndex,
      outfitHistory,
      currentOutfitIndex,
      originalUserImageUrl,
    ]
  );

  const handleRemoveLastGarment = () => {
    if (currentOutfitIndex > 0) {
      setCurrentOutfitIndex((prevIndex) => prevIndex - 1);
      setCurrentPoseIndex(0); // Reset pose to default when removing a layer
    }
  };

  const handlePoseSelect = useCallback(
    async (newIndex: number) => {
      if (
        isLoading ||
        outfitHistory.length === 0 ||
        newIndex === currentPoseIndex
      )
        return;

      const poseInstruction = POSE_INSTRUCTIONS[newIndex];
      const currentLayer = outfitHistory[currentOutfitIndex];

      // If pose already exists, just update the index to show it.
      if (currentLayer.poseImages[poseInstruction]) {
        setCurrentPoseIndex(newIndex);
        return;
      }

      // Pose doesn't exist, so generate it.
      // Use an existing image from the current layer as the base.
      const baseImageForPoseChange = Object.values(
        currentLayer.poseImages
      )[0] as string | undefined;
      if (!baseImageForPoseChange) return; // Should not happen

      setError(null);
      setIsLoading(true);
      setLoadingMessage(`Changing pose...`);

      const prevPoseIndex = currentPoseIndex;
      // Optimistically update the pose index so the pose name changes in the UI
      setCurrentPoseIndex(newIndex);

      try {
        const newImageUrl = await generatePoseVariation(
          baseImageForPoseChange,
          poseInstruction
        );
        setOutfitHistory((prevHistory) => {
          const newHistory = [...prevHistory];
          const updatedLayer = newHistory[currentOutfitIndex];
          updatedLayer.poseImages[poseInstruction] = newImageUrl;
          return newHistory;
        });
        setCurrentCoins(coinService.getCoins());
      } catch (err) {
        if ((err as Error).message === "INSUFFICIENT_COINS") {
          setCurrentCoins(coinService.getCoins());
          setShowCoinModal(true);
        }
        setError(getFriendlyErrorMessage(err, "Failed to change pose"));
        // Revert pose index on failure
        setCurrentPoseIndex(prevPoseIndex);
      } finally {
        setIsLoading(false);
        setLoadingMessage("");
      }
    },
    [currentPoseIndex, outfitHistory, isLoading, currentOutfitIndex]
  );

  const viewVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
  };

  return (
    <div className="font-sans">
      <CoinModal
        isOpen={showCoinModal}
        onClose={() => setShowCoinModal(false)}
        currentCoins={currentCoins}
      />
      <ImageGalleryModal
        isOpen={showGalleryModal}
        onClose={() => setShowGalleryModal(false)}
        userImageUrl={originalUserImageUrl || undefined}
      />
      {modelImageUrl && (
        <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50 flex flex-col md:flex-row items-end md:items-center gap-2">
          {/* Coins Display - First on mobile (top), Second on desktop (right) */}
          <motion.button
            onClick={() => setShowCoinModal(true)}
            className="flex items-center gap-2 px-2 py-1 md:px-3 md:py-2 bg-white/20 backdrop-blur-md rounded-xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all border border-white/30 hover:bg-white/30 order-1 md:order-2"
            aria-label="View coins"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <CoinIcon className="w-6 h-6 md:w-7 md:h-7 drop-shadow-lg" />
            <span className="text-base md:text-lg font-bold text-gray-800 drop-shadow-sm">
              {currentCoins}
            </span>
          </motion.button>

          {/* Gallery Button - Second on mobile (bottom), First on desktop (left) */}
          <motion.button
            onClick={() => setShowGalleryModal(true)}
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all order-2 md:order-1"
            aria-label="View gallery"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="hidden sm:inline text-sm md:text-base">
              Gallery
            </span>
          </motion.button>
        </div>
      )}
      <AnimatePresence mode="wait">
        {!modelImageUrl ? (
          <motion.div
            key="start-screen"
            className="w-screen min-h-screen flex items-start sm:items-center justify-center bg-gray-50 p-4 pb-20"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <StartScreen onModelFinalized={handleModelFinalized} />
          </motion.div>
        ) : (
          <motion.div
            key="main-app"
            className="relative flex flex-col h-screen bg-white overflow-hidden"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Header />
            <main className="flex-grow relative flex flex-col md:flex-row overflow-hidden pt-14 md:pt-16">
              <div className="w-full h-full flex-grow flex items-center justify-center bg-white pb-20 md:pb-0 relative">
                <Canvas
                  displayImageUrl={displayImageUrl}
                  onStartOver={handleStartOver}
                  isLoading={isLoading}
                  loadingMessage={loadingMessage}
                  onSelectPose={handlePoseSelect}
                  poseInstructions={POSE_INSTRUCTIONS}
                  currentPoseIndex={currentPoseIndex}
                  availablePoseKeys={availablePoseKeys}
                  onMagicTransform={handleMagicTransform}
                  showMagicButton={!isModelTransformed && !!modelImageUrl}
                />
              </div>

              <motion.aside
                className={`absolute md:relative md:flex-shrink-0 bottom-0 right-0 h-auto max-h-[75vh] md:max-h-full md:h-full w-full md:w-1/3 md:max-w-sm bg-white/80 backdrop-blur-md flex flex-col border-t md:border-t-0 md:border-l border-gray-200/60 md:translate-y-0`}
                animate={{
                  y: isMobile && isSheetCollapsed ? "calc(100% - 4rem)" : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8,
                }}
              >
                <motion.button
                  onClick={() => setIsSheetCollapsed(!isSheetCollapsed)}
                  className="md:hidden w-full h-16 flex items-center justify-center bg-gradient-to-b from-violet-500 to-violet-600 flex-shrink-0 gap-3 px-4 shadow-lg relative overflow-hidden"
                  aria-label={
                    isSheetCollapsed ? "Open wardrobe" : "Close wardrobe"
                  }
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <motion.div
                    className="flex items-center gap-3 relative z-10"
                    animate={{
                      y: isSheetCollapsed ? [0, -3, 0] : 0,
                    }}
                    transition={{
                      y: {
                        duration: 1.2,
                        repeat: isSheetCollapsed ? Infinity : 0,
                        ease: "easeInOut",
                      },
                    }}
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <span className="text-base font-bold text-white tracking-wide">
                      {isSheetCollapsed
                        ? "TAP TO OPEN WARDROBE"
                        : "CLOSE WARDROBE"}
                    </span>
                    <motion.div
                      animate={{
                        rotate: isSheetCollapsed ? 0 : 180,
                      }}
                      transition={{
                        rotate: { duration: 0.3, ease: "easeInOut" },
                      }}
                    >
                      <ChevronUpIcon className="w-6 h-6 text-white" />
                    </motion.div>
                  </motion.div>
                </motion.button>
                <div className="p-4 md:p-6 pb-6 md:pb-20 overflow-y-auto flex-grow flex flex-col gap-6 md:gap-8">
                  {error && (
                    <div
                      className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md"
                      role="alert"
                    >
                      <p className="font-bold">Error</p>
                      <p>{error}</p>
                    </div>
                  )}
                  <OutfitStack
                    outfitHistory={activeOutfitLayers}
                    onRemoveLastGarment={handleRemoveLastGarment}
                  />
                  <WardrobePanel
                    onGarmentSelect={handleGarmentSelect}
                    activeGarmentIds={activeGarmentIds}
                    isLoading={isLoading}
                    wardrobe={wardrobe}
                  />
                </div>
              </motion.aside>
            </main>
            <AnimatePresence>
              {isLoading && isMobile && (
                <motion.div
                  className="fixed inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Spinner />
                  {loadingMessage && (
                    <p className="text-lg font-serif text-gray-700 mt-4 text-center px-4">
                      {loadingMessage}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="hidden md:block mb-6" />
      <Footer isOnDressingScreen={!!modelImageUrl} />
    </div>
  );
};

export default App;
