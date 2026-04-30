import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { 
  LucideAngularModule, Trophy, MapPin, Users, Clock, Calendar, 
  ArrowLeft, Circle, AlertOctagon, Square, RefreshCw, Info,
  Loader2, PlayCircle, CheckCircle, XCircle 
} from 'lucide-angular';

import { MatchService, MatchResponse, MatchStatus } from '../services/match.service';
import { MatchEventService, MatchEventResponse, MatchEventRequest, MatchEventType } from '../services/match-event.service';
import { TeamService } from '../services/team.service';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div class="max-w-6xl mx-auto">
        
        <!-- Header / Back -->
        <div class="flex items-center gap-4 mb-6">
          <button (click)="goBack()" class="p-2 bg-card border border-border rounded-xl hover:bg-muted transition-all">
            <lucide-icon [name]="ArrowLeftIcon" [size]="20"></lucide-icon>
          </button>
          <div *ngIf="match" class="flex flex-col">
            <span class="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <lucide-icon [name]="TrophyIcon" [size]="14"></lucide-icon> {{ match.competitionName }}
            </span>
          </div>
        </div>

        <div *ngIf="loading && !match" class="flex flex-col items-center justify-center py-20">
          <lucide-icon [name]="Loader2Icon" [size]="48" class="animate-spin text-primary/50 mb-4"></lucide-icon>
          <p class="font-medium text-muted-foreground">Chargement du match...</p>
        </div>

        <div *ngIf="!loading && errorMsg" class="bg-destructive/10 text-destructive border border-destructive/20 p-8 rounded-2xl text-center font-bold">
          {{ errorMsg }}
        </div>

        <!-- Dashboard Layout -->
        <div *ngIf="match" class="flex flex-col gap-6">

          <!-- TOP: Scoreboard -->
          <div class="bg-card rounded-3xl p-8 border border-border shadow-sm flex flex-col relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1" [ngClass]="getStatusColor(match.status)"></div>
            
            <div class="flex justify-between items-start mb-6 w-full">
              <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider" [ngClass]="getStatusBadge(match.status)">
                <span *ngIf="match.status === 'LIVE'" class="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                {{ getStatusLabel(match.status) }}
              </span>
              
              <div class="flex flex-col items-end text-sm text-muted-foreground font-medium">
                <div class="flex items-center gap-1"><lucide-icon [name]="CalendarIcon" [size]="14"></lucide-icon> {{ formatDate(match.scheduledAt) }}</div>
                <div class="flex items-center gap-1"><lucide-icon [name]="MapPinIcon" [size]="14"></lucide-icon> {{ match.venue }}</div>
              </div>
            </div>

            <div class="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full py-4">
              <!-- Home Team -->
              <div class="flex-1 text-center md:text-right flex flex-col items-center md:items-end w-full">
                <div class="text-3xl md:text-5xl font-black mb-2 line-clamp-2 md:leading-tight">{{ match.homeTeamName }}</div>
                <div class="text-sm font-bold text-muted-foreground uppercase tracking-wider">Domicile</div>
              </div>
              
              <!-- Score Center -->
              <div class="flex flex-col items-center shrink-0">
                <div class="bg-background border border-border rounded-3xl px-8 py-4 shadow-inner flex items-center justify-center gap-4">
                  <div class="text-6xl md:text-7xl font-black tabular-nums tracking-tighter" [ngClass]="{'text-red-500': match.status === 'LIVE'}">
                    <ng-container *ngIf="match.status !== 'SCHEDULED' && match.status !== 'CANCELED'">
                      {{ match.homeScore || 0 }} <span class="text-muted-foreground opacity-30 text-5xl">-</span> {{ match.awayScore || 0 }}
                    </ng-container>
                    <ng-container *ngIf="match.status === 'SCHEDULED' || match.status === 'CANCELED'">
                      <span class="text-4xl text-muted-foreground">VS</span>
                    </ng-container>
                  </div>
                </div>
                <div *ngIf="match.status === 'LIVE'" class="mt-4 px-4 py-1.5 bg-red-500/10 text-red-500 text-sm font-bold rounded-full animate-pulse border border-red-500/20">
                  Temps Écoulé : {{ calculateElapsedMinutes() }} min
                </div>
              </div>

              <!-- Away Team -->
              <div class="flex-1 text-center md:text-left flex flex-col items-center md:items-start w-full">
                <div class="text-3xl md:text-5xl font-black mb-2 line-clamp-2 md:leading-tight">{{ match.awayTeamName }}</div>
                <div class="text-sm font-bold text-muted-foreground uppercase tracking-wider">Visiteur</div>
              </div>
            </div>
          </div>

          <!-- BOTTOM TWO COLUMNS -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- COLUMN 1: Timeline -->
            <div class="lg:col-span-2 bg-card rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col">
              <div class="p-6 border-b border-border flex items-center justify-between bg-muted/20">
                <h3 class="text-xl font-bold">Timeline du Match</h3>
                <button (click)="fetchMatchData()" class="p-2 hover:bg-muted text-muted-foreground rounded-full transition-colors hidden md:block">
                  <lucide-icon [name]="RefreshCwIcon" [size]="18" [class.animate-spin]="isRefreshing"></lucide-icon>
                </button>
              </div>
              
              <div class="p-6 flex-1 bg-gradient-to-b from-background to-card relative min-h-[400px]">
                <div *ngIf="events.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  <lucide-icon [name]="InfoIcon" [size]="48" class="mb-4 opacity-30"></lucide-icon>
                  <p class="font-medium text-lg">Aucun événement enregistré.</p>
                  <p class="text-sm opacity-70">Les événements apparaîtront ici pendant le match.</p>
                </div>

                <!-- Vertical Line -->
                <div *ngIf="events.length > 0" class="absolute left-1/2 top-4 bottom-4 w-px bg-border -translate-x-1/2 z-0 hidden md:block"></div>

                <div class="space-y-6 relative z-10 w-full">
                  <div *ngFor="let ev of events" class="flex flex-col md:flex-row items-center w-full justify-center group">
                    
                    <!-- Left Side (Home Team events) -->
                    <div class="flex-1 md:text-right md:pr-8 w-full order-3 md:order-1 mt-2 md:mt-0 flex justify-center md:justify-end">
                      <div *ngIf="ev.teamId === match.homeTeamId" class="bg-background border border-border p-4 rounded-2xl w-[90%] md:w-auto md:max-w-md shadow-sm">
                        <div class="font-bold mb-1">{{ ev.playerName || 'Équipe' }}</div>
                        <div class="text-sm text-muted-foreground">{{ ev.description || getEventTypeLabel(ev.type) }}</div>
                      </div>
                    </div>

                    <!-- Center Marker -->
                    <div class="shrink-0 flex items-center justify-center w-12 h-12 rounded-full border-4 border-background bg-muted text-muted-foreground z-10 order-1 md:order-2 shadow-sm font-bold text-sm"
                         [ngClass]="getEventIconColor(ev.type)">
                      <lucide-icon [name]="getEventIcon(ev.type)" [size]="18" class="absolute"></lucide-icon>
                      <span class="-top-6 absolute text-xs text-muted-foreground font-black">{{ ev.minute }}'</span>
                    </div>

                    <!-- Right Side (Away Team events) -->
                    <div class="flex-1 md:pl-8 w-full order-2 md:order-3 mb-2 md:mb-0 flex justify-center md:justify-start">
                      <div *ngIf="ev.teamId === match.awayTeamId" class="bg-background border border-border p-4 rounded-2xl w-[90%] md:w-auto md:max-w-md shadow-sm">
                         <div class="font-bold mb-1">{{ ev.playerName || 'Équipe' }}</div>
                         <div class="text-sm text-muted-foreground">{{ ev.description || getEventTypeLabel(ev.type) }}</div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            <!-- COLUMN 2: Organizer Panel OR Match Stats -->
            <div class="flex flex-col gap-6">
              
              <!-- Organizer Controls -->
              <div *ngIf="isOrganizer" class="bg-card rounded-3xl border border-border shadow-sm overflow-hidden border-t-4 border-t-primary">
                <div class="p-5 border-b border-border bg-muted/20">
                  <h3 class="font-bold flex items-center gap-2">
                    <lucide-icon [name]="SettingsIcon" [size]="18"></lucide-icon> Panneau Organisateur
                  </h3>
                </div>
                
                <div class="p-5 space-y-4">
                  <!-- Lifecycle Buttons -->
                  <div class="grid grid-cols-1 gap-2 border-b border-border pb-4">
                    <button *ngIf="match.status === 'SCHEDULED'" (click)="updateStatus('LIVE')" class="bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                      <lucide-icon [name]="PlayCircleIcon" [size]="18"></lucide-icon> Démarrer le match (LIVE)
                    </button>
                    
                    <button *ngIf="match.status === 'LIVE'" (click)="updateStatus('FINISHED')" class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                      <lucide-icon [name]="CheckCircleIcon" [size]="18"></lucide-icon> Terminer le match
                    </button>

                    <button *ngIf="match.status !== 'FINISHED' && match.status !== 'CANCELED'" (click)="updateStatus('CANCELED')" class="bg-background border border-border hover:bg-destructive hover:text-destructive-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all mt-2">
                      <lucide-icon [name]="XCircleIcon" [size]="18"></lucide-icon> Cancel
                    </button>
                  </div>

                  <!-- Quick Logging Form (Only if LIVE) -->
                  <form *ngIf="match.status === 'LIVE'" [formGroup]="eventForm" (ngSubmit)="submitEvent()" class="flex flex-col gap-4 pt-2">
                    <h4 class="font-bold text-sm text-muted-foreground uppercase tracking-widest">Add un évènement</h4>
                    
                    <div class="grid grid-cols-2 gap-2">
                       <button type="button" (click)="setEventType('GOAL')" class="p-2 border border-border bg-background rounded-lg font-bold text-xs hover:border-emerald-500 hover:text-emerald-500 transition-colors flex flex-col items-center gap-1" [class.border-emerald-500]="eventForm.value.type==='GOAL'">
                         <lucide-icon [name]="CircleIcon" [size]="16"></lucide-icon> BUT
                       </button>
                       <button type="button" (click)="setEventType('YELLOW_CARD')" class="p-2 border border-border bg-background rounded-lg font-bold text-xs hover:border-yellow-500 hover:text-yellow-600 transition-colors flex flex-col items-center gap-1" [class.border-yellow-500]="eventForm.value.type==='YELLOW_CARD'">
                         <lucide-icon [name]="SquareIcon" [size]="16"></lucide-icon> JAUNE
                       </button>
                       <button type="button" (click)="setEventType('RED_CARD')" class="p-2 border border-border bg-background rounded-lg font-bold text-xs hover:border-red-500 hover:text-red-500 transition-colors flex flex-col items-center gap-1" [class.border-red-500]="eventForm.value.type==='RED_CARD'">
                         <lucide-icon [name]="SquareIcon" [size]="16"></lucide-icon> ROUGE
                       </button>
                       <button type="button" (click)="setEventType('SUBSTITUTION')" class="p-2 border border-border bg-background rounded-lg font-bold text-xs hover:border-primary hover:text-primary transition-colors flex flex-col items-center gap-1" [class.border-primary]="eventForm.value.type==='SUBSTITUTION'">
                         <lucide-icon [name]="RefreshCwIcon" [size]="16"></lucide-icon> REMPLACEM.
                       </button>
                    </div>

                    <select formControlName="teamId" class="w-full h-10 px-3 bg-background border border-border rounded-xl font-medium text-sm">
                      <option value="" disabled selected>Choisir l'équipe</option>
                      <option [value]="match.homeTeamId">{{ match.homeTeamName }} (Dom.)</option>
                      <option [value]="match.awayTeamId">{{ match.awayTeamName }} (Ext.)</option>
                    </select>

                    <div class="flex gap-2">
                      <input type="number" formControlName="minute" placeholder="Min" class="w-16 h-10 px-2 bg-background border border-border rounded-xl font-medium text-center text-sm">
                      <input type="text" formControlName="playerName" placeholder="Nom joueur (optionnel)" class="flex-1 h-10 px-3 bg-background border border-border rounded-xl font-medium text-sm">
                    </div>

                    <input type="text" formControlName="description" placeholder="Description courte (optionnelle)" class="w-full h-10 px-3 bg-background border border-border rounded-xl font-medium text-sm">
                    
                    <button type="submit" [disabled]="eventForm.invalid || submittingEvent" class="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                      <lucide-icon *ngIf="submittingEvent" [name]="Loader2Icon" [size]="16" class="animate-spin"></lucide-icon>
                      Enregistrer
                    </button>
                  </form>
                  <p *ngIf="match.status !== 'LIVE'" class="text-xs text-muted-foreground text-center py-4">Le match doit être EN DIRECT (LIVE) pour enregistrer des événements.</p>
                </div>
              </div>

              <!-- Match Stats summary -->
              <div class="bg-card rounded-3xl border border-border shadow-sm p-6 overflow-hidden">
                <h3 class="font-bold text-lg mb-4">Statistiques du match</h3>
                <div class="space-y-4">
                   <div class="flex justify-between items-center text-sm font-bold">
                     <span class="text-muted-foreground truncate w-1/3">{{ match.homeTeamName }}</span>
                     <span class="w-1/3 text-center bg-muted/50 rounded-full py-1 text-xs">BUTS</span>
                     <span class="text-muted-foreground text-right truncate w-1/3">{{ match.awayTeamName }}</span>
                   </div>
                   <div class="flex justify-between items-center font-black text-2xl">
                     <span>{{ counterByTeam(match.homeTeamId, 'GOAL') }}</span>
                     <span class="text-muted-foreground opacity-30">-</span>
                     <span>{{ counterByTeam(match.awayTeamId, 'GOAL') }}</span>
                   </div>

                   <hr class="border-border">

                   <div class="flex justify-between items-center font-bold">
                     <span class="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-600 flex items-center justify-center">{{ counterByTeam(match.homeTeamId, 'YELLOW_CARD') }}</span>
                     <span class="text-xs text-muted-foreground uppercase tracking-widest">Cartons Jaunes</span>
                     <span class="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-600 flex items-center justify-center">{{ counterByTeam(match.awayTeamId, 'YELLOW_CARD') }}</span>
                   </div>

                   <div class="flex justify-between items-center font-bold">
                     <span class="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">{{ counterByTeam(match.homeTeamId, 'RED_CARD') }}</span>
                     <span class="text-xs text-muted-foreground uppercase tracking-widest">Cartons Rouges</span>
                     <span class="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">{{ counterByTeam(match.awayTeamId, 'RED_CARD') }}</span>
                   </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  `
})
export class MatchDetailComponent implements OnInit, OnDestroy {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly TrophyIcon = Trophy;
  readonly CalendarIcon = Calendar;
  readonly MapPinIcon = MapPin;
  readonly Loader2Icon = Loader2;
  readonly PlayCircleIcon = PlayCircle;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;
  readonly SettingsIcon = Info; // Using Info as substitute for Settings
  
  // Event Icons
  readonly CircleIcon = Circle; 
  readonly AlertOctagonIcon = AlertOctagon;
  readonly SquareIcon = Square;
  readonly RefreshCwIcon = RefreshCw;
  readonly InfoIcon = Info;

  matchId!: number;
  match: MatchResponse | null = null;
  events: MatchEventResponse[] = [];
  
  loading = true;
  isRefreshing = false;
  submittingEvent = false;
  errorMsg = '';
  
  userType = '';
  pollTimer: any;

  eventForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private matchService: MatchService,
    private matchEventService: MatchEventService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.eventForm = this.fb.group({
      type: ['GOAL', Validators.required],
      minute: ['', [Validators.required, Validators.min(0), Validators.max(120)]],
      teamId: ['', Validators.required],
      playerName: [''],
      description: ['']
    });
  }

  ngOnInit() {
    this.userType = localStorage.getItem('user_type') || 'ROLE_PLAYER';
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.matchId = +id;
        this.fetchMatchData();
      }
    });

    // Start polling automatically
    this.pollTimer = setInterval(() => {
      if (this.match && this.match.status === MatchStatus.LIVE) {
        this.fetchMatchData(true);
      }
    }, 10000); // 10 seconds
  }

  ngOnDestroy() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
  }

  get isOrganizer(): boolean {
    return ['ROLE_ADMIN', 'ROLE_FIELD_OWNER', 'admin', 'owner'].includes(this.userType);
  }

  fetchMatchData(isPoll = false) {
    if (!isPoll) this.loading = true;
    this.isRefreshing = true;
    this.errorMsg = '';

    // fetch match
    this.matchService.getMatchById(this.matchId).subscribe({
      next: (res) => {
        this.match = res;
        this.fetchEvents();
      },
      error: (err) => {
        this.loading = false;
        this.isRefreshing = false;
        this.errorMsg = 'Impossible de charger les données du match.';
        this.cdr.detectChanges();
      }
    });
  }

  fetchEvents() {
    this.matchEventService.getEventsByMatch(this.matchId).subscribe({
      next: (evs: any) => {
        let eventsArray: any[] = [];
        if (evs && evs.content) eventsArray = evs.content;
        else if (evs && evs._embedded) {
          const key = Object.keys(evs._embedded)[0];
          eventsArray = evs._embedded[key] || [];
        } else if (evs && evs.data && Array.isArray(evs.data)) {
          eventsArray = evs.data;
        } else if (Array.isArray(evs)) {
          eventsArray = evs;
        }

        this.events = eventsArray.sort((a, b) => b.minute - a.minute); // Descending timeline
        this.loading = false;
        this.isRefreshing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.isRefreshing = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateStatus(newStatus: 'LIVE' | 'FINISHED' | 'CANCELED') {
    if (!this.match || !confirm(`Confirmer le passage au statut ${newStatus} ?`)) return;

    // The backend uses a PUT request for the full DTO, or we can send required fields.
    const req: any = {
      competitionId: this.match.competitionId,
      homeTeamId: this.match.homeTeamId,
      awayTeamId: this.match.awayTeamId,
      scheduledAt: this.match.scheduledAt,
      venue: this.match.venue,
      status: newStatus as MatchStatus
    };

    this.matchService.updateMatch(this.matchId, req).subscribe({
      next: (res) => {
        this.match = res;
        this.fetchEvents(); // in case scores updated
      },
      error: (err) => {
        alert("Erreur lors de la mise à jour du statut.");
      }
    });
  }

  setEventType(type: MatchEventType | string) {
    this.eventForm.patchValue({ type });
  }

  submitEvent() {
    if (this.eventForm.invalid || !this.match) return;
    this.submittingEvent = true;

    const val = this.eventForm.value;
    const req: MatchEventRequest = {
      matchId: this.matchId,
      type: val.type as MatchEventType,
      minute: +val.minute,
      teamId: +val.teamId,
      description: val.description || undefined
    };

    // If we wanted to link to real playerIds, we'd add picker. We simulate string for now in description.
    if (val.playerName) {
       req.description = req.description ? `${val.playerName} : ${req.description}` : val.playerName;
    }

    this.matchEventService.logEvent(req).subscribe({
      next: (res) => {
        this.submittingEvent = false;
        this.eventForm.patchValue({ playerName: '', description: '' }); // reset some fields
        this.fetchMatchData(); // Reload everything to update score inside match details if backend does it automatically.
      },
      error: (err) => {
        this.submittingEvent = false;
        alert("Erreur lors de l'enregistrement de l'événement.");
        this.cdr.detectChanges();
      }
    });
  }

  counterByTeam(teamId: number, type: string): number {
    return this.events.filter(e => e.teamId === teamId && e.type === type).length;
  }

  calculateElapsedMinutes(): number | string {
    if (!this.match) return 0;
    // VERY rough approximation: difference between now and scheduled time IF LIVE.
    // Ideally backend gives us a start time offset. 
    const start = new Date(this.match.scheduledAt).getTime();
    const now = Date.now();
    let mins = Math.floor((now - start) / 60000);
    if (mins < 0) mins = 0;
    if (mins > 120) return '90+';
    return mins;
  }

  getStatusColor(status: MatchStatus | string): string {
    switch (status) {
      case 'LIVE': return 'bg-red-500';
      case 'FINISHED': return 'bg-emerald-500';
      case 'CANCELED': return 'bg-red-900';
      default: return 'bg-blue-500';
    }
  }

  getStatusBadge(status: MatchStatus | string): string {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200';
      case 'LIVE': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 shadow-sm shadow-red-500/20';
      case 'FINISHED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200';
      case 'CANCELED': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 line-through opacity-80';
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

  getEventIcon(type: string): any {
    switch (type) {
      case 'GOAL': return this.CircleIcon;
      case 'YELLOW_CARD': return this.SquareIcon;
      case 'RED_CARD': return this.SquareIcon;
      case 'SUBSTITUTION': return this.RefreshCwIcon;
      case 'FOUL': return this.AlertOctagonIcon;
      default: return this.InfoIcon;
    }
  }

  getEventIconColor(type: string): string {
    switch (type) {
      case 'GOAL': return 'text-background bg-emerald-500'; // Fill style
      case 'YELLOW_CARD': return 'bg-yellow-500 text-yellow-500';
      case 'RED_CARD': return 'bg-red-500 text-red-500';
      case 'SUBSTITUTION': return 'text-primary bg-background border-primary';
      case 'FOUL': return 'text-amber-600 bg-background border-amber-600';
      default: return 'text-muted-foreground';
    }
  }

  getEventTypeLabel(type: string): string {
    switch (type) {
      case 'GOAL': return 'But';
      case 'YELLOW_CARD': return 'Carton Jaune';
      case 'RED_CARD': return 'Carton Rouge';
      case 'SUBSTITUTION': return 'Remplacement';
      case 'FOUL': return 'Faute';
      default: return 'Événement';
    }
  }

  formatDate(dateStr: string): string {
    try {
      return new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' }).format(new Date(dateStr));
    } catch { return dateStr; }
  }

  goBack() {
    this.router.navigate(['/app/matches']);
  }
}
