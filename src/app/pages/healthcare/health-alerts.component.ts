import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Bell, AlertTriangle, Info, CheckCircle, X, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-health-alerts',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="p-6 space-y-6">
      <div class="flex items-center gap-3 mb-2">
        <a routerLink="/app/healthcare" class="p-2 bg-card border border-border rounded-xl hover:bg-muted transition-all">
          <lucide-icon [name]="arrowLeftIcon" [size]="18"></lucide-icon>
        </a>
        <span class="text-sm text-muted-foreground">Santé</span>
      </div>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Alertes Santé</h1>
          <p class="text-muted-foreground">Notifications et alertes concernant votre santé</p>
        </div>
        <span class="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full">
          {{alerts.length}} alertes
        </span>
      </div>

      <!-- Alert categories -->
      <div class="grid grid-cols-3 gap-3">
        <div *ngFor="let cat of categories" class="bg-card rounded-xl border border-border p-4 text-center">
          <p class="text-2xl font-bold" [ngClass]="cat.color">{{cat.count}}</p>
          <p class="text-xs text-muted-foreground mt-1">{{cat.label}}</p>
        </div>
      </div>

      <!-- Alerts list -->
      <div class="space-y-3">
        <div *ngFor="let alert of alerts" class="bg-card rounded-xl border p-5 flex items-start gap-4"
          [ngClass]="alert.type === 'warning' ? 'border-yellow-200' : alert.type === 'danger' ? 'border-red-200' : 'border-blue-200'">
          <div class="p-2 rounded-lg" [ngClass]="alert.type === 'warning' ? 'bg-yellow-50' : alert.type === 'danger' ? 'bg-red-50' : 'bg-blue-50'">
            <lucide-icon [name]="alert.type === 'info' ? infoIcon : alertIcon" [size]="20"
              [ngClass]="alert.type === 'warning' ? 'text-yellow-500' : alert.type === 'danger' ? 'text-red-500' : 'text-blue-500'">
            </lucide-icon>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-foreground">{{alert.title}}</h3>
            <p class="text-sm text-muted-foreground mt-1">{{alert.message}}</p>
            <p class="text-xs text-muted-foreground mt-2">{{alert.time}}</p>
          </div>
          <button (click)="dismissAlert(alert)" class="p-1 hover:bg-muted rounded transition-colors" title="Ignorer">
            <lucide-icon [name]="closeIcon" [size]="14" class="text-muted-foreground"></lucide-icon>
          </button>
        </div>
      </div>
    </div>
  `
})
export class HealthAlertsComponent {
  readonly alertIcon = AlertTriangle;
  readonly infoIcon = Info;
  readonly closeIcon = X;
  readonly checkIcon = CheckCircle;
  readonly arrowLeftIcon = ArrowLeft;

  dismissAlert(alert: any) {
    this.alerts = this.alerts.filter(a => a !== alert);
  }

  categories = [
    { label: 'Urgentes', count: 1, color: 'text-red-500' },
    { label: 'Attention', count: 2, color: 'text-yellow-500' },
    { label: 'Informations', count: 4, color: 'text-blue-500' },
  ];

  alerts = [
    { type: 'danger', title: 'Hypertension détectée', message: 'Votre tension artérielle est élevée (145/92). Consultez votre médecin rapidement.', time: 'Il y a 2 heures' },
    { type: 'warning', title: 'Carence en Vitamine D', message: 'Votre taux de Vitamine D est en dessous de la normale. Envisagez une supplémentation.', time: 'Il y a 1 jour' },
    { type: 'warning', title: 'Rendez-vous à confirmer', message: 'Votre rendez-vous du 10 Mars avec Dr. Moreau est à confirmer avant demain.', time: 'Il y a 2 jours' },
    { type: 'info', title: 'Bilan annuel recommandé', message: 'Il est temps de planifier votre bilan de santé annuel.', time: 'Il y a 3 jours' },
    { type: 'info', title: 'Objectif Hydratation atteint', message: 'Félicitations ! Vous avez atteint votre objectif d\'hydratation 5 jours de suite.', time: 'Il y a 4 jours' },
  ];
}
