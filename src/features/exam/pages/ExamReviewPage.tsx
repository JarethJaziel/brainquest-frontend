import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { Exam } from '../../../models/exam';
import type { ExamResult, AnswerRecord } from '../../../models/scoring';
import { repositories } from '../../../data';
import ReviewHeader from '../components/ReviewHeader';
import QuestionNavigator from '../components/QuestionNavigator';
import QuestionCard from '../components/QuestionCard';
import ReviewFooter from '../components/ReviewFooter';
import ClayCard from '../../../components/ui/ClayCard';
import ChunkyButton from '../../../components/ui/ChunkyButton';
import MaterialIcon from '../../../components/ui/MaterialIcon';

export const ExamReviewPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [exam, setExam] = useState<Exam | null>(null);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    async function loadData() {
      if (!examId) return;

      try {
        setLoading(true);
        // Load exam
        const examData = await repositories.exam.getExam(examId);
        if (!active) return;
        setExam(examData);

        // Try to get result from location state, or fallback to fetching from storage
        let resultData = (location.state as { result?: ExamResult } | null)?.result ?? null;
        
        if (!resultData) {
          const results = await repositories.result.getResultsByExam(examId);
          if (results && results.length > 0) {
            // Sort by completedAt descending or just grab the last one
            resultData = results[results.length - 1];
          }
        }

        if (!active) return;
        if (!resultData) {
          throw new Error('No se encontró ningún resultado de examen para revisar.');
        }

        setResult(resultData);
        setError(null);
      } catch (err) {
        if (active) {
          console.error(err);
          setError(err instanceof Error ? err : new Error('Error al cargar la revisión'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [examId, location.state]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-outline font-bold text-lg select-none">Cargando revisión de la aventura...</p>
      </div>
    );
  }

  if (error || !exam || !result) {
    return (
      <ClayCard className="p-8 text-center max-w-md mx-auto my-12 flex flex-col gap-6 select-none">
        <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center mx-auto">
          <MaterialIcon name="warning" className="text-3xl" />
        </div>
        <div>
          <h2 className="text-xl font-black text-on-surface mb-2">¡Oops!</h2>
          <p className="text-outline font-bold text-sm">
            {error ? error.message : 'No se pudo cargar la revisión del examen.'}
          </p>
        </div>
        <ChunkyButton
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-primary text-white font-black border-2 border-solid shadow-[0_4px_0_0_#222fc2]"
        >
          Volver al Inicio
        </ChunkyButton>
      </ClayCard>
    );
  }

  const questions = exam.questions;
  const currentQuestion = questions[currentIndex];
  
  // Reconstruct answers map for the navigator
  const answersMap = new Map<string, AnswerRecord>();
  result.answers.forEach(a => answersMap.set(a.questionId, a));

  const currentAnswer = answersMap.get(currentQuestion.id);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-12">
      {/* Review Header card */}
      <ReviewHeader 
        exam={exam} 
        result={result} 
        onBackToResults={() => navigate(`/exam/${examId}/result`, { state: { result } })} 
      />

      {/* Semantic navigator bubbles */}
      <QuestionNavigator
        questions={questions}
        currentIndex={currentIndex}
        answersMap={answersMap}
        mode="review"
        onNavigate={setCurrentIndex}
      />

      {/* QuestionCard in read-only review mode */}
      <QuestionCard
        question={currentQuestion}
        onAnswer={() => {}} // No-op in review mode
        selectedAnswer={currentAnswer?.answer ?? null}
        disabled={true}
        showFeedback={true}
      />

      {/* Review details and navigation footer */}
      <ReviewFooter
        currentAnswer={currentAnswer}
        question={currentQuestion}
        currentIndex={currentIndex}
        total={questions.length}
        onPrevious={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
        onNext={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
        onBackToResults={() => navigate(`/exam/${examId}/result`, { state: { result } })}
      />
    </div>
  );
};

export default ExamReviewPage;
