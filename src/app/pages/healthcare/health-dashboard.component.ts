import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Activity, Heart, Calendar, Utensils, TrendingUp, Bell, ClipboardList, ChevronRight } from 'lucide-angular';

@Component({
    selector: 'app-health-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    template: `
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Tableau de Bord Santé</h1>
        <p class="text-muted-foreground">Suivez votre état de santé et vos performances sportives</p>
      </div>

      <!-- Health Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div *ngFor="let stat of healthStats" class="bg-card rounded-xl p-4 border border-border">
          <div class="flex items-center gap-2 mb-2">
            <lucide-icon [name]="stat.icon" [size]="18" class="text-primary"></lucide-icon>
            <span class="text-xs text-muted-foreground">{{stat.label}}</span>
          </div>
          <p class="text-2xl font-bold text-foreground">{{stat.value}}</p>
          <p class="text-xs" [ngClass]="stat.trend > 0 ? 'text-green-500' : 'text-red-500'">
            {{stat.trend > 0 ? '↑' : '↓'}} {{stat.trendLabel}}
          </p>
        </div>
      </div>

      <!-- Quick Navigation -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a *ngFor="let item of navItems" [routerLink]="item.path"
           class="flex items-center justify-between bg-card hover:bg-muted p-4 rounded-xl border border-border transition-colors cursor-pointer">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary/10 rounded-lg">
              <lucide-icon [name]="item.icon" [size]="20" class="text-primary"></lucide-icon>
            </div>
            <div>
              <p class="font-semibold text-foreground">{{item.title}}</p>
              <p class="text-sm text-muted-foreground">{{item.desc}}</p>
            </div>
          </div>
          <lucide-icon [name]="chevronRight" [size]="18" class="text-muted-foreground"></lucide-icon>
        </a>
      </div>
    </div>
  `
})
export class HealthDashboardComponent {
    readonly chevronRight = ChevronRight;

    healthStats = [
        { icon: Heart, label: 'Fréquence Cardiaque', value: '72 bpm', trend: 1, trendLabel: '3% vs hier' },
        { icon: Activity, label: 'Calories Brûlées', value: '2,340', trend: 1, trendLabel: '8% vs moy.' },
        { icon: TrendingUp, label: 'Niveau Forme', value: '83%', trend: 1, trendLabel: '5% ce mois' },
        { icon: ClipboardList, label: 'Objectifs', value: '4/6', trend: -1, trendLabel: '2 restants' },
    ];

    navItems = [
        { path: '/app/healthcare/profile', icon: Heart, title: 'Profil Santé', desc: 'Informations médicales' },
        { path: '/app/healthcare/records', icon: ClipboardList, title: 'Dossiers Médicaux', desc: 'Historique santé' },
        { path: '/app/healthcare/appointments', icon: Calendar, title: 'Rendez-vous', desc: 'Consultations à venir' },
        { path: '/app/healthcare/diet', icon: Utensils, title: 'Régime Alimentaire', desc: 'Plans nutritionnels' },
        { path: '/app/healthcare/trends', icon: TrendingUp, title: 'Tendances', desc: 'Évolution santé' },
        { path: '/app/healthcare/alerts', icon: Bell, title: 'Alertes', desc: 'Notifications santé' },
    ];
}
