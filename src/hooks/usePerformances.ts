import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceService } from '@/services/performanceService';
import { PerformanceRequest } from '@/types/performance';

export const usePerformances = (playerId?: number) => {
  return useQuery({
    queryKey: ['performances', playerId],
    queryFn: () => playerId ? performanceService.getByPlayerId(playerId) : performanceService.getAll(),
    
  });
};

export const useCreatePerformance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PerformanceRequest) => performanceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performances'] });
      queryClient.invalidateQueries({ queryKey: ['playerLevel'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
    },
  });
};