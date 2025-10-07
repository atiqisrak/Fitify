/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { CoinIcon } from "./icons";
import { coinService } from "../services/coinService";
import CoinModal from "./CoinModal";
import HeroScreen from "./screens/HeroScreen";
import RegistrationForm from "./screens/RegistrationForm";
import UploadScreen from "./screens/UploadScreen";
import PreviewScreen from "./screens/PreviewScreen";

interface StartScreenProps {
  onModelFinalized: (modelUrl: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onModelFinalized }) => {
  const [currentStep, setCurrentStep] = useState<
    "hero" | "form" | "upload" | "preview"
  >("hero");
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [currentCoins, setCurrentCoins] = useState(coinService.getCoins());

  const submitUserData = async (name: string, email: string) => {
    // Placeholder - will be configured with actual endpoint later
    try {
      // const response = await fetch("/api/user-register", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ name, email }),
      // });

      // if (!response.ok) {
      //   throw new Error("Failed to register user");
      // }

      // return await response.json();
      // TODO: Implement API call when endpoint is ready
      return { success: true, name, email };
    } catch (err) {
      throw err;
    }
  };

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setUserImageUrl(dataUrl);
      setGeneratedModelUrl(dataUrl); // Use original image directly
      setError(null);
      setCurrentStep("preview");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const reset = () => {
    setCurrentStep("hero");
    setUserData(null);
    setUserImageUrl(null);
    setGeneratedModelUrl(null);
    setIsGenerating(false);
    setError(null);
    setCurrentCoins(coinService.getCoins());
  };

  const handleFormSubmit = async (name: string, email: string) => {
    if (!name || !email) {
      setError("Please fill in all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmittingForm(true);
    setError(null);

    try {
      await submitUserData(name, email);
      setUserData({ name, email });
      setCurrentStep("upload");
    } catch (err) {
      setError("Failed to register. Please try again.");
    } finally {
      setIsSubmittingForm(false);
    }
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
        <span className="text-lg md:text-xl font-bold text-gray-800 drop-shadow-sm">
          {currentCoins}
        </span>
      </button>
      {/* Logo Header */}
      <div className="w-full flex justify-center pt-6 pb-4">
        <div className="absolute top-6 gap-2">
          <img
            src="/Fitify.svg"
            alt="Fitify Logo"
            className="w-28 h-8 md:w-64 md:h-26"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentStep === "hero" && (
          <HeroScreen onGetStarted={() => setCurrentStep("form")} />
        )}

        {currentStep === "form" && (
          <RegistrationForm
            onSubmit={handleFormSubmit}
            onBack={() => {
              setCurrentStep("hero");
              setError(null);
            }}
            error={error}
            isSubmitting={isSubmittingForm}
          />
        )}

        {currentStep === "upload" && (
          <UploadScreen
            onFileSelect={handleFileChange}
            onBack={() => {
              setCurrentStep("form");
              setError(null);
            }}
            error={error}
          />
        )}

        {currentStep === "preview" && userImageUrl && generatedModelUrl && (
          <PreviewScreen
            userImageUrl={userImageUrl}
            generatedModelUrl={generatedModelUrl}
            isGenerating={isGenerating}
            error={error}
            onReset={reset}
            onStartStyling={() => onModelFinalized(generatedModelUrl)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StartScreen;
