import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, 
  Scan, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Key, 
  MapPin, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  Volume2, 
  Check, 
  X,
  History,
  FileCheck
} from 'lucide-react';
import { audioEngine } from '../utils/audioAlarm';

export interface BiometricCheckInRecord {
  id: string;
  type: 'GHAT_CHECKIN' | 'SEVA_PORTAL';
  targetName: string;
  gateOrVenue: string;
  timestamp: string;
  method: 'FINGERPRINT' | 'FACE_ID';
  status: 'AUTHENTICATED' | 'FAILED';
  authHash: string;
  failureReason?: string;
  coordinates?: string;
  deviceEnclave?: string;
}

interface BiometricVerificationProps {
  devoteeName: string;
  regId: string;
  assignedGhat: string;
  swayamSlot: string;
  language: 'en' | 'te' | 'hi';
  initialPurpose?: 'ghat' | 'seva';
  onCheckInSuccess?: (record: BiometricCheckInRecord) => void;
  className?: string;
}

export const BiometricVerification: React.FC<BiometricVerificationProps> = ({
  devoteeName,
  regId,
  assignedGhat,
  swayamSlot,
  language,
  initialPurpose = 'ghat',
  onCheckInSuccess,
  className = '',
}) => {
  const [authMode, setAuthMode] = useState<'fingerprint' | 'face'>('fingerprint');
  const [purpose, setPurpose] = useState<'ghat' | 'seva'>(initialPurpose);
  const [selectedSeva, setSelectedSeva] = useState<'harathi' | 'vratham' | 'volunteer'>('harathi');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [authStatus, setAuthStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checkInLogs, setCheckInLogs] = useState<BiometricCheckInRecord[]>(() => {
    try {
      const saved = localStorage.getItem('g1_biometric_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 'BIO-LOG-201',
        type: 'GHAT_CHECKIN',
        targetName: 'Pushkar Ghat (Main & VIP)',
        gateOrVenue: 'Gate 2B - Fast Track River Turnstile',
        timestamp: 'Today, 05:42 AM',
        method: 'FINGERPRINT',
        status: 'AUTHENTICATED',
        authHash: 'SEC-ENC-77A9-AP2027',
        coordinates: '16.9942° N, 81.7766° E',
        deviceEnclave: 'AP-SE-ENCLAVE-v4'
      },
      {
        id: 'BIO-LOG-202',
        type: 'GHAT_CHECKIN',
        targetName: 'Kotilingala Mega Ghat',
        gateOrVenue: 'Turnstile Gate 1A (North Promenade Entry)',
        timestamp: 'Today, 07:15 AM',
        method: 'FACE_ID',
        status: 'FAILED',
        authHash: 'ERR-FACIAL-ALIGNMENT-TIMEOUT',
        failureReason: 'Face boundary tilted > 25° during crowd motion. Sensor auto-aborted.',
        coordinates: '17.0018° N, 81.7712° E',
        deviceEnclave: 'AP-SE-ENCLAVE-v4'
      },
      {
        id: 'BIO-LOG-203',
        type: 'GHAT_CHECKIN',
        targetName: 'Kotilingala Mega Ghat',
        gateOrVenue: 'Turnstile Gate 1A (North Promenade Entry)',
        timestamp: 'Today, 07:16 AM',
        method: 'FINGERPRINT',
        status: 'AUTHENTICATED',
        authHash: 'SEC-ENC-91B4-AP2027',
        coordinates: '17.0018° N, 81.7712° E',
        deviceEnclave: 'AP-SE-ENCLAVE-v4'
      }
    ];
  });

  const [activeSuccessRecord, setActiveSuccessRecord] = useState<BiometricCheckInRecord | null>(null);

  const t = (en: string, te: string, hi: string) => {
    return language === 'te' ? te : language === 'hi' ? hi : en;
  };

  // Sound and Haptic execution
  const triggerHaptic = (pattern: number | number[]) => {
    if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // ignore
      }
    }
  };

  const handleStartScan = (simulateError = false) => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setAuthStatus('scanning');
    setErrorMessage(null);
    setActiveSuccessRecord(null);

    // Initial tactile pulse
    triggerHaptic(30);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 100;
        }
        return prev + 15;
      });
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
      setScanProgress(100);
      setIsScanning(false);

      if (simulateError) {
        setAuthStatus('failed');
        const failReason = authMode === 'fingerprint'
          ? t('Sensor smudged or incomplete contact. Please wipe sensor and try again.', 'సెన్సార్ తడిగా ఉంది. దయచేసి వేలు తుడిచి మళ్ళీ ప్రయత్నించండి.', 'फिंगरप्रिंट स्पष्ट नहीं है। कृपया सेंसर साफ़ कर पुनः प्रयास करें।')
          : t('Face not aligned in frame. Look directly at the scanner without dark sunglasses.', 'ముఖం స్పష్టంగా లేదు. దయచేసి కెమెరా వైపు నేరుగా చూడండి.', 'चेहरा संरेखित नहीं है। कृपया कैमरे की ओर सीधे देखें।');
        
        setErrorMessage(failReason);
        triggerHaptic([60, 50, 60]);

        const failedRecord: BiometricCheckInRecord = {
          id: `BIO-FAIL-${Math.floor(1000 + Math.random() * 9000)}`,
          type: purpose === 'ghat' ? 'GHAT_CHECKIN' : 'SEVA_PORTAL',
          targetName: purpose === 'ghat' 
            ? assignedGhat 
            : selectedSeva === 'harathi' 
            ? 'Godavari Maha Harathi Inner Sanctum' 
            : selectedSeva === 'vratham' 
            ? 'Special Pushkara Vratham & Tarpanam Seva' 
            : 'Seva Mitra Volunteer Command Corridor',
          gateOrVenue: purpose === 'ghat' 
            ? 'Turnstile Gate 3A (River Egress Barricade)' 
            : 'Priority Seva Gate S-1',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          method: authMode === 'fingerprint' ? 'FINGERPRINT' : 'FACE_ID',
          status: 'FAILED',
          authHash: 'ERR-BIOMETRIC-REJECTED',
          failureReason: failReason,
          coordinates: '16.9942° N, 81.7766° E',
          deviceEnclave: 'AP-SE-ENCLAVE-v4'
        };

        const updated = [failedRecord, ...checkInLogs.slice(0, 19)];
        setCheckInLogs(updated);
        try {
          localStorage.setItem('g1_biometric_logs', JSON.stringify(updated));
          window.dispatchEvent(new Event('g1_biometric_logs_updated'));
        } catch (e) {}
      } else {
        // Success
        audioEngine.playSuccessScanBeep(2150, 95, 0.28);
        triggerHaptic([45, 50, 45]);
        setAuthStatus('success');

        const newRecord: BiometricCheckInRecord = {
          id: `BIO-${Math.floor(1000 + Math.random() * 9000)}`,
          type: purpose === 'ghat' ? 'GHAT_CHECKIN' : 'SEVA_PORTAL',
          targetName: purpose === 'ghat' 
            ? assignedGhat 
            : selectedSeva === 'harathi' 
            ? 'Godavari Maha Harathi Inner Sanctum' 
            : selectedSeva === 'vratham' 
            ? 'Special Pushkara Vratham & Tarpanam Seva' 
            : 'Seva Mitra Volunteer Command Corridor',
          gateOrVenue: purpose === 'ghat' 
            ? 'Turnstile Gate 3A (River Egress Barricade)' 
            : 'Priority Seva Gate S-1',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          method: authMode === 'fingerprint' ? 'FINGERPRINT' : 'FACE_ID',
          status: 'AUTHENTICATED',
          authHash: `AP-${Math.random().toString(36).substring(2, 8).toUpperCase()}-2027`,
          coordinates: '16.9942° N, 81.7766° E',
          deviceEnclave: 'AP-SE-ENCLAVE-v4'
        };

        setActiveSuccessRecord(newRecord);
        const updated = [newRecord, ...checkInLogs.slice(0, 19)];
        setCheckInLogs(updated);
        try {
          localStorage.setItem('g1_biometric_logs', JSON.stringify(updated));
          window.dispatchEvent(new Event('g1_biometric_logs_updated'));
        } catch (e) {}

        if (onCheckInSuccess) {
          onCheckInSuccess(newRecord);
        }
      }
    }, 1200);
  };

  return (
    <div className={`bg-white rounded-3xl border border-gray-200 shadow-md p-4 space-y-4 ${className}`}>
      
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0A3A40] to-emerald-700 text-amber-300 flex items-center justify-center font-black shadow-sm">
            {authMode === 'fingerprint' ? <Fingerprint className="w-5 h-5" /> : <Scan className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {t('GOVT BIOMETRIC ENGINE', 'బయోమెట్రిక్ ప్రమాణీకరణ', 'बायोमेट्रिक प्रमाणीकरण')}
              </span>
              <span className="text-[9px] text-emerald-700 font-mono font-bold flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>DPDP 2023</span>
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-gray-950 mt-0.5">
              {t('Biometric Check-In & Restricted Seva Access', 'ఘాట్ చెక్-ఇన్ & సేవా పోర్టల్ బయోమెట్రిక్', 'घाट चेक-इन एवं विशेष सेवा प्रमाणीकरण')}
            </h3>
          </div>
        </div>

        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {t('HARDWARE READY', 'సెన్సార్ సిద్ధంగా ఉంది', 'सक्रिय')}
        </span>
      </div>

      {/* Selector: Check-in Ghat Turnstile VS Restricted Seva Portal */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl">
        <button
          type="button"
          onClick={() => { setPurpose('ghat'); setAuthStatus('idle'); setErrorMessage(null); }}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            purpose === 'ghat'
              ? 'bg-white text-stone-950 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-amber-600" />
          <span>{t('Assigned Ghat Check-In', 'ఘాట్ చెక్-ఇన్', 'घाट चेक-इन')}</span>
        </button>

        <button
          type="button"
          onClick={() => { setPurpose('seva'); setAuthStatus('idle'); setErrorMessage(null); }}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            purpose === 'seva'
              ? 'bg-white text-stone-950 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-purple-600" />
          <span>{t('Restricted Seva Portal', 'ప్రత్యేక సేవా పోర్టల్', 'प्रतिबंधित सेवा पोर्टल')}</span>
        </button>
      </div>

      {/* Target Destination Context Banner */}
      {purpose === 'ghat' ? (
        <div className="bg-[#051c18] text-white p-3 rounded-2xl border border-emerald-800/60 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase font-extrabold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('Target Turnstile Gate', 'లక్ష్య ఘాట్ టర్న్‌స్టైల్', 'लक्षित घाट प्रवेश द्वार')}</span>
            </span>
            <span className="text-[10px] font-mono text-amber-300 bg-[#082923] px-2 py-0.5 rounded border border-[#14473e]">
              TURNSTILE 3A
            </span>
          </div>
          <div className="text-sm font-black text-amber-300">
            {assignedGhat}
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-300 pt-1 border-t border-emerald-900/60">
            <span>Slot: {swayamSlot.split('(')[0]}</span>
            <span className="text-emerald-400 font-bold">Fast-Track Lane Open</span>
          </div>
        </div>
      ) : (
        <div className="bg-purple-950 text-white p-3 rounded-2xl border border-purple-800/60 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-purple-300 uppercase font-extrabold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('Restricted Seva Portal', 'ప్రత్యేక సేవా అనుమతి', 'प्रतिबंधित सेवा')}</span>
            </span>
            <span className="text-[10px] bg-purple-900 text-purple-200 px-2 py-0.5 rounded">
              High Security Pass
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'harathi', label: t('Maha Harathi', 'మహా హారతి', 'महा आरती') },
              { id: 'vratham', label: t('Pushkara Vratham', 'పుష్కర వ్రతం', 'पुष्कर व्रत') },
              { id: 'volunteer', label: t('Seva Mitra Duty', 'సేవా మిత్ర', 'सेवा मित्र') },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSeva(s.id as any)}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-bold text-center border transition cursor-pointer ${
                  selectedSeva === s.id
                    ? 'bg-amber-400 text-stone-950 border-amber-300 shadow'
                    : 'bg-purple-900/60 text-purple-200 border-purple-800/80 hover:bg-purple-800/60'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sensor Selection Toggle: Fingerprint Touch ID vs Face ID Scan */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
          {t('Select Biometric Sensor', 'బయోమెట్రిక్ విధానం ఎంచుకోండి', 'बायोमेट्रिक सेंसर चुनें')}
        </span>
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-xl border border-gray-200 text-xs">
          <button
            type="button"
            onClick={() => { setAuthMode('fingerprint'); setAuthStatus('idle'); setErrorMessage(null); }}
            className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
              authMode === 'fingerprint'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>{t('Touch ID', 'వేలిముద్ర', 'फिंगरप्रिंट')}</span>
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('face'); setAuthStatus('idle'); setErrorMessage(null); }}
            className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
              authMode === 'face'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>{t('Face ID', 'ముఖ గుర్తింపు', 'फेस स्कैन')}</span>
          </button>
        </div>
      </div>

      {/* Visual Scanner Area */}
      <div className="relative bg-gradient-to-b from-stone-950 via-[#0a1f1b] to-stone-950 text-white rounded-3xl p-6 border-2 border-emerald-900/80 shadow-inner flex flex-col items-center justify-center min-h-[220px] overflow-hidden">
        
        {/* Background Radial Grid */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_50%_50%,#10B981_0%,transparent_75%)] pointer-events-none" />

        {authMode === 'fingerprint' ? (
          /* Fingerprint Scanner Display */
          <div className="relative flex flex-col items-center justify-center">
            {/* Outer Pulsing Ring */}
            <div className={`w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              authStatus === 'scanning'
                ? 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)] animate-pulse'
                : authStatus === 'success'
                ? 'border-emerald-400 bg-emerald-950/60 shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                : authStatus === 'failed'
                ? 'border-red-400 bg-red-950/50 shadow-[0_0_25px_rgba(239,68,68,0.5)]'
                : 'border-emerald-600/40 bg-emerald-950/20'
            }`}>
              {/* Inner Fingerprint Icon */}
              <div className="relative">
                <Fingerprint className={`w-14 h-14 transition-colors duration-300 ${
                  authStatus === 'scanning'
                    ? 'text-amber-400 animate-pulse'
                    : authStatus === 'success'
                    ? 'text-emerald-300 scale-105'
                    : authStatus === 'failed'
                    ? 'text-red-400'
                    : 'text-emerald-500/70 hover:text-emerald-400'
                }`} />

                {/* Laser Scanning Beam */}
                {authStatus === 'scanning' && (
                  <div 
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_8px_#f59e0b] animate-bounce"
                    style={{ top: `${scanProgress}%` }}
                  />
                )}
              </div>
            </div>

            <div className="mt-3 text-center">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-300/80 block">
                {authStatus === 'scanning'
                  ? `${t('READING RIDGES...', 'స్కాన్ అవుతోంది...', 'स्कैनिंग...')} (${scanProgress}%)`
                  : authStatus === 'success'
                  ? t('FINGERPRINT MATCHED', 'వేలిముద్ర సరిపోలింది', 'फिंगरप्रिंट प्रमाणित')
                  : authStatus === 'failed'
                  ? t('RETRY SCAN', 'మళ్ళీ ప్రయత్నించండి', 'पुनः प्रयास करें')
                  : t('HOLD FINGER ON SENSOR', 'సెన్సార్‌పై వేలు ఉంచండి', 'सेंसर पर उंगली रखें')}
              </span>
              <span className="text-[11px] text-gray-400 block mt-0.5">
                Capacitive biometric touch sensor • IT Act Sec 43
              </span>
            </div>
          </div>
        ) : (
          /* Face ID Camera 3D Reticle Display */
          <div className="relative flex flex-col items-center justify-center">
            {/* 3D Face Wireframe & Reticle */}
            <div className={`w-32 h-32 rounded-3xl border-2 relative flex items-center justify-center transition-all duration-300 ${
              authStatus === 'scanning'
                ? 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)] animate-pulse'
                : authStatus === 'success'
                ? 'border-emerald-400 bg-emerald-950/60 shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                : authStatus === 'failed'
                ? 'border-red-400 bg-red-950/50 shadow-[0_0_25px_rgba(239,68,68,0.5)]'
                : 'border-emerald-600/40 bg-emerald-950/20'
            }`}>
              {/* Corner Targeting Guides */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400" />

              <Scan className={`w-14 h-14 transition-colors duration-300 ${
                authStatus === 'scanning'
                  ? 'text-amber-400 animate-pulse'
                  : authStatus === 'success'
                  ? 'text-emerald-300 scale-105'
                  : authStatus === 'failed'
                  ? 'text-red-400'
                  : 'text-emerald-500/70 hover:text-emerald-400'
              }`} />

              {/* Laser Scanning Beam */}
              {authStatus === 'scanning' && (
                <div 
                  className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_8px_#f59e0b] animate-bounce"
                  style={{ top: `${scanProgress}%` }}
                />
              )}
            </div>

            <div className="mt-3 text-center">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-300/80 block">
                {authStatus === 'scanning'
                  ? `${t('MEASURING 3D FACIAL MESH...', 'ముఖ గుర్తింపు జరుగుతోంది...', 'फेस मेश स्कैनिंग...')} (${scanProgress}%)`
                  : authStatus === 'success'
                  ? t('FACIAL IDENTITY CONFIRMED', 'ముఖ గుర్తింపు నిర్ధారించబడింది', 'चेहरा प्रमाणित')
                  : authStatus === 'failed'
                  ? t('FACE NOT DETECTED', 'ముఖం గుర్తించలేదు', 'चेहरा नहीं पहचाना गया')
                  : t('LOOK DIRECTLY AT CAMERA', 'కెమెరా వైపు చూడండి', 'कैमरे की ओर देखें')}
              </span>
              <span className="text-[11px] text-gray-400 block mt-0.5">
                Infrared dot projector depth validation
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Error Feedback Message */}
      {errorMessage && (
        <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">{t('Authentication Notice', 'గమనిక', 'सूचना')}</span>
            <span className="text-[11px]">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Success Unlocked Banner */}
      {authStatus === 'success' && activeSuccessRecord && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 text-xs space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-black text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {purpose === 'ghat' 
                  ? t('RIVER TURNSTILE UNLOCKED', 'నదీ టర్న్‌స్టైల్ గేటు తెరవబడింది', 'नदी प्रवेश द्वार खुल गया') 
                  : t('RESTRICTED SEVA VOUCHER ACTIVATED', 'ప్రత్యేక సేవా అనుమతి మంజూరు', 'विशेष सेवा वाउचर सक्रिय')}
              </span>
            </div>
            <span className="bg-emerald-600 text-white font-mono text-[9px] font-black px-2 py-0.5 rounded-full">
              {activeSuccessRecord.authHash}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-gray-500 block uppercase font-bold text-[9px]">Devotee</span>
              <span className="font-extrabold text-gray-900">{devoteeName} ({regId})</span>
            </div>
            <div>
              <span className="text-gray-500 block uppercase font-bold text-[9px]">Check-In Location</span>
              <span className="font-bold text-gray-900 truncate block">{activeSuccessRecord.targetName}</span>
            </div>
          </div>

          <div className="bg-white p-2 rounded-xl border border-emerald-200 flex items-center justify-between text-[10px]">
            <span className="text-gray-600">Gate: <strong>{activeSuccessRecord.gateOrVenue}</strong></span>
            <span className="text-emerald-700 font-mono font-bold">Time: {activeSuccessRecord.timestamp}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          type="button"
          disabled={isScanning}
          onClick={() => handleStartScan(false)}
          className="w-full bg-gradient-to-r from-emerald-600 to-[#0A3A40] hover:from-emerald-500 hover:to-[#0c4952] text-white font-black py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer disabled:opacity-60"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
              <span>{t('Processing Hardware Encryption...', 'ప్రాసెస్ అవుతోంది...', 'सत्यापन जारी है...')}</span>
            </>
          ) : (
            <>
              {authMode === 'fingerprint' ? (
                <Fingerprint className="w-4 h-4 text-amber-300" />
              ) : (
                <Scan className="w-4 h-4 text-amber-300" />
              )}
              <span>
                {purpose === 'ghat'
                  ? t(`Authenticate & Check Into ${assignedGhat.split('(')[0]}`, `${assignedGhat.split('(')[0]} చెక్-ఇన్ చేయండి`, `${assignedGhat.split('(')[0]} चेक-इन करें`)
                  : t('Authenticate Restricted Seva Voucher', 'ప్రత్యేక సేవా అనుమతి తీసుకోండి', 'विशेष सेवा वाउचर प्रमाणित करें')}
              </span>
            </>
          )}
        </button>

        {/* Secondary Simulated Test Retries */}
        <div className="flex items-center justify-between text-[11px] px-1 text-gray-500">
          <button
            type="button"
            disabled={isScanning}
            onClick={() => handleStartScan(true)}
            className="text-amber-800 hover:text-amber-900 font-bold underline cursor-pointer"
          >
            <img src="/assets/icons/triangle-alert.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> {t('Test Sensor Smudge / Retry Simulation', 'లోపం రీట్రై పరీక్షించండి', 'पुनः प्रयास टेस्ट करें')}
          </button>

          <span className="text-gray-400 text-[10px]">
            Secured by Enclave
          </span>
        </div>
      </div>

      {/* Check-In History & Audit Logs */}
      <div className="pt-2 border-t border-gray-100 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-gray-500" />
            <span>{t('Recent Biometric Check-In Logs', 'ఇటీవలి బయోమెట్రిక్ లాగ్‌లు', 'हालिया चेक-इन इतिहास')}</span>
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            {checkInLogs.length} Records
          </span>
        </div>

        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {checkInLogs.map((log) => {
            const isSuccess = log.status === 'AUTHENTICATED';
            return (
              <div
                key={log.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  isSuccess ? 'border-gray-200 bg-gray-50' : 'border-red-200 bg-red-50/50'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                      isSuccess ? 'text-emerald-800 bg-emerald-100' : 'text-red-800 bg-red-100'
                    }`}>
                      {log.method}
                    </span>
                    <span className="font-bold text-gray-900 text-[11px]">
                      {log.targetName}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 block truncate max-w-[220px]">
                    {log.gateOrVenue}
                  </span>
                  {!isSuccess && log.failureReason && (
                    <span className="text-[9px] text-red-600 block italic truncate max-w-[240px]">
                      {log.failureReason}
                    </span>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-gray-700 block font-bold">
                    {log.timestamp}
                  </span>
                  <span className={`text-[9px] font-bold font-mono ${
                    isSuccess ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {isSuccess ? ' VERIFIED' : ' FAILED'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
