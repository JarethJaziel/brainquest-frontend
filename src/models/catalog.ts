// ===== EXAM CATALOG =====
import type { ExamMetadata, ExamRewards } from './exam';

export interface ExamCatalogItem {
  id: string;
  file: string;                       // nombre del archivo JSON (ej: math-adventure.json)
  metadata: ExamMetadata & { questionCount: number };
  rewards: ExamRewards;
  unlockCondition: UnlockCondition | null;
  themeColor: 'primary' | 'secondary' | 'tertiary' | 'accent' | string;
}

export interface UnlockCondition {
  type: 'level' | 'exam' | 'achievement';
  value: string | number;
}

export interface ExamCatalog {
  version: string;
  exams: ExamCatalogItem[];
}
