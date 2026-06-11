import React, { useState } from 'react';
import type { MatchingQuestion } from '../../../models/question-types';
import type { QuestionRendererProps } from './index';
import MaterialIcon from '../../../components/ui/MaterialIcon';

export const MatchingRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  selectedAnswer,
  disabled,
  showFeedback,
}) => {
  const q = question as MatchingQuestion;
  const userAnswers = (selectedAnswer as Record<string, string>) || {}; // leftId -> rightId

  const [activeLeftId, setActiveLeftId] = useState<string | null>(null);

  const pairColors = [
    { border: 'border-blue-500 bg-blue-50/50 text-blue-800', badge: 'bg-blue-500 text-white' },
    { border: 'border-amber-500 bg-amber-50/50 text-amber-800', badge: 'bg-amber-500 text-white' },
    { border: 'border-purple-500 bg-purple-50/50 text-purple-800', badge: 'bg-purple-500 text-white' },
    { border: 'border-pink-500 bg-pink-50/50 text-pink-800', badge: 'bg-pink-500 text-white' },
    { border: 'border-orange-500 bg-orange-50/50 text-orange-800', badge: 'bg-orange-500 text-white' },
  ];

  const handleLeftClick = (leftId: string) => {
    if (disabled || showFeedback) return;
    
    // If already active, deselect
    if (activeLeftId === leftId) {
      setActiveLeftId(null);
      return;
    }
    
    setActiveLeftId(leftId);
  };

  const handleRightClick = (rightId: string) => {
    if (disabled || showFeedback || !activeLeftId) return;

    // Create a copy of existing answers
    const updated = { ...userAnswers };

    // Check if this rightId is already matched to another leftId, if so remove it
    Object.entries(updated).forEach(([lId, rId]) => {
      if (rId === rightId) {
        delete updated[lId];
      }
    });

    // Match them
    updated[activeLeftId] = rightId;
    
    onAnswer(updated);
    setActiveLeftId(null); // Clear active left item selection
  };

  const handleClearMatch = (leftId: string) => {
    if (disabled || showFeedback) return;
    const updated = { ...userAnswers };
    delete updated[leftId];
    onAnswer(updated);
  };

  // Helper to find match pair index for color coding
  const getMatchIndex = (leftId: string) => {
    const matchedLeftIds = Object.keys(userAnswers);
    return matchedLeftIds.indexOf(leftId);
  };

  const getLeftItemStyles = (leftId: string) => {
    const isMatched = !!userAnswers[leftId];
    const isActive = activeLeftId === leftId;

    if (showFeedback) {
      const rightId = userAnswers[leftId];
      const isCorrect = q.correctPairs.some(([l, r]) => l === leftId && r === rightId);
      
      if (isCorrect) {
        return 'border-emerald-500 bg-emerald-50 text-emerald-700 opacity-90';
      }
      return 'border-error bg-red-50 text-error opacity-90';
    }

    if (isActive) {
      return 'border-primary bg-primary-fixed/20 text-primary scale-[1.02] ring-2 ring-primary/40';
    }

    if (isMatched) {
      const idx = getMatchIndex(leftId);
      return `${pairColors[idx % pairColors.length].border} border-2`;
    }

    return 'border-outline-variant bg-surface-container-lowest hover:border-outline hover:scale-[1.01]';
  };

  const getRightItemStyles = (rightId: string) => {
    // Check if this rightId is matched
    let matchedLeftId = '';
    Object.entries(userAnswers).forEach(([lId, rId]) => {
      if (rId === rightId) {
        matchedLeftId = lId;
      }
    });

    const isMatched = !!matchedLeftId;

    if (showFeedback) {
      const isCorrect = q.correctPairs.some(([l, r]) => l === matchedLeftId && r === rightId);
      if (isCorrect) {
        return 'border-emerald-500 bg-emerald-50 text-emerald-700 opacity-90';
      }
      return 'border-error bg-red-50 text-error opacity-90';
    }

    if (isMatched) {
      const idx = getMatchIndex(matchedLeftId);
      return `${pairColors[idx % pairColors.length].border} border-2`;
    }

    return activeLeftId
      ? 'border-primary border-dashed bg-primary/5 cursor-pointer hover:bg-primary-fixed/20 hover:scale-[1.01]'
      : 'border-outline-variant bg-surface-container-lowest cursor-not-allowed';
  };

  // Helper to render connection badges
  const renderLeftBadge = (leftId: string) => {
    if (showFeedback) {
      const rightId = userAnswers[leftId];
      const isCorrect = q.correctPairs.some(([l, r]) => l === leftId && r === rightId);
      return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-black text-white shrink-0 ${isCorrect ? 'bg-emerald-600' : 'bg-error'}`}>
          {isCorrect ? '✓' : '✗'}
        </span>
      );
    }
    
    const idx = getMatchIndex(leftId);
    if (idx !== -1) {
      return (
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-xs font-black ${pairColors[idx % pairColors.length].badge}`}>
            Pareja {idx + 1}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); handleClearMatch(leftId); }}
            className="text-outline hover:text-error cursor-pointer select-none"
          >
            <MaterialIcon name="close" className="text-sm" />
          </button>
        </div>
      );
    }

    return null;
  };

  const renderRightBadge = (rightId: string) => {
    let matchedLeftId = '';
    Object.entries(userAnswers).forEach(([lId, rId]) => {
      if (rId === rightId) matchedLeftId = lId;
    });

    if (!matchedLeftId) return null;

    if (showFeedback) {
      const isCorrect = q.correctPairs.some(([l, r]) => l === matchedLeftId && r === rightId);
      return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-black text-white shrink-0 ${isCorrect ? 'bg-emerald-600' : 'bg-error'}`}>
          {isCorrect ? '✓' : '✗'}
        </span>
      );
    }

    const idx = getMatchIndex(matchedLeftId);
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-black shrink-0 ${pairColors[idx % pairColors.length].badge}`}>
        Pareja {idx + 1}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Help message for kids */}
      {!showFeedback && (
        <div className="text-sm font-bold text-primary flex items-center gap-1.5 justify-center select-none">
          <MaterialIcon name="info" className="text-primary-container" />
          <span>
            {activeLeftId 
              ? '¡Ahora toca un elemento de la derecha para unirlos!' 
              : 'Toca un elemento de la izquierda, y luego uno de la derecha.'}
          </span>
        </div>
      )}

      {/* Columns Grid */}
      <div className="grid grid-cols-2 gap-8 relative select-none">
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          <div className="text-sm font-black text-outline uppercase tracking-wider text-left pl-2">Grupo A</div>
          {q.leftItems.map(item => (
            <div
              key={item.id}
              onClick={() => handleLeftClick(item.id)}
              className={`
                p-4 font-bold text-sm sm:text-base rounded-2xl border-2 border-solid
                flex items-center justify-between transition-all duration-150 cursor-pointer select-none
                ${getLeftItemStyles(item.id)}
              `}
            >
              <div className="flex items-center gap-3">
                {item.image && <img src={item.image} alt="" className="w-10 h-10 object-contain rounded" />}
                {item.text && <span>{item.text}</span>}
              </div>
              {renderLeftBadge(item.id)}
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          <div className="text-sm font-black text-outline uppercase tracking-wider text-left pl-2">Grupo B</div>
          {q.rightItems.map(item => (
            <div
              key={item.id}
              onClick={() => handleRightClick(item.id)}
              className={`
                p-4 font-bold text-sm sm:text-base rounded-2xl border-2 border-solid
                flex items-center justify-between transition-all duration-150 select-none
                ${getRightItemStyles(item.id)}
              `}
            >
              <div className="flex items-center gap-3">
                {item.image && <img src={item.image} alt="" className="w-10 h-10 object-contain rounded" />}
                {item.text && <span>{item.text}</span>}
              </div>
              {renderRightBadge(item.id)}
            </div>
          ))}
        </div>
      </div>

      {/* Display correct pairs on feedback if incorrect */}
      {showFeedback && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 border-dashed text-left select-none animate-fade-in">
          <div className="text-sm font-bold text-amber-800 flex items-center gap-1.5 mb-2">
            <MaterialIcon name="lightbulb" className="text-amber-500" />
            <span>Relaciones correctas:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-bold text-amber-900">
            {q.correctPairs.map(([lId, rId], idx) => {
              const leftItem = q.leftItems.find(item => item.id === lId);
              const rightItem = q.rightItems.find(item => item.id === rId);
              return (
                <div key={idx} className="flex items-center gap-2">
                  <span className="bg-amber-200/50 px-2 py-0.5 rounded text-xs">Pareja {idx + 1}</span>
                  <span>{leftItem?.text || 'Imagen'}</span>
                  <span>➜</span>
                  <span>{rightItem?.text || 'Imagen'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingRenderer;
