import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { WebSocketNotification, WebSocketService } from '../../services/websocket.service';

type DisplayNotification = WebSocketNotification & {
    source: 'websocket' | 'booking';
    widgetId: string;
};

@Component({
    selector: 'app-websocket-notifications',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="fixed top-4 right-4 z-50 space-y-2 max-w-md">
            <div
                *ngFor="let notification of notifications$ | async"
                class="bg-white rounded-lg shadow-lg p-4 border-l-4"
                [ngClass]="getNotificationStyle(notification.type)">
                <div class="flex justify-between items-start gap-2">
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-900">{{ notification.title }}</h3>
                        <p class="text-sm text-gray-600 mt-1 whitespace-pre-line">{{ notification.message }}</p>
                        <div *ngIf="notification.date || notification.time" class="text-xs text-gray-500 mt-2">
                            {{ notification.date }}<span *ngIf="notification.date && notification.time"> à </span>{{ notification.time }}
                        </div>
                    </div>
                    <button
                        type="button"
                        (click)="dismissNotification(notification.widgetId)"
                        class="text-gray-400 hover:text-gray-600">
                        x
                    </button>
                </div>
            </div>
        </div>
    `,
})
export class WebSocketNotificationsComponent implements OnDestroy {
    notifications$: Observable<DisplayNotification[]>;
    private dismissedIds = new Set<string>();
    private activeTimers = new Map<string, ReturnType<typeof setTimeout>>();
    private dismissedIdsSubject = new BehaviorSubject<Set<string>>(this.dismissedIds);

    constructor(
        private webSocketService: WebSocketService,
        private bookingService: BookingService
    ) {
        this.notifications$ = combineLatest([
            this.webSocketService.getNotifications(),
            this.bookingService.notifications$,
            this.dismissedIdsSubject
        ]).pipe(
            map(([webSocketNotifications, bookingNotifications, dismissedIds]) => {
                const mappedWebSocketNotifications: DisplayNotification[] = webSocketNotifications.map((notification) => ({
                    ...notification,
                    source: 'websocket',
                    widgetId: `websocket-${notification.id ?? notification.timestamp}`
                }));

                const mappedBookingNotifications: DisplayNotification[] = bookingNotifications.map((notification, index) => ({
                    id: `booking-${index}-${notification.title}-${notification.time}`,
                    type: this.mapBookingType(notification.title),
                    title: notification.title,
                    message: notification.message,
                    fieldName: '',
                    date: '',
                    time: notification.time,
                    timestamp: `${index}-${notification.time}`,
                    read: notification.read,
                    source: 'booking',
                    widgetId: `booking-${notification.title}-${notification.message}-${notification.time}`
                }));

                const merged = [...mappedWebSocketNotifications, ...mappedBookingNotifications]
                    .filter((notification, index, list) =>
                        index === list.findIndex((item) =>
                            item.title === notification.title &&
                            item.message === notification.message &&
                            item.time === notification.time
                        )
                    )
                    .filter((notification) => !dismissedIds.has(notification.widgetId));

                merged.forEach((notification) => this.scheduleAutoDismiss(notification.widgetId));
                return merged;
            })
        );
    }

    ngOnDestroy(): void {
        this.activeTimers.forEach((timer) => clearTimeout(timer));
        this.activeTimers.clear();
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

    dismissNotification(widgetId: string): void {
        this.dismissedIds.add(widgetId);
        this.dismissedIdsSubject.next(new Set(this.dismissedIds));
        const timer = this.activeTimers.get(widgetId);
        if (timer) {
            clearTimeout(timer);
            this.activeTimers.delete(widgetId);
        }
    }

    private scheduleAutoDismiss(widgetId: string): void {
        if (this.activeTimers.has(widgetId) || this.dismissedIds.has(widgetId)) {
            return;
        }

        const timer = setTimeout(() => {
            this.dismissedIds.add(widgetId);
            this.dismissedIdsSubject.next(new Set(this.dismissedIds));
            this.activeTimers.delete(widgetId);
        }, 2000);

        this.activeTimers.set(widgetId, timer);
    }

    private mapBookingType(title: string): WebSocketNotification['type'] {
        const normalizedTitle = title.toLowerCase();
        if (normalizedTitle.includes('annul')) {
            return 'cancellation';
        }
        if (normalizedTitle.includes('rappel')) {
            return 'update';
        }
        if (normalizedTitle.includes('présence') || normalizedTitle.includes('presence')) {
            return 'reservation';
        }
        if (normalizedTitle.includes('reservation')) {
            return 'reservation';
        }
        return 'message';
    }
}
