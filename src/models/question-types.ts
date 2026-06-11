// ===== QUESTION TYPE SYSTEM =====
import type { Difficulty } from './exam';

// Enum de todos los tipos soportados
export type QuestionType =
  | 'multiple-choice'
  | 'multiple-select'
  | 'true-false'
  | 'short-answer'
  | 'fill-blanks'
  | 'matching'
  | 'ordering'
  | 'classify'
  | 'sequence'
  | 'hotspot'
  | 'audio-question'
  | 'video-question'
  | 'image-question'
  | 'mixed';

// Base compartida por todas las preguntas
export interface QuestionBase {
  id: string;
  type: QuestionType;
  prompt: QuestionPrompt;
  difficulty: Difficulty;
  points: number;
  timeLimit?: number;                 // override por pregunta
  hint?: string;
  explanation?: string;               // explicación post-respuesta
  feedback: {
    correct: string;
    incorrect: string;
    partial?: string;
  };
  media?: MediaAttachment[];
  tags?: string[];
}

export interface QuestionPrompt {
  text: string;
  image?: string;
  audio?: string;
  video?: string;
}

export interface MediaAttachment {
  type: 'image' | 'audio' | 'video';
  url: string;
  alt?: string;
  caption?: string;
}

// ===== TIPOS ESPECÍFICOS =====

// Opción múltiple (una respuesta)
export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'multiple-choice';
  options: ChoiceOption[];
  correctAnswer: string;             // id de la opción correcta
}

// Opción múltiple (varias respuestas)
export interface MultipleSelectQuestion extends QuestionBase {
  type: 'multiple-select';
  options: ChoiceOption[];
  correctAnswers: string[];          // ids de las opciones correctas
  minSelections?: number;
  maxSelections?: number;
}

export interface ChoiceOption {
  id: string;
  text: string;
  image?: string;
  color?: string;                    // color de borde del mockup
}

// Verdadero/Falso
export interface TrueFalseQuestion extends QuestionBase {
  type: 'true-false';
  correctAnswer: boolean;
  statement: string;                 // enunciado a evaluar
}

// Respuesta corta
export interface ShortAnswerQuestion extends QuestionBase {
  type: 'short-answer';
  correctAnswers: string[];          // múltiples respuestas aceptables
  caseSensitive: boolean;
  maxLength: number;
  placeholder?: string;
}

// Completar espacios
export interface FillBlanksQuestion extends QuestionBase {
  type: 'fill-blanks';
  template: string;                  // "El {{1}} es un {{2}}"
  blanks: FillBlank[];
}

export interface FillBlank {
  id: string;
  correctAnswers: string[];          // variantes aceptables
  hint?: string;
}

// Relacionar elementos (matching)
export interface MatchingQuestion extends QuestionBase {
  type: 'matching';
  leftItems: MatchItem[];
  rightItems: MatchItem[];
  correctPairs: [string, string][];  // [leftId, rightId]
}

export interface MatchItem {
  id: string;
  text?: string;
  image?: string;
}

// Ordenar elementos (drag & drop)
export interface OrderingQuestion extends QuestionBase {
  type: 'ordering';
  items: OrderItem[];
  correctOrder: string[];            // ids en orden correcto
}

export interface OrderItem {
  id: string;
  text: string;
  image?: string;
}

// Clasificar en categorías (drag & drop)
export interface ClassifyQuestion extends QuestionBase {
  type: 'classify';
  categories: Category[];
  items: ClassifyItem[];
  correctClassification: Record<string, string[]>; // categoryId → itemIds[]
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface ClassifyItem {
  id: string;
  text: string;
  image?: string;
}

// Secuencia lógica
export interface SequenceQuestion extends QuestionBase {
  type: 'sequence';
  visibleItems: SequenceItem[];      // elementos visibles de la secuencia
  options: SequenceItem[];           // opciones para completar
  correctNext: string;               // id del siguiente en la secuencia
  missingPosition: number;           // índice del elemento faltante
}

export interface SequenceItem {
  id: string;
  value: string | number;
  image?: string;
}

// Hotspot (selección sobre imagen)
export interface HotspotQuestion extends QuestionBase {
  type: 'hotspot';
  backgroundImage: string;
  hotspots: Hotspot[];
  correctHotspots: string[];         // ids de hotspots correctos
  multiSelect: boolean;
}

export interface Hotspot {
  id: string;
  x: number;                         // porcentaje (0-100)
  y: number;                         // porcentaje (0-100)
  radius: number;                    // radio del área clickeable
  label?: string;
}

// Preguntas con multimedia (audio/video/imagen)
export interface AudioQuestion extends QuestionBase {
  type: 'audio-question';
  audioUrl: string;
  autoPlay: boolean;
  maxPlays?: number;
  innerQuestion: MultipleChoiceQuestion | ShortAnswerQuestion | TrueFalseQuestion;
}

export interface VideoQuestion extends QuestionBase {
  type: 'video-question';
  videoUrl: string;
  autoPlay: boolean;
  pauseAt?: number;                  // segundo donde pausar para preguntar
  innerQuestion: MultipleChoiceQuestion | ShortAnswerQuestion | TrueFalseQuestion;
}

export interface ImageQuestion extends QuestionBase {
  type: 'image-question';
  imageUrl: string;
  zoomable: boolean;
  innerQuestion: MultipleChoiceQuestion | ShortAnswerQuestion | TrueFalseQuestion;
}

// Pregunta mixta
export interface MixedQuestion extends QuestionBase {
  type: 'mixed';
  sections: MixedSection[];
}

export interface MixedSection {
  type: 'text' | 'image' | 'drag-drop' | 'input' | 'select';
  content: string;
  options?: ChoiceOption[];
  correctAnswer?: string | string[];
  dragItems?: OrderItem[];
  dropZones?: { id: string; label: string }[];
}

// Union type de todas las preguntas
export type Question =
  | MultipleChoiceQuestion
  | MultipleSelectQuestion
  | TrueFalseQuestion
  | ShortAnswerQuestion
  | FillBlanksQuestion
  | MatchingQuestion
  | OrderingQuestion
  | ClassifyQuestion
  | SequenceQuestion
  | HotspotQuestion
  | AudioQuestion
  | VideoQuestion
  | ImageQuestion
  | MixedQuestion;
