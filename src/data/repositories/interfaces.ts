import type { Exam } from '../../models/exam';
import type { ExamCatalogItem } from '../../models/catalog';
import type { ExamResult } from '../../models/scoring';
import type { UserProgress, ExamProgress } from '../../models/progress';
import type { Achievement, UnlockedAchievement } from '../../models/rewards';

export interface IExamRepository {
  getCatalog(): Promise<ExamCatalogItem[]>;
  getExam(id: string): Promise<Exam>;
  getExamsByCategory(category: string): Promise<ExamCatalogItem[]>;
}

export interface IResultRepository {
  saveResult(result: ExamResult): Promise<void>;
  getResult(id: string): Promise<ExamResult | null>;
  getResultsByExam(examId: string): Promise<ExamResult[]>;
  getAllResults(): Promise<ExamResult[]>;
}

export interface IProgressRepository {
  getProgress(): Promise<UserProgress>;
  saveProgress(progress: UserProgress): Promise<void>;
  updateExamProgress(examId: string, data: Partial<ExamProgress>): Promise<void>;
}

export interface IAchievementRepository {
  getAchievements(): Promise<Achievement[]>;
  getUnlocked(): Promise<UnlockedAchievement[]>;
  unlock(achievementId: string): Promise<void>;
}
