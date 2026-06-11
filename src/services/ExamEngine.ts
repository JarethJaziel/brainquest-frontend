import type { Exam } from '../models/exam';
import type { Question } from '../models/question-types';
import type { AnswerRecord, ExamResult } from '../models/scoring';
import { validateAnswer } from './AnswerValidator';
import { ScoringEngine } from './ScoringEngine';

export class ExamEngine {
  private exam: Exam;
  private questions: Question[];
  private currentIndex: number = 0;
  private answers: Map<string, AnswerRecord> = new Map();
  private startTime: number;
  private questionStartTime: number;
  private questionAttempts: Map<string, number> = new Map();

  constructor(exam: Exam) {
    this.exam = exam;
    this.startTime = Date.now();
    this.questionStartTime = this.startTime;
    
    // Copy questions to avoid mutating original data
    this.questions = [...exam.questions];
    if (exam.settings.shuffleQuestions) {
      this.questions = this.shuffle(this.questions);
    }
  }

  private shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  getQuestions(): Question[] {
    return this.questions;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getCurrentQuestion(): Question {
    return this.questions[this.currentIndex];
  }

  submitAnswer(questionId: string, answer: unknown): { isCorrect: boolean; isPartial: boolean; pointsEarned: number } {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) throw new Error(`Question not found: ${questionId}`);

    // Track attempts
    const attempts = (this.questionAttempts.get(questionId) || 0) + 1;
    this.questionAttempts.set(questionId, attempts);

    // Calculate time spent
    const now = Date.now();
    const timeSpent = Math.round((now - this.questionStartTime) / 1000);
    this.questionStartTime = now; // reset for next question/attempt

    // Validate answer
    const validation = validateAnswer(question, answer);

    const record: AnswerRecord = {
      questionId,
      answer,
      isCorrect: validation.isCorrect,
      isPartial: validation.isPartial,
      pointsEarned: validation.pointsEarned,
      timeSpent,
      skipped: false,
      attempts,
    };

    this.answers.set(questionId, record);
    return validation;
  }

  skipQuestion(): void {
    const question = this.getCurrentQuestion();
    const questionId = question.id;
    
    const attempts = (this.questionAttempts.get(questionId) || 0) + 1;
    this.questionAttempts.set(questionId, attempts);

    const now = Date.now();
    const timeSpent = Math.round((now - this.questionStartTime) / 1000);
    this.questionStartTime = now;

    const record: AnswerRecord = {
      questionId,
      answer: null,
      isCorrect: false,
      isPartial: false,
      pointsEarned: 0,
      timeSpent,
      skipped: true,
      attempts,
    };

    this.answers.set(questionId, record);
  }

  nextQuestion(): Question | null {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.questionStartTime = Date.now(); // reset start time for the next question
      return this.getCurrentQuestion();
    }
    return null;
  }

  previousQuestion(): Question | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.questionStartTime = Date.now();
      return this.getCurrentQuestion();
    }
    return null;
  }

  isComplete(): boolean {
    return this.answers.size === this.questions.length;
  }

  getProgress(): { current: number; total: number; percentage: number } {
    const current = this.answers.size;
    const total = this.questions.length;
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    return { current, total, percentage };
  }

  finalize(): ExamResult {
    const now = Date.now();
    const totalTime = Math.round((now - this.startTime) / 1000);

    // Build complete answer records, ensuring any unanswered questions are recorded as skipped
    const answersList: AnswerRecord[] = this.questions.map(q => {
      const existing = this.answers.get(q.id);
      if (existing) return existing;

      // Unanswered, mark as skipped
      return {
        questionId: q.id,
        answer: null,
        isCorrect: false,
        isPartial: false,
        pointsEarned: 0,
        timeSpent: 0,
        skipped: true,
        attempts: 0,
      };
    });

    const score = ScoringEngine.calculateScore(answersList, this.exam);
    const rewards = ScoringEngine.calculateXP(score, this.exam, totalTime);

    return {
      id: `${this.exam.id}_${Date.now()}`,
      examId: this.exam.id,
      attemptNumber: 0, // updated by progress context
      startedAt: new Date(this.startTime).toISOString(),
      completedAt: new Date(now).toISOString(),
      totalTime,
      answers: answersList,
      score,
      rewards,
    };
  }
}

export default ExamEngine;
