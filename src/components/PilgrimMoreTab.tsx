import galleryPhotos from '../data/gallery.json';
import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Megaphone, 
  HelpCircle, 
  Search, 
  BookOpen, 
  MapPin, 
  Image as ImageIcon, 
  FileText, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles,
  X,
  Lock,
  Flame,
  Award,
  PhoneCall,
  Navigation,
  Utensils,
  HeartPulse,
  Activity,
  Compass,
  Waves,
  Radio,
  CloudSun,
  Mic,
  Volume2,
  ShieldAlert,
  Clock,
  UserCheck
} from 'lucide-react';
import { BiometricVerification, BiometricCheckInRecord } from './BiometricVerification';
import { AP_MINISTERS_AND_LEADERSHIP } from '../data/ministersData';
import { audioEngine } from '../utils/audioAlarm';

interface PilgrimMoreTabProps {
  language: 'en' | 'te' | 'hi';
  onLanguageChange: (lang: 'en' | 'te' | 'hi') => void;
  onNavigateSubfeature: (feature: string) => void;
  devoteeName?: string;
  regId?: string;
  assignedGhat?: string;
  swayamSlot?: string;
}

export const PilgrimMoreTab: React.FC<PilgrimMoreTabProps> = ({
  language,
  onLanguageChange,
  onNavigateSubfeature,
  devoteeName = 'Avinash Kumar',
  regId = 'PK-2027-8894',
  assignedGhat = 'Pushkar Ghat (Main & VIP)',
  swayamSlot = 'Brahma Muhurtham (04:30 - 06:00 AM)',
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  React.useEffect(() => {
    if (!activeModal) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setActiveModal(null); };
    const onBack = () => setActiveModal(null);
    window.addEventListener('keydown', onKey);
    window.addEventListener('popstate', onBack);
    return () => {window.removeEventListener('keydown', onKey);window.removeEventListener('popstate', onBack);};
  }, [activeModal]);
  const [showSevaBiometricModal, setShowSevaBiometricModal] = useState<boolean>(false);
  const [isRedirectingToSeva, setIsRedirectingToSeva] = useState<boolean>(false);
  const [_isSevaBiometricVerified, setIsSevaBiometricVerified] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('g1_seva_bio_verified') === 'true';
    } catch {
      return false;
    }
  });

  const t = (en: string, te: string, hi: string) => {
    return language === 'te' ? te : language === 'hi' ? hi : en;
  };

  // Grouped menu sections featuring Pushkaralu Public Features with clean names (no feature numbers)
  const featureGroups = [
    {
      title: t('SACRED SNANAM & GHAT SERVICES', 'పుణ్యస్నాన ఘాట్లు & సేవలు', 'पवित्र स्नान एवं घाट सेवाएं'),
      items: [
        {
          id: 'ghats_crowd',
          title: t('Ghat Crowds & Smart Wait Times', 'ఘాట్ రద్దీ & స్మార్ట్ వేచి ఉండే సమయం', 'घाट भीड़ एवं स्मार्ट प्रतीक्षा समय'),
          subtitle: t('Real-time optical flow & lowest wait recommendations', 'కనిష్ట వేచి ఉండే సమయంతో స్మార్ట్ ఘాట్ సిఫార్సు', 'न्यूनतम प्रतीक्षा समय युक्त स्मार्ट घाट सुझाव'),
          icon: Waves,
          color: 'text-cyan-700 bg-cyan-50 border-cyan-200',
          badge: t('Live Wait Times', 'లైవ్ సమయాలు', 'लाइव समय'),
          action: () => onNavigateSubfeature('home')
        },
        {
          id: 'snanam_schedule',
          title: t('Sacred Snanam Muhurtham Schedule', 'పుణ్యస్నాన ముహూర్త కాల పట్టిక', 'पवित्र स्नान मुहूर्त समय-सारणी'),
          subtitle: t('12 sacred days timing windows & Brihaspati transit', '12 రోజుల పవిత్ర ముహూర్త వేళలు', '12 पवित्र दिवस स्नान मुहूर्त'),
          icon: Clock,
          color: 'text-amber-700 bg-amber-50 border-amber-200',
          badge: t('Muhurthams', 'ముహూర్తాలు', 'मुहूर्त'),
          action: () => onNavigateSubfeature('snanam')
        },
        {
          id: 'dip_planner',
          title: t('Personalized Holy Dip Planner', 'వ్యక్తిగత పవిత్ర స్నాన ప్రణాళిక', 'व्यक्तिगत पवित्र स्नान योजना'),
          subtitle: t('Elder-friendly ramps, family time slots & shuttles', 'వయోవృద్ధుల ర్యాంప్‌లు & అనుకూల సమయాలు', 'वरिष्ठ नागरिक रैंप व अनुकूल समय'),
          icon: Compass,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          badge: t('Planner', 'ప్లానర్', 'योजना'),
          action: () => onNavigateSubfeature('planner')
        },
        {
          id: 'virtual_queue',
          title: t('Virtual Bathing Queue Token (E-QMS)', 'వర్చువల్ స్నాన క్యూ టోకెన్ (E-QMS)', 'वर्चुअल स्नान कतार टोकन (E-QMS)'),
          subtitle: t('Server-issued digital token & live gate call', 'డిజిటల్ టోకెన్ మరియు లైవ్ గేట్ కాల్', 'डिजिटल टोकन एवं लाइव गेट कॉल'),
          icon: Sparkles,
          color: 'text-purple-700 bg-purple-50 border-purple-200',
          badge: t('E-Token', 'టోకెన్', 'टोकन'),
          action: () => onNavigateSubfeature('token')
        },
        {
          id: 'water_purity',
          title: t('River Water Purity & IoT Sensor Index', 'గోదావరి జలాల స్వచ్ఛత & ఐవోటీ పర్యవేక్షణ', 'नदी जल शुद्धता एवं IoT सूचकांक'),
          subtitle: t('CWC flow velocity, pH, dissolved oxygen & safe buoy status', 'లైవ్ పీహెచ్, ఆక్సిజన్ & బ్యారేజీ డిశ్చార్జ్', 'लाइव pH, ऑक्सीजन व सुरक्षा स्थिति'),
          icon: Activity,
          color: 'text-blue-700 bg-blue-50 border-blue-200',
          badge: t('IoT Purity', 'స్వచ్ఛత', 'शुद्धता'),
          action: () => onNavigateSubfeature('water_quality')
        }
      ]
    },
    {
      title: t('SAFETY, EMERGENCY & FAMILY PROTECTION', 'రక్షణ, అత్యవసర & కుటుంబ భద్రత', 'सुरक्षा, आपातकाल एवं परिवार सुरक्षा'),
      items: [
        {
          id: 'emergency_sos',
          title: t('Emergency SOS Reporting & Speed Dial', 'అత్యవసర ఎస్ఓఎస్ రిపోర్టింగ్ & స్పీడ్ డయల్', 'आपातकालीन एसओएस रिपोर्टिंग'),
          subtitle: t('1-Tap GPS alert to Police 112, Ambulance 108 & SDRF', 'పోలీస్ 112, అంబులెన్స్ 108 కు తక్షణ జీపీఎస్ అలర్ట్', 'पुलिस 112 व एम्बुलेंस 108 को जीपीएस अलर्ट'),
          icon: HeartPulse,
          color: 'text-red-700 bg-red-50 border-red-200',
          badge: t('Emergency SOS', 'ఎస్ఓఎస్', 'एसओएस'),
          action: () => onNavigateSubfeature('sos')
        },
        {
          id: 'sos_tracker',
          title: t('Live SOS Incident Tracking', 'లైవ్ ఎస్ఓఎస్ కేసు ట్రాకింగ్', 'लाइव एसओएस घटना ट्रैकिंग'),
          subtitle: t('State machine: Dispatched → En Route → On Scene', 'రెస్పాండర్ లొకేషన్ మరియు పురోగతి', 'घटना प्रगति व रिस्पॉन्डर स्थिति'),
          icon: Radio,
          color: 'text-orange-700 bg-orange-50 border-orange-200',
          badge: t('Live Tracking', 'లైవ్ ట్రాకింగ్', 'लाइव ट्रैकिंग'),
          action: () => onNavigateSubfeature('sos')
        },
        {
          id: 'family_radar',
          title: t('Family Safety Radar & Safe Circle', 'కుటుంబ రక్షణ రాడార్ & దూరపు హెచ్చరిక', 'पारिवारिक सुरक्षा रडार'),
          subtitle: t('Proximity geofence & separation alert for elders/children', 'పిల్లలు, వృద్ధుల దూరపు హెచ్చరిక వ్యవస్థ', 'बच्चे व बुजुर्गों हेतु निकटता अलर्ट'),
          icon: UserCheck,
          color: 'text-teal-700 bg-teal-50 border-teal-200',
          badge: t('Safety Circle', 'రక్షణ సర్కిల్', 'सुरक्षा घेरा'),
          action: () => onNavigateSubfeature('family')
        },
        {
          id: 'lost_found_desk',
          title: t('Lost & Found Desk & AI Matching', 'తప్పిపోయిన వారి నమోదు & ఫోటో పోలిక', 'खोया-पाया पंजीकरण व मिलान'),
          subtitle: t('Cross-ghat citizen registry with weighted similarity scoring', '5 ఘాట్లలో తప్పిపోయిన వారి అన్వేషణ', 'सभी घाटों पर लापता परिजनों की खोज'),
          icon: Search,
          color: 'text-blue-700 bg-blue-50 border-blue-200',
          badge: t('AI Match', 'ఏఐ పోలిక', 'एआई मिलान'),
          action: () => onNavigateSubfeature('lost_found')
        },
        {
          id: 'emergency_helpdesk',
          title: t('24x7 Pushkar Emergency Helpdesk Directory', '24x7 అత్యవసర హెల్ప్‌లైన్లు & డెస్క్‌లు', '24x7 आपातकालीन सहायता केंद्र'),
          subtitle: t('Direct dial to Police, SDRF, Medical Posts & Childline', 'టోల్-ఫ్రీ నంబర్లు మరియు కంట్రోల్ రూమ్', 'टोल-फ्री नंबर व सहायता डेस्क'),
          icon: PhoneCall,
          color: 'text-rose-700 bg-rose-50 border-rose-200',
          badge: t('24x7 Support', '24x7 సహాయం', '24x7 सहायता'),
          action: () => setActiveModal('helplines')
        },
        {
          id: 'dos_donts_guide',
          title: t("Pilgrim Safety Guidelines: Do's & Don'ts", 'భక్తుల భద్రతా నియమాలు (చేయవలసినవి / చేయకూడనివి)', 'तीर्थयात्री सावधानियां व नियम'),
          subtitle: t('Official AP Police & Disaster Management instructions', 'నదీ స్నాన నిబంధనలు మరియు క్రమశిక్షణ', 'नदी स्नान व सुरक्षा दिशा-निर्देश'),
          icon: ShieldAlert,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          badge: t('Guidelines', 'నియమాలు', 'नियम'),
          action: () => setActiveModal('dos_donts')
        },
        {
          id: 'offline_sync_resilience',
          title: t('Offline Storage & Resilient Sync Engine', 'ఆఫ్‌లైన్ భద్రత & రెసిలియంట్ సింక్ వ్యవస్థ', 'ऑफ़लाइन सुरक्षा एवं डेटा बैकअप'),
          subtitle: t('Encrypted on-device queue for SOS and forms without internet', 'నెట్‌వర్క్ లేకున్నా పనిచేసే భద్రతా వ్యవస్థ', 'इंटरनेट के बिना भी आपातकालीन कार्य'),
          icon: ShieldCheck,
          color: 'text-slate-700 bg-slate-50 border-slate-200',
          badge: t('Offline Sync', 'ఆఫ్‌లైన్ సింక్', 'ऑफ़लाइन सिंक'),
          action: () => setActiveModal('offline_sync')
        }
      ]
    },
    {
      title: t('TRANSIT, FACILITIES & FREE SEVA', 'రవాణా, సౌకర్యాలు & ఉచిత సేవలు', 'परिवहन, सुविधाएं एवं निःशुल्क सेवा'),
      items: [
        {
          id: 'gis_facilities',
          title: t('Ghat Maps & Nearby Public Amenities', 'ఘాట్ పటం & సమీప పౌర సౌకర్యాలు', 'घाट मानचित्र एवं नागरिक सुविधाएं'),
          subtitle: t('RO water booths, bio-toilets, first aid & accessible ramps', 'ఆర్వో వాటర్, మొబైల్ టాయిలెట్లు & మెడికల్ క్యాంపులు', 'पेयजल बूथ, शौचालय व प्राथमिक चिकित्सा'),
          icon: MapPin,
          color: 'text-red-700 bg-red-50 border-red-200',
          badge: t('Ghat Amenities', 'సౌకర్యాలు', 'सुविधाएं'),
          action: () => onNavigateSubfeature('map')
        },
        {
          id: 'annadanam_centers',
          title: t('Maha Annadanam & Free Satvik Meals', 'మహా అన్నదాన కేంద్రాలు & ఉచిత భోజనం', 'महा अन्नदान एवं प्रसादम केंद्र'),
          subtitle: t('TTD & ISKCON 24x7 dining pandals with directions', 'రోజంతా నిరంతర ఉచిత భోజన శాలలు', '24x7 निःशुल्क भोजन केंद्र'),
          icon: Utensils,
          color: 'text-orange-700 bg-orange-50 border-orange-200',
          badge: t('Free Meals', 'ఉచిత భోజనం', 'निःशुल्क भोजन'),
          action: () => setActiveModal('annadanam_finder')
        },
        {
          id: 'parking_shuttles',
          title: t('Parking Hubs & Free RTC Pushkar Shuttles', 'పార్కింగ్ కేంద్రాలు & ఉచిత ఎలక్ట్రిక్ బస్సులు', 'पार्किंग एवं निःशुल्क बस सेवा'),
          subtitle: t('Satellite parking bays with 3-minute electric bus shuttles', '4 ఉపగ్రహ పార్కింగ్ ప్రదేశాలు & బస్సు రూట్లు', 'सैटेलाइट पार्किंग एवं शटल बसें'),
          icon: Navigation,
          color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
          badge: t('Transit & Parking', 'రవాణా', 'परिवहन'),
          action: () => onNavigateSubfeature('transport')
        },
        {
          id: 'safe_wayfinder',
          title: t('Safe Pedestrian Walking Wayfinder', 'సురక్షిత పాదచారుల రూట్ నావిగేటర్', 'सुरक्षित पैदल मार्ग नेविगेटर'),
          subtitle: t('Turn-by-turn routing avoiding barricades and congestion', 'రద్దీ లేని ప్రత్యామ్నాయ కాలిబాటలు', 'भीड़-मुक्त सुरक्षित पैदल पथ'),
          icon: Navigation,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          badge: t('Wayfinder', 'రూట్ గైడ్', 'मार्गदर्शक'),
          action: () => onNavigateSubfeature('wayfinder')
        },
        {
          id: 'camp_pin_locator',
          title: t('GPS Camp & Vehicle Return Locator', 'నా క్యాంప్ / వాహన లొకేషన్ పిన్ సేవర్', 'शिविर एवं वाहन जीपीएस पिन'),
          subtitle: t('Saved GPS tent coordinates with return compass', 'మీ బస లేదా వాహనాన్ని తిరిగి సులభంగా చేరుకోండి', 'अपने तंबू या वाहन पर आसानी से लौटें'),
          icon: MapPin,
          color: 'text-teal-700 bg-teal-50 border-teal-200',
          badge: t('Camp Locator', 'లొకేషన్ పిన్', 'जीपीएस पिन'),
          action: () => onNavigateSubfeature('camp')
        },
        {
          id: 'weather_hydrology',
          title: t('Official IMD Weather & CWC Hydrology', 'అధికారిక వాతావరణం & నదీ ప్రవాహ వేగం', 'आधिकारिक मौसम एवं नदी बहाव'),
          subtitle: t('Heat index, hourly forecast & barrage discharge status', 'ఎండ తీవ్రత సూచిక మరియు గంటల వారీ అంచనా', 'तापमान सूचकांक एवं बैराज स्थिति'),
          icon: CloudSun,
          color: 'text-amber-700 bg-amber-50 border-amber-200',
          badge: t('Live Weather', 'వాతావరణం', 'मौसम'),
          action: () => setActiveModal('weather_cwc')
        }
      ]
    },
    {
      title: t('AI VOICE & MULTILINGUAL GUIDANCE', 'ఏఐ వాయిస్ & బహుభాషా సహాయం', 'एआई आवाज एवं बहुभाषी सहायता'),
      items: [
        {
          id: 'ai_guide',
          title: t('Godavari Mitra Multilingual AI Guide', 'గోదావరి మిత్ర ఏఐ సహాయకుడు', 'गोदावरी मित्र एआई सहायक'),
          subtitle: t('24x7 intelligent voice & text assistant for rituals and navigation', 'పూజా విధానాలు మరియు సేవలపై తక్షణ ఏఐ సమాధానాలు', 'पूजा विधि एवं मार्ग हेतु एआई सहायता'),
          icon: Sparkles,
          color: 'text-purple-700 bg-purple-50 border-purple-200',
          badge: t('AI Mitra', 'ఏఐ మిత్ర', 'एआई मित्र'),
          action: () => setActiveModal('godavari_mitra')
        },
        {
          id: 'voice_audio',
          title: t('Voice Commands & Spoken Audio Guidance', 'వాయిస్ కమాండ్లు & ధ్వని మార్గదర్శనం', 'आवाज निर्देश एवं श्रव्य मार्गदर्शन'),
          subtitle: t('Sarvam & Bhashini speech recognition and audio synthesis', 'తెలుగు, హిందీ, ఇంగ్లీష్ స్పీచ్ సదుపాయం', 'तेलुगु, हिंदी व अंग्रेजी वाक् सहायता'),
          icon: Mic,
          color: 'text-teal-700 bg-teal-50 border-teal-200',
          badge: t('Voice Audio', 'వాయిస్', 'वॉइस'),
          action: () => setActiveModal('voice_commands')
        },
        {
          id: 'google_maps_direct_item',
          title: t('Real Google Maps Navigator (All Ghats & Hubs)', 'గూగుల్ మ్యాప్స్ ప్రత్యక్ష నావిగేషన్', 'गूगल मैप्स लाइव नेविगेटर'),
          subtitle: t('1-Tap turn-by-turn directions to all 28 Pushkaralu ghats', 'అన్ని ఘాట్లకు ప్రత్యక్ష గూగుల్ మ్యాప్స్ లింకులు', 'सभी 28 घाटों हेतु गूगल मैप्स लिंक'),
          icon: Navigation,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          badge: t('Google Maps', 'గూగుల్ మ్యాప్స్', 'गूगल मैप्स'),
          action: () => setActiveModal('google_maps_direct')
        }
      ]
    },
    {
      title: t('CULTURE, HERITAGE & SACRED LORE', 'సంస్కృతి, వేడుకలు & గ్రంథ నిధి', 'संस्कृति, उत्सव एवं पौराणिक महत्व'),
      items: [
        {
          id: 'cultural_events',
          title: t('Pushkaralu Cultural Stages & Daily Events', 'సాంస్కృతిక వేడుకలు & మహా హారతి', 'सांस्कृतिक कार्यक्रम एवं महा आरती'),
          subtitle: t('Vedic rituals, classical dance, music & evening Godavari Harathi', 'రోజువారీ సాంస్కృతిక ప్రదర్శనలు & హారతి వేళలు', 'दैनिक सांस्कृतिक मंच एवं आरती कार्यक्रम'),
          icon: Calendar,
          color: 'text-amber-700 bg-amber-50 border-amber-200',
          badge: t('Cultural Events', 'వేడుకలు', 'उत्सव'),
          action: () => onNavigateSubfeature('events')
        },
        {
          id: 'tourism_heritage',
          title: t('Rajahmundry Tourism & Heritage Trail', 'రాజమండ్రి పర్యాటక దర్శిని & చారిత్రక ప్రదేశాలు', 'राजमहेंद्री पर्यटन एवं दर्शनीय स्थल'),
          subtitle: t('Historic temples, Sir Arthur Cotton Barrage & Godavari Arch', 'పురాతన ఆలయాలు మరియు పర్యాటక ఆకర్షణలు', 'प्राचीन मंदिर व ऐतिहासिक दर्शनीय स्थल'),
          icon: Compass,
          color: 'text-teal-700 bg-teal-50 border-teal-200',
          badge: t('Tourism Trail', 'చారిత్రక ప్రదేశాలు', 'पर्यटन स्थल'),
          action: () => onNavigateSubfeature('explore')
        },
        {
          id: 'study_lore',
          title: t('Study on Godavari Pushkaralu & Vedic Lore', 'పుష్కరాల ప్రాశస్త్యం & ఆధ్యాత్మిక విశిష్టత', 'गोदावरी पुष्करालु का आध्यात्मिक महत्व'),
          subtitle: t('Brihaspati in Simha Rasi, Skanda Purana scriptures & health virtues', 'స్కంద పురాణం మరియు నదీ స్నాన ఫలం', 'स्कंद पुराण एवं नदी स्नान पुण्य'),
          icon: BookOpen,
          color: 'text-pink-700 bg-pink-50 border-pink-200',
          badge: t('Vedic Lore', 'పురాణం', 'पुराण'),
          action: () => setActiveModal('study')
        },
        {
          id: 'official_announcements',
          title: t('Key Official Announcements & Press Bulletins', 'ముఖ్యమైన అధికారిక ప్రభుత్వ ప్రకటనలు', 'आधिकारिक घोषणाएं एवं प्रेस विज्ञप्ति'),
          subtitle: t('Government gazette orders, SCR trains & VIP flow advisories', 'ఏపీ ప్రభుత్వ తాజా ఉత్తర్వులు & రైల్వే సమాచారం', 'सरकारी अधिसूचनाएं व ट्रेन सूचनाएं'),
          icon: Megaphone,
          color: 'text-orange-700 bg-orange-50 border-orange-200',
          badge: t('Govt Notices', 'ప్రకటనలు', 'अधिसूचनाएं'),
          action: () => setActiveModal('announcements')
        },
        {
          id: 'spiritual_gallery',
          title: t('Spiritual Photo Gallery', 'పుష్కర ఆధ్యాత్మిక చిత్రమాలిక', 'दिव्य छायाचित्र दीर्घा'),
          subtitle: t('High-resolution photos of Pushkar Ghat, Harathi & Godavari Bridge', 'రమణీయమైన గోదావరి నదీ తీర దృశ్యాలు', 'मनोरम घाट एवं आरती के दृश्य'),
          icon: ImageIcon,
          color: 'text-purple-700 bg-purple-50 border-purple-200',
          badge: t('HD Gallery', 'చిత్రమాలిక', 'दीर्घा'),
          action: () => setActiveModal('gallery')
        },
        {
          id: 'publications_guides',
          title: t('Official Pilgrim Publications & Offline Guides', 'అధికారిక పుష్కర దర్శిని పత్రికలు & పీడీఎఫ్', 'आधिकारिक तीर्थयात्री मार्गदर्शिका'),
          subtitle: t('Downloadable maps, mantras and emergency directories', 'ఆఫ్‌లైన్ చదువుకునేందుకు పీడీఎఫ్ గైడ్లు', 'ऑफ़लाइन अध्ययन हेतु पीडीएफ गाइड'),
          icon: FileText,
          color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
          badge: t('PDF Guides', 'పీడీఎఫ్ గైడ్లు', 'पीडीएफ गाइड'),
          action: () => setActiveModal('publications')
        }
      ]
    },
    {
      title: t('GOVERNANCE & OFFICIAL POLICIES', 'ప్రభుత్వం & చట్టపరమైన సమాచారం', 'शासन एवं कानूनी दिशा-निर्देश'),
      items: [
        {
          id: 'top_5_leadership',
          title: t('Top 5 National & State Leadership Directory', 'ప్రధాన జాతీయ & రాష్ట్ర నాయకత్వం (5)', 'शीर्ष 5 राष्ट्रीय एवं राज्य नेतृत्व'),
          subtitle: t('Blessings from PM Narendra Modi, CM Chandrababu Naidu & Ministers', 'ప్రధానమంత్రి, ముఖ్యమంత్రి మరియు మంత్రుల సందేశాలు', 'प्रधानमंत्री व मुख्यमंत्री के संदेश'),
          icon: Award,
          color: 'text-amber-700 bg-amber-50 border-amber-200',
          badge: t('Leadership', 'నాయకత్వం', 'नेतृत्व'),
          action: () => setActiveModal('ap_ministers')
        },
        {
          id: 'terms_legal',
          title: t('Terms of Service', 'సేవా నిబంధనలు', 'सेवा की शर्तें'),
          subtitle: t('Official conditions of use for Godavari One public platform', 'నిబంధనలు మరియు వినియోగ షరతులు', 'आधिकारिक उपयोग की शर्तें'),
          icon: FileText,
          color: 'text-gray-700 bg-gray-50 border-gray-200',
          badge: t('Legal Terms', 'నిబంధనలు', 'शर्तें'),
          action: () => setActiveModal('terms')
        },
        {
          id: 'privacy_dpdp',
          title: t('Privacy Policy (DPDP Act 2023)', 'గోప్యతా విధానం (DPDP చట్టం 2023)', 'गोपनीयता नीति (DPDP कानून)'),
          subtitle: t('Strict biometric hardware enclave isolation & zero cloud telemetry', 'బయోమెట్రిక్ మరియు వ్యక్తిగత డేటా భద్రత', 'बायोमेट्रिक डेटा सुरक्षा व गोपनीयता'),
          icon: ShieldCheck,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          badge: t('Privacy Policy', 'గోప్యత', 'गोपनीयता'),
          action: () => setActiveModal('privacy')
        }
      ]
    }
  ];

  return (
    <div className="space-y-4 pb-28">
      {/* 1. App Language Selector (F01: Multilingual Interface) */}
      <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-gray-200 flex items-center justify-between">
        <div>
          <span className="font-extrabold text-xs text-gray-900 block">
            {t('Choose App Language', 'యాప్ భాషను ఎంచుకోండి', 'ऐप की भाषा चुनें')}
          </span>
          <span className="text-[10px] text-gray-500">
            {t('English, తెలుగు, हिन्दी supported across all features', 'అన్ని సేవలలో మూడు భాషలు అందుబాటులో ఉన్నాయి', 'सभी सेवाओं में तीन भाषाएं उपलब्ध')}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              language === 'en' ? 'bg-white text-gray-950 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            English
          </button>
          <button
            onClick={() => onLanguageChange('te')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              language === 'te' ? 'bg-white text-gray-950 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            తెలుగు
          </button>
          <button
            onClick={() => onLanguageChange('hi')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              language === 'hi' ? 'bg-white text-gray-950 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* 2. DISTINCT CLEARLY LABELED ACTION CARDS: OFFICIAL PUSHKARALU PASS & SEVA PORTAL */}
      <div className="space-y-4">
        
        {/* DISTINCT CARD 1: OFFICIAL PUSHKARALU PASS */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <span><img src="/assets/branding/godavari-one-logo.png" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /></span>
              <span>{t('OFFICIAL PUSHKARALU PASS', 'అధికారిక పుష్కరాల పాస్', 'आधिकारिक पुष्करालु पहचान पत्र')}</span>
            </h2>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <img src="/assets/icons/circle-check.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> {t('Verified & Active', 'ధృవీకరించబడింది', 'सत्यापित व सक्रिय')}
            </span>
          </div>

          <div 
            onClick={() => onNavigateSubfeature('profile')}
            className="bg-gradient-to-br from-[#06201b] via-[#0b332b] to-[#041613] text-white p-4.5 rounded-3xl border-2 border-amber-400 shadow-lg cursor-pointer hover:border-amber-300 transition group relative overflow-hidden"
          >
            {/* Subtle sacred ambient pattern */}
            <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              {/* Header row */}
              <div className="flex items-center justify-between gap-3 border-b border-emerald-800/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-stone-950 flex items-center justify-center font-black text-xl shadow-md shrink-0 group-hover:scale-105 transition">
                    <img src="/assets/branding/godavari-one-logo.png" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-stone-950 bg-amber-400 px-2 py-0.5 rounded shadow-xs inline-block">
                      OFFICIAL PUSHKARALU PASS
                    </span>
                    <h3 className="text-base font-black text-white group-hover:text-amber-300 transition mt-0.5">
                      {t('Official Pushkaralu Pass & Devotee Identity', 'అధికారిక పుష్కరాల పాస్ & భక్తుని వివరాలు', 'आधिकारिक पुष्करालु पास व पहचान')}
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-mono font-black text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-xl shrink-0">
                  {regId}
                </span>
              </div>

              {/* Devotee Info Grid */}
              <div className="grid grid-cols-2 gap-2 bg-emerald-950/40 p-2.5 rounded-2xl border border-emerald-800/40 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 block">{t('Devotee Name', 'భక్తుని పేరు', 'श्रद्धालु का नाम')}</span>
                  <span className="font-extrabold text-white text-xs">{devoteeName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">{t('Assigned Ghat', 'కేటాయించిన ఘాట్', 'आवंटित घाट')}</span>
                  <span className="font-extrabold text-amber-300 text-xs truncate block">{assignedGhat}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">{t('Snanam Slot', 'స్నాన సమయం', 'स्नान मुहूर्त')}</span>
                  <span className="font-medium text-emerald-200 text-[11px] truncate block">{swayamSlot}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">{t('Security Clearance', 'భద్రతా అనుమతి', 'सुरक्षा स्थिति')}</span>
                  <span className="font-medium text-emerald-400 text-[11px] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Touch ID / Face ID Active</span>
                  </span>
                </div>
              </div>

              {/* Full Width Action Bar */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-gray-300">
                  {t('Tap to view QR pass, blood group & emergency contacts', 'క్యూఆర్ పాస్, అత్యవసర కాంటాక్ట్‌ల కోసం నొక్కండి', 'क्यूआर पास व आपातकालीन संपर्क देखने हेतु टैप करें')}
                </span>
                <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 px-3 py-1.5 rounded-xl font-black text-xs shadow-md flex items-center gap-1.5 group-hover:bg-amber-300 transition shrink-0 ml-2">
                  <span>{t('View Full Pass & QR', 'పూర్తి పాస్ చూడండి', 'पूरा पास देखें')}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        </div>{/* 3. GROUPED SECTIONS (IMAGE 3 REPLICA: MIXING ALL 30 PUSHKARALU PUBLIC FEATURES) */}
      <div className="space-y-4 pt-1">
        {featureGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-2">
            <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-wider px-1">
              {group.title}
            </h2>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden divide-y divide-gray-100">
              {group.items.map((item, iIdx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={iIdx}
                    onClick={item.action}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50/80 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${item.color} shadow-xs group-hover:scale-105 transition`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-black text-gray-900 group-hover:text-amber-700 transition truncate">
                            {item.title}
                          </h4>
                          {item.badge && (
                            <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded font-mono shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 4. MODALS & SUBVIEWS */}

      {/* Seva Portal Biometric Verification Modal */}
      {showSevaBiometricModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-purple-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {t('GOVT SEVA MITRA GATEWAY', 'ప్రత్యేక సేవా ప్రవేశం', 'प्रतिबंधित सेवा प्रवेश द्वार')}
                </span>
                <h3 className="font-extrabold text-base text-gray-950 mt-1">
                  {t('Seva Portal Biometric Scan', 'సేవా పోర్టల్ బయోమెట్రిక్ ప్రమాణీకరణ', 'सेवा पोर्टल बायोमेट्रिक सत्यापन')}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowSevaBiometricModal(false);
                  setIsRedirectingToSeva(false);
                }}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <span>Back</span>
              </button>
            </div>

            <div className="bg-purple-50 border border-purple-200 p-3 rounded-2xl text-xs text-purple-950 space-y-1">
              <strong className="block text-purple-900 font-extrabold">
                {t('Hardware-Level Devotee Identity Verification', 'హార్డ్‌వేర్ బయోమెట్రిక్ ధృవీకరణ', 'हार्डवेयर बायोमेट्रिक प्रमाणीकरण')}
              </strong>
              <p className="leading-snug text-purple-900/90 text-[11px]">
                {t(
                  'Under AP Government rules, entering the official Seva Mitra and restricted temple passes portal requires hardware biometric confirmation (Touch ID / Face ID) to authenticate the devotee and record digital clearance.',
                  'వాలంటీర్ విధులు మరియు ప్రత్యేక సేవా దర్శన పాసుల నమోదు కొరకు బయోమెట్రిక్ వేలిముద్ర లేదా ఫేస్ ఐడీతో ధృవీకరించండి.',
                  'आधिकारिक सेवा मित्र एवं विशेष दर्शन पोर्टल में प्रवेश हेतु बायोमेट्रिक (फिंगरप्रिंट अथवा फेस स्कैन) सत्यापन अनिवार्य है।'
                )}
              </p>
            </div>

            {isRedirectingToSeva ? (
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-2 shadow-lg animate-pulse text-center">
                <CheckCircle2 className="w-10 h-10 text-amber-300 animate-bounce" />
                <span className="text-sm font-extrabold">
                  {t('Biometric Scan Succeeded!', 'బయోమెట్రిక్ ధృవీకరణ విజయవంతమైంది!', 'बायोमेट्रिक सत्यापन सफल!')}
                </span>
                <span className="text-[11px] font-medium text-emerald-100">
                  {t('Redirecting to Official Public Seva Portal...', 'అధికారిక సేవా పోర్టల్‌కు తీసుకెళ్తున్నాం...', 'सेवा पोर्टल पर भेजा जा रहा है...')}
                </span>
              </div>
            ) : (
              <BiometricVerification
                devoteeName={devoteeName}
                regId={regId}
                assignedGhat={assignedGhat}
                swayamSlot={swayamSlot}
                language={language}
                initialPurpose="seva"
                onCheckInSuccess={(_record: BiometricCheckInRecord) => {
                  setIsSevaBiometricVerified(true);
                  try {
                    sessionStorage.setItem('g1_seva_bio_verified', 'true');
                  } catch (e) {}
                  setIsRedirectingToSeva(true);
                  audioEngine.playSuccessScanBeep();

                  setTimeout(() => {
                    setShowSevaBiometricModal(false);
                    setIsRedirectingToSeva(false);
                    onNavigateSubfeature('seva');
                  }, 800);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Detail Modal for Interactive & Static Topics */}
      {activeModal && (
        <div role="dialog" aria-modal="true" aria-label="Pilgrim information" className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[250] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-base text-gray-900 capitalize">
                {activeModal.replace(/_/g, ' ')}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <span>Back</span>
              </button>
            </div>

            <div className="text-xs text-gray-700 space-y-3 leading-relaxed">
              {/* TOP 5 NATIONAL & STATE LEADERSHIP (PM Modi, CM Chandrababu, DCM Pawan Kalyan, Anam Reddy, V. Anitha) */}
              {activeModal === 'ap_ministers' && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-emerald-950 to-teal-950 p-3.5 rounded-2xl border border-emerald-700/60 text-white">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                      {t('OFFICIAL AP & NATIONAL LEADERSHIP', 'ఆంధ్రప్రదేశ్ & జాతీయ నాయకత్వం', 'आंध्र प्रदेश एवं राष्ट्रीय नेतृत्व')}
                    </span>
                    <h4 className="text-xs font-extrabold text-white mt-0.5">
                      {t('5 Key Leaders for Godavari Pushkaralu 2027', 'గోదావరి పుష్కరాలు 2027 ప్రధాన ప్రముఖులు (5)', 'गोदावरी पुष्करालु 2027 के 5 प्रमुख नेतृत्व')}
                    </h4>
                  </div>

                  <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
                    {AP_MINISTERS_AND_LEADERSHIP.slice(0, 5).map((m) => (
                      <div key={m.id} className="p-3 rounded-2xl border border-emerald-800/30 bg-emerald-50/40 hover:bg-emerald-50 transition space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-9 h-9 rounded-full bg-amber-100 ring-2 ring-amber-300 text-xl flex items-center justify-center shrink-0">
                              <img src={['pm-modi','cm-cbn','dcm-pk','min-anam','min-anitha'].includes(m.id) ? `/assets/leaders/${m.id}.${m.id === 'min-anam' ? 'webp' : 'jpg'}` : '/assets/branding/andhra-pradesh-emblem.png'} alt={['pm-modi','cm-cbn','dcm-pk','min-anam','min-anitha'].includes(m.id) ? m.name : 'Andhra Pradesh government emblem'} className="w-full h-full rounded-full object-cover" />
                            </span>
                            <div>
                              <h5 className="font-extrabold text-xs text-gray-950">
                                {language === 'te' ? m.nameTe : language === 'hi' ? m.nameHi : m.name}
                              </h5>
                              <span className="text-[10px] font-bold text-emerald-800 block">
                                {language === 'te' ? m.designationTe : language === 'hi' ? m.designationHi : m.designation}
                              </span>
                            </div>
                          </div>
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-full border border-amber-300 shrink-0">
                            {language === 'te' ? m.badgeTe : language === 'hi' ? m.badgeHi : m.badge}
                          </span>
                        </div>

                        <div className="text-[10px] text-gray-700 bg-white/80 p-2 rounded-lg border border-gray-200">
                          <strong className="text-gray-900">{t('Portfolio: ', 'శాఖ: ', 'विभाग: ')}</strong>
                          {t(m.portfolio, m.portfolioTe, m.portfolioHi)}
                        </div>

                        <p className="text-[11px] text-gray-800 italic bg-amber-50/60 p-2 rounded-lg border border-amber-200/50">
                          "{language === 'te' ? m.quoteTe : language === 'hi' ? m.quoteHi : m.quote}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* F30: Offline Storage & Resilient Sync Engine Modal */}
              {activeModal === 'offline_sync' && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                      OFFLINE PERSISTENCE & AUTO-SYNC ARCHITECTURE
                    </span>
                    <h4 className="text-xs font-black text-white mt-0.5">
                      {t('Resilient Offline Storage & Local Synchronization', 'ఆఫ్‌లైన్ నిల్వ & ఆటోమేటిక్ సింక్ ఆర్కిటెక్చర్', 'ऑफ़लाइन स्टोरेज एवं स्वचालित सिंक')}
                    </h4>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                      <strong className="text-emerald-950 font-bold block"><img src="/assets/icons/circle-check.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> Idempotent Local Emergency Outbox</strong>
                      <p className="text-emerald-900">
                        When cellular towers suffer extreme congestion during peak muhurthams, all SOS reports, missing person cases, and seva registrations are queued with cryptographic UUIDs in IndexedDB/localStorage.
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                      <strong className="text-blue-950 font-bold block"><img src="/assets/icons/circle-check.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> Silent Background Mesh Relay</strong>
                      <p className="text-blue-900">
                        Device hops opportunistically across Bluetooth Low Energy (BLE) and Wi-Fi Direct beacons to relay incident packets to the nearest Police Outpost or SDRF boat without interrupting the user.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* F23: Godavari Mitra Multilingual AI Guide Modal */}
              {activeModal === 'godavari_mitra' && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-purple-950 to-indigo-950 text-white p-3.5 rounded-2xl">
                    <span className="text-[10px] font-black uppercase text-amber-300 block">AI PILGRIM GUIDE</span>
                    <h4 className="text-xs font-black text-white mt-0.5">Godavari Mitra Virtual Assistant</h4>
                  </div>
                  <p className="text-[11px] text-gray-700">
                    {t(
                      'Tap the circular floating AI button at the bottom-right corner of your screen anytime to consult Godavari Mitra in Telugu, English, or Hindi.',
                      'స్క్రీన్ కుడివైపు కిందనున్న ఏఐ బటన్ నొక్కి ఏ సమయంలోనైనా పూజా విధానాలు మరియు సహాయాన్ని అడగవచ్చు.',
                      'स्क्रीन के नीचे दाईं ओर दिए गए एआई बटन पर टैप करके कभी भी गोदावरी मित्र से परामर्श लें।'
                    )}
                  </p>
                </div>
              )}

              {/* F24-F25: Voice Commands & Spoken Audio Guidance Modal */}
              {activeModal === 'voice_commands' && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-teal-950 to-emerald-950 text-white p-3.5 rounded-2xl">
                    <span className="text-[10px] font-black uppercase text-amber-300 block">SARVAM & BHASHINI TTS</span>
                    <h4 className="text-xs font-black text-white mt-0.5">Multilingual Voice Commands & Audio Navigation</h4>
                  </div>
                  <p className="text-[11px] text-gray-700">
                    Voice queries are powered by browser speech synthesis and Sarvam Indian language acoustic models. Tap the audio speaker icon on any ghat or weather card to hear live announcements read aloud.
                  </p>
                </div>
              )}

              {/* F21: Weather & CWC Barrage Hydrology Modal */}
              {activeModal === 'weather_cwc' && (
                <div className="space-y-3">
                  <div className="bg-amber-950 text-white p-3.5 rounded-2xl">
                    <span className="text-[10px] font-black uppercase text-amber-300 block">OFFICIAL TELEMETRY</span>
                    <h4 className="text-xs font-black text-white mt-0.5">IMD Weather & CWC Barrage Flow</h4>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                      <span className="font-bold text-gray-900 block">Dowleswaram Barrage (Sir Arthur Cotton)</span>
                      <p className="text-gray-600">Discharge: 1.42 Lakh Cusecs • 42 Gates Open • Velocity 1.45 m/s • Safe within buoy line.</p>
                    </div>
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                      <span className="font-bold text-amber-900 block">IMD Heat Index Nowcast</span>
                      <p className="text-amber-800">33.4°C ambient (Feels like 38.6°C). Free ORS and chilled water provided at all ghat exits.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Real Google Maps Navigator Modal */}
              {activeModal === 'google_maps_direct' && (
                <div className="space-y-3">
                  <div className="bg-emerald-900 text-white p-3 rounded-2xl">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase block">DIRECT GOOGLE MAPS NAVIGATION</span>
                    <h4 className="text-xs font-black text-white">
                      {t('1-Tap Live Route & Turn-by-Turn GPS Walking Directions', 'గూగుల్ మ్యాప్స్ ప్రత్యక్ష పాదచారుల రూట్లు', 'गूगल मैप्स लाइव नेविगेशन व मार्ग')}
                    </h4>
                  </div>
                  <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                    {[
                      { name: 'Pushkar Ghat (Main & VIP)', coords: '16.9942,81.7766', type: 'Sacred Ghat', desc: 'Central Bathing Stage & VIP Corridor' },
                      { name: 'Kotilingala Ghat', coords: '17.0018,81.7712', type: 'Mega Ghat', desc: '1.2 km Promenade & Annadanam Halls' },
                      { name: 'Saraswati Ghat', coords: '16.9915,81.7798', type: 'Family Ghat', desc: 'Protected bay for Elders & Children' },
                      { name: 'Markandeya Temple Ghat', coords: '16.9975,81.7735', type: 'Heritage Ghat', desc: 'Historical sacred steps & deep chain safety' },
                      { name: 'Gautami VIP Express Ghat', coords: '17.0055,81.7680', type: 'VIP Ghat', desc: 'Fast track bathing corridor' },
                      { name: 'Padmavathi Family Ghat', coords: '16.9880,81.7820', type: 'Family Ghat', desc: 'South bathing bank with changing tents' },
                      { name: 'Lalacheruvu Satellite Parking & Bus Hub', coords: '17.0225,81.8050', type: 'Transit Hub', desc: 'Free electric shuttles to ghats every 3 mins' },
                      { name: 'Diwancheruvu Mega Satellite Parking', coords: '17.0512,81.8310', type: 'Transit Hub', desc: 'Parking capacity for 40,000 cars & private buses' },
                      { name: 'Gammon Bridge Satellite Terminal', coords: '17.0110,81.7580', type: 'Transit Hub', desc: 'West Godavari & Kovvur entry hub' },
                      { name: 'Rajahmundry Main Railway Station', coords: '16.9890,81.7780', type: 'Rail Terminal', desc: '140 Pushkar Special trains stopping round-the-clock' },
                      { name: 'TTD Maha Annadanam Complex', coords: '17.0025,81.7720', type: 'Annadanam', desc: 'Free meals served 10:00 AM - 10:00 PM' },
                    ].map((dest, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                              {dest.type}
                            </span>
                            <strong className="block text-gray-900 text-xs font-bold">{dest.name}</strong>
                          </div>
                          <span className="text-[10px] text-gray-500 block mt-0.5">{dest.desc}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${dest.coords}&travelmode=walking`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1.5 rounded-lg text-[10px] inline-flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <span><img src="/assets/icons/person-standing.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> Walking</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency Helplines Modal */}
              {activeModal === 'helplines' && (
                <div className="space-y-3">
                  <div className="bg-red-950 text-white p-3 rounded-2xl border border-red-800">
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-300 block">OFFICIAL TOLL-FREE NUMBERS</span>
                    <h4 className="text-xs font-extrabold text-white">
                      {t('24x7 Emergency Hotlines & Rapid Response Desks', '24x7 అత్యవసర కాల్ సెంటర్లు & సహాయ కేంద్రాలు', '24x7 आपातकालीन नंबर एवं सहायता')}
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto">
                    {[
                      { number: '112', title: t('National Emergency (Police, Fire, Ambulance)', 'జాతీయ అత్యవసర విభాగం', 'राष्ट्रीय आपातकालीन सेवा'), desc: '24/7 Unified Emergency Response', color: 'bg-red-50 border-red-300 text-red-900' },
                      { number: '108', title: t('108 Free Emergency Ambulance', '108 ఉచిత అత్యవసర అంబులెన్స్', '108 निःशुल्क एम्बुलेंस'), desc: '120 Dedicated ICU Ambulances on standby', color: 'bg-emerald-50 border-emerald-300 text-emerald-900' },
                      { number: '104', title: t('104 Medical Advice & Tele-Triage', '104 ఉచిత వైద్య సలహాలు', '104 निःशुल्क चिकित्सा परामर्श'), desc: 'Doctor teleconsultation & heatstroke advice', color: 'bg-teal-50 border-teal-300 text-teal-900' },
                      { number: '1093', title: t('SDRF River & Boat Rescue Police', 'ఎస్డీఆర్ఎఫ్ నదీ రక్షణ దళం', 'एसडीआरएफ नदी बचाव बल'), desc: 'Deep river patrols and rescue boats', color: 'bg-blue-50 border-blue-300 text-blue-900' },
                      { number: '1098', title: t('Childline (Lost & Found Child Care)', 'బాలల సహాయ కేంద్రం (చైల్డ్‌లైన్ 1098)', 'चाइल्डलाइन (लापता बच्चे)'), desc: 'Immediate shelter & reunification', color: 'bg-amber-50 border-amber-300 text-amber-900' },
                      { number: '1800-425-2027', title: t('Pushkar Central Control Room', 'పుష్కర కేంద్ర కంట్రోల్ రూమ్', 'पुष्कर केंद्रीय नियंत्रण कक्ष'), desc: 'General pilgrim assistance & lost person alerts', color: 'bg-purple-50 border-purple-300 text-purple-900' },
                    ].map((h, idx) => (
                      <a
                        key={idx}
                        href={`tel:${h.number.replace(/-/g, '')}`}
                        className={`p-2.5 rounded-xl border ${h.color} flex items-center justify-between hover:shadow transition cursor-pointer`}
                      >
                        <div>
                          <strong className="block text-xs font-black">{h.number}</strong>
                          <span className="text-[10px] font-bold block">{h.title}</span>
                          <span className="text-[9px] opacity-75">{h.desc}</span>
                        </div>
                        <span className="w-7 h-7 rounded-full bg-white shadow-xs flex items-center justify-center text-xs shrink-0 ml-1">
                          <img src="/assets/icons/phone.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Annadanam Free Meals Modal */}
              {activeModal === 'annadanam_finder' && (
                <div className="space-y-3">
                  <div className="bg-amber-900 text-white p-3 rounded-2xl">
                    <span className="text-[10px] font-bold text-amber-300 uppercase block">DIVINE PRASADAM & MEALS</span>
                    <h4 className="text-xs font-black text-white">
                      {t('Maha Annadanam Halls (100% Free for Devotees)', 'మహా అన్నదాన కేంద్రాలు (భక్తులందరికీ ఉచిత భోజనం)', 'महा अन्नदान केंद्र (पूर्णतः निःशुल्क)')}
                    </h4>
                  </div>
                  <div className="space-y-2 max-h-[55vh] overflow-y-auto">
                    {[
                      { name: 'TTD Pushkar Mega Annadanam Hall #1', location: 'Kotilingala Ghat North', time: '10:00 AM – 10:30 PM', menu: 'Sambar Rice, Curd Rice, Sweet Pongal & Mineral Water', coords: '17.0025,81.7720' },
                      { name: 'AP Endowments Central Annadanam Mandapam', location: 'Pushkar Ghat Promenade', time: '11:00 AM – 10:00 PM', menu: 'Full Andhra Satvik Thali with Ghee & Laddu', coords: '16.9945,81.7760' },
                      { name: 'Saraswati Ghat Family Dining Pandal', location: 'Saraswati Ghat South Enclosure', time: '10:30 AM – 09:30 PM', menu: 'Satvik meals with baby food & milk counters', coords: '16.9918,81.7795' },
                    ].map((hall, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <strong className="text-gray-950 text-xs font-bold">{hall.name}</strong>
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded-full shrink-0">
                            FREE MEALS
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-600 flex items-center justify-between">
                          <span><img src="/assets/icons/map-pin.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> {hall.location}</span>
                          <span><img src="/assets/icons/circle-help.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> {hall.time}</span>
                        </div>
                        <div className="text-[10px] text-amber-900 bg-white/80 p-1.5 rounded border border-amber-200">
                          <img src="/assets/icons/utensils.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> {hall.menu}
                        </div>
                        <div className="pt-1 flex justify-end">
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${hall.coords}&travelmode=walking`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-2.5 py-1 rounded-lg text-[10px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span><img src="/assets/icons/map.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /> Directions in Google Maps</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Do's & Don'ts Modal */}
              {activeModal === 'dos_donts' && (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                    <strong className="text-emerald-900 font-bold block mb-1">
                      {t("DO'S (చేయవలసినవి / क्या करें):", "చేయవలసిన పనులు:", "क्या करें:")}
                    </strong>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Bathe only within designated safety buoy lines under lifeguard watch.</li>
                      <li>Use free chilled RO water dispensing centers to stay hydrated.</li>
                      <li>Keep children and elderly pilgrims wearing waterproof family ID wristbands.</li>
                      <li>Follow designated one-way barricaded egress routes to avoid counterflows.</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 p-3 rounded-xl">
                    <strong className="text-red-900 font-bold block mb-1">
                      {t("DON'TS (చేయకూడనివి / क्या न करें):", "చేయకూడని పనులు:", "क्या न करें:")}
                    </strong>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Do not swim past the deep-water safety nets or into river current channels.</li>
                      <li>Do not discard clothes or plastic bottles into Sacred River Godavari.</li>
                      <li>Do not believe or circulate unverified social media crowd rumours.</li>
                      <li>Do not push or rush on steep granite steps near bathing ramp entries.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Study on Godavari Pushkaralu Modal */}
              {activeModal === 'study' && (
                <div className="space-y-2">
                  <p>
                    <strong>Godavari Maha Pushkaram</strong> occurs once every 12 years when <em>Brihaspati</em> (Jupiter) transits into the zodiac sign of <em>Simha</em> (Leo).
                  </p>
                  <p>
                    According to ancient Hindu scriptures, Lord Brahma, along with Brihaspati and all 3.5 crore holy teerthas (sacred waters), resides in the Godavari River during the 12 sacred days. A single holy dip at Kotilingala or Pushkar Ghat is believed to bestow spiritual liberation and cleanse generations of sins.
                  </p>
                </div>
              )}

              {/* Spiritual Photo Gallery Modal */}
              {activeModal === 'gallery' && (
                <div className="space-y-4"><p>Photographs of the Godavari region. These are historical photographs, not live festival images.</p>{galleryPhotos.map(photo=><figure key={photo.src} className="overflow-hidden rounded-xl border"><a href={photo.src} target="_blank" rel="noreferrer"><img src={photo.src} alt={photo.title} className="w-full h-48 object-cover" loading="lazy" /></a><figcaption className="p-3"><strong>{photo.title}</strong><a href={photo.source} target="_blank" rel="noreferrer" className="block text-emerald-800 underline mt-2">Photographer, licence & original source</a></figcaption></figure>)}</div>
              )}

              {/* Official Announcements Modal */}
              {activeModal === 'announcements' && (
                <div className="space-y-2.5">
                  <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-xl">
                    <span className="text-[9px] font-bold text-amber-800 uppercase block">G.O. MS NO. 442 • GOVT OF AP</span>
                    <strong className="text-gray-950 block text-xs mt-0.5">Free APSRTC Shuttle Ring Buses across all 4 Pushkar Nagars</strong>
                    <p className="text-[11px] text-gray-700 mt-1">
                      Over 850 electric low-floor shuttle buses operate continuously 24x7 from Lalacheruvu and Diwancheruvu satellite parking directly to bathing ghat terminals.
                    </p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded-xl">
                    <span className="text-[9px] font-bold text-emerald-800 uppercase block">HEALTH & HYGIENE CIRCULAR</span>
                    <strong className="text-gray-950 block text-xs mt-0.5">Continuous 24x7 Automated Water Filtration Active</strong>
                    <p className="text-[11px] text-gray-700 mt-1">
                      Dissolved oxygen level is maintained above 6.8 mg/L with real-time UV microbial treatment stations along Godavari river banks.
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-300 p-2.5 rounded-xl">
                    <span className="text-[9px] font-bold text-blue-800 uppercase block">RAILWAYS SPECIAL</span>
                    <strong className="text-gray-950 block text-xs mt-0.5">140 Special Pushkaralu Trains to Rajahmundry & Kovvur</strong>
                    <p className="text-[11px] text-gray-700 mt-1">
                      South Central Railway has deployed round-the-clock booking counters, medical triage booths, and battery cart transit at Rajahmundry Main station.
                    </p>
                  </div>
                </div>
              )}

              {/* Publications Download Modal */}
              {activeModal === 'publications' && (
                <div className="space-y-2">
                  {[
                    { title: 'Official Godavari Pushkaralu Devotee Guide 2027', format: 'PDF • 14 MB', lang: 'Telugu & English' },
                    { title: 'Sacred Snanam Muhurthams & Vedic Puja Vidhanam', format: 'PDF • 6 MB', lang: 'Sanskrit & Telugu' },
                    { title: 'Comprehensive Pushkar Nagar & Ghat Evacuation Maps', format: 'High-Res Map • 8 MB', lang: 'Trilingual' },
                    { title: 'Emergency Contact Directory (Police, SDRF, Medical, 108)', format: 'PDF • 2 MB', lang: 'English & Telugu' }
                  ].map((pub, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                      <div>
                        <strong className="block text-gray-900 text-xs">{pub.title}</strong>
                        <span className="text-[10px] text-gray-500">{pub.format} • {pub.lang}</span>
                      </div>
                      <span className="bg-amber-100 text-amber-900 font-bold px-2 py-1 rounded-lg text-[10px] shrink-0 border border-amber-300">
                        Downloaded
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Terms of Service & Privacy Modal */}
              {(activeModal === 'terms' || activeModal === 'privacy') && (
                <div className="space-y-2 text-[11px] text-gray-700">
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl space-y-1.5">
                    <strong className="text-gray-900 block font-bold">
                      Digital Personal Data Protection (DPDP) Act 2023 Compliance
                    </strong>
                    <p>
                      The Rajahmundry Pushkaralu Authority and Government of Andhra Pradesh strictly protect pilgrim identity and geolocation data. Location services are processed on-device for navigation, safety geofencing, and SOS emergency dispatch only.
                    </p>
                    <p>
                      Biometric sensor data (Touch ID / Face ID) remains strictly in the device's hardware secure enclave and is never transmitted to external cloud servers.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

