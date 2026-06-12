import React, { useRef, useEffect } from 'react';
import type { Question } from '../../../models/question-types';
import type { AnswerRecord } from '../../../models/scoring';
import MaterialIcon from '../../../components/ui/MaterialIcon';

export interface QuestionNavigatorProps {
  questions: Question[];
  currentIndex: number;
  answersMap: Map<string, AnswerRecord>;
  mode: 'play' | 'review';
  onNavigate: (index: number) => void;
  disabled?: boolean;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  questions,
  currentIndex,
  answersMap,
  mode,
  onNavigate,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeBubbleRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll the active bubble into view
  useEffect(() => {
    if (activeBubbleRef.current) {
      activeBubbleRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentIndex]);

  const handleBubbleClick = (index: number) => {
    if (mode === 'play' && disabled) return;
    onNavigate(index);
  };

  return (
    <div
      ref={containerRef}
      className="w-full flex items-center gap-3 overflow-x-auto scrollbar-hide py-3 px-4 bg-surface-container-low rounded-2xl border-2 border-outline-variant shadow-sm select-none snap-x"
    >
      {questions.map((q, idx) => {
        const isCurrent = idx === currentIndex;
        const answerRecord = answersMap.get(q.id);
        const isAnswered = answerRecord && !answerRecord.skipped;
        const isSkipped = answerRecord && answerRecord.skipped;

        // Base styles for all bubbles
        let bubbleClass = "relative flex items-center justify-center min-w-[40px] h-[40px] rounded-full font-black text-sm border-2 transition-all duration-200 snap-center ";
        let iconName: string | null = null;
        let iconClass = "text-xs absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full border shadow-sm ";

        // Determine styling based on mode and state
        if (mode === 'play') {
          // Play Mode
          if (disabled) {
            bubbleClass += "opacity-60 cursor-not-allowed ";
          } else {
            bubbleClass += "cursor-pointer hover:scale-105 active:scale-95 ";
          }

          if (isCurrent) {
            bubbleClass += "bg-primary text-white border-primary shadow-[0_3px_0_0_#222fc2] scale-110 animate-[bubble-current_2s_infinite] ";
          } else if (isAnswered) {
            bubbleClass += "bg-primary-container text-on-primary-container border-primary/40 ";
            iconName = "check";
            iconClass += "bg-primary text-white border-white";
          } else if (isSkipped) {
            bubbleClass += "border-dashed border-outline-variant text-outline/50 bg-surface-container-lowest ";
            iconName = "forward_to_inbox";
            iconClass += "bg-outline text-white border-white";
          } else {
            bubbleClass += "border-outline-variant/60 text-outline/60 bg-surface-container-lowest ";
          }
        } else {
          // Review Mode
          bubbleClass += "cursor-pointer hover:scale-105 active:scale-95 ";

          if (isCurrent) {
            bubbleClass += "ring-4 ring-primary ring-offset-2 scale-115 ";
          }

          if (isSkipped) {
            bubbleClass += "bg-surface-variant/30 border-outline-variant text-outline-variant ";
            iconName = "arrow_forward";
            iconClass += "bg-outline text-white border-white";
          } else if (answerRecord?.isCorrect) {
            bubbleClass += "bg-emerald-100 border-emerald-500 text-emerald-700 ";
            iconName = "check";
            iconClass += "bg-emerald-500 text-white border-white";
          } else if (answerRecord?.isPartial) {
            bubbleClass += "bg-amber-100 border-amber-500 text-amber-700 ";
            iconName = "remove";
            iconClass += "bg-amber-500 text-white border-white";
          } else {
            // Incorrect
            bubbleClass += "bg-red-100 border-red-500 text-red-700 ";
            iconName = "close";
            iconClass += "bg-red-500 text-white border-white";
          }
        }

        return (
          <button
            key={q.id}
            ref={isCurrent ? activeBubbleRef : null}
            onClick={() => handleBubbleClick(idx)}
            className={bubbleClass}
            type="button"
            disabled={mode === 'play' && disabled}
            title={`Pregunta ${idx + 1}`}
          >
            <span>{idx + 1}</span>
            {iconName && (
              <span className={iconClass}>
                <MaterialIcon name={iconName} className="!text-[10px]" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default QuestionNavigator;
