import { useState, useEffect, useCallback } from 'react';
import type { Exam } from '../models/exam';
import type { Question } from '../models/question-types';
import type { ExamResult, AnswerRecord } from '../models/scoring';
import { ExamEngine } from '../services/ExamEngine';
import { repositories } from '../data';
import { useAudio } from '../context/AudioContext';
import { useUserProgress } from '../context/UserProgressContext';

export interface FeedbackState {
  isCorrect: boolean;
  isPartial: boolean;
  pointsEarned: number;
}

export function useExam(examId: string) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [engine, setEngine] = useState<ExamEngine | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<unknown>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number; percentage: number }>({ current: 0, total: 0, percentage: 0 });
  const [answersMap, setAnswersMap] = useState<Map<string, AnswerRecord>>(new Map());

  const audio = useAudio();
  const { completeExam } = useUserProgress();

  // Load exam and initialize engine
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const data = await repositories.exam.getExam(examId);
        if (active) {
          setExam(data);
          const newEngine = new ExamEngine(data);
          setEngine(newEngine);
          setQuestions(newEngine.getQuestions());
          setCurrentIndex(newEngine.getCurrentIndex());
          setCurrentQuestion(newEngine.getCurrentQuestion());
          setProgress(newEngine.getProgress());
          setAnswersMap(newEngine.getAnswersMap());
          setError(null);
        }
      } catch (err) {
        if (active) {
          console.error(err);
          setError(err instanceof Error ? err : new Error('Error al cargar el examen'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    load();

    return () => {
      active = false;
    };
  }, [examId]);

  const submitAnswer = useCallback(() => {
    if (!engine || !currentQuestion || selectedAnswer === null || selectedAnswer === undefined) return;
    
    // Submit answer to engine
    const res = engine.submitAnswer(currentQuestion.id, selectedAnswer);
    setFeedback({
      isCorrect: res.isCorrect,
      isPartial: res.isPartial,
      pointsEarned: res.pointsEarned,
    });
    setProgress(engine.getProgress());
    setAnswersMap(engine.getAnswersMap());

    // Play corresponding audio feedback
    if (res.isCorrect) {
      audio.playCorrect();
    } else {
      audio.playIncorrect();
    }
  }, [engine, currentQuestion, selectedAnswer, audio]);

  const skipQuestion = useCallback(() => {
    if (!engine) return;
    engine.skipQuestion();
    setProgress(engine.getProgress());
    setAnswersMap(engine.getAnswersMap());
    
    // Auto-advance to next question or complete
    if (engine.isComplete()) {
      setIsComplete(true);
    } else {
      const nextQ = engine.nextQuestion();
      if (nextQ) {
        setCurrentIndex(engine.getCurrentIndex());
        setCurrentQuestion(nextQ);
        // Check if already answered → restore state
        const existing = engine.getAnswerForQuestion(nextQ.id);
        if (existing) {
          if (existing.skipped) {
            setSelectedAnswer(null);
            setFeedback(null);
          } else {
            setSelectedAnswer(existing.answer);
            setFeedback({
              isCorrect: existing.isCorrect,
              isPartial: existing.isPartial,
              pointsEarned: existing.pointsEarned,
            });
          }
        } else {
          setSelectedAnswer(null);
          setFeedback(null);
        }
      }
    }
  }, [engine]);

  const nextQuestion = useCallback(() => {
    if (!engine) return;
    
    const nextQ = engine.nextQuestion();
    if (nextQ) {
      setCurrentIndex(engine.getCurrentIndex());
      setCurrentQuestion(nextQ);
      // Check if already answered → restore state
      const existing = engine.getAnswerForQuestion(nextQ.id);
      if (existing) {
        if (existing.skipped) {
          setSelectedAnswer(null);
          setFeedback(null);
        } else {
          setSelectedAnswer(existing.answer);
          setFeedback({
            isCorrect: existing.isCorrect,
            isPartial: existing.isPartial,
            pointsEarned: existing.pointsEarned,
          });
        }
      } else {
        setSelectedAnswer(null);
        setFeedback(null);
      }
    } else if (engine.isComplete()) {
      setIsComplete(true);
    }
  }, [engine]);

  const previousQuestion = useCallback(() => {
    if (!engine) return;
    const prevQ = engine.previousQuestion();
    if (prevQ) {
      setCurrentIndex(engine.getCurrentIndex());
      setCurrentQuestion(prevQ);
      // Restore state
      const existing = engine.getAnswerForQuestion(prevQ.id);
      if (existing) {
        if (existing.skipped) {
          setSelectedAnswer(null);
          setFeedback(null);
        } else {
          setSelectedAnswer(existing.answer);
          setFeedback({
            isCorrect: existing.isCorrect,
            isPartial: existing.isPartial,
            pointsEarned: existing.pointsEarned,
          });
        }
      } else {
        setSelectedAnswer(null);
        setFeedback(null);
      }
    }
  }, [engine]);

  const goToQuestion = useCallback((index: number) => {
    if (!engine) return;
    const q = engine.goToQuestion(index);
    if (q) {
      setCurrentIndex(index);
      setCurrentQuestion(q);
      // Check if already answered → restore state
      const existing = engine.getAnswerForQuestion(q.id);
      if (existing) {
        if (existing.skipped) {
          setSelectedAnswer(null);
          setFeedback(null);
        } else {
          setSelectedAnswer(existing.answer);
          setFeedback({
            isCorrect: existing.isCorrect,
            isPartial: existing.isPartial,
            pointsEarned: existing.pointsEarned,
          });
        }
      } else {
        setSelectedAnswer(null);
        setFeedback(null);
      }
    }
  }, [engine]);

  const finalize = useCallback(async () => {
    if (!engine || !exam) return null;
    
    const finalResult = engine.finalize();
    
    // Save results and update user progress metrics
    await completeExam(exam, finalResult);
    
    setResult(finalResult);
    setIsComplete(true);
    
    // Play completion fanfare
    audio.playComplete();
    
    return finalResult;
  }, [engine, exam, completeExam, audio]);

  return {
    exam,
    questions,
    currentIndex,
    currentQuestion,
    selectedAnswer,
    feedback,
    isComplete,
    result,
    loading,
    error,
    progress,
    answersMap,
    setSelectedAnswer,
    submitAnswer,
    skipQuestion,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    finalize,
  };
}

export default useExam;
