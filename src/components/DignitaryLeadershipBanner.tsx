import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Shield } from 'lucide-react';
import { AP_MINISTERS_AND_LEADERSHIP, MinisterDignitary } from '../data/ministersData';

interface DignitaryLeadershipBannerProps {
  language: 'en' | 'te' | 'hi';
  className?: string;
}

// Exactly the Top 5 Key National & State Leaders for Godavari Pushkaralu 2027
const TOP_5_LEADERS: MinisterDignitary[] = AP_MINISTERS_AND_LEADERSHIP.slice(0, 5);

export const DignitaryLeadershipBanner: React.FC<DignitaryLeadershipBannerProps> = ({
  language,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  const t = (en: string, te: string, hi: string) => {
    return language === 'te' ? te : language === 'hi' ? hi : en;
  };

  const currentLeader = TOP_5_LEADERS[currentIndex] || TOP_5_LEADERS[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TOP_5_LEADERS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TOP_5_LEADERS.length) % TOP_5_LEADERS.length);
  };

  // Auto-rotation every 7 seconds when not hovered
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TOP_5_LEADERS.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const getName = (leader: MinisterDignitary) => {
    if (language === 'te') return leader.nameTe;
    if (language === 'hi') return leader.nameHi;
    return leader.name;
  };

  const getDesignation = (leader: MinisterDignitary) => {
    if (language === 'te') return leader.designationTe;
    if (language === 'hi') return leader.designationHi;
    return leader.designation;
  };

  const getQuote = (leader: MinisterDignitary) => {
    if (language === 'te') return leader.quoteTe;
    if (language === 'hi') return leader.quoteHi;
    return leader.quote;
  };

  const getBadge = (leader: MinisterDignitary) => {
    if (language === 'te') return leader.badgeTe;
    if (language === 'hi') return leader.badgeHi;
    return leader.badge;
  };

  return (
    <div
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      className={`relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-[#0B2E28] via-[#071F1B] to-[#041411] border border-[#165046] p-4 sm:p-5 text-white ${className}`}
    >
      {/* Background Vedic Watermark Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Top Header Strip: Government of AP Seal & Rajahmundry Pushkaralu Authority */}
      <div className="relative z-10 flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <img
            src="/assets/branding/andhra-pradesh-emblem.png"
            alt="Government of Andhra Pradesh emblem"
            width={48}
            height={48}
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0 bg-white rounded-full p-1 shadow-sm"
          />
          <div>
            <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-300">
              {t('GOVT OF ANDHRA PRADESH', 'ఆంధ్రప్రదేశ్ ప్రభుత్వం', 'आंध्र प्रदेश सरकार')}
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-white leading-tight">
              {t('Rajahmundry Pushkaralu Authority', 'రాజమండ్రి పుష్కరాల ఆధికారిక వ్యవస్థ', 'राजमहेंद्री पुष्करालु प्राधिकरण')}
            </div>
          </div>
        </div>

        <img
          src="/assets/branding/godavari-one-logo.png"
          alt="Godavari One — Godavari Maha Pushkaralu"
          width={56}
          height={56}
          className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0 bg-white rounded-full p-1 shadow-sm"
        />
      </div>
      {/* Gold Tagline Pill & Main Title */}
      <div className="relative z-10 space-y-1 mb-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 text-amber-300 border border-amber-400/50 rounded-full px-3 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
          <span>{t('MAHA KUMBH OF THE SOUTH • దక్షిణ భారత మహా కుంభమేళా', 'దక్షిణ భారత మహా కుంభమేళా • MAHA KUMBH OF THE SOUTH', 'दक्षिण भारत का महा कुंभमेला')}</span>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
          Godavari Pushkaralu 2027
        </h2>

        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-amber-200/90 font-medium">
          <span><img src="/assets/icons/calendar-days.svg" alt="" aria-hidden="true" className="inline-block h-[1.15em] w-[1.15em] object-contain align-middle shrink-0" /></span>
          <span>{t('June 26 – July 7, 2027 (12 Sacred Days)', 'జూన్ 26 – జూలై 7, 2027 (12 పవిత్ర పుష్కర దినాలు)', '26 जून – 7 जुलाई, 2027 (12 पवित्र दिवस)')}</span>
        </div>
      </div>

      {/* White Dignitary Card with Leader Details */}
      <div className="relative z-10 bg-white text-gray-900 rounded-2xl p-4 sm:p-5 shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between gap-2">
          {/* Previous Arrow */}
          <button
            onClick={handlePrev}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-900 flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs active:scale-95"
            aria-label="Previous leader"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Central Leader Details */}
          <div className="flex-1 flex flex-col items-center text-center px-1 sm:px-2">
            {/* Avatar Circle with Badge */}
            <div className="relative mb-1.5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-4 ring-amber-400/40 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 flex items-center justify-center text-2xl sm:text-3xl shadow-md">
                <img src={`/assets/leaders/${currentLeader.id}.${currentLeader.id === 'min-anam' ? 'webp' : 'jpg'}`} alt={getName(currentLeader)} className="w-full h-full rounded-full object-cover object-top" width={96} height={96} />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white border border-gray-300 rounded-full px-1.5 py-0.2 shadow text-[9px] font-black uppercase text-gray-800">
                {currentLeader.stateBadge === 'INDIA' ? ' IN' : ' AP'}
              </div>
            </div>

            {/* Accent Underline Bar */}
            <div className="h-1 w-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full mb-1.5" />

            {/* Name */}
            <h3 className="font-black text-sm sm:text-base text-gray-950 tracking-tight leading-snug">
              {getName(currentLeader)}
            </h3>

            {/* Designation */}
            <p className="text-xs font-bold text-emerald-800 mt-0.5">
              {getDesignation(currentLeader)}
            </p>

            <span className="text-[10px] text-gray-500 font-medium block mt-0.5">
              {t(currentLeader.portfolio, currentLeader.portfolioTe, currentLeader.portfolioHi)}
            </span>

            {/* Quote Message */}
            <div className="mt-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 max-w-lg">
              <p className="text-xs text-gray-800 italic leading-relaxed">
                "{getQuote(currentLeader)}"
              </p>
            </div>

            {/* Official Badge Pill */}
            <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300/60">
              <Shield className="w-3 h-3 text-amber-600" />
              <span>{getBadge(currentLeader)} • AP Government Endorsement</span>
            </div>
          </div>

          {/* Next Arrow */}
          <button
            onClick={handleNext}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-900 flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs active:scale-95"
            aria-label="Next leader"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 5-Dot Indicator */}
        <div className="flex justify-center items-center gap-1.5 mt-3 pt-2 border-t border-gray-100">
          {TOP_5_LEADERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentIndex ? 'w-5 bg-amber-500' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Jump to leader ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};


