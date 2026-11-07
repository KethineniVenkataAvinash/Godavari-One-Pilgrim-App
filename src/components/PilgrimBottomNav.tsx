import React from 'react';
import { Home, Compass, Calendar, MoreHorizontal, HeartPulse } from 'lucide-react';

export type PilgrimMainTab = 'home' | 'explore' | 'sos' | 'pushkaralu' | 'more';

interface PilgrimBottomNavProps {
  activeTab: PilgrimMainTab;
  onTabChange: (tab: PilgrimMainTab) => void;
  language: 'en' | 'te' | 'hi';
}

export const PilgrimBottomNav: React.FC<PilgrimBottomNavProps> = ({
  activeTab,
  onTabChange,
  language,
}) => {
  const t = (en: string, te: string, hi: string) => {
    return language === 'te' ? te : language === 'hi' ? hi : en;
  };

  return (
    <nav className="fixed md:absolute bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:rounded-b-[38px]">
      <div className="w-full max-w-[420px] mx-auto px-2 h-16 flex items-center justify-between relative">
        {/* 1. Home */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition cursor-pointer ${
            activeTab === 'home' ? 'text-amber-600 font-bold' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Home className={`w-5 h-5 mb-0.5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight">{t('Home', 'హోమ్', 'होम')}</span>
        </button>

        {/* 2. Explore Rajahmundry */}
        <button
          onClick={() => onTabChange('explore')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition cursor-pointer ${
            activeTab === 'explore' ? 'text-amber-600 font-bold' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Compass className={`w-5 h-5 mb-0.5 ${activeTab === 'explore' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight truncate max-w-[65px]">
            {t('Explore', 'దర్శనీయ', 'एक्सप्लोर')}
          </span>
        </button>

        {/* 3. Center Giant Red Floating SOS Button (Exact Kumbh Style) */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={() => onTabChange('sos')}
            className={`w-14 h-14 rounded-full bg-gradient-to-tr from-red-600 to-red-500 text-white flex flex-col items-center justify-center shadow-lg border-4 border-white transition transform active:scale-95 cursor-pointer ${
              activeTab === 'sos' ? 'ring-4 ring-red-300 scale-105' : 'hover:scale-105'
            }`}
            title="Emergency SOS Assistance"
          >
            <HeartPulse className="w-5 h-5 animate-pulse text-white mb-0.5" />
            <span className="text-[9px] font-black uppercase tracking-wider">SOS</span>
          </button>
        </div>

        {/* 4. Godavari Pushkaralu 2027 */}
        <button
          onClick={() => onTabChange('pushkaralu')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition cursor-pointer ${
            activeTab === 'pushkaralu' ? 'text-amber-600 font-bold' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Calendar className={`w-5 h-5 mb-0.5 ${activeTab === 'pushkaralu' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight truncate max-w-[65px]">
            {t('Pushkaralu', 'పుష్కరాలు', 'पुष्करालु')}
          </span>
        </button>

        {/* 5. More / Services */}
        <button
          onClick={() => onTabChange('more')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition cursor-pointer ${
            activeTab === 'more' ? 'text-amber-600 font-bold' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <MoreHorizontal className={`w-5 h-5 mb-0.5 ${activeTab === 'more' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight">{t('More', 'మరిన్ని', 'अधिक')}</span>
        </button>
      </div>
    </nav>
  );
};
