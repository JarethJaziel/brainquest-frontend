import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExam } from '../../../hooks/useExam';
import { useTimer } from '../../../hooks/useTimer';
import ExamProgress from '../components/ExamProgress';
import QuestionNavigator from '../components/QuestionNavigator';
import QuestionCard from '../components/QuestionCard';
import ExamFooter from '../components/ExamFooter';
import ClayCard from '../../../components/ui/ClayCard';
import ChunkyButton from '../../../components/ui/ChunkyButton';
import MaterialIcon from '../../../components/ui/MaterialIcon';

const ExamPlayPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const {
    exam,
    questions,
    currentIndex,
    currentQuestion,
    selectedAnswer,
    feedback,
    isComplete,
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
  } = useExam(examId || '');

  // Setup timer only if timeLimit exists in settings
  const timeLimit = exam?.settings?.timeLimit;
  const { timeLeft, start: startTimer, pause: pauseTimer } = useTimer(
    timeLimit,
    async () => {
      // Time is up! Auto-finalize and navigate
      const finalRes = await finalize();
      if (finalRes) {
        navigate(`/exam/${examId}/result`, { state: { result: finalRes } });
      }
    }
  );

  // Start timer once exam loads
  useEffect(() => {
    if (exam && timeLimit) {
      startTimer();
    }
  }, [exam, timeLimit, startTimer]);

  // Pause timer if user finishes or exam has error
  useEffect(() => {
    if (isComplete || error) {
      pauseTimer();
    }
  }, [isComplete, error, pauseTimer]);

  // Handle final completion redirection
  const handleFinalize = async () => {
    const finalRes = await finalize();
    if (finalRes) {
      navigate(`/exam/${examId}/result`, { state: { result: finalRes } });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-outline font-bold text-lg select-none">Cargando preguntas de la aventura...</p>
      </div>
    );
  }

  if (error || !exam || !currentQuestion) {
    return (
      <ClayCard className="p-8 text-center max-w-md mx-auto my-12 flex flex-col gap-6 select-none">
        <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center mx-auto">
          <MaterialIcon name="warning" className="text-3xl" />
        </div>
        <div>
          <h2 className="text-xl font-black text-on-surface mb-2">¡Oops!</h2>
          <p className="text-outline font-bold text-sm">
            {error ? error.message : 'No hay preguntas disponibles para esta aventura.'}
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

  const isLastQuestion = currentIndex === (questions.length - 1);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-12">
      {/* Top Progress bar and Timer */}
      <ExamProgress 
        current={progress.current} 
        total={progress.total} 
        currentIndex={currentIndex}
        timeLeft={timeLimit ? timeLeft : undefined} 
      />

      {/* Bubble navigation bar */}
      <QuestionNavigator
        questions={questions}
        currentIndex={currentIndex}
        answersMap={answersMap}
        mode="play"
        onNavigate={goToQuestion}
        disabled={!exam.settings.allowSkip}
      />

      {/* Main Question Display Card */}
      <QuestionCard
        question={currentQuestion}
        onAnswer={setSelectedAnswer}
        selectedAnswer={selectedAnswer}
        disabled={!!feedback}
        showFeedback={!!feedback}
      />

      {/* Bottom controls panel */}
      <ExamFooter
        question={currentQuestion}
        allowSkip={exam.settings.allowSkip}
        selectedAnswer={selectedAnswer}
        showFeedback={!!feedback}
        isCorrect={feedback?.isCorrect}
        isLastQuestion={isLastQuestion}
        isFirstQuestion={currentIndex === 0}
        onPrevious={previousQuestion}
        allowNavigateBack={exam.settings.allowSkip}
        onSkip={skipQuestion}
        onSubmit={submitAnswer}
        onNext={isLastQuestion ? handleFinalize : nextQuestion}
      />
    </div>
  );
};

export default ExamPlayPage;
