import React from 'react';
import type { HotspotQuestion } from '../../../models/question-types';
import type { QuestionRendererProps } from './index';
import MaterialIcon from '../../../components/ui/MaterialIcon';

export const HotspotRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  selectedAnswer,
  disabled,
  showFeedback,
}) => {
  const q = question as HotspotQuestion;
  const selectedIds = (selectedAnswer as string[]) || [];

  const handleHotspotClick = (hotspotId: string) => {
    if (disabled) return;

    let newSelected: string[];
    if (q.multiSelect) {
      if (selectedIds.includes(hotspotId)) {
        newSelected = selectedIds.filter(id => id !== hotspotId);
      } else {
        newSelected = [...selectedIds, hotspotId];
      }
    } else {
      newSelected = [hotspotId];
    }
    onAnswer(newSelected);
  };

  const isHotspotSelected = (id: string) => selectedIds.includes(id);
  const isHotspotCorrect = (id: string) => q.correctHotspots.includes(id);

  return (
    <div className="flex flex-col gap-6">
      {/* Interactive instruction bar */}
      <div className="bg-tertiary-container/30 border border-tertiary/20 text-tertiary-dark px-4 py-2.5 rounded-2xl flex items-center gap-2.5 text-sm font-bold animate-pulse-slow">
        <MaterialIcon name="touch_app" className="text-xl text-tertiary animate-bounce" />
        <span>
          {q.multiSelect
            ? 'Toca todas las zonas correctas en la imagen'
            : 'Toca la zona correcta en la imagen'}
        </span>
        {selectedIds.length > 0 && !showFeedback && (
          <span className="ml-auto bg-tertiary text-white rounded-full px-2.5 py-0.5 text-xs">
            {selectedIds.length} {q.multiSelect ? 'seleccionadas' : ''}
          </span>
        )}
      </div>

      {/* Main Image Container */}
      <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border-4 border-solid border-outline-variant bg-surface-container-low clay-card shadow-lg select-none">
        <img
          src={q.backgroundImage}
          alt={q.prompt.text}
          className="w-full h-auto object-contain block pointer-events-none"
        />

        {/* Hotspots Overlay */}
        {q.hotspots.map(spot => {
          const isSelected = isHotspotSelected(spot.id);
          const isCorrect = isHotspotCorrect(spot.id);
          
          let borderStyle = 'border-2 border-dashed border-primary bg-primary/10';
          let iconName: string | null = null;
          let feedbackColor = '';

          if (showFeedback) {
            if (isCorrect) {
              borderStyle = 'border-4 border-solid border-emerald-500 bg-emerald-500/25 hotspot-pulse';
              iconName = 'check';
              feedbackColor = 'bg-emerald-600 text-white';
            } else if (isSelected) {
              borderStyle = 'border-4 border-solid border-error bg-error/25';
              iconName = 'close';
              feedbackColor = 'bg-error text-white';
            } else {
              borderStyle = 'border border-solid border-outline-variant opacity-30 cursor-not-allowed';
            }
          } else {
            if (isSelected) {
              borderStyle = 'border-3 border-solid border-primary bg-primary/30 scale-105';
            } else {
              borderStyle = 'border-2 border-dashed border-primary/60 bg-primary/5 hover:bg-primary/20 hover:border-primary hover:scale-105 cursor-pointer';
            }
          }

          return (
            <button
              key={spot.id}
              disabled={disabled}
              onClick={() => handleHotspotClick(spot.id)}
              title={spot.label || `Zona ${spot.id}`}
              style={{
                position: 'absolute',
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                width: `${spot.radius * 2}%`,
                aspectRatio: '1',
                transform: 'translate(-50%, -50%)',
              }}
              className={`
                rounded-full flex items-center justify-center transition-all duration-200 select-none outline-none
                ${borderStyle}
              `}
            >
              {/* Hotspot indicator/icon */}
              {iconName ? (
                <div className={`p-1 rounded-full ${feedbackColor} flex items-center justify-center shadow-md scale-90`}>
                  <MaterialIcon name={iconName} className="text-xs font-black" />
                </div>
              ) : isSelected && !showFeedback ? (
                <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
              ) : null}

              {/* Tooltip style label for kids, shown on hover if screen reader is not active */}
              {spot.label && !showFeedback && !disabled && (
                <span className="absolute bottom-full mb-2 bg-neutral-900/80 text-white text-[10px] px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-semibold">
                  {spot.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HotspotRenderer;
