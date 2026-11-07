import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Ticket, 
  Clock, 
  Users, 
  Bell, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  RefreshCw, 
  Volume2, 
  Play, 
  AlertCircle 
} from 'lucide-react';
import { audioEngine } from '../utils/audioAlarm';

export const VirtualQueueToken: React.FC = () => {
  const { zones, language } = useApp();
  const [selectedGhatId, setSelectedGhatId] = useState<string>('pushkar_ghat');
  const [currentlyServing, setCurrentlyServing] = useState<number>(242);
  const [myTokenNumber, setMyTokenNumber] = useState<number>(254);
  const [myTokenId, setMyTokenId] = useState<string>('TOK-AP-882190');
  const [notifyOnTurn, setNotifyOnTurn] = useState<boolean>(true);
  const [isSlotCalled, setIsSlotCalled] = useState<boolean>(false);
  const [isServerSynced, setIsServerSynced] = useState<boolean>(true);

  const selectedZone = zones.find(z => z.id === selectedGhatId) || zones[0];
  const tokensAhead = Math.max(0, myTokenNumber - currentlyServing);
  const estimatedWaitMins = Math.max(1, tokensAhead * 1.5);

  // Authoritative server synchronization for currently serving turnstile tokens
  const fetchServerServing = async () => {
    try {
      const res = await fetch(`/api/tokens/serving/${selectedGhatId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.currentlyServing === 'number') {
          setCurrentlyServing(data.currentlyServing);
          setIsServerSynced(true);
          if (data.currentlyServing >= myTokenNumber && !isSlotCalled) {
            setIsSlotCalled(true);
            if (notifyOnTurn) {
              audioEngine.playWhistleBurst();
            }
          }
          return;
        }
      }
    } catch {
      setIsServerSynced(false);
    }
  };

  useEffect(() => {
    fetchServerServing();
    const timer = setInterval(fetchServerServing, 6000);
    return () => clearInterval(timer);
  }, [selectedGhatId, myTokenNumber, isSlotCalled, notifyOnTurn]);

  const handleSimulateAdvance = async () => {
    try {
      const res = await fetch('/api/tokens/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ghatId: selectedGhatId, count: 2 })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentlyServing(data.currentlyServing);
        setIsServerSynced(true);
        if (data.currentlyServing >= myTokenNumber) {
          setIsSlotCalled(true);
          if (notifyOnTurn) {
            audioEngine.playWhistleBurst();
          }
        }
        return;
      }
    } catch {}
    
    // Fallback if offline
    setCurrentlyServing(prev => {
      const next = prev + 2;
      if (next >= myTokenNumber) {
        setIsSlotCalled(true);
        if (notifyOnTurn) audioEngine.playWhistleBurst();
      }
      return next;
    });
  };

  const handleGetNewToken = async () => {
    try {
      const res = await fetch('/api/tokens/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          devoteeName: 'Devotee Sri Ramana Rao',
          devoteePhone: '+91 98480 22338',
          assignedGhatId: selectedGhatId,
          swayamSlotTime: 'Brahma Muhurtham (04:30 - 06:00 AM)'
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          setMyTokenNumber(data.token.tokenSequenceNumber);
          setMyTokenId(data.token.tokenId);
          setIsSlotCalled(false);
          setIsServerSynced(true);
          return;
        }
      }
    } catch {}

    const newTok = currentlyServing + 15;
    setMyTokenNumber(newTok);
    setMyTokenId(`TOK-AP-${Math.floor(100000 + Math.random() * 900000)}`);
    setIsSlotCalled(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#0b2924] border border-[#14473f] rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-amber-500 text-gray-950 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded tracking-wider">
            Live Virtual Queue (E-QMS)
          </span>
          <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
            <Ticket className="w-3.5 h-3.5" />
            Sacred Snanam & Aarti Token System
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Electronic Ghat Entry & Holy Dip Token
        </h2>
        <p className="text-xs text-gray-300 mt-1 max-w-xl">
          Avoid standing for hours in crowded barricades. Reserve your digital queue token, relax in shaded pilgrim pavilions, and enter the bathing steps when your number is called.
        </p>
      </div>

      {/* Ghat Selector & Real-Time "Now Serving" Board */}
      <div className="bg-[#08231f] border border-[#14473f] rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-gray-300 font-semibold flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-400" />
            Select Bathing Ghat:
          </span>
          <select
            value={selectedGhatId}
            onChange={e => setSelectedGhatId(e.target.value)}
            className="bg-[#051a17] border border-[#14473f] text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-semibold"
          >
            {zones.filter(z => z.type === 'ghat').map(g => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Big LED Board: Now Calling */}
        <div className="bg-[#03110f] border-2 border-emerald-500/70 rounded-2xl p-4 sm:p-5 text-center shadow-inner relative overflow-hidden">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-widest">
              NOW CALLING AT GHAT GATES 1 & 2
            </span>
          </div>

          <div className="my-2">
            <span className="text-4xl sm:text-6xl font-black font-mono text-emerald-300 tracking-wider">
              #{currentlyServing} &ndash; #{currentlyServing + 10}
            </span>
            <span className="text-xs text-gray-400 block mt-1">
              Current Group: Batch 24 • Pushkar Ghat Bathing Deck
            </span>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-gray-300 pt-2 border-t border-[#092b25]">
            <span>Average Group Clear Time: <strong className="text-amber-300">3 Mins</strong></span>
            <span>•</span>
            <span>Gate Clearance Rate: <strong className="text-emerald-300">120 Pilgrims/min</strong></span>
          </div>
        </div>
      </div>

      {/* Pilgrim's Personal Token Card */}
      <div className={`rounded-2xl p-5 border-2 shadow-2xl transition-all ${
        isSlotCalled
          ? 'bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-400 shadow-emerald-950/60'
          : 'bg-[#0b2924] border-[#154d43]'
      }`}>
        <div className="flex items-start justify-between gap-3 border-b border-[#14473f] pb-3 mb-4">
          <div>
            <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block">
              YOUR PERSONAL VIRTUAL TOKEN
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              Token #{myTokenNumber}
            </h3>
            <span className="text-xs text-gray-300">
              Assigned to: {selectedZone.name}
            </span>
          </div>

          <div className="text-right">
            <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${
              isSlotCalled 
                ? 'bg-emerald-500 text-gray-950 animate-bounce' 
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              {isSlotCalled ? 'YOUR TURN NOW!' : 'WAITING IN QUEUE'}
            </span>
            <span className="text-[10px] text-gray-400 block mt-1">
              {isSlotCalled ? 'Proceed to Gate Turnstiles' : `~${estimatedWaitMins} mins wait remaining`}
            </span>
          </div>
        </div>

        {/* Queue Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Queue Position</span>
            <span className="font-bold text-white">
              {isSlotCalled ? '0 Ahead (Active)' : `${tokensAhead} Tokens Ahead of You`}
            </span>
          </div>
          <div className="w-full bg-[#051a17] h-3 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ${
                isSlotCalled ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(10, 100 - (tokensAhead * 6)))}%` }}
            />
          </div>
        </div>

        {/* Status guidance & alerts */}
        {isSlotCalled ? (
          <div className="bg-emerald-900/60 border border-emerald-400 text-emerald-100 p-3 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              <span>
                <strong>YOUR TOKEN IS NOW BEING CALLED!</strong> Please enter via Priority Turnstile Gate 1 with your family.
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-[#071f1a] border border-[#11423a] p-3 rounded-xl text-xs flex items-center justify-between text-gray-300">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Relax in the shaded pandal. Phone will sound an alert when Token #{myTokenNumber} is called.
              </span>
            </div>
            <label className="flex items-center gap-1.5 text-[11px] text-amber-300 cursor-pointer shrink-0 ml-2">
              <input
                type="checkbox"
                checked={notifyOnTurn}
                onChange={e => setNotifyOnTurn(e.target.checked)}
                className="accent-amber-400"
              />
              <span>Audio Chime</span>
            </label>
          </div>
        )}

        {/* Actions for demo / queue simulation */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-[#12423a] text-xs">
          <span className="text-[11px] text-gray-400">Queue Simulator:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateAdvance}
              className="px-3 py-1.5 bg-[#103a33] hover:bg-[#164e44] text-amber-300 rounded font-bold transition cursor-pointer flex items-center gap-1"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Advance Queue (+2)</span>
            </button>
            <button
              onClick={handleGetNewToken}
              className="px-3 py-1.5 bg-[#103a33] hover:bg-[#164e44] text-gray-300 rounded font-medium transition cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Get Later Token</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
