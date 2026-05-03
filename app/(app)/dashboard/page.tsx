"use client";

import { motion } from "framer-motion";
import { useUserStats } from "@/hooks/useUserStats";
import { useTasks } from "@/hooks/useTasks";
import Link from "next/link";
import {
  Zap,
  CheckCircle2,
  Award,
  Clock,
  Plus,
  Play,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { TaskCard } from "@/components/TaskCard";

/**
 * Clean Flat Stat Card
 */
function DashboardStatCard({
  title,
  value,
  icon: Icon,
  index
}: {
  title: string;
  value: string | number;
  icon: any;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-muted/50 dark:bg-card p-6 rounded-lg border border-border "
    >
      <div className="flex items-center gap-3 mb-2 text-rum-600">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
      </div>
      <h3 className="text-2xl font-bold text-foreground">
        {value}
      </h3>
    </motion.div>
  );
}

import { useStudent } from "@/hooks/useStudent";

export default function DashboardPage() {
  const { stats, profile, error } = useUserStats();
  const { tasks } = useTasks();
  const { requests, acceptRequest } = useStudent();

  if (error) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 font-medium">Error loading data: {error}</p>
      </div>
    );
  }

  const completedTasks = tasks?.filter((t) => t.status === "completed").length || 0;
  const spoonsRemaining = stats?.spoonState?.remainingSpoons ?? 12;
  const rawMultiplier = stats?.spoonState?.effortMultiplier ?? 1.0;
  const effortMultiplier = isNaN(rawMultiplier) ? 1.0 : rawMultiplier;
  const dailyBudget = profile?.dailySpoonBudget || 12;

  return (
    <div className="p-6 md:p-10 space-y-12">
      {/* Guardian Requests Notification */}
      {requests.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 text-sm">
            <div className="bg-primary p-2 rounded-lg text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold">{requests[0].parent.name}</span> ({requests[0].parent.email}) wants to add you as a dependent.
            </div>
          </div>
          <button 
            className="h-8 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            onClick={() => acceptRequest(requests[0].id)}
          >
            Accept Request
          </button>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Hi, {profile?.firstName || "there"}
          </h1>
          <p className="text-rum-600 text-sm leading-relaxed">
            {effortMultiplier >= 1.5 
              ? `Your energy is high! You're earning ${effortMultiplier.toFixed(1)}x bonus points.` 
              : effortMultiplier <= 0.5
                ? "Running low on energy today — that's okay."
                : "Track your energy and complete your tasks."}
          </p>
        </div>
        
        <div className="flex items-center gap-3">

          <Link href="/focus" className="h-10 px-4 flex items-center gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-md text-sm font-medium">
             <Play className="w-4 h-4 fill-current" />
             Start Timer
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          title="Energy (Spoons)"
          value={`${spoonsRemaining} / ${dailyBudget}`}
          icon={Zap}
          index={0}
        />
        <DashboardStatCard
          title="Total Points"
          value={stats?.pointsEarned || 0}
          icon={Award}
          index={1}
        />
        <DashboardStatCard
          title="Focus Hours"
          value={Math.round((stats?.totalFocusTime || 0) / 60)}
          icon={Clock}
          index={2}
        />
        <DashboardStatCard
          title="Current Streak"
          value={`${stats?.currentStreak || 0} Days`}
          icon={CheckCircle2}
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Task Progress */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-sm font-bold mb-6">Task Progress</h3>
              <div className="space-y-4">
                 <div className="flex justify-between text-sm">
                    <span className="text-rum-600">Completion</span>
                    <span className="font-bold">{tasks?.length ? Math.round((completedTasks / tasks.length) * 100) : 0}%</span>
                 </div>
                 <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${tasks?.length ? (completedTasks / tasks.length) * 100 : 0}%` }}
                      className="h-full bg-primary rounded-full"
                    />
                 </div>
                 <div className="pt-4 grid grid-cols-2 gap-4">
                    <div>
                       <p className="text-[10px] text-rum-600 uppercase font-bold mb-1">Done</p>
                       <p className="text-xl font-bold">{completedTasks}</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-rum-600 uppercase font-bold mb-1">Total</p>
                       <p className="text-xl font-bold">{tasks?.length || 0}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Recent Tasks */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">Recent Tasks</h2>
              <Link href="/tasks" className="text-xs text-primary font-medium flex items-center gap-1">
                 All Tasks <ArrowRight size={12} />
              </Link>
           </div>

           {(!tasks || tasks.length === 0) ? (
             <div className="p-12 bg-muted/50 dark:bg-card border border-border rounded-lg text-center">
                <p className="text-rum-600 text-sm">No tasks added yet.</p>
                <Link href="/tasks" className="mt-4 inline-block text-sm font-bold text-primary">Add Task</Link>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.slice(0, 4).map((task, i) => (
                   <TaskCard
                     key={task._id || `recent-task-${i}`}
                     id={task._id}
                     title={task.title}
                     priority={task.priority as any}
                     status={task.status as any}
                     subtaskCount={task.subtasks?.length || 0}
                     completedSubtasks={task.subtasks?.filter(s => s.completed).length || 0}
                     deadline={task.deadline}
                     onTaskSelect={() => {}}
                   />
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}








