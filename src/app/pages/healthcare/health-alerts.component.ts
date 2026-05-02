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
import { NotificationService } from '../../services/notification.service';

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
                Health Dashboard
              </a>
              <div>
                <h1 class="text-3xl font-bold text-foreground">🔔 Health Alerts</h1>
                <p class="text-muted-foreground mt-1">Automatic notifications for your follow-up</p>
              </div>
            </div>
            <div class="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl">
              <lucide-icon [name]="heartIcon" [size]="20" class="text-primary"></lucide-icon>
              <span class="text-primary font-medium">Personalized follow-up</span>
            </div>
          </div>
        </div>

        <!-- Cartes compteurs -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-card rounded-xl p-5 border-l-4 border-primary shadow-sm">
            <p class="text-muted-foreground text-sm">Total alerts</p>
            <p class="text-3xl font-bold text-primary mt-1">{{ alerts.length }}</p>
          </div>
          <div class="bg-card rounded-xl p-5 border-l-4 border-destructive shadow-sm">
            <p class="text-muted-foreground text-sm">Critical</p>
            <p class="text-3xl font-bold text-destructive mt-1">{{ criticalCount }}</p>
          </div>
          <div class="bg-card rounded-xl p-5 border-l-4 border-accent shadow-sm">
            <p class="text-muted-foreground text-sm">To Watch</p>
            <p class="text-3xl font-bold text-accent mt-1">{{ warningCount }}</p>
          </div>
          <div class="bg-card rounded-xl p-5 border-l-4 border-secondary shadow-sm">
            <p class="text-muted-foreground text-sm">Information</p>
            <p class="text-3xl font-bold text-secondary mt-1">{{ infoCount }}</p>
          </div>
        </div>

        <!-- Filtres -->
        <div class="flex flex-wrap gap-2">
          <button (click)="filter = 'all'" class="px-4 py-2 rounded-full text-sm font-medium transition-colors" [class.bg-primary]="filter==='all'" [class.text-primary-foreground]="filter==='all'" [class.bg-muted]="filter!=='all'" [class.text-foreground]="filter!=='all'">All</button>
          <button (click)="filter = 'danger'" class="px-4 py-2 rounded-full text-sm font-medium transition-colors" [class.bg-destructive]="filter==='danger'" [class.text-destructive-foreground]="filter==='danger'" [class.bg-muted]="filter!=='danger'" [class.text-foreground]="filter!=='danger'">Critical</button>
          <button (click)="filter = 'warning'" class="px-4 py-2 rounded-full text-sm font-medium transition-colors" [class.bg-accent]="filter==='warning'" [class.text-accent-foreground]="filter==='warning'" [class.bg-muted]="filter!=='warning'" [class.text-foreground]="filter!=='warning'">To Watch</button>
          <button (click)="filter = 'info'" class="px-4 py-2 rounded-full text-sm font-medium transition-colors" [class.bg-secondary]="filter==='info'" [class.text-secondary-foreground]="filter==='info'" [class.bg-muted]="filter!=='info'" [class.text-foreground]="filter!=='info'">Information</button>
        </div>

        <!-- Loading...erreur -->
        <div *ngIf="isLoading" class="flex flex-col items-center py-12">
          <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p class="mt-4 text-muted-foreground">Loading alerts...</p>
        </div>
        <div *ngIf="errorMessage" class="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-destructive text-sm">
          {{ errorMessage }}
          <button (click)="loadAlerts()" class="underline ml-2">Retry</button>
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
                <span>📊 Plan calories: {{ alert.dietData.planCalories }} kcal/day</span><br>
                <span>🎯 Recommended needs: {{ alert.dietData.recommendedCalories }} kcal/day</span><br>
                <span *ngIf="alert.dietData.difference !== 0">📉 Difference: {{ alert.dietData.difference > 0 ? '+' : '' }}{{ alert.dietData.difference }} kcal</span>
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
            <p class="text-muted-foreground">No alerts at the moment. Everything is fine!</p>
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
  public isAdmin = false;

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
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) { }

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

    const role = localStorage.getItem('user_type');
    this.isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN' || role === 'ROLE_FIELD_OWNER' || role === 'FIELD_OWNER';
    const userId = this.getCurrentUserId();

    if (!userId && !this.isAdmin) {
      this.errorMessage = 'User not identified. Please log in again.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    try {
      let appointments: AppointmentResponse[] = [];
      let medicalRecords: MedicalRecordResponse[] = [];
      let dietPlans: DietPlanResponse[] = [];
      let notifications: any[] = [];
      const alerts: HealthAlert[] = [];

      // Charger les notifications systèmes pour cet utilisateur
      try {
        notifications = await firstValueFrom(this.notificationService.getByUserId(userId!));
        notifications.forEach(n => {
          if (n.type === 'HEALTH_ALERT') {
            alerts.push({
              id: 'notif-' + n.id,
              type: 'danger',
              title: n.title,
              message: n.message,
              time: n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Recently',
              dismissible: true
            });
          }
        });
      } catch (err) {
        console.error('Erreur chargement notifications:', err);
      }

      if (this.isAdmin) {
        appointments = await firstValueFrom(this.appointmentService.getAll()).catch(() => []);
        medicalRecords = await firstValueFrom(this.medicalRecordService.getAll()).catch(() => []);
        dietPlans = await firstValueFrom(this.dietPlanService.getAll()).catch(() => []);
        
        const now = new Date();
        const pending = appointments.filter(a => a.status === 'PENDING' && new Date(a.appointmentDate) > now);
        const missed = appointments.filter(a => new Date(a.appointmentDate) < now && a.status !== 'CANCELLED' && a.status !== 'COMPLETED');
        if (pending.length) alerts.push({ id: 'global-apt-pending', type: 'warning', title: 'Global appointments to confirm', message: `${pending.length} appointments pending in the system.`, time: 'To process', dismissible: true });
        if (missed.length) alerts.push({ id: 'global-apt-missed', type: 'danger', title: 'Global appointments missed', message: `${missed.length} appointments not honored in the system.`, time: 'Past', dismissible: false });

        const notStarted = medicalRecords.filter(r => r.recoveryStatus === 'NOT_STARTED');
        if (notStarted.length) alerts.push({ id: 'global-rec-notstarted', type: 'warning', title: 'Global injuries not managed', message: `${notStarted.length} record(s) without recovery start.`, time: 'Urgent', dismissible: false });
        
        const expiredPlans = dietPlans.filter(p => p.endDate && new Date(p.endDate) < new Date() && p.isActive);
        if (expiredPlans.length) alerts.push({ id: 'global-diet-expired', type: 'warning', title: 'Global diet plans expired', message: `${expiredPlans.length} plan(s) reached their end date.`, time: 'To renew', dismissible: true });

        if (alerts.length === 0) {
          alerts.push({ id: 'global-ok', type: 'info', title: 'Healthy system', message: 'No critical alerts in the system.', time: 'Now', dismissible: true });
        }
      } else {
        let healthProfile: HealthProfileResponse | null = null;
        try {
          healthProfile = await firstValueFrom(this.healthProfileService.getByUserId(userId!));
        } catch { }

        appointments = await firstValueFrom(this.appointmentService.getByUserId(userId!)).catch(() => []);

        if (healthProfile) {
          medicalRecords = await firstValueFrom(this.medicalRecordService.getByHealthProfileId(healthProfile.id)).catch(() => []);
          dietPlans = await firstValueFrom(this.dietPlanService.getByHealthProfileId(healthProfile.id)).catch(() => []);
        }

        if (healthProfile?.bmi) {
          const bmi = healthProfile.bmi;
          if (bmi >= 30) {
            alerts.push({ id: 'bmi-obese', type: 'danger', title: 'Severe Obesity', message: `BMI = ${bmi.toFixed(1)}. High cardiovascular risks.`, time: 'Last update', dismissible: false });
          } else if (bmi >= 25) {
            alerts.push({ id: 'bmi-overweight', type: 'warning', title: 'Overweight Detected', message: `BMI = ${bmi.toFixed(1)}. Physical activity and balanced diet recommended.`, time: 'Last update', dismissible: true });
          } else if (bmi < 18.5) {
            alerts.push({ id: 'bmi-underweight', type: 'warning', title: 'Underweight', message: `BMI = ${bmi.toFixed(1)}. Nutritional follow-up recommended.`, time: 'Last update', dismissible: true });
          }
        }

        const now = new Date();
        const pending = appointments.filter(a => a.status === 'PENDING' && new Date(a.appointmentDate) > now);
        const missed = appointments.filter(a => new Date(a.appointmentDate) < now && a.status !== 'CANCELLED' && a.status !== 'COMPLETED');
        const upcoming = appointments.filter(a => new Date(a.appointmentDate) > now && a.status !== 'CANCELLED');
        if (pending.length) alerts.push({ id: 'appointments-pending', type: 'warning', title: 'Appointments to confirm', message: `${pending.length} appointments pending confirmation.`, time: 'To process', dismissible: true });
        if (missed.length) alerts.push({ id: 'appointments-missed', type: 'danger', title: 'Missed appointments', message: `${missed.length} appointments not honored.`, time: 'Past', dismissible: false });
        if (upcoming.length && !pending.length && !missed.length) alerts.push({ id: 'appointments-upcoming', type: 'info', title: 'Next appointments', message: `${upcoming.length} appointments scheduled.`, time: 'Upcoming', dismissible: true });

        const notStarted = medicalRecords.filter(r => r.recoveryStatus === 'NOT_STARTED');
        const inProgress = medicalRecords.filter(r => r.recoveryStatus === 'IN_PROGRESS');
        if (notStarted.length) alerts.push({ id: 'recovery-notstarted', type: 'warning', title: 'Injury not managed', message: `${notStarted.length} record(s) without recovery start.`, time: 'Urgent', dismissible: false });
        if (inProgress.length) alerts.push({ id: 'recovery-inprogress', type: 'info', title: 'Recovery in progress', message: `${inProgress.length} injury(ies) in treatment.`, time: 'Active', dismissible: true });

        if (healthProfile) {
          const needs = this.calculateCaloricNeeds(healthProfile);
          const activePlans = dietPlans.filter(p => p.isActive);
          const expiredPlans = dietPlans.filter(p => p.endDate && new Date(p.endDate) < new Date() && p.isActive);
          if (expiredPlans.length) {
            alerts.push({ id: 'diet-expired', type: 'warning', title: 'Diet plan expired', message: `${expiredPlans.length} plan(s) reached their end date.`, time: 'To renew', dismissible: true });
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
              type = 'info'; title = 'Consistent diet plan (loss)'; message = `Your plan (${planCalories} kcal/day) is adapted to a weight loss goal.`; recommendedCalories = needs.weightLoss; difference = planCalories - needs.weightLoss;
            } else if (diffMain <= tolerance) {
              type = 'info'; title = 'Balanced diet plan'; message = `Your plan (${planCalories} kcal/day) matches your maintenance needs.`; recommendedCalories = needs.maintenance; difference = 0;
            } else if (diffGain <= tolerance) {
              type = 'info'; title = 'Muscle gain diet plan'; message = `Your plan (${planCalories} kcal/day) is adapted to muscle building.`; recommendedCalories = needs.weightGain; difference = planCalories - needs.weightGain;
            } else if (planCalories < needs.weightLoss - 200) {
              type = 'danger'; title = 'Too restrictive diet'; message = `Your plan (${planCalories} kcal/day) is well below your needs (${needs.weightLoss} kcal/day).`; recommendedCalories = needs.weightLoss;
            } else if (planCalories > needs.weightGain + 200) {
              type = 'warning'; title = 'High caloric excess'; message = `Your plan (${planCalories} kcal/day) significantly exceeds your needs (${needs.weightGain} kcal/day).`; recommendedCalories = needs.weightGain;
            } else if (planCalories < needs.maintenance && planCalories > needs.weightLoss) {
              type = 'warning'; title = 'Slight caloric deficit'; message = `Your plan (${planCalories} kcal/day) is slightly below your maintenance.`; recommendedCalories = needs.maintenance;
            } else if (planCalories > needs.maintenance && planCalories < needs.weightGain) {
              type = 'info'; title = 'Slight caloric surplus'; message = `Your plan (${planCalories} kcal/day) is slightly above your maintenance.`; recommendedCalories = needs.maintenance;
            } else {
              type = 'info'; title = 'Check recommended'; message = `Your calories (${planCalories} kcal/day) are not aligned with your goals.`; recommendedCalories = needs.maintenance;
            }
            alerts.push({
              id: 'diet-coherence',
              type: type,
              title: title,
              message: message + ` Check recommended values: ${recommendedCalories} kcal/day.`,
              time: 'Active plan',
              dismissible: true,
              dietData: { planCalories, recommendedCalories, difference }
            });
          } else if (activePlans.length === 0) {
            alerts.push({
              id: 'diet-no-active-plan',
              type: 'warning',
              title: 'No active diet plan',
              message: `You don't have an active plan. Needs: ${needs.maintenance} kcal/day for maintenance.`,
              time: 'Recommended action',
              dismissible: true
            });
          }
        }

        if (alerts.length === 0) {
          alerts.push({ id: 'annual-checkup', type: 'info', title: 'Annual checkup recommended', message: 'Schedule your annual health checkup.', time: 'Reminder', dismissible: true });
        }
      }

      this.alerts = alerts;
    } catch (err) {
      console.error(err);
      this.errorMessage = 'Unable to load alerts. Check your connection.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  public dismissAlert(alert: HealthAlert) {
    this.alerts = this.alerts.filter(a => a.id !== alert.id);
    
    // Si c'est une notification backend, la supprimer ou la marquer comme lue
    if (alert.id.startsWith('notif-')) {
      const notifId = parseInt(alert.id.replace('notif-', ''), 10);
      this.notificationService.delete(notifId).subscribe({
        next: () => console.log('Notification deleted'),
        error: (err) => console.error('Error deleting notification:', err)
      });
    }
    
    this.cdr.detectChanges();
  }
}