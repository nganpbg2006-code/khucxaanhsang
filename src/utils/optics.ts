import { MediumInfo, MediumType, LaserColor, LaserConfig, RefractionResult } from '../types/optics';

export const SPEED_OF_LIGHT = 299792; // km/s in vacuum

export const MEDIA_PRESETS: Record<MediumType, MediumInfo> = {
  air: {
    id: 'air',
    nameVi: 'Không khí',
    nameEn: 'Air',
    n: 1.000,
    color: '#38bdf8', // Sky Blue
    bgColor: 'rgba(56, 189, 248, 0.12)',
    textColor: 'text-sky-300',
    descriptionVi: 'Môi trường khí loãng, coi như n ≈ 1.00',
    descriptionEn: 'Gaseous medium, refractive index n ≈ 1.00',
  },
  water: {
    id: 'water',
    nameVi: 'Nước (20°C)',
    nameEn: 'Water (20°C)',
    n: 1.333,
    color: '#06b6d4', // Deep Cyan / Aquamarine
    bgColor: 'rgba(6, 182, 212, 0.32)',
    textColor: 'text-cyan-300',
    descriptionVi: 'Chất lỏng trong suốt phổ biến, n = 1.33',
    descriptionEn: 'Common transparent liquid, n = 1.33',
  },
  glass: {
    id: 'glass',
    nameVi: 'Thủy tinh thường (Crown)',
    nameEn: 'Crown Glass',
    n: 1.500,
    color: '#10b981', // Emerald Jade Green
    bgColor: 'rgba(16, 185, 129, 0.35)',
    textColor: 'text-emerald-300',
    descriptionVi: 'Thủy tinh làm lăng kính, thấu kính, n = 1.50',
    descriptionEn: 'Standard optical glass for lenses, n = 1.50',
  },
  flint_glass: {
    id: 'flint_glass',
    nameVi: 'Thủy tinh nặng (Flint)',
    nameEn: 'Flint Glass',
    n: 1.620,
    color: '#a855f7', // Royal Purple / Violet
    bgColor: 'rgba(168, 85, 247, 0.38)',
    textColor: 'text-purple-300',
    descriptionVi: 'Thủy tinh chiết quang cao, n = 1.62',
    descriptionEn: 'High-dispersion optical glass, n = 1.62',
  },
  diamond: {
    id: 'diamond',
    nameVi: 'Kim cương',
    nameEn: 'Diamond',
    n: 2.417,
    color: '#f59e0b', // Radiant Amber Gold
    bgColor: 'rgba(245, 158, 11, 0.40)',
    textColor: 'text-amber-300',
    descriptionVi: 'Chất có chiết suất rất lớn, góc tới hạn nhỏ 24.4°',
    descriptionEn: 'Very high refractive index, critical angle 24.4°',
  },
  custom: {
    id: 'custom',
    nameVi: 'Tùy chỉnh (Custom)',
    nameEn: 'Custom Medium',
    n: 1.400,
    color: '#ec4899', // Bright Pink
    bgColor: 'rgba(236, 72, 153, 0.35)',
    textColor: 'text-pink-300',
    descriptionVi: 'Nhập chiết suất tùy ý từ 1.0 đến 3.0',
    descriptionEn: 'Type custom refractive index from 1.0 to 3.0',
  },
};

export const LASER_CONFIGS: Record<LaserColor, LaserConfig> = {
  red: {
    color: 'red',
    wavelength: 650,
    hex: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.85)',
  },
  green: {
    color: 'green',
    wavelength: 532,
    hex: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.85)',
  },
  blue: {
    color: 'blue',
    wavelength: 450,
    hex: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.85)',
  },
  violet: {
    color: 'violet',
    wavelength: 405,
    hex: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.85)',
  },
  white: {
    color: 'white',
    wavelength: 550,
    hex: '#f8fafc',
    glow: 'rgba(255, 255, 255, 0.9)',
  },
};

/**
 * Calculates complete 360-degree refraction physics using Snell's Law and Fresnel equations.
 * @param n1 Refractive index of Medium 1 (top half)
 * @param n2 Refractive index of Medium 2 (bottom half)
 * @param laserAngleDeg Angle in degrees [0, 360) around point of incidence I.
 *        0° = top vertical normal
 *        90° = right interface surface
 *        180° = bottom vertical normal
 *        270° = left interface surface
 *        Default quadrant 2 position: e.g. 330° (which corresponds to 30° from top normal on the left)
 */
export function calculateRefraction360(
  n1: number,
  n2: number,
  laserAngleDeg: number
): RefractionResult {
  // Normalize angle to [0, 360)
  let angle = ((laserAngleDeg % 360) + 360) % 360;

  // Determine if laser is in Medium 1 (top half) or Medium 2 (bottom half)
  const isTopHalf = angle <= 90 || angle >= 270;
  const incidentMedium: 1 | 2 = isTopHalf ? 1 : 2;
  const nIncident = isTopHalf ? n1 : n2;
  const nRefracted = isTopHalf ? n2 : n1;

  // Calculate incident angle i [0, 90] from nearest normal (top normal at 0°, bottom normal at 180°)
  let incidentAngleDeg = 0;
  if (angle <= 90) {
    incidentAngleDeg = angle;
  } else if (angle <= 180) {
    incidentAngleDeg = 180 - angle;
  } else if (angle <= 270) {
    incidentAngleDeg = angle - 180;
  } else {
    incidentAngleDeg = 360 - angle;
  }

  // Prevent numerical singularities right at 90.0°
  incidentAngleDeg = Math.max(0, Math.min(89.5, incidentAngleDeg));
  const incidentAngleRad = (incidentAngleDeg * Math.PI) / 180;

  const sinI = Math.sin(incidentAngleRad);
  const sinR = (nIncident * sinI) / nRefracted;

  // Critical angle for Total Internal Reflection (if incident medium is denser)
  let criticalAngleDeg: number | null = null;
  if (nIncident > nRefracted) {
    criticalAngleDeg = (Math.asin(nRefracted / nIncident) * 180) / Math.PI;
  }

  const isTotalInternalReflection =
    sinR > 1.0 || (criticalAngleDeg !== null && incidentAngleDeg > criticalAngleDeg);

  let refractedAngleDeg: number | null = null;
  let refractedAngleRad: number | null = null;
  let deviationAngleDeg: number | null = null;

  let reflectionCoeff = 0;
  let transmissionCoeff = 0;

  if (isTotalInternalReflection) {
    refractedAngleDeg = null;
    refractedAngleRad = null;
    deviationAngleDeg = null;
    reflectionCoeff = 1.0;
    transmissionCoeff = 0.0;
  } else {
    refractedAngleRad = Math.asin(Math.min(1.0, Math.max(-1.0, sinR)));
    refractedAngleDeg = (refractedAngleRad * 180) / Math.PI;
    deviationAngleDeg = Math.abs(incidentAngleDeg - refractedAngleDeg);

    // Fresnel reflectance approximation for unpolarized light
    const rRad = refractedAngleRad;
    if (incidentAngleDeg === 0 && refractedAngleDeg === 0) {
      const r0 = Math.pow((nIncident - nRefracted) / (nIncident + nRefracted), 2);
      reflectionCoeff = r0;
    } else {
      const cosI = Math.cos(incidentAngleRad);
      const cosR = Math.cos(rRad);

      const rs = Math.pow((nIncident * cosI - nRefracted * cosR) / (nIncident * cosI + nRefracted * cosR), 2);
      const rp = Math.pow((nIncident * cosR - nRefracted * cosI) / (nIncident * cosR + nRefracted * cosI), 2);
      reflectionCoeff = Math.min(1.0, Math.max(0.0, (rs + rp) / 2));
    }
    transmissionCoeff = Math.max(0.0, 1.0 - reflectionCoeff);
  }

  let bendingDirection: 'towards_normal' | 'away_from_normal' | 'straight' | 'total_reflection';
  if (isTotalInternalReflection) {
    bendingDirection = 'total_reflection';
  } else if (incidentAngleDeg === 0 || refractedAngleDeg === 0 || Math.abs(incidentAngleDeg - (refractedAngleDeg || 0)) < 0.01) {
    bendingDirection = 'straight';
  } else if ((refractedAngleDeg || 0) < incidentAngleDeg) {
    bendingDirection = 'towards_normal';
  } else {
    bendingDirection = 'away_from_normal';
  }

  const speed1KmS = Math.round(SPEED_OF_LIGHT / n1);
  const speed2KmS = Math.round(SPEED_OF_LIGHT / n2);

  return {
    laserAngleDeg: angle,
    incidentMedium,
    nIncident,
    nRefracted,
    incidentAngleDeg,
    incidentAngleRad,
    refractedAngleDeg,
    refractedAngleRad,
    reflectedAngleDeg: incidentAngleDeg, // Law of reflection: i' = i
    criticalAngleDeg,
    isTotalInternalReflection,
    reflectionCoefficient: reflectionCoeff,
    transmissionCoefficient: transmissionCoeff,
    deviationAngleDeg,
    speedIncidentKmS: Math.round(SPEED_OF_LIGHT / nIncident),
    speedRefractedKmS: Math.round(SPEED_OF_LIGHT / nRefracted),
    relativeIndexN21: Number((nRefracted / nIncident).toFixed(4)),
    bendingDirection,
    n1,
    n2,
    speed1KmS,
    speed2KmS,
  };
}

/**
 * Backward-compatible helper when given incident angle i [0, 89.5] in top-left quadrant
 */
export function calculateRefraction(
  n1: number,
  n2: number,
  incidentAngleDeg: number
): RefractionResult {
  const laserAngle = 360 - Math.max(0, Math.min(89.5, incidentAngleDeg));
  return calculateRefraction360(n1, n2, laserAngle);
}
