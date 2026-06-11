import React, { useState } from 'react';
import type { Question } from '../../../models/question-types';
import ClayCard from '../../../components/ui/ClayCard';
import MaterialIcon from '../../../components/ui/MaterialIcon';
import QuestionRenderer from './QuestionRenderer';

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: unknown) => void;
  selectedAnswer: unknown;
  disabled: boolean;
  showFeedback: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswer,
  selectedAnswer,
  disabled,
  showFeedback,
}) => {
  const [showHint, setShowHint] = useState(false);

  const difficultyLabels = {
    easy: { text: 'Fácil', bg: 'bg-green-100 text-green-700 border-green-300' },
    medium: { text: 'Medio', bg: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    hard: { text: 'Difícil', bg: 'bg-orange-100 text-orange-700 border-orange-300' },
    expert: { text: 'Experto', bg: 'bg-red-100 text-red-700 border-red-300' },
  };

  const difficulty = difficultyLabels[question.difficulty] || difficultyLabels.easy;

  // Reset hint when question changes
  React.useEffect(() => {
    setShowHint(false);
  }, [question.id]);

  return (
    <ClayCard className="w-full flex flex-col gap-6 relative overflow-visible">
      {/* Top badges bar */}
      <div className="flex items-center justify-between select-none">
        <div className="flex gap-2">
          {/* Difficulty Badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-black border border-solid ${difficulty.bg}`}>
            {difficulty.text}
          </span>
          {/* Points Badge */}
          <span className="bg-primary/10 border border-solid border-primary/20 text-primary px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
            <MaterialIcon name="stars" className="text-sm" filled />
            <span>{question.points} Pts</span>
          </span>
        </div>

        {/* Hint toggle bulb */}
        {question.hint && !showFeedback && (
          <button
            onClick={() => setShowHint(prev => !prev)}
            className={`
              w-10 h-10 rounded-full border border-solid flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none
              ${showHint 
                ? 'bg-yellow-100 border-yellow-300 text-yellow-600 shadow-sm'
                : 'bg-surface-container-lowest border-outline-variant text-outline hover:text-yellow-500'}
            `}
            title="Ver pista"
          >
            <MaterialIcon name="lightbulb" filled={showHint} />
          </button>
        )}
      </div>

      {/* Hint Banner */}
      {showHint && question.hint && !showFeedback && (
        <div className="p-4 rounded-2xl bg-yellow-50 border-2 border-yellow-300 border-dashed text-left select-none animate-fade-in">
          <div className="text-sm font-black text-yellow-800 flex items-center gap-1.5 mb-0.5">
            <MaterialIcon name="help" className="text-yellow-600 animate-bounce" />
            <span>¡Una ayudita!</span>
          </div>
          <p className="text-sm font-semibold text-yellow-700 leading-normal">{question.hint}</p>
        </div>
      )}

      {/* Question Prompt Section */}
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Prompt Image if present */}
        {question.prompt.image && (
          <img
            src={question.prompt.image}
            alt="Pregunta"
            className="max-h-56 sm:max-h-72 object-contain rounded-2xl border border-solid border-outline-variant shadow-sm pointer-events-none select-none max-w-full"
          />
        )}
        
        {/* Prompt text */}
        <h2 className="text-xl sm:text-2xl font-black text-on-surface leading-snug px-2">
          {question.prompt.text}
        </h2>
      </div>

      {/* Dynamic question content renderer strategy */}
      <div className="w-full mt-2">
        <QuestionRenderer
          question={question}
          onAnswer={onAnswer}
          selectedAnswer={selectedAnswer}
          disabled={disabled}
          showFeedback={showFeedback}
        />
      </div>

      {/* Immediate feedback explanation banner */}
      {showFeedback && question.explanation && (
        <div className="p-4 rounded-2xl bg-primary/5 border-2 border-primary/20 border-dashed text-left select-none animate-fade-in mt-4 font-bold">
          <div className="text-sm font-black text-primary flex items-center gap-1.5 mb-0.5">
            <MaterialIcon name="menu_book" className="text-primary-container" />
            <span>¿Sabías qué?</span>
          </div>
          <p className="text-sm font-semibold text-on-surface/80 leading-normal">{question.explanation}</p>
        </div>
      )}
    </ClayCard>
  );
};

export default QuestionCard;
