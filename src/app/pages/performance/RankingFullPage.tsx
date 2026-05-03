import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RankingTable } from '@/app/components/performance/RankingTable';
import { LoadingState } from '@/app/components/states';
import { rankingService } from '@/services/rankingService';
import { Search } from 'lucide-react';

export default function RankingFullPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [position, setPosition] = useState('all');
  const [period, setPeriod] = useState<'week' | 'month' | 'season'>('season');

  const { data: ranking, isLoading } = useQuery({
    queryKey: ['ranking', period],
    queryFn: () => rankingService.getRanking(),
  });

  if (isLoading) return <LoadingState message="Chargement du classement..." fullScreen />;

  const filteredRanking = ranking?.filter(player =>
    player.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <h1 className="mb-2">Classement Général</h1>
          <p className="text-muted-foreground">Les meilleurs joueurs de StreetLeague</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input type="text" placeholder="Rechercher un joueur..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-xl" />
          </div>
          <select value={position} onChange={(e) => setPosition(e.target.value)} className="px-4 py-3 bg-input-background border border-border rounded-xl">
            <option value="all">Tous postes</option>
            <option value="forward">Attaquants</option>
            <option value="midfielder">Milieux</option>
            <option value="defender">Défenseurs</option>
            <option value="goalkeeper">Gardiens</option>
          </select>
          <select value={period} onChange={(e) => setPeriod(e.target.value as any)} className="px-4 py-3 bg-input-background border border-border rounded-xl">
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="season">Saison</option>
          </select>
        </div>
        <RankingTable players={filteredRanking} category="general" />
      </div>
    </div>
  );
}