import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Bell, CheckCheck, Settings, Trash2 } from 'lucide-angular';
import { NotificationService } from '../services/notification.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Notifications</h1>
          <p class="text-muted-foreground">Toutes vos alertes et mises à jour</p>
        </div>
        <button (click)="markAllRead()" class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted transition-colors">
          <lucide-icon [name]="checkAllIcon" [size]="14"></lucide-icon>
          Tout lire
        </button>
      </div>

      <div class="flex gap-2 border-b border-border pb-3">
        <button *ngFor="let tab of tabs" (click)="activeTab = tab.id"
          class="px-4 py-2 text-sm rounded-lg transition-colors"
          [ngClass]="activeTab === tab.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'">
          {{tab.label}}
          <span *ngIf="tab.id === 'unread' && unreadCount > 0" class="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5">{{unreadCount}}</span>
        </button>
      </div>

      <div *ngIf="loading" class="text-center py-10 text-muted-foreground">Chargement...</div>

      <div *ngIf="!loading" class="space-y-2">
        <div *ngIf="visibleNotifs.length === 0" class="text-center py-6 text-muted-foreground">Aucune notification.</div>
        <div *ngFor="let n of visibleNotifs"
          class="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors border border-transparent"
          [ngClass]="!n.isRead ? 'bg-primary/5 border-primary/20' : ''">
          <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <lucide-icon [name]="bellIcon" [size]="18" class="text-primary"></lucide-icon>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-foreground">{{n.title}}</p>
            <p class="text-sm text-muted-foreground">{{n.message}}</p>
            <p class="text-xs text-muted-foreground mt-1">{{formatDate(n.createdAt)}}</p>
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
export class NotificationsComponent implements OnInit {
  readonly checkAllIcon = CheckCheck;
  readonly bellIcon = Bell;
  readonly settingsIcon = Settings;
  readonly trashIcon = Trash2;

  activeTab = 'all';
  loading = true;
  notifications: any[] = [];
  tabs = [
    { id: 'all', label: 'Tout' },
    { id: 'unread', label: 'Non lus' },
  ];

  constructor(private notifService: NotificationService, private userService: UserService) {}

  ngOnInit() {
    const email = localStorage.getItem('user_email');
    if (!email) { this.loading = false; return; }
    this.userService.getByEmail(email).subscribe({
      next: (user: any) => this.loadNotifs(user.id),
      error: () => { this.loading = false; }
    });
  }

  loadNotifs(userId: number) {
    this.notifService.getByUserId(userId).subscribe({
      next: (data: any[]) => { this.notifications = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get unreadCount() { return this.notifications.filter(n => !n.isRead).length; }
  get visibleNotifs() {
    return this.activeTab === 'unread' ? this.notifications.filter(n => !n.isRead) : this.notifications;
  }

  markRead(id: number) {
    this.notifService.markAsRead(id).subscribe(() => {
      const n = this.notifications.find(x => x.id === id);
      if (n) n.isRead = true;
    });
  }

  markAllRead() { this.notifications.filter(n => !n.isRead).forEach(n => this.markRead(n.id)); }

  deleteNotif(id: number) {
    this.notifService.delete(id).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.id !== id);
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
