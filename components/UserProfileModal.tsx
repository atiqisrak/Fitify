/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../contexts/UserContext";
import { CoinIcon } from "./icons";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, userStats, logout } = useUser();

  const handleLogout = () => {
    logout();
    onClose();
    // Optionally reload the page or redirect
    window.location.href = "/";
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center p-4 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-full max-w-md max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="relative p-4 md:p-6">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* User Info */}
                <div className="text-center mb-4 md:mb-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 bg-transparent to-purple-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-10 h-10 md:w-12 md:h-12 text-gray-800"
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
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                    {user.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {user.email || user.phone}
                  </p>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-4 md:mb-6">
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-3 md:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CoinIcon className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="font-medium text-gray-700 text-sm md:text-base">
                          Current Coins
                        </span>
                      </div>
                      <span className="text-xl md:text-2xl font-bold text-purple-600">
                        {userStats?.current_coins || 0}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <div className="bg-gray-50 rounded-lg p-2 md:p-3">
                      <p className="text-xs text-gray-500 mb-1">Coins Used</p>
                      <p className="text-base md:text-lg font-bold text-gray-900">
                        {userStats?.total_coins_used || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 md:p-3">
                      <p className="text-xs text-gray-500 mb-1">Purchased</p>
                      <p className="text-base md:text-lg font-bold text-gray-900">
                        {userStats?.recharged_by_money || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 md:p-3">
                      <p className="text-xs text-gray-500 mb-1">From Invites</p>
                      <p className="text-base md:text-lg font-bold text-gray-900">
                        {userStats?.recharged_by_invitations || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 md:p-3">
                      <p className="text-xs text-gray-500 mb-1">Invites Sent</p>
                      <p className="text-base md:text-lg font-bold text-gray-900">
                        {userStats?.invitations_sent || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <button
                    onClick={onClose}
                    className="w-full px-4 py-2.5 md:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors text-sm md:text-base"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 md:py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserProfileModal;
