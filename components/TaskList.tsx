"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus, Target, LayoutGrid, List } from "lucide-react";
import { TaskCard } from "./TaskCard";

interface Task {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "completed";
  subtaskCount: number;
  completedSubtasks: number;
  deadline?: string;
}

interface TaskListProps {
  tasks: Task[];
  onTaskSelect?: (taskId: string) => void;
  onCreateTask?: () => void;
}

/**
 * Task List Component - Professional Enterprise Design
 * Replaces vibrant startup aesthetic with sophisticated Indigo/Slate precision.
 */
export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskSelect,
  onCreateTask,
}) => {
  return (
    <div className="space-y-8">
      {/* Precision Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between border-b border-border pb-6"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-primary" />
            <p className="text-[10px] font-black text-rum-600 uppercase tracking-[0.2em]">Operational Console</p>
          </div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Project Objectives</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex bg-muted p-1 rounded-xl border border-border">
            <button className="p-2 bg-card rounded-lg shadow-sm">
              <LayoutGrid className="w-4 h-4 text-primary" />
            </button>
            <button className="p-2 text-rum-600">
              <List className="w-4 h-4" />
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateTask}
            className="flex items-center gap-3 px-6 h-12 bg-primary text-primary-foreground rounded-xl font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            <span>Initialize Objective</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Task Grid */}
      <div>
        {tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-card dark:bg-card rounded-[2.5rem] border border-border dark:border-border shadow-sm space-y-6"
          >
            <div className="w-24 h-24 bg-muted/50 dark:bg-border rounded-[2rem] flex items-center justify-center mx-auto border border-border dark:border-rum-700 shadow-inner">
              <Target className="w-10 h-10 text-border" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground tracking-tight">Zero Objectives Identified</h3>
              <p className="text-rum-600 max-w-xs mx-auto font-medium text-sm leading-relaxed">
                The operative queue is currently vacant. Initialize your first objective to commence productivity tracking.
              </p>
            </div>
            <button
              onClick={onCreateTask}
              className="px-8 h-12 bg-primary text-primary-foreground rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none"
            >
              Get Started
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.05 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TaskCard
                  id={task.id}
                  title={task.title}
                  priority={task.priority}
                  status={task.status}
                  subtaskCount={task.subtaskCount}
                  completedSubtasks={task.completedSubtasks}
                  deadline={task.deadline}
                  onTaskSelect={onTaskSelect}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TaskList;









