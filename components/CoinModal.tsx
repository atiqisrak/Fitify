/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon, CoinIcon, ShareIcon, WhatsappIcon } from "./icons";
import { useUser } from "../contexts/UserContext";
import { coinService } from "../services/coinService";

interface CoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoins: number;
}

const CoinModal: React.FC<CoinModalProps> = ({
  isOpen,
  onClose,
  currentCoins,
}) => {
  const { user, refreshUserStats } = useUser();
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleShare = async () => {
    if (!user) return;

    const shareText = `Check out Fitify - AI-powered virtual try-on! Transform your photos and try on outfits with ease.`;
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Fitify",
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        alert("Share link copied to clipboard!");
      }

      // Reward coins for sharing
      await coinService.addCoins(
        user.id,
        2,
        "earned",
        "Shared Fitify with friends"
      );
      await refreshUserStats();
      alert("Thanks for sharing! You earned 2 coins! 🪙");
      onClose();
    } catch (err) {
      console.log("Error sharing:", err);
    }
  };

  const handleRedeemCode = async () => {
    if (!user || !redeemCode.trim()) {
      setRedeemError("Please enter a code");
      return;
    }

    setIsRedeeming(true);
    setRedeemError(null);
    setRedeemSuccess(null);

    try {
      // Send either email or phone, not both
      const payload: any = { code: redeemCode.trim() };
      if (user.email) {
        payload.email = user.email;
      } else {
        payload.phone = user.phone;
      }

      const response = await fetch(
        `${import.meta.env.VITE_ENGINE_URL}/redeem-coin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to redeem code");
      }

      setRedeemSuccess(`Successfully redeemed ${data.coins_added} coins! 🎉`);
      setRedeemCode("");
      await refreshUserStats();
      setTimeout(() => {
        setRedeemSuccess(null);
      }, 3000);
    } catch (error: any) {
      setRedeemError(error.message || "Failed to redeem code");
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleRecharge = () => {
    const message = `Hi! I want to recharge my Fitify coins. Please help me with the process.`;
    const whatsappUrl = `https://wa.me/8801400893882?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
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
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <XIcon className="w-5 h-5 text-gray-500" />
                </button>

                <div className="text-center mb-4">
                  <div className="flex justify-center mb-3">
                    <CoinIcon className="w-16 h-16 md:w-20 md:h-20" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-gray-900 mb-2">
                    {currentCoins === 0 ? "Out of Coins!" : "Low on Coins"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    You have{" "}
                    <span className="font-bold text-gray-900">
                      {currentCoins} coin{currentCoins !== 1 ? "s" : ""}
                    </span>{" "}
                    remaining
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-3 border border-violet-200">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                      Get More Coins
                    </h3>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>• Share Fitify with friends (+2 coins)</li>
                      <li>• Redeem a coin code</li>
                      <li>• Recharge via WhatsApp</li>
                    </ul>
                  </div>

                  {/* Redeem Code Section */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                      Redeem Code
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={redeemCode}
                        onChange={(e) => setRedeemCode(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                        disabled={isRedeeming}
                      />
                      <button
                        onClick={handleRedeemCode}
                        disabled={isRedeeming || !redeemCode.trim()}
                        className="px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRedeeming ? "..." : "Redeem"}
                      </button>
                    </div>
                    {redeemError && (
                      <p className="text-xs text-red-600 mt-2">{redeemError}</p>
                    )}
                    {redeemSuccess && (
                      <p className="text-xs text-green-600 mt-2">
                        {redeemSuccess}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {/* <button
                    onClick={handleShare}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center"
                  >
                    <ShareIcon className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Share & Earn 2 Coins
                  </button> */}
                  <button
                    onClick={handleRecharge}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center"
                  >
                    <WhatsappIcon className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Recharge via WhatsApp
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Close
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Each action costs 1 coin. Manage your usage wisely!
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CoinModal;
