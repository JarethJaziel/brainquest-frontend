// ===== SCORING & EVALUATION =====

export interface ExamResult {
  id: string;
  examId: string;
  attemptNumber: number;
  startedAt: string;                  // ISO timestamp
  completedAt: string;
  totalTime: number;                  // segundos
  answers: AnswerRecord[];
  score: ScoreSummary;
  rewards: RewardsSummary;
}

export interface AnswerRecord {
  questionId: string;
  answer: unknown;                    // tipo variable según la pregunta
  isCorrect: boolean;
  isPartial: boolean;
  pointsEarned: number;
  timeSpent: number;                  // segundos en esta pregunta
  skipped: boolean;
  attempts: number;                   // intentos en esta pregunta
}

export interface ScoreSummary {
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  partialCount: number;
  stars: 0 | 1 | 2 | 3;
  passed: boolean;
}

export interface RewardsSummary {
  xpEarned: number;
  bonusXP: number;
  totalXP: number;
  newAchievements: string[];          // ids de logros desbloqueados
  leveledUp: boolean;
  newLevel?: number;
}
