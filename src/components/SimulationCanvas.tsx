import React, { useRef, useState, useCallback, useEffect } from 'react';
import { RefractionResult, LaserConfig, MediumInfo } from '../types/optics';
import { Language, translations } from '../utils/translations';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, Sparkles } from 'lucide-react';

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
  onAngleChange: (newAngle: number) => void;
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
  onAngleChange,
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
  const [probePos, setProbePos] = useState<{ x: number; y: number }>({ x: 700, y: 180 });
  const [isDraggingProbe, setIsDraggingProbe] = useState<boolean>(false);

  // Geometry dimensions
  const WIDTH = 1000;
  const HEIGHT = 640;
  const IX = 500; // Point of incidence X
  const IY = 320; // Point of incidence Y (Interface line)
  const RADIUS = 250; // Distance of laser emitter from I
  const OUT_RADIUS = 300; // Ray length into media

  const iDeg = physics.incidentAngleDeg;
  const iRad = (iDeg * Math.PI) / 180;

  // Laser emitter position (Quadrant 2: top-left)
  const laserX = IX - RADIUS * Math.sin(iRad);
  const laserY = IY - RADIUS * Math.cos(iRad);

  // Reflected ray end position (Quadrant 1: top-right)
  const reflectedX = IX + OUT_RADIUS * Math.sin(iRad);
  const reflectedY = IY - OUT_RADIUS * Math.cos(iRad);

  // Refracted ray end position (Quadrant 4: bottom-right)
  const rDeg = physics.refractedAngleDeg;
  const rRad = rDeg !== null ? (rDeg * Math.PI) / 180 : null;
  const refractedX = rRad !== null ? IX + OUT_RADIUS * Math.sin(rRad) : null;
  const refractedY = rRad !== null ? IY + OUT_RADIUS * Math.cos(rRad) : null;

  // Calculate distance from probe to rays for intensity sensor reading
  const getProbeReading = () => {
    if (!laserActive) return { type: 'none', value: 0 };
    // Check if probe is near incident ray, reflected ray, or refracted ray
    const distToI = Math.hypot(probePos.x - IX, probePos.y - IY);
    if (distToI > OUT_RADIUS + 40) return { type: 'none', value: 0 };

    // Point-to-line segment distance calculation
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
    if (dIncident < threshold) {
      return { type: 'incident', value: 100 };
    }
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

  // Mouse / Touch handlers for laser angle dragging
  const handleSvgPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    // If clicking on probe, handle in probe
    if ((e.target as HTMLElement).closest?.('.probe-element')) {
      return;
    }

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = (e.clientX - rect.left) / zoom - pan.x;
    const clientY = (e.clientY - rect.top) / zoom - pan.y;

    // Check if clicked near the laser emitter or arc
    const distToLaser = Math.hypot(clientX - laserX, clientY - laserY);
    if (distToLaser < 50 || (clientY < IY && clientX < IX && Math.hypot(clientX - IX, clientY - IY) < RADIUS + 40)) {
      setIsDraggingLaser(true);
      (e.target as Element).setPointerCapture?.(e.pointerId);
      updateLaserAngleFromCoords(clientX, clientY);
    } else {
      // Pan
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const updateLaserAngleFromCoords = useCallback(
    (clientX: number, clientY: number) => {
      // Incident angle is angle from normal (NN' is along X = IX, pointing up: vector (0, -1))
      // Vector from I to (clientX, clientY)
      const dx = IX - clientX; // positive when to the left of normal
      const dy = IY - clientY; // positive when above interface

      if (dy <= 0) return; // Keep above interface

      let angleRad = Math.atan2(dx, dy);
      let angleDeg = (angleRad * 180) / Math.PI;

      // Bound between 0 and 85
      angleDeg = Math.max(0, Math.min(85, Math.round(angleDeg * 2) / 2));
      onAngleChange(angleDeg);
    },
    [onAngleChange]
  );

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

  // SVG Arc generator for angle visualizer
  const makeArcPath = (cx: number, cy: number, radius: number, startAngleDeg: number, endAngleDeg: number) => {
    // 0 deg is normal line (up: vector 0, -1)
    const startRad = ((startAngleDeg - 90) * Math.PI) / 180;
    const endRad = ((endAngleDeg - 90) * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArcFlag = endAngleDeg - startAngleDeg <= 180 ? 0 : 1;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // Generate ticks for Protractor
  const protractorTicks = [];
  if (showProtractor) {
    const pRadius = 220;
    for (let deg = -90; deg <= 90; deg += 1) {
      const isMajor = deg % 10 === 0;
      const isMedium = deg % 5 === 0 && !isMajor;
      const tickLen = isMajor ? 16 : isMedium ? 10 : 6;
      const rad = ((deg - 90) * Math.PI) / 180;

      const x1 = IX + pRadius * Math.cos(rad);
      const y1 = IY + pRadius * Math.sin(rad);
      const x2 = IX + (pRadius - tickLen) * Math.cos(rad);
      const y2 = IY + (pRadius - tickLen) * Math.sin(rad);

      protractorTicks.push(
        <line
          key={`tick-${deg}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#94a3b8"
          strokeWidth={isMajor ? 1.5 : 0.75}
          opacity={isMajor ? 0.9 : 0.5}
        />
      );

      if (isMajor && deg % 20 === 0) {
        const textRad = ((deg - 90) * Math.PI) / 180;
        const tx = IX + (pRadius - 28) * Math.cos(textRad);
        const ty = IY + (pRadius - 28) * Math.sin(textRad);
        protractorTicks.push(
          <text
            key={`txt-${deg}`}
            x={tx}
            y={ty}
            fill="#cbd5e1"
            fontSize="10"
            fontWeight="600"
            textAnchor="middle"
            dominantBaseline="middle"
            className="select-none pointer-events-none"
          >
            {Math.abs(deg)}°
          </text>
        );
      }
    }
  }

  // Wavefronts lines generation
  const renderWavefronts = () => {
    if (beamMode !== 'wave' || !laserActive) return null;
    const waveCount = 12;
    const waveSpacing1 = 20; // wavelength in medium 1
    const waveSpacing2 = waveSpacing1 * (medium1.n / medium2.n); // wavelength in medium 2: λ2 = λ1 * (n1/n2)

    const incidentWaves = [];
    for (let w = 1; w <= waveCount; w++) {
      const d = w * waveSpacing1;
      if (d > RADIUS) break;
      // perpendicular segment across ray
      const wx = IX - d * Math.sin(iRad);
      const wy = IY - d * Math.cos(iRad);
      const perpX = Math.cos(iRad) * 24;
      const perpY = -Math.sin(iRad) * 24;

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

    const refractedWaves = [];
    if (!physics.isTotalInternalReflection && rRad !== null) {
      for (let w = 1; w <= waveCount; w++) {
        const d = w * waveSpacing2;
        if (d > OUT_RADIUS) break;
        const wx = IX + d * Math.sin(rRad);
        const wy = IY + d * Math.cos(rRad);
        const perpX = Math.cos(rRad) * 24;
        const perpY = -Math.sin(rRad) * 24;

        refractedWaves.push(
          <line
            key={`re-wave-${w}`}
            x1={wx - perpX}
            y1={wy - perpY}
            x2={wx + perpX}
            y2={wy + perpY}
            stroke={laserConfig.hex}
            strokeWidth="1.5"
            opacity="0.5"
            strokeDasharray="2 2"
          />
        );
      }
    }

    return (
      <g className="wavefronts pointer-events-none">
        {incidentWaves}
        {refractedWaves}
      </g>
    );
  };

  return (
    <div className="relative w-full h-[520px] md:h-[580px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* Simulation Toolbar Overlay */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Active Medium Badge */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg text-xs">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: medium1.color }}
            />
            {lang === 'vi' ? medium1.nameVi : medium1.nameEn} (n₁ = {medium1.n.toFixed(2)})
          </span>
          <span className="text-slate-500 font-bold">⇄</span>
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: medium2.color }}
            />
            {lang === 'vi' ? medium2.nameVi : medium2.nameEn} (n₂ = {medium2.n.toFixed(2)})
          </span>
        </div>

        {/* View Controls & Zoom */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-lg">
          <button
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title={t.controls.zoomIn}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
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
          <div className="px-1.5 text-[11px] font-mono text-slate-400">
            {Math.round(zoom * 100)}%
          </div>
        </div>
      </div>

      {/* Floating Notice if Total Internal Reflection occurs */}
      {physics.isTotalInternalReflection && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-bounce">
          <div className="flex items-center gap-2 bg-amber-500/90 text-slate-950 font-bold px-4 py-1.5 rounded-full shadow-lg shadow-amber-500/20 text-xs backdrop-blur-md uppercase tracking-wider">
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
          {/* Laser Glow Filter */}
          <filter id="laserGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Heavy Glow for Total Reflection */}
          <filter id="heavyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Linear Gradients for Media */}
          <linearGradient id="medium1Grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={medium1.color} stopOpacity="0.04" />
            <stop offset="100%" stopColor={medium1.color} stopOpacity="0.14" />
          </linearGradient>

          <linearGradient id="medium2Grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={medium2.color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={medium2.color} stopOpacity="0.35" />
          </linearGradient>

          {/* Grid pattern */}
          <pattern id="subtleGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </pattern>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} transform-origin="500 320">
          {/* Medium 1 Background (Top Half) */}
          <rect x="0" y="0" width={WIDTH} height={IY} fill="url(#medium1Grad)" />
          <rect x="0" y="0" width={WIDTH} height={IY} fill="url(#subtleGrid)" />

          {/* Medium 2 Background (Bottom Half) */}
          <rect x="0" y={IY} width={WIDTH} height={HEIGHT - IY} fill="url(#medium2Grad)" />
          <rect x="0" y={IY} width={WIDTH} height={HEIGHT - IY} fill="url(#subtleGrid)" />

          {/* Interface Surface Boundary Line S-S' */}
          <line
            x1="0"
            y1={IY}
            x2={WIDTH}
            y2={IY}
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeDasharray="none"
            opacity="0.8"
          />
          {/* Interface labels */}
          <text
            x="24"
            y={IY - 10}
            fill="#94a3b8"
            fontSize="12"
            fontWeight="bold"
            className="select-none font-mono"
          >
            S (Mặt phân cách)
          </text>
          <text
            x={WIDTH - 30}
            y={IY - 10}
            fill="#94a3b8"
            fontSize="12"
            fontWeight="bold"
            className="select-none font-mono"
          >
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
              <path
                d={`M ${IX - 16} ${IY} L ${IX - 16} ${IY - 16} L ${IX} ${IY - 16}`}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.5"
                opacity="0.6"
              />
              <path
                d={`M ${IX + 16} ${IY} L ${IX + 16} ${IY + 16} L ${IX} ${IY + 16}`}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.5"
                opacity="0.6"
              />
              {/* Labels N and N' */}
              <text
                x={IX + 12}
                y="45"
                fill="#f1f5f9"
                fontSize="14"
                fontWeight="bold"
                className="select-none font-mono"
              >
                N
              </text>
              <text
                x={IX + 12}
                y={HEIGHT - 45}
                fill="#f1f5f9"
                fontSize="14"
                fontWeight="bold"
                className="select-none font-mono"
              >
                N'
              </text>
            </g>
          )}

          {/* Protractor (Thước đo độ) */}
          {showProtractor && (
            <g className="protractor pointer-events-none" opacity="0.85">
              {/* Outer semi-circle */}
              <path
                d={`M ${IX - 220} ${IY} A 220 220 0 0 1 ${IX + 220} ${IY} Z`}
                fill="rgba(15, 23, 42, 0.45)"
                stroke="#475569"
                strokeWidth="2"
              />
              {/* Inner ring */}
              <path
                d={`M ${IX - 180} ${IY} A 180 180 0 0 1 ${IX + 180} ${IY} Z`}
                fill="none"
                stroke="#334155"
                strokeWidth="1"
              />
              {protractorTicks}
            </g>
          )}

          {/* Wavefronts mode */}
          {renderWavefronts()}

          {/* Angle Arcs & Labels */}
          {showAngles && laserActive && (
            <g className="angle-arcs pointer-events-none">
              {/* Angle of incidence i arc (from normal at 0° to incident ray at -iDeg) */}
              {iDeg > 1 && (
                <g>
                  <path
                    d={makeArcPath(IX, IY, 70, -iDeg, 0)}
                    fill="rgba(56, 189, 248, 0.25)"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                  />
                  {/* Text label i */}
                  {(() => {
                    const midRad = ((-iDeg / 2 - 90) * Math.PI) / 180;
                    const lx = IX + 92 * Math.cos(midRad);
                    const ly = IY + 92 * Math.sin(midRad);
                    return (
                      <g transform={`translate(${lx}, ${ly})`}>
                        <rect
                          x="-26"
                          y="-13"
                          width="52"
                          height="22"
                          rx="6"
                          fill="#0f172a"
                          stroke="#38bdf8"
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="2"
                          fill="#38bdf8"
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontFamily="monospace"
                        >
                          i = {iDeg.toFixed(1)}°
                        </text>
                      </g>
                    );
                  })()}
                </g>
              )}

              {/* Angle of refraction r arc */}
              {!physics.isTotalInternalReflection && rDeg !== null && rDeg > 1 && (
                <g>
                  <path
                    d={makeArcPath(IX, IY, 70, 180 - rDeg, 180)}
                    fill="rgba(52, 211, 153, 0.25)"
                    stroke="#34d399"
                    strokeWidth="1.5"
                  />
                  {/* Text label r */}
                  {(() => {
                    const midRad = ((180 - rDeg / 2 - 90) * Math.PI) / 180;
                    const lx = IX + 92 * Math.cos(midRad);
                    const ly = IY + 92 * Math.sin(midRad);
                    return (
                      <g transform={`translate(${lx}, ${ly})`}>
                        <rect
                          x="-26"
                          y="-13"
                          width="52"
                          height="22"
                          rx="6"
                          fill="#0f172a"
                          stroke="#34d399"
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="2"
                          fill="#34d399"
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontFamily="monospace"
                        >
                          r = {rDeg.toFixed(1)}°
                        </text>
                      </g>
                    );
                  })()}
                </g>
              )}
            </g>
          )}

          {/* LIGHT RAYS */}
          {laserActive && (
            <g className="light-rays pointer-events-none">
              {/* INCIDENT RAY (SI) */}
              {/* Glow backdrop */}
              <line
                x1={laserX}
                y1={laserY}
                x2={IX}
                y2={IY}
                stroke={laserConfig.hex}
                strokeWidth="7"
                opacity="0.4"
                filter="url(#laserGlow)"
              />
              {/* Sharp core */}
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

              {/* REFLECTED RAY (IR') */}
              {physics.reflectionCoefficient > 0.01 && (
                <g>
                  {/* Glow */}
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
                  {/* Core */}
                  <line
                    x1={IX}
                    y1={IY}
                    x2={reflectedX}
                    y2={reflectedY}
                    stroke="#ffffff"
                    strokeWidth={physics.isTotalInternalReflection ? '3' : '2'}
                    opacity={Math.min(1.0, physics.reflectionCoefficient + 0.1)}
                    strokeLinecap="round"
                  />
                  {/* Direction arrow on reflected ray */}
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

              {/* REFRACTED RAY (IR) */}
              {!physics.isTotalInternalReflection && refractedX !== null && refractedY !== null && (
                <g>
                  {/* Glow */}
                  <line
                    x1={IX}
                    y1={IY}
                    x2={refractedX}
                    y2={refractedY}
                    stroke={laserConfig.hex}
                    strokeWidth="6"
                    opacity={physics.transmissionCoefficient * 0.6}
                    filter="url(#laserGlow)"
                  />
                  {/* Core */}
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
                  {/* Direction arrow on refracted ray */}
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

          {/* Point of Incidence I Marker */}
          <circle
            cx={IX}
            cy={IY}
            r="5"
            fill="#38bdf8"
            stroke="#ffffff"
            strokeWidth="2"
            className="filter drop-shadow"
          />
          <text
            x={IX - 16}
            y={IY + 18}
            fill="#f8fafc"
            fontSize="14"
            fontWeight="bold"
            className="select-none font-mono"
          >
            I
          </text>

          {/* Guide Arc for dragging Laser Emitter */}
          <path
            d={`M ${IX - RADIUS} ${IY} A ${RADIUS} ${RADIUS} 0 0 1 ${IX} ${IY - RADIUS}`}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="pointer-events-none"
          />

          {/* LASER EMITTER DEVICE */}
          <g
            className="cursor-pointer"
            transform={`translate(${laserX}, ${laserY}) rotate(${iDeg - 90})`}
            onPointerDown={(e) => {
              e.stopPropagation();
              setIsDraggingLaser(true);
            }}
          >
            {/* Emitter metallic casing */}
            <rect
              x="-48"
              y="-15"
              width="50"
              height="30"
              rx="6"
              fill="#1e293b"
              stroke={isDraggingLaser ? '#38bdf8' : '#475569'}
              strokeWidth="2"
              className="filter drop-shadow-lg"
            />
            {/* Grip ridges */}
            <line x1="-38" y1="-8" x2="-38" y2="8" stroke="#334155" strokeWidth="2" />
            <line x1="-32" y1="-8" x2="-32" y2="8" stroke="#334155" strokeWidth="2" />
            <line x1="-26" y1="-8" x2="-26" y2="8" stroke="#334155" strokeWidth="2" />
            {/* Laser Nozzle */}
            <rect x="2" y="-9" width="10" height="18" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1" />
            {/* LED Status Light */}
            <circle
              cx="-12"
              cy="0"
              r="4"
              fill={laserActive ? laserConfig.hex : '#64748b'}
              filter={laserActive ? 'url(#laserGlow)' : 'none'}
            />
            {/* Label SI */}
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
              LASER
            </text>
            {/* Drag Handle Ring */}
            <circle
              cx="0"
              cy="0"
              r="24"
              fill="transparent"
              stroke={isDraggingLaser ? '#38bdf8' : 'rgba(56, 189, 248, 0.3)'}
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="animate-spin-slow"
            />
          </g>

          {/* DRAGGABLE OPTICAL POWER / INTENSITY PROBE */}
          {showIntensityProbe && (
            <g
              className="probe-element cursor-move"
              transform={`translate(${probePos.x}, ${probePos.y})`}
              onPointerDown={(e) => {
                e.stopPropagation();
                setIsDraggingProbe(true);
              }}
            >
              {/* Sensor head */}
              <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
              <circle
                cx="0"
                cy="0"
                r="6"
                fill={probeReading.value > 0 ? laserConfig.hex : '#334155'}
                filter={probeReading.value > 0 ? 'url(#laserGlow)' : 'none'}
              />
              <Crosshair className="w-4 h-4 text-sky-400" x="-8" y="-8" />

              {/* Digital Meter Readout box */}
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
        <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>
            {lang === 'vi'
              ? 'Kéo đèn La-de hoặc thanh trượt bên cạnh để thay đổi góc tới i'
              : 'Drag the laser emitter or use the slider to adjust angle i'}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 font-mono text-slate-300">
          <span>v₁ = {physics.speed1KmS.toLocaleString()} km/s</span>
          <span>•</span>
          <span>v₂ = {physics.speed2KmS.toLocaleString()} km/s</span>
        </div>
      </div>
    </div>
  );
};
