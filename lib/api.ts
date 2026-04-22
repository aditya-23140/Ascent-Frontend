import axios, { AxiosInstance, AxiosError } from "axios";

/**
 * Create an Axios instance with Clerk authentication
 */
export async function createAuthenticatedApiClient(
  token: string
): Promise<AxiosInstance> {
  if (!token) {
    throw new Error("No authentication token available");
  }

  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return client;
}

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  // Tasks
  TASKS: "/api/tasks",
  TASK_BY_ID: (id: string) => `/api/tasks/${id}`,
  CREATE_TASK: "/api/tasks",
  UPDATE_TASK: (id: string) => `/api/tasks/${id}`,
  DELETE_TASK: (id: string) => `/api/tasks/${id}`,
  GENERATE_SUBTASKS: "/api/tasks/generate-subtasks",
  ADD_SUBTASK: (taskId: string) => `/api/tasks/${taskId}/subtasks`,

  // Subtasks
  SUBTASK_BY_ID: (id: string) => `/api/tasks/subtasks/${id}`,
  COMPLETE_SUBTASK: (id: string) => `/api/tasks/subtasks/${id}/complete`,
  UPDATE_SUBTASK: (id: string) => `/api/tasks/subtasks/${id}`,

  // Sessions
  SESSIONS: "/api/sessions",
  SESSION_BY_ID: (id: string) => `/api/sessions/${id}`,

  // User
  USER_PROFILE: "/api/user/profile",
  USER_STATS: "/api/user/stats",

  // Rewards/Points
  REWARDS: "/api/rewards",
  POINTS: "/api/points",
};

/**
 * Type-safe API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/**
 * Handle API errors
 */
export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message || error.message || "An error occurred"
    );
  }
  return String(error);
}
