import { calculateDistanceMeters } from '../utils/geofence';
import { Facility, Coordinates } from '../types';

export interface GhatCameraInfo {
  id: string;
  name: string;
  density: number;
  fps: number;
  resolution: string;
  angle: string;
}

export interface GhatStreamProfile {
  ghatId: string;
  displayName: string;
  defaultCameraId: string;
  cameras: GhatCameraInfo[];
}

/**
 * Pure helper logic to match user's assigned ghat to its official surveillance cameras and streaming channels
 */
export function getGhatStreamCameras(assignedGhat: string): GhatStreamProfile {
  const norm = (assignedGhat || '').toLowerCase();
  if (norm.includes('pushkar')) {
    return {
      ghatId: 'pushkar_ghat',
      displayName: 'Pushkar Ghat (Main & VIP)',
      defaultCameraId: 'cam-pg-01',
      cameras: [
        { id: 'cam-pg-01', name: 'Main Bathing Steps & Arati Mandapam', density: 2.7, fps: 25, resolution: '1080p', angle: 'STEPS_WIDE' },
        { id: 'cam-pg-02', name: 'Iron Chain River Barricade & Flow Sentinel', density: 2.1, fps: 25, resolution: '1080p', angle: 'RIVER_BARRIER' },
        { id: 'cam-pg-03', name: 'Swayam Snanam Arrival Corridor & Elder Ramp', density: 3.2, fps: 25, resolution: '1080p', angle: 'RAMP_CORRIDOR' }
      ]
    };
  }
  if (norm.includes('kotilingala')) {
    return {
      ghatId: 'kotilingala_ghat',
      displayName: 'Kotilingala Ghat (Mega Bathing Bank)',
      defaultCameraId: 'cam-kt-02',
      cameras: [
        { id: 'cam-kt-02', name: 'Promenade Centre (1.2km Broadwalk)', density: 3.6, fps: 25, resolution: '1080p', angle: 'PROMENADE' },
        { id: 'cam-kt-05', name: 'North Bathing Wing & Changing Cubicles', density: 2.9, fps: 25, resolution: '1080p', angle: 'NORTH_WING' },
        { id: 'cam-kt-06', name: 'Deep Silt Safety Buoy Boundary', density: 1.8, fps: 25, resolution: '1080p', angle: 'BUOY_LINE' }
      ]
    };
  }
  if (norm.includes('saraswati')) {
    return {
      ghatId: 'saraswati_ghat',
      displayName: 'Saraswati Ghat & ISKCON Area',
      defaultCameraId: 'cam-sw-03',
      cameras: [
        { id: 'cam-sw-03', name: 'Water Margin & ISKCON Stairs', density: 4.4, fps: 25, resolution: '1080p', angle: 'STAIRS' },
        { id: 'cam-sw-08', name: 'Senior Citizen Wheelchair Ramp Gate', density: 2.5, fps: 25, resolution: '1080p', angle: 'ELDER_GATE' }
      ]
    };
  }
  // Default to Markandeya
  return {
    ghatId: 'markandeya_ghat',
    displayName: 'Markandeya Ancient Ghat',
    defaultCameraId: 'cam-mk-04',
    cameras: [
      { id: 'cam-mk-04', name: 'Ancient Temple Courtyard & Steps', density: 1.6, fps: 25, resolution: '1080p', angle: 'COURTYARD' },
      { id: 'cam-mk-12', name: 'Low Current River Steps', density: 1.2, fps: 25, resolution: '1080p', angle: 'SHALLOW_RIVER' }
    ]
  };
}

export interface NearbyAmenityWithDistance {
  facility: Facility;
  distanceMeters: number;
  walkMinutes: number;
}

/**
 * Filter and sort nearby amenities relative to user GPS location
 */
export function findNearbyAmenities(
  facilities: Facility[],
  userLocation: Coordinates,
  maxRadiusMeters = 2000,
  filterType = 'ALL'
): NearbyAmenityWithDistance[] {
  return facilities
    .filter(fac => {
      if (filterType !== 'ALL' && fac.type !== filterType) return false;
      return true;
    })
    .map(facility => {
      const distanceMeters = Math.round(calculateDistanceMeters(userLocation, facility.location));
      // Average walking speed in festival crowd: ~1.0 - 1.2 m/s -> approx 65 meters per minute
      const walkMinutes = Math.max(1, Math.round(distanceMeters / 65));
      return { facility, distanceMeters, walkMinutes };
    })
    .filter(item => item.distanceMeters <= maxRadiusMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}
