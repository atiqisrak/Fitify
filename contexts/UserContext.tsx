/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: number;
  name: string;
  phone: string;
  email?: string;
}

interface UserStats {
  id: number;
  user_id: number;
  current_coins: number;
  recharged_by_money: number;
  recharged_by_invitations: number;
  invitations_sent: number;
  total_coins_used: number;
  created_at: string;
  updated_at: string;
}

interface UserContextType {
  user: User | null;
  userStats: UserStats | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateCoins: (newCoins: number) => void;
  refreshUserStats: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = "fitify_user";

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Fetch user stats when user is loaded
        fetchUserStats(parsedUser.id);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const fetchUserStats = async (userId: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_ENGINE_URL}/users/${userId}/stats`
      );
      if (response.ok) {
        const stats = await response.json();
        setUserStats(stats);
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    }
  };

  const refreshUserStats = async () => {
    if (user) {
      await fetchUserStats(user.id);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    fetchUserStats(userData.id);
  };

  const logout = async () => {
    if (user) {
      try {
        // Call backend logout endpoint for logging/tracking
        await fetch(`${import.meta.env.VITE_ENGINE_URL}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        });
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }

    // Clear frontend state
    setUser(null);
    setUserStats(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateCoins = (newCoins: number) => {
    if (userStats) {
      setUserStats({ ...userStats, current_coins: newCoins });
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        userStats,
        isAuthenticated: !!user,
        login,
        logout,
        updateCoins,
        refreshUserStats,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
