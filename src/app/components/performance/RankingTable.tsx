import { Trophy, Medal, Award, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';

interface Player {
  rank: number;
  previousRank: number;
  name: string;
  avatar: string;
  position: string;
  points: number;
  matches: number;
  goals: number;
  assists: number;
  rating: number;
}

interface RankingTableProps {
  players: Player[];
  category?: 'general' | 'scorers' | 'assists' | 'defenders';
}

export function RankingTable({ players, category = 'general' }: RankingTableProps) {
  const [filterPeriod, setFilterPeriod] = useState<'week' | 'month' | 'season'>('month');
  const [filterPosition, setFilterPosition] = useState<string>('all');

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-600" />;
    return <span className="text-muted-foreground font-bold">{rank}</span>;
  };

  const getRankChange = (current: number, previous: number) => {
    if (current < previous)
      return (
        <div className="flex items-center gap-1 text-primary">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs">+{previous - current}</span>
        </div>
      );
    if (current > previous)
      return (
        <div className="flex items-center gap-1 text-destructive">
          <TrendingDown className="w-4 h-4" />
          <span className="text-xs">-{current - previous}</span>
        </div>
      );
    return <span className="text-xs text-muted-foreground">-</span>;
  };

  const categoryLabels = {
    general: 'Classement Général',
    scorers: 'Meilleurs Buteurs',
    assists: 'Meilleurs Passeurs',
    defenders: 'Meilleurs Défenseurs',
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3>{categoryLabels[category]}</h3>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value as any)}
              className="px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="season">Saison</option>
            </select>

            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tous postes</option>
              <option value="forward">Attaquants</option>
              <option value="midfielder">Milieux</option>
              <option value="defender">Défenseurs</option>
              <option value="goalkeeper">Gardiens</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-6 py-3">Rang</th>
              <th className="px-6 py-3">Joueur</th>
              <th className="px-6 py-3 text-center">Matchs</th>
              <th className="px-6 py-3 text-center">Buts</th>
              <th className="px-6 py-3 text-center">Passes D.</th>
              <th className="px-6 py-3 text-center">Note</th>
              <th className="px-6 py-3 text-center">Points</th>
              <th className="px-6 py-3 text-center">Évolution</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr
                key={player.rank}
                className={`border-b border-border hover:bg-muted/30 transition-colors ${
                  index < 3 ? 'bg-primary/5' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 text-center">{getRankIcon(player.rank)}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                      {player.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{player.name}</div>
                      <div className="text-xs text-muted-foreground">{player.position}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center font-semibold">{player.matches}</td>
                <td className="px-6 py-4 text-center">
                  <span className="font-semibold text-accent">{player.goals}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-semibold" style={{ color: '#06D6A0' }}>
                    {player.assists}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-semibold text-primary">{player.rating}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-bold text-lg">{player.points}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    {getRankChange(player.rank, player.previousRank)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 bg-muted/30 text-center">
        <button className="text-sm text-primary hover:underline">
          Voir le classement complet →
        </button>
      </div>
    </div>
  );
}
