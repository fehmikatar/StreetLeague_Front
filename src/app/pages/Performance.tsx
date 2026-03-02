import { Activity, Heart, Flame, Target, TrendingUp, Award, Zap, Moon } from "lucide-react";
import { Link } from "react-router";
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
} from "recharts";

export function Performance() {
  const weeklyActivity = [
    { day: "Mon", calories: 450, minutes: 45 },
    { day: "Tue", calories: 520, minutes: 60 },
    { day: "Wed", calories: 380, minutes: 35 },
    { day: "Thu", calories: 620, minutes: 75 },
    { day: "Fri", calories: 490, minutes: 50 },
    { day: "Sat", calories: 680, minutes: 85 },
    { day: "Sun", calories: 550, minutes: 65 },
  ];

  const performanceMetrics = [
    { metric: "Speed", value: 85 },
    { metric: "Endurance", value: 78 },
    { metric: "Strength", value: 72 },
    { metric: "Agility", value: 88 },
    { metric: "Accuracy", value: 80 },
  ];

  const achievements = [
    { name: "5K Runner", icon: "🏃", progress: 100, total: 100, earned: true },
    { name: "Century Club", icon: "💯", progress: 89, total: 100, earned: false },
    { name: "Iron Will", icon: "💪", progress: 100, total: 100, earned: true },
    { name: "Speed Demon", icon: "⚡", progress: 65, total: 100, earned: false },
    { name: "Team Player", icon: "🤝", progress: 100, total: 100, earned: true },
    { name: "Marathon", icon: "🏅", progress: 42, total: 100, earned: false },
  ];

  const healthMetrics = [
    {
      label: "Heart Rate",
      value: 72,
      unit: "bpm",
      status: "excellent",
      icon: Heart,
      color: "#DC2626",
    },
    {
      label: "Daily Steps",
      value: 8542,
      unit: "steps",
      status: "good",
      icon: Activity,
      color: "#1DB954",
    },
    {
      label: "Calories Burned",
      value: 520,
      unit: "kcal",
      status: "good",
      icon: Flame,
      color: "#F97316",
    },
    {
      label: "Sleep Quality",
      value: 85,
      unit: "%",
      status: "excellent",
      icon: Moon,
      color: "#06D6A0",
    },
  ];

  const wellnessTips = [
    {
      title: "Hydration Reminder",
      description: "You're 20% below your daily water intake goal. Stay hydrated!",
      priority: "high",
    },
    {
      title: "Recovery Day",
      description: "Consider taking a rest day. You've been training hard for 6 days.",
      priority: "medium",
    },
    {
      title: "Stretching Time",
      description: "Don't forget your post-workout stretching routine.",
      priority: "low",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2">Performance & Health Tracker</h1>
              <p className="text-muted-foreground">
                Monitor your progress and optimize your athletic performance
              </p>
            </div>
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
              Sync Devices
            </button>
          </div>
        </div>
      </div>

      {/* Healthcare Navigation Modules */}
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <Link
              to="/performance/health"
              className="px-4 py-3 bg-card hover:bg-primary/10 border border-border hover:border-primary/50 rounded-xl transition-all text-center"
            >
              <Heart className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-xs font-semibold">Personal Health</div>
            </Link>
            <Link
              to="/performance/injuries"
              className="px-4 py-3 bg-card hover:bg-primary/10 border border-border hover:border-primary/50 rounded-xl transition-all text-center"
            >
              <Activity className="h-5 w-5 mx-auto mb-1 text-destructive" />
              <div className="text-xs font-semibold">Injuries</div>
            </Link>
            <Link
              to="/performance/recommendations"
              className="px-4 py-3 bg-card hover:bg-primary/10 border border-border hover:border-primary/50 rounded-xl transition-all text-center"
            >
              <Zap className="h-5 w-5 mx-auto mb-1 text-accent" />
              <div className="text-xs font-semibold">AI Insights</div>
            </Link>
            <Link
              to="/performance/team-health"
              className="px-4 py-3 bg-card hover:bg-primary/10 border border-border hover:border-primary/50 rounded-xl transition-all text-center"
            >
              <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-xs font-semibold">Team Health</div>
            </Link>
            <Link
              to="/performance/health-professional"
              className="px-4 py-3 bg-card hover:bg-primary/10 border border-border hover:border-primary/50 rounded-xl transition-all text-center"
            >
              <Activity className="h-5 w-5 mx-auto mb-1 text-accent" />
              <div className="text-xs font-semibold">Professional</div>
            </Link>
            <Link
              to="/performance/wearables"
              className="px-4 py-3 bg-card hover:bg-primary/10 border border-border hover:border-primary/50 rounded-xl transition-all text-center"
            >
              <Heart className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-xs font-semibold">Wearables</div>
            </Link>
            <Link
              to="/performance/alerts"
              className="px-4 py-3 bg-card hover:bg-primary/10 border border-border hover:border-primary/50 rounded-xl transition-all text-center"
            >
              <Flame className="h-5 w-5 mx-auto mb-1 text-destructive" />
              <div className="text-xs font-semibold">Alerts</div>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Health Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {healthMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${metric.color}15` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: metric.color }} />
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      metric.status === "excellent"
                        ? "bg-primary/10 text-primary"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    {metric.status}
                  </span>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {metric.value.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {metric.label} <span className="text-xs">({metric.unit})</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Weekly Activity Chart */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-6">Weekly Activity Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(248, 250, 252, 0.1)" />
                  <XAxis dataKey="day" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      border: "1px solid rgba(248, 250, 252, 0.1)",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar dataKey="calories" fill="#1DB954" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="minutes" fill="#F26419" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">Calories Burned</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-accent" />
                  <span className="text-sm text-muted-foreground">Active Minutes</span>
                </div>
              </div>
            </div>

            {/* Performance Radar */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-6">Performance Analysis</h3>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={performanceMetrics}>
                  <PolarGrid stroke="rgba(248, 250, 252, 0.1)" />
                  <PolarAngleAxis dataKey="metric" stroke="#94A3B8" />
                  <PolarRadiusAxis stroke="#94A3B8" />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#1DB954"
                    fill="#1DB954"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-5 gap-4 mt-6">
                {performanceMetrics.map((metric) => (
                  <div key={metric.metric} className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{metric.value}</div>
                    <div className="text-xs text-muted-foreground">{metric.metric}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges & Achievements */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  <h3>Badges & Fidelity Trophy Room</h3>
                </div>
                <span className="text-sm text-muted-foreground">
                  {achievements.filter((a) => a.earned).length}/{achievements.length} Earned
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.name}
                    className={`p-5 rounded-2xl border-2 transition-all ${
                      achievement.earned
                        ? "border-primary bg-primary/5 hover:bg-primary/10"
                        : "border-border bg-muted/30"
                    }`}
                  >
                    <div className="text-center mb-3">
                      <div
                        className={`text-5xl mb-2 ${
                          !achievement.earned && "opacity-40 grayscale"
                        }`}
                      >
                        {achievement.icon}
                      </div>
                      <h4 className="text-sm font-semibold mb-1">{achievement.name}</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>
                          {achievement.progress}/{achievement.total}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Summary */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-6">Today's Summary</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Daily Goal</span>
                    <span className="text-sm font-semibold">85%</span>
                  </div>
                  <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]"
                         style={{ width: '85%' }} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">Goals Met</div>
                        <div className="text-xs text-muted-foreground">3/4 today</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">Energy Level</div>
                        <div className="text-xs text-muted-foreground">High</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Wellness Tips */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-6">Personalized Wellness Tips</h3>
              <div className="space-y-3">
                {wellnessTips.map((tip, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${
                      tip.priority === "high"
                        ? "bg-destructive/5 border-destructive/20"
                        : tip.priority === "medium"
                        ? "bg-accent/5 border-accent/20"
                        : "bg-primary/5 border-primary/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${
                          tip.priority === "high"
                            ? "bg-destructive"
                            : tip.priority === "medium"
                            ? "bg-accent"
                            : "bg-primary"
                        }`}
                      />
                      <div>
                        <h4 className="text-sm font-semibold mb-1">{tip.title}</h4>
                        <p className="text-xs text-muted-foreground">{tip.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-6">This Month</h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-primary/5 rounded-xl">
                  <div className="text-3xl font-bold text-primary mb-1">156</div>
                  <div className="text-sm text-muted-foreground">Total Workouts</div>
                </div>
                <div className="text-center p-4 bg-accent/5 rounded-xl">
                  <div className="text-3xl font-bold text-accent mb-1">42h</div>
                  <div className="text-sm text-muted-foreground">Active Time</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-xl">
                  <div className="text-3xl font-bold" style={{ color: '#06D6A0' }}>15.2k</div>
                  <div className="text-sm text-muted-foreground">Calories Burned</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}