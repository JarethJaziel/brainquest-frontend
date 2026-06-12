import React from 'react';
import type { Question } from '../../../models/question-types';
import ChunkyButton from '../../../components/ui/ChunkyButton';
import MaterialIcon from '../../../components/ui/MaterialIcon';

interface ExamFooterProps {
  question: Question;
  allowSkip: boolean;
  selectedAnswer: unknown;
  showFeedback: boolean;
  isCorrect?: boolean;
  isLastQuestion: boolean;
  isFirstQuestion: boolean;
  onPrevious: () => void;
  allowNavigateBack: boolean;
  onSkip: () => void;
  onSubmit: () => void;
  onNext: () => void;
}

export const ExamFooter: React.FC<ExamFooterProps> = ({
  question,
  allowSkip,
  selectedAnswer,
  showFeedback,
  isCorrect = false,
  isLastQuestion,
  isFirstQuestion,
  onPrevious,
  allowNavigateBack,
  onSkip,
  onSubmit,
  onNext,
}) => {
  const isAnswerSelected = selectedAnswer !== null && selectedAnswer !== undefined && 
    (typeof selectedAnswer === 'object' ? Object.keys(selectedAnswer).length > 0 : true);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Slide-up immediate feedback banner (Duolingo style) */}
      {showFeedback && (
        <div
          className={`
            w-full p-5 rounded-2xl border-2 border-solid flex items-start gap-3 text-left select-none animate-fade-in
            ${isCorrect 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
              : 'bg-red-50 border-red-300 text-red-800'}
          `}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}>
            <MaterialIcon name={isCorrect ? 'done' : 'close'} className="text-xl font-bold" />
          </div>
          <div className="flex-1 font-bold">
            <div className="font-extrabold text-base mb-0.5">
              {isCorrect ? '¡Buen trabajo!' : '¡Casi lo logras!'}
            </div>
            <p className="text-sm font-semibold opacity-90 leading-tight">
              {isCorrect ? question.feedback.correct : question.feedback.incorrect}
            </p>
          </div>
        </div>
      )}

      {/* Button controls bar */}
      <div className="flex items-center justify-between gap-4 mt-2 select-none">
        {/* Previous Button (Anterior) */}
        {allowNavigateBack && !isFirstQuestion ? (
          <ChunkyButton
            color="white"
            onClick={onPrevious}
            className="px-6"
          >
            <MaterialIcon name="arrow_back" />
            <span>Anterior</span>
          </ChunkyButton>
        ) : (
          <div className="w-[100px] sm:w-[120px] shrink-0" />
        )}

        {/* Skip button (Saltar) */}
        {allowSkip && !showFeedback ? (
          <ChunkyButton
            color="white"
            onClick={onSkip}
            className="px-8"
          >
            Saltar
          </ChunkyButton>
        ) : (
          !showFeedback && <div className="flex-1" />
        )}

        {/* Action Button: Comprobar -> Siguiente */}
        <div className="flex-1 flex justify-end">
          {!showFeedback ? (
            <ChunkyButton
              color="primary"
              disabled={!isAnswerSelected}
              onClick={onSubmit}
              className="w-full sm:w-auto min-w-[150px]"
            >
              <MaterialIcon name="fact_check" />
              <span>Comprobar</span>
            </ChunkyButton>
          ) : (
            <ChunkyButton
              color={isCorrect ? 'success' : 'primary'}
              onClick={onNext}
              className="w-full sm:w-auto min-w-[150px]"
            >
              <span>{isLastQuestion ? 'Terminar Examen' : 'Siguiente'}</span>
              <MaterialIcon name="arrow_forward" />
            </ChunkyButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamFooter;
