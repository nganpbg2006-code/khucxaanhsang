import React from 'react';
import {
  MediumInfo,
  MediumType,
  LaserColor,
  LaserConfig,
  RefractionResult,
} from '../types/optics';
import { MEDIA_PRESETS, LASER_CONFIGS } from '../utils/optics';
import { Language, translations } from '../utils/translations';
import {
  ArrowLeftRight,
  Power,
  Layers,
  Compass,
  Gauge,
  Sliders,
  Sparkles,
  Activity,
  Check,
} from 'lucide-react';

interface SimulationControlsProps {
  medium1: MediumInfo;
  medium2: MediumInfo;
  customN1: number;
  customN2: number;
  incidentAngle: number;
  laserActive: boolean;
  laserConfig: LaserConfig;
  beamMode: 'ray' | 'wave';
  showProtractor: boolean;
  showNormal: boolean;
  showAngles: boolean;
  showIntensityProbe: boolean;
  physics: RefractionResult;
  lang: Language;
  onMedium1Change: (type: MediumType, customN?: number) => void;
  onMedium2Change: (type: MediumType, customN?: number) => void;
  onSwapMedia: () => void;
  onAngleChange: (angle: number) => void;
  onLaserActiveChange: (active: boolean) => void;
  onLaserColorChange: (color: LaserColor) => void;
  onBeamModeChange: (mode: 'ray' | 'wave') => void;
  onToggleProtractor: () => void;
  onToggleNormal: () => void;
  onToggleAngles: () => void;
  onToggleIntensityProbe: () => void;
  onApplyPreset: (n1: number, n2: number, i: number, m1: MediumType, m2: MediumType) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  medium1,
  medium2,
  customN1,
  customN2,
  incidentAngle,
  laserActive,
  laserConfig,
  beamMode,
  showProtractor,
  showNormal,
  showAngles,
  showIntensityProbe,
  physics,
  lang,
  onMedium1Change,
  onMedium2Change,
  onSwapMedia,
  onAngleChange,
  onLaserActiveChange,
  onLaserColorChange,
  onBeamModeChange,
  onToggleProtractor,
  onToggleNormal,
  onToggleAngles,
  onToggleIntensityProbe,
  onApplyPreset,
}) => {
  const t = translations[lang];

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl space-y-5">
      {/* Media Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* Medium 1 (Top) */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: medium1.color }} />
              {t.controls.medium1}
            </label>
            <span className="text-xs font-mono font-bold text-cyan-400">
              n₁ = {medium1.n.toFixed(2)}
            </span>
          </div>

          <select
            value={medium1.id}
            onChange={(e) => onMedium1Change(e.target.value as MediumType)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {Object.values(MEDIA_PRESETS).map((m) => (
              <option key={`m1-${m.id}`} value={m.id}>
                {lang === 'vi' ? m.nameVi : m.nameEn} (n = {m.n.toFixed(2)})
              </option>
            ))}
          </select>

          {medium1.id === 'custom' && (
            <div className="pt-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>1.00</span>
                <span className="text-cyan-400 font-mono font-bold">{customN1.toFixed(3)}</span>
                <span>2.60</span>
              </div>
              <input
                type="range"
                min="1.00"
                max="2.60"
                step="0.01"
                value={customN1}
                onChange={(e) => onMedium1Change('custom', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          )}
        </div>

        {/* Swap Media Button */}
        <div className="flex justify-center">
          <button
            onClick={onSwapMedia}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 border border-slate-700/60 hover:border-cyan-500/50 transition shadow-md group"
            title={`${t.controls.swapMedia} (Tính thuận nghịch của chiều truyền ánh sáng)`}
          >
            <ArrowLeftRight className="w-4 h-4 transition-transform group-hover:rotate-180" />
          </button>
        </div>

        {/* Medium 2 (Bottom) */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: medium2.color }} />
              {t.controls.medium2}
            </label>
            <span className="text-xs font-mono font-bold text-emerald-400">
              n₂ = {medium2.n.toFixed(2)}
            </span>
          </div>

          <select
            value={medium2.id}
            onChange={(e) => onMedium2Change(e.target.value as MediumType)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {Object.values(MEDIA_PRESETS).map((m) => (
              <option key={`m2-${m.id}`} value={m.id}>
                {lang === 'vi' ? m.nameVi : m.nameEn} (n = {m.n.toFixed(2)})
              </option>
            ))}
          </select>

          {medium2.id === 'custom' && (
            <div className="pt-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>1.00</span>
                <span className="text-emerald-400 font-mono font-bold">{customN2.toFixed(3)}</span>
                <span>2.60</span>
              </div>
              <input
                type="range"
                min="1.00"
                max="2.60"
                step="0.01"
                value={customN2}
                onChange={(e) => onMedium2Change('custom', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>
          )}
        </div>
      </div>

      {/* Incident Angle (i) Slider & Quick Step Buttons */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-200">
              {t.controls.incidentAngle}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              max="85"
              step="0.5"
              value={incidentAngle}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) onAngleChange(Math.max(0, Math.min(85, val)));
              }}
              className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right font-mono font-bold text-cyan-400 text-sm focus:outline-none focus:border-cyan-500"
            />
            <span className="font-mono text-sm text-cyan-400 font-bold">°</span>
          </div>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="0"
          max="85"
          step="0.5"
          value={incidentAngle}
          onChange={(e) => onAngleChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />

        {/* Quick Stepper Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onAngleChange(Math.max(0, incidentAngle - 5))}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 border border-slate-800"
            >
              -5°
            </button>
            <button
              onClick={() => onAngleChange(Math.max(0, incidentAngle - 1))}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 border border-slate-800"
            >
              -1°
            </button>
          </div>

          <div className="flex items-center gap-1 text-slate-400 font-mono">
            <span>0°</span>
            <span className="text-slate-600">|</span>
            <span>30°</span>
            <span className="text-slate-600">|</span>
            <span>45°</span>
            <span className="text-slate-600">|</span>
            <span>60°</span>
            <span className="text-slate-600">|</span>
            <span>85°</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onAngleChange(Math.min(85, incidentAngle + 1))}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 border border-slate-800"
            >
              +1°
            </button>
            <button
              onClick={() => onAngleChange(Math.min(85, incidentAngle + 5))}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 border border-slate-800"
            >
              +5°
            </button>
          </div>
        </div>
      </div>

      {/* Physics Outputs Live Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Angle r */}
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">{t.controls.refractedAngle}</span>
          <div className="mt-1">
            {physics.isTotalInternalReflection ? (
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                {lang === 'vi' ? 'Phản xạ TP' : 'TIR'}
              </span>
            ) : (
              <span className="font-mono text-base font-bold text-emerald-400">
                {physics.refractedAngleDeg?.toFixed(1)}°
              </span>
            )}
          </div>
        </div>

        {/* Critical Angle igh */}
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">{t.controls.criticalAngle}</span>
          <div className="mt-1 font-mono text-base font-bold text-amber-400">
            {physics.criticalAngleDeg !== null ? `${physics.criticalAngleDeg.toFixed(1)}°` : '—'}
          </div>
        </div>

        {/* Deviation Angle D */}
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">Góc lệch D = |i - r|</span>
          <div className="mt-1 font-mono text-base font-bold text-purple-400">
            {physics.deviationAngleDeg !== null ? `${physics.deviationAngleDeg.toFixed(1)}°` : '—'}
          </div>
        </div>

        {/* Relative Index n21 */}
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">Chiết suất n₂₁ = n₂/n₁</span>
          <div className="mt-1 font-mono text-base font-bold text-sky-400">
            {physics.relativeIndexN21.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Laser & Tools Controls Bar */}
      <div className="pt-1 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Laser Power & Wavelength */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onLaserActiveChange(!laserActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              laserActive
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-lg shadow-rose-500/10'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{laserActive ? (lang === 'vi' ? 'Bật La-de' : 'Laser ON') : (lang === 'vi' ? 'Tắt La-de' : 'Laser OFF')}</span>
          </button>

          {/* Laser Color picker */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(Object.keys(LASER_CONFIGS) as LaserColor[]).map((cKey) => {
              const cfg = LASER_CONFIGS[cKey];
              const isSelected = laserConfig.color === cKey;
              return (
                <button
                  key={cKey}
                  onClick={() => onLaserColorChange(cKey)}
                  className={`w-5 h-5 rounded-full transition-transform flex items-center justify-center ${
                    isSelected ? 'scale-110 ring-2 ring-white/50' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: cfg.hex }}
                  title={`${cKey} (${cfg.wavelength}nm)`}
                >
                  {isSelected && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                </button>
              );
            })}
          </div>

          {/* Ray vs Wave Mode */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => onBeamModeChange('ray')}
              className={`px-2.5 py-1 rounded-lg transition ${
                beamMode === 'ray' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.controls.beamRay}
            </button>
            <button
              onClick={() => onBeamModeChange('wave')}
              className={`px-2.5 py-1 rounded-lg transition ${
                beamMode === 'wave' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.controls.beamWave}
            </button>
          </div>
        </div>

        {/* Overlay Switches: Protractor, Normal, Intensity Probe */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={onToggleProtractor}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition border ${
              showProtractor
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title={t.controls.showProtractor}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.controls.showProtractor}</span>
          </button>

          <button
            onClick={onToggleNormal}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition border ${
              showNormal
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title={t.controls.showNormal}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">NN'</span>
          </button>

          <button
            onClick={onToggleIntensityProbe}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition border ${
              showIntensityProbe
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title={t.controls.showIntensity}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.controls.showIntensity}</span>
          </button>
        </div>
      </div>

      {/* Quick Scientific Presets Bar */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.controls.presets}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {/* Test 1 from spec */}
          <button
            onClick={() => onApplyPreset(1.0, 1.333, 30, 'air', 'water')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition"
          >
            {t.controls.presetAirWater}
          </button>

          {/* Test 2 from spec */}
          <button
            onClick={() => onApplyPreset(1.0, 1.5, 45, 'air', 'glass')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition"
          >
            {t.controls.presetAirGlass}
          </button>

          {/* Total Internal Reflection preset */}
          <button
            onClick={() => onApplyPreset(1.333, 1.0, 50, 'water', 'air')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition font-medium"
          >
            {t.controls.presetWaterAirTir}
          </button>

          {/* Diamond preset */}
          <button
            onClick={() => onApplyPreset(2.417, 1.0, 30, 'diamond', 'air')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 transition"
          >
            {t.controls.presetDiamondAir}
          </button>

          {/* Normal incidence i = 0 */}
          <button
            onClick={() => onApplyPreset(1.0, 1.5, 0, 'air', 'glass')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition"
          >
            {t.controls.presetPerpendicular}
          </button>
        </div>
      </div>
    </div>
  );
};
