import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Rectangle, Marker, Popup, Polyline, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Radio, Compass, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, Filter } from 'lucide-react';

// Custom Map Marker Icons with Status Lights
const createCustomIcon = (bgColor, textColor, label, symbol = '', pulse = false) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background: ${bgColor};
        color: ${textColor};
        padding: 5px 10px;
        border-radius: 8px;
        font-weight: 800;
        font-size: 11px;
        font-family: 'JetBrains Mono', monospace;
        border: 2px solid #ffffff;
        box-shadow: 0 6px 16px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
        transform: translate(-50%, -100%);
        ${pulse ? 'animation: radar-pulse 1.8s infinite;' : ''}
      ">
        <span>${symbol}</span>
        <span>${label}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

export default function DisasterMap({ sectors, drones, rescueTeams, shelters, routes, onRecalculateRoute }) {
  const [mapTile, setMapTile] = useState('dark');
  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [sectorStatuses, setSectorStatuses] = useState({});
  const [filterLight, setFilterLight] = useState('ALL');

  const centerLat = 37.7749;
  const centerLng = -122.4194;

  useEffect(() => {
    if (sectors && sectors.length > 0) {
      const initial = {};
      sectors.forEach(s => {
        if (s.code === 'B07' || s.risk_level === 'CRITICAL') {
          initial[s.code] = 'RED'; // Red = Not Cleared / Critical
        } else if (s.search_status === 'SEARCHING' || s.scanned_percentage > 30) {
          initial[s.code] = 'ORANGE'; // Orange = In Progress / Partial
        } else if (s.search_status === 'SEARCHED' || s.scanned_percentage >= 80) {
          initial[s.code] = 'GREEN'; // Green = Fully Cleared & Safe
        } else {
          initial[s.code] = 'RED'; // Red default unsearched
        }
      });
      setSectorStatuses(initial);
    }
  }, [sectors]);

  const toggleSectorStatus = (code, newStatus) => {
    setSectorStatuses(prev => ({
      ...prev,
      [code]: newStatus
    }));
  };

  const getTileUrl = () => {
    if (mapTile === 'satellite') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
    if (mapTile === 'street') {
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
    return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  };

  const getLightColor = (statusLight) => {
    if (statusLight === 'GREEN') return '#10b981'; // Green = Cleared
    if (statusLight === 'ORANGE') return '#f97316'; // Orange = Partial / Searching
    return '#ef4444'; // Red = Unsearched / Critical
  };

  const getSectorStyle = (sec) => {
    const light = sectorStatuses[sec.code] || 'RED';
    const color = getLightColor(light);

    return {
      color: color,
      fillColor: color,
      fillOpacity: light === 'RED' ? 0.45 : light === 'ORANGE' ? 0.35 : 0.2,
      weight: light === 'RED' ? 3 : 1.5
    };
  };

  // Counts for status lights
  const redCount = Object.values(sectorStatuses).filter(s => s === 'RED').length;
  const orangeCount = Object.values(sectorStatuses).filter(s => s === 'ORANGE').length;
  const greenCount = Object.values(sectorStatuses).filter(s => s === 'GREEN').length;

  return (
    <div className="w-full h-full min-h-[580px] flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 relative shadow-2xl">
      {/* Visual Status Lights Top Control Bar */}
      <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 z-[1000]">
        
        {/* Status Light Summary Badges */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400 font-bold uppercase text-[11px]">STATUS LIGHTS:</span>
          
          <button
            onClick={() => setFilterLight(filterLight === 'RED' ? 'ALL' : 'RED')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-bold transition-all ${
              filterLight === 'RED' ? 'bg-red-600 text-white border-red-400 shadow' : 'bg-red-950/60 text-red-400 border-red-800/60 hover:bg-red-900/60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span>🔴 NOT CLEARED ({redCount})</span>
          </button>

          <button
            onClick={() => setFilterLight(filterLight === 'ORANGE' ? 'ALL' : 'ORANGE')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-bold transition-all ${
              filterLight === 'ORANGE' ? 'bg-amber-600 text-slate-950 border-amber-400 shadow' : 'bg-amber-950/60 text-amber-400 border-amber-800/60 hover:bg-amber-900/60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>🟠 PARTIAL SEARCH ({orangeCount})</span>
          </button>

          <button
            onClick={() => setFilterLight(filterLight === 'GREEN' ? 'ALL' : 'GREEN')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-bold transition-all ${
              filterLight === 'GREEN' ? 'bg-emerald-600 text-white border-emerald-400 shadow' : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>🟢 FULLY CLEARED ({greenCount})</span>
          </button>
        </div>

        {/* Map View Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setMapTile('dark')}
            className={`px-2.5 py-1 rounded font-semibold transition-all ${
              mapTile === 'dark' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dark Mode
          </button>
          <button
            onClick={() => setMapTile('satellite')}
            className={`px-2.5 py-1 rounded font-semibold transition-all ${
              mapTile === 'satellite' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapTile('street')}
            className={`px-2.5 py-1 rounded font-semibold transition-all ${
              mapTile === 'street' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Street OSM
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full min-h-[500px] relative">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={13}
          style={{ width: '100%', height: '100%', minHeight: '500px' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; CartoDB / Esri / OpenStreetMap'
            url={getTileUrl()}
          />

          {/* Sectors Rectangles with Dynamic Status Lights */}
          {sectors?.map((sec) => {
            const light = sectorStatuses[sec.code] || 'RED';
            if (filterLight !== 'ALL' && light !== filterLight) return null;

            const bounds = sec.bounds && sec.bounds.length === 2
              ? sec.bounds
              : [
                  [sec.center_lat - 0.003, sec.center_lng - 0.003],
                  [sec.center_lat + 0.003, sec.center_lng + 0.003]
                ];
            const style = getSectorStyle(sec);

            return (
              <Rectangle
                key={sec.code}
                bounds={bounds}
                pathOptions={style}
                eventHandlers={{
                  click: () => setSelectedSector(sec)
                }}
              >
                <Popup>
                  <div className="p-2.5 font-sans text-slate-900 w-56">
                    <div className="font-bold text-sm border-b pb-1 flex items-center justify-between">
                      <span>Sector {sec.code}: {sec.name}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded text-white font-bold ${
                        light === 'RED' ? 'bg-red-600' : light === 'ORANGE' ? 'bg-amber-600' : 'bg-emerald-600'
                      }`}>
                        {light === 'RED' ? '🔴 NOT CLEARED' : light === 'ORANGE' ? '🟠 PARTIAL' : '🟢 CLEARED'}
                      </span>
                    </div>

                    <div className="text-xs mt-2 space-y-1 font-mono">
                      <div>Scanned: <b>{sec.scanned_percentage}%</b></div>
                      <div>Risk Level: <b className={sec.risk_level === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'}>{sec.risk_level}</b></div>
                    </div>

                    {/* Quick Light Change Buttons inside Popup */}
                    <div className="mt-3 pt-2 border-t flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSectorStatus(sec.code, 'RED'); }}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[10px] py-1 rounded"
                      >
                        🔴 Red Light
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSectorStatus(sec.code, 'ORANGE'); }}
                        className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-[10px] py-1 rounded"
                      >
                        🟠 Orange
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSectorStatus(sec.code, 'GREEN'); }}
                        className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[10px] py-1 rounded"
                      >
                        🟢 Green
                      </button>
                    </div>
                  </div>
                </Popup>
              </Rectangle>
            );
          })}

          {/* Flooded Polygon Hazard */}
          <Polygon
            positions={[
              [centerLat + 0.003, centerLng - 0.004],
              [centerLat + 0.006, centerLng + 0.002],
              [centerLat + 0.001, centerLng + 0.006],
              [centerLat - 0.002, centerLng + 0.001]
            ]}
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.35, dashArray: '6, 6' }}
          />

          {/* Rescue Routes Lines */}
          {routes?.map((r) => {
            if (!r.waypoints || r.waypoints.length === 0) return null;
            const coords = r.waypoints.map(w => [w.lat, w.lng]);
            return (
              <Polyline
                key={r.id}
                positions={coords}
                pathOptions={{
                  color: r.has_blocked_roads ? '#f97316' : '#10b981',
                  weight: 4,
                  dashArray: r.has_blocked_roads ? '8, 8' : undefined
                }}
              />
            );
          })}

          {/* Live Drone Markers */}
          {drones?.map((d) => (
            <Marker
              key={d.code}
              position={[d.current_lat || centerLat, d.current_lng || centerLng]}
              icon={createCustomIcon('#3b82f6', '#ffffff', `${d.code} (${d.battery_level}%)`, '🚁', true)}
              eventHandlers={{ click: () => setSelectedDrone(d) }}
            >
              <Popup>
                <div className="p-2 font-sans text-slate-900 w-48">
                  <div className="font-bold text-xs border-b pb-1">DRONE TELEMETRY — {d.code}</div>
                  <div className="text-xs space-y-1 mt-1 font-mono">
                    <div>Model: <b>{d.model}</b></div>
                    <div>Battery: <b>{d.battery_level}%</b></div>
                    <div>Status: <b>{d.flight_status}</b></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Rescue Team Markers */}
          {rescueTeams?.map((t) => (
            <Marker
              key={t.code}
              position={[t.current_lat || centerLat, t.current_lng || centerLng]}
              icon={createCustomIcon('#10b981', '#ffffff', t.name.split(' ')[2] || t.code, '🚑')}
              eventHandlers={{ click: () => setSelectedTeam(t) }}
            />
          ))}

          {/* Shelter Markers */}
          {shelters?.map((s) => (
            <Marker
              key={s.code}
              position={[s.lat || centerLat, s.lng || centerLng]}
              icon={createCustomIcon('#8b5cf6', '#ffffff', s.name.split(' ')[0], '⛺')}
            />
          ))}
        </MapContainer>

        {/* Status Lights Map Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/95 backdrop-blur-md border border-slate-800 p-3 rounded-xl text-[11px] font-mono space-y-1.5 text-slate-200 shadow-2xl max-w-xs">
          <div className="font-bold text-slate-100 uppercase tracking-wider text-xs flex items-center justify-between">
            <span>Sector Visual Status Lights</span>
            <Compass className="w-3.5 h-3.5 text-blue-400" />
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></span>
            <span>🔴 RED LIGHT = NOT CLEARED / CRITICAL</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>🟠 ORANGE LIGHT = PARTIAL / SEARCHING</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>🟢 GREEN LIGHT = FULLY CLEARED & SAFE</span>
          </div>
        </div>

        {/* Selected Sector Status Light Controller Drawer */}
        {selectedSector && (
          <div className="absolute top-4 right-4 z-[1000] bg-slate-900/95 backdrop-blur-md border border-slate-800 p-4 rounded-xl text-xs font-sans text-slate-200 shadow-2xl w-80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                Sector {selectedSector.code}: {selectedSector.name}
              </div>
              <button
                onClick={() => setSelectedSector(null)}
                className="text-slate-400 hover:text-white font-mono text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Current Light Badge */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 font-mono text-xs">Current Light Status:</span>
              <span className={`text-xs font-mono font-black px-2.5 py-1 rounded ${
                sectorStatuses[selectedSector.code] === 'GREEN' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                sectorStatuses[selectedSector.code] === 'ORANGE' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                'bg-red-950 text-red-400 border border-red-800 animate-pulse'
              }`}>
                {sectorStatuses[selectedSector.code] === 'GREEN' ? '🟢 FULLY CLEARED' :
                 sectorStatuses[selectedSector.code] === 'ORANGE' ? '🟠 PARTIAL SEARCH' :
                 '🔴 NOT CLEARED'}
              </span>
            </div>

            {/* Change Status Light Control Buttons */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-slate-400 font-bold uppercase">Change Status Light:</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => toggleSectorStatus(selectedSector.code, 'RED')}
                  className={`py-2 px-1 rounded-lg font-bold text-[10px] font-mono border transition-all ${
                    sectorStatuses[selectedSector.code] === 'RED'
                      ? 'bg-red-600 text-white border-white shadow'
                      : 'bg-red-950/40 text-red-400 border-red-800/40 hover:bg-red-900/60'
                  }`}
                >
                  🔴 Red Light (Uncleared)
                </button>

                <button
                  onClick={() => toggleSectorStatus(selectedSector.code, 'ORANGE')}
                  className={`py-2 px-1 rounded-lg font-bold text-[10px] font-mono border transition-all ${
                    sectorStatuses[selectedSector.code] === 'ORANGE'
                      ? 'bg-amber-600 text-slate-950 border-white shadow'
                      : 'bg-amber-950/40 text-amber-400 border-amber-800/40 hover:bg-amber-900/60'
                  }`}
                >
                  🟠 Orange (Partial)
                </button>

                <button
                  onClick={() => toggleSectorStatus(selectedSector.code, 'GREEN')}
                  className={`py-2 px-1 rounded-lg font-bold text-[10px] font-mono border transition-all ${
                    sectorStatuses[selectedSector.code] === 'GREEN'
                      ? 'bg-emerald-600 text-white border-white shadow'
                      : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40 hover:bg-emerald-900/60'
                  }`}
                >
                  🟢 Green Light (Cleared)
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                if (onRecalculateRoute) onRecalculateRoute('TEAM_BRAVO', selectedSector.code);
              }}
              className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
            >
              Dispatch Rescue Team Bravo To Sector
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
