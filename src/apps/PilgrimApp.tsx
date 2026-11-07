import { archiveProfile, restoreProfile } from '../utils/accountProfiles';
import { BrandLogo } from '../components/BrandLogo';
import { PilgrimWelcome } from '../components/PilgrimWelcome';
import { PilgrimProfileSettings } from '../components/PilgrimProfileSettings';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GisMap } from '../components/GisMap';
import { VERIFIED_FAQ } from '../data/mockData';
import { 
  AlertTriangle, 
  MapPin, 
  PhoneCall, 
  Search, 
  HelpCircle, 
  Compass, 
  Car, 
  Droplets, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  Send, 
  Info, 
  Clock, 
  CheckCircle2, 
  Volume2, 
  VolumeX,
  ArrowRight,
  UserX,
  HeartPulse,
  QrCode,
  X,
  Copy,
  Check,
  Download,
  Flame,
  Tent,
  Navigation,
  Bell,
  Sun,
  Moon,
  Footprints,
  Siren,
  Radio,
  Ticket,
  Waves,
  Utensils,
  Mic,
  CloudRain,
  Activity,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Building2,
  Train,
  Fingerprint,
  User,
  Lock,
  ExternalLink,
  RefreshCw,
  Key,
  Shield,
  Wifi
} from 'lucide-react';
import { DignitaryLeadershipBanner } from '../components/DignitaryLeadershipBanner';
import { JourneyTools } from '../components/JourneyTools';
import { integrationHub, VoiceQueryResponse } from '../logic/integrationHub';
import { IncidentType, IncidentSeverity, Facility, Coordinates } from '../types';
import { generateFacilityQrCode, createFacilityQrPayload } from '../utils/qrCodeGenerator';
import { audioEngine } from '../utils/audioAlarm';
import { playSpeechAlert, stopSpeechAlert } from '../utils/speechAlert';
import { SACRED_MUHURTHAMS, calculateGhatWaitTime, getBestGhatRecommendation, SnanamMuhurtham } from '../utils/snanamSchedule';
import { calculateDistanceMeters } from '../utils/geofence';
import { FamilySafetyCircle } from '../components/FamilySafetyCircle';
import { PersonalizedDipPlanner } from '../components/PersonalizedDipPlanner';
import { LiveWalkingWayfinder } from '../components/LiveWalkingWayfinder';
import { VirtualQueueToken } from '../components/VirtualQueueToken';
import { RiverQualityMonitor } from '../components/RiverQualityMonitor';
import { AnnadanamPrasadamFinder } from '../components/AnnadanamPrasadamFinder';
import { PilgrimWeatherForecastWidget } from '../components/PilgrimWeatherForecastWidget';
import { PilgrimBottomNav, PilgrimMainTab } from '../components/PilgrimBottomNav';
import { PilgrimMoreTab } from '../components/PilgrimMoreTab';
import { PilgrimExploreRajahmundry } from '../components/PilgrimExploreRajahmundry';
import { PilgrimPushkaraluTab } from '../components/PilgrimPushkaraluTab';
import { BiometricVerification } from '../components/BiometricVerification';
import { BiometricVerificationHistory } from '../components/BiometricVerificationHistory';
import { PublicSevaPortal } from '../components/PublicSevaPortal';
import { calculatePedestrianShortestPath } from '../utils/pedestrianRouter';
import { GhatLiveStreamSection } from '../components/GhatLiveStreamSection';
import { NearbyAmenitiesMiniMap } from '../components/NearbyAmenitiesMiniMap';

export const PilgrimApp: React.FC = () => {
  const { 
    appLanguage: language, 
    setAppLanguage: setLanguage,
    isOnline, 
    zones, 
    facilities, 
    publicAlerts, 
    incidents, 
    createSosIncident,
    createLostPersonCase,
    safetyLoopStage,
    logoutPilgrim,
    setCurrentInterface
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    | 'home' 
    | 'map' 
    | 'sos' 
    | 'snanam' 
    | 'camp_pin' 
    | 'assistant' 
    | 'lost_found' 
    | 'alerts' 
    | 'transport' 
    | 'family' 
    | 'planner'
    | 'wayfinder'
    | 'token'
    | 'water_quality'
    | 'annadanam'
    | 'explore'
    | 'pushkaralu'
    | 'more'
    | 'profile'
    | 'public_seva'
  >('home');
  React.useEffect(() => {
    const title = activeTab.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    document.title = `${title} | Pilgrim Companion | Godavari One`;
  }, [activeTab]);

  // Pilgrim App Devotee Profile State (with Assigned Ghat & Swayam Slot)
  const [welcomeComplete, setWelcomeComplete] = useState(false);
  const [accountEntry, setAccountEntry] = useState<'splash'|'account'|'login'|'signup'>('splash');
  const [accountNotice, setAccountNotice] = useState('');
  const [appProfile, setAppProfile] = useState<{
    name: string;
    photoUrl?: string;
    email?: string;
    accessibilityNeeds?: string;
    phone: string;
    regId: string;
    assignedGhat: string;
    swayamSlot: string;
    age: string;
    city: string;
    bloodGroup: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    biometricEnabled: boolean;
    faceIdEnabled: boolean;
    isLoggedIn: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem('g1_pilgrim_app_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: 'Guest',
      phone: '',
      regId: '',
      assignedGhat: 'Pushkar Ghat (Main & VIP)',
      swayamSlot: 'Brahma Muhurtham (04:30 - 06:00 AM)',
      age: '',
      city: '',
      bloodGroup: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      biometricEnabled: false,
      faceIdEnabled: false,
      isLoggedIn: false,
    };
  });

  const saveAppProfile = (updated: typeof appProfile) => {
    try {
      archiveProfile(localStorage, updated);
      localStorage.setItem('g1_pilgrim_app_profile', JSON.stringify(updated));
      setAppProfile(updated);
      return true;
    } catch (e) { return false; }
  };

  // Mobile + OTP Login Flow State
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginStep, setLoginStep] = useState<'phone' | 'otp' | 'details'>('phone');
  const [loginInputPhone, setLoginInputPhone] = useState<string>('9848022338');
  const [loginInputOtp, setLoginInputOtp] = useState<string>('');
  const [loginInputName, setLoginInputName] = useState<string>('Avinash Kumar');
  const [loginInputGhat, setLoginInputGhat] = useState<string>('Pushkar Ghat (Main & VIP)');
  const [loginInputSlot, setLoginInputSlot] = useState<string>('Brahma Muhurtham (04:30 - 06:00 AM)');
  const [loginInputAge, setLoginInputAge] = useState<string>('38');
  const [loginInputCity, setLoginInputCity] = useState<string>('Rajahmundry');
  const [loginInputBloodGroup, setLoginInputBloodGroup] = useState<string>('O+');
  const [loginInputEmergencyName, setLoginInputEmergencyName] = useState<string>('Suresh Varma');
  const [loginInputEmergencyPhone, setLoginInputEmergencyPhone] = useState<string>('9849011223');
  const [loginBiometricOptIn, setLoginBiometricOptIn] = useState<boolean>(true);
  const [loginModalNotice, setLoginModalNotice] = useState<string | null>(null);

  // Biometric Test Simulation State
  const [isBiometricScanning, setIsBiometricScanning] = useState<boolean>(false);
  const [biometricScanResult, setBiometricScanResult] = useState<string | null>(null);

  // Profile Edit Modal State
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);

  // Mobile Status Bar Clock
  const [mobileClock, setMobileClock] = useState<string>(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setMobileClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const getMainNavTab = (): PilgrimMainTab => {
    if (activeTab === 'explore') return 'explore';
    if (activeTab === 'sos') return 'sos';
    if (activeTab === 'pushkaralu' || activeTab === 'planner' || activeTab === 'snanam') return 'pushkaralu';
    if (activeTab === 'more') return 'more';
    return 'home';
  };

  const handleBottomNavChange = (tab: PilgrimMainTab) => {
    if (tab === 'home') setActiveTab('home');
    else if (tab === 'explore') setActiveTab('explore');
    else if (tab === 'sos') setActiveTab('sos');
    else if (tab === 'pushkaralu') setActiveTab('pushkaralu');
    else if (tab === 'more') setActiveTab('more');
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacilityFilter, setSelectedFacilityFilter] = useState<string>('ALL');

  // Emergency Siren & Strobe Whistle state
  const [isSirenOn, setIsSirenOn] = useState<boolean>(false);
  const [isWhistleActive, setIsWhistleActive] = useState<boolean>(false);
  const [isStrobeActive, setIsStrobeActive] = useState<boolean>(false);
  const [strobeIndex, setStrobeIndex] = useState<number>(0);
  const [showSirenModal, setShowSirenModal] = useState<boolean>(false);

  // Speech synthesis playback
  const [playingAlertId, setPlayingAlertId] = useState<string | null>(null);

  // "Find My Camp / Vehicle Pin" GPS state
  const [savedCampPin, setSavedCampPin] = useState<{ name: string; lat: number; lng: number; savedAt: string } | null>(() => {
    const s = localStorage.getItem('g1_camp_pin');
    return s ? JSON.parse(s) : null;
  });
  const [campLabelInput, setCampLabelInput] = useState<string>('Kotilingala Family Tent #4');
  const [currentPilgrimLoc, setCurrentPilgrimLoc] = useState<Coordinates>({ lat: 17.0010, lng: 81.7760 });
  const [isMiniMapOpen, setIsMiniMapOpen] = useState<boolean>(true);

  const handleRefreshGpsLocation = () => {
    if (typeof window !== 'undefined' && 'navigator' in window && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentPilgrimLoc({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        () => {
          // Micro-jitter around Rajahmundry riverfront for testing
          setCurrentPilgrimLoc(prev => ({
            lat: 17.0010 + (Math.random() - 0.5) * 0.0015,
            lng: 81.7760 + (Math.random() - 0.5) * 0.0015
          }));
        },
        { timeout: 4000, enableHighAccuracy: true }
      );
    } else {
      setCurrentPilgrimLoc(prev => ({
        lat: 17.0010 + (Math.random() - 0.5) * 0.0015,
        lng: 81.7760 + (Math.random() - 0.5) * 0.0015
      }));
    }
  };
  
  // Emergency SOS state
  const [sosType, setSosType] = useState<IncidentType>('MEDICAL');
  const [sosSeverity, setSosSeverity] = useState<IncidentSeverity>('HIGH');
  const [sosDetails, setSosDetails] = useState('');
  const [sosZoneId, setSosZoneId] = useState(zones[0]?.id || 'pushkar_ghat');
  const [sosSubmittedCase, setSosSubmittedCase] = useState<{ id: string; message: string; isQueuedOffline?: boolean } | null>(null);
  const [sosUserName, setSosUserName] = useState('');
  const [sosUserPhone, setSosUserPhone] = useState('');

  // Lost person form state
  const [lostType, setLostType] = useState<'MISSING' | 'FOUND'>('MISSING');
  const [lostName, setLostName] = useState('');
  const [lostAge, setLostAge] = useState<number>(8);
  const [lostGender, setLostGender] = useState<'CHILD' | 'MALE' | 'FEMALE' | 'OTHER'>('CHILD');
  const [lostClothing, setLostClothing] = useState('');
  const [lostFeatures, setLostFeatures] = useState('');
  const [lostLocation, setLostLocation] = useState('Kotilingala Ghat Promenade');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [submittedLostCaseId, setSubmittedLostCaseId] = useState<string | null>(null);

  // Sarvam & Bhashini Voice Assistant State
  const [voiceResult, setVoiceResult] = useState<VoiceQueryResponse | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState<boolean>(false);
  const [spokenPrompt, setSpokenPrompt] = useState<string>('');

  // Kumbh-style Dignitary & Hero banner carousel state
  const [dignitaryIndex, setDignitaryIndex] = useState<number>(0);
  const [heroBannerIndex, setHeroBannerIndex] = useState<number>(0);

  const handleSimulateVoiceQuery = (queryText: string) => {
    setIsProcessingVoice(true);
    setSpokenPrompt(queryText);
    setTimeout(() => {
      const res = integrationHub.processVoiceQuery(queryText, language);
      setVoiceResult(res);
      setIsProcessingVoice(false);
      playSpeechAlert(res.responseText, res.language);
    }, 500);
  };

  // Facility QR Code state
  const [selectedQrFacility, setSelectedQrFacility] = useState<Facility | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [qrLoading, setQrLoading] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const handleViewFacilityQr = async (fac: Facility) => {
    setSelectedQrFacility(fac);
    setQrLoading(true);
    setCopiedKey(false);
    try {
      const url = await generateFacilityQrCode(fac, { width: 320, margin: 2 });
      setQrCodeDataUrl(url);
    } catch (err) {
      console.error('Failed to generate facility QR', err);
    } finally {
      setQrLoading(false);
    }
  };

  const handleCopyVerificationKey = () => {
    if (!selectedQrFacility) return;
    const payload = createFacilityQrPayload(selectedQrFacility);
    navigator.clipboard?.writeText(payload.verificationKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleDownloadQr = () => {
    if (!qrCodeDataUrl || !selectedQrFacility) return;
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `Pushkaralu-${selectedQrFacility.id}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Strobe effect interval
  React.useEffect(() => {
    let interval: any;
    if (isStrobeActive) {
      interval = setInterval(() => {
        setStrobeIndex(prev => (prev + 1) % 3);
      }, 180);
    }
    return () => clearInterval(interval);
  }, [isStrobeActive]);

  const toggleSiren = () => {
    if (isSirenOn) {
      audioEngine.stopSiren();
      setIsSirenOn(false);
    } else {
      const started = audioEngine.startSiren();
      if (started) setIsSirenOn(true);
    }
  };

  const handleWhistle = () => {
    setIsWhistleActive(true);
    audioEngine.playWhistleBurst();
    setTimeout(() => setIsWhistleActive(false), 900);
  };

  const handleToggleSpeech = (alertId: string, text: string) => {
    if (playingAlertId === alertId) {
      stopSpeechAlert();
      setPlayingAlertId(null);
    } else {
      playSpeechAlert(text, language);
      setPlayingAlertId(alertId);
    }
  };

  const handleSaveCampPin = (customLabel?: string) => {
    const pin = {
      name: customLabel || campLabelInput || 'Kotilingala Family Tent #4',
      lat: currentPilgrimLoc.lat,
      lng: currentPilgrimLoc.lng,
      savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSavedCampPin(pin);
    localStorage.setItem('g1_camp_pin', JSON.stringify(pin));
  };

  const handleClearCampPin = () => {
    setSavedCampPin(null);
    localStorage.removeItem('g1_camp_pin');
  };

  const calculateBearingDegrees = (start: Coordinates, dest: Coordinates): number => {
    const startLat = (start.lat * Math.PI) / 180;
    const startLng = (start.lng * Math.PI) / 180;
    const destLat = (dest.lat * Math.PI) / 180;
    const destLng = (dest.lng * Math.PI) / 180;
    const y = Math.sin(destLng - startLng) * Math.cos(destLat);
    const x = Math.cos(startLat) * Math.sin(destLat) - Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    const brng = (Math.atan2(y, x) * 180) / Math.PI;
    return Math.round((brng + 360) % 360);
  };
  const [assistantInput, setAssistantInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; source?: string }>>([
    {
      sender: 'assistant',
      text: language === 'te' 
        ? 'నమస్కారం! నేను గోదావరి పుష్కరాలు 2027 అధికారిక సహాయకుడిని. ఘాట్లు, స్నాన సమయాలు, ఉచిత బస్సులు లేదా సహాయ కేంద్రాల గురించి ఏదైనా అడగండి.'
        : language === 'hi'
        ? 'नमस्ते! मैं गोदावरी पुष्करालु 2027 आधिकारिक सहायक हूँ। आप घाटों, स्नान के शुभ मुहूर्त या सुविधाओं के बारे में पूछ सकते हैं।'
        : 'Namaskaram! I am the verified Godavari Pushkaralu 2027 Assistant. Ask me about auspicious bathing hours, clean ghats, free shuttles, or safety guidelines.',
      source: 'District Administration Knowledge Base',
    },
  ]);

  const handleSendAssistant = (customQuery?: string) => {
    const q = (customQuery || assistantInput).trim();
    if (!q) return;

    const newMsgs = [...chatMessages, { sender: 'user' as const, text: q }];
    setChatMessages(newMsgs);
    if (!customQuery) setAssistantInput('');

    // Match verified FAQ or give official verified guidance
    setTimeout(() => {
      const qLower = q.toLowerCase();
      let matched = VERIFIED_FAQ.find(item => 
        item.qEn.toLowerCase().includes(qLower) || 
        qLower.includes('bathing') || 
        qLower.includes('time') || 
        qLower.includes('muhurtham') ||
        qLower.includes('స్నాన') ||
        qLower.includes('సమయం')
      );

      if (qLower.includes('bus') || qLower.includes('shuttle') || qLower.includes('reach') || qLower.includes('parking') || qLower.includes('బస్సు')) {
        matched = VERIFIED_FAQ[1];
      } else if (qLower.includes('lost') || qLower.includes('separated') || qLower.includes('missing') || qLower.includes('తప్పి')) {
        matched = VERIFIED_FAQ[2];
      } else if (qLower.includes('toilet') || qLower.includes('cloak') || qLower.includes('dress') || qLower.includes('changing') || qLower.includes('గదు')) {
        matched = VERIFIED_FAQ[3];
      }

      let reply = '';
      if (matched) {
        reply = language === 'te' ? matched.aTe : language === 'hi' ? matched.aHi : matched.aEn;
      } else {
        reply = language === 'te'
          ? `మీ ప్రశ్నకు అధికారిక పుష్కరాల సమాచార నిధి నుండి: రాజమండ్రిలోని ప్రధాన ఘాట్లన్నింటిలో 24 గంటల పర్యవేక్షణ, ఉచిత త్రాగునీరు, 108 వైద్య శిబిరాలు మరియు రక్షణ బోట్లు అమర్చబడ్డాయి. అత్యవసరమైతే హెల్ప్‌లైన్ 112 లేదా సమీప సహాయ కేంద్రాన్ని సంప్రదించండి.`
          : language === 'hi'
          ? `आधिकारिक पुष्करालु सूचना: सभी घाटों पर 24 घंटे सुरक्षा, पेयजल, 108 चिकित्सा केंद्र और SDRF नावें उपलब्ध हैं। आपात स्थिति में 112 डायल करें।`
          : `Verified Pushkaralu Information: All Rajahmundry ghats are operating 24x7 with continuous lighting, purified RO water kiosks, 108 first aid tents, and SDRF river safety boats. For emergency help, trigger SOS or dial 112.`;
      }

      setChatMessages([...newMsgs, { sender: 'assistant', text: reply, source: 'Rajahmundry District Pushkaralu Board' }]);
    }, 400);
  };

  const handleSosSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const zone = zones.find(z => z.id === sosZoneId) || zones[0];
    const res = await createSosIncident({
      type: sosType,
      severity: sosSeverity,
      title: `${sosType.replace('_', ' ')} Emergency at ${zone.name}`,
      description: sosDetails || `Immediate assistance requested by pilgrim at ${zone.name}.`,
      zoneId: zone.id,
      location: zone.coordinates,
      userName: sosUserName || 'Pilgrim',
      userPhone: sosUserPhone || '+91 98480 00000',
    });

    setSosSubmittedCase({
      id: res.incidentId || 'INC-PENDING',
      message: res.message,
      isQueuedOffline: res.isQueuedOffline,
    });
  };

  const handleLostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const caseId = createLostPersonCase({
      type: lostType,
      personName: lostName,
      approxAge: Number(lostAge),
      gender: lostGender,
      clothingDescription: lostClothing,
      identifyingFeatures: lostFeatures,
      lastSeenLocation: lostLocation,
      lastSeenZoneId: 'kotilingala_ghat',
      lastSeenTime: 'Just now',
      contactName,
      contactPhone,
      notes: `Registered via Pilgrim App.`,
    });
    setSubmittedLostCaseId(caseId);
  };

  // Translations helper
  const t = (en: string, te: string, hi: string) => {
    return language === 'te' ? te : language === 'hi' ? hi : en;
  };

  const filteredFacilities = facilities.filter(f => {
    if (selectedFacilityFilter === 'ALL') return true;
    return f.type === selectedFacilityFilter;
  });

  const changeAccount = (next: 'account'|'login'|'signup') => {
    try {
      archiveProfile(localStorage, appProfile);
      localStorage.removeItem('g1_pilgrim_app_profile');
    } catch { setAccountNotice('Unable to save the current profile. Free browser storage before switching accounts.'); return; }
    logoutPilgrim();
    setAppProfile({...appProfile,name:'Guest',phone:'',regId:'',age:'',city:'',bloodGroup:'',emergencyContactName:'',emergencyContactPhone:'',photoUrl:'',email:'',accessibilityNeeds:'',biometricEnabled:false,faceIdEnabled:false,isLoggedIn:false});
    setShowLoginModal(false); setIsEditingProfile(false);
    setLoginInputPhone(''); setLoginInputName(''); setLoginInputOtp('');
    setLoginInputEmergencyName(''); setLoginInputEmergencyPhone('');
    setActiveTab('home');setAccountNotice('');setAccountEntry(next);setWelcomeComplete(false);
  };
  if (!welcomeComplete) return <PilgrimWelcome initialStep={accountEntry} returning={appProfile.isLoggedIn} onComplete={account => {
    let restored: Partial<typeof appProfile> = {};
    if (account) { try { restored = restoreProfile<typeof appProfile>(localStorage, account.phone); } catch {} }
    if (account) saveAppProfile({...appProfile, ...(appProfile.phone !== account.phone ? {age:'',city:'',bloodGroup:'',emergencyContactName:'',emergencyContactPhone:'',photoUrl:'',email:'',accessibilityNeeds:'',biometricEnabled:false,faceIdEnabled:false} : {}), ...restored, name: account.name, phone: account.phone, regId: account.regNumber, isLoggedIn: true});
    setWelcomeComplete(true);
    document.title = 'Home | Pilgrim Companion | Godavari One';
  }} />;

  return (
    <div className="min-h-screen bg-[#061815] md:bg-radial-[at_top] md:from-[#0a2f28] md:via-[#061c18] md:to-[#030d0b] flex flex-col items-center justify-start md:py-6 px-0 sm:px-2 selection:bg-amber-400 selection:text-stone-950 font-sans">
      


      {/* Devotee Mobile Device Shell */}
      <div className="w-full max-w-[420px] bg-[#FDFBF7] text-[#1A2E2B] min-h-screen md:min-h-[850px] md:max-h-[92vh] md:rounded-[44px] md:border-[10px] md:border-[#1E292E] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.12)] flex flex-col relative overflow-hidden">
        


        {/* Sleek Mobile App Navigation Header */}
        <header className="sticky top-0 z-30 bg-[#0A3A40] text-white shadow-md border-b border-white/10 shrink-0">
          <div className="w-full px-3.5 py-2.5 flex items-center justify-between">

            <div className="flex items-left gap-2">
              <BrandLogo className="w-9 h-9" />
              <div className="text-left">
                <h1 className="text-xs font-black tracking-tight text-white leading-tight">
                  Godavari Pushkaralu 2027
                </h1>
                <span className="text-[9px] text-amber-300/90 font-medium block">
                  {t('Pilgrim Companion App', 'యాత్రికుల మొబైల్ యాప్', 'तीर्थयात्री साथी ऐप')}
                </span>
              </div>
            </div>

            {/* Devotee Profile & Login Button */}
            <button
              onClick={() => {
                if (appProfile.isLoggedIn) {
                  setActiveTab('profile');
                } else {
                  setShowLoginModal(true);
                }
              }}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black px-2.5 py-1 rounded-xl text-[11px] shadow transition cursor-pointer"
            >
              {appProfile.isLoggedIn ? (
                <>
                  {appProfile.photoUrl ? <img src={appProfile.photoUrl} alt="Your profile" className="w-6 h-6 rounded-full object-cover"/> : <User className="w-3.5 h-3.5 text-stone-950" />}
                  <span className="max-w-[70px] truncate">{appProfile.name.split(' ')[0]}</span>
                </>
              ) : (
                <>
                  <Key className="w-3.5 h-3.5 text-stone-950" />
                  <span>Login</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Scrollable Main Mobile Content Container */}
        <main className="flex-1 overflow-y-auto p-3.5 space-y-4 pb-28 no-scrollbar w-full">
        
        {/* Back to Home Header when inside a subfeature */}
        {activeTab !== 'home' && activeTab !== 'explore' && activeTab !== 'pushkaralu' && activeTab !== 'more' && (
          <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-2xl shadow-sm border border-gray-200">
            <button
              onClick={() => setActiveTab('home')}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0A3A40] hover:text-emerald-700 transition cursor-pointer"
            >
              <span>←</span>
              <span>{t('Back to Home', 'హోమ్‌కు తిరిగి వెళ్ళండి', 'मुख्य पृष्ठ पर वापस')}</span>
            </button>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-full">
              {activeTab.replace('_', ' ')}
            </span>
          </div>
        )}

        {/* 1. HOME VIEW */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* Leadership Banner matching attached image strictly on Home Screen only */}
            <DignitaryLeadershipBanner language={language} className="mb-2" />
            <JourneyTools />

            {/* Devotee Assigned Ghat & Swayam Slot Identity Card */}
            <div className="bg-gradient-to-br from-[#06201b] to-[#0d3b32] text-white p-3.5 rounded-2xl border-2 border-amber-400/80 shadow-md">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-800/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-black text-xs shadow">
                    <img src="/assets/branding/godavari-one-logo.png" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 block">
                      {t('DEVOTEE IDENTITY PASS', 'భక్తుని గుర్తింపు పాస్', 'तीर्थयात्री पहचान पत्र')}
                    </span>
                    <span className="text-xs font-black text-white">
                      {appProfile.isLoggedIn ? appProfile.name : t('Guest Devotee', 'అతిథి భక్తుడు', 'अतिथि')}
                    </span>
                  </div>
                </div>
                {appProfile.isLoggedIn ? (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                    {appProfile.regId}
                  </span>
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-amber-400 hover:bg-amber-300 text-stone-950 text-[10px] font-black px-2.5 py-1 rounded-lg transition cursor-pointer"
                  >
                    {t('Sign In (OTP)', 'లాగిన్ అవ్వండి', 'लॉग इन')}
                  </button>
                )}
              </div>

              {appProfile.isLoggedIn ? (
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#041714] p-2 rounded-xl border border-emerald-900/60">
                      <span className="text-[9px] text-gray-400 uppercase font-bold block">
                        {t('Assigned Ghat', 'కేటాయించిన ఘాట్', 'आवंटित घाट')}
                      </span>
                      <span className="text-amber-300 font-extrabold text-[11px] block truncate">
                        {appProfile.assignedGhat}
                      </span>
                    </div>
                    <div className="bg-[#041714] p-2 rounded-xl border border-emerald-900/60">
                      <span className="text-[9px] text-gray-400 uppercase font-bold block">
                        {t('Swayam Snanam Slot', 'స్వయం స్నాన సమయం', 'पवित्र स्नान समय')}
                      </span>
                      <span className="text-white font-extrabold text-[11px] block truncate">
                        {appProfile.swayamSlot.split('(')[0]}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=16.9942,81.7766&travelmode=walking`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1.5 rounded-xl text-[10px] inline-flex items-center gap-1 shadow transition cursor-pointer"
                    >
                      <MapPin className="w-3 h-3 text-amber-300" />
                      <span>{t('Open in Google Maps', 'గూగుల్ మ్యాప్స్‌లో తెరవండి', 'गूगल मैप्स पर देखें')}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>

                    <button
                      onClick={() => setActiveTab('profile')}
                      className="text-amber-300 hover:text-white text-[11px] font-bold underline cursor-pointer"
                    >
                      {t('View Full Pass & Biometrics →', 'పూర్తి పాస్ & బయోమెట్రిక్స్ →', 'पास व बायोमेट्रिक्स →')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-300 space-y-1.5">
                  <p className="text-[11px]">
                    {t(
                      'Log in with your Mobile number + OTP to select your Assigned Ghat, book your Swayam Dip Slot, and activate Biometric turnstile entry.',
                      'మీ మొబైల్ సంఖ్య మరియు OTP తో లాగిన్ అయి ఘాట్ కేటాయింపు, స్వయం స్నాన సమయం ఎంచుకోండి.',
                      'अपने मोबाइल नंबर व OTP से लॉग इन कर घाट आवंटन एवं पवित्र स्नान समय चुनें।'
                    )}
                  </p>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 font-black py-2 rounded-xl text-xs shadow transition cursor-pointer"
                  >
                    {t('Login with Phone & OTP', 'మొబైల్ & OTP తో లాగిన్', 'फोन व OTP से लॉग इन')}
                  </button>
                </div>
              )}
            </div>

            {/* Live Stream Section for User's Assigned Ghat */}
            <GhatLiveStreamSection
              assignedGhat={appProfile.assignedGhat}
              language={language}
              onNavigateToGhat={(_ghatName) => setActiveTab('wayfinder')}
              onSwitchAssignedGhat={(newGhat) => saveAppProfile({ ...appProfile, assignedGhat: newGhat })}
            />

            {/* Plan Your Pilgrimage Quick Action Bar (Matches Kumbh Mela App Image 2) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('Plan Your Pilgrimage', 'తీర్థయాత్ర ప్రణాళిక', 'अपनी तीर्थयात्रा की योजना बनाएं')}</span>
                </h2>
                <span className="text-[10px] text-amber-700 font-bold bg-amber-100/80 px-2 py-0.5 rounded-full">
                  {t('Official Guide', 'అధికారిక గైడ్', 'आधिकारिक गाइड')}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setActiveTab('explore')}
                  className="bg-white p-2.5 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col items-center text-center gap-1.5 hover:border-amber-400 hover:shadow-md transition active:scale-95 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-base shadow-sm">
                    <img src="/assets/icons/train-front.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-800 leading-tight">
                    {t('How to Reach', 'చేరుకోవడం ఎలా', 'कैसे पहुंचें')}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('explore')}
                  className="bg-white p-2.5 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col items-center text-center gap-1.5 hover:border-amber-400 hover:shadow-md transition active:scale-95 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-base shadow-sm">
                    <img src="/assets/icons/hotel.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-800 leading-tight">
                    {t('Where to Stay', 'వసతి ఎక్కడ', 'कहाँ ठहरें')}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('map')}
                  className="bg-white p-2.5 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col items-center text-center gap-1.5 hover:border-amber-400 hover:shadow-md transition active:scale-95 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-base shadow-sm">
                    <img src="/assets/icons/waves.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-800 leading-tight">
                    {t('Ghat Routes', 'ఘాట్ మార్గాలు', 'घाट मार्ग')}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('transport')}
                  className="bg-white p-2.5 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col items-center text-center gap-1.5 hover:border-amber-400 hover:shadow-md transition active:scale-95 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-base shadow-sm">
                    <img src="/assets/icons/parking-circle.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-800 leading-tight">
                    {t('Parking Hubs', 'పార్కింగ్ హబ్‌లు', 'पार्किंग हब')}
                  </span>
                </button>
              </div>
            </div>

            {/* Nearby Public Amenities Mini-Map with Current Location & Toggle */}
            <NearbyAmenitiesMiniMap
              currentLocation={currentPilgrimLoc}
              facilities={facilities}
              language={language}
              isOpen={isMiniMapOpen}
              onToggle={() => setIsMiniMapOpen(prev => !prev)}
              onNavigateToFacility={(_fac) => setActiveTab('wayfinder')}
              onViewFacilityQr={(fac) => handleViewFacilityQr(fac)}
              onRefreshLocation={handleRefreshGpsLocation}
            />
            {/* Urgent Alert Banner with TTS Voice Audio Readout */}
            {publicAlerts.length > 0 && (
              <div className="bg-amber-50 border-l-4 border-amber-600 p-3 rounded-r-xl shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide block">
                        {t('Official Pushkaralu Alert', 'అధికారిక పుష్కర హెచ్చరిక', 'आधिकारिक घोषणा')}
                      </span>
                      <p className="text-xs font-semibold text-gray-800">
                        {language === 'te' ? publicAlerts[0].titleTe : language === 'hi' ? publicAlerts[0].titleHi : publicAlerts[0].titleEn}
                      </p>
                      <p className="text-[11px] text-gray-600 mt-1">
                        {language === 'te' ? publicAlerts[0].messageTe : language === 'hi' ? publicAlerts[0].messageHi : publicAlerts[0].messageEn}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const msg = language === 'te' 
                        ? `${publicAlerts[0].titleTe}. ${publicAlerts[0].messageTe}` 
                        : language === 'hi'
                        ? `${publicAlerts[0].titleHi}. ${publicAlerts[0].messageHi}`
                        : `${publicAlerts[0].titleEn}. ${publicAlerts[0].messageEn}`;
                      handleToggleSpeech(publicAlerts[0].id, msg);
                    }}
                    title="Read announcement aloud in selected language"
                    className={`p-2 rounded-lg border transition shrink-0 cursor-pointer ${
                      playingAlertId === publicAlerts[0].id 
                        ? 'bg-amber-600 text-white border-amber-700 animate-pulse' 
                        : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                    }`}
                  >
                    {playingAlertId === publicAlerts[0].id ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Real-Time Official Environmental Telemetry: IMD Weather & CWC Dowleswaram Hydrology */}
            {(() => {
              const imd = integrationHub.getImdWeather();
              const cwc = integrationHub.getCwcRiver();
              return (
                <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                        <CloudRain className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block">
                          {t('Official IMD & CWC Telemetry', 'అధికారిక వాతావరణం & గోదావరి ప్రవాహం', 'आधिकारिक मौसम एवं नदी बहाव')}
                        </span>
                        <h3 className="text-xs font-extrabold text-gray-900">
                          {t('Rajahmundry District Nowcast', 'రాజమండ్రి జిల్లా లైవ్ నౌకాస్ట్', 'राजमहेंद्री लाइव मौसम')}
                        </h3>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                      {cwc.bathingSafetyStatus === 'SAFE_WITHIN_BUOY' ? t('Safe Bathing', 'స్నానం సురక్షితం', 'स्नान सुरक्षित') : t('Caution', 'జాగ్రత్త', 'सावधानी')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-[#F8FAF9] p-2.5 rounded-xl border border-gray-100 text-center">
                    <div>
                      <span className="text-[10px] text-gray-500 block">{t('Heat Index', 'వేడి సూచిక', 'गर्मी सूचकांक')}</span>
                      <span className="text-xs font-black text-amber-700">{imd.heatIndexC}°C</span>
                      <span className="text-[9px] text-gray-400 block">{imd.temperatureC}°C ambient</span>
                    </div>
                    <div className="border-x border-gray-200">
                      <span className="text-[10px] text-gray-500 block">{t('Barrage Discharge', 'బ్యారేజీ విడుదల', 'बैराज डिस्चार्ज')}</span>
                      <span className="text-xs font-black text-cyan-800">1.42 L Cusecs</span>
                      <span className="text-[9px] text-gray-400 block">{cwc.barrageGatesOpen} {t('gates open', 'గేట్లు తెరిచారు', 'गेट खुले')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">{t('River Current', 'ప్రవాహ వేగం', 'बहाव गति')}</span>
                      <span className="text-xs font-black text-emerald-700">{cwc.flowVelocityMps} m/s</span>
                      <span className="text-[9px] text-gray-400 block">{t('Within Buoy Line', 'సేఫ్టీ గ్రిడ్ లోపల', 'सुरक्षा घेरे में')}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-600 bg-amber-50/80 p-2 rounded-lg border border-amber-200/60 leading-relaxed flex items-start gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      {language === 'te' 
                        ? 'భక్తులకు సూచన: ఎండ తీవ్రత దృష్ట్యా ఉచిత ఆర్వో తాగునీరు సేవించండి. స్నానాలకు కేటాయించిన భద్రతా బోయ్స్ లైన్ లోపలే ఉండండి.'
                        : language === 'hi'
                        ? 'तीर्थयात्रियों के लिए सलाह: धूप से बचाव हेतु पर्याप्त ओआरएस/जल लें। केवल चिह्नित सुरक्षा रस्सियों के भीतर ही स्नान करें।'
                        : 'Advisory: Hydrate regularly at free RO booths. Strict bathing within safety buoy nets under SDRF boat vigil.'
                      }
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Real-Time Weather Forecast & Trends Widget (Current Location & Hourly Trends) */}
            <PilgrimWeatherForecastWidget 
              language={language} 
              currentPilgrimLoc={currentPilgrimLoc} 
            />

            {/* Sarvam & Bhashini Multilingual Voice Pilgrim Assistant Card */}
            <div className="bg-gradient-to-r from-[#072420] to-[#0A3A40] rounded-2xl p-4 text-white shadow-sm border border-[#165047] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                    <Mic className={`w-4 h-4 ${isProcessingVoice ? 'animate-bounce text-amber-300' : ''}`} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      Sarvam & Bhashini AI Voice
                    </span>
                    <h3 className="text-sm font-extrabold text-white">
                      {t('Multilingual Voice Pilgrim Help', 'వాయిస్ సహాయకుడు (తెలుగు/హిందీ)', 'आवाज सहायक')}
                    </h3>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                  {language.toUpperCase()} Voice
                </span>
              </div>

              <p className="text-xs text-gray-300">
                {t(
                  'Tap any query below to hear immediate verified spoken guidance:',
                  'సత్వర వాయిస్ మార్గదర్శనం కోసం కింది ప్రశ్నపై క్లిక్ చేయండి:',
                  'त्वरित आवाज सहायता हेतु नीचे दिए गए किसी भी प्रश्न पर टैप करें:'
                )}
              </p>

              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  onClick={() => handleSimulateVoiceQuery(
                    language === 'te' ? 'కోటిలింగాల ఘాట్ రద్దీ ఎలా ఉంది?' : language === 'hi' ? 'कोटिलींगला घाट पर भीड़ की स्थिति क्या है?' : 'How crowded is Kotilingala Ghat right now?'
                  )}
                  className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-emerald-200 border border-white/10 transition cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{language === 'te' ? ' ఘాట్ రద్దీ & వెయిటింగ్ టైమ్' : language === 'hi' ? ' घाट पर भीड़ की स्थिति' : ' Ghat Crowds & Wait Time'}</span>
                </button>

                <button
                  onClick={() => handleSimulateVoiceQuery(
                    language === 'te' ? 'సమీపంలోని తాగునీరు మరియు అన్నదానం ఎక్కడ ఉంది?' : language === 'hi' ? 'निकटतम पेयजल और भोजन कहां है?' : 'Where is the nearest drinking water and food?'
                  )}
                  className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-emerald-200 border border-white/10 transition cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{language === 'te' ? ' తాగునీరు & ఉచిత అన్నదానం' : language === 'hi' ? ' पेयजल एवं निःशुल्क भोजन' : ' Drinking Water & Annadanam'}</span>
                </button>

                <button
                  onClick={() => handleSimulateVoiceQuery(
                    language === 'te' ? 'పవిత్ర స్నాన ముహూర్త సమయాలు ఏమిటి?' : language === 'hi' ? 'पवित्र स्नान का मुहूर्त क्या है?' : 'What are the sacred muhurtham timings for holy dip?'
                  )}
                  className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-emerald-200 border border-white/10 transition cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{language === 'te' ? ' పుణ్యస్నాన ముహూర్తం సమయం' : language === 'hi' ? ' स्नान मुहूर्त का समय' : ' Sacred Dip Muhurtham Timings'}</span>
                </button>
              </div>

              {/* Voice Result Box */}
              {voiceResult && (
                <div className="bg-[#051714] border border-amber-500/40 rounded-xl p-3 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 border-b border-gray-800 pb-1">
                    <span className="text-amber-300 font-semibold truncate">Q: "{spokenPrompt}"</span>
                    <span className="text-emerald-400 font-mono">{(voiceResult.confidence * 100).toFixed(0)}% Match</span>
                  </div>
                  <p className="text-xs text-white leading-relaxed font-medium">
                    {voiceResult.responseText}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => playSpeechAlert(voiceResult.responseText, voiceResult.language)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{t('Replay Voice', 'మళ్ళీ వినండి', 'पुनः सुनें')}</span>
                    </button>
                    {voiceResult.suggestedAction && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                        {voiceResult.suggestedAction}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Giant Emergency SOS Banner (Workflow A - Section 3) */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-4 text-white shadow-lg text-center relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
              <span className="text-red-200 text-xs font-semibold tracking-wider uppercase block mb-1">
                {t('Emergency Safety Assistance', 'అత్యవసర రక్షణ సహాయం', 'आपातकालीन सहायता')}
              </span>
              <h2 className="text-xl font-black mb-1">
                {t('Need Police or Medical Help?', 'పోలీస్ లేదా వైద్య సహాయం కావాలా?', 'पुलिस या चिकित्सा सहायता चाहिए?')}
              </h2>
              <p className="text-xs text-red-100 mb-3 max-w-xs mx-auto">
                {t(
                  'Instantly transmit GPS position to 24/7 Rajahmundry Pushkaralu Command & Rapid Responders.',
                  'మీ జీపీఎస్ లొకేషన్‌ను కంట్రోల్ రూమ్‌కు పంపి తక్షణ సహాయం పొందండి.',
                  'तत्काल जीपीएस स्थिति कमांड सेंटर और राहत दल को भेजें।'
                )}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTab('sos')}
                  className="py-3 bg-white text-red-700 hover:bg-red-50 font-black rounded-xl text-sm shadow-md transition transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <HeartPulse className="w-4 h-4 text-red-600 animate-pulse" />
                  <span>{t('TRIGGER SOS', 'అత్యవసర SOS', 'आपातकालीन SOS')}</span>
                </button>
                <button
                  onClick={() => setShowSirenModal(true)}
                  className="py-3 bg-red-800/80 hover:bg-red-900 text-white font-bold rounded-xl text-sm border border-red-400/40 shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Siren className="w-4 h-4 text-amber-300 animate-bounce" />
                  <span>{t('SIREN & WHISTLE', 'సైరన్ & ఈల', 'सायरन एवं सीटी')}</span>
                </button>
              </div>
            </div>

            {/* Quick Action Buttons Grid (6 high-utility cards) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('snanam')}
                className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-left hover:border-amber-500 transition flex flex-col justify-between cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{t('Holy Dip & Wait Times', 'పుణ్యస్నాన సమయాలు', 'स्नान मुहूर्त एवं कतार')}</h3>
                  <p className="text-[11px] text-gray-500">{t('Muhurtham & ghat queues', 'ముహూర్తాలు & లైవ్ క్యూలు', 'शुभ मुहूर्त व कतार स्थिति')}</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('camp_pin')}
                className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-left hover:border-emerald-600 transition flex flex-col justify-between cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                  <Tent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{t('Find My Camp Pin', 'నా గుడారం లొకేషన్', 'मेरा कैंप पिन')}</h3>
                  <p className="text-[11px] text-gray-500">{savedCampPin ? `${t('Saved: ', 'భద్రపరిచింది: ', 'सहेजा: ')}${savedCampPin.name}` : t('Compass return tracker', 'దిక్సూచి మార్గదర్శి', 'दिशा सूचक')}</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('map')}
                className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-left hover:border-emerald-600 transition flex flex-col justify-between cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center mb-2">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{t('Find Facilities', 'సౌకర్యాల గుర్తింపు', 'सुविधाएं खोजें')}</h3>
                  <p className="text-[11px] text-gray-500">{t('Toilets, RO Water, 108 Posts', 'టాయిలెట్లు, త్రాగునీరు, 108', 'शौचालय, जल, चिकित्सा')}</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('lost_found')}
                className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-left hover:border-amber-600 transition flex flex-col justify-between cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{t('Lost & Found', 'లాస్ట్ & ఫౌండ్', 'खोया-पाया')}</h3>
                  <p className="text-[11px] text-gray-500">{t('Report separated family', 'తప్పిపోయిన వారి వివరాలు', 'बिछड़े परिजनों की रिपोर्ट')}</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('transport')}
                className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-left hover:border-blue-600 transition flex flex-col justify-between cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-2">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{t('Parking & Shuttles', 'పార్కింగ్ & షటిల్స్', 'पार्किंग एवं बसें')}</h3>
                  <p className="text-[11px] text-gray-500">{t('Live parking space meter', 'లైవ్ పార్కింగ్ ఖాళీలు', 'पार्किंग उपलब्धता')}</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('assistant')}
                className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-left hover:border-purple-600 transition flex flex-col justify-between cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center mb-2">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{t('Verified AI Guide', 'ధృవీకరించిన గైడ్', 'सत्यापित मार्गदर्शक')}</h3>
                  <p className="text-[11px] text-gray-500">{t('Rituals, FAQ & rules', 'నియమాలు & సమాధానాలు', 'नियम व अक्सर पूछे जाने वाले प्रश्न')}</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('family')}
                className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-left hover:border-emerald-500 transition flex flex-col justify-between cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{t('Family Safety Radar', 'కుటుంబ భద్రతా రాడార్', 'परिवार सुरक्षा रडार')}</h3>
                  <p className="text-[11px] text-gray-500">{t('Proximity alert & safe circle', 'దూరం హెచ్చరిక & సేఫ్ సర్కిల్', 'दूरी चेतावनी व सुरक्षा घेरा')}</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('planner')}
                className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-left hover:border-amber-500 transition flex flex-col justify-between cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{t('Holy Dip Pass & Plan', 'పుణ్యస్నాన పాస్ & ప్లానర్', 'स्नान पास एवं योजना')}</h3>
                  <p className="text-[11px] text-gray-500">{t('Custom pass & ramp routing', 'డిజిటల్ పాస్ & ర్యాంప్ దారి', 'डिजिटल पास व रैंप मार्ग')}</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('wayfinder')}
                className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-left hover:border-emerald-600 transition flex flex-col justify-between cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                  <Footprints className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{t('Safe Walking Wayfinder', 'సేఫ్ వాకింగ్ గైడ్', 'सुरक्षित पैदल मार्गदर्शक')}</h3>
                  <p className="text-[11px] text-gray-500">{t('Turn-by-turn & voice cues', 'మలుపుల వారీగా వాయిస్ గైడ్', 'दिशा-निर्देश व आवाज')}</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('token')}
                className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-left hover:border-amber-600 transition flex flex-col justify-between cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                  <Ticket className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{t('E-QMS Bathing Token', 'స్నాన క్యూ టోకెన్ (ఈ-క్యూ)', 'स्नान कतार टोकन')}</h3>
                  <p className="text-[11px] text-gray-500">{t('Live queue & token call', 'లైవ్ టోకెన్ కాల్ స్టేటస్', 'लाइव टोकन नंबर')}</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('water_quality')}
                className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-left hover:border-cyan-600 transition flex flex-col justify-between cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center mb-2">
                  <Waves className="w-5 h-5 text-cyan-700" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{t('River Water Purity', 'నది నీటి నాణ్యత', 'जल शुद्धता व सुरक्षा')}</h3>
                  <p className="text-[11px] text-gray-500">{t('Live IoT pH & safety index', 'లైవ్ పీహెచ్ & స్వచ్ఛత', 'लाइव पीएच एवं तापमान')}</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('annadanam')}
                className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-left hover:border-orange-500 transition flex flex-col justify-between cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-800 flex items-center justify-center mb-2">
                  <Utensils className="w-5 h-5 text-orange-700" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{t('Free Annaprasadam', 'ఉచిత అన్నప్రసాదం', 'मुफ्त महाप्रसाद')}</h3>
                  <p className="text-[11px] text-gray-500">{t('TTD, ISKCON meals & RO water', 'నిత్యాన్నదానం & ఆర్వో నీరు', 'भोजन एवं शीतल जल')}</p>
                </div>
              </button>
            </div>

            {/* Real-time Dynamic Reroute Alert if Congestion Loop is Active */}
            {safetyLoopStage && (safetyLoopStage === 'ALERT' || safetyLoopStage === 'RESPOND' || safetyLoopStage === 'GUIDE') && (
              <div className="bg-amber-500/15 border-2 border-amber-500 rounded-2xl p-4 shadow-lg flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-gray-950 flex items-center justify-center font-black shrink-0 animate-pulse">
                    !
                  </div>
                  <div>
                    <span className="text-[10px] bg-red-600 text-white font-extrabold uppercase px-2 py-0.2 rounded">
                      LIVE REROUTE ADVISORY
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm mt-0.5">
                      {t('High Crowd at Saraswati Ghat • Diverting', 'సరస్వతి ఘాట్ వద్ద అధిక రద్దీ • దారి మళ్లింపు', 'सरस्वती घाट पर अत्यधिक भीड़ • डायवर्जन')}
                    </h4>
                    <p className="text-[11px] text-gray-700">
                      {t(
                        'Markandeya Ancient Ghat has minimal waiting (~5 mins). Follow shaded pedestrian safety path.',
                        'మార్కండేయ ఘాట్ వద్ద రద్దీ లేదు (~5 నిముషాల వేచి ఉండే సమయం). గ్రీన్ పాత్‌ను అనుసరించండి.',
                        'मार्कंडेय प्राचीन घाट पर कतार नहीं है। छायादार सुरक्षित मार्ग पर चलें।'
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('wayfinder')}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black rounded-xl text-xs shrink-0 shadow transition cursor-pointer"
                >
                  {t('Wayfinder →', 'మార్గదర్శి →', 'रास्ता →')}
                </button>
              </div>
            )}

            {/* Ghats Live Crowd Status Carousel */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-bold text-sm text-gray-900">{t('Ghat Crowd & Density', 'ఘాట్ల రద్దీ పరిస్థితి', 'घाटों पर भीड़ की स्थिति')}</h3>
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  {t('Live Sensor Feeds', 'లైవ్ సెన్సార్ సమాచారం', 'लाइव अपडेट')}
                </span>
              </div>

              <div className="space-y-2.5">
                {zones.filter(z => z.type === 'ghat').map(zone => {
                  const percent = Math.min(100, Math.round((zone.currentCount / zone.capacity) * 100));
                  return (
                    <div key={zone.id} className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/70">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-bold text-gray-900">
                          {language === 'te' ? zone.teluguName : zone.name}
                        </span>
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                          zone.status === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                          zone.status === 'WARNING' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {zone.density} /m² ({zone.status})
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            percent > 85 ? 'bg-red-600' : percent > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                        <span>{t('Occupancy', 'సామర్థ్యం', 'उपस्थिति')}: {zone.currentCount.toLocaleString()} / {zone.capacity.toLocaleString()}</span>
                        <span>{t('Water Depth', 'నీటి లోతు', 'जल स्तर')}: {zone.waterDepthMeters || 1.8}m</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Emergency Helpline Strip */}
            <div className="bg-[#0E3B33] text-white p-3.5 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="font-bold block">{t('Pushkaralu Toll-Free Control Room', 'పుష్కర కంట్రోల్ రూమ్', 'कंट्रोल रूम')}</span>
                  <span className="text-gray-300 text-[11px]">0883-2224444 • 112 • 108</span>
                </div>
              </div>
              <a
                href="tel:112"
                className="bg-amber-500 text-gray-950 font-extrabold px-3 py-1.5 rounded-lg text-xs hover:bg-amber-400"
              >
                {t('Call 112', 'కాల్ చేయండి', 'कॉल 112')}
              </a>
            </div>
          </div>
        )}

        {/* 2. INTERACTIVE MAP VIEW */}
        {activeTab === 'map' && (
          <div className="space-y-3">
            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'ALL', label: t('All', 'అన్నీ', 'सभी') },
                { id: 'FIRST_AID', label: t(' Medical / 108', 'వైద్యం', 'चिकित्सा') },
                { id: 'TOILET', label: t(' Bio-Toilets', 'టాయిలెట్లు', 'शौचालय') },
                { id: 'WATER_POINT', label: t(' RO Water', 'త్రాగునీరు', 'पेयजल') },
                { id: 'SHUTTLE_STOP', label: t(' Shuttles', 'షటిల్స్', 'बसें') },
                { id: 'PARKING', label: t(' Parking', 'పార్కింగ్', 'पार्किंग') },
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFacilityFilter(filter.id)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition ${
                    selectedFacilityFilter === filter.id
                      ? 'bg-[#0A3A40] text-white'
                      : 'bg-white text-gray-700 border border-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* GIS Map */}
            <GisMap
              zones={zones}
              facilities={filteredFacilities}
              incidents={incidents}
              height="380px"
              interactive={true}
            />

            {/* Facility list cards */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                {t('Verified Facilities Nearby', 'సమీపంలోని సదుపాయాలు', 'निकटतम सुविधाएं')} ({filteredFacilities.length})
              </h4>
              {filteredFacilities.map(fac => (
                <div key={fac.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-bold text-gray-900 text-sm">
                        {language === 'te' ? fac.teluguName : fac.name}
                      </h5>
                      <span className="text-[11px] text-gray-500 block">Type: {fac.type.replace('_', ' ')}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      fac.status === 'OPERATIONAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {fac.status}
                    </span>
                  </div>
                  {fac.accessibilityNotes && (
                    <p className="text-[11px] text-gray-600 mt-1.5 bg-gray-50 p-1.5 rounded">
                      <img src="/assets/icons/accessibility.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> {fac.accessibilityNotes}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                    <span className="text-[10px]">{t('Last Checked', 'చివరి తనిఖీ', 'अंतिम जांच')}: {fac.lastInspected}</span>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        onClick={() => handleViewFacilityQr(fac)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0A3A40] text-white hover:bg-[#0D4848] font-bold text-[11px] shadow-sm transition active:scale-95 cursor-pointer"
                        title="View Facility QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>{t('View Facility QR', 'సదుపాయం QR చూడండి', 'सुविधा QR देखें')}</span>
                      </button>
                      <button className="text-emerald-700 font-bold hover:underline px-1 py-1">
                        {t('Directions &rarr;', 'దారి చూపించు &rarr;', 'दिशा-निर्देश &rarr;')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Facility QR Code Modal / Sheet */}
            {selectedQrFacility && (
              <div 
                className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
                role="dialog"
                aria-modal="true"
                aria-labelledby="facility-qr-modal-title"
              >
                <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-emerald-900/20 text-gray-900">
                  {/* Modal Header */}
                  <div className="bg-[#0A3A40] text-white p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-amber-400 text-gray-950 rounded-lg flex items-center justify-center font-black text-xs">
                        QR
                      </div>
                      <div>
                        <h4 id="facility-qr-modal-title" className="font-extrabold text-sm tracking-tight">
                          {t('Official Facility QR Code', 'అధికారిక సదుపాయం QR కోడ్', 'आधिकारिक सुविधा QR कोड')}
                        </h4>
                        <span className="text-[10px] text-emerald-200 block font-mono">
                          {selectedQrFacility.id} • Godavari One Verified
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedQrFacility(null)}
                      className="p-1 rounded-lg hover:bg-white/10 text-gray-200 transition cursor-pointer"
                      aria-label="Close Facility QR Modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-4 space-y-3.5 text-center">
                    <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl text-left">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-black text-sm text-gray-900">
                            {language === 'te' ? selectedQrFacility.teluguName : selectedQrFacility.name}
                          </h5>
                          <span className="text-[11px] text-emerald-800 font-semibold block">
                            Category: {selectedQrFacility.type.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                          {selectedQrFacility.status}
                        </span>
                      </div>
                      <div className="mt-1.5 text-[10px] text-gray-600 flex justify-between font-mono">
                        <span>GPS: {selectedQrFacility.location.lat.toFixed(4)}, {selectedQrFacility.location.lng.toFixed(4)}</span>
                        <span>Zone: {selectedQrFacility.zoneId}</span>
                      </div>
                    </div>

                    {/* QR Code Container */}
                    <div className="relative p-3 bg-white border-2 border-dashed border-emerald-700/40 rounded-2xl inline-block shadow-inner">
                      {qrLoading ? (
                        <div className="w-56 h-56 flex flex-col items-center justify-center text-xs text-gray-400">
                          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                          <span>Generating Encrypted QR...</span>
                        </div>
                      ) : qrCodeDataUrl ? (
                        <div className="space-y-1">
                          <img
                            src={qrCodeDataUrl}
                            alt={`QR Code for ${selectedQrFacility.name}`}
                            className="w-56 h-56 mx-auto rounded-lg"
                          />
                          <span className="text-[10px] text-gray-400 block font-mono">
                            Scan with Godavari One Field Ops App or Camera
                          </span>
                        </div>
                      ) : (
                        <div className="w-56 h-56 flex items-center justify-center text-xs text-red-500">
                          Unable to render QR
                        </div>
                      )}
                    </div>

                    {/* Verification Key & Security Note */}
                    <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-left text-xs space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-gray-500">
                        <span className="font-semibold uppercase tracking-wider">Verification Key:</span>
                        <button
                          onClick={handleCopyVerificationKey}
                          className="text-emerald-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          {copiedKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-gray-800 block bg-white px-2 py-1 rounded border border-gray-200 truncate">
                        G1-VERIFY-{selectedQrFacility.id}-{selectedQrFacility.type}
                      </span>
                      <p className="text-[10px] text-gray-500 leading-tight">
                        {t(
                          'Show this QR code to police officers, municipal sanitation staff, or volunteers to log inspection, report issues, or get direct emergency assistance.',
                          'సమస్యల నివేదన లేదా తనిఖీల కొరకు ఈ QR కోడ్‌ను అధికారులకు లేదా వాలంటీర్లకు చూపించండి.',
                          'निरीक्षण या सहायता हेतु यह QR कोड अधिकारियों या स्वयंसेवकों को दिखाएं।'
                        )}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleDownloadQr}
                        className="flex-1 py-2.5 bg-[#0A3A40] hover:bg-[#0D4848] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>{t('Download QR Image', 'QR సేవ్ చేయండి', 'QR डाउनलोड करें')}</span>
                      </button>
                      <button
                        onClick={() => setSelectedQrFacility(null)}
                        className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-xs transition cursor-pointer"
                      >
                        {t('Close', 'మూసివేయి', 'बंद करें')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2B. SACRED HOLY DIP (SNANAM) & REAL-TIME GHAT QUEUE ESTIMATOR */}
        {activeTab === 'snanam' && (
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="bg-gradient-to-r from-[#0A3A40] to-[#125852] text-white p-4 rounded-2xl shadow-md space-y-1.5">
              <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] block flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5" />
                {t('Vedic Muhurtham & Queue Intelligence', 'వేద ముహూర్తాలు & లైవ్ క్యూ సమయాలు', 'वैदिक मुहूर्त एवं कतार समय')}
              </span>
              <h3 className="text-base font-black">
                {t('Holy Dip (Snanam) Planning Guide', 'పుష్కర పుణ్యస్నాన సమయాలు', 'पुष्करालु पवित्र स्नान योजना')}
              </h3>
              <p className="text-[11px] text-emerald-100">
                {t(
                  'Automated telemetry monitors river depth, flow velocity, and queue duration across all 4 major Rajahmundry ghats.',
                  'నదీ ప్రవాహం, లోతు మరియు ఘాట్ వద్ద వేచి ఉండే సమయాన్ని ప్రత్యక్షంగా వీక్షించండి.',
                  'नदी के प्रवाह एवं सभी घाटों पर प्रतीक्षा समय की वास्तविक स्थिति।'
                )}
              </p>
            </div>

            {/* Smart Ghat Recommendation Badge */}
            {(() => {
              const bestGhat = getBestGhatRecommendation(zones);
              if (!bestGhat) return null;
              return (
                <div className="bg-emerald-50 border-2 border-emerald-500/80 p-3.5 rounded-xl shadow-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-900 font-extrabold text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      {t('RECOMMENDED FASTEST GHAT RIGHT NOW', 'ప్రస్తుతం రద్దీ తక్కువగా ఉన్న ఉత్తమ ఘాట్', 'वर्तमान में न्यूनतम कतार वाला अनुशंसित घाट')}
                    </span>
                    <span className="bg-emerald-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {bestGhat.estimatedWaitMinutes} min wait
                    </span>
                  </div>
                  <h4 className="font-bold text-emerald-950 text-sm">
                    {language === 'te' ? bestGhat.teluguName : bestGhat.zoneName}
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    {t(
                      `Estimated wait: ~${bestGhat.estimatedWaitMinutes} mins • ${bestGhat.bathingRampsOpen} active bathing ramps open • Flow speed 1.2 m/s.`,
                      `సుమారు వేచి ఉండే సమయం: ~${bestGhat.estimatedWaitMinutes} నిమిషాలు • ${bestGhat.bathingRampsOpen} స్నాన ఘాట్ ర్యాంపులు అందుబాటులో ఉన్నాయి.`,
                      `अनुमानित प्रतीक्षा: ~${bestGhat.estimatedWaitMinutes} मिनट • ${bestGhat.bathingRampsOpen} स्नान रैंप खुले हैं।`
                    )}
                  </p>
                </div>
              );
            })()}

            {/* Real-time Ghat Queue Duration Comparison */}
            <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-700" />
                  <span>{t('Live Ghat Wait-Time Estimator', 'ఘాట్ వారీగా వేచి ఉండే సమయం', 'घाटवार प्रतीक्षा समय')}</span>
                </h4>
                <span className="text-[10px] text-gray-500 font-medium">{t('Auto-updated via density sensors', 'సెన్సార్ ఆధారిత లైవ్ డేటా', 'सेंसर आधारित')}</span>
              </div>

              <div className="space-y-3">
                {zones.filter(z => z.type === 'ghat').map(ghat => {
                  const status = calculateGhatWaitTime(ghat);
                  const isCrit = status.crowdLevel === 'CRITICAL_HOLD';
                  const isBusy = status.crowdLevel === 'BUSY';

                  return (
                    <div key={ghat.id} className="p-2.5 rounded-xl border bg-gray-50 space-y-1.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-bold text-gray-900 text-xs">
                            {language === 'te' ? ghat.teluguName : ghat.name}
                          </h5>
                          <span className="text-[10px] text-gray-500 font-medium">
                            {status.recommendationTag}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-black font-mono ${
                            isCrit ? 'bg-red-100 text-red-700 border border-red-300 animate-pulse' :
                            isBusy ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}>
                            ~{status.estimatedWaitMinutes} min
                          </span>
                          <span className="block text-[9px] text-gray-400 mt-0.5">
                            {ghat.currentCount.toLocaleString()} pilgrims
                          </span>
                        </div>
                      </div>

                      {/* Progress meter */}
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isCrit ? 'bg-red-500' : isBusy ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, (status.estimatedWaitMinutes / 50) * 100)}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-gray-600">
                        <span>{status.bathingRampsOpen} Bathing Ramps Open</span>
                        <span>Density: {ghat.density} /m²</span>
                        <span>River Depth: {ghat.waterDepthMeters || 2.0}m</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sacred Pushkaralu Muhurthams Schedule */}
            <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-600" />
                <span>{t("Today's Sacred Snanam Muhurtham Windows", 'ఈనాటి పుణ్యస్నాన ముహూర్తాలు', 'आज के शुभ स्नान मुहूर्त')}</span>
              </h4>

              <div className="space-y-2.5">
                {SACRED_MUHURTHAMS.map((m: SnanamMuhurtham) => (
                  <div key={m.id} className="border border-amber-200/80 bg-amber-50/40 p-3 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-xs text-amber-950">
                        {language === 'te' ? m.nameTe : language === 'hi' ? m.nameHi : m.nameEn}
                      </span>
                      <span className="bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                        {m.timeWindow}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-700 leading-relaxed">
                      {language === 'te' ? m.significanceTe : language === 'hi' ? m.significanceHi : m.significanceEn}
                    </p>
                    <div className="pt-1 text-[10px] text-emerald-800 font-medium">
                      <span>{t('Recommended Ghats: ', 'సిఫార్సు చేసిన ఘాట్లు: ', 'अनुशंसित घाट: ')}</span>
                      <b>{m.recommendedGhats.join(' • ')}</b>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2C. FIND MY CAMP / PARKED VEHICLE PIN (OFFLINE COMPASS) */}
        {activeTab === 'camp_pin' && (
          <div className="space-y-4 text-xs">
            <div className="bg-gradient-to-r from-[#0C3B2E] to-[#1D5E4A] text-white p-4 rounded-2xl shadow-md space-y-1.5">
              <span className="text-amber-300 font-bold uppercase tracking-wider text-[10px] block flex items-center gap-1.5">
                <Tent className="w-3.5 h-3.5" />
                {t('Pilgrim Family Wayfinder • ఆఫ్‌లైన్ దిక్సూచి', 'ఆఫ్‌లైన్ మార్గదర్శి', 'ऑफ़लाइन कैंप नेविगेटर')}
              </span>
              <h3 className="text-base font-black">
                {t('Find My Camp & Vehicle Pin', 'నా గుడారం & వాహనం పిన్', 'मेरा कैंप एवं वाहन ट्रैकर')}
              </h3>
              <p className="text-[11px] text-emerald-100">
                {t(
                  'Bookmarked entirely offline in your phone storage. Calculates real-time distance and cardinal heading needle back to your family tent or vehicle.',
                  'మీ కుటుంబ గుడారం లేదా పార్కింగ్ చేసిన వాహనం స్థానాన్ని భద్రపరచి, తిరిగి చేరుకునేందుకు మార్గదర్శకత్వం పొందండి.',
                  'भीड़ में बिछड़ने से बचें। अपने कैंप या वाहन का स्थान सहेजें और कंपास द्वारा दिशा पाएं।'
                )}
              </p>
            </div>

            {/* If Pin is Saved */}
            {savedCampPin ? (
              <div className="bg-white p-4 rounded-2xl border border-emerald-300 shadow-sm space-y-4 text-center">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-left flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      {t('ACTIVE BOOKMARK PIN', 'భద్రపరచిన స్థానం', 'सक्रिय बुकमार्क')}
                    </span>
                    <h4 className="font-extrabold text-sm text-gray-900 mt-0.5">{savedCampPin.name}</h4>
                    <span className="text-[10px] text-gray-500 font-mono">
                      Pinned at {savedCampPin.savedAt} • ({savedCampPin.lat.toFixed(4)}, {savedCampPin.lng.toFixed(4)})
                    </span>
                  </div>
                  <button
                    onClick={handleClearCampPin}
                    className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded cursor-pointer"
                  >
                    {t('Remove', 'తొలగించు', 'हटाएं')}
                  </button>
                </div>

                {/* Live Distance and Compass Card */}
                {(() => {
                  const distMeters = calculateDistanceMeters(currentPilgrimLoc, savedCampPin);
                  const bearing = calculateBearingDegrees(currentPilgrimLoc, savedCampPin);

                  // Cardinal direction label
                  let cardinal = 'N';
                  if (bearing >= 23 && bearing < 68) cardinal = 'NE';
                  else if (bearing >= 68 && bearing < 113) cardinal = 'E';
                  else if (bearing >= 113 && bearing < 158) cardinal = 'SE';
                  else if (bearing >= 158 && bearing < 203) cardinal = 'S';
                  else if (bearing >= 203 && bearing < 248) cardinal = 'SW';
                  else if (bearing >= 248 && bearing < 293) cardinal = 'W';
                  else if (bearing >= 293 && bearing < 338) cardinal = 'NW';

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-around py-2">
                        <div>
                          <span className="text-gray-400 text-[10px] block font-bold uppercase">{t('Walking Distance', 'నడక దూరం', 'दूरी')}</span>
                          <span className="text-3xl font-black text-emerald-700 font-mono">
                            {distMeters >= 1000 ? `${(distMeters / 1000).toFixed(2)} km` : `${distMeters} m`}
                          </span>
                          <span className="text-[10px] text-gray-500 block">~{Math.round(distMeters / 75)} mins walk</span>
                        </div>
                        <div className="h-12 w-[1px] bg-gray-200"></div>
                        <div>
                          <span className="text-gray-400 text-[10px] block font-bold uppercase">{t('Compass Heading', 'దిశ', 'दिशा')}</span>
                          <span className="text-3xl font-black text-teal-800 font-mono">{bearing}°</span>
                          <span className="text-[10px] font-bold text-emerald-800 block">{cardinal} Direction</span>
                        </div>
                      </div>

                      {/* Rotating Compass Dial Graphic */}
                      <div className="relative w-36 h-36 mx-auto bg-gradient-to-b from-gray-100 to-gray-200 border-4 border-[#0A3A40] rounded-full flex items-center justify-center shadow-inner">
                        <span className="absolute top-1 font-bold text-[10px] text-red-600">N</span>
                        <span className="absolute bottom-1 font-bold text-[10px] text-gray-500">S</span>
                        <span className="absolute right-1 font-bold text-[10px] text-gray-500">E</span>
                        <span className="absolute left-1 font-bold text-[10px] text-gray-500">W</span>

                        {/* Compass Needle rotating towards bearing */}
                        <div
                          className="w-1.5 h-24 bg-gradient-to-t from-gray-400 via-gray-700 to-red-600 rounded-full transition-transform duration-700 shadow-md flex flex-col justify-between items-center"
                          style={{ transform: `rotate(${bearing}deg)` }}
                        >
                          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-red-600 -mt-1"></div>
                          <div className="w-2.5 h-2.5 bg-amber-400 rounded-full border border-gray-900"></div>
                          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[8px] border-t-gray-700 -mb-1"></div>
                        </div>
                      </div>

                      {/* Verified Road Network Graph Routing (Dijkstra Solver) */}
                      {(() => {
                        const route = calculatePedestrianShortestPath(
                          currentPilgrimLoc.lat,
                          currentPilgrimLoc.lng,
                          appProfile.assignedGhat || 'node_pushkar'
                        );
                        return (
                          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-left space-y-2">
                            <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                              <span className="font-extrabold text-gray-800 text-[11px] flex items-center gap-1">
                                <Navigation className="w-3.5 h-3.5 text-teal-700" />
                                <span>{t('Dijkstra Pedestrian Network Routing:', 'రోడ్ నెట్‌వర్క్ పాదచారుల రూట్:', 'सटीक पैदल मार्ग निर्देश:')}</span>
                              </span>
                              <span className="text-[9px] font-mono text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">
                                {route.totalDistanceMeters}m • ~{route.estimatedWalkingMinutes} min
                              </span>
                            </div>

                            <div className="space-y-1">
                              {route.steps.slice(0, 2).map((s, idx) => (
                                <div key={idx} className="text-[10px] text-gray-700 flex items-start gap-1.5">
                                  <span className="w-4 h-4 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-[8px] shrink-0 mt-0.5">
                                    {s.stepNumber}
                                  </span>
                                  <span className="leading-tight">{s.instruction}</span>
                                </div>
                              ))}
                            </div>

                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${savedCampPin.lat},${savedCampPin.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 w-full py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition"
                            >
                              <span><img src="/assets/icons/map-pin.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> Open Exact Destination in Google Maps</span>
                            </a>
                          </div>
                        );
                      })()}

                      {/* Interactive Simulation GPS Adjuster */}
                      <div className="pt-2 border-t border-gray-200 text-left space-y-1.5">
                        <span className="text-[10px] text-gray-500 font-bold uppercase block">
                          {t('Simulate Your Movement on Ghats:', 'మీ నడక లొకేషన్ మార్చండి:', 'स्थान बदलें:')}
                        </span>
                        <div className="grid grid-cols-3 gap-1 text-[10px]">
                          <button
                            onClick={() => setCurrentPilgrimLoc({ lat: 17.0018, lng: 81.7765 })}
                            className="p-1.5 bg-gray-100 hover:bg-emerald-100 rounded font-semibold text-gray-800 cursor-pointer"
                          >
                            At Ramp (120m)
                          </button>
                          <button
                            onClick={() => setCurrentPilgrimLoc({ lat: 17.0040, lng: 81.7780 })}
                            className="p-1.5 bg-gray-100 hover:bg-emerald-100 rounded font-semibold text-gray-800 cursor-pointer"
                          >
                            At Temple (380m)
                          </button>
                          <button
                            onClick={() => setCurrentPilgrimLoc({ lat: 17.0080, lng: 81.7810 })}
                            className="p-1.5 bg-gray-100 hover:bg-emerald-100 rounded font-semibold text-gray-800 cursor-pointer"
                          >
                            At Bus Hub (890m)
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* If No Pin Saved Yet */
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                <div className="text-center py-2 space-y-1">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                    <Tent className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-900 mt-2">
                    {t('Pin Your Camp / Vehicle Location', 'మీ గుడారం స్థానాన్ని భద్రపరచండి', 'अपने कैंप का स्थान सहेजें')}
                  </h4>
                  <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                    {t(
                      'Before entering the massive holy dip crowds, save your family tent, meeting counter or parked vehicle so you can easily walk back anytime.',
                      'నది వద్దకు వెళ్లే ముందు మీ కుటుంబ గుడారం లేదా బండి పార్కింగ్ స్థానాన్ని సేవ్ చేసుకోండి.',
                      'भीड़ में जाने से पहले अपने कैंप या वाहन का स्थान सेव करें।'
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-gray-700">
                    {t('Location Label / Description', 'స్థానం పేరు', 'स्थान का नाम')}
                  </label>
                  <input
                    type="text"
                    value={campLabelInput}
                    onChange={e => setCampLabelInput(e.target.value)}
                    placeholder="e.g. Kotilingala Family Tent #4 or Arts College Parking"
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs"
                  />
                  <div className="flex gap-1.5 flex-wrap text-[10px]">
                    {['Family Tent #4', 'Car at Arts College', 'Food Counter #2', 'Cloakroom Locker #18'].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setCampLabelInput(preset)}
                        className="px-2 py-1 bg-gray-100 hover:bg-emerald-100 rounded-md text-gray-700 cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleSaveCampPin()}
                  className="w-full py-3 bg-[#0A3A40] hover:bg-[#0D4848] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition"
                >
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>{t('BOOKMARK CURRENT SPOT AS CAMP PIN', 'ప్రస్తుత స్థానాన్ని భద్రపరచండి', 'वर्तमान स्थान बुकमार्क करें')}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. EMERGENCY SOS TRIGGER (Workflow A) */}
        {activeTab === 'sos' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-700 font-extrabold text-base mb-1">
                <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce" />
                <span>{t('Emergency SOS Trigger', 'అత్యవసర SOS రిపోర్ట్', 'आपातकालीन सहायता')}</span>
              </div>
              <p className="text-xs text-red-800">
                {t(
                  'Transmits immediate alert with high-precision GPS to Rajahmundry Pushkaralu Command, Sector Police & 108 Ambulance dispatch.',
                  'మీ జీపీఎస్ లొకేషన్ ఆధారంగా వెంటనే అంబులెన్స్ లేదా పోలీస్ బృందాలు ఘాట్ వద్దకు చేరుకుంటాయి.',
                  'जीपीएस द्वारा निकटतम पुलिस एवं एम्बुलेंस दल को तुरंत सूचित किया जाएगा।'
                )}
              </p>
            </div>

            {sosSubmittedCase ? (
              <div className="bg-white rounded-xl p-5 border border-emerald-300 shadow-sm text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-extrabold text-gray-900 text-base">
                  {sosSubmittedCase.isQueuedOffline 
                    ? t('Incident Saved to Offline Queue', 'ఆఫ్‌లైన్‌లో భద్రపరచబడింది', 'ऑफ़लाइन सहेजा गया')
                    : t('Incident Dispatched to Responders!', 'సహాయ బృందాలకు పంపబడింది!', 'राहत दल को भेजा गया!')
                  }
                </h4>
                <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-200 font-mono">
                  {sosSubmittedCase.message}
                </p>
                <div className="text-xs text-gray-500">
                  {t('Case Reference', 'కేసు నంబర్', 'केस संदर्भ')}: <b className="text-gray-900">{sosSubmittedCase.id}</b>
                </div>
                <button
                  onClick={() => setSosSubmittedCase(null)}
                  className="px-4 py-2 bg-[#0A3A40] text-white text-xs font-bold rounded-lg hover:bg-[#0D4848]"
                >
                  {t('Submit Another SOS or Update', 'మరొక రిపోర్ట్ చేయండి', 'नया अलर्ट दर्ज करें')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSosSubmit} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-3">
                {/* Emergency Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {t('Select Emergency Type', 'అత్యవసర రకం ఎంచుకోండి', 'आपातकाल का प्रकार')}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'MEDICAL', label: ' Medical / Heat Stroke' },
                      { id: 'CROWD_CRUSH_HAZARD', label: ' Crowd Buildup / Stall' },
                      { id: 'RIVER_RESCUE', label: ' River Danger / Drowning' },
                      { id: 'LOST_CHILD_PERSON', label: ' Lost Child / Elder' },
                      { id: 'POLICE_SECURITY', label: ' Security / Violence' },
                      { id: 'FIRE', label: ' Fire / Short Circuit' },
                    ].map(typeItem => (
                      <button
                        type="button"
                        key={typeItem.id}
                        onClick={() => setSosType(typeItem.id as IncidentType)}
                        className={`p-2.5 rounded-lg font-semibold text-left transition border ${
                          sosType === typeItem.id
                            ? 'bg-red-50 border-red-500 text-red-700 font-bold shadow-sm'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {typeItem.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Severity Level */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('Urgency Level', 'తీవ్రత', 'गंभीरता')}
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {(['MEDIUM', 'HIGH', 'CRITICAL'] as IncidentSeverity[]).map(sev => (
                      <button
                        type="button"
                        key={sev}
                        onClick={() => setSosSeverity(sev)}
                        className={`py-1.5 rounded-lg font-bold border transition ${
                          sosSeverity === sev
                            ? 'bg-red-600 text-white border-red-700 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location / Zone */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('Your Current Ghat / Location', 'ప్రస్తుత ఘాట్ / ప్రదేశం', 'वर्तमान स्थान')}
                  </label>
                  <select
                    value={sosZoneId}
                    onChange={e => setSosZoneId(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>
                        {language === 'te' ? z.teluguName : z.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional Details */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('Situation Description (Optional)', 'పరిస్థితి వివరాలు', 'विवरण (वैकल्पिक)')}
                  </label>
                  <textarea
                    rows={2}
                    value={sosDetails}
                    onChange={e => setSosDetails(e.target.value)}
                    placeholder={t('e.g. Ramp number, clothing, specific landmark...', 'రాంప్ నంబర్, ఆనవాళ్లు...', 'रामप संख्या, पहचान चिन्ह...')}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Contact phone */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{t('Your Name', 'మీ పేరు', 'नाम')}</label>
                    <input
                      type="text"
                      value={sosUserName}
                      onChange={e => setSosUserName(e.target.value)}
                      placeholder="e.g. Ramesh"
                      className="w-full text-xs p-2 rounded-lg border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{t('Phone Number', 'ఫోన్ నంబర్', 'फ़ोन')}</label>
                    <input
                      type="tel"
                      value={sosUserPhone}
                      onChange={e => setSosUserPhone(e.target.value)}
                      placeholder="+91 98..."
                      className="w-full text-xs p-2 rounded-lg border border-gray-300"
                    />
                  </div>
                </div>

                {/* Offline Warning Notice (Section 4.7) */}
                {!isOnline && (
                  <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-lg text-[11px] text-amber-800">
                    <img src="/assets/icons/triangle-alert.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> <b>{t('Network Offline', 'నెట్‌వర్క్ ఆఫ్‌లైన్', 'ऑफ़लाइन')}</b>:{' '}
                    {t(
                      'Your report will be stored in encrypted local storage and sent immediately when cellular or mesh connection reconnects.',
                      'మీ సమాచారం స్థానిక మెమరీలో భద్రపరచబడుతుంది.',
                      'नेटवर्क उपलब्ध होते ही अलर्ट भेज दिया जाएगा।'
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <HeartPulse className="w-5 h-5 text-white" />
                  <span>{t('TRANSMIT EMERGENCY SOS NOW', 'అత్యవసర SOS పంపండి', 'SOS अभी भेजें')}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* 4. VERIFIED AI ASSISTANT (Section 6) */}
        {activeTab === 'assistant' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[520px]">
            {/* Header */}
            <div className="p-3 bg-[#0A3A40] text-white rounded-t-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-amber-400 text-gray-950 rounded-full flex items-center justify-center font-bold text-xs">
                  G1
                </div>
                <div>
                  <h4 className="text-xs font-bold">{t('Pushkaralu Verified Assistant', 'పుష్కరాల అధికారిక సహాయకుడు', 'सत्यापित मार्गदर्शक')}</h4>
                  <span className="text-[10px] text-emerald-200 block">AP Endowments & District Administration</span>
                </div>
              </div>
              <span className="text-[10px] bg-[#14746F] px-2 py-0.5 rounded text-white font-medium">
                {language.toUpperCase()}
              </span>
            </div>

            {/* Quick Prompt Chips */}
            <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-gray-400 shrink-0">FAQ:</span>
              <button
                onClick={() => handleSendAssistant('What are the auspicious bathing timings?')}
                className="bg-white px-2.5 py-1 rounded-full border border-gray-300 text-gray-700 whitespace-nowrap hover:bg-emerald-50"
              >
                {t('Bathing Timings', 'స్నాన ముహూర్తం', 'स्नान मुहूर्त')}
              </button>
              <button
                onClick={() => handleSendAssistant('Where can I catch free shuttle buses?')}
                className="bg-white px-2.5 py-1 rounded-full border border-gray-300 text-gray-700 whitespace-nowrap hover:bg-emerald-50"
              >
                {t('Free Shuttles', 'ఉచిత బస్సులు', 'मुफ्त बस')}
              </button>
              <button
                onClick={() => handleSendAssistant('What to do if a child is separated?')}
                className="bg-white px-2.5 py-1 rounded-full border border-gray-300 text-gray-700 whitespace-nowrap hover:bg-emerald-50"
              >
                {t('Lost Person Help', 'తప్పిపోయిన వారి సహాయం', 'खोया-पाया')}
              </button>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      m.sender === 'user'
                        ? 'bg-[#0A3A40] text-white rounded-tr-none'
                        : 'bg-gray-100 text-gray-900 rounded-tl-none border border-gray-200'
                    }`}
                  >
                    <p className="leading-relaxed">{m.text}</p>
                    {m.source && (
                      <span className="text-[10px] text-emerald-800 font-semibold block mt-1 pt-1 border-t border-gray-300/50">
                        <img src="/assets/icons/circle-check.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> Verified Source: {m.source}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-2 border-t border-gray-200 bg-white rounded-b-xl flex gap-1.5">
              <input
                type="text"
                value={assistantInput}
                onChange={e => setAssistantInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendAssistant()}
                placeholder={t('Ask about ghats, routes, medical posts...', 'ఘాట్లు, బస్సులు, సౌకర్యాల గురించి అడగండి...', 'घाट, बस या नियमों के बारे में पूछें...')}
                className="flex-1 text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A3A40]"
              />
              <button
                onClick={() => handleSendAssistant()}
                className="bg-[#0A3A40] text-white px-3 py-2 rounded-lg hover:bg-[#0D4848] transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 5. LOST & FOUND PERSON WORKFLOW (Workflow C) */}
        {activeTab === 'lost_found' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
              <h4 className="font-bold flex items-center gap-1.5 text-amber-800 mb-1">
                <UserX className="w-4 h-4" />
                <span>{t('Lost & Found Case Registration', 'లాస్ట్ & ఫౌండ్ నమోదు', 'खोया-पाया सहायता')}</span>
              </h4>
              <p>
                {t(
                  'Sensitive records are private by default. Verified by authorized Help Desk officers and matched against reunification booths.',
                  'వివరాలు భద్రంగా భద్రపరచబడతాయి. సహాయ కేంద్రాల అధికారులకు మాత్రమే లభ్యమవుతాయి.',
                  'गोपनीयता सुरक्षित। केवल अधिकृत सहायता केंद्र द्वारा सत्यापन।'
                )}
              </p>
            </div>

            {submittedLostCaseId ? (
              <div className="bg-white p-5 rounded-xl border border-emerald-300 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-gray-900">{t('Case Registered Successfully', 'కేసు విజయవంతంగా నమోదైంది', 'केस दर्ज')}</h4>
                <p className="text-xs text-gray-600">
                  {t('Case Reference Code', 'కేసు కోడ్', 'केस संदर्भ')}: <b className="text-emerald-700">{submittedLostCaseId}</b>
                </p>
                <p className="text-[11px] text-gray-500">
                  {t('All police booths and Red Cross volunteer stations in Rajahmundry have been alerted.', 'రాజమండ్రిలోని అన్ని పోలీస్ సహాయ కేంద్రాలకు సమాచారం చేరింది.', 'सभी सहायता केंद्रों को सतर्क किया गया है।')}
                </p>
                <button
                  onClick={() => setSubmittedLostCaseId(null)}
                  className="mt-2 text-xs text-[#0A3A40] font-bold underline"
                >
                  {t('Register Another Case', 'మరొకరి వివరాలు నమోదు చేయండి', 'नया केस दर्ज करें')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleLostSubmit} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3 text-xs">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLostType('MISSING')}
                    className={`flex-1 py-2 rounded-lg font-bold border transition ${
                      lostType === 'MISSING' ? 'bg-amber-500 text-gray-950 border-amber-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    {t('Missing Person', 'తప్పిపోయిన వ్యక్తి', 'लापता व्यक्ति')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLostType('FOUND')}
                    className={`flex-1 py-2 rounded-lg font-bold border transition ${
                      lostType === 'FOUND' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    {t('Found Child / Senior', 'కనిపించిన వ్యక్తి / సహాయం', 'मिला हुआ बच्चा/व्यक्ति')}
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">{t('Person Name (if known)', 'పేరు', 'नाम')}</label>
                  <input
                    type="text"
                    value={lostName}
                    onChange={e => setLostName(e.target.value)}
                    placeholder="e.g. Master Sai Varun"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">{t('Approx Age', 'వయస్సు', 'आयु')}</label>
                    <input
                      type="number"
                      value={lostAge}
                      onChange={e => setLostAge(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">{t('Category', 'వర్గం', 'वर्ग')}</label>
                    <select
                      value={lostGender}
                      onChange={e => setLostGender(e.target.value as any)}
                      className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                    >
                      <option value="CHILD">{t('Child', 'చిన్నారులు', 'बच्चा')}</option>
                      <option value="MALE">{t('Male Adult/Senior', 'పురుషుడు', 'पुरुष')}</option>
                      <option value="FEMALE">{t('Female Adult/Senior', 'మహిళ', 'महिला')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">{t('Clothing Description', 'దుస్తుల వివరాలు', 'कपड़ों का विवरण')}</label>
                  <input
                    type="text"
                    required
                    value={lostClothing}
                    onChange={e => setLostClothing(e.target.value)}
                    placeholder="e.g. Yellow kurta, blue pants, silver anklet"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">{t('Last Seen Ghat / Area', 'చివరిగా చూసిన ప్రదేశం', 'अंतिम देखा गया स्थान')}</label>
                  <input
                    type="text"
                    value={lostLocation}
                    onChange={e => setLostLocation(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">{t('Guardian Contact Name', 'సంరక్షకుని పేరు', 'अभिभावक का नाम')}</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      placeholder="e.g. Padmavathi"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">{t('Contact Phone', 'ఫోన్ నంబర్', 'फ़ोन')}</label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      placeholder="+91..."
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0A3A40] text-white font-bold rounded-lg hover:bg-[#0D4848] transition cursor-pointer"
                >
                  {t('Submit Case to Help Desks', 'సహాయ కేంద్రానికి పంపండి', 'केस सबमिट करें')}
                </button>
              </form>
            )}
          </div>
        )}

        {/* 6. TRANSPORT & PARKING */}
        {activeTab === 'transport' && (
          <div className="space-y-3 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="font-bold text-sm text-gray-900 mb-2 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-blue-600" />
                <span>{t('Pushkar Satellite Parking Grounds', 'శాటిలైట్ పార్కింగ్ మైదానాలు', 'पार्किंग स्थिति')}</span>
              </h4>
              <div className="space-y-3">
                {[
                  { name: 'Morampudi Mega Parking Ground', capacity: 2500, filled: 1820, distance: '12 min via Shuttle' },
                  { name: 'Arts College Ground (2-Wheelers & Cars)', capacity: 1800, filled: 1650, distance: '6 min via Shuttle' },
                  { name: 'Gammon Bridge Approach Parking', capacity: 3000, filled: 940, distance: '15 min via Shuttle' },
                ].map((p, idx) => {
                  const pct = Math.round((p.filled / p.capacity) * 100);
                  return (
                    <div key={idx} className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                      <div className="flex justify-between font-bold mb-1">
                        <span>{p.name}</span>
                        <span className={pct > 80 ? 'text-red-600' : 'text-emerald-700'}>{pct}% Full</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${pct > 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                        <span>{p.capacity - p.filled} spots available</span>
                        <span>{p.distance}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-blue-900">
              <h4 className="font-bold mb-1">{t('Free Pushkaralu Electric AC Shuttles', 'ఉచిత పుష్కర ఎలక్ట్రిక్ బస్సులు', 'मुफ्त इलेक्ट्रिक बस')}</h4>
              <p className="text-[11px] leading-relaxed">
                {t(
                  'Continuous zero-emission electric buses operate every 3-5 minutes from all satellite parking locations to Pushkar, Saraswati, and Kotilingala Ghats.',
                  'ప్రతి 3-5 నిమిషాలకు అన్ని పార్కింగ్ ప్రదేశాల నుండి ఘాట్లకు ఉచిత బస్సులు అందుబాటులో ఉన్నాయి.',
                  'सभी पार्किंग स्थलों से घाटों तक हर 3-5 मिनट में निःशुल्क बसें उपलब्ध हैं।'
                )}
              </p>
            </div>
          </div>
        )}

        {/* 9. FAMILY SAFETY RADAR VIEW */}
        {activeTab === 'family' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs font-bold text-[#0A3A40] flex items-center gap-1 hover:underline cursor-pointer"
              >
                ← {t('Back to Dashboard', 'డాష్‌బోర్డ్‌కు వెళ్ళు', 'वापस जाएं')}
              </button>
            </div>
            <FamilySafetyCircle />
          </div>
        )}

        {/* 10. PERSONALIZED DIP PLANNER VIEW */}
        {activeTab === 'planner' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs font-bold text-[#0A3A40] flex items-center gap-1 hover:underline cursor-pointer"
              >
                ← {t('Back to Dashboard', 'డాష్‌బోర్డ్‌కు వెళ్ళు', 'वाపस जाएं')}
              </button>
            </div>
            <PersonalizedDipPlanner />
          </div>
        )}

        {/* 11. LIVE SAFE WALKING WAYFINDER VIEW */}
        {activeTab === 'wayfinder' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs font-bold text-[#0A3A40] flex items-center gap-1 hover:underline cursor-pointer"
              >
                ← {t('Back to Dashboard', 'డాష్‌బోర్డ్‌కు వెళ్ళు', 'वापस जाएं')}
              </button>
            </div>
            <LiveWalkingWayfinder />
          </div>
        )}

        {/* 12. E-QMS VIRTUAL QUEUE BATHING TOKEN */}
        {activeTab === 'token' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs font-bold text-[#0A3A40] flex items-center gap-1 hover:underline cursor-pointer"
              >
                ← {t('Back to Dashboard', 'డాష్‌బోర్డ్‌కు వెళ్ళు', 'वापस जाएं')}
              </button>
            </div>
            <VirtualQueueToken />
          </div>
        )}

        {/* 13. LIVE RIVER WATER QUALITY MONITOR */}
        {activeTab === 'water_quality' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs font-bold text-[#0A3A40] flex items-center gap-1 hover:underline cursor-pointer"
              >
                ← {t('Back to Dashboard', 'డాష్‌బోర్డ్‌కు వెళ్ళు', 'वापस जाएं')}
              </button>
            </div>
            <RiverQualityMonitor />
          </div>
        )}

        {/* 14. FREE ANNAPRASADAM & RO WATER POINT LOCATOR */}
        {activeTab === 'annadanam' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs font-bold text-[#0A3A40] flex items-center gap-1 hover:underline cursor-pointer"
              >
                ← {t('Back to Dashboard', 'డాష్‌బోర్డ్‌కు వెళ్ళు', 'वापस जाएं')}
              </button>
            </div>
            <AnnadanamPrasadamFinder onNavigateTo={() => setActiveTab('wayfinder')} />
          </div>
        )}

        {/* 15. EXPLORE RAJAHMUNDRY (Matches Kumbh Explore Prayagraj Tab) */}
        {activeTab === 'explore' && (
          <PilgrimExploreRajahmundry
            language={language}
            onNavigateToMap={() => setActiveTab('map')}
            onNavigateToParking={() => setActiveTab('transport')}
          />
        )}

        {/* 16. GODAVARI PUSHKARALU 2027 BATHING DATES & AUSPICIOUS SCHEDULE (Matches Maha Kumbh Mela Tab) */}
        {activeTab === 'pushkaralu' && (
          <PilgrimPushkaraluTab
            language={language}
            onNavigateToToken={() => setActiveTab('token')}
            onNavigateToDipPlanner={() => setActiveTab('planner')}
            onNavigateToWaterQuality={() => setActiveTab('water_quality')}
          />
        )}

        {/* 17. OFFICIAL MORE MENU & LANGUAGE SWITCHER (Matches Kumbh More Tab) */}
        {activeTab === 'more' && (
          <PilgrimMoreTab
            language={language}
            onLanguageChange={setLanguage}
            onNavigateSubfeature={(subfeat) => {
              if (subfeat === 'seva' || subfeat === 'public_seva') {
                setCurrentInterface('seva');
              } else {
                setActiveTab(subfeat as any);
              }
            }}
            devoteeName={appProfile.name}
            regId={appProfile.regId}
            assignedGhat={appProfile.assignedGhat}
            swayamSlot={appProfile.swayamSlot}
          />
        )}

        {/* 18. DEVOTEE PROFILE, ASSIGNED GHAT, SWAYAM SLOT & BIOMETRICS (Matches User Request) */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <section className="bg-white rounded-3xl border border-slate-200 p-4 text-slate-900 space-y-3">
              <h3 className="font-bold">{t('Account settings','ఖాతా సెట్టింగ్‌లు','खाता सेटिंग्स')}</h3>
              <p className="text-xs text-slate-500">{appProfile.isLoggedIn ? appProfile.name + ' · ' + appProfile.phone : t('Guest session','అతిథి సెషన్','अतिथि सत्र')}</p>
              <button onClick={()=>changeAccount('signup')} className="w-full rounded-xl bg-emerald-900 text-white p-3 text-sm font-bold">{t('Add another account','మరో ఖాతాను జోడించండి','दूसरा खाता जोड़ें')}</button>
              <button onClick={()=>changeAccount('login')} className="w-full rounded-xl border border-emerald-800 text-emerald-900 p-3 text-sm font-bold">{t('Switch account / Log in','ఖాతా మార్చండి / లాగిన్','खाता बदलें / लॉग इन')}</button>
              {appProfile.isLoggedIn && <button onClick={()=>changeAccount('account')} className="w-full rounded-xl bg-red-50 text-red-700 p-3 text-sm font-bold">{t('Log out','లాగ్ అవుట్','लॉग आउट')}</button>}
              <p className="text-[11px] text-slate-500">{t('Switching signs out this session. Saved accounts and profiles stay on this device. Your PIN is required to sign in again.','ఖాతా మార్చినప్పుడు లాగ్ అవుట్ అవుతారు. ప్రొఫైళ్లు ఈ పరికరంలో ఉంటాయి. మళ్లీ పిన్ అవసరం.','खाता बदलने पर साइन आउट होगा। प्रोफ़ाइल इस डिवाइस पर सुरक्षित रहेगी। फिर पिन आवश्यक है।')}</p>
              {accountNotice && <p role="alert" className="text-xs text-red-700">{accountNotice}</p>}
            </section>
            <PilgrimProfileSettings key={appProfile.phone} profile={appProfile} onSave={details=>saveAppProfile({...appProfile,...details})} />
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-gray-900">
                  {t('Devotee Pushkaralu Pass & Profile', 'భక్తుని ప్రొఫైల్ & పుష్కర పాస్', 'तीर्थयात्री पहचान पत्र एवं प्रोफाइल')}
                </h2>
                <p className="text-[11px] text-gray-600">
                  {t('Official AP Government Digital Identity with Biometric fast-track credentials', 'బయోమెట్రిక్ సౌకర్యంతో కూడిన అధికారిక ఏపీ ప్రభుత్వ డిజిటల్ పాస్', 'बायोमेट्रिक फास्ट-ट्रैक युक्त आधिकारिक डिजिटल पहचान पत्र')}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs text-amber-700 bg-amber-100 hover:bg-amber-200 font-bold px-2.5 py-1 rounded-xl transition cursor-pointer"
              >
                ← {t('Home', 'హోమ్', 'होम')}
              </button>
            </div>

            {/* Official Holographic Identity Pass Card */}
            <div className="bg-gradient-to-br from-[#06201b] via-[#0b332b] to-[#041613] text-white p-5 rounded-3xl border-2 border-amber-400 shadow-xl relative overflow-hidden">
              <div className="flex items-start justify-between pb-3 border-b border-emerald-800/60 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black text-lg shadow-md">
                    <img src="/assets/branding/godavari-one-logo.png" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-300">
                        GOVT OF AP • ENDOWMENTS DEPT
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full">
                        ACTIVE
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-white">
                      {appProfile.name}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-gray-400 uppercase font-bold block">Pass ID</span>
                  <span className="font-mono text-xs font-black text-amber-300 bg-[#061d18] px-2 py-0.5 rounded border border-[#1b5b4f]">
                    {appProfile.regId}
                  </span>
                </div>
              </div>

              {/* Ghat Allocation & Swayam Slot Banner (User Explicit Requirement) */}
              <div className="space-y-2.5 text-xs">
                <div className="bg-[#031411] p-3 rounded-2xl border border-emerald-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 uppercase font-extrabold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t('Assigned Ghat', 'కేటాయించిన ఘాట్', 'आवंटित घाट')}</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-600/40">
                      Depth: 3.8ft • Barricade Safe
                    </span>
                  </div>
                  <div className="text-sm font-black text-amber-300">
                    {appProfile.assignedGhat}
                  </div>
                  
                  {/* Real Google Maps Turn-by-Turn Button */}
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] text-gray-300">
                      <img src="/assets/icons/map-pin.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> ~850m from Pushkar Nagar Camp
                    </span>
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=16.9942,81.7766&travelmode=walking"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-black px-2.5 py-1 rounded-xl text-[10px] inline-flex items-center gap-1 shadow transition cursor-pointer"
                    >
                      <span><img src="/assets/icons/map.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> {t('Open in Google Maps', 'గూగుల్ మ్యాప్స్ మార్గం', 'गूगल मैप्स नेविगेशन')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="bg-[#031411] p-3 rounded-2xl border border-emerald-800/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 uppercase font-extrabold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t('Swayam Snanam Muhurtham Slot', 'స్వయం పవిత్ర స్నాన సమయం', 'पवित्र स्नान समय')}</span>
                    </span>
                    <span className="text-[10px] text-amber-300 font-mono font-bold">
                      SACRED SLOT
                    </span>
                  </div>
                  <div className="text-sm font-black text-white">
                    {appProfile.swayamSlot}
                  </div>
                  <p className="text-[10px] text-gray-400 leading-tight">
                    * Fast-track river queue lane unlocks 30 minutes prior to this auspicious muhurtham.
                  </p>
                </div>

                {/* Devotee Personal Vitals */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#031411] p-2 rounded-xl border border-emerald-900/60">
                    <span className="text-[9px] text-gray-400 uppercase font-bold block">{t('Age', 'వయస్సు', 'आयु')}</span>
                    <span className="font-extrabold text-white text-xs">{appProfile.age} Yrs</span>
                  </div>
                  <div className="bg-[#031411] p-2 rounded-xl border border-emerald-900/60">
                    <span className="text-[9px] text-gray-400 uppercase font-bold block">{t('Blood Group', 'రక్త వర్గం', 'रक्त समूह')}</span>
                    <span className="font-extrabold text-red-400 text-xs">{appProfile.bloodGroup}</span>
                  </div>
                  <div className="bg-[#031411] p-2 rounded-xl border border-emerald-900/60">
                    <span className="text-[9px] text-gray-400 uppercase font-bold block">{t('Origin City', 'పట్టణం', 'शहर')}</span>
                    <span className="font-extrabold text-white text-xs truncate block">{appProfile.city}</span>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-[#031411] p-2.5 rounded-xl border border-emerald-900/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase font-bold block">{t('Emergency Contact', 'అత్యవసర సంప్రదింపు', 'आपातकालीन संपर्क')}</span>
                    <span className="text-white font-bold">{appProfile.emergencyContactName}</span>
                  </div>
                  <a
                    href={`tel:${appProfile.emergencyContactPhone}`}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-2 py-1 rounded-lg text-[10px] inline-flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3 text-amber-300" />
                    <span>{appProfile.emergencyContactPhone}</span>
                  </a>
                </div>

                {/* Digital QR Pass */}
                <div className="bg-[#020d0b] p-3 rounded-2xl border border-emerald-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-emerald-400 uppercase font-extrabold block">
                      TURNSTILE PASS QR
                    </span>
                    <span className="text-xs text-white font-bold">
                      Scan at Ghat RFID Reader
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      Encrypted under Section 43 IT Act
                    </span>
                  </div>
                  <div 
                    onClick={() => {
                      audioEngine.playSuccessScanBeep();
                      alert('QR Code Ready: Verified for Ghat Gate 3 admission.');
                    }}
                    className="w-14 h-14 bg-white p-1 rounded-xl shadow cursor-pointer hover:scale-105 transition flex items-center justify-center"
                    title="Tap to verify QR scan"
                  >
                    <QrCode className="w-12 h-12 text-stone-900" />
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="mt-4 pt-3 border-t border-emerald-800/60 flex items-center justify-between">
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span><img src="/assets/icons/circle-help.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> {t('Edit Profile & Ghat / Slot', 'సవరించండి', 'प्रोफाइल संपादित करें')}</span>
                </button>

                <button
                  onClick={() => changeAccount('account')}
                  className="text-red-300 hover:text-white text-xs underline font-bold cursor-pointer"
                >
                  {t('Sign Out Pass', 'సైన్ అవుట్', 'लॉग आउट')}
                </button>
              </div>
            </div>

            {/* Advanced Biometric Verification Component for Assigned Ghats & Restricted Seva Portals */}
            <BiometricVerification
              devoteeName={appProfile.name}
              regId={appProfile.regId}
              assignedGhat={appProfile.assignedGhat}
              swayamSlot={appProfile.swayamSlot}
              language={language}
            />

            {/* Standalone Biometric Verification History with Full Audit Trail & Filter Analytics */}
            <BiometricVerificationHistory
              language={language}
              className="mt-4"
            />

            {/* River Safety Directives */}
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs text-amber-950 space-y-1">
              <span className="font-black flex items-center gap-1.5 text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>{t('Sacred Snanam Directives', 'పవిత్ర స్నాన నియమాలు', 'पवित्र स्नान नियम')}</span>
              </span>
              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                Always hold the safety iron chain while taking your holy dip. Life jackets are provided free of charge for children and senior citizens at your assigned ghat.
              </p>
            </div>

          </div>
        )}

        {/* 19. RESTRICTED SEVA PORTAL (Triggered via Seva Portal & Biometric Verification) */}
        {activeTab === 'public_seva' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-3.5 rounded-2xl shadow-md border border-purple-700/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-purple-950 flex items-center justify-center font-black text-xs shadow">
                  <img src="/assets/icons/heart-handshake.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" />
                </div>
                <div>
                  <span className="text-[10px] font-black tracking-widest text-amber-300 uppercase block">
                    BIOMETRICALLY VERIFIED ACCESS • DPDP 2023 SECURE
                  </span>
                  <h3 className="text-sm font-black text-white">
                    {t('Official Seva Mitra & Darshan Portal', 'అధికారిక సేవా మిత్ర & దర్శన పోర్టల్', 'आधिकारिक सेवा मित्र एवं दर्शन पोर्टल')}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('more')}
                className="bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
              >
                ← {t('Back to More', 'వెనుకకు', 'वापस')}
              </button>
            </div>

            <PublicSevaPortal />
          </div>
        )}

      </main>

      {/* Edit Profile & Ghat / Slot Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-gray-200 text-gray-900 space-y-3.5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                  DEVOTEE PROFILE MANAGEMENT
                </span>
                <h3 className="text-base font-extrabold text-gray-950">
                  {t('Edit Profile, Ghat & Swayam Slot', 'ప్రొఫైల్, ఘాట్ & స్నాన సమయం సవరణ', 'प्रोफाइल, घाट व समय स्लॉट बदलें')}
                </h3>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="text-gray-400 hover:text-gray-900 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveAppProfile({
                  ...appProfile,
                  name: loginInputName.trim() || appProfile.name,
                  assignedGhat: loginInputGhat,
                  swayamSlot: loginInputSlot,
                  age: loginInputAge || appProfile.age,
                  city: loginInputCity || appProfile.city,
                  bloodGroup: loginInputBloodGroup || appProfile.bloodGroup,
                  emergencyContactName: loginInputEmergencyName || appProfile.emergencyContactName,
                  emergencyContactPhone: loginInputEmergencyPhone || appProfile.emergencyContactPhone,
                });
                setIsEditingProfile(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  {t('Full Name / భక్తుని పేరు', 'భక్తుని పేరు', 'पूरा नाम')} *
                </label>
                <input
                  type="text"
                  required
                  value={loginInputName}
                  onChange={(e) => setLoginInputName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Assigned Ghat Selection */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  {t('Select Assigned Ghat', 'కేటాయించబడే ఘాట్', 'आवंटित घाट चुनें')} *
                </label>
                <select
                  value={loginInputGhat}
                  onChange={(e) => setLoginInputGhat(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="Pushkar Ghat (Main & VIP)">Pushkar Ghat (Main & VIP) - Center</option>
                  <option value="Kotilingala Ghat">Kotilingala Ghat - North Promenade</option>
                  <option value="Saraswati Ghat (Elders)">Saraswati Ghat (Dedicated to Elders)</option>
                  <option value="Markandeya Ghat">Markandeya Ghat - Heritage Steps</option>
                  <option value="VIP Gautami Ghat">VIP Gautami Ghat - Fast Corridor</option>
                  <option value="Padmavathi Ghat">Padmavathi Ghat - Family Enclosure</option>
                </select>
              </div>

              {/* Swayam Slot Selection */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  {t('Swayam Snanam Muhurtham Slot', 'స్వయం పవిత్ర స్నాన సమయం', 'पवित्र स्नान समय स्लॉट')} *
                </label>
                <select
                  value={loginInputSlot}
                  onChange={(e) => setLoginInputSlot(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="Brahma Muhurtham (04:30 - 06:00 AM)">Brahma Muhurtham (04:30 - 06:00 AM)</option>
                  <option value="Pratahsavanam (06:00 - 08:30 AM)">Pratahsavanam (06:00 - 08:30 AM)</option>
                  <option value="Abhijit Muhurtham (11:45 AM - 12:45 PM)">Abhijit Muhurtham (11:45 AM - 12:45 PM)</option>
                  <option value="Sandhya Muhurtham (05:30 - 07:00 PM)">Sandhya Muhurtham (05:30 - 07:00 PM)</option>
                  <option value="Night Harathi Snanam (07:30 - 09:30 PM)">Night Harathi Snanam (07:30 - 09:30 PM)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Age</label>
                  <input
                    type="number"
                    value={loginInputAge}
                    onChange={(e) => setLoginInputAge(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-2 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={loginInputBloodGroup}
                    onChange={(e) => setLoginInputBloodGroup(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-2 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={loginInputCity}
                    onChange={(e) => setLoginInputCity(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-2 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Emergency Name</label>
                  <input
                    type="text"
                    value={loginInputEmergencyName}
                    onChange={(e) => setLoginInputEmergencyName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-2 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    value={loginInputEmergencyPhone}
                    onChange={(e) => setLoginInputEmergencyPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-2 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-black px-4 py-2 rounded-xl text-xs shadow transition cursor-pointer"
                >
                  Save Profile & Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Devotee Phone + OTP Login Modal (User Explicit Requirement) */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-gray-200 text-gray-900 space-y-3.5 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-200 pb-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  GOVT OF AP • PILGRIM APP
                </span>
                <h3 className="text-base font-extrabold text-gray-950 mt-1">
                  {loginStep === 'phone' && t('Devotee Login with Phone', 'మొబైల్ నెంబర్‌తో లాగిన్', 'फोन से तीर्थयात्री लॉग इन')}
                  {loginStep === 'otp' && t('Verify 6-Digit OTP', '6 అంకెల ఓటీపీని నిర్ధారించండి', '6-अंकीय OTP दर्ज करें')}
                  {loginStep === 'details' && t('Select Assigned Ghat & Slot', 'ఘాట్ మరియు స్నాన సమయం ఎంచుకోండి', 'घाट एवं समय स्लॉट चुनें')}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginModalNotice(null);
                  setLoginStep('phone');
                }}
                className="text-gray-400 hover:text-gray-900 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loginModalNotice && (
              <div className="p-2.5 rounded-xl text-xs bg-amber-50 border border-amber-300 text-amber-900 font-medium">
                {loginModalNotice}
              </div>
            )}

            {/* Step 1: Phone Number Input */}
            {loginStep === 'phone' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const clean = loginInputPhone.replace(/[^0-9]/g, '');
                  if (clean.length < 10) {
                    setLoginModalNotice('Please enter a valid 10-digit mobile number.');
                    return;
                  }
                  setLoginModalNotice(null);
                  setLoginStep('otp');
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    {t('Mobile Phone Number / మొబైల్ సంఖ్య', 'మొబైల్ సంఖ్య', 'मोबाइल नंबर')} *
                  </label>
                  <div className="flex">
                    <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl px-3 py-2 text-xs font-bold text-gray-700 flex items-center">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={loginInputPhone}
                      onChange={(e) => setLoginInputPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 9848022338"
                      className="w-full bg-gray-50 border border-gray-300 rounded-r-xl px-3 py-2 text-xs text-gray-900 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Local demo sign-in: use code 520271 on the next step. No SMS is sent.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black py-2.5 px-4 rounded-xl text-xs shadow-md transition cursor-pointer"
                >
                  {t('Continue to verification →', 'ఓటీపీ పంపండి →', 'OTP भेजें →')}
                </button>
              </form>
            )}

            {/* Step 2: 6-Digit OTP Verification */}
            {loginStep === 'otp' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (loginInputOtp !== '520271') {
                    setLoginModalNotice('Enter the demo code 520271. SMS verification is not connected.');
                    return;
                  }
                  setLoginModalNotice(null);
                  audioEngine.playSuccessScanBeep();
                  setLoginStep('details');
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase">
                      {t('Enter 6-Digit OTP', '6 అంకెల ఓటీపీ', '6-अंकीय OTP')} *
                    </label>
                    <button
                      type="button"
                      onClick={() => setLoginInputOtp('520271')}
                      className="text-[10px] text-amber-700 font-bold underline cursor-pointer"
                    >
                      <img src="/assets/icons/zap.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> Auto-fill 520271
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoComplete="one-time-code" inputMode="numeric" aria-label="Six-digit demo verification code" value={loginInputOtp}
                    onChange={(e) => setLoginInputOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 520271"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-base tracking-widest text-center text-gray-900 font-mono font-black focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Demo verification code sent to +91 {loginInputPhone}. (Test code: <strong>520271</strong>)
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLoginStep('phone')}
                    className="w-1/3 border border-gray-300 py-2.5 rounded-xl font-bold text-gray-700 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-stone-950 font-black py-2.5 rounded-xl shadow-md transition cursor-pointer"
                  >
                    {t('Verify OTP →', 'నిర్ధారించండి →', 'पुष्टि करें →')}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Complete Devotee Details (Assigned Ghat & Swayam Slot Selection) */}
            {loginStep === 'details' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!loginInputName.trim()) {
                    setLoginModalNotice('Please enter your full name.');
                    return;
                  }
                  const newProfile = {
                    name: loginInputName.trim(),
                    phone: loginInputPhone,
                    regId: appProfile.regId || `PK-2027-${Math.floor(1000 + Math.random() * 9000)}`,
                    assignedGhat: loginInputGhat,
                    swayamSlot: loginInputSlot,
                    age: loginInputAge || '38',
                    city: loginInputCity || 'Rajahmundry',
                    bloodGroup: loginInputBloodGroup || 'O+',
                    emergencyContactName: loginInputEmergencyName || 'Suresh Varma',
                    emergencyContactPhone: loginInputEmergencyPhone || '9849011223',
                    biometricEnabled: loginBiometricOptIn,
                    faceIdEnabled: loginBiometricOptIn,
                    isLoggedIn: true,
                  };
                  saveAppProfile(newProfile);
                  audioEngine.playSuccessScanBeep();
                  setShowLoginModal(false);
                  setActiveTab('profile');
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Devotee Full Name / భక్తుని పూర్తి పేరు *
                  </label>
                  <input
                    type="text"
                    required
                    value={loginInputName}
                    onChange={(e) => setLoginInputName(e.target.value)}
                    placeholder="e.g. Avinash Kumar / అనిల్ కుమార్"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    {t('Select Assigned Ghat', 'కేటాయించబడే ఘాట్', 'आवंटित घाट')} *
                  </label>
                  <select
                    value={loginInputGhat}
                    onChange={(e) => setLoginInputGhat(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-amber-500 font-bold"
                  >
                    <option value="Pushkar Ghat (Main & VIP)">Pushkar Ghat (Main & VIP)</option>
                    <option value="Kotilingala Ghat">Kotilingala Ghat</option>
                    <option value="Saraswati Ghat (Elders)">Saraswati Ghat (Elders)</option>
                    <option value="Markandeya Ghat">Markandeya Ghat</option>
                    <option value="VIP Gautami Ghat">VIP Gautami Ghat</option>
                    <option value="Padmavathi Ghat">Padmavathi Ghat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    {t('Swayam Snanam Muhurtham Slot', 'స్వయం పవిత్ర స్నాన సమయం', 'पवित्र स्नान समय स्लॉट')} *
                  </label>
                  <select
                    value={loginInputSlot}
                    onChange={(e) => setLoginInputSlot(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-amber-500 font-bold"
                  >
                    <option value="Brahma Muhurtham (04:30 - 06:00 AM)">Brahma Muhurtham (04:30 - 06:00 AM)</option>
                    <option value="Pratahsavanam (06:00 - 08:30 AM)">Pratahsavanam (06:00 - 08:30 AM)</option>
                    <option value="Abhijit Muhurtham (11:45 AM - 12:45 PM)">Abhijit Muhurtham (11:45 AM - 12:45 PM)</option>
                    <option value="Sandhya Muhurtham (05:30 - 07:00 PM)">Sandhya Muhurtham (05:30 - 07:00 PM)</option>
                    <option value="Night Harathi Snanam (07:30 - 09:30 PM)">Night Harathi Snanam (07:30 - 09:30 PM)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="biometric-toggle"
                    checked={loginBiometricOptIn}
                    onChange={(e) => setLoginBiometricOptIn(e.target.checked)}
                    className="rounded text-amber-500 cursor-pointer"
                  />
                  <label htmlFor="biometric-toggle" className="text-[11px] text-gray-700 cursor-pointer">
                    Enable Biometrics (Touch ID & Face ID) for river turnstiles
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white font-black py-2.5 rounded-xl shadow-md transition cursor-pointer mt-2"
                >
                  {t('Activate Devotee Pass & Save', 'పాస్ యాక్టివేట్ చేయండి', 'पास सक्रिय करें')}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Official 5-Tab Floating Bottom Navigation Bar with Central Elevated SOS Button */}
      <PilgrimBottomNav
        activeTab={getMainNavTab()}
        onTabChange={handleBottomNavChange}
        language={language}
      />

      {/* Emergency Acoustic Siren & Night Strobe Beacon Modal */}
      {showSirenModal && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-150 ${
            isStrobeActive 
              ? strobeIndex === 0 ? 'bg-red-600/90' : strobeIndex === 1 ? 'bg-amber-400/90' : 'bg-white/95'
              : 'bg-black/80 backdrop-blur-sm'
          }`}
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border-4 border-red-600 text-gray-900 space-y-4 text-center">
            <div className="flex justify-between items-start">
              <div className="text-left">
                <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {t('100% OFFLINE ACOUSTIC BEACON', 'ఆఫ్‌లైన్ అత్యవసర సైరన్', 'ऑफ़लाइन आपातकालीन सायरन')}
                </span>
                <h3 className="text-lg font-black text-gray-950 mt-1">
                  {t('Crowd Siren & Safety Whistle', 'రక్షణ సైరన్ & ఈల', 'भीड़ सायरन एवं सीटी')}
                </h3>
              </div>
              <button
                onClick={() => {
                  if (isSirenOn) toggleSiren();
                  setIsStrobeActive(false);
                  setShowSirenModal(false);
                }}
                className="text-gray-400 hover:text-gray-900 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-gray-600 text-left">
              {t(
                'Uses phone speaker synthesis to emit penetrating sound waves even in zero cell service to guide nearby SDRF boats, police patrols and volunteers to your location.',
                'నెట్‌వర్క్ లేకున్నా సమీపంలోని భద్రతా సిబ్బంది మరియు బోట్లకు మీ ఉనికిని తెలియజేసేందుకు సైరన్ ఉపయోగపడుతుంది.',
                'नेटवर्क न होने पर भी पास के पुलिस एवं राहत दल को सतर्क करने के लिए इसका उपयोग करें।'
              )}
            </p>

            {/* Siren Toggle Button */}
            <div className="space-y-2">
              <button
                onClick={toggleSiren}
                className={`w-full py-4 rounded-2xl font-black text-base shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                  isSirenOn 
                    ? 'bg-amber-500 hover:bg-amber-600 text-gray-950 animate-pulse border-2 border-amber-300' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                <Siren className={`w-6 h-6 ${isSirenOn ? 'animate-spin' : ''}`} />
                <span>
                  {isSirenOn 
                    ? t('STOP EMERGENCY SIREN', 'సైరన్ ఆపండి', 'सायरन बंद करें')
                    : t('START EMERGENCY SIREN', 'అత్యవసర సైరన్ మోగించండి', 'आपातकालीन सायरन चालू करें')
                  }
                </span>
              </button>

              {isSirenOn && (
                <div className="flex items-center justify-center gap-1.5 text-red-600 font-bold text-xs animate-bounce">
                  <span><img src="/assets/icons/volume2.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> High-Decibel Acoustic Sweep Emitting (Penetrates Crowd Noise)</span>
                </div>
              )}
            </div>

            {/* Whistle Burst Button */}
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={handleWhistle}
                className={`w-full py-2.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition active:scale-95 ${
                  isWhistleActive ? 'bg-amber-600' : ''
                }`}
              >
                <span><img src="/assets/icons/volume2.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /></span>
                <span>{t('BLOW 3-BURST LIFESAFETY WHISTLE', '3 సార్లు ఈల వేయండి', '3-बार सुरक्षा सीटी बजाएं')}</span>
              </button>
            </div>

            {/* Night Strobe Beacon Toggle */}
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-2xl flex items-center justify-between text-left">
              <div>
                <span className="font-bold text-xs text-gray-900 block">
                  {t('Night Rescue Screen Strobe', 'రాత్రి రక్షణ స్క్రీన్ వెలుగు', 'नाइट स्क्रीन स्ट्रोब')}
                </span>
                <span className="text-[10px] text-gray-500 block">
                  {t('Flashes screen brightly for dark river banks', 'చీకట్లో సులభంగా కనిపించేలా స్క్రీన్ వెలుగుతుంది', 'नदी किनारे अंधेरे में दृश्यता हेतु')}
                </span>
              </div>
              <button
                onClick={() => setIsStrobeActive(!isStrobeActive)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  isStrobeActive 
                    ? 'bg-amber-500 text-gray-950 shadow' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isStrobeActive ? t('Strobe ON', 'ఆన్', 'चालू') : t('Strobe OFF', 'ఆఫ్', 'बंद')}
              </button>
            </div>

            <button
              onClick={() => {
                if (isSirenOn) toggleSiren();
                setIsStrobeActive(false);
                setShowSirenModal(false);
              }}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs cursor-pointer"
            >
              {t('Close Safety Modal', 'మూసివేయి', 'बंद करें')}
            </button>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};



