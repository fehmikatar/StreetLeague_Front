import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Gift, Ticket, Copy, Check, Loader2, ShieldAlert } from 'lucide-react';
import { badgeService } from '@/services/badgeService';
import { promotionService } from '@/services/promotionService';

export default function MyRewards() {
  const storedUserId = localStorage.getItem('user_id');
  const playerId = storedUserId ? parseInt(storedUserId, 10) : 1;
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: earnedBadges, isLoading: loadingBadges, isError: errBadges } = useQuery({
    queryKey: ['earnedBadges', playerId],
    queryFn: () => badgeService.getEarnedByPlayer(playerId),
  });

  const { data: promotions, isLoading: loadingPromos, isError: errPromos } = useQuery({
    queryKey: ['availablePromotions'],
    queryFn: promotionService.getAvailable,
  });

  const isLoading = loadingBadges || loadingPromos;
  const isError = errBadges || errPromos;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <p className="text-muted-foreground">Chargement de vos récompenses...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-destructive">
        <ShieldAlert className="h-12 w-12 mb-4 opacity-50" />
        <p>Impossible de charger vos récompenses pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center">
          <Gift className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Mes Récompenses</h1>
          <p className="text-muted-foreground">
            Découvrez vos codes promotionnels débloqués grâce à vos performances.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Ticket className="h-5 w-5 text-accent" />
            Bons de réduction actifs
          </h2>

          {promotions?.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">Vous n'avez pas de promotions disponibles pour le moment.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {promotions?.map((promo) => (
                <div key={promo.id} className="relative bg-gradient-to-br from-card to-background border border-border rounded-2xl overflow-hidden group hover:border-primary/50 transition-all shadow-lg">
                  {/* Decorator */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10" />
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                          Réduction
                        </div>
                        <h3 className="text-xl font-bold">{promo.name}</h3>
                      </div>
                      <div className="bg-primary/20 text-primary font-bold px-3 py-1 rounded-full">
                        -{promo.discount}%
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-6">
                      Valable du {promo.startDate} au {promo.endDate}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted/50 border border-border border-dashed rounded-lg px-4 py-3 font-mono text-center tracking-widest font-bold">
                        {promo.promoCode}
                      </div>
                      <button
                        onClick={() => handleCopy(promo.promoCode)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-lg transition-all"
                        title="Copier le code"
                      >
                        {copiedCode === promo.promoCode ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-semibold mb-4 text-lg">Résumé du compte</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-border/50">
                <span className="text-muted-foreground">Badges débloqués</span>
                <span className="font-bold text-xl">{earnedBadges?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border/50">
                <span className="text-muted-foreground">Promotions actives</span>
                <span className="font-bold text-xl text-primary">{promotions?.length || 0}</span>
              </div>
            </div>

            <div className="mt-6 bg-accent/10 border border-accent/20 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-accent mb-2">Comment obtenir plus de codes ?</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Continuez à jouer des matchs et à atteindre de nouveaux seuils de performance. Le système vous attribuera automatiquement de nouveaux badges qui peuvent débloquer des codes promos exclusifs !
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
