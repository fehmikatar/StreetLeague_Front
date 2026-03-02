import { useState } from 'react';
import {
  CheckCircle,
  X,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Activity,
  Apple,
  Clock,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

type ComplianceTask = {
  id: string;
  category: 'medication' | 'nutrition' | 'exercise' | 'checkup' | 'hydration' | 'sleep';
  title: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target: number;
  completed: number;
  lastCompleted?: string;
  streak: number;
  active: boolean;
};

export default function ComplianceTracking() {
  const [tasks, setTasks] = useState<ComplianceTask[]>([
    {
      id: '1',
      category: 'medication',
      title: 'Take Vitamin D Supplement',
      frequency: 'daily',
      target: 7,
      completed: 6,
      lastCompleted: '2026-02-06',
      streak: 6,
      active: true,
    },
    {
      id: '2',
      category: 'nutrition',
      title: 'Follow Diet Plan',
      frequency: 'daily',
      target: 7,
      completed: 7,
      lastCompleted: '2026-02-06',
      streak: 28,
      active: true,
    },
    {
      id: '3',
      category: 'exercise',
      title: 'Training Sessions',
      frequency: 'weekly',
      target: 4,
      completed: 3,
      lastCompleted: '2026-02-05',
      streak: 12,
      active: true,
    },
    {
      id: '4',
      category: 'hydration',
      title: 'Drink 3L Water Daily',
      frequency: 'daily',
      target: 7,
      completed: 5,
      lastCompleted: '2026-02-06',
      streak: 5,
      active: true,
    },
    {
      id: '5',
      category: 'sleep',
      title: 'Sleep 8+ Hours',
      frequency: 'daily',
      target: 7,
      completed: 6,
      lastCompleted: '2026-02-06',
      streak: 6,
      active: true,
    },
    {
      id: '6',
      category: 'checkup',
      title: 'Attend Medical Appointments',
      frequency: 'monthly',
      target: 1,
      completed: 1,
      lastCompleted: '2026-01-15',
      streak: 3,
      active: true,
    },
  ]);

  // Weekly adherence data
  const weeklyData = [
    { week: 'Week 1', adherence: 95, nutrition: 98, exercise: 100, medication: 86, hydration: 95 },
    { week: 'Week 2', adherence: 88, nutrition: 85, exercise: 100, medication: 100, hydration: 71 },
    { week: 'Week 3', adherence: 92, nutrition: 90, exercise: 100, medication: 100, hydration: 78 },
    { week: 'Week 4', adherence: 90, nutrition: 87, exercise: 75, medication: 86, hydration: 93 },
  ];

  // Radar chart data for overall compliance
  const complianceRadarData = [
    { category: 'Nutrition', value: 90, fullMark: 100 },
    { category: 'Exercise', value: 94, fullMark: 100 },
    { category: 'Medication', value: 93, fullMark: 100 },
    { category: 'Hydration', value: 84, fullMark: 100 },
    { category: 'Sleep', value: 86, fullMark: 100 },
    { category: 'Checkups', value: 100, fullMark: 100 },
  ];

  // Monthly trend
  const monthlyTrend = [
    { month: 'Oct', adherence: 82 },
    { month: 'Nov', adherence: 85 },
    { month: 'Dec', adherence: 88 },
    { month: 'Jan', adherence: 91 },
    { month: 'Feb', adherence: 91 },
  ];

  const handleMarkComplete = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: task.completed + 1,
              lastCompleted: new Date().toISOString().split('T')[0],
              streak: task.streak + 1,
            }
          : task
      )
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medication':
        return Activity;
      case 'nutrition':
        return Apple;
      case 'exercise':
        return TrendingUp;
      case 'checkup':
        return Calendar;
      case 'hydration':
        return Apple;
      case 'sleep':
        return Clock;
      default:
        return Target;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medication':
        return 'bg-primary/10 text-primary';
      case 'nutrition':
        return 'bg-accent/10 text-accent';
      case 'exercise':
        return 'bg-chart-2/10 text-chart-2';
      case 'checkup':
        return 'bg-chart-3/10 text-chart-3';
      case 'hydration':
        return 'bg-chart-4/10 text-chart-4';
      case 'sleep':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const overallAdherence = Math.round(
    tasks.reduce((acc, task) => acc + (task.completed / task.target) * 100, 0) / tasks.length
  );

  const longestStreak = Math.max(...tasks.map((t) => t.streak));
  const activeTasks = tasks.filter((t) => t.active).length;
  const completedThisWeek = tasks.reduce((acc, task) => acc + task.completed, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="mb-2">Compliance Tracking</h1>
              <p className="text-muted-foreground">
                Monitor adherence to recommendations and health goals
              </p>
            </div>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-primary/5 rounded-xl">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-primary">{overallAdherence}%</div>
                  <div className="text-xs text-muted-foreground">Overall Adherence</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-accent/5 rounded-xl">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-accent" />
                <div>
                  <div className="text-2xl font-bold text-accent">{longestStreak}</div>
                  <div className="text-xs text-muted-foreground">Longest Streak</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-chart-2/5 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5" style={{ color: '#06D6A0' }} />
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#06D6A0' }}>
                    {completedThisWeek}
                  </div>
                  <div className="text-xs text-muted-foreground">Tasks This Week</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{activeTasks}</div>
                  <div className="text-xs text-muted-foreground">Active Tasks</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Compliance Tasks */}
            <div className="bg-card rounded-2xl border border-border">
              <div className="p-6 border-b border-border">
                <h3>Current Compliance Tasks</h3>
              </div>
              <div className="divide-y divide-border">
                {tasks.map((task) => {
                  const Icon = getCategoryIcon(task.category);
                  const progress = (task.completed / task.target) * 100;
                  return (
                    <div key={task.id} className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${getCategoryColor(task.category)}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold mb-1">{task.title}</h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>
                                {task.completed}/{task.target} this {task.frequency.replace('ly', '')}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                {task.streak} day streak
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleMarkComplete(task.id)}
                          disabled={task.completed >= task.target}
                          className={`px-4 py-2 rounded-lg transition-all text-sm font-semibold ${
                            task.completed >= task.target
                              ? 'bg-primary/10 text-primary cursor-not-allowed'
                              : 'bg-primary text-primary-foreground hover:bg-primary/90'
                          }`}
                        >
                          {task.completed >= task.target ? (
                            <>
                              <CheckCircle className="h-4 w-4 inline mr-1" />
                              Complete
                            </>
                          ) : (
                            'Mark Done'
                          )}
                        </button>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            progress === 100 ? 'bg-primary' : 'bg-accent'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      {task.lastCompleted && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Last completed: {task.lastCompleted}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Adherence Chart */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h3>Weekly Adherence Breakdown</h3>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
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
                  <Bar dataKey="nutrition" fill="#1DB954" name="Nutrition" />
                  <Bar dataKey="exercise" fill="#06D6A0" name="Exercise" />
                  <Bar dataKey="medication" fill="#F97316" name="Medication" />
                  <Bar dataKey="hydration" fill="#F26419" name="Hydration" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Trend */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3>Overall Adherence Trend</h3>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(248, 250, 252, 0.1)" />
                  <XAxis dataKey="month" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid rgba(248, 250, 252, 0.1)',
                      borderRadius: '12px',
                    }}
                    formatter={(value) => `${value}%`}
                  />
                  <Line
                    type="monotone"
                    dataKey="adherence"
                    stroke="#1DB954"
                    strokeWidth={3}
                    dot={{ fill: '#1DB954', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-primary mb-1">Consistent Improvement</p>
                    <p className="text-xs text-muted-foreground">
                      Your adherence has improved by 9% over the last 5 months. Keep up the excellent work!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Compliance Radar Chart */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-6">Compliance Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={complianceRadarData}>
                  <PolarGrid stroke="rgba(248, 250, 252, 0.1)" />
                  <PolarAngleAxis dataKey="category" stroke="#94A3B8" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94A3B8" />
                  <Radar
                    name="Adherence"
                    dataKey="value"
                    stroke="#1DB954"
                    fill="#1DB954"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid rgba(248, 250, 252, 0.1)',
                      borderRadius: '12px',
                    }}
                    formatter={(value) => `${value}%`}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Achievements */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-accent" />
                <h3>Achievements</h3>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🔥</div>
                    <div>
                      <p className="text-sm font-semibold">28 Day Streak</p>
                      <p className="text-xs text-muted-foreground">Nutrition adherence</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">💪</div>
                    <div>
                      <p className="text-sm font-semibold">12 Week Consistency</p>
                      <p className="text-xs text-muted-foreground">Training sessions</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-chart-2/5 border border-chart-2/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">✅</div>
                    <div>
                      <p className="text-sm font-semibold">100% This Week</p>
                      <p className="text-xs text-muted-foreground">All tasks completed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-4">Compliance Insights</h3>
              <div className="space-y-3">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <p className="text-sm font-semibold text-primary mb-1">💚 Strongest Area</p>
                  <p className="text-xs text-muted-foreground">
                    Medical checkups: 100% adherence
                  </p>
                </div>
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
                  <p className="text-sm font-semibold text-accent mb-1">⚡ Improvement Area</p>
                  <p className="text-xs text-muted-foreground">
                    Hydration: 84% - Aim for daily consistency
                  </p>
                </div>
                <div className="p-4 bg-chart-2/5 border border-chart-2/20 rounded-xl">
                  <p className="text-sm font-semibold mb-1" style={{ color: '#06D6A0' }}>
                    📈 Best Day
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mondays show highest adherence rates
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
