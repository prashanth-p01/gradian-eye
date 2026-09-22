const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const { initDb, runAsync, getAsync, allAsync } = require('./database/db');
const { simulationRunner } = require('./simulations/floodRunner');
const { FoodSafetyScreeningEngine, RouteOptimizer } = require('./ai/engine');
const { supabaseManager } = require('./database/supabaseClient');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

const foodEngine = new FoodSafetyScreeningEngine();
const routeOptimizer = new RouteOptimizer();

const connectedClients = new Set();

wss.on('connection', (ws) => {
  connectedClients.add(ws);
  ws.send(JSON.stringify({ type: 'CONNECTION_ESTABLISHED', message: 'Connected to GuardianEye Realtime Engine' }));
  
  ws.on('close', () => {
    connectedClients.delete(ws);
  });
});

function broadcast(data) {
  const jsonString = JSON.stringify(data);
  for (const client of connectedClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(jsonString);
    }
  }
}

// REST Endpoints
app.get('/api/status', async (req, res) => {
  try {
    const sc = await getAsync(`SELECT * FROM search_coverages LIMIT 1`);
    const offlineItems = await getAsync(`SELECT COUNT(*) as cnt FROM offline_queue WHERE sync_status = 'PENDING SYNC'`);
    const unreadAlerts = await getAsync(`SELECT COUNT(*) as cnt FROM alerts WHERE is_read = 0`);
    const activeDrones = await getAsync(`SELECT COUNT(*) as cnt FROM drones WHERE flight_status != 'OFFLINE'`);
    const personsDetected = await getAsync(`SELECT COUNT(*) as cnt FROM tracked_objects WHERE label = 'Person'`);
    const criticalZones = await getAsync(`SELECT COUNT(*) as cnt FROM sectors WHERE risk_level = 'CRITICAL'`);
    const fullShelters = await getAsync(`SELECT COUNT(*) as cnt FROM shelters WHERE occupants >= capacity`);

    res.json({
      internet_status: "OFFLINE",
      edge_ai_status: "ACTIVE",
      local_database: "ACTIVE",
      gps_status: "AVAILABLE",
      sync_queue_count: offlineItems ? offlineItems.cnt : 0,
      unread_alerts: unreadAlerts ? unreadAlerts.cnt : 0,
      coverage_percentage: sc ? sc.coverage_percentage : 72.0,
      active_drones: activeDrones ? activeDrones.cnt : 3,
      persons_detected: personsDetected ? personsDetected.cnt : 2,
      critical_zones: criticalZones ? criticalZones.cnt : 1,
      shelters_at_capacity: fullShelters ? fullShelters.cnt : 1
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/disasters', async (req, res) => {
  const data = await allAsync('SELECT * FROM disasters');
  res.json(data);
});

app.get('/api/sectors', async (req, res) => {
  const sectors = await allAsync('SELECT * FROM sectors ORDER BY priority_rank ASC');
  const result = sectors.map(s => ({
    ...s,
    bounds: s.bounds_json ? JSON.parse(s.bounds_json) : []
  }));
  res.json(result);
});

app.get('/api/drones', async (req, res) => {
  const drones = await allAsync('SELECT * FROM drones');
  res.json(drones);
});

app.get('/api/detections', async (req, res) => {
  const detections = await allAsync('SELECT * FROM detections ORDER BY timestamp DESC LIMIT 50');
  res.json(detections);
});

app.post('/api/detections', async (req, res) => {
  const { drone_code, sector_code, label, confidence, lat, lng, bbox, tracked_object_id } = req.body;
  const drone = await getAsync('SELECT id FROM drones WHERE code = ?', [drone_code]);
  const droneId = drone ? drone.id : 1;

  const result = await runAsync(
    `INSERT INTO detections (drone_id, sector_code, label, confidence, bbox_json, lat, lng, tracked_object_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [droneId, sector_code, label, confidence || 0.92, JSON.stringify(bbox || [100, 100, 50, 50]), lat, lng, tracked_object_id]
  );

  if (label === 'Person' && tracked_object_id) {
    const existing = await getAsync('SELECT * FROM tracked_objects WHERE persistent_id = ?', [tracked_object_id]);
    if (existing) {
      await runAsync('UPDATE tracked_objects SET detection_count = detection_count + 1, last_seen = CURRENT_TIMESTAMP WHERE persistent_id = ?', [tracked_object_id]);
    } else {
      await runAsync('INSERT INTO tracked_objects (persistent_id, label, current_lat, current_lng, sector_code, status) VALUES (?, ?, ?, ?, ?, ?)', [
        tracked_object_id, 'Person', lat, lng, sector_code, 'DETECTED'
      ]);
    }
  }

  res.json({ id: result.lastID, message: 'Detection ingested successfully' });
});

app.get('/api/survivors', async (req, res) => {
  const evidences = await allAsync('SELECT * FROM survivor_evidences');
  const tracked = await allAsync('SELECT * FROM tracked_objects');
  res.json({ evidences, tracked_objects: tracked });
});

app.get('/api/risk-priority', async (req, res) => {
  const priorities = await allAsync('SELECT * FROM rescue_priorities ORDER BY rank_order ASC');
  const assessments = await allAsync('SELECT * FROM risk_assessments');
  
  const result = priorities.map(p => {
    const ass = assessments.find(a => a.sector_code === p.sector_code);
    return {
      sector_code: p.sector_code,
      priority_level: p.priority_level,
      rank_order: p.rank_order,
      why_reasons: p.why_reasons_json ? JSON.parse(p.why_reasons_json) : [],
      structural_risk: ass ? ass.structural_risk : 'HIGH',
      flood_risk: ass ? ass.flood_risk : 'HIGH',
      overall_risk: ass ? ass.overall_risk : p.priority_level
    };
  });
  res.json(result);
});

app.get('/api/rescue-teams', async (req, res) => {
  const teams = await allAsync('SELECT * FROM rescue_teams');
  const result = teams.map(t => ({
    ...t,
    equipment: t.equipment_json ? JSON.parse(t.equipment_json) : []
  }));
  res.json(result);
});

app.get('/api/routes', async (req, res) => {
  const routes = await allAsync('SELECT * FROM routes');
  const result = routes.map(r => ({
    ...r,
    waypoints: r.waypoints_json ? JSON.parse(r.waypoints_json) : []
  }));
  res.json(result);
});

app.post('/api/routes/recalculate', async (req, res) => {
  const { team_code, target_sector, avoid_blocked } = req.query;
  const team = await getAsync('SELECT * FROM rescue_teams WHERE code = ?', [team_code || 'TEAM_BRAVO']);
  const sector = await getAsync('SELECT * FROM sectors WHERE code = ?', [target_sector || 'B07']);

  if (!team || !sector) {
    return res.status(404).json({ error: 'Team or sector not found' });
  }

  const routeData = routeOptimizer.computeRoute(
    team.current_lat, team.current_lng,
    sector.center_lat, sector.center_lng,
    avoid_blocked === 'true' || avoid_blocked === true
  );

  await runAsync(
    `UPDATE routes SET waypoints_json = ?, distance_km = ?, est_minutes = ?, has_blocked_roads = 1, is_recalculated = 1, status = 'RECALCULATED'
     WHERE rescue_team_code = ?`,
    [JSON.stringify(routeData.waypoints), routeData.distance_km, routeData.est_minutes, team_code || 'TEAM_BRAVO']
  );

  await runAsync(
    `INSERT INTO incident_events (event_type, title, details) VALUES (?, ?, ?)`,
    ['ROUTE_RECALC', `Route Recalculated for ${team.name}`, `Detour path active avoiding flooded Highway 4. Est: ${routeData.distance_km} km.`]
  );

  res.json({ message: 'Route recalculated successfully', route: routeData });
});

app.get('/api/shelters', async (req, res) => {
  const shelters = await allAsync('SELECT * FROM shelters');
  const resources = await allAsync('SELECT * FROM relief_resources');
  
  const result = shelters.map(s => ({
    ...s,
    available_space: Math.max(0, s.capacity - s.occupants),
    resources: resources.filter(r => r.shelter_code === s.code)
  }));
  res.json(result);
});

app.post('/api/food-safety/scan', async (req, res) => {
  const { food_type, storage_hours, temperature_c, visual_indicators } = req.body;
  const evaluation = foodEngine.screenFood(food_type, storage_hours, temperature_c, visual_indicators);

  const result = await runAsync(
    `INSERT INTO food_safety_scans (food_type, storage_hours, temperature_c, visual_indicators, risk_level, recommendation, reasons_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [food_type, storage_hours, temperature_c, visual_indicators || 'Normal', evaluation.risk_level, evaluation.recommendation, JSON.stringify(evaluation.reasons)]
  );

  if (evaluation.risk_level.includes('HIGH')) {
    await runAsync(
      `INSERT INTO alerts (title, message, severity, category) VALUES (?, ?, ?, ?)`,
      ['Food Safety Risk Alert', `${food_type}: ${evaluation.risk_level}. ${evaluation.recommendation}`, 'CRITICAL', 'FOOD_SAFETY']
    );
  }

  res.json({
    id: result.lastID,
    food_type,
    storage_hours,
    temperature_c,
    visual_indicators,
    risk_level: evaluation.risk_level,
    recommendation: evaluation.recommendation,
    reasons: evaluation.reasons,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/alerts', async (req, res) => {
  const alerts = await allAsync('SELECT * FROM alerts ORDER BY timestamp DESC');
  res.json(alerts);
});

app.get('/api/timeline', async (req, res) => {
  const events = await allAsync('SELECT * FROM incident_events ORDER BY timestamp DESC');
  res.json(events);
});

app.get('/api/offline-queue', async (req, res) => {
  const items = await allAsync('SELECT * FROM offline_queue ORDER BY timestamp DESC');
  const result = items.map(i => ({
    ...i,
    payload: i.payload_json ? JSON.parse(i.payload_json) : {}
  }));
  res.json(result);
});

app.post('/api/simulation/step', async (req, res) => {
  await simulationRunner.runStep(broadcast);
  res.json({ message: 'Simulation step executed' });
});

app.get('/api/supabase/status', (req, res) => {
  res.json({
    is_connected: supabaseManager.isConnected,
    url: supabaseManager.url,
    status: supabaseManager.isConnected ? 'CONNECTED' : 'STANDBY'
  });
});

app.post('/api/supabase/config', async (req, res) => {
  const { url, key } = req.body;
  supabaseManager.configure(url, key);
  const testRes = await supabaseManager.testConnection();
  res.json(testRes);
});

app.post('/api/supabase/sync', async (req, res) => {
  const detections = await allAsync('SELECT * FROM detections');
  const survivors = await allAsync('SELECT * FROM survivor_evidences');
  const result = await supabaseManager.syncLocalToCloud(detections, survivors);
  res.json(result);
});

// Initialize database and start server
const PORT = process.env.PORT || 5000;
initDb().then(() => {
  // Auto-seed if needed
  const seedScript = require('./database/seed');
  server.listen(PORT, () => {
    console.log(`GuardianEye Node.js backend server listening on http://localhost:${PORT}`);
  });
});
