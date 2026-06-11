import React from 'react';
import { getRenderer } from '../renderers';
import type { QuestionRendererProps } from '../renderers';

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question, ...props }) => {
  const Renderer = getRenderer(question.type);
  return <Renderer question={question} {...props} />;
};

export default QuestionRenderer;
