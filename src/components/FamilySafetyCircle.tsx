import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  MapPin, 
  AlertTriangle, 
  Battery, 
  Compass, 
  Volume2, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Navigation, 
  Radio, 
  CheckCircle2, 
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { audioEngine } from '../utils/audioAlarm';

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  phone: string;
  distanceMeters: number;
  batteryPct: number;
  status: 'SAFE' | 'WARNING_SEPARATED' | 'CRITICAL';
  lastPing: string;
}

const INITIAL_FAMILY: FamilyMember[] = [
  {
    id: 'fam-1',
    name: 'Suryanarayana (Grandfather)',
    relation: 'Elderly (Age 74)',
    phone: '+91 98480 23456',
    distanceMeters: 38,
    batteryPct: 68,
    status: 'SAFE',
    lastPing: '10s ago',
  },
  {
    id: 'fam-2',
    name: 'Lakshmi (Spouse)',
    relation: 'Adult',
    phone: '+91 98480 34567',
    distanceMeters: 12,
    batteryPct: 92,
    status: 'SAFE',
    lastPing: 'Just now',
  },
  {
    id: 'fam-3',
    name: 'Sai Teja (Child)',
    relation: 'Child (Age 8)',
    phone: 'Wristband Beacon G1-92',
    distanceMeters: 24,
    batteryPct: 85,
    status: 'SAFE',
    lastPing: 'Just now',
  },
];

export const FamilySafetyCircle: React.FC = () => {
  const { language } = useApp();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(INITIAL_FAMILY);
  const [maxDistanceThreshold, setMaxDistanceThreshold] = useState<number>(50); // meters
  const [summonAlertActive, setSummonAlertActive] = useState<boolean>(false);
  const [designatedMeetupPoint, setDesignatedMeetupPoint] = useState<string>('Pushkar Ghat Main Clock Tower (Landmark 01)');

  // New member form
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newRelation, setNewRelation] = useState<string>('Adult');
  const [newPhone, setNewPhone] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [checkIns, setCheckIns] = useState<Record<string, string>>({});
  const [ownLocation, setOwnLocation] = useState<{lat: number; lng: number; accuracy: number; time: string} | null>(null);
  const [locating, setLocating] = useState(false);
  const alive = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    alive.current = true;
    try {
      const raw = localStorage.getItem('godavari-family-v2');
      if (raw) {
        const data = JSON.parse(raw);
        if (!Array.isArray(data.members) || !data.members.every((m: FamilyMember) => typeof m.id === 'string' && typeof m.name === 'string' && typeof m.phone === 'string' && typeof m.relation === 'string' && Number.isFinite(m.distanceMeters)) || typeof data.meetup !== 'string' || !Number.isFinite(data.radius) || data.radius < 25 || data.radius > 150) throw new Error('Invalid saved data');
        setFamilyMembers(data.members); setDesignatedMeetupPoint(data.meetup); setMaxDistanceThreshold(data.radius); setCheckIns(data.checkIns || {});
      }
      setLoaded(true);
    } catch { setNotice('Saved family data could not be read. It has not been overwritten.'); }
    return () => { alive.current = false; if(timer.current) clearTimeout(timer.current); audioEngine.stopSiren(); };
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem('godavari-family-v2', JSON.stringify({ members: familyMembers, radius: maxDistanceThreshold, meetup: designatedMeetupPoint, checkIns })); }
    catch { setNotice('Changes could not be saved. Browser storage may be full or disabled.'); }
  }, [loaded, familyMembers, maxDistanceThreshold, designatedMeetupPoint, checkIns]);
  const locate = () => {
    if (!navigator.geolocation) { setNotice('Location is unavailable in this browser.'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(p => {
      if(!alive.current) return;
      setOwnLocation({lat:p.coords.latitude,lng:p.coords.longitude,accuracy:p.coords.accuracy,time:new Date(p.timestamp).toLocaleTimeString()});setLocating(false);setNotice('Your location is shown only on this device. Use Copy to share it yourself.');
    }, e => { if(alive.current) {setLocating(false);setNotice(e.code===1?'Location permission denied. You can still use the meetup plan.':'Could not obtain location. Try again outdoors.');} }, {enableHighAccuracy:true,timeout:15000,maximumAge:0});
  };
  const copyMeetup = async () => {
    const message = `Family meetup: ${designatedMeetupPoint}${ownLocation ? `\nMy location (${ownLocation.time}, accuracy ±${Math.round(ownLocation.accuracy)}m): https://www.google.com/maps?q=${ownLocation.lat},${ownLocation.lng}` : ''}`;
    try { await navigator.clipboard.writeText(message); setNotice('Meetup message copied. Paste it into your family chat to share.'); }
    catch { setNotice('Copy unavailable. Your meetup point is displayed below; share it manually.'); }
  };

  const separatedCount = familyMembers.filter(m => m.distanceMeters > maxDistanceThreshold).length;

  // Trigger audio alert when family member separates
  const handleSimulateSeparation = () => {
    setFamilyMembers(prev =>
      prev.map(m =>
        m.id === 'fam-1'
          ? {
              ...m,
              distanceMeters: 125,
              status: 'WARNING_SEPARATED',
              lastPing: '2s ago (High Crowd Zone)',
            }
          : m
      )
    );
    // Play alert beep
    audioEngine.startSiren();
    if(timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      audioEngine.stopSiren();
    }, 1500);
  };

  const handleResetPositions = () => {
    setFamilyMembers(prev => prev.map(m => { const original = INITIAL_FAMILY.find(i => i.id === m.id); return original ? {...m, distanceMeters: original.distanceMeters, status: 'SAFE', lastPing: 'Demo sample'} : m; }));
    audioEngine.stopSiren();
  };

  const handleSummonFamily = () => {
    setSummonAlertActive(true);
    // Play pleasant attention chime
    audioEngine.playWhistleBurst();
    setNotice('Meetup chime played on this device only. Copy the meetup message to notify your family.');
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newMember: FamilyMember = {
      id: editingId || crypto.randomUUID(),
      name: newName.trim(),
      relation: newRelation,
      phone: newPhone.trim() || 'Not specified',
      distanceMeters: -1,
      batteryPct: -1,
      status: 'SAFE',
      lastPing: 'Not connected',
    };

    setFamilyMembers(prev => editingId ? prev.map(m => m.id === editingId ? {...m, name:newMember.name,relation:newMember.relation,phone:newMember.phone} : m) : [...prev, newMember]);
    setEditingId(null);
    setNewName('');
    setNewPhone('');
    setShowAddForm(false);
  };

  const handleRemoveMember = (id: string) => {
    setFamilyMembers(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-4 min-w-0 text-white">
      {/* Top Banner */}
      <div className="bg-[#0b2924] border border-[#14473f] rounded-xl p-4 sm:p-5 shadow-xl flex flex-col justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="bg-amber-500 text-gray-950 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded tracking-wider">
              Family Geo-Safety Radar
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Local family planner · Demo radar
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Family Safety Radar
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-xl">
            Keep contacts, check-ins and your meetup plan together. Radar distances below are sample readings, not live family tracking.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleSummonFamily}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition shadow cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Play Meetup Chime</span>
          </button>
          <button
            onClick={handleSimulateSeparation}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-gray-950 font-bold text-xs rounded-lg transition shadow cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Test Separation Alert</span>
          </button>
          {separatedCount > 0 && (
            <button
              onClick={handleResetPositions}
              className="px-2.5 py-2 bg-[#123e37] hover:bg-[#185047] text-gray-300 font-medium text-xs rounded-lg transition cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[['Members', familyMembers.length], ['Sample alerts', separatedCount], ['Checked in', Object.keys(checkIns).filter(id => familyMembers.some(m => m.id === id)).length]].map(([label,value]) => <div key={label} className="rounded-2xl bg-[#0b2924] border border-emerald-900 p-3"><p className="text-xl font-bold text-amber-300">{value}</p><p className="text-[10px] text-emerald-200 mt-1">{label}</p></div>)}
      </div>
      {notice && <div role="status" className="rounded-xl bg-blue-950 p-3 text-xs text-blue-100">{notice}</div>}
      <div className="rounded-2xl bg-[#08231f] border border-emerald-900 p-4 space-y-3">
        <div className="flex items-center gap-2"><MapPin size={18} className="text-amber-300"/><h3 className="font-bold text-sm">Your meetup plan</h3></div>
        <label className="block text-xs text-emerald-200">Custom landmark or meeting instructions
          <input aria-label="Custom meetup instructions" maxLength={200} value={designatedMeetupPoint} onChange={e=>setDesignatedMeetupPoint(e.target.value)} className="block w-full min-w-0 mt-2 rounded-xl bg-[#051a17] border border-emerald-800 p-3 text-white"/>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={locate} disabled={locating} className="rounded-xl bg-emerald-800 p-3 text-xs font-bold disabled:opacity-50">{locating?'Locating…':'Get my GPS location'}</button>
          <button onClick={copyMeetup} className="rounded-xl bg-amber-400 text-black p-3 text-xs font-bold">Copy meetup message</button>
        </div>
        {ownLocation && <div className="text-xs text-emerald-200 space-y-2"><p>Your position: {ownLocation.lat.toFixed(5)}, {ownLocation.lng.toFixed(5)} · ±{Math.round(ownLocation.accuracy)}m · {ownLocation.time}</p><div className="flex flex-wrap gap-4"><a target="_blank" rel="noreferrer" className="underline text-amber-300" href={`https://www.google.com/maps?q=${ownLocation.lat},${ownLocation.lng}`}>View my position on map</a><button className="underline" onClick={()=>setOwnLocation(null)}>Clear my location</button></div></div>}
        <p className="text-[11px] text-emerald-300">GPS is requested only when you tap. Your position is not saved or sent to family automatically.</p>
      </div>

      {/* Summon Alert Banner */}
      {summonAlertActive && (
        <div className="bg-emerald-950 border border-emerald-500 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-200 animate-pulse">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-ping" />
            <span>
              <strong>MEETUP REMINDER:</strong> Meet at {designatedMeetupPoint}. This chime plays on your device only.
            </span>
          </div>
          <span className="text-[10px] bg-emerald-900 px-2 py-0.5 rounded font-mono font-bold">
            LOCAL CHIME
          </span>
        </div>
      )}

      {/* Warning Alert if anyone is separated */}
      {separatedCount > 0 && (
        <div className="bg-red-950/90 border border-red-500 rounded-xl p-3 flex items-center justify-between text-xs text-red-200 shadow-xl">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
            <span>
              <strong>DEMO PROXIMITY WARNING:</strong> {separatedCount} sample reading(s) exceed the {maxDistanceThreshold}m boundary! This test does not locate or notify family members.
            </span>
          </div>
          <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded uppercase">
            BREACH DETECTED
          </span>
        </div>
      )}

      {/* Threshold Slider & Designated Meetup Point */}
      <div className="bg-[#08231f] border border-[#13443c] rounded-xl p-3.5 flex flex-col justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-gray-300 font-semibold flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-400" />
            Safety Circle Radius:
          </span>
          <input
            type="range"
            min="25"
            max="150"
            step="5"
            value={maxDistanceThreshold}
            onChange={e => setMaxDistanceThreshold(Number(e.target.value))}
            aria-label="Demo safety radius" className="w-full min-w-0 accent-amber-400 cursor-pointer"
          />
          <span className="font-mono font-bold text-amber-400 text-sm">{maxDistanceThreshold} Meters</span>
        </div>

        <div className="min-w-0 space-y-2">
          <span className="text-gray-400 font-medium">Choose a suggested meetup point:</span>
          <select
            value={designatedMeetupPoint}
            onChange={e => setDesignatedMeetupPoint(e.target.value)}
            aria-label="Meetup point" className="w-full min-w-0 bg-[#051a17] border border-[#14473f] text-white text-xs px-2.5 py-3 rounded focus:outline-none focus:border-amber-400"
          >
            <option value={designatedMeetupPoint}>{designatedMeetupPoint || 'Choose a meetup point'}</option>
            <option value="Pushkar Ghat Main Clock Tower (Landmark 01)">Pushkar Ghat Main Clock Tower</option>
            <option value="Kotilingala Ghat Information Post 2">Kotilingala Ghat Information Post 2</option>
            <option value="Saraswati Ghat ISKCON Arch Meetup Gate">Saraswati Ghat ISKCON Gate</option>
            <option value="Markandeya Ancient Temple Entrance">Markandeya Ancient Temple Entrance</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 min-w-0">
        <input aria-label="Search family" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a family member…" className="w-full min-w-0 rounded-xl bg-[#08231f] text-white border border-emerald-800 p-3 text-xs"/>
        <select aria-label="Filter family members" value={filter} onChange={e=>setFilter(e.target.value)} className="min-w-0 rounded-xl bg-[#08231f] text-white border border-emerald-800 p-2 text-xs"><option value="all">All</option><option value="demo">Demo</option><option value="unconnected">Not connected</option></select>
      </div>
      {!familyMembers.some(m => (m.name + m.relation).toLowerCase().includes(search.toLowerCase()) && (filter === 'all' || (filter === 'demo' ? m.distanceMeters >= 0 : m.distanceMeters < 0))) && <p className="rounded-xl bg-[#08231f] p-4 text-sm text-emerald-200">No matching members. Add a contact or change your search.</p>}
      {/* Family Member Cards */}
      <div className="grid grid-cols-1 gap-3">
        {familyMembers.filter(m => (m.name + m.relation).toLowerCase().includes(search.toLowerCase()) && (filter === 'all' || (filter === 'demo' ? m.distanceMeters >= 0 : m.distanceMeters < 0))).map(member => {
          const isSeparated = member.distanceMeters > maxDistanceThreshold;

          return (
            <div
              key={member.id}
              className={`border rounded-xl p-3.5 shadow-lg flex flex-col justify-between transition-all ${
                isSeparated
                  ? 'bg-red-950/40 border-red-500 shadow-red-950/50 ring-1 ring-red-500'
                  : 'bg-[#0b2924] border-[#154d43]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-white text-sm break-words">{member.name}</h3>
                    <span className="text-xs text-amber-300">{member.relation}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    isSeparated
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {member.distanceMeters < 0 ? 'Not connected' : isSeparated ? 'Demo: separated' : 'Demo: in circle'}
                  </span>
                </div>

                {/* Distance Meter */}
                <div className="my-2.5 bg-[#061d19] p-2.5 rounded-lg border border-[#11423a]">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-amber-400" />
                      Distance:
                    </span>
                    <span className={`font-mono font-bold text-sm ${
                      isSeparated ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {member.distanceMeters < 0 ? 'Unknown' : `${member.distanceMeters} m (sample)`}
                    </span>
                  </div>
                  <div className="w-full bg-[#03110f] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        isSeparated ? 'bg-red-500' : member.distanceMeters > maxDistanceThreshold * 0.7 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, (member.distanceMeters / maxDistanceThreshold) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>Target: &lt; {maxDistanceThreshold}m</span>
                    <span>Last Ping: {member.lastPing}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 break-all">
                  <span className="flex items-center gap-1 font-mono text-[11px] text-gray-400">
                    <PhoneCall className="w-3 h-3 text-cyan-400" />
                    {member.phone}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    {member.batteryPct < 0 ? 'Unknown battery' : `${member.batteryPct}% demo`}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#12423a] flex flex-wrap items-center justify-between gap-2">
                <button onClick={()=>{setEditingId(member.id);setNewName(member.name);setNewRelation(member.relation);setNewPhone(member.phone);setShowAddForm(true);}} className="text-xs text-amber-300 font-bold">Edit</button>
                <button onClick={()=>{setCheckIns(prev=>({...prev,[member.id]:new Date().toISOString()}));setNotice(`Recorded your manual check-in for ${member.name}. This is not a location verification.`);}} className="text-xs text-emerald-300 font-bold">Record check-in</button>
                {/^[+\d\s()-]{7,20}$/.test(member.phone) && !member.id.startsWith('fam-') && <a
                  href={`tel:${member.phone.replace(/[^0-9+]/g, '')}`}
                  className="text-xs text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call Phone</span>
                </a>}
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="text-gray-500 hover:text-red-400 p-1 transition"
                  aria-label={`Remove ${member.name}`} title="Remove from family safety circle"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {checkIns[member.id] && <p className="text-[11px] text-emerald-300 mt-2">Manually checked in: {new Date(checkIns[member.id]).toLocaleString()}</p>}
            </div>
          );
        })}
      </div>

      {/* Add New Member Section */}
      {showAddForm ? (
        <form onSubmit={handleAddMember} className="bg-[#08231f] border border-[#14473f] rounded-xl p-4 text-xs space-y-3">
          <h3 className="font-bold text-white text-sm">{editingId ? 'Edit family member' : 'Add family member'}</h3>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-gray-300 block mb-1">Full Name:</label>
              <input
                type="text"
                required
                maxLength={80}
                aria-label="Member full name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Radhika"
                className="w-full bg-[#051a17] border border-[#14473f] text-white p-2 rounded focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-gray-300 block mb-1">Category / Relation:</label>
              <select
                aria-label="Member relation"
                value={newRelation}
                onChange={e => setNewRelation(e.target.value)}
                className="w-full bg-[#051a17] border border-[#14473f] text-white p-2 rounded focus:outline-none focus:border-amber-400"
              >
                <option value={newRelation}>{newRelation}</option>
                <option value="Child (Age 5-12)">Child (Age 5-12)</option>
                <option value="Elderly / Senior (Age 65+)">Elderly / Senior (Age 65+)</option>
                <option value="Adult">Adult</option>
              </select>
            </div>
            <div>
              <label className="text-gray-300 block mb-1">Mobile / Wristband ID:</label>
              <input
                type="text"
                maxLength={60}
                aria-label="Member phone or wristband ID"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                placeholder="+91 98480..."
                className="w-full bg-[#051a17] border border-[#14473f] text-white p-2 rounded focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded cursor-pointer"
            >
              Save Member
            </button>
            <button
              type="button"
              onClick={() => {setShowAddForm(false);setEditingId(null);setNewName('');setNewPhone('');}}
              className="px-3 py-1.5 bg-[#103731] hover:bg-[#15463e] text-gray-300 rounded cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => {setEditingId(null);setNewName('');setNewPhone('');setShowAddForm(true);}}
          className="w-full py-2.5 border-2 border-dashed border-[#154d43] hover:border-amber-400/50 rounded-xl text-xs font-bold text-gray-300 hover:text-white flex items-center justify-center gap-2 bg-[#08231f]/50 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add Child or Senior Citizen to Family Safety Radar</span>
        </button>
      )}
    </div>
  );
};

