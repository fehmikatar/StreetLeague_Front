import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Heart,
  Target,
  TrendingUp,
  Award,
  Zap,
  Users,
  Shield,
  Clock,
  Settings,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

import { StatsWidget } from '@/app/components/performance/StatsWidget';
import { BadgeCard } from '@/app/components/performance/BadgeCard';
import { LoyaltyCounter } from '@/app/components/performance/LoyaltyCounter';
import { RankingTable } from '@/app/components/performance/RankingTable';

// API Services
import { performanceService } from '@/services/performanceService';
import { badgeService } from '@/services/badgeService';
import { badgePlayerService } from '@/services/badgePlayerService';
import { playerLevelService } from '@/services/playerLevelService';

// Admin CRUD Dashboards
import PerformanceDashboardAdmin from '@/app/pages/PerformanceDashboard';
import BadgeManagement from '@/app/pages/BadgeManagement';
import PromotionManagement from '@/app/pages/PromotionManagement';

type ViewMode = 'player' | 'captain' | 'admin';
type AdminTab = 'performances' | 'badges' | 'promotions';

export function PerformanceEnhanced() {
  const userRole = localStorage.getItem('user_type') || 'player';
  const storedUserId = localStorage.getItem('user_id');
  const playerId = storedUserId ? parseInt(storedUserId, 10) : 1;

  const [viewMode, setViewMode] = useState<ViewMode>(userRole === 'ROLE_ADMIN' ? 'admin' : 'player');
  const [adminTab, setAdminTab] = useState<AdminTab>('performances');
  // 1. Fetch Backend Data
  const { data: performances, isLoading: loadingPerf } = useQuery({
    queryKey: ['performances'],
    queryFn: performanceService.getAll,
  });

  const { data: badges, isLoading: loadingBadges } = useQuery({
    queryKey: ['badges'],
    queryFn: badgeService.getAll,
  });

  const { data: earnedBadges, isLoading: loadingEarned } = useQuery({
    queryKey: ['earnedBadges', playerId],
    queryFn: () => badgePlayerService.getEarnedByPlayer(playerId),
  });

  const { data: playerLevel, isLoading: loadingLevel } = useQuery({
    queryKey: ['playerLevel', playerId],
    queryFn: () => playerLevelService.getByPlayerId(playerId),
  });

  const isLoading = loadingPerf || loadingBadges || loadingEarned || loadingLevel;

  // 2. Data Processing (Calculations based strictly on Backend DTOs)

  // --- PLAYER STATS ---
  const playerPerfs = performances?.filter(p => p.playerId === playerId) || [];
  const playerStats = {
    goals: playerPerfs.reduce((acc, p) => acc + p.score, 0),
    assists: playerPerfs.reduce((acc, p) => acc + p.assists, 0),
    matchesPlayed: playerPerfs.length,
    minutesPlayed: playerPerfs.reduce((acc, p) => acc + p.timePlayed, 0),
    distanceCovered: playerPerfs.reduce((acc, p) => acc + p.distanceCovered, 0),
    rating: playerPerfs.length > 0 ? (playerPerfs.reduce((acc, p) => acc + p.rating, 0) / playerPerfs.length).toFixed(1) : '0.0',
  };

  const performanceTrend = playerPerfs.slice(-10).map((p, i) => ({
    match: `M${i + 1}`,
    rating: p.rating,
    goals: p.score,
    assists: p.assists
  }));

  const badgesWithStatus = badges?.map(b => ({
    ...b,
    earned: earnedBadges?.some(eb => eb.badge.id === b.id) || false,
    earnedDate: earnedBadges?.find(eb => eb.badge.id === b.id)?.obtainDate,
    progress: Math.min(playerLevel?.xp || 0, b.requiredXp),
  })) || [];

  // --- TEAM STATS (Captain View) ---
  const teamStats = {
    totalGoals: performances?.reduce((acc, p) => acc + p.score, 0) || 0,
    totalAssists: performances?.reduce((acc, p) => acc + p.assists, 0) || 0,
    averageRating: performances?.length ? (performances.reduce((acc, p) => acc + p.rating, 0) / performances.length).toFixed(1) : '0.0',
    totalDistance: performances?.reduce((acc, p) => acc + p.distanceCovered, 0) || 0,
    matchesPlayed: performances?.length || 0,
  };

  // Ranking & Comparison calculation (Aggregating per player)
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
    position: 'G├®n├®ral',
    points: Math.round((p.goals * 10) + (p.assists * 5) + ((p.ratingSum / p.matches) * 10)), // Computed score
    matches: p.matches,
    goals: p.goals,
    assists: p.assists,
    rating: parseFloat((p.ratingSum / p.matches).toFixed(1)),
    form: (p.ratingSum / p.matches) > 7.5 ? 'excellent' : 'good'
  })).sort((a, b) => b.points - a.points).map((p, i) => ({ ...p, rank: i + 1, previousRank: i + 1 }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="mb-2">Performance & Health Tracker</h1>
              <p className="text-muted-foreground">
                Automated statistics and real-time tracking from Database
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-2 rounded-full">
                <Zap className="w-4 h-4 animate-pulse" />
                <span>Synchronisation API En Direct</span>
              </div>
            </div>
          </div>

          {/* View Mode Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('player')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'player' ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted hover:bg-muted/70'
                }`}
            >
              <Users className="h-4 w-4 inline mr-2" /> Player view
            </button>
            <button
              onClick={() => setViewMode('captain')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'captain' ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted hover:bg-muted/70'
                }`}
            >
              <Shield className="h-4 w-4 inline mr-2" /> Captain view
            </button>
            <button
              onClick={() => setViewMode('admin')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'admin' ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted hover:bg-muted/70'
                }`}
            >
              <Settings className="h-4 w-4 inline mr-2" /> Admin view
            </button>
          </div>
        </div>
      </div>

      {/* Healthcare Module Placement (kept from original) */}
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <Link
            to="/app/healthcare"
            className="px-6 py-4 bg-card hover:bg-primary/10 border border-border hover:border-primary/50 rounded-xl transition-all flex items-center justify-center gap-3"
          >
            <Heart className="h-6 w-6 text-primary" />
            <div className="text-center">
              <div className="font-bold text-lg">Healthcare Module</div>
              <div className="text-xs text-muted-foreground">Complete health tracking, medical records & nutrition management</div>
            </div>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-primary">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p>Chargement des donn├®es depuis le Backend...</p>
          </div>
        ) : (
          <>
            {/* PLAYER VIEW */}
            {viewMode === 'player' && (
              <>
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Individual Statistics</h2>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Synchronis├® avec l'API</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsWidget label="Buts Marqu├®s" value={playerStats.goals} icon={Target} color="#F26419" automated={true} />
                    <StatsWidget label="Passes D├®cisives" value={playerStats.assists} icon={Zap} color="#06D6A0" automated={true} />
                    <StatsWidget label="Matchs Jou├®s" value={playerStats.matchesPlayed} icon={Activity} color="#1DB954" automated={true} />
                    <StatsWidget label="Note Moyenne" value={playerStats.rating} unit="/10" icon={Award} color="#FFD700" automated={true} />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Performance Trend Chart */}
                    <div className="bg-card rounded-2xl p-6 border border-border">
                      <div className="flex items-center justify-between mb-6">
                        <h3>Performance Evolution</h3>
                      </div>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={performanceTrend}>
                          <defs>
                            <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1DB954" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#1DB954" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(248, 250, 252, 0.1)" />
                          <XAxis dataKey="match" stroke="#94A3B8" />
                          <YAxis stroke="#94A3B8" domain={[0, 10]} />
                          <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none' }} />
                          <Area type="monotone" dataKey="rating" stroke="#1DB954" strokeWidth={3} fillOpacity={1} fill="url(#colorRating)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Badges Gallery */}
                    <div className="bg-card rounded-2xl p-6 border border-border">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-accent" />
                          <h3>Badge Gallery</h3>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {badgesWithStatus.filter(b => b.earned).length}/{badgesWithStatus.length} Obtenus
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {badgesWithStatus.map((badge) => (
                          <BadgeCard key={badge.id} badge={badge} />
                        ))}
                      </div>
                    </div>

                    {/* Ranking Section */}
                    <div>
                      <h2 className="text-xl font-bold mb-4">Classement G├®n├®ral</h2>
                      <RankingTable players={rankingData} category="general" />
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Loyalty Points Counter */}
                    <LoyaltyCounter
                      currentPoints={playerLevel?.xp || 0}
                      nextTierPoints={(playerLevel?.level || 1) * 1000} // Formule XP mock
                      tier={playerLevel?.rank || "Novice"}
                      recentEarned={0}
                    />

                    {/* Additional Stats (Strictly Backend Based) */}
                    <div className="bg-card rounded-2xl p-6 border border-border">
                      <h3 className="mb-6">Detailed Statistics</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
                          <span className="text-sm text-muted-foreground">Minutes Played</span>
                          <span className="font-bold">{playerStats.minutesPlayed}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
                          <span className="text-sm text-muted-foreground">Distance Covered</span>
                          <span className="font-bold text-primary">{playerStats.distanceCovered.toFixed(1)} km</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-card rounded-2xl p-6 border border-border">
                      <h3 className="mb-6">This month</h3>
                      <div className="space-y-4">
                        <div className="text-center p-4 bg-primary/5 rounded-xl">
                          <div className="text-3xl font-bold text-primary mb-1">{playerStats.matchesPlayed}</div>
                          <div className="text-sm text-muted-foreground">Played matches</div>
                        </div>
                        <div className="text-center p-4 bg-accent/5 rounded-xl">
                          <div className="text-3xl font-bold text-accent mb-1">{playerStats.minutesPlayed}</div>
                          <div className="text-sm text-muted-foreground">Minutes</div>
                        </div>
                        <div className="text-center p-4 bg-muted/30 rounded-xl">
                          <div className="text-3xl font-bold text-green-400">{playerStats.goals}</div>
                          <div className="text-sm text-muted-foreground">Goals Scored</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* CAPTAIN VIEW */}
            {viewMode === 'captain' && (
              <div className="space-y-8">
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h2 className="text-xl font-bold mb-6">Statistiques Collectives de l'├ëquipe</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-primary/5 rounded-xl">
                      <div className="text-3xl font-bold text-primary mb-1">{teamStats.totalGoals}</div>
                      <div className="text-sm text-muted-foreground">Buts Totaux</div>
                    </div>
                    <div className="text-center p-4 bg-accent/5 rounded-xl">
                      <div className="text-3xl font-bold text-accent mb-1">{teamStats.totalAssists}</div>
                      <div className="text-sm text-muted-foreground">Passes D.</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-xl">
                      <div className="text-3xl font-bold" style={{ color: '#06D6A0' }}>{teamStats.averageRating}</div>
                      <div className="text-sm text-muted-foreground">Note Moyenne</div>
                    </div>
                    <div className="text-center p-4 bg-primary/5 rounded-xl">
                      <div className="text-3xl font-bold text-primary mb-1">{teamStats.matchesPlayed}</div>
                      <div className="text-sm text-muted-foreground">Matchs Cumul├®s</div>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h2 className="text-xl font-bold mb-6">Comparaison des Joueurs</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/30">
                        <tr className="text-left text-xs text-muted-foreground">
                          <th className="px-6 py-3">Joueur</th>
                          <th className="px-6 py-3 text-center">Buts</th>
                          <th className="px-6 py-3 text-center">Passes D.</th>
                          <th className="px-6 py-3 text-center">Note</th>
                          <th className="px-6 py-3 text-center">Forme</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rankingData.map((player, index) => (
                          <tr key={index} className="border-b border-border hover:bg-muted/30">
                            <td className="px-6 py-4 font-semibold">{player.name}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="font-bold text-accent">{player.goals}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="font-bold text-green-400">{player.assists}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="font-bold text-primary">{player.rating}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${player.form === 'excellent' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                                }`}>
                                {player.form}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-2xl p-6 border border-border">
                    <h3 className="mb-4">Insights Strat├®giques</h3>
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-primary mb-1">Activit├® de l'├®quipe</p>
                          <p className="text-muted-foreground">Distance totale parcourue : {teamStats.totalDistance.toFixed(1)} km</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ADMIN VIEW - CRUD COMPONENT INJECTED */}
            {viewMode === 'admin' && (
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="flex gap-2 p-4 border-b border-border bg-muted/20">
                  <button
                    onClick={() => setAdminTab('performances')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      adminTab === 'performances' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    Performances
                  </button>
                  <button
                    onClick={() => setAdminTab('badges')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      adminTab === 'badges' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    Badges
                  </button>
                  <button
                    onClick={() => setAdminTab('promotions')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      adminTab === 'promotions' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    Promotions
                  </button>
                </div>
                
                <div className="p-2">
                  {adminTab === 'performances' && <PerformanceDashboardAdmin />}
                  {adminTab === 'badges' && <BadgeManagement />}
                  {adminTab === 'promotions' && <PromotionManagement />}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
