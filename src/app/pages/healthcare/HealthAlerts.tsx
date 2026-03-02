import { useState } from 'react';
import {
  AlertCircle,
  Bell,
  CheckCircle,
  X,
  Clock,
  Heart,
  Activity,
  Target,
  TrendingUp,
  Calendar,
  Plus,
  Settings,
} from 'lucide-react';

type HealthAlert = {
  id: string;
  type: 'warning' | 'info' | 'success' | 'critical';
  category: 'vitals' | 'appointment' | 'medication' | 'nutrition' | 'training' | 'recovery';
  title: string;
  message: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  actionable: boolean;
  action?: string;
};

export default function HealthAlerts() {
  const [alerts, setAlerts] = useState<HealthAlert[]>([
    {
      id: '1',
      type: 'warning',
      category: 'appointment',
      title: 'Upcoming Appointment',
      message: 'You have a medical checkup scheduled in 4 days with Dr. Sarah Johnson on February 10, 2026 at 14:00.',
      date: '2026-02-06T10:00:00',
      priority: 'medium',
      read: false,
      actionable: true,
      action: 'View Appointment',
    },
    {
      id: '2',
      type: 'info',
      category: 'vitals',
      title: 'Healthy BMI',
      message: 'Your BMI of 23.2 is in the healthy range. Keep up the good work with your current lifestyle!',
      date: '2026-02-06T08:00:00',
      priority: 'low',
      read: false,
      actionable: false,
    },
    {
      id: '3',
      type: 'success',
      category: 'nutrition',
      title: 'Diet Plan Goal Achieved',
      message: 'Congratulations! You\'ve reached 20% completion of your High Protein Athlete Plan. Keep maintaining this consistency!',
      date: '2026-02-05T18:00:00',
      priority: 'low',
      read: false,
      actionable: true,
      action: 'View Diet Plan',
    },
    {
      id: '4',
      type: 'warning',
      category: 'recovery',
      title: 'Recovery Time Needed',
      message: 'Your last 3 training sessions show high intensity. Consider taking a recovery day to prevent overtraining.',
      date: '2026-02-05T07:00:00',
      priority: 'medium',
      read: true,
      actionable: true,
      action: 'View Training Schedule',
    },
    {
      id: '5',
      type: 'info',
      category: 'vitals',
      title: 'Improved Cardiovascular Fitness',
      message: 'Your resting heart rate has decreased to 62 bpm, indicating improved cardiovascular fitness.',
      date: '2026-02-04T09:00:00',
      priority: 'low',
      read: true,
      actionable: false,
    },
    {
      id: '6',
      type: 'warning',
      category: 'medication',
      title: 'Medication Reminder',
      message: 'Remember to take your daily vitamin D supplement. Studies show optimal vitamin D levels improve athletic performance.',
      date: '2026-02-04T08:00:00',
      priority: 'low',
      read: true,
      actionable: false,
    },
  ]);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesCategory = filterCategory === 'all' || alert.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || alert.priority === filterPriority;
    const matchesRead = !showUnreadOnly || !alert.read;
    return matchesCategory && matchesPriority && matchesRead;
  });

  const handleMarkAsRead = (id: string) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)));
  };

  const handleDismiss = (id: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setAlerts(alerts.map((alert) => ({ ...alert, read: true })));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return AlertCircle;
      case 'info':
        return Bell;
      case 'success':
        return CheckCircle;
      case 'critical':
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-accent/10 border-accent/30 text-accent';
      case 'info':
        return 'bg-primary/10 border-primary/30 text-primary';
      case 'success':
        return 'bg-chart-2/10 border-chart-2/30';
      case 'critical':
        return 'bg-destructive/10 border-destructive/30 text-destructive';
      default:
        return 'bg-muted border-border';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive';
      case 'medium':
        return 'bg-accent/10 text-accent';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vitals':
        return Heart;
      case 'appointment':
        return Calendar;
      case 'medication':
        return Activity;
      case 'nutrition':
        return Target;
      case 'training':
        return TrendingUp;
      case 'recovery':
        return Clock;
      default:
        return Bell;
    }
  };

  const unreadCount = alerts.filter((a) => !a.read).length;
  const highPriorityCount = alerts.filter((a) => a.priority === 'high' && !a.read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="mb-2">Health Alerts & Notifications</h1>
              <p className="text-muted-foreground">
                Predictive health alerts and personalized recommendations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-6 py-3 border border-border hover:bg-muted rounded-xl transition-all">
                <Settings className="h-4 w-4 inline mr-2" />
                Alert Settings
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-primary/5 rounded-xl">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-primary">{unreadCount}</div>
                  <div className="text-xs text-muted-foreground">Unread Alerts</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-destructive/5 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <div>
                  <div className="text-2xl font-bold text-destructive">{highPriorityCount}</div>
                  <div className="text-xs text-muted-foreground">High Priority</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-accent/5 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-accent" />
                <div>
                  <div className="text-2xl font-bold text-accent">{alerts.length}</div>
                  <div className="text-xs text-muted-foreground">Total Alerts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-4">Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Categories</option>
                    <option value="vitals">Vitals</option>
                    <option value="appointment">Appointments</option>
                    <option value="medication">Medication</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="training">Training</option>
                    <option value="recovery">Recovery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Priority</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="unreadOnly"
                    checked={showUnreadOnly}
                    onChange={(e) => setShowUnreadOnly(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="unreadOnly" className="text-sm font-semibold">
                    Show unread only
                  </label>
                </div>

                <button
                  onClick={handleMarkAllAsRead}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all text-sm font-semibold"
                >
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  Mark All as Read
                </button>
              </div>
            </div>

            {/* Alert Categories */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-4">Categories</h3>
              <div className="space-y-2">
                {[
                  { key: 'vitals', label: 'Vitals', icon: Heart, count: 2 },
                  { key: 'appointment', label: 'Appointments', icon: Calendar, count: 1 },
                  { key: 'medication', label: 'Medication', icon: Activity, count: 1 },
                  { key: 'nutrition', label: 'Nutrition', icon: Target, count: 1 },
                  { key: 'recovery', label: 'Recovery', icon: Clock, count: 1 },
                ].map(({ key, label, icon: Icon, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilterCategory(key)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      filterCategory === key
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-semibold">{label}</span>
                    </div>
                    <span className="text-xs font-bold">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts List */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-2xl border border-border">
              <div className="p-6 border-b border-border">
                <h3>
                  Alerts ({filteredAlerts.length})
                  {showUnreadOnly && ' - Unread Only'}
                </h3>
              </div>
              <div className="divide-y divide-border">
                {filteredAlerts.length === 0 ? (
                  <div className="p-12 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No alerts to display</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {showUnreadOnly || filterCategory !== 'all' || filterPriority !== 'all'
                        ? 'Try adjusting your filters'
                        : 'You\'re all caught up!'}
                    </p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => {
                    const Icon = getAlertIcon(alert.type);
                    const CategoryIcon = getCategoryIcon(alert.category);
                    return (
                      <div
                        key={alert.id}
                        className={`p-6 hover:bg-muted/30 transition-all ${
                          !alert.read ? 'bg-muted/10' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-3 rounded-xl border ${getAlertColor(alert.type)}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold">{alert.title}</h4>
                              {!alert.read && (
                                <span className="w-2 h-2 bg-primary rounded-full" />
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(alert.priority)}`}>
                                {alert.priority}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                                <CategoryIcon className="w-3 h-3 inline mr-1" />
                                {alert.category}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {alert.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {new Date(alert.date).toLocaleDateString()} at{' '}
                                  {new Date(alert.date).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {alert.actionable && alert.action && (
                                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all text-sm font-semibold">
                                    {alert.action}
                                  </button>
                                )}
                                {!alert.read && (
                                  <button
                                    onClick={() => handleMarkAsRead(alert.id)}
                                    className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-all"
                                    title="Mark as read"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDismiss(alert.id)}
                                  className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-all"
                                  title="Dismiss"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Predictive Insights */}
            <div className="mt-8 bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-6">Predictive Health Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-primary mb-1">
                        Optimal Training Window
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Based on your recovery patterns, tomorrow morning (8-10 AM) is your optimal training window.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-accent mb-1">
                        Sleep Quality Alert
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Your recent training intensity suggests you need 8+ hours of sleep tonight for optimal recovery.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-chart-2/5 border border-chart-2/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#06D6A0' }} />
                    <div>
                      <p className="text-sm font-semibold mb-1" style={{ color: '#06D6A0' }}>
                        Nutrition Timing
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Consider having a protein-rich meal within the next hour to maximize muscle recovery.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-muted/30 border border-border rounded-xl">
                  <div className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold mb-1">Hydration Reminder</p>
                      <p className="text-xs text-muted-foreground">
                        You're 500ml behind your daily water goal. Increase hydration for better performance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
