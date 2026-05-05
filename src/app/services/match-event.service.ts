import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export enum MatchEventType {
  SCORE = 'SCORE', ASSIST = 'ASSIST', FOUL = 'FOUL',
  SUBSTITUTION = 'SUBSTITUTION', WARNING = 'WARNING', EJECTION = 'EJECTION', TIMEOUT = 'TIMEOUT', OTHER = 'OTHER'
}

export interface MatchEventRequest {
  matchId: number; type: MatchEventType; minute: number;
  teamId: number; playerId?: number; description?: string; points?: number;
}
export interface MatchEventResponse {
  id: number; matchId: number; type: MatchEventType; minute: number;
  teamId: number; teamName: string; playerId?: number; playerName?: string; description?: string; points?: number;
}

// Timeline
export interface TimelineEventDto extends MatchEventResponse {
  homeScoreSnapshot: number; awayScoreSnapshot: number;
  momentum: 'HOME' | 'AWAY' | 'NEUTRAL'; anomalies: string[];
}

// Player Stats
export interface PlayerEntry {
  playerId: number; playerName: string; teamId: number; teamName: string;
  goals: number; assists: number; yellowCards: number; redCards: number;
  fouls: number; substitutions: number; rating: number; stars: number; ejected: boolean;
}
export interface PlayerStatsDto {
  topScorers: PlayerEntry[]; topAssists: PlayerEntry[];
  bestRated: PlayerEntry[]; mostDisciplined: PlayerEntry[]; allPlayers: PlayerEntry[];
}

@Injectable({ providedIn: 'root' })
export class MatchEventService {
  private base: string;
  constructor(private http: HttpClient, private api: ApiService) {
    this.base = `${this.api.base}/match-events`;
  }

  getEventsByMatch(matchId: number): Observable<MatchEventResponse[]> {
    return this.http.get<MatchEventResponse[]>(`${this.base}/match/${matchId}`);
  }
  logEvent(data: MatchEventRequest): Observable<MatchEventResponse> {
    return this.http.post<MatchEventResponse>(this.base, data);
  }
  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  // Métier 1 — Event Timeline Engine
  getTimeline(matchId: number): Observable<TimelineEventDto[]> {
    return this.http.get<TimelineEventDto[]>(`${this.base}/match/${matchId}/timeline`);
  }

  // Métier 2 — Player Stats Aggregator
  getPlayerStats(matchId: number): Observable<PlayerStatsDto> {
    return this.http.get<PlayerStatsDto>(`${this.base}/match/${matchId}/player-stats`);
  }
}
