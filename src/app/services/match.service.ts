import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export enum MatchStatus { SCHEDULED = 'SCHEDULED', LIVE = 'LIVE', FINISHED = 'FINISHED', CANCELED = 'CANCELED' }

export interface MatchRequest {
  competitionId: number; homeTeamId: number; awayTeamId: number;
  scheduledAt: string; venue: string; status?: MatchStatus;
}
export interface MatchResponse {
  id: number; competitionId: number; competitionName: string;
  homeTeamId: number; homeTeamName: string; awayTeamId: number; awayTeamName: string;
  scheduledAt: string; venue: string; status: MatchStatus; homeScore: number; awayScore: number;
  hasComputedScore?: boolean; computedHomeScore?: number; computedAwayScore?: number;
}
export interface MatchScoreUpdate { homeScore: number; awayScore: number; }

// Rating
export interface RatingBreakdown { offensive: number; defensive: number; shooting: number; discipline: number; momentum: number; }
export interface TeamRating { teamId: number; teamName: string; score: number; grade: string; breakdown: RatingBreakdown; }
export interface MatchRatingDto { homeRating: TeamRating; awayRating: TeamRating; mvpTeamId: number; mvpTeamName: string; }

// Scheduler
export interface ScheduleRequestDto { startDate: string; endDate: string; maxMatchesPerDay: number; intervalMinutes: number; }
export interface ScheduledMatchEntry { matchId: number; homeTeamId: number; homeTeamName: string; awayTeamId: number; awayTeamName: string; scheduledAt: string; }
export interface ConflictEntry { teamId: number; teamName: string; conflictDate: string; reason: string; }
export interface ScheduleResultDto { totalScheduled: number; totalConflicts: number; scheduledMatches: ScheduledMatchEntry[]; conflicts: ConflictEntry[]; }

// ── IA Prédiction ────────────────────────────────────────────
export interface MatchPredictionRequest {
  homeRank: number; awayRank: number;
  homeGoalsAvg: number; awayGoalsAvg: number;
  homeConcededAvg: number; awayConcededAvg: number;
  homeWinsLast5: number; awayWinsLast5: number;
  homeRatingAvg: number; awayRatingAvg: number;
  isNeutralVenue?: number; competitionFormat?: number;

  // Variables Live
  is_live?: boolean;
  live_home_goals?: number;
  live_away_goals?: number;
  live_home_red_cards?: number;
  live_away_red_cards?: number;
  live_minute?: number;
}
export interface MatchPredictionResponse {
  result: 'HOME_WIN' | 'AWAY_WIN' | 'DRAW';
  confidence: number;
  probabilities: { HOME_WIN: number; AWAY_WIN: number; DRAW: number };
  interpretation: string;
}

@Injectable({ providedIn: 'root' })
export class MatchService {
  private base: string;
  constructor(private http: HttpClient, private api: ApiService) {
    this.base = `${this.api.base}/matches`;
  }

  getMatches(competitionId?: number): Observable<MatchResponse[]> {
    let params = new HttpParams();
    if (competitionId) params = params.set('competitionId', competitionId.toString());
    return this.http.get<MatchResponse[]>(this.base, { params });
  }
  getMatchById(id: number): Observable<MatchResponse> { return this.http.get<MatchResponse>(`${this.base}/${id}`); }
  createMatch(data: MatchRequest): Observable<MatchResponse> { return this.http.post<MatchResponse>(this.base, data); }
  updateMatch(id: number, data: MatchRequest): Observable<MatchResponse> { return this.http.put<MatchResponse>(`${this.base}/${id}`, data); }
  deleteMatch(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
  updateScore(id: number, scores: MatchScoreUpdate): Observable<MatchResponse> { return this.http.put<MatchResponse>(`${this.base}/${id}/score`, scores); }

  // Métier 1 — Performance Rating Engine
  getMatchRating(id: number): Observable<MatchRatingDto> {
    return this.http.get<MatchRatingDto>(`${this.base}/${id}/rating`);
  }

  // Métier 2 — Match Scheduler
  scheduleMatches(competitionId: number, request: ScheduleRequestDto): Observable<ScheduleResultDto> {
    return this.http.post<ScheduleResultDto>(
      `${this.base}/competition/${competitionId}/schedule`, request);
  }

  // Métier 3 — IA Prédiction (Spring → FastAPI)
  /** Prédiction depuis la BD Spring (stats calculées automatiquement) */
  predictById(matchId: number): Observable<MatchPredictionResponse> {
    return this.http.post<MatchPredictionResponse>(`${this.base}/predict/${matchId}`, {});
  }

  /** Prédiction manuelle avec les stats fournies manuellement */
  predictManual(req: MatchPredictionRequest): Observable<MatchPredictionResponse> {
    return this.http.post<MatchPredictionResponse>(`${this.base}/predict/manual`, req);
  }
}
