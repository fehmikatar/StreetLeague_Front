import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
    token: string;
    user: any; // We can type this later if needed
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;

    constructor(private http: HttpClient) { }

    login(credentials: { email: string, password: string }): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
            tap(res => {
                if (res && res.token) {
                    localStorage.setItem('auth_token', res.token);
                }
                if (res && res.role) {
                    localStorage.setItem('user_type', res.role);
                }
                if (res && res.email) {
                    localStorage.setItem('user_email', res.email);
                }
                // Fetch user details to get the ID (needed for user-specific API calls)
                if (res && res.email) {
                    this.http.get<any>(`${environment.apiUrl}/users/email/${encodeURIComponent(res.email)}`, {
                        headers: { 'Authorization': `Bearer ${res.token}` }
                    }).subscribe({
                        next: (user: any) => {
                            if (user?.id) localStorage.setItem('user_id', String(user.id));
                            if (user?.firstName) localStorage.setItem('user_name', `${user.firstName} ${user.lastName || ''}`.trim());
                        },
                        error: () => {} // Non-blocking
                    });
                }
            })
        );
    }

    register(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, data, { responseType: 'text' }).pipe(
            tap(res => {
                console.log('Register response:', res);
            })
        );
    }

    getErrorMessage(err: any): string {
        if (err?.error) {
            if (typeof err.error === 'string') {
                // Try to parse JSON error body from Spring Boot
                try {
                    const parsed = JSON.parse(err.error);
                    return parsed.message || parsed.error || err.error;
                } catch {
                    return err.error;
                }
            }
            if (err.error?.message) return err.error.message;
        }
        return 'Erreur inconnue.';
    }

    requestPasswordReset(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/forgot-password`, { email });
    }
}
