import type { IResultRepository } from './interfaces';
import type { ExamResult } from '../../models/scoring';
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';

export class LocalResultRepository implements IResultRepository {
  private readonly adapter = new LocalStorageAdapter<ExamResult[]>('brainquest_results', []);

  async saveResult(result: ExamResult): Promise<void> {
    const results = this.adapter.get();
    results.push(result);
    this.adapter.set(results);
  }

  async getResult(id: string): Promise<ExamResult | null> {
    const results = this.adapter.get();
    return results.find(r => r.id === id) || null;
  }

  async getResultsByExam(examId: string): Promise<ExamResult[]> {
    const results = this.adapter.get();
    return results.filter(r => r.examId === examId);
  }

  async getAllResults(): Promise<ExamResult[]> {
    return this.adapter.get();
  }
}
