import type { Exam } from '../models/exam';
import type { AnswerRecord, ScoreSummary, RewardsSummary } from '../models/scoring';

export class ScoringEngine {
  static calculateScore(answers: AnswerRecord[], exam: Exam): ScoreSummary {
    const totalPoints = answers.reduce((sum, a) => sum + a.pointsEarned, 0);
    const maxPoints = exam.questions.reduce((sum, q) => sum + q.points, 0);
    
    const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    const [s1, s2, s3] = exam.rewards.starThresholds;

    let stars: 0 | 1 | 2 | 3 = 0;
    if (percentage >= s3) {
      stars = 3;
    } else if (percentage >= s2) {
      stars = 2;
    } else if (percentage >= s1) {
      stars = 1;
    }

    const passed = percentage >= exam.settings.passingScore;

    return {
      totalPoints,
      maxPoints,
      percentage,
      correctCount: answers.filter(a => a.isCorrect).length,
      incorrectCount: answers.filter(a => !a.isCorrect && !a.skipped && !a.isPartial).length,
      skippedCount: answers.filter(a => a.skipped).length,
      partialCount: answers.filter(a => a.isPartial).length,
      stars,
      passed,
    };
  }

  static calculateXP(score: ScoreSummary, exam: Exam, totalTime: number): RewardsSummary {
    // XP proportional to percentage correct
    const baseXP = Math.round(exam.rewards.xpReward * (score.percentage / 100));
    let bonusXP = 0;

    const bonuses = exam.rewards.bonusXP;
    if (bonuses) {
      // Perfect Score Bonus
      if (score.percentage === 100 && bonuses.perfectScore) {
        bonusXP += bonuses.perfectScore;
      }
      
      // No Skips Bonus
      if (score.skippedCount === 0 && bonuses.noSkips) {
        bonusXP += bonuses.noSkips;
      }

      // Speed Run Bonus: if completed in less than 50% of estimated time (or timeLimit)
      const estimatedSeconds = exam.metadata.estimatedTime * 60;
      const timeLimitSeconds = exam.settings.timeLimit || estimatedSeconds;
      if (totalTime < timeLimitSeconds * 0.5 && bonuses.speedBonus) {
        bonusXP += bonuses.speedBonus;
      }
    }

    return {
      xpEarned: baseXP,
      bonusXP,
      totalXP: baseXP + bonusXP,
      newAchievements: [],
      leveledUp: false,
    };
  }
}
export default ScoringEngine;
