export const APP_VERSION = '1.0';

export const STORAGE_KEYS = {
  PROGRESS: 'brainquest_progress',
  RESULTS: 'brainquest_results',
  SETTINGS: 'brainquest_settings',
} as const;

export const SOUNDS = {
  CLICK: '/sounds/click.mp3',
  CORRECT: '/sounds/correct.mp3',
  INCORRECT: '/sounds/incorrect.mp3',
  COMPLETE: '/sounds/complete.mp3',
  STAR: '/sounds/star.mp3',
  LEVEL_UP: '/sounds/levelup.mp3',
  ACHIEVEMENT: '/sounds/achievement.mp3',
} as const;

export const THEME_COLORS = {
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'tertiary',
  accent: 'accent',
} as const;
