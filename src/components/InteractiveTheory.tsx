import React from 'react';
import { RefractionResult, MediumInfo } from '../types/optics';
import { Language, translations } from '../utils/translations';
import { BookOpen, Calculator, Sparkles, Info, ArrowRight, Eye } from 'lucide-react';

interface InteractiveTheoryProps {
  physics: RefractionResult;
  medium1: MediumInfo;
  medium2: MediumInfo;
  lang: Language;
  onOpenPhenomenaModal: () => void;
}

export const InteractiveTheory: React.FC<InteractiveTheoryProps> = ({
  physics,
  medium1,
  medium2,
  lang,
  onOpenPhenomenaModal,
}) => {
  const t = translations[lang];

  const sinI = Math.sin(physics.incidentAngleRad);
  const sinRValue = (physics.n1 * sinI) / physics.n2;

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">{t.theory.title}</h3>
            <p className="text-xs text-slate-400">
              {lang === 'vi'
                ? 'Định luật khúc xạ & Bản chất sự truyền ánh sáng qua mặt phân cách'
                : 'Snell\'s Law and physical propagation through optical interfaces'}
            </p>
          </div>
        </div>

        {/* Real world modal trigger */}
        <button
          onClick={onOpenPhenomenaModal}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold shadow-md transition group"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 transition-transform group-hover:scale-110" />
          <span>{t.theory.realWorldModalBtn}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Core Theory & Geometric Conventions */}
        <div className="space-y-4">
          {/* 1. Phenomenon Definition */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              {t.theory.conceptTitle}
            </h4>
            <p className="text-xs leading-relaxed text-slate-300">{t.theory.conceptContent}</p>
          </div>

          {/* Geometric Conventions */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <h4 className="text-xs font-bold text-slate-300">{t.theory.elementsTitle}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="font-bold text-cyan-400">Tia tới SI:</span> Tia sáng đi đến mặt phân cách.
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="font-bold text-cyan-400">Điểm tới I:</span> Điểm tia sáng gặp mặt phân cách.
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="font-bold text-cyan-400">Pháp tuyến NN':</span> Đường thẳng ⊥ mặt phân cách tại I.
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="font-bold text-emerald-400">Tia khúc xạ IR:</span> Tia sáng đi vào môi trường 2.
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="font-bold text-cyan-400">Góc tới i:</span> Góc hợp bởi tia tới SI & pháp tuyến NN'.
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="font-bold text-emerald-400">Góc khúc xạ r:</span> Góc hợp bởi tia IR & pháp tuyến NN'.
              </div>
            </div>
          </div>

          {/* Snell's Law */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              {t.theory.lawTitle}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">{t.theory.law1}</p>
            <p className="text-xs text-slate-300 leading-relaxed">{t.theory.law2}</p>
            <div className="py-2 flex justify-center">
              <div className="bg-slate-900 px-4 py-2 rounded-xl border border-cyan-500/40 shadow-inner">
                <span className="font-mono text-sm md:text-base font-bold text-cyan-300">
                  n₁ · sin(i) = n₂ · sin(r)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Live Calculation Box with Current Values */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="bg-slate-950/80 p-4 md:p-5 rounded-xl border border-cyan-500/30 space-y-4 shadow-lg shadow-cyan-950/20">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Calculator className="w-4 h-4" />
                {t.theory.liveCalculationTitle}
              </h4>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Real-time Sync
              </span>
            </div>

            {/* Formula Step-by-Step with actual numbers inserted */}
            <div className="space-y-3 font-mono text-xs">
              {/* Step 1: Input values */}
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-slate-300 flex flex-wrap items-center justify-between gap-2">
                <span>
                  MT tới ({physics.incidentMedium === 1 ? 'MT 1' : 'MT 2'}): <strong className="text-cyan-400">{physics.nIncident.toFixed(2)}</strong>
                </span>
                <span>
                  MT khúc xạ ({physics.incidentMedium === 1 ? 'MT 2' : 'MT 1'}): <strong className="text-emerald-400">{physics.nRefracted.toFixed(2)}</strong>
                </span>
                <span>
                  i = <strong className="text-cyan-400">{physics.incidentAngleDeg.toFixed(1)}°</strong>
                </span>
              </div>

              {/* Step 2: Formula substitution */}
              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2">
                <div className="text-slate-400 text-[11px]">
                  {lang === 'vi' ? '1. Định luật Snell:' : '1. Snell\'s Law:'}
                </div>
                <div className="text-slate-200 pl-2">
                  n_tới · sin(i) = n_khúc_xạ · sin(r)
                </div>
                <div className="text-cyan-400 pl-2">
                  {physics.nIncident.toFixed(2)} · sin({physics.incidentAngleDeg.toFixed(1)}°) = {physics.nRefracted.toFixed(2)} · sin(r)
                </div>
              </div>

              {/* Step 3: Solve for sin(r) */}
              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2">
                <div className="text-slate-400 text-[11px]">
                  {lang === 'vi' ? '2. Rút ra sin(r):' : '2. Solve for sin(r):'}
                </div>
                <div className="text-slate-200 pl-2">
                  sin(r) = ({physics.nIncident.toFixed(2)} · {sinI.toFixed(4)}) / {physics.nRefracted.toFixed(2)}
                </div>
                <div className="text-emerald-400 pl-2 font-bold">
                  sin(r) = {((physics.nIncident * sinI) / physics.nRefracted).toFixed(4)}
                </div>
              </div>

              {/* Step 4: Final Angle r or Total Internal Reflection Result */}
              {physics.isTotalInternalReflection ? (
                <div className="p-3.5 bg-amber-500/10 rounded-lg border border-amber-500/40 space-y-1.5">
                  <div className="text-amber-300 font-bold text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    {lang === 'vi' ? 'PHẢN XẠ TOÀN PHẦN (TIR)' : 'TOTAL INTERNAL REFLECTION'}
                  </div>
                  <p className="text-[11px] text-amber-200/90 font-sans leading-relaxed">
                    Vì sin(r) &gt; 1.0 (hoặc góc tới i = {physics.incidentAngleDeg.toFixed(1)}° &gt; i<sub>gh</sub> = {physics.criticalAngleDeg?.toFixed(1)}°), tia sáng không thể khúc xạ sang môi trường đối diện mà bị phản xạ toàn phần trở lại môi trường tới!
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-500/10 rounded-lg border border-emerald-500/40 space-y-1">
                  <div className="text-slate-400 text-[11px]">
                    {lang === 'vi' ? '3. Góc khúc xạ kết quả:' : '3. Resulting Refracted Angle:'}
                  </div>
                  <div className="text-emerald-300 font-bold text-sm">
                    r = arcsin({((physics.nIncident * sinI) / physics.nRefracted).toFixed(4)}) ≈{' '}
                    <span className="text-base text-emerald-400 underline decoration-emerald-500/50">
                      {physics.refractedAngleDeg?.toFixed(1)}°
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Behavior Rule Banner */}
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs">
              <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                {lang === 'vi' ? 'Quy luật quan sát:' : 'Optical Rule:'}
              </div>
              <p className="text-slate-400 leading-relaxed">
                {physics.isTotalInternalReflection
                  ? t.status.totalReflectionDesc
                  : physics.bendingDirection === 'towards_normal'
                  ? t.status.bendsTowards
                  : physics.bendingDirection === 'away_from_normal'
                  ? t.status.bendsAway
                  : t.status.straightPath}
              </p>
            </div>
          </div>

          {/* Quick takeaway summary */}
          <div className="bg-gradient-to-r from-cyan-950/40 to-slate-950 p-3.5 rounded-xl border border-cyan-800/40 text-[11px] text-cyan-200/90 flex items-center gap-2">
            <span className="text-cyan-400 font-bold">💡 Ghi nhớ nhanh:</span>
            <span>
              {physics.n1 < physics.n2
                ? 'n₁ < n₂ ⇒ r < i: Từ môi trường kém chiết quang sang chiết quang hơn, tia sáng bẻ lại gần pháp tuyến.'
                : physics.n1 > physics.n2
                ? 'n₁ > n₂ ⇒ r > i: Từ môi trường chiết quang sang kém chiết quang, tia sáng bẻ ra xa pháp tuyến.'
                : 'n₁ = n₂: Ánh sáng truyền thẳng qua môi trường đồng tính.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
