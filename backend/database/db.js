const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.resolve(dataDir, 'guardianeye.db');
const db = new sqlite3.Database(dbPath);

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initDb() {
  // 1. Users & Roles
  await runAsync(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'Field Volunteer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await runAsync(`CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    permissions TEXT
  )`);

  // 2. Disasters
  await runAsync(`CREATE TABLE IF NOT EXISTS disasters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'Flood',
    status TEXT DEFAULT 'ACTIVE',
    location_center_lat REAL DEFAULT 37.7749,
    location_center_lng REAL DEFAULT -122.4194,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 3. Sectors
  await runAsync(`CREATE TABLE IF NOT EXISTS sectors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    disaster_id INTEGER,
    search_status TEXT DEFAULT 'UNSEARCHED',
    risk_level TEXT DEFAULT 'LOW',
    priority_rank INTEGER DEFAULT 99,
    scanned_percentage REAL DEFAULT 0.0,
    center_lat REAL,
    center_lng REAL,
    bounds_json TEXT
  )`);

  // 4. Drones & Missions
  await runAsync(`CREATE TABLE IF NOT EXISTS drones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    model TEXT DEFAULT 'Guardian-X4',
    battery_level REAL DEFAULT 100.0,
    flight_status TEXT DEFAULT 'IDLE',
    mission_status TEXT DEFAULT 'STANDBY',
    current_lat REAL,
    current_lng REAL,
    altitude REAL DEFAULT 45.0,
    current_sector_code TEXT DEFAULT 'A01',
    speed_mps REAL DEFAULT 12.0,
    detection_count INTEGER DEFAULT 0,
    disaster_id INTEGER
  )`);

  await runAsync(`CREATE TABLE IF NOT EXISTS drone_missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drone_id INTEGER,
    sector_code TEXT NOT NULL,
    status TEXT DEFAULT 'ASSIGNED',
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
  )`);

  // 5. Detections & Tracked Objects
  await runAsync(`CREATE TABLE IF NOT EXISTS detections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drone_id INTEGER,
    sector_code TEXT,
    label TEXT NOT NULL,
    confidence REAL DEFAULT 0.92,
    bbox_json TEXT,
    lat REAL,
    lng REAL,
    tracked_object_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await runAsync(`CREATE TABLE IF NOT EXISTS tracked_objects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    persistent_id TEXT UNIQUE NOT NULL,
    label TEXT DEFAULT 'Person',
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    detection_count INTEGER DEFAULT 1,
    current_lat REAL,
    current_lng REAL,
    sector_code TEXT,
    status TEXT DEFAULT 'DETECTED'
  )`);

  // 6. Survivor Evidence & Sensor Observations
  await runAsync(`CREATE TABLE IF NOT EXISTS survivor_evidences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sector_code TEXT NOT NULL,
    object_id TEXT,
    visual_evidence TEXT DEFAULT 'Detected',
    sensor_evidence TEXT DEFAULT 'Detected',
    structural_risk TEXT DEFAULT 'High',
    previous_search TEXT DEFAULT 'Incomplete',
    composite_score REAL DEFAULT 0.85,
    evidence_level TEXT DEFAULT 'HIGH',
    status TEXT DEFAULT 'Requires Investigation',
    why_summary TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await runAsync(`CREATE TABLE IF NOT EXISTS sensor_observations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sector_code TEXT,
    sensor_type TEXT NOT NULL,
    signal_strength REAL DEFAULT 0.8,
    value_description TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 7. Risk Assessments & Priorities
  await runAsync(`CREATE TABLE IF NOT EXISTS risk_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sector_code TEXT UNIQUE NOT NULL,
    structural_risk TEXT DEFAULT 'HIGH',
    fire_risk TEXT DEFAULT 'MEDIUM',
    flood_risk TEXT DEFAULT 'HIGH',
    debris_density TEXT DEFAULT 'HIGH',
    survivor_evidence TEXT DEFAULT 'HIGH',
    road_accessibility TEXT DEFAULT 'LOW',
    overall_risk TEXT DEFAULT 'CRITICAL',
    factors_json TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await runAsync(`CREATE TABLE IF NOT EXISTS rescue_priorities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sector_code TEXT UNIQUE NOT NULL,
    priority_level TEXT DEFAULT 'CRITICAL',
    rank_order INTEGER DEFAULT 1,
    why_reasons_json TEXT,
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 8. Rescue Teams & Routes
  await runAsync(`CREATE TABLE IF NOT EXISTS rescue_teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'AVAILABLE',
    current_lat REAL,
    current_lng REAL,
    assigned_sector_code TEXT,
    equipment_json TEXT
  )`);

  await runAsync(`CREATE TABLE IF NOT EXISTS routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rescue_team_code TEXT NOT NULL,
    target_sector_code TEXT NOT NULL,
    waypoints_json TEXT,
    distance_km REAL DEFAULT 3.4,
    est_minutes REAL DEFAULT 12.0,
    has_blocked_roads INTEGER DEFAULT 0,
    is_recalculated INTEGER DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE'
  )`);

  // 9. Shelters & Relief Resources
  await runAsync(`CREATE TABLE IF NOT EXISTS shelters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    capacity INTEGER DEFAULT 200,
    occupants INTEGER DEFAULT 120,
    status TEXT DEFAULT 'SAFE',
    lat REAL,
    lng REAL,
    food_stock_days REAL DEFAULT 4.0,
    water_stock_days REAL DEFAULT 3.0,
    medical_stock TEXT DEFAULT 'ADEQUATE'
  )`);

  await runAsync(`CREATE TABLE IF NOT EXISTS relief_resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shelter_code TEXT NOT NULL,
    category TEXT NOT NULL,
    available_qty INTEGER DEFAULT 500,
    required_qty INTEGER DEFAULT 600,
    unit TEXT DEFAULT 'packages'
  )`);

  // 10. Food Safety Scans (User's original idea)
  await runAsync(`CREATE TABLE IF NOT EXISTS food_safety_scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    food_type TEXT NOT NULL,
    storage_hours REAL DEFAULT 6.0,
    temperature_c REAL DEFAULT 30.0,
    visual_indicators TEXT DEFAULT 'Suspicious discoloration',
    risk_level TEXT DEFAULT 'HIGH FOOD-SAFETY RISK',
    recommendation TEXT DEFAULT 'DO NOT DISTRIBUTE WITHOUT FOOD-SAFETY REVIEW',
    reasons_json TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 11. Alerts & Timeline & Search Coverage & Offline Queue
  await runAsync(`CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'CRITICAL',
    category TEXT DEFAULT 'SURVIVOR',
    sector_code TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read INTEGER DEFAULT 0
  )`);

  await runAsync(`CREATE TABLE IF NOT EXISTS incident_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await runAsync(`CREATE TABLE IF NOT EXISTS search_coverages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    disaster_id INTEGER,
    total_area_sqkm REAL DEFAULT 25.0,
    scanned_area_sqkm REAL DEFAULT 18.0,
    coverage_percentage REAL DEFAULT 72.0,
    unscanned_percentage REAL DEFAULT 28.0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await runAsync(`CREATE TABLE IF NOT EXISTS offline_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT UNIQUE NOT NULL,
    device_id TEXT DEFAULT 'DRONE_D01',
    type TEXT NOT NULL,
    payload_json TEXT,
    sync_status TEXT DEFAULT 'LOCAL',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
}

module.exports = {
  db,
  runAsync,
  getAsync,
  allAsync,
  initDb
};
