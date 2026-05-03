"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  createAuthenticatedApiClient,
  API_ENDPOINTS,
  handleApiError,
} from "@/lib/api";
import { useSocket } from "@/components/SocketProvider";

export interface IUserStats {
  totalTasksCompleted: number;
  totalFocusTime: number;
  currentStreak: number;
  longestStreak: number;
  pointsEarned: number;
  level: number;
  nextLevelPoints: number;
  tasksCompletedToday: number;
  focusTimeToday: number;
  spoonState: {
    spoonsUsed: number;
    remainingSpoons: number;
    effortMultiplier: number;
    isHighEffort: boolean;
  };
  avgDurationByPriority?: Record<string, number>;
}

export interface IUserProfile {
  _id: string;
  clerkId: string;
  firstName: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  timezone: string;
  role: "standard" | "student" | "parent";
  onboarded: boolean;
  dailySpoonBudget: number;
  hyperFocusDuration: number;
  streakShields: number;
  parentId?: string;
  preferences: {
    theme: "light" | "dark";
    emailNotifications: boolean;
    dailyDigest: boolean;
    streakReminderFriday: boolean;
  };
}

interface UserContextType {
  stats: IUserStats | null;
  profile: IUserProfile | null;
  loading: boolean;
  error: string | null;
  fetchUserData: () => Promise<void>;
  refreshStats: () => Promise<void>;
  updateUserProfile: (data: any) => Promise<{ success: boolean; error?: string }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getToken } = useAuth();
  const { socket } = useSocket();
  const [stats, setStats] = useState<IUserStats | null>(null);
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) return;

      const client = await createAuthenticatedApiClient(token);

      const [profileRes, statsRes] = await Promise.all([
        client.get<{ success: boolean; data: IUserProfile }>(API_ENDPOINTS.USER_PROFILE),
        client.get<{ success: boolean; data: IUserStats }>(API_ENDPOINTS.USER_STATS)
      ]);

      setProfile(profileRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const refreshStats = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const client = await createAuthenticatedApiClient(token);
      const response = await client.get<{ success: boolean; data: IUserStats }>(API_ENDPOINTS.USER_STATS);
      setStats(response.data.data);
    } catch (err) {
      console.error("Failed to refresh stats:", err);
    }
  }, [getToken]);

  const updateUserProfile = useCallback(async (data: any) => {
    try {
      setError(null);
      const token = await getToken();
      if (!token) throw new Error("No token");
      const client = await createAuthenticatedApiClient(token);
      const response = await client.patch<{ success: boolean; data: Partial<IUserProfile> }>(
        API_ENDPOINTS.USER_PROFILE, 
        data
      );

      if (response.data.success) {
        setProfile(prev => prev ? { ...prev, ...response.data.data } : null);
        return { success: true };
      }
      return { success: false, error: "Failed to update profile" };
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      return { success: false, error: message };
    }
  }, [getToken]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // WS Listener
  useEffect(() => {
    if (!socket) return;
    const handler = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'dashboard_update') {
          const s = msg.payload?.stats;
          if (s) {
            setStats(prev => prev ? {
              ...prev,
              pointsEarned: s.pointsEarned ?? prev.pointsEarned,
              spoonState: {
                ...prev.spoonState,
                remainingSpoons: s.spoonState?.remainingSpoons ?? prev.spoonState.remainingSpoons,
                spoonsUsed: s.spoonState?.spoonsUsed ?? prev.spoonState.spoonsUsed,
                effortMultiplier: s.spoonState?.effortMultiplier ?? prev.spoonState.effortMultiplier,
              },
              currentStreak: s.currentStreak ?? prev.currentStreak,
              level: s.level ?? prev.level,
            } : prev);
          }
        }
      } catch (err) {}
    };
    socket.addEventListener('message', handler);
    return () => socket.removeEventListener('message', handler);
  }, [socket]);

  return (
    <UserContext.Provider value={{ 
      stats, profile, loading, error, 
      fetchUserData, refreshStats, updateUserProfile 
    }}>
      {children}
    </UserContext.Provider>
  );
};
