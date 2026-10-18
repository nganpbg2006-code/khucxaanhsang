import React, { useRef, useState, useCallback } from 'react';
import { RefractionResult, LaserConfig, MediumInfo } from '../types/optics';
import { Language, translations } from '../utils/translations';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, Sparkles, Compass } from 'lucide-react';

interface SimulationCanvasProps {
  physics: RefractionResult;
  medium1: MediumInfo;
  medium2: MediumInfo;
  laserConfig: LaserConfig;
  laserActive: boolean;
  beamMode: 'ray' | 'wave';
  showProtractor: boolean;
  showNormal: boolean;
  showAngles: boolean;
  showIntensityProbe: boolean;
  lang: Language;
  onLaserAngleChange: (newAngle: number) => void;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  physics,
  medium1,
  medium2,
  laserConfig,
  laserActive,
  beamMode,
  showProtractor,
  showNormal,
  showAngles,
  showIntensityProbe,
  lang,
  onLaserAngleChange,
}) => {
  const t = translations[lang];
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Zoom and Pan states
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Laser drag state
  const [isDraggingLaser, setIsDraggingLaser] = useState<boolean>(false);

  // Draggable Intensity Probe position
  const [probePos, setProbePos] = useState<{ x: number; y: number }>({ x: 720, y: 160 });
  const [isDraggingProbe, setIsDraggingProbe] = useState<boolean>(false);

  // Geometry dimensions
  const WIDTH = 1000;
  const HEIGHT = 640;
  const IX = 500; // Point of incidence X
  const IY = 320; // Point of incidence Y (Interface line)
  const RADIUS = 250; // Orbit radius of laser emitter around I
  const OUT_RADIUS = 300; // Ray length into media

  const laserAngle = physics.laserAngleDeg; // 0 to 360
  const thetaRad = (laserAngle * Math.PI) / 180;

  // Laser emitter position (anywhere on 360° circle!)
  // 0° = top (0, -R), 90° = right (R, 0), 180° = bottom (0, R), 270° = left (-R, 0)
  const laserX = IX + RADIUS * Math.sin(thetaRad);
  const laserY = IY - RADIUS * Math.cos(thetaRad);

  // Reflected ray end position:
  // Stays in the SAME medium as incident ray, on the opposite side of the normal
  const reflectedX = IX - OUT_RADIUS * Math.sin(thetaRad);
  const reflectedY = IY - OUT_RADIUS * Math.cos(thetaRad);

  // Refracted ray end position:
  // Propagates into the OTHER medium, on the opposite side of the normal
  const rDeg = physics.refractedAngleDeg;
  const rRad = rDeg !== null ? (rDeg * Math.PI) / 180 : null;

  let refractedX: number | null = null;
  let refractedY: number | null = null;

  if (rRad !== null && !physics.isTotalInternalReflection) {
    // horizontal direction is opposite to laser horizontal position
    const sinSign = Math.sin(thetaRad) >= 0 ? -1 : 1;
    refractedX = IX + sinSign * OUT_RADIUS * Math.sin(rRad);

    // vertical direction: if laser in top half (incidentMedium === 1), goes down (+cos)
    // if laser in bottom half (incidentMedium === 2), goes up (-cos)
    if (physics.incidentMedium === 1) {
      refractedY = IY + OUT_RADIUS * Math.cos(rRad);
    } else {
      refractedY = IY - OUT_RADIUS * Math.cos(rRad);
    }
  }

  // Calculate probe intensity
  const getProbeReading = () => {
    if (!laserActive) return { type: 'none', value: 0 };
    const distToI = Math.hypot(probePos.x - IX, probePos.y - IY);
    if (distToI > OUT_RADIUS + 50) return { type: 'none', value: 0 };

    function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
      const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
      if (l2 === 0) return Math.hypot(px - x1, py - y1);
      let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
      t = Math.max(0, Math.min(1, t));
      return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
    }

    const dIncident = distToSegment(probePos.x, probePos.y, laserX, laserY, IX, IY);
    const dReflected = distToSegment(probePos.x, probePos.y, IX, IY, reflectedX, reflectedY);
    const dRefracted =
      refractedX !== null && refractedY !== null
        ? distToSegment(probePos.x, probePos.y, IX, IY, refractedX, refractedY)
        : 999;

    const threshold = 35;
    if (dIncident < threshold) return { type: 'incident', value: 100 };
    if (dReflected < threshold) {
      return {
        type: 'reflected',
        value: Number((physics.reflectionCoefficient * 100).toFixed(1)),
      };
    }
    if (dRefracted < threshold && !physics.isTotalInternalReflection) {
      return {
        type: 'refracted',
        value: Number((physics.transmissionCoefficient * 100).toFixed(1)),
      };
    }

    return { type: 'none', value: 0 };
  };

  const probeReading = getProbeReading();

  // Full 360-degree dragging calculation from mouse/touch coords
  const updateLaserAngleFromCoords = useCallback(
    (clientX: number, clientY: number) => {
      const dx = clientX - IX;
      const dy = clientY - IY;

      // In our coordinate system:
      // dx = R * sin(theta)
      // -dy = R * cos(theta) (since y increases downwards)
      // theta = atan2(dx, -dy)
      let angleRad = Math.atan2(dx, -dy);
      let angleDeg = (angleRad * 180) / Math.PI;

      // Normalize to [0, 360)
      angleDeg = ((angleDeg % 360) + 360) % 360;

      // Round to 0.5 degrees for smooth precision
      angleDeg = Math.round(angleDeg * 2) / 2;
      onLaserAngleChange(angleDeg);
    },
    [onLaserAngleChange]
  );

  const handleSvgPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if ((e.target as HTMLElement).closest?.('.probe-element')) {
      return;
    }

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = (e.clientX - rect.left) / zoom - pan.x;
    const clientY = (e.clientY - rect.top) / zoom - pan.y;

    const distToLaser = Math.hypot(clientX - laserX, clientY - laserY);
    const distToCenter = Math.hypot(clientX - IX, clientY - IY);

    // If clicked near the laser emitter OR on the 360° circular track
    if (distToLaser < 55 || Math.abs(distToCenter - RADIUS) < 40) {
      setIsDraggingLaser(true);
      (e.target as Element).setPointerCapture?.(e.pointerId);
      updateLaserAngleFromCoords(clientX, clientY);
    } else {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isDraggingProbe) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / zoom - pan.x;
      const y = (e.clientY - rect.top) / zoom - pan.y;
      setProbePos({
        x: Math.max(50, Math.min(WIDTH - 50, x)),
        y: Math.max(50, Math.min(HEIGHT - 50, y)),
      });
      return;
    }

    if (isDraggingLaser) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / zoom - pan.x;
      const y = (e.clientY - rect.top) / zoom - pan.y;
      updateLaserAngleFromCoords(x, y);
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleSvgPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isDraggingLaser) {
      setIsDraggingLaser(false);
      try {
        (e.target as Element).releasePointerCapture?.(e.pointerId);
      } catch {}
    }
    if (isDraggingProbe) {
      setIsDraggingProbe(false);
    }
    if (isPanning) {
      setIsPanning(false);
    }
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Full 360-degree Protractor Ticks (Top & Bottom normals = 0°)
  const renderProtractor = () => {
    if (!showProtractor) return null;
    const pRadius = 225;
    const ticks = [];

    for (let deg = 0; deg < 360; deg += 2) {
      const isMajor = deg % 10 === 0;
      const isMedium = deg % 5 === 0 && !isMajor;
      const tickLen = isMajor ? 14 : isMedium ? 9 : 5;

      const rad = (deg * Math.PI) / 180;
      const x1 = IX + pRadius * Math.sin(rad);
      const y1 = IY - pRadius * Math.cos(rad);
      const x2 = IX + (pRadius - tickLen) * Math.sin(rad);
      const y2 = IY - (pRadius - tickLen) * Math.cos(rad);

      ticks.push(
        <line
          key={`pt-${deg}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#94a3b8"
          strokeWidth={isMajor ? 1.5 : 0.8}
          opacity={isMajor ? 0.9 : 0.45}
        />
      );

      // Degree label: measures acute angle from nearest normal (0° at top and 0° at bottom)
      if (isMajor && deg % 30 === 0) {
        let labelAngle = deg;
        if (deg <= 90) labelAngle = deg;
        else if (deg <= 180) labelAngle = 180 - deg;
        else if (deg <= 270) labelAngle = deg - 180;
        else labelAngle = 360 - deg;

        const tx = IX + (pRadius - 26) * Math.sin(rad);
        const ty = IY - (pRadius - 26) * Math.cos(rad);

        ticks.push(
          <text
            key={`pt-txt-${deg}`}
            x={tx}
            y={ty}
            fill="#e2e8f0"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            className="select-none pointer-events-none font-mono"
          >
            {labelAngle}°
          </text>
        );
      }
    }

    return (
      <g className="protractor pointer-events-none" opacity="0.85">
        <circle
          cx={IX}
          cy={IY}
          r={pRadius}
          fill="rgba(15, 23, 42, 0.4)"
          stroke="#475569"
          strokeWidth="1.5"
        />
        <circle
          cx={IX}
          cy={IY}
          r={pRadius - 16}
          fill="none"
          stroke="#334155"
          strokeWidth="1"
          strokeDasharray="2 4"
        />
        {ticks}
      </g>
    );
  };

  // Wavefronts rendering for any angle
  const renderWavefronts = () => {
    if (beamMode !== 'wave' || !laserActive) return null;
    const waveCount = 12;
    const waveSpacing1 = 20;
    const waveSpacing2 = waveSpacing1 * (physics.nIncident / physics.nRefracted);

    const incidentWaves = [];
    for (let w = 1; w <= waveCount; w++) {
      const d = w * waveSpacing1;
      if (d > RADIUS) break;
      const wx = IX + (RADIUS - d) * Math.sin(thetaRad);
      const wy = IY - (RADIUS - d) * Math.cos(thetaRad);
      const perpX = Math.cos(thetaRad) * 22;
      const perpY = Math.sin(thetaRad) * 22;

      incidentWaves.push(
        <line
          key={`in-wave-${w}`}
          x1={wx - perpX}
          y1={wy - perpY}
          x2={wx + perpX}
          y2={wy + perpY}
          stroke={laserConfig.hex}
          strokeWidth="1.5"
          opacity="0.6"
          strokeDasharray="2 2"
        />
      );
    }

    return (
      <g className="wavefronts pointer-events-none">
        {incidentWaves}
      </g>
    );
  };

  return (
    <div className="relative w-full h-[540px] md:h-[600px] bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl flex flex-col">
      {/* Visual Header Overlays */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Active Media Status Badges with Rich Color Indicators */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Medium 1 (Top) Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-lg backdrop-blur-md text-xs font-semibold ${
              physics.incidentMedium === 1
                ? 'bg-slate-900/95 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/30'
                : 'bg-slate-900/80 border-slate-700/70 text-slate-300'
            }`}
          >
            <span
              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: medium1.color }}
            />
            <span>
              {lang === 'vi' ? 'MT 1 (Trên):' : 'MT 1 (Top):'}{' '}
              {lang === 'vi' ? medium1.nameVi : medium1.nameEn}
            </span>
            <span className="font-mono text-cyan-400 font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
              n₁ = {medium1.n.toFixed(3)}
            </span>
            {physics.incidentMedium === 1 && (
              <span className="text-[10px] bg-cyan-500 text-slate-950 px-1.5 py-0.2 rounded font-bold uppercase">
                {lang === 'vi' ? 'Môi trường tới' : 'Incident'}
              </span>
            )}
          </div>

          <span className="text-slate-500 font-bold text-sm">⇄</span>

          {/* Medium 2 (Bottom) Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-lg backdrop-blur-md text-xs font-semibold ${
              physics.incidentMedium === 2
                ? 'bg-slate-900/95 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/30'
                : 'bg-slate-900/80 border-slate-700/70 text-slate-300'
            }`}
          >
            <span
              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: medium2.color }}
            />
            <span>
              {lang === 'vi' ? 'MT 2 (Dưới):' : 'MT 2 (Bottom):'}{' '}
              {lang === 'vi' ? medium2.nameVi : medium2.nameEn}
            </span>
            <span className="font-mono text-emerald-400 font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
              n₂ = {medium2.n.toFixed(3)}
            </span>
            {physics.incidentMedium === 2 && (
              <span className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-bold uppercase">
                {lang === 'vi' ? 'Môi trường tới' : 'Incident'}
              </span>
            )}
          </div>
        </div>

        {/* View Controls & Zoom */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/70 shadow-lg">
          <button
            onClick={() => setZoom((z) => Math.min(2.2, z + 0.15))}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title={t.controls.zoomIn}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.65, z - 0.15))}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title={t.controls.zoomOut}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title={t.controls.resetView}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="px-2 text-[11px] font-mono text-cyan-400 font-bold">
            {Math.round(zoom * 100)}%
          </div>
        </div>
      </div>

      {/* Floating Notice if Total Internal Reflection occurs */}
      {physics.isTotalInternalReflection && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-bounce">
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold px-4 py-1.5 rounded-full shadow-2xl shadow-amber-500/30 text-xs backdrop-blur-md uppercase tracking-wider border border-amber-300">
            <Sparkles className="w-4 h-4" />
            {t.status.totalReflectionAlert} (i &gt; i<sub>gh</sub> = {physics.criticalAngleDeg?.toFixed(1)}°)
          </div>
        </div>
      )}

      {/* Interactive SVG Canvas */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        onPointerDown={handleSvgPointerDown}
        onPointerMove={handleSvgPointerMove}
        onPointerUp={handleSvgPointerUp}
        style={{ touchAction: 'none' }}
      >
        <defs>
          {/* Laser Glow Filters */}
          <filter id="laserGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="heavyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Medium 1 Gradient (Top Half - Clearly Distinct) */}
          <linearGradient id="medium1Grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={medium1.color} stopOpacity="0.08" />
            <stop offset="60%" stopColor={medium1.color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={medium1.color} stopOpacity="0.35" />
          </linearGradient>

          {/* Medium 2 Gradient (Bottom Half - Clearly Contrasting) */}
          <linearGradient id="medium2Grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={medium2.color} stopOpacity="0.40" />
            <stop offset="50%" stopColor={medium2.color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={medium2.color} stopOpacity="0.10" />
          </linearGradient>

          {/* Grid pattern */}
          <pattern id="subtleGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </pattern>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} transform-origin="500 320">
          {/* Medium 1 Background (Top Half) */}
          <rect x="0" y="0" width={WIDTH} height={IY} fill="url(#medium1Grad)" />
          <rect x="0" y="0" width={WIDTH} height={IY} fill="url(#subtleGrid)" />

          {/* Medium 2 Background (Bottom Half) */}
          <rect x="0" y={IY} width={WIDTH} height={HEIGHT - IY} fill="url(#medium2Grad)" />
          <rect x="0" y={IY} width={WIDTH} height={HEIGHT - IY} fill="url(#subtleGrid)" />

          {/* Water ripples / Interface effect */}
          <line
            x1="0"
            y1={IY}
            x2={WIDTH}
            y2={IY}
            stroke="#ffffff"
            strokeWidth="2.5"
            opacity="0.8"
            className="filter drop-shadow"
          />

          {/* Medium Region Labels in Canvas */}
          <g className="pointer-events-none select-none opacity-80">
            <rect x="25" y="25" width="220" height="32" rx="8" fill="#0f172a" fillOpacity="0.7" stroke={medium1.color} strokeWidth="1" />
            <text x="35" y="46" fill={medium1.color} fontSize="12" fontWeight="bold">
              ▲ MÔI TRƯỜNG 1: {lang === 'vi' ? medium1.nameVi : medium1.nameEn} (n₁ = {medium1.n.toFixed(2)})
            </text>

            <rect x="25" y={HEIGHT - 55} width="220" height="32" rx="8" fill="#0f172a" fillOpacity="0.7" stroke={medium2.color} strokeWidth="1" />
            <text x="35" y={HEIGHT - 35} fill={medium2.color} fontSize="12" fontWeight="bold">
              ▼ MÔI TRƯỜNG 2: {lang === 'vi' ? medium2.nameVi : medium2.nameEn} (n₂ = {medium2.n.toFixed(2)})
            </text>
          </g>

          {/* Interface labels */}
          <text x="24" y={IY - 10} fill="#94a3b8" fontSize="12" fontWeight="bold" className="select-none font-mono">
            S (Mặt phân cách)
          </text>
          <text x={WIDTH - 30} y={IY - 10} fill="#94a3b8" fontSize="12" fontWeight="bold" className="select-none font-mono">
            S'
          </text>

          {/* Normal Line NN' */}
          {showNormal && (
            <g className="normal-line pointer-events-none">
              <line
                x1={IX}
                y1="30"
                x2={IX}
                y2={HEIGHT - 30}
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="6 5"
                opacity="0.85"
              />
              {/* Right angle symbols at I */}
              <path d={`M ${IX - 16} ${IY} L ${IX - 16} ${IY - 16} L ${IX} ${IY - 16}`} fill="none" stroke="#94a3b8" strokeWidth="1.5" opacity="0.6" />
              <path d={`M ${IX + 16} ${IY} L ${IX + 16} ${IY + 16} L ${IX} ${IY + 16}`} fill="none" stroke="#94a3b8" strokeWidth="1.5" opacity="0.6" />
              {/* Labels N (top) and N' (bottom) */}
              <text x={IX + 12} y="45" fill="#f1f5f9" fontSize="14" fontWeight="bold" className="select-none font-mono">
                N
              </text>
              <text x={IX + 12} y={HEIGHT - 45} fill="#f1f5f9" fontSize="14" fontWeight="bold" className="select-none font-mono">
                N'
              </text>
            </g>
          )}

          {/* Full 360-degree circular orbit track for dragging */}
          <circle
            cx={IX}
            cy={IY}
            r={RADIUS}
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            className="pointer-events-none"
          />

          {/* Protractor */}
          {renderProtractor()}

          {/* Wavefronts mode */}
          {renderWavefronts()}

          {/* Angle Arcs & Labels for i and r */}
          {showAngles && laserActive && (
            <g className="angle-arcs pointer-events-none">
              {/* Badge for Angle of incidence i */}
              <g transform={`translate(${laserX * 0.4 + IX * 0.6}, ${laserY * 0.4 + IY * 0.6})`}>
                <rect x="-30" y="-12" width="60" height="24" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="0" y="3" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">
                  i = {physics.incidentAngleDeg.toFixed(1)}°
                </text>
              </g>

              {/* Badge for Angle of refraction r */}
              {!physics.isTotalInternalReflection && refractedX !== null && refractedY !== null && (
                <g transform={`translate(${refractedX * 0.4 + IX * 0.6}, ${refractedY * 0.4 + IY * 0.6})`}>
                  <rect x="-30" y="-12" width="60" height="24" rx="6" fill="#0f172a" stroke="#34d399" strokeWidth="1.5" />
                  <text x="0" y="3" fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">
                    r = {physics.refractedAngleDeg?.toFixed(1)}°
                  </text>
                </g>
              )}
            </g>
          )}

          {/* LIGHT RAYS */}
          {laserActive && (
            <g className="light-rays pointer-events-none">
              {/* INCIDENT RAY */}
              <line
                x1={laserX}
                y1={laserY}
                x2={IX}
                y2={IY}
                stroke={laserConfig.hex}
                strokeWidth="7"
                opacity="0.45"
                filter="url(#laserGlow)"
              />
              <line
                x1={laserX}
                y1={laserY}
                x2={IX}
                y2={IY}
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Direction arrow on incident ray */}
              {(() => {
                const midX = (laserX + IX) / 2;
                const midY = (laserY + IY) / 2;
                const angle = Math.atan2(IY - laserY, IX - laserX) * (180 / Math.PI);
                return (
                  <polygon
                    points={`${midX},${midY - 5} ${midX + 12},${midY} ${midX},${midY + 5}`}
                    fill={laserConfig.hex}
                    transform={`rotate(${angle}, ${midX}, ${midY})`}
                  />
                );
              })()}

              {/* REFLECTED RAY */}
              {physics.reflectionCoefficient > 0.01 && (
                <g>
                  <line
                    x1={IX}
                    y1={IY}
                    x2={reflectedX}
                    y2={reflectedY}
                    stroke={laserConfig.hex}
                    strokeWidth={physics.isTotalInternalReflection ? '8' : '5'}
                    opacity={Math.min(1.0, physics.reflectionCoefficient * 0.9 + 0.1)}
                    filter={physics.isTotalInternalReflection ? 'url(#heavyGlow)' : 'url(#laserGlow)'}
                  />
                  <line
                    x1={IX}
                    y1={IY}
                    x2={reflectedX}
                    y2={reflectedY}
                    stroke="#ffffff"
                    strokeWidth={physics.isTotalInternalReflection ? '3.5' : '2'}
                    opacity={Math.min(1.0, physics.reflectionCoefficient + 0.1)}
                    strokeLinecap="round"
                  />
                  {/* Arrow on reflected ray */}
                  {(() => {
                    const midX = (IX + reflectedX) / 2;
                    const midY = (IY + reflectedY) / 2;
                    const angle = Math.atan2(reflectedY - IY, reflectedX - IX) * (180 / Math.PI);
                    return (
                      <polygon
                        points={`${midX},${midY - 5} ${midX + 12},${midY} ${midX},${midY + 5}`}
                        fill={laserConfig.hex}
                        opacity={physics.reflectionCoefficient}
                        transform={`rotate(${angle}, ${midX}, ${midY})`}
                      />
                    );
                  })()}
                </g>
              )}

              {/* REFRACTED RAY */}
              {!physics.isTotalInternalReflection && refractedX !== null && refractedY !== null && (
                <g>
                  <line
                    x1={IX}
                    y1={IY}
                    x2={refractedX}
                    y2={refractedY}
                    stroke={laserConfig.hex}
                    strokeWidth="6"
                    opacity={physics.transmissionCoefficient * 0.65}
                    filter="url(#laserGlow)"
                  />
                  <line
                    x1={IX}
                    y1={IY}
                    x2={refractedX}
                    y2={refractedY}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    opacity={physics.transmissionCoefficient}
                    strokeLinecap="round"
                  />
                  {/* Arrow on refracted ray */}
                  {(() => {
                    const midX = (IX + refractedX) / 2;
                    const midY = (IY + refractedY) / 2;
                    const angle = Math.atan2(refractedY - IY, refractedX - IX) * (180 / Math.PI);
                    return (
                      <polygon
                        points={`${midX},${midY - 5} ${midX + 12},${midY} ${midX},${midY + 5}`}
                        fill={laserConfig.hex}
                        opacity={physics.transmissionCoefficient}
                        transform={`rotate(${angle}, ${midX}, ${midY})`}
                      />
                    );
                  })()}
                </g>
              )}
            </g>
          )}

          {/* Point of Incidence I */}
          <circle cx={IX} cy={IY} r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2.5" />
          <text x={IX - 18} y={IY + 20} fill="#f8fafc" fontSize="15" fontWeight="extrabold" className="select-none font-mono">
            I
          </text>

          {/* 360-DEGREE ROTATING LASER EMITTER DEVICE */}
          {/* Rotation angle: laser nozzle points directly towards I(IX, IY) */}
          {(() => {
            const pointingAngle = Math.atan2(IY - laserY, IX - laserX) * (180 / Math.PI);
            return (
              <g
                className="cursor-pointer"
                transform={`translate(${laserX}, ${laserY}) rotate(${pointingAngle})`}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setIsDraggingLaser(true);
                }}
              >
                {/* Laser casing */}
                <rect
                  x="-48"
                  y="-15"
                  width="50"
                  height="30"
                  rx="6"
                  fill="#1e293b"
                  stroke={isDraggingLaser ? '#38bdf8' : '#475569'}
                  strokeWidth="2"
                  className="filter drop-shadow-xl"
                />
                {/* Grip grooves */}
                <line x1="-38" y1="-8" x2="-38" y2="8" stroke="#334155" strokeWidth="2" />
                <line x1="-32" y1="-8" x2="-32" y2="8" stroke="#334155" strokeWidth="2" />
                <line x1="-26" y1="-8" x2="-26" y2="8" stroke="#334155" strokeWidth="2" />
                {/* Laser front nozzle */}
                <rect x="2" y="-9" width="10" height="18" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                {/* LED indicator */}
                <circle
                  cx="-12"
                  cy="0"
                  r="4"
                  fill={laserActive ? laserConfig.hex : '#64748b'}
                  filter={laserActive ? 'url(#laserGlow)' : 'none'}
                />
                <text
                  x="-24"
                  y="2"
                  fill="#94a3b8"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="select-none font-mono"
                >
                  360°
                </text>
                {/* Drag halo ring */}
                <circle
                  cx="0"
                  cy="0"
                  r="26"
                  fill="transparent"
                  stroke={isDraggingLaser ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)'}
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="animate-spin-slow"
                />
              </g>
            );
          })()}

          {/* Draggable Optical Power Probe */}
          {showIntensityProbe && (
            <g
              className="probe-element cursor-move"
              transform={`translate(${probePos.x}, ${probePos.y})`}
              onPointerDown={(e) => {
                e.stopPropagation();
                setIsDraggingProbe(true);
              }}
            >
              <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
              <circle
                cx="0"
                cy="0"
                r="6"
                fill={probeReading.value > 0 ? laserConfig.hex : '#334155'}
                filter={probeReading.value > 0 ? 'url(#laserGlow)' : 'none'}
              />
              <Crosshair className="w-4 h-4 text-sky-400" x="-8" y="-8" />

              <g transform="translate(20, -25)">
                <rect
                  x="0"
                  y="0"
                  width="135"
                  height="50"
                  rx="8"
                  fill="#020617"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  className="filter drop-shadow-xl"
                />
                <text x="10" y="18" fill="#94a3b8" fontSize="10" fontWeight="bold">
                  {lang === 'vi' ? 'CẢM BIẾN QUANG' : 'OPTICAL SENSOR'}
                </text>
                <text
                  x="10"
                  y="38"
                  fill={probeReading.value > 0 ? '#38bdf8' : '#64748b'}
                  fontSize="15"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {probeReading.value > 0 ? `${probeReading.value}%` : '0.0%'}
                </text>
                <text x="75" y="38" fill="#cbd5e1" fontSize="10" fontFamily="sans-serif">
                  {probeReading.type === 'incident'
                    ? lang === 'vi'
                      ? 'Tia tới'
                      : 'Incident'
                    : probeReading.type === 'reflected'
                    ? lang === 'vi'
                      ? 'Phản xạ'
                      : 'Reflected'
                    : probeReading.type === 'refracted'
                    ? lang === 'vi'
                      ? 'Khúc xạ'
                      : 'Refracted'
                    : lang === 'vi'
                    ? 'Chưa chạm'
                    : 'No Ray'}
                </text>
              </g>
            </g>
          )}
        </g>
      </svg>

      {/* Bottom Hint Banner */}
      <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-[11px] text-slate-400 pointer-events-none select-none">
        <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 shadow-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>
            {lang === 'vi'
              ? '✨ Đèn La-de có thể xoay tự do 360° quanh tâm I giữa 2 môi trường!'
              : '✨ Laser rotates freely 360° around point I between both media!'}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-slate-300">
          <span>Góc xoay vòng: {physics.laserAngleDeg.toFixed(1)}°</span>
          <span>•</span>
          <span>Góc tới i = {physics.incidentAngleDeg.toFixed(1)}°</span>
        </div>
      </div>
    </div>
  );
};
