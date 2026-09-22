import React, { useState } from 'react';
import { Activity, Radio, AlertOctagon, Users, ShieldAlert, Home, Eye, Play, Sparkles, MapPin, ExternalLink, Camera, Send, RefreshCw, Battery, CheckCircle2, CornerDownRight } from 'lucide-react';
import DisasterMap from './DisasterMap';

export default function CommandCenter({ statusData, sectors, drones, rescueTeams, shelters, routes, detections, alerts, onSelectTab, onStartSimulation, onRecalculateRoute }) {
  const [activeCameraDrone, setActiveCameraDrone] = useState('D02');
  const [cameraMode, setCameraMode] = useState('THERMAL');
  const [actionSuccess, setActionSuccess] = useState('');

  const currentDrone = drones?.find(d => d.code === activeCameraDrone) || drones?.[0];

  const handleExecuteAction = async (actionType) => {
    if (actionType === 'DEPLOY_BRAVO') {
      setActionSuccess('✔ Rescue Team Bravo Deployed to Sector B07!');
    } else if (actionType === 'RECALC_ROUTE') {
      if (onRecalculateRoute) await onRecalculateRoute('TEAM_BRAVO', 'B07');
      setActionSuccess('✔ Route Recalculated via North Ridge Detour!');
    } else if (actionType === 'SWAP_D03') {
      setActionSuccess('✔ Drone D03 Recalled & Battery Swapped to 100%!');
    }
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const getDroneFeedImage = () => {
    if (activeCameraDrone === 'D01') {
      return 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=60';
    }
    if (activeCameraDrone === 'D03') {
      return 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=60';
    }
    // Default D02
    return 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=60';
  };

  return (
    <div className="p-6 space-y-6">
      {/* 7 Interactive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* KPI 1: ACTIVE DRONES */}
        <button
          onClick={() => onSelectTab && onSelectTab('drones')}
          className="bg-slate-900 border border-slate-800 hover:border-blue-500/80 p-3.5 rounded-xl flex flex-col justify-between shadow-lg text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-blue-950/40 group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-blue-400 transition-colors">Active Drones</span>
            <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono flex items-center justify-between">
            <span>{statusData?.active_drones || 3}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity" />
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1">D01, D02, D03 Airborne</div>
        </button>

        {/* KPI 2: PERSONS TRACKED */}
        <button
          onClick={() => onSelectTab && onSelectTab('survivors')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/80 p-3.5 rounded-xl flex flex-col justify-between shadow-lg text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-amber-950/40 group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-amber-400 transition-colors">Persons Tracked</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2 font-mono flex items-center justify-between">
            <span>{statusData?.persons_detected || 2}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-amber-400 transition-opacity" />
          </div>
          <div className="text-[10px] text-amber-300 font-mono mt-1">Person ID 07 & 12</div>
        </button>

        {/* KPI 3: SURVIVOR ZONES */}
        <button
          onClick={() => onSelectTab && onSelectTab('survivors')}
          className="bg-slate-900 border border-slate-800 hover:border-red-500/80 p-3.5 rounded-xl flex flex-col justify-between shadow-lg text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-red-950/40 group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-red-400 transition-colors">Survivor Zones</span>
            <Eye className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400 mt-2 font-mono flex items-center justify-between">
            <span>1</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-red-400 transition-opacity" />
          </div>
          <div className="text-[10px] text-red-400 font-mono mt-1">Sector B07 Critical</div>
        </button>

        {/* KPI 4: CRITICAL ZONES */}
        <button
          onClick={() => onSelectTab && onSelectTab('risk')}
          className="bg-slate-900 border border-slate-800 hover:border-red-600/80 p-3.5 rounded-xl flex flex-col justify-between shadow-lg text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-red-950/40 group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-red-500 transition-colors">Critical Zones</span>
            <AlertOctagon className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-500 mt-2 font-mono flex items-center justify-between">
            <span>{statusData?.critical_zones || 1}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-red-500 transition-opacity" />
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">B07 Industrial Park</div>
        </button>

        {/* KPI 5: AREA SCANNED */}
        <button
          onClick={() => onSelectTab && onSelectTab('coverage')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/80 p-3.5 rounded-xl flex flex-col justify-between shadow-lg text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-emerald-950/40 group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-emerald-400 transition-colors">Area Scanned</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2 font-mono flex items-center justify-between">
            <span>{statusData?.coverage_percentage || 72}%</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity" />
          </div>
          <div className="text-[10px] text-emerald-300 font-mono mt-1">18 / 25 sq km</div>
        </button>

        {/* KPI 6: RESCUE TEAMS */}
        <button
          onClick={() => onSelectTab && onSelectTab('risk')}
          className="bg-slate-900 border border-slate-800 hover:border-blue-500/80 p-3.5 rounded-xl flex flex-col justify-between shadow-lg text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-blue-950/40 group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-blue-400 transition-colors">Rescue Teams</span>
            <ShieldAlert className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono flex items-center justify-between">
            <span>2</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity" />
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">Team Alpha & Bravo</div>
        </button>

        {/* KPI 7: SHELTER ALERT */}
        <button
          onClick={() => onSelectTab && onSelectTab('shelters')}
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/80 p-3.5 rounded-xl flex flex-col justify-between shadow-lg text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-purple-950/40 group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-purple-400 transition-colors">Shelter Alert</span>
            <Home className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 mt-2 font-mono flex items-center justify-between">
            <span>{statusData?.shelters_at_capacity || 1}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-purple-400 transition-opacity" />
          </div>
          <div className="text-[10px] text-purple-300 font-mono mt-1">West Gym Full</div>
        </button>
      </div>

      {/* Main Grid: Interactive Map + Live Drone Feed Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Disaster Digital Twin Map */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              LIVE DISASTER DIGITAL TWIN MAP — METRO FLOOD 2026
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              REAL-TIME GEOSPATIAL OVERLAY
            </span>
          </div>
          <div className="flex-1 w-full min-h-[420px]">
            <DisasterMap sectors={sectors} drones={drones} rescueTeams={rescueTeams} shelters={shelters} routes={routes} onRecalculateRoute={onRecalculateRoute} />
          </div>
        </div>

        {/* Live Simulated Drone Feed Player */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-3">
            
            {/* Feed Header with Drone Switcher */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Play className="w-4 h-4 text-blue-400 fill-blue-400" />
                LIVE FEED — {activeCameraDrone} ({currentDrone?.current_sector_code || 'B07'})
              </h3>

              {/* Drone Feed Selector */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
                {['D01', 'D02', 'D03'].map(code => (
                  <button
                    key={code}
                    onClick={() => setActiveCameraDrone(code)}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${
                      activeCameraDrone === code ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Player Canvas Simulation */}
            <div className="relative w-full h-56 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center group shadow-inner">
              <img
                src={getDroneFeedImage()}
                alt="Disaster Drone Aerial Feed"
                className={`w-full h-full object-cover transition-all duration-700 ${
                  cameraMode === 'THERMAL' ? 'hue-rotate-180 contrast-125 brightness-90' : ''
                }`}
              />

              {/* Bounding Box Overlay for Person ID 07 */}
              {activeCameraDrone === 'D02' && (
                <div className="absolute top-12 left-16 w-28 h-32 border-2 border-red-500 bg-red-500/10 rounded flex flex-col justify-between p-1 radar-ping">
                  <span className="bg-red-600 text-white font-mono text-[9px] px-1 py-0.5 rounded font-bold self-start">
                    Person ID 07 (94%)
                  </span>
                  <span className="text-[8px] font-mono text-red-300 bg-black/70 px-1 rounded">
                    Thermal Ping Detected
                  </span>
                </div>
              )}

              {/* Bounding Box Overlay for Debris */}
              <div className="absolute bottom-8 right-12 w-20 h-16 border-2 border-amber-400 bg-amber-400/10 rounded p-1">
                <span className="bg-amber-500 text-slate-950 font-mono text-[8px] px-1 rounded font-bold">
                  Debris (89%)
                </span>
              </div>

              {/* Video Overlay Telemetry */}
              <div className="absolute top-2 left-2 bg-black/80 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-slate-300 flex items-center gap-2">
                <span>ALT: {currentDrone?.altitude || 38.0}m</span>
                <span>BAT: {currentDrone?.battery_level || 32}%</span>
                <span>CAM: {cameraMode}</span>
              </div>

              {/* Camera Mode Toggle */}
              <div className="absolute bottom-2 left-2 flex gap-1 z-10">
                <button
                  onClick={() => setCameraMode('THERMAL')}
                  className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                    cameraMode === 'THERMAL' ? 'bg-red-600 text-white' : 'bg-black/70 text-slate-300'
                  }`}
                >
                  THERMAL
                </button>
                <button
                  onClick={() => setCameraMode('RGB')}
                  className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                    cameraMode === 'RGB' ? 'bg-blue-600 text-white' : 'bg-black/70 text-slate-300'
                  }`}
                >
                  RGB VISUAL
                </button>
              </div>
            </div>

            {/* Interactive Recommended System Actions Buttons */}
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2.5">
              <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-amber-400" /> RECOMMENDED SYSTEM ACTIONS</span>
                <span className="text-[9px] text-slate-500">1-CLICK EXECUTION</span>
              </div>

              {actionSuccess && (
                <div className="p-2 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {actionSuccess}
                </div>
              )}

              <div className="space-y-2">
                {/* Action Button 1 */}
                <button
                  onClick={() => handleExecuteAction('DEPLOY_BRAVO')}
                  className="w-full text-left p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/60 rounded-lg transition-all group cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold mt-0.5">•</span>
                    <span className="text-xs text-slate-200 group-hover:text-amber-300 transition-colors font-medium">
                      Deploy Rescue Team Bravo to Sector B07 immediately.
                    </span>
                  </div>
                  <Send className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </button>

                {/* Action Button 2 */}
                <button
                  onClick={() => handleExecuteAction('RECALC_ROUTE')}
                  className="w-full text-left p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/60 rounded-lg transition-all group cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold mt-0.5">•</span>
                    <span className="text-xs text-slate-200 group-hover:text-amber-300 transition-colors font-medium">
                      Recalculate route via North Ridge detour to avoid flooded Highway 4.
                    </span>
                  </div>
                  <CornerDownRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </button>

                {/* Action Button 3 */}
                <button
                  onClick={() => handleExecuteAction('SWAP_D03')}
                  className="w-full text-left p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/60 rounded-lg transition-all group cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold mt-0.5">•</span>
                    <span className="text-xs text-slate-200 group-hover:text-amber-300 transition-colors font-medium">
                      Order Drone D03 to return for battery swap (15% remaining).
                    </span>
                  </div>
                  <Battery className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
