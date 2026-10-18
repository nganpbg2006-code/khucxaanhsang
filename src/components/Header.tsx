import React from 'react';
import { Language, translations } from '../utils/translations';
import { FlaskConical, Trophy, Bot, Sparkles, Globe } from 'lucide-react';

interface HeaderProps {
  activeTab: 'simulation' | 'challenges' | 'aiGenerator';
  onTabChange: (tab: 'simulation' | 'challenges' | 'aiGenerator') => void;
  lang: Language;
  onLanguageToggle: () => void;
  onOpenPhenomenaModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  lang,
  onLanguageToggle,
  onOpenPhenomenaModal,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 md:px-8 py-3.5 shadow-xl transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          {/* Scientific Optics Logo */}
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/40 shrink-0">
            <svg viewBox="0 0 40 40" className="w-6 h-6 text-slate-950 stroke-current stroke-[2.5] fill-none">
              {/* Interface line */}
              <line x1="4" y1="20" x2="36" y2="20" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeDasharray="2 2" />
              {/* Normal line */}
              <line x1="20" y1="4" x2="20" y2="36" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              {/* Incident ray */}
              <line x1="6" y1="8" x2="20" y2="20" stroke="#ffffff" strokeWidth="2.5" />
              {/* Refracted ray */}
              <line x1="20" y1="20" x2="29" y2="34" stroke="#ffffff" strokeWidth="2.5" />
            </svg>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-extrabold tracking-tight text-slate-100">
                {t.appTitle}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                KHTN 9 - Bài 5
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {lang === 'vi' ? 'Mô phỏng Thí nghiệm & Luyện tập thông minh' : 'Interactive Lab & Smart Practice'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner overflow-x-auto self-start sm:self-auto">
          <button
            onClick={() => onTabChange('simulation')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'simulation'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>{t.tabs.simulation}</span>
          </button>

          <button
            onClick={() => onTabChange('challenges')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'challenges'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>{t.tabs.challenges}</span>
          </button>

          <button
            onClick={() => onTabChange('aiGenerator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'aiGenerator'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>{t.tabs.aiGenerator}</span>
          </button>
        </div>

        {/* Right Tools: Phenomena Modal & Language Switcher */}
        <div className="flex items-center gap-2">
          {/* Phenomena Shortcut */}
          <button
            onClick={onOpenPhenomenaModal}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 text-xs font-semibold transition"
            title={t.phenomena.title}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'vi' ? 'Hiện tượng thực tế' : 'Real-world'}</span>
          </button>

          {/* Bilingual Toggle */}
          <button
            onClick={onLanguageToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition shadow-sm"
            title={lang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'vi' ? 'VI 🇻🇳' : 'EN 🇬🇧'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
