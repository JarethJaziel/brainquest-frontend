// ===== REWARDS & ACHIEVEMENTS =====

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;                       // Material Symbol
  category: 'progress' | 'mastery' | 'streak' | 'special';
  condition: AchievementCondition;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementCondition {
  type: 'exams_completed' | 'perfect_score' | 'streak_days' |
        'total_xp' | 'questions_correct' | 'category_mastered' |
        'speed_run' | 'no_mistakes';
  threshold: number;
  category?: string;                  // para condiciones por categoría
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string;
}

// Sistema de niveles
export interface LevelConfig {
  level: number;
  xpRequired: number;                // XP acumulada necesaria
  title: string;                     // "Explorador Novato", "Sabio Galáctico"
  unlocks?: string[];                // ids de exámenes que se desbloquean
}

// Niveles predefinidos
export const LEVEL_CONFIG: LevelConfig[] = [
  { level: 1, xpRequired: 0, title: 'Explorador Novato' },
  { level: 2, xpRequired: 500, title: 'Aprendiz Curioso' },
  { level: 3, xpRequired: 1200, title: 'Aventurero Valiente' },
  { level: 4, xpRequired: 2100, title: 'Descubridor Intrépido' },
  { level: 5, xpRequired: 3500, title: 'Maestro del Saber' },
  { level: 6, xpRequired: 5000, title: 'Genio Estelar' },
  { level: 7, xpRequired: 7000, title: 'Héroe del Conocimiento' },
  { level: 8, xpRequired: 9500, title: 'Campeón Brillante' },
  { level: 9, xpRequired: 12500, title: 'Leyenda Cósmica' },
  { level: 10, xpRequired: 16000, title: 'Guardián de la Sabiduría' },
];
