import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Activity,
  Heart,
  Weight,
  Target,
  AlertCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function HealthTrends() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | '3months' | 'year'>('month');

  // Weight trend data
  const weightData = [
    { date: '2025-11-01', weight: 77.5, bmi: 23.9 },
    { date: '2025-11-15', weight: 77.2, bmi: 23.8 },
    { date: '2025-12-01', weight: 76.8, bmi: 23.6 },
    { date: '2025-12-15', weight: 76.5, bmi: 23.5 },
    { date: '2026-01-01', weight: 76.2, bmi: 23.4 },
    { date: '2026-01-15', weight: 75.8, bmi: 23.3 },
    { date: '2026-02-01', weight: 75.5, bmi: 23.2 },
    { date: '2026-02-06', weight: 75.5, bmi: 23.2 },
  ];

  // Body composition trends
  const bodyCompData = [
    { date: '2025-11-01', bodyFat: 20.2, muscleMass: 32.8 },
    { date: '2025-12-01', bodyFat: 19.5, muscleMass: 33.2 },
    { date: '2026-01-01', bodyFat: 19.0, muscleMass: 33.8 },
    { date: '2026-02-01', bodyFat: 18.5, muscleMass: 34.2 },
  ];

  // Cardiovascular trends
  const cardiovascularData = [
    { date: '2025-11-01', restingHR: 65, systolic: 122, diastolic: 82 },
    { date: '2025-12-01', restingHR: 64, systolic: 121, diastolic: 81 },
    { date: '2026-01-01', restingHR: 63, systolic: 120, diastolic: 80 },
    { date: '2026-02-01', restingHR: 62, systolic: 120, diastolic: 80 },
  ];

  // Performance metrics
  const performanceData = [
    { date: '2025-11-01', endurance: 75, strength: 70, flexibility: 65, speed: 72 },
    { date: '2025-12-01', endurance: 78, strength: 73, flexibility: 68, speed: 74 },
    { date: '2026-01-01', endurance: 82, strength: 76, flexibility: 70, speed: 76 },
    { date: '2026-02-01', endurance: 85, strength: 78, flexibility: 72, speed: 78 },
  ];

  // Nutrition adherence
  const nutritionData = [
    { week: 'Week 1', calories: 95, protein: 92, carbs: 88, fats: 90 },
    { week: 'Week 2', calories: 88, protein: 90, carbs: 85, fats: 87 },
    { week: 'Week 3', calories: 92, protein: 95, carbs: 90, fats: 93 },
    { week: 'Week 4', calories: 90, protein: 88, carbs: 87, fats: 89 },
  ];

  const trends = [
    {
      metric: 'Weight',
      current: 75.5,
      change: -2.0,
      unit: 'kg',
      trend: 'down' as const,
      status: 'positive' as const,
      icon: Weight,
    },
    {
      metric: 'BMI',
      current: 23.2,
      change: -0.7,
      unit: '',
      trend: 'down' as const,
      status: 'positive' as const,
      icon: Target,
    },
    {
      metric: 'Body Fat',
      current: 18.5,
      change: -1.7,
      unit: '%',
      trend: 'down' as const,
      status: 'positive' as const,
      icon: Activity,
    },
    {
      metric: 'Muscle Mass',
      current: 34.2,
      change: +1.4,
      unit: 'kg',
      trend: 'up' as const,
      status: 'positive' as const,
      icon: TrendingUp,
    },
    {
      metric: 'Resting HR',
      current: 62,
      change: -3,
      unit: 'bpm',
      trend: 'down' as const,
      status: 'positive' as const,
      icon: Heart,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="mb-2">Health Trend Analysis</h1>
              <p className="text-muted-foreground">
                Long-term pattern recognition and health insights
              </p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            {(['week', 'month', '3months', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  timeRange === range
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-muted hover:bg-muted/70'
                }`}
              >
                {range === '3months' ? '3 Months' : range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Trend Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {trends.map((trend) => {
            const Icon = trend.icon;
            const TrendIcon = trend.trend === 'up' ? TrendingUp : TrendingDown;
            return (
              <div key={trend.metric} className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      trend.status === 'positive'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    <TrendIcon className="w-3 h-3" />
                    {Math.abs(trend.change)}
                    {trend.unit}
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {trend.current}
                  {trend.unit}
                </div>
                <div className="text-xs text-muted-foreground">{trend.metric}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weight & BMI Trend */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Weight className="h-5 w-5 text-primary" />
                <h3>Weight & BMI Evolution</h3>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(248, 250, 252, 0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="#94A3B8"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis yAxisId="left" stroke="#94A3B8" domain={[74, 78]} />
                <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" domain={[22, 24]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(248, 250, 252, 0.1)',
                    borderRadius: '12px',
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString();
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="weight"
                  stroke="#1DB954"
                  strokeWidth={3}
                  name="Weight (kg)"
                  dot={{ fill: '#1DB954', r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bmi"
                  stroke="#F97316"
                  strokeWidth={3}
                  name="BMI"
                  dot={{ fill: '#F97316', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="flex items-start gap-2">
                <TrendingDown className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-primary mb-1">Positive Trend</p>
                  <p className="text-xs text-muted-foreground">
                    You've lost 2.0 kg over the last 3 months while maintaining muscle mass. Great progress!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Body Composition */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent" />
                <h3>Body Composition</h3>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={bodyCompData}>
                <defs>
                  <linearGradient id="colorBodyFat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMuscleMass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06D6A0" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06D6A0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(248, 250, 252, 0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="#94A3B8"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(248, 250, 252, 0.1)',
                    borderRadius: '12px',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="bodyFat"
                  stroke="#F97316"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorBodyFat)"
                  name="Body Fat %"
                />
                <Area
                  type="monotone"
                  dataKey="muscleMass"
                  stroke="#06D6A0"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMuscleMass)"
                  name="Muscle Mass (kg)"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-accent/5 border border-accent/20 rounded-xl">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-accent mb-1">Body Recomposition</p>
                  <p className="text-xs text-muted-foreground">
                    -1.7% body fat, +1.4 kg muscle mass. Your training program is working!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cardiovascular Health */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <h3>Cardiovascular Health</h3>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cardiovascularData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(248, 250, 252, 0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="#94A3B8"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis yAxisId="left" stroke="#94A3B8" domain={[60, 70]} />
                <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" domain={[75, 125]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(248, 250, 252, 0.1)',
                    borderRadius: '12px',
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="restingHR"
                  stroke="#1DB954"
                  strokeWidth={3}
                  name="Resting HR (bpm)"
                  dot={{ fill: '#1DB954', r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="systolic"
                  stroke="#F97316"
                  strokeWidth={2}
                  name="Systolic BP"
                  dot={{ fill: '#F97316', r: 3 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="diastolic"
                  stroke="#06D6A0"
                  strokeWidth={2}
                  name="Diastolic BP"
                  dot={{ fill: '#06D6A0', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="p-3 bg-primary/5 rounded-xl text-center">
                <div className="text-sm font-semibold text-primary">62 bpm</div>
                <div className="text-xs text-muted-foreground">Resting HR</div>
              </div>
              <div className="p-3 bg-accent/5 rounded-xl text-center">
                <div className="text-sm font-semibold text-accent">120</div>
                <div className="text-xs text-muted-foreground">Systolic</div>
              </div>
              <div className="p-3 bg-chart-2/5 rounded-xl text-center">
                <div className="text-sm font-semibold" style={{ color: '#06D6A0' }}>
                  80
                </div>
                <div className="text-xs text-muted-foreground">Diastolic</div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                <h3>Performance Metrics</h3>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(248, 250, 252, 0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="#94A3B8"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis stroke="#94A3B8" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(248, 250, 252, 0.1)',
                    borderRadius: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="endurance" fill="#1DB954" name="Endurance" />
                <Bar dataKey="strength" fill="#F97316" name="Strength" />
                <Bar dataKey="flexibility" fill="#06D6A0" name="Flexibility" />
                <Bar dataKey="speed" fill="#F26419" name="Speed" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { name: 'Endurance', value: 85, color: '#1DB954' },
                { name: 'Strength', value: 78, color: '#F97316' },
                { name: 'Flexibility', value: 72, color: '#06D6A0' },
                { name: 'Speed', value: 78, color: '#F26419' },
              ].map((metric) => (
                <div key={metric.name} className="p-2 bg-muted/30 rounded-lg text-center">
                  <div className="text-sm font-bold" style={{ color: metric.color }}>
                    {metric.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{metric.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nutrition Adherence */}
        <div className="mt-8 bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3>Nutrition Plan Adherence</h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={nutritionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(248, 250, 252, 0.1)" />
              <XAxis dataKey="week" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid rgba(248, 250, 252, 0.1)',
                  borderRadius: '12px',
                }}
                formatter={(value) => `${value}%`}
              />
              <Legend />
              <Bar dataKey="calories" fill="#1DB954" name="Calories" />
              <Bar dataKey="protein" fill="#F97316" name="Protein" />
              <Bar dataKey="carbs" fill="#06D6A0" name="Carbs" />
              <Bar dataKey="fats" fill="#F26419" name="Fats" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-primary mb-1">Good Adherence</p>
                <p className="text-xs text-muted-foreground">
                  Average adherence: 91% this month. Keep up the consistency for best results!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="mt-8 bg-card rounded-2xl p-6 border border-border">
          <h3 className="mb-6">Key Health Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-primary mb-1">Body Recomposition Success</p>
                  <p className="text-sm text-muted-foreground">
                    You've successfully reduced body fat while gaining muscle mass - ideal for athletic performance.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-accent mb-1">Improved Cardiovascular Health</p>
                  <p className="text-sm text-muted-foreground">
                    Resting heart rate decreased by 3 bpm indicating better cardiovascular fitness.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-chart-2/5 border border-chart-2/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#06D6A0' }} />
                <div>
                  <p className="font-semibold mb-1" style={{ color: '#06D6A0' }}>
                    Performance Gains
                  </p>
                  <p className="text-sm text-muted-foreground">
                    All performance metrics show consistent improvement over the tracking period.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
