import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { ApiService } from './api.service';

export interface WebSocketNotification {
    id?: string;
    type: 'reservation' | 'cancellation' | 'update' | 'message';
    title: string;
    message: string;
    fieldName: string;
    date: string;
    time: string;
    timestamp: string;
    read?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
    private stompClient: Client | null = null;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private notificationsSubject = new BehaviorSubject<WebSocketNotification[]>([]);
    public notifications$ = this.notificationsSubject.asObservable();

    private connectionStatusSubject = new BehaviorSubject<boolean>(false);
    public connectionStatus$ = this.connectionStatusSubject.asObservable();

    constructor(private http: HttpClient, private api: ApiService) {
        this.loadUnreadNotifications();
        this.initializeConnection();
    }

    private hasSession(): boolean {
        return !!localStorage.getItem('auth_token') && !!localStorage.getItem('user_id');
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimer || !this.hasSession()) return;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.initializeConnection();
        }, 5000);
    }

    private initializeConnection(): void {
        if (!this.hasSession() || this.stompClient?.connected || this.stompClient?.active) return;

        try {
            const wsBaseUrl = environment.wsUrl || 'http://localhost:8085';
            const wsUrl = `${wsBaseUrl}/ws`;
            const client = new Client({
                webSocketFactory: () => new SockJS(wsUrl) as WebSocket,
                reconnectDelay: 0,
                debug: () => {},
            });

            client.onConnect = () => {
                this.connectionStatusSubject.next(true);
                client.subscribe('/user/queue/notifications', (message: IMessage) => this.handleNotification(message));
                client.subscribe('/topic/notifications', (message: IMessage) => this.handleNotification(message));
            };

            client.onStompError = () => {
                this.connectionStatusSubject.next(false);
                this.scheduleReconnect();
            };

            client.onWebSocketClose = () => {
                this.connectionStatusSubject.next(false);
                this.scheduleReconnect();
            };

            this.stompClient = client;
            client.activate();
        } catch (error) {
            console.error('WebSocket initialization error:', error);
            this.connectionStatusSubject.next(false);
            this.scheduleReconnect();
        }
    }

    private handleNotification(message: IMessage): void {
        try {
            if (!message.body || !message.body.trim().startsWith('{')) return;
            const data = JSON.parse(message.body);
            this.addNotification({
                type: this.normalizeNotificationType(data.type),
                title: data.title,
                message: data.message,
                fieldName: data.fieldName || '',
                date: data.date || '',
                time: data.time || '',
                timestamp: data.timestamp || new Date().toISOString()
            });
        } catch (error) {
            console.error('Notification parsing error:', error);
        }
    }

    private addNotification(notification: WebSocketNotification): void {
        const currentNotifications = this.notificationsSubject.getValue();
        const exists = currentNotifications.some((item) =>
            item.id === notification.id ||
            (item.title === notification.title && item.message === notification.message && item.timestamp === notification.timestamp)
        );

        if (exists) return;

        const newNotification: WebSocketNotification = {
            ...notification,
            id: notification.id || `notif-${Date.now()}`,
            read: false,
            timestamp: notification.timestamp || new Date().toISOString()
        };
        this.notificationsSubject.next([newNotification, ...currentNotifications]);
    }

    private loadUnreadNotifications(): void {
        const userId = this.api.getUserId();
        if (!userId) return;

        this.http.get<any[]>(`${this.api.base}/notifications/user/${userId}/unread`).subscribe({
            next: (notifications) => {
                notifications.forEach((notification) => {
                    this.addNotification({
                        id: String(notification.id),
                        type: 'message',
                        title: notification.title || 'Notification',
                        message: notification.message || '',
                        fieldName: notification.fieldName || '',
                        date: this.formatDisplayDate(notification.createdAt),
                        time: this.formatDisplayTime(notification.createdAt),
                        timestamp: notification.createdAt || new Date().toISOString(),
                        read: !!notification.isRead
                    });
                });
            },
            error: () => {}
        });
    }

    public showNotification(notification: Partial<WebSocketNotification> & Pick<WebSocketNotification, 'title' | 'message'>): void {
        this.addNotification({
            type: notification.type || 'message',
            title: notification.title,
            message: notification.message,
            fieldName: notification.fieldName || '',
            date: notification.date || this.formatDisplayDate(),
            time: notification.time || this.formatDisplayTime(),
            timestamp: notification.timestamp || new Date().toISOString(),
            read: false
        });
    }

    private normalizeNotificationType(rawType: string | null | undefined): WebSocketNotification['type'] {
        const normalized = (rawType || '').toLowerCase();
        if (normalized.includes('cancel')) return 'cancellation';
        if (normalized.includes('reservation') || normalized.includes('confirm')) return 'reservation';
        if (normalized.includes('reminder')) return 'update';
        return 'message';
    }

    private formatDisplayDate(value?: string): string {
        const date = value ? new Date(value) : new Date();
        return isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    private formatDisplayTime(value?: string): string {
        const date = value ? new Date(value) : new Date();
        return isNaN(date.getTime()) ? '' : date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    public getNotifications(): Observable<WebSocketNotification[]> {
        return this.notifications$;
    }

    public markAsRead(notificationId: string): void {
        const current = this.notificationsSubject.getValue();
        const updated = current.map(n => n.id === notificationId ? { ...n, read: true } : n);
        this.notificationsSubject.next(updated);
        // Stub for API call: this.http.patch(`${this.api.base}/notifications/${notificationId}/read`, {}).subscribe();
    }

    public deleteNotification(notificationId: string): void {
        const current = this.notificationsSubject.getValue();
        const filtered = current.filter(n => n.id !== notificationId);
        this.notificationsSubject.next(filtered);
        // Stub for API call: this.http.delete(`${this.api.base}/notifications/${notificationId}`).subscribe();
    }

    public disconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        const client = this.stompClient;
        this.stompClient = null;
        if (client) void client.deactivate();
        this.connectionStatusSubject.next(false);
    }

    ngOnDestroy(): void {
        this.disconnect();
    }
}
