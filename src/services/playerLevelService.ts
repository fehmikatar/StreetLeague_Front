import api from './api';

export const playerLevelService = {
  async addXp(playerId: number, xpGained: number) {
    const response = await api.post(`/player-levels/${playerId}/add-xp?xpGained=${xpGained}`);
    return response.data;
  },
  async getByPlayerId(playerId: number) {
    const response = await api.get(`/player-levels/player/${playerId}`);
    return response.data;
  }
};