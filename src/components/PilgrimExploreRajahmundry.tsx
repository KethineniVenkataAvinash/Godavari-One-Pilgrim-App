import React, { useState } from 'react';
import { 
  MapPin, 
  Compass, 
  Car, 
  Hotel, 
  Navigation, 
  PhoneCall, 
  Calendar, 
  ExternalLink, 
  ChevronRight, 
  Waves, 
  Sparkles,
  Search,
  CheckCircle2
} from 'lucide-react';

interface PilgrimExploreProps {
  language: 'en' | 'te' | 'hi';
  onNavigateToMap: () => void;
  onNavigateToParking: () => void;
}

interface Attraction {
  id: string;
  nameEn: string;
  nameTe: string;
  nameHi: string;
  category: string;
  distanceKm: string;
  descriptionEn: string;
  descriptionTe: string;
  descriptionHi: string;
  bgGradient: string;
  timing: string;
}

const ATTRACTIONS_DATA: Attraction[] = [
  {
    id: 'markandeya',
    nameEn: 'Shri Markandeya Swamy Temple',
    nameTe: 'శ్రీ మార్కండేయ స్వామి దేవాలయం',
    nameHi: 'श्री मार्कंडेय स्वामी मंदिर',
    category: 'Ancient Riverfront Shrine',
    distanceKm: '0.2 km from Kotilingala Ghat',
    descriptionEn: 'Sacred riverfront Shiva temple where Sage Markandeya conquered Yama through Shiva worship. Adjacent to main bathing steps.',
    descriptionTe: 'మార్కండేయ మహర్షి శివారాధన చేసి మృత్యుంజయుడైన పవిత్ర క్షేత్రం. ప్రధాన స్నాన ఘాట్ సమీపంలో ఉంది.',
    descriptionHi: 'पवित्र शिव मंदिर जहां ऋषि मार्कंडेय ने शिव भक्ति से मृत्यु पर विजय पाई थी।',
    bgGradient: 'from-amber-700 to-orange-800',
    timing: '04:30 AM – 09:30 PM'
  },
  {
    id: 'kotilingeswara',
    nameEn: 'Kotilingeswara Swamy Temple',
    nameTe: 'కోటిలింగేశ్వర స్వామి దేవాలయం',
    nameHi: 'कोटिलींगेश्वर स्वामी मंदिर',
    category: 'Sacred Jyotirlinga Kshetra',
    distanceKm: 'At Kotilingala Promenade',
    descriptionEn: 'Ancient temple established by Sage Gautama with 10 million lingas consecrated in cosmic worship along Akhanda Godavari.',
    descriptionTe: 'గౌతమ మహర్షిచే ప్రతిష్ఠించబడిన కోటి లింగాల పవిత్ర క్షేత్రం.',
    descriptionHi: 'महर्षि गौतम द्वारा प्रतिष्ठित पवित्र कोटि लिंग क्षेत्र।',
    bgGradient: 'from-emerald-800 to-teal-900',
    timing: '05:00 AM – 10:00 PM'
  },
  {
    id: 'iskcon',
    nameEn: 'ISKCON Godavari Riverfront Temple',
    nameTe: 'ఇస్కాన్ గోదావరి దివ్య క్షేత్రం',
    nameHi: 'इस्कॉन गोदावरी भव्य मंदिर',
    category: 'Harinam & Spiritual Park',
    distanceKm: '0.4 km from Saraswati Ghat',
    descriptionEn: 'Spiritual cultural center with serene river gardens, continuous Mahamantra kirtan, and sacred Govinda prasadam.',
    descriptionTe: 'నదీ తీరాన ఆహ్లాదకరమైన ఉద్యానవనాలు, నిరంతర హరినామ సంకీర్తన మరియు గోవింద ప్రసాదం.',
    descriptionHi: 'गोदावरी तट पर स्थित भव्य इस्कॉन मंदिर एवं महाप्रसाद केंद्र।',
    bgGradient: 'from-blue-800 to-indigo-900',
    timing: '04:30 AM – 08:30 PM'
  },
  {
    id: 'dowleswaram',
    nameEn: 'Dowleswaram Barrage & Cotton Museum',
    nameTe: 'ధవళేశ్వరం బ్యారేజీ & కాటన్ మ్యూజియం',
    nameHi: 'धवलेश्वरम बैराज एवं कॉटन संग्रहालय',
    category: 'Engineering Marvel & River Heritage',
    distanceKm: '6.5 km from City Center',
    descriptionEn: 'Historical 1852 barrage built by Sir Arthur Cotton transforming Konaseema into the Annapurna of India. Scenic walkway & museum.',
    descriptionTe: 'సర్ ఆర్థర్ కాటన్ నిర్మించిన చారిత్రాత్మక బ్యారేజీ మరియు గోదావరి డెల్టా మ్యూజియం.',
    descriptionHi: 'सर आर्थर कॉटन द्वारा निर्मित ऐतिहासिक बैराज एवं संग्रहालय।',
    bgGradient: 'from-cyan-800 to-blue-900',
    timing: '09:00 AM – 06:00 PM'
  },
  {
    id: 'papikondalu',
    nameEn: 'Papikondalu Godavari River Gorge',
    nameTe: 'పాపికొండలు దివ్య నదీ విహారం',
    nameHi: 'पापिकोंडालु गोदावरी क्रूज',
    category: 'Scenic Hill Cruise & Eco-Tour',
    distanceKm: 'Day-Cruise Departure from Purushothapatnam',
    descriptionEn: 'Spectacular river cruise cutting through the Eastern Ghats gorge with emerald waters and bamboo boat experiences.',
    descriptionTe: 'తూర్పు కనుమల మధ్య పవిత్ర గోదావరి నదీ జలాల్లో ఆహ్లాదకరమైన బోటు ప్రయాణం.',
    descriptionHi: 'पूर्वी घाटों के मध्य गोदावरी नदी पर अद्वितीय प्राकृतिक क्रूज यात्रा।',
    bgGradient: 'from-purple-800 to-slate-900',
    timing: '07:00 AM Departure'
  }
];

export const PilgrimExploreRajahmundry: React.FC<PilgrimExploreProps> = ({
  language,
  onNavigateToMap,
  onNavigateToParking
}) => {
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [activePlanCategory, setActivePlanCategory] = useState<string>('how_to_reach');

  const t = (en: string, te: string, hi: string) => {
    return language === 'te' ? te : language === 'hi' ? hi : en;
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0A3A40] to-[#124C44] rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
            {t('Explore Sacred Rajahmundry', 'రాజమండ్రి దర్శనీయ ప్రదేశాలు', 'राजमहेंद्री दर्शन')}
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-white">
          {t('Sacred Ghats, Temples & River Heritage', 'పుష్కర క్షేత్రాలు & దేవాలయాలు', 'तीर्थ, मंदिर एवं नदी धरोहर')}
        </h2>
        <p className="text-xs text-gray-200 mt-1">
          {t(
            'Explore ancient shrines consecrated along Akhanda Godavari, boat cruise packages, and transit guides.',
            'అఖండ గోదావరి తీరాన వెలసిన పవిత్ర క్షేత్రాలు, దర్శనీయ ప్రదేశాలు మరియు రవాణా మార్గాలు.',
            'अखंड गोदावरी तट पर स्थित प्राचीन मंदिर, क्रूज व यात्रा मार्गदर्शिका।'
          )}
        </p>
      </div>

      {/* Plan Your Pilgrimage Grid (Exact Match to Image 2 & 3) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-gray-900">
            {t('Plan Your Pilgrimage', 'తీర్థయాత్ర ప్రణాళిక', 'अपनी तीर्थयात्रा की योजना बनाएं')}
          </h3>
          <span className="text-xs text-amber-600 font-bold flex items-center gap-0.5">
            {t('Quick Transit', 'రవాణా సౌకర్యాలు', 'त्वरित सेवा')}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {/* 1. How to reach */}
          <button
            onClick={() => setActivePlanCategory('how_to_reach')}
            className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
              activePlanCategory === 'how_to_reach' ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <span><img src="/assets/icons/plane.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /></span>
            </div>
            <span className="text-[10px] leading-tight">{t('How to Reach', 'చేరుకొనే విధానం', 'कैसे पहुंचे')}</span>
          </button>

          {/* 2. Where to stay */}
          <button
            onClick={() => setActivePlanCategory('where_to_stay')}
            className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
              activePlanCategory === 'where_to_stay' ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
              <span><img src="/assets/icons/hotel.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /></span>
            </div>
            <span className="text-[10px] leading-tight">{t('Where to Stay', 'వసతి కేంద్రాలు', 'कहाँ ठहरें')}</span>
          </button>

          {/* 3. Ghat Directions */}
          <button
            onClick={onNavigateToMap}
            className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition cursor-pointer flex flex-col items-center justify-center gap-1.5"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-tight">{t('Ghat Routes', 'ఘాట్ మార్గం', 'घाट मार्ग')}</span>
          </button>

          {/* 4. Peripheral Parking */}
          <button
            onClick={onNavigateToParking}
            className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition cursor-pointer flex flex-col items-center justify-center gap-1.5"
          >
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-tight">{t('Parking Hubs', 'పార్కింగ్', 'पार्किंग')}</span>
          </button>
        </div>

        {/* Selected Plan Details Card */}
        {activePlanCategory === 'how_to_reach' && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-gray-800 space-y-1.5">
            <strong className="text-amber-900 block font-bold">
              {t('Official Transit Gateways to Rajahmundry:', 'రాజమండ్రి చేరుకొనే ప్రధాన మార్గాలు:', 'राजमहेंद्री पहुँचने के प्रमुख साधन:')}
            </strong>
            <p><img src="/assets/icons/train-front.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> <strong>Train:</strong> Rajahmundry (RJY) A1-Category Junction on Howrah–Chennai mainline with 120+ special Pushkaralu trains.</p>
            <p><img src="/assets/icons/plane.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> <strong>Flight:</strong> Rajahmundry Domestic Airport (Madhurapudi) with daily direct flights from Hyderabad, Bengaluru, Chennai.</p>
            <p><img src="/assets/icons/bus.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> <strong>APSRTC Bus:</strong> 2,500 dedicated electric & super-luxury buses operating from 6 satellite peripheral bus stations.</p>
          </div>
        )}

        {activePlanCategory === 'where_to_stay' && (
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-gray-800 space-y-1.5">
            <strong className="text-blue-900 block font-bold">
              {t('Pilgrim Accommodation & Rest Centers:', 'తీర్థయాత్రికుల వసతి సౌకర్యాలు:', 'तीर्थयात्रियों हेतु आवास सुविधाएं:')}
            </strong>
            <p><img src="/assets/icons/tent.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> <strong>Tented Mega Pilgrim Cities:</strong> 50,000-bed sanitized pilgrim pandals with lockers at Bommuru and Morampudi.</p>
            <p><img src="/assets/icons/building2.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> <strong>TTD & Free Choultries:</strong> Free community halls with continuous pure drinking water and clean restrooms.</p>
            <p><img src="/assets/icons/hotel.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> <strong>Hotels & Lodges:</strong> State Tourism-registered hotels with standardized tariff caps enforced by district magistrate.</p>
          </div>
        )}
      </div>

      {/* Attractions List (Image 2 Replica) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-sm text-gray-900">
            {t('Attractions of Godavari Pushkaralu', 'పుష్కర దర్శనీయ క్షేత్రాలు', 'पुष्करालु के प्रमुख आकर्षण')}
          </h3>
          <span className="text-[11px] text-gray-500 font-semibold">5 Must-Visit</span>
        </div>

        <div className="space-y-3">
          {ATTRACTIONS_DATA.map(attraction => {
            const name = language === 'te' ? attraction.nameTe : language === 'hi' ? attraction.nameHi : attraction.nameEn;
            const desc = language === 'te' ? attraction.descriptionTe : language === 'hi' ? attraction.descriptionHi : attraction.descriptionEn;

            return (
              <div
                key={attraction.id}
                onClick={() => setSelectedAttraction(attraction)}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row"
              >
                {/* Visual Header Block */}
                <div className={`sm:w-36 h-28 sm:h-auto bg-gradient-to-tr ${attraction.bgGradient} p-3 flex flex-col justify-between text-white shrink-0`}>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-black/30 px-2 py-0.5 rounded w-fit">
                    {attraction.category}
                  </span>
                  <div className="text-[10px] text-gray-200">
                    <span>{attraction.timing}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-amber-700">
                        {name}
                      </h4>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                        {attraction.distanceKm}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                      {desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2 text-[11px]">
                    <span className="text-amber-700 font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {t('View Temple Guide', 'వివరాలు చూడండి', 'विवरण देखें')}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nearby Famous Pilgrimages Banner (Image 3 Bottom Replica) */}
      <div className="bg-gradient-to-br from-[#122A26] to-[#0A1A18] rounded-2xl p-4 text-white shadow-md space-y-2">
        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
          {t('Nearby Pancharama & Holy Shrines', 'సమీప ప్రసిద్ధ పంచారామ క్షేత్రాలు', 'निकटवर्ती पंचाराम क्षेत्र')}
        </span>
        <h4 className="font-black text-base text-white">
          Draksharamam, Annavaram & Samalkota
        </h4>
        <p className="text-xs text-gray-300 leading-relaxed">
          {t(
            'Special connecting electric shuttle buses operate daily from Rajahmundry to Draksharamam Bhimeswara Swamy (Pancharama Kshetra) and Sri Veera Venkata Satyanarayana Swamy Temple, Annavaram.',
            'ద్రాక్షారామం భీమేశ్వర స్వామి మరియు అన్నవరం సత్యనారాయణ స్వామి దేవాలయాలకు ప్రత్యేక ఎలక్ట్రిక్ బస్సులు అందుబాటులో ఉన్నాయి.',
            'द्राक्षारामम एवं अन्नवरम हेतु राजमहेंद्री से विशेष सीधी बस सेवा उपलब्ध है।'
          )}
        </p>
      </div>

      {/* Attraction Detail Modal */}
      {selectedAttraction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3.5">
            <div className={`p-4 rounded-xl bg-gradient-to-tr ${selectedAttraction.bgGradient} text-white`}>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                {selectedAttraction.category}
              </span>
              <h3 className="text-lg font-black text-white mt-1">
                {language === 'te' ? selectedAttraction.nameTe : language === 'hi' ? selectedAttraction.nameHi : selectedAttraction.nameEn}
              </h3>
              <p className="text-xs text-gray-200 mt-1">
                <img src="/assets/icons/map-pin.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> {selectedAttraction.distanceKm} • Timings: {selectedAttraction.timing}
              </p>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed">
              {language === 'te' ? selectedAttraction.descriptionTe : language === 'hi' ? selectedAttraction.descriptionHi : selectedAttraction.descriptionEn}
            </p>

            <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-xs space-y-1">
              <span className="font-bold text-gray-900 block">Pilgrim Guidelines:</span>
              <span className="text-gray-600 block">• Traditional dress code recommended for darshan.</span>
              <span className="text-gray-600 block">• Free footwear cloakroom and locker facilities available.</span>
            </div>

            <button
              onClick={() => setSelectedAttraction(null)}
              className="w-full py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
