import api from './api';
import { FieldResponse, FieldRequest } from '@/types/field';

export const fieldService = {
  async getAll(): Promise<FieldResponse[]> {
    const response = await api.get<FieldResponse[]>('/fields');
    return response.data;
  },

  async getById(id: number): Promise<FieldResponse> {
    const response = await api.get<FieldResponse>(`/fields/${id}`);
    return response.data;
  },

  async create(data: FormData): Promise<FieldResponse> {
    // Ne pas définir Content-Type, Axios gère automatiquement le boundary
    const response = await api.post<FieldResponse>('/fields', data);
    return response.data;
  },

  async update(id: number, data: Partial<FieldRequest>): Promise<FieldResponse> {
    const response = await api.put<FieldResponse>(`/fields/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/fields/${id}`);
  },
};