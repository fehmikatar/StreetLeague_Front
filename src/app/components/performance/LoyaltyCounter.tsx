import { Trophy, Flame, TrendingUp, Gift } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LoyaltyCounterProps {
  currentPoints: number;
  nextTierPoints: number;
  tier: string;
  recentEarned?: number;
}

export function LoyaltyCounter({
  currentPoints,
  nextTierPoints,
  tier,
  recentEarned = 0,
}: LoyaltyCounterProps) {
  const [animatedPoints, setAnimatedPoints] = useState(currentPoints - recentEarned);
  const progress = (currentPoints / nextTierPoints) * 100;

  useEffect(() => {
    if (recentEarned > 0) {
      const duration = 1500;
      const steps = 60;
      const increment = recentEarned / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        setAnimatedPoints((prev) => Math.min(prev + increment, currentPoints));

        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimatedPoints(currentPoints);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setAnimatedPoints(currentPoints);
    }
  }, [currentPoints, recentEarned]);

  const getTierColor = () => {
    switch (tier) {
      case 'Bronze':
        return '#CD7F32';
      case 'Silver':
        return '#C0C0C0';
      case 'Gold':
        return '#FFD700';
      case 'Platinum':
        return '#E5E4E2';
      default:
        return '#1DB954';
    }
  };

  const tierColor = getTierColor();

  return (
    <div className="bg-card rounded-2xl p-6 border-2 border-primary shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${tierColor}20` }}
          >
            <Trophy className="h-6 w-6" style={{ color: tierColor }} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Points de Fidélité</h3>
            <p className="text-sm text-muted-foreground">Niveau {tier}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Temps réel</div>
          <div className="flex items-center gap-1 text-primary">
            <Flame className="w-4 h-4 animate-pulse" />
            <span className="text-xs font-semibold">LIVE</span>
          </div>
        </div>
      </div>

      {/* Points Display */}
      <div className="mb-6">
        <div className="flex items-baseline justify-center gap-2 mb-2">
          <div className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {Math.round(animatedPoints).toLocaleString()}
          </div>
          <div className="text-2xl text-muted-foreground">pts</div>
        </div>

        {recentEarned > 0 && (
          <div className="flex items-center justify-center gap-2 text-primary animate-bounce">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">+{recentEarned} points récemment!</span>
          </div>
        )}
      </div>

      {/* Progress to next tier */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Prochain niveau</span>
          <span className="font-semibold">
            {nextTierPoints - currentPoints} points restants
          </span>
        </div>
        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{currentPoints}</span>
          <span>{nextTierPoints}</span>
        </div>
      </div>

      {/* Recent activity indicator */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold">Récompenses disponibles</span>
        </div>
        <button className="text-xs text-primary hover:underline">Voir</button>
      </div>
    </div>
  );
}
