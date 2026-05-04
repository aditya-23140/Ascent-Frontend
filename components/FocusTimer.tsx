"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks, ISubtask, ITaskWithSubtasks, ITask } from "@/hooks/useTasks";
import { useFocusTimer, type TimerState } from "@/hooks/useFocusTimer";
import { useUserStats } from "@/hooks/useUserStats";
import {
  ChevronDown,
  Play,
  Pause,
  CheckCircle2,
  Coffee,
  Zap,
  Target,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const FocusTimer: React.FC = () => {
  const { tasks, getTaskWithSubtasks, loading, fetchTasks } = useTasks();
  const { stats } = useUserStats();
  const [selectedTask, setSelectedTask] = useState<ITaskWithSubtasks | null>(null);
  const [selectedSubtask, setSelectedSubtask] = useState<ISubtask | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingTask, setIsLoadingTask] = useState(false);

  const {
    timerState,
    currentSubtask,
    remainingTime,
    secondsElapsed,
    plannedSeconds,
    setPlannedSeconds,
    isRunning,
    progress,
    formatTime,
    loadSubtask,
    startTimer,
    pauseTimer,
    resumeTimer,
    startBreak,
    enterHyperFocus,
    completeSubtask,
  } = useFocusTimer();

  const handleTaskSelect = useCallback(
    async (task: ITask) => {
      setIsLoadingTask(true);
      try {
        const taskWithSubtasks = await getTaskWithSubtasks(task._id);
        setSelectedTask(taskWithSubtasks);
        setSelectedSubtask(null);
        setIsDropdownOpen(false);
      } catch (err) {
        console.error("Failed to load task:", err);
      } finally {
        setIsLoadingTask(false);
      }
    },
    [getTaskWithSubtasks]
  );

  const autoSelectNext = useCallback(async () => {
    const updatedTasks = await fetchTasks();
    if (!updatedTasks || updatedTasks.length === 0) {
      setSelectedTask(null);
      setSelectedSubtask(null);
      return;
    }

    // Find the first incomplete task
    const nextTask = updatedTasks.find(t => !t.completed);
    if (nextTask) {
      const taskWithDetails = await getTaskWithSubtasks(nextTask._id);
      setSelectedTask(taskWithDetails);
      
      // Find the first incomplete subtask
      const nextSubtask = taskWithDetails.subtasks.find(st => !st.completed);
      setSelectedSubtask(nextSubtask || null);
    } else {
      setSelectedTask(null);
      setSelectedSubtask(null);
    }
  }, [fetchTasks, getTaskWithSubtasks]);

  useEffect(() => {
    if (selectedSubtask && selectedTask) {
      const calibratedAvg = stats?.avgDurationByPriority?.[selectedTask.priority];
      loadSubtask({
        _id: selectedSubtask._id,
        title: selectedSubtask.title,
        duration: selectedSubtask.duration,
        completed: selectedSubtask.completed,
      }, selectedTask._id, calibratedAvg);
    }
  }, [selectedSubtask, selectedTask, loadSubtask, stats?.avgDurationByPriority]);

  const stateConfigs = useMemo(() => {
    const configs: Record<TimerState, {
      bg: string,
      text: string,
      border: string,
      ambient: string,
      label: string
    }> = {
      FOCUS: { 
        bg: "bg-primary/5 dark:bg-primary/10", 
        text: "text-primary", 
        border: "border-primary/20", 
        ambient: "var(--ambient-focus)",
        label: "Operational Focus" 
      },
      HYPERFOCUS: { 
        bg: "bg-primary/10 dark:bg-primary/20", 
        text: "text-primary font-black", 
        border: "border-primary/40", 
        ambient: "var(--ambient-hyperfocus)",
        label: "Deep Work Protocol" 
      },
      BREAK: { 
        bg: "bg-emerald-50 dark:bg-emerald-950/20", 
        text: "text-emerald-700 dark:text-emerald-400", 
        border: "border-emerald-200 dark:border-emerald-800", 
        ambient: "var(--ambient-break)",
        label: "Resting" 
      },
      IDLE: { 
        bg: "bg-card", 
        text: "text-rum-700 dark:text-rum-100", 
        border: "border-border", 
        ambient: "transparent",
        label: "Ready" 
      },
      COMPLETED: { 
        bg: "bg-rum-100 dark:bg-rum-900", 
        text: "text-rum-800 dark:text-rum-100", 
        border: "border-border", 
        ambient: "transparent",
        label: "Session Done" 
      }
    };
    return configs[timerState] || configs.IDLE;
  }, [timerState]);

  return (
    <div 
      className="p-6 md:p-10 space-y-10 min-h-full transition-colors duration-700"
      style={{ 
        "--ambient-current": stateConfigs.ambient,
        backgroundColor: "var(--ambient-current)"
      } as React.CSSProperties}
      data-timer-state={timerState}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold">Timer</h1>
          <p className="text-sm text-rum-600">Choose a task and start working.</p>
        </div>
        <div className="flex items-center gap-6 text-sm">
           <div className="flex items-center gap-2 font-bold text-foreground">
              <Zap className="w-4 h-4 text-primary" />
              {stats?.spoonState?.remainingSpoons ?? 12} Spoons
           </div>
           <div className="flex items-center gap-2 font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
              <span className="text-[10px] uppercase tracking-wider opacity-60">Effort Multiplier</span>
              <span>{stats?.spoonState?.effortMultiplier ?? 1.0}x</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Task Selection */}
        <div className="lg:col-span-2 space-y-6">
           <div className="space-y-4">
              <label className="text-xs font-bold text-rum-600 uppercase tracking-wider">Select Task</label>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full h-12 px-4 bg-card border border-border rounded-md text-left flex items-center justify-between"
                >
                  <span className="text-sm truncate">
                    {isLoadingTask ? "Loading..." : selectedTask ? selectedTask.title : "Pick a task"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-rum-600" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-14 left-0 right-0 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
                    {tasks?.filter(task => !task.completed).map((task, i) => (
                      <button 
                        key={task._id || `task-option-${i}`} 
                        onClick={() => handleTaskSelect(task)} 
                        className="w-full px-4 py-3 text-left text-sm hover:bg-muted border-b border-border last:border-0"
                      >
                        {task.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
           </div>

           {selectedTask && (
             <div className="space-y-4">
                <label className="text-xs font-bold text-rum-600 uppercase tracking-wider">Steps</label>
                <div className="space-y-2">
                   {(selectedTask.subtasks as ISubtask[])?.filter(st => !st.completed).map((st, i) => (
                     <button
                       key={st._id || `subtask-option-${i}`}
                       onClick={() => setSelectedSubtask(st)}
                       className={cn(
                         "w-full px-4 py-3 rounded-md text-left text-sm border transition-colors",
                         selectedSubtask?._id === st._id
                           ? "bg-primary border-primary text-primary-foreground"
                           : "bg-card border-border text-foreground hover:bg-muted"
                       )}
                     >
                       {st.title} ({st.duration}m)
                     </button>
                   ))}
                </div>
             </div>
           )}
        </div>

        {/* Timer UI */}
        <div className="lg:col-span-3">
           <div className={cn(
             "border rounded-[2rem] p-10 flex flex-col items-center justify-center text-center space-y-10 transition-all duration-700 bg-card/60 backdrop-blur-sm shadow-xl shadow-primary/5",
             stateConfigs.border
           )}>
              <div className="space-y-2">
                 <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border", stateConfigs.text, stateConfigs.border)}>
                   {stateConfigs.label}
                 </span>
                 <h2 className="text-2xl font-bold">
                   {currentSubtask?.title || "Ready to Start"}
                 </h2>
              </div>

              {/* Circular Progress Ring */}
              <div className="relative w-72 h-72 flex items-center justify-center">
                 <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    {/* Background Track */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-rum-100 dark:text-muted"
                    />
                    {/* Progress Track */}
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="282.7"
                      initial={{ strokeDashoffset: 282.7 }}
                      animate={{ 
                        strokeDashoffset: 282.7 * (1 - Math.min(progress / 100, 1)),
                        transition: { duration: 1, ease: "linear" }
                      }}
                      className={stateConfigs.text}
                    />
                 </svg>
                 
                 <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
                    <div className={cn("text-6xl font-black tracking-tighter tabular-nums", stateConfigs.text)}>
                       {timerState === 'HYPERFOCUS' 
                         ? formatTime(secondsElapsed - plannedSeconds) 
                         : formatTime(remainingTime)
                       }
                    </div>
                    <div className="text-[10px] font-black text-rum-600 uppercase tracking-[0.2em]">
                       {timerState === 'HYPERFOCUS' ? 'HyperFocus Active' : !isRunning && timerState !== 'IDLE' && timerState !== 'COMPLETED' ? 'Paused' : 'Remaining Velocity'}
                    </div>
                 </div>
              </div>

              <div className="space-y-6 w-full max-w-sm">
                 <div className="text-[10px] font-black text-rum-600 uppercase tracking-[0.15em] flex flex-col items-center gap-4">
                   <div className="flex items-center gap-3">
                     <span>Suggested: {currentSubtask?.duration || 25}m</span>
                     <span className="w-1 h-1 rounded-full bg-rum-300" />
                     <span>Calibrated: {Math.round(plannedSeconds / 60)}m</span>
                   </div>
                   
                   {timerState === 'IDLE' && currentSubtask && (
                      <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-xl border border-border">
                        <button 
                          onClick={() => setPlannedSeconds(prev => Math.max(10 * 60, prev - 5 * 60))}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-background shadow-sm border border-border text-foreground transition-transform active:scale-90"
                        > - </button>
                        <div className="flex flex-col items-center">
                           <span className="text-xl font-black text-foreground">{Math.floor(plannedSeconds / 60)}</span>
                           <span className="text-[8px]">Minutes</span>
                        </div>
                        <button 
                          onClick={() => setPlannedSeconds(prev => Math.min(90 * 60, prev + 5 * 60))}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-background shadow-sm border border-border text-foreground transition-transform active:scale-90"
                        > + </button>
                     </div>
                   )}
                 </div>

                 {timerState === 'IDLE' ? (
                    <button
                      onClick={startTimer}
                      disabled={!currentSubtask}
                      className={cn(
                        "w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl",
                        !currentSubtask 
                          ? "bg-muted text-rum-400 cursor-not-allowed border border-border" 
                          : "bg-primary text-primary-foreground shadow-primary/20"
                      )}
                    >
                      <Play size={16} fill="currentColor" /> Initiate Session
                    </button>
                 ) : (
                   <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-4">
                         <button
                           onClick={isRunning ? pauseTimer : resumeTimer}
                           className="h-14 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                         >
                           {isRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                           {isRunning ? "Suspend" : "Resume"}
                         </button>
                         <button
                            onClick={() => startBreak()}
                            className="h-14 rounded-2xl bg-card border border-border text-foreground font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center transition-all hover:bg-muted"
                          >
                           Take Break
                         </button>
                      </div>
                      
                      {remainingTime <= 0 && timerState === 'FOCUS' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="p-5 bg-primary rounded-[1.5rem] text-primary-foreground space-y-4 shadow-xl shadow-primary/20"
                        >
                           <div className="text-center space-y-1">
                             <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Session Expired</p>
                             <p className="text-sm font-bold">Is your task complete?</p>
                           </div>
                           <div className="flex flex-col gap-2">
                              <button 
                                onClick={async () => {
                                  const res = await completeSubtask();
                                  if (res) {
                                    await autoSelectNext();
                                  }
                                }} 
                                className="w-full bg-background text-primary py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-rum-100 active:scale-95"
                              >
                                Yes, Finalize Task
                              </button>
                              <div className="grid grid-cols-2 gap-2">
                                <button onClick={enterHyperFocus} className="bg-primary/20 text-primary-foreground py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-primary/30 active:scale-95 border border-primary-foreground/20">Keep Working</button>
                                <button onClick={() => startBreak()} className="bg-primary/20 text-primary-foreground py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-primary/30 active:scale-95 border border-primary-foreground/20">Break</button>
                              </div>
                           </div>
                        </motion.div>
                      )}

                        <button
                          onClick={async () => {
                            const res = await completeSubtask();
                            if (res) {
                              await autoSelectNext();
                            }
                          }}
                          className="w-full h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-sm transition-all hover:bg-primary/20 active:scale-95"
                        >
                           <CheckCircle2 size={16} /> Complete Target
                        </button>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;









