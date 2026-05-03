import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { performanceService } from '@/services/performanceService';
import { playerLevelService } from '@/services/playerLevelService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Bot, Sparkles, TrendingUp, Target, Activity, Loader2, ArrowRight } from 'lucide-react';
import { aiCoachService, PredictionResult } from '@/services/aiCoachService';
import { Progress } from '@/app/components/ui/progress';

export default function AiCoach() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userId = parseInt(localStorage.getItem('user_id') || '1', 10);

  // Form State with Default Profile Values
  const [formData, setFormData] = useState({
    player_id: userId,
    athlete_level: 1,
    total_xp: 0,
    sport_type: 'football',
    match_score: 0,
    teamwork_score: 7,
    session_duration: 60,
    calories_burned: 450,
    win_rate: 0.5,
    streak_days: 3,
    recovery_score: 8.0,
    xp_objective: 10000,
    duration_days: 30
  });

  const { data: performances } = useQuery({
    queryKey: ['performances'],
    queryFn: performanceService.getAll,
  });

  const { data: playerLevel } = useQuery({
    queryKey: ['playerLevel', userId],
    queryFn: () => playerLevelService.getByPlayerId(userId),
  });

  useEffect(() => {
    if (performances && playerLevel) {
      const playerPerfs = performances.filter(p => p.playerId === userId);
      const matchesPlayed = playerPerfs.length;
      
      const totalScore = playerPerfs.reduce((acc, p) => acc + p.score, 0);
      const avgScore = matchesPlayed > 0 ? totalScore / matchesPlayed : 850; // Fallback to 850 if no matches
      
      const totalTime = playerPerfs.reduce((acc, p) => acc + p.timePlayed, 0);
      const avgTime = matchesPlayed > 0 ? totalTime / matchesPlayed : 60; // Fallback to 60 min

      const wins = playerPerfs.filter(p => p.rating >= 7).length; // Assume rating >= 7 is a win
      const winRate = matchesPlayed > 0 ? wins / matchesPlayed : 0.6;
      
      setFormData(prev => ({
        ...prev,
        athlete_level: playerLevel.currentLevel || 1,
        total_xp: playerLevel.totalXp || 0,
        match_score: Math.round(avgScore),
        session_duration: Math.round(avgTime),
        win_rate: parseFloat(winRate.toFixed(2))
      }));
    }
  }, [performances, playerLevel, userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, sport_type: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const prediction = await aiCoachService.predict(formData);
      setResult(prediction);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error connecting to AI Coach. Make sure the ML model is running on port 8001.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 bg-slate-900 p-8 rounded-2xl text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <Bot className="w-16 h-16 text-primary z-10" />
        <div className="z-10">
          <h1 className="text-4xl font-extrabold flex items-center gap-3">
            StreetLeague AI Coach <Sparkles className="text-yellow-400 w-6 h-6" />
          </h1>
          <p className="text-slate-400 text-lg mt-2">
            Our predictive model analyzes your sports profile and generates a custom training plan to reach your XP goals.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Formulaire (Sidebar) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Your Goals
              </CardTitle>
              <CardDescription>Configure your goal for the AI.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="space-y-2">
                  <Label>Sport Type</Label>
                  <Select value={formData.sport_type} onValueChange={handleSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="football">Football</SelectItem>
                      <SelectItem value="basket">Basket</SelectItem>
                      <SelectItem value="tennis">Tennis</SelectItem>
                      <SelectItem value="padel">Padel</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target XP Objective</Label>
                  <Input type="number" name="xp_objective" value={formData.xp_objective} onChange={handleChange} min={formData.total_xp + 100} />
                </div>

                <div className="space-y-2">
                  <Label>Expected Duration (days)</Label>
                  <Input type="number" name="duration_days" value={formData.duration_days} onChange={handleChange} min={1} max={365} />
                </div>
                
                {/* Paramètres Avancés Cachés ou Visibles */}
                <details className="text-sm cursor-pointer border rounded-md p-2 bg-muted/10">
                  <summary className="font-semibold text-muted-foreground outline-none">Current Parameters (Auto)</summary>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                     <div className="space-y-1"><Label className="text-xs">Current Level</Label><Input type="number" name="athlete_level" value={formData.athlete_level} onChange={handleChange} className="h-8 text-xs" /></div>
                     <div className="space-y-1"><Label className="text-xs">Current XP</Label><Input type="number" name="total_xp" value={formData.total_xp} onChange={handleChange} className="h-8 text-xs" /></div>
                     <div className="space-y-1"><Label className="text-xs">Average Score</Label><Input type="number" name="match_score" value={formData.match_score} onChange={handleChange} className="h-8 text-xs" /></div>
                     <div className="space-y-1"><Label className="text-xs">Avg Duration (min)</Label><Input type="number" name="session_duration" value={formData.session_duration} onChange={handleChange} className="h-8 text-xs" /></div>
                     <div className="space-y-1"><Label className="text-xs">Win Rate (0-1)</Label><Input type="number" name="win_rate" value={formData.win_rate} onChange={handleChange} className="h-8 text-xs" step="0.1" /></div>
                     <div className="space-y-1"><Label className="text-xs">Current Streak</Label><Input type="number" name="streak_days" value={formData.streak_days} onChange={handleChange} className="h-8 text-xs" /></div>
                  </div>
                </details>

                <Button type="submit" className="w-full h-12 text-lg shadow-xl shadow-primary/20" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Bot className="w-5 h-5 mr-2" />}
                  Generate Plan
                </Button>
                {error && <p className="text-red-500 text-sm font-semibold text-center mt-2">{error}</p>}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Result Area */}
        <div className="lg:col-span-8">
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-muted rounded-2xl bg-muted/5">
              <Bot className="w-24 h-24 text-muted-foreground opacity-20 mb-6" />
              <h3 className="text-2xl font-bold text-muted-foreground">AI Coach is ready</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                Configure your goals on the left and let our Machine Learning algorithm propose the ideal training plan to achieve them.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              
              {/* Highlight Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">XP / Day Required</div>
                    <div className="text-2xl font-bold text-primary">{result.xp_needed_per_day}</div>
                  </CardContent>
                </Card>
                <Card className="bg-accent/5 border-accent/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">XP / Day Predicted (AI)</div>
                    <div className="text-2xl font-bold text-accent">{result.xp_per_day_predicted}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Difficulty</div>
                    <div className="text-xl font-bold">{result.recommendations.niveau_defi}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Current Badge</div>
                    <div className="text-xl font-bold uppercase">{result.badge_actuel}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card className="border-t-4 border-t-primary shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Coach Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <ul className="space-y-4">
                      {result.recommendations.conseils.map((c, i) => (
                        <li key={i} className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg">
                          <ArrowRight className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="font-medium text-sm leading-tight">{c}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="bg-slate-900 text-white p-6 rounded-xl space-y-4">
                      <h4 className="font-bold text-lg mb-4 text-slate-300 border-b border-white/10 pb-2">Targets per session</h4>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Sessions per day :</span>
                        <span className="font-bold text-primary">{result.recommendations.sessions_par_jour}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Minimum duration :</span>
                        <span className="font-bold text-primary">{result.recommendations.duree_session_min} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Target score :</span>
                        <span className="font-bold text-primary">{result.recommendations.score_cible_par_session} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Teamwork goal :</span>
                        <span className="font-bold text-primary">{result.recommendations.teamwork_cible} assists</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Plan Graph (Table version) */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Daily Plan (S-Curve)
                  </CardTitle>
                  <CardDescription>
                    The AI generated a realistic effort curve over {formData.duration_days} days to reach the goal.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-64 overflow-y-auto pr-2 space-y-3">
                    {result.daily_plan.map(day => (
                      <div key={day.jour} className="flex items-center gap-4 bg-muted/20 p-2 rounded-lg text-sm">
                        <div className="w-16 font-bold text-muted-foreground">Day {day.jour}</div>
                        <div className="w-24 font-bold text-primary">+{day.xp_jour} XP</div>
                        <div className="flex-1">
                          <Progress value={day.progression_pct} className="h-2" />
                        </div>
                        <div className="w-24 text-right font-mono text-muted-foreground">{day.progression_pct}%</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
