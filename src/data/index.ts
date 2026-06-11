import type { IExamRepository, IResultRepository, IProgressRepository, IAchievementRepository } from './repositories/interfaces';
import { LocalExamRepository } from './repositories/ExamRepository';
import { LocalResultRepository } from './repositories/ResultRepository';
import { LocalProgressRepository } from './repositories/ProgressRepository';
import { LocalAchievementRepository } from './repositories/AchievementRepository';

type DataSource = 'local' | 'api';

const DATA_SOURCE: DataSource = 'local'; // Cambiar a 'api' cuando haya backend

export function createExamRepository(): IExamRepository {
  switch (DATA_SOURCE) {
    case 'local':
      return new LocalExamRepository();
    case 'api':
      throw new Error('API repository not implemented yet');
  }
}

export function createResultRepository(): IResultRepository {
  switch (DATA_SOURCE) {
    case 'local':
      return new LocalResultRepository();
    case 'api':
      throw new Error('API repository not implemented yet');
  }
}

export function createProgressRepository(): IProgressRepository {
  switch (DATA_SOURCE) {
    case 'local':
      return new LocalProgressRepository();
    case 'api':
      throw new Error('API repository not implemented yet');
  }
}

export function createAchievementRepository(): IAchievementRepository {
  switch (DATA_SOURCE) {
    case 'local':
      return new LocalAchievementRepository();
    case 'api':
      throw new Error('API repository not implemented yet');
  }
}

// Singleton instances for dependency injection
export const repositories = {
  exam: createExamRepository(),
  result: createResultRepository(),
  progress: createProgressRepository(),
  achievement: createAchievementRepository(),
};

export * from './repositories/interfaces';
export * from './repositories/ExamRepository';
export * from './repositories/ResultRepository';
export * from './repositories/ProgressRepository';
export * from './repositories/AchievementRepository';
