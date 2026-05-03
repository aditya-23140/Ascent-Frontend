"use client";

import { motion } from "framer-motion";
import { useStudent } from "@/hooks/useStudent";
import { useUserStats } from "@/hooks/useUserStats";
import { 
  ShoppingBag, 
  Award, 
  ChevronRight, 
  Clock, 
  ShieldCheck,
  Star,
  Loader2
} from "lucide-react";

export default function StudentStorePage() {
  const { rewards, redeemReward, loading } = useStudent();
  const { stats, refreshStats } = useUserStats();

  const handleRedeem = async (rewardId: string) => {
    const result = await redeemReward(rewardId);
    if (result.success) {
      alert("Redemption request sent to your guardian!");
      refreshStats();
    } else {
      alert("Error: " + result.error);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-rum-600">Loading store...</div>;
  }

  return (
    <div className="p-6 md:p-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-primary/5 p-8 rounded-2xl border border-primary/10">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Reward Store</h1>
          <p className="text-rum-600 text-sm">Spend your hard-earned points on rewards set by your guardian.</p>
        </div>
        <div className="bg-card px-6 py-3 rounded-xl border border-border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-rum-600 uppercase font-bold">Your Balance</div>
            <div className="text-xl font-bold">{stats?.pointsEarned || 0} Points</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.length === 0 ? (
          <div className="col-span-full p-20 text-center bg-muted/30 rounded-2xl border border-dashed border-border">
            <div className="flex justify-center mb-4 text-rum-600">
              <ShoppingBag className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-bold mb-2">Store is Empty</h3>
            <p className="text-rum-600 max-w-xs mx-auto">Your guardian hasn&apos;t added any items to the store yet. Ask them to add some rewards!</p>
          </div>
        ) : (
          rewards.map((reward, i) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all group flex flex-col"
            >
              <div className="p-6 space-y-4 flex-1">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-muted rounded-lg text-rum-600">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                    {reward.category}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{reward.name}</h3>
                  <p className="text-sm text-rum-600 mt-1">{reward.description || "No description provided."}</p>
                </div>

                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Award className="w-4 h-4 text-primary" />
                  {reward.tokenCost} Points
                </div>
              </div>

              <div className="p-4 bg-muted/50 border-t border-border">
                <button 
                  className="flex items-center justify-between w-full h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium disabled:opacity-50 transition-colors group/btn" 
                  onClick={() => handleRedeem(reward.id)}
                  disabled={ (stats?.pointsEarned || 0) < reward.tokenCost }
                >
                  { (stats?.pointsEarned || 0) < reward.tokenCost ? "Insufficient Points" : "Redeem Now" }
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="p-6 bg-muted/30 rounded-xl border border-border flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-rum-600 shrink-0" />
        <div className="text-xs text-rum-600 leading-relaxed">
          <p className="font-bold mb-1">How it works:</p>
          Once you redeem a reward, your points are temporarily held and a request is sent to your guardian. If they approve, the points are deducted and you get your reward. If they reject, your points are returned to your balance.
        </div>
      </div>
    </div>
  );
}
