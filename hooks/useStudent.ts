"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedApiClient, API_ENDPOINTS, handleApiError } from "@/lib/api";

export interface IRewardItem {
  id: string;
  name: string;
  description?: string;
  tokenCost: number;
  category: string;
}

export interface IGuardianRequest {
  id: string;
  parentId: string;
  parent: {
    name: string;
    email: string;
  };
  status: string;
}

import { useUserStats } from "./useUserStats";

export function useStudent() {
  const { getToken } = useAuth();
  const { fetchUserData } = useUserStats();
  const [rewards, setRewards] = useState<IRewardItem[]>([]);
  const [requests, setRequests] = useState<IGuardianRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRewards = useCallback(async () => {
    try {
      const token = await getToken();
      const client = await createAuthenticatedApiClient(token || "");
      const response = await client.get<{ success: boolean; data: IRewardItem[] }>("/api/rewards/available");
      setRewards(response.data.data);
    } catch (err) {
      console.error(err);
    }
  }, [getToken]);

  const fetchRequests = useCallback(async () => {
    try {
      const token = await getToken();
      const client = await createAuthenticatedApiClient(token || "");
      const response = await client.get<{ success: boolean; data: IGuardianRequest[] }>("/api/user/student/requests");
      setRequests(response.data.data);
    } catch (err) {
      console.error(err);
    }
  }, [getToken]);

  const redeemReward = async (rewardItemId: string) => {
    try {
      const token = await getToken();
      const client = await createAuthenticatedApiClient(token || "");
      await client.post("/api/rewards/redeem", { rewardItemId });
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  const acceptRequest = async (linkId: string) => {
    try {
      const token = await getToken();
      const client = await createAuthenticatedApiClient(token || "");
      await client.post("/api/user/student/accept-request", { linkId });
      fetchRequests();
      // Refresh global profile to reflect role change
      await fetchUserData(); 
      return { success: true };
    } catch (err) {
      return { success: false, error: handleApiError(err) };
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchRewards(), fetchRequests()]).finally(() => setLoading(false));
  }, [fetchRewards, fetchRequests]);

  return {
    rewards,
    requests,
    loading,
    error,
    redeemReward,
    acceptRequest,
    fetchRewards,
    fetchRequests
  };
}
