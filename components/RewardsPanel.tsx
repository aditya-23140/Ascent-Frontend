"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { createAuthenticatedApiClient, handleApiError } from "@/lib/api";
import { 
  Gift, Timer, Layout, BookOpen, CheckCircle2, X, Loader, 
  Coins, Zap, Sparkles, ShoppingBag
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RewardItem {
  id: string;
  name: string;
  description?: string;
  tokenCost: number;
  category: 'screen-time' | 'subscription' | 'learning-tool' | 'custom';
}

interface TokenState {
  balance: number;
  lifetimeEarned: number;
}

export const RewardsPanel: React.FC = () => {
  const { getToken } = useAuth();
  const [tokens, setTokens] = useState<TokenState | null>(null);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const client = await createAuthenticatedApiClient(token || "");

      const [tokenRes, rewardRes] = await Promise.all([
        client.get<{ success: boolean; data: TokenState }>("/api/rewards/tokens"),
        client.get<{ success: boolean; data: RewardItem[] }>("/api/rewards/available")
      ]);

      setTokens(tokenRes.data.data);
      setRewards(rewardRes.data.data);
    } catch (err) {
      console.error("Failed to fetch rewards:", handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRedeem = async (rewardId: string) => {
    try {
      setRedeemingId(rewardId);
      const token = await getToken();
      const client = await createAuthenticatedApiClient(token || "");
      await client.post("/api/rewards/redeem", { rewardItemId: rewardId });
      setMessage({ type: 'success', text: 'Request sent to parent.' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: handleApiError(err) });
    } finally {
      setRedeemingId(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader className="animate-spin mx-auto mb-4" /> Polishing the store...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 p-4">
      {/* Token Header */}
      <div className="relative overflow-hidden bg-rum-900 text-white p-10 md:p-16 rounded-[3rem] shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-primary">
               <Sparkles size={12} /> Energy Wealth
            </div>
            <h2 className="text-6xl font-black tracking-tighter tabular-nums text-foreground">
              {tokens?.balance || 0} <span className="text-primary">Tokens</span>
            </h2>
            <p className="text-rum-600 font-medium text-lg">Your focus has value. Redeem your consistency.</p>
          </div>
          <div className="flex gap-8 bg-card/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl">
             <div className="text-center">
                <p className="text-[10px] text-rum-600 font-black uppercase tracking-widest mb-2">Lifetime Earned</p>
                <p className="text-3xl font-black">{tokens?.lifetimeEarned || 0}</p>
             </div>
             <div className="w-px bg-card/10" />
             <div className="text-center">
                <p className="text-[10px] text-rum-600 font-black uppercase tracking-widest mb-2">Market Status</p>
                <p className="text-3xl font-black text-emerald-400 flex items-center gap-2">OPEN <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /></p>
             </div>
          </div>
        </div>
        
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-rum-600/20 rounded-full blur-3xl" />
      </div>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={cn(
              "p-5 rounded-2xl border-2 text-sm font-black flex items-center gap-4 overflow-hidden",
              message.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-700"
            )}
          >
            {message.type === 'success' ? <CheckCircle2 className="shrink-0" /> : <X className="shrink-0" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="space-y-10">
        <div className="flex items-center justify-between">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-rum-600 flex items-center gap-3">
              <ShoppingBag size={14} /> Available Boutique
           </h3>
           <div className="h-px flex-1 mx-6 bg-border" />
        </div>
        
        {rewards.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-32 border-2 border-dashed border-border rounded-[3rem] text-center space-y-4"
          >
            <Gift className="w-12 h-12 text-rum-200 mx-auto" />
            <p className="text-rum-600 font-bold">The store is currently empty.</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-rum-400">Invite your parent to add rewards</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rewards.map((reward) => (
              <motion.div 
                whileHover={{ y: -8 }}
                key={reward.id} 
                className="group relative bg-card border border-border p-8 rounded-[2.5rem] flex flex-col justify-between shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all"
              >
                <div className="space-y-6">
                   <div className="flex justify-between items-start">
                      <div className="p-3 bg-muted rounded-2xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                         {reward.category === 'screen-time' && <Timer size={24} />}
                         {reward.category === 'subscription' && <Zap size={24} />}
                         {reward.category === 'learning-tool' && <BookOpen size={24} />}
                         {reward.category === 'custom' && <Gift size={24} />}
                      </div>
                      <div className="text-right">
                         <p className="text-2xl font-black tracking-tighter text-primary">{reward.tokenCost}T</p>
                      </div>
                   </div>
                   
                   <div className="space-y-2">
                      <h4 className="text-xl font-black leading-tight group-hover:text-primary transition-colors">{reward.name}</h4>
                      <p className="text-[10px] font-black text-rum-600 uppercase tracking-widest">{reward.category.replace('-', ' ')}</p>
                   </div>
                   
                   {reward.description && (
                     <p className="text-sm text-rum-600 leading-relaxed font-medium">
                        {reward.description}
                     </p>
                   )}
                </div>

                <div className="mt-10">
                   <button 
                     onClick={() => handleRedeem(reward.id)}
                     disabled={!!redeemingId || (tokens?.balance || 0) < reward.tokenCost}
                     className={cn(
                       "w-full h-14 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95",
                       (tokens?.balance || 0) >= reward.tokenCost
                         ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:opacity-90"
                         : "bg-muted text-rum-400 cursor-not-allowed border border-border"
                     )}
                   >
                     {redeemingId === reward.id ? "Processing..." : "Redeem Now"}
                   </button>
                </div>
                
                {/* Status indicator */}
                {(tokens?.balance || 0) < reward.tokenCost && (
                  <div className="absolute top-4 left-4">
                     <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-lg text-[8px] font-black uppercase tracking-tighter">
                        <Loader size={8} /> Insufficient Balance
                     </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};









