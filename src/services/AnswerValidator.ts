import type {
  Question,
  QuestionType,
  MultipleChoiceQuestion,
  MultipleSelectQuestion,
  TrueFalseQuestion,
  ShortAnswerQuestion,
  FillBlanksQuestion,
  MatchingQuestion,
  OrderingQuestion,
  ClassifyQuestion,
  SequenceQuestion,
  HotspotQuestion,
  AudioQuestion,
  VideoQuestion,
  ImageQuestion,
} from '../models/question-types';

export interface ValidationResult {
  isCorrect: boolean;
  isPartial: boolean;
  pointsEarned: number;
  details?: string;
}

type ValidatorFn = (question: Question, answer: unknown) => ValidationResult;

const validators: Record<QuestionType, ValidatorFn> = {
  'multiple-choice': (q, a) => {
    const question = q as MultipleChoiceQuestion;
    const isCorrect = a === question.correctAnswer;
    return { isCorrect, isPartial: false, pointsEarned: isCorrect ? q.points : 0 };
  },

  'multiple-select': (q, a) => {
    const question = q as MultipleSelectQuestion;
    const selected = (a as string[]) || [];
    const correct = question.correctAnswers || [];
    
    if (selected.length === 0) {
      return { isCorrect: false, isPartial: false, pointsEarned: 0 };
    }

    const incorrectSelections = selected.filter(s => !correct.includes(s));
    const correctSelections = selected.filter(s => correct.includes(s));

    const isCorrect = incorrectSelections.length === 0 && correctSelections.length === correct.length;
    const isPartial = !isCorrect && correctSelections.length > 0 && incorrectSelections.length === 0;

    let pointsEarned = 0;
    if (isCorrect) {
      pointsEarned = q.points;
    } else if (isPartial) {
      pointsEarned = Math.floor(q.points * (correctSelections.length / correct.length));
    }

    return { isCorrect, isPartial, pointsEarned };
  },

  'true-false': (q, a) => {
    const question = q as TrueFalseQuestion;
    const isCorrect = a === question.correctAnswer;
    return { isCorrect, isPartial: false, pointsEarned: isCorrect ? q.points : 0 };
  },

  'short-answer': (q, a) => {
    const question = q as ShortAnswerQuestion;
    const text = (a as string || '').trim();
    const correctAnswers = question.correctAnswers || [];
    
    const isCorrect = correctAnswers.some(ans => {
      if (question.caseSensitive) {
        return text === ans.trim();
      } else {
        return text.toLowerCase() === ans.trim().toLowerCase();
      }
    });

    return { isCorrect, isPartial: false, pointsEarned: isCorrect ? q.points : 0 };
  },

  'fill-blanks': (q, a) => {
    const question = q as FillBlanksQuestion;
    const answersMap = (a as Record<string, string>) || {};
    let correctCount = 0;
    const totalBlanks = question.blanks.length;

    question.blanks.forEach(blank => {
      const val = (answersMap[blank.id] || '').trim();
      const isBlankCorrect = blank.correctAnswers.some(ans => 
        val.toLowerCase() === ans.trim().toLowerCase()
      );
      if (isBlankCorrect) {
        correctCount++;
      }
    });

    const isCorrect = correctCount === totalBlanks;
    const isPartial = correctCount > 0 && !isCorrect;
    const pointsEarned = isCorrect ? q.points : isPartial ? Math.floor(q.points * (correctCount / totalBlanks)) : 0;

    return { isCorrect, isPartial, pointsEarned };
  },

  'matching': (q, a) => {
    const question = q as MatchingQuestion;
    const pairs = (a as Record<string, string>) || {}; // leftId -> rightId
    let correctCount = 0;
    const totalPairs = question.correctPairs.length;

    question.correctPairs.forEach(([leftId, rightId]) => {
      if (pairs[leftId] === rightId) {
        correctCount++;
      }
    });

    const isCorrect = correctCount === totalPairs;
    const isPartial = correctCount > 0 && !isCorrect;
    const pointsEarned = isCorrect ? q.points : isPartial ? Math.floor(q.points * (correctCount / totalPairs)) : 0;

    return { isCorrect, isPartial, pointsEarned };
  },

  'ordering': (q, a) => {
    const question = q as OrderingQuestion;
    const order = (a as string[]) || [];
    
    // Check item lengths match
    if (order.length !== question.correctOrder.length) {
      return { isCorrect: false, isPartial: false, pointsEarned: 0 };
    }

    const isCorrect = JSON.stringify(order) === JSON.stringify(question.correctOrder);
    return { isCorrect, isPartial: false, pointsEarned: isCorrect ? q.points : 0 };
  },

  'classify': (q, a) => {
    const question = q as ClassifyQuestion;
    const classification = (a as Record<string, string[]>) || {}; // categoryId -> itemIds[]
    let correctCount = 0;
    const totalItems = question.items.length;

    question.items.forEach(item => {
      // Find correct category for this item
      let correctCatId = '';
      Object.entries(question.correctClassification).forEach(([catId, itemIds]) => {
        if (itemIds.includes(item.id)) {
          correctCatId = catId;
        }
      });

      // Check if user placed this item in correct category
      const userCatItems = classification[correctCatId] || [];
      if (userCatItems.includes(item.id)) {
        correctCount++;
      }
    });

    const isCorrect = correctCount === totalItems;
    const isPartial = correctCount > 0 && !isCorrect;
    const pointsEarned = isCorrect ? q.points : isPartial ? Math.floor(q.points * (correctCount / totalItems)) : 0;

    return { isCorrect, isPartial, pointsEarned };
  },

  'sequence': (q, a) => {
    const question = q as SequenceQuestion;
    const isCorrect = a === question.correctNext;
    return { isCorrect, isPartial: false, pointsEarned: isCorrect ? q.points : 0 };
  },

  'hotspot': (q, a) => {
    const question = q as HotspotQuestion;
    const selected = (a as string[]) || [];
    const correct = question.correctHotspots || [];

    if (selected.length === 0) {
      return { isCorrect: false, isPartial: false, pointsEarned: 0 };
    }

    const incorrectSelections = selected.filter(s => !correct.includes(s));
    const correctSelections = selected.filter(s => correct.includes(s));

    const isCorrect = incorrectSelections.length === 0 && correctSelections.length === correct.length;
    const isPartial = !isCorrect && correctSelections.length > 0 && incorrectSelections.length === 0;

    let pointsEarned = 0;
    if (isCorrect) {
      pointsEarned = q.points;
    } else if (isPartial) {
      pointsEarned = Math.floor(q.points * (correctSelections.length / correct.length));
    }

    return { isCorrect, isPartial, pointsEarned };
  },

  'audio-question': (q, a) => {
    const question = q as AudioQuestion;
    return validateAnswer(question.innerQuestion, a);
  },

  'video-question': (q, a) => {
    const question = q as VideoQuestion;
    return validateAnswer(question.innerQuestion, a);
  },

  'image-question': (q, a) => {
    const question = q as ImageQuestion;
    return validateAnswer(question.innerQuestion, a);
  },

  'mixed': (q, a) => {
    // Mixed questions evaluate an array/object of answers matching sections
    // For simplicity: a is Record<number, unknown> (sectionIndex -> answer)
    // We check if all drop-down or input answers match their correctAnswer
    // sections may contain answers at specific indices
    // Let's implement a clean evaluator
    // If not supported yet in standard renderers, we return points or correct
    const question = q as any;
    const answers = (a as Record<number, unknown>) || {};
    let correctSections = 0;
    let totalScoredSections = 0;

    question.sections.forEach((section: any, idx: number) => {
      if (section.correctAnswer) {
        totalScoredSections++;
        const userAns = answers[idx];
        
        let sectionCorrect = false;
        if (Array.isArray(section.correctAnswer)) {
          // Can match any correct answer
          sectionCorrect = section.correctAnswer.includes(userAns);
        } else {
          sectionCorrect = String(userAns).trim().toLowerCase() === String(section.correctAnswer).trim().toLowerCase();
        }
        
        if (sectionCorrect) {
          correctSections++;
        }
      }
    });

    if (totalScoredSections === 0) {
      return { isCorrect: true, isPartial: false, pointsEarned: q.points };
    }

    const isCorrect = correctSections === totalScoredSections;
    const isPartial = correctSections > 0 && !isCorrect;
    const pointsEarned = isCorrect ? q.points : isPartial ? Math.floor(q.points * (correctSections / totalScoredSections)) : 0;

    return { isCorrect, isPartial, pointsEarned };
  },
};

export function validateAnswer(question: Question, answer: unknown): ValidationResult {
  const validator = validators[question.type];
  if (!validator) {
    throw new Error(`No validator registered for question type: ${question.type}`);
  }
  return validator(question, answer);
}
