import api from './api';

export const badgePlayerService = {
  async awardBadge(playerId: number, badgeId: number, performanceId: number) {
    const response = await api.post('/badge-player/award', {
      playerId,
      badgeId,
      performanceId
    });
    return response.data;
  },
  async getEarnedByPlayer(playerId: number) {
    // Backend doesn't have an endpoint for this yet, so we mock it to prevent 404 errors
    return Promise.resolve([]);
  }
};
