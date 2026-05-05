import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AiCoachFormData {
  player_id: number;
  athlete_level: number;
  total_xp: number;
  sport_type: string;
  match_score: number;
  teamwork_score: number;
  session_duration: number;
  calories_burned: number;
  win_rate: number;
  streak_days: number;
  recovery_score: number;
  xp_objective: number;
  duration_days: number;
}

export interface PredictionResult {
  xp_needed_per_day: number;
  xp_per_day_predicted: number;
  badge_actuel: string;
  daily_plan: any[];
  recommendations: any;
}

@Injectable({
  providedIn: 'root'
})
export class AiCoachService {
  private http = inject(HttpClient);
  // Port 8001 is where the FastAPI ML model is running locally.
  private apiUrl = 'http://localhost:8000';

  predict(data: AiCoachFormData): Observable<PredictionResult> {
    return this.http.post<PredictionResult>(`${this.apiUrl}/predict`, data);
  }
}
