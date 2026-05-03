"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedApiClient } from "@/lib/api";
import { Cpu, Plus, Trash2, Loader2, AlertCircle, Link, Check } from "lucide-react";
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
  
  // Pairing Flow State
  const [isPairingMode, setIsPairingMode] = useState(false);
  const [pairingCode, setPairingCode] = useState("");
  const [isPairing, setIsPairing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  const handlePairSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pairingCode || pairingCode.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }
    
    setIsPairing(true);
    setError(null);
    setSuccessMsg(null);
    
    try {
      const token = await getToken();
      const client = await createAuthenticatedApiClient(token || "");
      const res = await client.post("/api/user/device/pair", { code: pairingCode });
      
      if (res.data.success) {
        setSuccessMsg(res.data.message || "Device successfully paired!");
        setIsPairingMode(false);
        setPairingCode("");
        fetchDevices();
      } else {
        setError(res.data.error || "Pairing failed. Try again.");
      }
    } catch (err: any) {
      console.error("Failed to pair device:", err);
      setError(err.response?.data?.error || "Failed to pair device. Ensure the code is correct and the device is connected to WiFi.");
    } finally {
      setIsPairing(false);
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

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-rum-600">Hardware Devices</h3>
      <div className="bg-background p-8 rounded-lg border border-border space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-sm">Active Hardware</p>
            <p className="text-xs text-rum-600">Manage your ESP32 Focus Hubs and other hardware.</p>
          </div>
          {!isPairingMode && (
            <button
              onClick={() => {
                setIsPairingMode(true);
                setError(null);
                setSuccessMsg(null);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-primary/90"
            >
              <Plus className="w-3.5 h-3.5" />
              Pair New Device
            </button>
          )}
        </div>

        {isPairingMode && (
          <form onSubmit={handlePairSubmit} className="bg-rum-50 dark:bg-rum-950/30 border border-rum-200 dark:border-rum-900/50 p-6 rounded-md space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Enter Pairing Code</label>
              <div className="text-xs text-rum-600 mb-3 space-y-1">
                <p>1. On your device, go to <b>WiFi & Identity</b>.</p>
                <p>2. Tap <b>Start Pairing</b> to generate a code.</p>
                <p>3. Enter the 6-digit code below (valid for 5 mins).</p>
              </div>
              <input
                type="text"
                maxLength={6}
                value={pairingCode}
                onChange={(e) => setPairingCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full bg-background border border-border rounded p-2 text-xl font-mono tracking-widest text-center focus:ring-2 focus:ring-primary outline-none"
                disabled={isPairing}
              />
            </div>
            
            {error && (
              <div className="flex items-start gap-2 text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded text-xs border border-red-200 dark:border-red-900/50">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPairingMode(false)}
                className="px-4 py-2 text-xs font-bold text-rum-600 hover:text-foreground transition-colors"
                disabled={isPairing}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPairing || pairingCode.length !== 6}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-bold transition-all disabled:opacity-50"
              >
                {isPairing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
                Link Device
              </button>
            </div>
          </form>
        )}

        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-md flex items-start gap-3">
            <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">{successMsg}</p>
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
                  title="Revoke access"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : !isPairingMode && (
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
