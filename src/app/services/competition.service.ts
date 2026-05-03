import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export enum CompetitionFormat { LEAGUE = 'LEAGUE', KNOCKOUT = 'KNOCKOUT' }
export enum CompetitionStatus { DRAFT = 'DRAFT', ONGOING = 'ONGOING', FINISHED = 'FINISHED', CANCELED = 'CANCELED' }

export interface CompetitionResponse {
  id: number; name: string; description: string; rules: string;
  format: CompetitionFormat; status: CompetitionStatus;
  startDate: string; endDate: string; location: string; organizerId: number;
  totalMatches: number; totalTeams: number;
  sportType: string; isIndividualSport: boolean;
  sportSpaceId?: number;
}
export interface CompetitionRequest {
  name: string; description: string; rules: string; format: CompetitionFormat;
  status?: CompetitionStatus; startDate: string; endDate: string; location: string; organizerId?: number;
  sportType: string; isIndividualSport: boolean;
  sportSpaceId?: number;
}

// Seeding
export interface SeedingResultDto {
  teamId: number; teamName: string; seed: number;
  winRate: number; eloScore: number; wins: number; losses: number; draws: number; matchesPlayed: number;
}
export interface ManualSeedEntry { teamId: number; seed: number; }
export interface SeedingRequestDto { seeds: ManualSeedEntry[]; }

// Analytics
export interface TeamStatEntry { teamId: number; teamName: string; value: number; }
export interface PlayerGoalEntry { playerId: number; playerName: string; goals: number; assists: number; }
export interface TeamCardSummary { teamId: number; teamName: string; warnings: number; ejections: number; }
export interface CompetitionAnalyticsDto {
  bestAttack: TeamStatEntry; bestDefense: TeamStatEntry;
  topScorers: PlayerGoalEntry[]; totalUpsets: number;
  cardsSummary: TeamCardSummary[];
  totalGoals: number; totalWarnings: number; totalEjections: number;
  totalMatches: number; finishedMatches: number;
}

@Injectable({ providedIn: 'root' })
export class CompetitionService {
  private apiUrl = `${environment.apiUrl}/competitions`;
  constructor(private http: HttpClient) { }

  getCompetitions(): Observable<CompetitionResponse[]> { return this.http.get<CompetitionResponse[]>(this.apiUrl); }
  getCompetitionById(id: number): Observable<CompetitionResponse> { return this.http.get<CompetitionResponse>(`${this.apiUrl}/${id}`); }
  createCompetition(c: CompetitionRequest): Observable<CompetitionResponse> { return this.http.post<CompetitionResponse>(this.apiUrl, c); }
  updateCompetition(id: number, c: CompetitionRequest): Observable<CompetitionResponse> { return this.http.put<CompetitionResponse>(`${this.apiUrl}/${id}`, c); }
  deleteCompetition(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }

  // Métier 1 — Seeding Engine
  getSeeding(id: number, strategy = 'WIN_RATE'): Observable<SeedingResultDto[]> {
    return this.http.post<SeedingResultDto[]>(`${this.apiUrl}/${id}/seeding?strategy=${strategy}`, null);
  }
  postSeedingManual(id: number, body: SeedingRequestDto): Observable<SeedingResultDto[]> {
    return this.http.post<SeedingResultDto[]>(`${this.apiUrl}/${id}/seeding?strategy=MANUAL`, body);
  }

  // Métier 2 — Analytics
  getAnalytics(id: number): Observable<CompetitionAnalyticsDto> {
    return this.http.get<CompetitionAnalyticsDto>(`${this.apiUrl}/${id}/analytics`);
  }

  // Métier 3 — Automatic Draw
  generateDrawByLevel(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/generate-draw`, null);
  }
}
