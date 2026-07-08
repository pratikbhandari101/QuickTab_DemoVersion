"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Coffee, ArrowRight, Download, Monitor, ShieldCheck, 
  Sparkles, Terminal, Cpu, Network, Github, Zap, 
  RefreshCw, Layers, CheckCircle2, FileDown, AppWindow,
  ChevronRight, ArrowUpRight, Play, Server, Database
} from "lucide-react";

interface LandingPageProps {
  onLaunchPOS: () => void;
}

export default function LandingPage({ onLaunchPOS }: LandingPageProps) {
  const [selectedOS, setSelectedOS] = useState<"windows" | "mac" | "linux">("windows");
  const [copiedCode, setCopiedCode] = useState(false);
  const [githubRepo, setGithubRepo] = useState("");

  useEffect(() => {
    // Try to pre-fill Github repo if in URL or localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("tauri_github_repo");
      if (stored) setGithubRepo(stored);
    }
  }, []);

  const handleSaveRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("tauri_github_repo", githubRepo);
    }
  };

  const getDownloadLink = (os: "windows" | "mac" | "linux") => {
    if (!githubRepo) {
      return "https://github.com/your-username/your-repo/releases/latest";
    }
    // Clean up repo name (remove trailing slash or full URL if pasted)
    let cleanRepo = githubRepo.trim();
    if (cleanRepo.includes("github.com/")) {
      cleanRepo = cleanRepo.split("github.com/")[1];
    }
    
    switch (os) {
      case "windows":
        return `https://github.com/${cleanRepo}/releases/latest`;
      case "mac":
        return `https://github.com/${cleanRepo}/releases/latest`;
      case "linux":
        return `https://github.com/${cleanRepo}/releases/latest`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Decorative ambient background elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-xl shadow-lg shadow-amber-500/10">
              <Coffee className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Espress Café
              </span>
              <span className="text-[10px] block font-mono text-amber-500/80 font-bold tracking-widest uppercase">
                POS & LEDGER
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onLaunchPOS}
              className="group flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-all font-mono px-3 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10"
              id="nav-web-pos-btn"
            >
              Launch Web Client
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            
            <a 
              href="#download-section"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-white text-slate-950 px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg shadow-white/5 active:scale-95"
              id="nav-download-btn"
            >
              <Download className="w-3.5 h-3.5" />
              Download App
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-bold tracking-wide uppercase font-mono mb-8 shadow-inner shadow-amber-500/5"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            Tauri-Powered Native Application
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1] mb-6"
          >
            A Lightning Fast, <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 bg-clip-text text-transparent">
              Native Cafe POS System
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            Say goodbye to slow, bloated browser apps. Espress Café is compiled directly to native code for ultra-fast performance, offline-first reliability, and beautiful interactive restaurant floor layouts.
          </motion.p>

          {/* Call to Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <a 
              href="#download-section"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] text-sm"
              id="hero-download-btn"
            >
              <Download className="w-5 h-5" />
              Download Native Client
            </a>
            
            <button 
              onClick={onLaunchPOS}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold px-8 py-4 rounded-xl transition-all active:scale-[0.98] text-sm group"
              id="hero-web-pos-btn"
            >
              <Play className="w-4 h-4 text-amber-500 fill-amber-500" />
              Launch Web POS
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Mockup Showcase */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-6xl mx-auto relative px-4"
        >
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-3 shadow-2xl backdrop-blur shadow-amber-500/2">
            {/* Window bar controls */}
            <div className="flex items-center justify-between px-3 pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-slate-500">
                <Monitor className="w-3 h-3" />
                Cafe POS Desktop Client (Tauri v2 Shell)
              </div>
              <div className="w-12" /> {/* spacer */}
            </div>

            {/* App screen inside mockup */}
            <div className="bg-slate-950 rounded-xl p-4 aspect-[16/10] overflow-hidden relative flex flex-col justify-between border border-slate-950">
              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-900">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center">
                    <Coffee className="w-4 h-4 text-slate-950" />
                  </div>
                  <span className="font-bold text-xs text-white">Espress POS</span>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 rounded bg-slate-900" />
                  <div className="h-6 w-16 rounded bg-amber-500/10 border border-amber-500/20" />
                </div>
              </div>

              {/* Layout Content Grid */}
              <div className="grid grid-cols-12 gap-3 my-4 flex-1 items-stretch">
                {/* Tables / Floor Plan */}
                <div className="col-span-8 rounded-xl bg-slate-900/40 border border-slate-900 p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-3 w-20 rounded bg-slate-800" />
                    <div className="h-3 w-12 rounded bg-slate-800" />
                  </div>
                  
                  {/* Mock Floor Circles and Squares */}
                  <div className="grid grid-cols-4 gap-3 flex-1 items-center justify-items-center py-4">
                    <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center bg-slate-950/50">
                      <span className="text-[10px] font-mono text-slate-600 font-bold">Bar 1</span>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-amber-500 flex items-center justify-center bg-amber-500/10 shadow-lg shadow-amber-500/5 animate-pulse">
                      <span className="text-[10px] font-mono text-amber-500 font-bold">Bar 2</span>
                    </div>
                    <div className="w-12 h-12 rounded-lg border-2 border-emerald-500 flex items-center justify-center bg-emerald-500/10">
                      <span className="text-[10px] font-mono text-emerald-500 font-bold">Tab 4</span>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center bg-slate-950/50">
                      <span className="text-[10px] font-mono text-slate-600 font-bold">Bar 3</span>
                    </div>
                    <div className="w-12 h-12 rounded-lg border-2 border-slate-800 flex items-center justify-center bg-slate-950/50">
                      <span className="text-[10px] font-mono text-slate-600 font-bold">Tab 5</span>
                    </div>
                    <div className="w-14 h-12 rounded-lg border-2 border-amber-500 flex items-center justify-center bg-amber-500/10">
                      <span className="text-[10px] font-mono text-amber-500 font-bold">Tab 6</span>
                    </div>
                    <div className="w-12 h-12 rounded-lg border-2 border-slate-800 flex items-center justify-center bg-slate-950/50">
                      <span className="text-[10px] font-mono text-slate-600 font-bold">Nook A</span>
                    </div>
                    <div className="w-12 h-12 rounded-lg border-2 border-slate-800 flex items-center justify-center bg-slate-950/50">
                      <span className="text-[10px] font-mono text-slate-600 font-bold">Nook B</span>
                    </div>
                  </div>
                  
                  <div className="h-2 w-32 rounded bg-slate-900 mt-2" />
                </div>

                {/* Right Receipt / Billing Panel */}
                <div className="col-span-4 rounded-xl bg-slate-900/60 border border-slate-900 p-3 flex flex-col justify-between">
                  <div>
                    <div className="h-3 w-16 rounded bg-slate-800 mb-2" />
                    <div className="h-2 w-full rounded bg-slate-800 mb-1" />
                    <div className="h-2 w-3/4 rounded bg-slate-800 mb-3" />
                    <hr className="border-slate-800 my-2" />
                    <div className="space-y-1.5">
                      <div className="flex justify-between"><div className="h-2.5 w-12 rounded bg-slate-800" /><div className="h-2.5 w-6 rounded bg-slate-800" /></div>
                      <div className="flex justify-between"><div className="h-2.5 w-16 rounded bg-slate-800" /><div className="h-2.5 w-6 rounded bg-slate-800" /></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between"><div className="h-3 w-10 rounded bg-slate-800" /><div className="h-3 w-8 rounded bg-slate-700" /></div>
                    <div className="h-7 w-full rounded bg-amber-500/20 border border-amber-500/30" />
                  </div>
                </div>
              </div>

              {/* Footer status */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-mono text-slate-500 font-bold">DATABASE CONNECTED (FIRESTORE)</span>
                </div>
                <div className="h-2 w-24 rounded bg-slate-900" />
              </div>
            </div>
            
            {/* Real Launch Button overlapping on center */}
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <button 
                onClick={onLaunchPOS}
                className="flex items-center gap-3 bg-white text-slate-950 font-bold px-6 py-3 rounded-xl shadow-2xl hover:scale-105 active:scale-95 transition-all text-xs tracking-wide uppercase font-mono"
                id="interactive-launch-pos-btn"
              >
                <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                Launch Interactive Demo
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-24 px-6 relative bg-slate-900/20 border-y border-slate-900/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
              Engineered Specially for Modern Cafés
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              We ditched heavy browser layers to build an application focusing on physical reliability, memory security, and speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="md:col-span-2 bg-gradient-to-br from-slate-900/80 to-slate-950 border border-slate-900 p-8 rounded-2xl flex flex-col justify-between group hover:border-slate-800 transition-all">
              <div className="mb-8">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 w-fit rounded-xl text-amber-400 mb-6">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Rust-Hardened Memory & Speed</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  With Tauri, the backend is compiled into high-performance Rust machine code. Memory is safe, execution is instant, and energy/battery drainage on laptop tablets is reduced by up to 85% compared to typical Electron wrappers.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-amber-500 font-bold font-mono group-hover:text-amber-400 transition-colors">
                <span>0MB Node.js runtime overhead</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-950 border border-slate-900 p-8 rounded-2xl flex flex-col justify-between group hover:border-slate-800 transition-all">
              <div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 w-fit rounded-xl text-amber-400 mb-6">
                  <Network className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Hybrid Persistence</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  Connects seamlessly to your cloud Firestore database for absolute real-time table sync across multiple tablet stations.
                </p>
              </div>
              <div className="h-px bg-slate-900 my-6" />
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Encrypted secure channels
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-950 border border-slate-900 p-8 rounded-2xl flex flex-col justify-between group hover:border-slate-800 transition-all">
              <div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 w-fit rounded-xl text-amber-400 mb-6">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Interactive Floor Map</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  Drag, drop, resize, and custom map out your physical cafe tables, bars, or outdoor garden areas directly in the native client.
                </p>
              </div>
              <div className="h-px bg-slate-900 my-6" />
              <div className="text-xs font-semibold text-slate-500">
                Full physical modeling support
              </div>
            </div>

            {/* Card 4 */}
            <div className="md:col-span-2 bg-gradient-to-br from-slate-900/80 to-slate-950 border border-slate-900 p-8 rounded-2xl flex flex-col justify-between group hover:border-slate-800 transition-all">
              <div className="mb-6">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 w-fit rounded-xl text-amber-400 mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Integrated Credit Ledger</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  Keep tabs on premium regular customers and business accounts. Enforce strict tab limits, view payment logs, and trigger warning notifications directly in the workflow.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-amber-500 font-bold font-mono group-hover:text-amber-400 transition-colors">
                <span>Integrated customer search</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GitHub Automation & Pipeline Section */}
      <section className="py-24 px-6 relative overflow-hidden bg-slate-950 border-b border-slate-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-500 font-bold font-mono uppercase tracking-wider mb-4">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              CI/CD Automation Configured
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
              Zero-Install Build & Release System
            </h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
              You don&apos;t need complex build compilers, Rust environments, or SDK environments installed on your personal laptop. We have configured a complete **GitHub Actions workflow pipeline** inside your codebase!
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-emerald-500/10 p-1 rounded border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Trigger Builds in One Click</h4>
                  <p className="text-slate-400 text-xs mt-0.5">Simply push a tag like `v0.1.0` or trigger the workflow manually directly on GitHub.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-emerald-500/10 p-1 rounded border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Multi-OS Build Matrix</h4>
                  <p className="text-slate-400 text-xs mt-0.5">GitHub compiles macOS (.dmg/.app), Windows (.msi/.exe), and Linux (.deb) simultaneously in the cloud.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-emerald-500/10 p-1 rounded border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Auto Draft Release</h4>
                  <p className="text-slate-400 text-xs mt-0.5">Build outputs are automatically wrapped and attached to a drafted Release on GitHub, ready for download!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 font-mono text-xs text-slate-300 relative shadow-2xl">
              {/* Card Title bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-slate-400 text-[11px]">.github/workflows/release.yml</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  Fully Verified
                </span>
              </div>

              <div className="space-y-4 overflow-x-auto select-all max-h-[280px] text-[11px] leading-relaxed pr-2">
                <div>
                  <span className="text-amber-500 font-semibold">name</span>: Release
                </div>
                <div>
                  <span className="text-amber-500 font-semibold">on</span>:
                  <div className="pl-4"><span className="text-amber-500 font-semibold">push</span>:</div>
                  <div className="pl-8"><span className="text-amber-500 font-semibold">tags</span>: [ &apos;v*&apos; ]</div>
                  <div className="pl-4"><span className="text-amber-500 font-semibold">workflow_dispatch</span>: <span className="text-slate-500"># Manual button</span></div>
                </div>
                <div>
                  <span className="text-amber-500 font-semibold">jobs</span>:
                  <div className="pl-4"><span className="text-amber-500 font-semibold">publish</span>:</div>
                  <div className="pl-8"><span className="text-amber-500 font-semibold">runs-on</span>: ${'{'}{'{'} matrix.platform {'}'}{'}'}</div>
                  <div className="pl-8"><span className="text-amber-500 font-semibold">strategy</span>:</div>
                  <div className="pl-12"><span className="text-amber-500 font-semibold">matrix</span>:</div>
                  <div className="pl-16"><span className="text-amber-500 font-semibold">platform</span>: [macos-latest, windows-latest, ubuntu-22.04]</div>
                </div>
                <div>
                  <span className="text-amber-500 font-semibold">steps</span>:
                  <div className="pl-4">- <span className="text-amber-500 font-semibold">uses</span>: actions/checkout@v4</div>
                  <div className="pl-4">- <span className="text-amber-500 font-semibold">uses</span>: tauri-apps/tauri-action@v0</div>
                  <div className="pl-8"><span className="text-amber-500 font-semibold">env</span>:</div>
                  <div className="pl-12">GITHUB_TOKEN: ${'{'}{'{'} secrets.GITHUB_TOKEN {'}'}{'}'}</div>
                  <div className="pl-12">TAURI_BUILD: true</div>
                </div>
              </div>

              {/* Configure release links block */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                <h4 className="text-xs font-bold font-sans text-white mb-2">Connect Your Repository to Dynamic Downloads</h4>
                <form onSubmit={handleSaveRepo} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. github-username/repo-name" 
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <button 
                    type="submit" 
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg font-bold text-xs font-sans transition-colors active:scale-95"
                  >
                    Save
                  </button>
                </form>
                <p className="text-[10px] text-slate-500 font-sans mt-2">
                  Saving your repo path automatically wires the landing page download links directly to your real GitHub Releases downloads!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download-section" className="py-24 px-6 relative overflow-hidden bg-slate-900/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Download the Client Installer
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-12">
            Choose your operating system. Once downloaded, complete the standard installation steps to launch the native POS.
          </p>

          {/* Platform selectors */}
          <div className="flex justify-center gap-3 mb-10">
            <button 
              onClick={() => setSelectedOS("windows")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold font-mono transition-all border ${
                selectedOS === "windows" 
                  ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow-inner" 
                  : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Monitor className="w-4 h-4" />
              Windows
            </button>
            <button 
              onClick={() => setSelectedOS("mac")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold font-mono transition-all border ${
                selectedOS === "mac" 
                  ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow-inner" 
                  : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <AppWindow className="w-4 h-4" />
              macOS
            </button>
            <button 
              onClick={() => setSelectedOS("linux")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold font-mono transition-all border ${
                selectedOS === "linux" 
                  ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow-inner" 
                  : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Terminal className="w-4 h-4" />
              Linux
            </button>
          </div>

          {/* Download Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-lg mx-auto shadow-2xl relative">
            <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-amber-500/50 font-bold uppercase tracking-widest">
              v0.1.0 Stable
            </div>

            <AnimatePresence mode="wait">
              {selectedOS === "windows" && (
                <motion.div 
                  key="win"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex justify-center"><FileDown className="w-12 h-12 text-amber-400" /></div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Cafe POS for Windows</h3>
                    <p className="text-slate-400 text-xs mt-1">Supports Windows 10 & 11 (x64 / ARM64)</p>
                  </div>
                  <div className="pt-2">
                    <a 
                      href={getDownloadLink("windows")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/10 font-mono text-xs tracking-wider uppercase"
                      id="windows-download-link"
                    >
                      <Download className="w-4 h-4" />
                      Get Windows MSI Installer
                    </a>
                    <p className="text-[10px] text-slate-500 font-medium mt-3">
                      Includes auto-updater support to keep your software clean and up-to-date.
                    </p>
                  </div>
                </motion.div>
              )}

              {selectedOS === "mac" && (
                <motion.div 
                  key="mac"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex justify-center"><FileDown className="w-12 h-12 text-amber-400" /></div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Cafe POS for macOS</h3>
                    <p className="text-slate-400 text-xs mt-1">Universal DMG (Intel & Apple Silicon M1/M2/M3)</p>
                  </div>
                  <div className="pt-2">
                    <a 
                      href={getDownloadLink("mac")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/10 font-mono text-xs tracking-wider uppercase"
                      id="mac-download-link"
                    >
                      <Download className="w-4 h-4" />
                      Get macOS DMG Package
                    </a>
                    <p className="text-[10px] text-slate-500 font-medium mt-3">
                      Drag-and-drop installer. Gatekeeper verified compilation.
                    </p>
                  </div>
                </motion.div>
              )}

              {selectedOS === "linux" && (
                <motion.div 
                  key="lin"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex justify-center"><FileDown className="w-12 h-12 text-amber-400" /></div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Cafe POS for Linux</h3>
                    <p className="text-slate-400 text-xs mt-1">Supports Ubuntu, Debian, Arch (amd64 / x86_64)</p>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <a 
                      href={getDownloadLink("linux")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all font-mono text-xs"
                      id="linux-deb-download-link"
                    >
                      Download .DEB
                    </a>
                    <a 
                      href={getDownloadLink("linux")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition-all border border-slate-700 font-mono text-xs"
                      id="linux-appimage-download-link"
                    >
                      Download .AppImage
                    </a>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-3">
                    Native binary requiring zero external engine installations.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Simplistic 3-Step Setup Guide */}
      <section className="py-20 px-6 max-w-5xl mx-auto border-t border-slate-900">
        <h3 className="text-xl font-extrabold text-white text-center mb-12">Getting Started in 3 Simple Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="font-mono text-xs font-bold text-amber-500/60 bg-amber-500/5 border border-amber-500/10 px-3 py-1 rounded-full w-fit">
              STEP 01
            </div>
            <h4 className="text-sm font-bold text-white">Download the App</h4>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Select your OS on our download drawer and grab the native installer file for your system.
            </p>
          </div>
          <div className="space-y-3">
            <div className="font-mono text-xs font-bold text-amber-500/60 bg-amber-500/5 border border-amber-500/10 px-3 py-1 rounded-full w-fit">
              STEP 02
            </div>
            <h4 className="text-sm font-bold text-white">Run Installer</h4>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Open the downloaded package and let the quick automated installation wizard complete.
            </p>
          </div>
          <div className="space-y-3">
            <div className="font-mono text-xs font-bold text-amber-500/60 bg-amber-500/5 border border-amber-500/10 px-3 py-1 rounded-full w-fit">
              STEP 03
            </div>
            <h4 className="text-sm font-bold text-white">Log in and Work</h4>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Log in with your existing credentials and start taking customer orders immediately!
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 bg-slate-950 px-6 font-mono text-[10px] text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-500" />
            <span>© 2026 Espress Café POS System. All Rights Reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">GitHub Actions Spec</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Tauri Security Architecture</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Support Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
