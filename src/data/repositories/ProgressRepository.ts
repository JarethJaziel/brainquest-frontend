import type { IProgressRepository } from './interfaces';
import type { UserProgress, ExamProgress } from '../../models/progress';
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';

export const INITIAL_PROGRESS: UserProgress = {
  version: '1.0',
  profile: {
    nickname: 'Explorador',
    avatar: 'avatar_boy_1',
    level: 1,
    currentXP: 0,
    totalXP: 0,
    xpToNextLevel: 500,
  },
  stats: {
    totalExamsCompleted: 0,
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    totalTimeSpent: 0,
    averageScore: 0,
    bestStreak: 0,
    perfectExams: 0,
  },
  examProgress: {},
  achievements: [],
  streaks: {
    currentStreak: 0,
    bestStreak: 0,
    lastActivityDate: '',
  },
  lastUpdated: new Date().toISOString(),
};

export class LocalProgressRepository implements IProgressRepository {
  private readonly adapter = new LocalStorageAdapter<UserProgress>('brainquest_progress', INITIAL_PROGRESS);

  async getProgress(): Promise<UserProgress> {
    return this.adapter.get();
  }

  async saveProgress(progress: UserProgress): Promise<void> {
    progress.lastUpdated = new Date().toISOString();
    this.adapter.set(progress);
  }

  async updateExamProgress(examId: string, data: Partial<ExamProgress>): Promise<void> {
    const progress = this.adapter.get();
    const existing = progress.examProgress[examId] || {
      examId,
      bestScore: 0,
      bestStars: 0,
      attempts: 0,
      lastAttemptAt: '',
      results: [],
    };

    progress.examProgress[examId] = {
      ...existing,
      ...data,
    };

    await this.saveProgress(progress);
  }
}
