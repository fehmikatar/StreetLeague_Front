import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { badgeService } from '@/services/badgeService';
import { BadgeRequest } from '@/types/badge';

// Récupérer tous les badges
export const useBadges = () => {
  return useQuery({
    queryKey: ['badges'],
    queryFn: badgeService.getAll,
  });
};

// Récupérer un badge par son ID
export const useBadge = (id: number) => {
  return useQuery({
    queryKey: ['badges', id],
    queryFn: () => badgeService.getById(id),
    enabled: !!id,
  });
};

// Récupérer les badges obtenus par un joueur
export const useEarnedBadges = (playerId: number) => {
  return useQuery({
    queryKey: ['earnedBadges', playerId],
    queryFn: () => badgeService.getEarnedByPlayer(playerId),
    enabled: !!playerId,
  });
};

// Créer un badge
export const useCreateBadge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BadgeRequest) => badgeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
    },
  });
};

// Mettre à jour un badge
export const useUpdateBadge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BadgeRequest }) =>
      badgeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
    },
  });
};

// Supprimer un badge
export const useDeleteBadge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => badgeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
    },
  });
};