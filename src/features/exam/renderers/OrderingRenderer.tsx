import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { OrderingQuestion } from '../../../models/question-types';
import type { QuestionRendererProps } from './index';
import MaterialIcon from '../../../components/ui/MaterialIcon';

interface SortableItemProps {
  id: string;
  text: string;
  image?: string;
  disabled: boolean;
  showFeedback: boolean;
  isCorrect?: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({
  id,
  text,
  image,
  disabled,
  showFeedback,
  isCorrect,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: disabled || showFeedback });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const getBorderColor = () => {
    if (showFeedback) {
      return isCorrect
        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[0_4px_0_0_#10b981]'
        : 'border-error bg-red-50 text-error shadow-[0_4px_0_0_#ba1a1a]';
    }
    if (isDragging) {
      return 'border-primary bg-primary/5 shadow-[0_4px_0_0_#3d4ad8] opacity-80';
    }
    return 'border-outline-variant bg-surface-container-lowest hover:border-outline hover:scale-[1.01] shadow-[0_4px_0_0_#c6c5d7]';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        w-full touch-none
        p-4 font-bold text-base sm:text-lg rounded-2xl border-2 border-solid
        flex items-center gap-3 transition-all duration-150 select-none
        ${disabled || showFeedback ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
        ${getBorderColor()}
      `}
      {...attributes}
      {...listeners}
    >
      <MaterialIcon name="drag_indicator" className={`text-outline/40 ${disabled || showFeedback ? 'hidden' : ''}`} />
      
      {image && (
        <img
          src={image}
          alt={text}
          className="w-10 h-10 object-contain rounded shrink-0 pointer-events-none"
        />
      )}
      <span className="flex-1 text-center pr-4">{text}</span>
      
      {showFeedback && (
        <div className="shrink-0 flex items-center">
          {isCorrect ? (
            <MaterialIcon name="check_circle" className="text-emerald-600" />
          ) : (
            <MaterialIcon name="cancel" className="text-error" />
          )}
        </div>
      )}
    </div>
  );
};

export const OrderingRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  selectedAnswer,
  disabled,
  showFeedback,
}) => {
  const q = question as OrderingQuestion;

  const [orderedIds, setOrderedIds] = useState<string[]>(() => {
    if (selectedAnswer) return selectedAnswer as string[];
    
    // Default order (shuffled initially is best, so we use items list as is.
    // The JSON already shuffles the options if shuffleOptions is set, but we copy items array)
    return q.items.map(i => i.id);
  });

  // Sync state if selectedAnswer changes from outside (e.g. resets)
  useEffect(() => {
    if (selectedAnswer) {
      setOrderedIds(selectedAnswer as string[]);
    } else {
      setOrderedIds(q.items.map(i => i.id));
    }
  }, [selectedAnswer, q.items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, // Espera 150ms antes de iniciar el arrastre en móviles
        tolerance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedIds.indexOf(active.id as string);
    const newIndex = orderedIds.indexOf(over.id as string);
    
    const newOrderedIds = arrayMove(orderedIds, oldIndex, newIndex);
    setOrderedIds(newOrderedIds);
    onAnswer(newOrderedIds);
  };

  const isOrderCorrect = JSON.stringify(orderedIds) === JSON.stringify(q.correctOrder);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Visual Instruction helper */}
      {!showFeedback && (
        <div className="text-sm font-bold text-primary flex items-center gap-1.5 justify-center select-none">
          <MaterialIcon name="pan_tool" className="text-primary-container" />
          <span>¡Arrastra y suelta los elementos para ordenarlos!</span>
        </div>
      )}

      {/* DnD Context Container */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3 max-w-md mx-auto w-full">
            {orderedIds.map(id => {
              const item = q.items.find(i => i.id === id);
              if (!item) return null;

              const isCorrect = q.correctOrder.indexOf(id) === orderedIds.indexOf(id);

              return (
                <SortableItem
                  key={id}
                  id={id}
                  text={item.text}
                  image={item.image}
                  disabled={disabled}
                  showFeedback={showFeedback}
                  isCorrect={isCorrect}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Correct order guide on fail */}
      {showFeedback && !isOrderCorrect && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 border-dashed text-left w-full shrink-0 animate-fade-in">
          <div className="text-sm font-bold text-amber-800 flex items-center gap-1.5 mb-1">
            <MaterialIcon name="lightbulb" className="text-amber-500" />
            <span>El orden correcto es:</span>
          </div>
          <ol className="list-decimal list-inside text-sm font-bold text-amber-900 flex flex-col gap-1">
            {q.correctOrder.map((id, index) => {
              const item = q.items.find(i => i.id === id);
              return (
                <li key={id} className="pl-2">
                  <span className="font-extrabold text-amber-600 font-mono mr-1">#{index + 1}</span>
                  <span>{item?.text}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
};

export default OrderingRenderer;
