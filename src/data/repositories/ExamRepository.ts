import type { IExamRepository } from './interfaces';
import type { Exam } from '../../models/exam';
import type { ExamCatalogItem } from '../../models/catalog';
import { JsonFetchAdapter } from '../adapters/JsonFetchAdapter';

export class LocalExamRepository implements IExamRepository {
  private readonly basePath = '/exams';
  private readonly fetchAdapter = new JsonFetchAdapter();

  async getCatalog(): Promise<ExamCatalogItem[]> {
    const data = await this.fetchAdapter.fetchJson<{ version: string; exams: ExamCatalogItem[] }>(
      `${this.basePath}/catalog.json`
    );
    return data.exams;
  }

  async getExam(id: string): Promise<Exam> {
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
