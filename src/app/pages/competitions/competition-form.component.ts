import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Trophy, MapPin, Calendar, CheckSquare, List, Play, AlignLeft, AlertCircle, ArrowLeft, Save, Loader2 } from 'lucide-angular';
import { CompetitionService, CompetitionRequest, CompetitionResponse, CompetitionStatus, CompetitionFormat } from '../../services/competition.service';

@Component({
  selector: 'app-competition-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  template: `
    <div class="p-6 md:p-10 max-w-4xl mx-auto min-h-screen">
      <!-- Header -->
      <div class="mb-8">
        <button (click)="goBack()" class="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors mb-6">
          <lucide-icon [name]="ArrowLeftIcon" [size]="18"></lucide-icon> Annuler
        </button>
        <h1 class="text-3xl font-black">{{ isEditMode ? 'Modifier la Compétition' : 'Créer une Compétition' }}</h1>
        <p class="text-muted-foreground mt-2">
          {{ isEditMode ? 'Mettez à jour les informations de cet événément (limité si lancé).' : 'Configurez les paramètres de votre nouveau tournoi.' }}
        </p>
      </div>

      <!-- Main Form -->
      <div class="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm relative">
        <div *ngIf="loading" class="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 rounded-3xl flex items-center justify-center">
           <div class="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>

        <form (ngSubmit)="onSubmit()" #compForm="ngForm" class="space-y-8">
          
          <!-- Basic Info -->
          <div class="space-y-4">
            <h3 class="text-lg font-bold flex items-center gap-2 mb-4 border-b border-border pb-2">
              <lucide-icon [name]="TrophyIcon" [size]="20" class="text-primary"></lucide-icon> Informations Générales
            </h3>

            <div>
              <label class="block text-sm font-bold text-muted-foreground mb-1.5">Nom de l'événement <span class="text-destructive">*</span></label>
              <input 
                type="text" 
                name="name" 
                [(ngModel)]="formData.name" 
                required 
                minlength="3" 
                maxlength="100" 
                placeholder="Ex: StreetLeague Paris 2026..." 
                class="w-full h-12 px-4 bg-background border border-border rounded-xl focus:outline-none focus:border-primary font-medium"
                #nameCtrl="ngModel"
                [disabled]="isReadOnly">
              
              <div *ngIf="nameCtrl.invalid && (nameCtrl.dirty || nameCtrl.touched)" class="text-destructive text-sm font-medium mt-1 flex items-center gap-1">
                <lucide-icon [name]="AlertCircleIcon" [size]="14"></lucide-icon> Le nom doit contenir entre 3 et 100 caractères.
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label class="block text-sm font-bold text-muted-foreground mb-1.5">Format <span class="text-destructive">*</span></label>
                <select 
                  name="format" 
                  [(ngModel)]="formData.format" 
                  required 
                  class="w-full h-12 px-4 bg-background border border-border rounded-xl focus:outline-none focus:border-primary font-medium"
                  [disabled]="isReadOnly">
                  <option value="LEAGUE">Ligue (Championnat)</option>
                  <option value="KNOCKOUT">Élimination Directe (Coupe)</option>
                </select>
              </div>
              
              <div *ngIf="isEditMode">
                <label class="block text-sm font-bold text-muted-foreground mb-1.5">Statut actuel</label>
                <select 
                  name="status" 
                  [(ngModel)]="formData.status" 
                  class="w-full h-12 px-4 bg-muted border border-border rounded-xl font-medium cursor-not-allowed"
                  disabled>
                  <option value="DRAFT">BROUILLON</option>
                  <option value="ONGOING">EN COURS</option>
                  <option value="FINISHED">TERMINÉ</option>
                  <option value="CANCELED">ANNULÉ</option>
                </select>
              </div>
            </div>
            
            <div class="mt-4">
              <label class="block text-sm font-bold text-muted-foreground mb-1.5">Localisation <span class="text-destructive">*</span></label>
              <div class="relative">
                <lucide-icon [name]="MapPinIcon" [size]="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
                <input 
                  type="text" 
                  name="location" 
                  [(ngModel)]="formData.location" 
                  required 
                  maxlength="255"
                  placeholder="Ex: Stade de France, Paris" 
                  class="w-full h-12 pl-12 pr-4 bg-background border border-border rounded-xl focus:outline-none focus:border-primary font-medium"
                  #locationCtrl="ngModel"
                  [disabled]="isReadOnly">
              </div>
            </div>
          </div>

          <!-- Dates -->
          <div class="space-y-4 pt-4">
            <h3 class="text-lg font-bold flex items-center gap-2 mb-4 border-b border-border pb-2">
              <lucide-icon [name]="CalendarIcon" [size]="20" class="text-primary"></lucide-icon> Calendrier
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-muted-foreground mb-1.5">Date de début <span class="text-destructive">*</span></label>
                <input 
                  type="date" 
                  name="startDate" 
                  [(ngModel)]="formData.startDate" 
                  (change)="validateDates()"
                  required 
                  class="w-full h-12 px-4 bg-background border border-border rounded-xl focus:outline-none focus:border-primary font-medium"
                  [disabled]="isReadOnly">
              </div>
              <div>
                <label class="block text-sm font-bold text-muted-foreground mb-1.5">Date de fin <span class="text-destructive">*</span></label>
                <input 
                  type="date" 
                  name="endDate" 
                  [(ngModel)]="formData.endDate" 
                  (change)="validateDates()"
                  required 
                  class="w-full h-12 px-4 bg-background border border-border rounded-xl focus:outline-none focus:border-primary font-medium"
                  [disabled]="isReadOnly">
              </div>
            </div>
            <div *ngIf="dateError" class="text-destructive text-sm font-medium flex items-center gap-1 bg-destructive/10 p-3 rounded-lg border border-destructive/20">
               <lucide-icon [name]="AlertCircleIcon" [size]="16"></lucide-icon> {{ dateError }}
            </div>
          </div>

          <!-- Text Contents -->
          <div class="space-y-4 pt-4">
            <h3 class="text-lg font-bold flex items-center gap-2 mb-4 border-b border-border pb-2">
              <lucide-icon [name]="AlignLeftIcon" [size]="20" class="text-primary"></lucide-icon> Détails & Règlement
            </h3>

            <div>
              <div class="flex justify-between items-end mb-1.5">
                <label class="block text-sm font-bold text-muted-foreground">Description</label>
                <span class="text-xs text-muted-foreground font-medium">{{ formData.description.length || 0 }} / 2000</span>
              </div>
              <textarea 
                name="description" 
                [(ngModel)]="formData.description" 
                maxlength="2000"
                rows="4" 
                placeholder="Présentez la compétition au public..."
                class="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary font-medium resize-y"
                [disabled]="isReadOnly"></textarea>
            </div>

            <div>
              <div class="flex justify-between items-end mb-1.5 mt-4">
                <label class="block text-sm font-bold text-muted-foreground">Règles</label>
                <span class="text-xs text-muted-foreground font-medium">{{ formData.rules.length || 0 }} / 4000</span>
              </div>
              <textarea 
                name="rules" 
                [(ngModel)]="formData.rules" 
                maxlength="4000"
                rows="6" 
                placeholder="Listez les règles spécifiques, barèmes, restrictions..."
                class="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary font-medium font-mono text-sm resize-y"
                [disabled]="isReadOnly"></textarea>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-6 border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-end">
            <!-- Form Error Indicator -->
            <div *ngIf="apiError" class="text-destructive font-bold text-sm grow flex items-center gap-2">
               <lucide-icon [name]="AlertCircleIcon" [size]="18"></lucide-icon> {{ apiError }}
            </div>

            <button type="button" (click)="goBack()" class="w-full sm:w-auto px-6 py-3 font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors">
              Annuler
            </button>
            <button 
              type="submit" 
              [disabled]="compForm.invalid || !!dateError || submitting || isReadOnly" 
              class="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm shadow-primary/20 hover:-translate-y-0.5">
              <lucide-icon *ngIf="!submitting" [name]="SaveIcon" [size]="18"></lucide-icon>
              <lucide-icon *ngIf="submitting" [name]="Loader2Icon" [size]="18" class="animate-spin"></lucide-icon>
              {{ submitting ? 'Enregistrement...' : (isEditMode ? 'Enregistrer les modifications' : 'Créer la compétition') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CompetitionFormComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly TrophyIcon = Trophy;
  readonly CalendarIcon = Calendar;
  readonly MapPinIcon = MapPin;
  readonly AlignLeftIcon = AlignLeft;
  readonly AlertCircleIcon = AlertCircle;
  readonly SaveIcon = Save;
  readonly Loader2Icon = Loader2;

  compId: number | null = null;
  isEditMode = false;
  loading = false;
  submitting = false;

  formData: CompetitionRequest = {
    name: '',
    description: '',
    rules: '',
    format: CompetitionFormat.LEAGUE,
    startDate: '',
    endDate: '',
    location: ''
  };

  currentStatus: CompetitionStatus = CompetitionStatus.DRAFT;

  dateError: string | null = null;
  apiError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private competitionService: CompetitionService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.compId = +id;
        this.isEditMode = true;
        this.loadCompetitionData();
      }
    });
  }

  // Derived property determining if form should be locked.
  get isReadOnly(): boolean {
    return this.isEditMode && this.currentStatus !== CompetitionStatus.DRAFT;
  }

  loadCompetitionData() {
    this.loading = true;
    this.competitionService.getCompetitionById(this.compId!).subscribe({
      next: (comp) => {
        this.currentStatus = comp.status;
        this.formData = {
          name: comp.name,
          description: comp.description,
          rules: comp.rules,
          format: comp.format,
          status: comp.status,
          startDate: comp.startDate.substring(0, 10), // Assuming API might send full ISO time, slice to YYYY-MM-DD
          endDate: comp.endDate.substring(0, 10),
          location: comp.location,
          organizerId: comp.organizerId
        };
        this.loading = false;
        
        if (this.isReadOnly) {
            this.apiError = "Information : Seules les compétitions au statut 'BROUILLON' sont entièrement éditables.";
        }
      },
      error: (err) => {
        console.error(err);
        this.apiError = "Impossible de charger les données de la compétition.";
        this.loading = false;
      }
    });
  }

  validateDates() {
    this.dateError = null;
    if (!this.formData.startDate || !this.formData.endDate) return;

    const start = new Date(this.formData.startDate);
    const end = new Date(this.formData.endDate);
    const today = new Date();
    today.setHours(0,0,0,0);

    // Only validate past dates if we are creating a newly launched competition
    // If it's an edit, the start date might legitimately be in the past. We only enforce this on creation.
    if (!this.isEditMode && start < today) {
       this.dateError = "La date de début ne peut pas être dans le passé.";
       return;
    }

    if (end <= start) {
       this.dateError = "La date de fin doit être postérieure à la date de début.";
    }
  }

  onSubmit() {
    this.validateDates();
    if (this.dateError || this.isReadOnly) return;

    this.submitting = true;
    this.apiError = null;

    if (this.isEditMode) {
      this.competitionService.updateCompetition(this.compId!, this.formData).subscribe({
        next: () => {
          this.router.navigate(['/app/competitions', this.compId]);
        },
        error: (err) => {
          this.handleApiError(err);
          this.submitting = false;
        }
      });
    } else {
      this.formData.status = CompetitionStatus.DRAFT; // Default fallback
      this.competitionService.createCompetition(this.formData).subscribe({
        next: (res) => {
          this.router.navigate(['/app/competitions', res.id]);
        },
        error: (err) => {
          this.handleApiError(err);
          this.submitting = false;
        }
      });
    }
  }

  handleApiError(err: any) {
     if (err.status === 400) {
        this.apiError = "Les données saisies sont invalides. Vérifiez la structure.";
     } else if (err.status === 403) {
        this.apiError = "Vous n'êtes pas autorisé à créer ou modifier une compétition.";
     } else if (err.error && typeof err.error === 'string') {
        this.apiError = err.error;
     } else {
        this.apiError = "Une erreur technique s'est produite lors de l'enregistrement.";
     }
  }

  goBack() {
    // Navigate back to details if editing, or list if creating
    if (this.isEditMode && this.compId) {
       this.router.navigate(['/app/competitions', this.compId]);
    } else {
       this.router.navigate(['/app/competitions']);
    }
  }
}
