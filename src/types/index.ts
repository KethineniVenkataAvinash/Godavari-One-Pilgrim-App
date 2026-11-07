export type Language = 'en' | 'te' | 'hi';

export type UserRole = 
  | 'pilgrim'
  | 'helpdesk_operator'
  | 'volunteer'
  | 'medical_responder'
  | 'police_responder'
  | 'sdrf_rescue'
  | 'field_supervisor'
  | 'department_operator'
  | 'command_operator'
  | 'admin';

export type AppInterface = 
  | 'public-portal'
  | 'pilgrim' 
  | 'command-centre' 
  | 'responder' 
  | 'field-operations'
  | 'mobility'
  | 'public-kiosk'
  | 'intelligence'
  | 'insights'
  | 'seva'
  | 'respond-directory';

export type Department = 'Police' | 'Medical / 108' | 'SDRF / River Rescue' | 'Municipal / Sanitation' | 'Fire Services' | 'Revenue / Administration';

export type IncidentType = 
  | 'MEDICAL' 
  | 'POLICE_SECURITY' 
  | 'CROWD_CRUSH_HAZARD' 
  | 'RIVER_RESCUE' 
  | 'LOST_CHILD_PERSON' 
  | 'FIRE' 
  | 'SANITATION_OVERFLOW' 
  | 'FACILITY_DAMAGE' 
  | 'GENERAL_ASSISTANCE';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus = 
  | 'REPORTED'
  | 'ACKNOWLEDGED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'EN_ROUTE'
  | 'ON_SCENE'
  | 'RESOLVED'
  | 'CLOSED'
  | 'DUPLICATE'
  | 'CANCELLED'
  | 'ESCALATED'
  | 'REJECTED';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Zone {
  id: string;
  name: string;
  teluguName: string;
  type: 'ghat' | 'transit_hub' | 'parking' | 'holding_area' | 'bridge';
  capacity: number;
  currentCount: number;
  areaSqMeters: number;
  density: number; // people per sq meter
  status: 'NORMAL' | 'MODERATE' | 'WARNING' | 'CRITICAL';
  coordinates: Coordinates;
  polygon: Coordinates[];
  waterDepthMeters?: number;
  flowRateMps?: number;
}

export interface Facility {
  id: string;
  zoneId: string;
  name: string;
  teluguName: string;
  type: 'TOILET' | 'FIRST_AID' | 'HOSPITAL' | 'HELP_DESK' | 'WATER_POINT' | 'PARKING' | 'POLICE_OUTPOST' | 'SHUTTLE_STOP' | 'CLOAK_ROOM';
  location: Coordinates;
  status: 'OPERATIONAL' | 'NEEDS_CLEANING' | 'MAINTENANCE_REQUIRED' | 'FULL' | 'OFFLINE';
  capacity?: number;
  currentOccupancy?: number;
  accessibilityNotes?: string;
  lastInspected?: string;
}

export interface IncidentEvent {
  id: string;
  incidentId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  eventType: string;
  notes?: string;
  timestamp: string;
}

export interface IncidentAssignment {
  id: string;
  responderId: string;
  responderName: string;
  responderDepartment: Department;
  assignedAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'EN_ROUTE' | 'ON_SCENE' | 'COMPLETED';
}

export interface Incident {
  id: string;
  referenceNumber: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  zoneId: string;
  zoneName: string;
  location: Coordinates;
  locationAccuracyMeters?: number;
  reportedBy: {
    userId: string;
    name: string;
    phone: string;
    role: UserRole;
  };
  assignedTo?: IncidentAssignment;
  createdAt: string;
  updatedAt: string;
  events: IncidentEvent[];
  audioOrPhotoUrl?: string;
  source: 'PILGRIM_SOS' | 'AI_CAMERA_CROWD' | 'HELPDESK' | 'VOLUNTEER' | 'SENSOR';
}

export interface LostPersonCase {
  id: string;
  caseNumber: string;
  type: 'MISSING' | 'FOUND';
  personName?: string;
  approxAge: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'CHILD';
  clothingDescription: string;
  identifyingFeatures: string;
  lastSeenLocation: string;
  lastSeenZoneId: string;
  lastSeenTime: string;
  contactName: string;
  contactPhone: string;
  status: 'OPEN' | 'MATCH_PROPOSED' | 'VERIFIED_REUNITED' | 'CLOSED';
  guardianVerified: boolean;
  notes: string;
  registeredAt: string;
}

export interface PublicAlert {
  id: string;
  titleEn: string;
  titleTe: string;
  titleHi: string;
  messageEn: string;
  messageTe: string;
  messageHi: string;
  category: 'CROWD_DIVERSION' | 'WEATHER_WARNING' | 'RIVER_SAFETY' | 'PARKING_UPDATE' | 'TRANSIT_NOTICE' | 'EMERGENCY_ANNOUNCEMENT';
  urgency: 'INFO' | 'WARNING' | 'CRITICAL';
  affectedZoneIds: string[];
  approvalStatus: 'DRAFT' | 'APPROVED' | 'BROADCASTED';
  approvedBy?: string;
  createdAt: string;
  expiresAt: string;
}

export interface FieldTask {
  id: string;
  facilityId: string;
  facilityName: string;
  zoneName: string;
  type: 'CLEANING' | 'WATER_REFILL' | 'DISINFECTION' | 'ELECTRICAL_REPAIR' | 'CROWD_BARRICADE' | 'INSPECTION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';
  assignedTo: string;
  assignedToName: string;
  deadline: string;
  checklist: {
    item: string;
    done: boolean;
  }[];
  evidencePhotoUrl?: string;
  evidenceNotes?: string;
  submittedAt?: string;
  verifiedBy?: string;
}

export interface OfflineSyncItem {
  id: string;
  clientId: string;
  action: 'CREATE_INCIDENT' | 'UPDATE_INCIDENT_STATUS' | 'COMPLETE_TASK' | 'REPORT_LOST_PERSON' | 'CREATE_LOST_PERSON';
  payload: any;
  createdAt: string;
  retryCount: number;
  lastAttemptAt?: string;
  nextRetryAfter?: number;
  status: 'QUEUED' | 'SYNCED' | 'FAILED_CONFLICT' | 'FAILED_TIMEOUT';
  errorMessage?: string;
}

export interface ParkingLot {
  id: string;
  name: string;
  teluguName: string;
  totalSlots: number;
  occupiedSlots: number;
  evChargingSlots: number;
  evOccupied: number;
  location: Coordinates;
  distanceToGhatsKm: number;
  status: 'AVAILABLE' | 'FILLING_FAST' | 'FULL' | 'CLOSED';
  shuttleFrequencyMins: number;
  connectedShuttleRoute: string;
  fee: string;
}

export interface ShuttleBus {
  id: string;
  routeNumber: string;
  routeName: string;
  color: string;
  vehicleNumber: string;
  driverName: string;
  currentLocation: Coordinates;
  currentSpeedKmh: number;
  nextStop: string;
  etaNextStopMins: number;
  capacity: number;
  currentPassengers: number;
  isElectric: boolean;
  acStatus: boolean;
}

export interface TrafficDiversion {
  id: string;
  roadName: string;
  teluguName: string;
  diversionType: 'PEDESTRIAN_ONLY' | 'ONE_WAY' | 'BUS_ONLY' | 'HEAVY_VEHICLE_DIVERTED' | 'COMPLETE_CLOSURE';
  reason: string;
  alternateRoute: string;
  activeFrom: string;
  activeTo: string;
  status: 'ACTIVE' | 'PLANNED' | 'LIFTED';
}

export interface CctvCamera {
  id: string;
  name: string;
  zoneId: string;
  zoneName: string;
  coordinates: Coordinates;
  status: 'ONLINE' | 'WARNING' | 'OFFLINE';
  currentCount: number;
  density: number; // persons / m2
  surgeRatePercent: number; // e.g. +14% / 5min
  detectedHazards: string[];
  streamUrl?: string;
  lastFrameTimestamp: string;
}

export interface CrowdForecastPoint {
  timeLabel: string;
  actualCount?: number;
  predictedCount: number;
  lowerBound: number;
  upperBound: number;
  riskLevel: 'NORMAL' | 'MODERATE' | 'HIGH' | 'WARNING' | 'CRITICAL';
}

export type SafetyLoopStage = 'DETECT' | 'ANALYZE' | 'ALERT' | 'RESPOND' | 'GUIDE' | 'VERIFY';

export interface SafetyLoopStep {
  stage: SafetyLoopStage;
  title: string;
  system: string;
  description: string;
  metric: string;
  status: 'pending' | 'active' | 'completed';
  actionLabel: string;
}

export interface AnnadanamCenter {
  id: string;
  name: string;
  teluguName: string;
  organizer: string;
  locationName: string;
  coordinates: Coordinates;
  currentMenu: string;
  teluguMenu: string;
  mealsServedToday: number;
  status: 'SERVING' | 'PREPARING_NEXT_BATCH' | 'CLOSED';
  timings: string;
  estimatedWaitMins: number;
  distanceMeters: number;
}

export interface RiverWaterQuality {
  ghatId: string;
  ghatName: string;
  temperatureC: number;
  phLevel: number;
  dissolvedOxygenMgL: number;
  turbidityNtu: number;
  velocityMps: number;
  coliformStatus: 'CLEAN_PASS' | 'MODERATE' | 'CAUTION';
  bathingSafetyScore: number;
  overallStatus: 'EXCELLENT' | 'GOOD' | 'CAUTION';
  lastSampled: string;
}

export interface VirtualQueueSlot {
  tokenNumber: number;
  currentlyServingToken: number;
  ghatId: string;
  ghatName: string;
  slotWindow: string;
  estimatedWaitMinutes: number;
  status: 'WAITING' | 'NOW_SERVING' | 'EXPIRED' | 'COMPLETED';
  issuedAt: string;
}

export interface BulletinItem {
  id: string;
  category: 'RIVER' | 'SNANAM' | 'MOBILITY' | 'ANNADANAM' | 'SAFETY' | 'WEATHER' | 'POLICE';
  urgent?: boolean;
  en: { tag: string; title: string; detail: string };
  te: { tag: string; title: string; detail: string };
  hi: { tag: string; title: string; detail: string };
  actionTarget?: string;
  createdAt?: string;
}



