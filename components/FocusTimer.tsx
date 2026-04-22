"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks, ITask, ISubtask, ITaskWithSubtasks } from "@/hooks/useTasks";
import {
  useFocusTimer,
  type TimerState
} from "@/hooks/useFocusTimer";
import {
  ChevronDown,
  Play,
  Pause,
  CheckCircle2,
  SkipForward,
  Clock,
  Zap,
  Target,
  Shield,
  Sparkles,
  Coffee,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Focus Timer Component - Professional Enterprise Design
 */
export const FocusTimer: React.FC = () => {
  const { tasks, getTaskWithSubtasks, loading } = useTasks();
  const [selectedTask, setSelectedTask] = useState<ITaskWithSubtasks | null>(null);
  const [selectedSubtask, setSelectedSubtask] = useState<ISubtask | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingTask, setIsLoadingTask] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  const handleTaskSelect = useCallback(
    async (task: ITask) => {
      setIsLoadingTask(true);
      setLoadError(null);
      try {
        const taskWithSubtasks = await getTaskWithSubtasks(task._id);
        setSelectedTask(taskWithSubtasks);
        setSelectedSubtask(null);
        setIsDropdownOpen(false);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load task");
        setSelectedTask(null);
      } finally {
        setIsLoadingTask(false);
      }
    },
    [getTaskWithSubtasks]
  );

  useEffect(() => {
    if (selectedSubtask && selectedTask) {
      loadSubtask({
        _id: selectedSubtask._id,
        title: selectedSubtask.title,
        duration: selectedSubtask.duration,
        completed: selectedSubtask.completed,
      }, selectedTask._id);
    }
  }, [selectedSubtask, selectedTask, loadSubtask]);

  useEffect(() => {
    if (currentSubtask && !isRunning && timerState === "Focus") {
      startTimer();
    }
  }, [currentSubtask, isRunning, timerState, startTimer]);

  const stateConfigs = useMemo(() => {
    const configMap: Record<TimerState, { 
      accent: string, 
      bg: string, 
      text: string, 
      icon: React.ElementType, 
      label: string,
      metricLabel: string 
    }> = {
      Focus: { 
        accent: "bg-indigo-600", 
        bg: "bg-indigo-50 dark:bg-indigo-950/20", 
        text: "text-indigo-600 dark:text-indigo-400",
        icon: Target,
        label: "Deep Work",
        metricLabel: "Session Progress"
      },
      Overflow: { 
        accent: "bg-orange-500", 
        bg: "bg-orange-50 dark:bg-orange-950/20", 
        text: "text-orange-600 dark:text-orange-400",
        icon: Zap,
        label: "Extended",
        metricLabel: "Overtime Duration"
      },
      Break: { 
        accent: "bg-emerald-500", 
        bg: "bg-emerald-50 dark:bg-emerald-950/20", 
        text: "text-emerald-600 dark:text-emerald-400",
        icon: Coffee,
        label: "Rest Interval",
        metricLabel: "Break Remaining"
      },
      Idle: { 
        accent: "bg-slate-400", 
        bg: "bg-slate-50 dark:bg-slate-800", 
        text: "text-slate-500 dark:text-slate-400",
        icon: Clock,
        label: "Awaiting Input",
        metricLabel: "Standby"
      },
    };
    return configMap[timerState];
  }, [timerState]);

  const StateIcon = stateConfigs.icon;

  return (
    <div className="flex-1 p-6 lg:p-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Active Focus Console</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Synchronize your objectives and maintain peak operational intensity.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Control Sidebar */}
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current Objective</label>
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                disabled={isLoadingTask || loading}
                                className="w-full h-14 px-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-left flex items-center justify-between group transition-all"
                            >
                                <span className="font-bold text-slate-900 dark:text-white truncate">
                                    {isLoadingTask ? "Synchronizing..." : selectedTask ? selectedTask.title : "Select Objective"}
                                </span>
                                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isDropdownOpen && "rotate-180")} />
                            </button>
                            
                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-16 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto">
                                        {tasks?.map(task => (
                                            <button key={task._id} onClick={() => handleTaskSelect(task)} className="w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors">
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{task.title}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{(task.subtasks as string[])?.length || 0} Segmented Steps</p>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {selectedTask && (
                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Target Achievement Step</label>
                            <div className="space-y-2">
                                {(selectedTask.subtasks as ISubtask[])?.map(st => (
                                    <button
                                        key={st._id}
                                        onClick={() => setSelectedSubtask(st)}
                                        className={cn(
                                            "w-full p-4 rounded-2xl text-left border transition-all flex items-center justify-between",
                                            selectedSubtask?._id === st._id 
                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none" 
                                                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white hover:border-indigo-200"
                                        )}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{st.title}</p>
                                            <p className={cn("text-[10px] font-bold uppercase mt-1", selectedSubtask?._id === st._id ? "text-white/70" : "text-slate-400")}>{st.duration} min scope</p>
                                        </div>
                                        {selectedSubtask?._id === st._id && <ArrowRight className="w-4 h-4 ml-2" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Timer Console */}
            <div className="lg:col-span-7">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-premium p-10 flex flex-col items-center text-center space-y-12 h-full">
                    <div className="space-y-3">
                        <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-[0.2em]", stateConfigs.bg, stateConfigs.text)}>
                            <StateIcon className="w-3.5 h-3.5" />
                            {stateConfigs.label}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {currentSubtask?.title || "Initialize Operational Session"}
                        </h2>
                    </div>

                    <div className="relative">
                        <div className="text-8xl sm:text-9xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                            {formatTime(remainingTime)}
                        </div>
                        {isRunning && (
                            <motion.div 
                                animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className={cn("absolute inset-x-0 -inset-y-4 rounded-[4rem] filter blur-xl -z-10", stateConfigs.accent)}
                            />
                        )}
                    </div>

                    <div className="w-full space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <span>{stateConfigs.metricLabel}</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <motion.div 
                                className={cn("h-full transition-all", stateConfigs.accent)} 
                                style={{ width: `${progress}%` }} 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        <button
                            onClick={isRunning ? pauseTimer : startTimer}
                            disabled={!currentSubtask}
                            className={cn(
                                "h-16 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all",
                                !currentSubtask ? "bg-slate-100 text-slate-400" : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-black dark:hover:bg-slate-100"
                            )}
                        >
                            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                            {isRunning ? "Suspend" : "Excecute"}
                        </button>
                        <button
                            onClick={completeSubtask}
                            disabled={!currentSubtask}
                            className={cn(
                                "h-16 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all",
                                !currentSubtask ? "bg-slate-100 text-slate-400" : "bg-indigo-600 text-white hover:bg-indigo-700"
                            )}
                        >
                            <CheckCircle2 className="w-6 h-6" />
                            Finalize
                        </button>
                    </div>

                    {timerState === "Focus" && isRunning && (
                        <button onClick={skipToBreak} className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-2">
                            <SkipForward className="w-3.5 h-3.5" />
                            Skip to Rest Interval
                        </button>
                    )}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-100 dark:border-slate-900">
            {[
                { label: "AI Integration", icon: Sparkles, color: "text-indigo-600" },
                { label: "Enterprise Security", icon: Shield, color: "text-emerald-600" },
                { label: "Operational Integrity", icon: Zap, color: "text-orange-600" }
            ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                    <feature.icon className={cn("w-4 h-4", feature.color)} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{feature.label}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
