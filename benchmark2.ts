import { performance } from 'perf_hooks';

const LEVEL_CONFIG = Array.from({ length: 100 }, (_, i) => ({
  level: i + 1,
  xpRequired: i * 1000,
}));

function calculateUserProfile(totalXP: number, currentNickname: string, currentAvatar: string) {
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
}

const ALL_ACHIEVEMENTS = Array.from({ length: 50 }, (_, i) => ({
  id: `ach_${i}`,
  xpReward: 50,
}));

// Setup baseline
let finalProfile = calculateUserProfile(0, 'Test', 'avatar.png');
const newAchievements = ALL_ACHIEVEMENTS.map(a => a.id);

// Baseline: calculate per achievement
const start1 = performance.now();
for (let i = 0; i < 10000; i++) { // Run 10000 times
  let profile1 = { ...finalProfile };
  newAchievements.forEach(achId => {
    const ach = ALL_ACHIEVEMENTS.find(a => a.id === achId);
    if (ach) {
      const newTotalWithAchXP = profile1.totalXP + ach.xpReward;
      const calculated = calculateUserProfile(newTotalWithAchXP, profile1.nickname, profile1.avatar);
      profile1 = calculated;
    }
  });
}
const end1 = performance.now();
console.log(`Baseline (loop): ${end1 - start1} ms`);

// Optimized: accumulate XP
const start2 = performance.now();
for (let i = 0; i < 10000; i++) {
  let profile2 = { ...finalProfile };
  let totalAchievementXp = 0;
  newAchievements.forEach(achId => {
    const ach = ALL_ACHIEVEMENTS.find(a => a.id === achId);
    if (ach) {
      totalAchievementXp += ach.xpReward;
    }
  });
  if (totalAchievementXp > 0) {
    const calculated = calculateUserProfile(profile2.totalXP + totalAchievementXp, profile2.nickname, profile2.avatar);
    profile2 = calculated;
  }
}
const end2 = performance.now();
console.log(`Optimized (accumulate): ${end2 - start2} ms`);
