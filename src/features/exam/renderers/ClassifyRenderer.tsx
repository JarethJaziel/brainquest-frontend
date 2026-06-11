import React, { useState, useEffect } from 'react';
import type { ClassifyQuestion } from '../../../models/question-types';
import type { QuestionRendererProps } from './index';
import MaterialIcon from '../../../components/ui/MaterialIcon';

export const ClassifyRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  selectedAnswer,
  disabled,
  showFeedback,
}) => {
  const q = question as ClassifyQuestion;
  
  // Local state structure: categoryId -> itemIds[]
  const [classification, setClassification] = useState<Record<string, string[]>>(() => {
    if (selectedAnswer) return selectedAnswer as Record<string, string[]>;
    // Initialize empty arrays for all categories
    const initial: Record<string, string[]> = {};
    q.categories.forEach(cat => {
      initial[cat.id] = [];
    });
    return initial;
  });

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Sync state with selectedAnswer changes (e.g. resets)
  useEffect(() => {
    if (selectedAnswer) {
      setClassification(selectedAnswer as Record<string, string[]>);
    } else {
      const initial: Record<string, string[]> = {};
      q.categories.forEach(cat => {
        initial[cat.id] = [];
      });
      setClassification(initial);
      setSelectedItemId(null);
    }
  }, [selectedAnswer, q.categories]);

  // Find all items that are currently placed in any category
  const placedItemIds = Object.values(classification).flat();
  const unclassifiedItems = q.items.filter(item => !placedItemIds.includes(item.id));

  const handleItemClick = (itemId: string) => {
    if (disabled || showFeedback) return;
    setSelectedItemId(prev => (prev === itemId ? null : itemId));
  };

  const handleCategoryClick = (categoryId: string) => {
    if (disabled || showFeedback || !selectedItemId) return;

    setClassification(prev => {
      const updated = { ...prev };
      
      // Initialize category array if not exist
      if (!updated[categoryId]) {
        updated[categoryId] = [];
      }
      
      // Add item if not already there
      if (!updated[categoryId].includes(selectedItemId)) {
        updated[categoryId] = [...updated[categoryId], selectedItemId];
      }
      
      onAnswer(updated);
      return updated;
    });

    setSelectedItemId(null); // Clear selection
  };

  const handleRemoveItem = (categoryId: string, itemId: string) => {
    if (disabled || showFeedback) return;

    setClassification(prev => {
      const updated = { ...prev };
      updated[categoryId] = (updated[categoryId] || []).filter(id => id !== itemId);
      onAnswer(updated);
      return updated;
    });
  };

  // Helper to determine if an item was classified correctly
  const isItemCorrectlyClassified = (itemId: string, categoryId: string) => {
    const correctItems = q.correctClassification[categoryId] || [];
    return correctItems.includes(itemId);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Visual Instruction helper */}
      {!showFeedback && (
        <div className="text-sm font-bold text-primary flex items-center gap-1.5 justify-center select-none">
          <MaterialIcon name="info" className="text-primary-container" />
          <span>
            {selectedItemId
              ? '¡Ahora toca una categoría abajo para colocar el elemento!'
              : 'Toca un elemento y luego toca la categoría donde corresponde.'}
          </span>
        </div>
      )}

      {/* Unclassified items pool */}
      {unclassifiedItems.length > 0 && (
        <div className="p-4 bg-surface-container rounded-2xl border-2 border-dashed border-outline-variant text-center select-none">
          <div className="text-xs font-black text-outline uppercase tracking-wider mb-3">Elementos por clasificar</div>
          <div className="flex flex-wrap justify-center gap-3">
            {unclassifiedItems.map(item => {
              const isSelected = selectedItemId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    px-4 py-3 font-bold text-sm sm:text-base rounded-2xl border-2 border-solid cursor-pointer select-none
                    transition-all duration-150 transform hover:scale-[1.03]
                    shadow-[0_4px_0_0_#c6c5d7] hover:shadow-[0_4px_0_0_#767686] active:translate-y-[2px] active:shadow-none
                    ${isSelected 
                      ? 'border-primary bg-primary-fixed/20 text-primary scale-[1.05] ring-2 ring-primary/40 shadow-[0_4px_0_0_#3d4ad8]' 
                      : 'border-outline-variant bg-surface-container-lowest hover:border-outline'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    {item.image && <img src={item.image} alt="" className="w-8 h-8 object-contain rounded" />}
                    <span>{item.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories buckets list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
        {q.categories.map(cat => {
          const itemsInCat = classification[cat.id] || [];
          const isCategoryTargetable = !!selectedItemId;

          return (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              style={{ borderColor: cat.color ? `${cat.color}30` : undefined }}
              className={`
                flex flex-col rounded-3xl border-2 p-5 min-h-[160px] transition-all duration-150
                ${isCategoryTargetable 
                  ? 'border-primary border-dashed bg-primary/5 cursor-pointer hover:bg-primary/10 hover:scale-[1.01]' 
                  : 'border-outline-variant bg-surface-container-lowest'
                }
              `}
            >
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-4">
                {cat.icon && (
                  <MaterialIcon 
                    name={cat.icon} 
                    style={{ color: cat.color }} 
                    className="text-2xl shrink-0" 
                  />
                )}
                <span className="font-extrabold text-lg" style={{ color: cat.color }}>
                  {cat.name}
                </span>
                <span className="ml-auto bg-surface-container px-2.5 py-0.5 rounded-full text-xs font-black text-outline">
                  {itemsInCat.length}
                </span>
              </div>

              {/* Items in Category */}
              <div className="flex flex-wrap gap-2.5 flex-1 items-start">
                {itemsInCat.length === 0 ? (
                  <div className="w-full text-center text-outline/50 font-bold text-sm py-4 select-none">
                    {isCategoryTargetable ? '¡Toca aquí para colocar!' : 'Vacío'}
                  </div>
                ) : (
                  itemsInCat.map(itemId => {
                    const item = q.items.find(i => i.id === itemId);
                    if (!item) return null;

                    const isCorrect = isItemCorrectlyClassified(itemId, cat.id);
                    
                    const getItemStyle = () => {
                      if (showFeedback) {
                        return isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[0_4px_0_0_#10b981]'
                          : 'border-error bg-red-50 text-error shadow-[0_4px_0_0_#ba1a1a]';
                      }
                      return 'border-outline-variant bg-surface-container-lowest hover:border-error hover:bg-red-50/20 hover:text-error hover:shadow-[0_4px_0_0_#ba1a1a] shadow-[0_4px_0_0_#c6c5d7]';
                    };

                    return (
                      <div
                        key={itemId}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(cat.id, itemId);
                        }}
                        className={`
                          px-3 py-2 font-bold text-sm rounded-xl border-2 border-solid cursor-pointer select-none
                          flex items-center gap-1.5 transition-all duration-100 active:translate-y-[2px] active:shadow-none
                          ${getItemStyle()}
                        `}
                      >
                        {item.image && <img src={item.image} alt="" className="w-6 h-6 object-contain rounded" />}
                        <span>{item.text}</span>
                        {!showFeedback ? (
                          <MaterialIcon name="close" className="text-xs text-outline/60 shrink-0 ml-1 hover:text-error" />
                        ) : (
                          <MaterialIcon 
                            name={isCorrect ? 'check' : 'close'} 
                            className={`text-sm shrink-0 ml-1 ${isCorrect ? 'text-emerald-600' : 'text-error'}`} 
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Guide on fail */}
      {showFeedback && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 border-dashed text-left select-none animate-fade-in">
          <div className="text-sm font-bold text-amber-800 flex items-center gap-1.5 mb-2">
            <MaterialIcon name="lightbulb" className="text-amber-500" />
            <span>Clasificación correcta:</span>
          </div>
          <div className="flex flex-col gap-2.5 text-sm text-amber-900">
            {q.categories.map(cat => {
              const correctIds = q.correctClassification[cat.id] || [];
              const correctItems = q.items.filter(i => correctIds.includes(i.id));
              return (
                <div key={cat.id} className="flex flex-wrap items-center gap-1.5">
                  <span className="font-extrabold pr-1.5" style={{ color: cat.color }}>
                    {cat.name}:
                  </span>
                  {correctItems.length === 0 ? (
                    <span className="italic text-amber-600 text-xs">Ninguno</span>
                  ) : (
                    correctItems.map(item => (
                      <span key={item.id} className="bg-amber-200/50 px-2 py-0.5 rounded-md font-bold text-xs">
                        {item.text}
                      </span>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassifyRenderer;
