import { useQuery } from '@tanstack/react-query';
import { rankingService } from '@/services/rankingService';

export const useRanking = () => {
  return useQuery({
    queryKey: ['ranking'],
    queryFn: () => rankingService.getRanking(),
  });
};