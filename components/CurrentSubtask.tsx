"use client";

import React from "react";
import { 
  Target, 
  Play, 
  CheckCircle2, 
  Clock, 
  Loader,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Subtask {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
}

interface CurrentSubtaskProps {
  subtask?: Subtask;
  onStartSession?: () => void;
  onComplete?: () => void;
  isLoading?: boolean;
}

/**
 * Current Operational Subtask Component - Professional Enterprise Design
 * Removes emojis and vibrant gradients in favor of Indigo/Slate precision.
 */
export const CurrentSubtask: React.FC<CurrentSubtaskProps> = ({
  subtask,
  onStartSession,
  onComplete,
  isLoading = false,
}) => {
  return (
    <div className="bg-card dark:bg-card rounded-[2rem] border border-border dark:border-border p-8 shadow-sm">
      {subtask ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <p className="text-[10px] font-black text-rum-600 uppercase tracking-[0.2em]">Active Segment</p>
            </div>
            <h3 className="text-2xl font-bold text-foreground tracking-tight">
              {subtask.title}
            </h3>
            <div className="flex items-center gap-2 text-rum-600 font-medium text-sm">
                <Clock className="w-4 h-4" />
                <span>Allocation: {subtask.duration} Minutes</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/50 dark:bg-border rounded-2xl border border-border dark:border-border">
            <div
              className={cn(
                "w-2.5 h-2.5 rounded-full",
                subtask.completed ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-primary shadow-[0_0_8px_rgba(99,102,241,0.4)]"
              )}
            />
            <span className="text-[11px] font-black text-rum-600 uppercase tracking-widest">
              {subtask.completed ? "Verified Complete" : "Pending Execution"}
            </span>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={onStartSession}
              disabled={isLoading || subtask.completed}
              className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Execute
            </button>
            <button
              onClick={onComplete}
              disabled={isLoading}
              className="flex-1 h-12 bg-card dark:bg-card border border-border dark:border-border text-foreground rounded-xl font-bold text-sm uppercase tracking-widest hover:border-primary transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Finalize
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 bg-muted/50 dark:bg-border rounded-full flex items-center justify-center mx-auto border border-border dark:border-border shadow-inner">
                <ShieldCheck className="w-10 h-10 text-border" />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground tracking-tight">System Standby</h3>
                <p className="text-rum-600 text-sm max-w-[200px] mx-auto font-medium lead-relaxed">Select an objective to begin operational tracking.</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default CurrentSubtask;









