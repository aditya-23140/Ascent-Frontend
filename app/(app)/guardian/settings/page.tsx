"use client";

import { useState } from "react";
import { useGuardian } from "@/hooks/useGuardian";
import { UserPlus, Trash2, ArrowLeft, Loader2, Mail } from "lucide-react";
import Link from "next/link";

export default function GuardianSettingsPage() {
  const { data, addDependent, removeDependent, loading: guardianLoading } = useGuardian();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await addDependent(email);
    if (result.success) {
      setEmail("");
      alert("Invitation sent! The user needs to accept it from their dashboard.");
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
        <h1 className="text-3xl font-bold">Guardian Settings</h1>
      </div>

      {/* Invite Section */}
      <section className="bg-card border border-border rounded-xl p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" /> Invite Dependent
          </h2>
          <p className="text-rum-600 text-sm">Enter the email address of the user you want to manage.</p>
        </div>

        <form onSubmit={handleInvite} className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rum-600" />
            <input 
              type="email"
              placeholder="user@example.com" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium disabled:opacity-50 transition-colors flex items-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Invite
          </button>
        </form>
      </section>

      {/* Manage Dependents List */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-rum-600">Managed Dependents</h2>
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {guardianLoading ? (
            <div className="p-8 text-center text-rum-600">Loading...</div>
          ) : data?.students.length === 0 ? (
            <div className="p-8 text-center text-rum-600 italic">No dependents linked yet.</div>
          ) : (
            data?.students.map((student) => (
              <div key={student.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold">{student.name}</div>
                  <div className="text-xs text-rum-600">{student.email}</div>
                </div>
                <button 
                  className="flex items-center justify-center w-10 h-10 rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => {
                    if (confirm(`Are you sure you want to remove ${student.name}? They will lose access to the store features.`)) {
                      removeDependent(student.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
