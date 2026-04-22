"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSocket } from "@/components/SocketProvider";

/**
 * Timer state types
 */
export type TimerState = "Focus" | "Overflow" | "Break" | "Idle" | "Completed";

/**
 * Interface for subtask data
 */
export interface Subtask {
  _id: string;
  title: string;
  duration: number; // in minutes
  completed: boolean;
}

/**
 * Custom hook for managing focus timer with native WebSocket sync
 */
export const useFocusTimer = () => {
  const { getToken } = useAuth();
  const { socket, isConnected } = useSocket();

  // Timer state
  const [timerState, setTimerState] = useState<TimerState>("Idle");
  const [currentSubtask, setCurrentSubtask] = useState<Subtask | null>(null);
  const [remainingTime, setRemainingTime] = useState(0); // in seconds
  const [totalDuration, setTotalDuration] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);

  // Sync state from server via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "timer_update") {
          const { phase, remainingSeconds, taskId: serverTaskId } = data.payload;
          
          setRemainingTime(remainingSeconds);
          setTaskId(serverTaskId || null);
          setIsRunning(data.payload.isRunning);
          
          switch (phase) {
            case 'work':
              setTimerState("Focus");
              break;
            case 'break':
              setTimerState("Break");
              break;
            case 'completed':
              setTimerState("Completed");
              break;
            case 'idle':
              setTimerState("Idle");
              break;
          }
        }
      } catch (error) {
        console.error("useFocusTimer: Failed to parse message:", error);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  /**
   * API Helper for timer controls
   */
  const timerAction = useCallback(async (action: 'start' | 'pause' | 'resume' | 'skip', body?: any) => {
    try {
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const response = await fetch(`${apiUrl}/api/timer/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} timer`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error in timer ${action}:`, error);
    }
  }, [getToken]);

  /**
   * Load a subtask and set durations
   */
  const loadSubtask = useCallback((subtask: Subtask, tId: string) => {
    setCurrentSubtask(subtask);
    setTaskId(tId);
    setTotalDuration(subtask.duration * 60);
    setRemainingTime(subtask.duration * 60);
    setTimerState("Idle");
    setIsRunning(false);
  }, []);

  /**
   * Start the timer
   */
  const startTimer = useCallback(async () => {
    if (!currentSubtask || !taskId) return;
    await timerAction('start', {
      duration: totalDuration,
      taskId,
      phase: 'work'
    });
  }, [currentSubtask, taskId, totalDuration, timerAction]);

  /**
   * Pause the timer
   */
  const pauseTimer = useCallback(async () => {
    await timerAction('pause');
  }, [timerAction]);

  /**
   * Resume the timer
   */
  const resumeTimer = useCallback(async () => {
    await timerAction('resume');
  }, [timerAction]);

  /**
   * Complete the current subtask
   */
  const completeSubtask = useCallback(async () => {
    if (!currentSubtask) return;
    
    try {
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const response = await fetch(`${apiUrl}/api/tasks/subtasks/${currentSubtask._id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error("Failed to complete subtask");
      }
      
      // Stop the timer as well
      await timerAction('pause');
      setTimerState("Idle");
      setIsRunning(false);
      
      return await response.json();
    } catch (error) {
      console.error("Error completing subtask:", error);
    }
  }, [currentSubtask, getToken, timerAction]);

  /**
   * Skip to break or next phase
   */
  const skipToBreak = useCallback(async () => {
    await timerAction('skip');
    // Optionally start a break immediately
    await timerAction('start', {
      duration: 5 * 60,
      phase: 'break'
    });
  }, [timerAction]);

  /**
   * Calculate progress percentage
   */
  const progress =
    totalDuration > 0
      ? ((totalDuration - remainingTime) / totalDuration) * 100
      : 0;

  /**
   * Format time for display (MM:SS)
   */
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return {
    timerState,
    currentSubtask,
    remainingTime,
    totalDuration,
    isRunning,
    progress,
    taskId,
    loadSubtask,
    startTimer,
    pauseTimer,
    resumeTimer,
    completeSubtask,
    skipToBreak,
    formatTime,
  };
};
