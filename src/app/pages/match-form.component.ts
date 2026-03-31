import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Trophy, MapPin, Calendar, Users, Trophy as TrophyIcon, Shield, ArrowLeft, Loader2 } from 'lucide-angular';

import { MatchService, MatchRequest, MatchStatus } from '../services/match.service';
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
            <h1 class="text-3xl font-black">Planifier un Match</h1>
            <p class="text-muted-foreground">Créer une nouvelle rencontre de compétition</p>
          </div>
        </div>

        <form [formGroup]="matchForm" (ngSubmit)="onSubmit()" class="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm space-y-6">
          
          <div *ngIf="errorMsg" class="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 font-medium">
            {{ errorMsg }}
          </div>

          <!-- Competition -->
          <div class="space-y-2">
            <label class="text-sm font-bold text-muted-foreground flex items-center gap-2">
              <lucide-icon [name]="TrophyIcon" [size]="16"></lucide-icon> Compétition
            </label>
            <select formControlName="competitionId" class="w-full h-12 px-4 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium">
              <option value="" disabled selected>Sélectionner une compétition</option>
              <option *ngFor="let comp of competitions" [value]="comp.id">
                {{ comp.name }}
              </option>
            </select>
            <p *ngIf="isTouchedAndInvalid('competitionId')" class="text-destructive text-sm font-medium mt-1">La compétition est requise.</p>
          </div>

          <!-- Teams Setup -->
          <div class="grid md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-bold text-muted-foreground flex items-center gap-2">
                <lucide-icon [name]="ShieldIcon" [size]="16"></lucide-icon> Équipe Domicile
              </label>
              <select formControlName="homeTeamId" class="w-full h-12 px-4 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium">
                <option value="" disabled selected>Équipe domicile</option>
                <option *ngFor="let team of teams" [value]="team.id">{{ team.name }}</option>
              </select>
              <p *ngIf="isTouchedAndInvalid('homeTeamId')" class="text-destructive text-sm font-medium mt-1">Champ requis.</p>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-bold text-muted-foreground flex items-center gap-2">
                <lucide-icon [name]="ShieldIcon" [size]="16"></lucide-icon> Équipe Extérieur
              </label>
              <select formControlName="awayTeamId" class="w-full h-12 px-4 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium">
                <option value="" disabled selected>Équipe extérieur</option>
                <option *ngFor="let team of teams" [value]="team.id">{{ team.name }}</option>
              </select>
              <p *ngIf="isTouchedAndInvalid('awayTeamId')" class="text-destructive text-sm font-medium mt-1">Champ requis.</p>
            </div>
          </div>
          
          <p *ngIf="matchForm.errors?.['sameTeam'] && matchForm.get('awayTeamId')?.touched" class="text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20">
            Une équipe ne peut pas jouer contre elle-même.
          </p>

          <!-- Date & Time -->
          <div class="space-y-2">
            <label class="text-sm font-bold text-muted-foreground flex items-center gap-2">
              <lucide-icon [name]="CalendarIcon" [size]="16"></lucide-icon> Date et Heure
            </label>
            <input type="datetime-local" formControlName="scheduledAt" class="w-full h-12 px-4 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium">
            <p *ngIf="isTouchedAndInvalid('scheduledAt')" class="text-destructive text-sm font-medium mt-1">Date valide et dans le futur requise.</p>
          </div>

          <!-- Venue & Status -->
          <div class="grid md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-bold text-muted-foreground flex items-center gap-2">
                <lucide-icon [name]="MapPinIcon" [size]="16"></lucide-icon> Lieu (Stade/Terrain)
              </label>
              <input type="text" formControlName="venue" placeholder="Ex: Stade Municipal" class="w-full h-12 px-4 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium">
              <p *ngIf="isTouchedAndInvalid('venue')" class="text-destructive text-sm font-medium mt-1">Le lieu est requis.</p>
            </div>

             <div class="space-y-2">
              <label class="text-sm font-bold text-muted-foreground flex items-center gap-2">
                État initial
              </label>
              <select formControlName="status" class="w-full h-12 px-4 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium">
                <option value="SCHEDULED">Planifié (SCHEDULED)</option>
                <option value="LIVE">En direct (LIVE)</option>
              </select>
            </div>
          </div>

          <div class="pt-6 border-t border-border flex justify-end gap-3">
            <button type="button" routerLink="/app/matches" class="px-6 py-3 rounded-xl font-bold bg-muted text-muted-foreground hover:bg-muted/80 transition-all">
              Annuler
            </button>
            <button type="submit" [disabled]="loading || matchForm.invalid" class="px-8 py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20">
              <lucide-icon *ngIf="loading" [name]="Loader2Icon" [size]="18" class="animate-spin"></lucide-icon>
              {{ loading ? 'Enregistrement...' : 'Créer le match' }}
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
      error: () => { this.errorMsg = 'Impossible de charger les compétitions.'; }
    });

    this.teamService.getAll().subscribe({
      next: (teams) => { this.teams = teams; },
      error: () => { this.errorMsg = 'Impossible de charger les équipes.'; }
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
        this.router.navigate(['/app/matches', res.id]);
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.errorMsg = err.error?.message || 'Une erreur est survenue lors de la création.';
      }
    });
  }
}
