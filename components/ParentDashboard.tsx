"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { createAuthenticatedApiClient, handleApiError } from "@/lib/api";
import { 
  Users, Shield, CheckCircle2, XCircle, Loader, 
  Activity, Zap, Gift, AlertCircle, ChevronRight, 
  Plus, Coins
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentStats {
  id: string;
  name: string;
  email: string;
  tokens: number;
  points: number;
  currentStreak: number;
  spoonsRemaining: number;
}

interface RedemptionRequest {
  id: string;
  studentName: string;
  rewardName: string;
  tokenCost: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export const ParentDashboard: React.FC = () => {
  const { getToken } = useAuth();
  const [students, setStudents] = useState<StudentStats[]>([]);
  const [requests, setRequests] = useState<RedemptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showAddReward, setShowAddReward] = useState(false);
  const [newReward, setNewReward] = useState({ name: '', tokenCost: 10, category: 'custom' as any });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const client = await createAuthenticatedApiClient(token || "");

      const res = await client.get<{ success: boolean; data: { students: StudentStats[], requests: RedemptionRequest[] } }>("/api/rewards/parent/dashboard");
      setStudents(res.data.data.students);
      setRequests(res.data.data.requests);
    } catch (err) {
      console.error("Failed to fetch parent data:", handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (requestId: string, approve: boolean) => {
    try {
      setProcessingId(requestId);
      const token = await getToken();
      const client = await createAuthenticatedApiClient(token || "");
      await client.post(`/api/rewards/parent/resolve`, { requestId, approve });
      fetchData();
    } catch (err) {
      console.error(`Failed to resolve request:`, handleApiError(err));
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddReward = async () => {
    try {
      const token = await getToken();
      const client = await createAuthenticatedApiClient(token || "");
      await client.post("/api/rewards/parent/items", newReward);
      setShowAddReward(false);
      setNewReward({ name: '', tokenCost: 10, category: 'custom' });
      fetchData();
    } catch (err) {
      console.error("Failed to add reward:", handleApiError(err));
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader className="animate-spin mx-auto mb-4" /> Loading Dashboard...</div>;

  return (
    <div className="p-4 md:p-8 space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Command Center</h1>
          <p className="text-rum-600 font-medium">Monitoring growth and managing rewards.</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={() => setShowAddReward(true)}
             className="h-12 px-6 bg-primary hover:opacity-90 text-primary-foreground rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
           >
             <Plus size={16} strokeWidth={3} /> Create Reward
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Child Progress */}
        <div className="lg:col-span-8 space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rum-600">Linked Accounts</h3>
              <span className="px-2 py-1 bg-muted rounded text-[10px] font-bold">{students.length} Total</span>
           </div>
           
           {students.length === 0 ? (
             <div className="p-20 border-2 border-dashed border-border rounded-3xl text-center">
                <Users className="w-10 h-10 text-rum-200 mx-auto mb-4" />
                <p className="text-sm font-bold text-rum-600">No linked student accounts found.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {students.map((student) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={student.id} 
                    className="group bg-card border border-border p-8 rounded-[2rem] hover:shadow-2xl hover:shadow-primary/5 transition-all"
                  >
                    <div className="flex items-center gap-5 mb-8">
                       <div className="w-14 h-14 bg-gradient-to-br from-primary to-rum-600 rounded-2xl flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg">
                          {student.name[0]}
                       </div>
                       <div>
                          <h4 className="font-black text-lg group-hover:text-primary transition-colors">{student.name}</h4>
                          <p className="text-[10px] font-bold text-rum-600 uppercase tracking-widest">{student.email}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                       {[
                         { label: 'Tokens', val: student.tokens ?? 0, icon: Coins, color: 'text-amber-500' },
                         { label: 'Level', val: Math.floor(Math.sqrt((student.points || 0) / 100)) + 1, icon: Shield, color: 'text-primary' },
                         { label: 'Streak', val: `${student.currentStreak ?? 0}d`, icon: Zap, color: 'text-orange-500' }
                       ].map((stat, i) => (
                         <div key={i} className="bg-muted/40 p-4 rounded-2xl text-center">
                            <stat.icon className={cn("w-4 h-4 mx-auto mb-2 opacity-60", stat.color)} />
                            <p className="font-black text-lg">
                              {typeof stat.val === 'number' && isNaN(stat.val) ? 0 : stat.val}
                            </p>
                            <p className="text-[8px] font-black text-rum-600 uppercase tracking-tighter">{stat.label}</p>
                         </div>
                       ))}
                    </div>

                    <div className="mt-8 space-y-3">
                       <div className="flex justify-between items-center">
                          <p className="text-[10px] font-black text-rum-600 uppercase tracking-widest">Energy Potential</p>
                          <p className="text-[10px] font-black text-amber-600">{student.spoonsRemaining}/12</p>
                       </div>
                       <div className="flex gap-1.5 h-2">
                          {[...Array(12)].map((_, i) => (
                             <div key={i} className={cn("flex-1 rounded-full", i < student.spoonsRemaining ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]" : "bg-muted")} />
                          ))}
                       </div>
                       {student.spoonsRemaining <= 3 && (
                         <div className="flex items-center gap-2 text-amber-500 mt-2">
                           <AlertCircle className="w-3.5 h-3.5" />
                           <span className="text-[10px] font-bold uppercase tracking-tight">Running low on energy today — that's okay.</span>
                         </div>
                       )}
                       {student.currentStreak === 0 && (
                         <div className="flex items-center gap-2 text-rum-600 mt-1">
                           <Zap className="w-3.5 h-3.5" />
                           <span className="text-[10px] font-bold uppercase tracking-tight">Streak reset. Progress is still here.</span>
                         </div>
                       )}
                    </div>
                  </motion.div>
                ))}
             </div>
           )}
        </div>

        {/* Pending Requests */}
        <div className="lg:col-span-4 space-y-8">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rum-600">Action Required</h3>
           
           <div className="space-y-4">
             {requests.length === 0 ? (
               <div className="p-10 bg-muted/50 dark:bg-card/30 rounded-[2rem] border border-dashed border-border dark:border-border text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/30 mx-auto mb-4" />
                  <p className="text-[10px] font-black text-rum-600 uppercase tracking-widest leading-relaxed">System clear. All requests resolved.</p>
               </div>
             ) : (
               requests.map((request) => (
                 <motion.div 
                   layout
                   initial={{ scale: 0.95, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   key={request.id} 
                   className="bg-card dark:bg-card border border-border dark:border-border p-6 rounded-[1.5rem] shadow-sm space-y-5"
                 >
                    <div className="flex justify-between items-start">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-primary uppercase tracking-widest">{request.studentName}</p>
                          <h5 className="font-black text-md leading-tight">{request.rewardName}</h5>
                       </div>
                       <div className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full text-[10px] font-black">
                          {request.tokenCost}T
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => handleAction(request.id, true)}
                         disabled={!!processingId}
                         className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                       >
                         Approve
                       </button>
                       <button 
                         onClick={() => handleAction(request.id, false)}
                         disabled={!!processingId}
                         className="flex-1 h-10 border border-border dark:border-border hover:bg-muted/50 dark:hover:bg-border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                       >
                         Deny
                       </button>
                    </div>
                 </motion.div>
               ))
             )}
           </div>
        </div>
      </div>

      {/* Add Reward Modal (Simulated) */}
      <AnimatePresence>
        {showAddReward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rum-950/60 backdrop-blur-sm">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-card dark:bg-card w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl space-y-6"
             >
                <div className="flex justify-between items-center">
                   <h3 className="text-xl font-black">New Reward Item</h3>
                   <button onClick={() => setShowAddReward(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
                      <XCircle className="w-5 h-5 text-rum-600" />
                   </button>
                </div>

                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-rum-600 uppercase tracking-widest">Name</label>
                      <input 
                        type="text" 
                        value={newReward.name}
                        onChange={e => setNewReward(r => ({ ...r, name: e.target.value }))}
                        className="w-full h-12 bg-muted/50 dark:bg-border border-none rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                        placeholder="e.g. 1hr Gaming Time"
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-rum-600 uppercase tracking-widest">Token Cost</label>
                         <input 
                           type="number" 
                           value={newReward.tokenCost}
                           onChange={e => setNewReward(r => ({ ...r, tokenCost: parseInt(e.target.value) }))}
                           className="w-full h-12 bg-muted/50 dark:bg-border border-none rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-rum-600 uppercase tracking-widest">Category</label>
                         <select 
                           value={newReward.category}
                           onChange={e => setNewReward(r => ({ ...r, category: e.target.value as any }))}
                           className="w-full h-12 bg-muted/50 dark:bg-border border-none rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                         >
                            <option value="custom">Custom</option>
                            <option value="screen-time">Screen Time</option>
                            <option value="subscription">Subscription</option>
                            <option value="learning-tool">Learning</option>
                         </select>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={handleAddReward}
                  className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl"
                >
                  Confirm Reward
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};









