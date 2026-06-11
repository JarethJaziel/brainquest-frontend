import { useState, useEffect, useCallback } from 'react';
import type { Exam } from '../models/exam';
import type { Question } from '../models/question-types';
import type { ExamResult } from '../models/scoring';
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
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<unknown>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number; percentage: number }>({ current: 0, total: 0, percentage: 0 });

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
          setCurrentQuestion(newEngine.getCurrentQuestion());
          setProgress(newEngine.getProgress());
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
    
    // Auto-advance to next question or complete
    if (engine.isComplete()) {
      setIsComplete(true);
    } else {
      const nextQ = engine.nextQuestion();
      setCurrentQuestion(nextQ);
      setSelectedAnswer(null);
      setFeedback(null);
    }
  }, [engine]);

  const nextQuestion = useCallback(() => {
    if (!engine) return;
    
    if (engine.isComplete()) {
      setIsComplete(true);
    } else {
      const nextQ = engine.nextQuestion();
      setCurrentQuestion(nextQ);
      setSelectedAnswer(null);
      setFeedback(null);
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
    currentQuestion,
    selectedAnswer,
    feedback,
    isComplete,
    result,
    loading,
    error,
    progress,
    setSelectedAnswer,
    submitAnswer,
    skipQuestion,
    nextQuestion,
    finalize,
  };
}

export default useExam;
