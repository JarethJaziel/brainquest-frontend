import type { IAchievementRepository } from './interfaces';
import type { Achievement, UnlockedAchievement } from '../../models/rewards';
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';
import type { UserProgress } from '../../models/progress';
import { INITIAL_PROGRESS } from './ProgressRepository';

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-exam',
    name: '¡Mi primer examen!',
    description: 'Completar 1 examen',
    icon: 'emoji_events',
    category: 'progress',
    condition: { type: 'exams_completed', threshold: 1 },
    xpReward: 50,
    rarity: 'common',
  },
  {
    id: 'perfect-score',
    name: '¡Perfecto!',
    description: 'Obtener 100% en un examen',
    icon: 'star',
    category: 'mastery',
    condition: { type: 'perfect_score', threshold: 1 },
    xpReward: 100,
    rarity: 'rare',
  },
  {
    id: 'streak-3',
    name: '¡En racha!',
    description: '3 días de estudio consecutivos',
    icon: 'local_fire_department',
    category: 'streak',
    condition: { type: 'streak_days', threshold: 3 },
    xpReward: 75,
    rarity: 'common',
  },
  {
    id: 'streak-7',
    name: '¡Imparable!',
    description: '7 días de estudio consecutivos',
    icon: 'workspace_premium',
    category: 'streak',
    condition: { type: 'streak_days', threshold: 7 },
    xpReward: 200,
    rarity: 'rare',
  },
  {
    id: 'ten-exams',
    name: 'Explorador Dedicado',
    description: 'Completar 10 exámenes',
    icon: 'explore',
    category: 'progress',
    condition: { type: 'exams_completed', threshold: 10 },
    xpReward: 150,
    rarity: 'common',
  },
  {
    id: 'all-stars',
    name: 'Coleccionista de Estrellas',
    description: '3 estrellas en 5 exámenes',
    icon: 'grade',
    category: 'mastery',
    condition: { type: 'perfect_score', threshold: 5 },
    xpReward: 300,
    rarity: 'epic',
  },
  {
    id: 'speed-demon',
    name: '¡Rayo Veloz!',
    description: 'Terminar examen en <50% del tiempo estimado',
    icon: 'bolt',
    category: 'special',
    condition: { type: 'speed_run', threshold: 1 },
    xpReward: 100,
    rarity: 'rare',
  },
  {
    id: 'no-mistakes',
    name: 'Mente Brillante',
    description: 'Responder 10 preguntas correctas seguidas',
    icon: 'psychology',
    category: 'special',
    condition: { type: 'no_mistakes', threshold: 10 },
    xpReward: 200,
    rarity: 'epic',
  },
];

export class LocalAchievementRepository implements IAchievementRepository {
  private readonly progressAdapter = new LocalStorageAdapter<UserProgress>('brainquest_progress', INITIAL_PROGRESS);

  async getAchievements(): Promise<Achievement[]> {
    return ALL_ACHIEVEMENTS;
  }

  async getUnlocked(): Promise<UnlockedAchievement[]> {
    const progress = this.progressAdapter.get();
    return progress.achievements || [];
  }

  async unlock(achievementId: string): Promise<void> {
    const progress = this.progressAdapter.get();
    if (progress.achievements.some(a => a.achievementId === achievementId)) {
      return; // Already unlocked
    }

    progress.achievements.push({
      achievementId,
      unlockedAt: new Date().toISOString(),
    });

    // Award XP
    const ach = ALL_ACHIEVEMENTS.find(a => a.id === achievementId);
    if (ach) {
      progress.profile.currentXP += ach.xpReward;
      progress.profile.totalXP += ach.xpReward;
    }

    this.progressAdapter.set(progress);
  }
}
