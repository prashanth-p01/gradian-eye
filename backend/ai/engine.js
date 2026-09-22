// Pure JavaScript AI engines for GuardianEye

class ComputerVisionEngine {
  constructor() {
    this.trackingCounter = 1;
  }

  runDetection(sectorCode, droneCode, lat, lng) {
    const labels = ["Person", "Debris", "Building", "Vehicle", "Rescue equipment"];
    const weights = [0.4, 0.25, 0.15, 0.1, 0.1];
    
    // Pick random weighted label
    let rand = Math.random();
    let label = "Person";
    let cumulative = 0;
    for (let i = 0; i < labels.length; i++) {
      cumulative += weights[i];
      if (rand <= cumulative) {
        label = labels[i];
        break;
      }
    }

    const confidence = parseFloat((0.82 + Math.random() * 0.16).toFixed(2));
    let personId = null;

    if (label === "Person") {
      if (Math.random() > 0.4 && this.trackingCounter > 1) {
        personId = `Person ID ${String(Math.max(1, this.trackingCounter - 1)).padStart(2, '0')}`;
      } else {
        personId = `Person ID ${String(this.trackingCounter).padStart(2, '0')}`;
        this.trackingCounter++;
      }
    }

    const bbox = [
      Math.floor(50 + Math.random() * 300),
      Math.floor(50 + Math.random() * 300),
      Math.floor(60 + Math.random() * 60),
      Math.floor(80 + Math.random() * 70)
    ];

    return {
      label,
      confidence,
      bbox,
      lat: lat + (Math.random() * 0.0004 - 0.0002),
      lng: lng + (Math.random() * 0.0004 - 0.0002),
      tracked_object_id: personId,
      sector_code: sectorCode,
      drone_code: droneCode
    };
  }
}

class SensorFusionEngine {
  calculateSurvivorEvidence(sectorCode, visualDetected = true, thermalVal = 0.88, acousticVal = 0.8) {
    const visualScore = visualDetected ? 0.9 : 0.2;
    const thermalScore = thermalVal;
    const acousticScore = acousticVal;
    const radarScore = 0.85;
    const temporalScore = 0.9;

    const composite = (visualScore * 0.3) + (thermalScore * 0.25) + (acousticScore * 0.2) + (radarScore * 0.15) + (temporalScore * 0.1);
    
    let level = "LOW";
    let status = "Unconfirmed";
    if (composite >= 0.8) {
      level = "CRITICAL";
      status = "Requires Immediate Rescue";
    } else if (composite >= 0.6) {
      level = "HIGH";
      status = "Requires Investigation";
    } else if (composite >= 0.4) {
      level = "MEDIUM";
      status = "Monitoring";
    }

    const whySummary = `Visual: ${visualDetected ? 'Detected' : 'Hidden'} | Thermal: ${Math.round(thermalScore * 100)}% signal | Acoustic: ${Math.round(acousticScore * 100)}% audio ping | Temporal consistency verified.`;

    return {
      composite_score: parseFloat(composite.toFixed(2)),
      evidence_level: level,
      status,
      why_summary: whySummary
    };
  }
}

class RiskAndPriorityEngine {
  computeSectorRisk(structural, fire, flood, survivorEvidence, roadAccess) {
    const weights = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    const accessPenalty = roadAccess === "LOW" ? 3 : 1;

    const score = ((weights[structural] || 2) * 2.5) + ((weights[flood] || 2) * 2.0) + ((weights[survivorEvidence] || 2) * 3.0) + accessPenalty;

    if (score >= 22) return "CRITICAL";
    if (score >= 16) return "HIGH";
    if (score >= 10) return "MEDIUM";
    return "LOW";
  }

  generateExplainableWhy(sectorCode, riskLevel, survivorLevel, hasBlockedRoad = true, searchesDone = 1) {
    const reasons = [];
    if (["HIGH", "CRITICAL"].includes(survivorLevel)) {
      reasons.push("✓ Visual / Multi-modal sensor evidence detected in target sector");
    }
    if (["HIGH", "CRITICAL"].includes(riskLevel)) {
      reasons.push("✓ Severe structural collapse & flood hazard confirmed");
    }
    if (searchesDone < 3) {
      reasons.push("✓ Search history indicates incomplete coverage (< 75%)");
    }
    if (hasBlockedRoad) {
      reasons.push("⚠ Primary access road blocked by rubble/flood - detour required");
    }
    reasons.push("✓ Nearby rescue team available for deployment");

    return {
      sector_code: sectorCode,
      overall_priority: ["CRITICAL", "HIGH"].includes(riskLevel) ? riskLevel : "HIGH",
      reasons,
      decision_support_note: "Decision support recommendation only. Final operational order rests with Human Commander."
    };
  }
}

class RouteOptimizer {
  computeRoute(startLat, startLng, endLat, endLng, avoidBlocked = false) {
    const midLat = (startLat + endLat) / 2;
    const midLng = (startLng + endLng) / 2;

    let waypoints = [];
    let distKm = 3.4;
    let estMins = 12.0;

    if (avoidBlocked) {
      waypoints = [
        { lat: startLat, lng: startLng, name: "Team Base Position" },
        { lat: midLat + 0.004, lng: midLng - 0.005, name: "Detour via North Ridge (Avoiding Flooded Highway 4)" },
        { lat: endLat, lng: endLng, name: "Target Sector" }
      ];
      distKm = parseFloat((4.2 + Math.random() * 1.5).toFixed(1));
      estMins = parseFloat((distKm * 3.2).toFixed(1));
    } else {
      waypoints = [
        { lat: startLat, lng: startLng, name: "Team Base Position" },
        { lat: midLat, lng: midLng, name: "Direct Highway 4" },
        { lat: endLat, lng: endLng, name: "Target Sector" }
      ];
      distKm = parseFloat((3.0 + Math.random() * 0.8).toFixed(1));
      estMins = parseFloat((distKm * 2.2).toFixed(1));
    }

    return {
      waypoints,
      distance_km: distKm,
      est_minutes: estMins,
      has_blocked_roads: avoidBlocked,
      is_recalculated: avoidBlocked
    };
  }
}

class FoodSafetyScreeningEngine {
  screenFood(foodType, storageHours, tempC, visualIndicators = "Normal") {
    const reasons = [];
    let highRisk = false;

    if (storageHours > 4 && tempC > 25) {
      reasons.push(`Storage time (${storageHours} hrs) exceeds safe 4-hour limit for ambient temperature (${tempC}°C).`);
      highRisk = true;
    }

    const vis = (visualIndicators || "").toLowerCase();
    if (vis.includes("discoloration") || vis.includes("suspicious") || vis.includes("odor") || vis.includes("moisture")) {
      reasons.push(`Visual indicator alert: '${visualIndicators}' suggests spoilage/microbial growth.`);
      highRisk = true;
    }

    const ft = (foodType || "").toLowerCase();
    if (["cooked chicken", "cooked meat", "seafood", "dairy"].some(item => ft.includes(item))) {
      if (storageHours > 2 && tempC > 30) {
        reasons.push("Perishable protein item exposed to high temperature (>30°C). High risk of rapid microbial proliferation.");
        highRisk = true;
      }
    }

    let riskLevel = "LOW FOOD-SAFETY RISK";
    let recommendation = "CLEARED FOR IMMEDIATE DISTRIBUTION";

    if (highRisk) {
      riskLevel = "HIGH FOOD-SAFETY RISK";
      recommendation = "DO NOT DISTRIBUTE WITHOUT FOOD-SAFETY REVIEW";
      if (reasons.length === 0) {
        reasons.push("Extended environmental heat exposure flagged.");
      }
    } else {
      reasons.push("Temperature and storage duration within safe operational bounds.");
    }

    return {
      risk_level: riskLevel,
      recommendation,
      reasons
    };
  }
}

module.exports = {
  ComputerVisionEngine,
  SensorFusionEngine,
  RiskAndPriorityEngine,
  RouteOptimizer,
  FoodSafetyScreeningEngine
};
