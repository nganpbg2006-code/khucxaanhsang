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
  incidentAngleDeg: number;
  incidentAngleRad: number;
  n1: number;
  n2: number;
  refractedAngleDeg: number | null; // null if Total Internal Reflection
  refractedAngleRad: number | null;
  reflectedAngleDeg: number;
  criticalAngleDeg: number | null; // null if n1 <= n2
  isTotalInternalReflection: boolean;
  reflectionCoefficient: number; // 0 to 1
  transmissionCoefficient: number; // 0 to 1
  deviationAngleDeg: number | null; // |i - r|
  speed1KmS: number;
  speed2KmS: number;
  relativeIndexN21: number;
  bendingDirection: 'towards_normal' | 'away_from_normal' | 'straight' | 'total_reflection';
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
