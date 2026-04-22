"use client";

import { motion } from "framer-motion";
import { useUserStats } from "@/hooks/useUserStats";
import { useTasks, type ITask } from "@/hooks/useTasks";
import Link from "next/link";
import {
  TrendingUp,
  Zap,
  CheckCircle2,
  Target,
  Award,
  Clock,
  Plus,
  Calendar,
  Layers,
  AlertCircle,
  Play
} from "lucide-react";
import { TaskCard } from "@/components/TaskCard";

/**
 * Animated Stats Card - Professional Enterprise Style
 */
function DashboardStatCard({
  title,
  value,
  icon: Icon,
  trend,
  index,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {value}
            </h3>
            {trend && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">
                {trend}
              </span>
            )}
          </div>
        </div>
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Greeter Section - Minimalist
 */
function DashboardHeader({
  firstName,
  streak,
}: {
  firstName: string;
  streak: number;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pt-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-[0.2em]">
          <Calendar className="w-3 h-3" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
          Welcome back, {firstName || "User"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          You have successfully maintained a <span className="font-bold text-slate-900 dark:text-slate-200">{streak} day streak</span>. Keep the momentum.
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="h-10 px-4 flex items-center gap-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none">
          <Plus className="w-3.5 h-3.5" />
          New Task
        </button>
        <button className="h-10 px-4 flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          <Play className="w-3.5 h-3.5 text-indigo-600" />
          Start Timer
        </button>
      </div>
    </div>
  );
}

/**
 * Streak Card - Professional Design
 */
function StreakOverview({ streak }: { streak: number }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative group">
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase tracking-widest border border-orange-100 dark:border-orange-900/30">
            <Zap className="w-3 h-3" />
            Performance Streak
          </div>
          <div className="space-y-1">
            <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
              {streak} <span className="text-lg font-bold text-slate-400 uppercase tracking-widest ml-1">Days</span>
            </p>
            <p className="text-xs font-medium text-slate-500">Continuous daily productivity</p>
          </div>
        </div>
        <div className="h-20 w-20 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-orange-500/10 dark:bg-orange-500/5 rounded-full animate-pulse" />
            <Zap className="w-10 h-10 text-orange-500" />
        </div>
      </div>
    </div>
  );
}

/**
 * Tasks Progress Widget - Minimalist
 */
function ProgressWidget({
  totalTasks,
  completed,
}: {
  totalTasks: number;
  completed: number;
}) {
  const progress = totalTasks > 0 ? (completed / totalTasks) * 100 : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Workload Progress
          </h3>
          <p className="text-xs text-slate-500 font-medium tracking-wide">
            {completed} of {totalTasks} objectives achieved
          </p>
        </div>
        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Completion Metric
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: 0.2, duration: 1 }}
              className="h-full bg-indigo-600 rounded-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/50">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Finalized
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{completed}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/50">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              In Queue
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{totalTasks - completed}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Task Summary Section
 */
function TasksOverview({
  tasks,
  onTaskSelect,
}: {
  tasks: ITask[];
  onTaskSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-slate-400" />
          Active Objectives
        </h2>
        <Link href="/tasks" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-widest">
            View All
        </Link>
      </div>

      {(tasks || []).length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-300">
            <Target className="w-7 h-7" />
          </div>
          <p className="text-slate-900 dark:text-white font-bold tracking-tight">No active tasks found</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs max-w-[200px] mx-auto">
            Initialize your workspace by creating a project or individual task.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(tasks || []).slice(0, 4).map((task, index) => {
            const subtasks = (task.subtasks as any[]) || [];
            const completedCount = subtasks.filter(s => s.completed).length;
            return (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <TaskCard
                  id={task._id}
                  title={task.title}
                  priority={task.priority as "low" | "medium" | "high" | "urgent"}
                  status={task.status as "todo" | "in_progress" | "completed"}
                  subtaskCount={subtasks.length}
                  completedSubtasks={completedCount}
                  deadline={task.deadline}
                  onTaskSelect={onTaskSelect}
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Main Dashboard Page - Professional Enterprise Concept
 */
export default function DashboardPage() {
  const { stats, profile, error } = useUserStats();
  const { tasks } = useTasks();

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-50 dark:bg-red-950/30 rounded-2xl text-red-600">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <p className="text-slate-900 dark:text-white font-bold tracking-tight">Dashboard synchronization error</p>
            <p className="text-slate-500 text-xs">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const completedTasks = tasks?.filter((t) => t.status === "completed").length || 0;

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <DashboardHeader
        firstName={profile?.firstName || "User"}
        streak={stats?.currentStreak || 0}
      />

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <DashboardStatCard
          title="Consolidated Score"
          value={stats?.pointsEarned || 0}
          icon={Award}
          trend="+12%"
          index={0}
        />
        <DashboardStatCard
          title="Focus Allocation"
          value={`${Math.round((stats?.totalFocusTime || 0) / 60)}h`}
          icon={Clock}
          index={1}
        />
        <DashboardStatCard
          title="Objectives Finalized"
          value={stats?.totalTasksCompleted || 0}
          icon={CheckCircle2}
          trend="+4 today"
          index={2}
        />
        <DashboardStatCard
          title="Platform Authority"
          value={`Lvl ${stats?.level || 1}`}
          icon={TrendingUp}
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Analytics & Metrics - Left Sidebar in Desktop */}
        <div className="lg:col-span-4 space-y-6">
          <StreakOverview streak={stats?.currentStreak || 0} />
          <ProgressWidget
            totalTasks={tasks?.length || 0}
            completed={completedTasks}
          />
        </div>

        {/* Primary Workspace - Right Area in Desktop */}
        <div className="lg:col-span-8">
          <TasksOverview
            tasks={tasks || []}
            onTaskSelect={(id) => console.log("Detail view requested for:", id)}
          />
        </div>
      </div>
    </div>
  );
}
