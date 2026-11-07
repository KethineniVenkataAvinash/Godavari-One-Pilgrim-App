import { Coordinates, Zone } from '../types';

/**
 * Calculates Great-Circle distance between two coordinates in meters (Haversine formula).
 */
export function calculateDistanceMeters(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Ray-casting algorithm to determine if a point is inside a polygon.
 */
export function isPointInsidePolygon(point: Coordinates, polygon: Coordinates[]): boolean {
  if (!polygon || polygon.length < 3) return false;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat;
    const yi = polygon[i].lng;
    const xj = polygon[j].lat;
    const yj = polygon[j].lng;

    const intersect =
      yi > point.lng !== yj > point.lng &&
      point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

export interface GeofenceEvaluation {
  isInside: boolean;
  distanceFromCenterMeters: number;
  assignedZoneName: string;
  assignedZoneId: string;
  status: 'INSIDE_SECTOR' | 'OUTSIDE_SECTOR_WARNING';
  warningMessage?: string;
}

/**
 * Evaluates whether current user coordinates are inside their assigned sector zone.
 * Uses polygon inclusion if zone polygon is defined; otherwise uses a radius boundary (e.g. 500m).
 */
export function evaluateGeofence(
  currentLocation: Coordinates,
  assignedZone: Zone,
  fallbackRadiusMeters: number = 650
): GeofenceEvaluation {
  const dist = calculateDistanceMeters(currentLocation, assignedZone.coordinates);

  let isInside = false;
  if (assignedZone.polygon && assignedZone.polygon.length >= 3) {
    // If inside polygon or very close to center within 250m buffer
    isInside = isPointInsidePolygon(currentLocation, assignedZone.polygon) || dist <= 250;
  } else {
    isInside = dist <= fallbackRadiusMeters;
  }

  const assignedZoneName = assignedZone.name;
  const assignedZoneId = assignedZone.id;

  if (isInside) {
    return {
      isInside: true,
      distanceFromCenterMeters: dist,
      assignedZoneName,
      assignedZoneId,
      status: 'INSIDE_SECTOR',
    };
  }

  return {
    isInside: false,
    distanceFromCenterMeters: dist,
    assignedZoneName,
    assignedZoneId,
    status: 'OUTSIDE_SECTOR_WARNING',
    warningMessage: ` GEOFENCE BREACH: You are ${dist}m away, moving OUTSIDE your assigned sector (${assignedZoneName}). Please return to your duty area immediately.`,
  };
}
