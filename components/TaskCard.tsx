"use client";

import React from "react";
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

const PriorityLabel: React.FC<{ priority: TaskCardProps["priority"] }> = ({ priority }) => {
  const colors = {
    low: "text-rum-600",
    medium: "text-amber-600",
    high: "text-orange-600",
    urgent: "text-rose-600",
  };
  return (
    <span className={cn("text-[10px] font-bold uppercase tracking-widest", colors[priority])}>
      {priority}
    </span>
  );
};

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

  return (
    <div
      onClick={() => onTaskSelect?.(id)}
      className="bg-card p-6 border border-border rounded-md cursor-pointer hover:border-primary/30 transition-colors flex flex-col h-full"
    >
      <div className="flex justify-between items-center mb-4">
        <PriorityLabel priority={priority} />
        {status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
      </div>

      <div className="flex-1 mb-6">
        <h3 className="font-bold text-foreground text-sm leading-tight mb-2">
          {title}
        </h3>
        <p className="text-[11px] text-muted-foreground">
          {completedSubtasks} / {subtaskCount} Tasks
        </p>
      </div>

      <div className="space-y-4">
        <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
          <div className="flex items-center gap-1.5">
             <Calendar size={12} className={isOverdue ? "text-destructive" : "text-muted-foreground"} />
             <span className={isOverdue ? "text-destructive" : ""}>
               {deadline ? new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}
             </span>
          </div>
          <ChevronRight size={12} />
        </div>
      </div>
    </div>
  );
};

export default TaskCard;









