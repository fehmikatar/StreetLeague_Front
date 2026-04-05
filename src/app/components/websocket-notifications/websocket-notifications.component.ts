import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService, WebSocketNotification } from '../../services/websocket.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-websocket-notifications',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="fixed top-4 right-4 z-50 space-y-2 max-w-md">
            <!-- Indicateur de connexion -->
            <div class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                 [ngClass]="(connectionStatus$ | async) 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'">
                <div class="w-2 h-2 rounded-full"
                     [ngClass]="(connectionStatus$ | async) ? 'bg-green-600' : 'bg-red-600'"></div>
                {{ (connectionStatus$ | async) ? 'Connecté' : 'Déconnecté' }}
            </div>

            <!-- Notifications -->
            <div *ngFor="let notification of notifications$ | async"
                 class="bg-white rounded-lg shadow-lg p-4 border-l-4 animate-in fade-in slide-in-from-right"
                 [ngClass]="getNotificationStyle(notification.type)">
                <div class="flex justify-between items-start gap-2">
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-900">{{ notification.title }}</h3>
                        <p class="text-sm text-gray-600 mt-1">{{ notification.message }}</p>
                        <div class="text-xs text-gray-500 mt-2">
                            {{ notification.date }} à {{ notification.time }}
                        </div>
                    </div>
                    <button (click)="closeNotification(notification.id)"
                            class="text-gray-400 hover:text-gray-600">
                        ✕
                    </button>
                </div>
            </div>
        </div>
    `,
    styles: [`
        @import url('https://cdn.tailwindcss.com');
    `]
})
export class WebSocketNotificationsComponent implements OnInit, OnDestroy {
    notifications$: Observable<WebSocketNotification[]>;
    connectionStatus$: Observable<boolean>;

    constructor(private webSocketService: WebSocketService) {
        this.notifications$ = this.webSocketService.getNotifications();
        this.connectionStatus$ = this.webSocketService.connectionStatus$;
    }

    ngOnInit(): void {
        // Les notifications vont être gérées automatiquement par le service
    }

    getNotificationStyle(type: string): string {
        switch (type) {
            case 'reservation':
                return 'border-green-500 bg-green-50';
            case 'cancellation':
                return 'border-red-500 bg-red-50';
            case 'update':
                return 'border-blue-500 bg-blue-50';
            case 'message':
                return 'border-yellow-500 bg-yellow-50';
            default:
                return 'border-gray-500 bg-gray-50';
        }
    }

    closeNotification(notificationId: string | undefined): void {
        if (notificationId) {
            this.webSocketService.deleteNotification(notificationId);
        }
    }

    ngOnDestroy(): void {
        // La déconnexion est gérée par le WebSocketService
    }
}
