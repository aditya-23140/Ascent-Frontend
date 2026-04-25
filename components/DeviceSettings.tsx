"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedApiClient, API_ENDPOINTS } from "@/lib/api";
import { Cpu, Plus, Trash2, Key, Copy, Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Device {
  id: string;
  name: string;
  createdAt: string;
}

export function DeviceSettings() {
  const { getToken } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchDevices = async () => {
    try {
      const token = await getToken();
      const client = await createAuthenticatedApiClient(token || "");
      const res = await client.get("/api/user/devices");
      setDevices(res.data.data);
    } catch (err) {
      console.error("Failed to fetch devices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [getToken]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setNewToken(null);
    try {
      const token = await getToken();
      const client = await createAuthenticatedApiClient(token || "");
      const res = await client.post("/api/user/device", { name: "FocusOS Hub" });
      setNewToken(res.data.data.token);
      fetchDevices();
    } catch (err) {
      console.error("Failed to generate token:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this device? It will lose connection immediately.")) return;
    try {
      const token = await getToken();
      const client = await createAuthenticatedApiClient(token || "");
      await client.delete(`/api/user/device/${id}`);
      fetchDevices();
    } catch (err) {
      console.error("Failed to revoke device:", err);
    }
  };

  const copyToClipboard = () => {
    if (newToken) {
      navigator.clipboard.writeText(newToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-rum-600">Hardware Devices</h3>
      <div className="bg-background p-8 rounded-lg border border-border space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-sm">Active Hardware</p>
            <p className="text-xs text-rum-600">Manage your ESP32 Focus Hubs and other hardware.</p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Register Device
          </button>
        </div>

        {newToken && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-4 rounded-md space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Copy your new device token</p>
                <p className="text-xs text-amber-800 dark:text-amber-300">This token will only be shown ONCE. Enter it into your FocusOS device settings.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-background p-2 rounded border border-amber-200 dark:border-amber-800">
              <code className="flex-1 text-xs font-mono break-all px-2">{newToken}</code>
              <button 
                onClick={copyToClipboard}
                className="p-2 hover:bg-rum-100 dark:hover:bg-rum-900 rounded-md transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-rum-600" />}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-rum-300 mx-auto" />
            </div>
          ) : devices.length > 0 ? (
            devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 bg-rum-50 dark:bg-rum-950/50 rounded-md border border-border/50">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{device.name}</p>
                    <p className="text-[10px] text-rum-600 uppercase font-medium">Added {new Date(device.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRevoke(device.id)}
                  className="p-2 text-rum-400 hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : !newToken && (
            <div className="text-center py-10 border-2 border-dashed border-border rounded-md">
              <Cpu className="w-8 h-8 text-rum-200 mx-auto mb-3" />
              <p className="text-xs text-rum-600">No hardware devices registered yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
