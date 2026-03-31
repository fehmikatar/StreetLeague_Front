import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Trophy, MapPin, Calendar, Clock, Edit, ShieldX, Users, Swords, ArrowLeft, Trash2, CheckCircle, XCircle, PlayCircle, Loader2 } from 'lucide-angular';
import { CompetitionService, CompetitionResponse, CompetitionStatus, CompetitionFormat } from '../../services/competition.service';

@Component({
  selector: 'app-competition-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="p-6 md:p-10 max-w-5xl mx-auto min-h-screen">

      <!-- Loading State -->
      <div *ngIf="loading" class="flex flex-col items-center justify-center p-20">
        <lucide-icon [name]="Loader2Icon" [size]="48" class="animate-spin text-primary/50 mb-4"></lucide-icon>
        <p class="text-muted-foreground font-medium">Chargement des données...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="!loading && error" class="bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl p-8 text-center max-w-md mx-auto mt-10">
        <h2 class="text-2xl font-bold mb-2">{{ error }}</h2>
        <button (click)="goBack()" class="mt-6 font-bold hover:underline inline-flex items-center gap-2">
          Retour aux compétitions
        </button>
      </div>

      <!-- Content -->
      <div *ngIf="!loading && comp">
        <!-- Breadcrumb / Back -->
        <button (click)="goBack()" class="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors mb-6">
          <lucide-icon [name]="ArrowLeftIcon" [size]="18"></lucide-icon> Toutes les compétitions
        </button>

        <!-- Header -->
        <div class="bg-card border border-border rounded-3xl overflow-hidden shadow-sm mb-8 relative">
          <!-- Status Line at Top -->
          <div class="h-3 w-full" [ngClass]="getStatusColorBar(comp.status)"></div>
          
          <div class="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-3 mb-4">
                <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider" [ngClass]="getStatusBadgeClasses(comp.status)">
                  {{ getStatusLabel(comp.status) }}
                </span>
                
                <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                  {{ comp.format === 'LEAGUE' ? 'LIGUE' : 'ÉLIMINATION DIRECTE' }}
                </span>
              </div>
              
              <h1 class="text-4xl md:text-5xl font-black mb-4 leading-tight">
                {{ comp.name }}
              </h1>
              
              <div class="flex flex-wrap gap-6 text-muted-foreground font-medium">
                <div class="flex items-center gap-2">
                  <lucide-icon [name]="CalendarIcon" [size]="20" class="text-primary"></lucide-icon>
                  <span>{{ formatDate(comp.startDate) }} - {{ formatDate(comp.endDate) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <lucide-icon [name]="MapPinIcon" [size]="20" class="text-primary"></lucide-icon>
                  <span>{{ comp.location }}</span>
                </div>
              </div>
            </div>

            <!-- Organizer Actions box -->
            <div *ngIf="isOrganizerOrAdmin" class="bg-muted/30 p-5 rounded-2xl border border-border shrink-0 w-full md:w-auto flex flex-col gap-3">
              <span class="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center mb-1">Actions Orga</span>
              
              <button *ngIf="comp.status === 'DRAFT'" [routerLink]="['/app/competitions', comp.id, 'edit']" class="bg-card hover:bg-muted border border-border font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                <lucide-icon [name]="EditIcon" [size]="18"></lucide-icon> Éditer
              </button>
              
              <button *ngIf="comp.status === 'DRAFT'" (click)="updateStatus('ONGOING')" class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                <lucide-icon [name]="PlayCircleIcon" [size]="18"></lucide-icon> Démarrer
              </button>
              
              <button *ngIf="comp.status === 'ONGOING'" (click)="updateStatus('FINISHED')" class="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                <lucide-icon [name]="CheckCircleIcon" [size]="18"></lucide-icon> Clôturer
              </button>

              <button *ngIf="comp.status !== 'CANCELED'" (click)="updateStatus('CANCELED')" class="bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground font-bold py-2.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 mt-2">
                <lucide-icon [name]="XCircleIcon" [size]="18"></lucide-icon> Annuler
              </button>

              <button *ngIf="comp.status === 'DRAFT'" (click)="deleteCompetition()" class="text-destructive/70 hover:text-destructive text-sm font-bold flex items-center justify-center gap-1 mt-2">
                <lucide-icon [name]="Trash2Icon" [size]="14"></lucide-icon> Supprimer
              </button>
            </div>
          </div>
        </div>

        <!-- 2 Columns Layout -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <!-- Left Col (Main content) -->
          <div class="md:col-span-2 space-y-8">
            <div class="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h3 class="text-2xl font-bold mb-4 flex items-center gap-3">
                Description
              </h3>
              <p class="text-muted-foreground leading-relaxed whitespace-pre-line text-lg">
                {{ comp.description || 'Aucune description disponible pour cette compétition.' }}
              </p>
            </div>

            <div class="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h3 class="text-2xl font-bold mb-4 flex items-center gap-3">
                Règlement
              </h3>
              <div class="bg-muted/50 p-6 rounded-2xl text-muted-foreground whitespace-pre-line text-sm border border-border font-medium">
                {{ comp.rules || "Le règlement n'a pas encore été rédigé." }}
              </div>
            </div>
          </div>

          <!-- Right Col (Stats & Info) -->
          <div class="space-y-6">
            <!-- Stats -->
            <div class="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h4 class="text-lg font-bold mb-6">Statistiques</h4>
              
              <div class="space-y-6">
                <div class="flex items-center gap-4">
                  <div class="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                    <lucide-icon [name]="UsersIcon" [size]="24"></lucide-icon>
                  </div>
                  <div>
                    <div class="text-sm font-bold text-muted-foreground">Équipes inscrites</div>
                    <div class="text-2xl font-black">{{ comp.totalTeams || 0 }}</div>
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <div class="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                    <lucide-icon [name]="SwordsIcon" [size]="24"></lucide-icon>
                  </div>
                  <div>
                    <div class="text-sm font-bold text-muted-foreground">Matchs planifiés</div>
                    <div class="text-2xl font-black">{{ comp.totalMatches || 0 }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Dates Duration calculation -->
            <div class="bg-primary text-primary-foreground rounded-3xl p-6 shadow-sm shadow-primary/20">
              <div class="flex items-center gap-3 mb-2">
                <lucide-icon [name]="ClockIcon" [size]="20" class="opacity-80"></lucide-icon>
                <h4 class="font-bold">Durée estimée</h4>
              </div>
              <div class="text-3xl font-black">
                {{ calculateDuration(comp.startDate, comp.endDate) }} jours
              </div>
              
              <div class="mt-4 pt-4 border-t border-primary-foreground/20 text-sm font-medium opacity-90 text-center">
                Organisé par l'ID #{{ comp.organizerId || '---' }}
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
      <!-- Toast Notification -->
      <div *ngIf="toastMessage" class="fixed bottom-6 right-6 bg-card border border-border rounded-xl px-5 py-4 shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
        <div class="h-8 w-8 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">ℹ️</div>
        <p class="text-sm font-medium pr-4">{{ toastMessage }}</p>
      </div>
    </div>
  `
})
export class CompetitionDetailComponent implements OnInit {
  readonly Loader2Icon = Loader2;
  readonly ShieldXIcon = ShieldX;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly TrophyIcon = Trophy;
  readonly CalendarIcon = Calendar;
  readonly MapPinIcon = MapPin;
  readonly EditIcon = Edit;
  readonly Trash2Icon = Trash2;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;
  readonly PlayCircleIcon = PlayCircle;
  readonly UsersIcon = Users;
  readonly SwordsIcon = Swords;
  readonly ClockIcon = Clock;

  compId!: number;
  comp: CompetitionResponse | null = null;
  loading = true;
  error = '';
  toastMessage = '';

  userType = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private competitionService: CompetitionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userType = localStorage.getItem('user_type') || 'ROLE_PLAYER';
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.compId = +id;
        this.loadCompetition();
      }
    });
  }

  get isOrganizerOrAdmin(): boolean {
    return this.userType === 'ROLE_ADMIN' || this.userType === 'ROLE_FIELD_OWNER' || this.userType === 'admin' || this.userType === 'owner';
  }

  loadCompetition() {
    this.loading = true;
    this.error = '';

    console.log('[CompetitionDetail] loadCompetition() called. compId =', this.compId);

    if (!this.compId || isNaN(this.compId)) {
      console.error('[CompetitionDetail] compId is invalid:', this.compId);
      this.loading = false;
      this.error = 'Identifiant de compétition invalide dans l\'URL.';
      return;
    }

    const url = `http://localhost:8085/api/competitions/${this.compId}`;
    console.log('[CompetitionDetail] Calling API:', url);

    this.competitionService.getCompetitionById(this.compId).subscribe({
      next: (res) => {
        console.log('[CompetitionDetail] API success:', res);
        this.comp = res;
        this.loading = false;
        this.error = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[CompetitionDetail] API error status:', err.status, 'message:', err.message, 'full:', err);
        this.loading = false;
        if (err.status === 404) {
          this.error = `Compétition #${this.compId} introuvable (404).`;
        } else if (err.status === 401 || err.status === 403) {
          this.error = `Accès refusé (${err.status}). Reconnectez-vous.`;
        } else if (err.status === 0) {
          this.error = `Serveur injoignable. Vérifiez que Spring Boot tourne sur le port 8085.`;
        } else {
          this.error = `Erreur ${err.status || 'inconnue'} lors du chargement.`;
        }
        this.cdr.detectChanges();
      }
    });

    // Safety timeout
    setTimeout(() => {
      if (this.loading) {
        console.warn('[CompetitionDetail] Timeout! Still loading after 8s. Check Network tab.');
        this.loading = false;
        this.error = `Timeout : le serveur n'a pas répondu en 8s pour /api/competitions/${this.compId}. Vérifiez le backend.`;
        this.cdr.detectChanges();
      }
    }, 8000);
  }

  updateStatus(newStatus: 'DRAFT' | 'ONGOING' | 'FINISHED' | 'CANCELED') {
    if (!this.comp || !confirm(`Êtes-vous sûr de vouloir passer cette compétition en ${newStatus} ?`)) return;

    // Creating request object based on current state
    const req = {
       name: this.comp.name,
       description: this.comp.description,
       rules: this.comp.rules,
       format: this.comp.format,
       status: newStatus as CompetitionStatus,
       startDate: this.comp.startDate,
       endDate: this.comp.endDate,
       location: this.comp.location,
       organizerId: this.comp.organizerId
    };

    this.competitionService.updateCompetition(this.compId, req).subscribe({
       next: (res) => {
          this.comp = res;
          this.showToast(`Statut mis à jour : ${newStatus}`);
          this.cdr.detectChanges();
       },
       error: (err) => {
          console.error(err);
          if (err.status === 409) {
             this.showToast("Conflit : Transition de statut interdite par le serveur.");
          } else {
             this.showToast("Erreur lors de la mise à jour.");
          }
          this.cdr.detectChanges();
       }
    });
  }

  deleteCompetition() {
    if (!this.comp || !confirm("Supprimer définitivement cette compétition ? Cette action est irréversible.")) return;
    
    this.competitionService.deleteCompetition(this.compId).subscribe({
      next: () => {
        this.router.navigate(['/app/competitions']);
      },
      error: (err) => {
        console.error(err);
        this.showToast("Erreur lors de la suppression.");
        this.cdr.detectChanges();
      }
    });
  }

  goBack() {
    this.router.navigate(['/app/competitions']);
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    } catch (e) {
      return dateStr;
    }
  }

  calculateDuration(start: string, end: string): number {
    try {
      const d1 = new Date(start).getTime();
      const d2 = new Date(end).getTime();
      if (isNaN(d1) || isNaN(d2)) return 0;
      const diffMs = d2 - d1;
      return Math.round(diffMs / (1000 * 60 * 60 * 24));
    } catch(e) { return 0; }
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
