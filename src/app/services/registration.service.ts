import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export enum RegistrationStatus { PENDING = 'PENDING', CONFIRMED = 'CONFIRMED', REJECTED = 'REJECTED' }

export interface RegistrationResponse {
  id: number;
  competitionId: number;
  teamId: number;
  status: RegistrationStatus;
  createdAt: string;
}

export interface RegistrationRequest {
  competitionId: number;
  teamId: number;
  status?: RegistrationStatus;
}

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private base: string;
  constructor(private http: HttpClient, private api: ApiService) {
    this.base = `${this.api.base}/registrations`;
  }

  getRegistrations(competitionId: number): Observable<RegistrationResponse[]> {
    const params = new HttpParams().set('competitionId', competitionId.toString());
    return this.http.get<RegistrationResponse[]>(this.base, { params });
  }

  register(req: RegistrationRequest): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(this.base, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
