import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSocket } from "@/components/SocketProvider";

/**
 * Timer state types
 */
export type TimerState = "Focus" | "Overflow" | "Break" | "Idle";

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
 * Interface for timer context
 */
export interface TimerContext {
  state: TimerState;
  currentSubtask: Subtask | null;
  remainingTime: number; // in seconds
  totalDuration: number; // in seconds
  isRunning: boolean;
  progress: number; // percentage (0-100)
  taskId: string | null;
  subtaskId: string | null;
}

/**
 * Custom hook for managing focus timer with Socket.IO sync
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
  const [subtaskId, setSubtaskId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null); // For tracking overflow time
  const overflowTimeRef = useRef(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer event listeners
  useEffect(() => {
    if (!socket) return;

    const onSessionStarted = (data: any) => {
      console.log("useFocusTimer: Session started from server:", data);
      setTaskId(data.taskId);
      setSubtaskId(data.subtaskId);
      setSessionId(data.sessionId);
      setTimerState("Focus");
      setIsRunning(true);
      overflowTimeRef.current = 0;
    };

    const onSessionPaused = (data: any) => {
      console.log("useFocusTimer: Session paused from server:", data);
      setIsRunning(false);
    };

    const onSubtaskCompleted = (data: any) => {
      console.log("useFocusTimer: Subtask completed from server:", data);
      setTimerState("Idle");
      setIsRunning(false);
      setRemainingTime(0);
      overflowTimeRef.current = 0;
      setCurrentSubtask(null);
    };

    const onUpdateUi = (data: any) => {
      console.log("useFocusTimer: UI update from other device:", data);
      if (data.type === "session_started") {
        setTimerState("Focus");
        setIsRunning(true);
      } else if (data.type === "session_paused") {
        setIsRunning(false);
      } else if (data.type === "subtask_completed") {
        setTimerState("Idle");
        setIsRunning(false);
      }
    };

    socket.on("session_started", onSessionStarted);
    socket.on("session_paused", onSessionPaused);
    socket.on("subtask_completed", onSubtaskCompleted);
    socket.on("update_ui", onUpdateUi);

    return () => {
      socket.off("session_started", onSessionStarted);
      socket.off("session_paused", onSessionPaused);
      socket.off("subtask_completed", onSubtaskCompleted);
      socket.off("update_ui", onUpdateUi);
    };
  }, [socket]);

  // Timer countdown effect
  useEffect(() => {
    if (!isRunning) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          // Time's up - transition to overflow
          setTimerState("Overflow");
          overflowTimeRef.current = 0;
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isRunning]);

  // Overflow timer effect
  useEffect(() => {
    if (timerState !== "Overflow" || !isRunning) {
      return;
    }

    const overflowInterval = setInterval(() => {
      overflowTimeRef.current += 1;
      // Optional: emit overflow time to server
    }, 1000);

    return () => clearInterval(overflowInterval);
  }, [timerState, isRunning]);

  /**
   * Load a subtask and start timer
   */
  const loadSubtask = useCallback((subtask: Subtask, tId: string) => {
    setCurrentSubtask(subtask);
    setTaskId(tId);
    setSubtaskId(subtask._id);
    setTotalDuration(subtask.duration * 60); // Convert minutes to seconds
    setRemainingTime(subtask.duration * 60);
    setTimerState("Focus");
    setIsRunning(false);
    overflowTimeRef.current = 0;
  }, []);

  /**
   * Start the timer
   */
  const startTimer = useCallback(async () => {
    if (!currentSubtask || !taskId) {
      console.error("No subtask or task loaded");
      return;
    }

    setIsRunning(true);

    // Emit to server
    if (socket && isConnected) {
      socket.emit("start_session", {
        taskId,
        subtaskId: currentSubtask._id,
      });
    }
  }, [currentSubtask, taskId, socket, isConnected]);

  /**
   * Pause the timer
   */
  const pauseTimer = useCallback(async () => {
    setIsRunning(false);

    // Emit to server
    if (socket && isConnected) {
      socket.emit("pause_session", {
        taskId,
        subtaskId,
        elapsedTime: totalDuration - remainingTime,
      });
    }
  }, [taskId, subtaskId, totalDuration, remainingTime, socket, isConnected]);

  /**
   * Complete the subtask
   */
  const completeSubtask = useCallback(async () => {
    setIsRunning(false);

    const actualDuration =
      timerState === "Overflow"
        ? totalDuration + overflowTimeRef.current
        : totalDuration - remainingTime;

    // Emit to server
    if (socket && isConnected) {
      socket.emit("complete_subtask", {
        taskId,
        subtaskId,
        actualDuration,
      });
    }

    // Reset local state
    setTimerState("Idle");
    setRemainingTime(0);
    setCurrentSubtask(null);
    overflowTimeRef.current = 0;
  }, [timerState, totalDuration, remainingTime, taskId, subtaskId]);

  /**
   * Skip to break
   */
  const skipToBreak = useCallback(() => {
    setTimerState("Break");
    setIsRunning(true);
    setRemainingTime(5 * 60); // 5-minute break
  }, []);

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
    // State
    timerState,
    currentSubtask,
    remainingTime,
    totalDuration,
    isRunning,
    progress,
    taskId,
    subtaskId,
    sessionId,

    // Actions
    loadSubtask,
    startTimer,
    pauseTimer,
    completeSubtask,
    skipToBreak,

    // Utilities
    formatTime,
  };
};
