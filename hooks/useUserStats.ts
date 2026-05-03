import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  createAuthenticatedApiClient,
  API_ENDPOINTS,
  handleApiError,
} from "@/lib/api";
import { useSocket } from "@/components/SocketProvider";

/**
 * User stats interface
 */
export interface IUserStats {
  totalTasksCompleted: number;
  totalFocusTime: number; // in minutes
  currentStreak: number; // consecutive days
  longestStreak: number;
  pointsEarned: number;
  level: number;
  nextLevelPoints: number;
  tasksCompletedToday: number;
  focusTimeToday: number; // in minutes
  spoonState: {
    spoonsUsed: number;
    remainingSpoons: number;
    effortMultiplier: number;
    isHighEffort: boolean;
  };
  avgDurationByPriority?: Record<string, number>;
}

/**
 * User profile interface
 */
export interface IUserProfile {
  _id: string;
  clerkId: string;
  firstName: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  timezone: string;
  role: "standard" | "student" | "parent";
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

/**
 * Hook for fetching user profile and stats
 */
export function useUserStats() {
  const { getToken } = useAuth();
  const { socket } = useSocket();
  const [stats, setStats] = useState<IUserStats | null>(null);
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /**
   * Fetch user profile and stats
   */
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const client = await createAuthenticatedApiClient(token || "");

      // Fetch profile
      const profileResponse = await client.get<{
        success: boolean;
        data: IUserProfile;
      }>(API_ENDPOINTS.USER_PROFILE);
      setProfile(profileResponse.data.data);

      // Fetch stats
      const statsResponse = await client.get<{
        success: boolean;
        data: IUserStats;
      }>(API_ENDPOINTS.USER_STATS);
      setStats(statsResponse.data.data);
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      console.error("Error fetching user data:", message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);
  /**
   * Refresh stats (e.g., after completing a task)
   */
  const refreshStats = useCallback(async () => {
    try {
      setError(null);
      const token = await getToken();
      const client = await createAuthenticatedApiClient(token || "");
      const response = await client.get<{ success: boolean; data: IUserStats }>(
        API_ENDPOINTS.USER_STATS
      );
      setStats(response.data.data);
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
    }
  }, [getToken]);

  /**
   * Update user profile and preferences
   */
  const updateUserProfile = useCallback(
    async (data: {
      timezone?: string;
      role?: string;
      dailySpoonBudget?: number;
      hyperFocusDuration?: number;
      preferences?: {
        theme?: "light" | "dark";
        emailNotifications?: boolean;
        dailyDigest?: boolean;
        streakReminderFriday?: boolean;
      };
    }) => {
      try {
        setError(null);
        const token = await getToken();
        const client = await createAuthenticatedApiClient(token || "");
        const response = await client.patch<{
          success: boolean;
          data: Partial<IUserProfile>;
        }>(API_ENDPOINTS.USER_PROFILE, data);

        if (response.data.success) {
          setProfile((prev) =>
            prev ? { ...prev, ...response.data.data } : null
          );
          return { success: true };
        }
        return { success: false, error: "Failed to update profile" };
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        return { success: false, error: message };
      }
    },
    [getToken]
  );

  // Fetch on mount
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Live-refresh stats from WS dashboard_update pushes
  useEffect(() => {
    if (!socket) return;
    const handler = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'dashboard_update') {
          const s = msg.payload?.stats;
          if (s) {
            console.log("useUserStats: Received live dashboard update, syncing stats.");
            setStats(prev => prev ? {
              ...prev,
              pointsEarned: s.pointsEarned ?? prev.pointsEarned,
              spoonState: {
                ...prev.spoonState,
                remainingSpoons: s.spoonState?.remaining ?? prev.spoonState.remainingSpoons,
                spoonsUsed: (s.spoonState?.total - s.spoonState?.remaining) ?? prev.spoonState.spoonsUsed,
                effortMultiplier: s.spoonState?.effortMultiplier ?? prev.spoonState.effortMultiplier,
              },
              currentStreak: s.currentStreak ?? prev.currentStreak,
              level: s.level ?? prev.level,
            } : prev);
          }
        }
      } catch (err) {
        console.error("useUserStats: Failed to process WS message", err);
      }
    };
    socket.addEventListener('message', handler);
    return () => socket.removeEventListener('message', handler);
  }, [socket]);

  return {
    stats,
    profile,
    loading,
    error,
    fetchUserData,
    refreshStats,
    updateUserProfile,
  };
}
