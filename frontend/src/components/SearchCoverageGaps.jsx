import React from 'react';
import { Activity, ShieldAlert, Send, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';

export default function SearchCoverageGaps({ sectors, statusData, onSelectTab }) {
  const scannedPct = statusData?.coverage_percentage || 72;
  const unscannedPct = Math.max(0, 100 - scannedPct);

  const unsearchedSectors = sectors?.filter(s => s.search_status === 'UNSEARCHED') || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            SEARCH COVERAGE & GAP DETECTION ENGINE
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Tracks total disaster area scanned vs unsearched sectors. Recommends drone flight paths for unsearched gap sectors.
          </p>
        </div>
      </div>

      {/* Coverage Meter Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 shadow-xl">
          <div className="text-xs font-mono uppercase text-slate-400 font-bold">Total Disaster Area</div>
          <div className="text-3xl font-black text-white font-mono">25.0 sq km</div>
          <div className="text-xs text-slate-400">Metro Flood Operational Boundary</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 shadow-xl">
          <div className="text-xs font-mono uppercase text-slate-400 font-bold">Scanned Search Area</div>
          <div className="text-3xl font-black text-emerald-400 font-mono">{scannedPct}%</div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${scannedPct}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 shadow-xl">
          <div className="text-xs font-mono uppercase text-slate-400 font-bold">Unscanned Gap Area</div>
          <div className="text-3xl font-black text-amber-400 font-mono">{unscannedPct}%</div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${unscannedPct}%` }}></div>
          </div>
        </div>
      </div>

      {/* Unsearched Gaps & Recommendations */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-amber-400" />
          Detected Search Gaps & Drone Dispatch Recommendations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {unsearchedSectors.slice(0, 3).map((s) => (
            <div key={s.code} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-sm text-slate-100">Sector {s.code}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                  UNSEARCHED GAP
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">Location: {s.name}</div>
              <button
                onClick={() => {
                  if (onSelectTab) onSelectTab('drones');
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
              >
                <Send className="w-3.5 h-3.5" /> Deploy Drone D03 to {s.code}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
