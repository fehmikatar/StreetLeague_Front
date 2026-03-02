import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';

interface StatsWidgetProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon: React.ElementType;
  color: string;
  automated?: boolean;
}

export function StatsWidget({
  label,
  value,
  unit,
  trend,
  trendValue,
  icon: Icon,
  color,
  automated = false,
}: StatsWidgetProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (trend === 'up') return '#1DB954';
    if (trend === 'down') return '#DC2626';
    return '#94A3B8';
  };

  const TrendIcon = getTrendIcon();
  const trendColor = getTrendColor();

  return (
    <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
        {automated && (
          <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            <Zap className="w-3 h-3" />
            <span>Auto</span>
          </div>
        )}
      </div>

      <div className="mb-2">
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {unit && <span className="text-sm text-muted-foreground">({unit})</span>}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{label}</div>
        {trend && trendValue && (
          <div className="flex items-center gap-1" style={{ color: trendColor }}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-xs font-semibold">{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}
