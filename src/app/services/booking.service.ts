import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, catchError, of, throwError, forkJoin, switchMap } from 'rxjs';
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
        return this.http.get<any[]>(`${this.apiUrl}/feedbacks/space/${fieldId}/player`).pipe(
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

    public updateFieldFeedback(
        feedbackId: number,
        feedback: Omit<FieldFeedback, 'createdAt' | 'id'>
    ): Observable<FieldFeedback> {
        return this.http.put<any>(`${this.apiUrl}/feedbacks/${feedbackId}`, {
            userId: Number(feedback.userId),
            sportSpaceId: Number(feedback.fieldId),
            bookingId: feedback.reservationId,
            rating: feedback.rating,
            comment: feedback.comment
        }).pipe(
            map(updatedFeedback => this.mapBackendFeedback(updatedFeedback)),
            tap(() => {
                const currentNotifs = this.notificationsSubject.getValue();
                const newNotif: Notification = {
                    title: 'Avis mis à jour',
                    message: `Votre avis sur "${feedback.fieldName}" a été mis à jour.`,
                    time: 'Maintenant',
                    icon: 'star',
                    bgColor: 'bg-blue-50',
                    iconColor: 'text-blue-500',
                    read: false
                };
                this.notificationsSubject.next([newNotif, ...currentNotifs]);
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
        const token = localStorage.getItem('auth_token');
        console.log('🔄 loadMyReservations() appelée, token présent:', !!token);
        if (!token) {
            this.myReservationsSubject.next([]);
            return;
        }

        this.getMyBookings().subscribe({
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
        return this.http.get<any[]>(`${this.apiUrl}/bookings/user/${userId}?t=${Date.now()}`).pipe(
            map(data => {
                console.log('📥 Raw user reservations from backend:', data);
                const mapped = data.map(b => this.mapBackendToFrontendReservation(b));
                return mapped.sort((a, b) => {
                    const timeA = new Date(`${a.date}T${a.time}:00`).getTime();
                    const timeB = new Date(`${b.date}T${b.time}:00`).getTime();
                    return timeB - timeA;
                });
            }),
            catchError(() => of([]))
        );
    }

    public getMyBookings(): Observable<Reservation[]> {
        const token = localStorage.getItem('auth_token');
        const userId = localStorage.getItem('user_id');
        const requestUrl = `${this.apiUrl}/bookings/my-bookings?t=${Date.now()}`;
        const headers = token
            ? new HttpHeaders({ Authorization: `Bearer ${token}` })
            : undefined;

        console.log('🔄 GET my-bookings URL:', requestUrl);
        console.log('🔐 Token présent pour my-bookings:', !!token);
        console.log('🆔 user_id localStorage:', userId);

        return this.http.get<any[]>(requestUrl, { headers }).pipe(
            map(data => {
                const payload = Array.isArray(data) ? data : [];
                console.log('📥 Raw my bookings from backend:', payload);
                const mapped = payload.map(b => this.mapBackendToFrontendReservation(b));
                return mapped.sort((a, b) => {
                    const timeA = new Date(`${a.date}T${a.time}:00`).getTime();
                    const timeB = new Date(`${b.date}T${b.time}:00`).getTime();
                    return timeB - timeA;
                });
            }),
            switchMap((reservations) => {
                if (reservations.length > 0 || !userId) {
                    return of(reservations);
                }

                console.warn('⚠️ Endpoint my-bookings vide, fallback vers /bookings/user/' + userId);
                return this.getUserReservations(userId).pipe(
                    tap(fallbackReservations => {
                        console.log('📥 Réservations récupérées via fallback userId:', fallbackReservations);
                    })
                );
            }),
            catchError((err) => {
                console.error('❌ Erreur lors du chargement de mes réservations:', err);

                if (userId) {
                    console.warn('⚠️ Fallback erreur vers /bookings/user/' + userId);
                    return this.getUserReservations(userId).pipe(
                        tap(fallbackReservations => {
                            console.log('📥 Réservations récupérées via fallback après erreur:', fallbackReservations);
                        })
                    );
                }

                return of([]);
            })
        );
    }

    public getOwnerReservations(ownerId: string): Observable<Reservation[]> {
        return this.http.get<any[]>(`${this.apiUrl}/bookings/owner/${ownerId}?t=${Date.now()}`).pipe(
            map(data => {
                console.log('📥 Raw owner reservations from backend:', data);
                const mapped = data.map(b => this.mapBackendToFrontendReservation(b));
                return mapped.sort((a, b) => {
                    const timeA = new Date(`${a.date}T${a.time}:00`).getTime();
                    const timeB = new Date(`${b.date}T${b.time}:00`).getTime();
                    return timeB - timeA;
                });
            }),
            catchError(() => of([]))
        );
    }

    public getMyOwnerReservations(): Observable<Reservation[]> {
        return this.http.get<any[]>(`${this.apiUrl}/bookings/owner/me?t=${Date.now()}`).pipe(
            map(data => {
                console.log('📥 Raw owner reservations (/me) from backend:', data);
                const mapped = data.map(b => this.mapBackendToFrontendReservation(b));
                return mapped.sort((a, b) => {
                    const timeA = new Date(`${a.date}T${a.time}:00`).getTime();
                    const timeB = new Date(`${b.date}T${b.time}:00`).getTime();
                    return timeB - timeA;
                });
            }),
            catchError(() => of([]))
        );
    }

    public getOwnerReservationsFromOwnedFields(ownerId: string): Observable<Reservation[]> {
        return this.http.get<any[]>(`${this.apiUrl}/sport-spaces/owner/${ownerId}?t=${Date.now()}`).pipe(
            switchMap((sportSpaces) => {
                if (!Array.isArray(sportSpaces) || sportSpaces.length === 0) {
                    return of([]);
                }

                const bookingRequests = sportSpaces.map((sportSpace) =>
                    this.http.get<any[]>(`${this.apiUrl}/bookings/sport-space/${sportSpace.id}?t=${Date.now()}`).pipe(
                        catchError(() => of([]))
                    )
                );

                return forkJoin(bookingRequests).pipe(
                    map((bookingsByField) => bookingsByField.flat())
                );
            }),
            map((data) => {
                console.log('📥 Raw owner reservations (via owned fields) from backend:', data);
                const mapped = data.map(b => this.mapBackendToFrontendReservation(b));
                return mapped.sort((a, b) => {
                    const timeA = new Date(`${a.date}T${a.time}:00`).getTime();
                    const timeB = new Date(`${b.date}T${b.time}:00`).getTime();
                    return timeB - timeA;
                });
            }),
            catchError(() => of([]))
        );
    }

    public getFieldReservations(fieldId: string): Observable<Reservation[]> {
        return this.http.get<any[]>(`${this.apiUrl}/bookings/sport-space/${fieldId}?t=${Date.now()}`).pipe(
            map(data => {
                console.log('📥 Raw field reservations from backend:', data);

                const filtered = data
                    .map(b => this.mapBackendToFrontendReservation(b))
                    .filter(r => this.isBlockingReservationStatus(r.status));

                console.log(`📋 Réservations bloquantes pour terrain ${fieldId}:`, filtered.length);
                return filtered;
            }),
            catchError(() => of([]))
        );
    }

    public respectsMinimumAdvanceNotice(date: string, time: string): boolean {
        const selectedDateTime = new Date(`${date}T${time}:00`);

        return !Number.isNaN(selectedDateTime.getTime())
            && selectedDateTime.getTime() - Date.now() >= this.minimumAdvanceNoticeMs;
    }

    public isAwaitingPresenceConfirmation(status: ReservationStatus): boolean {
        return status === 'pending_confirmation' || status === 'reminder_sent';
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
            if (!this.isBlockingReservationStatus(r.status)) return false;
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

                const savedReservation = this.mapBackendToFrontendReservation(saved);
                const reservationMessage = saved?.message
                    || 'Votre réservation a été enregistrée.';
                const notificationContent = this.buildNotificationContent(
                    reservationMessage,
                    'Réservation enregistrée'
                );

                const currentNotifs = this.notificationsSubject.getValue();
                const newNotif: Notification = {
                    title: notificationContent.title,
                    message: notificationContent.message,
                    time: 'Maintenant',
                    icon: 'calendar',
                    bgColor: 'bg-green-50',
                    iconColor: 'text-green-500',
                    read: false
                };
                this.notificationsSubject.next([newNotif, ...currentNotifs]);

                const newRes: Reservation = {
                    ...savedReservation,
                    id: savedReservation.id || Date.now(),
                    fieldId: savedReservation.fieldId || reservationData.fieldId,
                    fieldName: savedReservation.fieldName || reservationData.fieldName,
                    title: reservationData.title,
                    location: savedReservation.location || reservationData.location,
                    date: savedReservation.date || reservationData.date,
                    time: savedReservation.time || reservationData.time,
                    duration: savedReservation.duration || reservationData.duration,
                    players: reservationData.players,
                    type: reservationData.type,
                    totalPrice: savedReservation.totalPrice ?? null,
                    message: reservationMessage
                };
                const current = this.myReservationsSubject.getValue();
                const updated = [newRes, ...current].sort((a, b) => {
                    const timeA = new Date(`${a.date}T${a.time}:00`).getTime();
                    const timeB = new Date(`${b.date}T${b.time}:00`).getTime();
                    return timeB - timeA;
                });
                this.myReservationsSubject.next(updated);
                console.log('📋 Réservation ajoutée à myReservations$:', newRes);
            }),
            catchError(err => {
                console.error('❌ Erreur lors de la création de réservation:', err);
                console.error('Status:', err.status);
                console.error('Message:', err?.error?.error || err?.error?.message || err?.message);
                return throwError(() => err);
            })
        );
    }

    public cancelReservation(reservationId: number): Observable<any> {
        console.log('🔄 Envoi de la requête PATCH /bookings/', reservationId, '/cancel vers', `${this.apiUrl}/bookings/${reservationId}/cancel`);

        const reservation = this.myReservationsSubject.getValue().find(r => r.id === reservationId);
        const cancellationMessage = reservation
            ? `Votre réservation pour "${reservation.fieldName}" a été annulée.`
            : 'Votre réservation a été annulée.';
        const notificationContent = this.buildNotificationContent(
            cancellationMessage,
            'Réservation annulée'
        );

        return this.http.patch<any>(`${this.apiUrl}/bookings/${reservationId}/cancel`, {}).pipe(
            tap((response) => {
                console.log('✅ Réponse du serveur reçue:', response);

                const current = this.myReservationsSubject.getValue();
                const updated = current.map(r =>
                    r.id === reservationId ? { ...r, status: 'cancelled' as ReservationStatus } : r
                );
                this.myReservationsSubject.next(updated);
                console.log('✅ État local mis à jour - réservation marquée comme annulée');

                const currentNotifs = this.notificationsSubject.getValue();
                const newNotif: Notification = {
                    title: notificationContent.title,
                    message: notificationContent.message,
                    time: 'Maintenant',
                    icon: 'calendar',
                    bgColor: 'bg-red-50',
                    iconColor: 'text-red-500',
                    read: false
                };
                this.notificationsSubject.next([newNotif, ...currentNotifs]);
            }),
            catchError(err => {
                console.error('❌ Erreur PATCH:', err);
                console.error('Status:', err.status);
                console.error('Error:', err.error);
                return throwError(() => err);
            })
        );
    }

    public confirmReservationPresence(
        reservationId: number,
        confirmationReply: 'OUI' | 'CONFIRMER' = 'CONFIRMER'
    ): Observable<any> {
        const reservation = this.myReservationsSubject.getValue().find(r => r.id === reservationId);
        const confirmationMessage = reservation
            ? `Votre présence pour la réservation du ${this.formatDateForMessage(reservation.date)} à ${reservation.time} a bien été confirmée.`
            : 'Votre présence a bien été confirmée.';
        const notificationContent = this.buildNotificationContent(
            confirmationMessage,
            'Présence confirmée'
        );

        return this.http.patch<any>(
            `${this.apiUrl}/bookings/${reservationId}/confirm`,
            { response: confirmationReply }
        ).pipe(
            tap(() => {
                const current = this.myReservationsSubject.getValue();
                const updated = current.map(r =>
                    r.id === reservationId
                        ? { ...r, status: 'confirmed' as ReservationStatus, message: confirmationMessage }
                        : r
                );
                this.myReservationsSubject.next(updated);

                const currentNotifs = this.notificationsSubject.getValue();
                const newNotif: Notification = {
                    title: notificationContent.title,
                    message: notificationContent.message,
                    time: 'Maintenant',
                    icon: 'calendar',
                    bgColor: 'bg-green-50',
                    iconColor: 'text-green-500',
                    read: false
                };
                this.notificationsSubject.next([newNotif, ...currentNotifs]);
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

        const status = this.parseBackendReservationStatus(backendBooking.status);

        let fieldName = backendBooking.sportSpaceName || 'Terrain';
        let location = backendBooking.location || '';
        const sportSpaceId = backendBooking.sportSpaceId;
        const cachedSpace = this.spaceCacheMap.get(Number(sportSpaceId));
        const cachedField = this.fieldsSubject.getValue().find(f => f.id === String(sportSpaceId));

        if (backendBooking.sportSpace && typeof backendBooking.sportSpace === 'object') {
            fieldName = backendBooking.sportSpace.name || fieldName;
            location = backendBooking.sportSpace.location || backendBooking.sportSpace.address || location;
        }

        if ((!fieldName || fieldName === 'Terrain') && cachedSpace) {
            fieldName = cachedSpace.name || cachedSpace.fieldName || fieldName;
        }

        if (!location && cachedSpace) {
            location = cachedSpace.location || cachedSpace.address || location;
        }

        if ((!fieldName || fieldName === 'Terrain') && cachedField) {
            fieldName = cachedField.name;
        }

        if (!location && cachedField) {
            location = cachedField.location;
        }

        let totalPrice = this.parseNumericValue(backendBooking.totalPrice);
        if (totalPrice == null) {
            const hourlyRate = this.parseNumericValue(
                cachedSpace?.hourlyRate ?? cachedSpace?.pricePerHour ?? cachedField?.price
            );

            if (hourlyRate != null && durationH > 0) {
                totalPrice = Number((hourlyRate * durationH).toFixed(2));
            }
        }

        return {
            id: backendBooking.id,
            fieldId: String(sportSpaceId ?? ''),
            fieldName: fieldName,
            userId: backendBooking.userId != null ? String(backendBooking.userId) : undefined,
            userName: backendBooking.userName || undefined,
            userEmail: backendBooking.userEmail || undefined,
            userPhone: backendBooking.userPhone || undefined,
            title: `Réservation`,
            location: location,
            date: formattedDate,
            time: formattedTime,
            duration: durationH,
            players: 10,
            type: 'Multisport',
            status: status,
            totalPrice,
            message: backendBooking.message || undefined
        };
    }

    private parseNumericValue(value: unknown): number | null {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }

        if (typeof value === 'string' && value.trim().length > 0) {
            const parsed = Number(value.replace(',', '.'));
            return Number.isFinite(parsed) ? parsed : null;
        }

        return null;
    }

    private parseBackendReservationStatus(status: string | null | undefined): ReservationStatus {
        const normalized = (status || '').toLowerCase();

        switch (normalized) {
            case 'pending_confirmation':
                return 'pending_confirmation';
            case 'reminder_sent':
                return 'reminder_sent';
            case 'cancelled':
                return 'cancelled';
            case 'completed':
                return 'completed';
            case 'confirmed':
            default:
                return 'confirmed';
        }
    }

    private isBlockingReservationStatus(status: ReservationStatus): boolean {
        return status !== 'cancelled';
    }

    private buildNotificationContent(rawMessage: string | null | undefined, fallbackTitle: string): { title: string; message: string } {
        const message = (rawMessage || fallbackTitle).trim();
        const lines = message.split(/\n+/).map(line => line.trim()).filter(Boolean);

        return {
            title: lines[0] || fallbackTitle,
            message: lines.length > 1 ? lines.slice(1).join('\n') : message
        };
    }

    private formatDateForMessage(value: string): string {
        const parsed = new Date(`${value}T00:00:00`);

        return Number.isNaN(parsed.getTime())
            ? value
            : parsed.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
    }

    private extractOpeningTime(hours: string | null | undefined): string | null {
        if (!hours) {
            return null;
        }

        const [openingTime] = hours.split('-').map(part => part.trim());
        return openingTime || null;
    }

    private extractClosingTime(hours: string | null | undefined): string | null {
        if (!hours || !hours.includes('-')) {
            return null;
        }

        const [, closingTime] = hours.split('-').map(part => part.trim());
        return closingTime || null;
    }

    private extractCoordinates(location: string | null | undefined): { lat: number; lng: number } | null {
        if (!location) {
            return null;
        }

        const coordinateMatch = location.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
        if (!coordinateMatch) {
            return null;
        }

        const lat = Number(coordinateMatch[1]);
        const lng = Number(coordinateMatch[2]);

        if (Number.isNaN(lat) || Number.isNaN(lng)) {
            return null;
        }

        return { lat, lng };
    }

    private mapBackendFeedback(feedback: any): FieldFeedback {
        const visibleComment = feedback.censoredComment || feedback.comment || '';

        return {
            id: feedback.id,
            reservationId: Number(feedback.bookingId),
            userId: String(feedback.userId),
            userName: feedback.userName || '',
            fieldId: String(feedback.sportSpaceId),
            fieldName: feedback.sportSpaceName || 'Terrain',
            rating: Number(feedback.rating),
            comment: visibleComment,
            censoredComment: visibleComment,
            isToxic: !!feedback.isToxic,
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
