import React from 'react';
import type { MixedQuestion, MixedSection, ChoiceOption } from '../../../models/question-types';
import type { QuestionRendererProps } from './index';
import MaterialIcon from '../../../components/ui/MaterialIcon';

export const MixedRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  selectedAnswer,
  disabled,
  showFeedback,
}) => {
  const q = question as MixedQuestion;
  const answers = (selectedAnswer as Record<number, string>) || {};

  const handleSelectOption = (sectionIdx: number, optionId: string) => {
    if (disabled || showFeedback) return;
    const newAnswers = { ...answers, [sectionIdx]: optionId };
    onAnswer(newAnswers);
  };

  const handleInputChange = (sectionIdx: number, value: string) => {
    if (disabled || showFeedback) return;
    const newAnswers = { ...answers, [sectionIdx]: value };
    onAnswer(newAnswers);
  };

  const handleDragDropSelect = (sectionIdx: number, itemId: string) => {
    if (disabled || showFeedback) return;
    // Click-to-place simulation: clicking a drag item places it as the answer
    const newAnswers = { ...answers, [sectionIdx]: itemId };
    onAnswer(newAnswers);
  };

  // Section styling functions for feedback
  const getSelectOptionStyles = (sectionIdx: number, option: ChoiceOption, section: MixedSection) => {
    const userAns = answers[sectionIdx];
    const isSelected = userAns === option.id;
    const isCorrect = section.correctAnswer === option.id;

    if (showFeedback) {
      if (isCorrect) {
        return 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[0_3px_0_0_#10b981]';
      }
      if (isSelected && !isCorrect) {
        return 'border-error bg-error-container/20 text-error shadow-[0_3px_0_0_#ba1a1a]';
      }
      return 'border-outline-variant text-outline/40 opacity-50 cursor-not-allowed';
    }

    if (isSelected) {
      return 'border-primary bg-primary-fixed/20 text-primary shadow-[0_3px_0_0_#3d4ad8] scale-[1.01]';
    }

    return 'border-outline text-outline hover:border-primary hover:text-primary shadow-[0_3px_0_0_currentColor] hover:scale-[1.01]';
  };

  const getInputStyles = (sectionIdx: number, section: MixedSection) => {
    const userAns = (answers[sectionIdx] || '').trim().toLowerCase();
    const correctAnswers = Array.isArray(section.correctAnswer)
      ? section.correctAnswer.map(ans => String(ans).trim().toLowerCase())
      : [String(section.correctAnswer).trim().toLowerCase()];
    
    const isCorrect = correctAnswers.includes(userAns);

    if (showFeedback) {
      if (isCorrect) {
        return 'border-emerald-500 bg-emerald-50 text-emerald-700 focus:ring-2 focus:ring-emerald-500/20';
      }
      if (userAns !== '') {
        return 'border-error bg-error-container/10 text-error focus:ring-2 focus:ring-error/20';
      }
      return 'border-outline-variant bg-transparent opacity-60';
    }

    return 'border-outline-variant text-on-surface bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20';
  };

  const isDragItemCorrect = (itemId: string, section: MixedSection) => {
    const correctAnswers = Array.isArray(section.correctAnswer)
      ? section.correctAnswer.map(ans => String(ans).trim().toLowerCase())
      : [String(section.correctAnswer).trim().toLowerCase()];
    return correctAnswers.includes(itemId.trim().toLowerCase());
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Mixed Section Indicators */}
      <div className="flex items-center gap-2 bg-primary/5 px-4 py-3 rounded-2xl border border-solid border-primary/10">
        <MaterialIcon name="list_alt" className="text-xl text-primary shrink-0" />
        <span className="text-xs font-black text-primary-dark">Pregunta con varias partes</span>
        <div className="ml-auto flex gap-1.5">
          {q.sections.map((sec, idx) => {
            const hasAnswer = answers[idx] !== undefined && answers[idx] !== '';
            const isScored = sec.correctAnswer !== undefined;
            if (!isScored) return null;

            return (
              <div
                key={idx}
                className={`
                  w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border border-solid transition-all
                  ${showFeedback
                    ? 'bg-outline-variant text-outline' // Handled in individual sections
                    : hasAnswer
                      ? 'bg-primary border-primary text-white scale-110'
                      : 'bg-white border-outline text-outline'
                  }
                `}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sections List */}
      <div className="flex flex-col gap-8 divide-y-2 divide-dashed divide-outline-variant/50">
        {q.sections.map((section, idx) => {
          const isFirst = idx === 0;

          return (
            <div key={idx} className={`flex flex-col gap-3 ${isFirst ? '' : 'pt-6 text-left'}`}>
              
              {/* SECTION: TEXT */}
              {section.type === 'text' && (
                <div className="p-4 rounded-2xl bg-surface-container-low border-l-4 border-solid border-primary text-left flex gap-3 shadow-sm">
                  <MaterialIcon name="menu_book" className="text-xl text-primary shrink-0" />
                  <p className="text-sm font-semibold text-on-surface/90 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              )}

              {/* SECTION: IMAGE */}
              {section.type === 'image' && (
                <div className="w-full max-w-xl mx-auto rounded-3xl overflow-hidden border-4 border-solid border-outline-variant bg-surface-container-low clay-card shadow-md p-2 min-h-[200px] sm:min-h-[300px] flex items-center justify-center">
                  <img
                    src={section.content}
                    alt="Ilustración de la sección"
                    className="w-full max-h-72 sm:max-h-96 object-contain rounded-2xl block mx-auto"
                  />
                </div>
              )}

              {/* SECTION: SELECT (Multiple Choice option in mixed list) */}
              {section.type === 'select' && (
                <div className="flex flex-col gap-3 text-left">
                  <span className="text-sm font-black text-on-surface flex items-center gap-1.5">
                    <span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-black">
                      {idx + 1}
                    </span>
                    {section.content}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                    {section.options?.map(option => (
                      <button
                        key={option.id}
                        type="button"
                        disabled={disabled || showFeedback}
                        onClick={() => handleSelectOption(idx, option.id)}
                        className={`
                          p-3.5 text-left font-bold text-base rounded-xl border-2 border-solid
                          flex items-center justify-between transition-all duration-150 select-none cursor-pointer
                          ${getSelectOptionStyles(idx, option, section)}
                        `}
                      >
                        <span>{option.text}</span>
                        {showFeedback && section.correctAnswer === option.id && (
                          <MaterialIcon name="check_circle" className="text-emerald-600 text-xl" />
                        )}
                        {showFeedback && answers[idx] === option.id && section.correctAnswer !== option.id && (
                          <MaterialIcon name="cancel" className="text-error text-xl" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: INPUT (Text Fill in mixed list) */}
              {section.type === 'input' && (
                <div className="flex flex-col gap-3 text-left">
                  <label className="text-sm font-black text-on-surface flex items-center gap-1.5">
                    <span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-black">
                      {idx + 1}
                    </span>
                    {section.content}
                  </label>

                  <div className="pl-6 flex flex-wrap items-center gap-3 w-full">
                    <input
                      type="text"
                      disabled={disabled || showFeedback}
                      value={answers[idx] || ''}
                      onChange={e => handleInputChange(idx, e.target.value)}
                      placeholder="Escribe aquí tu respuesta..."
                      className={`
                        w-full sm:w-[350px] min-w-[260px] p-4 rounded-2xl border-2 border-solid font-bold text-lg outline-none transition-all
                        ${getInputStyles(idx, section)}
                      `}
                    />

                    {showFeedback && (() => {
                      const userAns = (answers[idx] || '').trim().toLowerCase();
                      const correctAnswers = Array.isArray(section.correctAnswer)
                        ? section.correctAnswer.map(ans => String(ans).trim().toLowerCase())
                        : [String(section.correctAnswer).trim().toLowerCase()];
                      const isCorrect = correctAnswers.includes(userAns);

                      return isCorrect ? (
                        <MaterialIcon name="check_circle" className="text-emerald-600 text-2xl shrink-0" />
                      ) : (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <MaterialIcon name="cancel" className="text-error text-2xl" />
                          <span className="text-xs font-bold text-emerald-600">
                            (R: {Array.isArray(section.correctAnswer) ? section.correctAnswer[0] : section.correctAnswer})
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* SECTION: DRAG-DROP (Click-to-place items) */}
              {section.type === 'drag-drop' && (
                <div className="flex flex-col gap-3 text-left">
                  <span className="text-sm font-black text-on-surface flex items-center gap-1.5">
                    <span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-black">
                      {idx + 1}
                    </span>
                    {section.content}
                  </span>

                  <div className="pl-6 flex flex-col gap-4">
                    {/* Draggable items list */}
                    <div className="flex flex-wrap gap-2">
                      {section.dragItems?.map(item => {
                        const isPlaced = answers[idx] === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            disabled={disabled || showFeedback || isPlaced}
                            onClick={() => handleDragDropSelect(idx, item.id)}
                            className={`
                              px-3 py-2 rounded-xl border border-solid text-sm font-bold transition-all flex items-center gap-1.5 select-none cursor-pointer
                              ${isPlaced
                                ? 'bg-outline-variant/30 border-outline-variant/30 text-outline/40 cursor-not-allowed line-through'
                                : 'bg-surface-container-high border-outline text-on-surface hover:border-primary active:scale-95 shadow-[0_3px_0_0_#9ca3af]'
                              }
                            `}
                          >
                            {item.image && (
                              <img src={item.image} alt="" className="w-5 h-5 object-contain" />
                            )}
                            <span>{item.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Target Drop Zone */}
                    <div className="flex items-center gap-3">
                      <div 
                        className={`
                          min-h-[50px] w-64 rounded-xl border-2 border-dashed flex items-center justify-center p-2 text-sm font-black transition-all
                          ${showFeedback
                            ? isDragItemCorrect(answers[idx] || '', section)
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-error bg-error-container/20 text-error'
                            : answers[idx]
                              ? 'border-primary bg-primary-fixed/20 text-primary border-solid'
                              : 'border-outline-variant bg-surface-container-lowest text-outline'
                          }
                        `}
                      >
                        {answers[idx] ? (
                          <div className="flex items-center gap-2">
                            <span>
                              {section.dragItems?.find(item => item.id === answers[idx])?.text || answers[idx]}
                            </span>
                            {!disabled && !showFeedback && (
                              <button
                                type="button"
                                onClick={() => handleInputChange(idx, '')}
                                className="text-outline hover:text-error transition-colors ml-2 cursor-pointer"
                              >
                                <MaterialIcon name="cancel" className="text-base" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs">
                            <MaterialIcon name="download" className="animate-bounce" />
                            <span>Toca un elemento arriba para colocarlo aquí</span>
                          </div>
                        )}
                      </div>

                      {showFeedback && (() => {
                        const isCorrect = isDragItemCorrect(answers[idx] || '', section);
                        return isCorrect ? (
                          <MaterialIcon name="check_circle" className="text-emerald-600 text-2xl shrink-0" />
                        ) : (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <MaterialIcon name="cancel" className="text-error text-2xl" />
                            <span className="text-xs font-bold text-emerald-600">
                              (R: {section.dragItems?.find(item => item.id === section.correctAnswer)?.text || section.correctAnswer})
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MixedRenderer;
