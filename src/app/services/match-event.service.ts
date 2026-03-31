import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export enum MatchEventType {
  GOAL = 'GOAL',
  FOUL = 'FOUL',
  SUBSTITUTION = 'SUBSTITUTION',
  YELLOW_CARD = 'YELLOW_CARD',
  RED_CARD = 'RED_CARD',
  OTHER = 'OTHER'
}

export interface MatchEventRequest {
  matchId: number;
  type: MatchEventType;
  minute: number;
  teamId: number;
  playerId?: number;
  description?: string;
}

export interface MatchEventResponse {
  id: number;
  matchId: number;
  type: MatchEventType;
  minute: number;
  teamId: number;
  teamName: string;
  playerId?: number;
  playerName?: string;
  description?: string;
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
}
