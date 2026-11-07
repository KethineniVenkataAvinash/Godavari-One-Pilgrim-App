import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  createFacilityQrPayload, 
  generateFacilityQrCode, 
  generateFacilityQrBase64String,
  generateSecurityVerificationKey,
  verifyFacilityQrPayload 
} from './qrCodeGenerator';
import { Facility } from '../types';

const mockFacility: Facility = {
  id: 'FAC-101',
  zoneId: 'pushkar_ghat',
  name: 'Ghat Central 108 Emergency Medical Post',
  teluguName: 'పుష్కర్ ఘాట్ 108 అత్యవసర వైద్య శిబిరం',
  type: 'FIRST_AID',
  location: { lat: 16.9988, lng: 81.7758 },
  status: 'OPERATIONAL',
  accessibilityNotes: 'Wheelchair ramp available; 4 ICU beds equipped',
  lastInspected: '15 mins ago',
};

test('createFacilityQrPayload produces standardized payload with verification key', () => {
  const payload = createFacilityQrPayload(mockFacility);
  assert.equal(payload.protocol, 'godavari-one://facility');
  assert.equal(payload.facilityId, 'FAC-101');
  assert.equal(payload.type, 'FIRST_AID');
  assert.ok(payload.verificationKey.startsWith('G1-VERIFY-FAC-101-FIRST_AID-'));
  assert.ok(payload.checksum.startsWith('CHK-'));
  assert.equal(payload.location.lat, 16.9988);
});

test('generateFacilityQrCode returns a valid data:image/png;base64 URL', async () => {
  const dataUrl = await generateFacilityQrCode(mockFacility);
  assert.ok(dataUrl.startsWith('data:image/png;base64,'));
  assert.ok(dataUrl.length > 100);
});

test('generateFacilityQrBase64String returns raw base64 string without data prefix', async () => {
  const base64Str = await generateFacilityQrBase64String(mockFacility);
  assert.equal(base64Str.startsWith('data:image'), false);
  assert.ok(base64Str.length > 50);
});

test('verifyFacilityQrPayload correctly validates authentic and tampered keys', () => {
  const payload = createFacilityQrPayload(mockFacility);
  assert.equal(verifyFacilityQrPayload(payload), true);

  // Tampered verification key
  const tampered = { ...payload, verificationKey: 'G1-VERIFY-FAKE-KEY' };
  assert.equal(verifyFacilityQrPayload(tampered), false);
});
