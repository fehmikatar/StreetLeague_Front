import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Activity, TrendingUp, Target, Award, BarChart2 } from 'lucide-angular';

@Component({
    selector: 'app-performance',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <div class="min-h-screen bg-background p-4 md:p-6">
      <div class="max-w-7xl mx-auto">
        <div class="mb-8">
          <h1 class="mb-2">Performance & Stats</h1>
          <p class="text-muted-foreground">Suivez votre évolution et atteignez vos objectifs</p>
        </div>

        <!-- Overview Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-card rounded-2xl p-6 border border-border text-center">
            <div class="text-3xl font-bold text-primary mb-1">156</div>
            <div class="text-sm text-muted-foreground">Total matchs</div>
          </div>
          <div class="bg-card rounded-2xl p-6 border border-border text-center">
            <div class="text-3xl font-bold text-accent mb-1">89</div>
            <div class="text-sm text-muted-foreground">Victoires</div>
          </div>
          <div class="bg-card rounded-2xl p-6 border border-border text-center">
            <div class="text-3xl font-bold mb-1" style="color:#06D6A0">57%</div>
            <div class="text-sm text-muted-foreground">Win Rate</div>
          </div>
          <div class="bg-card rounded-2xl p-6 border border-border text-center">
            <div class="text-3xl font-bold mb-1">4.8★</div>
            <div class="text-sm text-muted-foreground">Note moyenne</div>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Main Stats -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Progression -->
            <div class="bg-card rounded-2xl p-6 border border-border">
              <h3 class="mb-6 flex items-center gap-2">
                <lucide-icon [img]="TrendingUpIcon" class="w-5 h-5 text-primary"></lucide-icon>
                Progression mensuelle
              </h3>
              <div class="space-y-4">
                <div *ngFor="let metric of metrics">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-semibold">{{ metric.label }}</span>
                    <span class="text-sm font-bold">{{ metric.value }}</span>
                  </div>
                  <div class="h-3 bg-muted rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all" [style.width]="metric.percent + '%'" [style.background]="metric.color"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sport breakdown -->
            <div class="bg-card rounded-2xl p-6 border border-border">
              <h3 class="mb-6">Performance par sport</h3>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div *ngFor="let sport of sportStats" class="bg-muted/30 rounded-xl p-4 text-center">
                  <div class="text-3xl mb-2">{{ sport.emoji }}</div>
                  <div class="font-semibold mb-1">{{ sport.name }}</div>
                  <div class="text-2xl font-bold text-primary">{{ sport.matches }}</div>
                  <div class="text-xs text-muted-foreground">matchs</div>
                  <div class="text-sm font-semibold text-accent mt-2">{{ sport.winRate }}% win</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Objectives -->
            <div class="bg-card rounded-2xl p-6 border border-border">
              <h3 class="mb-4 flex items-center gap-2">
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
                    <div class="h-full bg-primary rounded-full" [style.width]="(obj.current/obj.target*100) + '%'"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Achievements -->
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
export class PerformanceComponent {
    readonly TrendingUpIcon = TrendingUp;
    readonly TargetIcon = Target;
    readonly AwardIcon = Award;

    metrics = [
        { label: 'Matchs gagnés', value: '75%', percent: 75, color: 'var(--color-primary)' },
        { label: 'Objectif mensuel', value: '8/10', percent: 80, color: 'var(--color-accent)' },
        { label: 'Buts marqués', value: '12/15', percent: 80, color: '#06D6A0' },
        { label: 'Précision passe', value: '89%', percent: 89, color: 'var(--color-primary)' },
        { label: 'Endurance', value: '92%', percent: 92, color: 'var(--color-accent)' },
    ];

    sportStats = [
        { name: 'Football', emoji: '⚽', matches: 98, winRate: 72 },
        { name: 'Basketball', emoji: '🏀', matches: 34, winRate: 68 },
        { name: 'Tennis', emoji: '🎾', matches: 24, winRate: 58 },
    ];

    objectives = [
        { label: 'Matchs joués', current: 8, target: 10 },
        { label: 'Victoires', current: 6, target: 8 },
        { label: 'Heures d\'entraînement', current: 12, target: 16 },
    ];

    achievements = [
        { icon: '🏆', title: 'Champion du mois', date: 'Fév 2026' },
        { icon: '⭐', title: 'MVP du match', date: '5 Fév 2026' },
        { icon: '🔥', title: 'Série de 5 victoires', date: '1 Fév 2026' },
    ];
}
