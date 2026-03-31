import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Trophy, Search, Filter, Calendar, MapPin, Eye, Edit, Trash2, Shield, Plus, Loader2 } from 'lucide-angular';
import { CompetitionService, CompetitionResponse, CompetitionStatus, CompetitionFormat } from '../../services/competition.service';

@Component({
  selector: 'app-competition-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  template: `
    <div class="p-6 md:p-10 max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-black flex items-center gap-3">
            <lucide-icon [name]="TrophyIcon" [size]="32" class="text-primary"></lucide-icon>
            Compétitions
          </h1>
          <p class="text-muted-foreground mt-2">Découvrez les tournois et ligues, ou créez les vôtres.</p>
        </div>
        
        <button *ngIf="isOrganizerOrAdmin" routerLink="/app/competitions/new" class="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm">
          <lucide-icon [name]="PlusIcon" [size]="20"></lucide-icon> Focus sur le terrain
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-card border border-border rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 shadow-sm">
        <div class="relative flex-1">
          <lucide-icon [name]="SearchIcon" [size]="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
          <input type="text" [(ngModel)]="searchQuery" (input)="applyFilters()" placeholder="Rechercher une compétition ou ville..." class="w-full h-11 pl-12 pr-4 bg-background border border-border rounded-xl focus:outline-none focus:border-primary font-medium">
        </div>
        
        <div class="flex gap-4 overflow-x-auto pb-1 md:pb-0">
          <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="h-11 px-4 bg-background border border-border rounded-xl focus:outline-none focus:border-primary font-medium min-w-[150px]">
            <option value="">Tous les statuts</option>
            <option value="DRAFT">Brouillon</option>
            <option value="ONGOING">En cours</option>
            <option value="FINISHED">Terminé</option>
            <option value="CANCELED">Annulé</option>
          </select>
          
          <select [(ngModel)]="formatFilter" (change)="applyFilters()" class="h-11 px-4 bg-background border border-border rounded-xl focus:outline-none focus:border-primary font-medium min-w-[150px]">
            <option value="">Tous formats</option>
            <option value="LEAGUE">Ligue</option>
            <option value="KNOCKOUT">Élimination directe</option>
          </select>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex flex-col items-center justify-center p-20">
        <lucide-icon [name]="Loader2Icon" [size]="48" class="animate-spin text-primary/50 mb-4"></lucide-icon>
        <p class="text-muted-foreground font-medium">Chargement des compétitions...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredCompetitions.length === 0" class="bg-card border border-dashed border-border rounded-3xl p-16 text-center max-w-2xl mx-auto shadow-sm">
        <div class="h-24 w-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <lucide-icon [name]="TrophyIcon" [size]="40" class="text-muted-foreground/50"></lucide-icon>
        </div>
        <h2 class="text-2xl font-bold mb-3">Aucune compétition trouvée</h2>
        <p class="text-muted-foreground text-lg">Essayez d'ajuster vos filtres ou créez une nouvelle aventure sportive dès maintenant !</p>
      </div>

      <!-- Grid -->
      <div *ngIf="!loading && filteredCompetitions.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div *ngFor="let comp of filteredCompetitions" class="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all flex flex-col group relative">
          
          <div class="h-2 w-full" [ngClass]="getStatusColorBar(comp.status)"></div>
          
          <div class="p-6 flex flex-col flex-1 relative">
            
            <div class="flex justify-between items-start mb-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold" [ngClass]="getStatusBadgeClasses(comp.status)">
                {{ getStatusLabel(comp.status) }}
              </span>
              
              <span class="text-xs font-bold px-2 py-1 bg-muted text-muted-foreground rounded-lg">
                {{ comp.format === 'LEAGUE' ? 'LIGUE' : 'COUPE' }}
              </span>
            </div>
            
            <h3 class="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors" [title]="comp.name">
              {{ comp.name }}
            </h3>
            
            <p class="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
               {{ comp.description || 'Aucune description fournie.' }}
            </p>
            
            <div class="space-y-2 mb-6">
              <div class="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <lucide-icon [name]="CalendarIcon" [size]="16" class="shrink-0 text-primary/50"></lucide-icon>
                <span class="truncate">{{ formatDate(comp.startDate) }} - {{ formatDate(comp.endDate) }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <lucide-icon [name]="MapPinIcon" [size]="16" class="shrink-0 text-primary/50"></lucide-icon>
                <span class="truncate">{{ comp.location }}</span>
              </div>
            </div>

            <div class="flex gap-2 mt-auto">
              <button [routerLink]="['/app/competitions', comp.id]" class="flex-1 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                <lucide-icon [name]="EyeIcon" [size]="16"></lucide-icon> Voir
              </button>
              
              <button *ngIf="canEdit(comp)" [routerLink]="['/app/competitions', comp.id, 'edit']" class="bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary p-2 rounded-xl transition-colors shadow-sm" title="Éditer">
                <lucide-icon [name]="EditIcon" [size]="18"></lucide-icon>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
})
export class CompetitionListComponent implements OnInit {
  readonly TrophyIcon = Trophy;
  readonly SearchIcon = Search;
  readonly FilterIcon = Filter;
  readonly CalendarIcon = Calendar;
  readonly MapPinIcon = MapPin;
  readonly EyeIcon = Eye;
  readonly EditIcon = Edit;
  readonly Trash2Icon = Trash2;
  readonly ShieldIcon = Shield;
  readonly PlusIcon = Plus;
  readonly Loader2Icon = Loader2;

  competitions: CompetitionResponse[] = [];
  filteredCompetitions: CompetitionResponse[] = [];
  loading = true;

  searchQuery = '';
  statusFilter = '';
  formatFilter = '';

  userType = '';

  constructor(private competitionService: CompetitionService) {}

  ngOnInit() {
    this.userType = localStorage.getItem('user_type') || 'ROLE_PLAYER';
    this.loadCompetitions();
  }

  get isOrganizerOrAdmin(): boolean {
    return this.userType === 'ROLE_ADMIN' || this.userType === 'ROLE_FIELD_OWNER' || this.userType === 'admin' || this.userType === 'owner';
  }

  canEdit(comp: CompetitionResponse): boolean {
    return this.isOrganizerOrAdmin && (comp.status === CompetitionStatus.DRAFT || this.userType === 'ROLE_ADMIN');
  }

  loadCompetitions() {
    this.loading = true;
    this.competitionService.getCompetitions().subscribe({
      next: (res) => {
        this.competitions = res;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading competitions', err);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.competitions];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.location.toLowerCase().includes(q)
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(c => c.status === this.statusFilter);
    }

    if (this.formatFilter) {
      filtered = filtered.filter(c => c.format === this.formatFilter);
    }

    this.filteredCompetitions = filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
    } catch (e) {
      return dateStr;
    }
  }

  getStatusColorBar(status: CompetitionStatus): string {
    switch (status) {
      case CompetitionStatus.DRAFT: return 'bg-slate-400';
      case CompetitionStatus.ONGOING: return 'bg-emerald-500';
      case CompetitionStatus.FINISHED: return 'bg-amber-500';
      case CompetitionStatus.CANCELED: return 'bg-red-500';
      default: return 'bg-primary';
    }
  }

  getStatusBadgeClasses(status: CompetitionStatus): string {
    switch (status) {
      case CompetitionStatus.DRAFT: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      case CompetitionStatus.ONGOING: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
      case CompetitionStatus.FINISHED: return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
      case CompetitionStatus.CANCELED: return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
      default: return 'bg-primary/10 text-primary';
    }
  }

  getStatusLabel(status: CompetitionStatus): string {
    switch (status) {
      case CompetitionStatus.DRAFT: return 'BROUILLON';
      case CompetitionStatus.ONGOING: return 'EN COURS';
      case CompetitionStatus.FINISHED: return 'TERMINÉE';
      case CompetitionStatus.CANCELED: return 'ANNULÉE';
      default: return status;
    }
  }
}
