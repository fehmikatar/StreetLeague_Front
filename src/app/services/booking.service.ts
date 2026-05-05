import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, catchError, of, throwError, forkJoin, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';
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
    openingTime: string;
    closingTime: string;
    latitude: number | null;
    longitude: number | null;
    available: boolean;
}

export interface Reservation {
    id: number;
    fieldId: string;
    fieldName: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
    title: string;
    location: string;
    date: string;
    time: string;
    duration: number;
    players: number;
    type: string;
    status: ReservationStatus;
    totalPrice?: number | null;
    message?: string;
}

export type ReservationStatus =
    | 'pending_confirmation'
    | 'reminder_sent'
    | 'confirmed'
    | 'completed'
    | 'cancelled';

export interface FieldFeedback {
    id?: number;
    reservationId: number;
    userId: string;
    userName?: string;
    fieldId: string;
    fieldName: string;
    rating: number;
    comment: string;
    censoredComment?: string;
    isToxic?: boolean;
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
    private readonly minimumAdvanceNoticeMs = 2 * 60 * 60 * 1000;
    private loadReservationsRetryHandle: ReturnType<typeof setTimeout> | null = null;
    private loadReservationsRetryCount = 0;

    private fieldsSubject = new BehaviorSubject<Field[]>([]);
    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    private myReservationsSubject = new BehaviorSubject<Reservation[]>([]);

    public fields$ = this.fieldsSubject.asObservable();
    public notifications$ = this.notificationsSubject.asObservable();
    public myReservations$ = this.myReservationsSubject.asObservable();

    public get fields(): Field[] {
        return this.fieldsSubject.value;
    }

    constructor(private http: HttpClient, private api: ApiService, private webSocketService: WebSocketService) {
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
                    this.spaceCacheMap.set(space.id, space);
                    const derivedOpeningTime = this.extractOpeningTime(space.hours);
                    const derivedClosingTime = this.extractClosingTime(space.hours);
                    const openingTime = space.openingTime || derivedOpeningTime || '08:00';
                    const closingTime = space.closingTime || derivedClosingTime || '22:00';
                    const parsedCoordinates = this.extractCoordinates(space.location);

                    return {
                        id: String(space.id || space.sportSpaceId || ''),
                        name: space.name || space.fieldName || 'Terrain',
                        location: space.location || space.address || 'Localisation',
                        type: space.type || space.sportType || 'Multisport',
                        price: space.pricePerHour || space.hourlyRate || 50,
                        rating: space.averageRating || space.rating || 4.5,
                        reviews: space.reviews || space.reviewCount || 0,
                        hours: space.hours || `${openingTime} - ${closingTime}`,
                        openingTime,
                        closingTime,
                        latitude: typeof space.latitude === 'number' ? space.latitude : parsedCoordinates?.lat ?? null,
                        longitude: typeof space.longitude === 'number' ? space.longitude : parsedCoordinates?.lng ?? null,
                        available: space.available !== false
                    };
                });
                this.fieldsSubject.next(mappedFields);
            },
            error: (err) => {
                console.error('Failed to load fields from API', err);
                this.fieldsSubject.next([]);
            }
        });
    }

    public refreshFields(): void {
        this.loadFields();
    }

    public getFieldFeedbacks(fieldId: string): Observable<FieldFeedback[]> {
        return this.http.get<any[]>(`${this.apiUrl}/feedbacks/space/${fieldId}/player`).pipe(
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

    public loadMyReservations() {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        const storedId = this.resolveCurrentUserId();
        if (!storedId) {
            if (this.loadReservationsRetryCount < 3 && this.loadReservationsRetryHandle === null) {
                this.loadReservationsRetryCount += 1;
                this.loadReservationsRetryHandle = setTimeout(() => {
                    this.loadReservationsRetryHandle = null;
                    this.loadMyReservations();
                }, 800);
            }
            return;
        }

        this.loadReservationsRetryCount = 0;
        this.getMyBookings().subscribe({
            next: (res) => this.myReservationsSubject.next(res),
            error: (err) => console.error('❌ Erreur chargement réservations:', err)
        });
    }

    private spaceCacheMap = new Map<number, any>();

    public getMyBookings(): Observable<Reservation[]> {
        const token = localStorage.getItem('auth_token');
        const userId = localStorage.getItem('user_id');
        const requestUrl = `${this.apiUrl}/bookings/my-bookings?t=${Date.now()}`;
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

        return this.http.get<any[]>(requestUrl, { headers }).pipe(
            map(data => {
                const payload = Array.isArray(data) ? data : [];
                return payload.map(b => this.mapBackendToFrontendReservation(b)).sort((a, b) => {
                    const timeA = new Date(`${a.date}T${a.time}:00`).getTime();
                    const timeB = new Date(`${b.date}T${b.time}:00`).getTime();
                    return timeB - timeA;
                });
            }),
            switchMap((reservations) => {
                if (reservations.length > 0 || !userId) return of(reservations);
                return this.getUserReservations(userId);
            }),
            catchError((err) => {
                if (userId) return this.getUserReservations(userId);
                return of([]);
            })
        );
    }

    public getMyTeamBookings(): Observable<Reservation[]> {
        const token = localStorage.getItem('auth_token');
        const requestUrl = `${this.apiUrl}/bookings/my-team-bookings?t=${Date.now()}`;
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

        return this.http.get<any[]>(requestUrl, { headers }).pipe(
            map(data => {
                const payload = Array.isArray(data) ? data : [];
                return payload.map(b => this.mapBackendToFrontendReservation(b)).sort((a, b) => {
                    const timeA = new Date(`${a.date}T${a.time}:00`).getTime();
                    const timeB = new Date(`${b.date}T${b.time}:00`).getTime();
                    return timeB - timeA;
                });
            }),
            catchError(() => of([]))
        );
    }

    public getUserReservations(userId: string): Observable<Reservation[]> {
        return this.http.get<any[]>(`${this.apiUrl}/bookings/user/${userId}?t=${Date.now()}`).pipe(
            map(data => data.map(b => this.mapBackendToFrontendReservation(b)).sort((a, b) => {
                const timeA = new Date(`${a.date}T${a.time}:00`).getTime();
                const timeB = new Date(`${b.date}T${b.time}:00`).getTime();
                return timeB - timeA;
            })),
            catchError(() => of([]))
        );
    }

    public respectsMinimumAdvanceNotice(date: string, time: string): boolean {
        const selectedDateTime = new Date(`${date}T${time}:00`);
        return !Number.isNaN(selectedDateTime.getTime()) && selectedDateTime.getTime() - Date.now() >= this.minimumAdvanceNoticeMs;
    }

    public isAwaitingPresenceConfirmation(status: ReservationStatus): boolean {
        return status === 'pending_confirmation' || status === 'reminder_sent';
    }

    public reserveField(reservationData: Omit<Reservation, 'id' | 'status'>): Observable<any> {
        const storedId = this.resolveCurrentUserId();
        const userId = storedId ? parseInt(storedId, 10) : NaN;

        if (!Number.isFinite(userId)) return throwError(() => new Error('Utilisateur non identifié.'));

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

        return this.http.post<any>(`${this.apiUrl}/bookings`, backendPayload).pipe(
            tap((saved) => {
                const savedReservation = this.mapBackendToFrontendReservation(saved);
                this.loadMyReservations();
            })
        );
    }

    public cancelReservation(reservationId: number): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/bookings/${reservationId}/cancel`, {}).pipe(
            tap(() => this.loadMyReservations())
        );
    }

    public confirmReservationPresence(reservationId: number): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/bookings/${reservationId}/confirm`, { response: 'CONFIRMER' }).pipe(
            tap(() => this.loadMyReservations())
        );
    }

    private mapBackendToFrontendReservation(backendBooking: any): Reservation {
        const startDate = this.parseBackendLocalDateTime(backendBooking.startTime);
        const endDate = this.parseBackendLocalDateTime(backendBooking.endTime);
        const durationH = startDate && endDate ? (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60) : 0;
        const padZero = (n: number) => n < 10 ? '0' + n : String(n);
        const formattedDate = startDate ? `${startDate.getFullYear()}-${padZero(startDate.getMonth() + 1)}-${padZero(startDate.getDate())}` : '';
        const formattedTime = startDate ? `${padZero(startDate.getHours())}:${padZero(startDate.getMinutes())}` : '';
        const status = this.parseBackendReservationStatus(backendBooking.status);

        const sportSpaceId = backendBooking.sportSpaceId;
        const cachedSpace = this.spaceCacheMap.get(Number(sportSpaceId));

        return {
            id: backendBooking.id,
            fieldId: String(sportSpaceId ?? ''),
            fieldName: backendBooking.sportSpaceName || cachedSpace?.name || 'Terrain',
            userId: backendBooking.userId != null ? String(backendBooking.userId) : undefined,
            userName: backendBooking.userName || undefined,
            userEmail: backendBooking.userEmail || undefined,
            userPhone: backendBooking.userPhone || undefined,
            title: `Réservation`,
            location: backendBooking.location || cachedSpace?.location || '',
            date: formattedDate,
            time: formattedTime,
            duration: durationH,
            players: 10,
            type: 'Multisport',
            status: status,
            totalPrice: backendBooking.totalPrice || null,
            message: backendBooking.message || undefined
        };
    }

    private parseBackendReservationStatus(status: string | null | undefined): ReservationStatus {
        const normalized = (status || '').toLowerCase();
        switch (normalized) {
            case 'pending_confirmation': return 'pending_confirmation';
            case 'reminder_sent': return 'reminder_sent';
            case 'cancelled': return 'cancelled';
            case 'completed': return 'completed';
            default: return 'confirmed';
        }
    }

    private formatLocalDateTime(date: Date): string {
        const pad = (n: number) => n < 10 ? '0' + n : n;
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
    }

    private parseBackendLocalDateTime(dateTimeStr: any): Date | null {
        if (!dateTimeStr) return null;
        const d = new Date(dateTimeStr);
        return isNaN(d.getTime()) ? null : d;
    }

    private resolveCurrentUserId(): string | null {
        const storedId = localStorage.getItem('user_id');
        if (storedId) return storedId;
        return null;
    }

    private mapBackendFeedback(f: any): FieldFeedback {
        return {
            id: f.id,
            reservationId: f.bookingId,
            userId: String(f.userId),
            userName: f.userName,
            fieldId: String(f.sportSpaceId),
            fieldName: f.sportSpaceName || 'Terrain',
            rating: f.rating,
            comment: f.comment,
            censoredComment: f.censoredComment,
            isToxic: f.isToxic,
            status: f.status,
            createdAt: f.createdAt
        };
    }

    private extractOpeningTime(hours: string): string | null {
        const match = (hours || '').match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
        return match ? match[1] : null;
    }

    private extractClosingTime(hours: string): string | null {
        const match = (hours || '').match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
        return match ? match[2] : null;
    }

    private extractCoordinates(location: string): { lat: number, lng: number } | null {
        const match = (location || '').match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
        return match ? { lat: parseFloat(match[1]), lng: parseFloat(match[2]) } : null;
    }

    public getUserFieldFeedbacks(userId: string): Observable<FieldFeedback[]> {
        return this.http.get<any[]>(`${this.apiUrl}/feedbacks/user/${userId}`).pipe(
            map(feedbacks => feedbacks.map(feedback => this.mapBackendFeedback(feedback))),
            catchError(() => of([]))
        );
    }

    public updateFieldFeedback(id: number, payload: any): Observable<FieldFeedback> {
        return this.http.put<any>(`${this.apiUrl}/feedbacks/${id}`, payload).pipe(
            map(feedback => this.mapBackendFeedback(feedback))
        );
    }

    public getFieldById(fieldId: string): Observable<Field | null> {
        return this.http.get<any>(`${this.apiUrl}/sport-spaces/${fieldId}`).pipe(
            map(space => {
                const openingTime = space.openingTime || this.extractOpeningTime(space.hours) || '08:00';
                const closingTime = space.closingTime || this.extractClosingTime(space.hours) || '22:00';
                const coords = this.extractCoordinates(space.location);
                return {
                    id: String(space.id),
                    name: space.name,
                    location: space.location,
                    type: space.sportType,
                    price: space.pricePerHour,
                    rating: space.averageRating,
                    reviews: space.reviews,
                    hours: space.hours,
                    openingTime,
                    closingTime,
                    latitude: space.latitude ?? coords?.lat ?? null,
                    longitude: space.longitude ?? coords?.lng ?? null,
                    available: space.available !== false
                };
            }),
            catchError(() => of(null))
        );
    }

    public getFieldReservations(fieldId: string): Observable<Reservation[]> {
        return this.http.get<any[]>(`${this.apiUrl}/bookings/space/${fieldId}`).pipe(
            map(data => data.map(b => this.mapBackendToFrontendReservation(b))),
            catchError(() => of([]))
        );
    }

    public isSlotAvailableClientSide(fieldId: string, date: string, time: string, duration: number, existingReservations: Reservation[]): boolean {
        const start = new Date(`${date}T${time}:00`).getTime();
        const end = start + duration * 60 * 60 * 1000;

        return !existingReservations.some(r => {
            if (r.fieldId !== fieldId || r.date !== date || r.status === 'cancelled') return false;
            const rStart = new Date(`${r.date}T${r.time}:00`).getTime();
            const rEnd = rStart + r.duration * 60 * 60 * 1000;
            return (start < rEnd && end > rStart);
        });
    }

    public getMyOwnerReservations(): Observable<Reservation[]> {
        const ownerId = localStorage.getItem('user_id');
        if (!ownerId) return of([]);
        return this.getOwnerReservations(ownerId);
    }

    public getOwnerReservations(ownerId: string): Observable<Reservation[]> {
        return this.http.get<any[]>(`${this.apiUrl}/bookings/owner/${ownerId}`).pipe(
            map(data => data.map(b => this.mapBackendToFrontendReservation(b))),
            catchError(() => of([]))
        );
    }

    public getOwnerReservationsFromOwnedFields(ownerId: string): Observable<Reservation[]> {
        return this.http.get<any[]>(`${this.apiUrl}/bookings/owner/${ownerId}/fields`).pipe(
            map(data => data.map(b => this.mapBackendToFrontendReservation(b))),
            catchError(() => of([]))
        );
    }
}
