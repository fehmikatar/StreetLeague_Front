export interface PerformanceRequest {
  playerId: number;
  matchId: number;
  score: number;
  assists: number;
  distanceCovered: number;
  timePlayed: number;
  rating: number;
}

export interface PerformanceResponse {
  id: number;
  playerId: number;
  matchId: number;
  score: number;
  assists: number;
  distanceCovered: number;
  timePlayed: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}