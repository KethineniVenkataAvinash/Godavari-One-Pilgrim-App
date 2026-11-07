import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Utensils, 
  MapPin, 
  Clock, 
  Users, 
  Sparkles, 
  Navigation, 
  Droplets, 
  CheckCircle2, 
  Heart,
  ChevronRight
} from 'lucide-react';
import { MOCK_ANNADANAM_CENTERS } from '../data/mockData';

export const AnnadanamPrasadamFinder: React.FC<{ onNavigateTo?: () => void }> = ({ onNavigateTo }) => {
  const { language } = useApp();
  const [selectedCenterId, setSelectedCenterId] = useState<string>(MOCK_ANNADANAM_CENTERS[0].id);

  const totalMealsServed = MOCK_ANNADANAM_CENTERS.reduce((acc, c) => acc + c.mealsServedToday, 0);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#0b2924] border border-[#14473f] rounded-xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500 text-gray-950 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded tracking-wider">
              Sacred Annaprasadam
            </span>
            <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              100% Free Pure Vegetarian Meals
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Free Annadanam & Chilled RO Water Centers
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-xl">
            Continuous sacred prasadam meals served with devotion by TTD, ISKCON, AP Endowments, and charitable seva organisations across all major ghats and transit hubs.
          </p>
        </div>

        {/* Total Meals Counter */}
        <div className="bg-[#061e1b] p-3 rounded-xl border border-[#11423a] text-center shrink-0">
          <span className="text-[10px] text-gray-400 uppercase font-semibold block">
            Meals Distributed Today
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400 block my-0.5">
            {totalMealsServed.toLocaleString()}+
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold">
            Fresh Batches Every 20 Mins
          </span>
        </div>
      </div>

      {/* Annadanam Cards List */}
      <div className="space-y-3">
        {MOCK_ANNADANAM_CENTERS.map(center => {
          const isSelected = center.id === selectedCenterId;

          return (
            <div
              key={center.id}
              onClick={() => setSelectedCenterId(center.id)}
              className={`border rounded-2xl p-4 shadow-lg transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-br from-[#0c312b] to-[#072420] border-amber-500/70 ring-1 ring-amber-500/50'
                  : 'bg-[#0b2924] border-[#154d43] hover:border-[#1e6659]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold uppercase">
                      {center.organizer}
                    </span>
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {center.timings}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base mt-1">{center.name}</h3>
                  {language === 'te' && (
                    <span className="text-xs text-amber-300 block">{center.teluguName}</span>
                  )}
                  <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    {center.locationName} ({center.distanceMeters}m walk)
                  </span>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
                  <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    ~{center.estimatedWaitMins} Mins Wait
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {center.mealsServedToday.toLocaleString()} Served
                  </span>
                </div>
              </div>

              {/* Current Menu Card */}
              <div className="my-2.5 bg-[#051c18] p-3 rounded-xl border border-[#11423a] text-xs">
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block mb-1">
                  TODAY&apos;S FRESH PRASADAM MENU:
                </span>
                <p className="text-white font-medium">
                  {language === 'te' ? center.teluguMenu : center.currentMenu}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#12423a] text-xs">
                <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  Free 20L RO Chilled Water Dispensers Available
                </span>
                {onNavigateTo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateTo();
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-lg transition"
                  >
                    <span>Walking Directions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
