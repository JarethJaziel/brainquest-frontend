import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserProgress, ExamProgress } from '../models/progress';
import type { ExamResult } from '../models/scoring';
import type { Exam } from '../models/exam';
import { repositories } from '../data';
import { INITIAL_PROGRESS } from '../data/repositories/ProgressRepository';
import { ALL_ACHIEVEMENTS } from '../data/repositories/AchievementRepository';
import { LEVEL_CONFIG } from '../models/rewards';
import { RewardEngine } from '../services/RewardEngine';
import { useAudio } from './AudioContext';

export interface AchievementToast {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface UserProgressContextType {
  progress: UserProgress;
  loading: boolean;
  addXP: (amount: number) => Promise<boolean>; // Returns true if leveled up
  completeExam: (exam: Exam, result: ExamResult) => Promise<boolean>; // Returns true if leveled up
  unlockAchievement: (achievementId: string) => Promise<boolean>; // Returns true if unlocked
  updateProfile: (nickname: string, avatar: string) => Promise<void>;
  resetProgress: () => Promise<void>;
  levelUpEvent: { oldLevel: number; newLevel: number } | null;
  clearLevelUpEvent: () => void;
  toasts: AchievementToast[];
  removeToast: (id: string) => void;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

export const UserProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [levelUpEvent, setLevelUpEvent] = useState<{ oldLevel: number; newLevel: number } | null>(null);
  const [toasts, setToasts] = useState<AchievementToast[]>([]);
  
  const audio = useAudio();

  // Load progress from repository on mount
  useEffect(() => {
    async function loadProgress() {
      try {
        const data = await repositories.progress.getProgress();
        setProgress(data);
      } catch (err) {
        console.error('Failed to load user progress:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, []);

  const calculateUserProfile = useCallback((totalXP: number, currentNickname: string, currentAvatar: string) => {
    let activeLevel = 1;
    let activeConfig = LEVEL_CONFIG[0];

    for (let i = 0; i < LEVEL_CONFIG.length; i++) {
      if (totalXP >= LEVEL_CONFIG[i].xpRequired) {
        activeLevel = LEVEL_CONFIG[i].level;
        activeConfig = LEVEL_CONFIG[i];
      } else {
        break;
      }
    }

    const nextConfig = LEVEL_CONFIG.find(c => c.level === activeLevel + 1);

    const currentXPInLevel = totalXP - activeConfig.xpRequired;
    const xpNeededForNext = nextConfig ? (nextConfig.xpRequired - activeConfig.xpRequired) : 999999;

    return {
      nickname: currentNickname,
      avatar: currentAvatar,
      level: activeLevel,
      currentXP: currentXPInLevel,
      totalXP,
      xpToNextLevel: xpNeededForNext,
    };
  }, []);

  const clearLevelUpEvent = useCallback(() => {
    setLevelUpEvent(null);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const triggerAchievementToast = useCallback((achievementId: string) => {
    const ach = ALL_ACHIEVEMENTS.find(a => a.id === achievementId);
    if (ach) {
      const toastId = `${achievementId}_${Date.now()}`;
      setToasts(prev => [...prev, { id: toastId, name: ach.name, description: ach.description, icon: ach.icon }]);
      
      // Auto-remove toast after 4 seconds
      setTimeout(() => {
        removeToast(toastId);
      }, 4000);
      
      audio.playAchievement();
    }
  }, [removeToast, audio]);

  const addXP = useCallback(async (amount: number): Promise<boolean> => {
    let leveledUp = false;

    setProgress(prev => {
      const newTotalXP = prev.profile.totalXP + amount;
      const updatedProfile = calculateUserProfile(newTotalXP, prev.profile.nickname, prev.profile.avatar);

      if (updatedProfile.level > prev.profile.level) {
        leveledUp = true;
        setLevelUpEvent({
          oldLevel: prev.profile.level,
          newLevel: updatedProfile.level,
        });
      }

      const updated = {
        ...prev,
        profile: updatedProfile,
        stats: {
          ...prev.stats,
          totalXP: newTotalXP,
        },
      };

      repositories.progress.saveProgress(updated);
      return updated;
    });

    if (leveledUp) {
      audio.playLevelUp();
    }
    return leveledUp;
  }, [progress.profile.level, calculateUserProfile, audio]);

  const unlockAchievement = useCallback(async (achievementId: string): Promise<boolean> => {
    let unlocked = false;
    let leveledUp = false;

    setProgress(prev => {
      if (prev.achievements.some(a => a.achievementId === achievementId)) {
        return prev;
      }

      unlocked = true;
      const newAchievements = [
        ...prev.achievements,
        {
          achievementId,
          unlockedAt: new Date().toISOString(),
        },
      ];

      // Award XP
      const ach = ALL_ACHIEVEMENTS.find(a => a.id === achievementId);
      let updatedProfile = prev.profile;
      if (ach) {
        const newTotalXP = prev.profile.totalXP + ach.xpReward;
        updatedProfile = calculateUserProfile(newTotalXP, prev.profile.nickname, prev.profile.avatar);
        if (updatedProfile.level > prev.profile.level) {
          leveledUp = true;
          setLevelUpEvent({
            oldLevel: prev.profile.level,
            newLevel: updatedProfile.level,
          });
        }
      }

      const updated = {
        ...prev,
        achievements: newAchievements,
        profile: updatedProfile,
      };

      repositories.progress.saveProgress(updated);
      return updated;
    });

    if (unlocked) {
      triggerAchievementToast(achievementId);
    }
    if (leveledUp) {
      audio.playLevelUp();
    }
    return unlocked;
  }, [calculateUserProfile, triggerAchievementToast, audio]);

  const completeExam = useCallback(async (exam: Exam, result: ExamResult): Promise<boolean> => {
    let leveledUp = false;
    const examId = exam.id;

    // Save the result first
    await repositories.result.saveResult(result);

    // Calculate level up and progress updates
    setProgress(prev => {
      const prevExamProg = prev.examProgress[examId];
      const isPerfect = result.score.percentage === 100;

      // Update exam stats
      const newExamProgress: ExamProgress = {
        examId,
        bestScore: Math.max(prevExamProg?.bestScore || 0, result.score.percentage),
        bestStars: Math.max(prevExamProg?.bestStars || 0, result.score.stars) as 0 | 1 | 2 | 3,
        attempts: (prevExamProg?.attempts || 0) + 1,
        lastAttemptAt: new Date().toISOString(),
        results: [...(prevExamProg?.results || []), result.id],
      };

      // Calculate new XP
      const totalEarnedXP = result.rewards.totalXP;
      const newTotalXP = prev.profile.totalXP + totalEarnedXP;
      let updatedProfile = calculateUserProfile(newTotalXP, prev.profile.nickname, prev.profile.avatar);

      if (updatedProfile.level > prev.profile.level) {
        leveledUp = true;
        setLevelUpEvent({
          oldLevel: prev.profile.level,
          newLevel: updatedProfile.level,
        });
      }

      // Update global stats
      const totalExams = prev.stats.totalExamsCompleted + 1;
      const totalQuestions = prev.stats.totalQuestionsAnswered + result.answers.length;
      const totalCorrect = prev.stats.totalCorrect + result.score.correctCount;
      const totalTime = prev.stats.totalTimeSpent + result.totalTime;
      const avgScore = Math.round(
        (prev.stats.averageScore * prev.stats.totalExamsCompleted + result.score.percentage) / totalExams
      );

      // Create intermediate progress representation to check achievements
      const updatedProgressWithoutAch: UserProgress = {
        ...prev,
        profile: updatedProfile,
        stats: {
          ...prev.stats,
          totalExamsCompleted: totalExams,
          totalQuestionsAnswered: totalQuestions,
          totalCorrect: totalCorrect,
          totalTimeSpent: totalTime,
          averageScore: avgScore,
          perfectExams: prev.stats.perfectExams + (isPerfect ? 1 : 0),
        },
        examProgress: {
          ...prev.examProgress,
          [examId]: newExamProgress,
        },
      };

      // Run achievement rules
      const newAchievements = RewardEngine.checkAchievements(updatedProgressWithoutAch, exam, result);
      
      let finalProfile = updatedProfile;
      const finalUnlocked = [...updatedProgressWithoutAch.achievements];

      newAchievements.forEach(achId => {
        finalUnlocked.push({
          achievementId: achId,
          unlockedAt: new Date().toISOString(),
        });

        // Award achievement reward XP
        const ach = ALL_ACHIEVEMENTS.find(a => a.id === achId);
        if (ach) {
          const newTotalWithAchXP = finalProfile.totalXP + ach.xpReward;
          const calculated = calculateUserProfile(newTotalWithAchXP, finalProfile.nickname, finalProfile.avatar);
          
          if (calculated.level > finalProfile.level) {
            leveledUp = true;
            setLevelUpEvent({
              oldLevel: finalProfile.level,
              newLevel: calculated.level,
            });
          }
          finalProfile = calculated;
        }

        // Trigger visual toast
        // We delay slightly so it doesn't overlap immediately with level up sounds or other events
        setTimeout(() => {
          triggerAchievementToast(achId);
        }, 800);
      });

      const finalProgress: UserProgress = {
        ...updatedProgressWithoutAch,
        profile: finalProfile,
        achievements: finalUnlocked,
      };

      repositories.progress.saveProgress(finalProgress);
      return finalProgress;
    });

    if (leveledUp) {
      audio.playLevelUp();
    }
    return leveledUp;
  }, [calculateUserProfile, triggerAchievementToast, audio]);

  const updateProfile = useCallback(async (nickname: string, avatar: string) => {
    setProgress(prev => {
      const updated = {
        ...prev,
        profile: {
          ...prev.profile,
          nickname,
          avatar,
        },
      };
      repositories.progress.saveProgress(updated);
      return updated;
    });
  }, []);

  const resetProgress = useCallback(async () => {
    setProgress(INITIAL_PROGRESS);
    await repositories.progress.saveProgress(INITIAL_PROGRESS);
    
    // Clear all results too
    localStorage.removeItem('brainquest_results');
    localStorage.removeItem('brainquest_results_version');
  }, []);

  return (
    <UserProgressContext.Provider
      value={{
        progress,
        loading,
        addXP,
        completeExam,
        unlockAchievement,
        updateProfile,
        resetProgress,
        levelUpEvent,
        clearLevelUpEvent,
        toasts,
        removeToast,
      }}
    >
      {children}
    </UserProgressContext.Provider>
  );
};

export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  if (!context) {
    throw new Error('useUserProgress must be used within a UserProgressProvider');
  }
  return context;
};
