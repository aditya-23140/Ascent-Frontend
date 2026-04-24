"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useFocusTimer, type Subtask, type TimerState } from "@/hooks/useFocusTimer";
import {
  Volume2,
  VolumeX,
  BarChart3,
  Play,
  Pause,
  CheckCircle2,
  SkipForward,
  AlertCircle,
  Info,
  Clock,
  Zap,
  Coffee
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FocusTimerAdvancedProps {
  subtask?: Subtask;
  taskId?: string;
  onComplete?: (actualDuration: number) => void;
  theme?: "light" | "dark";
  size?: "compact" | "normal" | "large";
}

/**
 * Advanced Focus Console - Professional Enterprise Design
 */
export const FocusTimerAdvanced: React.FC<FocusTimerAdvancedProps> = ({
  subtask,
  taskId,
  onComplete,
  theme = "light",
  size = "normal",
}) => {
  const {
    timerState,
    currentSubtask,
    remainingTime,
    isRunning,
    progress,
    formatTime,
    loadSubtask,
    startTimer,
    pauseTimer,
    completeSubtask,
    skipToBreak,
  } = useFocusTimer();

  const [showStats, setShowStats] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  React.useEffect(() => {
    if (subtask && taskId) {
      loadSubtask(subtask, taskId);
    }
  }, [subtask, taskId, loadSubtask]);

  const handleComplete = async () => {
    await completeSubtask();
    onComplete?.(remainingTime);
  };

  const sizeConfig = useMemo(() => {
    const configs = {
      compact: { timerText: "text-4xl", cardPadding: "p-4", buttonPadding: "h-10 px-3" },
      normal: { timerText: "text-7xl", cardPadding: "p-8", buttonPadding: "h-14 px-4" },
      large: { timerText: "text-9xl", cardPadding: "p-12", buttonPadding: "h-16 px-6" },
    };
    return configs[size];
  }, [size]);

  const stateConfigs = useMemo(() => {
    const configs: Record<TimerState, { gradient: string, color: string, bg: string, icon: React.ElementType, label: string }> = {
      FOCUS: { gradient: "bg-primary", color: "text-primary", bg: "bg-indigo-50", icon: Zap, label: "Focusing" },
      HYPERFOCUS: { gradient: "bg-orange-500", color: "text-orange-600", bg: "bg-orange-50", icon: AlertCircle, label: "Deep Work" },
      BREAK: { gradient: "bg-emerald-500", color: "text-emerald-600", bg: "bg-emerald-50", icon: Coffee, label: "Break" },
      IDLE: { gradient: "bg-rum-400", color: "text-rum-600", bg: "bg-muted/50", icon: Clock, label: "Ready" },
      DISENGAGED: { gradient: "bg-rose-500", color: "text-rose-600", bg: "bg-rose-50", icon: AlertCircle, label: "Refocusing" },
      COMPLETED: { gradient: "bg-emerald-600", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2, label: "Done" },
    };
    return configs[timerState] || configs.IDLE;
  }, [timerState]);

  const StateIcon = stateConfigs.icon;

  return (
    <div className={cn(
      "rounded-[2.5rem] border shadow-premium transition-all",
      sizeConfig.cardPadding,
      theme === "dark" ? "bg-card border-border" : "bg-card border-border"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", stateConfigs.bg, stateConfigs.color)}>
          <StateIcon className="w-3.5 h-3.5" />
          {stateConfigs.label}
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          className="p-2 hover:bg-muted/50 dark:hover:bg-border rounded-xl transition-colors"
        >
          <BarChart3 className="w-4 h-4 text-rum-600" />
        </button>
      </div>

      {/* Title */}
      <div className="mb-8">
        <h3 className={cn(
          "font-black tracking-tight truncate",
          size === "compact" ? "text-lg" : "text-3xl",
          theme === "dark" ? "text-white" : "text-foreground"
        )}>
          {currentSubtask?.title || "Initialize Session"}
        </h3>
        <p className="text-xs font-bold text-rum-600 uppercase tracking-widest mt-1">Operational Segment</p>
      </div>

      {/* Timer Display */}
      <div className={cn(
        "text-center mb-10 font-black tracking-tighter tabular-nums",
        sizeConfig.timerText,
        theme === "dark" ? "text-white" : "text-foreground"
      )}>
        {formatTime(remainingTime)}
      </div>

      {/* Progress */}
      <div className="mb-10 space-y-3">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-rum-600">
          <span>Operational Efficiency</span>
          <span className={stateConfigs.color}>{Math.floor(progress)}%</span>
        </div>
        <div className="w-full bg-border dark:bg-border h-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={cn("h-full transition-all duration-700", stateConfigs.gradient)}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <button
          onClick={isRunning ? pauseTimer : startTimer}
          disabled={!currentSubtask}
          className={cn(
            "w-full rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3",
            sizeConfig.buttonPadding,
            isRunning ? "bg-card text-white" : "bg-primary text-primary-foreground shadow-indigo-100 dark:shadow-none"
          )}
        >
          {isRunning ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
          {isRunning ? "Suspend" : "Execute"}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleComplete}
            disabled={!currentSubtask}
            className={cn(
              "rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
              sizeConfig.buttonPadding,
              "bg-card dark:bg-card border-border dark:border-border text-foreground hover:border-primary"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Finalize
          </button>
          <button
            onClick={skipToBreak}
            disabled={timerState !== "FOCUS"}
            className={cn(
              "rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
              sizeConfig.buttonPadding,
              "bg-muted/50 dark:bg-border border-transparent text-rum-600 hover:text-rum-600"
            )}
          >
            <SkipForward className="w-3.5 h-3.5" />
            Interval
          </button>
        </div>
      </div>

      {/* Secondary Controls */}
      <div className="mt-8 pt-8 border-t border-border dark:border-border flex items-center justify-between">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rum-600 hover:text-primary transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          Aural Feedback: {soundEnabled ? "Active" : "Silent"}
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/50 dark:bg-border rounded-full">
          <Info className="w-3 h-3 text-rum-600" />
          <span className="text-[9px] font-bold text-rum-600 uppercase">Synchronized</span>
        </div>
      </div>
    </div>
  );
};

export default FocusTimerAdvanced;









