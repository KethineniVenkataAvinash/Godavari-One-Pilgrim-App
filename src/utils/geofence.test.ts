import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDistanceMeters, isPointInsidePolygon, evaluateGeofence } from './geofence';
import { Zone } from '../types';

const mockSectorZone: Zone = {
  id: 'kotilingala_ghat',
  name: 'Kotilingala Ghat (1.2 km Promenade)',
  teluguName: 'కోటిలింగాల ఘాట్',
  type: 'ghat',
  capacity: 45000,
  currentCount: 38200,
  areaSqMeters: 10500,
  density: 3.64,
  status: 'WARNING',
  coordinates: { lat: 17.0089, lng: 81.7792 },
  polygon: [
    { lat: 17.0120, lng: 81.7760 },
    { lat: 17.0125, lng: 81.7810 },
    { lat: 17.0050, lng: 81.7820 },
    { lat: 17.0045, lng: 81.7770 },
  ],
};

test('calculates accurate distance between coordinates', () => {
  const d = calculateDistanceMeters(
    { lat: 17.0089, lng: 81.7792 },
    { lat: 17.0089, lng: 81.7792 }
  );
  assert.equal(d, 0);

  const d2 = calculateDistanceMeters(
    { lat: 17.0089, lng: 81.7792 },
    { lat: 17.0189, lng: 81.7792 }
  );
  assert.ok(d2 > 1000); // ~1.1km
});

test('evaluates position inside assigned sector polygon as INSIDE_SECTOR', () => {
  const evalResult = evaluateGeofence(
    { lat: 17.0089, lng: 81.7792 }, // right at center
    mockSectorZone
  );
  assert.equal(evalResult.isInside, true);
  assert.equal(evalResult.status, 'INSIDE_SECTOR');
});

test('evaluates position outside assigned sector as OUTSIDE_SECTOR_WARNING', () => {
  // Way out at Morampudi Transit Hub ~3.5km away
  const evalResult = evaluateGeofence(
    { lat: 16.9850, lng: 81.7950 },
    mockSectorZone
  );
  assert.equal(evalResult.isInside, false);
  assert.equal(evalResult.status, 'OUTSIDE_SECTOR_WARNING');
  assert.ok(evalResult.warningMessage?.includes('GEOFENCE BREACH'));
});
