import { Award, Lock, Info } from 'lucide-react';
import { useState } from 'react';

interface BadgeCardProps {
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'performance' | 'achievement' | 'social' | 'loyalty';
    progress: number;
    total: number;
    earned: boolean;
    earnedDate?: string;
    criteria: string;
    points: number;
  };
}

export function BadgeCard({ badge }: BadgeCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const categoryColors = {
    performance: '#F26419',
    achievement: '#1DB954',
    social: '#06D6A0',
    loyalty: '#FFD700',
  };

  const categoryColor = categoryColors[badge.category];

  return (
    <div
      className={`relative p-5 rounded-2xl border-2 transition-all hover:scale-105 ${
        badge.earned
          ? 'border-primary bg-primary/5 shadow-lg'
          : 'border-border bg-muted/30'
      }`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute -top-2 right-2 bg-card border border-border rounded-xl p-3 shadow-xl z-10 w-64 text-sm">
          <div className="flex items-start gap-2 mb-2">
            <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground mb-1">{badge.name}</p>
              <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
              <div className="space-y-1">
                <p className="text-xs">
                  <span className="text-muted-foreground">Critère:</span> {badge.criteria}
                </p>
                <p className="text-xs">
                  <span className="text-muted-foreground">Points:</span>{' '}
                  <span className="text-primary font-semibold">+{badge.points}</span>
                </p>
                {badge.earnedDate && (
                  <p className="text-xs">
                    <span className="text-muted-foreground">Obtenu le:</span> {badge.earnedDate}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badge Icon */}
      <div className="text-center mb-3">
        <div
          className={`text-5xl mb-2 relative ${
            !badge.earned && 'opacity-40 grayscale'
          }`}
        >
          {badge.icon}
          {!badge.earned && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
        <h4 className="text-sm font-semibold mb-1">{badge.name}</h4>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{
            backgroundColor: `${categoryColor}15`,
            color: categoryColor,
          }}
        >
          {badge.category}
        </span>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progression</span>
          <span>
            {badge.progress}/{badge.total}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${(badge.progress / badge.total) * 100}%` }}
          />
        </div>
      </div>

      {/* Earned indicator */}
      {badge.earned && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
          <Award className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}