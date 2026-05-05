import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PromotionRequest, PromotionResponse } from '../models/promotion.model';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/promotions`;

  getAll(): Observable<PromotionResponse[]> {
    return this.http.get<PromotionResponse[]>(this.baseUrl);
  }

  getAvailable(): Observable<PromotionResponse[]> {
    return this.http.get<PromotionResponse[]>(this.baseUrl).pipe(
      map(promotions => {
        const today = new Date().toISOString().split('T')[0];
        return promotions.filter(promo => promo.endDate >= today);
      })
    );
  }

  create(data: PromotionRequest): Observable<PromotionResponse> {
    return this.http.post<PromotionResponse>(this.baseUrl, data);
  }

  update(id: number, data: PromotionRequest): Observable<PromotionResponse> {
    return this.http.put<PromotionResponse>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
