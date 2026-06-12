import type { IExamRepository } from './interfaces';
import type { Exam } from '../../models/exam';
import type { ExamCatalogItem } from '../../models/catalog';
import { JsonFetchAdapter } from '../adapters/JsonFetchAdapter';
import { ImportedExamRepository } from './ImportedExamRepository';

export class LocalExamRepository implements IExamRepository {
  private readonly basePath = `${import.meta.env.BASE_URL}exams`;
  private readonly fetchAdapter = new JsonFetchAdapter();
  private readonly importedRepo = new ImportedExamRepository();

  async getCatalog(): Promise<ExamCatalogItem[]> {
    try {
      const data = await this.fetchAdapter.fetchJson<{ version: string; exams: ExamCatalogItem[] }>(
        `${this.basePath}/catalog.json`
      );
      const catalogExams = data.exams;
      const importedExams: ExamCatalogItem[] = this.importedRepo.getAll().map(ie => ({
        id: ie.id,
        file: `imported:${ie.id}`,
        metadata: {
          ...ie.exam.metadata,
          questionCount: ie.exam.questions.length,
        },
        rewards: ie.exam.rewards,
        unlockCondition: null,
        themeColor: 'tertiary',
      }));
      return [...catalogExams, ...importedExams];
    } catch (error) {
      console.error('Failed to load static catalog, loading imported only', error);
      // Fallback to only imported exams if offline or catalog.json fails
      return this.importedRepo.getAll().map(ie => ({
        id: ie.id,
        file: `imported:${ie.id}`,
        metadata: {
          ...ie.exam.metadata,
          questionCount: ie.exam.questions.length,
        },
        rewards: ie.exam.rewards,
        unlockCondition: null,
        themeColor: 'tertiary',
      }));
    }
  }

  async getExam(id: string): Promise<Exam> {
    const imported = this.importedRepo.getById(id);
    if (imported) return imported;

    const catalog = await this.getCatalog();
    const entry = catalog.find(e => e.id === id);
    if (!entry) throw new Error(`Exam not found in catalog: ${id}`);

    const url = entry.file.startsWith('/') ? entry.file : `${this.basePath}/${entry.file}`;
    return this.fetchAdapter.fetchJson<Exam>(url);
  }

  async getExamsByCategory(category: string): Promise<ExamCatalogItem[]> {
    const catalog = await this.getCatalog();
    return catalog.filter(e => e.metadata.category === category);
  }
}
