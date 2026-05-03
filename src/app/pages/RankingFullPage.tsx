import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Crown, Loader2, Star, Target, Zap } from 'lucide-react';
import { performanceService } from '@/services/performanceService';
import { RankingTable } from '@/app/components/performance/RankingTable';

export default function RankingFullPage() {
  const { data: performances, isLoading } = useQuery({
    queryKey: ['performances'],
    queryFn: performanceService.getAll,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <p className="text-muted-foreground">Calcul du classement mondial en cours...</p>
      </div>
    );
  }

  // Calcul des scores globaux par joueur
  const playerAggregations = performances?.reduce((acc: any, p) => {
    if (!acc[p.playerId]) {
      acc[p.playerId] = { playerId: p.playerId, goals: 0, assists: 0, ratingSum: 0, matches: 0, distance: 0 };
    }
    acc[p.playerId].goals += p.score;
    acc[p.playerId].assists += p.assists;
    acc[p.playerId].ratingSum += p.rating;
    acc[p.playerId].distance += p.distanceCovered;
    acc[p.playerId].matches += 1;
    return acc;
  }, {});

  const rankingData = Object.values(playerAggregations || {}).map((p: any) => ({
    name: `Joueur ${p.playerId}`,
    avatar: `J${p.playerId}`,
    position: 'Général',
    points: Math.round((p.goals * 10) + (p.assists * 5) + ((p.ratingSum / p.matches) * 10)), // Formule de score
    matches: p.matches,
    goals: p.goals,
    assists: p.assists,
    rating: parseFloat((p.ratingSum / p.matches).toFixed(1)),
    form: (p.ratingSum / p.matches) > 7.5 ? 'excellent' : 'good'
  })).sort((a: any, b: any) => b.points - a.points).map((p, i) => ({ ...p, rank: i + 1, previousRank: i + 1 }));

  const top3 = rankingData.slice(0, 3);
  const restOfPlayers = rankingData.slice(3);

  // Helper pour le podium
  const renderPodiumCard = (player: any, rank: number) => {
    if (!player) return null;
    
    const isFirst = rank === 1;
    const isSecond = rank === 2;
    const height = isFirst ? 'h-64' : isSecond ? 'h-52' : 'h-44';
    const bgColor = isFirst ? 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30' : 
                    isSecond ? 'from-gray-300/20 to-gray-300/5 border-gray-300/30' : 
                    'from-orange-500/20 to-orange-500/5 border-orange-500/30';
    const textColor = isFirst ? 'text-yellow-500' : isSecond ? 'text-gray-300' : 'text-orange-400';
    
    return (
      <div className={`flex flex-col items-center justify-end w-full md:w-1/3 relative z-${4-rank}`}>
        {/* Profile Info */}
        <div className={`flex flex-col items-center mb-4 transition-transform hover:-translate-y-2 ${isFirst ? 'scale-110' : ''}`}>
          <div className={`relative w-20 h-20 rounded-full bg-background border-4 flex items-center justify-center font-bold text-2xl shadow-xl mb-3
            ${isFirst ? 'border-yellow-500 text-yellow-500' : isSecond ? 'border-gray-400 text-gray-400' : 'border-orange-500 text-orange-500'}
          `}>
            {isFirst && <Crown className="absolute -top-6 w-8 h-8 text-yellow-500 fill-yellow-500" />}
            {player.avatar}
          </div>
          <div className="font-bold text-white text-lg">{player.name}</div>
          <div className={`font-black text-2xl ${textColor}`}>{player.points} pts</div>
        </div>

        {/* Podium Base */}
        <div className={`w-full ${height} bg-gradient-to-b ${bgColor} border-t-2 rounded-t-xl flex flex-col items-center pt-4 backdrop-blur-sm relative overflow-hidden`}>
          <div className={`text-6xl font-black opacity-20 ${textColor}`}>{rank}</div>
          <div className="absolute bottom-4 w-full px-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Buts</div>
              <div className="font-bold text-white">{player.goals}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Passes</div>
              <div className="font-bold text-white">{player.assists}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Note</div>
              <div className="font-bold text-white flex items-center justify-center gap-1">
                {player.rating}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-center flex-col text-center mb-12">
        <div className="h-16 w-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
          <Trophy className="h-8 w-8 text-yellow-500" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white uppercase mb-2">Classement Mondial</h1>
        <p className="text-muted-foreground max-w-lg">
          La compétition est rude. Seuls les meilleurs joueurs atteignent le sommet du classement grâce à leurs performances sur le terrain.
        </p>
      </div>

      {rankingData.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">Aucune donnée disponible pour établir le classement.</div>
      ) : (
        <>
          {/* Podium Section */}
          {top3.length > 0 && (
            <div className="flex items-end justify-center max-w-4xl mx-auto h-[400px] mb-16 px-4">
              {top3[1] && renderPodiumCard(top3[1], 2)}
              {top3[0] && renderPodiumCard(top3[0], 1)}
              {top3[2] && renderPodiumCard(top3[2], 3)}
            </div>
          )}

          {/* Table Section */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <Medal className="h-6 w-6 text-muted-foreground" />
              <h2 className="text-2xl font-bold">Suite du Classement</h2>
            </div>
            
            <div className="relative z-10">
              <RankingTable players={rankingData} category="general" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
