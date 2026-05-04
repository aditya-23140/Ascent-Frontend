"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSocket } from "@/components/SocketProvider";

/**
 * Timer state types
 */
export type TimerState = "IDLE" | "FOCUS" | "HYPERFOCUS" | "BREAK" | "DISENGAGED" | "COMPLETED";

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
  const { socket } = useSocket();

  // Timer state
  const [timerState, setTimerState] = useState<TimerState>("IDLE");
  const [currentSubtask, setCurrentSubtask] = useState<Subtask | null>(null);
  const [remainingTime, setRemainingTime] = useState(0); // in seconds
  const [secondsElapsed, setSecondsElapsed] = useState(0); // in seconds
  const [plannedSeconds, setPlannedSeconds] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);

  // Sync state from server via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "timer_update") {
          const { 
            state, 
            remainingSeconds, 
            secondsElapsed: serverElapsed,
            plannedSeconds: serverPlanned,
            taskId: serverTaskId,
            subtaskId: serverSubtaskId,
            subtaskTitle: serverSubtaskTitle,
            isRunning: serverRunning
          } = data.payload;
          
          setTimerState(state as TimerState);
          setRemainingTime(remainingSeconds);
          setSecondsElapsed(serverElapsed);
          setPlannedSeconds(serverPlanned);
          setTaskId(serverTaskId || null);
          setIsRunning(serverRunning);

          // Hydrate subtask from remote timer_update (e.g. device started session)
          if (serverSubtaskId && serverSubtaskTitle) {
            setCurrentSubtask(prev => {
              if (prev?._id === serverSubtaskId) return prev;
              return { 
                _id: serverSubtaskId, 
                title: serverSubtaskTitle, 
                duration: Math.round(serverPlanned / 60), 
                completed: false 
              };
            });
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
  const timerAction = useCallback(async (action: string, body?: any) => {
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
  // Sync ambient background to :root for global effect
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--ambient-bg', `var(--ambient-${timerState.toLowerCase()})`);
      root.setAttribute('data-timer-state', timerState);
    }
  }, [timerState]);

  const loadSubtask = useCallback((subtask: Subtask, tId: string, calibratedMinutes?: number) => {
    setCurrentSubtask(subtask);
    setTaskId(tId);
    
    // Suggest duration: use calibrated avg if available, otherwise AI estimate
    const durationMin = calibratedMinutes || subtask.duration || 25;
    const initialDuration = durationMin * 60;
    
    setPlannedSeconds(initialDuration);
    setRemainingTime(initialDuration);
    setSecondsElapsed(0);
    setTimerState('IDLE');
    setIsRunning(false);
  }, []);

  /**
   * Start the timer
   */
  const startTimer = useCallback(async () => {
    if (!currentSubtask || !taskId) return;
    await timerAction('start', {
      duration: Math.round(plannedSeconds / 60),
      taskId,
      subtaskId: currentSubtask._id,
      subtaskTitle: currentSubtask.title
    });
  }, [currentSubtask, taskId, timerAction]);

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
   * Start break
   */
  const startBreak = useCallback(async (duration?: number) => {
    await timerAction('break', { duration });
  }, [timerAction]);

  /**
   * Enter HyperFocus mode manually
   */
  const enterHyperFocus = useCallback(async () => {
    await timerAction('hyperfocus');
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
      await timerAction('skip'); // skip is stop in routes
      setTimerState("IDLE");
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
    await timerAction('break');
  }, [timerAction]);

  /**
   * Calculate progress percentage
   */
  const progress =
    plannedSeconds > 0
      ? (secondsElapsed / plannedSeconds) * 100
      : 0;

  /**
   * Format time for display (MM:SS)
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    const sign = seconds < 0 ? "-" : "";
    return `${sign}${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return {
    timerState,
    currentSubtask,
    remainingTime,
    secondsElapsed,
    plannedSeconds,
    setPlannedSeconds,
    isRunning,
    progress,
    taskId,
    loadSubtask,
    startTimer,
    pauseTimer,
    resumeTimer,
    startBreak,
    enterHyperFocus,
    completeSubtask,
    skipToBreak,
    formatTime,
  };
};
