import React, { useState } from 'react';
import { AlertCircle, HelpCircle, ShieldAlert, Route, CheckCircle2, ChevronRight, CornerDownRight } from 'lucide-react';

export default function RiskPriority({ riskPriorities, rescueTeams, routes, onRecalculateRoute }) {
  const [selectedSector, setSelectedSector] = useState('B07');
  const [isRecalculating, setIsRecalculating] = useState(false);

  const selectedItem = riskPriorities?.find(p => p.sector_code === selectedSector) || riskPriorities?.[0];

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    await onRecalculateRoute('TEAM_BRAVO', 'B07');
    setIsRecalculating(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            RESCUE PRIORITY & EXPLAINABLE AI ENGINE
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Dynamic sector ranking based on multi-modal survivor evidence, structural collapse risk, flood depth, and road accessibility.
          </p>
        </div>
        <div className="text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-3 py-1.5 rounded-lg">
          DECISION SUPPORT ONLY — FINAL OPERATIONAL ORDER RESTS WITH HUMAN COMMANDER
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Priority Rank List */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
            Sector Priority Ranking List
          </h3>

          <div className="space-y-2">
            {riskPriorities?.map((item) => (
              <div
                key={item.sector_code}
                onClick={() => setSelectedSector(item.sector_code)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedSector === item.sector_code
                    ? 'bg-slate-800 border-red-500/80 shadow-lg shadow-red-950/30'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                    item.rank_order === 1 ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    #{item.rank_order}
                  </span>
                  <div>
                    <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      Sector {item.sector_code}
                      {item.priority_level === 'CRITICAL' && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-mono">
                          CRITICAL
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Structural: {item.structural_risk} | Flood: {item.flood_risk}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Explainable AI "WHY" Panel Drawer */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2 uppercase tracking-wider font-mono">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                WHY SECTOR {selectedItem?.sector_code || 'B07'} IS {selectedItem?.priority_level || 'CRITICAL'} PRIORITY
              </h3>
              <span className="text-xs px-2.5 py-1 rounded bg-red-950 text-red-400 border border-red-800 font-mono font-bold">
                RANK #{selectedItem?.rank_order || 1}
              </span>
            </div>

            {/* Rationale Bullet Points */}
            <div className="space-y-3">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Explainable AI Rationale Matrix:</div>
              <div className="space-y-2">
                {selectedItem?.why_reasons?.map((reason, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold mt-0.5">✔</span>
                    <span className="leading-relaxed font-medium">{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Route Recalculation Action Box */}
            <div className="bg-slate-950 border border-amber-900/40 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Route className="w-4 h-4" />
                Dynamic Route Optimization Action
              </div>
              <p className="text-xs text-slate-300">
                Rescue Team Bravo is assigned to Sector B07. Highway 4 bridge is flooded/blocked.
              </p>

              <button
                onClick={handleRecalculate}
                disabled={isRecalculating}
                className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                {isRecalculating ? <span className="animate-spin font-mono">Recalculating Path...</span> : <>
                  <CornerDownRight className="w-4 h-4" />
                  Simulate Blocked Road & Recalculate Detour Route
                </>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
