import { Capacitor } from '@capacitor/core';
import { apiBase } from '../androidBootstrap';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  AppInterface, 
  Incident, 
  Zone, 
  Facility, 
  LostPersonCase, 
  PublicAlert, 
  FieldTask, 
  IncidentStatus, 
  UserRole, 
  Department, 
  OfflineSyncItem,
  ParkingLot,
  ShuttleBus,
  TrafficDiversion,
  CctvCamera,
  CrowdForecastPoint,
  SafetyLoopStage,
  BulletinItem
} from '../types';
import { 
  INITIAL_INCIDENTS, 
  INITIAL_ZONES, 
  INITIAL_FACILITIES, 
  INITIAL_LOST_CASES, 
  INITIAL_PUBLIC_ALERTS, 
  INITIAL_FIELD_TASKS,
  INITIAL_BULLETINS,
  MOCK_PARKING_LOTS,
  MOCK_SHUTTLE_BUSES,
  MOCK_TRAFFIC_DIVERSIONS,
  MOCK_CCTV_CAMERAS,
  MOCK_CROWD_FORECAST,
  MOCK_INSIGHTS_SUMMARY
} from '../data/mockData';
import { canRolePerformTransition } from '../logic/stateMachine';
import { evaluateCrowdRisk } from '../logic/crowdRisk';
import { OfflineSyncEngine } from '../logic/offlineQueue';

export type Language = 'en' | 'te' | 'hi';

export const LANGUAGE_STORAGE_KEY = 'g1_preferred_language';
export const PORTAL_LANGUAGE_STORAGE_KEY = 'g1_portal_language';
export const APP_LANGUAGE_STORAGE_KEY = 'g1_pilgrim_app_language';

export function getSavedLanguagePreference(): Language {
  return getSavedPortalLanguage();
}

export function getSavedPortalLanguage(): Language {
  try {
    const saved = localStorage.getItem(PORTAL_LANGUAGE_STORAGE_KEY) || localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'te' || saved === 'en' || saved === 'hi') {
      return saved as Language;
    }
  } catch (e) {
    // fallback
  }
  return 'en';
}

export function getSavedAppLanguage(): Language {
  try {
    const saved = localStorage.getItem(APP_LANGUAGE_STORAGE_KEY);
    if (saved === 'te' || saved === 'en' || saved === 'hi') {
      return saved as Language;
    }
  } catch (e) {
    // fallback
  }
  return 'en';
}

export function saveLanguagePreference(lang: Language): void {
  try {
    localStorage.setItem(PORTAL_LANGUAGE_STORAGE_KEY, lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  } catch (e) {
    // ignore
  }
}

interface AppContextType {
  currentInterface: AppInterface;
  setCurrentInterface: (iface: AppInterface) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  appLanguage: Language;
  setAppLanguage: (lang: Language) => void;
  t: (en: string, te: string, hi: string) => string;
  tApp: (en: string, te: string, hi: string) => string;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;

  // Data
  incidents: Incident[];
  zones: Zone[];
  facilities: Facility[];
  lostCases: LostPersonCase[];
  publicAlerts: PublicAlert[];
  fieldTasks: FieldTask[];
  offlineQueue: OfflineSyncItem[];
  parkingLots: ParkingLot[];
  shuttleBuses: ShuttleBus[];
  trafficDiversions: TrafficDiversion[];
  cctvCameras: CctvCamera[];
  crowdForecast: CrowdForecastPoint[];
  insightsSummary: typeof MOCK_INSIGHTS_SUMMARY;
  safetyLoopStage: SafetyLoopStage | null;
  bulletins: BulletinItem[];

  // Actions
  addBulletin: (b: Omit<BulletinItem, 'id'>) => void;
  updateBulletin: (id: string, updated: Partial<BulletinItem>) => void;
  deleteBulletin: (id: string) => void;
  clearAllCasesAndAlerts: (passcode: string) => Promise<{ success: boolean; message: string }>;
  createSosIncident: (data: {
    type: Incident['type'];
    severity: Incident['severity'];
    title: string;
    description: string;
    zoneId: string;
    location: { lat: number; lng: number };
    userName: string;
    userPhone: string;
  }) => Promise<{ success: boolean; incidentId?: string; isQueuedOffline?: boolean; message: string }>;

  updateIncidentStatus: (
    incidentId: string, 
    newStatus: IncidentStatus, 
    notes?: string
  ) => { success: boolean; message: string };

  assignResponder: (
    incidentId: string,
    responderName: string,
    department: Department
  ) => { success: boolean; message: string };

  createPublicAlert: (alert: Omit<PublicAlert, 'id' | 'createdAt'>) => void;
  approvePublicAlert: (alertId: string) => void;

  createLostPersonCase: (caseData: Omit<LostPersonCase, 'id' | 'caseNumber' | 'status' | 'registeredAt' | 'guardianVerified'>) => string;
  verifyReunification: (caseId: string, notes: string) => void;

  updateFieldTaskStatus: (
    taskId: string, 
    status: FieldTask['status'], 
    evidence?: { notes?: string; photoUrl?: string; checklist?: { item: string; done: boolean }[] }
  ) => void;

  triggerCrowdSimulation: (zoneId: string, additionalCount: number) => void;
  syncOfflineQueue: () => Promise<number>;
  notificationToast: { message: string; type: 'info' | 'warning' | 'critical' } | null;
  clearNotification: () => void;

  // New Domain Actions
  setSafetyLoopStage: (stage: SafetyLoopStage | null) => void;
  advanceSafetyLoop: () => void;
  resetSafetyLoop: () => void;
  updateParkingLotOccupancy: (lotId: string, occupiedSlots: number) => void;
  // Operator Authentication & Access Control (Safety separation for Public vs Command)
  isOperatorAuthenticated: boolean;
  operatorSession: OperatorSession | null;
  loginOperator: (officerId: string, pin: string, role?: string) => Promise<{ success: boolean; message: string }>;
  logoutOperator: () => void;
  isOfficialAccessModalOpen: boolean;
  setIsOfficialAccessModalOpen: (open: boolean) => void;
  isAppDownloadModalOpen: boolean;
  setIsAppDownloadModalOpen: (open: boolean) => void;
  pendingRestrictedInterface: AppInterface | null;
  setPendingRestrictedInterface: (iface: AppInterface | null) => void;

  // Public Pilgrim / Citizen Authentication
  isPilgrimAuthenticated: boolean;
  pilgrimSession: PilgrimSession | null;
  loginPilgrim: (data: {
    name: string;
    regNumber: string;
    phone?: string;
    passType?: 'GENERAL' | 'VIP_ELDER' | 'FAMILY_GROUP' | 'SEVA_VOLUNTEER';
    ghatPreference?: string;
    signatureVerified?: boolean;
  }) => { success: boolean; message: string };
  logoutPilgrim: () => void;
}

export interface PilgrimSession {
  name: string;
  regNumber: string;
  phone: string;
  passType: 'GENERAL' | 'VIP_ELDER' | 'FAMILY_GROUP' | 'SEVA_VOLUNTEER';
  ghatPreference: string;
  dipSlotTime: string;
  signatureVerified: boolean;
  loginTime: string;
}

export interface OperatorSession {
  officerId: string;
  name: string;
  role: string;
  department: string;
  badgeNumber: string;
  loginTime: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const syncEngine = new OfflineSyncEngine();

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentInterface, setCurrentInterfaceState] = useState<AppInterface>('pilgrim');

  // Portal Language (used across top-level portal, headers, and official views)
  const [language, setLanguageInternal] = useState<Language>(() => {
    return getSavedPortalLanguage();
  });

  const setLanguage = (newLang: Language) => {
    setLanguageInternal(newLang);
    saveLanguagePreference(newLang);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('g1:portal-language-changed', { detail: { language: newLang } }));
    }
  };

  const t = (en: string, te: string, hi: string): string => {
    if (language === 'te') return te;
    if (language === 'hi') return hi;
    return en;
  };

  // Pilgrim App Language (completely separate user preference within the mobile Pilgrim App)
  const [appLanguage, setAppLanguageInternal] = useState<Language>(() => {
    return getSavedAppLanguage();
  });

  const setAppLanguage = (newLang: Language) => {
    setAppLanguageInternal(newLang);
    try {
      localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, newLang);
    } catch {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('g1:app-language-changed', { detail: { language: newLang } }));
    }
  };

  const tApp = (en: string, te: string, hi: string): string => {
    if (appLanguage === 'te') return te;
    if (appLanguage === 'hi') return hi;
    return en;
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }

    const handleStorage = (e: StorageEvent) => {
      if ((e.key === PORTAL_LANGUAGE_STORAGE_KEY || e.key === LANGUAGE_STORAGE_KEY) && e.newValue) {
        if (e.newValue === 'en' || e.newValue === 'te' || e.newValue === 'hi') {
          setLanguageInternal(e.newValue as Language);
        }
      }
      if (e.key === APP_LANGUAGE_STORAGE_KEY && e.newValue) {
        if (e.newValue === 'en' || e.newValue === 'te' || e.newValue === 'hi') {
          setAppLanguageInternal(e.newValue as Language);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [language, appLanguage]);

  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine;
    }
    return true;
  });
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('pilgrim');

  // Official Operator Security & Access Control
  const [isOperatorAuthenticated, setIsOperatorAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('g1_operator_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [operatorSession, setOperatorSession] = useState<OperatorSession | null>(() => {
    try {
      const s = localStorage.getItem('g1_operator_session');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [isOfficialAccessModalOpen, setIsOfficialAccessModalOpen] = useState<boolean>(false);
  const [pendingRestrictedInterface, setPendingRestrictedInterface] = useState<AppInterface | null>(null);
  const [isAppDownloadModalOpen, setIsAppDownloadModalOpen] = useState<boolean>(false);

  // Protected Interface Setter: blocks public from operating or viewing command/intelligence consoles
  const setCurrentInterface = (targetInterface: AppInterface) => {
    const RESTRICTED_INTERFACES: AppInterface[] = ['command-centre', 'intelligence', 'insights', 'responder', 'field-operations'];
    if (RESTRICTED_INTERFACES.includes(targetInterface) && !isOperatorAuthenticated) {
      setPendingRestrictedInterface(targetInterface);
      setIsOfficialAccessModalOpen(true);
      return;
    }
    setCurrentInterfaceState(targetInterface);
  };

  const loginOperator = async (officerId: string, pin: string, role?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/operator/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerId, pin, role })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { 
          success: false, 
          message: data.message || 'Operator credentials rejected by AP Government Directory.' 
        };
      }

      const s = data.session;
      const session: OperatorSession = {
        officerId: s.officerId,
        name: s.officerName,
        role: s.role,
        department: s.department,
        badgeNumber: s.badgeNumber,
        loginTime: new Date(s.createdAt).toLocaleTimeString(),
      };
      setIsOperatorAuthenticated(true);
      setOperatorSession(session);
      setCurrentUserRole(s.role as UserRole);
      try {
        localStorage.setItem('g1_operator_auth', 'true');
        localStorage.setItem('g1_operator_session', JSON.stringify(session));
        localStorage.setItem('g1_operator_token', s.token);
      } catch {}
      setIsOfficialAccessModalOpen(false);
      if (pendingRestrictedInterface) {
        setCurrentInterfaceState(pendingRestrictedInterface);
        setPendingRestrictedInterface(null);
      } else {
        setCurrentInterfaceState('command-centre');
      }
      return { success: true, message: data.message };
    } catch {
      // Local fallback for authorized officers when server is in offline simulator mode
      const cleanId = (officerId || '').trim().toUpperCase();
      const cleanPin = (pin || '').trim();
      const validPins = ['cmd2027', 'sdrf2027', 'med2027', 'field2027', 'pushkar2027', 'pushkaralu2027'];
      if (!validPins.includes(cleanPin)) {
        return { success: false, message: 'Invalid Official Operator Passcode. Access Rejected.' };
      }
      const session: OperatorSession = {
        officerId: cleanId || 'AP-POL-CMD-01',
        name: cleanId.includes('SDRF') ? 'Commander K. Rao' : 'Inspector Srinivasulu (Command Control)',
        role: role || (cleanId.includes('SDRF') ? 'sdrf_responder' : 'command_operator'),
        department: cleanId.includes('SDRF') ? 'SDRF / River Rescue' : 'Police / Command Centre',
        badgeNumber: `AP-${Math.floor(1000 + Math.random() * 9000)}`,
        loginTime: new Date().toLocaleTimeString(),
      };
      setIsOperatorAuthenticated(true);
      setOperatorSession(session);
      setCurrentUserRole(session.role as UserRole);
      try {
        localStorage.setItem('g1_operator_auth', 'true');
        localStorage.setItem('g1_operator_session', JSON.stringify(session));
      } catch {}
      setIsOfficialAccessModalOpen(false);
      if (pendingRestrictedInterface) {
        setCurrentInterfaceState(pendingRestrictedInterface);
        setPendingRestrictedInterface(null);
      } else {
        setCurrentInterfaceState('command-centre');
      }
      return { success: true, message: `Access Authorized: Welcome, ${session.name}` };
    }
  };

  const logoutOperator = () => {
    setIsOperatorAuthenticated(false);
    setOperatorSession(null);
    setCurrentUserRole('pilgrim');
    try {
      localStorage.removeItem('g1_operator_auth');
      localStorage.removeItem('g1_operator_session');
    } catch {}
    setCurrentInterfaceState('public-portal');
  };

  // Public Pilgrim / Citizen Authentication State
  const [isPilgrimAuthenticated, setIsPilgrimAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('g1_pilgrim_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [pilgrimSession, setPilgrimSession] = useState<PilgrimSession | null>(() => {
    try {
      const s = localStorage.getItem('g1_pilgrim_session');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const loginPilgrim = (data: {
    name: string;
    regNumber: string;
    phone?: string;
    passType?: 'GENERAL' | 'VIP_ELDER' | 'FAMILY_GROUP' | 'SEVA_VOLUNTEER';
    ghatPreference?: string;
    signatureVerified?: boolean;
  }) => {
    const session: PilgrimSession = {
      name: data.name.trim() || 'Devotee Pilgrim',
      regNumber: data.regNumber.trim().toUpperCase() || `PK-2027-${Math.floor(1000 + Math.random() * 9000)}`,
      phone: data.phone?.trim() || '+91 98480 22338',
      passType: data.passType || 'GENERAL',
      ghatPreference: data.ghatPreference || 'Pushkar Ghat (Main)',
      dipSlotTime: '04:30 AM - 06:00 AM (Brahma Muhurtham)',
      signatureVerified: data.signatureVerified ?? true,
      loginTime: new Date().toLocaleTimeString(),
    };
    setIsPilgrimAuthenticated(true);
    setPilgrimSession(session);
    try {
      localStorage.setItem('g1_pilgrim_auth', 'true');
      localStorage.setItem('g1_pilgrim_session', JSON.stringify(session));
    } catch {}
    return { success: true, message: `Welcome, ${session.name}! Full live telemetry and personalized passes unlocked.` };
  };

  const logoutPilgrim = () => {
    setIsPilgrimAuthenticated(false);
    setPilgrimSession(null);
    try {
      localStorage.removeItem('g1_pilgrim_auth');
      localStorage.removeItem('g1_pilgrim_session');
    } catch {}
  };

  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem('g1_incidents');
    return saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
  });

  const [zones, setZones] = useState<Zone[]>(() => {
    const saved = localStorage.getItem('g1_zones');
    return saved ? JSON.parse(saved) : INITIAL_ZONES;
  });

  const [facilities, setFacilities] = useState<Facility[]>(() => {
    const saved = localStorage.getItem('g1_facilities');
    return saved ? JSON.parse(saved) : INITIAL_FACILITIES;
  });

  const [lostCases, setLostCases] = useState<LostPersonCase[]>(() => {
    const saved = localStorage.getItem('g1_lost_cases');
    return saved ? JSON.parse(saved) : INITIAL_LOST_CASES;
  });

  const [publicAlerts, setPublicAlerts] = useState<PublicAlert[]>(() => {
    const saved = localStorage.getItem('g1_alerts');
    return saved ? JSON.parse(saved) : INITIAL_PUBLIC_ALERTS;
  });

  const [fieldTasks, setFieldTasks] = useState<FieldTask[]>(() => {
    const saved = localStorage.getItem('g1_field_tasks');
    return saved ? JSON.parse(saved) : INITIAL_FIELD_TASKS;
  });

  const [offlineQueue, setOfflineQueue] = useState<OfflineSyncItem[]>([]);
  const [notificationToast, setNotificationToast] = useState<{ message: string; type: 'info' | 'warning' | 'critical' } | null>(null);

  // Expanded Domain States
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>(() => {
    const saved = localStorage.getItem('g1_parking_lots');
    return saved ? JSON.parse(saved) : MOCK_PARKING_LOTS;
  });

  const [shuttleBuses, setShuttleBuses] = useState<ShuttleBus[]>(() => {
    const saved = localStorage.getItem('g1_shuttle_buses');
    return saved ? JSON.parse(saved) : MOCK_SHUTTLE_BUSES;
  });

  const [trafficDiversions, setTrafficDiversions] = useState<TrafficDiversion[]>(() => {
    const saved = localStorage.getItem('g1_traffic_diversions');
    return saved ? JSON.parse(saved) : MOCK_TRAFFIC_DIVERSIONS;
  });

  const [cctvCameras, setCctvCameras] = useState<CctvCamera[]>(() => {
    const saved = localStorage.getItem('g1_cctv_cameras');
    return saved ? JSON.parse(saved) : MOCK_CCTV_CAMERAS;
  });

  const [crowdForecast] = useState<CrowdForecastPoint[]>(MOCK_CROWD_FORECAST);
  const [insightsSummary] = useState(MOCK_INSIGHTS_SUMMARY);
  const [safetyLoopStage, setSafetyLoopStage] = useState<SafetyLoopStage | null>(null);

  // Official Bulletins state with local persistence
  const [bulletins, setBulletins] = useState<BulletinItem[]>(() => {
    try {
      const saved = localStorage.getItem('g1_official_bulletins');
      return saved ? JSON.parse(saved) : INITIAL_BULLETINS;
    } catch {
      return INITIAL_BULLETINS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('g1_official_bulletins', JSON.stringify(bulletins));
    } catch {}
  }, [bulletins]);

  // Auto-save state
  useEffect(() => {
    localStorage.setItem('g1_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('g1_zones', JSON.stringify(zones));
  }, [zones]);

  useEffect(() => {
    localStorage.setItem('g1_facilities', JSON.stringify(facilities));
  }, [facilities]);

  useEffect(() => {
    localStorage.setItem('g1_lost_cases', JSON.stringify(lostCases));
  }, [lostCases]);

  useEffect(() => {
    localStorage.setItem('g1_alerts', JSON.stringify(publicAlerts));
  }, [publicAlerts]);

  useEffect(() => {
    localStorage.setItem('g1_field_tasks', JSON.stringify(fieldTasks));
  }, [fieldTasks]);

  useEffect(() => {
    localStorage.setItem('g1_parking_lots', JSON.stringify(parkingLots));
  }, [parkingLots]);

  // Real-time Multi-Device Server Synchronization via Server-Sent Events (SSE)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'EventSource' in window && (!Capacitor.isNativePlatform() || apiBase)) {
      // 1. Initial fetch from authoritative server
      fetch('/api/incidents')
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data.incidents) && data.incidents.length > 0) {
            setIncidents(prev => {
              const serverIds = new Set(data.incidents.map((i: Incident) => i.id));
              const localOnly = prev.filter(i => !serverIds.has(i.id));
              return [...data.incidents, ...localOnly];
            });
          }
        })
        .catch(() => {
          // Graceful fallback to local cache
        });

      // 2. Connect live SSE stream
      const evtSource = new EventSource((Capacitor.isNativePlatform() ? apiBase : '') + '/api/events');
      evtSource.addEventListener('INCIDENT_CREATED', (e: MessageEvent) => {
        try {
          const inc = JSON.parse(e.data);
          setIncidents(prev => {
            if (prev.some(x => x.id === inc.id)) return prev;
            return [inc, ...prev];
          });
        } catch {
          // Ignore parse errors
        }
      });

      evtSource.addEventListener('INCIDENT_UPDATED', (e: MessageEvent) => {
        try {
          const inc = JSON.parse(e.data);
          setIncidents(prev => prev.map(x => x.id === inc.id ? { ...x, ...inc } : x));
        } catch {
          // Ignore parse errors
        }
      });

      evtSource.addEventListener('COMMAND_PURGE_EXECUTED', () => {
        setIncidents([]);
        setLostCases([]);
        setPublicAlerts([]);
        try {
          localStorage.setItem('g1_incidents', JSON.stringify([]));
          localStorage.setItem('g1_lost_cases', JSON.stringify([]));
          localStorage.setItem('g1_alerts', JSON.stringify([]));
        } catch {}
      });

      return () => {
        evtSource.close();
      };
    }
  }, []);

  // Sync role when interface changes to reasonable defaults in DEMO_PREVIEW mode
  useEffect(() => {
    if (currentInterface === 'pilgrim') {
      setCurrentUserRole('pilgrim');
    } else if (currentInterface === 'command-centre') {
      setCurrentUserRole('command_operator');
    } else if (currentInterface === 'responder') {
      setCurrentUserRole('medical_responder');
    } else if (currentInterface === 'field-operations') {
      setCurrentUserRole('field_supervisor');
    } else if (currentInterface === 'mobility') {
      setCurrentUserRole('department_operator');
    } else if (currentInterface === 'public-kiosk') {
      setCurrentUserRole('helpdesk_operator');
    } else if (currentInterface === 'intelligence') {
      setCurrentUserRole('command_operator');
    } else if (currentInterface === 'insights') {
      setCurrentUserRole('admin');
    }
  }, [currentInterface]);

  const clearNotification = () => setNotificationToast(null);

  // Emergency SOS creation with Authoritative Server Delivery
  const createSosIncident = async (data: {
    type: Incident['type'];
    severity: Incident['severity'];
    title: string;
    description: string;
    zoneId: string;
    location: { lat: number; lng: number };
    userName: string;
    userPhone: string;
  }): Promise<{ success: boolean; incidentId?: string; isQueuedOffline?: boolean; message: string }> => {
    const clientId = `client_sos_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const zone = zones.find(z => z.id === data.zoneId) || zones[0];
    const newId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;

    const newIncident: Incident = {
      id: newId,
      referenceNumber: `SOS-2027-${Math.floor(1000 + Math.random() * 9000)}`,
      type: data.type,
      severity: data.severity,
      status: 'REPORTED',
      title: data.title,
      description: data.description,
      zoneId: zone.id,
      zoneName: zone.name,
      location: data.location,
      reportedBy: {
        userId: `usr-${Math.random().toString(36).substring(2, 7)}`,
        name: data.userName || 'Pilgrim Devotee',
        phone: data.userPhone || '+91 98480 00000',
        role: 'pilgrim',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      events: [
        {
          id: `ev-${Date.now()}`,
          incidentId: newId,
          actorId: 'pilgrim',
          actorName: data.userName || 'Pilgrim Devotee',
          actorRole: 'pilgrim',
          eventType: 'SOS_TRIGGERED',
          notes: 'Emergency SOS alert submitted via Pilgrim Mobile PWA',
          timestamp: new Date().toISOString(),
        },
      ],
      source: 'PILGRIM_SOS',
    };

    // If device is explicitly offline, store in durable queue immediately
    if (!isOnline) {
      syncEngine.enqueue({
        clientId,
        action: 'CREATE_INCIDENT',
        payload: newIncident,
      });
      setOfflineQueue(syncEngine.getQueue());
      setNotificationToast({
        message: 'Device offline. Emergency alert saved to durable local storage; will synchronize when connection resumes.',
        type: 'warning',
      });
      return {
        success: true,
        incidentId: newId,
        isQueuedOffline: true,
        message: 'Saved to durable offline queue. IN LIFE-SAFETY DANGER, PLEASE SEEK NEARBY POLICE/VOLUNTEER OR CALL 112/108.',
      };
    }

    // When online, transmit to authoritative Node.js server API and await genuine acceptance
    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotencyKey: clientId,
          type: data.type,
          severity: data.severity,
          title: data.title,
          description: data.description,
          zoneId: zone.id,
          location: data.location,
          userName: data.userName,
          userPhone: data.userPhone,
          userRole: 'pilgrim'
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const serverRes = await response.json();
      if (serverRes && serverRes.incident) {
        setIncidents(prev => [serverRes.incident, ...prev.filter(i => i.id !== serverRes.incident.id)]);
        setNotificationToast({
          message: `PRIORITY ALERT: New Emergency SOS ${serverRes.incident.referenceNumber} (${data.type}) received at ${zone.name}`,
          type: 'critical',
        });
        return {
          success: true,
          incidentId: serverRes.incident.id,
          isQueuedOffline: false,
          message: `Emergency SOS registered & acknowledged by Server! Ref: ${serverRes.incident.referenceNumber}. Status: ACCEPTED_BY_SERVER. (For immediate danger, also call toll-free 112/108).`,
        };
      } else {
        throw new Error('Malformed server incident response');
      }
    } catch {
      // Safe fallback to durable offline engine when server fails or network is degraded
      syncEngine.enqueue({
        clientId,
        action: 'CREATE_INCIDENT',
        payload: newIncident,
      });
      setOfflineQueue(syncEngine.getQueue());
      setIncidents(prev => [newIncident, ...prev]);
      setNotificationToast({
        message: 'Network degraded. Emergency alert saved to durable offline queue; awaiting server sync.',
        type: 'warning',
      });
      return {
        success: true,
        incidentId: newId,
        isQueuedOffline: true,
        message: 'Network unreachable. Alert saved to durable offline queue; will automatically reconcile. PLEASE CALL TOLL-FREE 112 OR 108 FOR IMMEDIATE HELP.',
      };
    }
  };

  // State machine transition
  const updateIncidentStatus = (incidentId: string, newStatus: IncidentStatus, notes?: string) => {
    const inc = incidents.find(i => i.id === incidentId);
    if (!inc) {
      return { success: false, message: 'Incident not found' };
    }

    const validation = canRolePerformTransition(currentUserRole, inc.status, newStatus);
    if (!validation.allowed) {
      return { success: false, message: validation.reason || 'Permission denied for this state transition' };
    }

    if (!isOnline) {
      const clientId = `status_upd_${Date.now()}_${incidentId}`;
      syncEngine.enqueue({
        clientId,
        action: 'UPDATE_INCIDENT_STATUS',
        payload: { incidentId, newStatus, notes },
      });
      setOfflineQueue(syncEngine.getQueue());
      return { success: true, message: 'Status change queued offline.' };
    }

    const newEvent = {
      id: `ev-${Date.now()}`,
      incidentId,
      actorId: currentUserRole,
      actorName: currentUserRole === 'command_operator' ? 'Command Desk Controller' : 'Field Responder',
      actorRole: currentUserRole,
      eventType: `STATUS_CHANGE_TO_${newStatus}`,
      notes: notes || `Incident updated to ${newStatus}`,
      timestamp: new Date().toISOString(),
    };

    setIncidents(prev =>
      prev.map(item => {
        if (item.id === incidentId) {
          return {
            ...item,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            events: [...item.events, newEvent],
          };
        }
        return item;
      })
    );

    setNotificationToast({
      message: `Case ${inc.referenceNumber} moved to ${newStatus}`,
      type: 'info',
    });

    return { success: true, message: `Updated to ${newStatus}` };
  };

  // Responder dispatch
  const assignResponder = (incidentId: string, responderName: string, department: Department) => {
    const inc = incidents.find(i => i.id === incidentId);
    if (!inc) return { success: false, message: 'Incident not found' };

    const assignment = {
      id: `asg-${Date.now()}`,
      responderId: `resp-${Math.random().toString(36).substring(2, 6)}`,
      responderName,
      responderDepartment: department,
      assignedAt: new Date().toISOString(),
      status: 'PENDING' as const,
    };

    const newEvent = {
      id: `ev-${Date.now()}`,
      incidentId,
      actorId: 'command_operator',
      actorName: 'Command Centre Dispatcher',
      actorRole: 'command_operator' as const,
      eventType: 'DISPATCH_ASSIGNED',
      notes: `Dispatched to ${department}: ${responderName}`,
      timestamp: new Date().toISOString(),
    };

    setIncidents(prev =>
      prev.map(item => {
        if (item.id === incidentId) {
          return {
            ...item,
            status: 'ASSIGNED',
            assignedTo: assignment,
            updatedAt: new Date().toISOString(),
            events: [...item.events, newEvent],
          };
        }
        return item;
      })
    );

    setNotificationToast({
      message: `Dispatched ${responderName} (${department}) to ${inc.referenceNumber}`,
      type: 'info',
    });

    return { success: true, message: 'Responder dispatched successfully' };
  };

  // Public Alerts
  const createPublicAlert = (alertData: Omit<PublicAlert, 'id' | 'createdAt'>) => {
    const newAlert: PublicAlert = {
      ...alertData,
      id: `ALT-${Math.floor(500 + Math.random() * 500)}`,
      createdAt: new Date().toISOString(),
    };
    setPublicAlerts(prev => [newAlert, ...prev]);
    setNotificationToast({
      message: `Drafted Alert: ${newAlert.titleEn} (Requires Operator Approval)`,
      type: 'warning',
    });
  };

  const approvePublicAlert = (alertId: string) => {
    setPublicAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, approvalStatus: 'BROADCASTED', approvedBy: 'Joint Command Authority' } : a))
    );
    setNotificationToast({
      message: `PUBLIC BROADCAST: Official Pushkaralu alert released across mobile apps & PA displays`,
      type: 'critical',
    });
  };

  // Official Moving Bulletin Operations (Add, Edit, Delete)
  const addBulletin = (bulletinData: Omit<BulletinItem, 'id' | 'createdAt'>) => {
    const newItem: BulletinItem = {
      ...bulletinData,
      id: `blt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    setBulletins(prev => [newItem, ...prev]);
    setNotificationToast({
      message: `Official Bulletin Published: "${newItem.en.title}" is now broadcasting on the public ticker.`,
      type: 'info'
    });
  };

  const updateBulletin = (id: string, updated: Partial<BulletinItem>) => {
    setBulletins(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b));
    setNotificationToast({
      message: 'Official Bulletin updated successfully.',
      type: 'info'
    });
  };

  const deleteBulletin = (id: string) => {
    setBulletins(prev => prev.filter(b => b.id !== id));
    setNotificationToast({
      message: 'Official Bulletin removed from active rotation.',
      type: 'warning'
    });
  };

  // Emergency Purge with Passcode Verification (Passcode: 'close')
  const clearAllCasesAndAlerts = async (passcode: string): Promise<{ success: boolean; message: string }> => {
    const cleanPass = (passcode || '').trim().toLowerCase();
    if (cleanPass !== 'close') {
      return {
        success: false,
        message: 'Security Rejection: Invalid Passcode. Access Denied (Correct passcode: close).'
      };
    }

    try {
      await fetch('/api/command/clear-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: cleanPass })
      });
    } catch (e) {
      console.warn('Backend purge offline, purging client store', e);
    }

    setIncidents([]);
    setLostCases([]);
    setPublicAlerts([]);

    try {
      localStorage.setItem('g1_incidents', JSON.stringify([]));
      localStorage.setItem('g1_lost_cases', JSON.stringify([]));
      localStorage.setItem('g1_alerts', JSON.stringify([]));
    } catch {}

    setNotificationToast({
      message: 'ICCC SECURITY PURGE EXECUTED: All cases, SOS incidents, and alerts cleared (Passcode Confirmed: close)',
      type: 'critical'
    });

    return {
      success: true,
      message: 'All cases and alerts have been purged successfully.'
    };
  };

  // Centralized Lost & Found Registry with Durable LocalStorage Sync Engine
  const createLostPersonCase = (caseData: Omit<LostPersonCase, 'id' | 'caseNumber' | 'status' | 'registeredAt' | 'guardianVerified'>) => {
    const clientId = `client_lost_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const caseId = `LP-${Math.floor(300 + Math.random() * 700)}`;
    const newCase: LostPersonCase = {
      ...caseData,
      id: caseId,
      caseNumber: `LP-2027-${Math.floor(100 + Math.random() * 900)}`,
      status: 'OPEN',
      guardianVerified: false,
      registeredAt: new Date().toISOString(),
    };

    // Optimistically record locally
    setLostCases(prev => [newCase, ...prev]);

    // If offline, enqueue into durable LocalStorage sync engine
    if (!isOnline) {
      syncEngine.enqueue({
        clientId,
        action: 'CREATE_LOST_PERSON',
        payload: newCase,
      });
      setOfflineQueue(syncEngine.getQueue());
      setNotificationToast({
        message: `Device offline. Case ${newCase.caseNumber} saved to durable offline storage; will auto-sync when online.`,
        type: 'warning',
      });
      return caseId;
    }

    // When online, transmit to authoritative server API
    fetch('/api/lost-persons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idempotencyKey: clientId,
        type: newCase.type,
        personName: newCase.personName,
        approxAge: newCase.approxAge,
        gender: newCase.gender,
        clothingDescription: newCase.clothingDescription,
        identifyingFeatures: newCase.identifyingFeatures,
        lastSeenLocation: newCase.lastSeenLocation,
        lastSeenZoneId: newCase.lastSeenZoneId,
        contactName: newCase.contactName,
        contactPhone: newCase.contactPhone,
        notes: newCase.notes
      })
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && data.record) {
          setLostCases(prev => [data.record, ...prev.filter(c => c.id !== caseId && c.id !== data.record.id)]);
          setNotificationToast({
            message: `Lost Person Case Registered & Verified by Server: ${data.record.caseNumber || newCase.caseNumber}`,
            type: 'info',
          });
        }
      })
      .catch(() => {
        // Safe fallback to persistent LocalStorage sync engine on network drop/timeout
        syncEngine.enqueue({
          clientId,
          action: 'CREATE_LOST_PERSON',
          payload: newCase,
        });
        setOfflineQueue(syncEngine.getQueue());
        setNotificationToast({
          message: `Network degraded. Case ${newCase.caseNumber} queued in durable offline storage; will auto-retry.`,
          type: 'warning',
        });
      });

    return caseId;
  };

  const verifyReunification = (caseId: string, notes: string) => {
    setLostCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          return {
            ...c,
            status: 'VERIFIED_REUNITED',
            guardianVerified: true,
            notes: `${c.notes} | VERIFIED REUNIFICATION: ${notes}`,
          };
        }
        return c;
      })
    );
    setNotificationToast({
      message: `Reunification Verified for Case ${caseId}. Guardian confirmed by Help Desk.`,
      type: 'info',
    });
  };

  // Field tasks
  const updateFieldTaskStatus = (
    taskId: string, 
    status: FieldTask['status'], 
    evidence?: { notes?: string; photoUrl?: string; checklist?: { item: string; done: boolean }[] }
  ) => {
    setFieldTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status,
            evidenceNotes: evidence?.notes || t.evidenceNotes,
            evidencePhotoUrl: evidence?.photoUrl || t.evidencePhotoUrl,
            checklist: evidence?.checklist || t.checklist,
            submittedAt: status === 'COMPLETED' ? new Date().toISOString() : t.submittedAt,
            verifiedBy: status === 'VERIFIED' ? 'Field Municipal Inspector Rao' : t.verifiedBy,
          };
        }
        return t;
      })
    );

    setNotificationToast({
      message: `Field Task ${taskId} updated to ${status}`,
      type: 'info',
    });
  };

  // Crowd simulation
  const triggerCrowdSimulation = (zoneId: string, additionalCount: number) => {
    setZones(prev =>
      prev.map(zone => {
        if (zone.id === zoneId) {
          const newCount = Math.max(0, zone.currentCount + additionalCount);
          const assessment = evaluateCrowdRisk({
            zoneId: zone.id,
            count: newCount,
            areaSqMeters: zone.areaSqMeters,
            previousCount: zone.currentCount,
            timeDeltaMinutes: 5,
          });

          if (assessment.riskLevel === 'CRITICAL' || assessment.riskLevel === 'WARNING') {
            setNotificationToast({
              message: `CROWD SURGE ALERT at ${zone.name}: Density ${assessment.density}/m² (${assessment.riskLevel})`,
              type: 'critical',
            });
          }

          return {
            ...zone,
            currentCount: newCount,
            density: assessment.density,
            status: assessment.riskLevel,
          };
        }
        return zone;
      })
    );
  };

  // Parking slot update
  const updateParkingLotOccupancy = (lotId: string, occupiedSlots: number) => {
    setParkingLots(prev =>
      prev.map(lot => {
        if (lot.id === lotId) {
          const clamped = Math.max(0, Math.min(lot.totalSlots, occupiedSlots));
          const ratio = clamped / lot.totalSlots;
          const status = ratio >= 0.95 ? 'FULL' : ratio >= 0.8 ? 'FILLING_FAST' : 'AVAILABLE';
          return { ...lot, occupiedSlots: clamped, status };
        }
        return lot;
      })
    );
  };

  // 6-Stage Safety Response Loop Orchestrator
  const advanceSafetyLoop = () => {
    if (!safetyLoopStage) {
      // Stage 1: DETECT
      setSafetyLoopStage('DETECT');
      setZones(prev =>
        prev.map(z =>
          z.id === 'saraswati_ghat'
            ? { ...z, currentCount: 19800, density: 4.71, status: 'CRITICAL' }
            : z
        )
      );
      setCctvCameras(prev =>
        prev.map(c =>
          c.id === 'cam-sw-03'
            ? { ...c, density: 4.7, status: 'WARNING', detectedHazards: ['CRITICAL SURGE: 4.7 persons/m² detected at ISKCON steps'] }
            : c
        )
      );
      setNotificationToast({
        message: 'LOOP STAGE 1 [DETECT]: CCTV AI Cam 07 at Saraswati Ghat detected sudden surge (4.7 persons/m²).',
        type: 'critical',
      });
    } else if (safetyLoopStage === 'DETECT') {
      // Stage 2: ANALYZE
      setSafetyLoopStage('ANALYZE');
      setNotificationToast({
        message: 'LOOP STAGE 2 [ANALYZE]: Predictive model flags high crowd congestion indicator (0.94 / 1.00) at Saraswati Ghat bottleneck within 15 mins. Signal age: 20s. Human review required.',
        type: 'warning',
      });
    } else if (safetyLoopStage === 'ANALYZE') {
      // Stage 3: ALERT
      setSafetyLoopStage('ALERT');
      const surgeIncidentId = 'INC-SURGE-01';
      const surgeIncident: Incident = {
        id: surgeIncidentId,
        referenceNumber: 'CMD-SURGE-2027',
        type: 'CROWD_CRUSH_HAZARD',
        severity: 'CRITICAL',
        status: 'REPORTED',
        title: 'High-Density Surge Alert at Saraswati Ghat Stairs',
        description: 'AI vision analytics reported density of 4.7 persons/m² near ISKCON temple gate. Calibrated congestion indicator: 0.94. Human review required.',
        zoneId: 'saraswati_ghat',
        zoneName: 'Saraswati Ghat & ISKCON Area',
        location: { lat: 17.0045, lng: 81.7768 },
        reportedBy: {
          userId: 'system-ai',
          name: 'AI Crowd Sensor System',
          phone: '0883-247111',
          role: 'command_operator',
        },
        createdAt: new Date().toLocaleTimeString(),
        updatedAt: new Date().toLocaleTimeString(),
        events: [
          {
            id: `evt-${Date.now()}`,
            incidentId: surgeIncidentId,
            actorId: 'ai-engine',
            actorName: 'AI Intelligence Core',
            actorRole: 'command_operator',
            eventType: 'SURGE_ALGORITHM_TRIGGERED',
            notes: 'Zone density reached 4.7 persons/m²',
            timestamp: new Date().toLocaleTimeString(),
          },
        ],
        source: 'AI_CAMERA_CROWD',
      };
      setIncidents(prev => [surgeIncident, ...prev.filter(i => i.id !== surgeIncidentId)]);
      
      const newAlert: PublicAlert = {
        id: `alt-surge-${Date.now()}`,
        titleEn: 'Ghat Diversion: High Crowd at Saraswati Ghat',
        titleTe: 'ఘాట్ మళ్లింపు: సరస్వతి ఘాట్ వద్ద అధిక రద్దీ',
        titleHi: 'घाट डायवर्जन: सरस्वती घाट पर अत्यधिक भीड़',
        messageEn: 'Saraswati Ghat is at maximum capacity. Please proceed to Markandeya Ancient Ghat for quick holy bath (10 min walk, free shuttle available).',
        messageTe: 'సరస్వతి ఘాట్ వద్ద పూర్తి రద్దీ ఏర్పడింది. భక్తులు మార్కండేయ ఘాట్‌కు వెళ్లవలసిందిగా విజ్ఞప్తి (10 నిముషాల నడక, ఉచిత షటిల్ అందుబాటులో ఉంది).',
        messageHi: 'सरस्वती घाट पूर्ण रूप से भरा हुआ है। कृपया मार्कंडेय घाट की ओर प्रस्थान करें।',
        category: 'CROWD_DIVERSION',
        urgency: 'CRITICAL',
        affectedZoneIds: ['saraswati_ghat'],
        approvalStatus: 'BROADCASTED',
        approvedBy: 'Command Duty Officer Sri K. Rao',
        createdAt: new Date().toLocaleTimeString(),
        expiresAt: '2 hours later',
      };
      setPublicAlerts(prev => [newAlert, ...prev]);
      setNotificationToast({
        message: 'LOOP STAGE 3 [ALERT]: Incident created on Command Board & Multi-lingual Public Diversion Alert broadcasted.',
        type: 'critical',
      });
    } else if (safetyLoopStage === 'ALERT') {
      // Stage 4: RESPOND
      setSafetyLoopStage('RESPOND');
      setIncidents(prev =>
        prev.map(i =>
          i.id === 'INC-SURGE-01'
            ? {
                ...i,
                status: 'EN_ROUTE',
                assignedTo: {
                  id: `asg-${Date.now()}`,
                  responderId: 'resp-sdrf-1',
                  responderName: 'Inspector Ravi & SDRF Quick Action Unit 4',
                  responderDepartment: 'SDRF / River Rescue',
                  assignedAt: new Date().toLocaleTimeString(),
                  status: 'EN_ROUTE',
                },
              }
            : i
        )
      );
      setShuttleBuses(prev =>
        prev.map(b =>
          b.id === 'bus-gl-202'
            ? { ...b, nextStop: 'Markandeya Temple Arch (Diverted from Saraswati)' }
            : b
        )
      );
      setNotificationToast({
        message: 'LOOP STAGE 4 [RESPOND]: SDRF Quick Action Team dispatched to deploy barricades; Shuttle GL-2 diverted to Markandeya.',
        type: 'info',
      });
    } else if (safetyLoopStage === 'RESPOND') {
      // Stage 5: GUIDE
      setSafetyLoopStage('GUIDE');
      setNotificationToast({
        message: 'LOOP STAGE 5 [GUIDE]: Pilgrim App & Public Kiosks updated: Walking routes diverted, Markandeya promoted with 5-min queue.',
        type: 'info',
      });
    } else if (safetyLoopStage === 'GUIDE') {
      // Stage 6: VERIFY
      setSafetyLoopStage('VERIFY');
      setZones(prev =>
        prev.map(z =>
          z.id === 'saraswati_ghat'
            ? { ...z, currentCount: 10200, density: 2.15, status: 'NORMAL' }
            : z
        )
      );
      setCctvCameras(prev =>
        prev.map(c =>
          c.id === 'cam-sw-03'
            ? { ...c, density: 2.15, status: 'ONLINE', detectedHazards: ['Normal flow resumed', 'Safe density verified'] }
            : c
        )
      );
      setIncidents(prev =>
        prev.map(i =>
          i.id === 'INC-SURGE-01'
            ? { ...i, status: 'RESOLVED' }
            : i
        )
      );
      setNotificationToast({
        message: 'LOOP STAGE 6 [VERIFY]: Saraswati density reduced to 2.1 persons/m². Bottleneck cleared. Incident auto-verified & RESOLVED!',
        type: 'info',
      });
    }
  };

  const resetSafetyLoop = () => {
    setSafetyLoopStage(null);
    setZones(INITIAL_ZONES);
    setCctvCameras(MOCK_CCTV_CAMERAS);
    setShuttleBuses(MOCK_SHUTTLE_BUSES);
    setNotificationToast({
      message: 'Safety Response Loop reset to baseline operational status.',
      type: 'info',
    });
  };

  // Synchronize offline queue with Authoritative Central Server
  const syncOfflineQueue = async (): Promise<number> => {
    const queue = syncEngine.getQueue().filter(q => q.status === 'QUEUED');
    if (queue.length === 0) {
      return 0;
    }

    let synced = 0;
    try {
      // 1. Attempt batch sync via centralized batch reconciler
      const response = await fetch('/api/incidents/batch-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: queue })
      });

      if (!response.ok) {
        throw new Error(`Batch sync failed with HTTP ${response.status}`);
      }

      const result = await response.json();
      if (result && Array.isArray(result.acknowledgments)) {
        for (const ack of result.acknowledgments) {
          syncEngine.markSynced(ack.clientId);
          synced++;
        }

        // Fetch refreshed authoritative incident & lost person lists from server
        try {
          const fetchRes = await fetch('/api/incidents');
          if (fetchRes.ok) {
            const data = await fetchRes.json();
            if (data && Array.isArray(data.incidents)) {
              setIncidents(data.incidents);
            }
          }
        } catch {}

        try {
          const lostRes = await fetch('/api/lost-persons');
          if (lostRes.ok) {
            const data = await lostRes.json();
            if (data && Array.isArray(data.cases)) {
              setLostCases(data.cases);
            }
          }
        } catch {}

        setOfflineQueue(syncEngine.getQueue());
        if (synced > 0) {
          setNotificationToast({
            message: `Durable Sync Success: ${synced} queued emergency report(s) reconciled with Central Authority.`,
            type: 'info',
          });
        }
        return synced;
      } else {
        throw new Error('Malformed batch sync response');
      }
    } catch {
      // 2. Resilient Single-Item Fallback Retries
      const readyItems = syncEngine.getReadyItems();
      for (const item of readyItems) {
        try {
          if (item.action === 'CREATE_INCIDENT') {
            const res = await fetch('/api/incidents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                idempotencyKey: item.clientId,
                type: item.payload.type,
                severity: item.payload.severity,
                title: item.payload.title,
                description: item.payload.description,
                zoneId: item.payload.zoneId,
                location: item.payload.location,
                userName: item.payload.reportedBy?.name || item.payload.userName,
                userPhone: item.payload.reportedBy?.phone || item.payload.userPhone,
                userRole: item.payload.reportedBy?.role || 'pilgrim'
              })
            });
            if (res.ok) {
              syncEngine.markSynced(item.clientId);
              synced++;
            } else {
              syncEngine.recordRetry(item.clientId, `HTTP ${res.status}`);
            }
          } else if (item.action === 'CREATE_LOST_PERSON' || item.action === 'REPORT_LOST_PERSON') {
            const res = await fetch('/api/lost-persons', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                idempotencyKey: item.clientId,
                type: item.payload.type,
                personName: item.payload.personName,
                approxAge: item.payload.approxAge,
                gender: item.payload.gender,
                clothingDescription: item.payload.clothingDescription,
                identifyingFeatures: item.payload.identifyingFeatures,
                lastSeenLocation: item.payload.lastSeenLocation,
                lastSeenZoneId: item.payload.lastSeenZoneId,
                contactName: item.payload.contactName,
                contactPhone: item.payload.contactPhone,
                notes: item.payload.notes
              })
            });
            if (res.ok) {
              syncEngine.markSynced(item.clientId);
              synced++;
            } else {
              syncEngine.recordRetry(item.clientId, `HTTP ${res.status}`);
            }
          }
        } catch (itemErr: any) {
          syncEngine.recordRetry(item.clientId, itemErr?.message || 'Network unreachable');
        }
      }

      setOfflineQueue(syncEngine.getQueue());
      if (synced > 0) {
        setNotificationToast({
          message: `Durable Sync: Re-attempted & reconciled ${synced} report(s) with Central Authority.`,
          type: 'info',
        });
      }
      return synced;
    }
  };

  // Automatic Connectivity Restoration Listener & Background Sync Loop
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNotificationToast({
        message: 'Network connection restored. Automatically re-attempting queued reports...',
        type: 'info'
      });
      syncOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNotificationToast({
        message: 'Internet disconnected. Durable offline queue active for SOS and lost reports.',
        type: 'warning'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic automatic background check every 10 seconds for any ready queued items
    const interval = setInterval(() => {
      if (isOnline && syncEngine.getPendingCount() > 0) {
        syncOfflineQueue();
      }
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  return (
    <AppContext.Provider
      value={{
        currentInterface,
        setCurrentInterface,
        language,
        setLanguage,
        appLanguage,
        setAppLanguage,
        t,
        tApp,
        isOnline,
        setIsOnline,
        currentUserRole,
        setCurrentUserRole,
        incidents,
        zones,
        facilities,
        lostCases,
        publicAlerts,
        fieldTasks,
        offlineQueue,
        parkingLots,
        shuttleBuses,
        trafficDiversions,
        cctvCameras,
        crowdForecast,
        insightsSummary,
        safetyLoopStage,
        createSosIncident,
        updateIncidentStatus,
        assignResponder,
        createPublicAlert,
        approvePublicAlert,
        createLostPersonCase,
        verifyReunification,
        updateFieldTaskStatus,
        triggerCrowdSimulation,
        syncOfflineQueue,
        notificationToast,
        clearNotification,
        setSafetyLoopStage,
        advanceSafetyLoop,
        resetSafetyLoop,
        updateParkingLotOccupancy,
        isOperatorAuthenticated,
        operatorSession,
        loginOperator,
        logoutOperator,
        isOfficialAccessModalOpen,
        setIsOfficialAccessModalOpen,
        isAppDownloadModalOpen,
        setIsAppDownloadModalOpen,
        pendingRestrictedInterface,
        setPendingRestrictedInterface,
        isPilgrimAuthenticated,
        pilgrimSession,
        loginPilgrim,
        logoutPilgrim,
        bulletins,
        addBulletin,
        updateBulletin,
        deleteBulletin,
        clearAllCasesAndAlerts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

