"use client";

import React from "react";
import { 
  CheckCircle2, 
  Award,
  ArrowUpRight,
  TrendingUp,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  tasksCompleted?: number;
  tasksTotal?: number;
  weeklyFocusHours?: number;
  points?: number;
}

/**
 * Stat Card - Professional Enterprise Design
 */
const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
  desc: string;
}> = ({ label, value, icon: Icon, color, bg, desc }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-200 group">
      <div className="flex items-start justify-between">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg", bg, color)}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {label}
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              {value}
            </p>
            <div className="flex items-center text-emerald-500 text-[10px] font-bold uppercase">
               <TrendingUp className="w-3 h-3 mr-1" />
               Optimal
            </div>
          </div>
          <p className="text-[11px] font-medium text-slate-500 leading-relaxed max-w-[180px]">
            {desc}
          </p>
        </div>
        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-300 group-hover:text-indigo-600 transition-colors">
            <ArrowUpRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

/**
 * Dashboard Stats Component - Professional Enterprise Design
 * Replaces vibrant orange/green cards with sophisticated Slate/Indigo palette
 */
export const DashboardStats: React.FC<DashboardStatsProps> = ({
  tasksCompleted = 8,
  tasksTotal = 12,
  weeklyFocusHours = 14.5,
  points = 2450,
}) => {
  const stats = [
    {
      label: "Operational Output",
      value: `${tasksCompleted}/${tasksTotal}`,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      desc: "Measured achievement against defined project objectives."
    },
    {
      label: "Intensity Stream",
      value: `${weeklyFocusHours}h`,
      icon: Activity,
      color: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-950/30",
      desc: "Cumulative deep work duration over the current cycle."
    },
    {
      label: "Merit Accumulation",
      value: points.toLocaleString(),
      icon: Award,
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950/30",
      desc: "Operational excellence points awarded for high performance."
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;
