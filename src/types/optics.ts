export type MediumType = 'air' | 'water' | 'glass' | 'flint_glass' | 'diamond' | 'custom';

export interface MediumInfo {
  id: MediumType;
  nameVi: string;
  nameEn: string;
  n: number;
  color: string;
  bgColor: string;
  textColor: string;
  descriptionVi: string;
  descriptionEn: string;
}

export type LaserColor = 'red' | 'green' | 'blue' | 'violet' | 'white';

export interface LaserConfig {
  color: LaserColor;
  wavelength: number; // nm
  hex: string;
  glow: string;
}

export interface RefractionResult {
  laserAngleDeg: number; // 0 to 360 degrees around point of incidence I
  incidentMedium: 1 | 2; // 1 = Medium 1 (top), 2 = Medium 2 (bottom)
  nIncident: number;
  nRefracted: number;
  incidentAngleDeg: number; // i in [0, 90]
  incidentAngleRad: number;
  refractedAngleDeg: number | null; // r in [0, 90] or null if TIR
  refractedAngleRad: number | null;
  reflectedAngleDeg: number; // i' = i
  criticalAngleDeg: number | null; // null if nIncident <= nRefracted
  isTotalInternalReflection: boolean;
  reflectionCoefficient: number; // 0 to 1
  transmissionCoefficient: number; // 0 to 1
  deviationAngleDeg: number | null; // |i - r|
  speedIncidentKmS: number;
  speedRefractedKmS: number;
  relativeIndexN21: number; // nRefracted / nIncident
  bendingDirection: 'towards_normal' | 'away_from_normal' | 'straight' | 'total_reflection';
  n1: number;
  n2: number;
  speed1KmS: number;
  speed2KmS: number;
}

export type BloomLevel = 'nhan_biet' | 'thong_hieu' | 'van_dung' | 'van_dung_cao';

export interface ChallengeQuestion {
  id: string;
  level: BloomLevel;
  topic: string;
  titleVi: string;
  titleEn: string;
  questionVi: string;
  questionEn: string;
  optionsVi: string[];
  optionsEn: string[];
  correctIndex: number;
  explanationVi: string;
  explanationEn: string;
  formulaNote?: string;
  simulationPreset?: {
    n1: number;
    n2: number;
    incidentAngle: number;
    medium1: MediumType;
    medium2: MediumType;
  };
}

export interface GeneratedExercise {
  id: string;
  createdAt: number;
  level: BloomLevel;
  topic: string;
  title: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  keyTakeaway: string;
  simulationParams: {
    n1: number;
    n2: number;
    incidentAngle: number;
    medium1Name?: string;
    medium2Name?: string;
  };
}
