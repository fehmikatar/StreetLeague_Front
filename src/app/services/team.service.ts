import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class TeamService {
    private base: string;

    constructor(private http: HttpClient, private api: ApiService) {
        this.base = `${this.api.base}/teams`;
    }

    getAll(sport?: string, city?: string, level?: string): Observable<any[]> {
        let params = new HttpParams();
        if (sport) params = params.set('sport', sport);
        if (city) params = params.set('city', city);
        if (level) params = params.set('level', level);
        return this.http.get<any[]>(this.base, { params });
    }

    getCategories(): Observable<any[]> {
        return this.http.get<any[]>(`${this.api.base}/categories`);
    }

    getById(id: number, userId?: number): Observable<any> {
        let params = new HttpParams();
        if (userId) params = params.set('userId', userId.toString());
        return this.http.get<any>(`${this.base}/${id}`, { params });
    }

    create(data: any, userId: number): Observable<any> {
        const params = new HttpParams().set('userId', userId.toString());
        return this.http.post<any>(this.base, data, { params });
    }

    update(id: number, data: any, userId: number): Observable<any> {
        const params = new HttpParams().set('userId', userId.toString());
        return this.http.put<any>(`${this.base}/${id}`, data, { params });
    }

    delete(id: number, userId: number): Observable<void> {
        const params = new HttpParams().set('userId', userId.toString());
        return this.http.delete<void>(`${this.base}/${id}`, { params });
    }

    addMember(member: any): Observable<any> {
        return this.http.post<any>(`${this.api.base}/team-members`, member);
    }

    removeMember(memberId: number): Observable<void> {
        return this.http.delete<void>(`${this.api.base}/team-members/${memberId}`);
    }
}
