const { initDb, runAsync, getAsync } = require('./db');

async function seed() {
  await initDb();
  console.log('Seeding Node.js SQLite database...');

  const existingDisaster = await getAsync('SELECT * FROM disasters LIMIT 1');
  if (existingDisaster) {
    console.log('Database already seeded.');
    return;
  }

  // 1. Roles & Default User
  const roles = [
    'Emergency Commander', 'Rescue Team', 'Drone Operator',
    'Field Volunteer', 'Relief Coordinator', 'Analyst', 'Administrator'
  ];
  for (const r of roles) {
    await runAsync('INSERT OR IGNORE INTO roles (name, permissions) VALUES (?, ?)', [r, 'READ,WRITE,EXECUTE']);
  }
  await runAsync('INSERT OR IGNORE INTO users (username, email, role) VALUES (?, ?, ?)', [
    'commander_sarah', 'sarah.cmd@guardianeye.org', 'Emergency Commander'
  ]);

  // 2. Disaster
  await runAsync(`INSERT INTO disasters (name, type, status, location_center_lat, location_center_lng) VALUES (?, ?, ?, ?, ?)`, [
    'Metro Flood & Structural Collapse 2026', 'Flood', 'ACTIVE', 37.7749, -122.4194
  ]);

  // 3. Sectors (A01 - C12)
  const sectorCodes = [
    ["A01", "North Ridge High"], ["A02", "North Commercial Hub"], ["A03", "East River Basin"], ["A04", "East Suburb"],
    ["B05", "Central Mall Ruins"], ["B06", "Bridge Highway 4"], ["B07", "Industrial Park B7"], ["B08", "South Railway Yard"],
    ["C09", "West Residential Zone"], ["C10", "Civic Center Plaza"], ["C11", "South Flood Barrier"], ["C12", "East Relief Camp"]
  ];

  const baseLat = 37.7749;
  const baseLng = -122.4194;

  for (let idx = 0; idx < sectorCodes.length; idx++) {
    const [code, name] = sectorCodes[idx];
    const row = Math.floor(idx / 4);
    const col = idx % 4;
    const cLat = baseLat + (row * 0.008) - 0.008;
    const cLng = baseLng + (col * 0.008) - 0.012;

    const risk = code === 'B07' ? 'CRITICAL' : (['A03', 'C11'].includes(code) ? 'HIGH' : 'MEDIUM');
    const status = code === 'B07' ? 'CRITICAL' : (['A01', 'D03'].includes(code) ? 'SEARCHING' : 'UNSEARCHED');
    const bounds = JSON.stringify([
      [cLat - 0.003, cLng - 0.003],
      [cLat + 0.003, cLng + 0.003]
    ]);

    await runAsync(
      `INSERT INTO sectors (code, name, disaster_id, search_status, risk_level, priority_rank, scanned_percentage, center_lat, center_lng, bounds_json)
       VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?)`,
      [code, name, status, risk, code === 'B07' ? 1 : idx + 2, code === 'B07' ? 45.0 : (code === 'A01' ? 80.0 : 10.0), cLat, cLng, bounds]
    );
  }

  // 4. Drones
  await runAsync(
    `INSERT INTO drones (code, model, battery_level, flight_status, mission_status, current_lat, current_lng, altitude, current_sector_code, speed_mps, detection_count, disaster_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    ['D01', 'Guardian Thermal-X', 78.0, 'SEARCHING', 'SEARCH_MISSION', baseLat + 0.001, baseLng - 0.002, 45.0, 'A01', 14.0, 12]
  );
  await runAsync(
    `INSERT INTO drones (code, model, battery_level, flight_status, mission_status, current_lat, current_lng, altitude, current_sector_code, speed_mps, detection_count, disaster_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    ['D02', 'Guardian Scout-V2', 32.0, 'PRIORITY_INVESTIGATION', 'PRIORITY_SURVEY', baseLat, baseLng, 38.0, 'B07', 10.0, 18]
  );
  await runAsync(
    `INSERT INTO drones (code, model, battery_level, flight_status, mission_status, current_lat, current_lng, altitude, current_sector_code, speed_mps, detection_count, disaster_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    ['D03', 'Guardian Heavy-Cargo', 15.0, 'RETURNING', 'RETURN_TO_BASE', baseLat - 0.006, baseLng + 0.004, 25.0, 'C11', 8.0, 5]
  );

  // 5. Tracked Objects & Detections
  await runAsync(
    `INSERT INTO tracked_objects (persistent_id, label, detection_count, current_lat, current_lng, sector_code, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Person ID 07', 'Person', 8, baseLat, baseLng, 'B07', 'DETECTED']
  );
  await runAsync(
    `INSERT INTO tracked_objects (persistent_id, label, detection_count, current_lat, current_lng, sector_code, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Person ID 12', 'Person', 4, baseLat + 0.008, baseLng - 0.012, 'A01', 'RESCUED']
  );

  await runAsync(
    `INSERT INTO detections (drone_id, sector_code, label, confidence, bbox_json, lat, lng, tracked_object_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [2, 'B07', 'Person', 0.94, JSON.stringify([120, 180, 80, 120]), baseLat, baseLng, 'Person ID 07']
  );

  // 6. Survivor Evidence
  await runAsync(
    `INSERT INTO survivor_evidences (sector_code, object_id, visual_evidence, sensor_evidence, structural_risk, previous_search, composite_score, evidence_level, status, why_summary)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'B07', 'Person ID 07', 'Detected under canopy', 'Thermal signal + Acoustic ping detected',
      'HIGH', 'Incomplete', 0.91, 'CRITICAL', 'Requires Immediate Rescue',
      'Sector B07: Visual evidence (Person ID 07) + Thermal signal 88% + High structural collapse risk.'
    ]
  );

  // 7. Risk & Priority
  await runAsync(
    `INSERT INTO risk_assessments (sector_code, structural_risk, fire_risk, flood_risk, debris_density, survivor_evidence, road_accessibility, overall_risk, factors_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'B07', 'HIGH', 'MEDIUM', 'HIGH', 'HIGH', 'HIGH', 'LOW', 'CRITICAL',
      JSON.stringify({ structural: 'Structural collapse reported', flood: 'Water depth 1.4m and rising', access: 'Highway 4 bridge flooded' })
    ]
  );

  await runAsync(
    `INSERT INTO rescue_priorities (sector_code, priority_level, rank_order, why_reasons_json)
     VALUES (?, ?, ?, ?)`,
    [
      'B07', 'CRITICAL', 1,
      JSON.stringify([
        '✓ Visual evidence of trapped person (Person ID 07)',
        '✓ Multi-modal sensor fusion composite score 91%',
        '✓ Structural collapse detected in Sector B07',
        '⚠ High flood hazard & limited road access'
      ])
    ]
  );

  // 8. Rescue Teams & Routes
  await runAsync(
    `INSERT INTO rescue_teams (code, name, status, current_lat, current_lng, assigned_sector_code, equipment_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['TEAM_ALPHA', 'Rescue Team Alpha (Heavy Urban SAR)', 'AVAILABLE', baseLat - 0.008, baseLng - 0.012, null, JSON.stringify(['Acoustic Locators', 'Hydraulic Cutters', 'Skiffs'])]
  );
  await runAsync(
    `INSERT INTO rescue_teams (code, name, status, current_lat, current_lng, assigned_sector_code, equipment_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['TEAM_BRAVO', 'Rescue Team Bravo (Rapid Swift Water)', 'DEPLOYED', baseLat + 0.002, baseLng + 0.004, 'B07', JSON.stringify(['Rescue Boats', 'Sonar Unit', 'Medical Resuscitator'])]
  );

  await runAsync(
    `INSERT INTO routes (rescue_team_code, target_sector_code, waypoints_json, distance_km, est_minutes, has_blocked_roads, is_recalculated, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'TEAM_BRAVO', 'B07',
      JSON.stringify([
        { lat: baseLat + 0.002, lng: baseLng + 0.004, name: 'Team Base' },
        { lat: baseLat + 0.005, lng: baseLng - 0.002, name: 'North Detour (Avoiding Flooded Highway 4)' },
        { lat: baseLat, lng: baseLng, name: 'Target Sector B07' }
      ]),
      4.2, 14.0, 1, 1, 'ACTIVE'
    ]
  );

  // 9. Shelters & Relief Resources
  await runAsync(
    `INSERT INTO shelters (name, code, capacity, occupants, status, lat, lng, food_stock_days, water_stock_days, medical_stock)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['North High School Relief Shelter', 'SHELTER_NORTH', 250, 240, 'NEAR CAPACITY', baseLat + 0.008, baseLng - 0.008, 2.5, 2.0, 'ADEQUATE']
  );
  await runAsync(
    `INSERT INTO shelters (name, code, capacity, occupants, status, lat, lng, food_stock_days, water_stock_days, medical_stock)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['Central Stadium Complex', 'SHELTER_CENTRAL', 600, 310, 'SAFE', baseLat - 0.004, baseLng - 0.004, 6.0, 5.0, 'FULL']
  );
  await runAsync(
    `INSERT INTO shelters (name, code, capacity, occupants, status, lat, lng, food_stock_days, water_stock_days, medical_stock)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['West Civic Gym', 'SHELTER_WEST', 150, 150, 'FULL', baseLat, baseLng - 0.015, 1.0, 1.5, 'CRITICAL']
  );

  // 10. Food Safety Scan (User's original idea)
  await runAsync(
    `INSERT INTO food_safety_scans (food_type, storage_hours, temperature_c, visual_indicators, risk_level, recommendation, reasons_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'Cooked Chicken Relief Meals', 6.0, 30.0, 'Slight surface moisture and elevated temperature',
      'HIGH FOOD-SAFETY RISK', 'DO NOT DISTRIBUTE WITHOUT FOOD-SAFETY REVIEW',
      JSON.stringify([
        'Storage time (6.0 hrs) exceeds safe 4-hour limit for ambient 30.0°C temperature.',
        'High bacterial growth risk for perishable cooked protein.'
      ])
    ]
  );

  // 11. Alerts & Timeline & Coverage
  await runAsync(
    `INSERT INTO alerts (title, message, severity, category, sector_code) VALUES (?, ?, ?, ?, ?)`,
    ['Potential Survivor Detected', 'Drone D02 identified Person ID 07 in Sector B07.', 'CRITICAL', 'SURVIVOR', 'B07']
  );
  await runAsync(
    `INSERT INTO alerts (title, message, severity, category, sector_code) VALUES (?, ?, ?, ?, ?)`,
    ['Low Battery Warning', 'Drone D03 battery dropped below 15%. Return to base recommended.', 'WARNING', 'DRONE', 'C11']
  );

  await runAsync(`INSERT INTO search_coverages (disaster_id, total_area_sqkm, scanned_area_sqkm, coverage_percentage, unscanned_percentage) VALUES (1, 25.0, 18.0, 72.0, 28.0)`);

  await runAsync(
    `INSERT INTO incident_events (event_type, title, details) VALUES (?, ?, ?)`,
    ['DISASTER_START', 'Metro Flood 2026 Activated', 'Disaster response protocol initiated. 3 drones deployed.']
  );
  await runAsync(
    `INSERT INTO incident_events (event_type, title, details) VALUES (?, ?, ?)`,
    ['DETECTION', 'Person Detected in Sector B07', 'Drone D02 confirmed Person ID 07 under structural overhang.']
  );

  console.log('Seeding completed successfully!');
}

seed().catch(err => {
  console.error('Seeding error:', err);
});
