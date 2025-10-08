/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import Spinner from "../Spinner";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

interface RegistrationFormProps {
  onSubmit: (
    name: string,
    phone: string,
    password: string,
    email?: string
  ) => Promise<void>;
  onGoogleAuth?: (userData: any) => void;
  onBack: () => void;
  onSwitchToSignIn: () => void;
  error: string | null;
  isSubmitting: boolean;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSubmit,
  onGoogleAuth,
  onBack,
  onSwitchToSignIn,
  error,
  isSubmitting,
}) => {
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [showTraditionalForm, setShowTraditionalForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const screenVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  const formVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
    visible: {
      opacity: 1,
      height: "auto",
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    await onSubmit(name, phone, password, email || undefined);
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      console.log("Google login success:", decoded);

      // Use dedicated Google auth endpoint
      const response = await fetch(
        import.meta.env.VITE_ENGINE_URL + "/auth/google",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: decoded.name || decoded.given_name || "Google User",
            email: decoded.email,
            googleToken: credentialResponse.credential,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Google authentication failed");
      }

      const userData = await response.json();

      // Call parent's Google auth handler
      if (onGoogleAuth) {
        onGoogleAuth(userData);
      }
    } catch (err) {
      console.error("Google login error:", err);
      setGoogleError("Failed to sign in with Google. Please try again.");
    }
  };

  const handleGoogleError = () => {
    console.log("Google login failed");
    setGoogleError("Google sign in failed. Please try again.");
  };

  return (
    <motion.div
      key="form"
      className="w-full max-w-lg mx-auto flex flex-col items-center justify-center gap-8 mt-12 md:mt-0 px-4"
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.h2
          className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Join Fitify
        </motion.h2>
        <motion.p
          className="text-lg text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Try before you buy, powered by AI
        </motion.p>
      </div>

      {/* Google Sign In - Primary CTA */}
      <motion.div
        className="w-full space-y-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            size="large"
            text="continue_with"
            theme="filled_blue"
            shape="pill"
            width="350"
            logo_alignment="left"
          />
        </div>

        {googleError && (
          <motion.p
            className="text-red-500 text-sm text-center"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {googleError}
          </motion.p>
        )}
      </motion.div>

      {/* Divider with Toggle */}
      <motion.div
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <button
              type="button"
              onClick={() => setShowTraditionalForm(!showTraditionalForm)}
              className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200 flex items-center gap-2 group"
            >
              <span>Or continue with email</span>
              <motion.svg
                className="w-4 h-4 text-gray-500 group-hover:text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={{ rotate: showTraditionalForm ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </motion.svg>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Traditional Form - Collapsible */}
      <motion.div
        className="w-full overflow-hidden"
        variants={formVariants}
        initial="hidden"
        animate={showTraditionalForm ? "visible" : "hidden"}
      >
        <form onSubmit={handleFormSubmit} className="w-full space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all hover:border-gray-400"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all hover:border-gray-400"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all hover:border-gray-400"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all hover:border-gray-400"
                placeholder="Create a secure password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              className="text-red-500 text-sm bg-red-50 p-3 rounded-lg"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 px-8 py-3 text-base font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <Spinner />
                  <span className="ml-2">Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Sign In Link */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={onSwitchToSignIn}
            className="text-violet-600 hover:text-violet-700 font-semibold transition-colors"
          >
            Sign in
          </button>
        </p>
      </motion.div>

      {/* Back Button - Always Visible */}
      {!showTraditionalForm && (
        <motion.button
          type="button"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to home
        </motion.button>
      )}
    </motion.div>
  );
};

export default RegistrationForm;
