import { useState } from 'react';
import {
  Heart,
  Activity,
  Calendar,
  Apple,
  TrendingUp,
  AlertCircle,
  FileText,
  CheckCircle,
  Clock,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function HealthDashboard() {
  // Mock data for health metrics
  const healthMetrics = {
    weight: 75.5,
    bmi: 23.2,
    bodyFat: 18.5,
    muscleMass: 34.2,
    lastUpdate: '2026-02-06',
  };

  // Weight trend data
  const weightTrend = [
    { date: 'Jan 1', weight: 77.2, bmi: 23.8 },
    { date: 'Jan 8', weight: 76.8, bmi: 23.6 },
    { date: 'Jan 15', weight: 76.5, bmi: 23.5 },
    { date: 'Jan 22', weight: 76.0, bmi: 23.4 },
    { date: 'Jan 29', weight: 75.8, bmi: 23.3 },
    { date: 'Feb 5', weight: 75.5, bmi: 23.2 },
  ];

  const upcomingAppointments = [
    {
      id: '1',
      type: 'Medical Checkup',
      doctor: 'Dr. Sarah Johnson',
      date: '2026-02-10',
      time: '14:00',
      status: 'confirmed',
    },
    {
      id: '2',
      type: 'Nutrition Consultation',
      doctor: 'Dr. Michael Chen',
      date: '2026-02-15',
      time: '10:30',
      status: 'pending',
    },
  ];

  const recentRecords = [
    {
      id: '1',
      title: 'Ankle Sprain Recovery',
      date: '2026-01-28',
      type: 'Injury',
      status: 'recovering',
    },
    {
      id: '2',
      title: 'Annual Physical',
      date: '2026-01-15',
      type: 'Checkup',
      status: 'completed',
    },
    {
      id: '3',
      title: 'Blood Test Results',
      date: '2026-01-10',
      type: 'Lab',
      status: 'completed',
    },
  ];

  const activeDietPlan = {
    name: 'High Protein Athlete Plan',
    startDate: '2026-02-01',
    duration: '30 days',
    calories: 2800,
    protein: 180,
    carbs: 300,
    fats: 80,
  };

  const healthAlerts = [
    {
      id: '1',
      type: 'info',
      message: 'Your BMI is in the healthy range. Keep up the good work!',
      priority: 'low',
    },
    {
      id: '2',
      type: 'warning',
      message: 'You have an upcoming appointment in 4 days.',
      priority: 'medium',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="mb-2">Healthcare Dashboard</h1>
              <p className="text-muted-foreground">
                Comprehensive health monitoring and medical records management
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/app/healthcare/profile"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Update Health Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Modules */}
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              to="/app/healthcare/profile"
              className="px-4 py-3 bg-card hover:bg-primary/10 border border-border hover:border-primary/50 rounded-xl transition-all text-center"
            >
              <Heart className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-xs font-semibold">Health Profile</div>
            </Link>
            <Link
              to="/app/healthcare/records"
              className="px-4 py-3 bg-card hover:bg-primary/10 border border-border hover:border-primary/50 rounded-xl transition-all text-center"
            >
              <FileText className="h-5 w-5 mx-auto mb-1 text-accent" />
              <div className="text-xs font-semibold">Medical Records</div>
            </Link>
            <Link
              to="/app/healthcare/appointments"
              className="px-4 py-3 bg-card hover:bg-primary/10 border border-border hover:border-primary/50 rounded-xl transition-all text-center"
            >
              <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-xs font-semibold">Appointments</div>
            </Link>
            <Link
              to="/app/healthcare/diet"
              className="px-4 py-3 bg-card hover:bg-primary/10 border border-border hover:border-primary/50 rounded-xl transition-all text-center"
            >
              <Apple className="h-5 w-5 mx-auto mb-1 text-accent" />
              <div className="text-xs font-semibold">Diet Plans</div>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Health Alerts */}
        {healthAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Health Alerts</h2>
            <div className="space-y-3">
              {healthAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    alert.type === 'warning'
                      ? 'bg-accent/10 border-accent/30'
                      : 'bg-primary/10 border-primary/30'
                  }`}
                >
                  <AlertCircle
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      alert.type === 'warning' ? 'text-accent' : 'text-primary'
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Health Metrics */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3>Current Health Metrics</h3>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Last update: {healthMetrics.lastUpdate}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-xl">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {healthMetrics.weight}
                    <span className="text-lg">kg</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Weight</div>
                </div>
                <div className="text-center p-4 bg-accent/5 rounded-xl">
                  <div className="text-3xl font-bold text-accent mb-1">{healthMetrics.bmi}</div>
                  <div className="text-sm text-muted-foreground">BMI</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-xl">
                  <div className="text-3xl font-bold" style={{ color: '#06D6A0' }}>
                    {healthMetrics.bodyFat}
                    <span className="text-lg">%</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Body Fat</div>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-xl">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {healthMetrics.muscleMass}
                    <span className="text-lg">kg</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Muscle Mass</div>
                </div>
              </div>
            </div>

            {/* Weight Trend Chart */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3>Weight & BMI Trend</h3>
                </div>
                <Link
                  to="/app/healthcare/trends"
                  className="text-sm text-primary hover:underline"
                >
                  View detailed analysis →
                </Link>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weightTrend}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1DB954" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1DB954" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(248, 250, 252, 0.1)" />
                  <XAxis dataKey="date" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" domain={[74, 78]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid rgba(248, 250, 252, 0.1)',
                      borderRadius: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#1DB954"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorWeight)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Medical Records */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  <h3>Recent Medical Records</h3>
                </div>
                <Link
                  to="/app/healthcare/records"
                  className="text-sm text-primary hover:underline"
                >
                  View all records →
                </Link>
              </div>
              <div className="space-y-3">
                {recentRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          record.status === 'completed'
                            ? 'bg-primary'
                            : record.status === 'recovering'
                            ? 'bg-accent'
                            : 'bg-muted-foreground'
                        }`}
                      />
                      <div>
                        <p className="font-semibold">{record.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.type} • {record.date}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        record.status === 'completed'
                          ? 'bg-primary/10 text-primary'
                          : record.status === 'recovering'
                          ? 'bg-accent/10 text-accent'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {record.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3>Upcoming Appointments</h3>
                </div>
              </div>
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-sm">{appointment.type}</p>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          appointment.status === 'confirmed'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-accent/10 text-accent'
                        }`}
                      >
                        {appointment.status}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{appointment.doctor}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {appointment.date} at {appointment.time}
                      </span>
                    </div>
                  </div>
                ))}
                <Link
                  to="/app/healthcare/appointments"
                  className="block w-full text-center py-3 border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 rounded-xl transition-all text-sm font-semibold text-muted-foreground hover:text-primary"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Schedule New Appointment
                </Link>
              </div>
            </div>

            {/* Active Diet Plan */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Apple className="h-5 w-5 text-accent" />
                  <h3>Active Diet Plan</h3>
                </div>
              </div>
              <div className="mb-4">
                <p className="font-bold mb-1">{activeDietPlan.name}</p>
                <p className="text-sm text-muted-foreground">
                  Started: {activeDietPlan.startDate} • {activeDietPlan.duration}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Daily Calories</span>
                  <span className="font-bold">{activeDietPlan.calories} kcal</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Protein</span>
                  <span className="font-bold text-primary">{activeDietPlan.protein}g</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Carbs</span>
                  <span className="font-bold text-accent">{activeDietPlan.carbs}g</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Fats</span>
                  <span className="font-bold" style={{ color: '#06D6A0' }}>
                    {activeDietPlan.fats}g
                  </span>
                </div>
              </div>
              <Link
                to="/app/healthcare/diet"
                className="block w-full text-center py-3 mt-4 bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-all text-sm font-semibold"
              >
                View Full Plan
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  to="/app/healthcare/trends"
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all"
                >
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold">View Health Trends</span>
                </Link>
                <Link
                  to="/app/healthcare/alerts"
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all"
                >
                  <AlertCircle className="w-5 h-5 text-accent" />
                  <span className="text-sm font-semibold">Manage Alerts</span>
                </Link>
                <Link
                  to="/app/healthcare/compliance"
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all"
                >
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold">Compliance Tracking</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
