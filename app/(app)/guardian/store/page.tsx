"use client";

import { useState } from "react";
import { useGuardian } from "@/hooks/useGuardian";
import { Plus, Trash2, ShoppingBag, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function GuardianStorePage() {
  const { addRewardItem, loading: guardianLoading } = useGuardian();
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    tokenCost: 100,
    category: "screen-time" as const
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await addRewardItem(newItem);
    if (result.success) {
      setNewItem({ name: "", description: "", tokenCost: 100, category: "screen-time" });
      alert("Reward item added successfully!");
    } else {
      alert("Error: " + result.error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-10">
      <div className="flex items-center gap-4">
        <Link href="/guardian">
          <button className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-3xl font-bold">Store Settings</h1>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-2">Create New Reward</h2>
          <p className="text-rum-600 text-sm">Define items your dependents can buy with their earned points.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">Item Name</label>
            <input 
              placeholder="e.g. 1 Hour Video Games" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={newItem.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({...newItem, name: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Description (Optional)</label>
            <textarea 
              placeholder="Describe what they get..." 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={newItem.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewItem({...newItem, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Point Cost</label>
              <input 
                type="number" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newItem.tokenCost}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({...newItem, tokenCost: parseInt(e.target.value) || 0})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Category</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newItem.category}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewItem({...newItem, category: e.target.value as any})}
              >
                <option value="screen-time">Screen Time</option>
                <option value="subscription">Subscription</option>
                <option value="learning-tool">Learning Tool</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium disabled:opacity-50 transition-colors flex items-center justify-center" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Add Item to Store
          </button>
        </form>
      </div>

      <div className="text-center p-8 bg-muted/30 rounded-xl border border-dashed border-border">
        <div className="flex justify-center mb-4 text-rum-600">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <p className="text-sm text-rum-600">
          Tip: Balance the point costs with how many points they can earn per task to keep them motivated!
        </p>
      </div>
    </div>
  );
}
