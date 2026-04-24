"use client";

import { RewardsPanel } from "@/components/RewardsPanel";

export default function RewardsPage() {
  return (
    <div className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-foreground tracking-tight">Reward Exchange</h1>
        <p className="text-rum-600 font-medium mt-1">Convert your achievement tokens into tangible benefits.</p>
      </div>
      <RewardsPanel />
    </div>
  );
}








