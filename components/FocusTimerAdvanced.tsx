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
      const configs: Record<TimerState | "Idle", { gradient: string, color: string, bg: string, icon: React.ElementType }> = {
      Focus: { gradient: "bg-indigo-600", color: "text-indigo-600", bg: "bg-indigo-50", icon: Zap },
      Overflow: { gradient: "bg-orange-500", color: "text-orange-600", bg: "bg-orange-50", icon: AlertCircle },
      Break: { gradient: "bg-emerald-500", color: "text-emerald-600", bg: "bg-emerald-50", icon: Coffee },
      Idle: { gradient: "bg-slate-400", color: "text-slate-500", bg: "bg-slate-50", icon: Clock },
    };
    return configs[timerState] || configs.Idle;
  }, [timerState]);

  const StateIcon = stateConfigs.icon;

  return (
    <div className={cn(
      "rounded-[2.5rem] border shadow-premium transition-all",
      sizeConfig.cardPadding,
      theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", stateConfigs.bg, stateConfigs.color)}>
          <StateIcon className="w-3.5 h-3.5" />
          {timerState}
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <BarChart3 className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Title */}
      <div className="mb-8">
        <h3 className={cn(
          "font-black tracking-tight truncate",
          size === "compact" ? "text-lg" : "text-3xl",
          theme === "dark" ? "text-white" : "text-slate-900"
        )}>
          {currentSubtask?.title || "Initialize Session"}
        </h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Operational Segment</p>
      </div>

      {/* Timer Display */}
      <div className={cn(
        "text-center mb-10 font-black tracking-tighter tabular-nums",
        sizeConfig.timerText,
        theme === "dark" ? "text-white" : "text-slate-900"
      )}>
        {formatTime(remainingTime)}
      </div>

      {/* Progress */}
      <div className="mb-10 space-y-3">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>Operational Efficiency</span>
          <span className={stateConfigs.color}>{Math.floor(progress)}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
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
            isRunning ? "bg-slate-900 text-white" : "bg-indigo-600 text-white shadow-indigo-100 dark:shadow-none"
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
              "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-indigo-600"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Finalize
          </button>
          <button
            onClick={skipToBreak}
            disabled={timerState !== "Focus"}
            className={cn(
              "rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
              sizeConfig.buttonPadding,
              "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            <SkipForward className="w-3.5 h-3.5" />
            Interval
          </button>
        </div>
      </div>

      {/* Secondary Controls */}
      <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          Aural Feedback: {soundEnabled ? "Active" : "Silent"}
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full">
          <Info className="w-3 h-3 text-slate-400" />
          <span className="text-[9px] font-bold text-slate-400 uppercase">Synchronized</span>
        </div>
      </div>
    </div>
  );
};

export default FocusTimerAdvanced;
