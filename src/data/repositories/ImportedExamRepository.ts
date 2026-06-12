import type { Exam } from '../../models/exam';

export interface ImportedExam {
  id: string;                         // 'imported-{originalId}'
  exam: Exam;
  importedAt: string;                 // ISO timestamp
  fileName: string;                   // nombre del archivo original
}

export class ImportedExamRepository {
  private readonly storageKey = 'brainquest_imported_exams';

  getAll(): ImportedExam[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse imported exams from localStorage', e);
      return [];
    }
  }

  getById(id: string): Exam | null {
    const all = this.getAll();
    const found = all.find(ie => ie.id === id);
    return found ? found.exam : null;
  }

  save(exam: Exam, fileName: string): string {
    const all = this.getAll();
    
    // Prefix ID if not already prefixed
    const importedId = exam.id.startsWith('imported-') ? exam.id : `imported-${exam.id}`;
    
    // Update the exam object's internal ID to match the prefixed one
    const updatedExam: Exam = {
      ...exam,
      id: importedId,
    };

    // Filter out previous version of this imported exam if exists
    const filtered = all.filter(ie => ie.id !== importedId);

    const importedItem: ImportedExam = {
      id: importedId,
      exam: updatedExam,
      importedAt: new Date().toISOString(),
      fileName,
    };

    filtered.push(importedItem);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));

    return importedId;
  }

  remove(id: string): void {
    const all = this.getAll();
    const filtered = all.filter(ie => ie.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
  }

  exists(id: string): boolean {
    const all = this.getAll();
    const importedId = id.startsWith('imported-') ? id : `imported-${id}`;
    return all.some(ie => ie.id === importedId);
  }
}
