// Unused imports removed

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationReport {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  examPreview?: {
    title: string;
    subject: string;
    questionCount: number;
    questionTypes: string[];
    difficulty: string;
    estimatedTime: number;
  };
}

export function validateExamJson(json: unknown): ValidationReport {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  const addError = (path: string, message: string) => {
    errors.push({ path, message, severity: 'error' });
  };

  const addWarning = (path: string, message: string) => {
    warnings.push({ path, message, severity: 'warning' });
  };

  if (!json || typeof json !== 'object') {
    addError('raiz', 'El JSON debe ser un objeto válido.');
    return { isValid: false, errors, warnings };
  }

  const root = json as Record<string, unknown>;

  // 1. Root fields validation
  const requiredRootFields = ['id', 'version', 'metadata', 'settings', 'questions', 'rewards'];
  requiredRootFields.forEach(field => {
    if (root[field] === undefined) {
      addError('raiz', `Falta el campo obligatorio raíz: "${field}"`);
    }
  });

  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  // 2. ID validation
  if (typeof root.id !== 'string' || root.id.trim() === '') {
    addError('id', 'El campo "id" debe ser un texto no vacío.');
  }

  // 3. Metadata validation
  const metadata = root.metadata as Record<string, unknown> || {};
  if (typeof metadata !== 'object') {
    addError('metadata', 'El campo "metadata" debe ser un objeto.');
  } else {
    if (typeof metadata.title !== 'string' || metadata.title.trim() === '') {
      addError('metadata.title', 'El título del examen es obligatorio.');
    }
    if (typeof metadata.subject !== 'string' || metadata.subject.trim() === '') {
      addError('metadata.subject', 'La materia ("subject") es obligatoria.');
    }
    const difficulties = ['easy', 'medium', 'hard', 'expert'];
    if (typeof metadata.difficulty !== 'string' || !difficulties.includes(metadata.difficulty)) {
      addError('metadata.difficulty', 'La dificultad debe ser uno de: easy, medium, hard, expert.');
    }
    if (typeof metadata.estimatedTime !== 'number' || metadata.estimatedTime <= 0) {
      addError('metadata.estimatedTime', 'El tiempo estimado ("estimatedTime") debe ser un número mayor a 0 (minutos).');
    } else if (metadata.estimatedTime > 60) {
      addWarning('metadata.estimatedTime', 'El tiempo estimado es mayor a 60 minutos. ¿Es correcto para niños?');
    }
    if (!metadata.icon || typeof metadata.icon !== 'string') {
      addError('metadata.icon', 'El ícono de Material Symbols ("icon") es obligatorio.');
    }
    if (metadata.ageRange && (!Array.isArray(metadata.ageRange) || metadata.ageRange.length !== 2)) {
      addError('metadata.ageRange', 'El rango de edad ("ageRange") debe ser un arreglo de dos números [edadMin, edadMax].');
    }
  }

  // 4. Settings validation
  const settings = root.settings as Record<string, unknown> || {};
  if (typeof settings !== 'object') {
    addError('settings', 'El campo "settings" debe ser un objeto.');
  } else {
    const booleanSettings = ['shuffleQuestions', 'shuffleOptions', 'allowSkip', 'allowRetry', 'showCorrectAnswer'];
    booleanSettings.forEach(field => {
      if (typeof settings[field] !== 'boolean') {
        addError(`settings.${field}`, `El ajuste "${field}" debe ser un valor de verdadero/falso (boolean).`);
      }
    });

    const showFeedbackOptions = ['immediate', 'end', 'none'];
    if (typeof settings.showFeedback !== 'string' || !showFeedbackOptions.includes(settings.showFeedback)) {
      addError('settings.showFeedback', 'El campo "showFeedback" debe ser uno de: immediate, end, none.');
    }

    if (typeof settings.maxAttempts !== 'number' || settings.maxAttempts < 0) {
      addError('settings.maxAttempts', 'El número máximo de intentos ("maxAttempts") debe ser un número entero >= 0.');
    }

    if (typeof settings.passingScore !== 'number' || settings.passingScore < 0 || settings.passingScore > 100) {
      addError('settings.passingScore', 'La nota de aprobación ("passingScore") debe ser un porcentaje entre 0 y 100.');
    }
  }

  // 5. Rewards validation
  const rewards = root.rewards as Record<string, unknown> || {};
  if (typeof rewards !== 'object') {
    addError('rewards', 'El campo "rewards" debe ser un objeto.');
  } else {
    if (typeof rewards.xpReward !== 'number' || rewards.xpReward <= 0) {
      addError('rewards.xpReward', 'Los puntos de experiencia de recompensa ("xpReward") deben ser un número > 0.');
    }
    const starThresholds = rewards.starThresholds;
    if (!Array.isArray(starThresholds) || starThresholds.length !== 3) {
      addError('rewards.starThresholds', 'Los umbrales de estrellas ("starThresholds") deben ser un arreglo de 3 porcentajes ordenados.');
    } else {
      const isAscending = starThresholds[0] <= starThresholds[1] && starThresholds[1] <= starThresholds[2];
      const inRange = starThresholds.every(t => typeof t === 'number' && t >= 0 && t <= 100);
      if (!isAscending || !inRange) {
        addError('rewards.starThresholds', 'Los umbrales de estrellas deben ser 3 números ordenados de menor a mayor entre 0 y 100.');
      }
    }
  }

  // 6. Questions validation
  const questions = root.questions as unknown[];
  const questionTypesSet = new Set<string>();

  if (!Array.isArray(questions)) {
    addError('questions', 'El campo "questions" debe ser un arreglo de preguntas.');
  } else if (questions.length === 0) {
    addError('questions', 'El examen debe tener al menos una pregunta.');
  } else {
    questions.forEach((q, idx) => {
      validateQuestion(q, `questions[${idx}]`, errors, warnings, questionTypesSet);
    });
  }

  const isValid = errors.length === 0;

  // 7. Preview assembly
  let examPreview: ValidationReport['examPreview'] = undefined;
  if (isValid) {
    const metaObj = root.metadata as any;
    const questArr = root.questions as any[];
    examPreview = {
      title: metaObj.title,
      subject: metaObj.subject,
      questionCount: questArr.length,
      questionTypes: Array.from(questionTypesSet),
      difficulty: metaObj.difficulty,
      estimatedTime: metaObj.estimatedTime,
    };
  }

  return {
    isValid,
    errors,
    warnings,
    examPreview,
  };
}

function validateQuestion(
  qObj: unknown,
  path: string,
  errors: ValidationError[],
  warnings: ValidationError[],
  questionTypesSet: Set<string>
) {
  const addError = (msg: string) => errors.push({ path, message: msg, severity: 'error' });

  if (!qObj || typeof qObj !== 'object') {
    addError('La pregunta debe ser un objeto.');
    return;
  }

  const q = qObj as Record<string, unknown>;

  // Basic Question requirements
  if (typeof q.id !== 'string' || q.id.trim() === '') {
    addError('Falta el ID de la pregunta o está vacío.');
  }
  
  const validTypes = [
    'multiple-choice', 'multiple-select', 'true-false', 'short-answer',
    'fill-blanks', 'matching', 'ordering', 'classify', 'sequence',
    'hotspot', 'audio-question', 'video-question', 'image-question', 'mixed'
  ];
  if (typeof q.type !== 'string' || !validTypes.includes(q.type)) {
    addError(`Tipo de pregunta inválido: "${q.type}". Debe ser uno de: ${validTypes.join(', ')}`);
    return;
  }
  
  questionTypesSet.add(q.type);

  if (typeof q.points !== 'number' || q.points <= 0) {
    addError('Los puntos ("points") deben ser un número mayor a 0.');
  }

  const prompt = q.prompt as Record<string, unknown> || {};
  if (typeof prompt !== 'object' || typeof prompt.text !== 'string' || prompt.text.trim() === '') {
    addError('La pregunta debe tener un texto en prompt ("prompt.text").');
  }

  const feedback = q.feedback as Record<string, unknown> || {};
  if (typeof feedback !== 'object') {
    addError('El campo "feedback" debe ser un objeto.');
  } else {
    if (typeof feedback.correct !== 'string' || feedback.correct.trim() === '') {
      addError('Falta el texto de acierto ("feedback.correct").');
    }
    if (typeof feedback.incorrect !== 'string' || feedback.incorrect.trim() === '') {
      addError('Falta el texto de error ("feedback.incorrect").');
    }
  }

  // Type-specific validations
  switch (q.type) {
    case 'multiple-choice': {
      const options = q.options as Record<string, unknown>[];
      if (!Array.isArray(options) || options.length < 2) {
        addError('La pregunta de opción múltiple debe tener al menos 2 opciones.');
      } else {
        const optionIds = options.map(opt => String(opt.id));
        if (typeof q.correctAnswer !== 'string' || !optionIds.includes(q.correctAnswer)) {
          addError('La respuesta correcta ("correctAnswer") debe ser un ID válido perteneciente a las opciones.');
        }
      }
      break;
    }

    case 'multiple-select': {
      const options = q.options as Record<string, unknown>[];
      if (!Array.isArray(options) || options.length < 2) {
        addError('La pregunta de selección múltiple debe tener al menos 2 opciones.');
      } else {
        const optionIds = options.map(opt => String(opt.id));
        const correctAnswers = q.correctAnswers as string[];
        if (!Array.isArray(correctAnswers) || correctAnswers.length === 0) {
          addError('Debes especificar al menos una respuesta correcta en "correctAnswers".');
        } else {
          correctAnswers.forEach((ans, aIdx) => {
            if (typeof ans !== 'string' || !optionIds.includes(ans)) {
              addError(`La respuesta correcta en el índice ${aIdx} ("${ans}") no coincide con ninguna opción.`);
            }
          });
        }
      }
      break;
    }

    case 'true-false': {
      if (typeof q.correctAnswer !== 'boolean') {
        addError('La respuesta correcta ("correctAnswer") para Verdadero/Falso debe ser de tipo boolean (true/false).');
      }
      if (typeof q.statement !== 'string' || q.statement.trim() === '') {
        addError('La pregunta de Verdadero/Falso debe tener un enunciado a evaluar ("statement").');
      }
      break;
    }

    case 'short-answer': {
      const correctAnswers = q.correctAnswers as string[];
      if (!Array.isArray(correctAnswers) || correctAnswers.length === 0) {
        addError('Debes especificar al menos una respuesta correcta aceptable en "correctAnswers".');
      }
      if (typeof q.caseSensitive !== 'boolean') {
        addError('El ajuste de sensibilidad a mayúsculas/minúsculas ("caseSensitive") debe ser boolean.');
      }
      break;
    }

    case 'fill-blanks': {
      if (typeof q.template !== 'string' || q.template.trim() === '') {
        addError('La plantilla de la oración ("template") es obligatoria.');
      } else {
        const blanks = q.blanks as Record<string, unknown>[];
        if (!Array.isArray(blanks) || blanks.length === 0) {
          addError('Debes especificar al menos un espacio en blanco ("blanks").');
        } else {
          blanks.forEach((blank, bIdx) => {
            const blankPath = `${path}.blanks[${bIdx}]`;
            if (typeof blank.id !== 'string' || blank.id.trim() === '') {
              errors.push({ path: blankPath, message: 'Falta el ID del espacio en blanco.', severity: 'error' });
            }
            if (!Array.isArray(blank.correctAnswers) || blank.correctAnswers.length === 0) {
              errors.push({ path: blankPath, message: 'Falta al menos una respuesta correcta en "correctAnswers".', severity: 'error' });
            }
          });
        }
      }
      break;
    }

    case 'matching': {
      const left = q.leftItems as unknown[];
      const right = q.rightItems as unknown[];
      const pairs = q.correctPairs as [string, string][];

      if (!Array.isArray(left) || left.length === 0) {
        addError('Faltan elementos en la columna izquierda ("leftItems").');
      }
      if (!Array.isArray(right) || right.length === 0) {
        addError('Faltan elementos en la columna derecha ("rightItems").');
      }
      if (!Array.isArray(pairs) || pairs.length === 0) {
        addError('Faltan las parejas correctas de relación ("correctPairs").');
      } else {
        const leftIds = Array.isArray(left) ? left.map(item => String((item as any).id)) : [];
        const rightIds = Array.isArray(right) ? right.map(item => String((item as any).id)) : [];
        pairs.forEach(([lId, rId], pIdx) => {
          if (!leftIds.includes(lId) || !rightIds.includes(rId)) {
            addError(`La pareja en correctPairs[${pIdx}] (${lId} -> ${rId}) tiene un ID que no existe en las columnas.`);
          }
        });
      }
      break;
    }

    case 'ordering': {
      const items = q.items as Record<string, unknown>[];
      const correctOrder = q.correctOrder as string[];

      if (!Array.isArray(items) || items.length < 2) {
        addError('Debe haber al menos 2 elementos a ordenar ("items").');
      }
      if (!Array.isArray(correctOrder) || correctOrder.length !== (items?.length || 0)) {
        addError('El orden correcto ("correctOrder") debe tener la misma cantidad de elementos que "items".');
      } else {
        const itemIds = items.map(item => String(item.id));
        correctOrder.forEach((id, oIdx) => {
          if (!itemIds.includes(id)) {
            addError(`El ID "${id}" en correctOrder[${oIdx}] no existe en la lista de items.`);
          }
        });
      }
      break;
    }

    case 'classify': {
      const categories = q.categories as Record<string, unknown>[];
      const items = q.items as Record<string, unknown>[];
      const correct = q.correctClassification as Record<string, string[]>;

      if (!Array.isArray(categories) || categories.length < 2) {
        addError('Debe haber al menos 2 categorías ("categories").');
      }
      if (!Array.isArray(items) || items.length < 2) {
        addError('Debe haber al menos 2 elementos a clasificar ("items").');
      }
      if (!correct || typeof correct !== 'object') {
        addError('Falta la clasificación correcta ("correctClassification").');
      } else {
        const catIds = Array.isArray(categories) ? categories.map(c => String(c.id)) : [];
        const itemIds = Array.isArray(items) ? items.map(i => String(i.id)) : [];

        Object.entries(correct).forEach(([catId, assignedItemIds]) => {
          if (!catIds.includes(catId)) {
            addError(`La categoría "${catId}" en correctClassification no está definida en "categories".`);
          }
          if (!Array.isArray(assignedItemIds)) {
            addError(`Los elementos para la categoría "${catId}" deben ser un arreglo de IDs.`);
          } else {
            assignedItemIds.forEach(id => {
              if (!itemIds.includes(id)) {
                addError(`El item "${id}" asignado a la categoría "${catId}" no existe en "items".`);
              }
            });
          }
        });
      }
      break;
    }

    case 'sequence': {
      const visible = q.visibleItems as Record<string, unknown>[];
      const options = q.options as Record<string, unknown>[];

      if (!Array.isArray(visible) || visible.length === 0) {
        addError('Faltan elementos visibles de la secuencia ("visibleItems").');
      }
      if (!Array.isArray(options) || options.length < 2) {
        addError('Debe haber al menos 2 opciones de respuesta ("options").');
      }
      if (typeof q.missingPosition !== 'number' || q.missingPosition < 0) {
        addError('Falta la posición faltante en la secuencia ("missingPosition").');
      }
      const optionIds = Array.isArray(options) ? options.map(o => String(o.id)) : [];
      if (typeof q.correctNext !== 'string' || !optionIds.includes(q.correctNext)) {
        addError('El siguiente elemento correcto ("correctNext") debe ser un ID que exista en "options".');
      }
      break;
    }

    case 'hotspot': {
      if (typeof q.backgroundImage !== 'string' || q.backgroundImage.trim() === '') {
        addError('Falta la imagen de fondo ("backgroundImage") para el hotspot.');
      }
      const hotspots = q.hotspots as Record<string, unknown>[];
      const correctHotspots = q.correctHotspots as string[];

      if (!Array.isArray(hotspots) || hotspots.length === 0) {
        addError('Debe haber al menos una zona definida ("hotspots").');
      } else {
        hotspots.forEach((h, hIdx) => {
          const hPath = `${path}.hotspots[${hIdx}]`;
          if (typeof h.id !== 'string' || h.id.trim() === '') {
            errors.push({ path: hPath, message: 'Falta el ID del hotspot.', severity: 'error' });
          }
          if (typeof h.x !== 'number' || h.x < 0 || h.x > 100) {
            errors.push({ path: hPath, message: 'La coordenada X del hotspot debe ser un porcentaje (0-100).', severity: 'error' });
          }
          if (typeof h.y !== 'number' || h.y < 0 || h.y > 100) {
            errors.push({ path: hPath, message: 'La coordenada Y del hotspot debe ser un porcentaje (0-100).', severity: 'error' });
          }
          if (typeof h.radius !== 'number' || h.radius <= 0) {
            errors.push({ path: hPath, message: 'El radio ("radius") del hotspot debe ser mayor a 0.', severity: 'error' });
          }
        });
      }

      if (!Array.isArray(correctHotspots) || correctHotspots.length === 0) {
        addError('Debes especificar al menos un hotspot correcto en "correctHotspots".');
      } else {
        const spotIds = Array.isArray(hotspots) ? hotspots.map(h => String(h.id)) : [];
        correctHotspots.forEach(id => {
          if (!spotIds.includes(id)) {
            addError(`El hotspot correcto "${id}" no existe en "hotspots".`);
          }
        });
      }
      break;
    }

    case 'audio-question': {
      if (typeof q.audioUrl !== 'string' || q.audioUrl.trim() === '') {
        addError('Falta la URL de audio ("audioUrl").');
      }
      if (!q.innerQuestion) {
        addError('Falta la pregunta interna ("innerQuestion").');
      } else {
        validateQuestion(q.innerQuestion, `${path}.innerQuestion`, errors, warnings, questionTypesSet);
      }
      break;
    }

    case 'video-question': {
      if (typeof q.videoUrl !== 'string' || q.videoUrl.trim() === '') {
        addError('Falta la URL de video ("videoUrl").');
      }
      if (!q.innerQuestion) {
        addError('Falta la pregunta interna ("innerQuestion").');
      } else {
        validateQuestion(q.innerQuestion, `${path}.innerQuestion`, errors, warnings, questionTypesSet);
      }
      break;
    }

    case 'image-question': {
      if (typeof q.imageUrl !== 'string' || q.imageUrl.trim() === '') {
        addError('Falta la URL de la imagen ("imageUrl").');
      }
      if (!q.innerQuestion) {
        addError('Falta la pregunta interna ("innerQuestion").');
      } else {
        validateQuestion(q.innerQuestion, `${path}.innerQuestion`, errors, warnings, questionTypesSet);
      }
      break;
    }

    case 'mixed': {
      const sections = q.sections as Record<string, unknown>[];
      if (!Array.isArray(sections) || sections.length === 0) {
        addError('La pregunta mixta debe tener al menos una sección en "sections".');
      } else {
        sections.forEach((sec, sIdx) => {
          const sPath = `${path}.sections[${sIdx}]`;
          const validSecTypes = ['text', 'image', 'drag-drop', 'input', 'select'];
          if (typeof sec.type !== 'string' || !validSecTypes.includes(sec.type)) {
            errors.push({ path: sPath, message: `Tipo de sección mixta inválido: "${sec.type}". Debe ser uno de: ${validSecTypes.join(', ')}`, severity: 'error' });
          }
          if (sec.type === 'select') {
            if (!Array.isArray(sec.options) || sec.options.length < 2) {
              errors.push({ path: sPath, message: 'La sección de tipo select debe tener opciones en "options".', severity: 'error' });
            }
            if (!sec.correctAnswer) {
              errors.push({ path: sPath, message: 'La sección de tipo select debe tener una respuesta correcta en "correctAnswer".', severity: 'error' });
            }
          }
          if (sec.type === 'input' && !sec.correctAnswer) {
            errors.push({ path: sPath, message: 'La sección de tipo input debe tener una respuesta correcta en "correctAnswer".', severity: 'error' });
          }
          if (sec.type === 'drag-drop') {
            if (!Array.isArray(sec.dragItems) || sec.dragItems.length === 0) {
              errors.push({ path: sPath, message: 'La sección de arrastre debe tener items en "dragItems".', severity: 'error' });
            }
            if (!sec.correctAnswer) {
              errors.push({ path: sPath, message: 'La sección de arrastre debe tener un elemento correcto en "correctAnswer".', severity: 'error' });
            }
          }
        });
      }
      break;
    }
  }
}
