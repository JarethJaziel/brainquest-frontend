import type { ComponentType } from 'react';
import type { Question, QuestionType } from '../../../models/question-types';

export interface QuestionRendererProps {
  question: Question;
  onAnswer: (answer: any) => void;
  selectedAnswer: any;
  disabled: boolean;
  showFeedback: boolean;
}

const rendererRegistry = new Map<QuestionType, ComponentType<QuestionRendererProps>>();

export function registerRenderer(
  type: QuestionType,
  component: ComponentType<QuestionRendererProps>
) {
  rendererRegistry.set(type, component);
}

export function getRenderer(type: QuestionType): ComponentType<QuestionRendererProps> {
  const renderer = rendererRegistry.get(type);
  if (!renderer) {
    throw new Error(`No renderer registered for question type: ${type}`);
  }
  return renderer;
}

// Import renderers
import { MultipleChoiceRenderer } from './MultipleChoiceRenderer';
import { TrueFalseRenderer } from './TrueFalseRenderer';
import { ShortAnswerRenderer } from './ShortAnswerRenderer';
import { FillBlanksRenderer } from './FillBlanksRenderer';
import { MatchingRenderer } from './MatchingRenderer';
import { OrderingRenderer } from './OrderingRenderer';
import { ClassifyRenderer } from './ClassifyRenderer';
import { SequenceRenderer } from './SequenceRenderer';
import { MultipleSelectRenderer } from './MultipleSelectRenderer';
import { HotspotRenderer } from './HotspotRenderer';
import { AudioQuestionRenderer } from './AudioQuestionRenderer';
import { VideoQuestionRenderer } from './VideoQuestionRenderer';
import { ImageQuestionRenderer } from './ImageQuestionRenderer';
import { MixedRenderer } from './MixedRenderer';

// Register renderers
registerRenderer('multiple-choice', MultipleChoiceRenderer);
registerRenderer('true-false', TrueFalseRenderer);
registerRenderer('short-answer', ShortAnswerRenderer);
registerRenderer('fill-blanks', FillBlanksRenderer);
registerRenderer('matching', MatchingRenderer);
registerRenderer('ordering', OrderingRenderer);
registerRenderer('classify', ClassifyRenderer);
registerRenderer('sequence', SequenceRenderer);
registerRenderer('multiple-select', MultipleSelectRenderer);
registerRenderer('hotspot', HotspotRenderer);
registerRenderer('audio-question', AudioQuestionRenderer);
registerRenderer('video-question', VideoQuestionRenderer);
registerRenderer('image-question', ImageQuestionRenderer);
registerRenderer('mixed', MixedRenderer);
