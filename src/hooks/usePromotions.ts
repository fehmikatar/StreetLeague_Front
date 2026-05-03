import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promotionService } from '@/services/promotionService';
import { PromotionRequest } from '@/types/promotion';

// Récupérer toutes les promotions
export const usePromotions = () => {
  return useQuery({
    queryKey: ['promotions'],
    queryFn: promotionService.getAll,
  });
};

// Récupérer les promotions disponibles pour le joueur
export const useAvailablePromotions = () => {
  return useQuery({
    queryKey: ['availablePromotions'],
    queryFn: promotionService.getAvailable,
  });
};

// Créer une promotion
export const useCreatePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PromotionRequest) => promotionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      queryClient.invalidateQueries({ queryKey: ['availablePromotions'] });
    },
  });
};

// Mettre à jour une promotion
export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PromotionRequest }) =>
      promotionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      queryClient.invalidateQueries({ queryKey: ['availablePromotions'] });
    },
  });
};

// Supprimer une promotion
export const useDeletePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => promotionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      queryClient.invalidateQueries({ queryKey: ['availablePromotions'] });
    },
  });
};