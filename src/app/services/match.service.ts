import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  FINISHED = 'FINISHED',
  CANCELED = 'CANCELED'
}

export interface MatchRequest {
  competitionId: number;
  homeTeamId: number;
  awayTeamId: number;
  scheduledAt: string; // "YYYY-MM-DDTHH:mm:ss"
  venue: string;
  status?: MatchStatus; 
}

export interface MatchResponse {
  id: number;
  competitionId: number;
  competitionName: string;
  homeTeamId: number;
  homeTeamName: string;
  awayTeamId: number;
  awayTeamName: string;
  scheduledAt: string;
  venue: string;
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
}

export interface MatchScoreUpdate {
  homeScore: number;
  awayScore: number;
}

@Injectable({ providedIn: 'root' })
export class MatchService {
  private base: string;

  constructor(private http: HttpClient, private api: ApiService) {
    this.base = `${this.api.base}/matches`;
  }

  getMatches(competitionId?: number): Observable<MatchResponse[]> {
    let params = new HttpParams();
    if (competitionId) {
      params = params.set('competitionId', competitionId.toString());
    }
    return this.http.get<MatchResponse[]>(this.base, { params });
  }

  getMatchById(id: number): Observable<MatchResponse> {
    return this.http.get<MatchResponse>(`${this.base}/${id}`);
  }

  createMatch(data: MatchRequest): Observable<MatchResponse> {
    return this.http.post<MatchResponse>(this.base, data);
  }

  updateMatch(id: number, data: MatchRequest): Observable<MatchResponse> {
    return this.http.put<MatchResponse>(`${this.base}/${id}`, data);
  }

  deleteMatch(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  updateScore(id: number, scores: MatchScoreUpdate): Observable<MatchResponse> {
    return this.http.put<MatchResponse>(`${this.base}/${id}/score`, scores);
  }
}
