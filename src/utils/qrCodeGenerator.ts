import QRCode from 'qrcode';
import { Facility } from '../types';

export interface FacilityQrPayload {
  protocol: 'godavari-one://facility';
  facilityId: string;
  name: string;
  type: string;
  zoneId: string;
  location: {
    lat: number;
    lng: number;
  };
  status: string;
  verificationKey: string;
  issuedAt: string;
  checksum: string;
}

export interface QrCodeOptions {
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Computes a deterministic hexadecimal checksum for the facility security payload.
 */
export function computeVerificationChecksum(facilityId: string, type: string, zoneId: string): string {
  const seed = `${facilityId}:${type}:${zoneId}:PUSHKARALU_2027_SECURE`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `CHK-${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}`;
}

/**
 * Generates an authorized security verification key for the facility.
 */
export function generateSecurityVerificationKey(facilityId: string, type: string, zoneId: string): string {
  const checksum = computeVerificationChecksum(facilityId, type, zoneId);
  return `G1-VERIFY-${facilityId}-${type}-${checksum}`;
}

/**
 * Creates a structured, standardized JSON payload for a facility QR code
 * including security verification keys and checksums.
 */
export function createFacilityQrPayload(facility: Facility): FacilityQrPayload {
  const verificationKey = generateSecurityVerificationKey(facility.id, facility.type, facility.zoneId);
  const checksum = computeVerificationChecksum(facility.id, facility.type, facility.zoneId);

  return {
    protocol: 'godavari-one://facility',
    facilityId: facility.id,
    name: facility.name,
    type: facility.type,
    zoneId: facility.zoneId,
    location: {
      lat: facility.location.lat,
      lng: facility.location.lng,
    },
    status: facility.status,
    verificationKey,
    issuedAt: '2027-PUSHKARALU-OFFICIAL',
    checksum,
  };
}

/**
 * Generates a base64 Data URL (data:image/png;base64,...) QR code string from facility data.
 */
export async function generateFacilityQrCode(
  facility: Facility,
  options?: QrCodeOptions
): Promise<string> {
  const payload = createFacilityQrPayload(facility);
  const dataString = JSON.stringify(payload);

  const qrBase64DataUrl = await QRCode.toDataURL(dataString, {
    width: options?.width || 280,
    margin: options?.margin || 2,
    color: {
      dark: options?.darkColor || '#072420',
      light: options?.lightColor || '#FFFFFF',
    },
    errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
  });

  return qrBase64DataUrl;
}

/**
 * Extracts and returns the raw base64 string (without the data URL prefix)
 * for backend transport or storage.
 */
export async function generateFacilityQrBase64String(
  facility: Facility,
  options?: QrCodeOptions
): Promise<string> {
  const dataUrl = await generateFacilityQrCode(facility, options);
  // Remove "data:image/png;base64," header
  const commaIndex = dataUrl.indexOf(',');
  return commaIndex !== -1 ? dataUrl.slice(commaIndex + 1) : dataUrl;
}

/**
 * Verifies that a scanned facility payload contains a valid verification key and checksum.
 */
export function verifyFacilityQrPayload(payload: Partial<FacilityQrPayload>): boolean {
  if (!payload.facilityId || !payload.type || !payload.zoneId || !payload.verificationKey) {
    return false;
  }
  const expectedKey = generateSecurityVerificationKey(payload.facilityId, payload.type, payload.zoneId);
  return payload.verificationKey === expectedKey;
}
