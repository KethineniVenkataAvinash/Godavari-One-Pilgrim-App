export interface CrowdMetric {
  zoneId: string;
  count: number;
  areaSqMeters: number;
  previousCount?: number;
  timeDeltaMinutes?: number;
}

export interface CrowdRiskAssessment {
  zoneId: string;
  density: number; // people per sq m
  surgeRatePerHour: number;
  riskLevel: 'NORMAL' | 'MODERATE' | 'WARNING' | 'CRITICAL';
  recommendedAction: string;
  requiresOperatorIntervention: boolean;
}

export function evaluateCrowdRisk(metric: CrowdMetric): CrowdRiskAssessment {
  const density = metric.areaSqMeters > 0 ? Number((metric.count / metric.areaSqMeters).toFixed(2)) : 0;
  
  let surgeRatePerHour = 0;
  if (metric.previousCount !== undefined && metric.timeDeltaMinutes && metric.timeDeltaMinutes > 0) {
    const deltaCount = metric.count - metric.previousCount;
    surgeRatePerHour = Math.round((deltaCount / metric.timeDeltaMinutes) * 60);
  }

  // Threshold criteria (industry crowd safety standards for pushkaralu/kumbh melas):
  // Safe flow: < 2.0 persons/m²
  // Moderate: 2.0 - 2.9 persons/m²
  // Warning: 3.0 - 3.9 persons/m² OR rapid surge (>300/hr)
  // Critical: >= 4.0 persons/m² (crush danger, requires immediate holding & diversion)

  let riskLevel: 'NORMAL' | 'MODERATE' | 'WARNING' | 'CRITICAL' = 'NORMAL';
  let recommendedAction = 'Maintain standard monitoring and gate flows.';
  let requiresOperatorIntervention = false;

  if (density >= 4.0) {
    riskLevel = 'CRITICAL';
    recommendedAction = 'IMMEDIATE ACTION: Close inbound gates, open buffer holding areas, broadcast diversion alert, deploy Rapid Action Police & SDRF.';
    requiresOperatorIntervention = true;
  } else if (density >= 3.0 || surgeRatePerHour > 600) {
    riskLevel = 'WARNING';
    recommendedAction = 'WARNING: Limit incoming pilgrim ingress; dispatch volunteer crowd marshals; prepare alternate queue chutes.';
    requiresOperatorIntervention = true;
  } else if (density >= 2.0 || surgeRatePerHour > 250) {
    riskLevel = 'MODERATE';
    recommendedAction = 'MODERATE: Monitor footfall trends on CCTV; alert Ghat sanitation & first-aid teams.';
    requiresOperatorIntervention = false;
  }

  return {
    zoneId: metric.zoneId,
    density,
    surgeRatePerHour,
    riskLevel,
    recommendedAction,
    requiresOperatorIntervention,
  };
}
