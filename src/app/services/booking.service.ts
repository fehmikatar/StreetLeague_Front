import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, catchError, of } from 'rxjs';
import { Trophy, Calendar, MapPin, MessageSquare, Bell } from 'lucide-angular';
import { environment } from '../../environments/environment';

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

export interface Notification {
    title: string;
    message: string;
    time: string;
    icon: any;
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

    public fields$ = this.fieldsSubject.asObservable();
    public notifications$ = this.notificationsSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadFields();
        this.loadStaticNotifications();
    }

    private loadFields() {
        this.http.get<any[]>(`${this.apiUrl}/sport-spaces`).subscribe({
            next: (data) => {
                const mappedFields: Field[] = data.map(space => ({
                    id: String(space.id),
                    name: space.name || 'Unknown Field',
                    location: space.location || 'Location not specified',
                    type: space.type || 'Multisport',
                    price: space.pricePerHour || 50,
                    rating: 4.5, // Dummy default
                    reviews: 0,
                    hours: '8h - 22h',
                    available: true // We can calculate this dynamically later
                }));
                this.fieldsSubject.next(mappedFields);
            },
            error: (err) => console.error('Failed to load fields from API', err)
        });
    }

    private loadStaticNotifications() {
        const defaultNotifs: Notification[] = [
            { title: 'Welcome', message: 'Welcome to StreetLeague!', time: 'Now', icon: Bell, bgColor: 'bg-blue-50', iconColor: 'text-blue-500', read: false },
        ];
        this.notificationsSubject.next(defaultNotifs);
    }

    public getFieldById(id: string): Field | undefined {
        return this.fieldsSubject.getValue().find(f => f.id === id);
    }

    public getUserReservations(userId: string): Observable<Reservation[]> {
        return this.http.get<any[]>(`${this.apiUrl}/bookings/user/${userId}`).pipe(
            map(data => data.map(b => this.mapBackendToFrontendReservation(b))),
            catchError(err => of([]))
        );
    }

    public getFieldReservations(fieldId: string): Observable<Reservation[]> {
        return this.http.get<any[]>(`${this.apiUrl}/bookings/sport-space/${fieldId}`).pipe(
            map(data => data.map(b => this.mapBackendToFrontendReservation(b))),
            catchError(err => of([]))
        );
    }

    public isSlotAvailableClientSide(reservations: Reservation[], fieldId: string, date: string, time: string, duration: number): boolean {
        const convertToMinutes = (t: string) => {
            const parts = t.split(':');
            return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        };

        const reqStart = convertToMinutes(time);
        const reqEnd = reqStart + duration * 60;

        return !reservations.some(r => {
            if (r.fieldId !== fieldId || r.date !== date || r.status !== 'confirmed') return false;

            const rStart = convertToMinutes(r.time);
            const rEnd = rStart + r.duration * 60;

            return reqStart < rEnd && reqEnd > rStart;
        });
    }

    public reserveField(reservationData: Omit<Reservation, 'id' | 'status'>): Observable<any> {
        // Get real userId from localStorage (set after login)
        const storedId = localStorage.getItem('user_id');
        const userId = storedId ? parseInt(storedId, 10) : 1;

        // Calculate end time
        const startParts = reservationData.time.split(':');
        const startDate = new Date(reservationData.date);
        startDate.setHours(parseInt(startParts[0], 10), parseInt(startParts[1], 10), 0);

        const endDate = new Date(startDate.getTime() + reservationData.duration * 60 * 60 * 1000);

        const backendPayload = {
            userId: userId,
            sportSpaceId: parseInt(reservationData.fieldId, 10),
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString()
        };

        return this.http.post<any>(`${this.apiUrl}/bookings`, backendPayload).pipe(
            tap(res => {
                // Add Notification
                const currentNotifs = this.notificationsSubject.getValue();
                const newNotif: Notification = {
                    title: 'Booking confirmed',
                    message: `Your booking for "${reservationData.fieldName}" is confirmed.`,
                    time: 'Now',
                    icon: Calendar,
                    bgColor: 'bg-green-50',
                    iconColor: 'text-green-500',
                    read: false
                };
                this.notificationsSubject.next([newNotif, ...currentNotifs]);
            })
        );
    }

    private mapBackendToFrontendReservation(backendBooking: any): Reservation {
        const startDate = new Date(backendBooking.startTime);
        const endDate = new Date(backendBooking.endTime);
        const durationH = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

        const padZero = (n: number) => n < 10 ? '0' + n : n;
        const formattedDate = `${startDate.getFullYear()}-${padZero(startDate.getMonth() + 1)}-${padZero(startDate.getDate())}`;
        const formattedTime = `${padZero(startDate.getHours())}:${padZero(startDate.getMinutes())}`;

        return {
            id: backendBooking.id,
            fieldId: String(backendBooking.sportSpaceId),
            fieldName: backendBooking.sportSpaceName || 'Field',
            title: `Booking`,
            location: '',
            date: formattedDate,
            time: formattedTime,
            duration: durationH,
            players: 10,
            type: 'Multisport',
            status: backendBooking.status ? backendBooking.status.toLowerCase() : 'confirmed'
        };
    }
}
