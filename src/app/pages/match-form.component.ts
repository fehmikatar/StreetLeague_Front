import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Trophy, MapPin, Calendar, Users, Trophy as TrophyIcon, Shield, ArrowLeft, Loader2 } from 'lucide-angular';

import { MatchService, MatchRequest, MatchResponse, MatchStatus } from '../services/match.service';
import { TeamService } from '../services/team.service';
import { CompetitionService, CompetitionResponse, CompetitionStatus } from '../services/competition.service';

@Component({
  selector: 'app-match-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background p-4 md:p-6">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center gap-4 mb-8">
          <a routerLink="/app/matches" class="p-2 bg-card border border-border rounded-xl hover:bg-muted transition-all text-muted-foreground hover:text-foreground">
            <lucide-icon [name]="ArrowLeftIcon" [size]="20"></lucide-icon>
          </a>
          <div>
            <h1 class="text-3xl font-black">Schedule a Match</h1>
            <p class="text-muted-foreground">Create a new competition match</p>
          </div>
        </div>

        <form [formGroup]="matchForm" (ngSubmit)="onSubmit()" class="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm space-y-6">
          
          <div *ngIf="errorMsg" class="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 font-medium">
            {{ errorMsg }}
          </div>

          <!-- Competition -->
          <div class="space-y-2">
            <label class="text-sm font-bold text-muted-foreground flex items-center gap-2">
              <lucide-icon [name]="TrophyIcon" [size]="16"></lucide-icon> Competition
            </label>
            <select formControlName="competitionId" class="w-full h-12 px-4 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium">
              <option value="" disabled selected>Select a competition</option>
              <option *ngFor="let comp of competitions" [value]="comp.id">
                {{ comp.name }}
              </option>
            </select>
            <p *ngIf="isTouchedAndInvalid('competitionId')" class="text-destructive text-sm font-medium mt-1">Competition is required.</p>
          </div>

          <!-- Teams Setup -->
          <div class="grid md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-bold text-muted-foreground flex items-center gap-2">
                <lucide-icon [name]="ShieldIcon" [size]="16"></lucide-icon> Home Team
              </label>
              <select formControlName="homeTeamId" class="w-full h-12 px-4 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium">
                <option value="" disabled selected>Home team</option>
                <option *ngFor="let team of teams" [value]="team.id">{{ team.name }}</option>
              </select>
              <p *ngIf="isTouchedAndInvalid('homeTeamId')" class="text-destructive text-sm font-medium mt-1">Field required.</p>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-bold text-muted-foreground flex items-center gap-2">
                <lucide-icon [name]="ShieldIcon" [size]="16"></lucide-icon> Away Team
              </label>
              <select formControlName="awayTeamId" class="w-full h-12 px-4 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium">
                <option value="" disabled selected>Away team</option>
                <option *ngFor="let team of teams" [value]="team.id">{{ team.name }}</option>
              </select>
              <p *ngIf="isTouchedAndInvalid('awayTeamId')" class="text-destructive text-sm font-medium mt-1">Field required.</p>
            </div>
          </div>
          
          <p *ngIf="matchForm.errors?.['sameTeam'] && matchForm.get('awayTeamId')?.touched" class="text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20">
            A team cannot play against itself.
          </p>

          <!-- Date & Time -->
          <div class="space-y-2">
            <label class="text-sm font-bold text-muted-foreground flex items-center gap-2">
              <lucide-icon [name]="CalendarIcon" [size]="16"></lucide-icon> Date and Time
            </label>
            <input type="datetime-local" formControlName="scheduledAt" class="w-full h-12 px-4 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium">
            <p *ngIf="isTouchedAndInvalid('scheduledAt')" class="text-destructive text-sm font-medium mt-1">Valid future date required.</p>
          </div>

          <!-- Venue & Status -->
          <div class="grid md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-bold text-muted-foreground flex items-center gap-2">
                <lucide-icon [name]="MapPinIcon" [size]="16"></lucide-icon> Venue (Stadium/Field)
              </label>
              <input type="text" formControlName="venue" placeholder="Ex: Municipal Stadium" class="w-full h-12 px-4 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium">
              <p *ngIf="isTouchedAndInvalid('venue')" class="text-destructive text-sm font-medium mt-1">Venue is required.</p>
            </div>

             <div class="space-y-2">
              <label class="text-sm font-bold text-muted-foreground flex items-center gap-2">
                Initial Status
              </label>
              <select formControlName="status" class="w-full h-12 px-4 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium">
                <option value="SCHEDULED">Scheduled</option>
                <option value="LIVE">Live</option>
              </select>
            </div>
          </div>

          <div class="pt-6 border-t border-border flex justify-end gap-3">
            <button type="button" routerLink="/app/matches" class="px-6 py-3 rounded-xl font-bold bg-muted text-muted-foreground hover:bg-muted/80 transition-all">
              Cancel
            </button>
            <button type="submit" [disabled]="loading || matchForm.invalid" class="px-8 py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20">
              <lucide-icon *ngIf="loading" [name]="Loader2Icon" [size]="18" class="animate-spin"></lucide-icon>
              {{ loading ? 'Saving...' : 'Create Match' }}
            </button>
          </div>

        </form>
      </div>
    </div>
  `
})
export class MatchFormComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly TrophyIcon = TrophyIcon;
  readonly ShieldIcon = Shield;
  readonly MapPinIcon = MapPin;
  readonly CalendarIcon = Calendar;
  readonly Loader2Icon = Loader2;

  matchForm: FormGroup;
  loading = false;
  errorMsg = '';

  competitions: CompetitionResponse[] = [];
  teams: any[] = []; 

  constructor(
    private fb: FormBuilder,
    private matchService: MatchService,
    private competitionService: CompetitionService,
    private teamService: TeamService,
    private router: Router
  ) {
    this.matchForm = this.fb.group({
      competitionId: ['', Validators.required],
      homeTeamId: ['', Validators.required],
      awayTeamId: ['', Validators.required],
      scheduledAt: ['', [Validators.required, this.futureDateValidator]],
      venue: ['', Validators.required],
      status: [MatchStatus.SCHEDULED, Validators.required]
    }, { validators: this.differentTeamsValidator });
  }

  ngOnInit() {
    this.loadDependentData();
  }

  loadDependentData() {
    this.competitionService.getCompetitions().subscribe({
      next: (comps) => {
        this.competitions = comps.filter(c => c.status !== CompetitionStatus.CANCELED && c.status !== CompetitionStatus.FINISHED);
      },
      error: () => { this.errorMsg = 'Unable to load competitions.'; }
    });

    this.teamService.getAll().subscribe({
      next: (teams) => { this.teams = teams; },
      error: () => { this.errorMsg = 'Unable to load teams.'; }
    });
  }

  isTouchedAndInvalid(field: string): boolean {
    const control = this.matchForm.get(field);
    return !!(control && control.touched && control.invalid);
  }

  futureDateValidator(control: AbstractControl) {
    if (!control.value) return null;
    const selected = new Date(control.value).getTime();
    const now = Date.now();
    return selected > now ? null : { pastDate: true };
  }

  differentTeamsValidator(group: AbstractControl) {
    const home = group.get('homeTeamId')?.value;
    const away = group.get('awayTeamId')?.value;
    if (home && away && home === away) {
      return { sameTeam: true };
    }
    return null;
  }

  onSubmit() {
    if (this.matchForm.invalid) {
      this.matchForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const formValue = this.matchForm.value;
    const request: MatchRequest = {
      competitionId: +formValue.competitionId,
      homeTeamId: +formValue.homeTeamId,
      awayTeamId: +formValue.awayTeamId,
      scheduledAt: new Date(formValue.scheduledAt).toISOString(),
      venue: formValue.venue,
      status: formValue.status as MatchStatus
    };

    this.matchService.createMatch(request).subscribe({
      next: (res) => {
        this.loading = false;
        const enriched = this.enrichMatchWithTeamNames(res, request.homeTeamId, request.awayTeamId);
        this.saveCreatedMatch(enriched);
        this.router.navigate(['/app/matches']);
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.errorMsg = err.error?.message || 'An error occurred during creation.';
      }
    });
  }

  private enrichMatchWithTeamNames(match: MatchResponse, homeTeamId: number, awayTeamId: number): MatchResponse {
    const homeTeam = this.teams.find(team => String(team.id) === String(homeTeamId));
    const awayTeam = this.teams.find(team => String(team.id) === String(awayTeamId));

    return {
      ...match,
      homeTeamName: homeTeam?.name || match.homeTeamName || `Team ${homeTeamId}`,
      awayTeamName: awayTeam?.name || match.awayTeamName || `Team ${awayTeamId}`
    };
  }

  private saveCreatedMatch(match: MatchResponse) {
    try {
      const raw = localStorage.getItem('local_matches');
      const stored: MatchResponse[] = raw ? JSON.parse(raw) : [];
      const exists = stored.some(m => m.id === match.id);
      if (!exists) {
        stored.push(match);
        localStorage.setItem('local_matches', JSON.stringify(stored));
      }
    } catch (error) {
      console.error('Impossible de stocker le match localement', error);
    }
  }
}
