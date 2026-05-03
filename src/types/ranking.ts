export interface PlayerRankingDTO {
  playerId: number;
  firstName: string;
  lastName: string;
  email: string;
  currentLevel: number;
  totalXp: number;
  gamesPlayed: number;
  xpPerGame: number;
}

export interface PositionStatsDTO {
  position: string;
  playerCount: number;
  avgLevel: number;
  avgTotalXp: number;
  avgXpPerGame: number;
  expertPercentage: number;
}