import { Zone } from '../types';

export interface SnanamMuhurtham {
  id: string;
  nameEn: string;
  nameTe: string;
  nameHi: string;
  timeWindow: string;
  startHour24: number;
  startMinute: number;
  endHour24: number;
  endMinute: number;
  significanceEn: string;
  significanceTe: string;
  significanceHi: string;
  recommendedGhats: string[];
}

export const SACRED_MUHURTHAMS: SnanamMuhurtham[] = [
  {
    id: 'brahma',
    nameEn: 'Brahma Muhurtham (Divya Snanam)',
    nameTe: 'బ్రాహ్మీ ముహూర్తం (దివ్య స్నానం)',
    nameHi: 'ब्रह्म मुहूर्त (दिव्य स्नान)',
    timeWindow: '04:15 AM – 05:45 AM',
    startHour24: 4,
    startMinute: 15,
    endHour24: 5,
    endMinute: 45,
    significanceEn: 'Highest Vedic sanctity, removes sins and calms mind. Cleanest river water flow before peak sunrise rush.',
    significanceTe: 'అత్యుత్తమ ఆధ్యాత్మిక పుణ్యఫలం. ఉదయపు రద్దీకి ముందే పరిశుభ్రమైన స్వచ్ఛమైన గోదావరి జలాలు.',
    significanceHi: 'सर्वोच्च आध्यात्मिक महत्व। प्रातःकाल की भीड़ से पहले स्वच्छ एवं निर्मल गोदावरी जल।',
    recommendedGhats: ['Pushkar Ghat', 'Kotilingala Ghat']
  },
  {
    id: 'pratahkal',
    nameEn: 'Pratahkal Snanam (Surya Vandanam)',
    nameTe: 'ప్రాతఃకాల స్నానం (సూర్య వందనం)',
    nameHi: 'प्रातःकाल स्नान (सूर्य वंदन)',
    timeWindow: '06:00 AM – 08:30 AM',
    startHour24: 6,
    startMinute: 0,
    endHour24: 8,
    endMinute: 30,
    significanceEn: 'Auspicious Surya namaskara in flowing Godavari with sacred Gayatri and Pushkara sankalpam.',
    significanceTe: 'సూర్యోదయ వేళ పుష్కర సంకల్పం మరియు నదీ తర్పణాలకు అత్యంత శ్రేష్టం.',
    significanceHi: 'सूर्योदय वेला में गोदावरी तर्पण एवं पुष्करालु संकल्प हेतु उत्तम।',
    recommendedGhats: ['Kotilingala Ghat', 'Markandeya Ghat']
  },
  {
    id: 'madhyahna',
    nameEn: 'Madhyahna Snanam & Pinda Pradanam',
    nameTe: 'మధ్యాహ్న స్నానం & పితృ తర్పణం',
    nameHi: 'मध्याह्न स्नान एवं पिंडदान',
    timeWindow: '11:30 AM – 01:15 PM',
    startHour24: 11,
    startMinute: 30,
    endHour24: 13,
    endMinute: 15,
    significanceEn: 'Prescribed Vedic slot for ancestral rites (Pitru Pinda Pradanam) and charity.',
    significanceTe: 'పితృదేవతల తర్పణము, పిండ ప్రదానాలు మరియు అన్నదాన పూజలకు నియమించబడిన సమయం.',
    significanceHi: 'पितृ तर्पण, पिंडदान एवं दान-पुण्य के लिए शास्त्रोक्त समय।',
    recommendedGhats: ['Markandeya Ancient Ghat', 'Saraswati Ghat']
  },
  {
    id: 'harathi',
    nameEn: 'Godavari Maha Harathi & Deepotsavam',
    nameTe: 'గోదావరి దివ్య హారతి & దీపోత్సవం',
    nameHi: 'गोदावरी महा आरती एवं दीपोत्सव',
    timeWindow: '06:30 PM – 07:45 PM',
    startHour24: 18,
    startMinute: 30,
    endHour24: 19,
    endMinute: 45,
    significanceEn: 'Spectacular Vedic River Aarti with floating floral lamps. Visual and devotional pinnacle.',
    significanceTe: 'వేద మంత్రోచ్ఛారణలతో పుష్కర హారతి మరియు గోదావరిలో వేలకొద్దీ ప్రమిదల దీపోత్సవం.',
    significanceHi: 'भव्य गोदावरी महा आरती एवं नदी में दीपदान का अलौकिक दृश्य।',
    recommendedGhats: ['Pushkar Ghat', 'Kotilingala Ghat']
  }
];

export interface GhatQueueStatus {
  zoneId: string;
  zoneName: string;
  teluguName: string;
  estimatedWaitMinutes: number;
  crowdLevel: 'LIGHT' | 'MODERATE' | 'BUSY' | 'CRITICAL_HOLD';
  throughputPerHour: number;
  bathingRampsOpen: number;
  currentDensity: number;
  recommendationTag: string;
}

/**
 * Calculates estimated wait time at a Ghat based on density and current capacity utilization
 */
export const calculateGhatWaitTime = (zone: Zone): GhatQueueStatus => {
  const occupancyRatio = zone.capacity > 0 ? zone.currentCount / zone.capacity : 0.5;
  
  // Base wait time: scaled by density and occupancy
  let waitMinutes = Math.round(occupancyRatio * 35 * Math.max(0.6, zone.density / 2.2));
  
  if (waitMinutes < 4) waitMinutes = 4;

  let crowdLevel: GhatQueueStatus['crowdLevel'] = 'LIGHT';
  let tag = 'Fast Entry • Minimal Wait';

  if (waitMinutes >= 45 || zone.status === 'CRITICAL') {
    crowdLevel = 'CRITICAL_HOLD';
    tag = 'Heavy Surge • Diversion Recommended';
  } else if (waitMinutes >= 25 || zone.status === 'WARNING') {
    crowdLevel = 'BUSY';
    tag = 'Moderate Wait • Move to Far Ramps';
  } else if (waitMinutes >= 12 || zone.status === 'MODERATE') {
    crowdLevel = 'MODERATE';
    tag = 'Normal Flow • 15 min avg';
  }

  // Bathing ramps active estimate
  const ramps = zone.type === 'ghat' ? (zone.capacity >= 40000 ? 12 : 8) : 4;
  const throughput = Math.round((zone.capacity * 0.4) * (1 / Math.max(1, waitMinutes / 20)));

  return {
    zoneId: zone.id,
    zoneName: zone.name,
    teluguName: zone.teluguName,
    estimatedWaitMinutes: waitMinutes,
    crowdLevel,
    throughputPerHour: throughput,
    bathingRampsOpen: ramps,
    currentDensity: zone.density,
    recommendationTag: tag
  };
};

/**
 * Evaluates all ghats and finds the best recommended low-wait alternative
 */
export const getBestGhatRecommendation = (zones: Zone[]): GhatQueueStatus | null => {
  const ghats = zones.filter(z => z.type === 'ghat');
  if (ghats.length === 0) return null;

  const statuses = ghats.map(calculateGhatWaitTime);
  // Sort ascending by wait time
  statuses.sort((a, b) => a.estimatedWaitMinutes - b.estimatedWaitMinutes);
  return statuses[0];
};
