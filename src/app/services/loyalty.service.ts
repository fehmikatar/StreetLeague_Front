import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  LoyaltyProgram, 
  LoyaltyTier, 
  LoyaltyClient, 
  LoyaltyTransaction, 
  EnrollRequest, 
  AddPointsRequest 
} from '../models/loyalty.model';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoyaltyService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/loyalty`;

  // Programs
  getAllPrograms(): Observable<LoyaltyProgram[]> {
    return this.http.get<LoyaltyProgram[]>(`${this.baseUrl}/programs`);
  }

  createProgram(program: LoyaltyProgram): Observable<LoyaltyProgram> {
    return this.http.post<LoyaltyProgram>(`${this.baseUrl}/programs`, program);
  }

  updateProgram(id: number, program: LoyaltyProgram): Observable<LoyaltyProgram> {
    return this.http.put<LoyaltyProgram>(`${this.baseUrl}/programs/${id}`, program);
  }

  deleteProgram(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/programs/${id}`);
  }

  // Tiers
  getTiersByProgram(programId: number): Observable<LoyaltyTier[]> {
    return this.http.get<LoyaltyTier[]>(`${this.baseUrl}/tiers/program/${programId}`);
  }

  createTier(tier: LoyaltyTier): Observable<LoyaltyTier> {
    return this.http.post<LoyaltyTier>(`${this.baseUrl}/tiers`, tier);
  }

  updateTier(id: number, tier: LoyaltyTier): Observable<LoyaltyTier> {
    return this.http.put<LoyaltyTier>(`${this.baseUrl}/tiers/${id}`, tier);
  }

  deleteTier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tiers/${id}`);
  }

  // Clients
  enrollUser(request: EnrollRequest): Observable<LoyaltyClient> {
    return this.http.post<LoyaltyClient>(`${this.baseUrl}/clients/enroll`, request);
  }

  getClientByUser(userId: number): Observable<LoyaltyClient> {
    return this.http.get<LoyaltyClient>(`${this.baseUrl}/clients/${userId}`);
  }

  getAllClients(): Observable<LoyaltyClient[]> {
    return this.http.get<LoyaltyClient[]>(`${this.baseUrl}/clients`);
  }

  // Transactions
  addPoints(request: AddPointsRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/transactions/add-points`, request);
  }

  redeemPoints(userId: number, points: number, reason: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/transactions/redeem`, null, {
      params: { userId: userId.toString(), points: points.toString(), reason }
    });
  }

  getUserTransactions(userId: number): Observable<LoyaltyTransaction[]> {
    return this.http.get<LoyaltyTransaction[]>(`${this.baseUrl}/transactions/user/${userId}`);
  }
}
