import React, { useState, useEffect, useRef } from 'react';
import HeaderStatus from './components/HeaderStatus';
import CommandCenter from './components/CommandCenter';
import DisasterMap from './components/DisasterMap';
import DroneFleet from './components/DroneFleet';
import SearchCoverageGaps from './components/SearchCoverageGaps';
import RiskPriority from './components/RiskPriority';
import FoodSafetyScan from './components/FoodSafetyScan';
import ShelterRelief from './components/ShelterRelief';
import IncidentReplay from './components/IncidentReplay';
import OfflineSync from './components/OfflineSync';
import AdminSettings from './components/AdminSettings';

import {
  LayoutDashboard, MapPin, Radio, ShieldAlert, AlertTriangle,
  Utensils, Home, PlayCircle, Database, Eye, Activity, ShieldCheck, ChevronRight
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('command');
  const [role, setRole] = useState('Emergency Commander');
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationIntervalRef = useRef(null);

  // System State Data
  const [statusData, setStatusData] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [drones, setDrones] = useState([]);
  const [rescueTeams, setRescueTeams] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [detections, setDetections] = useState([]);
  const [riskPriorities, setRiskPriorities] = useState([]);
  const [survivors, setSurvivors] = useState({ evidences: [], tracked_objects: [] });
  const [alerts, setAlerts] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [offlineQueue, setOfflineQueue] = useState([]);

  // Fetch API State
  const fetchData = async () => {
    try {
      const [resStatus, resSec, resDro, resTeams, resShe, resRou, resDet, resRisk, resSurv, resAle, resTime, resOff] = await Promise.all([
        fetch('/api/status').then(r => r.json()),
        fetch('/api/sectors').then(r => r.json()),
        fetch('/api/drones').then(r => r.json()),
        fetch('/api/rescue-teams').then(r => r.json()),
        fetch('/api/shelters').then(r => r.json()),
        fetch('/api/routes').then(r => r.json()),
        fetch('/api/detections').then(r => r.json()),
        fetch('/api/risk-priority').then(r => r.json()),
        fetch('/api/survivors').then(r => r.json()),
        fetch('/api/alerts').then(r => r.json()),
        fetch('/api/timeline').then(r => r.json()),
        fetch('/api/offline-queue').then(r => r.json())
      ]);

      setStatusData(resStatus);
      setSectors(resSec);
      setDrones(resDro);
      setRescueTeams(resTeams);
      setShelters(resShe);
      setRoutes(resRou);
      setDetections(resDet);
      setRiskPriorities(resRisk);
      setSurvivors(resSurv);
      setAlerts(resAle);
      setTimeline(resTime);
      setOfflineQueue(resOff);
    } catch (err) {
      console.error('Error fetching API data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Single step simulation execution
  const executeSimulationStep = async () => {
    try {
      await fetch('/api/simulation/step', { method: 'POST' });
      await fetchData();
    } catch (err) {
      console.error('Error executing simulation step:', err);
    }
  };

  // Toggle continuous auto-playing Flood Simulation loop
  const toggleFloodSimulation = () => {
    if (isSimulating) {
      // Stop continuous loop
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      setIsSimulating(false);
    } else {
      // Start continuous auto-playing simulation loop (every 1.5s)
      setIsSimulating(true);
      executeSimulationStep(); // Immediate first step
      simulationIntervalRef.current = setInterval(executeSimulationStep, 1500);
    }
  };

  // Cleanup simulation interval on unmount
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  const handleRecalculateRoute = async (teamCode, targetSector) => {
    try {
      await fetch(`/api/routes/recalculate?team_code=${teamCode}&target_sector=${targetSector}&avoid_blocked=true`, { method: 'POST' });
      await fetchData();
    } catch (err) {
      console.error('Error recalculating route:', err);
    }
  };

  const navItems = [
    { id: 'command', label: 'Command Center', icon: LayoutDashboard },
    { id: 'map', label: 'Live Disaster Map', icon: MapPin },
    { id: 'drones', label: 'Drone Fleet', icon: Radio },
    { id: 'survivors', label: 'Survivor Intelligence', icon: Eye },
    { id: 'coverage', label: 'Search Coverage & Gaps', icon: Activity },
    { id: 'risk', label: 'Risk & Priority AI', icon: ShieldAlert },
    { id: 'food_safety', label: 'Food Safety Scan', icon: Utensils, highlight: true },
    { id: 'shelters', label: 'Shelter & Relief', icon: Home },
    { id: 'replay', label: 'Incident Replay', icon: PlayCircle },
    { id: 'offline', label: 'Offline & Sync Queue', icon: Database },
    { id: 'admin', label: 'Admin & Security', icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      {/* Top Telemetry & Hardware Status Banner */}
      <HeaderStatus
        statusData={statusData}
        role={role}
        setRole={setRole}
        isSimulating={isSimulating}
        toggleSimulation={toggleFloodSimulation}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-[#0f172a] border-r border-slate-800 p-4 space-y-4 hidden md:block">
          <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest px-3">
            GUARDIANEYE MODULES
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                      : item.highlight
                      ? 'bg-amber-950/40 text-amber-300 border border-amber-800/40 hover:bg-amber-900/40'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              );
            })}
          </nav>

          {/* Quick Active Disaster Card */}
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 mt-6 font-mono text-[11px]">
            <div className="text-slate-400 font-bold uppercase text-[10px]">CURRENT DISASTER</div>
            <div className="text-white font-extrabold text-xs">Metro Flood 2026</div>
            <div className="text-amber-400">Sector B07: CRITICAL</div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0b0f19]">
          {activeTab === 'command' && (
            <CommandCenter
              statusData={statusData}
              sectors={sectors}
              drones={drones}
              rescueTeams={rescueTeams}
              shelters={shelters}
              routes={routes}
              detections={detections}
              alerts={alerts}
              onSelectTab={setActiveTab}
              onStartSimulation={toggleFloodSimulation}
            />
          )}

          {activeTab === 'map' && (
            <div className="p-6 h-full flex flex-col space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                LIVE DISASTER DIGITAL TWIN MAP
              </h2>
              <div className="flex-1 min-h-[500px]">
                <DisasterMap
                  sectors={sectors}
                  drones={drones}
                  rescueTeams={rescueTeams}
                  shelters={shelters}
                  routes={routes}
                  onRecalculateRoute={handleRecalculateRoute}
                />
              </div>
            </div>
          )}

          {activeTab === 'drones' && (
            <DroneFleet drones={drones} />
          )}

          {activeTab === 'survivors' && (
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-400" />
                SURVIVOR INTELLIGENCE & SENSOR FUSION RECORDS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {survivors.evidences?.map((e) => (
                  <div key={e.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <div className="font-bold text-slate-100">Sector {e.sector_code} — {e.object_id}</div>
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                        SCORE: {Math.round(e.composite_score * 100)}% ({e.evidence_level})
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">{e.why_summary}</p>
                    <div className="text-xs text-emerald-400 font-semibold">Status: {e.status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'coverage' && (
            <SearchCoverageGaps sectors={sectors} statusData={statusData} onSelectTab={setActiveTab} />
          )}

          {activeTab === 'risk' && (
            <RiskPriority
              riskPriorities={riskPriorities}
              rescueTeams={rescueTeams}
              routes={routes}
              onRecalculateRoute={handleRecalculateRoute}
            />
          )}

          {activeTab === 'food_safety' && <FoodSafetyScan />}

          {activeTab === 'shelters' && <ShelterRelief shelters={shelters} />}

          {activeTab === 'replay' && <IncidentReplay timeline={timeline} />}

          {activeTab === 'offline' && <OfflineSync offlineQueue={offlineQueue} />}

          {activeTab === 'admin' && <AdminSettings />}
        </main>
      </div>
    </div>
  );
}
