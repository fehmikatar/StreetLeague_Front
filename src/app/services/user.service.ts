import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UserService {
    private base: string;

    constructor(private http: HttpClient, private api: ApiService) {
        this.base = `${this.api.base}/users`;
    }

    getById(id: number): Observable<any> {
        return this.http.get<any>(`${this.base}/${id}`);
    }

    getByEmail(email: string): Observable<any> {
        return this.http.get<any>(`${this.base}/email/${email}`).pipe(
            tap((user: any) => {
                if (user?.id) {
                    localStorage.setItem('user_id', String(user.id));
                    localStorage.setItem('user_name', `${user.firstName} ${user.lastName}`.trim());
                }
            })
        );
    }

    update(id: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.base}/${id}`, data);
    }

    getAll(): Observable<any[]> {
        return this.http.get<any[]>(this.base);
    }

    deactivate(id: number): Observable<void> {
        return this.http.patch<void>(`${this.base}/${id}/deactivate`, {});
    }
}
