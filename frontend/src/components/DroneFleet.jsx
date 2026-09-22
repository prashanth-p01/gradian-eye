import React, { useState } from 'react';
import { Radio, Battery, Navigation, Play, Pause, RotateCcw, AlertTriangle, ShieldCheck, Cpu, WifiOff, Wifi } from 'lucide-react';

export default function DroneFleet({ drones, onUpdateDrone }) {
  const [activeDroneCode, setActiveDroneCode] = useState('D01');
  const [droneList, setDroneList] = useState(drones || []);

  const handleDroneAction = (code, action) => {
    setDroneList(prev => prev.map(d => {
      if (d.code !== code) return d;
      let newFlightStatus = d.flight_status;
      let newMissionStatus = d.mission_status;
      let newBattery = d.battery_level;

      if (action === 'DEPLOY') {
        newFlightStatus = 'SEARCHING';
        newMissionStatus = 'SECTOR_SWEEP';
      } else if (action === 'PAUSE') {
        newFlightStatus = 'HOVERING';
        newMissionStatus = 'PAUSED';
      } else if (action === 'RETURN') {
        newFlightStatus = 'RETURNING';
        newMissionStatus = 'RETURN_TO_BASE';
      } else if (action === 'BATTERY_SWAP') {
        newBattery = 100.0;
        newFlightStatus = 'IDLE';
        newMissionStatus = 'STANDBY';
      } else if (action === 'SIMULATE_DISCONNECT') {
        newFlightStatus = 'OFFLINE';
      } else if (action === 'RESTORE_NETWORK') {
        newFlightStatus = 'SEARCHING';
      }

      return {
        ...d,
        flight_status: newFlightStatus,
        mission_status: newMissionStatus,
        battery_level: newBattery
      };
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-blue-400 animate-pulse" />
            MULTI-DRONE FLEET COMMAND & TELEMETRY
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time interactive drone simulator. Operate flight status, deploy search sweeps, monitor battery telemetry, and manage return-to-base missions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {droneList?.map((d) => (
          <div
            key={d.code}
            className={`bg-slate-900 border p-6 rounded-2xl shadow-xl space-y-5 transition-all ${
              activeDroneCode === d.code ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="font-extrabold text-white text-base font-mono flex items-center gap-2">
                  <span>🚁 {d.code}</span>
                  <span className="text-xs text-slate-400 font-sans font-normal">({d.model})</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">Current Sector: <b className="text-amber-400">{d.current_sector_code}</b></div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded ${
                d.flight_status === 'SEARCHING' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                d.flight_status === 'RETURNING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                d.flight_status === 'OFFLINE' ? 'bg-red-950 text-red-400 border border-red-800' :
                'bg-blue-950 text-blue-400 border border-blue-800'
              }`}>
                {d.flight_status}
              </span>
            </div>

            {/* Telemetry Stats */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 flex items-center gap-1 text-[10px] uppercase">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" /> Battery
                </div>
                <div className={`font-bold text-sm ${d.battery_level < 20 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                  {d.battery_level}%
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 flex items-center gap-1 text-[10px] uppercase">
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" /> Altitude
                </div>
                <div className="font-bold text-sm text-cyan-300">{d.altitude} meters</div>
              </div>
            </div>

            {/* Interactive Flight Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Flight Controls</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDroneAction(d.code, 'DEPLOY')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow"
                >
                  <Play className="w-3 h-3 fill-white" /> Deploy Search
                </button>
                <button
                  onClick={() => handleDroneAction(d.code, 'PAUSE')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 border border-slate-700"
                >
                  <Pause className="w-3 h-3" /> Pause
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDroneAction(d.code, 'RETURN')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow"
                >
                  <RotateCcw className="w-3 h-3" /> Return Base
                </button>
                <button
                  onClick={() => handleDroneAction(d.code, 'BATTERY_SWAP')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow"
                >
                  <Battery className="w-3 h-3" /> Battery Swap
                </button>
              </div>

              {d.flight_status === 'OFFLINE' ? (
                <button
                  onClick={() => handleDroneAction(d.code, 'RESTORE_NETWORK')}
                  className="w-full mt-1 px-3 py-1.5 bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Wifi className="w-3.5 h-3.5" /> Restore Connection
                </button>
              ) : (
                <button
                  onClick={() => handleDroneAction(d.code, 'SIMULATE_DISCONNECT')}
                  className="w-full mt-1 px-3 py-1.5 bg-red-950/40 border border-red-800/40 text-red-300 hover:bg-red-950/80 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <WifiOff className="w-3.5 h-3.5" /> Simulate Signal Loss
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
