import api from './api';
import { PlayerRankingDTO, PositionStatsDTO } from '@/types/ranking';

export const rankingService = {
  async getRanking(): Promise<PlayerRankingDTO[]> {
    const response = await api.get<PlayerRankingDTO[]>('/player-levels/ranking');
    return response.data;
  },

  async getPositionStats(minPlayers: number, minAvgLevel: number): Promise<PositionStatsDTO[]> {
    const response = await api.get<PositionStatsDTO[]>('/player-levels/position-stats', {
      params: { minPlayers, minAvgLevel },
    });
    return response.data;
  },
};