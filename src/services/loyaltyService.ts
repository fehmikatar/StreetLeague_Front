import api from './api';
import { 
  LoyaltyProgram, 
  LoyaltyTier, 
  LoyaltyClient, 
  LoyaltyTransaction, 
  EnrollRequest, 
  AddPointsRequest 
} from '../types/loyalty';

const PROGRAMS_API = '/loyalty/programs';
const TIERS_API = '/loyalty/tiers';
const CLIENTS_API = '/loyalty/clients';
const TRANSACTIONS_API = '/loyalty/transactions';

export const loyaltyService = {
  // Programs
  getAllPrograms: async (): Promise<LoyaltyProgram[]> => {
    const response = await api.get(PROGRAMS_API);
    return response.data;
  },
  createProgram: async (program: LoyaltyProgram): Promise<LoyaltyProgram> => {
    const response = await api.post(PROGRAMS_API, program);
    return response.data;
  },
  updateProgram: async (id: number, program: LoyaltyProgram): Promise<LoyaltyProgram> => {
    const response = await api.put(`${PROGRAMS_API}/${id}`, program);
    return response.data;
  },
  deleteProgram: async (id: number): Promise<void> => {
    await api.delete(`${PROGRAMS_API}/${id}`);
  },

  // Tiers
  getTiersByProgram: async (programId: number): Promise<LoyaltyTier[]> => {
    const response = await api.get(`${TIERS_API}/program/${programId}`);
    return response.data;
  },
  createTier: async (tier: LoyaltyTier): Promise<LoyaltyTier> => {
    const response = await api.post(TIERS_API, tier);
    return response.data;
  },
  updateTier: async (id: number, tier: LoyaltyTier): Promise<LoyaltyTier> => {
    const response = await api.put(`${TIERS_API}/${id}`, tier);
    return response.data;
  },
  deleteTier: async (id: number): Promise<void> => {
    await api.delete(`${TIERS_API}/${id}`);
  },

  // Clients
  enrollUser: async (request: EnrollRequest): Promise<LoyaltyClient> => {
    const response = await api.post(`${CLIENTS_API}/enroll`, request);
    return response.data;
  },
  getClientByUser: async (userId: number): Promise<LoyaltyClient> => {
    const response = await api.get(`${CLIENTS_API}/${userId}`);
    return response.data;
  },
  getAllClients: async (): Promise<LoyaltyClient[]> => {
    const response = await api.get(CLIENTS_API);
    return response.data;
  },

  // Transactions
  addPoints: async (request: AddPointsRequest): Promise<void> => {
    await api.post(`${TRANSACTIONS_API}/add-points`, request);
  },
  redeemPoints: async (userId: number, points: number, reason: string): Promise<void> => {
    await api.post(`${TRANSACTIONS_API}/redeem`, null, {
      params: { userId, points, reason }
    });
  },
  getUserTransactions: async (userId: number): Promise<LoyaltyTransaction[]> => {
    const response = await api.get(`${TRANSACTIONS_API}/user/${userId}`);
    return response.data;
  }
};
