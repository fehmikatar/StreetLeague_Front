import { useState } from 'react';
import {
  Apple,
  Plus,
  Calendar,
  TrendingUp,
  Target,
  X,
  Edit,
  Trash2,
  Save,
  Clock,
  Award,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type DietPlan = {
  id: string;
  name: string;
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'performance' | 'recovery';
  startDate: string;
  endDate?: string;
  duration: number; // in days
  dailyCalories: number;
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
  mealsPerDay: number;
  waterIntake: number; // liters
  notes?: string;
  status: 'active' | 'completed' | 'paused';
  progress?: number; // percentage
};

export default function DietPlans() {
  const [plans, setPlans] = useState<DietPlan[]>([
    {
      id: '1',
      name: 'High Protein Athlete Plan',
      goal: 'muscle_gain',
      startDate: '2026-02-01',
      endDate: '2026-03-03',
      duration: 30,
      dailyCalories: 2800,
      protein: 180,
      carbs: 300,
      fats: 80,
      mealsPerDay: 5,
      waterIntake: 3.5,
      notes: 'Focus on lean proteins and complex carbs. Pre and post-workout nutrition essential.',
      status: 'active',
      progress: 20,
    },
    {
      id: '2',
      name: 'Performance Optimization',
      goal: 'performance',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      duration: 31,
      dailyCalories: 2600,
      protein: 160,
      carbs: 280,
      fats: 75,
      mealsPerDay: 4,
      waterIntake: 3.0,
      notes: 'Balanced macros for sustained energy during training.',
      status: 'completed',
      progress: 100,
    },
  ]);

  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(plans[0]);
  const [newPlan, setNewPlan] = useState<Partial<DietPlan>>({
    name: '',
    goal: 'maintenance',
    startDate: new Date().toISOString().split('T')[0],
    duration: 30,
    dailyCalories: 2400,
    protein: 150,
    carbs: 250,
    fats: 70,
    mealsPerDay: 4,
    waterIntake: 2.5,
    notes: '',
    status: 'active',
    progress: 0,
  });

  const handleAddPlan = () => {
    if (newPlan.name && newPlan.startDate && newPlan.dailyCalories) {
      const endDate = new Date(newPlan.startDate!);
      endDate.setDate(endDate.getDate() + (newPlan.duration || 30));
      
      const plan: DietPlan = {
        id: Date.now().toString(),
        name: newPlan.name!,
        goal: newPlan.goal as DietPlan['goal'],
        startDate: newPlan.startDate!,
        endDate: endDate.toISOString().split('T')[0],
        duration: newPlan.duration || 30,
        dailyCalories: newPlan.dailyCalories!,
        protein: newPlan.protein || 150,
        carbs: newPlan.carbs || 250,
        fats: newPlan.fats || 70,
        mealsPerDay: newPlan.mealsPerDay || 4,
        waterIntake: newPlan.waterIntake || 2.5,
        notes: newPlan.notes,
        status: newPlan.status as DietPlan['status'],
        progress: 0,
      };
      setPlans([plan, ...plans]);
      setSelectedPlan(plan);
      setIsAddingPlan(false);
      resetNewPlan();
    }
  };

  const resetNewPlan = () => {
    setNewPlan({
      name: '',
      goal: 'maintenance',
      startDate: new Date().toISOString().split('T')[0],
      duration: 30,
      dailyCalories: 2400,
      protein: 150,
      carbs: 250,
      fats: 70,
      mealsPerDay: 4,
      waterIntake: 2.5,
      notes: '',
      status: 'active',
      progress: 0,
    });
  };

  const handleDeletePlan = (id: string) => {
    if (confirm('Are you sure you want to delete this diet plan?')) {
      setPlans(plans.filter((p) => p.id !== id));
      if (selectedPlan?.id === id) {
        setSelectedPlan(plans[0] || null);
      }
    }
  };

  const getGoalColor = (goal: string) => {
    switch (goal) {
      case 'weight_loss':
        return 'bg-destructive/10 text-destructive';
      case 'muscle_gain':
        return 'bg-primary/10 text-primary';
      case 'maintenance':
        return 'bg-chart-2/10 text-chart-2';
      case 'performance':
        return 'bg-accent/10 text-accent';
      case 'recovery':
        return 'bg-chart-3/10 text-chart-3';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary/10 text-primary';
      case 'completed':
        return 'bg-chart-2/10 text-chart-2';
      case 'paused':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Macro distribution data for charts
  const getMacroData = (plan: DietPlan) => [
    { name: 'Protein', value: plan.protein * 4, grams: plan.protein, color: '#1DB954' },
    { name: 'Carbs', value: plan.carbs * 4, grams: plan.carbs, color: '#F97316' },
    { name: 'Fats', value: plan.fats * 9, grams: plan.fats, color: '#06D6A0' },
  ];

  const macroData = selectedPlan ? getMacroData(selectedPlan) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2">Diet Plans</h1>
              <p className="text-muted-foreground">
                Personalized nutrition plans for optimal athletic performance
              </p>
            </div>
            <button
              onClick={() => setIsAddingPlan(true)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Create Diet Plan
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plans List */}
          <div className="lg:col-span-2 space-y-6">
            {selectedPlan && (
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Apple className="h-6 w-6 text-primary" />
                    <div>
                      <h3>{selectedPlan.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getGoalColor(selectedPlan.goal)}`}>
                          {selectedPlan.goal.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedPlan.status)}`}>
                          {selectedPlan.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{selectedPlan.dailyCalories}</div>
                    <div className="text-xs text-muted-foreground">kcal/day</div>
                  </div>
                </div>

                {/* Progress Bar */}
                {selectedPlan.status === 'active' && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">Progress</span>
                      <span className="text-sm text-muted-foreground">{selectedPlan.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${selectedPlan.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Macro Distribution Chart */}
                <div className="mb-6">
                  <h4 className="mb-4">Macro Distribution</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={macroData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {macroData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-card border border-border rounded-xl p-3">
                                  <p className="font-semibold">{data.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {data.grams}g ({data.value} kcal)
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col justify-center space-y-3">
                      {macroData.map((macro) => (
                        <div key={macro.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: macro.color }}
                            />
                            <span className="text-sm font-semibold">{macro.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{macro.grams}g</div>
                            <div className="text-xs text-muted-foreground">{macro.value} kcal</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Plan Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted/30 rounded-xl">
                    <Target className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{selectedPlan.mealsPerDay}</div>
                    <div className="text-xs text-muted-foreground">Meals/Day</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-xl">
                    <Apple className="w-5 h-5 mx-auto mb-2 text-accent" />
                    <div className="text-2xl font-bold">{selectedPlan.waterIntake}L</div>
                    <div className="text-xs text-muted-foreground">Water</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-xl">
                    <Calendar className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{selectedPlan.duration}</div>
                    <div className="text-xs text-muted-foreground">Days</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-xl">
                    <TrendingUp className="w-5 h-5 mx-auto mb-2 text-accent" />
                    <div className="text-2xl font-bold">
                      {Math.round((selectedPlan.protein / selectedPlan.dailyCalories * 100))}%
                    </div>
                    <div className="text-xs text-muted-foreground">Protein</div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-muted-foreground">Start Date:</span>
                      <span className="font-semibold ml-2">{selectedPlan.startDate}</span>
                    </div>
                    {selectedPlan.endDate && (
                      <div>
                        <span className="text-muted-foreground">End Date:</span>
                        <span className="font-semibold ml-2">{selectedPlan.endDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedPlan.notes && (
                  <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-xl">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm mb-1">Notes</p>
                        <p className="text-sm text-muted-foreground">{selectedPlan.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* All Plans */}
            <div className="bg-card rounded-2xl border border-border">
              <div className="p-6 border-b border-border">
                <h3>All Diet Plans ({plans.length})</h3>
              </div>
              <div className="divide-y divide-border">
                {plans.length === 0 ? (
                  <div className="p-12 text-center">
                    <Apple className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No diet plans created</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Create your first diet plan to get started
                    </p>
                  </div>
                ) : (
                  plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-6 hover:bg-muted/30 transition-all cursor-pointer ${
                        selectedPlan?.id === plan.id ? 'bg-muted/30' : ''
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold">{plan.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getGoalColor(plan.goal)}`}>
                              {plan.goal.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(plan.status)}`}>
                              {plan.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div>{plan.dailyCalories} kcal/day</div>
                            <div>•</div>
                            <div>{plan.duration} days</div>
                            <div>•</div>
                            <div>Started {plan.startDate}</div>
                          </div>
                          {plan.status === 'active' && plan.progress !== undefined && (
                            <div className="mt-3">
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div
                                  className="bg-primary h-1.5 rounded-full transition-all"
                                  style={{ width: `${plan.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlan(plan.id);
                          }}
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Add Form or Summary */}
          <div className="space-y-6">
            {isAddingPlan ? (
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3>Create Diet Plan</h3>
                  <button
                    onClick={() => {
                      setIsAddingPlan(false);
                      resetNewPlan();
                    }}
                    className="p-2 hover:bg-muted rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Plan Name *</label>
                    <input
                      type="text"
                      value={newPlan.name}
                      onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Summer Training Plan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Goal *</label>
                    <select
                      value={newPlan.goal}
                      onChange={(e) => setNewPlan({ ...newPlan, goal: e.target.value as DietPlan['goal'] })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="maintenance">Maintenance</option>
                      <option value="weight_loss">Weight Loss</option>
                      <option value="muscle_gain">Muscle Gain</option>
                      <option value="performance">Performance</option>
                      <option value="recovery">Recovery</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={newPlan.startDate}
                      onChange={(e) => setNewPlan({ ...newPlan, startDate: e.target.value })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Duration (days) *</label>
                    <input
                      type="number"
                      value={newPlan.duration}
                      onChange={(e) => setNewPlan({ ...newPlan, duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Daily Calories *</label>
                    <input
                      type="number"
                      value={newPlan.dailyCalories}
                      onChange={(e) => setNewPlan({ ...newPlan, dailyCalories: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Protein (g)</label>
                      <input
                        type="number"
                        value={newPlan.protein}
                        onChange={(e) => setNewPlan({ ...newPlan, protein: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Carbs (g)</label>
                      <input
                        type="number"
                        value={newPlan.carbs}
                        onChange={(e) => setNewPlan({ ...newPlan, carbs: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Fats (g)</label>
                      <input
                        type="number"
                        value={newPlan.fats}
                        onChange={(e) => setNewPlan({ ...newPlan, fats: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Meals per Day</label>
                    <input
                      type="number"
                      value={newPlan.mealsPerDay}
                      onChange={(e) => setNewPlan({ ...newPlan, mealsPerDay: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Water Intake (liters)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newPlan.waterIntake}
                      onChange={(e) => setNewPlan({ ...newPlan, waterIntake: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Notes</label>
                    <textarea
                      value={newPlan.notes}
                      onChange={(e) => setNewPlan({ ...newPlan, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Additional notes or guidelines..."
                    />
                  </div>
                  <button
                    onClick={handleAddPlan}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all"
                  >
                    <Save className="h-4 w-4 inline mr-2" />
                    Create Plan
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Nutrition Tips */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="mb-4">Nutrition Tips</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                      <p className="text-sm font-semibold text-primary mb-1">💧 Stay Hydrated</p>
                      <p className="text-xs text-muted-foreground">
                        Drink at least 3L of water daily for optimal performance
                      </p>
                    </div>
                    <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
                      <p className="text-sm font-semibold text-accent mb-1">⏰ Meal Timing</p>
                      <p className="text-xs text-muted-foreground">
                        Eat within 30min after training for best recovery
                      </p>
                    </div>
                    <div className="p-4 bg-chart-2/5 border border-chart-2/20 rounded-xl">
                      <p className="text-sm font-semibold mb-1" style={{ color: '#06D6A0' }}>
                        🥗 Protein Priority
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Aim for 1.8-2.2g protein per kg body weight
                      </p>
                    </div>
                  </div>
                </div>

                {/* Plan Statistics */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="mb-4">Plan Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
                      <span className="text-sm text-muted-foreground">Total Plans</span>
                      <span className="font-bold">{plans.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl">
                      <span className="text-sm text-muted-foreground">Active</span>
                      <span className="font-bold text-primary">
                        {plans.filter((p) => p.status === 'active').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-chart-2/5 rounded-xl">
                      <span className="text-sm text-muted-foreground">Completed</span>
                      <span className="font-bold" style={{ color: '#06D6A0' }}>
                        {plans.filter((p) => p.status === 'completed').length}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
