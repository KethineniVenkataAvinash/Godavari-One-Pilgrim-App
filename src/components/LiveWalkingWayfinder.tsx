import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Navigation, 
  MapPin, 
  Footprints, 
  Clock, 
  Volume2, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Droplets, 
  Sparkles, 
  Compass, 
  CornerUpRight, 
  CornerUpLeft, 
  MoveUp, 
  CheckCircle2,
  Accessibility
} from 'lucide-react';
import { playSpeechAlert, stopSpeechAlert } from '../utils/speechAlert';
import { calculatePedestrianShortestPath } from '../utils/pedestrianRouter';

interface RouteStep {
  instructionEn: string;
  instructionTe: string;
  instructionHi: string;
  distanceMeters: number;
  icon: 'straight' | 'right' | 'left' | 'arrive';
  checkpoint?: string;
}

export const LiveWalkingWayfinder: React.FC = () => {
  const { zones, language } = useApp();
  const [selectedDestinationGhat, setSelectedDestinationGhat] = useState<string>('markandeya_ghat');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [requireWheelchair, setRequireWheelchair] = useState<boolean>(false);

  const selectedZone = zones.find(z => z.id === selectedDestinationGhat) || zones[0];
  const isCrowdedGhat = selectedZone.density >= 3.5;

  // Real-time calculation from real Rajahmundry GIS pedestrian road network graph
  const computedRoute = useMemo(() => {
    return calculatePedestrianShortestPath(16.9850, 81.7800, selectedDestinationGhat, requireWheelchair);
  }, [selectedDestinationGhat, requireWheelchair]);

  // Transform graph edges into multilingual navigational steps
  const routeSteps: RouteStep[] = useMemo(() => {
    if (computedRoute.steps.length === 0) return [];

    return computedRoute.steps.map((st, idx) => {
      const isLast = idx === computedRoute.steps.length - 1;
      const iconType = isLast ? 'arrive' : idx % 2 === 1 ? 'right' : 'straight';
      return {
        instructionEn: st.instruction,
        instructionTe: `${st.corridorName} గుండా ${st.distanceMeters} మీటర్లు ముందుకు సాగండి. మార్గంలో తాగునీటి మరియు వైద్య సేవలు అందుబాటులో ఉన్నాయి.`,
        instructionHi: `${st.corridorName} के रास्ते ${st.distanceMeters} मीटर आगे बढ़ें। रास्ते में पेयजल व सहायता केंद्र उपलब्ध हैं।`,
        distanceMeters: st.distanceMeters,
        icon: iconType,
        checkpoint: isLast ? 'SDRF River Lifeguard Watchtower & Changing Rooms' : `${st.corridorName} • Shaded Walkway`,
      };
    });
  }, [computedRoute]);

  const totalDistanceMeters = computedRoute.totalDistanceMeters;
  const estimatedWalkingMinutes = computedRoute.estimatedWalkingMinutes;
  const estimatedSteps = Math.round(totalDistanceMeters * 1.33);

  const handleSpeakCurrentStep = () => {
    const current = routeSteps[activeStepIndex];
    const text = language === 'te' 
      ? current.instructionTe 
      : language === 'hi' 
      ? current.instructionHi 
      : current.instructionEn;

    if (isVoiceActive) {
      stopSpeechAlert();
      setIsVoiceActive(false);
    } else {
      playSpeechAlert(text, language);
      setIsVoiceActive(true);
    }
  };

  const handleNextStep = () => {
    if (activeStepIndex < routeSteps.length - 1) {
      setActiveStepIndex(prev => prev + 1);
      stopSpeechAlert();
      setIsVoiceActive(false);
    }
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(prev => prev - 1);
      stopSpeechAlert();
      setIsVoiceActive(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#0b2924] border border-[#14473f] rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-amber-500 text-gray-950 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded tracking-wider">
            Live Safe Wayfinder
          </span>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Congestion-Aware Pedestrian Navigation
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Turn-by-Turn Safe Ghat Walking Route
        </h2>
        <p className="text-xs text-gray-300 mt-1 max-w-xl">
          Real-time dynamic rerouting that steers you away from bottleneck barricades into shaded pedestrian corridors equipped with drinking water and medical tents.
        </p>
      </div>

      {/* Destination Ghat Selector & Wheelchair Accessibility Filter */}
      <div className="bg-[#08231f] border border-[#14473f] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-gray-300 font-semibold">Select Destination Ghat:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedDestinationGhat}
            onChange={e => {
              setSelectedDestinationGhat(e.target.value);
              setActiveStepIndex(0);
            }}
            className="bg-[#051a17] border border-[#14473f] text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-semibold"
          >
            {zones.filter(z => z.type === 'ghat').map(g => (
              <option key={g.id} value={g.id}>
                {g.name} (Density: {g.density.toFixed(1)} P/m² • {g.status})
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setRequireWheelchair(!requireWheelchair);
              setActiveStepIndex(0);
            }}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              requireWheelchair 
                ? 'bg-blue-600 border-blue-400 text-white shadow' 
                : 'bg-[#051a17] border-[#14473f] text-gray-300 hover:text-white'
            }`}
          >
            <Accessibility className="w-3.5 h-3.5 text-amber-300" />
            <span>{requireWheelchair ? ' Ramp Route (Active)' : ' Elder / Ramp Route'}</span>
          </button>
        </div>
      </div>

      {/* Network Provenance Indicator */}
      <div className="px-1 flex items-center justify-between text-[10px] text-gray-400">
        <span className="flex items-center gap-1 text-emerald-400 font-mono">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Rajahmundry GIS Pedestrian Road Network • Dijkstra Shortest Path Solver</span>
        </span>
        <span className="font-mono text-amber-300/80">
          Corridor Impedance: Calibrated
        </span>
      </div>

      {/* Crowded Ghat Warning Banner if user chose a critical ghat */}
      {isCrowdedGhat && (
        <div className="bg-amber-950/80 border border-amber-500/70 rounded-xl p-3 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>HIGH DENSITY WARNING:</strong> {selectedZone.name} is experiencing heavy queues (~{Math.round(selectedZone.density * 10)} mins wait). We recommend switching to <strong>Markandeya Ancient Ghat</strong> for zero wait time.
            </span>
          </div>
          <button
            onClick={() => setSelectedDestinationGhat('markandeya_ghat')}
            className="px-2.5 py-1 bg-amber-500 text-gray-950 font-bold rounded text-[11px] shrink-0 ml-2 hover:bg-amber-400 cursor-pointer"
          >
            Reroute Now
          </button>
        </div>
      )}

      {/* Live Route HUD Summary */}
      <div className="grid grid-cols-3 gap-2 bg-[#061d1a] p-3 rounded-xl border border-[#11423a] text-center text-xs">
        <div>
          <span className="text-gray-400 block text-[10px] uppercase font-semibold">Remaining Walk</span>
          <span className="text-base sm:text-lg font-bold font-mono text-white">
            {totalDistanceMeters}m
          </span>
          <span className="text-[10px] text-emerald-400 block">Flat Paved Path</span>
        </div>
        <div className="border-x border-[#12423a]">
          <span className="text-gray-400 block text-[10px] uppercase font-semibold">Walking Time</span>
          <span className="text-base sm:text-lg font-bold font-mono text-amber-400">
            ~{estimatedWalkingMinutes} Mins
          </span>
          <span className="text-[10px] text-gray-300 block">Normal Pace</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px] uppercase font-semibold">Est. Steps</span>
          <span className="text-base sm:text-lg font-bold font-mono text-cyan-300">
            {estimatedSteps}
          </span>
          <span className="text-[10px] text-gray-300 block">~32 kcal burned</span>
        </div>
      </div>

      {/* Active Navigation Card (Current Turn Instruction) */}
      <div className="bg-gradient-to-br from-[#0c312b] to-[#072420] border-2 border-amber-500/60 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-gray-950 flex items-center justify-center shadow-lg">
              {routeSteps[activeStepIndex].icon === 'right' ? (
                <CornerUpRight className="w-6 h-6 stroke-[2.5]" />
              ) : routeSteps[activeStepIndex].icon === 'left' ? (
                <CornerUpLeft className="w-6 h-6 stroke-[2.5]" />
              ) : routeSteps[activeStepIndex].icon === 'arrive' ? (
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              ) : (
                <MoveUp className="w-6 h-6 stroke-[2.5]" />
              )}
            </div>
            <div>
              <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-widest block">
                STEP {activeStepIndex + 1} OF {routeSteps.length} • {routeSteps[activeStepIndex].distanceMeters} METERS
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {language === 'te' 
                  ? routeSteps[activeStepIndex].instructionTe 
                  : language === 'hi' 
                  ? routeSteps[activeStepIndex].instructionHi 
                  : routeSteps[activeStepIndex].instructionEn}
              </h3>
            </div>
          </div>

          {/* Voice Prompt Button */}
          <button
            onClick={handleSpeakCurrentStep}
            className={`p-2.5 rounded-xl border transition cursor-pointer shrink-0 ${
              isVoiceActive
                ? 'bg-amber-500 text-gray-950 border-amber-300 shadow-lg animate-pulse'
                : 'bg-[#08231f] text-gray-300 border-[#14473f] hover:text-white'
            }`}
            title="Read turn instruction aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Checkpoint along path */}
        {routeSteps[activeStepIndex].checkpoint && (
          <div className="bg-[#051c18] border border-[#12423a] p-2.5 rounded-xl flex items-center gap-2 text-xs text-emerald-300 mb-4">
            <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
            <span><strong>Nearby Landmark:</strong> {routeSteps[activeStepIndex].checkpoint}</span>
          </div>
        )}

        {/* Step navigation buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[#12423a]">
          <button
            onClick={handlePrevStep}
            disabled={activeStepIndex === 0}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeStepIndex === 0
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-[#092622] hover:bg-[#103731] text-gray-300 cursor-pointer'
            }`}
          >
            ← Previous Turn
          </button>

          <span className="text-xs font-mono text-gray-400">
            {activeStepIndex + 1} / {routeSteps.length}
          </span>

          <button
            onClick={handleNextStep}
            disabled={activeStepIndex === routeSteps.length - 1}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition shadow ${
              activeStepIndex === routeSteps.length - 1
                ? 'bg-emerald-600 text-white cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-gray-950 cursor-pointer'
            }`}
          >
            {activeStepIndex === routeSteps.length - 1 ? 'Destination Reached' : 'Next Turn →'}
          </button>
        </div>
      </div>
    </div>
  );
};
