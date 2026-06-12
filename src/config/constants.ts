export const APP_VERSION = '1.0';

export const STORAGE_KEYS = {
  PROGRESS: 'brainquest_progress',
  RESULTS: 'brainquest_results',
  SETTINGS: 'brainquest_settings',
} as const;

// src/config/constants.ts
const base = import.meta.env.BASE_URL;

export const SOUNDS = {
  CLICK: `${base}sounds/click.mp3`,
  CORRECT: `${base}sounds/correct.mp3`,
  INCORRECT: `${base}sounds/incorrect.mp3`,
  COMPLETE: `${base}sounds/complete.mp3`,
  STAR: `${base}sounds/star.mp3`,
  LEVEL_UP: `${base}sounds/levelup.mp3`,
  ACHIEVEMENT: `${base}sounds/achievement.mp3`,
} as const;


export const THEME_COLORS = {
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'tertiary',
  accent: 'accent',
} as const;
