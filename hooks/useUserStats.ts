import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  createAuthenticatedApiClient,
  API_ENDPOINTS,
  handleApiError,
} from "@/lib/api";

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
  preferences: {
    theme: "light" | "dark";
    emailNotifications: boolean;
    dailyDigest: boolean;
  };
}

/**
 * Hook for fetching user profile and stats
 */
export function useUserStats() {
  const { getToken } = useAuth();
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
      preferences?: {
        theme?: "light" | "dark";
        emailNotifications?: boolean;
        dailyDigest?: boolean;
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

