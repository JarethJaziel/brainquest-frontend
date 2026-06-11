import React from 'react';
import type { MultipleChoiceQuestion } from '../../../models/question-types';
import type { QuestionRendererProps } from './index';
import MaterialIcon from '../../../components/ui/MaterialIcon';

export const MultipleChoiceRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  selectedAnswer,
  disabled,
  showFeedback,
}) => {
  const q = question as MultipleChoiceQuestion;
  const selectedOptionId = selectedAnswer as string;

  const colorClasses = {
    primary: 'border-primary text-primary hover:bg-primary/5',
    secondary: 'border-secondary text-secondary hover:bg-secondary/5',
    tertiary: 'border-tertiary text-tertiary hover:bg-tertiary/5',
    outline: 'border-outline text-outline hover:bg-outline/5',
    accent: 'border-purple-600 text-purple-600 hover:bg-purple-50',
  };

  const getOptionStyles = (optionId: string, color: string = 'primary') => {
    const isSelected = selectedOptionId === optionId;
    const isCorrect = q.correctAnswer === optionId;
    
    const baseColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.primary;

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
      return 'border-primary bg-primary-fixed/30 text-primary shadow-[0_4px_0_0_#3d4ad8] scale-[1.02]';
    }

    return `${baseColor} hover:scale-[1.01] active:translate-y-1 active:shadow-none shadow-[0_4px_0_0_currentColor]`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Option Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {q.options.map(option => (
          <button
            key={option.id}
            disabled={disabled}
            onClick={() => onAnswer(option.id)}
            className={`
              w-full p-5 text-left font-bold text-lg rounded-2xl border-2 border-solid
              flex items-center justify-between transition-all duration-150 select-none cursor-pointer
              ${getOptionStyles(option.id, option.color)}
            `}
          >
            <div className="flex items-center gap-3">
              {option.image && (
                <img
                  src={option.image}
                  alt={option.text}
                  className="w-12 h-12 object-contain rounded-lg shrink-0"
                />
              )}
              <span>{option.text}</span>
            </div>

            {/* Icon Indicators for Feedback */}
            {showFeedback && q.correctAnswer === option.id && (
              <MaterialIcon name="check_circle" className="text-emerald-600 text-2xl shrink-0" />
            )}
            {showFeedback && selectedOptionId === option.id && q.correctAnswer !== option.id && (
              <MaterialIcon name="cancel" className="text-error text-2xl shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MultipleChoiceRenderer;
