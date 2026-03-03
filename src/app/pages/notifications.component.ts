import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Bell, CheckCheck, Settings, Trophy, Calendar, MessageSquare } from 'lucide-angular';

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
        <div class="flex gap-2">
          <button class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted transition-colors">
            <lucide-icon [name]="checkAllIcon" [size]="14"></lucide-icon>
            Tout lire
          </button>
          <button class="p-2 hover:bg-muted rounded-lg transition-colors">
            <lucide-icon [name]="settingsIcon" [size]="18" class="text-muted-foreground"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="flex gap-2 border-b border-border pb-3">
        <button *ngFor="let tab of tabs" (click)="activeTab = tab.id"
          class="px-4 py-2 text-sm rounded-lg transition-colors"
          [ngClass]="activeTab === tab.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'">
          {{tab.label}}
          <span *ngIf="tab.count > 0" class="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5">{{tab.count}}</span>
        </button>
      </div>

      <!-- Notifications list -->
      <div class="space-y-2">
        <div *ngFor="let notif of notifications" class="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors border border-transparent"
          [ngClass]="!notif.read ? 'bg-primary/5 border-primary/20' : ''">
          <div class="p-2 rounded-lg" [ngClass]="notif.bgColor">
            <lucide-icon [name]="notif.icon" [size]="18" [ngClass]="notif.iconColor"></lucide-icon>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-foreground">{{notif.title}}</p>
            <p class="text-sm text-muted-foreground">{{notif.message}}</p>
            <p class="text-xs text-muted-foreground mt-1">{{notif.time}}</p>
          </div>
          <div *ngIf="!notif.read" class="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
        </div>
      </div>
    </div>
  `
})
export class NotificationsComponent {
    readonly checkAllIcon = CheckCheck;
    readonly settingsIcon = Settings;
    activeTab = 'all';

    tabs = [
        { id: 'all', label: 'Tout', count: 5 },
        { id: 'matches', label: 'Matchs', count: 2 },
        { id: 'social', label: 'Social', count: 1 },
        { id: 'system', label: 'Système', count: 2 },
    ];

    notifications = [
        { title: 'Match demain', message: 'Votre match contre FC Lyon est demain à 18h00. N\'oubliez pas !', time: 'Il y a 1 heure', icon: Trophy, bgColor: 'bg-yellow-50', iconColor: 'text-yellow-500', read: false },
        { title: 'Thomas a rejoint votre équipe', message: 'Thomas Martin a accepté votre invitation et rejoint StreetLeague Pro.', time: 'Il y a 2 heures', icon: MessageSquare, bgColor: 'bg-blue-50', iconColor: 'text-blue-500', read: false },
        { title: 'Réservation confirmée', message: 'Votre réservation du terrain "Stade Municipal" pour le 10 Mars est confirmée.', time: 'Il y a 3 heures', icon: Calendar, bgColor: 'bg-green-50', iconColor: 'text-green-500', read: false },
        { title: 'Rappel de santé', message: 'Pensez à enregistrer votre séance de ce matin dans votre journal santé.', time: 'Il y a 5 heures', icon: Bell, bgColor: 'bg-purple-50', iconColor: 'text-purple-500', read: false },
        { title: 'Score de performance mis à jour', message: 'Votre score de performance a augmenté à 83 points ce mois-ci !', time: 'Hier à 20:00', icon: Trophy, bgColor: 'bg-primary/10', iconColor: 'text-primary', read: false },
        { title: 'Match terminé', message: 'Le match contre Olympique FC s\'est terminé 3-2. Bravo à l\'équipe !', time: 'Hier à 19:00', icon: Trophy, bgColor: 'bg-muted', iconColor: 'text-muted-foreground', read: true },
    ];
}
