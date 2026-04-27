import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export enum CompetitionFormat {
  LEAGUE = 'LEAGUE',
  KNOCKOUT = 'KNOCKOUT'
}

export enum CompetitionStatus {
  DRAFT = 'DRAFT',
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
  CANCELED = 'CANCELED'
}

export interface CompetitionResponse {
  id: number;
  name: string;
  description: string;
  rules: string;
  format: CompetitionFormat;
  status: CompetitionStatus;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  location: string;
  organizerId: number;
  totalMatches: number;
  totalTeams: number;
}

export interface CompetitionRequest {
  name: string;
  description: string;
  rules: string;
  format: CompetitionFormat;
  status?: CompetitionStatus;
  startDate: string;
  endDate: string;
  location: string;
  organizerId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CompetitionService {
  private apiUrl = `${environment.apiUrl}/competitions`;

  constructor(private http: HttpClient) {}

  getCompetitions(): Observable<CompetitionResponse[]> {
    return this.http.get<CompetitionResponse[]>(this.apiUrl);
  }

  getCompetitionById(id: number): Observable<CompetitionResponse> {
    return this.http.get<CompetitionResponse>(`${this.apiUrl}/${id}`);
  }

  createCompetition(competition: CompetitionRequest): Observable<CompetitionResponse> {
    return this.http.post<CompetitionResponse>(this.apiUrl, competition);
  }

  updateCompetition(id: number, competition: CompetitionRequest): Observable<CompetitionResponse> {
    return this.http.put<CompetitionResponse>(`${this.apiUrl}/${id}`, competition);
  }

  deleteCompetition(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchCompetitions(keyword: string): Observable<CompetitionResponse[]> {
    return this.http.get<CompetitionResponse[]>(`${this.apiUrl}/search`, {
      params: { keyword }
    });
  }
}
