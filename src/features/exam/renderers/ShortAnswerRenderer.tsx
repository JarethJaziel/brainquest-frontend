import React from 'react';
import type { ShortAnswerQuestion } from '../../../models/question-types';
import type { QuestionRendererProps } from './index';
import MaterialIcon from '../../../components/ui/MaterialIcon';

export const ShortAnswerRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  selectedAnswer,
  disabled,
  showFeedback,
}) => {
  const q = question as ShortAnswerQuestion;
  const value = (selectedAnswer as string) || '';

  const isCorrect = q.correctAnswers.some(ans => {
    if (q.caseSensitive) {
      return value.trim() === ans.trim();
    } else {
      return value.trim().toLowerCase() === ans.trim().toLowerCase();
    }
  });

  const getInputStyles = () => {
    if (showFeedback) {
      if (isCorrect) {
        return 'border-emerald-500 bg-emerald-50 text-emerald-700 focus:ring-emerald-500';
      }
      return 'border-error bg-error-container/10 text-error focus:ring-error';
    }
    return 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Typed input */}
      <div className="relative flex items-center">
        <input
          type="text"
          disabled={disabled || showFeedback}
          value={value}
          maxLength={q.maxLength || 50}
          placeholder={q.placeholder || 'Escribe tu respuesta aquí...'}
          onChange={e => onAnswer(e.target.value)}
          className={`
            w-full p-4 pr-12 rounded-2xl border-2 border-solid font-bold text-lg outline-none transition-all
            ${getInputStyles()}
          `}
        />

        {/* Status icons overlay */}
        {showFeedback && (
          <div className="absolute right-4 flex items-center">
            {isCorrect ? (
              <MaterialIcon name="check_circle" className="text-emerald-600 text-2xl" />
            ) : (
              <MaterialIcon name="cancel" className="text-error text-2xl" />
            )}
          </div>
        )}
      </div>

      {/* Show explanation/correct answer if incorrect */}
      {showFeedback && !isCorrect && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 border-dashed text-left">
          <div className="text-sm font-bold text-amber-800 flex items-center gap-1.5 mb-1">
            <MaterialIcon name="lightbulb" className="text-amber-500" />
            <span>Respuestas correctas aceptadas:</span>
          </div>
          <ul className="list-disc list-inside text-sm font-bold text-amber-700 pl-2">
            {q.correctAnswers.map((ans, idx) => (
              <li key={idx}>"{ans}"</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ShortAnswerRenderer;
