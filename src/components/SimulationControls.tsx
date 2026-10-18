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
  RotateCw,
  Check,
  Edit3,
} from 'lucide-react';

interface SimulationControlsProps {
  medium1: MediumInfo;
  medium2: MediumInfo;
  n1Value: number;
  n2Value: number;
  laserAngle: number; // 0 to 360
  laserActive: boolean;
  laserConfig: LaserConfig;
  beamMode: 'ray' | 'wave';
  showProtractor: boolean;
  showNormal: boolean;
  showAngles: boolean;
  showIntensityProbe: boolean;
  physics: RefractionResult;
  lang: Language;
  onMedium1PresetChange: (type: MediumType) => void;
  onMedium2PresetChange: (type: MediumType) => void;
  onN1Change: (n: number) => void;
  onN2Change: (n: number) => void;
  onSwapMedia: () => void;
  onLaserAngleChange: (angle: number) => void;
  onLaserActiveChange: (active: boolean) => void;
  onLaserColorChange: (color: LaserColor) => void;
  onBeamModeChange: (mode: 'ray' | 'wave') => void;
  onToggleProtractor: () => void;
  onToggleNormal: () => void;
  onToggleAngles: () => void;
  onToggleIntensityProbe: () => void;
  onApplyPreset: (n1: number, n2: number, laserAngle: number, m1?: MediumType, m2?: MediumType) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  medium1,
  medium2,
  n1Value,
  n2Value,
  laserAngle,
  laserActive,
  laserConfig,
  beamMode,
  showProtractor,
  showNormal,
  showAngles,
  showIntensityProbe,
  physics,
  lang,
  onMedium1PresetChange,
  onMedium2PresetChange,
  onN1Change,
  onN2Change,
  onSwapMedia,
  onLaserAngleChange,
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
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-6">
      {/* 1. MEDIA SELECTION & DIRECT REFRACTIVE INDEX INPUT */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-cyan-400" />
            <span>
              {lang === 'vi'
                ? 'Cài đặt Môi trường & Nhập chiết suất n'
                : 'Media Settings & Direct Refractive Index (n)'}
            </span>
          </h3>
          <span className="text-[11px] text-slate-400">
            {lang === 'vi' ? 'Có thể chọn mẫu hoặc nhập số trực tiếp' : 'Select preset or type index directly'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* MEDIUM 1 (TOP) */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border-2 border-cyan-500/30 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: medium1.color }} />
                <span>{lang === 'vi' ? 'Môi trường 1 (Nửa trên)' : 'Medium 1 (Top Half)'}</span>
              </label>

              {physics.incidentMedium === 1 && (
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40 font-bold uppercase">
                  {lang === 'vi' ? 'Nguồn tới' : 'Incident'}
                </span>
              )}
            </div>

            {/* Preset Selector */}
            <select
              value={medium1.id}
              onChange={(e) => onMedium1PresetChange(e.target.value as MediumType)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-cyan-400"
            >
              {Object.values(MEDIA_PRESETS).map((m) => (
                <option key={`m1-${m.id}`} value={m.id}>
                  {lang === 'vi' ? m.nameVi : m.nameEn} (n = {m.n.toFixed(2)})
                </option>
              ))}
            </select>

            {/* Direct Number Input for n1 */}
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-300">
                  {lang === 'vi' ? 'Nhập chiết suất n₁:' : 'Type index n₁:'}
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1.000"
                    max="3.000"
                    step="0.005"
                    value={n1Value}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) onN1Change(Math.max(1.0, Math.min(3.0, val)));
                    }}
                    className="w-20 bg-slate-950 border border-cyan-500/50 rounded-lg px-2.5 py-1 text-right font-mono font-bold text-cyan-300 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>

              {/* Slider for n1 */}
              <input
                type="range"
                min="1.000"
                max="3.000"
                step="0.01"
                value={n1Value}
                onChange={(e) => onN1Change(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1.00</span>
                <span>2.00</span>
                <span>3.00</span>
              </div>
            </div>
          </div>

          {/* Swap Media Button */}
          <div className="flex justify-center">
            <button
              onClick={onSwapMedia}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 border border-slate-700 hover:border-cyan-500/50 transition shadow-lg group"
              title={`${t.controls.swapMedia} (Tính thuận nghịch của ánh sáng)`}
            >
              <ArrowLeftRight className="w-5 h-5 transition-transform group-hover:rotate-180" />
            </button>
          </div>

          {/* MEDIUM 2 (BOTTOM) */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border-2 border-emerald-500/30 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: medium2.color }} />
                <span>{lang === 'vi' ? 'Môi trường 2 (Nửa dưới)' : 'Medium 2 (Bottom Half)'}</span>
              </label>

              {physics.incidentMedium === 2 && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold uppercase">
                  {lang === 'vi' ? 'Nguồn tới' : 'Incident'}
                </span>
              )}
            </div>

            {/* Preset Selector */}
            <select
              value={medium2.id}
              onChange={(e) => onMedium2PresetChange(e.target.value as MediumType)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-400"
            >
              {Object.values(MEDIA_PRESETS).map((m) => (
                <option key={`m2-${m.id}`} value={m.id}>
                  {lang === 'vi' ? m.nameVi : m.nameEn} (n = {m.n.toFixed(2)})
                </option>
              ))}
            </select>

            {/* Direct Number Input for n2 */}
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-300">
                  {lang === 'vi' ? 'Nhập chiết suất n₂:' : 'Type index n₂:'}
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1.000"
                    max="3.000"
                    step="0.005"
                    value={n2Value}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) onN2Change(Math.max(1.0, Math.min(3.0, val)));
                    }}
                    className="w-20 bg-slate-950 border border-emerald-500/50 rounded-lg px-2.5 py-1 text-right font-mono font-bold text-emerald-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* Slider for n2 */}
              <input
                type="range"
                min="1.000"
                max="3.000"
                step="0.01"
                value={n2Value}
                onChange={(e) => onN2Change(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1.00</span>
                <span>2.00</span>
                <span>3.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 360-DEGREE ROTATION CONTROLLER */}
      <div className="bg-slate-950/80 p-4 md:p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <RotateCw className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {lang === 'vi' ? 'Xoay tia tới 360° (Laser Rotation)' : '360° Laser Rotation'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Display Angle of incidence i */}
            <div className="bg-slate-900 px-3 py-1 rounded-xl border border-slate-700 flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Góc tới i:</span>
              <span className="font-mono text-sm font-bold text-cyan-400">
                {physics.incidentAngleDeg.toFixed(1)}°
              </span>
            </div>

            {/* Display full 360 circle angle */}
            <div className="bg-slate-900 px-3 py-1 rounded-xl border border-slate-700 flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Vòng xoay 360°:</span>
              <input
                type="number"
                min="0"
                max="360"
                step="1"
                value={Math.round(laserAngle)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) onLaserAngleChange(((val % 360) + 360) % 360);
                }}
                className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono font-bold text-slate-200 text-xs focus:outline-none"
              />
              <span className="font-mono text-slate-400 text-xs">°</span>
            </div>
          </div>
        </div>

        {/* 360-Degree Continuous Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max="359.5"
            step="0.5"
            value={laserAngle}
            onChange={(e) => onLaserAngleChange(parseFloat(e.target.value))}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 shadow-inner"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono px-1">
            <span>0° (Trên N)</span>
            <span>90° (Mặt S')</span>
            <span>180° (Dưới N')</span>
            <span>270° (Mặt S)</span>
            <span>360°</span>
          </div>
        </div>

        {/* Quadrant Quick Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {/* Top-Left Quadrant */}
          <button
            onClick={() => onLaserAngleChange(330)}
            className={`p-2 rounded-xl border text-xs font-semibold transition text-left ${
              laserAngle >= 270 && laserAngle <= 360
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-cyan-400">Từ MT 1 (Trên - Trái)</div>
            <div className="font-mono text-xs text-slate-200">θ = 330° (i = 30°)</div>
          </button>

          {/* Top-Right Quadrant */}
          <button
            onClick={() => onLaserAngleChange(45)}
            className={`p-2 rounded-xl border text-xs font-semibold transition text-left ${
              laserAngle >= 0 && laserAngle <= 90
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-cyan-400">Từ MT 1 (Trên - Phải)</div>
            <div className="font-mono text-xs text-slate-200">θ = 45° (i = 45°)</div>
          </button>

          {/* Bottom-Right Quadrant */}
          <button
            onClick={() => onLaserAngleChange(135)}
            className={`p-2 rounded-xl border text-xs font-semibold transition text-left ${
              laserAngle > 90 && laserAngle <= 180
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-emerald-400">Từ MT 2 (Dưới - Phải)</div>
            <div className="font-mono text-xs text-slate-200">θ = 135° (i = 45°)</div>
          </button>

          {/* Bottom-Left Quadrant */}
          <button
            onClick={() => onLaserAngleChange(225)}
            className={`p-2 rounded-xl border text-xs font-semibold transition text-left ${
              laserAngle > 180 && laserAngle < 270
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-emerald-400">Từ MT 2 (Dưới - Trái)</div>
            <div className="font-mono text-xs text-slate-200">θ = 225° (i = 45°)</div>
          </button>
        </div>
      </div>

      {/* 3. PHYSICS OUTPUTS BADGES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Angle r */}
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">{t.controls.refractedAngle}</span>
          <div className="mt-1">
            {physics.isTotalInternalReflection ? (
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
                {lang === 'vi' ? 'Phản xạ toàn phần' : 'TIR'}
              </span>
            ) : (
              <span className="font-mono text-lg font-bold text-emerald-400">
                {physics.refractedAngleDeg?.toFixed(1)}°
              </span>
            )}
          </div>
        </div>

        {/* Critical Angle igh */}
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">{t.controls.criticalAngle}</span>
          <div className="mt-1 font-mono text-lg font-bold text-amber-400">
            {physics.criticalAngleDeg !== null ? `${physics.criticalAngleDeg.toFixed(1)}°` : '—'}
          </div>
        </div>

        {/* Deviation Angle D */}
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">Góc lệch D = |i - r|</span>
          <div className="mt-1 font-mono text-lg font-bold text-purple-400">
            {physics.deviationAngleDeg !== null ? `${physics.deviationAngleDeg.toFixed(1)}°` : '—'}
          </div>
        </div>

        {/* Relative Index n21 */}
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">Chiết suất tỉ đối n₂₁</span>
          <div className="mt-1 font-mono text-lg font-bold text-sky-400">
            {physics.relativeIndexN21.toFixed(3)}
          </div>
        </div>
      </div>

      {/* 4. LASER CONTROLS & WORKSPACE OVERLAYS */}
      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Laser Power & Wavelength */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => onLaserActiveChange(!laserActive)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
              laserActive
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-lg shadow-rose-500/10'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{laserActive ? (lang === 'vi' ? 'Bật La-de' : 'Laser ON') : (lang === 'vi' ? 'Tắt La-de' : 'Laser OFF')}</span>
          </button>

          {/* Color picker */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {(Object.keys(LASER_CONFIGS) as LaserColor[]).map((cKey) => {
              const cfg = LASER_CONFIGS[cKey];
              const isSelected = laserConfig.color === cKey;
              return (
                <button
                  key={cKey}
                  onClick={() => onLaserColorChange(cKey)}
                  className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                    isSelected ? 'scale-110 ring-2 ring-white/60' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: cfg.hex }}
                  title={`${cKey} (${cfg.wavelength}nm)`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                </button>
              );
            })}
          </div>

          {/* Ray vs Wave */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => onBeamModeChange('ray')}
              className={`px-3 py-1 rounded-lg transition ${
                beamMode === 'ray' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.controls.beamRay}
            </button>
            <button
              onClick={() => onBeamModeChange('wave')}
              className={`px-3 py-1 rounded-lg transition ${
                beamMode === 'wave' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.controls.beamWave}
            </button>
          </div>
        </div>

        {/* Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onToggleProtractor}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition border ${
              showProtractor
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Thước 360°</span>
          </button>

          <button
            onClick={onToggleNormal}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition border ${
              showNormal
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>NN'</span>
          </button>

          <button
            onClick={onToggleIntensityProbe}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition border ${
              showIntensityProbe
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>{t.controls.showIntensity}</span>
          </button>
        </div>
      </div>

      {/* 5. QUICK PRESETS BAR */}
      <div className="pt-2 border-t border-slate-800">
        <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.controls.presets}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Test 1: Air to Water, i = 30 */}
          <button
            onClick={() => onApplyPreset(1.0, 1.333, 330, 'air', 'water')}
            className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition"
          >
            Không khí → Nước (i = 30° ⇒ r ≈ 22.1°)
          </button>

          {/* Test 2: Air to Glass, i = 45 */}
          <button
            onClick={() => onApplyPreset(1.0, 1.5, 315, 'air', 'glass')}
            className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition"
          >
            Không khí → Thủy tinh (i = 45° ⇒ r ≈ 28.1°)
          </button>

          {/* Reverse: Water to Air from below, i = 50 (TIR) */}
          <button
            onClick={() => onApplyPreset(1.0, 1.333, 130, 'air', 'water')}
            className="text-[11px] px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition font-medium"
          >
            Từ dưới Nước → Không khí (i = 50° &gt; igh - Phản xạ toàn phần!)
          </button>

          {/* Diamond to Air from below */}
          <button
            onClick={() => onApplyPreset(1.0, 2.417, 150, 'air', 'diamond')}
            className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 transition"
          >
            Kim cương → Không khí (igh ≈ 24.4°)
          </button>
        </div>
      </div>
    </div>
  );
};
