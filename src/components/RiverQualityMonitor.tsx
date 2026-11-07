import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Waves, 
  Droplets, 
  Thermometer, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Sparkles, 
  Info,
  Clock
} from 'lucide-react';
import { MOCK_RIVER_WATER_QUALITY } from '../data/mockData';

export const RiverQualityMonitor: React.FC = () => {
  const { language } = useApp();
  const [selectedGhatId, setSelectedGhatId] = useState<string>('pushkar_ghat');

  const selectedData = MOCK_RIVER_WATER_QUALITY.find(q => q.ghatId === selectedGhatId) || MOCK_RIVER_WATER_QUALITY[0];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#0b2924] border border-[#14473f] rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-amber-500 text-gray-950 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded tracking-wider">
            Water Quality Station
          </span>
          <span className="text-xs text-cyan-300 font-semibold flex items-center gap-1">
            <Waves className="w-3.5 h-3.5" />
            Live Godavari River IoT Sensors
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          River Water Purity & Bathing Safety Advisory
        </h2>
        <p className="text-xs text-gray-300 mt-1 max-w-xl">
          Automated IoT sensor telemetry updated every 60 seconds from Dowleswaram barrage sampling stations. Continuous biological testing guarantees safe holy dips for children and seniors.
        </p>
      </div>

      {/* Ghat Selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {MOCK_RIVER_WATER_QUALITY.map(item => (
          <button
            key={item.ghatId}
            onClick={() => setSelectedGhatId(item.ghatId)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border cursor-pointer ${
              selectedGhatId === item.ghatId
                ? 'bg-amber-500 text-gray-950 border-amber-400 shadow'
                : 'bg-[#08231f] text-gray-300 border-[#14473f] hover:bg-[#103731]'
            }`}
          >
            {item.ghatName} ({item.bathingSafetyScore}%)
          </button>
        ))}
      </div>

      {/* Main Water Quality Score Card */}
      <div className="bg-[#0b2924] border border-[#154d43] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#14473f] pb-3">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-semibold block">
              SELECTED MONITORING NODE
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {selectedData.ghatName}
            </h3>
            <span className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              {selectedData.lastSampled}
            </span>
          </div>

          <div className="flex items-center gap-3 bg-[#061e1b] px-4 py-2.5 rounded-xl border border-[#12423a]">
            <div className="text-right">
              <span className="text-[10px] text-gray-400 uppercase block font-semibold">
                Bathing Safety Score
              </span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                {selectedData.bathingSafetyScore}%
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 6 Sensor Metric Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-[#061d19] p-3 rounded-xl border border-[#11423a]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400 text-xs">Water Temp</span>
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-lg sm:text-xl font-bold font-mono text-white block">
              {selectedData.temperatureC}°C
            </span>
            <span className="text-[10px] text-emerald-400">Pleasant & Refreshing</span>
          </div>

          <div className="bg-[#061d19] p-3 rounded-xl border border-[#11423a]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400 text-xs">pH Value</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-lg sm:text-xl font-bold font-mono text-white block">
              {selectedData.phLevel} pH
            </span>
            <span className="text-[10px] text-emerald-400">Optimal Neutral Alkaline</span>
          </div>

          <div className="bg-[#061d19] p-3 rounded-xl border border-[#11423a]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400 text-xs">Dissolved O₂</span>
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-lg sm:text-xl font-bold font-mono text-white block">
              {selectedData.dissolvedOxygenMgL} mg/L
            </span>
            <span className="text-[10px] text-emerald-400">High Oxygenation</span>
          </div>

          <div className="bg-[#061d19] p-3 rounded-xl border border-[#11423a]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400 text-xs">Turbidity</span>
              <Waves className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <span className="text-lg sm:text-xl font-bold font-mono text-white block">
              {selectedData.turbidityNtu} NTU
            </span>
            <span className="text-[10px] text-emerald-400">Clear Visibility</span>
          </div>

          <div className="bg-[#061d19] p-3 rounded-xl border border-[#11423a]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400 text-xs">Flow Velocity</span>
              <Waves className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-lg sm:text-xl font-bold font-mono text-white block">
              {selectedData.velocityMps} m/s
            </span>
            <span className="text-[10px] text-gray-300">Within Safety Ropes</span>
          </div>

          <div className="bg-[#061d19] p-3 rounded-xl border border-[#11423a]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400 text-xs">Bio Coliform</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-emerald-300 block font-mono">
              PASSED ZERO COLIFORM
            </span>
            <span className="text-[10px] text-emerald-400">Certified for Bathing</span>
          </div>
        </div>

        {/* Official Advisory Banner */}
        <div className="bg-[#051c18] border border-[#12423a] p-3.5 rounded-xl text-xs text-emerald-200 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block mb-0.5">District Health Officer Bathing Advisory:</strong>
            <span>
              River Godavari water quality is rated <strong>{selectedData.overallStatus}</strong>. Safe for children, elderly, and adults. Please adhere to the yellow floating safety buoys and do not swim past the SDRF net barrier.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
