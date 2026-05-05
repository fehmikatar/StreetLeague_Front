import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Advertisement {
  id?: number;
  companyName: string;
  contactEmail: string;
  amount: number;
  cornterparts: string;
  bannerUrl: string;
  logoUrl: string;
  competitionId?: number;
  matchId?: number;
  teamId?: number;
  impressions?: number;
  clicks?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdvertisementService {
  private base: string;

  constructor(private http: HttpClient, private api: ApiService) {
    this.base = `${this.api.base}/advertisements`;
  }

  getAll(): Observable<Advertisement[]> {
    return this.http.get<Advertisement[]>(this.base);
  }

  getById(id: number): Observable<Advertisement> {
    return this.http.get<Advertisement>(`${this.base}/${id}`);
  }

  create(ad: Advertisement): Observable<Advertisement> {
    return this.http.post<Advertisement>(this.base, ad);
  }

  update(id: number, ad: Advertisement): Observable<Advertisement> {
    return this.http.put<Advertisement>(`${this.base}/${id}`, ad);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  recordClick(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/click`, {});
  }

  recordImpression(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/impression`, {});
  }

  getByCompetition(competitionId: number): Observable<Advertisement[]> {
    return this.http.get<Advertisement[]>(`${this.base}/competition/${competitionId}`);
  }

  getByMatch(matchId: number): Observable<Advertisement[]> {
    return this.http.get<Advertisement[]>(`${this.base}/match/${matchId}`);
  }

  getByTeam(teamId: number): Observable<Advertisement[]> {
    return this.http.get<Advertisement[]>(`${this.base}/team/${teamId}`);
  }
}
