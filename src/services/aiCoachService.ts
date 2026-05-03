import axios from 'axios';

// AI ML API Base URL
const AI_API_URL = 'http://localhost:8001';

export interface AthleteFeatures {
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

export interface DayPlan {
  jour: number;
  xp_jour: number;
  xp_cumulatif: number;
  progression_pct: number;
}

export interface Recommendations {
  sessions_par_jour: number;
  score_cible_par_session: number;
  teamwork_cible: number;
  duree_session_min: number;
  xp_estime_par_session: number;
  niveau_defi: string;
  badge_actuel: string;
  conseils: string[];
}

export interface PredictionResult {
  player_id: number;
  sport_type: string;
  badge_actuel: string;
  xp_per_day_predicted: number;
  difficulty_adapted: number;
  xp_gap: number;
  xp_needed_per_day: number;
  daily_plan: DayPlan[];
  recommendations: Recommendations;
}

export const aiCoachService = {
  predict: async (features: any): Promise<PredictionResult> => {
    const response = await axios.post(`${AI_API_URL}/predict`, features);
    return response.data;
  }
};
