"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUserStats } from "@/hooks/useUserStats";
import { User, Shield, ArrowRight, Loader2 } from "lucide-react";

export default function RoleSelectionPage() {
  const { profile, updateUserProfile, loading: profileLoading } = useUserStats();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleRoleSelect = async (role: "standard" | "parent") => {
    setLoading(role);
    const result = await updateUserProfile({ role });
    if (result.success) {
      router.push("/dashboard");
    } else {
      setLoading(null);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      <div className="text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold mb-4"
        >
          Welcome to Ascent
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-rum-600 max-w-lg mx-auto"
        >
          To get started, please choose the role that best fits how you&apos;ll be using the platform.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Normal / Standard Role */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-8 flex flex-col items-center text-center hover:border-primary/50 transition-colors group"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-3">Normal User</h2>
          <p className="text-rum-600 text-sm mb-8 flex-1">
            Focus on your own tasks, track your energy (spoons), and earn points to level up your productivity.
          </p>
          <button 
            onClick={() => handleRoleSelect("standard")}
            disabled={!!loading}
            className="flex items-center justify-center h-10 px-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium disabled:opacity-50 transition-colors"
          >
            {loading === "standard" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Continue as User <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </motion.div>

        {/* Guardian / Parent Role */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-8 flex flex-col items-center text-center hover:border-primary/50 transition-colors group"
        >
          <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Shield className="w-8 h-8 text-purple-500" />
          </div>
          <h2 className="text-xl font-bold mb-3">Guardian</h2>
          <p className="text-rum-600 text-sm mb-8 flex-1">
            Manage dependents, set up a reward store, and track the productivity progress of your team or family.
          </p>
          <button 
            onClick={() => handleRoleSelect("parent")}
            disabled={!!loading}
            className="flex items-center justify-center h-10 px-4 w-full bg-purple-500 hover:bg-purple-600 text-white rounded-md font-medium disabled:opacity-50 transition-colors"
          >
            {loading === "parent" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Continue as Guardian <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
