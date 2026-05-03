import { PerformanceRequest } from '@/types/performance';

export const xpCalculator = {
  calculateXpGained(performance: PerformanceRequest): number {
    let xp = 0;
    xp += performance.score * 20;               // 20 XP par but
    xp += performance.assists * 15;             // 15 XP par passe décisive
    xp += Math.floor(performance.distanceCovered); // 1 XP par km
    xp += Math.floor(performance.timePlayed * 0.5); // 0.5 XP par minute
    xp += Math.floor(performance.rating * 10);      // 10 XP par point de rating
    if (performance.rating > 8) xp += 50;
    if (performance.rating > 9) xp += 100;
    return xp;
  }
};
