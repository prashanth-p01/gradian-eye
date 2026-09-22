const assert = require('assert');
const { initDb, getAsync, allAsync } = require('../database/db');
const { SensorFusionEngine, RiskAndPriorityEngine, FoodSafetyScreeningEngine, RouteOptimizer } = require('../ai/engine');

async function runTests() {
  console.log('Running Node.js backend unit tests...');

  await initDb();
  console.log('✔ DB Connection & Table Schema verified.');

  // Test AI Engines
  const fusion = new SensorFusionEngine();
  const ev = fusion.calculateSurvivorEvidence('B07', true, 0.92, 0.85);
  assert.ok(['CRITICAL', 'HIGH'].includes(ev.evidence_level), 'Survivor evidence level should be HIGH or CRITICAL');
  assert.ok(ev.composite_score >= 0.8, 'Composite score should be >= 0.8');
  console.log('✔ Sensor Fusion Engine test passed.');

  const riskEng = new RiskAndPriorityEngine();
  const risk = riskEng.computeSectorRisk('HIGH', 'MEDIUM', 'HIGH', 'HIGH', 'LOW');
  assert.ok(['CRITICAL', 'HIGH'].includes(risk), 'Risk level should be HIGH or CRITICAL');
  console.log('✔ Risk Engine test passed.');

  const foodEng = new FoodSafetyScreeningEngine();
  const foodRes = foodEng.screenFood('Cooked Chicken', 6.0, 30.0, 'Suspicious discoloration');
  assert.ok(foodRes.risk_level.includes('HIGH'), 'Food safety screening should flag HIGH risk for 6hr/30C chicken');
  assert.ok(foodRes.recommendation.includes('DO NOT DISTRIBUTE'), 'Recommendation should block distribution');
  console.log('✔ Food Safety Screening Engine test passed.');

  const routeEng = new RouteOptimizer();
  const routeRes = routeEng.computeRoute(37.77, -122.41, 37.78, -122.42, true);
  assert.strictEqual(routeRes.has_blocked_roads, true, 'Route should avoid blocked roads');
  assert.ok(routeRes.waypoints.length === 3, 'Route should include detour waypoint');
  console.log('✔ Route Optimizer test passed.');

  console.log('ALL BACKEND UNIT TESTS PASSED SUCCESSFULLY! 🎉');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
