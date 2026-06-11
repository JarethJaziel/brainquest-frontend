// ===== EXAM MODELS =====

export interface Exam {
  id: string;
  version: string;                    // Versionado del esquema JSON
  metadata: ExamMetadata;
  settings: ExamSettings;
  questions: Question[];
  rewards: ExamRewards;
}

export interface ExamMetadata {
  title: string;
  description: string;
  subject: string;
  category: string;
  icon: string;                       // Material Symbols icon name
  coverImage?: string;
  difficulty: Difficulty;
  estimatedTime: number;              // en minutos
  tags: string[];
  ageRange: [number, number];         // [minAge, maxAge]
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface ExamSettings {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showFeedback: 'immediate' | 'end' | 'none';
  allowSkip: boolean;
  allowRetry: boolean;
  maxAttempts: number;                // 0 = ilimitado
  timeLimit?: number;                 // en segundos, undefined = sin límite
  passingScore: number;               // porcentaje (0-100)
  showCorrectAnswer: boolean;         // mostrar respuesta correcta al fallar
}

export interface ExamRewards {
  xpReward: number;                   // XP base del examen
  starThresholds: [number, number, number]; // porcentajes para 1, 2, 3 estrellas
  bonusXP?: {
    perfectScore: number;
    noSkips: number;
    speedBonus: number;               // si termina en < 50% del tiempo
  };
}

// Forward declaration of Question to avoid compile errors
import type { Question } from './question-types';
