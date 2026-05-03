import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StatsWidget } from '@/app/components/performance/StatsWidget';
import { BadgeCard } from '@/app/components/performance/BadgeCard';
import { LoyaltyCounter } from '@/app/components/performance/LoyaltyCounter';
import { RankingTable } from '@/app/components/performance/RankingTable';
import { LoadingState } from '@/app/components/states';
import { performanceService } from '@/services/performanceService';
import { playerLevelService } from '@/services/playerLevelService';
import { badgeService } from '@/services/badgeService';
import { rankingService } from '@/services/rankingService';
import { Link } from 'react-router';
import { Activity, TrendingUp, Award, Calendar } from 'lucide-react';

export default function PerformanceDashboard() {
  const playerId = 1; // À récupérer depuis useAuth plus tard

  const { data: performances, isLoading: perfLoading } = useQuery({
    queryKey: ['performances', playerId],
    queryFn: () => performanceService.getByPlayerId(playerId),
  });

  const { data: playerLevel, isLoading: levelLoading } = useQuery({
    queryKey: ['playerLevel', playerId],
    queryFn: () => playerLevelService.getByPlayerId(playerId),
  });

  const { data: badges, isLoading: badgesLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: badgeService.getAll,
  });

  const { data: earnedBadges, isLoading: earnedLoading } = useQuery({
    queryKey: ['earnedBadges', playerId],
    queryFn: () => badgeService.getEarnedByPlayer(playerId),
  });

  const { data: ranking, isLoading: rankingLoading } = useQuery({
    queryKey: ['ranking'],
    queryFn: rankingService.getRanking,
  });

  if (perfLoading || levelLoading || badgesLoading || earnedLoading || rankingLoading) {
    return <LoadingState message="Chargement des performances..." fullScreen />;
  }

  const totalGoals = performances?.reduce((sum, p) => sum + p.score, 0) || 0;
  const totalAssists = performances?.reduce((sum, p) => sum + p.assists, 0) || 0;
  const avgRating = performances?.length
    ? (performances.reduce((sum, p) => sum + p.rating, 0) / performances.length).toFixed(1)
    : '0.0';

  const recentBadges = earnedBadges?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2">Performance Dashboard</h1>
              <p className="text-muted-foreground">Suivez vos statistiques, badges et progression</p>
            </div>
            <div className="flex gap-3">
              <Link to="/app/performance/history" className="px-4 py-2 bg-muted hover:bg-muted/70 rounded-xl transition-all">
                <Calendar className="h-4 w-4 inline mr-2" />
                Historique
              </Link>
              <Link to="/app/performance/badges" className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg">
                <Award className="h-4 w-4 inline mr-2" />
                Tous mes badges
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsWidget label="Buts marqués" value={totalGoals} trend="up" trendValue="+3" icon={Activity} color="#F26419" />
          <StatsWidget label="Passes décisives" value={totalAssists} trend="up" trendValue="+2" icon={TrendingUp} color="#06D6A0" />
          <StatsWidget label="Note moyenne" value={avgRating} unit="/10" icon={Award} color="#1DB954" />
          <StatsWidget label="Matchs joués" value={performances?.length || 0} icon={Calendar} color="#FFD700" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <LoyaltyCounter currentPoints={playerLevel?.totalXp || 0} nextTierPoints={3000} tier="Gold" recentEarned={50} />
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3>Badges récents</h3>
                <Link to="/app/performance/badges" className="text-sm text-primary hover:underline">Voir tout →</Link>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {recentBadges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
                {recentBadges.length === 0 && <p className="col-span-3 text-center text-muted-foreground py-8">Aucun badge obtenu pour le moment.</p>}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-4">Classement</h3>
              <RankingTable players={ranking?.slice(0, 5) || []} compact />
              <Link to="/app/performance/ranking" className="block mt-4 text-sm text-primary hover:underline">Classement complet →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}