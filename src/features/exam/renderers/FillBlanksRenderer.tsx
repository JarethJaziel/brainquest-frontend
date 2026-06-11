import React from 'react';
import type { FillBlanksQuestion } from '../../../models/question-types';
import type { QuestionRendererProps } from './index';
import MaterialIcon from '../../../components/ui/MaterialIcon';

export const FillBlanksRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  selectedAnswer,
  disabled,
  showFeedback,
}) => {
  const q = question as FillBlanksQuestion;
  const userAnswers = (selectedAnswer as Record<string, string>) || {};

  // Parse template (splitting by placeholders like {{1}})
  const parts = q.template.split(/(\{\{\w+\}\})/g);

  const handleInputChange = (blankId: string, value: string) => {
    onAnswer({
      ...userAnswers,
      [blankId]: value,
    });
  };

  const getBlankInputStyles = (blankId: string) => {
    const blank = q.blanks.find(b => b.id === blankId);
    const value = (userAnswers[blankId] || '').trim();
    
    if (showFeedback && blank) {
      const isBlankCorrect = blank.correctAnswers.some(ans =>
        value.toLowerCase() === ans.trim().toLowerCase()
      );
      return isBlankCorrect
        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
        : 'border-error bg-red-50 text-error font-bold';
    }
    
    return 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary/20 bg-surface-container-lowest font-semibold';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Question Sentence with Blanks */}
      <div className="text-xl font-bold leading-loose text-on-surface bg-surface-container py-6 px-8 rounded-2xl border-2 border-outline-variant border-dashed text-left flex flex-wrap items-center gap-y-3 gap-x-1 select-none">
        {parts.map((part, index) => {
          const match = part.match(/\{\{(\w+)\}\}/);
          if (match) {
            const blankId = match[1];
            const blank = q.blanks.find(b => b.id === blankId);
            if (!blank) return null;
            
            // Calculate width based on max length of correct answers
            const maxLen = Math.max(...blank.correctAnswers.map(a => a.length), 5);
            const inputWidth = `${Math.min(20, Math.max(5, maxLen)) * 0.75 + 2}rem`;

            return (
              <input
                key={index}
                type="text"
                disabled={disabled || showFeedback}
                value={userAnswers[blankId] || ''}
                onChange={e => handleInputChange(blankId, e.target.value)}
                style={{ width: inputWidth }}
                className={`
                  h-10 px-2 text-center rounded-lg border-2 border-solid outline-none transition-all text-base
                  ${getBlankInputStyles(blankId)}
                `}
                placeholder="..."
              />
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>

      {/* Accepted Answers Helper on Fail */}
      {showFeedback && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 border-dashed text-left select-none animate-fade-in">
          <div className="text-sm font-bold text-amber-800 flex items-center gap-1.5 mb-2">
            <MaterialIcon name="lightbulb" className="text-amber-500" />
            <span>Respuestas correctas para cada espacio:</span>
          </div>
          <div className="flex flex-col gap-2">
            {q.blanks.map((blank, index) => {
              const value = (userAnswers[blank.id] || '').trim();
              const isCorrect = blank.correctAnswers.some(ans =>
                value.toLowerCase() === ans.trim().toLowerCase()
              );
              
              return (
                <div key={blank.id} className="text-sm font-bold text-amber-900">
                  <span className="font-extrabold text-outline mr-2 font-mono">Espacio {index + 1}:</span>
                  <span className={`font-black ${isCorrect ? 'text-emerald-700' : 'text-error'}`}>
                    {isCorrect ? '¡Correcto! ✅' : `Incorrecto ❌ (Respuestas correctas: ${blank.correctAnswers.map(a => `"${a}"`).join(' o ')})`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FillBlanksRenderer;
