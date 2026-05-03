import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Trophy, MapPin, Calendar, Clock, Edit, ShieldX, Users, Swords, ArrowLeft, Trash2, CheckCircle, XCircle, PlayCircle, Loader2, BarChart2, Target, Star, TrendingUp, Award, AlertTriangle, UserPlus, Info, Plus, ChevronRight } from 'lucide-angular';
import { CompetitionService, CompetitionResponse, CompetitionStatus, CompetitionAnalyticsDto, SeedingResultDto } from '../../services/competition.service';
import { MatchService } from '../../services/match.service';
import { RegistrationService, RegistrationResponse, RegistrationStatus } from '../../services/registration.service';
import { TeamService } from '../../services/team.service';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-competition-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  template: `
<div class="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">

  <!-- Loading -->
  <div *ngIf="loading" class="flex flex-col items-center justify-center p-20">
    <lucide-icon [name]="Loader2Icon" [size]="48" class="animate-spin text-primary/50 mb-4"></lucide-icon>
    <p class="text-muted-foreground font-medium">Loading...</p>
  </div>

  <!-- Error -->
  <div *ngIf="!loading && error" class="bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl p-8 text-center max-w-md mx-auto mt-10">
    <h2 class="text-xl font-bold mb-2">{{ error }}</h2>
    <button (click)="goBack()" class="mt-4 font-bold hover:underline">← Back</button>
  </div>

  <!-- Content -->
  <div *ngIf="!loading && comp">
    <button (click)="goBack()" class="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium mb-6">
      <lucide-icon [name]="ArrowLeftIcon" [size]="18"></lucide-icon> All competitions
    </button>

    <!-- Header Card -->
    <div class="bg-card border border-border rounded-3xl overflow-hidden shadow-sm mb-6">
      <div class="h-2 w-full" [ngClass]="getStatusColorBar(comp.status)"></div>
      <div class="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start justify-between">
        <div class="flex-1">
          <div class="flex flex-wrap items-center gap-2 mb-3">
            <span class="px-3 py-1 rounded-full text-xs font-black uppercase" [ngClass]="getStatusBadgeClasses(comp.status)">{{ getStatusLabel(comp.status) }}</span>
            <span class="px-3 py-1 rounded-full text-xs font-black uppercase bg-muted text-muted-foreground border border-border">{{ comp.format === 'LEAGUE' ? 'LEAGUE' : 'ELIMINATION' }}</span>
          </div>
          <h1 class="text-3xl md:text-4xl font-black mb-3">{{ comp.name }}</h1>
          <div class="flex flex-wrap gap-4 text-muted-foreground font-medium text-sm">
            <span class="flex items-center gap-1"><lucide-icon [name]="CalendarIcon" [size]="16" class="text-primary"></lucide-icon> {{ formatDate(comp.startDate) }} — {{ formatDate(comp.endDate) }}</span>
            <span class="flex items-center gap-1"><lucide-icon [name]="MapPinIcon" [size]="16" class="text-primary"></lucide-icon> {{ comp.location }}</span>
          </div>
        </div>
        <div *ngIf="isOrganizerOrAdmin" class="flex flex-col gap-2 w-full md:w-auto">
          <button *ngIf="comp.status === 'DRAFT'" [routerLink]="['/app/competitions', comp.id, 'edit']" class="bg-card border border-border font-bold py-2 px-5 rounded-xl hover:bg-muted flex items-center gap-2 justify-center"><lucide-icon [name]="EditIcon" [size]="16"></lucide-icon> Edit</button>
          <button *ngIf="comp.status === 'DRAFT'" (click)="updateStatus('ONGOING')" class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-5 rounded-xl flex items-center gap-2 justify-center"><lucide-icon [name]="PlayCircleIcon" [size]="16"></lucide-icon> Start</button>
          <button *ngIf="comp.status === 'ONGOING'" (click)="updateStatus('FINISHED')" class="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-5 rounded-xl flex items-center gap-2 justify-center"><lucide-icon [name]="CheckCircleIcon" [size]="16"></lucide-icon> Finish</button>
          <button *ngIf="comp.status !== 'CANCELED'" (click)="updateStatus('CANCELED')" class="bg-destructive/10 text-destructive hover:bg-destructive hover:text-white font-bold py-2 px-5 rounded-xl flex items-center gap-2 justify-center"><lucide-icon [name]="XCircleIcon" [size]="16"></lucide-icon> Cancel</button>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-muted/50 border border-border rounded-2xl p-1 mb-6 w-fit">
      <button *ngFor="let t of tabs" (click)="activeTab = t.key"
        class="px-4 py-2 rounded-xl font-bold text-sm transition-all"
        [class.bg-card]="activeTab === t.key"
        [class.shadow-sm]="activeTab === t.key"
        [class.text-foreground]="activeTab === t.key"
        [class.text-muted-foreground]="activeTab !== t.key">
        {{ t.label }}
      </button>
    </div>

    <!-- Tab: Details -->
    <div *ngIf="activeTab === 'details'" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 space-y-6">
        <div class="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <h3 class="text-xl font-bold mb-3">Description</h3>
          <p class="text-muted-foreground leading-relaxed">{{ comp.description || 'No description.' }}</p>
        </div>
        <div class="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <h3 class="text-xl font-bold mb-3">Rules</h3>
          <div class="bg-muted/50 p-4 rounded-2xl text-muted-foreground text-sm border border-border whitespace-pre-line">{{ comp.rules || 'Not drafted.' }}</div>
        </div>
      </div>
      <div class="space-y-4">
        <div class="bg-card border border-border rounded-3xl p-5 shadow-sm">
          <h4 class="font-bold mb-4">Statistics</h4>
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><lucide-icon [name]="UsersIcon" [size]="20"></lucide-icon></div>
              <div><div class="text-xs font-bold text-muted-foreground">Teams</div><div class="text-xl font-black">{{ comp.totalTeams || 0 }}</div></div>
            </div>
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><lucide-icon [name]="SwordsIcon" [size]="20"></lucide-icon></div>
              <div><div class="text-xs font-bold text-muted-foreground">Matchs</div><div class="text-xl font-black">{{ comp.totalMatches || 0 }}</div></div>
            </div>
          </div>
        </div>
        <div class="bg-primary text-primary-foreground rounded-3xl p-5 shadow-sm">
          <div class="flex items-center gap-2 mb-1"><lucide-icon [name]="ClockIcon" [size]="18" class="opacity-80"></lucide-icon><h4 class="font-bold">Duration</h4></div>
          <div class="text-3xl font-black">{{ calculateDuration(comp.startDate, comp.endDate) }} days</div>
          <div class="mt-3 pt-3 border-t border-primary-foreground/20 text-sm opacity-80">Organized by #{{ comp.organizerId }}</div>
        </div>
      </div>
    </div>


    <!-- Tab: Matches -->
    <div *ngIf="activeTab === 'matches'" class="space-y-6">
      <div class="flex justify-between items-center">
        <h3 class="text-xl font-bold flex items-center gap-2"><lucide-icon [name]="CalendarIcon" [size]="22" class="text-primary"></lucide-icon> Competition matches</h3>
        <button [routerLink]="['/app/matches/new']" [queryParams]="{competitionId: compId}" class="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 flex items-center gap-2 shadow-lg shadow-primary/20">
          <lucide-icon [name]="PlusIcon" [size]="18"></lucide-icon> Schedule a match
        </button>
      </div>

      <div *ngIf="compMatches.length === 0" class="bg-card border border-border rounded-3xl p-10 text-center text-muted-foreground shadow-sm">
        <lucide-icon [name]="CalendarIcon" [size]="40" class="mx-auto mb-2 opacity-20"></lucide-icon>
        <p>No matches registered for this competition yet.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div *ngFor="let m of compMatches" class="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-all cursor-pointer group shadow-sm" [routerLink]="['/app/matches', m.id]">
          <div class="flex justify-between items-start mb-4">
            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" [ngClass]="getStatusBadgeClasses(m.status)">{{ getStatusLabel(m.status) }}</span>
            <span class="text-[10px] font-bold text-muted-foreground">{{ m.scheduledAt | date:'dd MMM, HH:mm' }}</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <div class="flex-1 text-center font-bold text-sm">{{ getTeamName(m.homeTeamId) }}</div>
            <div class="px-3 py-1 bg-muted rounded-lg font-black text-primary">
              <span *ngIf="m.status !== 'SCHEDULED'">{{ m.homeScore }} - {{ m.awayScore }}</span>
              <span *ngIf="m.status === 'SCHEDULED'">VS</span>
            </div>
            <div class="flex-1 text-center font-bold text-sm">{{ getTeamName(m.awayTeamId) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Bracket -->
    <div *ngIf="activeTab === 'bracket'" class="space-y-6">
      <div class="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-x-auto">
        <h3 class="text-xs font-bold text-slate-500 mb-6 uppercase tracking-wider">BRACKET — DRAW</h3>
        
        <div class="min-w-[800px] flex gap-8 pb-4">
          <!-- Quarter-final -->
          <div class="flex-1 space-y-4">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-border pb-2 mb-4">Quarter-final</div>
            
            <div *ngFor="let m of getMatchesByRound('Tirage')" class="border border-border rounded-xl overflow-hidden bg-card shadow-sm text-sm cursor-pointer hover:border-primary/50 transition-colors" [routerLink]="['/app/matches', m.id]">
              <div class="px-3 py-2 border-b border-border flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-[10px] font-bold bg-muted text-muted-foreground rounded px-1.5 py-0.5 w-5 text-center">{{ getSeed(m.homeTeamId) }}</span>
                  <span class="font-bold text-foreground" [class.text-primary]="m.homeScore > m.awayScore">{{ getTeamName(m.homeTeamId) }}</span>
                </div>
                <span *ngIf="m.status !== 'SCHEDULED'" class="font-black">{{ m.homeScore }}</span>
              </div>
              <div class="px-3 py-2 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-[10px] font-bold bg-muted text-muted-foreground rounded px-1.5 py-0.5 w-5 text-center">{{ getSeed(m.awayTeamId) }}</span>
                  <span class="font-bold text-foreground" [class.text-primary]="m.awayScore > m.homeScore">{{ getTeamName(m.awayTeamId) }}</span>
                </div>
                <span *ngIf="m.status !== 'SCHEDULED'" class="font-black">{{ m.awayScore }}</span>
              </div>
            </div>
            
            <div *ngIf="getMatchesByRound('Tirage').length === 0" class="text-sm text-muted-foreground italic p-4 border border-dashed border-border rounded-xl text-center">No matches scheduled</div>
          </div>

          <!-- Semi-final -->
          <div class="flex-1 space-y-4 flex flex-col justify-around">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-border pb-2 mb-4">Semi-final</div>
            
            <div *ngFor="let m of getMatchesByRound('Demi-finale')" class="border border-border rounded-xl overflow-hidden bg-card shadow-sm text-sm cursor-pointer hover:border-primary/50 transition-colors" [routerLink]="['/app/matches', m.id]">
              <div class="px-3 py-2 border-b border-border flex items-center justify-between" [class.opacity-50]="!m.homeTeamId">
                <div class="flex items-center gap-3">
                  <span class="text-[10px] font-bold bg-muted text-muted-foreground rounded px-1.5 py-0.5 w-5 text-center">?</span>
                  <span class="font-bold text-foreground" [class.italic]="!m.homeTeamId">{{ getTeamName(m.homeTeamId, 'TBD') }}</span>
                </div>
                <span *ngIf="m.status !== 'SCHEDULED'" class="font-black">{{ m.homeScore }}</span>
              </div>
              <div class="px-3 py-2 flex items-center justify-between" [class.opacity-50]="!m.awayTeamId">
                <div class="flex items-center gap-3">
                  <span class="text-[10px] font-bold bg-muted text-muted-foreground rounded px-1.5 py-0.5 w-5 text-center">?</span>
                  <span class="font-bold text-foreground" [class.italic]="!m.awayTeamId">{{ getTeamName(m.awayTeamId, 'BYE') }}</span>
                </div>
                <span *ngIf="m.status !== 'SCHEDULED'" class="font-black">{{ m.awayScore }}</span>
              </div>
            </div>
            <div *ngIf="getMatchesByRound('Demi-finale').length === 0" class="text-sm text-muted-foreground italic p-4 border border-dashed border-border rounded-xl text-center">Pending</div>
          </div>

          <!-- Final -->
          <div class="flex-1 space-y-4 flex flex-col justify-center">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-border pb-2 mb-4">Final</div>
            
            <div *ngFor="let m of getMatchesByRound('Finale')" class="border border-amber-500/50 rounded-xl overflow-hidden bg-amber-500/5 shadow-md text-sm cursor-pointer hover:border-amber-500 transition-colors" [routerLink]="['/app/matches', m.id]">
              <div class="px-3 py-2 border-b border-amber-500/20 flex items-center justify-between" [class.opacity-50]="!m.homeTeamId">
                <div class="flex items-center gap-3">
                  <span class="text-[10px] font-bold bg-amber-500/20 text-amber-700 rounded px-1.5 py-0.5 w-5 text-center">?</span>
                  <span class="font-bold text-amber-900" [class.italic]="!m.homeTeamId">{{ getTeamName(m.homeTeamId, 'TBD') }}</span>
                </div>
                <span *ngIf="m.status !== 'SCHEDULED'" class="font-black text-amber-700">{{ m.homeScore }}</span>
              </div>
              <div class="px-3 py-2 flex items-center justify-between" [class.opacity-50]="!m.awayTeamId">
                <div class="flex items-center gap-3">
                  <span class="text-[10px] font-bold bg-amber-500/20 text-amber-700 rounded px-1.5 py-0.5 w-5 text-center">?</span>
                  <span class="font-bold text-amber-900" [class.italic]="!m.awayTeamId">{{ getTeamName(m.awayTeamId, 'BYE') }}</span>
                </div>
                <span *ngIf="m.status !== 'SCHEDULED'" class="font-black text-amber-700">{{ m.awayScore }}</span>
              </div>
            </div>
            <div *ngIf="getMatchesByRound('Finale').length === 0" class="text-sm text-muted-foreground italic p-4 border border-dashed border-border rounded-xl text-center">Pending</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Seeding -->
    <div *ngIf="activeTab === 'seeding'" class="space-y-6">
      <div class="bg-card border border-border rounded-3xl p-6 shadow-sm">
        <h3 class="text-xl font-bold mb-4 flex items-center gap-2"><lucide-icon [name]="AwardIcon" [size]="22" class="text-primary"></lucide-icon> Seeding Engine</h3>
        <div class="flex flex-wrap gap-2 mb-6">
          <button (click)="runSeeding('WIN_RATE')" [disabled]="seedingLoading" class="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2">
            <lucide-icon *ngIf="seedingLoading && seedingStrategy==='WIN_RATE'" [name]="Loader2Icon" [size]="16" class="animate-spin"></lucide-icon> 📊 Win Rate
          </button>
          <button (click)="runSeeding('ELO')" [disabled]="seedingLoading" class="px-4 py-2 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-all flex items-center gap-2">
            <lucide-icon *ngIf="seedingLoading && seedingStrategy==='ELO'" [name]="Loader2Icon" [size]="16" class="animate-spin"></lucide-icon> ⚡ ELO Score
          </button>
        </div>
        <div *ngIf="seeds.length > 0">
          <div class="grid grid-cols-1 gap-3">
            <div *ngFor="let s of seeds; let i = index"
              class="flex items-center gap-4 bg-background border border-border rounded-2xl p-4"
              [class.border-yellow-400]="i === 0"
              [class.border-slate-400]="i === 1"
              [class.border-amber-600]="i === 2">
              <div class="text-2xl font-black w-8 text-center"
                [class.text-yellow-500]="i===0" [class.text-slate-400]="i===1" [class.text-amber-600]="i===2" [class.text-muted-foreground]="i>2">
                {{ i===0 ? '🥇' : i===1 ? '🥈' : i===2 ? '🥉' : '#' + s.seed }}
              </div>
              <div class="flex-1">
                <div class="font-bold">{{ s.teamName }}</div>
                <div class="text-xs text-muted-foreground">{{ s.wins }}W · {{ s.draws }}D · {{ s.losses }}L · {{ s.matchesPlayed }} matches</div>
              </div>
              <div class="text-right">
                <!-- Highlighted Value based on Strategy -->
                <ng-container *ngIf="seedingStrategy === 'ELO'">
                  <div class="font-black text-lg text-violet-600">{{ s.eloScore }} pts</div>
                  <div class="text-xs text-muted-foreground">Win Rate: {{ (s.winRate * 100).toFixed(1) }}%</div>
                </ng-container>
                <ng-container *ngIf="seedingStrategy !== 'ELO'">
                  <div class="font-black text-lg text-emerald-600">{{ (s.winRate * 100).toFixed(1) }}%</div>
                  <div class="text-xs text-muted-foreground">ELO: {{ s.eloScore }}</div>
                </ng-container>
              </div>
            </div>
          </div>
        </div>
        <div *ngIf="seeds.length === 0 && !seedingLoading" class="text-center py-10 text-muted-foreground">
          <lucide-icon [name]="AwardIcon" [size]="40" class="mx-auto mb-2 opacity-20"></lucide-icon>
          <p>Run the Seeding Engine to rank the teams.</p>
        </div>
      </div>
    </div>

    <!-- Tab: Analytics -->
    <div *ngIf="activeTab === 'analytics'" class="space-y-6">
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-bold flex items-center gap-2"><lucide-icon [name]="BarChart2Icon" [size]="22" class="text-primary"></lucide-icon> Analytics</h3>
        <button (click)="loadAnalytics()" [disabled]="analyticsLoading" class="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
          <lucide-icon *ngIf="analyticsLoading" [name]="Loader2Icon" [size]="16" class="animate-spin"></lucide-icon> Load
        </button>
      </div>

      <div *ngIf="analytics">
        <!-- KPIs -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-card border border-border rounded-2xl p-4 text-center shadow-sm">
            <div class="text-3xl font-black text-emerald-500">{{ analytics.totalGoals }}</div>
            <div class="text-xs font-bold text-muted-foreground mt-1">🎯 SCORE</div>
          </div>
          <div class="bg-card border border-border rounded-2xl p-4 text-center shadow-sm">
            <div class="text-3xl font-black text-yellow-500">{{ analytics.totalWarnings }}</div>
            <div class="text-xs font-bold text-muted-foreground mt-1">⚠️ WARNINGS</div>
          </div>
          <div class="bg-card border border-border rounded-2xl p-4 text-center shadow-sm">
            <div class="text-3xl font-black text-red-500">{{ analytics.totalEjections }}</div>
            <div class="text-xs font-bold text-muted-foreground mt-1">🟥 EJECTIONS</div>
          </div>
          <div class="bg-card border border-border rounded-2xl p-4 text-center shadow-sm">
            <div class="text-3xl font-black text-purple-500">{{ analytics.totalUpsets }}</div>
            <div class="text-xs font-bold text-muted-foreground mt-1">💥 UPSETS</div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Best Attack / Defense -->
          <div class="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
            <h4 class="font-bold">Best teams</h4>
            <div *ngIf="analytics.bestAttack" class="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <div class="text-2xl">⚔️</div>
              <div><div class="text-xs font-bold text-emerald-600">BEST ATTACK</div><div class="font-bold">{{ analytics.bestAttack.teamName }}</div><div class="text-sm text-muted-foreground">{{ analytics.bestAttack.value }} goals</div></div>
            </div>
            <div *ngIf="analytics.bestDefense" class="flex items-center gap-3 p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
              <div class="text-2xl">🛡️</div>
              <div><div class="text-xs font-bold text-blue-600">BEST DEFENSE</div><div class="font-bold">{{ analytics.bestDefense.teamName }}</div><div class="text-sm text-muted-foreground">{{ analytics.bestDefense.value }} goals conceded</div></div>
            </div>
          </div>

          <!-- Top Scorers -->
          <div class="bg-card border border-border rounded-3xl p-5 shadow-sm">
            <h4 class="font-bold mb-3">🏅 Top Scores</h4>
            <div *ngFor="let p of analytics.topScorers; let i = index" class="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div class="flex items-center gap-2">
                <span class="text-xs font-black text-muted-foreground w-5">{{ i+1 }}</span>
                <span class="font-bold text-sm">{{ p.playerName }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full">{{ p.goals }} 🎯</span>
                <span *ngIf="p.assists > 0" class="text-xs bg-blue-500/10 text-blue-600 font-bold px-2 py-0.5 rounded-full">{{ p.assists }} 🅰️</span>
              </div>
            </div>
            <p *ngIf="analytics.topScorers.length === 0" class="text-muted-foreground text-sm text-center py-4">No scores recorded.</p>
          </div>
        </div>

        <!-- Cards Summary -->
        <div class="bg-card border border-border rounded-3xl p-5 shadow-sm mt-6">
          <h4 class="font-bold mb-3">📋 Penalty Summary by Team</h4>
          <div class="space-y-2">
            <div *ngFor="let c of analytics.cardsSummary" class="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border">
              <span class="font-bold text-sm">{{ c.teamName }}</span>
              <div class="flex items-center gap-3">
                <span class="bg-yellow-500/20 text-yellow-600 font-bold text-xs px-2 py-1 rounded-lg">{{ c.warnings }} ⚠️</span>
                <span class="bg-red-500/20 text-red-500 font-bold text-xs px-2 py-1 rounded-lg">{{ c.ejections }} 🟥</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!analytics && !analyticsLoading" class="text-center py-16 text-muted-foreground">
        <lucide-icon [name]="BarChart2Icon" [size]="48" class="mx-auto mb-3 opacity-20"></lucide-icon>
        <p>Click "Load" to see the competition analytics.</p>
      </div>
    </div>
  </div>

  <!-- Toast -->
  <div *ngIf="toastMessage" class="fixed bottom-6 right-6 bg-card border border-border rounded-xl px-5 py-3 shadow-2xl flex items-center gap-3 z-50">
    <span class="text-primary">ℹ️</span><p class="text-sm font-medium">{{ toastMessage }}</p>
  </div>
</div>
  `
})
export class CompetitionDetailComponent implements OnInit {
  readonly Loader2Icon = Loader2; readonly ArrowLeftIcon = ArrowLeft; readonly TrophyIcon = Trophy;
  readonly CalendarIcon = Calendar; readonly MapPinIcon = MapPin; readonly EditIcon = Edit;
  readonly Trash2Icon = Trash2; readonly CheckCircleIcon = CheckCircle; readonly XCircleIcon = XCircle;
  readonly PlayCircleIcon = PlayCircle; readonly UsersIcon = Users; readonly SwordsIcon = Swords;
  readonly ClockIcon = Clock; readonly BarChart2Icon = BarChart2; readonly TargetIcon = Target;
  readonly StarIcon = Star; readonly TrendingUpIcon = TrendingUp; readonly AwardIcon = Award; readonly AlertTriangleIcon = AlertTriangle; readonly UserPlusIcon = UserPlus;
  readonly InfoIcon = Info; readonly PlusIcon = Plus; readonly ChevronRightIcon = ChevronRight;

  compId!: number;
  comp: CompetitionResponse | null = null;
  loading = true; error = ''; toastMessage = '';
  userType = '';

  tabs = [
    { key: 'bracket', label: '🌳 Bracket' },
    { key: 'details', label: '📋 Details' },
    { key: 'matches', label: '📅 Matches' },
    { key: 'seeding', label: '🏆 Seeding' },
    { key: 'analytics', label: '📊 Analytics' }
  ];
  activeTab = 'bracket';

  // Registrations
  registrations: RegistrationResponse[] = [];
  regLoading = false;
  availableTeams: any[] = [];
  selectedTeamId = '';
  registering = false;

  // Seeding
  seeds: SeedingResultDto[] = [];
  seedingLoading = false;
  seedingStrategy = 'WIN_RATE';
  compMatches: any[] = [];

  // Analytics
  analytics: CompetitionAnalyticsDto | null = null;
  analyticsLoading = false;

  constructor(
    private route: ActivatedRoute, private router: Router,
    private competitionService: CompetitionService,
    private registrationService: RegistrationService,
    private teamService: TeamService,
    private matchService: MatchService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.userType = localStorage.getItem('user_type') || 'ROLE_PLAYER';
    this.route.paramMap.subscribe(p => {
      const id = p.get('id');
      if (id) {
        this.compId = +id;
        this.loadCompetition();
        this.loadAvailableTeams();
        this.loadMatches();
      }
    });
  }

  getTeamName(id: number | null, fallback = 'Team'): string {
    if (!id) return fallback;
    const t = this.availableTeams.find(team => team.id === id);
    return t ? t.name : fallback;
  }

  getSeed(id: number | null): number | string {
    if (!id) return '?';
    // Dummy seed generation logic, to replace with actual seeds later
    return this.availableTeams.findIndex(t => t.id === id) + 1 || '?';
  }

  getMatchesByRound(round: string) {
    if (!this.compMatches) return [];
    return this.compMatches.filter(m => m.round === round);
  }

  loadAvailableTeams() {
    this.teamService.getAll().subscribe({
      next: teams => { this.availableTeams = teams; this.cdr.detectChanges(); },
      error: () => console.error('Error loading teams')
    });
  }

  get isOrganizerOrAdmin() {
    return ['ROLE_ADMIN', 'ROLE_FIELD_OWNER', 'admin', 'owner'].includes(this.userType);
  }

  loadCompetition() {
    this.loading = true; this.error = '';
    this.competitionService.getCompetitionById(this.compId).pipe(timeout(8000)).subscribe({
      next: res => { this.comp = res; this.loading = false; this.cdr.detectChanges(); },
      error: err => {
        this.loading = false;
        this.error = err.status === 404 ? `Competition #${this.compId} not found.`
          : err.status === 0 ? 'Server unreachable (port 8085).' : `Error ${err.status}`;
        this.cdr.detectChanges();
      }
    });
  }

  loadMatches() {
    this.matchService.getMatches(this.compId).subscribe({
      next: (res: any) => {
        let items: any[] = [];
        if (res?.content) items = res.content;
        else if (res?._embedded) items = res._embedded[Object.keys(res._embedded)[0]];
        else if (Array.isArray(res)) items = res;
        this.compMatches = items;
        this.cdr.detectChanges();
      }
    });
  }

  // ─── Seeding ─────────────────────────────────────────────────────────────
  runSeeding(strategy: string) {
    this.seedingLoading = true; this.seedingStrategy = strategy;
    this.competitionService.getSeeding(this.compId, strategy).subscribe({
      next: res => { this.seeds = res; this.seedingLoading = false; this.cdr.detectChanges(); },
      error: err => {
        this.seedingLoading = false;
        this.showToast('Seeding error: ' + (err.error || err.message));
        this.cdr.detectChanges();
      }
    });
  }

  // ─── Analytics ───────────────────────────────────────────────────────────
  loadAnalytics() {
    this.analyticsLoading = true;
    this.competitionService.getAnalytics(this.compId).subscribe({
      next: res => { this.analytics = res; this.analyticsLoading = false; this.cdr.detectChanges(); },
      error: err => {
        this.analyticsLoading = false;
        this.showToast('Analytics error: ' + (err.error || err.message));
        this.cdr.detectChanges();
      }
    });
  }

  updateStatus(newStatus: 'DRAFT' | 'ONGOING' | 'FINISHED' | 'CANCELED') {
    if (!this.comp || !confirm(`Switch to ${newStatus}?`)) return;
    const req: any = { ...this.comp, status: newStatus };
    this.competitionService.updateCompetition(this.compId, req).subscribe({
      next: res => { this.comp = res; this.showToast('Status updated.'); this.cdr.detectChanges(); },
      error: () => { this.showToast('Update error.'); this.cdr.detectChanges(); }
    });
  }

  deleteCompetition() {
    if (!confirm('Delete?')) return;
    this.competitionService.deleteCompetition(this.compId).subscribe({
      next: () => this.router.navigate(['/app/competitions']),
      error: () => this.showToast('Deletion error.')
    });
  }

  goBack() { this.router.navigate(['/app/competitions']); }

  showToast(msg: string) {
    this.toastMessage = msg; this.cdr.detectChanges();
    setTimeout(() => { this.toastMessage = ''; this.cdr.detectChanges(); }, 3500);
  }

  formatDate(d: string) {
    if (!d) return '';
    try { return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d)); }
    catch { return d; }
  }

  calculateDuration(start: string, end: string) {
    try { return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000); }
    catch { return 0; }
  }

  getStatusColorBar(s: CompetitionStatus) {
    return { DRAFT: 'bg-slate-400', ONGOING: 'bg-emerald-500', FINISHED: 'bg-amber-500', CANCELED: 'bg-red-500' }[s] || 'bg-primary';
  }
  getStatusBadgeClasses(s: string) {
    if (s === 'DRAFT') return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    if (s === 'ONGOING' || s === 'LIVE') return 'bg-emerald-100 text-emerald-700';
    if (s === 'FINISHED') return 'bg-amber-100 text-amber-700';
    if (s === 'CANCELED') return 'bg-red-100 text-red-700';
    if (s === 'SCHEDULED') return 'bg-blue-100 text-blue-700';
    return 'bg-primary/10 text-primary';
  }
  getStatusLabel(s: string) {
    if (s === 'DRAFT') return 'DRAFT';
    if (s === 'ONGOING') return 'ONGOING';
    if (s === 'FINISHED') return 'FINISHED';
    if (s === 'CANCELED') return 'CANCELED';
    if (s === 'LIVE') return 'LIVE';
    if (s === 'SCHEDULED') return 'SCHEDULED';
    return s;
  }
}
