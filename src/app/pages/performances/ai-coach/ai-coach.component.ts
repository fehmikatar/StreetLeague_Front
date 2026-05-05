import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiCoachService, AiCoachFormData, PredictionResult } from '../../../services/ai-coach.service';
import { ApiService } from '../../../services/api.service';
import { PerformanceService } from '../../../services/performance.service';
import { LucideAngularModule, Bot, Sparkles, TrendingUp, Target, Activity, Loader2, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-ai-coach',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './ai-coach.component.html'
})
export class AiCoachComponent implements OnInit {
  aiCoachService = inject(AiCoachService);
  apiService = inject(ApiService);
  performanceService = inject(PerformanceService);

  // Icons
  BotIcon = Bot;
  SparklesIcon = Sparkles;
  TrendingUpIcon = TrendingUp;
  TargetIcon = Target;
  ActivityIcon = Activity;
  Loader2Icon = Loader2;
  ArrowRightIcon = ArrowRight;

  userId = this.apiService.getUserId() || 1;

  isLoading = signal(false);
  result = signal<PredictionResult | null>(null);
  errorMsg = signal<string | null>(null);

  formData: AiCoachFormData = {
    player_id: this.userId,
    athlete_level: 1,
    total_xp: 0,
    sport_type: 'football',
    match_score: 850,
    teamwork_score: 7,
    session_duration: 60,
    calories_burned: 450,
    win_rate: 0.6,
    streak_days: 3,
    recovery_score: 8.0,
    xp_objective: 10000,
    duration_days: 30
  };

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.performanceService.getPerformances(this.userId).subscribe({
      next: (performances: any[]) => {
        if (performances && performances.length > 0) {
          const matchesPlayed = performances.length;
          const totalScore = performances.reduce((acc: number, p: any) => acc + p.score, 0);
          const avgScore = totalScore / matchesPlayed;
          
          // On considère une note >= 7 (or une victoire) comme un succès
          const wins = performances.filter((p: any) => p.rating >= 7 || p.won || p.result === 'WIN').length;
          const winRate = wins / matchesPlayed;

          // Calcul approximatif de l'XP backend
          const totalXp = performances.reduce((acc: number, p: any) => acc + Math.floor((p.score * 10) + (p.assists * 5) + (p.distanceCovered * 2) + ((p.timePlayed || 60) * 0.1)), 0);
          
          // Calcul de la durée moyenne
          const totalDuration = performances.reduce((acc: number, p: any) => acc + (p.timePlayed || 60), 0);
          const avgDuration = totalDuration / matchesPlayed;

          // Calcul de la série (streak) de victoires récentes
          let streak = 0;
          for(let i = 0; i < performances.length; i++) {
             if (performances[i].rating >= 7 || performances[i].won || performances[i].result === 'WIN') streak++;
             else break;
          }

          this.formData.match_score = Math.round(avgScore);
          this.formData.win_rate = parseFloat(winRate.toFixed(2));
          this.formData.total_xp = totalXp;
          this.formData.athlete_level = Math.max(1, Math.floor(totalXp / 1000) + 1);
          this.formData.session_duration = Math.round(avgDuration);
          this.formData.streak_days = streak;
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  handleSubmit() {
    this.isLoading.set(true);
    this.errorMsg.set(null);

    this.aiCoachService.predict(this.formData).subscribe({
      next: (res: PredictionResult) => {
        this.result.set(res);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.errorMsg.set(err.error?.detail || "Error connecting to AI Coach. Make sure the ML model is running on port 8001.");
        this.isLoading.set(false);
      }
    });
  }
}
