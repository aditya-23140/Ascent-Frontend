"use client";

import { motion } from "framer-motion";
import { useGuardian } from "@/hooks/useGuardian";
import { 
  Users, 
  ShoppingBag, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap, 
  Award,
  ArrowRight,
  Plus
} from "lucide-react";
import Link from "next/link";

export default function GuardianDashboardPage() {
  const { data, loading, error, resolveRequest } = useGuardian();

  if (loading) {
    return <div className="p-10 text-center text-rum-600">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6 md:p-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Guardian Dashboard</h1>
          <p className="text-rum-600 text-sm">Monitor your dependents and manage reward requests.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/guardian/store">
            <button className="flex items-center gap-2 h-10 px-4 border border-input bg-background hover:bg-muted hover:text-accent-foreground rounded-md text-sm font-medium transition-colors">
              <ShoppingBag className="w-4 h-4" /> Store Settings
            </button>
          </Link>
          <Link href="/guardian/settings">
            <button className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Add Dependent
            </button>
          </Link>
        </div>
      </div>

      {/* Dependents Grid */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-rum-600">Your Dependents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.students.length === 0 ? (
            <div className="col-span-full p-12 bg-muted/30 border border-dashed border-border rounded-xl text-center">
              <p className="text-rum-600">No dependents added yet.</p>
              <Link href="/guardian/settings" className="text-primary font-bold mt-2 inline-block">Invite someone</Link>
            </div>
          ) : (
            data?.students.map((student, i) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    {student.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold">{student.name}</h3>
                    <p className="text-xs text-rum-600">{student.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-[10px] text-rum-600 uppercase font-bold mb-1">
                      <Award className="w-3 h-3" /> Points
                    </div>
                    <div className="text-lg font-bold">{student.tokens}</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-[10px] text-rum-600 uppercase font-bold mb-1">
                      <Zap className="w-3 h-3" /> Spoons
                    </div>
                    <div className="text-lg font-bold">{student.spoonsRemaining} / 12</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg col-span-2">
                    <div className="flex items-center gap-2 text-[10px] text-rum-600 uppercase font-bold mb-1">
                      <Clock className="w-3 h-3" /> Current Streak
                    </div>
                    <div className="text-lg font-bold">{student.currentStreak} Days</div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Pending Requests */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-rum-600">Pending Redemption Requests</h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {data?.requests.length === 0 ? (
            <div className="p-8 text-center text-rum-600 italic">No pending requests.</div>
          ) : (
            <div className="divide-y divide-border">
              {data?.requests.map((request) => (
                <div key={request.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-500/10 p-2 rounded-lg text-yellow-600">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        {request.studentName} <ArrowRight className="w-3 h-3 text-rum-600" /> {request.rewardName}
                      </div>
                      <div className="text-xs text-rum-600">
                        Requested {new Date(request.createdAt).toLocaleDateString()} • Cost: {request.tokenCost} points
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="h-9 px-3 flex items-center justify-center rounded-md text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => resolveRequest(request.id, false)}
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </button>
                    <button 
                      className="h-9 px-3 flex items-center justify-center rounded-md text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
                      onClick={() => resolveRequest(request.id, true)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
