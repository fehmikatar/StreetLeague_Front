import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, catchError, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { WebSocketService } from './websocket.service';

export interface Field {
    id: string;
    name: string;
    location: string;
    type: string;
    price: number;
    rating: number;
    reviews: number;
    hours: string;
    available: boolean;
}

export interface Reservation {
    id: number;
    fieldId: string;
    fieldName: string;
    title: string;
    location: string;
    date: string;
    time: string;
    duration: number;
    players: number;
    type: string;
    status: 'confirmed' | 'cancelled';
}

export interface FieldFeedback {
    id?: number;
    reservationId: number;
    userId: string;
    userName?: string;
    fieldId: string;
    fieldName: string;
    rating: number;
    comment: string;
    status?: string;
    createdAt: string;
}

export interface Notification {
    title: string;
    message: string;
    time: string;
    icon: string;
    bgColor: string;
    iconColor: string;
    read: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private apiUrl = environment.apiUrl;

    private fieldsSubject = new BehaviorSubject<Field[]>([]);
    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    private myReservationsSubject = new BehaviorSubject<Reservation[]>([]);

    public fields$ = this.fieldsSubject.asObservable();
    public notifications$ = this.notificationsSubject.asObservable();
    public myReservations$ = this.myReservationsSubject.asObservable();

    constructor(private http: HttpClient, private webSocketService: WebSocketService) {
        this.loadFields();
        this.loadStaticNotifications();
        this.loadMyReservations();
    }

    private loadFields() {
        this.http.get<any>(`${this.apiUrl}/sport-spaces`).subscribe({
            next: (response) => {
                const data = Array.isArray(response) ? response :
                    (response?.content || response?.data || []);
                this.spaceCacheMap.clear();

                const mappedFields: Field[] = (data || []).map((space: any) => {
                    // Stocker les données brutes dans le cache local
                    this.spaceCacheMap.set(space.id, space);
                    
                    return {
                        id: String(space.id || space.sportSpaceId || ''),
                        name: space.name || space.fieldName || 'Terrain',
                        location: space.location || space.address || 'Localisation',
                        type: space.type || space.sportType || 'Multisport',
                        price: space.pricePerHour || space.hourlyRate || 50,
                        rating: space.averageRating || space.rating || 4.5,
                        reviews: space.reviews || space.reviewCount || 0,
                        hours: space.hours || '8h - 22h',
                        available: space.available !== false
                    };
                });
                console.log(`📦 Loaded ${mappedFields.length} sport spaces into cache map`);
                this.fieldsSubject.next(mappedFields);
            },
            error: (err) => {
                console.error('Failed to load fields from API', err);
                this.fieldsSubject.next([]);
            }
        });
    }

    public refreshFields(): void {
        console.log('🔄 Rechargement des terrains depuis le backend...');
        this.loadFields();
    }

    public getFieldFeedbacks(fieldId: string): Observable<FieldFeedback[]> {
        return this.http.get<any[]>(`${this.apiUrl}/feedbacks/sport-space/${fieldId}`).pipe(
            map(feedbacks => feedbacks.map(feedback => this.mapBackendFeedback(feedback))),
            catchError(() => of([]))
        );
    }

    public getUserFieldFeedbacks(userId: string): Observable<FieldFeedback[]> {
        return this.http.get<any[]>(`${this.apiUrl}/feedbacks/user/${userId}`).pipe(
            map(feedbacks => feedbacks.map(feedback => this.mapBackendFeedback(feedback))),
            catchError(() => of([]))
        );
    }

    public saveFieldFeedback(feedback: Omit<FieldFeedback, 'createdAt'>): Observable<FieldFeedback> {
        return this.http.post<any>(`${this.apiUrl}/feedbacks`, {
            userId: Number(feedback.userId),
            sportSpaceId: Number(feedback.fieldId),
            bookingId: feedback.reservationId,
            rating: feedback.rating,
            comment: feedback.comment
        }).pipe(
            map(savedFeedback => this.mapBackendFeedback(savedFeedback)),
            tap(() => {
                const currentNotifs = this.notificationsSubject.getValue();
                const newNotif: Notification = {
                    title: 'Avis enregistré',
                    message: `Merci pour votre retour sur "${feedback.fieldName}".`,
                    time: 'Maintenant',
                    icon: 'star',
                    bgColor: 'bg-amber-50',
                    iconColor: 'text-amber-500',
                    read: false
                };
                this.notificationsSubject.next([newNotif, ...currentNotifs]);
                this.webSocketService.showNotification({
                    type: 'message',
                    title: newNotif.title,
                    message: newNotif.message,
                    fieldName: feedback.fieldName
                });
                this.refreshFields();
            })
        );
    }

    private loadStaticNotifications() {
        const defaultNotifs: Notification[] = [
            {
                title: 'Bienvenue',
                message: 'Bienvenue sur StreetLeague !',
                time: 'Maintenant',
                icon: 'bell',
                bgColor: 'bg-blue-50',
                iconColor: 'text-blue-500',
                read: false
            },
        ];
        this.notificationsSubject.next(defaultNotifs);
    }

    public removeNotification(title: string, message: string, time: string): void {
        const filtered = this.notificationsSubject.getValue().filter((notification) =>
            !(
                notification.title === title &&
                notification.message === message &&
                notification.time === time
            )
        );
        this.notificationsSubject.next(filtered);
    }

    public loadMyReservations() {
        const storedId = localStorage.getItem('user_id');
        console.log('🔄 loadMyReservations() appelée pour userId:', storedId);
        if (!storedId) {
            console.warn('⚠️ Pas de user_id dans localStorage');
            return;
        }
        this.getUserReservations(storedId).subscribe({
            next: (res) => {
                console.log('✅ Réservations chargées depuis backend:', res.length, 'réservations');
                this.myReservationsSubject.next(res);
            },
            error: (err) => {
                console.error('❌ Erreur lors du chargement des réservations:', err);
            }
        });
    }

    private spaceCacheMap = new Map<number, any>(); // Cache local pour SportSpaces

    public getFieldById(id: string): Field | undefined {
        return this.fieldsSubject.getValue().find(f => f.id === id);
    }

    public getUserReservations(userId: string): Observable<Reservation[]> {
        return this.http.get<any[]>(`${this.apiUrl}/bookings/user/${userId}`).pipe(
            map(data => {
                console.log('📥 Raw user reservations from backend:', data);
                return data.map(b => this.mapBackendToFrontendReservation(b));
            }),
            catchError(() => of([]))
        );
    }

    public getFieldReservations(fieldId: string): Observable<Reservation[]> {
        return this.http.get<any[]>(`${this.apiUrl}/bookings/sport-space/${fieldId}`).pipe(
            map(data => {
                console.log('📥 Raw field reservations from backend:', data);
                // Filtrer les réservations annulées - garder seulement les CONFIRMED
                const filtered = data
                    .map(b => this.mapBackendToFrontendReservation(b))
                    .filter(r => r.status === 'confirmed');
                
                console.log(`📋 Réservations confirmées pour terrain ${fieldId}:`, filtered.length);
                return filtered;
            }),
            catchError(() => of([]))
        );
    }

    public isSlotAvailableClientSide(
        reservations: Reservation[],
        fieldId: string,
        date: string,
        time: string,
        duration: number
    ): boolean {
        const convertToMinutes = (t: string) => {
            const parts = t.split(':');
            return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        };

        const reqStart = convertToMinutes(time);
        const reqEnd = reqStart + duration * 60;

        return !reservations.some(r => {
            if (r.status === 'cancelled') return false;
            if (r.fieldId !== fieldId || r.date !== date) return false;

            const rStart = convertToMinutes(r.time);
            const rEnd = rStart + r.duration * 60;

            return reqStart < rEnd && reqEnd > rStart;
        });
    }

    public reserveField(reservationData: Omit<Reservation, 'id' | 'status'>): Observable<any> {
        const storedId = localStorage.getItem('user_id');
        const userId = storedId ? parseInt(storedId, 10) : 1;

        const startParts = reservationData.time.split(':');
        const startDate = new Date(reservationData.date);
        startDate.setHours(parseInt(startParts[0], 10), parseInt(startParts[1], 10), 0);

        const endDate = new Date(startDate.getTime() + reservationData.duration * 60 * 60 * 1000);

        const backendPayload = {
            userId: userId,
            sportSpaceId: parseInt(reservationData.fieldId, 10),
            startTime: this.formatLocalDateTime(startDate),
            endTime: this.formatLocalDateTime(endDate)
        };
        
        console.log('📤 Envoi de réservation au backend:', backendPayload);

        return this.http.post<any>(`${this.apiUrl}/bookings`, backendPayload).pipe(
            tap((saved) => {
                console.log('✅ Réservation créée avec succès:', saved);
                
                // Notification locale
                const currentNotifs = this.notificationsSubject.getValue();
                const newNotif: Notification = {
                    title: 'Réservation confirmée',
                    message: `Votre réservation pour "${reservationData.fieldName}" est confirmée.`,
                    time: 'Maintenant',
                    icon: 'calendar',
                    bgColor: 'bg-green-50',
                    iconColor: 'text-green-500',
                    read: false
                };
                this.notificationsSubject.next([newNotif, ...currentNotifs]);

                // ✅ Le backend envoie automatiquement la notification WebSocket via STOMP

                // ✅ Ajouter immédiatement dans myReservations$
                const newRes: Reservation = {
                    id: saved?.id || Date.now(),
                    fieldId: reservationData.fieldId,
                    fieldName: reservationData.fieldName,
                    title: reservationData.title,
                    location: reservationData.location,
                    date: reservationData.date,
                    time: reservationData.time,
                    duration: reservationData.duration,
                    players: reservationData.players,
                    type: reservationData.type,
                    status: 'confirmed'
                };
                const current = this.myReservationsSubject.getValue();
                this.myReservationsSubject.next([newRes, ...current]);
                console.log('📋 Réservation ajoutée à myReservations$:', newRes);
            }),
            catchError(err => {
                console.error('❌ Erreur lors de la création de réservation:', err);
                console.error('Status:', err.status);
                console.error('Message:', err?.error?.message || err?.message);
                return throwError(() => err);
            })
        );
    }

    public cancelReservation(reservationId: number): Observable<any> {
        console.log('🔄 Envoi de la requête PATCH /bookings/', reservationId, '/cancel vers', `${this.apiUrl}/bookings/${reservationId}/cancel`);
        
        return this.http.patch<any>(`${this.apiUrl}/bookings/${reservationId}/cancel`, {}).pipe(
            tap((response) => {
                console.log('✅ Réponse du serveur reçue:', response);
                
                // Mettre à jour la liste des réservations
                const current = this.myReservationsSubject.getValue();
                const updated = current.map(r => 
                    r.id === reservationId ? { ...r, status: 'cancelled' as const } : r
                );
                this.myReservationsSubject.next(updated);
                console.log('✅ État local mis à jour - réservation marquée comme annulée');

                // Notification locale
                const currentNotifs = this.notificationsSubject.getValue();
                const newNotif: Notification = {
                    title: 'Réservation annulée',
                    message: 'Votre réservation a été annulée avec succès.',
                    time: 'Maintenant',
                    icon: 'calendar',
                    bgColor: 'bg-red-50',
                    iconColor: 'text-red-500',
                    read: false
                };
                this.notificationsSubject.next([newNotif, ...currentNotifs]);

                // ✅ Le backend envoie automatiquement la notification WebSocket via STOMP
            }),
            catchError(err => {
                console.error('❌ Erreur PATCH:', err);
                console.error('Status:', err.status);
                console.error('Error:', err.error);
                throw err;
            })
        );
    }

    private mapBackendToFrontendReservation(backendBooking: any): Reservation {
        console.log('🔍 Backend booking data:', backendBooking);
        
        const startDate = this.parseBackendLocalDateTime(backendBooking.startTime);
        const endDate = this.parseBackendLocalDateTime(backendBooking.endTime);
        const durationH = startDate && endDate
            ? (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
            : 0;

        const padZero = (n: number) => n < 10 ? '0' + n : String(n);
        const formattedDate = startDate
            ? `${startDate.getFullYear()}-${padZero(startDate.getMonth() + 1)}-${padZero(startDate.getDate())}`
            : '';
        const formattedTime = startDate
            ? `${padZero(startDate.getHours())}:${padZero(startDate.getMinutes())}`
            : '';

        // Mapper le statut correctement
        const statusLower = backendBooking.status?.toLowerCase() || 'confirmed';
        const status: 'confirmed' | 'cancelled' = statusLower === 'cancelled' ? 'cancelled' : 'confirmed';

        // Tenter d'extraire le nom du terrain et la localisation
        let fieldName = backendBooking.sportSpaceName || 'Terrain';
        let location = backendBooking.location || '';
        const sportSpaceId = backendBooking.sportSpaceId;
        
        console.log(`📌 Raw data - sportSpaceName: "${backendBooking.sportSpaceName}", location: "${backendBooking.location}", sportSpaceId: ${sportSpaceId}`);
        
        // Si sportSpace est un objet (nested), extraire les infos
        if (backendBooking.sportSpace && typeof backendBooking.sportSpace === 'object') {
            console.log(`🔗 SportSpace objet trouvé:`, backendBooking.sportSpace);
            fieldName = backendBooking.sportSpace.name || fieldName;
            location = backendBooking.sportSpace.location || backendBooking.sportSpace.address || location;
        }
        
        // 🎯 Essayer de charger depuis le cache local des SportSpaces
        if (!fieldName || fieldName === 'Terrain' || !location) {
            const cachedSpace = this.spaceCacheMap.get(sportSpaceId);
            
            if (cachedSpace) {
                console.log(`✅ SportSpace trouvé dans le cache local:`, cachedSpace);
                if (!fieldName || fieldName === 'Terrain') {
                    fieldName = cachedSpace.name || cachedSpace.fieldName || fieldName;
                }
                if (!location) {
                    location = cachedSpace.location || cachedSpace.address || location;
                }
            } else {
                // Alternative: essayer depuis le BehaviorSubject fieldsSubject
                const cachedFields = this.fieldsSubject.getValue();
                const cachedField = cachedFields.find(f => f.id === String(sportSpaceId));
                
                if (cachedField) {
                    console.log(`✅ Champ trouvé dans fieldsSubject:`, cachedField);
                    if (!fieldName || fieldName === 'Terrain') {
                        fieldName = cachedField.name;
                    }
                    if (!location) {
                        location = cachedField.location;
                    }
                } else {
                    console.warn(`⚠️ Données NOT trouvées pour SportSpaceId ${sportSpaceId}. Cache has ${this.spaceCacheMap.size} items`);
                }
            }
        }
        
        console.log(`📍 FINAL MAPPED: fieldName="${fieldName}", location="${location}"`);

        return {
            id: backendBooking.id,
            fieldId: String(sportSpaceId),
            fieldName: fieldName,
            title: `Réservation`,
            location: location,
            date: formattedDate,
            time: formattedTime,
            duration: durationH,
            players: 10,
            type: 'Multisport',
            status: status
        };
    }

    private mapBackendFeedback(feedback: any): FieldFeedback {
        return {
            id: feedback.id,
            reservationId: Number(feedback.bookingId),
            userId: String(feedback.userId),
            userName: feedback.userName || '',
            fieldId: String(feedback.sportSpaceId),
            fieldName: feedback.sportSpaceName || 'Terrain',
            rating: Number(feedback.rating),
            comment: feedback.comment || '',
            status: feedback.status,
            createdAt: feedback.createdAt || new Date().toISOString()
        };
    }

    private formatLocalDateTime(date: Date): string {
        const pad = (value: number) => value.toString().padStart(2, '0');

        return [
            date.getFullYear(),
            pad(date.getMonth() + 1),
            pad(date.getDate())
        ].join('-') + 'T' + [
            pad(date.getHours()),
            pad(date.getMinutes()),
            pad(date.getSeconds())
        ].join(':');
    }

    private parseBackendLocalDateTime(value: string | null | undefined): Date | null {
        if (!value) {
            return null;
        }

        const match = value.match(
            /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/
        );

        if (!match) {
            const fallback = new Date(value);
            return Number.isNaN(fallback.getTime()) ? null : fallback;
        }

        const [, year, month, day, hour, minute, second = '00'] = match;
        return new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute),
            Number(second)
        );
    }
}
