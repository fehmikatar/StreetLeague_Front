import api from './api';
import { PerformanceRequest, PerformanceResponse } from '@/types/performance';

export const performanceService = {
  async getAll(): Promise<PerformanceResponse[]> {
    const response = await api.get<PerformanceResponse[]>('/performances');
    return response.data;
  },

  async getByPlayerId(playerId: number): Promise<PerformanceResponse[]> {
    const response = await api.get<PerformanceResponse[]>('/performances');
    return response.data.filter(p => p.playerId === playerId);
  },

  async getById(id: number): Promise<PerformanceResponse> {
    const response = await api.get<PerformanceResponse>(`/performances/${id}`);
    return response.data;
  },

  async create(data: PerformanceRequest): Promise<PerformanceResponse> {
    const response = await api.post<PerformanceResponse>('/performances', data);
    return response.data;
  },

  async update(id: number, data: Partial<PerformanceRequest>): Promise<PerformanceResponse> {
    const response = await api.put<PerformanceResponse>(`/performances/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/performances/${id}`);
  },
};