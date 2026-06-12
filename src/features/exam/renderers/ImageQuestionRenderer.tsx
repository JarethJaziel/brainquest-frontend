import React, { useState } from 'react';
import type { ImageQuestion } from '../../../models/question-types';
import type { QuestionRendererProps } from './index';
import QuestionRenderer from '../components/QuestionRenderer';
import MaterialIcon from '../../../components/ui/MaterialIcon';

export const ImageQuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  selectedAnswer,
  disabled,
  showFeedback,
}) => {
  const q = question as ImageQuestion;
  const [isZoomed, setIsZoomed] = useState(false);

  const toggleZoom = () => {
    if (disabled && !isZoomed) return;
    setIsZoomed(prev => !prev);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Main Image View */}
      <div className="relative w-full max-w-xl mx-auto rounded-3xl overflow-hidden border-4 border-solid border-outline-variant bg-surface-container-low clay-card shadow-md group">
        <img
          src={q.imageUrl}
          alt="Observa detenidamente"
          loading="eager"
          className="w-full max-h-72 sm:max-h-96 object-contain block mx-auto cursor-pointer"
          onClick={q.zoomable ? toggleZoom : undefined}
        />

        {/* Zoom Floating Action Button */}
        {q.zoomable && (
          <button
            type="button"
            onClick={toggleZoom}
            className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/95 hover:bg-white border-2 border-solid border-outline-variant flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 text-outline hover:text-primary"
            title="Ampliar imagen"
          >
            <MaterialIcon name="zoom_in" className="text-xl font-black" />
          </button>
        )}
      </div>

      {/* Fullscreen Zoom Modal */}
      {isZoomed && q.zoomable && (
        <div 
          onClick={toggleZoom}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out select-none animate-fade-in"
        >
          {/* Close Button */}
          <button
            onClick={toggleZoom}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
          >
            <MaterialIcon name="close" className="text-2xl" />
          </button>

          {/* Large Image */}
          <img
            src={q.imageUrl}
            alt="Imagen ampliada"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-scale-in"
          />
        </div>
      )}

      {/* Divider and Inner Question */}
      <div className="border-t-2 border-dashed border-outline-variant/60 pt-6 mt-4 flex flex-col gap-4 text-left">
        {q.innerQuestion.prompt && (
          <h3 className="text-lg font-black text-on-surface">
            {q.innerQuestion.prompt.text}
          </h3>
        )}
        <QuestionRenderer
          question={q.innerQuestion}
          onAnswer={onAnswer}
          selectedAnswer={selectedAnswer}
          disabled={disabled}
          showFeedback={showFeedback}
        />
      </div>
    </div>
  );
};

export default ImageQuestionRenderer;
