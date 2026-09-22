const { runAsync, getAsync, allAsync } = require('../database/db');
const { ComputerVisionEngine, SensorFusionEngine, RiskAndPriorityEngine, RouteOptimizer } = require('../ai/engine');

const cvEngine = new ComputerVisionEngine();
const fusionEngine = new SensorFusionEngine();
const riskEngine = new RiskAndPriorityEngine();
const routeOptimizer = new RouteOptimizer();

class FloodSimulationRunner {
  constructor() {
    this.stepCounter = 0;
  }

  async runStep(broadcasterFunc = null) {
    try {
      this.stepCounter++;

      // 1. Move Drone D01 & D02
      const d1 = await getAsync(`SELECT * FROM drones WHERE code = 'D01'`);
      const d2 = await getAsync(`SELECT * FROM drones WHERE code = 'D02'`);

      if (d1) {
        const newLat = d1.current_lat + (Math.random() * 0.0006 - 0.0003);
        const newLng = d1.current_lng + (Math.random() * 0.0006 - 0.0003);
        const newBatt = Math.max(5.0, d1.battery_level - 0.2);
        await runAsync(`UPDATE drones SET current_lat = ?, current_lng = ?, battery_level = ? WHERE code = 'D01'`, [newLat, newLng, newBatt]);
      }

      if (d2) {
        const newLat = d2.current_lat + (Math.random() * 0.0004 - 0.0002);
        const newLng = d2.current_lng + (Math.random() * 0.0004 - 0.0002);
        const newBatt = Math.max(5.0, d2.battery_level - 0.3);
        await runAsync(`UPDATE drones SET current_lat = ?, current_lng = ?, battery_level = ? WHERE code = 'D02'`, [newLat, newLng, newBatt]);

        // Generate detection event
        const detData = cvEngine.runDetection("B07", "D02", newLat, newLng);
        await runAsync(
          `INSERT INTO detections (drone_id, sector_code, label, confidence, bbox_json, lat, lng, tracked_object_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [d2.id, detData.sector_code, detData.label, detData.confidence, JSON.stringify(detData.bbox), detData.lat, detData.lng, detData.tracked_object_id]
        );

        if (detData.label === "Person" && detData.tracked_object_id) {
          const existingTo = await getAsync(`SELECT * FROM tracked_objects WHERE persistent_id = ?`, [detData.tracked_object_id]);
          if (existingTo) {
            await runAsync(`UPDATE tracked_objects SET detection_count = detection_count + 1, last_seen = CURRENT_TIMESTAMP WHERE persistent_id = ?`, [detData.tracked_object_id]);
          } else {
            await runAsync(
              `INSERT INTO tracked_objects (persistent_id, label, current_lat, current_lng, sector_code, status) VALUES (?, ?, ?, ?, ?, ?)`,
              [detData.tracked_object_id, "Person", detData.lat, detData.lng, "B07", "DETECTED"]
            );
          }

          // Elevate Survivor Evidence for B07
          const fusionRes = fusionEngine.calculateSurvivorEvidence("B07", true, 0.94, 0.88);
          await runAsync(
            `UPDATE survivor_evidences SET composite_score = ?, evidence_level = ?, why_summary = ? WHERE sector_code = 'B07'`,
            [fusionRes.composite_score, fusionRes.evidence_level, fusionRes.why_summary]
          );

          // Elevate Sector B07 Priority
          const whyRes = riskEngine.generateExplainableWhy("B07", "CRITICAL", "CRITICAL", true, 1);
          await runAsync(
            `UPDATE rescue_priorities SET priority_level = 'CRITICAL', rank_order = 1, why_reasons_json = ? WHERE sector_code = 'B07'`,
            [JSON.stringify(whyRes.reasons)]
          );
        }
      }

      // 2. Update Search Coverage
      const sc = await getAsync(`SELECT * FROM search_coverages LIMIT 1`);
      if (sc) {
        const newCov = Math.min(98.0, parseFloat((sc.coverage_percentage + 0.4).toFixed(1)));
        const newUnscanned = parseFloat((100.0 - newCov).toFixed(1));
        await runAsync(`UPDATE search_coverages SET coverage_percentage = ?, unscanned_percentage = ? WHERE id = ?`, [newCov, newUnscanned, sc.id]);
      }

      // 3. Add simulation event log
      if (this.stepCounter % 3 === 0) {
        await runAsync(
          `INSERT INTO incident_events (event_type, title, details) VALUES (?, ?, ?)`,
          ['SIMULATION_STEP', `Drone Sweep #${this.stepCounter}`, `Search coverage updated. D02 scouting Sector B07. Priority: CRITICAL.`]
        );
      }

      // 4. Add offline item
      await runAsync(
        `INSERT INTO offline_queue (event_id, device_id, type, payload_json, sync_status) VALUES (?, ?, ?, ?, ?)`,
        [
          `EVT-${10030 + this.stepCounter}`, 'DRONE_D02', 'TELEMETRY_PING',
          JSON.stringify({ step: this.stepCounter, timestamp: new Date().toISOString() }),
          this.stepCounter % 2 === 0 ? 'PENDING SYNC' : 'SYNCED'
        ]
      );

      if (broadcasterFunc) {
        broadcasterFunc({
          event: "TELEMETRY_UPDATE",
          step: this.stepCounter,
          coverage: sc ? sc.coverage_percentage : 72.0
        });
      }
    } catch (err) {
      console.error('Error in simulation step:', err);
    }
  }
}

const simulationRunner = new FloodSimulationRunner();

module.exports = { simulationRunner };
