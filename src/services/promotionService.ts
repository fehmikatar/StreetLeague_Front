import api from './api';
import { PromotionRequest, PromotionResponse } from '@/types/promotion';

export const promotionService = {
  async getAll(): Promise<PromotionResponse[]> {
    const response = await api.get<PromotionResponse[]>('/promotions');
    return response.data;
  },

  async getAvailable(): Promise<PromotionResponse[]> {
    const response = await api.get<PromotionResponse[]>('/promotions');
    const today = new Date().toISOString().split('T')[0];
    return response.data.filter(promo => promo.endDate >= today);
  },

  async create(data: PromotionRequest): Promise<PromotionResponse> {
    const response = await api.post<PromotionResponse>('/promotions', data);
    return response.data;
  },

  async update(id: string, data: PromotionRequest): Promise<PromotionResponse> {
    const response = await api.put<PromotionResponse>(`/promotions/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/promotions/${id}`);
  },
};