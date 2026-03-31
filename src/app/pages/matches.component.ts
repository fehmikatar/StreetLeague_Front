import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Trophy, MapPin, Clock, Calendar, Users, Plus, Loader2, Eye, Edit, PlayCircle, AlertOctagon } from 'lucide-angular';
import { MatchService, MatchResponse, MatchStatus } from '../services/match.service';
import { CompetitionService, CompetitionResponse } from '../services/competition.service';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background p-4 md:p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 class="text-3xl font-black flex items-center gap-3 mb-2">
              <lucide-icon [name]="TrophyIcon" [size]="32" class="text-primary"></lucide-icon>
              Matchs Officiels
            </h1>
            <p class="text-muted-foreground">Suivez les matchs en direct, programmés ou terminés.</p>
          </div>
          <button *ngIf="isOrganizer" routerLink="/app/matches/new" class="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm">
            <lucide-icon [name]="PlusIcon" [size]="20"></lucide-icon>
            Planifier un Match
          </button>
        </div>

        <!-- Filters Toolbar -->
        <div class="bg-card rounded-2xl p-4 border border-border mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <select [(ngModel)]="competitionFilter" (change)="applyFilters()" class="w-full md:w-auto h-11 px-4 bg-background border border-border rounded-xl font-medium focus:border-primary outline-none min-w-[200px]">
            <option value="">Toutes les compétitions</option>
            <option *ngFor="let comp of competitions" [value]="comp.id">{{ comp.name }}</option>
          </select>

          <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="w-full md:w-auto h-11 px-4 bg-background border border-border rounded-xl font-medium focus:border-primary outline-none min-w-[150px]">
            <option value="">Tous les statuts</option>
            <option value="LIVE">En direct</option>
            <option value="SCHEDULED">Planifiés</option>
            <option value="FINISHED">Terminés</option>
            <option value="CANCELED">Annulés</option>
          </select>

          <div class="flex items-center gap-2 w-full md:w-auto border border-border rounded-xl bg-background px-3 h-11">
            <lucide-icon [name]="CalendarIcon" [size]="16" class="text-muted-foreground"></lucide-icon>
            <input type="date" [(ngModel)]="dateFilter" (change)="applyFilters()" class="bg-transparent border-none outline-none font-medium text-sm w-full">
            <button *ngIf="dateFilter" (click)="dateFilter=''; applyFilters()" class="text-muted-foreground hover:text-foreground">×</button>
          </div>

          <div class="flex-1"></div>

          <select [(ngModel)]="sortBy" (change)="applyFilters()" class="w-full md:w-auto h-11 px-4 bg-background border border-border rounded-xl font-medium focus:border-primary outline-none">
            <option value="dateDesc">Plus récents d'abord</option>
            <option value="dateAsc">Plus anciens d'abord</option>
            <option value="status">Par statut (Live d'abord)</option>
          </select>
        </div>

        <div *ngIf="loading" class="flex flex-col items-center py-20 gap-3 text-muted-foreground">
          <lucide-icon [name]="Loader2Icon" [size]="32" class="animate-spin text-primary/50"></lucide-icon>
          <span class="font-medium">Chargement des matchs...</span>
        </div>

        <div *ngIf="!loading && errorMsg" class="bg-destructive/10 text-destructive border border-destructive/20 p-8 rounded-2xl text-center font-bold mb-6">
          <lucide-icon [name]="AlertOctagonIcon" [size]="48" class="mx-auto mb-4 opacity-70"></lucide-icon>
          <p class="text-lg">Erreur : {{ errorMsg }}</p>
          <p class="text-sm font-normal mt-2 opacity-80">Vérifiez la console du navigateur (F12) ou votre serveur backend.</p>
        </div>

        <div *ngIf="!loading && !errorMsg && filteredMatches.length === 0" class="text-center py-20 bg-card rounded-3xl border border-dashed border-border flex flex-col items-center">
          <div class="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
            <lucide-icon [name]="TrophyIcon" [size]="32" class="text-muted-foreground/50"></lucide-icon>
          </div>
          <h2 class="text-xl font-bold mb-2">Aucun match trouvé</h2>
          <p class="text-muted-foreground mb-6">Modifiez vos filtres ou assurez-vous que les matchs ont bien été créés dans la base de données.</p>
        </div>

        <div *ngIf="!loading && filteredMatches.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div *ngFor="let match of filteredMatches" class="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all flex flex-col relative group">
            
            <!-- Top Status Bar -->
            <div class="h-1 w-full" [ngClass]="getStatusColor(match.status, true)"></div>
            
            <div class="p-6">
              <div class="flex justify-between items-start mb-6">
                <!-- Status Badge -->
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider" [ngClass]="getStatusBadge(match.status)">
                  <span *ngIf="match.status === 'LIVE'" class="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                  {{ getStatusLabel(match.status) }}
                </span>
                
                <span class="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                  {{ formatMatchDateShort(match.scheduledAt) }}
                </span>
              </div>

              <!-- Score Area -->
              <div class="flex items-center justify-between mb-6">
                <div class="flex-1 text-center">
                  <div class="font-bold text-lg leading-tight line-clamp-2" [title]="match.homeTeamName">{{ match.homeTeamName }}</div>
                </div>
                
                <div class="px-6 text-center">
                  <div class="text-4xl font-black tabular-nums tracking-tighter" [ngClass]="{'text-red-500': match.status === 'LIVE'}">
                    <ng-container *ngIf="match.status !== 'SCHEDULED' && match.status !== 'CANCELED'">
                      {{ match.homeScore || 0 }} - {{ match.awayScore || 0 }}
                    </ng-container>
                    <ng-container *ngIf="match.status === 'SCHEDULED' || match.status === 'CANCELED'">
                      VS
                    </ng-container>
                  </div>
                  <div *ngIf="match.status === 'LIVE'" class="text-xs font-bold text-red-500 mt-1 animate-pulse">EN COURS</div>
                </div>
                
                <div class="flex-1 text-center">
                  <div class="font-bold text-lg leading-tight line-clamp-2" [title]="match.awayTeamName">{{ match.awayTeamName }}</div>
                </div>
              </div>

              <!-- Match Details -->
              <div class="space-y-2 mb-6 text-sm text-muted-foreground font-medium bg-muted/30 p-4 rounded-xl">
                <div class="flex items-center gap-2">
                  <lucide-icon [name]="TrophyIcon" [size]="16" class="text-primary/70"></lucide-icon>
                  <span class="truncate">{{ match.competitionName }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <lucide-icon [name]="CalendarIcon" [size]="16" class="text-primary/70"></lucide-icon>
                  <span>{{ formatMatchDate(match.scheduledAt) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <lucide-icon [name]="MapPinIcon" [size]="16" class="text-primary/70"></lucide-icon>
                  <span class="truncate">{{ match.venue }}</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-3 mt-auto">
                <button [routerLink]="['/app/matches', match.id]" class="flex-1 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
                  <lucide-icon [name]="EyeIcon" [size]="18"></lucide-icon> Voir détails
                </button>
                
                <ng-container *ngIf="isOrganizer">
                  <button *ngIf="match.status === 'SCHEDULED'" (click)="startMatch(match)" class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 rounded-xl transition-all shadow-sm" title="Démarrer le match">
                    <lucide-icon [name]="PlayCircleIcon" [size]="18"></lucide-icon>
                  </button>
                </ng-container>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MatchesComponent implements OnInit {
  readonly TrophyIcon = Trophy;
  readonly MapPinIcon = MapPin;
  readonly CalendarIcon = Calendar;
  readonly PlusIcon = Plus;
  readonly Loader2Icon = Loader2;
  readonly EyeIcon = Eye;
  readonly EditIcon = Edit;
  readonly PlayCircleIcon = PlayCircle;
  readonly AlertOctagonIcon = AlertOctagon;

  matches: MatchResponse[] = [];
  filteredMatches: MatchResponse[] = [];
  competitions: CompetitionResponse[] = [];
  
  loading = true;
  errorMsg = '';
  userType = '';

  // Filters
  competitionFilter = '';
  statusFilter = '';
  dateFilter = '';
  sortBy = 'dateDesc'; 

  constructor(
    public router: Router, 
    private matchService: MatchService,
    private competitionService: CompetitionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userType = localStorage.getItem('user_type') || 'ROLE_PLAYER';
    this.loadData();
  }

  get isOrganizer(): boolean {
    return ['ROLE_ADMIN', 'ROLE_FIELD_OWNER', 'admin', 'owner'].includes(this.userType);
  }

  loadData() {
    this.competitionService.getCompetitions().subscribe({
      next: (comps) => {
        setTimeout(() => {
          this.competitions = comps;
          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error(err)
    });

    this.matchService.getMatches().subscribe({
      next: (data: any) => {
        setTimeout(() => {
          // Handle cases where Spring returns a paginated object { content: [...] } instead of []
          if (data && data.content) {
               this.matches = data.content;
          } else if (data && data._embedded) {
               // Extract from Spring Data REST usually _embedded.matches or first key
               const key = Object.keys(data._embedded)[0];
               this.matches = data._embedded[key] || [];
          } else if (data && data.data && Array.isArray(data.data)) {
               this.matches = data.data;
          } else if (Array.isArray(data)) {
               this.matches = data;
          } else {
               this.matches = [];
          }
          this.applyFilters();
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        setTimeout(() => {
          console.error("API GET Matches Failed:", err);
          this.errorMsg = err.status === 403 ? "Accès refusé par le serveur (403). Vérifiez les permissions de votre backend Spring Boot." : "Impossible de contacter l'API (Serveur éteint ou erreur CORS ?).";
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  applyFilters() {
    let filtered = [...this.matches];

    if (this.competitionFilter) {
      const compId = +this.competitionFilter;
      filtered = filtered.filter(m => m.competitionId === compId);
    }

    if (this.statusFilter) {
      filtered = filtered.filter(m => m.status === this.statusFilter);
    }

    if (this.dateFilter) {
      filtered = filtered.filter(m => m.scheduledAt.startsWith(this.dateFilter));
    }

    filtered.sort((a, b) => {
      const timeA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
      const timeB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
      
      if (this.sortBy === 'status') {
        const rank: Record<string, number> = { 'LIVE': 1, 'SCHEDULED': 2, 'FINISHED': 3, 'CANCELED': 4 };
        const scoreA = rank[a.status] || 9;
        const scoreB = rank[b.status] || 9;
        if (scoreA !== scoreB) return scoreA - scoreB;
        return timeB - timeA;
      } else if (this.sortBy === 'dateAsc') {
        return timeA - timeB;
      } else {
        return timeB - timeA;
      }
    });

    this.filteredMatches = filtered;
  }

  startMatch(match: MatchResponse) {
    if(!confirm('Démarrer ce match ? Le statut passera à LIVE et vous pourrez ajouter des événements.')) return;
    
    // Convert MatchResponse to MatchRequest format 
    // Usually the backend uses PATCH or PUT on the status or entire entity.
    const req: any = {
      competitionId: match.competitionId,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      scheduledAt: match.scheduledAt,
      venue: match.venue,
      status: MatchStatus.LIVE
    };

    this.matchService.updateMatch(match.id, req).subscribe({
      next: (res) => {
        const idx = this.matches.findIndex(m => m.id === res.id);
        if (idx > -1) {
           this.matches[idx] = res;
        } else {
           this.matches.push(res);
        }
        this.applyFilters();
      },
      error: (err) => alert('Erreur lors du démarrage du match.')
    });
  }

  getStatusColor(status: MatchStatus | string, isBar = false): string {
    switch (status) {
      case 'SCHEDULED': return isBar ? 'bg-blue-400' : 'text-blue-600';
      case 'LIVE': return isBar ? 'bg-red-600' : 'text-red-600';
      case 'FINISHED': return isBar ? 'bg-emerald-500' : 'text-emerald-600';
      case 'CANCELED': return isBar ? 'bg-red-900' : 'text-red-900';
      default: return isBar ? 'bg-primary' : 'text-primary';
    }
  }

  getStatusBadge(status: MatchStatus | string): string {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30';
      case 'LIVE': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30 shadow-sm shadow-red-500/20';
      case 'FINISHED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30';
      case 'CANCELED': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 line-through decoration-2 opacity-80';
      default: return 'bg-muted text-muted-foreground';
    }
  }

  getStatusLabel(status: MatchStatus | string): string {
    switch (status) {
      case 'SCHEDULED': return 'PLANIFIÉ';
      case 'LIVE': return 'EN DIRECT';
      case 'FINISHED': return 'TERMINÉ';
      case 'CANCELED': return 'ANNULÉ';
      default: return status;
    }
  }

  formatMatchDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' }).format(d);
    } catch { return dateStr; }
  }

  formatMatchDateShort(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(d);
    } catch { return ''; }
  }
}
