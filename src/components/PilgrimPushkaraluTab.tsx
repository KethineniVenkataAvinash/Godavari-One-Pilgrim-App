import React, { useState } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Clock, 
  MapPin, 
  Ticket, 
  Waves, 
  ChevronRight, 
  ChevronDown, 
  Droplets, 
  Award, 
  CheckCircle2 
} from 'lucide-react';

interface PilgrimPushkaraluTabProps {
  language: 'en' | 'te' | 'hi';
  onNavigateToToken: () => void;
  onNavigateToDipPlanner: () => void;
  onNavigateToWaterQuality: () => void;
}

interface BathingDate {
  day: string;
  monthYear: string;
  occasionEn: string;
  occasionTe: string;
  occasionHi: string;
  muhurthamTime: string;
  significanceEn: string;
  significanceTe: string;
  significanceHi: string;
}

const BATHING_DATES_DATA: BathingDate[] = [
  {
    day: '26',
    monthYear: 'June 2027',
    occasionEn: 'Guru Brihaspati Transit Inception',
    occasionTe: 'గురు బృహస్పతి సింహరాశి ప్రవేశం',
    occasionHi: 'बृहस्पति सिंह राशि प्रवेश',
    muhurthamTime: '06:12 AM – 08:30 AM',
    significanceEn: 'The celestial moment Brihaspati enters Simha Rasi, marking the descent of all 3.5 crore teerthas into River Godavari.',
    significanceTe: 'సమస్త పుణ్య నదులు గోదావరిలోకి ప్రవేశించే దివ్య ప్రారంభ ఘట్టం.',
    significanceHi: 'समस्त पवित्र नदियों का गोदावरी में आगमन का पावन मुहूर्त।'
  },
  {
    day: '27',
    monthYear: 'June 2027',
    occasionEn: 'Maha Pushkaram Prarambha Snanam',
    occasionTe: 'మహా పుష్కర ప్రారంభ పుణ్యస్నానం',
    occasionHi: 'महा पुष्करालु प्रथम पावन स्नान',
    muhurthamTime: '04:18 AM – 07:15 AM (Brahma Muhurtham)',
    significanceEn: 'First official holy dip led by Vedic pontiffs and Peethadhipathis with sacred Chandi Homam at Kotilingala Ghat.',
    significanceTe: 'వేద పండితులు మరియు పీఠాధిపతులచే నిర్వహించబడే మహా ప్రారంభ స్నానం.',
    significanceHi: 'वेदमंत्रोच्चार के साथ प्रथम दिवस का पवित्र शाही स्नान।'
  },
  {
    day: '30',
    monthYear: 'June 2027',
    occasionEn: 'Shukla Ekadashi Maha Snanam',
    occasionTe: 'శుక్ల ఏకాదశి మహా పుణ్యస్నానం',
    occasionHi: 'शुक्ल एकादशी महास्नान',
    muhurthamTime: '04:45 AM – 09:00 AM',
    significanceEn: 'Highly sacred Vaishnavite day for fasting, sacred river dips, and ancestral tharpana ceremonies.',
    significanceTe: 'పితృ తర్పణాలకు మరియు విష్ణు ఆరాధనకు అత్యంత విశేషమైన పుణ్య దినం.',
    significanceHi: 'पितृ तर्पण एवं भगवान विष्णु की आराधना हेतु विशेष पुण्यकारी दिन।'
  },
  {
    day: '02',
    monthYear: 'July 2027',
    occasionEn: 'Guru Purnima Maha Snanam (Peak Day)',
    occasionTe: 'గురు పూర్ణిమ (వ్యాస పూర్ణిమ) మహా స్నానం',
    occasionHi: 'गुरु पूर्णिमा महास्नान (सर्वोच्च दिवस)',
    muhurthamTime: '04:00 AM – 11:30 AM',
    significanceEn: 'The greatest spiritual congregation day honoring Sage Vyasa with grand evening Godavari Harati over 28 ghats.',
    significanceTe: 'పుష్కరాలలో అత్యంత పవిత్రమైన రోజు. సాయంత్రం 28 ఘాట్లలో అఖండ దివ్య హారతి.',
    significanceHi: 'व्यास पूर्णिमा का महासंयोग, सायंकाल 28 घाटों पर भव्य महाआरती।'
  },
  {
    day: '04',
    monthYear: 'July 2027',
    occasionEn: 'Bahula Sankatahara Chaturthi Snanam',
    occasionTe: 'బహుళ సంకష్టహర చతుర్థి పుణ్యస్నానం',
    occasionHi: 'संकष्टी चतुर्थी पुण्यस्नान',
    muhurthamTime: '05:15 AM – 08:45 AM',
    significanceEn: 'Sacred river oblations for overcoming obstacles, followed by special prayers at Vinayaka Temple on the riverbank.',
    significanceTe: 'విఘ్న నివారణకు మరియు సంకల్ప సిద్ధికి నదీ తీరాన విశేష పూజలు.',
    significanceHi: 'बाधा मुक्ति हेतु गोदावरी तट पर विशेष विनायक पूजन एवं स्नान।'
  },
  {
    day: '07',
    monthYear: 'July 2027',
    occasionEn: 'Antya Pushkara Samapti Maha Snanam',
    occasionTe: 'అంత్య పుష్కర సమాప్తి మహా సంకల్పం',
    occasionHi: 'अंतिम पुष्करालु पूर्णाहुति स्नान',
    muhurthamTime: '04:30 AM – 07:30 PM',
    significanceEn: 'The concluding day of the 12-day festival with mega Deepotsavam where 1,00,000 floating lamps light up Akhanda Godavari.',
    significanceTe: 'లక్ష దీపోత్సవంతో ముగిసే 12 రోజుల పవిత్ర పుష్కర మహా యజ్ఞం.',
    significanceHi: 'लाखों दीपों के महादीपोत्सव के साथ 12 दिवसीय महापर्व की पूर्णाहुति।'
  }
];

export const PilgrimPushkaraluTab: React.FC<PilgrimPushkaraluTabProps> = ({
  language,
  onNavigateToToken,
  onNavigateToDipPlanner,
  onNavigateToWaterQuality
}) => {
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(3); // Default to Guru Purnima
  const [activeCultureTab, setActiveCultureTab] = useState<'events' | 'things_to_do' | 'tour_packages'>('events');

  const t = (en: string, te: string, hi: string) => {
    return language === 'te' ? te : language === 'hi' ? hi : en;
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-amber-200" />
          <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wider">
            {t('12 Sacred Days • జూలై 14 – 25, 2027', '12 పవిత్ర పుష్కర దినాలు', '12 पवित्र दिन')}
          </span>
        </div>
        <h2 className="text-xl font-black text-white">
          {t('Godavari Maha Pushkaram 2027', 'గోదావరి మహా పుష్కరాలు 2027', 'गोदावरी महा पुष्करालु 2027')}
        </h2>
        <p className="text-xs text-amber-100 mt-1">
          {t(
            'Explore the sacred bathing calendar, muhurtham schedules, cultural stages, and spiritual significance.',
            'పుణ్యస్నాన ముహూర్తాలు, విశేష పర్వదినాలు మరియు సాంస్కృతిక వేడుకల వివరాలు.',
            'पवित्र स्नान मुहूर्त, प्रमुख तिथियां एवं सांस्कृतिक कार्यक्रमों की सूची।'
          )}
        </p>
      </div>

      {/* Quick Action Pills */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onNavigateToToken}
          className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-xs hover:border-amber-400 text-center transition cursor-pointer"
        >
          <Ticket className="w-4 h-4 text-amber-600 mx-auto mb-1" />
          <span className="text-[10px] font-bold text-gray-800 block leading-tight">
            {t('Virtual e-Pass', 'ఈ-టోకెన్ పాస్', 'ई-टोकन पास')}
          </span>
        </button>

        <button
          onClick={onNavigateToDipPlanner}
          className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-xs hover:border-amber-400 text-center transition cursor-pointer"
        >
          <Clock className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
          <span className="text-[10px] font-bold text-gray-800 block leading-tight">
            {t('Dip Planner', 'ముహూర్త సమయాలు', 'स्नान योजना')}
          </span>
        </button>

        <button
          onClick={onNavigateToWaterQuality}
          className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-xs hover:border-amber-400 text-center transition cursor-pointer"
        >
          <Waves className="w-4 h-4 text-cyan-600 mx-auto mb-1" />
          <span className="text-[10px] font-bold text-gray-800 block leading-tight">
            {t('Water Quality', 'నీటి నాణ్యత', 'जल गुणवत्ता')}
          </span>
        </button>
      </div>

      {/* Bathing Dates Section (Exact Replica of Image 2) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              {t('Auspicious Days & Muhurthams', 'పుణ్యస్నాన పర్వదినాలు', 'शुभ स्नान तिथियां')}
            </span>
            <h3 className="font-extrabold text-sm text-gray-900">
              {t('Bathing Dates (పుష్కర స్నాన దినాలు)', 'స్నాన దినాలు', 'स्नान तिथियां')}
            </h3>
          </div>
          <span className="text-xs font-bold text-amber-600">6 Key Dates</span>
        </div>

        {/* 2-Column Date Card Grid (Image 2 Replica) */}
        <div className="grid grid-cols-2 gap-2.5">
          {BATHING_DATES_DATA.map((item, idx) => {
            const isSelected = selectedDateIndex === idx;
            const occasion = language === 'te' ? item.occasionTe : language === 'hi' ? item.occasionHi : item.occasionEn;

            return (
              <button
                key={idx}
                onClick={() => setSelectedDateIndex(isSelected ? null : idx)}
                className={`rounded-2xl border transition text-left cursor-pointer overflow-hidden flex flex-col justify-between ${
                  isSelected 
                    ? 'border-amber-500 ring-2 ring-amber-300 shadow-md bg-amber-50/40' 
                    : 'border-gray-200 bg-white hover:bg-gray-50 shadow-xs'
                }`}
              >
                {/* Top Number Block */}
                <div className="p-3 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
                  <span className="text-2xl font-black text-amber-600 font-mono">
                    {item.day}
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 font-semibold block leading-tight">
                      {item.monthYear}
                    </span>
                  </div>
                </div>

                {/* Bottom Label Block */}
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <h4 className="text-xs font-extrabold text-gray-900 line-clamp-2 leading-snug">
                    {occasion}
                  </h4>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100 text-[10px] text-gray-500">
                    <span className="font-mono text-amber-700 font-semibold">{item.muhurthamTime.split(' ')[0]}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition transform ${isSelected ? 'rotate-180 text-amber-600' : ''}`} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Expanded Date Detail Box */}
        {selectedDateIndex !== null && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-xl p-3.5 space-y-2 text-xs text-gray-800 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-1.5">
              <span className="font-black text-amber-900 text-sm">
                {BATHING_DATES_DATA[selectedDateIndex].day} {BATHING_DATES_DATA[selectedDateIndex].monthYear}
              </span>
              <span className="bg-amber-600 text-white font-mono font-bold px-2 py-0.5 rounded text-[10px]">
                {BATHING_DATES_DATA[selectedDateIndex].muhurthamTime}
              </span>
            </div>
            <p className="font-bold text-gray-900">
              {language === 'te' 
                ? BATHING_DATES_DATA[selectedDateIndex].occasionTe 
                : language === 'hi' 
                ? BATHING_DATES_DATA[selectedDateIndex].occasionHi 
                : BATHING_DATES_DATA[selectedDateIndex].occasionEn}
            </p>
            <p className="text-gray-700 leading-relaxed">
              {language === 'te' 
                ? BATHING_DATES_DATA[selectedDateIndex].significanceTe 
                : language === 'hi' 
                ? BATHING_DATES_DATA[selectedDateIndex].significanceHi 
                : BATHING_DATES_DATA[selectedDateIndex].significanceEn}
            </p>
          </div>
        )}
      </div>

      {/* Events, Things to Do & Tour Packages (Exact Replica of Image 3) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3">
        <h3 className="font-extrabold text-sm text-gray-900">
          {t('Events, Things to Do & Tour Packages', 'వేడుకలు & దర్శనీయ ప్యాకేజీలు', 'कार्यक्रम, दर्शन एवं यात्रा पैकेज')}
        </h3>

        {/* 3 Pills Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1 text-xs font-bold text-center">
          <button
            onClick={() => setActiveCultureTab('events')}
            className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
              activeCultureTab === 'events' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t('Events', 'వేడుకలు', 'कार्यक्रम')}
          </button>
          <button
            onClick={() => setActiveCultureTab('things_to_do')}
            className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
              activeCultureTab === 'things_to_do' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t('Things to Do', 'చేయదగినవి', 'गतिविधियां')}
          </button>
          <button
            onClick={() => setActiveCultureTab('tour_packages')}
            className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
              activeCultureTab === 'tour_packages' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t('Tour Packages', 'ప్యాకేజీలు', 'पैकेज')}
          </button>
        </div>

        {/* Tab 1: Cultural Stage Events */}
        {activeCultureTab === 'events' && (
          <div className="space-y-2 text-xs">
            <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/50 space-y-1">
              <span className="text-[10px] text-amber-700 font-bold uppercase">Classical Nadaswaram & Harikatha</span>
              <h4 className="font-extrabold text-gray-900">Shri Shubhankar De & Troupe (Triveni Stage)</h4>
              <p className="text-gray-500 text-[11px] flex items-center gap-2">
                <span><img src="/assets/icons/clock.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> 06:00 PM – 08:30 PM</span>
                <span><img src="/assets/icons/map-pin.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> Kotilingala Cultural Pandal</span>
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/50 space-y-1">
              <span className="text-[10px] text-amber-700 font-bold uppercase">Grand Godavari Maha Harati</span>
              <h4 className="font-extrabold text-gray-900">31 Vedic Priests with Chandi Saptashati Recital</h4>
              <p className="text-gray-500 text-[11px] flex items-center gap-2">
                <span><img src="/assets/icons/clock.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> 06:45 PM Daily</span>
                <span><img src="/assets/icons/map-pin.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> Pushkar Main Ghat Waterfront</span>
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Things to Do */}
        {activeCultureTab === 'things_to_do' && (
          <div className="space-y-2 text-xs text-gray-700">
            <div className="p-3 border border-gray-200 rounded-xl bg-gray-50/50">
              <strong className="block text-gray-900 mb-0.5">1. Evening Godavari Harati Boat Watching</strong>
              <span>Watch the 1,000-lamp river aarti from licensed municipal cruise boats with safety lifejackets.</span>
            </div>
            <div className="p-3 border border-gray-200 rounded-xl bg-gray-50/50">
              <strong className="block text-gray-900 mb-0.5">2. Sacred Gautama Vriksha Pradakshina</strong>
              <span>Circumambulate the historic peepal tree sanctified by Sage Gautama at Kotilingala promenade.</span>
            </div>
          </div>
        )}

        {/* Tab 3: Tour Packages */}
        {activeCultureTab === 'tour_packages' && (
          <div className="space-y-2 text-xs text-gray-700">
            <div className="p-3 border border-gray-200 rounded-xl bg-gray-50/50">
              <div className="flex justify-between items-center mb-1">
                <strong className="text-gray-900">Papikondalu 1-Day River Cruise</strong>
                <span className="text-amber-700 font-bold font-mono">APTDC Certified</span>
              </div>
              <p className="text-[11px] text-gray-600">Includes hotel pickup, scenic gorge cruise, tribal lunch at Perantapalli, and return to Rajahmundry.</p>
            </div>
          </div>
        )}
      </div>

      {/* Pushkaralu Facts Box (Image 3 Replica) */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4 shadow-sm space-y-2 text-xs text-gray-800">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-700" />
          <span className="font-extrabold text-purple-900 text-sm">
            {t('Pushkaralu Sacred Facts!', 'పుష్కరాల ఆశ్చర్యకర వాస్తవాలు!', 'पुष्करालु के पावन तथ्य!')}
          </span>
        </div>
        <p className="text-gray-700 leading-relaxed">
          {t(
            'The timing of Godavari Pushkaralu is determined by celestial planetary transit: when Jupiter (Brihaspati) enters the zodiac sign of Leo (Simha Rasi). This occurs once every 12 years and once every 144 years as Maha Pushkaram.',
            'గురుడు సింహరాశిలోకి ప్రవేశించినప్పుడు ప్రతి 12 సంవత్సరాలకు ఒకసారి గోదావరి పుష్కరాలు సంభవిస్తాయి.',
            'गुरु बृहस्पति के सिंह राशि में प्रवेश करने पर प्रत्येक 12 वर्ष में गोदावरी पुष्करालु का महापर्व आयोजित होता है।'
          )}
        </p>
      </div>
    </div>
  );
};
