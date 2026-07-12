"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Laptop,
  ArrowRightLeft,
  CalendarDays,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle,
  Play,
  User,
  Clock,
  Layers,
} from "lucide-react";
import { cn } from "@/utils/cn";

export default function Home() {



  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-indigo-500/10 overflow-x-hidden relative">
      {/* Background Grid Pattern (Modern Light Theme Style) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Ambient Radial Lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />


      {/* Floating Center Pill Header (Variant Style) */}
      <header className="sticky top-6 z-50 w-full flex justify-center px-4">
        <div className="flex items-center justify-between gap-6 pl-2 pr-2 py-1.5 rounded-full border border-zinc-200/80 bg-white/70 backdrop-blur-md shadow-sm max-w-sm w-full">
          {/* Logo icon inside a small circle */}
          <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Laptop className="h-3 w-3" />
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-4 text-[11px] font-bold text-zinc-500">
            <Link href="/login" className="hover:text-zinc-950 transition-colors">Sign In</Link>
          </nav>

          {/* Deploy Now Button */}
          <Link href="/signup">
            <button className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold tracking-wide uppercase text-white shadow-sm transition-all cursor-pointer">
              Deploy Now
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section (Variant Style) */}
      <section className="max-w-7xl mx-auto px-6 pt-28 pb-16 text-center relative z-10">

        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-950 leading-[0.88] max-w-5xl mx-auto mb-6 uppercase font-sans">
          Infrastructure <br />
          <span className="text-transparent [-webkit-text-stroke:1.5px_#09090b] [text-stroke:1.5px_#09090b]">
            As Design.
          </span>
        </h1>

        <p className="text-xs md:text-sm text-zinc-650 max-w-md mx-auto mb-10 leading-relaxed font-medium">
          A high-performance cloud orchestrator built for those who value precision. Scale with elegance, deploy with intent.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href="/signup">
            <button className="w-full sm:w-auto h-12 px-6 rounded-xl bg-zinc-900 text-white font-semibold hover:bg-zinc-800 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm">
              Launch Workspace
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* Telemetry and Resource Distribution Dashboards (Variant Style) */}
      <section className="max-w-7xl mx-auto px-6 mb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Card: Resource Distribution */}
          <div className="bg-white border border-zinc-200/80 rounded-[32px] p-8 shadow-sm flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-450 font-mono">Resource Distribution</span>
                {/* Simulated status dots */}
                <div className="flex gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
                </div>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-zinc-950 font-mono">
                08:42:12 UTC
              </h3>
            </div>

            {/* Department stats */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                  <span>Engineering Dept (Allocated)</span>
                  <span className="text-indigo-600 font-mono">88.2%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '88.2%' }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                  <span>Sales & Marketing (Allocated)</span>
                  <span className="text-indigo-650 font-mono">42.9%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '42.9%' }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                  <span>Operations & Admin (Allocated)</span>
                  <span className="text-indigo-650 font-mono">12.1%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '12.1%' }} />
                </div>
              </div>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-zinc-100">
              <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-2xl">
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Total Assets</span>
                <span className="text-lg font-bold text-zinc-950 font-mono">1,024</span>
              </div>
              <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-2xl">
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Bookable</span>
                <span className="text-lg font-bold text-indigo-600 font-mono">84 Active</span>
              </div>
              <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-2xl">
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Audits Done</span>
                <span className="text-lg font-bold text-zinc-950 font-mono">3 Cycles</span>
              </div>
            </div>
          </div>

          {/* Right Card: Live Telemetry */}
          <div className="bg-white border border-zinc-200/80 rounded-[32px] p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-450 font-mono">Live Telemetry</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-[9px] font-extrabold uppercase text-emerald-600 border border-emerald-100 select-none">
                <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>

            {/* Simulated Live logs */}
            <div className="space-y-4 font-mono text-[11px] leading-relaxed flex-1">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-zinc-400">
                  <span>16:57:01</span>
                  <span className="font-bold text-zinc-700">POST /api/v1/allocations</span>
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-1 rounded">200 OK</span>
                </div>
                <p className="text-zinc-500 pl-4">Priya Shah checked out Laptop AF-0114 (Engineering)</p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-zinc-400">
                  <span>16:57:05</span>
                  <span className="font-bold text-zinc-700">POST /api/v1/bookings</span>
                  <span className="text-rose-600 font-bold bg-rose-50 px-1 rounded">409 Conflict</span>
                </div>
                <p className="text-zinc-500 pl-4">Collision: Room B2 booked 09:00-10:00 (overlap rejected)</p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-zinc-400">
                  <span>16:57:09</span>
                  <span className="font-bold text-zinc-700">PATCH /api/v1/maintenance/resolve</span>
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-1 rounded">200 OK</span>
                </div>
                <p className="text-zinc-500 pl-4">Server Rack 4B transitioned from MAINTENANCE to AVAILABLE</p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-zinc-400">
                  <span>16:57:12</span>
                  <span className="font-bold text-zinc-700">POST /api/v1/audits/close</span>
                  <span className="text-indigo-600 font-bold bg-indigo-50 px-1 rounded">200 OK</span>
                </div>
                <p className="text-zinc-500 pl-4">Audit Cycle closed. Missing assets auto-marked as LOST</p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-zinc-400">
                  <span>16:57:15</span>
                  <span className="font-bold text-zinc-700">POST /api/v1/transfers</span>
                  <span className="text-indigo-605 font-bold bg-zinc-50 px-1 rounded border border-zinc-200">201 Created</span>
                </div>
                <p className="text-zinc-500 pl-4">Raj Kumar requested transfer of MacBook AF-0092</p>
              </div>
            </div>

            {/* Bottom Command line */}
            <div className="relative border border-zinc-200 bg-zinc-50/50 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">Execute command ...</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-zinc-200 bg-white px-1.5 font-mono text-[9px] font-medium text-zinc-400 shadow-sm">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid / System Capabilities */}
      <section className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-950 leading-tight">
            10 Fully Operational ERP Modules
          </h2>
          <p className="text-sm text-zinc-500 max-w-2xl mx-auto">
            Comprehensive system features designed to eliminate spreadsheets and synchronize corporate assets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50/55 hover:border-zinc-300 transition-all duration-300 space-y-3 shadow-sm">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center border border-indigo-100">
              <Laptop className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-zinc-900 text-sm">Asset Registry</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Track particulars, location, acquisition dates, conditions, and custom category fields.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50/55 hover:border-zinc-300 transition-all duration-300 space-y-3 shadow-sm">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center border border-indigo-100">
              <ArrowRightLeft className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-zinc-900 text-sm">Allocation & Transfer</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Allocate assets dynamically with collision engines and initiate user-to-user transfers.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50/55 hover:border-zinc-300 transition-all duration-300 space-y-3 shadow-sm">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center border border-indigo-100">
              <CalendarDays className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-zinc-900 text-sm">Resource Booking</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Book workspaces, meeting rooms, and IT devices with dynamic boundary overlap validation.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50/55 hover:border-zinc-300 transition-all duration-300 space-y-3 shadow-sm">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center border border-indigo-100">
              <Wrench className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-zinc-900 text-sm">Maintenance Approval</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Submit repair requests. Auto-transition asset states to under maintenance upon approval.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50/55 hover:border-zinc-300 transition-all duration-300 space-y-3 shadow-sm">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center border border-indigo-100">
              <ClipboardCheck className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-zinc-900 text-sm">Structured Audits</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Schedule site audit campaigns, verify expected locations, and lock discrepancy reports.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 bg-zinc-100 text-zinc-650 transition-all border-dashed relative overflow-hidden flex flex-col justify-center items-center text-center p-8 space-y-4">
            <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Access Workspace</h3>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-[200px]">Sign up for a standard employee account.</p>
            </div>
            <Link href="/signup">
              <button className="h-8 px-4 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer">
                Sign Up Now
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Custom Brutalist Footer (Wickside Inspired - Light Theme) */}
      <footer className="bg-zinc-100 border-t border-zinc-200 text-zinc-650 pt-20 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10 pb-16">
          {/* Main Title Column */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-2xl font-bold tracking-tight text-zinc-905 uppercase font-sans">
              Precision <br />in Control.
            </h3>
          </div>

          {/* Let's Talk Column */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Let's Talk</h4>
            <p className="text-xs text-zinc-850 hover:text-indigo-650 transition-colors font-medium">
              <a href="mailto:support@assetflow.com">support@assetflow.com</a>
            </p>
          </div>

          {/* Find Us Column */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Find Us</h4>
            <p className="text-xs text-zinc-850 font-medium leading-relaxed">
              AssetFlow Technologies<br />
              Ahmedabad, Gujarat, India
            </p>
            <a href="#" className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-850 border-b border-zinc-300 pb-0.5 transition-colors">
              Map ↗
            </a>
          </div>

          {/* Partner Links Column */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Partner Links</h4>
            <p className="text-xs text-zinc-855 hover:text-indigo-650 transition-colors font-medium">
              <a href="#">Odoo Hub</a>
            </p>
          </div>

          {/* Stay in Loop Column */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Stay in the Loop</h4>
            <div className="relative border-b border-zinc-300 pb-1.5 flex items-center">
              <input
                type="email"
                placeholder="Email Address"
                className="bg-transparent text-xs text-zinc-855 outline-none w-full placeholder-zinc-400"
              />
              <button className="text-zinc-400 hover:text-zinc-800 transition-colors cursor-pointer">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="pt-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Let's Get Social ↘</h4>
              <p className="text-xs text-zinc-855 font-bold hover:text-indigo-650 transition-colors mt-1">
                @ASSETFLOWLIFE
              </p>
            </div>
          </div>
        </div>

        {/* Giant Cropped Text Overlay */}
        <div className="relative w-full overflow-hidden select-none pointer-events-none h-[120px] md:h-[220px]">
          <h2 className="text-[9vw] font-black text-zinc-200/60 text-center tracking-tighter leading-none absolute left-1/2 -translate-x-1/2 bottom-[-2.5vw] uppercase font-sans">
            AssetFlow
          </h2>
        </div>

        {/* Bottom Sand/Beige bar */}
        <div className="bg-zinc-200 text-zinc-700 py-6 border-t border-zinc-300">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-wider">
            <div>
              AssetFlow
            </div>
            <div className="flex gap-4 font-semibold">
              <a href="#" className="hover:text-zinc-950">Terms</a>
              <span>/</span>
              <a href="#" className="hover:text-zinc-950">Privacy</a>
              <span>/</span>
              <span>© {new Date().getFullYear()} ASSETFLOW. ALL RIGHTS RESERVED.</span>
            </div>
            <div>
              Site by Society Studios
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
