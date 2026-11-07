import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  HeartHandshake, 
  UserCheck, 
  Award, 
  Calendar, 
  MapPin, 
  QrCode, 
  Download, 
  CheckCircle2, 
  Search, 
  Clock, 
  ShieldCheck, 
  Users, 
  Coffee, 
  FileCheck,
  Phone,
  Sparkles,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';

interface SevaApplication {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  aadhaarLast4: string;
  cityState: string;
  sevaSector: string;
  assignedCamp: string;
  selectedDates: string[];
  tshirtSize: string;
  bloodGroup: string;
  status: 'APPROVED' | 'PENDING_VERIFICATION';
  registeredAt: string;
  badgeNumber: string;
}

const INITIAL_APPLICATIONS: SevaApplication[] = [
  {
    id: 'SEVA-2027-10492',
    name: 'P. Venkata Satyanarayana',
    age: 26,
    gender: 'Male',
    phone: '9848012345',
    aadhaarLast4: '7482',
    cityState: 'Vijayawada, AP',
    sevaSector: 'Ghat Crowd Safety & Queue Marshaling',
    assignedCamp: 'Sector 2 • Saraswati Ghat Base Camp',
    selectedDates: ['June 26 – July 01 (Phase 1)'],
    tshirtSize: 'L',
    bloodGroup: 'O+',
    status: 'APPROVED',
    registeredAt: '2026-10-28 09:30 AM',
    badgeNumber: 'SM-2027-0492'
  }
];

export const PublicSevaPortal: React.FC = () => {
  const { language, setCurrentInterface } = useApp();
  const [activeTab, setActiveTab] = useState<'register' | 'status' | 'guidelines'>('register');
  
  // Registration Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(24);
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [aadhaarLast4, setAadhaarLast4] = useState('');
  const [cityState, setCityState] = useState('');
  const [sevaSector, setSevaSector] = useState('Ghat Crowd Safety & Queue Marshaling');
  const [selectedPhase, setSelectedPhase] = useState('Full 12 Days (June 26 – July 7, 2027)');
  const [tshirtSize, setTshirtSize] = useState('L');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Stored Applications
  const [applications, setApplications] = useState<SevaApplication[]>(() => {
    try {
      const s = localStorage.getItem('g1_seva_apps');
      return s ? JSON.parse(s) : INITIAL_APPLICATIONS;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  });

  // Created or Searched Application
  const [createdApp, setCreatedApp] = useState<SevaApplication | null>(null);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResult, setSearchResult] = useState<SevaApplication | null | 'NOT_FOUND'>(null);
  const [isBioVerified, setIsBioVerified] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('g1_seva_bio_verified') === 'true';
    } catch {
      return false;
    }
  });

  const t = (en: string, te: string, hi: string) => {
    return language === 'te' ? te : language === 'hi' ? hi : en;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !aadhaarLast4 || !cityState || !termsAccepted) {
      alert('Please fill all mandatory fields and accept volunteer terms.');
      return;
    }

    const randomId = `SEVA-2027-${Math.floor(10000 + Math.random() * 90000)}`;
    const randomBadge = `SM-2027-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Assign camp based on sector
    let assignedCamp = 'Sector 1 • Pushkar Ghat Central Base';
    if (sevaSector.includes('Annadanam')) assignedCamp = 'Sector 4 • Kotilingala Food & Prasadam Hub';
    else if (sevaSector.includes('Wheelchair')) assignedCamp = 'Sector 3 • Markandeya Divyangjan Support Center';
    else if (sevaSector.includes('Medical')) assignedCamp = 'Sector 2 • Saraswati Medical Post';
    else if (sevaSector.includes('Cleanliness')) assignedCamp = 'Sector 5 • Swachh Godavari Operations Unit';

    const newApp: SevaApplication = {
      id: randomId,
      name,
      age,
      gender,
      phone,
      aadhaarLast4,
      cityState,
      sevaSector,
      assignedCamp,
      selectedDates: [selectedPhase],
      tshirtSize,
      bloodGroup,
      status: 'APPROVED',
      registeredAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
      badgeNumber: randomBadge
    };

    const updated = [newApp, ...applications];
    setApplications(updated);
    try {
      localStorage.setItem('g1_seva_apps', JSON.stringify(updated));
    } catch {}

    setCreatedApp(newApp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = applications.find(a => a.phone.includes(searchPhone.trim()) || a.id.toLowerCase() === searchPhone.trim().toLowerCase());
    setSearchResult(found || 'NOT_FOUND');
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-6">
      
      {/* Return to Main Portal Button */}
      <button
        onClick={() => setCurrentInterface('public-portal')}
        className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-white font-bold bg-[#0A2E27] px-3.5 py-2 rounded-xl border border-[#1b554b] cursor-pointer transition shadow hover:bg-[#124239]"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>← Return to Official Festival Portal</span>
      </button>

      {/* Biometric Verification Security Status Banner */}
      {isBioVerified && (
        <div className="bg-gradient-to-r from-emerald-950 via-[#062820] to-[#041d17] border-2 border-emerald-400 p-4 rounded-2xl text-white shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-400 text-stone-950 flex items-center justify-center font-black text-lg shadow">
              <img src="/assets/icons/circle-check.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  BIOMETRIC IDENTITY AUTHENTICATED
                </span>
                <span className="text-[10px] text-gray-300 font-mono">
                  DPDP 2023 ENCLAVE VERIFIED
                </span>
              </div>
              <h4 className="text-xs font-black text-white mt-1">
                {t(
                  'Hardware Biometric Verification Successful • Official Seva Mitra Clearance Granted',
                  'బయోమెట్రిక్ ధృవీకరణ పూర్తయింది • అధికారిక సేవా మిత్ర అనుమతి లభించింది',
                  'बायोमेट्रिक सत्यापन सफल • आधिकारिक सेवा मित्र अनुमति प्राप्त'
                )}
              </h4>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2.5 py-1 rounded-xl border border-emerald-400/40 shrink-0">
            SEC-TOKEN-OK
          </span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#0E3D35] via-[#145348] to-[#0A2E27] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-500/30 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
          <HeartHandshake className="w-80 h-80 text-amber-300" />
        </div>
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-400 text-stone-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GODAVARI PUSHKARALU 2027 • SEVA MITRA REGISTRATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t(
              'Join 25,000+ Seva Mitras in Divine Service for 50M Pilgrims',
              '5 కోట్ల మంది భక్తుల కొరకు పవిత్ర గోదావరి సేవలో భాగస్వాములు కండి',
              '5 करोड़ तीर्थयात्रियों की सेवा हेतु गोदावरी सेवा मित्र बनें'
            )}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            {t(
              'Government of Andhra Pradesh invites devoted citizens, youth, NCC, Red Cross and spiritual organizations to serve as official Godavari Seva Mitras during the 12 sacred days (June 26 – July 7, 2027) in Rajahmundry.',
              'జూన్ 26 నుండి జూలై 7, 2027 వరకు రాజమండ్రిలో జరిగే గోదావరి మహా పుష్కరాలలో స్వచ్ఛంద సేవ అందించడానికి యువత మరియు భక్తులకు ఆహ్వానం.',
              '26 जून से 7 जुलाई 2027 तक राजमहेंद्री में 12 दिवसीय महापर्व पर निःस्वार्थ सेवा हेतु पंजीकरण कराएं।'
            )}
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="bg-emerald-950/70 border border-emerald-400/40 px-3 py-1 rounded-lg">
              <img src="/assets/icons/circle-check.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> Free Food & Accommodation
            </span>
            <span className="bg-emerald-950/70 border border-emerald-400/40 px-3 py-1 rounded-lg">
              <img src="/assets/icons/circle-check.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> Official Govt Certificate
            </span>
            <span className="bg-emerald-950/70 border border-emerald-400/40 px-3 py-1 rounded-lg">
              <img src="/assets/icons/circle-check.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> Volunteer Kit (T-Shirt & Radio Pass)
            </span>
            <span className="bg-emerald-950/70 border border-emerald-400/40 px-3 py-1 rounded-lg">
              <img src="/assets/icons/circle-check.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> 100% Free Insurance Cover
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-[#0A2621] p-1.5 rounded-2xl border border-[#164E44] text-xs font-bold text-center">
        <button
          onClick={() => setActiveTab('register')}
          className={`py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'register' ? 'bg-amber-500 text-stone-950 font-black shadow' : 'text-gray-300 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{t('Register for Seva', 'సేవ నమోదు', 'नया पंजीकरण')}</span>
        </button>
        <button
          onClick={() => setActiveTab('status')}
          className={`py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'status' ? 'bg-amber-500 text-stone-950 font-black shadow' : 'text-gray-300 hover:text-white'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>{t('Check Seva Status / Pass', 'సేవ పాస్ పరిశీలన', 'आवेदन स्थिति / पास')}</span>
        </button>
        <button
          onClick={() => setActiveTab('guidelines')}
          className={`py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'guidelines' ? 'bg-amber-500 text-stone-950 font-black shadow' : 'text-gray-300 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{t('Perks & Guidelines', 'నిబంధనలు & ప్రయోజనాలు', 'दिशानिर्देश एवं लाभ')}</span>
        </button>
      </div>

      {/* TAB 1: REGISTRATION FORM OR DIGITAL PASS */}
      {activeTab === 'register' && (
        <div>
          {createdApp ? (
            /* Digital Seva Mitra Pass */
            <div className="bg-white text-stone-950 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-500 space-y-6">
              <div className="text-center space-y-2 border-b border-gray-200 pb-4">
                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full uppercase">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>SEVA MITRA APPLICATION APPROVED • OFFICIAL E-PASS</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                  Godavari Pushkaralu 2027 • Official Seva Mitra Pass
                </h3>
                <p className="text-xs text-gray-500">
                  Government of Andhra Pradesh • Youth Services & Endowments Department
                </p>
              </div>

              {/* ID Card Layout */}
              <div className="bg-gradient-to-r from-amber-50 to-emerald-50 rounded-2xl p-5 border border-amber-300/80 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-500 font-mono">PASS ID: <strong className="text-gray-900">{createdApp.id}</strong></span>
                    <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded font-mono">
                      BADGE: {createdApp.badgeNumber}
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-gray-950">{createdApp.name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase font-bold">Duty Sector:</span>
                      <strong className="text-emerald-900">{createdApp.sevaSector}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase font-bold">Base Camp:</span>
                      <strong className="text-emerald-900">{createdApp.assignedCamp}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase font-bold">Selected Dates:</span>
                      <span className="text-gray-800 font-semibold">{createdApp.selectedDates.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase font-bold">T-Shirt & Blood Group:</span>
                      <span className="text-gray-800 font-semibold">Size {createdApp.tshirtSize} • {createdApp.bloodGroup}</span>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-2 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(
                      `G1-SEVA-PASS|${createdApp.id}|${createdApp.name}|${createdApp.badgeNumber}|${createdApp.assignedCamp}`
                    )}`}
                    alt="Seva Pass QR Code"
                    className="w-24 h-24"
                  />
                  <span className="text-[10px] font-mono font-bold text-gray-500">Scan at Sector Gate</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-1 text-gray-600 border border-gray-200">
                <strong className="text-gray-900 block font-bold">Reporting Instructions:</strong>
                <p>1. Please report to your assigned base camp on June 25, 2027 by 10:00 AM for kit collection (T-Shirt, Radio Badge, Official Cap).</p>
                <p>2. Keep a government photo ID (Aadhaar / Voter ID) handy for physical verification at camp reception.</p>
                <p>3. Accommodation and meals will be provided at the adjacent Pushkar Nagar volunteer dormitories.</p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download / Print Digital Seva Pass</span>
                </button>
                <button
                  onClick={() => setCreatedApp(null)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer transition"
                >
                  Register Another Volunteer
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegister} className="bg-[#0A2621] border border-[#164E44] rounded-3xl p-5 sm:p-8 space-y-5 text-xs text-gray-200 shadow-xl">
              <div className="border-b border-[#164E44] pb-3">
                <h3 className="text-base font-extrabold text-white">
                  {t('Volunteer Application Form', 'సేవా మిత్ర దరఖాస్తు పత్రం', 'स्वयंसेवक पंजीकरण फॉर्म')}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Fields marked with * are required for security clearance and identity card generation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">
                    Full Name (as per Aadhaar / ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. K. Ravi Teja"
                    className="w-full bg-[#051715] border border-[#164E44] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">
                    Mobile Number (for SMS & Duty Pass) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 9848012345"
                    maxLength={10}
                    className="w-full bg-[#051715] border border-[#164E44] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-300 font-bold mb-1">Age (18–65) *</label>
                    <input
                      type="number"
                      min={18}
                      max={65}
                      required
                      value={age}
                      onChange={e => setAge(Number(e.target.value))}
                      className="w-full bg-[#051715] border border-[#164E44] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-bold mb-1">Gender *</label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      className="w-full bg-[#051715] border border-[#164E44] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">
                    Aadhaar / Voter ID (Last 4 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    value={aadhaarLast4}
                    onChange={e => setAadhaarLast4(e.target.value)}
                    placeholder="e.g. 8492"
                    maxLength={4}
                    className="w-full bg-[#051715] border border-[#164E44] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">
                    Native City & State *
                  </label>
                  <input
                    type="text"
                    required
                    value={cityState}
                    onChange={e => setCityState(e.target.value)}
                    placeholder="e.g. Rajahmundry, Andhra Pradesh"
                    className="w-full bg-[#051715] border border-[#164E44] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">
                    Preferred Seva Duty Sector *
                  </label>
                  <select
                    value={sevaSector}
                    onChange={e => setSevaSector(e.target.value)}
                    className="w-full bg-[#051715] border border-[#164E44] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Ghat Crowd Safety & Queue Marshaling"> Ghat Crowd Safety & Queue Marshaling</option>
                    <option value="Annadanam & Maha Prasadam Distribution"> Annadanam & Maha Prasadam Distribution</option>
                    <option value="Divyangjan & Senior Citizen Wheelchair Assistance"> Divyangjan & Senior Citizen Wheelchair Assistance</option>
                    <option value="Medical First Aid & ORS Hydration Booths"> Medical First Aid & ORS Hydration Booths</option>
                    <option value="Lost Child & Elderly Reunification Helpdesk"> Lost Child & Elderly Reunification Helpdesk</option>
                    <option value="Swachh Godavari Cleanliness & River Ecology"> Swachh Godavari Cleanliness & River Ecology</option>
                    <option value="Multilingual Pilgrim Guide & Information"> Multilingual Pilgrim Guide & Information</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">
                    Available Dates (June 26 – July 7, 2027) *
                  </label>
                  <select
                    value={selectedPhase}
                    onChange={e => setSelectedPhase(e.target.value)}
                    className="w-full bg-[#051715] border border-[#164E44] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Full 12 Days (June 26 – July 7, 2027)">Full 12 Days (June 26 – July 7, 2027) • Recommended</option>
                    <option value="Phase 1 (June 26 – June 29) • Inaugural Days">Phase 1 (June 26 – June 29) • Inaugural Days</option>
                    <option value="Phase 2 (June 30 – July 3) • Mid Festival">Phase 2 (June 30 – July 3) • Mid Festival</option>
                    <option value="Phase 3 (July 4 – July 7) • Maha Finale">Phase 3 (July 4 – July 7) • Maha Finale</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-300 font-bold mb-1">Free T-Shirt Size</label>
                    <select
                      value={tshirtSize}
                      onChange={e => setTshirtSize(e.target.value)}
                      className="w-full bg-[#051715] border border-[#164E44] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="M">M (Medium)</option>
                      <option value="L">L (Large)</option>
                      <option value="XL">XL (Extra Large)</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 font-bold mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={e => setBloodGroup(e.target.value)}
                      className="w-full bg-[#051715] border border-[#164E44] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Code of Conduct Agreement */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 accent-amber-400 w-4 h-4 rounded"
                  />
                  <span className="text-gray-300 text-[11px] leading-relaxed">
                    I pledge to serve all devotees with humility, non-violence, and spiritual dedication. I agree to abide by the Pushkaralu Organizing Committee guidelines and wear the official volunteer uniform while on duty.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98"
              >
                <HeartHandshake className="w-5 h-5" />
                <span>Submit Application & Generate Digital Seva Pass</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: CHECK APPLICATION STATUS */}
      {activeTab === 'status' && (
        <div className="bg-[#0A2621] border border-[#164E44] rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-white">
              {t('Search Existing Seva Registration', 'సేవా దరఖాస్తు స్థితి పరిశీలన', 'आवेदन स्थिति खोजें')}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Enter your registered 10-digit mobile number or Seva ID to view and download your pass.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
            <input
              type="text"
              required
              value={searchPhone}
              onChange={e => setSearchPhone(e.target.value)}
              placeholder="Enter Mobile No or SEVA-2027-XXXXX"
              className="flex-1 bg-[#051715] border border-[#164E44] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>

          {searchResult === 'NOT_FOUND' && (
            <div className="bg-red-950/60 border border-red-500/50 p-4 rounded-xl text-xs text-red-200">
              No registration found matching the entered query. Please check the mobile number or submit a new application.
            </div>
          )}

          {searchResult && searchResult !== 'NOT_FOUND' && (
            <div className="bg-white text-stone-950 rounded-2xl p-5 border-2 border-emerald-500 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <span className="text-[10px] text-gray-500 font-mono uppercase">ID: {searchResult.id}</span>
                  <h4 className="text-base font-black text-gray-900">{searchResult.name}</h4>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                  <img src="/assets/icons/circle-check.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> {searchResult.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500 text-[10px] block font-bold">Duty Sector:</span>
                  <strong className="text-emerald-900">{searchResult.sevaSector}</strong>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block font-bold">Base Camp:</span>
                  <strong className="text-emerald-900">{searchResult.assignedCamp}</strong>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block font-bold">Registered Mobile:</span>
                  <span className="font-mono text-gray-700">{searchResult.phone}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block font-bold">T-Shirt Size:</span>
                  <span className="text-gray-700">{searchResult.tshirtSize}</span>
                </div>
              </div>
              <button
                onClick={() => setCreatedApp(searchResult)}
                className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-2 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow"
              >
                <Download className="w-4 h-4" />
                <span>View & Print Official Seva Pass</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GUIDELINES & PERKS */}
      {activeTab === 'guidelines' && (
        <div className="bg-[#0A2621] border border-[#164E44] rounded-3xl p-6 sm:p-8 space-y-6 text-xs text-gray-300">
          <div>
            <h3 className="text-base font-extrabold text-white">
              {t('Volunteer Entitlements & Recognition', 'సేవా మిత్రుల సౌకర్యాలు & గుర్తింపు', 'सुविधाएं एवं सम्मान')}
            </h3>
            <p className="text-gray-400 text-[11px] mt-0.5">
              Every registered volunteer is considered a state guest and guardian of the pilgrimage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#051715] p-4 rounded-2xl border border-[#164E44] space-y-2">
              <Award className="w-6 h-6 text-amber-400" />
              <h4 className="font-bold text-white text-sm">State Certificate of Honor</h4>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Signed by the Hon'ble Chief Minister, Endowments Minister, and District Collector for exemplary public service during Godavari Pushkaralu 2027.
              </p>
            </div>

            <div className="bg-[#051715] p-4 rounded-2xl border border-[#164E44] space-y-2">
              <Coffee className="w-6 h-6 text-emerald-400" />
              <h4 className="font-bold text-white text-sm">Free Accommodation & Prasadam</h4>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Dedicated clean dormitory tents in Pushkar Nagar sector camps with 3 healthy vegetarian meals, tea, and RO mineral water daily.
              </p>
            </div>

            <div className="bg-[#051715] p-4 rounded-2xl border border-[#164E44] space-y-2">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
              <h4 className="font-bold text-white text-sm">₹5,00,000 Medical Insurance Cover</h4>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Every verified volunteer is enrolled into a comprehensive government group health and accident insurance during the 12-day festival.
              </p>
            </div>

            <div className="bg-[#051715] p-4 rounded-2xl border border-[#164E44] space-y-2">
              <Users className="w-6 h-6 text-purple-400" />
              <h4 className="font-bold text-white text-sm">Special Darshan Pass</h4>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Privilege pass for Kotilingeswara Swamy & Markandeya Swamy temple darshan upon completion of allocated seva shifts.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
