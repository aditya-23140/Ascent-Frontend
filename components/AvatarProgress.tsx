"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Target,
  Trophy,
  Clock,
  CheckCircle2,
  Flame,
  User,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarProgressProps {
  streak: number;
  dailyFocusMinutes: number;
  dailyGoalMinutes?: number;
  username?: string;
}

/**
 * Avatar Progress Widget - Professional Enterprise Design
 * Replaces vibrant startup aesthetic with sophisticated Indigo/Slate theme
 */
export const AvatarProgress: React.FC<AvatarProgressProps> = ({
  streak,
  dailyFocusMinutes,
  dailyGoalMinutes = 120,
  username = "Operational Lead",
}) => {
  const progressPercentage = Math.min(
    (dailyFocusMinutes / dailyGoalMinutes) * 100,
    100
  );
  const isGoalReached = dailyFocusMinutes >= dailyGoalMinutes;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 space-y-8 shadow-sm">
      {/* Identity Profile */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner border border-slate-200 dark:border-slate-700">
            <User className="w-10 h-10 text-slate-400" />
          </div>
          {isGoalReached && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-indigo-600 rounded-xl w-8 h-8 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900"
            >
              <Star className="w-4 h-4 text-white fill-white" />
            </motion.div>
          )}
        </div>
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Pulse</p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Active Status: {username}</h3>
        </div>
      </div>

      {/* Persistence Metric (Streak) */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 group transition-all hover:border-indigo-200">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Persistence Streak</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{streak}</span>
              <span className="text-xs font-bold text-slate-400 uppercase">Consecutive Days</span>
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Production Velocity (Focus Time) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Production Velocity</p>
          </div>
          <p className="text-xs font-black text-slate-900 dark:text-white">
            {dailyFocusMinutes} <span className="text-slate-400">/</span> {dailyGoalMinutes} <span className="text-slate-400">MIN</span>
          </p>
        </div>

        {/* Precision Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            className={cn(
              "h-full transition-all duration-700 rounded-full",
              isGoalReached ? "bg-emerald-500" : "bg-indigo-600"
            )}
          />
        </div>

        {isGoalReached ? (
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <p className="text-[10px] font-bold uppercase tracking-wider">Quota Achieved</p>
          </div>
        ) : (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {dailyGoalMinutes - dailyFocusMinutes} Minutes to target
          </p>
        )}
      </div>

      {/* Milestone Gallery */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verified Milestones</p>
        <div className="flex gap-3">
          {[
            { icon: Target, label: 'Initiation', color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' },
            { icon: Zap, label: 'Intensity', color: 'bg-orange-50 text-orange-600', border: 'border-orange-100' },
            { icon: Trophy, label: 'Excellence', color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' }
          ].map((m, i) => (
            <div
              key={i}
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center border transition-all hover:scale-105 cursor-help",
                m.color, m.border, "dark:bg-slate-800 dark:border-slate-700"
              )}
              title={m.label}
            >
              <m.icon className="w-5 h-5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarProgress;
