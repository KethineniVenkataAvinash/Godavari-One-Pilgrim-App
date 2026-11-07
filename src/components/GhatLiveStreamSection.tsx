import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Eye, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Camera, 
  Compass, 
  ShieldCheck, 
  Waves, 
  Activity, 
  Clock, 
  ChevronDown,
  Sparkles,
  Download
} from 'lucide-react';
import { Language } from '../types';
import { getGhatStreamCameras } from '../logic/homeDashboardWidgets';

interface GhatLiveStreamSectionProps {
  assignedGhat: string;
  language: Language;
  onNavigateToGhat?: (ghatName: string) => void;
  onSwitchAssignedGhat?: (newGhat: string) => void;
}

export const GhatLiveStreamSection: React.FC<GhatLiveStreamSectionProps> = ({
  assignedGhat,
  language,
  onNavigateToGhat,
  onSwitchAssignedGhat
}) => {
  const [selectedGhatOverride, setSelectedGhatOverride] = useState<string | null>(null);
  const activeGhatName = selectedGhatOverride || assignedGhat;
  const streamData = getGhatStreamCameras(activeGhatName);

  const [selectedCamIndex, setSelectedCamIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [showAiOverlay, setShowAiOverlay] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [snapshotPreview, setSnapshotPreview] = useState<string | null>(null);
  const [currentTimecode, setCurrentTimecode] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{ osc?: OscillatorNode; gain?: GainNode; filter?: BiquadFilterNode } | null>(null);

  const currentCamera = streamData.cameras[selectedCamIndex] || streamData.cameras[0];

  // Multilingual helper
  const t = (en: string, te: string, hi: string) => {
    if (language === 'te') return te;
    if (language === 'hi') return hi;
    return en;
  };

  // Clock timecode updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
      const ms = String(now.getMilliseconds()).padStart(3, '0').slice(0, 2);
      setCurrentTimecode(`2027-06-28 ${timeStr}.${ms} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 100);
    return () => clearInterval(interval);
  }, []);

  // Web Audio Synthesizer for Ambient River Murmur & Temple Bells
  useEffect(() => {
    if (isAudioMuted) {
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.suspend();
        } catch { /* ignore */ }
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Generate brown noise / gentle water lap
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 1.5; // boost level
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();

      audioNodesRef.current = { gain, filter };

      return () => {
        try {
          noise.stop();
          noise.disconnect();
          filter.disconnect();
          gain.disconnect();
        } catch { /* ignore */ }
      };
    } catch (e) {
      console.warn('Audio ambience error', e);
    }
  }, [isAudioMuted]);

  // Canvas Riverfront & Camera Simulation Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;

    const render = () => {
      if (!isPlaying) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      tick += 1;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Sky & River Horizon
      const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.45);
      skyGradient.addColorStop(0, '#0c2226');
      skyGradient.addColorStop(0.5, '#1b3b3e');
      skyGradient.addColorStop(1, '#ff9a44'); // Golden dawn hue
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, height * 0.45);

      // Distant Rail Bridge arches & horizon
      ctx.fillStyle = '#0a1a1d';
      for (let x = -20; x < width + 40; x += 65) {
        ctx.beginPath();
        ctx.arc(x, height * 0.44, 26, Math.PI, 0);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#274b4a';
        ctx.stroke();
      }

      // Distant Temple Gopuram / Kotilingeswara Spire
      ctx.fillStyle = '#143133';
      ctx.beginPath();
      ctx.moveTo(width * 0.75, height * 0.45);
      ctx.lineTo(width * 0.77, height * 0.32);
      ctx.lineTo(width * 0.79, height * 0.45);
      ctx.fill();

      // 2. Godavari River Waters with realistic flowing ripples
      const waterGradient = ctx.createLinearGradient(0, height * 0.45, 0, height);
      waterGradient.addColorStop(0, '#103e44');
      waterGradient.addColorStop(0.4, '#1b5d63');
      waterGradient.addColorStop(1, '#0e3135');
      ctx.fillStyle = waterGradient;
      ctx.fillRect(0, height * 0.45, width, height * 0.55);

      // Flowing wave crests
      ctx.strokeStyle = 'rgba(255, 230, 180, 0.25)';
      ctx.lineWidth = 1.2;
      for (let row = 0; row < 7; row++) {
        const y = height * 0.48 + row * 18;
        ctx.beginPath();
        for (let x = 0; x <= width; x += 10) {
          const wave = Math.sin((x + tick * (1.2 + row * 0.3)) * 0.04) * (2 + row * 0.6);
          if (x === 0) ctx.moveTo(x, y + wave);
          else ctx.lineTo(x, y + wave);
        }
        ctx.stroke();
      }

      // SDRF River Rescue Motorboat traversing safely
      const boatX = ((tick * 1.4) % (width + 120)) - 60;
      const boatY = height * 0.54 + Math.sin(tick * 0.08) * 2;
      ctx.fillStyle = '#e65100'; // SDRF rescue orange
      ctx.beginPath();
      ctx.moveTo(boatX, boatY);
      ctx.lineTo(boatX + 34, boatY);
      ctx.lineTo(boatX + 28, boatY + 8);
      ctx.lineTo(boatX + 4, boatY + 8);
      ctx.closePath();
      ctx.fill();
      // SDRF Diver helmet / cabin
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(boatX + 12, boatY - 5, 8, 5);
      // Boat wake water foam
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.moveTo(boatX, boatY + 6);
      ctx.lineTo(boatX - 16, boatY + 8);
      ctx.stroke();

      // Floating Sacred Diyas (lamps) drifting downstream
      for (let i = 0; i < 4; i++) {
        const diyaX = ((tick * 0.8 + i * 90) % (width + 60)) - 30;
        const diyaY = height * 0.60 + Math.sin(tick * 0.05 + i) * 3 + i * 12;
        // Leaf bowl
        ctx.fillStyle = '#4a6b32';
        ctx.beginPath();
        ctx.arc(diyaX, diyaY, 4, 0, Math.PI);
        ctx.fill();
        // Golden Flame
        ctx.fillStyle = '#ffd54f';
        ctx.beginPath();
        ctx.arc(diyaX, diyaY - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Ghat Bathing Steps & Promenade Margin (Foreground)
      ctx.fillStyle = '#423c34'; // Wet granite stone
      ctx.beginPath();
      ctx.moveTo(0, height * 0.68);
      ctx.lineTo(width, height * 0.68);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.fill();

      // Stone stair steps lines
      ctx.strokeStyle = '#5a5247';
      ctx.lineWidth = 2;
      for (let step = 0; step < 4; step++) {
        const sy = height * 0.74 + step * 18;
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(width, sy);
        ctx.stroke();
      }

      // Iron safety chain railing & warning buoys
      ctx.strokeStyle = '#ffb300';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.68);
      for (let bx = 0; bx <= width; bx += 40) {
        ctx.lineTo(bx, height * 0.68 + Math.sin(bx * 0.1) * 3);
      }
      ctx.stroke();

      // Safety posts & orange buoys
      for (let px = 20; px < width; px += 70) {
        // Brass vertical post
        ctx.fillStyle = '#cfb53b';
        ctx.fillRect(px - 2, height * 0.65, 4, 18);
        // Orange safety buoy
        ctx.fillStyle = '#ff6f00';
        ctx.beginPath();
        ctx.arc(px, height * 0.68, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Pilgrims taking sacred bath & queue movement
      const pilgrimBaseCount = Math.round(currentCamera.density * 6);
      for (let p = 0; p < pilgrimBaseCount; p++) {
        const px = (p * (width / (pilgrimBaseCount + 1))) + Math.sin(tick * 0.03 + p) * 8;
        const py = height * 0.72 + (p % 3) * 16;
        
        // Attire colors: saffron, white, yellow
        const colors = ['#f57c00', '#fafafa', '#fbc02d', '#d84315', '#00897b'];
        ctx.fillStyle = colors[p % colors.length];

        // Head
        ctx.beginPath();
        ctx.arc(px, py - 9, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Torso & Namaste / Dip gesture
        ctx.fillRect(px - 3, py - 5, 6, 10);
      }

      // 5. AI Optical Flow / Crowd Vector Overlay (HUD)
      if (showAiOverlay) {
        // Density boundary grid box
        ctx.strokeStyle = currentCamera.density > 4.0 ? 'rgba(239, 68, 68, 0.7)' : currentCamera.density > 3.0 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(16, 185, 129, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(width * 0.1, height * 0.68, width * 0.8, height * 0.28);

        // Motion flow vector arrows
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.lineWidth = 1.5;
        for (let vx = 30; vx < width - 20; vx += 55) {
          const vy = height * 0.78 + Math.sin((vx + tick) * 0.05) * 4;
          const arrowLen = 14 + Math.cos(tick * 0.1 + vx) * 4;
          ctx.beginPath();
          ctx.moveTo(vx, vy);
          ctx.lineTo(vx + arrowLen, vy);
          ctx.stroke();
          // Arrow tip
          ctx.beginPath();
          ctx.moveTo(vx + arrowLen, vy);
          ctx.lineTo(vx + arrowLen - 4, vy - 3);
          ctx.lineTo(vx + arrowLen - 4, vy + 3);
          ctx.fill();
        }

        // Density Heatmap HUD pill inside canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(width - 130, height - 34, 120, 24);
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = currentCamera.density > 4.0 ? '#ef4444' : currentCamera.density > 3.0 ? '#f59e0b' : '#10b981';
        ctx.fillText(`AI: ${currentCamera.density.toFixed(1)} P/m²`, width - 122, height - 18);
      }

      // Scanline effect for authentic CCTV look
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      for (let s = 0; s < height; s += 4) {
        ctx.fillRect(0, s, width, 1.5);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, showAiOverlay, currentCamera, activeGhatName]);

  // Snapshot frame handler
  const handleTakeSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setSnapshotPreview(dataUrl);
  };

  return (
    <div className="bg-[#041714] text-white rounded-2xl border-2 border-emerald-500/50 shadow-xl overflow-hidden space-y-0 transition-all">
      {/* 1. Header Toolbar */}
      <div className="bg-gradient-to-r from-[#072520] to-[#0d3c33] p-3 px-3.5 flex items-center justify-between border-b border-emerald-800/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-600/20 text-red-400 border border-red-500/40 flex items-center justify-center font-bold text-xs shadow-inner">
            <Video className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                {t('OFFICIAL GHAT LIVE STREAM', 'అధికారిక ఘాట్ లైవ్ స్ట్రీమ్', 'आधिकारिक घाट लाइव स्ट्रीम')}
              </span>
              <span className="bg-red-500 text-white text-[9px] font-mono font-black px-1.5 py-0.2 rounded-full animate-pulse">
                ● LIVE
              </span>
            </div>
            <h3 className="text-xs font-black text-white flex items-center gap-1">
              <span>{streamData.displayName}</span>
            </h3>
          </div>
        </div>

        {/* Ghat Selector dropdown for exploring other ghat feeds */}
        <div className="flex items-center gap-1.5">
          <select
            value={activeGhatName}
            onChange={(e) => {
              setSelectedGhatOverride(e.target.value);
              setSelectedCamIndex(0);
              if (onSwitchAssignedGhat && e.target.value !== assignedGhat) {
                onSwitchAssignedGhat(e.target.value);
              }
            }}
            className="bg-[#051a17] text-amber-300 border border-emerald-700/80 rounded-lg px-2 py-1 text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer max-w-[140px] truncate"
            title="Switch Ghat Camera Feed"
          >
            <option value="Pushkar Ghat (Main & VIP)">Pushkar Ghat (VIP)</option>
            <option value="Kotilingala Ghat (Mega Bathing Bank)">Kotilingala Ghat</option>
            <option value="Saraswati Ghat & ISKCON Area">Saraswati Ghat</option>
            <option value="Markandeya Ancient Ghat">Markandeya Ghat</option>
          </select>
        </div>
      </div>

      {/* 2. Video Player & Simulated OSD Screen */}
      <div className="relative bg-black aspect-video w-full overflow-hidden flex items-center justify-center select-none group">
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="w-full h-full object-cover block"
        />

        {/* Overlay 1: Live CCTV OSD (Top Left) */}
        <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-mono text-gray-200 pointer-events-none flex flex-col gap-0.5 shadow">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-red-400 font-bold uppercase">{currentCamera.id.toUpperCase()}</span>
            <span className="text-gray-400">• {currentCamera.resolution} {currentCamera.fps}fps</span>
          </div>
          <span className="text-white font-bold text-[9px] truncate max-w-[210px]">
            {currentCamera.name}
          </span>
          <span className="text-[9px] text-amber-300/90">{currentTimecode}</span>
        </div>

        {/* Overlay 2: River Safety & Density Badge (Top Right) */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 text-[10px] font-mono font-bold flex items-center gap-1 shadow">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-300">SDRF PATROL ON VIGIL</span>
          </div>
          <div className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold font-mono shadow ${
            currentCamera.density > 4.0 
              ? 'bg-red-950/80 text-red-300 border-red-500/60' 
              : currentCamera.density > 3.0 
              ? 'bg-amber-950/80 text-amber-300 border-amber-500/60' 
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
          }`}>
            {currentCamera.density.toFixed(1)} P/m² • {currentCamera.density > 4.0 ? 'CRITICAL' : currentCamera.density > 3.0 ? 'MODERATE' : 'NORMAL'}
          </div>
        </div>

        {/* Overlay 3: Paused Stream Watermark */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
            <button
              onClick={() => setIsPlaying(true)}
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-2xl transition transform active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t('Resume Live Feed', 'లైవ్ ఫీడ్ పునఃప్రారంభించు', 'लाइव स्ट्रीम फिर से चालू करें')}</span>
            </button>
          </div>
        )}

        {/* Overlay 4: Quick In-Player Toolbar (Bottom Controls) */}
        <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 flex items-center justify-between text-xs transition-opacity opacity-90 hover:opacity-100">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 hover:bg-white/15 rounded-lg text-white transition cursor-pointer"
              title={isPlaying ? 'Pause Feed' : 'Resume Feed'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>

            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                !isAudioMuted ? 'bg-amber-400 text-stone-950 font-bold' : 'hover:bg-white/15 text-gray-300'
              }`}
              title={isAudioMuted ? 'Listen to River & Temple Ambience' : 'Mute Audio'}
            >
              {!isAudioMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setShowAiOverlay(!showAiOverlay)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                showAiOverlay ? 'bg-emerald-600 text-white shadow' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
              title="Toggle AI Crowd Optical Flow Overlay"
            >
              <Eye className="w-3 h-3" />
              <span>{t('AI Vectors', 'ఏఐ వెక్టర్స్', 'AI फ्लो')}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleTakeSnapshot}
              className="p-1.5 hover:bg-white/15 rounded-lg text-gray-200 transition cursor-pointer"
              title="Capture Snapshot of Assigned Ghat"
            >
              <Camera className="w-3.5 h-3.5 text-amber-300" />
            </button>

            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 hover:bg-white/15 rounded-lg text-gray-200 transition cursor-pointer"
              title="Open Fullscreen View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Camera Angle Pills Strip */}
      <div className="bg-[#051c18] p-2 px-3 border-y border-emerald-900/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide shrink-0">
          {t('Angles:', 'కోణాలు:', 'कोण:')}
        </span>
        {streamData.cameras.map((cam, idx) => (
          <button
            key={cam.id}
            onClick={() => setSelectedCamIndex(idx)}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition cursor-pointer ${
              selectedCamIndex === idx
                ? 'bg-amber-400 text-stone-950 shadow-sm'
                : 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-800/60'
            }`}
          >
            {cam.angle.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* 4. Telemetry Footer & Quick Navigation to this Ghat */}
      <div className="p-3 bg-[#031411] space-y-2.5 text-xs">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#06201b] p-2 rounded-xl border border-emerald-900/70">
            <span className="text-[9px] text-gray-400 uppercase font-bold block">
              {t('Est. Bathing Wait', 'అంచనా వేచి ఉండే సమయం', 'स्नान प्रतीक्षा समय')}
            </span>
            <span className="text-amber-300 font-extrabold text-xs block">
              ~{Math.round(currentCamera.density * 5)} mins
            </span>
            <span className="text-[8px] text-emerald-400 font-mono">18 Barricade Bays</span>
          </div>

          <div className="bg-[#06201b] p-2 rounded-xl border border-emerald-900/70">
            <span className="text-[9px] text-gray-400 uppercase font-bold block">
              {t('River Hydrology', 'నది ప్రవాహం', 'नदी जलस्तर')}
            </span>
            <span className="text-cyan-300 font-extrabold text-xs block">
              1.2 m/s • 2.1m
            </span>
            <span className="text-[8px] text-gray-400">Within Buoy Line</span>
          </div>

          <div className="bg-[#06201b] p-2 rounded-xl border border-emerald-900/70">
            <span className="text-[9px] text-gray-400 uppercase font-bold block">
              {t('Crowd Density', 'రద్దీ సాంద్రత', 'भीड़ स्तर')}
            </span>
            <span className={`font-extrabold text-xs block ${
              currentCamera.density > 4 ? 'text-red-400' : currentCamera.density > 3 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {currentCamera.density.toFixed(1)} P/m²
            </span>
            <span className="text-[8px] text-gray-400">Optical Count</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => {
              if (onNavigateToGhat) onNavigateToGhat(activeGhatName);
            }}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition transform active:scale-95 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {t('Safe Walking Route to this Ghat', 'ఈ ఘాట్‌కు సేఫ్ వాకింగ్ రూట్', 'इस घाट के लिए सुरक्षित पैदल मार्ग')}
            </span>
          </button>
        </div>
      </div>

      {/* 5. Fullscreen Video Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between pb-3 text-white">
            <div className="flex items-center gap-2">
              <span className="bg-red-600 text-white text-xs font-mono font-bold px-2 py-0.5 rounded">
                LIVE
              </span>
              <h2 className="text-sm font-bold">{streamData.displayName} — {currentCamera.name}</h2>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition cursor-pointer"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center bg-black rounded-2xl overflow-hidden relative">
            <canvas
              width={960}
              height={540}
              className="max-h-full max-w-full object-contain"
              ref={(node) => {
                if (!node) return;
                const srcCanvas = canvasRef.current;
                if (!srcCanvas) return;
                const ctx = node.getContext('2d');
                if (ctx) ctx.drawImage(srcCanvas, 0, 0, node.width, node.height);
              }}
            />
          </div>
        </div>
      )}

      {/* 6. Snapshot Captured Preview Modal */}
      {snapshotPreview && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#0b2924] text-white p-4 rounded-2xl max-w-sm w-full border border-emerald-500/40 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4" />
                <span>{t('Ghat Live Snapshot Saved', 'ఘాట్ లైవ్ స్నాప్‌షాట్', 'घाट लाइव स्नैपशॉट')}</span>
              </h4>
              <button
                onClick={() => setSnapshotPreview(null)}
                className="text-gray-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                <img src="/assets/icons/x.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" />
              </button>
            </div>

            <img 
              src={snapshotPreview} 
              alt="Ghat Snapshot" 
              className="w-full rounded-xl border border-white/20 shadow" 
            />

            <div className="text-[11px] text-gray-300">
              <span className="font-bold text-white block">{streamData.displayName}</span>
              <span className="text-gray-400">{currentTimecode}</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={snapshotPreview}
                download={`godavari-ghat-snapshot-${Date.now()}.jpg`}
                className="flex-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('Download Frame', 'డౌన్‌లోడ్ చేసుకోండి', 'डाउनलोड करें')}</span>
              </a>
              <button
                onClick={() => setSnapshotPreview(null)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {t('Close', 'మూసివేయి', 'बंद करें')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
