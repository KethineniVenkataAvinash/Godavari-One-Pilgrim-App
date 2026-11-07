import test from 'node:test';
import assert from 'node:assert/strict';
import { getGhatStreamCameras, findNearbyAmenities } from './homeDashboardWidgets';
import { Facility, Coordinates } from '../types';

test('Ghat Live Stream: matches Pushkar Ghat assigned profile to cam-pg-01 with angles', () => {
  const result = getGhatStreamCameras('Pushkar Ghat (Main & VIP)');
  assert.equal(result.ghatId, 'pushkar_ghat');
  assert.equal(result.defaultCameraId, 'cam-pg-01');
  assert.ok(result.cameras.length >= 3);
  assert.equal(result.cameras[0].id, 'cam-pg-01');
});

test('Ghat Live Stream: matches Kotilingala Ghat assigned profile to cam-kt-02', () => {
  const result = getGhatStreamCameras('Kotilingala Mega Bathing Bank');
  assert.equal(result.ghatId, 'kotilingala_ghat');
  assert.equal(result.defaultCameraId, 'cam-kt-02');
  assert.ok(result.cameras.length >= 3);
});

test('Ghat Live Stream: matches Saraswati Ghat assigned profile to cam-sw-03', () => {
  const result = getGhatStreamCameras('Saraswati Ghat & ISKCON Area');
  assert.equal(result.ghatId, 'saraswati_ghat');
  assert.equal(result.defaultCameraId, 'cam-sw-03');
  assert.equal(result.cameras[0].density, 4.4);
});

test('Nearby Amenities: sorts facilities strictly ascending by distance from user GPS', () => {
  const userLoc: Coordinates = { lat: 17.0010, lng: 81.7760 };
  const mockFacilities: Facility[] = [
    {
      id: 'fac-far',
      zoneId: 'zone-1',
      name: 'Far Shuttle Terminal',
      teluguName: 'దూరపు బస్ టెర్మినల్',
      type: 'SHUTTLE_STOP',
      location: { lat: 17.0150, lng: 81.7890 },
      status: 'OPERATIONAL'
    },
    {
      id: 'fac-close',
      zoneId: 'zone-1',
      name: 'Close Drinking Water',
      teluguName: 'సమీప త్రాగునీరు',
      type: 'WATER_POINT',
      location: { lat: 17.0012, lng: 81.7763 },
      status: 'OPERATIONAL'
    },
    {
      id: 'fac-mid',
      zoneId: 'zone-1',
      name: 'Mid First Aid',
      teluguName: 'ప్రథమ చికిత్స',
      type: 'FIRST_AID',
      location: { lat: 17.0035, lng: 81.7770 },
      status: 'OPERATIONAL'
    }
  ];

  const nearby = findNearbyAmenities(mockFacilities, userLoc, 5000, 'ALL');
  assert.equal(nearby.length, 3);
  assert.equal(nearby[0].facility.id, 'fac-close');
  assert.equal(nearby[1].facility.id, 'fac-mid');
  assert.equal(nearby[2].facility.id, 'fac-far');
});

test('Nearby Amenities: filters out facilities beyond max radius limit', () => {
  const userLoc: Coordinates = { lat: 17.0010, lng: 81.7760 };
  const mockFacilities: Facility[] = [
    {
      id: 'fac-within',
      zoneId: 'zone-1',
      name: 'Close Water Point',
      teluguName: 'సమీప వాటర్',
      type: 'WATER_POINT',
      location: { lat: 17.0015, lng: 81.7765 },
      status: 'OPERATIONAL'
    },
    {
      id: 'fac-outside',
      zoneId: 'zone-1',
      name: 'Distant Camp',
      teluguName: 'దూరపు క్యాంప్',
      type: 'PARKING',
      location: { lat: 17.0500, lng: 81.8500 },
      status: 'OPERATIONAL'
    }
  ];

  const nearby = findNearbyAmenities(mockFacilities, userLoc, 500, 'ALL');
  assert.equal(nearby.length, 1);
  assert.equal(nearby[0].facility.id, 'fac-within');
});

test('Nearby Amenities: filters by specific category', () => {
  const userLoc: Coordinates = { lat: 17.0010, lng: 81.7760 };
  const mockFacilities: Facility[] = [
    {
      id: 'fac-1',
      zoneId: 'zone-1',
      name: 'Water Point',
      teluguName: 'వాటర్',
      type: 'WATER_POINT',
      location: { lat: 17.0015, lng: 81.7765 },
      status: 'OPERATIONAL'
    },
    {
      id: 'fac-2',
      zoneId: 'zone-1',
      name: 'Medical Post',
      teluguName: 'మెడికల్',
      type: 'FIRST_AID',
      location: { lat: 17.0018, lng: 81.7768 },
      status: 'OPERATIONAL'
    }
  ];

  const onlyWater = findNearbyAmenities(mockFacilities, userLoc, 1000, 'WATER_POINT');
  assert.equal(onlyWater.length, 1);
  assert.equal(onlyWater[0].facility.type, 'WATER_POINT');
});
