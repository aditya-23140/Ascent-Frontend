"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  ChevronRight,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "completed";
  subtaskCount: number;
  completedSubtasks: number;
  deadline?: string;
  onTaskSelect?: (taskId: string) => void;
}

/**
 * Priority indicator with professional subdued tones
 */
const PriorityIndicator: React.FC<{ priority: TaskCardProps["priority"] }> = ({
  priority,
}) => {
  const configs = {
    low: { dot: "bg-blue-400", label: "Low Priority" },
    medium: { dot: "bg-amber-400", label: "Medium Priority" },
    high: { dot: "bg-orange-500", label: "High Priority" },
    urgent: { dot: "bg-rose-500", label: "Urgent" },
  };

  const config = configs[priority] || configs.medium;

  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("w-2 h-2 rounded-full", config.dot)} />
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        {config.label}
      </span>
    </div>
  );
};

/**
 * Modern Task Card Component - Professional Enterprise Design
 */
export const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  priority,
  status,
  subtaskCount,
  completedSubtasks,
  deadline,
  onTaskSelect,
}) => {
  const progress = subtaskCount > 0 ? (completedSubtasks / subtaskCount) * 100 : 0;
  const isOverdue = deadline && new Date(deadline) < new Date() && status !== "completed";

  const statusConfigs = {
    todo: { icon: AlertCircle, color: "text-slate-400", bg: "bg-slate-50 dark:bg-slate-800" },
    in_progress: { icon: Clock, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
    completed: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
  };

  const config = statusConfigs[status] || statusConfigs.todo;
  const Icon = config.icon;

  return (
    <div
      onClick={() => onTaskSelect?.(id)}
      className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2 rounded-xl transition-colors", config.bg)}>
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>
        <PriorityIndicator priority={priority} />
      </div>

      <div className="flex-1 space-y-2 mb-6">
        <h3 className="font-bold text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span className="text-slate-900 dark:text-slate-200 font-bold">{completedSubtasks}</span> / {subtaskCount} Subtasks achieved
        </p>
      </div>

      <div className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Progress</span>
            <span className="text-slate-900 dark:text-white">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-indigo-600 rounded-full"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
          <div className="flex items-center gap-2">
            <Calendar className={cn("w-3.5 h-3.5", isOverdue ? "text-rose-500" : "text-slate-400")} />
            <span className={cn(
              "text-[11px] font-bold tracking-tight",
              isOverdue ? "text-rose-600" : "text-slate-500"
            )}>
              {deadline ? new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No deadline'}
            </span>
          </div>
          <div className="flex items-center text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-bold uppercase tracking-widest mr-1">Details</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
