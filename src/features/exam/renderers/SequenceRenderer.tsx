import React from 'react';
import type { SequenceQuestion } from '../../../models/question-types';
import type { QuestionRendererProps } from './index';
import MaterialIcon from '../../../components/ui/MaterialIcon';

export const SequenceRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  selectedAnswer,
  disabled,
  showFeedback,
}) => {
  const q = question as SequenceQuestion;
  const activeOptionId = selectedAnswer as string;

  const handleOptionClick = (optionId: string) => {
    if (disabled || showFeedback) return;
    onAnswer(optionId);
  };

  const getOptionStyle = (optionId: string) => {
    const isSelected = activeOptionId === optionId;

    if (showFeedback) {
      const isCorrect = q.correctNext === optionId;
      if (isCorrect) return 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[0_4px_0_0_#10b981]';
      if (isSelected) return 'border-error bg-red-50 text-error shadow-[0_4px_0_0_#ba1a1a]';
      return 'border-outline-variant bg-surface-container-lowest opacity-50';
    }

    if (isSelected) return 'border-primary bg-primary-fixed/20 text-primary scale-[1.03] shadow-[0_4px_0_0_#3d4ad8]';
    
    return 'border-outline-variant bg-surface-container-lowest hover:border-outline hover:scale-[1.02] shadow-[0_4px_0_0_#c6c5d7] hover:shadow-[0_4px_0_0_#767686] active:translate-y-[2px] active:shadow-none';
  };

  // Build the list of elements to render in the sequence line
  // We insert a special slot at missingPosition
  const sequenceLength = q.visibleItems.length + 1;
  const sequenceElements = [];
  
  let visibleItemIndex = 0;
  for (let i = 0; i < sequenceLength; i++) {
    if (i === q.missingPosition) {
      const selectedOption = q.options.find(opt => opt.id === activeOptionId);
      sequenceElements.push({
        isSlot: true,
        value: selectedOption ? selectedOption.value : '?',
        hasValue: !!selectedOption,
      });
    } else {
      const item = q.visibleItems[visibleItemIndex++];
      if (item) {
        sequenceElements.push({
          isSlot: false,
          value: item.value,
          image: item.image,
        });
      }
    }
  }

  const selectedCorrectOption = q.options.find(opt => opt.id === q.correctNext);

  return (
    <div className="flex flex-col gap-8 select-none w-full min-w-full sm:min-w-[400px]">
      
      {!showFeedback && (
        <div className="text-sm font-bold text-primary flex items-center gap-1.5 justify-center text-center">
          <MaterialIcon name="info" className="text-primary-container shrink-0" />
          <span>¡Completa el patrón eligiendo la respuesta correcta abajo!</span>
        </div>
      )}

      {/* 1. Visual Sequence Chain: Añadimos 'flex-row' explícito y 'w-full min-w-[280px]' */}
      <div className="flex flex-row flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-4 py-6 px-4 bg-surface-container/50 rounded-3xl border border-outline-variant/30 w-full min-w-[280px]">
        {sequenceElements.map((el, idx) => {
          const isLast = idx === sequenceElements.length - 1;

          if (el.isSlot) {
            const getSlotStyle = () => {
              if (showFeedback) {
                const isCorrect = activeOptionId === q.correctNext;
                return isCorrect
                  ? 'border-emerald-500 bg-emerald-100 text-emerald-800 ring-4 ring-emerald-500/20'
                  : 'border-error bg-red-100 text-error ring-4 ring-error/20';
              }
              if (el.hasValue) return 'border-primary bg-primary-fixed text-primary ring-4 ring-primary/20 scale-[1.05]';
              return 'border-secondary-container bg-secondary-fixed text-secondary ring-4 ring-secondary-fixed/30 animate-pulse scale-[1.05]';
            };

            return (
              <React.Fragment key={idx}>
                <div
                  className={`
                    shrink-0 
                    w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-solid
                    flex items-center justify-center font-black text-lg sm:text-2xl transition-all duration-200
                    ${getSlotStyle()}
                  `}
                >
                  {el.value}
                </div>
                {!isLast && (
                  <MaterialIcon name="arrow_forward" className="text-outline/40 font-black text-lg sm:text-2xl shrink-0" />
                )}
              </React.Fragment>
            );
          } else {
            // Render Regular Item
            return (
              <React.Fragment key={idx}>
                <div
                  className="
                    shrink-0 
                    w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-outline-variant bg-surface-container-lowest
                    flex items-center justify-center font-extrabold text-lg sm:text-xl text-on-surface
                  "
                >
                  {el.image ? (
                    <img src={el.image} alt="" className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded" />
                  ) : (
                    <span>{el.value}</span>
                  )}
                </div>
                {!isLast && (
                  <MaterialIcon name="arrow_forward" className="text-outline/40 font-black text-lg sm:text-2xl shrink-0" />
                )}
              </React.Fragment>
            );
          }
        })}
      </div>

      {/* 2. Options grid: Forzamos el ancho con 'w-full' en el contenedor flex y en el grid */}
      <div className="flex flex-col gap-3 w-full max-w-md mx-auto select-none">
        <div className="text-xs font-black text-outline uppercase tracking-wider text-center">Opciones disponibles</div>
        <div className="grid grid-cols-2 gap-4 w-full min-w-[250px]">
          {q.options.map(option => {
            return (
              <button
                key={option.id}
                disabled={disabled || showFeedback}
                onClick={() => handleOptionClick(option.id)}
                className={`
                  w-full min-h-[64px]
                  p-4 font-black text-xl rounded-2xl border-2 border-solid transition-all duration-150 cursor-pointer
                  flex items-center justify-center gap-3 shrink-0
                  ${getOptionStyle(option.id)}
                `}
              >
                {option.image && (
                  <img src={option.image} alt="" className="w-8 h-8 object-contain rounded shrink-0 pointer-events-none" />
                )}
                <span>{option.value}</span>
                
                {showFeedback && option.id === q.correctNext && (
                  <MaterialIcon name="check_circle" className="text-emerald-600 ml-1 shrink-0" />
                )}
                {showFeedback && activeOptionId === option.id && option.id !== q.correctNext && (
                  <MaterialIcon name="cancel" className="text-error ml-1 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation guide on fail */}
      {showFeedback && activeOptionId !== q.correctNext && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 border-dashed text-left w-full shrink-0 animate-fade-in">
          <div className="text-sm font-bold text-amber-800 flex items-center gap-1.5 mb-1">
            <MaterialIcon name="lightbulb" className="text-amber-500 shrink-0" />
            <span className="whitespace-normal">El siguiente número es {selectedCorrectOption?.value}.</span>
          </div>
          <p className="text-xs text-amber-700 font-bold leading-relaxed whitespace-normal mt-2">
            Patrón de la secuencia: va sumando de 2 en 2 (2 + 2 = 4, 4 + 2 = 6, 6 + 2 = 8, 8 + 2 = 10).
          </p>
        </div>
      )}
    </div>
  );
};

export default SequenceRenderer;
