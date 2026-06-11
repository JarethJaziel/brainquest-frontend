// ===== USER PROGRESS =====

export interface UserProgress {
  version: string;                    // para migraciones futuras
  profile: UserProfile;
  stats: GlobalStats;
  examProgress: Record<string, ExamProgress>; // examId → progreso
  achievements: UnlockedAchievement[];
  streaks: StreakData;
  lastUpdated: string;
}

export interface UserProfile {
  nickname: string;
  avatar: string;
  level: number;
  currentXP: number;
  totalXP: number;
  xpToNextLevel: number;
}

export interface GlobalStats {
  totalExamsCompleted: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  totalTimeSpent: number;             // segundos totales
  averageScore: number;
  bestStreak: number;
  perfectExams: number;
}

export interface ExamProgress {
  examId: string;
  bestScore: number;
  bestStars: 0 | 1 | 2 | 3;
  attempts: number;
  lastAttemptAt: string;
  results: string[];                  // ids de ExamResult
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastActivityDate: string;           // YYYY-MM-DD
}

import type { UnlockedAchievement } from './rewards';
