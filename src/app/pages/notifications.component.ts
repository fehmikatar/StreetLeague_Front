import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { LucideAngularModule, Bell, CheckCheck, Settings, Trash2 } from 'lucide-angular';
import { NotificationService } from '../services/notification.service';
import { BookingService } from '../services/booking.service';
import { WebSocketService } from '../services/websocket.service';

type NotificationItem = {
  id: number | string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  source: 'api' | 'booking' | 'websocket';
};

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Notifications</h1>
          <p class="text-muted-foreground">Toutes vos alertes et mises a jour</p>
        </div>
        <button (click)="markAllRead()" class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted transition-colors">
          <lucide-icon [name]="checkAllIcon" [size]="14"></lucide-icon>
          Tout lire
        </button>
      </div>

      <div class="flex gap-2 border-b border-border pb-3">
        <button
          *ngFor="let tab of tabs"
          (click)="activeTab = tab.id"
          class="px-4 py-2 text-sm rounded-lg transition-colors"
          [ngClass]="activeTab === tab.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'">
          {{ tab.label }}
          <span *ngIf="tab.id === 'unread' && unreadCount > 0" class="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5">{{ unreadCount }}</span>
        </button>
      </div>

      <div *ngIf="loading" class="text-center py-10 text-muted-foreground">Chargement...</div>

      <div *ngIf="!loading" class="space-y-2">
        <div *ngIf="visibleNotifs.length === 0" class="text-center py-6 text-muted-foreground">Aucune notification.</div>
        <div
          *ngFor="let n of visibleNotifs"
          class="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors border border-transparent"
          [ngClass]="!n.isRead ? 'bg-primary/5 border-primary/20' : ''">
          <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <lucide-icon [name]="bellIcon" [size]="18" class="text-primary"></lucide-icon>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-foreground">{{ n.title }}</p>
            <p class="text-sm text-muted-foreground whitespace-pre-line">{{ n.message }}</p>
            <p class="text-xs text-muted-foreground mt-1">{{ formatDate(n.createdAt) }}</p>
          </div>
          <div class="flex gap-2 shrink-0">
            <button *ngIf="!n.isRead" (click)="markRead(n.id)" class="p-1.5 hover:bg-primary/10 rounded text-primary transition-colors">
              <lucide-icon [name]="checkAllIcon" [size]="14"></lucide-icon>
            </button>
            <button (click)="deleteNotif(n.id)" class="p-1.5 hover:bg-destructive/10 rounded text-destructive transition-colors">
              <lucide-icon [name]="trashIcon" [size]="14"></lucide-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit, OnDestroy {
  readonly checkAllIcon = CheckCheck;
  readonly bellIcon = Bell;
  readonly settingsIcon = Settings;
  readonly trashIcon = Trash2;

  activeTab = 'all';
  loading = true;
  notifications: NotificationItem[] = [];
  tabs = [
    { id: 'all', label: 'Tout' },
    { id: 'unread', label: 'Non lus' },
  ];

  private apiNotifications: NotificationItem[] = [];
  private bookingNotifications: NotificationItem[] = [];
  private websocketNotifications: NotificationItem[] = [];
  private subscriptions = new Subscription();

  constructor(
    private notifService: NotificationService,
    private bookingService: BookingService,
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.bookingService.notifications$.subscribe((notifications) => {
        this.bookingNotifications = notifications.map((notification, index) => ({
          id: `booking-${index}-${notification.title}`,
          title: notification.title,
          message: notification.message,
          createdAt: this.toIsoDate(notification.time),
          isRead: !!notification.read,
          source: 'booking'
        }));
        this.mergeNotifications();
      })
    );

    this.subscriptions.add(
      this.webSocketService.getNotifications().subscribe((notifications) => {
        this.websocketNotifications = notifications.map((notification, index) => ({
          id: notification.id || `ws-${index}`,
          title: notification.title,
          message: notification.message,
          createdAt: notification.timestamp || this.toIsoDate(notification.time),
          isRead: !!notification.read,
          source: 'websocket'
        }));
        this.mergeNotifications();
      })
    );

    this.loadNotifs();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadNotifs() {
    this.subscriptions.add(
      this.notifService.getMine().subscribe({
        next: (data: any[]) => {
          this.apiNotifications = data.map((notification) => ({
            id: notification.id,
            title: notification.title,
            message: notification.message,
            createdAt: notification.createdAt || new Date().toISOString(),
            isRead: !!notification.isRead,
            source: 'api'
          }));
          this.loading = false;
          this.mergeNotifications();
        },
        error: () => {
          this.loading = false;
          this.mergeNotifications();
        }
      })
    );
  }

  get unreadCount() {
    return this.notifications.filter((notification) => !notification.isRead).length;
  }

  get visibleNotifs() {
    return this.activeTab === 'unread'
      ? this.notifications.filter((notification) => !notification.isRead)
      : this.notifications;
  }

  markRead(id: number | string) {
    const notification = this.notifications.find((item) => item.id === id);
    if (!notification) {
      return;
    }

    notification.isRead = true;

    if (notification.source === 'api' && typeof id === 'number') {
      this.notifService.markAsRead(id).subscribe({
        next: () => {
          this.loadNotifs();
        },
        error: () => this.mergeNotifications()
      });
      return;
    }

    if (notification.source === 'websocket' && typeof id === 'string') {
      this.webSocketService.markAsRead(id);
    }

    this.mergeNotifications();
  }

  markAllRead() {
    this.notifications
      .filter((notification) => !notification.isRead)
      .forEach((notification) => this.markRead(notification.id));
  }

  deleteNotif(id: number | string) {
    const notification = this.notifications.find((item) => item.id === id);
    if (!notification) {
      return;
    }

    if (notification.source === 'api' && typeof id === 'number') {
      this.notifService.delete(id).subscribe(() => {
        this.loadNotifs();
      });
      return;
    }

    if (notification.source === 'websocket' && typeof id === 'string') {
      this.webSocketService.deleteNotification(id);
    }

    if (notification.source === 'booking') {
      this.bookingNotifications = this.bookingNotifications.filter((item) => item.id !== id);
    }

    this.mergeNotifications();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private mergeNotifications(): void {
    const merged = [
      ...this.apiNotifications,
      ...this.websocketNotifications,
      ...this.bookingNotifications
    ];

    this.notifications = merged
      .filter((notification, index, list) =>
        index === list.findIndex((item) =>
          item.title === notification.title &&
          item.message === notification.message
        )
      )
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

    this.cdr.detectChanges();
  }

  private toIsoDate(value: string): string {
    if (!value || value === 'Maintenant') {
      return new Date().toISOString();
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }
}
