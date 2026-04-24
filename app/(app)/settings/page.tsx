"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUserStats } from "@/hooks/useUserStats";
import { useUser } from "@clerk/nextjs";
import { UserButton, useClerk } from "@clerk/nextjs";
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
  Shield,
  Zap,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
  const { profile, loading, updateUserProfile } = useUserStats();
  const { setTheme } = useTheme();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerk();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState({
    theme: "light" as "light" | "dark",
    timezone: "UTC",
    emailNotifications: true,
    dailyDigest: false,
    dailySpoonBudget: 12,
    hyperFocusDuration: 45
  });

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
        theme: (profile.preferences as any)?.theme || "light",
        timezone: profile.timezone || "UTC",
        emailNotifications: (profile.preferences as any)?.emailNotifications ?? true,
        dailyDigest: (profile.preferences as any)?.dailyDigest ?? false,
        dailySpoonBudget: profile.dailySpoonBudget || 12,
        hyperFocusDuration: profile.hyperFocusDuration || 45
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
          dailySpoonBudget: settings.dailySpoonBudget,
          hyperFocusDuration: settings.hyperFocusDuration,
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
    return <div className="p-10 text-center">Loading settings...</div>;
  }

  return (
    <div className="p-6 md:p-10 space-y-12 pb-32">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-rum-600">Manage your profile and app settings.</p>
        </div>
        <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 rounded-md" } }} />
      </div>

      <div className="space-y-12">
        {/* Profile */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-rum-600">Profile</h3>
          <div className="bg-background p-8 rounded-lg border border-border">
             <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-20 h-20 rounded-md bg-rum-100 dark:bg-rum-900 flex items-center justify-center overflow-hidden relative">
                    {clerkUser?.imageUrl ? (
                      <img src={clerkUser.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-rum-600" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUploadingPhoto ? <Loader className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-rum-600 uppercase">First Name</label>
                    <input 
                      type="text" 
                      value={identity.firstName}
                      onChange={(e) => setIdentity({...identity, firstName: e.target.value})}
                      className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-primary" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-rum-600 uppercase">Last Name</label>
                    <input 
                      type="text" 
                      value={identity.lastName}
                      onChange={(e) => setIdentity({...identity, lastName: e.target.value})}
                      className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-primary" 
                    />
                  </div>
                </div>
              </div>
          </div>
        </div>

        {/* Role & Budget */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-rum-600">System</h3>
          <div className="bg-background p-8 rounded-lg border border-border space-y-8">

             <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">Daily Energy (Spoons)</p>
                  <p className="text-xs text-rum-600">Max energy units per day.</p>
                </div>
                <input 
                  type="number" 
                  value={settings.dailySpoonBudget}
                  onChange={(e) => setSettings({...settings, dailySpoonBudget: parseInt(e.target.value) || 12})}
                  className="w-20 h-10 px-3 bg-background border border-border rounded-md text-sm font-bold outline-none"
                />
             </div>

             <div className="flex items-center justify-between pt-8 border-t border-border">
                <div>
                  <p className="font-bold text-sm">HyperFocus Cap</p>
                  <p className="text-xs text-rum-600">Max overflow minutes before break.</p>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    value={settings.hyperFocusDuration}
                    onChange={(e) => setSettings({...settings, hyperFocusDuration: parseInt(e.target.value) || 45})}
                    className="w-20 h-10 px-3 bg-background border border-border rounded-md text-sm font-bold outline-none"
                  />
                  <span className="text-xs font-bold text-rum-600">MIN</span>
                </div>
             </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-rum-600">Workspace</h3>
          <div className="bg-background p-8 rounded-lg border border-border space-y-8">
             <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">Theme</p>
                  <p className="text-xs text-rum-600">Visual mode of the application.</p>
                </div>
                <div className="flex p-1 bg-rum-100 dark:bg-rum-900 rounded-md">
                  <button 
                    onClick={() => {
                      setSettings({...settings, theme: "light"});
                      setTheme("light");
                    }}
                    className={cn("px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all", settings.theme === "light" ? "bg-background shadow-sm text-primary" : "text-rum-600")}
                  >
                    Light
                  </button>
                  <button 
                    onClick={() => {
                      setSettings({...settings, theme: "dark"});
                      setTheme("dark");
                    }}
                    className={cn("px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all", settings.theme === "dark" ? "bg-background shadow-sm text-primary" : "text-rum-600")}
                  >
                    Dark
                  </button>
                </div>
             </div>

             <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">Timezone</p>
                  <p className="text-xs text-rum-600">Your local time for scheduling.</p>
                </div>
                <select 
                  value={settings.timezone}
                  onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                  className="bg-background border border-border rounded-md px-3 py-2 text-xs font-bold outline-none cursor-pointer"
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

        {/* Session */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-rum-600">Session</h3>
          <div className="bg-background p-8 rounded-lg border border-border">
             <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">Active Session</p>
                  <p className="text-xs text-rum-600">Securely sign out of your account.</p>
                </div>
                <button 
                  onClick={() => signOut({ redirectUrl: "/" })}
                  className="px-6 py-2 border border-destructive/20 text-destructive hover:bg-destructive/10 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-background/90 border-t border-border p-4 z-40 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                Settings saved.
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button 
              disabled={!isAnyDirty || isSaving}
              onClick={() => {
                setSettings(originalSettings);
                setIdentity(originalIdentity);
                setTheme(originalSettings.theme);
              }}
              className="px-4 py-2 text-rum-600 hover:text-rum-600 disabled:opacity-0 transition-all font-bold text-[10px] uppercase tracking-widest"
            >
              Discard
            </button>
            <button 
              disabled={!isAnyDirty || isSaving}
              onClick={handleSaveAll}
              className="px-8 py-2.5 bg-primary text-primary-foreground rounded-md font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}








