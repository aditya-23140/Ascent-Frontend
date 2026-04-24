"use client";

import Link from "next/link";
import { motion } from "framer-motion"
import { useAuth } from "@clerk/nextjs";
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  BarChart3,
  Target,
  Globe,
  Shield,
  Clock,
  Sparkles
} from "lucide-react";

/**
 * Landing/Home page - Professional Enterprise Design
 */
export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center"><span className="text-primary-foreground font-bold text-base tracking-tight">A</span>
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Ascent</h1>
          </div>

          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-rum-600 transition-all text-sm flex items-center gap-2"
              >
                Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="px-4 py-2 text-rum-900 dark:text-rum-800 font-semibold hover:text-foreground dark:hover:text-white transition-colors text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-5 py-2 rounded-xl bg-rum-900 dark:bg-background text-white dark:text-rum-200 font-semibold hover:bg-muted dark:hover:bg-border transition-all text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-32 overflow-hidden">
          {/* Background Decorative Blurs */}
          <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-0 -right-20 w-96 h-96 bg-primary/10 dark:bg-primary/5 rounded-full blur-[120px] -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-10"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-border/50 text-primary dark:text-rum-800 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Advanced Productivity Suite
              </div>

              <div>
                <h2 className="text-5xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight mb-8">
                  Redefining Focus for the <span className="text-primary bg-gradient-to-r from-primary to-rum-400 bg-clip-text text-transparent">Modern Professional</span>
                </h2>
                <p className="text-xl text-rum-900 dark:text-rum-800 leading-relaxed max-w-2xl">
                  Ascent delivers a distraction-free environment and AI-driven workflows designed to streamline your most complex tasks. Experience the next level of personal performance.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-5">
                <Link
                  href={isSignedIn ? "/dashboard" : "/sign-up"}
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-rum-600 transition-all shadow-xl shadow-primary/20 dark:shadow-none flex items-center justify-center gap-2"
                >
                  {isSignedIn ? "Go to Dashboard" : "Start For Free"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/focus"
                  className="px-8 py-4 border-2 border-border text-foreground rounded-2xl font-bold hover:bg-muted dark:hover:bg-card transition-all flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Explore Focus Timer
                </Link>
              </div>

              {/* Trusted by Labels */}
              <div className="pt-10">
                <p className="text-xs font-bold text-rum-800 dark:text-rum-800 uppercase tracking-[0.2em] mb-6">
                  Engineered For Excellence
                </p>
                <div className="flex flex-wrap gap-8 opacity-40 grayscale contrast-125">
                  <div className="text-xl font-black text-rum-800 tracking-tighter hover:grayscale-0 transition-all cursor-default">TECHCORE</div>
                  <div className="text-xl font-black text-rum-800 tracking-tighter hover:grayscale-0 transition-all cursor-default">GLOBALVOX</div>
                  <div className="text-xl font-black text-rum-800 tracking-tighter hover:grayscale-0 transition-all cursor-default">ZENITH SYS</div>
                  <div className="text-xl font-black text-rum-800 tracking-tighter hover:grayscale-0 transition-all cursor-default">AURORA</div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Polished Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 hidden lg:block"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [-2, -1, -2]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-rum-400 dark:from-primary/10 dark:to-primary/20 rounded-[3rem] -rotate-2 scale-105 blur-sm"
                />
                <div className="relative bg-background dark:bg-card rounded-[2.5rem] border border-border shadow-2xl p-10 overflow-hidden">
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="space-y-6">
                    <div className="h-4 bg-border dark:bg-muted rounded-full w-3/4" />
                    <div className="h-4 bg-border dark:bg-muted rounded-full w-full" />
                    <div className="h-4 bg-border dark:bg-muted rounded-full w-5/6" />
                    <div className="pt-4 grid grid-cols-2 gap-4">
                      <div className="h-24 bg-primary/10 rounded-3xl border border-border/50" />
                      <div className="h-24 bg-muted dark:bg-muted rounded-3xl border border-border" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Value Propositions */}
        <section className="bg-muted dark:bg-card/50 py-32 border-y border-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h3 className="text-3xl font-bold text-foreground tracking-tight">Focus on what matters most</h3>
              <p className="text-rum-900 dark:text-rum-800">Our suite of tools is designed to eliminate noise and empower your workflow.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "AI Task Orchestration",
                  desc: "Leverage Gemini-powered task decomposition to break complex projects into actionable steps.",
                  icon: BarChart3,
                },
                {
                  title: "Real-Time Syncing",
                  desc: "Universal synchronization across all devices ensures your focus is never interrupted.",
                  icon: Globe,
                },
                {
                  title: "Performance Analytics",
                  desc: "Track focus trends and productivity metrics with deep-dive analytical dashboards.",
                  icon: Target,
                }
              ].map((feature, idx) => (
                <div key={idx} className="bg-background dark:bg-card p-8 rounded-3xl shadow-sm border border-border hover:border-primary transition-colors group">
                  <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center mb-6 text-primary dark:text-rum-800 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-3 tracking-tight">{feature.title}</h4>
                  <p className="text-rum-900 dark:text-rum-800 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features List Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="aspect-square bg-rum-900 rounded-3xl p-6 flex flex-col justify-end text-white">
                    <Zap className="w-8 h-8 mb-4 text-primary" />
                    <p className="font-bold text-lg leading-tight tracking-tight">Instant Response</p>
                  </div>
                  <div className="aspect-square bg-primary/10 rounded-3xl p-6" />
                </div>
                <div className="space-y-4">
                  <div className="aspect-square bg-muted dark:bg-muted rounded-3xl p-6" />
                  <div className="aspect-square bg-border dark:bg-muted rounded-3xl p-6 flex flex-col justify-end">
                    <Shield className="w-8 h-8 mb-4 text-foreground" />
                    <p className="font-bold text-lg leading-tight tracking-tight text-foreground">Secure Data</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-8">
              <h3 className="text-4xl font-bold text-foreground tracking-tight leading-tight">
                Built for the speed of modern business
              </h3>
              <div className="space-y-6">
                {[
                  "Intelligent subtask generation via Gemini",
                  "Cross-platform Socket.IO integration",
                  "Advanced focus gamification loops",
                  "Customizable Pomodoro break patterns"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                    <span className="font-semibold text-foreground dark:text-rum-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-rum-900 dark:bg-black text-rum-300 py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1 space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm tracking-tight">A</span>
                </div>
                <h1 className="text-lg font-bold text-white tracking-tight">Ascent</h1>
              </div>
              <p className="text-sm leading-relaxed max-w-xs text-rum-400">
                Empowering teams and individuals to achieve peak performance through focused engineering.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-[10px]">Platform</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/focus" className="hover:text-white transition-colors">Focus Suite</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-[10px]">Corporate</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Service Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-[10px]">Ecosystem</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Twitter (X)</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GitHub Repository</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium uppercase tracking-[0.1em] text-rum-500">
            <p>&copy; 2026 Ascent Corporate. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white">Status</a>
              <a href="#" className="hover:text-white">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}















