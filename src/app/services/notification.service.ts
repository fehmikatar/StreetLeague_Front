import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
    private base: string;

    constructor(private http: HttpClient, private api: ApiService) {
        this.base = `${this.api.base}/notifications`;
    }

    getByUserId(userId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/user/${userId}`);
    }

    getUnread(userId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/user/${userId}/unread`);
    }

    markAsRead(id: number): Observable<void> {
        return this.http.patch<void>(`${this.base}/${id}/mark-as-read`, {});
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }
}
