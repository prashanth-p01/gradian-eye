import React from 'react';
import { WifiOff, Cpu, Database, Navigation, RefreshCw, AlertTriangle, ShieldCheck, UserCheck, Play, Pause } from 'lucide-react';

export default function HeaderStatus({ statusData, role, setRole, isSimulating, toggleSimulation }) {
  const roles = [
    "Emergency Commander", "Rescue Team", "Drone Operator",
    "Field Volunteer", "Relief Coordinator", "Analyst", "Administrator"
  ];

  return (
    <header className="bg-[#0f172a] border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="bg-red-600 text-white p-2 rounded-lg font-black tracking-wider shadow-lg shadow-red-900/30 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-white" />
          <span className="text-lg font-black tracking-widest uppercase">GUARDIAN<span className="text-amber-400">EYE</span></span>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-xs font-semibold uppercase text-slate-300 tracking-wider">Disaster Search & Rescue Intelligence</h1>
          <p className="text-[10px] text-slate-500 font-mono">OFFLINE-FIRST DECISION-SUPPORT PLATFORM</p>
        </div>
      </div>

      {/* Hardware / Network Status Indicators */}
      <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
        <div className="flex items-center gap-1.5 text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/40">
          <WifiOff className="w-3.5 h-3.5" />
          <span>INTERNET: {statusData?.internet_status || 'OFFLINE'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/40">
          <Cpu className="w-3.5 h-3.5" />
          <span>EDGE AI: {statusData?.edge_ai_status || 'ACTIVE'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40">
          <Database className="w-3.5 h-3.5" />
          <span>LOCAL DB: {statusData?.local_database || 'ACTIVE'}</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-950/40 border border-blue-800/40">
          <Navigation className="w-3.5 h-3.5" />
          <span>GPS: {statusData?.gps_status || 'AVAILABLE'}</span>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 text-indigo-300 font-semibold px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-800/40">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>SYNC QUEUE: {statusData?.sync_queue_count || 12} EVENTS</span>
        </div>
      </div>

      {/* Controls & Role Selector */}
      <div className="flex items-center gap-3">
        {/* Continuous Auto-Playing Flood Demo Simulator Button */}
        <button
          onClick={toggleSimulation}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-xl cursor-pointer ${
            isSimulating
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/50 animate-pulse'
              : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/50 hover:scale-105'
          }`}
        >
          {isSimulating ? (
            <>
              <Pause className="w-4 h-4 fill-white" />
              <span>PAUSE DEMO (LIVE RUNNING)</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>START FLOOD DEMO</span>
            </>
          )}
        </button>

        {/* Role Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer font-mono"
          >
            {roles.map(r => (
              <option key={r} value={r} className="bg-slate-900 text-slate-200">{r}</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
