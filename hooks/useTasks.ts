import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  createAuthenticatedApiClient,
  API_ENDPOINTS,
  handleApiError,
} from "@/lib/api";

/**
 * Task interface matching MongoDB schema
 */
export interface ITask {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string;
  deadline?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  completed: boolean;
  subtasks: ISubtask[]; // Populated from backend (includes: { subtasks: true })
  createdAt: string;
  updatedAt: string;
}

/**
 * Subtask interface
 */
export interface ISubtask {
  _id: string;
  taskId: string;
  title: string;
  duration: number; // in minutes
  completed: boolean;
  actualDuration?: number; // in minutes, tracked after completion
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Task with populated subtasks
 */
export interface ITaskWithSubtasks extends Omit<ITask, "subtasks"> {
  subtasks: ISubtask[];
}

/**
 * Hook for managing tasks with dynamic data fetching
 */
export function useTasks() {
  const { getToken } = useAuth();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /**
   * Fetch all tasks
   */
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const client = await createAuthenticatedApiClient(token || "");
      const response = await client.get<{
        success: boolean;
        data: { tasks: ITask[] };
      }>(API_ENDPOINTS.TASKS);
      setTasks(response.data.data.tasks);
      return response.data.data.tasks;
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      console.error("Error fetching tasks:", message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getToken]);
  /**
   * Create a new task
   */
  const createTask = useCallback(
    async (taskData: Omit<Partial<ITask>, 'subtasks'> & { 
      generateSubtasksAI?: boolean;
      subtasks?: Array<{ title: string; duration: number }>;
    }) => {
      try {
        setError(null);
        const token = await getToken();
        const client = await createAuthenticatedApiClient(token || "");
        const response = await client.post<{
          success: boolean;
          data: { task: ITask };
        }>(API_ENDPOINTS.CREATE_TASK, taskData);
        setTasks((prev) => [...prev, response.data.data.task]);
        return response.data.data.task;
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        throw err;
      }
    },
    [getToken]
  );
  /**
   * Update a task
   */
  const updateTask = useCallback(
    async (taskId: string, taskData: Partial<ITask>) => {
      try {
        setError(null);
        const token = await getToken();
        const client = await createAuthenticatedApiClient(token || "");
        const response = await client.put<{
          success: boolean;
          data: ITask;
        }>(API_ENDPOINTS.UPDATE_TASK(taskId), taskData);
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? response.data.data : t))
        );
        return response.data.data;
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        throw err;
      }
    },
    [getToken]
  );
  /**
   * Delete a task
   */
  const deleteTask = useCallback(
    async (taskId: string) => {
      try {
        setError(null);
        const token = await getToken();
        const client = await createAuthenticatedApiClient(token || "");
        await client.delete(API_ENDPOINTS.DELETE_TASK(taskId));
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        throw err;
      }
    },
    [getToken]
  );
  /**
   * Fetch a single task with populated subtasks
   */
  const getTaskWithSubtasks = useCallback(
    async (taskId: string) => {
      try {
        setError(null);
        const token = await getToken();
        const client = await createAuthenticatedApiClient(token || "");
        const response = await client.get<{
          success: boolean;
          data: ITaskWithSubtasks;
        }>(API_ENDPOINTS.TASK_BY_ID(taskId));
        return response.data.data;
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        throw err;
      }
    },
    [getToken]
  );

  /**
   * Reorder tasks
   */
  const reorderTasks = useCallback(
    async (orderedIds: string[]) => {
      try {
        setError(null);
        // Optimistically update local state
        const taskMap = new Map(tasks.map(t => [t._id, t]));
        const newTasks = orderedIds.map(id => taskMap.get(id)).filter(Boolean) as ITask[];
        setTasks(newTasks);

        const token = await getToken();
        const client = await createAuthenticatedApiClient(token || "");
        await client.post(API_ENDPOINTS.REORDER_TASKS, orderedIds.map((id, index) => ({ id, position: index })));
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        fetchTasks(); // Rollback on error
      }
    },
    [getToken, tasks, fetchTasks]
  );

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    getTaskWithSubtasks,
    reorderTasks,
  };
}

/**
 * Hook for managing subtasks
 */
export function useSubtasks() {
  const { getToken } = useAuth();
  const [subtasks, setSubtasks] = useState<ISubtask[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Complete a subtask
   */
  const completeSubtask = useCallback(
    async (subtaskId: string) => {
      try {
        setError(null);
        const token = await getToken();
        const client = await createAuthenticatedApiClient(token || "");
        const response = await client.post<{
          success: boolean;
          data: { subtask: ISubtask };
        }>(API_ENDPOINTS.COMPLETE_SUBTASK(subtaskId));
        setSubtasks((prev) =>
          prev.map((s) =>
            s._id === subtaskId ? response.data.data.subtask : s
          )
        );
        return response.data.data.subtask;
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        throw err;
      }
    },
    [getToken]
  );
  /**
   * Add a new subtask to a task
   */
  const addSubtask = useCallback(
    async (
      taskId: string,
      subtaskData: { title: string; duration: number }
    ) => {
      try {
        setError(null);
        const token = await getToken();
        const client = await createAuthenticatedApiClient(token || "");
        const response = await client.post<{
          success: boolean;
          data: { subtask: ISubtask; task: ITask };
        }>(API_ENDPOINTS.ADD_SUBTASK(taskId), subtaskData);
        return response.data.data;
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        throw err;
      }
    },
    [getToken]
  );

  /**
   * Update a subtask
   */
  const updateSubtask = useCallback(
    async (subtaskId: string, subtaskData: Partial<ISubtask>) => {
      try {
        setError(null);
        const token = await getToken();
        const client = await createAuthenticatedApiClient(token || "");
        const response = await client.put<{
          success: boolean;
          data: ISubtask;
        }>(API_ENDPOINTS.UPDATE_SUBTASK(subtaskId), subtaskData);
        return response.data.data;
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        throw err;
      }
    },
    [getToken]
  );

  /**
   * Reorder subtasks
   */
  const reorderSubtasks = useCallback(
    async (taskId: string, orderedIds: string[]) => {
      try {
        setError(null);
        const token = await getToken();
        const client = await createAuthenticatedApiClient(token || "");
        await client.post(API_ENDPOINTS.REORDER_SUBTASKS(taskId), orderedIds.map((id, index) => ({ id, position: index })));
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
      }
    },
    [getToken]
  );

  return {
    subtasks,
    error,
    completeSubtask,
    addSubtask,
    updateSubtask,
    reorderSubtasks,
  };
}
