"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useUserStats } from "@/hooks/useUserStats";
import { useUser } from "@clerk/nextjs";
import {
  Moon,
  Sun,
  Bell,
  Mail,
  User,
  Globe,
  Save,
  Loader,
  CheckCircle2,
  Camera,
  RotateCcw,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

// ─── Sub-components ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{title}</h2>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {children} section
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { profile, loading, updateUserProfile } = useUserStats();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for settings (persistence to DB)
  const [settings, setSettings] = useState({
    theme: "light" as "light" | "dark",
    timezone: "UTC",
    emailNotifications: true,
    dailyDigest: false,
  });

  // Local state for Clerk identity
  const [identity, setIdentity] = useState({
    firstName: "",
    lastName: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [originalSettings, setOriginalSettings] = useState(settings);
  const [originalIdentity, setOriginalIdentity] = useState(identity);

  const isAnyDirty = JSON.stringify(settings) !== JSON.stringify(originalSettings) || 
                    JSON.stringify(identity) !== JSON.stringify(originalIdentity);

  useEffect(() => {
    if (profile) {
      const loaded = {
        theme: profile.preferences?.theme || "light",
        timezone: profile.timezone || "UTC",
        emailNotifications: profile.preferences?.emailNotifications ?? true,
        dailyDigest: profile.preferences?.dailyDigest ?? false,
      };
      setSettings(loaded);
      setOriginalSettings(loaded);
    }
  }, [profile]);

  useEffect(() => {
    if (clerkLoaded && clerkUser) {
      const loaded = {
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
      };
      setIdentity(loaded);
      setOriginalIdentity(loaded);
    }
  }, [clerkLoaded, clerkUser]);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const promises = [];
      if (JSON.stringify(identity) !== JSON.stringify(originalIdentity) && clerkUser) {
        promises.push(clerkUser.update({
          firstName: identity.firstName,
          lastName: identity.lastName,
        }));
      }
      if (JSON.stringify(settings) !== JSON.stringify(originalSettings)) {
        promises.push(updateUserProfile({
          timezone: settings.timezone,
          preferences: {
            theme: settings.theme,
            emailNotifications: settings.emailNotifications,
            dailyDigest: settings.dailyDigest,
          }
        }));
      }
      await Promise.all(promises);
      setOriginalSettings(settings);
      setOriginalIdentity(identity);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Save failure:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clerkUser) return;
    setIsUploadingPhoto(true);
    try {
      await clerkUser.setProfileImage({ file });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Photo upload failure:", err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (loading || !clerkLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-12">
      <div className="max-w-2xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Settings</h1>
            <p className="text-slate-500 font-medium">Manage your profile and preferences.</p>
          </div>
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10" } }} />
        </div>

        <div className="space-y-8">
          
          {/* Profile Section */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Profile</h2>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 relative">
                    {clerkUser?.imageUrl ? (
                      <img src={clerkUser.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-400" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUploadingPhoto ? <Loader className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">First Name</label>
                    <input 
                      type="text" 
                      value={identity.firstName}
                      onChange={(e) => setIdentity({...identity, firstName: e.target.value})}
                      className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Last Name</label>
                    <input 
                      type="text" 
                      value={identity.lastName}
                      onChange={(e) => setIdentity({...identity, lastName: e.target.value})}
                      className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Workspace</h2>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <Sun className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-sm dark:text-white">Theme</p>
                    <p className="text-xs text-slate-500">Choose your visual mode.</p>
                  </div>
                </div>
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button 
                    onClick={() => setSettings({...settings, theme: "light"})}
                    className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", settings.theme === "light" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500")}
                  >
                    Light
                  </button>
                  <button 
                    onClick={() => setSettings({...settings, theme: "dark"})}
                    className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", settings.theme === "dark" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500")}
                  >
                    Dark
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <Globe className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-sm dark:text-white">Timezone</p>
                    <p className="text-xs text-slate-500">Set your local temporal context.</p>
                  </div>
                </div>
                <select 
                  value={settings.timezone}
                  onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                  className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 font-bold text-xs dark:text-white outline-none cursor-pointer"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">EST</option>
                  <option value="CST">CST</option>
                  <option value="IST">IST</option>
                  <option value="PST">PST</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Notifications</h2>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { id: "emailNotifications" as const, icon: Mail, label: "Email Alerts", desc: "Receive real-time task notifications.", value: settings.emailNotifications },
                { id: "dailyDigest" as const, icon: Bell, label: "Daily Summary", desc: "Get a condensed activity report.", value: settings.dailyDigest },
              ].map((item) => (
                <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      <item.icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="font-bold text-sm dark:text-white">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, [item.id]: !item.value})}
                    className={cn("w-10 h-5 rounded-full relative transition-colors duration-200", item.value ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700")}
                  >
                    <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200", item.value ? "left-6" : "left-1")} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Updated
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button 
              disabled={!isAnyDirty || isSaving}
              onClick={() => {
                setSettings(originalSettings);
                setIdentity(originalIdentity);
              }}
              className="px-4 py-2 text-slate-400 hover:text-slate-600 disabled:opacity-0 transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Discard
            </button>
            <button 
              disabled={!isAnyDirty || isSaving}
              onClick={handleSaveAll}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 dark:shadow-none flex items-center gap-2"
            >
              {isSaving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {isSaving ? "Syncing..." : "Save Changes"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
