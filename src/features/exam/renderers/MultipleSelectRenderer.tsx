import React from 'react';
import type { MultipleSelectQuestion } from '../../../models/question-types';
import type { QuestionRendererProps } from './index';
import MaterialIcon from '../../../components/ui/MaterialIcon';

export const MultipleSelectRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  selectedAnswer,
  disabled,
  showFeedback,
}) => {
  const q = question as MultipleSelectQuestion;
  // Ensure selectedAnswer is an array of strings
  const selectedIds = (selectedAnswer as string[]) || [];

  const colorClasses = {
    primary: 'border-primary text-primary hover:bg-primary/5',
    secondary: 'border-secondary text-secondary hover:bg-secondary/5',
    tertiary: 'border-tertiary text-tertiary hover:bg-tertiary/5',
    outline: 'border-outline text-outline hover:bg-outline/5',
    accent: 'border-purple-600 text-purple-600 hover:bg-purple-50',
  };

  const handleOptionClick = (optionId: string) => {
    if (disabled) return;

    let newSelected: string[];
    if (selectedIds.includes(optionId)) {
      newSelected = selectedIds.filter(id => id !== optionId);
    } else {
      // Check maxSelections constraint
      if (q.maxSelections && selectedIds.length >= q.maxSelections) {
        // If max selections reached, we could replace the first selection or do nothing
        // Let's do nothing (prevent selecting more than maxSelections)
        return;
      }
      newSelected = [...selectedIds, optionId];
    }
    onAnswer(newSelected);
  };

  const getOptionStyles = (optionId: string, color: string = 'primary') => {
    const isSelected = selectedIds.includes(optionId);
    const isCorrect = q.correctAnswers.includes(optionId);
    
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

  // Label text for kid instructions
  let instructionText = 'Selecciona las respuestas correctas';
  if (q.minSelections && q.maxSelections) {
    if (q.minSelections === q.maxSelections) {
      instructionText = `Selecciona exactamente ${q.minSelections} respuestas`;
    } else {
      instructionText = `Selecciona entre ${q.minSelections} y ${q.maxSelections} respuestas`;
    }
  } else if (q.minSelections) {
    instructionText = `Selecciona al menos ${q.minSelections} respuestas`;
  } else if (q.maxSelections) {
    instructionText = `Selecciona hasta ${q.maxSelections} respuestas`;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Kid-friendly instructions banner */}
      <div className="bg-primary-container/30 border border-primary/20 text-primary-dark px-4 py-2.5 rounded-2xl flex items-center gap-2.5 text-sm font-bold animate-pulse-slow">
        <MaterialIcon name="info" className="text-xl text-primary" />
        <span>{instructionText}</span>
        {selectedIds.length > 0 && !showFeedback && (
          <span className="ml-auto bg-primary text-white rounded-full px-2.5 py-0.5 text-xs">
            {selectedIds.length} {q.maxSelections ? `/ ${q.maxSelections}` : ''}
          </span>
        )}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {q.options.map(option => {
          const isSelected = selectedIds.includes(option.id);
          const isCorrect = q.correctAnswers.includes(option.id);
          
          return (
            <button
              key={option.id}
              disabled={disabled}
              onClick={() => handleOptionClick(option.id)}
              className={`
                w-full p-5 text-left font-bold text-lg rounded-2xl border-2 border-solid
                flex items-center justify-between transition-all duration-150 select-none cursor-pointer
                ${getOptionStyles(option.id, option.color)}
              `}
            >
              <div className="flex items-center gap-3">
                {/* Custom Checkbox */}
                <div 
                  className={`
                    w-6 h-6 rounded-lg border-2 border-solid shrink-0 flex items-center justify-center transition-all duration-150
                    ${showFeedback
                      ? isCorrect
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : isSelected
                          ? 'border-error bg-error text-white'
                          : 'border-outline-variant bg-transparent'
                      : isSelected
                        ? 'border-primary bg-primary text-white scale-110 shadow-sm'
                        : 'border-outline hover:border-primary bg-transparent'
                    }
                  `}
                >
                  {isSelected && !showFeedback && (
                    <MaterialIcon name="check" className="text-sm font-black checkbox-check" />
                  )}
                  {showFeedback && isCorrect && (
                    <MaterialIcon name="check" className="text-sm font-black" />
                  )}
                  {showFeedback && isSelected && !isCorrect && (
                    <MaterialIcon name="close" className="text-sm font-black" />
                  )}
                </div>

                {option.image && (
                  <img
                    src={option.image}
                    alt={option.text}
                    className="w-12 h-12 object-contain rounded-lg shrink-0"
                  />
                )}
                <span>{option.text}</span>
              </div>

              {/* Status icon indicators */}
              {showFeedback && isCorrect && (
                <MaterialIcon name="check_circle" className="text-emerald-600 text-2xl shrink-0" />
              )}
              {showFeedback && isSelected && !isCorrect && (
                <MaterialIcon name="cancel" className="text-error text-2xl shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleSelectRenderer;
