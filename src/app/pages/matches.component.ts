import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Trophy, MapPin, Clock, Calendar, Users, Plus } from 'lucide-angular';

@Component({
    selector: 'app-matches',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
    template: `
    <div class="min-h-screen bg-background p-4 md:p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="mb-2">Matchs & Tournois</h1>
            <p class="text-muted-foreground">Gérez et suivez vos matchs</p>
          </div>
          <button (click)="router.navigate(['/app/booking'])" class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
            <lucide-icon [name]="PlusIcon" [size]="16"></lucide-icon>
            Nouveau Match
          </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-card rounded-2xl p-4 border border-border text-center"><div class="text-2xl font-bold text-primary">48</div><div class="text-sm text-muted-foreground">Total matchs</div></div>
          <div class="bg-card rounded-2xl p-4 border border-border text-center"><div class="text-2xl font-bold text-accent">34</div><div class="text-sm text-muted-foreground">Victoires</div></div>
          <div class="bg-card rounded-2xl p-4 border border-border text-center"><div class="text-2xl font-bold text-green-500">71%</div><div class="text-sm text-muted-foreground">Win Rate</div></div>
          <div class="bg-card rounded-2xl p-4 border border-border text-center"><div class="text-2xl font-bold">4.8</div><div class="text-sm text-muted-foreground">Classement</div></div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 mb-6">
          <button *ngFor="let tab of tabs" (click)="activeTab = tab.id"
            class="px-4 py-2 rounded-xl font-semibold transition-all"
            [ngClass]="activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:bg-muted'">
            {{ tab.label }}
          </button>
        </div>

        <!-- Matches List -->
        <div class="space-y-4">
          <div *ngFor="let match of filteredMatches" class="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2 flex-wrap">
                  <span class="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">{{ match.type }}</span>
                  <span [ngClass]="getStatusClass(match.status)" class="text-xs font-semibold px-2 py-1 rounded-full">{{ match.status }}</span>
                </div>
                <h3 class="mb-3">{{ match.title }}</h3>
                <div class="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div class="flex items-center gap-1"><lucide-icon [name]="MapPinIcon" [size]="16"></lucide-icon><span>{{ match.location }}</span></div>
                  <div class="flex items-center gap-1"><lucide-icon [name]="CalendarIcon" [size]="16"></lucide-icon><span>{{ match.date }}</span></div>
                  <div class="flex items-center gap-1"><lucide-icon [name]="ClockIcon" [size]="16"></lucide-icon><span>{{ match.time }}</span></div>
                  <div class="flex items-center gap-1"><lucide-icon [name]="UsersIcon" [size]="16"></lucide-icon><span>{{ match.players }} joueurs</span></div>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <div *ngIf="match.score" class="text-2xl font-bold mb-1">{{ match.score }}</div>
                <div *ngIf="match.result" class="text-sm font-semibold"
                  [ngClass]="{'text-primary': match.result==='Win', 'text-destructive': match.result==='Loss', 'text-muted-foreground': match.result==='Draw'}">
                  {{ match.result }}
                </div>
                <a [routerLink]="['/app/matches', match.id]" class="mt-2 text-xs text-primary hover:underline block">Voir détails →</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MatchesComponent {
    readonly PlusIcon = Plus;
    readonly MapPinIcon = MapPin;
    readonly CalendarIcon = Calendar;
    readonly ClockIcon = Clock;
    readonly UsersIcon = Users;

    activeTab = 'all';
    tabs = [
        { id: 'all', label: 'Tous' },
        { id: 'upcoming', label: 'À venir' },
        { id: 'past', label: 'Passés' },
    ];

    matches = [
        { id: 1, title: 'Thunder Strikers vs Eagles FC', type: 'Football', status: 'À venir', location: 'Parc Central', date: '10 Fév 2026', time: '18:00', players: 22, score: null, result: null },
        { id: 2, title: 'City Basketball League', type: 'Basketball', status: 'À venir', location: 'Court Premium', date: '12 Fév 2026', time: '20:00', players: 10, score: null, result: null },
        { id: 3, title: 'Thunder Strikers vs Red Lions', type: 'Football', status: 'Terminé', location: 'Stadium Nord', date: '5 Fév 2026', time: '17:00', players: 22, score: '3-2', result: 'Win' },
        { id: 4, title: 'Match Amical Tennis', type: 'Tennis', status: 'Terminé', location: 'Tennis Club Elite', date: '1 Fév 2026', time: '10:00', players: 2, score: '6-4, 6-3', result: 'Win' },
        { id: 5, title: 'Tournoi Mensuel', type: 'Multisport', status: 'Terminé', location: 'Arena Centrale', date: '25 Jan 2026', time: '14:00', players: 32, score: '0-1', result: 'Loss' },
    ];

    constructor(public router: Router) { }

    get filteredMatches() {
        if (this.activeTab === 'upcoming') return this.matches.filter(m => m.status === 'À venir');
        if (this.activeTab === 'past') return this.matches.filter(m => m.status === 'Terminé');
        return this.matches;
    }

    getStatusClass(status: string) {
        return status === 'À venir' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground';
    }
}
