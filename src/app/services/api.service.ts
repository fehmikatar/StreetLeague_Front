import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
    readonly base = environment.apiUrl;

    /** Decodes the stored JWT and returns the payload object, or null */
    decodeToken(): any | null {
        const token = localStorage.getItem('auth_token');
        if (!token) return null;
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload));
        } catch {
            return null;
        }
    }

    /** Returns the current user's email from localStorage */
    getUserEmail(): string {
        return localStorage.getItem('user_email') || '';
    }

    /** Returns the current user's role */
    getUserRole(): string {
        return localStorage.getItem('user_type') || '';
    }

    /** Returns user ID stored in local storage (put there after login) */
    getUserId(): number | null {
        const id = localStorage.getItem('user_id');
        return id ? parseInt(id, 10) : null;
    }
}
