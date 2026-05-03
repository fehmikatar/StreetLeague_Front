import api from './api';
import { BadgeRequest, BadgeResponse, EarnedBadgeResponse } from '@/types/badge';

export const badgeService = {
  async getAll(): Promise<BadgeResponse[]> {
    const response = await api.get<BadgeResponse[]>('/badges');
    return response.data;
  },
  async getById(id: number): Promise<BadgeResponse> {
    const response = await api.get<BadgeResponse>(`/badges/${id}`);
    return response.data;
  },
  async getEarnedByPlayer(playerId: number): Promise<EarnedBadgeResponse[]> {
    const response = await api.get<EarnedBadgeResponse[]>(`/badge-player/player/${playerId}`);
    return response.data;
  },
  async create(data: BadgeRequest): Promise<BadgeResponse> {
    const response = await api.post<BadgeResponse>('/badges', data);
    return response.data;
  },
  async update(id: number, data: BadgeRequest): Promise<BadgeResponse> {
    const response = await api.put<BadgeResponse>(`/badges/${id}`, data);
    return response.data;
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/badges/${id}`);
  },
};