// health-alerts.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, AlertTriangle, Info, X, ArrowLeft, Heart, Calendar } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { AppointmentService, AppointmentResponse } from '../../services/appointment.service';
import { HealthProfileService, HealthProfileResponse } from '../../services/health-profile.service';
import { MedicalRecordService, MedicalRecordResponse } from '../../services/medical-record.service';
import { DietPlanService, DietPlanResponse } from '../../services/diet-plan.service';

interface HealthAlert {
  id: string;
  type: 'danger' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  dismissible: boolean;
  dietData?: { planCalories: number; recommendedCalories: number; difference: number };
}

@Component({
  selector: 'app-health-alerts',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background p-6">
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- En-tête -->
        <div class="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div class="flex flex-wrap justify-between items-center gap-4">
            <div class="flex items-center gap-4">
              <a routerLink="/app/healthcare" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors">
                <lucide-icon [name]="arrowLeftIcon" [size]="18"></lucide-icon>
                Dashboard Santé
              </a>
              <div>
                <h1 class="text-3xl font-bold text-foreground">🔔 Alertes santé</h1>
                <p class="text-muted-foreground mt-1">Notifications automatiques pour votre suivi</p>
              </div>
            </div>
            <div class="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl">
              <lucide-icon [name]="heartIcon" [size]="20" class="text-primary"></lucide-icon>
              <span class="text-primary font-medium">Suivi personnalisé</span>
            </div>
          </div>
        </div>

        <!-- Cartes compteurs -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-card rounded-xl p-5 border-l-4 border-primary shadow-sm">
            <p class="text-muted-foreground text-sm">Total alertes</p>
            <p class="text-3xl font-bold text-primary mt-1">{{ alerts.length }}</p>
          </div>
          <div class="bg-card rounded-xl p-5 border-l-4 border-destructive shadow-sm">
            <p class="text-muted-foreground text-sm">Critiques</p>
            <p class="text-3xl font-bold text-destructive mt-1">{{ criticalCount }}</p>
          </div>
          <div class="bg-card rounded-xl p-5 border-l-4 border-accent shadow-sm">
            <p class="text-muted-foreground text-sm">À surveiller</p>
            <p class="text-3xl font-bold text-accent mt-1">{{ warningCount }}</p>
          </div>
          <div class="bg-card rounded-xl p-5 border-l-4 border-secondary shadow-sm">
            <p class="text-muted-foreground text-sm">Informations</p>
            <p class="text-3xl font-bold text-secondary mt-1">{{ infoCount }}</p>
          </div>
        </div>

        <!-- Filtres -->
        <div class="flex flex-wrap gap-2">
          <button (click)="filter = 'all'" class="px-4 py-2 rounded-full text-sm font-medium transition-colors" [class.bg-primary]="filter==='all'" [class.text-primary-foreground]="filter==='all'" [class.bg-muted]="filter!=='all'" [class.text-foreground]="filter!=='all'">Toutes</button>
          <button (click)="filter = 'danger'" class="px-4 py-2 rounded-full text-sm font-medium transition-colors" [class.bg-destructive]="filter==='danger'" [class.text-destructive-foreground]="filter==='danger'" [class.bg-muted]="filter!=='danger'" [class.text-foreground]="filter!=='danger'">Critiques</button>
          <button (click)="filter = 'warning'" class="px-4 py-2 rounded-full text-sm font-medium transition-colors" [class.bg-accent]="filter==='warning'" [class.text-accent-foreground]="filter==='warning'" [class.bg-muted]="filter!=='warning'" [class.text-foreground]="filter!=='warning'">À surveiller</button>
          <button (click)="filter = 'info'" class="px-4 py-2 rounded-full text-sm font-medium transition-colors" [class.bg-secondary]="filter==='info'" [class.text-secondary-foreground]="filter==='info'" [class.bg-muted]="filter!=='info'" [class.text-foreground]="filter!=='info'">Informations</button>
        </div>

        <!-- Chargement / erreur -->
        <div *ngIf="isLoading" class="flex flex-col items-center py-12">
          <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p class="mt-4 text-muted-foreground">Chargement des alertes...</p>
        </div>
        <div *ngIf="errorMessage" class="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-destructive text-sm">
          {{ errorMessage }}
          <button (click)="loadAlerts()" class="underline ml-2">Réessayer</button>
        </div>

        <!-- Liste des alertes -->
        <div *ngIf="!isLoading && !errorMessage" class="space-y-3">
          <div *ngFor="let alert of filteredAlerts" class="bg-card rounded-xl border p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-all"
               [ngClass]="{
                 'border-destructive/30': alert.type === 'danger',
                 'border-accent/30': alert.type === 'warning',
                 'border-primary/30': alert.type === 'info'
               }">
            <div class="p-2 rounded-lg" [ngClass]="{
                 'bg-destructive/10': alert.type === 'danger',
                 'bg-accent/10': alert.type === 'warning',
                 'bg-primary/10': alert.type === 'info'
               }">
              <lucide-icon [name]="alert.type === 'info' ? infoIcon : alertIcon" [size]="20"
                [ngClass]="{
                  'text-destructive': alert.type === 'danger',
                  'text-accent': alert.type === 'warning',
                  'text-primary': alert.type === 'info'
                }">
              </lucide-icon>
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-foreground">{{ alert.title }}</h3>
              <p class="text-sm text-muted-foreground mt-1">{{ alert.message }}</p>
              <div *ngIf="alert.dietData" class="mt-2 text-xs text-muted-foreground">
                <span>📊 Calories du plan : {{ alert.dietData.planCalories }} kcal/jour</span><br>
                <span>🎯 Besoins recommandés : {{ alert.dietData.recommendedCalories }} kcal/jour</span><br>
                <span *ngIf="alert.dietData.difference !== 0">📉 Écart : {{ alert.dietData.difference > 0 ? '+' : '' }}{{ alert.dietData.difference }} kcal</span>
              </div>
              <p class="text-xs text-muted-foreground/70 mt-2 flex items-center gap-1">
                <lucide-icon [name]="calendarIcon" [size]="12"></lucide-icon>
                {{ alert.time }}
              </p>
            </div>
            <div class="flex items-center gap-1">
              <button *ngIf="alert.dismissible" (click)="dismissAlert(alert)" class="p-1.5 rounded-full hover:bg-muted transition" title="Ignorer">
                <lucide-icon [name]="closeIcon" [size]="16" class="text-muted-foreground"></lucide-icon>
              </button>
            </div>
          </div>
          <div *ngIf="filteredAlerts.length === 0" class="text-center py-12 bg-muted/20 rounded-xl">
            <lucide-icon name="check-circle" [size]="40" class="text-primary mx-auto mb-3"></lucide-icon>
            <p class="text-muted-foreground">Aucune alerte pour le moment. Tout va bien !</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `]
})
export class HealthAlertsComponent implements OnInit {
  public alerts: HealthAlert[] = [];
  public isLoading = true;
  public errorMessage = '';
  public filter: 'all' | 'danger' | 'warning' | 'info' = 'all';

  public readonly alertIcon = AlertTriangle;
  public readonly infoIcon = Info;
  public readonly closeIcon = X;
  public readonly arrowLeftIcon = ArrowLeft;
  public readonly heartIcon = Heart;
  public readonly calendarIcon = Calendar;

  constructor(
    private appointmentService: AppointmentService,
    private healthProfileService: HealthProfileService,
    private medicalRecordService: MedicalRecordService,
    private dietPlanService: DietPlanService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAlerts();
  }

  get criticalCount(): number { return this.alerts.filter(a => a.type === 'danger').length; }
  get warningCount(): number { return this.alerts.filter(a => a.type === 'warning').length; }
  get infoCount(): number { return this.alerts.filter(a => a.type === 'info').length; }
  get filteredAlerts(): HealthAlert[] {
    if (this.filter === 'all') return this.alerts;
    return this.alerts.filter(a => a.type === this.filter);
  }

  private getCurrentUserId(): number | null {
    const id = localStorage.getItem('user_id');
    return id ? parseInt(id, 10) : null;
  }

  private calculateCaloricNeeds(profile: HealthProfileResponse): { maintenance: number; weightLoss: number; weightGain: number } {
    const weight = profile.weight;
    const height = profile.height;
    const age = profile.age;
    const gender = (profile as any).gender || 'MALE';
    let bmr = 0;
    if (gender === 'MALE') bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    else bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    const maintenance = Math.round(bmr * 1.55);
    const weightLoss = Math.max(1200, maintenance - 500);
    const weightGain = maintenance + 300;
    return { maintenance, weightLoss, weightGain };
  }

  public async loadAlerts() {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    const userId = this.getCurrentUserId();
    if (!userId) {
      this.errorMessage = 'Utilisateur non identifié. Veuillez vous reconnecter.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    try {
      let healthProfile: HealthProfileResponse | null = null;
      try {
        healthProfile = await firstValueFrom(this.healthProfileService.getByUserId(userId));
      } catch { }

      const appointments = await firstValueFrom(this.appointmentService.getByUserId(userId)).catch(() => []);

      let medicalRecords: MedicalRecordResponse[] = [];
      let dietPlans: DietPlanResponse[] = [];
      if (healthProfile) {
        medicalRecords = await firstValueFrom(this.medicalRecordService.getByHealthProfileId(healthProfile.id)).catch(() => []);
        dietPlans = await firstValueFrom(this.dietPlanService.getByHealthProfileId(healthProfile.id)).catch(() => []);
      }

      const alerts: HealthAlert[] = [];

      // 1. IMC
      if (healthProfile?.bmi) {
        const bmi = healthProfile.bmi;
        if (bmi >= 30) {
          alerts.push({ id: 'bmi-obese', type: 'danger', title: 'Obésité sévère', message: `IMC = ${bmi.toFixed(1)}. Risques cardiovasculaires élevés.`, time: 'Dernière mise à jour', dismissible: false });
        } else if (bmi >= 25) {
          alerts.push({ id: 'bmi-overweight', type: 'warning', title: 'Surpoids détecté', message: `IMC = ${bmi.toFixed(1)}. Activité physique et alimentation équilibrée.`, time: 'Dernière mise à jour', dismissible: true });
        } else if (bmi < 18.5) {
          alerts.push({ id: 'bmi-underweight', type: 'warning', title: 'Insuffisance pondérale', message: `IMC = ${bmi.toFixed(1)}. Suivi nutritionnel recommandé.`, time: 'Dernière mise à jour', dismissible: true });
        }
      }

      // 2. Rendez-vous
      const now = new Date();
      const pending = appointments.filter(a => a.status === 'PENDING' && new Date(a.appointmentDate) > now);
      const missed = appointments.filter(a => new Date(a.appointmentDate) < now && a.status !== 'CANCELLED' && a.status !== 'COMPLETED');
      const upcoming = appointments.filter(a => new Date(a.appointmentDate) > now && a.status !== 'CANCELLED');
      if (pending.length) alerts.push({ id: 'appointments-pending', type: 'warning', title: 'Rendez-vous à confirmer', message: `${pending.length} rendez-vous en attente de confirmation.`, time: 'À traiter', dismissible: true });
      if (missed.length) alerts.push({ id: 'appointments-missed', type: 'danger', title: 'Rendez-vous manqués', message: `${missed.length} rendez-vous non honorés.`, time: 'Passé', dismissible: false });
      if (upcoming.length && !pending.length && !missed.length) alerts.push({ id: 'appointments-upcoming', type: 'info', title: 'Prochains rendez-vous', message: `${upcoming.length} rendez-vous programmés.`, time: 'À venir', dismissible: true });

      // 3. Dossiers médicaux
      const notStarted = medicalRecords.filter(r => r.recoveryStatus === 'NOT_STARTED');
      const inProgress = medicalRecords.filter(r => r.recoveryStatus === 'IN_PROGRESS');
      if (notStarted.length) alerts.push({ id: 'recovery-notstarted', type: 'warning', title: 'Blessure non prise en charge', message: `${notStarted.length} dossier(s) sans début de rétablissement.`, time: 'Urgent', dismissible: false });
      if (inProgress.length) alerts.push({ id: 'recovery-inprogress', type: 'info', title: 'Rétablissement en cours', message: `${inProgress.length} blessure(s) en traitement.`, time: 'Actif', dismissible: true });

      // 4. Plans alimentaires
      if (healthProfile) {
        const needs = this.calculateCaloricNeeds(healthProfile);
        const activePlans = dietPlans.filter(p => p.isActive);
        const expiredPlans = dietPlans.filter(p => p.endDate && new Date(p.endDate) < new Date() && p.isActive);
        if (expiredPlans.length) {
          alerts.push({ id: 'diet-expired', type: 'warning', title: 'Plan alimentaire expiré', message: `${expiredPlans.length} plan(s) arrivés à terme.`, time: 'À renouveler', dismissible: true });
        }
        const targetPlan = activePlans.length > 0 ? activePlans[0] : null;
        if (targetPlan && targetPlan.dailyCalories && targetPlan.dailyCalories > 0) {
          const planCalories = targetPlan.dailyCalories;
          const diffMain = Math.abs(planCalories - needs.maintenance);
          const diffLoss = Math.abs(planCalories - needs.weightLoss);
          const diffGain = Math.abs(planCalories - needs.weightGain);
          const tolerance = 150;
          let type: 'danger' | 'warning' | 'info' = 'info';
          let title = '';
          let message = '';
          let recommendedCalories = needs.maintenance;
          let difference = planCalories - needs.maintenance;

          if (diffLoss <= tolerance) {
            type = 'info'; title = 'Plan alimentaire cohérent (perte)'; message = `Votre plan (${planCalories} kcal/jour) est adapté à un objectif de perte de poids.`; recommendedCalories = needs.weightLoss; difference = planCalories - needs.weightLoss;
          } else if (diffMain <= tolerance) {
            type = 'info'; title = 'Plan alimentaire équilibré'; message = `Votre plan (${planCalories} kcal/jour) correspond à vos besoins de maintien.`; recommendedCalories = needs.maintenance; difference = 0;
          } else if (diffGain <= tolerance) {
            type = 'info'; title = 'Plan alimentaire pour gain musculaire'; message = `Votre plan (${planCalories} kcal/jour) est adapté à une prise de masse.`; recommendedCalories = needs.weightGain; difference = planCalories - needs.weightGain;
          } else if (planCalories < needs.weightLoss - 200) {
            type = 'danger'; title = 'Régime trop restrictif'; message = `Votre plan (${planCalories} kcal/jour) est très en dessous de vos besoins (${needs.weightLoss} kcal/jour).`; recommendedCalories = needs.weightLoss;
          } else if (planCalories > needs.weightGain + 200) {
            type = 'warning'; title = 'Excès calorique important'; message = `Votre plan (${planCalories} kcal/jour) dépasse largement vos besoins (${needs.weightGain} kcal/jour).`; recommendedCalories = needs.weightGain;
          } else if (planCalories < needs.maintenance && planCalories > needs.weightLoss) {
            type = 'warning'; title = 'Léger déficit calorique'; message = `Votre plan (${planCalories} kcal/jour) est légèrement inférieur à votre maintien.`; recommendedCalories = needs.maintenance;
          } else if (planCalories > needs.maintenance && planCalories < needs.weightGain) {
            type = 'info'; title = 'Léger surplus calorique'; message = `Votre plan (${planCalories} kcal/jour) est légèrement supérieur à votre maintien.`; recommendedCalories = needs.maintenance;
          } else {
            type = 'info'; title = 'Vérification conseillée'; message = `Vos calories (${planCalories} kcal/jour) ne sont pas alignées avec vos objectifs.`; recommendedCalories = needs.maintenance;
          }
          alerts.push({
            id: 'diet-coherence',
            type: type,
            title: title,
            message: message + ` Consultez les valeurs recommandées : ${recommendedCalories} kcal/jour.`,
            time: 'Plan actif',
            dismissible: true,
            dietData: { planCalories, recommendedCalories, difference }
          });
        } else if (activePlans.length === 0) {
          alerts.push({
            id: 'diet-no-active-plan',
            type: 'warning',
            title: 'Aucun plan alimentaire actif',
            message: `Vous n'avez pas de plan actif. Besoins : ${needs.maintenance} kcal/jour pour le maintien.`,
            time: 'Action recommandée',
            dismissible: true
          });
        }
      }

      if (alerts.length === 0) {
        alerts.push({ id: 'annual-checkup', type: 'info', title: 'Bilan annuel recommandé', message: 'Planifiez votre bilan de santé annuel.', time: 'Rappel', dismissible: true });
      }

      this.alerts = alerts;
    } catch (err) {
      console.error(err);
      this.errorMessage = 'Impossible de charger les alertes. Vérifiez votre connexion.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  public dismissAlert(alert: HealthAlert) {
    this.alerts = this.alerts.filter(a => a.id !== alert.id);
    this.cdr.detectChanges();
  }
}