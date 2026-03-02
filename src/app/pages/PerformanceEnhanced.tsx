import { useState } from 'react';
import {
  Activity,
  Heart,
  Flame,
  Target,
  TrendingUp,
  Award,
  Zap,
  Moon,
  Users,
  Trophy,
  Shield,
  Clock,
  Settings,
  BarChart3,
} from 'lucide-react';
import { Link } from 'react-router';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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

type ViewMode = 'player' | 'captain' | 'admin';

export function PerformanceEnhanced() {
  const [viewMode, setViewMode] = useState<ViewMode>('player');

  // Player individual stats data
  const playerStats = {
    goals: 28,
    assists: 15,
    matchesPlayed: 42,
    minutesPlayed: 3240,
    rating: 8.4,
    yellowCards: 3,
    redCards: 0,
    cleanSheets: 12,
  };

  // Performance trend data (last 10 matches)
  const performanceTrend = [
    { match: 'M1', rating: 7.8, goals: 1, assists: 0 },
    { match: 'M2', rating: 8.2, goals: 2, assists: 1 },
    { match: 'M3', rating: 7.5, goals: 0, assists: 2 },
    { match: 'M4', rating: 8.9, goals: 3, assists: 1 },
    { match: 'M5', rating: 8.1, goals: 1, assists: 1 },
    { match: 'M6', rating: 7.9, goals: 1, assists: 0 },
    { match: 'M7', rating: 9.0, goals: 4, assists: 2 },
    { match: 'M8', rating: 8.4, goals: 2, assists: 1 },
    { match: 'M9', rating: 8.6, goals: 2, assists: 2 },
    { match: 'M10', rating: 8.8, goals: 3, assists: 1 },
  ];

  // Badges data with categories
  const badges = [
    {
      id: '1',
      name: 'Hat-trick Hero',
      description: 'Marquer 3 buts en un match',
      icon: '⚽',
      category: 'performance' as const,
      progress: 100,
      total: 100,
      earned: true,
      earnedDate: '15 Jan 2026',
      criteria: '3 buts en 1 match',
      points: 500,
    },
    {
      id: '2',
      name: 'Team Player',
      description: '10 passes décisives en un mois',
      icon: '🤝',
      category: 'social' as const,
      progress: 100,
      total: 100,
      earned: true,
      earnedDate: '28 Jan 2026',
      criteria: '10 assists/mois',
      points: 300,
    },
    {
      id: '3',
      name: 'Century Club',
      description: 'Atteindre 100 matchs joués',
      icon: '💯',
      category: 'achievement' as const,
      progress: 42,
      total: 100,
      earned: false,
      criteria: '100 matchs',
      points: 1000,
    },
    {
      id: '4',
      name: 'Golden Boot',
      description: 'Meilleur buteur de la saison',
      icon: '👟',
      category: 'performance' as const,
      progress: 75,
      total: 100,
      earned: false,
      criteria: 'Top scorer saison',
      points: 2000,
    },
    {
      id: '5',
      name: 'Loyal Member',
      description: '1 an de fidélité',
      icon: '🏆',
      category: 'loyalty' as const,
      progress: 100,
      total: 100,
      earned: true,
      earnedDate: '02 Jan 2026',
      criteria: '365 jours actif',
      points: 800,
    },
    {
      id: '6',
      name: 'Speed Demon',
      description: 'Top 10 en vitesse moyenne',
      icon: '⚡',
      category: 'performance' as const,
      progress: 65,
      total: 100,
      earned: false,
      criteria: 'Top 10 vitesse',
      points: 400,
    },
  ];

  // Ranking data
  const rankingData = [
    {
      rank: 1,
      previousRank: 1,
      name: 'Alex Rivera',
      avatar: 'AR',
      position: 'Attaquant',
      points: 2450,
      matches: 45,
      goals: 32,
      assists: 18,
      rating: 9.2,
    },
    {
      rank: 2,
      previousRank: 3,
      name: 'Jordan Smith',
      avatar: 'JS',
      position: 'Milieu',
      points: 2340,
      matches: 42,
      goals: 28,
      assists: 15,
      rating: 8.4,
    },
    {
      rank: 3,
      previousRank: 2,
      name: 'Morgan Lee',
      avatar: 'ML',
      position: 'Milieu',
      points: 2320,
      matches: 43,
      goals: 15,
      assists: 28,
      rating: 8.8,
    },
    {
      rank: 4,
      previousRank: 5,
      name: 'Taylor Brooks',
      avatar: 'TB',
      position: 'Attaquant',
      points: 2180,
      matches: 38,
      goals: 20,
      assists: 15,
      rating: 8.1,
    },
    {
      rank: 5,
      previousRank: 4,
      name: 'Casey Kim',
      avatar: 'CK',
      position: 'Gardien',
      points: 2150,
      matches: 42,
      goals: 0,
      assists: 8,
      rating: 8.5,
    },
  ];

  // Team comparison data (Captain view)
  const teamComparison = [
    {
      player: 'Alex R.',
      goals: 32,
      assists: 18,
      rating: 9.2,
      form: 'excellent',
    },
    {
      player: 'Jordan S.',
      goals: 28,
      assists: 15,
      rating: 8.4,
      form: 'good',
    },
    {
      player: 'Morgan L.',
      goals: 15,
      assists: 28,
      rating: 8.8,
      form: 'excellent',
    },
    {
      player: 'Taylor B.',
      goals: 20,
      assists: 15,
      rating: 8.1,
      form: 'good',
    },
  ];

  const teamStats = {
    totalGoals: 156,
    totalAssists: 98,
    averageRating: 8.5,
    matchesWon: 48,
    winRate: 72,
  };

  // Admin badge configuration
  const badgeCategories = [
    { id: 'performance', name: 'Performance', count: 12, color: '#F26419' },
    { id: 'achievement', name: 'Achievements', count: 8, color: '#1DB954' },
    { id: 'social', name: 'Social', count: 6, color: '#06D6A0' },
    { id: 'loyalty', name: 'Loyalty', count: 4, color: '#FFD700' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="mb-2">Performance & Health Tracker</h1>
              <p className="text-muted-foreground">
                Automated statistics and real-time tracking
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-2 rounded-full">
                <Zap className="w-4 h-4 animate-pulse" />
                <span>Statistics automatically updated</span>
              </div>
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                <Activity className="h-4 w-4 inline mr-2" />
                Sync Devices
              </button>
            </div>
          </div>

          {/* View Mode Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('player')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'player'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-muted hover:bg-muted/70'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Player view
            </button>
            <button
              onClick={() => setViewMode('captain')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'captain'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-muted hover:bg-muted/70'
              }`}
            >
              <Shield className="h-4 w-4 inline mr-2" />
              Captain view
            </button>
            <button
              onClick={() => setViewMode('admin')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'admin'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-muted hover:bg-muted/70'
              }`}
            >
              <Settings className="h-4 w-4 inline mr-2" />
              Admin view
            </button>
          </div>
        </div>
      </div>

      {/* Healthcare Navigation Modules */}
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
            <Link
              to="/app/healthcare"
              className="px-6 py-4 bg-card hover:bg-primary/10 border border-border hover:border-primary/50 rounded-xl transition-all flex items-center justify-center gap-3"
            >
              <Heart className="h-6 w-6 text-primary" />
              <div className="text-center">
                <div className="font-bold text-lg">Healthcare Module</div>
                <div className="text-xs text-muted-foreground">
                  Complete health tracking, medical records & nutrition management
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* PLAYER VIEW */}
        {viewMode === 'player' && (
          <>
            {/* Individual Stats - Automated */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Individual Statistics</h2>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Last update: 2 min (automatique)</span>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsWidget
                  label="Buts Marqués"
                  value={playerStats.goals}
                  trend="up"
                  trendValue="+3 ce mois"
                  icon={Target}
                  color="#F26419"
                  automated={true}
                />
                <StatsWidget
                  label="Passes Décisives"
                  value={playerStats.assists}
                  trend="up"
                  trendValue="+2 ce mois"
                  icon={Zap}
                  color="#06D6A0"
                  automated={true}
                />
                <StatsWidget
                  label="Matchs Joués"
                  value={playerStats.matchesPlayed}
                  trend="stable"
                  icon={Activity}
                  color="#1DB954"
                  automated={true}
                />
                <StatsWidget
                  label="Note Moyenne"
                  value={playerStats.rating}
                  unit="/10"
                  trend="up"
                  trendValue="+0.3"
                  icon={Trophy}
                  color="#FFD700"
                  automated={true}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Performance Trend Chart */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-6">
                    <h3>Performance Evolution</h3>
                    <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      <Zap className="w-3 h-3" />
                      Auto-calculated
                    </div>
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
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1E293B',
                          border: '1px solid rgba(248, 250, 252, 0.1)',
                          borderRadius: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="rating"
                        stroke="#1DB954"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRating)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <span className="text-sm text-muted-foreground">Rating per match</span>
                    </div>
                  </div>
                </div>

                {/* Badges Gallery with Categories */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-accent" />
                      <h3>Badge Gallery</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {badges.filter((b) => b.earned).length}/{badges.length} Obtenus
                      </span>
                      <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        <Zap className="w-3 h-3" />
                        Attribution auto
                      </div>
                    </div>
                  </div>

                  {/* Category filters */}
                  <div className="flex gap-2 mb-6 flex-wrap">
                    {['all', 'performance', 'achievement', 'social', 'loyalty'].map((cat) => (
                      <button
                        key={cat}
                        className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/70 transition-all"
                      >
                        {cat === 'all' ? 'Tous' : cat}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {badges.map((badge) => (
                      <BadgeCard key={badge.id} badge={badge} />
                    ))}
                  </div>
                </div>

                {/* Ranking Section */}
                <div>
                  <h2 className="text-xl font-bold mb-4">Classement</h2>
                  <RankingTable players={rankingData} category="general" />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Loyalty Points Counter - Real-time */}
                <LoyaltyCounter
                  currentPoints={2340}
                  nextTierPoints={3000}
                  tier="Gold"
                  recentEarned={150}
                />

                {/* Additional Stats */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="mb-6">Detailed Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
                      <span className="text-sm text-muted-foreground">Minutes Played</span>
                      <span className="font-bold">{playerStats.minutesPlayed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
                      <span className="text-sm text-muted-foreground">Clean Sheets</span>
                      <span className="font-bold text-primary">{playerStats.cleanSheets}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
                      <span className="text-sm text-muted-foreground">Yellow cards</span>
                      <span className="font-bold text-accent">{playerStats.yellowCards}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
                      <span className="text-sm text-muted-foreground">Red cards</span>
                      <span className="font-bold text-destructive">{playerStats.redCards}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="mb-6">This month</h3>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-primary/5 rounded-xl">
                      <div className="text-3xl font-bold text-primary mb-1">8</div>
                      <div className="text-sm text-muted-foreground">Played matches</div>
                    </div>
                    <div className="text-center p-4 bg-accent/5 rounded-xl">
                      <div className="text-3xl font-bold text-accent mb-1">720</div>
                      <div className="text-sm text-muted-foreground">Minutes</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-xl">
                      <div className="text-3xl font-bold" style={{ color: '#06D6A0' }}>
                        5
                      </div>
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
              <h2 className="text-xl font-bold mb-6">Statistiques Collectives de l'Équipe</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-xl">
                  <div className="text-3xl font-bold text-primary mb-1">{teamStats.totalGoals}</div>
                  <div className="text-sm text-muted-foreground">Buts Totaux</div>
                </div>
                <div className="text-center p-4 bg-accent/5 rounded-xl">
                  <div className="text-3xl font-bold text-accent mb-1">{teamStats.totalAssists}</div>
                  <div className="text-sm text-muted-foreground">Passes D.</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-xl">
                  <div className="text-3xl font-bold" style={{ color: '#06D6A0' }}>
                    {teamStats.averageRating}
                  </div>
                  <div className="text-sm text-muted-foreground">Note Moyenne</div>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-xl">
                  <div className="text-3xl font-bold text-primary mb-1">{teamStats.matchesWon}</div>
                  <div className="text-sm text-muted-foreground">Victoires</div>
                </div>
                <div className="text-center p-4 bg-accent/5 rounded-xl">
                  <div className="text-3xl font-bold text-accent mb-1">{teamStats.winRate}%</div>
                  <div className="text-sm text-muted-foreground">Taux Victoire</div>
                </div>
              </div>
            </div>

            {/* Player Comparison Table */}
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
                    {teamComparison.map((player, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/30">
                        <td className="px-6 py-4 font-semibold">{player.player}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-accent">{player.goals}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold" style={{ color: '#06D6A0' }}>
                            {player.assists}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-primary">{player.rating}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              player.form === 'excellent'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-accent/10 text-accent'
                            }`}
                          >
                            {player.form}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Strategy Insights */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="mb-4">Insights Stratégiques</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-primary mb-1">Force Offensive</p>
                        <p className="text-muted-foreground">
                          L'équipe performe mieux en attaque avec Alex et Jordan sur le terrain
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-accent mb-1">Solidité Défensive</p>
                        <p className="text-muted-foreground">
                          12 clean sheets ce mois - meilleure défense de la ligue
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="mb-4">Recommandations</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold mb-1">Rotation Suggérée</p>
                        <p className="text-muted-foreground">
                          Considérer une rotation pour Alex R. (fatigue détectée)
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold mb-1">Formation Optimale</p>
                        <p className="text-muted-foreground">
                          Formation 4-3-3 recommandée pour le prochain match
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN VIEW */}
        {viewMode === 'admin' && (
          <div className="space-y-8">
            {/* Badge Configuration */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Configuration des Badges</h2>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all">
                  + Nouveau Badge
                </button>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-6">
                {badgeCategories.map((category) => (
                  <div
                    key={category.id}
                    className="p-4 rounded-xl border-2 border-border hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Award className="h-5 w-5" style={{ color: category.color }} />
                      </div>
                      <span className="text-2xl font-bold">{category.count}</span>
                    </div>
                    <p className="text-sm font-semibold">{category.name}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {badges.slice(0, 3).map((badge) => (
                  <div
                    key={badge.id}
                    className="p-4 bg-muted/30 rounded-xl flex items-center justify-between hover:bg-muted/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{badge.icon}</div>
                      <div>
                        <p className="font-semibold">{badge.name}</p>
                        <p className="text-sm text-muted-foreground">{badge.criteria}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-primary">+{badge.points} pts</span>
                      <button className="px-3 py-1 bg-muted hover:bg-muted/70 rounded-lg text-sm transition-all">
                        Modifier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loyalty Rules Management */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Gestion des Règles de Fidélité</h2>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all">
                  + Nouvelle Règle
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">Victoire en Match</p>
                        <p className="text-sm text-muted-foreground">Points gagnés par victoire</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-primary">+50 pts</span>
                      <button className="px-3 py-1 bg-muted hover:bg-muted/70 rounded-lg text-sm transition-all">
                        Modifier
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Zap className="w-3 h-3" />
                    <span>Attribution automatique après chaque match</span>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-accent" />
                      <div>
                        <p className="font-semibold">But Marqué</p>
                        <p className="text-sm text-muted-foreground">Points par but</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-accent">+20 pts</span>
                      <button className="px-3 py-1 bg-muted hover:bg-muted/70 rounded-lg text-sm transition-all">
                        Modifier
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Zap className="w-3 h-3" />
                    <span>Calculé automatiquement depuis les statistiques de match</span>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5" style={{ color: '#06D6A0' }} />
                      <div>
                        <p className="font-semibold">Passe Décisive</p>
                        <p className="text-sm text-muted-foreground">Points par assist</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold" style={{ color: '#06D6A0' }}>
                        +15 pts
                      </span>
                      <button className="px-3 py-1 bg-muted hover:bg-muted/70 rounded-lg text-sm transition-all">
                        Modifier
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Zap className="w-3 h-3" />
                    <span>Attribution automatique en temps réel</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Dashboard */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-xl font-bold mb-6">Analytics & Métriques</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-primary/5 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-primary mb-1">156</div>
                  <div className="text-sm text-muted-foreground">Badges Attribués (auto)</div>
                </div>
                <div className="text-center p-6 bg-accent/5 rounded-xl">
                  <Trophy className="h-8 w-8 text-accent mx-auto mb-3" />
                  <div className="text-3xl font-bold text-accent mb-1">2.4K</div>
                  <div className="text-sm text-muted-foreground">Points Distribués</div>
                </div>
                <div className="text-center p-6 bg-muted/30 rounded-xl">
                  <Users className="h-8 w-8 mx-auto mb-3" style={{ color: '#06D6A0' }} />
                  <div className="text-3xl font-bold" style={{ color: '#06D6A0' }}>
                    98%
                  </div>
                  <div className="text-sm text-muted-foreground">Taux Engagement</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}