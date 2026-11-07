import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Droplets, 
  HeartPulse, 
  Utensils, 
  Bus, 
  Car, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  QrCode,
  CheckCircle2,
  Clock,
  Sparkles,
  LocateFixed
} from 'lucide-react';
import { Facility, Coordinates, Language } from '../types';
import { findNearbyAmenities, NearbyAmenityWithDistance } from '../logic/homeDashboardWidgets';

interface NearbyAmenitiesMiniMapProps {
  currentLocation: Coordinates;
  facilities: Facility[];
  language: Language;
  isOpen: boolean;
  onToggle: () => void;
  onNavigateToFacility?: (facility: Facility) => void;
  onViewFacilityQr?: (facility: Facility) => void;
  onRefreshLocation?: () => void;
}

export const NearbyAmenitiesMiniMap: React.FC<NearbyAmenitiesMiniMapProps> = ({
  currentLocation,
  facilities,
  language,
  isOpen,
  onToggle,
  onNavigateToFacility,
  onViewFacilityQr,
  onRefreshLocation
}) => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [maxRadiusMeters, setMaxRadiusMeters] = useState<number>(1000);
  const [selectedAmenityId, setSelectedAmenityId] = useState<string | null>(null);

  // Multilingual helper
  const t = (en: string, te: string, hi: string) => {
    if (language === 'te') return te;
    if (language === 'hi') return hi;
    return en;
  };

  // Nearby amenities sorted by distance
  const nearbyList = useMemo(() => {
    return findNearbyAmenities(facilities, currentLocation, maxRadiusMeters, selectedTypeFilter);
  }, [facilities, currentLocation, maxRadiusMeters, selectedTypeFilter]);

  const selectedAmenity = useMemo(() => {
    if (!selectedAmenityId) return nearbyList[0] || null;
    return nearbyList.find(item => item.facility.id === selectedAmenityId) || nearbyList[0] || null;
  }, [nearbyList, selectedAmenityId]);

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'WATER_POINT':
        return <Droplets className="w-3.5 h-3.5 text-sky-500" />;
      case 'TOILET':
        return <span className="text-xs"><img src="/assets/icons/circle-help.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /></span>;
      case 'FIRST_AID':
      case 'HOSPITAL':
        return <HeartPulse className="w-3.5 h-3.5 text-rose-500" />;
      case 'FOOD':
      case 'ANNADANAM':
        return <Utensils className="w-3.5 h-3.5 text-orange-500" />;
      case 'SHUTTLE_STOP':
        return <Bus className="w-3.5 h-3.5 text-amber-500" />;
      case 'PARKING':
        return <Car className="w-3.5 h-3.5 text-indigo-500" />;
      case 'POLICE_OUTPOST':
      case 'HELP_DESK':
        return <ShieldAlert className="w-3.5 h-3.5 text-red-500" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  const getPinColor = (type: string) => {
    switch (type) {
      case 'WATER_POINT': return '#0284c7';
      case 'TOILET': return '#0d9488';
      case 'FIRST_AID':
      case 'HOSPITAL': return '#dc2626';
      case 'SHUTTLE_STOP': return '#d97706';
      case 'PARKING': return '#4f46e5';
      default: return '#16a34a';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all">
      {/* 1. Toggle Header Card */}
      <div 
        onClick={onToggle}
        className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 transition"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm shadow-xs border border-teal-200/60">
            <Compass className="w-4 h-4 text-teal-700" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black text-gray-900">
                {t('Nearby Public Amenities Mini-Map', 'సమీప ప్రజా సౌకర్యాల సూక్ష్మ మ్యాప్', 'निकटतम सार्वजनिक सुविधाएं')}
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                {nearbyList.length} {t('Found', 'లభించాయి', 'मिलीं')}
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              {t(
                'Water booths, bio-toilets & first aid relative to current location',
                'మీ ప్రస్తుత లొకేషన్ ఆధారంగా తాగునీరు, టాయిలెట్లు, 108 పోస్టులు',
                'वर्तमान स्थिति के अनुसार जल, शौचालय एवं प्राथमिक चिकित्सा'
              )}
            </p>
          </div>
        </div>

        <button
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 bg-gray-100/80 transition cursor-pointer"
          title={isOpen ? 'Collapse Mini-Map' : 'Expand Mini-Map'}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. Expanded Mini-Map & Nearby Controls */}
      {isOpen && (
        <div className="border-t border-gray-100 p-3.5 pt-2.5 space-y-3 bg-[#FBFDFD]">
          {/* Controls Bar: Radius Pills & GPS Refresh */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                {t('Radius:', 'పరిధి:', 'दूरी:')}
              </span>
              {[
                { label: '500m', value: 500 },
                { label: '1 km', value: 1000 },
                { label: '2 km', value: 2000 }
              ].map(rad => (
                <button
                  key={rad.value}
                  onClick={() => setMaxRadiusMeters(rad.value)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                    maxRadiusMeters === rad.value
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {rad.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (onRefreshLocation) onRefreshLocation();
              }}
              className="px-2 py-1 bg-white hover:bg-teal-50 text-teal-800 border border-teal-200 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer shrink-0"
              title="Refresh GPS Coordinate"
            >
              <LocateFixed className="w-3 h-3 text-teal-600" />
              <span>{t('GPS: Live', 'జీపీఎస్ లైవ్', 'लाइव जीपीएस')}</span>
            </button>
          </div>

          {/* Amenity Category Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
            {[
              { id: 'ALL', label: t('All Nearby', 'అన్నీ', 'सभी') },
              { id: 'WATER_POINT', label: t(' Water', ' నీరు', ' जल') },
              { id: 'TOILET', label: t(' Toilets', ' టాయిలెట్లు', ' शौचालय') },
              { id: 'FIRST_AID', label: t(' Medical', ' వైద్యం', ' चिकित्सा') },
              { id: 'SHUTTLE_STOP', label: t(' Shuttles', ' షటిల్స్', ' बसें') },
              { id: 'PARKING', label: t(' Parking', ' పార్కింగ్', ' पार्किंग') }
            ].map(chip => (
              <button
                key={chip.id}
                onClick={() => setSelectedTypeFilter(chip.id)}
                className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedTypeFilter === chip.id
                    ? 'bg-[#0A3A40] text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-teal-400'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Interactive Mini-Map Canvas / SVG Radar View */}
          <div className="relative w-full h-52 bg-[#eef5f3] rounded-xl border border-gray-300 overflow-hidden shadow-inner flex items-center justify-center select-none">
            {/* Map Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-25 pointer-events-none" 
              style={{
                backgroundImage: 'radial-gradient(#0A3A40 1px, transparent 1px)',
                backgroundSize: '16px 16px'
              }}
            />

            {/* Simulated River Curve in background */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 300 200">
              <path
                d="M 0,40 Q 150,90 300,50 L 300,0 L 0,0 Z"
                fill="#b8e2dc"
                opacity="0.85"
              />
              <path
                d="M 0,40 Q 150,90 300,50"
                stroke="#1b7870"
                strokeWidth="1.5"
                fill="none"
              />
              {/* River label */}
              <text x="110" y="25" fill="#1b7870" fontSize="9" fontWeight="bold" letterSpacing="1">
                AKHANDA GODAVARI
              </text>
            </svg>

            {/* User GPS Center Beacon (Pulsing Radar) */}
            <div 
              className="absolute z-20 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: '50%', top: '60%' }}
              title="Your Current Location (Pushkaralu Riverfront)"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/20 animate-ping absolute" />
              <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-[8px] text-white font-bold">
                <img src="/assets/icons/map-pin.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" />
              </div>
              <span className="absolute top-4 bg-stone-900/80 text-white text-[9px] font-bold px-1.5 py-0.2 rounded whitespace-nowrap shadow pointer-events-none">
                {t('You', 'మీరు', 'आप')}
              </span>
            </div>

            {/* Amenity Pins mapped relative to center */}
            {nearbyList.slice(0, 10).map((item, index) => {
              // Convert coordinate delta to relative visual offset (scaled within box)
              const dLat = (item.facility.location.lat - currentLocation.lat) * 111000;
              const dLng = (item.facility.location.lng - currentLocation.lng) * 111000;

              // Scale to canvas box: 1000m radius -> ~80px offset
              const scale = 75 / maxRadiusMeters;
              const posX = Math.max(12, Math.min(88, 50 + dLng * scale));
              const posY = Math.max(15, Math.min(85, 60 - dLat * scale));

              const isSelected = selectedAmenity?.facility.id === item.facility.id;

              return (
                <div
                  key={item.facility.id}
                  onClick={() => setSelectedAmenityId(item.facility.id)}
                  className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125"
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  title={`${item.facility.name} (${item.distanceMeters}m)`}
                >
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all ${
                      isSelected 
                        ? 'ring-3 ring-amber-400 scale-110' 
                        : 'border border-white hover:shadow-lg'
                    }`}
                    style={{ backgroundColor: getPinColor(item.facility.type) }}
                  >
                    <span className="text-[10px] text-white font-bold leading-none">
                      {index + 1}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Mini-map Overlay Legend */}
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-gray-200 text-[9px] font-bold text-gray-700 shadow-xs flex items-center gap-1 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
              <span>{t('GPS Radius:', 'జీపీఎస్ పరిధి:', 'जीपीएस दायरा:')} {maxRadiusMeters}m</span>
            </div>
          </div>

          {/* Selected Amenity Highlight Card */}
          {selectedAmenity && (
            <div className="bg-white p-3 rounded-xl border border-teal-200/90 shadow-sm space-y-2 animate-in fade-in">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                    {getFacilityIcon(selectedAmenity.facility.type)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-gray-900 leading-tight">
                      {language === 'te' ? selectedAmenity.facility.teluguName : selectedAmenity.facility.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500 font-medium">
                      <span className="text-teal-700 font-bold font-mono">
                        {selectedAmenity.distanceMeters}m away
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-amber-700 font-bold">
                        <Clock className="w-3 h-3 inline" />
                        ~{selectedAmenity.walkMinutes} min walk
                      </span>
                    </div>
                  </div>
                </div>

                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  selectedAmenity.facility.status === 'OPERATIONAL'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedAmenity.facility.status}
                </span>
              </div>

              {selectedAmenity.facility.accessibilityNotes && (
                <p className="text-[10px] text-gray-600 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                  <img src="/assets/icons/accessibility.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> {selectedAmenity.facility.accessibilityNotes}
                </p>
              )}

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100 text-xs">
                {onViewFacilityQr && (
                  <button
                    onClick={() => onViewFacilityQr(selectedAmenity.facility)}
                    className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-teal-800" />
                    <span>{t('View QR', 'క్యూఆర్ కోడ్', 'QR कोड')}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (onNavigateToFacility) {
                      onNavigateToFacility(selectedAmenity.facility);
                    } else {
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${selectedAmenity.facility.location.lat},${selectedAmenity.facility.location.lng}&travelmode=walking`,
                        '_blank'
                      );
                    }
                  }}
                  className="flex-1 py-1.5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 text-white font-extrabold rounded-lg text-[11px] flex items-center justify-center gap-1 shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t('Walk Directions', 'దారి చూపించు', 'पैदल रास्ता')}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          )}

          {/* Quick List of Top 3 Closest Amenities */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
              {t('Closest Amenities (Sorted by Proximity):', 'సమీప సదుపాయాలు (దూరం ఆధారంగా):', 'निकटतम सुविधाएं (दूरी अनुसार):')}
            </span>

            {nearbyList.slice(0, 3).map((item, idx) => (
              <div
                key={item.facility.id}
                onClick={() => setSelectedAmenityId(item.facility.id)}
                className={`p-2 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${
                  selectedAmenity?.facility.id === item.facility.id
                    ? 'bg-teal-50/80 border-teal-300'
                    : 'bg-white border-gray-200/80 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-700 shrink-0">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <span className="font-bold text-gray-900 block truncate">
                      {language === 'te' ? item.facility.teluguName : item.facility.name}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Type: {item.facility.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-teal-700 font-extrabold block text-[11px] font-mono">
                    {item.distanceMeters}m
                  </span>
                  <span className="text-[9px] text-amber-700 font-bold block">
                    ~{item.walkMinutes} min
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
