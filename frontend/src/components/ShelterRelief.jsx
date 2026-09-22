import React, { useState } from 'react';
import { Home, Package, AlertTriangle, Droplet, HeartPulse, CheckCircle2, Truck, UserPlus, ShieldAlert, ArrowRight } from 'lucide-react';

export default function ShelterRelief({ shelters }) {
  const [shelterData, setShelterData] = useState(shelters || []);
  const [actionNotice, setActionNotice] = useState('');

  const handleTransferSurvivors = (fromCode, toCode, count) => {
    setShelterData(prev => prev.map(s => {
      if (s.code === fromCode) {
        const newOcc = Math.max(0, s.occupants - count);
        const newStatus = newOcc >= s.capacity ? 'FULL' : newOcc >= s.capacity * 0.85 ? 'NEAR CAPACITY' : 'SAFE';
        return { ...s, occupants: newOcc, status: newStatus };
      }
      if (s.code === toCode) {
        const newOcc = Math.min(s.capacity, s.occupants + count);
        return { ...s, occupants: newOcc };
      }
      return s;
    }));
    setActionNotice(`✔ Transferred ${count} survivors from ${fromCode} to ${toCode}!`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleRestockSupplies = (code, type) => {
    setShelterData(prev => prev.map(s => {
      if (s.code !== code) return s;
      if (type === 'FOOD_WATER') {
        return { ...s, food_stock_days: parseFloat((s.food_stock_days + 4.0).toFixed(1)), water_stock_days: parseFloat((s.water_stock_days + 4.0).toFixed(1)) };
      }
      if (type === 'MEDICAL') {
        return { ...s, medical_stock: 'FULL' };
      }
      return s;
    }));
    setActionNotice(`✔ Emergency ${type === 'MEDICAL' ? 'Medical Kits' : 'Food & Water Supplies'} delivered to ${code}!`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Home className="w-6 h-6 text-purple-400" />
            SHELTER & RELIEF RESOURCE MANAGEMENT
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time occupancy tracking, food & water supply meters, medical stock monitoring, and emergency supply truck dispatches.
          </p>
        </div>

        {actionNotice && (
          <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold rounded-xl flex items-center gap-2 animate-bounce shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {actionNotice}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {shelterData?.map((s) => {
          const occPct = Math.round((s.occupants / s.capacity) * 100);
          return (
            <div key={s.code} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    <Home className="w-4 h-4 text-purple-400" />
                    {s.name}
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    s.status === 'FULL' ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse' :
                    s.status === 'NEAR CAPACITY' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    {s.status}
                  </span>
                </div>

                {/* Occupancy Meter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-slate-300">
                    <span>Occupancy Capacity</span>
                    <span className="font-bold">{s.occupants} / {s.capacity} ({occPct}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        occPct >= 100 ? 'bg-red-500' : occPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, occPct)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Resource Meters */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <Package className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <div className="text-[10px] text-slate-400 uppercase">Food</div>
                    <div className="text-xs font-bold text-amber-400">{s.food_stock_days} Days</div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <Droplet className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <div className="text-[10px] text-slate-400 uppercase">Water</div>
                    <div className="text-xs font-bold text-blue-400">{s.water_stock_days} Days</div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <HeartPulse className="w-4 h-4 text-red-400 mx-auto mb-1" />
                    <div className="text-[10px] text-slate-400 uppercase">Medical</div>
                    <div className={`text-[11px] font-bold ${s.medical_stock === 'CRITICAL' ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                      {s.medical_stock}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive 1-Click Shelter Action Controls */}
              <div className="space-y-2 pt-4 border-t border-slate-800 font-mono">
                <div className="text-[10px] uppercase text-slate-400 font-bold">Shelter Emergency Actions</div>

                {s.code === 'SHELTER_WEST' && (
                  <button
                    onClick={() => handleTransferSurvivors('SHELTER_WEST', 'SHELTER_CENTRAL', 25)}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
                  >
                    <ArrowRight className="w-3.5 h-3.5" /> Transfer 25 Survivors to Stadium
                  </button>
                )}

                <button
                  onClick={() => handleRestockSupplies(s.code, 'FOOD_WATER')}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
                >
                  <Truck className="w-3.5 h-3.5" /> Dispatch Food & Water Truck
                </button>

                {s.medical_stock === 'CRITICAL' && (
                  <button
                    onClick={() => handleRestockSupplies(s.code, 'MEDICAL')}
                    className="w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow animate-pulse"
                  >
                    <HeartPulse className="w-3.5 h-3.5" /> Deliver Emergency Medical Kits
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
