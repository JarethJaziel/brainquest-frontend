import React from 'react';
import type { TrueFalseQuestion } from '../../../models/question-types';
import type { QuestionRendererProps } from './index';
import MaterialIcon from '../../../components/ui/MaterialIcon';

export const TrueFalseRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  selectedAnswer,
  disabled,
  showFeedback,
}) => {
  const q = question as TrueFalseQuestion;
  const userAnswer = selectedAnswer as boolean | null;

  const getButtonStyles = (isTrueButton: boolean) => {
    const isSelected = userAnswer === isTrueButton;
    const isCorrect = q.correctAnswer === isTrueButton;

    if (showFeedback) {
      if (isCorrect) {
        return 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[0_4px_0_0_#10b981]';
      }
      if (isSelected && !isCorrect) {
        return 'border-error bg-error-container/20 text-error shadow-[0_4px_0_0_#ba1a1a]';
      }
      return 'border-outline-variant text-outline/40 opacity-50 cursor-not-allowed';
    }

    if (isSelected) {
      return isTrueButton
        ? 'border-emerald-600 bg-emerald-50 text-emerald-600 shadow-[0_4px_0_0_#059669] scale-[1.02]'
        : 'border-error bg-red-50 text-error shadow-[0_4px_0_0_#dc2626] scale-[1.02]';
    }

    return isTrueButton
      ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-50/50 hover:scale-[1.01] active:translate-y-1 active:shadow-none shadow-[0_4px_0_0_currentColor]'
      : 'border-error text-error hover:bg-red-50/50 hover:scale-[1.01] active:translate-y-1 active:shadow-none shadow-[0_4px_0_0_currentColor]';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Statement */}
      <div className="text-xl font-bold text-center text-on-surface bg-surface-container py-4 px-6 rounded-2xl border-2 border-outline-variant border-dashed">
        "{q.statement}"
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* TRUE BUTTON */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAnswer(true)}
          className={`
            p-5 font-black text-xl rounded-2xl border-2 border-solid
            flex flex-col items-center justify-center gap-2 transition-all duration-150 cursor-pointer select-none
            ${getButtonStyles(true)}
          `}
        >
          <MaterialIcon name="thumb_up" filled={userAnswer === true} className="text-3xl" />
          <span>Verdadero</span>
          
          {showFeedback && q.correctAnswer === true && (
            <MaterialIcon name="check_circle" className="text-emerald-600 text-xl" />
          )}
          {showFeedback && userAnswer === true && q.correctAnswer !== true && (
            <MaterialIcon name="cancel" className="text-error text-xl" />
          )}
        </button>

        {/* FALSE BUTTON */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAnswer(false)}
          className={`
            p-5 font-black text-xl rounded-2xl border-2 border-solid
            flex flex-col items-center justify-center gap-2 transition-all duration-150 cursor-pointer select-none
            ${getButtonStyles(false)}
          `}
        >
          <MaterialIcon name="thumb_down" filled={userAnswer === false} className="text-3xl" />
          <span>Falso</span>

          {showFeedback && q.correctAnswer === false && (
            <MaterialIcon name="check_circle" className="text-emerald-600 text-xl" />
          )}
          {showFeedback && userAnswer === false && q.correctAnswer !== false && (
            <MaterialIcon name="cancel" className="text-error text-xl" />
          )}
        </button>
      </div>
    </div>
  );
};

export default TrueFalseRenderer;
