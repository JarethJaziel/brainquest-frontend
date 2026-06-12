# BrainQuest — Plataforma de Exámenes Interactivos - Jareth Moo

Plataforma educativa autohospedada e interactiva diseñada para niños. La aplicación interpreta archivos JSON dinámicamente para generar exámenes con dinámicas de gamificación (estrellas, XP, rachas, logros y avatares). Está construida en el frontend utilizando **React + TypeScript + Tailwind CSS v4 + Vite**. Backend proximamente...

---

## 🚀 Instalación y Ejecución

El proyecto utiliza `pnpm` como gestor de paquetes.

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Compilar para producción (genera carpeta /dist)
pnpm build
```

---

## 📥 Mecánica de Exámenes Dinámicos (JSON)

La filosofía del proyecto es que el código no almacena las preguntas; React se encarga exclusivamente de interpretar y renderizar los archivos JSON.

Puedes crear tus propios exámenes escribiendo un archivo `.json` y cargándolo desde la pestaña **Importar** de la aplicación. El validador integrado analizará la estructura y te dará un reporte en tiempo real de errores y advertencias antes de guardarlo en la base de datos local (`localStorage`).

---

## 📐 Estructura General del JSON de Examen

Un archivo de examen válido debe ser un objeto JSON con los siguientes campos raíz obligatorios:

```json
{
  "id": "mi-examen-unico",
  "version": "1.0",
  "metadata": { ... },
  "settings": { ... },
  "rewards": { ... },
  "questions": [ ... ]
}
```

### 1. `metadata` (Objeto)

Contiene la información de presentación del examen.

- `title` (string): Título de la aventura.
- `description` (string): Breve descripción motivadora.
- `subject` (string): Materia del examen (ej: "Matemáticas", "Ciencias", "Lectura").
- `category` (string): Subcategoría (ej: "aritmética", "biología").
- `icon` (string): Nombre del ícono de Material Symbols (ej: `calculate`, `pets`, `auto_stories`, `public`).
- `difficulty` (string): `"easy"` | `"medium"` | `"hard"` | `"expert"`.
- `estimatedTime` (number): Tiempo estimado para completar en minutos.
- `tags` (array de strings): Etiquetas clave (ej: `["sumas", "numeros"]`).
- `ageRange` (array de 2 números): Rango de edad recomendado `[edadMin, edadMax]` (ej: `[6, 9]`).

### 2. `settings` (Objeto)

Define los ajustes de control y comportamiento del examen.

- `shuffleQuestions` (boolean): Mezclar el orden de las preguntas al jugar.
- `shuffleOptions` (boolean): Mezclar las opciones dentro de preguntas de opción múltiple.
- `showFeedback` (string): `"immediate"` (evalúa e indica respuesta correcta al instante) | `"end"` (evalúa al finalizar el examen) | `"none"`.
- `allowSkip` (boolean): Habilitar botón para saltar la pregunta.
- `allowRetry` (boolean): Permitir volver a intentar al fallar.
- `maxAttempts` (number): Número máximo de intentos permitidos (0 para ilimitados).
- `passingScore` (number): Porcentaje de aciertos necesario para aprobar (0 a 100).
- `showCorrectAnswer` (boolean): Mostrar la respuesta correcta en el banner de retroalimentación si se falla.
- `timeLimit` (number, opcional): Límite de tiempo total en segundos para completar el examen.

### 4. `rewards` (Objeto)

Define la experiencia que ganará el niño.

- `xpReward` (number): Experiencia base otorgada por completar el examen.
- `starThresholds` (array de 3 números): Porcentajes de acierto mínimos ordenados de menor a mayor para conseguir 1, 2 y 3 estrellas (ej: `[60, 80, 95]`).

---

## 📝 Especificación de Preguntas (`questions`)

Cada elemento del arreglo `questions` es un objeto que comparte la siguiente base:

```typescript
interface QuestionBase {
  id: string; // Identificador único
  type: QuestionType; // Uno de los 14 tipos
  prompt: {
    text: string; // Pregunta o enunciado principal
    image?: string; // URL de imagen complementaria (opcional)
    audio?: string; // URL de audio complementario (opcional)
    video?: string; // URL de video complementario (opcional)
  };
  difficulty: "easy" | "medium" | "hard" | "expert";
  points: number; // Puntos otorgados al contestarla bien
  hint?: string; // Pista opcional
  explanation?: string; // Explicación opcional mostrada post-respuesta
  feedback: {
    correct: string; // Mensaje de éxito alegre en español
    incorrect: string; // Mensaje de error motivador en español
    partial?: string; // Mensaje para aciertos parciales (opcional)
  };
}
```

A continuación se detalla cómo escribir las propiedades específicas para cada uno de los **14 tipos de preguntas**:

---

### 1. Opción Múltiple (`multiple-choice`)

Una única respuesta correcta seleccionable entre varios botones chunky.

- `options` (array): Mínimo 2 opciones. Cada una con `id` (string), `text` (string), `image` (URL, opcional) y `color` (estilo visual del botón: `"primary"` | `"secondary"` | `"tertiary"` | `"outline"` | `"accent"`).
- `correctAnswer` (string): El `id` de la opción correcta.

```json
{
  "id": "q1",
  "type": "multiple-choice",
  "prompt": { "text": "¿Cuál es la capital de España?" },
  "difficulty": "easy",
  "points": 10,
  "feedback": {
    "correct": "¡Correcto! Madrid es precioso.",
    "incorrect": "No, recuerda que está en el centro del país."
  },
  "options": [
    { "id": "a", "text": "Barcelona", "color": "outline" },
    { "id": "b", "text": "Madrid", "color": "primary" },
    { "id": "c", "text": "Sevilla", "color": "secondary" }
  ],
  "correctAnswer": "b"
}
```

---

### 2. Selección Múltiple (`multiple-select`)

Varias respuestas correctas seleccionables mediante casilleros (checkboxes).

- `options` (array): Mínimo 2 opciones estructuradas como en `multiple-choice`.
- `correctAnswers` (array de strings): Lista de los `id` de todas las opciones correctas.
- `minSelections` (number, opcional): Número mínimo de casilleros que debe marcar el niño.
- `maxSelections` (number, opcional): Límite máximo de casilleros seleccionables.

```json
{
  "id": "q2",
  "type": "multiple-select",
  "prompt": { "text": "¿Cuáles de estos animales son insectos?" },
  "difficulty": "medium",
  "points": 15,
  "feedback": {
    "correct": "¡Perfecto! Encontraste los bichitos.",
    "incorrect": "Revisa los que tienen 6 patas."
  },
  "options": [
    { "id": "a", "text": "Hormiga", "color": "primary" },
    { "id": "b", "text": "Perro", "color": "outline" },
    { "id": "c", "text": "Mariposa", "color": "secondary" },
    { "id": "d", "text": "Araña", "color": "outline" }
  ],
  "correctAnswers": ["a", "c"],
  "minSelections": 2,
  "maxSelections": 2
}
```

---

### 3. Verdadero o Falso (`true-false`)

Evaluación directa de un enunciado con dos botones interactivos.

- `statement` (string): La afirmación a evaluar.
- `correctAnswer` (boolean): `true` o `false`.

```json
{
  "id": "q3",
  "type": "true-false",
  "prompt": { "text": "Responde con Verdadero o Falso:" },
  "difficulty": "easy",
  "points": 10,
  "feedback": {
    "correct": "¡Bien! Los pingüinos no pueden volar.",
    "incorrect": "Recuerda que sus alas actúan como aletas para nadar."
  },
  "statement": "Los pingüinos son aves que vuelan muy alto.",
  "correctAnswer": false
}
```

---

### 4. Respuesta Corta (`short-answer`)

El niño escribe su respuesta en un casillero de texto.

- `correctAnswers` (array de strings): Lista de términos válidos que se consideran correctos (para admitir sinónimos o variaciones).
- `caseSensitive` (boolean): Si se deben diferenciar las mayúsculas de minúsculas.
- `maxLength` (number): Longitud máxima de caracteres en el input.
- `placeholder` (string, opcional): Texto de guía en el input.

```json
{
  "id": "q4",
  "type": "short-answer",
  "prompt": { "text": "¿Cómo se llama nuestro planeta?" },
  "difficulty": "easy",
  "points": 10,
  "feedback": {
    "correct": "¡Estupendo! Vivimos en la Tierra.",
    "incorrect": "Pista: empieza con T."
  },
  "correctAnswers": ["Tierra", "planeta tierra", "la tierra"],
  "caseSensitive": false,
  "maxLength": 20
}
```

---

### 5. Completar Espacios (`fill-blanks`)

Oraciones donde faltan palabras y se completan en campos vacíos integrados.

- `template` (string): La oración usando marcadores de formato `{{1}}`, `{{2}}`, etc.
- `blanks` (array): Lista que define cada espacio. Cada uno debe tener `id` (string, debe coincidir con el marcador `{{id}}`) y `correctAnswers` (array de strings con respuestas válidas).

```json
{
  "id": "q5",
  "type": "fill-blanks",
  "prompt": { "text": "Completa los espacios de la oración:" },
  "difficulty": "medium",
  "points": 15,
  "feedback": {
    "correct": "¡Qué buena ortografía!",
    "incorrect": "Revisa los colores del semáforo."
  },
  "template": "El color {{1}} significa detenerse y el {{2}} significa avanzar.",
  "blanks": [
    { "id": "1", "correctAnswers": ["rojo", "el rojo"] },
    { "id": "2", "correctAnswers": ["verde", "el verde"] }
  ]
}
```

---

### 6. Relacionar Elementos (`matching`)

Asociar elementos de la columna izquierda con la derecha dibujando líneas.

- `leftItems` (array): Elementos de la columna izquierda con `id` y `text`/`image`.
- `rightItems` (array): Elementos de la columna derecha con `id` y `text`/`image`.
- `correctPairs` (array de tuplas `[string, string]`): Parejas válidas formadas por `[idIzquierda, idDerecha]`.

```json
{
  "id": "q6",
  "type": "matching",
  "prompt": { "text": "Une cada país con su bandera:" },
  "difficulty": "medium",
  "points": 20,
  "leftItems": [
    { "id": "mex", "text": "México" },
    { "id": "fra", "text": "Francia" }
  ],
  "rightItems": [
    { "id": "band1", "text": "Verde, Blanco y Rojo" },
    { "id": "band2", "text": "Azul, Blanco y Rojo" }
  ],
  "correctPairs": [
    ["mex", "band1"],
    ["fra", "band2"]
  ]
}
```

---

### 7. Ordenar Elementos (`ordering`)

Ordenar una lista desordenada arrastrando las fichas hacia arriba o abajo.

- `items` (array): Elementos a ordenar con `id` (string), `text` (string) e `image` (opcional).
- `correctOrder` (array de strings): Los `id` ordenados en la secuencia correcta de principio a fin.

```json
{
  "id": "q7",
  "type": "ordering",
  "prompt": {
    "text": "Ordena el ciclo de vida de la mariposa desde el inicio:"
  },
  "difficulty": "hard",
  "points": 20,
  "items": [
    { "id": "pupa", "text": "Pupa o Crisálida" },
    { "id": "huevo", "text": "Huevo" },
    { "id": "adulto", "text": "Mariposa Adulta" },
    { "id": "oruga", "text": "Oruga" }
  ],
  "correctOrder": ["huevo", "oruga", "pupa", "adulto"]
}
```

---

### 8. Clasificar Elementos (`classify`)

Arrastrar y soltar elementos desordenados dentro de baldes o categorías grandes.

- `categories` (array): Los grupos destino con `id`, `name`, `color` (clases Tailwind opcionales) e `icon`.
- `items` (array): Las tarjetas flotantes con `id`, `text` e `image` (opcional).
- `correctClassification` (Record de arreglos): Mapeo clave-valor donde la clave es el `categoryId` y el valor es la lista de `itemIds` que le corresponden.

```json
{
  "id": "q8",
  "type": "classify",
  "prompt": { "text": "Clasifica los seres vivos y objetos:" },
  "difficulty": "medium",
  "points": 20,
  "categories": [
    { "id": "cat_vivo", "name": "Vivos", "icon": "eco" },
    { "id": "cat_no_vivo", "name": "No Vivos", "icon": "block" }
  ],
  "items": [
    { "id": "arbol", "text": "Árbol" },
    { "id": "roca", "text": "Piedra" },
    { "id": "perro", "text": "Perro" },
    { "id": "lapiz", "text": "Lápiz" }
  ],
  "correctClassification": {
    "cat_vivo": ["arbol", "perro"],
    "cat_no_vivo": ["roca", "lapiz"]
  }
}
```

---

### 9. Secuencias Lógicas (`sequence`)

Completar un patrón lógico seleccionando la ficha faltante en el casillero vacante.

- `visibleItems` (array): Elementos de la secuencia ordenados. El casillero que falta debe tener `value: "?"` (u otro indicador visible) y estar en el índice especificado.
- `missingPosition` (number): Índice base-0 del casillero vacío que falta en la secuencia.
- `options` (array): Fichas candidatas disponibles para rellenar la secuencia.
- `correctNext` (string): El `id` de la ficha correcta en `options`.

```json
{
  "id": "q9",
  "type": "sequence",
  "prompt": { "text": "¿Qué forma completa la serie?" },
  "difficulty": "easy",
  "points": 15,
  "visibleItems": [
    { "id": "s1", "value": "🔵" },
    { "id": "s2", "value": "🔴" },
    { "id": "s3", "value": "🔵" },
    { "id": "s4", "value": "?" }
  ],
  "options": [
    { "id": "opt_rojo", "value": "🔴" },
    { "id": "opt_amarillo", "value": "🟡" }
  ],
  "correctNext": "opt_rojo",
  "missingPosition": 3
}
```

---

### 10. Selección sobre Imágenes (`hotspot`)

Tocar una o más zonas específicas de una imagen como respuesta.

- `backgroundImage` (string): URL de la imagen principal.
- `hotspots` (array): Zonas interactivas. Cada una contiene `id` (string), `x` (number, 0-100% desde la izquierda), `y` (number, 0-100% desde arriba), `radius` (number, radio clickeable en %) y un `label` descriptivo.
- `correctHotspots` (array de strings): Los `id` de los hotspots que deben ser seleccionados.
- `multiSelect` (boolean): Si se permite marcar más de un hotspot.

```json
{
  "id": "q10",
  "type": "hotspot",
  "prompt": { "text": "Toca el ojo del osito panda:" },
  "difficulty": "easy",
  "points": 20,
  "backgroundImage": "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=500",
  "hotspots": [
    {
      "id": "ojo_izq",
      "x": 42,
      "y": 35,
      "radius": 7,
      "label": "Ojo izquierdo"
    },
    {
      "id": "oreja_der",
      "x": 68,
      "y": 18,
      "radius": 8,
      "label": "Oreja derecha"
    },
    { "id": "hocico", "x": 50, "y": 48, "radius": 6, "label": "Hocico" }
  ],
  "correctHotspots": ["ojo_izq"],
  "multiSelect": false
}
```

---

### 11. Preguntas con Audio (`audio-question`)

Preguntas que requieren escuchar una pista sonora antes de responder la pregunta interna.

- `audioUrl` (string): URL de la pista de sonido (.mp3, .wav).
- `autoPlay` (boolean): Iniciar la reproducción automáticamente.
- `maxPlays` (number, opcional): Número límite de reproducciones permitidas.
- `innerQuestion` (objeto): La pregunta real del examen. Puede ser de tipo `multiple-choice`, `short-answer` o `true-false`.

```json
{
  "id": "q11",
  "type": "audio-question",
  "prompt": { "text": "Escucha y responde:" },
  "difficulty": "medium",
  "points": 25,
  "audioUrl": "https://www.soundjay.com/nature/sounds/birds-singing-01.mp3",
  "autoPlay": false,
  "maxPlays": 3,
  "innerQuestion": {
    "id": "q11-inner",
    "type": "multiple-choice",
    "prompt": { "text": "¿Qué animal hace ese sonido?" },
    "difficulty": "easy",
    "points": 25,
    "feedback": { "correct": "Correcto", "incorrect": "Incorrecto" },
    "options": [
      { "id": "a", "text": "Gato" },
      { "id": "b", "text": "Pájaro" }
    ],
    "correctAnswer": "b"
  }
}
```

---

### 12. Preguntas con Video (`video-question`)

El niño ve un video y contesta una pregunta. Puede pausar automáticamente en un segundo clave.

- `videoUrl` (string): URL del video (.mp4, .ogg).
- `autoPlay` (boolean): Reproducir de inmediato.
- `pauseAt` (number, opcional): El segundo exacto donde el reproductor se pausará de forma obligatoria para forzar la respuesta.
- `innerQuestion` (objeto): La pregunta interior, estructurada como en `audio-question`.

```json
{
  "id": "q12",
  "type": "video-question",
  "prompt": { "text": "Mira el video:" },
  "difficulty": "medium",
  "points": 25,
  "videoUrl": "https://www.w3schools.com/html/mov_bbb.mp4",
  "autoPlay": false,
  "pauseAt": 4,
  "innerQuestion": {
    "id": "q12-inner",
    "type": "true-false",
    "prompt": { "text": "¿El conejo es blanco?" },
    "difficulty": "easy",
    "points": 25,
    "feedback": { "correct": "Correcto", "incorrect": "Incorrecto" },
    "statement": "El animal que aparece es un conejo de color blanco.",
    "correctAnswer": true
  }
}
```

---

### 13. Preguntas con Imágenes (`image-question`)

Preguntas que muestran una ilustración destacada con soporte de zoom táctil/pantalla completa.

- `imageUrl` (string): URL de la imagen principal.
- `zoomable` (boolean): Habilitar botón de lupa 🔍 para inspeccionar en pantalla completa.
- `innerQuestion` (objeto): La pregunta interior, estructurada como en `audio-question`.

```json
{
  "id": "q13",
  "type": "image-question",
  "prompt": { "text": "Observa el mapa:" },
  "difficulty": "easy",
  "points": 20,
  "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Red_Apple.jpg/800px-Red_Apple.jpg",
  "zoomable": true,
  "innerQuestion": {
    "id": "q13-inner",
    "type": "short-answer",
    "prompt": { "text": "¿De qué color es la fruta?" },
    "difficulty": "easy",
    "points": 20,
    "feedback": { "correct": "Correcto", "incorrect": "Incorrecto" },
    "correctAnswers": ["roja", "rojo"],
    "caseSensitive": false,
    "maxLength": 10
  }
}
```

---

### 14. Preguntas Mixtas (`mixed`)

Evaluaciones compuestas con múltiples subsecciones verticales de diferente índole.

- `sections` (array): Sub-secciones ordenadas. Cada sección contiene `type` (`"text"` | `"image"` | `"select"` | `"input"` | `"drag-drop"`) y `content` (el texto explicativo o URL).
  - Si es tipo `"select"`, requiere `options` (array de opciones) y `correctAnswer` (string).
  - Si es tipo `"input"`, requiere `correctAnswer` (string o array de strings).
  - Si es tipo `"drag-drop"`, requiere `dragItems` (array de items arrastrables) y `correctAnswer` (string, el ID del item a colocar en la zona vacía).

```json
{
  "id": "q14",
  "type": "mixed",
  "prompt": { "text": "Resuelve la sección mixta de biología:" },
  "difficulty": "hard",
  "points": 30,
  "feedback": {
    "correct": "¡Increíble nivel!",
    "incorrect": "Revisa bien las preguntas antes de avanzar."
  },
  "sections": [
    {
      "type": "text",
      "content": "Las abejas son polinizadores clave. Vuelan de flor en flor recolectando néctar."
    },
    {
      "type": "select",
      "content": "¿Qué recolectan las abejas de las flores?",
      "options": [
        { "id": "a", "text": "Néctar" },
        { "id": "b", "text": "Agua" }
      ],
      "correctAnswer": "a"
    },
    {
      "type": "input",
      "content": "Escribe el nombre del insecto del texto (singular):",
      "correctAnswer": ["abeja", "la abeja"]
    }
  ]
}
```

---

## 🎯 Ejemplo de Referencia Completo

En la carpeta pública del proyecto puedes encontrar el archivo patrón **[all-question-types.json](file:///c:/Users/Jaret/OneDrive/Documentos/Asesorías/BrainQuest/brainquest-frontend/public/exams/all-question-types.json)**. Este archivo contiene un examen de demostración de 14 preguntas (una de cada tipo) y sirve como la plantilla de referencia definitiva para el esquema JSON admitido.
