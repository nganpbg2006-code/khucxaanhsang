import { MediumInfo, MediumType, LaserColor, LaserConfig, RefractionResult } from '../types/optics';

export const SPEED_OF_LIGHT = 299792; // km/s in vacuum

export const MEDIA_PRESETS: Record<MediumType, MediumInfo> = {
  air: {
    id: 'air',
    nameVi: 'Không khí',
    nameEn: 'Air',
    n: 1.000,
    color: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.08)',
    textColor: 'text-sky-300',
    descriptionVi: 'Môi trường khí loãng, coi như n ≈ 1.00',
    descriptionEn: 'Gaseous medium, refractive index n ≈ 1.00',
  },
  water: {
    id: 'water',
    nameVi: 'Nước (20°C)',
    nameEn: 'Water (20°C)',
    n: 1.333,
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.22)',
    textColor: 'text-cyan-300',
    descriptionVi: 'Chất lỏng trong suốt phổ biến, n = 1.33',
    descriptionEn: 'Common transparent liquid, n = 1.33',
  },
  glass: {
    id: 'glass',
    nameVi: 'Thủy tinh thường (Crown)',
    nameEn: 'Crown Glass',
    n: 1.500,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.25)',
    textColor: 'text-emerald-300',
    descriptionVi: 'Thủy tinh làm lăng kính, thấu kính, n = 1.50',
    descriptionEn: 'Standard optical glass for lenses, n = 1.50',
  },
  flint_glass: {
    id: 'flint_glass',
    nameVi: 'Thủy tinh nặng (Flint)',
    nameEn: 'Flint Glass',
    n: 1.620,
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.28)',
    textColor: 'text-violet-300',
    descriptionVi: 'Thủy tinh chiết quang cao, n = 1.62',
    descriptionEn: 'High-dispersion optical glass, n = 1.62',
  },
  diamond: {
    id: 'diamond',
    nameVi: 'Kim cương',
    nameEn: 'Diamond',
    n: 2.417,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.30)',
    textColor: 'text-amber-300',
    descriptionVi: 'Chất có chiết suất rất lớn, góc tới hạn nhỏ 24.4°',
    descriptionEn: 'Very high refractive index, critical angle 24.4°',
  },
  custom: {
    id: 'custom',
    nameVi: 'Tùy chỉnh (Custom)',
    nameEn: 'Custom Medium',
    n: 1.400,
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.25)',
    textColor: 'text-pink-300',
    descriptionVi: 'Điều chỉnh chiết suất theo ý muốn (1.0 - 2.6)',
    descriptionEn: 'Adjust refractive index freely (1.0 - 2.6)',
  },
};

export const LASER_CONFIGS: Record<LaserColor, LaserConfig> = {
  red: {
    color: 'red',
    wavelength: 650,
    hex: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.8)',
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
 * Calculates complete refraction physics using Snell's Law and Fresnel equations
 */
export function calculateRefraction(
  n1: number,
  n2: number,
  incidentAngleDeg: number
): RefractionResult {
  const iDeg = Math.max(0, Math.min(89.5, incidentAngleDeg));
  const iRad = (iDeg * Math.PI) / 180;

  const sinI = Math.sin(iRad);
  const sinR = (n1 * sinI) / n2;

  // Critical angle for Total Internal Reflection (if n1 > n2)
  let criticalAngleDeg: number | null = null;
  if (n1 > n2) {
    criticalAngleDeg = (Math.asin(n2 / n1) * 180) / Math.PI;
  }

  const isTotalInternalReflection = sinR > 1.0 || (criticalAngleDeg !== null && iDeg > criticalAngleDeg);

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
    deviationAngleDeg = Math.abs(iDeg - refractedAngleDeg);

    // Fresnel reflectance approximation for unpolarized light
    const rDeg = refractedAngleDeg;
    if (iDeg === 0 && rDeg === 0) {
      const r0 = Math.pow((n1 - n2) / (n1 + n2), 2);
      reflectionCoeff = r0;
    } else {
      const cosI = Math.cos(iRad);
      const cosR = Math.cos(refractedAngleRad);

      const rs = Math.pow((n1 * cosI - n2 * cosR) / (n1 * cosI + n2 * cosR), 2);
      const rp = Math.pow((n1 * cosR - n2 * cosI) / (n1 * cosR + n2 * cosI), 2);
      reflectionCoeff = Math.min(1.0, Math.max(0.0, (rs + rp) / 2));
    }
    transmissionCoeff = Math.max(0.0, 1.0 - reflectionCoeff);
  }

  let bendingDirection: 'towards_normal' | 'away_from_normal' | 'straight' | 'total_reflection';
  if (isTotalInternalReflection) {
    bendingDirection = 'total_reflection';
  } else if (iDeg === 0 || refractedAngleDeg === 0 || Math.abs(iDeg - (refractedAngleDeg || 0)) < 0.01) {
    bendingDirection = 'straight';
  } else if ((refractedAngleDeg || 0) < iDeg) {
    bendingDirection = 'towards_normal';
  } else {
    bendingDirection = 'away_from_normal';
  }

  return {
    incidentAngleDeg: iDeg,
    incidentAngleRad: iRad,
    n1,
    n2,
    refractedAngleDeg,
    refractedAngleRad,
    reflectedAngleDeg: iDeg, // Reflection law: i' = i
    criticalAngleDeg,
    isTotalInternalReflection,
    reflectionCoefficient: reflectionCoeff,
    transmissionCoefficient: transmissionCoeff,
    deviationAngleDeg,
    speed1KmS: Math.round(SPEED_OF_LIGHT / n1),
    speed2KmS: Math.round(SPEED_OF_LIGHT / n2),
    relativeIndexN21: Number((n2 / n1).toFixed(4)),
    bendingDirection,
  };
}
