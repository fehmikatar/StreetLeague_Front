import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Activity, TrendingUp, Target, Award, Loader2, Plus } from 'lucide-angular';
import { PerformanceService } from '../services/performance.service';

@Component({
    selector: 'app-performance',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <div class="min-h-screen bg-background p-4 md:p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="mb-2">Performance & Stats</h1>
            <p class="text-muted-foreground">Suivez votre évolution et atteignez vos objectifs</p>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="flex flex-col items-center py-20 gap-3 text-muted-foreground">
          <lucide-icon [name]="Loader2Icon" [size]="32" class="animate-spin"></lucide-icon>
          Chargement des performances...
        </div>

        <div *ngIf="!loading">
          <!-- Overview from backend data -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-card rounded-2xl p-6 border border-border text-center">
              <div class="text-3xl font-bold text-primary mb-1">{{ totalMatches }}</div>
              <div class="text-sm text-muted-foreground">Total matchs</div>
            </div>
            <div class="bg-card rounded-2xl p-6 border border-border text-center">
              <div class="text-3xl font-bold text-accent mb-1">{{ totalWins }}</div>
              <div class="text-sm text-muted-foreground">Victoires</div>
            </div>
            <div class="bg-card rounded-2xl p-6 border border-border text-center">
              <div class="text-3xl font-bold mb-1" style="color:#06D6A0">{{ winRate }}%</div>
              <div class="text-sm text-muted-foreground">Win Rate</div>
            </div>
            <div class="bg-card rounded-2xl p-6 border border-border text-center">
              <div class="text-3xl font-bold mb-1">{{ performances.length }}</div>
              <div class="text-sm text-muted-foreground">Sessions</div>
            </div>
          </div>

          <!-- Performance Records -->
          <div *ngIf="performances.length > 0" class="bg-card rounded-2xl p-6 border border-border mb-6">
            <h3 class="mb-6 flex items-center gap-2">
              <lucide-icon [img]="TrendingUpIcon" class="w-5 h-5 text-primary"></lucide-icon>
              Historique des performances
            </h3>
            <div class="space-y-4">
              <div *ngFor="let perf of performances" class="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all">
                <div>
                  <div class="font-semibold">{{ perf.sportType || perf.sport || 'Sport' }}</div>
                  <div class="text-sm text-muted-foreground">{{ formatDate(perf.date || perf.createdAt) }}</div>
                </div>
                <div class="flex gap-4 text-sm">
                  <span class="text-primary font-semibold">{{ perf.score || perf.result }}</span>
                  <span [ngClass]="(perf.won || perf.result === 'WIN') ? 'text-green-500' : 'text-destructive'" class="font-semibold">
                    {{ (perf.won || perf.result === 'WIN') ? 'Victoire ✓' : 'Défaite' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div *ngIf="performances.length === 0" class="text-center py-20 text-muted-foreground bg-card rounded-2xl border border-border">
            <lucide-icon [img]="ActivityIcon" class="w-12 h-12 mx-auto mb-4 opacity-30"></lucide-icon>
            <p class="font-semibold mb-2">Aucune performance enregistrée</p>
            <p class="text-sm">Vos statistiques de matchs apparaîtront ici</p>
          </div>

          <!-- Static metrics (always shown) -->
          <div class="grid lg:grid-cols-2 gap-6">
            <div class="bg-card rounded-2xl p-6 border border-border">
              <h3 class="mb-6 flex items-center gap-2">
                <lucide-icon [img]="TargetIcon" class="w-5 h-5 text-accent"></lucide-icon>
                Objectifs du mois
              </h3>
              <div class="space-y-4">
                <div *ngFor="let obj of objectives">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm">{{ obj.label }}</span>
                    <span class="text-sm font-bold">{{ obj.current }}/{{ obj.target }}</span>
                  </div>
                  <div class="h-2 bg-muted rounded-full overflow-hidden">
                    <div class="h-full bg-primary rounded-full transition-all" [style.width]="(obj.current/obj.target*100) + '%'"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-card rounded-2xl p-6 border border-border">
              <h3 class="mb-4 flex items-center gap-2">
                <lucide-icon [img]="AwardIcon" class="w-5 h-5 text-primary"></lucide-icon>
                Achievements récents
              </h3>
              <div class="space-y-3">
                <div *ngFor="let ach of achievements" class="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                  <div class="text-2xl">{{ ach.icon }}</div>
                  <div>
                    <div class="font-semibold text-sm">{{ ach.title }}</div>
                    <div class="text-xs text-muted-foreground">{{ ach.date }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PerformanceComponent implements OnInit {
    readonly TrendingUpIcon = TrendingUp;
    readonly TargetIcon = Target;
    readonly AwardIcon = Award;
    readonly ActivityIcon = Activity;
    readonly Loader2Icon = Loader2;

    loading = true;
    performances: any[] = [];

    objectives = [
        { label: 'Matchs joués', current: 0, target: 10 },
        { label: 'Victoires', current: 0, target: 8 },
        { label: 'Heures d\'entraînement', current: 0, target: 16 },
    ];

    achievements = [
        { icon: '🏆', title: 'Bienvenue sur StreetLeague', date: 'Aujourd\'hui' },
        { icon: '⭐', title: 'Premier match réservé', date: 'À venir' },
        { icon: '🔥', title: 'Série de victoires', date: 'À venir' },
    ];

    constructor(private perfService: PerformanceService) {}

    ngOnInit() {
        this.perfService.getAll().subscribe({
            next: (data: any[]) => {
                this.performances = data;
                this.updateObjectives();
                this.loading = false;
            },
            error: () => { this.loading = false; }
        });
    }

    get totalMatches() { return this.performances.length; }
    get totalWins() { return this.performances.filter(p => p.won || p.result === 'WIN').length; }
    get winRate() {
        if (this.totalMatches === 0) return 0;
        return Math.round((this.totalWins / this.totalMatches) * 100);
    }

    updateObjectives() {
        this.objectives[0].current = Math.min(this.totalMatches, 10);
        this.objectives[1].current = Math.min(this.totalWins, 8);
    }

    formatDate(d: string): string {
        if (!d) return '';
        return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    }
}
