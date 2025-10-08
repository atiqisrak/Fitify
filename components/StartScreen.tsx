/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { CoinIcon } from "./icons";
import { useUser } from "../contexts/UserContext";
import CoinModal from "./CoinModal";
import UserProfileModal from "./UserProfileModal";
import HeroScreen from "./screens/HeroScreen";
import RegistrationForm from "./screens/RegistrationForm";
import SignInForm from "./screens/SignInForm";
import UploadScreen from "./screens/UploadScreen";
import PreviewScreen from "./screens/PreviewScreen";

interface StartScreenProps {
  onModelFinalized: (modelUrl: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onModelFinalized }) => {
  const { user, login, userStats } = useUser();
  const [currentStep, setCurrentStep] = useState<
    "hero" | "signup" | "signin" | "upload" | "preview"
  >("hero");
  const [userData, setUserData] = useState<{
    name: string;
    phone: string;
  } | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const submitUserData = async (
    name: string,
    phone: string,
    password: string,
    email?: string
  ) => {
    try {
      const response = await fetch(
        import.meta.env.VITE_ENGINE_URL + "/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, phone, password, email }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to register user");
      }

      return await response.json();
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
  };

  const handleGetStarted = () => {
    // If user is already logged in, go directly to upload
    if (user) {
      setCurrentStep("upload");
    } else {
      setCurrentStep("signin");
    }
  };

  const handleSignUpSubmit = async (
    name: string,
    phone: string,
    password: string,
    email?: string
  ) => {
    if (!name || !phone || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsSubmittingForm(true);
    setError(null);

    try {
      const userData = await submitUserData(name, phone, password, email);
      // Login the user with the returned data
      login({
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
      });
      setUserData({ name, phone });
      setCurrentStep("upload");
    } catch (err) {
      setError("Failed to register. Please try again.");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleSignInSubmit = async (phone: string, password: string) => {
    if (!phone || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsSubmittingForm(true);
    setError(null);

    try {
      const response = await fetch(import.meta.env.VITE_ENGINE_URL + "/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const userData = await response.json();

      // Login the user with the returned data
      login({
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
      });

      setUserData({ name: userData.name, phone });
      setCurrentStep("upload");
    } catch (err) {
      setError("Invalid phone or password. Please try again.");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleGoogleAuth = (userData: any) => {
    // Login the user with Google OAuth data
    login({
      id: userData.id,
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
    });

    setUserData({
      name: userData.name,
      phone: userData.phone || userData.email,
    });
    setCurrentStep("upload");
  };

  return (
    <div className="w-full">
      <CoinModal
        isOpen={showCoinModal}
        onClose={() => setShowCoinModal(false)}
        currentCoins={userStats?.current_coins || 0}
      />
      <UserProfileModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
      />

      {/* User Profile Button - Top Left */}
      {user && (
        <button
          onClick={() => setShowUserModal(true)}
          className="fixed top-6 left-6 md:top-8 md:left-8 z-50 flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all cursor-pointer border border-white/30 hover:bg-white/30"
          aria-label="View profile"
        >
          <div className="w-8 h-8 bg-transparent to-purple-600 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-gray-800"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <span className="text-sm md:text-base font-semibold text-gray-800 drop-shadow-sm hidden md:inline">
            {user.name.split(" ")[0]}
          </span>
        </button>
      )}

      {/* Floating Coin Display - Top Right */}
      <button
        onClick={() => setShowCoinModal(true)}
        className="fixed top-6 right-6 md:top-8 md:right-8 z-50 flex items-center gap-2 px-2 py-1 bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all cursor-pointer border border-white/30 hover:bg-white/30"
        aria-label="View coins"
      >
        <CoinIcon className="w-7 h-7 md:w-8 md:h-8 drop-shadow-lg" />
        <span className="text-lg md:text-xl font-bold text-gray-800 drop-shadow-sm">
          {userStats?.current_coins || 0}
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
          <HeroScreen onGetStarted={handleGetStarted} />
        )}

        {currentStep === "signin" && (
          <SignInForm
            onSubmit={handleSignInSubmit}
            onGoogleAuth={handleGoogleAuth}
            onBack={() => {
              setCurrentStep("hero");
              setError(null);
            }}
            onSwitchToSignUp={() => {
              setCurrentStep("signup");
              setError(null);
            }}
            error={error}
            isSubmitting={isSubmittingForm}
          />
        )}

        {currentStep === "signup" && (
          <RegistrationForm
            onSubmit={handleSignUpSubmit}
            onGoogleAuth={handleGoogleAuth}
            onBack={() => {
              setCurrentStep("signin");
              setError(null);
            }}
            onSwitchToSignIn={() => {
              setCurrentStep("signin");
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
              setCurrentStep(user ? "hero" : "signin");
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
