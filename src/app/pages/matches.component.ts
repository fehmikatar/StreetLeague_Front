import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Trophy, MapPin, Clock, Calendar, Plus, Loader2, Eye, PlayCircle, AlertOctagon, Settings, Cpu, Brain, X, TrendingUp } from 'lucide-angular';
import { MatchService, MatchResponse, MatchStatus, ScheduleRequestDto, ScheduleResultDto, MatchPredictionResponse, MatchPredictionRequest } from '../services/match.service';
import { MatchEventService } from '../services/match-event.service';
import { CompetitionService, CompetitionResponse } from '../services/competition.service';
import { TeamService } from '../services/team.service';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-black flex items-center gap-3 mb-2"><lucide-icon [name]="TrophyIcon" [size]="32" class="text-primary"></lucide-icon> Official Matches</h1>
          <p class="text-muted-foreground">Follow live, scheduled or finished matches.</p>
        </div>
        <div class="flex gap-2" *ngIf="isOrganizer">
          <button (click)="toggleScheduler()" class="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-sm">
            <lucide-icon [name]="CpuIcon" [size]="20"></lucide-icon> Smart Scheduler
          </button>
          <button routerLink="/app/matches/new" class="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm">
            <lucide-icon [name]="PlusIcon" [size]="20"></lucide-icon> Match
          </button>
        </div>
      </div>

      <!-- Scheduler Panel -->
      <div *ngIf="showScheduler" class="bg-indigo-500/10 border border-indigo-500/30 rounded-3xl p-6 mb-8 shadow-sm">
        <h3 class="text-xl font-black mb-4 flex items-center gap-2 text-indigo-700"><lucide-icon [name]="CpuIcon" [size]="20"></lucide-icon> Match Scheduler Engine</h3>
        <p class="text-sm text-indigo-900/70 mb-4 font-medium">Automatically schedules 'SCHEDULED' matches based on constraints to avoid team conflicts.</p>
        
        <div class="flex flex-wrap gap-4 items-end bg-background p-4 rounded-2xl border border-indigo-500/20">
          <div>
            <label class="block text-xs font-bold text-muted-foreground mb-1">Competition</label>
            <select [(ngModel)]="schedCompId" class="h-10 px-3 rounded-xl border border-border bg-background w-48 text-sm">
              <option *ngFor="let c of competitions" [value]="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-muted-foreground mb-1">Start</label>
            <input type="date" [(ngModel)]="schedReq.startDate" class="h-10 px-3 rounded-xl border border-border bg-background w-36 text-sm">
          </div>
          <div>
            <label class="block text-xs font-bold text-muted-foreground mb-1">End</label>
            <input type="date" [(ngModel)]="schedReq.endDate" class="h-10 px-3 rounded-xl border border-border bg-background w-36 text-sm">
          </div>
          <div>
            <label class="block text-xs font-bold text-muted-foreground mb-1">Max / Day</label>
            <input type="number" [(ngModel)]="schedReq.maxMatchesPerDay" class="h-10 px-3 rounded-xl border border-border bg-background w-24 text-sm">
          </div>
          <div>
            <label class="block text-xs font-bold text-muted-foreground mb-1">Interval (min)</label>
            <input type="number" [(ngModel)]="schedReq.intervalMinutes" class="h-10 px-3 rounded-xl border border-border bg-background w-24 text-sm">
          </div>
          <button (click)="runScheduler()" [disabled]="!schedCompId || scheduling" class="h-10 px-6 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
            <lucide-icon *ngIf="scheduling" [name]="Loader2Icon" [size]="16" class="animate-spin"></lucide-icon> Launch
          </button>
        </div>

        <div *ngIf="schedResult" class="mt-4 p-4 bg-background rounded-2xl border border-indigo-500/20">
          <div class="flex gap-2 mb-4 p-1 bg-muted rounded-xl w-fit">
            <button (click)="schedTab='ok'" [class.bg-card]="schedTab==='ok'" [class.shadow-sm]="schedTab==='ok'" class="px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
              <span class="text-emerald-600">✅ {{ schedResult.totalScheduled }} scheduled</span>
            </button>
            <button (click)="schedTab='error'" [class.bg-card]="schedTab==='error'" [class.shadow-sm]="schedTab==='error'" class="px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
              <span class="text-red-600">⚠️ {{ schedResult.totalConflicts }} conflicts</span>
            </button>
          </div>
          <div *ngIf="schedTab === 'ok'" class="space-y-2">
            <div *ngFor="let m of schedResult.scheduledMatches" class="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
              <div class="flex items-center gap-3">
                <span class="font-black text-emerald-600 text-xs">#{{ m.matchId }}</span>
                <span class="font-bold text-sm">{{ m.homeTeamName }} vs {{ m.awayTeamName }}</span>
              </div>
              <div class="text-xs font-bold text-muted-foreground">{{ formatDateTime(m.scheduledAt) }}</div>
            </div>
            <div *ngIf="schedResult.scheduledMatches.length === 0" class="text-center py-6 text-muted-foreground text-sm font-medium">No matches could be scheduled.</div>
          </div>
          <div *ngIf="schedTab === 'error'" class="space-y-2">
            <div *ngFor="let c of schedResult.conflicts" class="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-sm">
              <div class="h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center shrink-0">!</div>
              <div>
                <span class="font-black text-red-600">{{ c.teamName }}</span>
                <span class="text-muted-foreground ml-2">{{ c.conflictDate }}</span>
                <div class="text-xs font-medium text-red-800/60">{{ c.reason }}</div>
              </div>
            </div>
            <div *ngIf="schedResult.conflicts.length === 0" class="text-center py-6 text-muted-foreground text-sm font-medium">No conflicts detected.</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-card rounded-2xl p-4 border border-border mb-8 shadow-sm flex flex-wrap gap-4 items-center">
        <select [(ngModel)]="competitionFilter" (change)="applyFilters()" class="h-11 px-4 bg-background border border-border rounded-xl font-medium flex-1 min-w-[200px]">
          <option value="">All competitions</option>
          <option *ngFor="let comp of competitions" [value]="comp.id">{{ comp.name }}</option>
        </select>
        <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="h-11 px-4 bg-background border border-border rounded-xl font-medium w-[150px]">
          <option value="">All statuses</option>
          <option value="LIVE">Live</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="FINISHED">Finished</option>
          <option value="CANCELED">Canceled</option>
        </select>
        <div class="flex items-center gap-2 border border-border rounded-xl bg-background px-3 h-11 w-40">
          <lucide-icon [name]="CalendarIcon" [size]="16" class="text-muted-foreground"></lucide-icon>
          <input type="date" [(ngModel)]="dateFilter" (change)="applyFilters()" class="bg-transparent border-none outline-none font-medium text-sm w-full">
        </div>
      </div>

      <div *ngIf="loading" class="flex flex-col items-center py-20 text-muted-foreground"><lucide-icon [name]="Loader2Icon" [size]="32" class="animate-spin text-primary/50 mb-3"></lucide-icon>Loading...</div>
      <div *ngIf="!loading && filteredMatches.length === 0" class="text-center py-20 text-muted-foreground">No matches found.</div>

      <div *ngIf="!loading && filteredMatches.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div *ngFor="let match of filteredMatches" class="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all flex flex-col group">
          <div class="h-1 w-full" [ngClass]="getStatusColor(match.status)"></div>
          <div class="p-6">
            <div class="flex justify-between items-start mb-6">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider" [ngClass]="getStatusBadge(match.status)">
                <span *ngIf="match.status === 'LIVE'" class="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                {{ getStatusLabel(match.status) }}
              </span>
              <span class="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg">{{ formatMatchDate(match.scheduledAt) }}</span>
            </div>
            <div class="flex items-center justify-between mb-6">
              <div class="flex-1 text-center font-black text-lg line-clamp-2">{{ match.homeTeamName }}</div>
              <div class="px-6 text-center">
                <div class="text-4xl font-black tabular-nums tracking-tighter" [ngClass]="{'text-red-500': match.status === 'LIVE'}">
                  <ng-container *ngIf="match.status !== 'SCHEDULED' && match.status !== 'CANCELED'">
                    {{ match.hasComputedScore ? match.computedHomeScore : (match.homeScore || 0) }} - {{ match.hasComputedScore ? match.computedAwayScore : (match.awayScore || 0) }}
                  </ng-container>
                  <ng-container *ngIf="match.status === 'SCHEDULED' || match.status === 'CANCELED'">VS</ng-container>
                </div>
              </div>
              <div class="flex-1 text-center font-black text-lg line-clamp-2">{{ match.awayTeamName }}</div>
            </div>
            <div class="space-y-2 mb-4 text-sm text-muted-foreground font-medium bg-muted/30 p-4 rounded-xl">
              <div class="flex items-center gap-2"><lucide-icon [name]="TrophyIcon" [size]="16" class="text-primary/70"></lucide-icon> <span>{{ match.competitionName || 'Competition' }}</span></div>
              <div class="flex items-center gap-2"><lucide-icon [name]="MapPinIcon" [size]="16" class="text-primary/70"></lucide-icon> <span>{{ match.venue }}</span></div>
            </div>

            <!-- ── IA Prediction Badge (affiché après prédiction) ── -->
            <div *ngIf="predictions[match.id]" class="mb-4 p-3 rounded-xl border"
              [ngClass]="{
                'bg-emerald-50 border-emerald-200': predictions[match.id]?.result === 'HOME_WIN',
                'bg-blue-50 border-blue-200':       predictions[match.id]?.result === 'AWAY_WIN',
                'bg-amber-50 border-amber-200':      predictions[match.id]?.result === 'DRAW'
              }">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-black flex items-center gap-1"
                  [ngClass]="{
                    'text-emerald-700': predictions[match.id]?.result === 'HOME_WIN',
                    'text-blue-700':    predictions[match.id]?.result === 'AWAY_WIN',
                    'text-amber-700':   predictions[match.id]?.result === 'DRAW'
                  }">
                  🤖 IA — {{ getPredictionLabel(predictions[match.id]?.result, match) }}
                </span>
                <span class="text-xs font-black px-2 py-0.5 rounded-full"
                  [ngClass]="{
                    'bg-emerald-200 text-emerald-800': predictions[match.id]?.result === 'HOME_WIN',
                    'bg-blue-200 text-blue-800':       predictions[match.id]?.result === 'AWAY_WIN',
                    'bg-amber-200 text-amber-800':      predictions[match.id]?.result === 'DRAW'
                  }">
                  {{ predictions[match.id]?.confidence | number:'1.0-0' }}%
                </span>
              </div>
              
              <!-- 💡 Explication dynamique de l'IA -->
              <p class="text-xs font-medium text-gray-600 italic mb-3 leading-tight border-l-2 border-gray-300 pl-2">
                {{ predictions[match.id]?.interpretation }}
              </p>

              <!-- Barres de probabilité -->
              <div class="space-y-1">
                <div class="flex items-center gap-2 text-xs">
                  <span class="w-20 text-right font-bold text-emerald-700 truncate">{{ match.homeTeamName }}</span>
                  <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-500 rounded-full transition-all duration-700"
                         [style.width.%]="predictions[match.id]?.probabilities?.HOME_WIN || 0"></div>
                  </div>
                  <span class="w-8 font-black text-emerald-700">{{ predictions[match.id]?.probabilities?.HOME_WIN | number:'1.0-0' }}%</span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <span class="w-20 text-right font-bold text-amber-700">Draw</span>
                  <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-amber-400 rounded-full transition-all duration-700"
                         [style.width.%]="predictions[match.id]?.probabilities?.DRAW || 0"></div>
                  </div>
                  <span class="w-8 font-black text-amber-700">{{ predictions[match.id]?.probabilities?.DRAW | number:'1.0-0' }}%</span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <span class="w-20 text-right font-bold text-blue-700 truncate">{{ match.awayTeamName }}</span>
                  <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full transition-all duration-700"
                         [style.width.%]="predictions[match.id]?.probabilities?.AWAY_WIN || 0"></div>
                  </div>
                  <span class="w-8 font-black text-blue-700">{{ predictions[match.id]?.probabilities?.AWAY_WIN | number:'1.0-0' }}%</span>
                </div>
              </div>
            </div>

            <!-- Boutons action -->
            <div class="flex gap-2">
              <button [routerLink]="['/app/matches', match.id]"
                class="flex-1 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
                <lucide-icon [name]="EyeIcon" [size]="18"></lucide-icon> Dashboard
              </button>
              <!-- Bouton IA Prédiction -->
              <button (click)="predictMatch(match)"
                [disabled]="predictingIds.has(match.id)"
                class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border"
                [ngClass]="predictions[match.id]
                  ? 'bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200'
                  : 'bg-violet-600 text-white border-violet-600 hover:bg-violet-700'">
                <lucide-icon *ngIf="!predictingIds.has(match.id)" [name]="BrainIcon" [size]="16"></lucide-icon>
                <lucide-icon *ngIf="predictingIds.has(match.id)" [name]="Loader2Icon" [size]="16" class="animate-spin"></lucide-icon>
                {{ predictions[match.id] ? 'Review' : 'Predict' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MatchesComponent implements OnInit {
  readonly TrophyIcon = Trophy; readonly MapPinIcon = MapPin; readonly CalendarIcon = Calendar;
  readonly PlusIcon = Plus; readonly Loader2Icon = Loader2; readonly EyeIcon = Eye;
  readonly PlayCircleIcon = PlayCircle; readonly AlertOctagonIcon = AlertOctagon;
  readonly CpuIcon = Cpu; readonly BrainIcon = Brain; readonly TrendingUpIcon = TrendingUp;

  matches: MatchResponse[] = []; filteredMatches: MatchResponse[] = [];
  competitions: CompetitionResponse[] = []; teams: any[] = [];
  loading = true; errorMsg = ''; userType = '';

  competitionFilter = ''; statusFilter = ''; dateFilter = '';

  // Scheduler
  showScheduler = false; scheduling = false; schedCompId = '';
  schedTab: 'ok' | 'error' = 'ok';
  schedReq: ScheduleRequestDto = { startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], maxMatchesPerDay: 3, intervalMinutes: 90 };
  schedResult: ScheduleResultDto | null = null;

  // ── IA Prédiction ────────────────────────────────────────────
  predictions: Record<number, MatchPredictionResponse> = {};
  predictingIds = new Set<number>();

  constructor(
    public router: Router, private matchService: MatchService,
    private competitionService: CompetitionService, private teamService: TeamService,
    private matchEventService: MatchEventService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userType = localStorage.getItem('user_type') || 'ROLE_PLAYER';
    this.loadData();
  }

  get isOrganizer() { return ['ROLE_ADMIN', 'ROLE_FIELD_OWNER', 'admin', 'owner'].includes(this.userType); }

  loadData() {
    this.competitionService.getCompetitions().subscribe({ next: comps => { this.competitions = comps; this.cdr.detectChanges(); } });
    this.teamService.getAll().subscribe({ next: teams => {
      this.teams = teams;
      if (this.matches.length > 0) {
        this.matches = this.matches.map((m: any) => ({
           ...m, homeTeamName: this.getTeamName(m.homeTeamId), awayTeamName: this.getTeamName(m.awayTeamId)
        }));
        this.applyFilters();
        this.cdr.detectChanges();
      }
    } });
    this.matchService.getMatches().subscribe({
      next: (data: any) => {
        let items = [];
        if (data?.content) items = data.content;
        else if (data?._embedded) items = data._embedded[Object.keys(data._embedded)[0]];
        else if (Array.isArray(data)) items = data;

        this.matches = items.map((m: any) => ({
           ...m, homeTeamName: m.homeTeamName || this.getTeamName(m.homeTeamId), awayTeamName: m.awayTeamName || this.getTeamName(m.awayTeamId)
        })).sort((a: any, b: any) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

        this.applyFilters(); this.loading = false; this.cdr.detectChanges();

        this.matches.forEach((m: any) => {
          if (m.status === 'LIVE' || m.status === 'FINISHED') {
             this.matchEventService.getTimeline(m.id).subscribe({
               next: (events: any[]) => {
                  m.computedHomeScore = events.filter((e: any) => (e.type === 'GOAL' || e.type === 'SCORE') && e.teamId === m.homeTeamId).length;
                  m.computedAwayScore = events.filter((e: any) => (e.type === 'GOAL' || e.type === 'SCORE') && e.teamId === m.awayTeamId).length;
                  m.hasComputedScore = true;
                  this.cdr.detectChanges();
               }
             });
          }
        });
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  // ── Prédiction IA ─────────────────────────────────────────
  predictMatch(match: MatchResponse) {
    if (this.predictingIds.has(match.id)) return;
    this.predictingIds.add(match.id);
    this.cdr.detectChanges();

    // On prépare toujours les variables LIVE si le match est en cours
    const isLive = match.status === 'LIVE';
    const liveReq: Partial<MatchPredictionRequest> = isLive ? {
      is_live: true,
      live_home_goals: match.hasComputedScore ? match.computedHomeScore : match.homeScore || 0,
      live_away_goals: match.hasComputedScore ? match.computedAwayScore : match.awayScore || 0,
      live_home_red_cards: 0, // Pour la démo, on suppose 0
      live_away_red_cards: 0,
      live_minute: 75 // Minute fictive pour la démo visuelle
    } : { is_live: false };

    // Essai direct via matchId (stats calculées en BD) - la vraie implémentation Spring devra lire ces vars un jour
    this.matchService.predictById(match.id).subscribe({
      next: (res) => {
        this.predictions[match.id] = res;
        this.predictingIds.delete(match.id);
        this.cdr.detectChanges();
      },
      error: () => {
        // Fallback : prédiction manuelle avec des stats estimées + variables LIVE injectées !
        const req: MatchPredictionRequest = {
          homeRank: 10, awayRank: 10,
          homeGoalsAvg: 1.5, awayGoalsAvg: 1.5,
          homeConcededAvg: 1.2, awayConcededAvg: 1.2,
          homeWinsLast5: 2, awayWinsLast5: 2,
          homeRatingAvg: 3.0, awayRatingAvg: 3.0,
          isNeutralVenue: 0, competitionFormat: 0,
          ...liveReq
        };
        this.matchService.predictManual(req).subscribe({
          next: (res) => {
            this.predictions[match.id] = res;
            this.predictingIds.delete(match.id);
            this.cdr.detectChanges();
          },
          error: () => {
            this.predictingIds.delete(match.id);
            this.cdr.detectChanges();
            alert('⚠️ IA API not available. Ensure FastAPI is running on port 8000.');
          }
        });
      }
    });
  }

  getPredictionLabel(result: string | undefined, match: MatchResponse): string {
    if (result === 'HOME_WIN') return `${match.homeTeamName} wins`;
    if (result === 'AWAY_WIN') return `${match.awayTeamName} wins`;
    return 'Draw';
  }

  applyFilters() {
    let f = [...this.matches];
    if (this.competitionFilter) f = f.filter(m => String(m.competitionId) === String(this.competitionFilter));
    if (this.statusFilter) f = f.filter(m => m.status === this.statusFilter);
    if (this.dateFilter) f = f.filter(m => m.scheduledAt?.startsWith(this.dateFilter));
    f.sort((a,b) => {
      if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
      if (b.status === 'LIVE' && a.status !== 'LIVE') return 1;
      return 0;
    });
    this.filteredMatches = f;
  }

  toggleScheduler() { this.showScheduler = !this.showScheduler; this.schedResult = null; }

  runScheduler() {
    if (!this.schedCompId) return;
    this.scheduling = true; this.schedResult = null;
    this.matchService.scheduleMatches(+this.schedCompId, this.schedReq).subscribe({
      next: res => { this.schedResult = res; this.scheduling = false; this.loadData(); },
      error: () => { this.scheduling = false; alert("Error during scheduling"); this.cdr.detectChanges(); }
    });
  }

  getTeamName(id: number) { const t = this.teams.find(x => x.id == id); return t?.name || 'Team '+id; }
  getStatusColor(s: string) { return s==='SCHEDULED' ? 'bg-blue-400' : s==='LIVE' ? 'bg-red-600' : s==='FINISHED' ? 'bg-emerald-500' : 'bg-red-900'; }
  getStatusBadge(s: string) { return s==='SCHEDULED' ? 'bg-blue-100 text-blue-700' : s==='LIVE' ? 'bg-red-100 text-red-700 shadow-sm shadow-red-500/20' : s==='FINISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700 line-through'; }
  getStatusLabel(s: string) { return s==='SCHEDULED' ? 'SCHEDULED' : s==='LIVE' ? 'LIVE' : s==='FINISHED' ? 'FINISHED' : 'CANCELED'; }
  formatMatchDate(d: string) { try { return new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', hour:'2-digit', minute:'2-digit' }).format(new Date(d)); } catch { return d; } }
  formatDateTime(d: string) {
    if (!d) return '';
    return new Intl.DateTimeFormat('en-US', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(d));
  }
}
