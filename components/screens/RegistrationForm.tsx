/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "framer-motion";
import Spinner from "../Spinner";

interface RegistrationFormProps {
  onSubmit: (name: string, email: string) => Promise<void>;
  onBack: () => void;
  error: string | null;
  isSubmitting: boolean;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSubmit,
  onBack,
  error,
  isSubmitting,
}) => {
  const screenVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    await onSubmit(name, email);
  };

  return (
    <motion.div
      key="form"
      className="w-full max-w-md mx-auto flex flex-col items-center justify-center gap-6 mt-12 md:mt-0 px-4"
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
          Create Your Account
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Enter your details to get started with Fitify
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="w-full space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
            placeholder="Enter your email"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:flex-1 px-8 py-3 text-base font-semibold text-white bg-gray-900 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Spinner />
                <span className="ml-2">Submitting...</span>
              </>
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default RegistrationForm;
