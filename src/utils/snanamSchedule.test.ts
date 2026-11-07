import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateGhatWaitTime, getBestGhatRecommendation, SACRED_MUHURTHAMS } from './snanamSchedule';
import { Zone } from '../types';

const mockZones: Zone[] = [
  {
    id: 'pushkar_ghat',
    name: 'Pushkar Ghat (Main Central)',
    teluguName: 'పుష్కర్ ఘాట్',
    type: 'ghat',
    capacity: 25000,
    currentCount: 22000,
    areaSqMeters: 6000,
    density: 3.66,
    status: 'WARNING',
    coordinates: { lat: 16.9984, lng: 81.7754 },
    polygon: []
  },
  {
    id: 'markandeya_ghat',
    name: 'Markandeya Ancient Ghat',
    teluguName: 'మార్కండేయ ఘాట్',
    type: 'ghat',
    capacity: 18000,
    currentCount: 4000,
    areaSqMeters: 5000,
    density: 0.8,
    status: 'NORMAL',
    coordinates: { lat: 16.9930, lng: 81.7725 },
    polygon: []
  }
];

test('SACRED_MUHURTHAMS contains essential Pushkaralu slots', () => {
  assert.equal(SACRED_MUHURTHAMS.length >= 4, true);
  const brahma = SACRED_MUHURTHAMS.find(m => m.id === 'brahma');
  assert.ok(brahma);
  assert.equal(brahma.startHour24, 4);
});

test('calculateGhatWaitTime accurately calculates higher wait for crowded ghat', () => {
  const busyStatus = calculateGhatWaitTime(mockZones[0]);
  const lightStatus = calculateGhatWaitTime(mockZones[1]);

  assert.ok(busyStatus.estimatedWaitMinutes > lightStatus.estimatedWaitMinutes);
  assert.equal(lightStatus.crowdLevel, 'LIGHT');
  assert.equal(busyStatus.crowdLevel, 'CRITICAL_HOLD');
});

test('getBestGhatRecommendation selects the ghat with least wait time', () => {
  const best = getBestGhatRecommendation(mockZones);
  assert.ok(best);
  assert.equal(best.zoneId, 'markandeya_ghat');
});
