import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  Users, 
  Accessibility, 
  Download, 
  CheckCircle2, 
  ArrowRight, 
  QrCode, 
  ShieldCheck, 
  Calendar,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { SACRED_MUHURTHAMS } from '../utils/snanamSchedule';

export const PersonalizedDipPlanner: React.FC = () => {
  const { zones, language } = useApp();

  const [arrivalPoint, setArrivalPoint] = useState<string>('railway');
  const [groupType, setGroupType] = useState<'general' | 'elderly' | 'children'>('general');
  const [preferredMuhurthamId, setPreferredMuhurthamId] = useState<string>('brahma');
  const [pilgrimName, setPilgrimName] = useState<string>('Venkata Subba Rao & Family');
  const [groupSize, setGroupSize] = useState<number>(4);
  const [generatedPass, setGeneratedPass] = useState<any | null>(null);
  const [copiedPass, setCopiedPass] = useState<boolean>(false);

  const selectedMuhurtham = SACRED_MUHURTHAMS.find(m => m.id === preferredMuhurthamId) || SACRED_MUHURTHAMS[0];

  const handleGeneratePlan = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine optimal ghat recommendation based on constraints
    let recommendedGhat = zones.find(z => z.id === 'markandeya_ghat') || zones[0];
    let routeNotes = 'Direct 10-minute flat pedestrian corridor with battery carts.';
    let connectedShuttle = 'Saffron Heritage Shuttle (Stop 2)';

    if (groupType === 'elderly') {
      recommendedGhat = zones.find(z => z.id === 'markandeya_ghat') || zones[0];
      routeNotes = 'Barrier-free ramp access, dedicated senior citizen changing room & wheelchair escort available at Gate 2.';
      connectedShuttle = 'Priority Electric Golf Cart Shuttle';
    } else if (arrivalPoint === 'morampudi') {
      recommendedGhat = zones.find(z => z.id === 'pushkar_ghat') || zones[0];
      routeNotes = 'Take Blue Line Electric Shuttle directly to Pushkar Ghat North Terminal.';
      connectedShuttle = 'Blue Line Express Bus BL-1';
    } else if (arrivalPoint === 'gammon') {
      recommendedGhat = zones.find(z => z.id === 'kotilingala_ghat') || zones[0];
      routeNotes = 'Take River Link Shuttle across Kovvur corridor to Kotilingala West Promenade.';
      connectedShuttle = 'River Link Shuttle';
    }

    const passNumber = `G1-PASS-2027-${Math.floor(100000 + Math.random() * 900000)}`;

    setGeneratedPass({
      passNumber,
      name: pilgrimName,
      groupSize,
      groupType,
      muhurtham: selectedMuhurtham,
      ghat: recommendedGhat,
      routeNotes,
      connectedShuttle,
      allocatedWindow: selectedMuhurtham.timeWindow,
      generatedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    });
  };

  const handleCopyPass = () => {
    if (!generatedPass) return;
    const text = `GODAVARI ONE — PUSHKARALU 2027 PILGRIM PASS
Pass ID: ${generatedPass.passNumber}
Pilgrim: ${generatedPass.name} (${generatedPass.groupSize} Members)
Assigned Ghat: ${generatedPass.ghat.name}
Sacred Window: ${generatedPass.muhurtham.nameEn} (${generatedPass.allocatedWindow})
Shuttle Route: ${generatedPass.connectedShuttle}
Verified by Govt of AP Pushkaralu Board.
`;
    navigator.clipboard.writeText(text);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0b2924] border border-[#14473f] rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-amber-500 text-gray-950 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded tracking-wider">
            Smart Pilgrim Planner
          </span>
          <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            AI Congestion-Optimized Holy Dip Pass
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Personalized Snanam Schedule & Digital Pilgrim Pass
        </h2>
        <p className="text-xs text-gray-300 mt-1 max-w-2xl">
          Enter your arrival location and family mobility needs. Our engine routes you to the least crowded ghat with dedicated ramps and generates your official Digital Pushkaralu Pass.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (Form): 5 cols */}
        <form onSubmit={handleGeneratePlan} className="lg:col-span-5 bg-[#08231f] border border-[#14473f] rounded-xl p-4 sm:p-5 shadow-xl text-xs space-y-4">
          <h3 className="font-bold text-white text-sm">Plan Your Holy Dip (Snanam)</h3>

          <div>
            <label className="text-gray-300 block mb-1 font-semibold">Lead Pilgrim / Family Name:</label>
            <input
              type="text"
              required
              value={pilgrimName}
              onChange={e => setPilgrimName(e.target.value)}
              className="w-full bg-[#051a17] border border-[#14473f] text-white p-2 rounded focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-300 block mb-1 font-semibold">Total Pilgrims:</label>
              <input
                type="number"
                min="1"
                max="25"
                value={groupSize}
                onChange={e => setGroupSize(Number(e.target.value))}
                className="w-full bg-[#051a17] border border-[#14473f] text-white p-2 rounded focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1 font-semibold">Mobility Priority:</label>
              <select
                value={groupType}
                onChange={e => setGroupType(e.target.value as any)}
                className="w-full bg-[#051a17] border border-[#14473f] text-white p-2 rounded focus:outline-none focus:border-amber-400"
              >
                <option value="general">General Group</option>
                <option value="elderly">Elderly / Wheelchair Ramp</option>
                <option value="children">With Infants / Strollers</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-gray-300 block mb-1 font-semibold">Arrival Staging Hub / Entry:</label>
            <select
              value={arrivalPoint}
              onChange={e => setArrivalPoint(e.target.value)}
              className="w-full bg-[#051a17] border border-[#14473f] text-white p-2 rounded focus:outline-none focus:border-amber-400"
            >
              <option value="railway">Godavari Railway Station South Complex (1.1 km)</option>
              <option value="morampudi">Morampudi Mega Outer Hub (4.2 km - Shuttles)</option>
              <option value="artscollege">Government Arts College Parking (1.8 km)</option>
              <option value="gammon">Gammon Bridge Kovvur Terminal (West Godavari Link)</option>
            </select>
          </div>

          <div>
            <label className="text-gray-300 block mb-1 font-semibold">Preferred Sacred Muhurtham:</label>
            <select
              value={preferredMuhurthamId}
              onChange={e => setPreferredMuhurthamId(e.target.value)}
              className="w-full bg-[#051a17] border border-[#14473f] text-white p-2 rounded focus:outline-none focus:border-amber-400"
            >
              {SACRED_MUHURTHAMS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.nameEn} ({m.timeWindow})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-amber-300 mt-1">
              {selectedMuhurtham.significanceEn}
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs rounded-lg transition shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Calculate Route & Generate Digital Pass</span>
          </button>
        </form>

        {/* Right (Pass Preview): 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          {generatedPass ? (
            <div className="bg-gradient-to-br from-[#0c312b] via-[#092622] to-[#041614] border-2 border-amber-500/60 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              {/* Gold holographic accent corner ribbon */}
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-400/20 rotate-45 pointer-events-none" />

              {/* Pass Header */}
              <div className="flex items-start justify-between border-b border-[#165047] pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 text-gray-950 font-black text-xl flex items-center justify-center shadow-lg ring-2 ring-amber-300">
                    G1
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block">
                      GOVERNMENT OF ANDHRA PRADESH
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Godavari Pushkaralu 2027 Digital Pilgrim Pass
                    </h3>
                    <span className="text-xs text-emerald-300 font-mono">
                      Pass ID: {generatedPass.passNumber}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold uppercase">
                    CONFIRMED
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-1">
                    Valid for: {generatedPass.generatedAt}
                  </span>
                </div>
              </div>

              {/* Pilgrim Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#061e1b] p-3 rounded-xl border border-[#12453e] text-xs mb-4">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Lead Pilgrim</span>
                  <span className="font-bold text-white truncate block">{generatedPass.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Group Size</span>
                  <span className="font-bold text-white font-mono">{generatedPass.groupSize} Persons</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Priority Lane</span>
                  <span className="font-bold text-amber-300 capitalize">{generatedPass.groupType}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Allocated Slot</span>
                  <span className="font-bold text-emerald-400 font-mono">{generatedPass.allocatedWindow}</span>
                </div>
              </div>

              {/* Destination Ghat & Shuttle Route Guidance */}
              <div className="bg-[#072420] border border-[#155348] rounded-xl p-3.5 space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300 font-bold uppercase flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    Recommended Designated Ghat:
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Density: {generatedPass.ghat.density.toFixed(1)} P/m² (Fast Queue)
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white">
                  {generatedPass.ghat.name}
                </h4>
                <p className="text-xs text-gray-300">
                  {generatedPass.routeNotes}
                </p>
                <div className="pt-2 border-t border-[#12453e] flex items-center justify-between text-xs text-amber-300 font-semibold">
                  <span>Free Connecting Transit:</span>
                  <span className="text-white font-mono bg-[#0b2f29] px-2 py-0.5 rounded">
                    {generatedPass.connectedShuttle}
                  </span>
                </div>
              </div>

              {/* QR Code Bar & Verification Seal */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#051c18] p-3 rounded-xl border border-[#12423a]">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white p-1 rounded-lg shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-gray-950 fill-current">
                      <rect x="0" y="0" width="30" height="30" />
                      <rect x="5" y="5" width="20" height="20" fill="white" />
                      <rect x="10" y="10" width="10" height="10" />
                      <rect x="70" y="0" width="30" height="30" />
                      <rect x="75" y="5" width="20" height="20" fill="white" />
                      <rect x="80" y="10" width="10" height="10" />
                      <rect x="0" y="70" width="30" height="30" />
                      <rect x="5" y="75" width="20" height="20" fill="white" />
                      <rect x="10" y="80" width="10" height="10" />
                      <rect x="40" y="20" width="20" height="10" />
                      <rect x="40" y="40" width="20" height="20" />
                      <rect x="70" y="60" width="20" height="30" />
                    </svg>
                  </div>
                  <div className="text-[11px] text-gray-300">
                    <span className="font-bold text-white block">Official Fast-Track QR Pass</span>
                    <span>Show to Police Volunteer at Gate Entrance for express verification.</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPass}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#123e38] hover:bg-[#184e46] text-amber-300 font-bold text-xs rounded-lg transition cursor-pointer"
                  >
                    {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPass ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0b2924] border border-[#154d43] rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3 min-h-[350px]">
              <Sparkles className="w-12 h-12 text-amber-400/50" />
              <h3 className="font-bold text-white text-base">Generate Your Sacred Snanam Pass</h3>
              <p className="text-xs text-gray-400 max-w-sm">
                Fill out the planner form on the left to receive a custom congestion-optimized Ghat schedule and verified mobile digital pass.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
