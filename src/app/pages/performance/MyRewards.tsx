import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { playerLevelService } from '@/services/playerLevelService';
import { promotionService } from '@/services/promotionService';
import { LoadingState } from '@/app/components/states';
import { LoyaltyCounter } from '@/app/components/performance/LoyaltyCounter';
import { Card } from '@/app/components/ui/card';
import { Gift, Tag, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function MyRewards() {
  const { user } = useAuth();
  const playerId = user?.id || 1;

  const { data: playerLevel, isLoading: levelLoading } = useQuery({
    queryKey: ['playerLevel', playerId],
    queryFn: () => playerLevelService.getByPlayerId(playerId),
  });

  const { data: promotions, isLoading: promoLoading } = useQuery({
    queryKey: ['availablePromotions'],
    queryFn: promotionService.getAvailable,
  });

  if (levelLoading || promoLoading) return <LoadingState message="Chargement de vos récompenses..." fullScreen />;

  const currentXp = playerLevel?.totalXp || 0;
  const currentLevel = playerLevel?.currentLevel || 1;
  const nextLevelXp = (currentLevel + 1) * 500; // estimation

  const getTierName = (level: number) => {
    if (level >= 20) return 'Platinum';
    if (level >= 10) return 'Gold';
    if (level >= 5) return 'Silver';
    return 'Bronze';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <h1 className="mb-2">Mes Récompenses</h1>
          <p className="text-muted-foreground">Points de fidélité, niveau et promotions exclusives</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <LoyaltyCounter currentPoints={currentXp} nextTierPoints={nextLevelXp} tier={getTierName(currentLevel)} recentEarned={0} />
          </div>
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Gift className="h-5 w-5 text-primary" />
                <h3>Promotions disponibles</h3>
              </div>
              {!promotions?.length ? (
                <p className="text-muted-foreground text-center py-8">Aucune promotion disponible pour le moment.</p>
              ) : (
                <div className="space-y-4">
                  {promotions.map((promo) => (
                    <div key={promo.id} className="p-4 bg-muted/30 rounded-xl border border-border hover:border-primary/50 transition-all">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold mb-1">{promo.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Tag className="h-4 w-4" />
                            <code className="bg-background px-2 py-1 rounded">{promo.promoCode}</code>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> Expire le {format(new Date(promo.endDate), 'dd/MM/yyyy')}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">-{promo.discount}%</div>
                          <button className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-all">
                            Utiliser <ArrowRight className="h-3 w-3 inline ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}