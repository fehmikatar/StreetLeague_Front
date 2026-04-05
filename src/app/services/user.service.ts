import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of, catchError, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

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

    // ===== Nouvelles méthodes pour la modification de profil =====

    /**
     * Récupère le profil utilisateur actuel
     */
    getUserProfile(): Observable<any> {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            return of({
                firstName: 'Utilisateur',
                lastName: '',
                email: '',
                phone: '',
                role: 'Joueur'
            });
        }
        return this.http.get<any>(`${this.base}/${userId}`).pipe(
            tap(profile => {
                console.log('✅ Profil chargé:', profile);
            })
        );
    }

    /**
     * Met à jour le profil utilisateur avec confirmation du mot de passe
     */
    updateUserProfile(profile: any): Observable<any> {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            throw new Error('User ID not found');
        }

        const updateData = {
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            phone: profile.phone,
            password: profile.password  // Inclure le password pour la confirmation
        };

        console.log('📤 Envoi mise à jour profil (PATCH):', { ...updateData, password: '***' });

        // Essayer d'abord avec PATCH (mise à jour partielle)
        return this.http.patch<any>(`${this.base}/${userId}`, updateData).pipe(
            tap((updated) => {
                console.log('✅ Profil mis à jour (PATCH):', updated);
                localStorage.setItem('user_name', `${updated.firstName} ${updated.lastName}`.trim());
            }),
            // Fallback sur PUT si PATCH ne marche pas
            catchError((err) => {
                if (err.status === 405 || err.status === 404) { // Method Not Allowed or Not Found
                    console.warn('⚠️ PATCH non supporté, essai PUT...');
                    return this.http.put<any>(`${this.base}/${userId}`, updateData).pipe(
                        tap((updated) => {
                            console.log('✅ Profil mis à jour (PUT):', updated);
                            localStorage.setItem('user_name', `${updated.firstName} ${updated.lastName}`.trim());
                        })
                    );
                }
                return throwError(() => err);
            })
        );
    }

    /**
     * Upload la photo de profil
     */
    uploadProfileImage(file: File): Observable<any> {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            console.error('❌ Impossible de trouver user_id dans localStorage');
            throw new Error('User ID not found - Assurez-vous que user_id est stocké après login');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.warn('⚠️ Aucun token d\'authentification trouvé - La requête sera probablement rejetée avec 401 ou 403');
        } else {
            console.log('✅ Token d\'authentification trouvé (première 20 car):', token.substring(0, 20) + '...');
        }

        console.log('📤 Tentative d\'upload:', {
            url: `${this.base}/${userId}/profile-image`,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            userId: userId
        });

        return this.http.post<any>(`${this.base}/${userId}/profile-image`, formData).pipe(
            tap((response) => {
                console.log('✅ Photo de profil uploadée avec succès:', response);
            }),
            catchError((error) => {
                console.error('❌ Erreur lors de l\'upload de la photo:', {
                    status: error.status,
                    statusText: error.statusText,
                    message: error.message,
                    url: `${this.base}/${userId}/profile-image`,
                    fileInfo: { name: file.name, size: file.size }
                });
                return throwError(() => error);
            })
        );
    }

    /**
     * Récupère l'URL de la photo de profil
     */
    getProfileImage(): Observable<string | null> {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            return of(null);
        }

        // Simplement retourner un observable qui complète
        // L'URL réelle sera construite dans le composant
        return of(userId);
    }

    /**
     * Construit l'URL directe de la photo de profil d'un utilisateur
     */
    getProfileImageUrl(userId: number): string {
        return `${environment.apiUrl}/users/${userId}/profile-image/content`;
    }

    /**
     * Récupère le contenu binaire de la photo de profil avec authentification.
     * Ceci évite le 403 provoqué par un simple <img src="..."> sur un endpoint protégé.
     */
    getProfileImageBlob(userId: number): Observable<Blob> {
        return this.http.get(this.getProfileImageUrl(userId), {
            responseType: 'blob'
        }).pipe(
            tap(() => {
                console.log('✅ Contenu de la photo de profil chargé avec authentification');
            })
        );
    }
}
