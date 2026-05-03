import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playerLevelService } from '@/services/playerLevelService';

export const usePlayerLevel = (playerId: number) => {
  return useQuery({
    queryKey: ['playerLevel', playerId],
    queryFn: () => playerLevelService.getByPlayerId(playerId),
    enabled: !!playerId,
  });
};

export const useAddXp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ playerId, xpGained }: { playerId: number; xpGained: number }) =>
      playerLevelService.addXp(playerId, xpGained),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playerLevel', variables.playerId] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
    },
  });
};