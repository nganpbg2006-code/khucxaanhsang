import React, { useState } from 'react';
import { Language, translations } from '../utils/translations';
import { MediumType } from '../types/optics';
import { X, Sparkles, ArrowRight, ShieldCheck, Waves, Fish, Compass, Cable } from 'lucide-react';

interface RealWorldPhenomenaModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onApplyPreset: (n1: number, n2: number, i: number, m1: MediumType, m2: MediumType) => void;
}

export const RealWorldPhenomenaModal: React.FC<RealWorldPhenomenaModalProps> = ({
  isOpen,
  onClose,
  lang,
  onApplyPreset,
}) => {
  const [activeTab, setActiveTab] = useState<'pencil' | 'fish' | 'mirage' | 'fiber'>('pencil');
  const t = translations[lang];

  if (!isOpen) return null;

  const phenomena = [
    {
      id: 'pencil' as const,
      icon: Waves,
      title: t.phenomena.pencilTitle,
      desc: t.phenomena.pencilDesc,
      tag: 'Khúc xạ cơ bản (Refraction)',
      formula: 'n_nước · sin(i) = n_khí · sin(r) ⇒ r > i',
      preset: { n1: 1.333, n2: 1.0, i: 30, m1: 'water' as MediumType, m2: 'air' as MediumType },
      diagram: (
        <svg viewBox="0 0 320 200" className="w-full h-44 rounded-xl bg-slate-950 border border-slate-800">
          {/* Glass cup */}
          <path d="M 90 40 L 105 170 Q 160 180 215 170 L 230 40 Z" fill="rgba(6, 182, 212, 0.15)" stroke="#38bdf8" strokeWidth="2" />
          {/* Water surface */}
          <line x1="97" y1="90" x2="223" y2="90" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 2" />
          <text x="100" y="82" fill="#06b6d4" fontSize="10" fontWeight="bold">Mặt nước</text>

          {/* Pencil upper part in air */}
          <line x1="60" y1="20" x2="160" y2="90" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
          {/* Pencil lower part in water (virtual position perceived by eye) */}
          <line x1="160" y1="90" x2="205" y2="155" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" opacity="0.4" strokeDasharray="4 2" />
          {/* Real submerged pencil */}
          <line x1="160" y1="90" x2="225" y2="165" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />

          {/* Eye observing */}
          <circle cx="50" cy="40" r="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="50" cy="40" r="5" fill="#38bdf8" />
          {/* Virtual ray back */}
          <line x1="225" y1="165" x2="160" y2="90" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="160" y1="90" x2="65" y2="45" stroke="#38bdf8" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      id: 'fish' as const,
      icon: Fish,
      title: t.phenomena.fishTitle,
      desc: t.phenomena.fishDesc,
      tag: 'Độ sâu biểu kiến (Apparent Depth)',
      formula: 'h\' = h / n (Ảnh ảo nông hơn vật thật)',
      preset: { n1: 1.333, n2: 1.0, i: 25, m1: 'water' as MediumType, m2: 'air' as MediumType },
      diagram: (
        <svg viewBox="0 0 320 200" className="w-full h-44 rounded-xl bg-slate-950 border border-slate-800">
          {/* Water boundary */}
          <rect x="0" y="70" width="320" height="130" fill="rgba(6, 182, 212, 0.18)" />
          <line x1="0" y1="70" x2="320" y2="70" stroke="#06b6d4" strokeWidth="2" />
          <text x="15" y="60" fill="#94a3b8" fontSize="10">Không khí (n = 1)</text>
          <text x="15" y="90" fill="#06b6d4" fontSize="10">Nước (n = 1.33)</text>

          {/* Real fish S */}
          <circle cx="210" cy="165" r="9" fill="#f97316" />
          <text x="225" y="170" fill="#f97316" fontSize="11" fontWeight="bold">Cá thật (S)</text>

          {/* Virtual fish S' */}
          <circle cx="200" cy="125" r="9" fill="#f97316" opacity="0.5" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" />
          <text x="215" y="130" fill="#fb923c" fontSize="11" fontWeight="bold">Ảnh ảo (S')</text>

          {/* Eye */}
          <circle cx="80" cy="30" r="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="80" cy="30" r="4" fill="#38bdf8" />
          <text x="50" y="20" fill="#38bdf8" fontSize="10">Mắt người</text>

          {/* Ray paths */}
          <line x1="210" y1="165" x2="140" y2="70" stroke="#ef4444" strokeWidth="1.5" />
          <line x1="140" y1="70" x2="85" y2="33" stroke="#ef4444" strokeWidth="1.5" />
          {/* Virtual dashed trace */}
          <line x1="85" y1="33" x2="200" y2="125" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />

          {/* Spear aiming hint */}
          <text x="15" y="185" fill="#e2e8f0" fontSize="10" className="font-semibold">
            👉 Thợ săn phải nhắm thấp hơn ảnh S'
          </text>
        </svg>
      ),
    },
    {
      id: 'mirage' as const,
      icon: Compass,
      title: t.phenomena.mirageTitle,
      desc: t.phenomena.mirageDesc,
      tag: 'Phản xạ toàn phần khí quyển (Mirage)',
      formula: 'n_lạnh > n_nóng ⇒ Phản xạ toàn phần mặt đất',
      preset: { n1: 1.05, n2: 1.0, i: 75, m1: 'custom' as MediumType, m2: 'air' as MediumType },
      diagram: (
        <svg viewBox="0 0 320 200" className="w-full h-44 rounded-xl bg-slate-950 border border-slate-800">
          {/* Ground */}
          <rect x="0" y="160" width="320" height="40" fill="#334155" />
          <line x1="0" y1="160" x2="320" y2="160" stroke="#f59e0b" strokeWidth="2" />
          <text x="15" y="185" fill="#f59e0b" fontSize="11" fontWeight="bold">Mặt đường nóng bức (n nhỏ)</text>

          {/* Temperature gradient air layers */}
          <line x1="0" y1="120" x2="320" y2="120" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
          <text x="15" y="112" fill="#94a3b8" fontSize="9">Lớp khí trung gian</text>
          <text x="15" y="70" fill="#38bdf8" fontSize="9">Lớp khí mát ở trên (n lớn hơn)</text>

          {/* Sky object (Cloud) */}
          <path d="M 230 40 Q 240 25 260 25 Q 280 25 290 40 Q 300 55 280 65 L 240 65 Z" fill="#94a3b8" />

          {/* Observer */}
          <circle cx="50" cy="110" r="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="50" cy="110" r="4" fill="#38bdf8" />

          {/* Curved ray path bending upwards into eye */}
          <path d="M 250 50 Q 150 155 58 112" fill="none" stroke="#38bdf8" strokeWidth="2" />

          {/* Virtual puddle */}
          <ellipse cx="140" cy="160" rx="35" ry="4" fill="rgba(56, 189, 248, 0.4)" />
          <text x="110" y="152" fill="#38bdf8" fontSize="9" fontWeight="bold">Ảo ảnh vũng nước</text>
        </svg>
      ),
    },
    {
      id: 'fiber' as const,
      icon: Cable,
      title: t.phenomena.fiberTitle,
      desc: t.phenomena.fiberDesc,
      tag: 'Cáp quang Internet & Y học',
      formula: 'n_lõi > n_vỏ và i > igh ⇒ 100% Phản xạ toàn phần',
      preset: { n1: 1.62, n2: 1.5, i: 70, m1: 'flint_glass' as MediumType, m2: 'glass' as MediumType },
      diagram: (
        <svg viewBox="0 0 320 200" className="w-full h-44 rounded-xl bg-slate-950 border border-slate-800">
          {/* Cladding top */}
          <rect x="0" y="30" width="320" height="30" fill="rgba(148, 163, 184, 0.2)" />
          <line x1="0" y1="60" x2="320" y2="60" stroke="#64748b" strokeWidth="1.5" />
          <text x="10" y="50" fill="#94a3b8" fontSize="10">Vỏ (Cladding, n₂)</text>

          {/* Core */}
          <rect x="0" y="60" width="320" height="80" fill="rgba(56, 189, 248, 0.1)" />
          <text x="10" y="105" fill="#38bdf8" fontSize="11" fontWeight="bold">Lõi sợi quang (Core, n₁ &gt; n₂)</text>

          {/* Cladding bottom */}
          <rect x="0" y="140" width="320" height="30" fill="rgba(148, 163, 184, 0.2)" />
          <line x1="0" y1="140" x2="320" y2="140" stroke="#64748b" strokeWidth="1.5" />
          <text x="10" y="160" fill="#94a3b8" fontSize="10">Vỏ (Cladding, n₂)</text>

          {/* Laser ray bouncing inside core */}
          <polyline
            points="0,110 50,60 130,140 210,60 290,140 320,110"
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            filter="drop-shadow(0 0 6px #ef4444)"
          />
          {/* Normal indicators at bounce points */}
          <line x1="50" y1="45" x2="50" y2="75" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="130" y1="125" x2="130" y2="155" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      ),
    },
  ];

  const currentPhenomenon = phenomena.find((p) => p.id === activeTab) || phenomena[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-100">{t.phenomena.title}</h2>
              <p className="text-xs text-slate-400">{t.phenomena.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-2 overflow-x-auto">
          {phenomena.map((p) => {
            const Icon = p.icon;
            const isActive = activeTab === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10 rounded-t-xl'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{p.title}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            {/* Visual Diagram */}
            <div>{currentPhenomenon.diagram}</div>

            {/* Explanation & Details */}
            <div className="space-y-3.5">
              <div className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {currentPhenomenon.tag}
              </div>
              <h3 className="text-base font-bold text-slate-100">{currentPhenomenon.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{currentPhenomenon.desc}</p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 font-semibold">
                {currentPhenomenon.formula}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onApplyPreset(
                currentPhenomenon.preset.n1,
                currentPhenomenon.preset.n2,
                currentPhenomenon.preset.i,
                currentPhenomenon.preset.m1,
                currentPhenomenon.preset.m2
              );
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition"
          >
            <span>{lang === 'vi' ? 'Mô phỏng hiện tượng này ngay' : 'Simulate This Phenomenon Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            {t.phenomena.close}
          </button>
        </div>
      </div>
    </div>
  );
};
