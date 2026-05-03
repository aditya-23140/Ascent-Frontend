"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedApiClient, API_ENDPOINTS, handleApiError } from "@/lib/api";

export interface IStudentStats {
  id: string;
  name: string;
  email: string;
  tokens: number;
  points: number;
  currentStreak: number;
  spoonsRemaining: number;
}

export interface IRedemptionRequest {
  id: string;
  studentName: string;
  rewardName: string;
  tokenCost: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export function useGuardian() {
  const { getToken } = useAuth();
  const [data, setData] = useState<{ students: IStudentStats[]; requests: IRedemptionRequest[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const client = await createAuthenticatedApiClient(token || "");
      const response = await client.get<{ success: boolean; data: any }>("/api/rewards/parent/dashboard");
      setData(response.data.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const resolveRequest = async (requestId: string, approve: boolean) => {
    try {
      const token = await getToken();
      const client = await createAuthenticatedApiClient(token || "");
      await client.post("/api/rewards/parent/resolve", { requestId, approve });
      fetchDashboard();
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const addDependent = async (email: string) => {
    try {
      const token = await getToken();
      const client = await createAuthenticatedApiClient(token || "");
      await client.post("/api/user/parent/add-dependent", { email });
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const removeDependent = async (studentId: string) => {
    try {
      const token = await getToken();
      const client = await createAuthenticatedApiClient(token || "");
      await client.delete(`/api/user/parent/remove-dependent/${studentId}`);
      fetchDashboard();
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const addRewardItem = async (item: { name: string; description?: string; tokenCost: number; category: string }) => {
    try {
      const token = await getToken();
      const client = await createAuthenticatedApiClient(token || "");
      await client.post("/api/rewards/parent/items", item);
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    fetchDashboard,
    resolveRequest,
    addDependent,
    removeDependent,
    addRewardItem
  };
}
