import { useQuery } from '@tanstack/react-query';
import { History, Activity, Calendar, Trophy, Zap, Clock, Star, Loader2, Target } from 'lucide-react';
import { performanceService } from '@/services/performanceService';

export default function PerformanceHistory() {
  const storedUserId = localStorage.getItem('user_id');
  const playerId = storedUserId ? parseInt(storedUserId, 10) : 1;

  const { data: performances, isLoading } = useQuery({
    queryKey: ['performances'],
    queryFn: performanceService.getAll,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <p className="text-muted-foreground">Chargement de votre historique...</p>
      </div>
    );
  }

  // Filtrer les performances du joueur et les trier par date décroissante
  const myPerformances = performances?.filter(p => p.playerId === playerId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-14 w-14 rounded-2xl bg-accent/20 flex items-center justify-center">
          <History className="h-7 w-7 text-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Historique des Matchs</h1>
          <p className="text-muted-foreground">
            Retracez chacune de vos apparitions sur le terrain et analysez votre progression.
          </p>
        </div>
      </div>

      {myPerformances.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-bold text-white mb-2">Aucune performance trouvée</h3>
          <p className="text-muted-foreground">Participez à votre premier match pour voir vos statistiques ici !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myPerformances.map((perf, index) => (
            <div key={perf.id} className="bg-card border border-border hover:border-primary/50 transition-all rounded-2xl p-6 shadow-sm group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Date & Context */}
                <div className="flex items-center gap-4 md:w-1/4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Match {myPerformances.length - index}</div>
                    <div className="text-xs text-muted-foreground">{new Date(perf.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                </div>

                {/* Main Stats (Goals/Assists) */}
                <div className="flex gap-8 md:w-1/3 justify-center">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1 justify-center">
                      <Target className="h-4 w-4 text-orange-400" /> Buts
                    </div>
                    <div className="text-2xl font-bold text-white">{perf.score}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1 justify-center">
                      <Zap className="h-4 w-4 text-green-400" /> Passes
                    </div>
                    <div className="text-2xl font-bold text-white">{perf.assists}</div>
                  </div>
                </div>

                {/* Rating & Physical */}
                <div className="flex items-center justify-between md:w-1/3 gap-4">
                  <div className="bg-muted/30 rounded-xl px-4 py-2 flex-1">
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Temps de jeu</div>
                    <div className="font-semibold text-white">{perf.timePlayed} min</div>
                  </div>
                  <div className="bg-muted/30 rounded-xl px-4 py-2 flex-1">
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Distance</div>
                    <div className="font-semibold text-white">{perf.distanceCovered.toFixed(1)} km</div>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex flex-col items-center justify-center min-w-[80px]">
                    <div className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Note</div>
                    <div className="text-xl font-black text-primary flex items-center gap-1">
                      {perf.rating} <Star className="w-4 h-4 fill-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
