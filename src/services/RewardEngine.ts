import type { UserProgress } from '../models/progress';
import type { Exam } from '../models/exam';
import type { ExamResult } from '../models/scoring';

export class RewardEngine {
  static checkAchievements(
    progress: UserProgress,
    exam?: Exam,
    currentResult?: ExamResult
  ): string[] {
    const unlockedIds: string[] = [];
    const alreadyUnlocked = new Set(progress.achievements.map(a => a.achievementId));

    // 1. first-exam: Completar 1 examen
    if (!alreadyUnlocked.has('first-exam') && progress.stats.totalExamsCompleted >= 1) {
      unlockedIds.push('first-exam');
    }

    // 2. perfect-score: Obtener 100% en un examen
    if (!alreadyUnlocked.has('perfect-score') && progress.stats.perfectExams >= 1) {
      unlockedIds.push('perfect-score');
    }

    // 3. streak-3: 3 días de estudio consecutivos
    if (!alreadyUnlocked.has('streak-3') && progress.streaks.currentStreak >= 3) {
      unlockedIds.push('streak-3');
    }

    // 4. streak-7: 7 días de estudio consecutivos
    if (!alreadyUnlocked.has('streak-7') && progress.streaks.currentStreak >= 7) {
      unlockedIds.push('streak-7');
    }

    // 5. ten-exams: Completar 10 exámenes
    if (!alreadyUnlocked.has('ten-exams') && progress.stats.totalExamsCompleted >= 10) {
      unlockedIds.push('ten-exams');
    }

    // 6. all-stars: 3 estrellas en 5 exámenes
    if (!alreadyUnlocked.has('all-stars')) {
      const examsWith3Stars = Object.values(progress.examProgress).filter(ep => ep.bestStars === 3).length;
      if (examsWith3Stars >= 5) {
        unlockedIds.push('all-stars');
      }
    }

    // 7. speed-demon: Terminar examen en menos del 50% del tiempo estimado y pasarlo
    if (!alreadyUnlocked.has('speed-demon') && currentResult && exam) {
      const timeLimit = exam.settings.timeLimit || (exam.metadata.estimatedTime * 60);
      if (currentResult.totalTime < timeLimit * 0.5 && currentResult.score.passed) {
        unlockedIds.push('speed-demon');
      }
    }

    // 8. no-mistakes: Responder 10 preguntas correctas seguidas en un solo examen
    if (!alreadyUnlocked.has('no-mistakes') && currentResult) {
      if (currentResult.score.correctCount >= 10 && currentResult.score.incorrectCount === 0) {
        unlockedIds.push('no-mistakes');
      }
    }

    return unlockedIds;
  }
}

export default RewardEngine;
