import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Award, Lock, Loader2, Search, Filter } from 'lucide-react';
import { badgeService } from '@/services/badgeService';

export default function BadgeGallery() {
  const storedUserId = localStorage.getItem('user_id');
  const playerId = storedUserId ? parseInt(storedUserId, 10) : 1;
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const { data: badges, isLoading: loadingBadges } = useQuery({
    queryKey: ['badges'],
    queryFn: badgeService.getAll,
  });

  const { data: earnedBadges, isLoading: loadingEarned } = useQuery({
    queryKey: ['earnedBadges', playerId],
    queryFn: () => badgeService.getEarnedByPlayer(playerId),
  });

  const isLoading = loadingBadges || loadingEarned;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <p className="text-muted-foreground">Chargement de la galerie...</p>
      </div>
    );
  }

  // Combine badges with earned status
  const galleryBadges = badges?.map(b => ({
    ...b,
    isEarned: earnedBadges?.some(eb => eb.badge.id === b.id) || false,
    earnedDate: earnedBadges?.find(eb => eb.badge.id === b.id)?.obtainDate
  })) || [];

  // Filter logic
  const filteredBadges = activeCategory === 'ALL' 
    ? galleryBadges 
    : galleryBadges.filter(b => b.category === activeCategory);

  const categories = ['ALL', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'GOLD': return 'from-yellow-500 to-yellow-600 text-yellow-500 shadow-yellow-500/20';
      case 'SILVER': return 'from-gray-300 to-gray-400 text-gray-300 shadow-gray-400/20';
      case 'BRONZE': return 'from-orange-500 to-orange-600 text-orange-500 shadow-orange-500/20';
      case 'PLATINUM': return 'from-purple-500 to-purple-600 text-purple-400 shadow-purple-500/20';
      default: return 'from-primary to-accent text-primary shadow-primary/20';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20 shadow-lg">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2">Galerie des Badges</h1>
            <p className="text-muted-foreground">
              Découvrez l'ensemble des trophées disponibles. Collectionnez-les tous pour prouver votre suprématie.
            </p>
          </div>
        </div>

        {/* Stats Mini-dashboard */}
        <div className="flex items-center gap-6 bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="text-center px-4 border-r border-border/50">
            <div className="text-2xl font-black text-white">{earnedBadges?.length || 0}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Obtenus</div>
          </div>
          <div className="text-center px-4">
            <div className="text-2xl font-black text-muted-foreground">{badges?.length || 0}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Total</div>
          </div>
          <div className="px-4">
            <div className="w-16 h-16 rounded-full border-4 border-muted flex items-center justify-center relative">
              <svg className="w-full h-full absolute -rotate-90">
                <circle cx="28" cy="28" r="26" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-primary" 
                  strokeDasharray={`${((earnedBadges?.length || 0) / (badges?.length || 1)) * 163} 163`} />
              </svg>
              <span className="text-xs font-bold text-white z-10">
                {Math.round(((earnedBadges?.length || 0) / (badges?.length || 1)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-border pb-6">
        <div className="flex items-center gap-2 mr-4 text-muted-foreground">
          <Filter className="w-5 h-5" />
          <span className="text-sm font-semibold uppercase tracking-wider">Filtrer par :</span>
        </div>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all
              ${activeCategory === cat 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105' 
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-white'
              }
            `}
          >
            {cat === 'ALL' ? 'Tous' : cat}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredBadges.map((badge) => {
          const isLocked = !badge.isEarned;
          const colors = getCategoryColor(badge.category);
          
          return (
            <div 
              key={badge.id} 
              className={`relative bg-card rounded-2xl p-6 border transition-all duration-300 group
                ${isLocked ? 'border-border opacity-70 hover:opacity-100' : 'border-primary/20 shadow-xl shadow-primary/5 hover:-translate-y-2'}
              `}
            >
              {isLocked && (
                <div className="absolute top-4 right-4 bg-background/80 p-2 rounded-full backdrop-blur-sm border border-border z-10">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              )}

              <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 relative
                ${isLocked ? 'bg-muted grayscale' : `bg-gradient-to-br ${colors.split(' ')[0]} ${colors.split(' ')[1]} shadow-lg ${colors.split(' ')[3]}`}
              `}>
                {badge.iconUrl ? (
                  <img src={badge.iconUrl} alt={badge.name} className={`w-16 h-16 object-cover ${isLocked ? 'opacity-50' : ''}`} />
                ) : (
                  <Award className={`w-12 h-12 ${isLocked ? 'text-muted-foreground' : 'text-white'}`} />
                )}
                
                {/* Glow effect for earned */}
                {!isLocked && (
                  <div className={`absolute inset-0 rounded-full blur-xl opacity-50 bg-gradient-to-br ${colors.split(' ')[0]} ${colors.split(' ')[1]} -z-10`} />
                )}
              </div>

              <div className="text-center relative z-10">
                <div className={`text-xs font-black uppercase tracking-widest mb-1 ${isLocked ? 'text-muted-foreground' : colors.split(' ')[2]}`}>
                  {badge.category}
                </div>
                <h3 className={`font-bold mb-2 ${isLocked ? 'text-muted-foreground' : 'text-white'}`}>
                  {badge.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2 min-h-[32px]">
                  {badge.description || "Aucune description fournie."}
                </p>
                
                <div className="inline-block px-3 py-1 rounded-full bg-background border border-border text-xs font-mono text-muted-foreground">
                  Niv. {badge.level} • {badge.requiredXp} XP
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredBadges.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          Aucun badge trouvé pour cette catégorie.
        </div>
      )}
    </div>
  );
}
