import React, { useState, useEffect } from 'react';
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  Fingerprint, 
  Scan, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BiometricCheckInRecord } from './BiometricVerification';

interface BiometricVerificationHistoryProps {
  language: 'en' | 'te' | 'hi';
  onTriggerScan?: () => void;
  className?: string;
}

export const INITIAL_BIOMETRIC_AUDIT_LOGS: BiometricCheckInRecord[] = [
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
    failureReason: 'Face boundary tilted > 25° during high crowd transit motion. Sensor auto-aborted.',
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
  },
  {
    id: 'BIO-LOG-204',
    type: 'SEVA_PORTAL',
    targetName: 'Godavari Maha Harathi Inner Sanctum',
    gateOrVenue: 'VIP Sanctum Entry Gate V-2',
    timestamp: 'Yesterday, 06:15 PM',
    method: 'FACE_ID',
    status: 'AUTHENTICATED',
    authHash: 'SEC-ENC-33F8-AP2027',
    coordinates: '16.9945° N, 81.7760° E',
    deviceEnclave: 'AP-SE-ENCLAVE-v4'
  },
  {
    id: 'BIO-LOG-205',
    type: 'GHAT_CHECKIN',
    targetName: 'Saraswati Ghat (Elders & Families)',
    gateOrVenue: 'Gate 4 - Senior Citizen Wheelchair Ramp',
    timestamp: 'Yesterday, 04:30 PM',
    method: 'FINGERPRINT',
    status: 'FAILED',
    authHash: 'ERR-CAPACITIVE-SMUDGE-WET',
    failureReason: 'Capacitive surface moisture / wet finger contact detected. Please wipe sensor.',
    coordinates: '16.9915° N, 81.7798° E',
    deviceEnclave: 'AP-SE-ENCLAVE-v4'
  },
  {
    id: 'BIO-LOG-206',
    type: 'GHAT_CHECKIN',
    targetName: 'Saraswati Ghat (Elders & Families)',
    gateOrVenue: 'Gate 4 - Senior Citizen Wheelchair Ramp',
    timestamp: 'Yesterday, 04:32 PM',
    method: 'FINGERPRINT',
    status: 'AUTHENTICATED',
    authHash: 'SEC-ENC-52D1-AP2027',
    coordinates: '16.9915° N, 81.7798° E',
    deviceEnclave: 'AP-SE-ENCLAVE-v4'
  }
];

export const BiometricVerificationHistory: React.FC<BiometricVerificationHistoryProps> = ({
  language,
  onTriggerScan,
  className = '',
}) => {
  const [logs, setLogs] = useState<BiometricCheckInRecord[]>(() => {
    try {
      const saved = localStorage.getItem('g1_biometric_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_BIOMETRIC_AUDIT_LOGS;
  });

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'AUTHENTICATED' | 'FAILED'>('ALL');
  const [searchGhat, setSearchGhat] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const t = (en: string, te: string, hi: string) => {
    return language === 'te' ? te : language === 'hi' ? hi : en;
  };

  // Sync with localStorage on custom events
  useEffect(() => {
    const handleStorageUpdate = () => {
      try {
        const saved = localStorage.getItem('g1_biometric_logs');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setLogs(parsed);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('g1_biometric_logs_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('g1_biometric_logs_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const totalAttempts = logs.length;
  const successAttempts = logs.filter((l) => l.status === 'AUTHENTICATED').length;
  const failedAttempts = logs.filter((l) => l.status === 'FAILED').length;
  const successRate = totalAttempts > 0 ? Math.round((successAttempts / totalAttempts) * 100) : 100;

  const filteredLogs = logs.filter((log) => {
    if (filterStatus !== 'ALL' && log.status !== filterStatus) return false;
    if (searchGhat.trim()) {
      const q = searchGhat.toLowerCase();
      const matchTarget = log.targetName.toLowerCase().includes(q);
      const matchVenue = log.gateOrVenue.toLowerCase().includes(q);
      const matchMethod = log.method.toLowerCase().includes(q);
      return matchTarget || matchVenue || matchMethod;
    }
    return true;
  });

  const handleClearHistory = () => {
    if (confirm(t('Reset biometric audit history to default records?', 'బయోమెట్రిక్ హిస్టరీ రీసెట్ చేయాలా?', 'बायोमेट्रिक इतिहास रीसेट करें?'))) {
      setLogs(INITIAL_BIOMETRIC_AUDIT_LOGS);
      try {
        localStorage.setItem('g1_biometric_logs', JSON.stringify(INITIAL_BIOMETRIC_AUDIT_LOGS));
        window.dispatchEvent(new Event('g1_biometric_logs_updated'));
      } catch (e) {}
    }
  };

  const handleExportCsv = () => {
    const headers = ['Record ID', 'Timestamp', 'Status', 'Ghat Location', 'Gate / Venue', 'Method', 'Security Hash', 'Failure Reason'];
    const rows = logs.map(l => [
      l.id,
      `"${l.timestamp}"`,
      l.status,
      `"${l.targetName}"`,
      `"${l.gateOrVenue}"`,
      l.method,
      l.authHash,
      `"${l.failureReason || 'N/A'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Godavari_Biometric_Audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`bg-white rounded-3xl border border-gray-200 shadow-md p-4 sm:p-5 space-y-4 ${className}`}>
      
      {/* Header with Title and Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#06201b] to-emerald-800 text-amber-300 flex items-center justify-center font-black shadow-sm">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {t('GOVT AUDIT LOG', 'ప్రభుత్వ ఆడిట్ రికార్డు', 'सरकारी ऑडिट रिकॉर्ड')}
              </span>
              <span className="text-[9px] text-emerald-700 font-mono font-bold flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>HARDWARE ENCLAVE VERIFIED</span>
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-gray-950 mt-0.5">
              {t('Biometric Verification History', 'బయోమెట్రిక్ ప్రమాణీకరణ చరిత్ర', 'बायोमेट्रिक सत्यापन इतिहास')}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {onTriggerScan && (
            <button
              onClick={onTriggerScan}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Fingerprint className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('New Scan', 'కొత్త స్కాన్', 'नया स्कैन')}</span>
            </button>
          )}
          <button
            onClick={handleExportCsv}
            title="Download CSV Audit Trail"
            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-gray-50 border border-gray-200 p-2 rounded-2xl">
          <span className="text-[9px] font-bold text-gray-500 uppercase block">
            {t('Total Scans', 'మొత్తం స్కాన్లు', 'कुल स्कैन')}
          </span>
          <span className="text-base font-black text-gray-950">
            {totalAttempts}
          </span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-2xl">
          <span className="text-[9px] font-bold text-emerald-800 uppercase block">
            {t('Verified', 'ధృవీకరించబడింది', 'सफल')}
          </span>
          <span className="text-base font-black text-emerald-700 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{successAttempts}</span>
          </span>
        </div>

        <div className="bg-red-50 border border-red-200 p-2 rounded-2xl">
          <span className="text-[9px] font-bold text-red-800 uppercase block">
            {t('Failed', 'విఫలమైనవి', 'असफल')}
          </span>
          <span className="text-base font-black text-red-600 flex items-center justify-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-red-500" />
            <span>{failedAttempts}</span>
          </span>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-2 rounded-2xl">
          <span className="text-[9px] font-bold text-amber-800 uppercase block">
            {t('Pass Rate', 'విజయ శాతం', 'सफलता दर')}
          </span>
          <span className="text-base font-black text-amber-700">
            {successRate}%
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-2.5 py-1 rounded-xl font-bold transition cursor-pointer ${
              filterStatus === 'ALL' ? 'bg-white text-stone-950 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('All', 'అన్నీ', 'सभी')} ({totalAttempts})
          </button>
          <button
            onClick={() => setFilterStatus('AUTHENTICATED')}
            className={`px-2.5 py-1 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
              filterStatus === 'AUTHENTICATED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-800 hover:text-emerald-950'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>{t('Success', 'విజయం', 'सफल')} ({successAttempts})</span>
          </button>
          <button
            onClick={() => setFilterStatus('FAILED')}
            className={`px-2.5 py-1 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
              filterStatus === 'FAILED' ? 'bg-red-600 text-white shadow-xs' : 'text-red-700 hover:text-red-950'
            }`}
          >
            <XCircle className="w-3 h-3" />
            <span>{t('Failed', 'విఫలమైనవి', 'असफल')} ({failedAttempts})</span>
          </button>
        </div>

        {/* Ghat Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchGhat}
            onChange={(e) => setSearchGhat(e.target.value)}
            placeholder={t('Search by ghat or gate...', 'ఘాట్ లేదా గేట్ పేరుతో వెతకండి...', 'घाट या द्वार खोजें...')}
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Verification Logs List */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-2xl space-y-1">
            <ShieldCheck className="w-8 h-8 mx-auto text-gray-400" />
            <p className="text-xs text-gray-500 font-bold">
              {t('No biometric verification records match this filter.', 'ఈ ఫిల్టర్‌లో బయోమెట్రిక్ రికార్డులు లేవు.', 'कोई सत्यापन रिकॉर्ड नहीं मिला।')}
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isSuccess = log.status === 'AUTHENTICATED';
            const isExpanded = expandedLogId === log.id;

            return (
              <div
                key={log.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isSuccess
                    ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70'
                    : 'border-red-200 bg-red-50/40 hover:bg-red-50/70'
                }`}
              >
                {/* Main Card Header */}
                <div 
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="p-3 flex items-start justify-between gap-2 cursor-pointer"
                >
                  <div className="flex items-start gap-2.5">
                    {/* Method Icon with Status Ring */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                      isSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}>
                      {log.method === 'FINGERPRINT' ? (
                        <Fingerprint className="w-5 h-5" />
                      ) : (
                        <Scan className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isSuccess
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {isSuccess ? t(' AUTHENTICATED', ' విజయవంతం', ' सफल') : t(' FAILED / RETRY', ' విఫలమైంది / రీట్రై', ' विफल')}
                        </span>

                        <span className="text-[10px] font-mono text-gray-500">
                          {log.method === 'FINGERPRINT' ? 'Touch ID' : 'Face ID'}
                        </span>

                        <span className="text-[9px] font-mono font-bold text-gray-400">
                          {log.id}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-black text-gray-950 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{log.targetName}</span>
                      </h4>

                      <span className="text-[11px] text-gray-600 block">
                        {log.gateOrVenue}
                      </span>
                    </div>
                  </div>

                  {/* Timestamp & Expand Indicator */}
                  <div className="text-right shrink-0 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-gray-700 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{log.timestamp}</span>
                    </span>

                    <button
                      className="text-gray-400 hover:text-gray-700 p-0.5 rounded"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-gray-200/60 bg-white/70 text-xs space-y-2 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-gray-50 p-2 rounded-xl border border-gray-200">
                        <span className="text-[9px] font-bold text-gray-500 uppercase block">
                          {t('Security Auth Hash / Digest', 'సెక్యూరిటీ హ్యాష్', 'सुरक्षा हैश डाइजेस्ट')}
                        </span>
                        <span className="font-mono font-bold text-gray-800 break-all text-[10px]">
                          {log.authHash}
                        </span>
                      </div>

                      <div className="bg-gray-50 p-2 rounded-xl border border-gray-200">
                        <span className="text-[9px] font-bold text-gray-500 uppercase block">
                          {t('Enclave & GPS Coordinates', 'ఎన్‌క్లేవ్ & జీపీఎస్ కోఆర్డినేట్స్', 'स्थान एवं एन्क्लेव')}
                        </span>
                        <span className="font-mono text-gray-700 text-[10px]">
                          {log.coordinates || '16.9942° N, 81.7766° E'} • {log.deviceEnclave || 'AP-SE-ENCLAVE-v4'}
                        </span>
                      </div>
                    </div>

                    {/* Detailed Failure Reason if Failed */}
                    {!isSuccess && log.failureReason && (
                      <div className="bg-red-50 p-2.5 rounded-xl border border-red-300 text-red-900 text-xs space-y-1">
                        <span className="font-bold flex items-center gap-1 text-[11px] text-red-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          <span>{t('Failure Diagnostic Notice:', 'వైఫల్య కారణం:', 'विफलता का कारण:')}</span>
                        </span>
                        <p className="text-[11px] leading-relaxed">
                          {log.failureReason}
                        </p>
                      </div>
                    )}

                    {/* Verified Pass Indicator */}
                    {isSuccess && (
                      <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-300 text-emerald-900 text-[11px] flex items-center justify-between">
                        <span>Turnstile clearance granted for designated sacred snanam corridor.</span>
                        <span className="font-mono font-black text-emerald-700 text-[10px]">SECTOR VALIDATED</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Audit Declaration */}
      <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-gray-500">
        <span>
          {t('Encrypted on-device audit logs under Digital Personal Data Protection Act 2023.', 'డిజిటల్ వ్యక్తిగత సమాచార రక్షణ చట్టం 2023 కింద భద్రపరచబడిన ఆడిట్ రికార్డులు.', 'डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम 2023 के अंतर्गत सुरक्षित।')}
        </span>
        <button
          onClick={handleClearHistory}
          className="text-gray-400 hover:text-red-600 underline cursor-pointer"
        >
          {t('Reset Audit Logs', 'లాగ్‌లను రీసెట్ చేయండి', 'लॉग रीसेट करें')}
        </button>
      </div>

    </div>
  );
};
