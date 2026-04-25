import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Chart from 'chart.js/auto';
import { firstValueFrom } from 'rxjs';
import { AppointmentService, AppointmentResponse } from '../../services/appointment.service';
import { HealthProfileService, HealthProfileResponse } from '../../services/health-profile.service';
import { DietPlanService, DietPlanResponse } from '../../services/diet-plan.service';

@Component({
  selector: 'app-compliance-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <div class="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <a routerLink="/app/healthcare" class="bg-white hover:bg-gray-100 text-green-700 px-4 py-2 rounded-xl shadow-md transition">← Dashboard Santé</a>
          <div><h1 class="text-3xl font-bold text-gray-800">✅ Compliance & Adhésion</h1><p class="text-gray-600">Suivi de vos rendez-vous et plans nutritionnels</p></div>
        </div>
      </div>

      <div *ngIf="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
        <p class="mt-2">Chargement de vos données...</p>
      </div>

      <div *ngIf="!isLoading && appointments.length === 0 && dietPlans.length === 0" class="text-center py-12 bg-yellow-50 rounded-xl">
        <p class="text-gray-600">📭 Aucune donnée de compliance.</p>
        <a routerLink="/app/healthcare/appointments" class="text-green-600 underline">Planifiez un rendez-vous</a>
      </div>

      <div *ngIf="!isLoading && (appointments.length > 0 || dietPlans.length > 0)">
        <!-- Cartes -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
            <p class="text-sm text-gray-500">Taux de présence</p>
            <p class="text-2xl font-bold">{{ attendanceRate }}%</p>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
            <p class="text-sm text-gray-500">Plans actifs</p>
            <p class="text-2xl font-bold">{{ activePlans }}</p>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
            <p class="text-sm text-gray-500">Prochains RDV (7j)</p>
            <p class="text-2xl font-bold">{{ upcomingAppointments }}</p>
          </div>
        </div>

        <!-- Graphiques -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div class="bg-white rounded-xl p-4 shadow-sm">
            <h3 class="font-semibold text-gray-700 mb-2">📊 Compliance rendez-vous</h3>
            <canvas #complianceChart style="max-height: 250px;"></canvas>
            <div *ngIf="!appointments.length" class="text-center py-8 text-gray-400">Aucun rendez-vous</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm">
            <h3 class="font-semibold text-gray-700 mb-2">🥗 Plans alimentaires</h3>
            <canvas #dietChart style="max-height: 250px;"></canvas>
            <div *ngIf="!dietPlans.length" class="text-center py-8 text-gray-400">Aucun plan alimentaire</div>
          </div>
        </div>

        <!-- Bilan -->
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 shadow-sm mt-6">
          <h3 class="font-bold text-gray-800">📋 Bilan d’adhésion</h3>
          <div class="mt-3 space-y-2 text-gray-700 text-sm">
            <p *ngFor="let diag of diagnostics" class="flex items-start gap-2"><span class="text-green-600">•</span> {{ diag }}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ComplianceTrackingComponent implements OnInit, AfterViewInit {
  @ViewChild('complianceChart') complianceCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('dietChart') dietCanvas!: ElementRef<HTMLCanvasElement>;

  appointments: AppointmentResponse[] = [];
  dietPlans: DietPlanResponse[] = [];
  isLoading = true;
  attendanceRate = 0;
  activePlans = 0;
  upcomingAppointments = 0;
  diagnostics: string[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private healthProfileService: HealthProfileService,
    private dietPlanService: DietPlanService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.loadUserData(); }

  ngAfterViewInit() { setTimeout(() => this.renderCharts(), 500); }

  private getCurrentUserId(): number | null {
    const id = localStorage.getItem('user_id');
    return id ? parseInt(id, 10) : null;
  }

  private async loadUserData() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    try {
      this.appointments = await firstValueFrom(this.appointmentService.getByUserId(userId)).catch(() => []);
      const healthProfile = await firstValueFrom(this.healthProfileService.getByUserId(userId)).catch(() => null);
      if (healthProfile) {
        this.dietPlans = await firstValueFrom(this.dietPlanService.getByHealthProfileId(healthProfile.id)).catch(() => []);
      }
      this.computeStats();
      this.generateDiagnostics();
      this.cdr.detectChanges();
      setTimeout(() => this.renderCharts(), 200);
    } catch (err) {
      console.error(err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private computeStats() {
    const total = this.appointments.length;
    if (total) {
      const honored = this.appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length;
      this.attendanceRate = Math.round((honored / total) * 100);
    } else {
      this.attendanceRate = 0;
    }
    this.activePlans = this.dietPlans.filter(p => p.isActive).length;
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    this.upcomingAppointments = this.appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= now && aptDate <= nextWeek && apt.status !== 'CANCELLED';
    }).length;
  }

  private generateDiagnostics() {
    const diag = [];
    if (this.attendanceRate >= 80) diag.push(`🏆 Excellente compliance (${this.attendanceRate}%).`);
    else if (this.attendanceRate >= 50) diag.push(`👍 Compliance moyenne (${this.attendanceRate}%). Améliorez votre régularité.`);
    else if (this.appointments.length > 0) diag.push(`⚠️ Faible compliance (${this.attendanceRate}%). Les rendez-vous sont essentiels.`);
    else diag.push(`📅 Aucun rendez-vous enregistré. Pensez à planifier vos consultations.`);

    if (this.activePlans === 0 && this.dietPlans.length > 0) diag.push(`🥗 Aucun plan alimentaire actif. Activez-en un.`);
    else if (this.activePlans > 0) diag.push(`🍎 ${this.activePlans} plan(s) actif(s) – restez motivé(e) !`);
    else if (this.dietPlans.length === 0) diag.push(`📝 Aucun plan alimentaire. Consultez un nutritionniste.`);

    if (this.upcomingAppointments > 0) diag.push(`📅 ${this.upcomingAppointments} rendez-vous dans les 7 jours. Pensez à confirmer.`);
    else if (this.appointments.length > 0) diag.push(`✅ Aucun rendez-vous imminent.`);
    this.diagnostics = diag;
  }

  private renderCharts() {
    if (this.complianceCanvas?.nativeElement && this.appointments.length) {
      try {
        const honored = this.appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length;
        const missed = this.appointments.length - honored;
        new Chart(this.complianceCanvas.nativeElement, {
          type: 'doughnut',
          data: { labels: ['Honorés', 'Manqués/Annulés'], datasets: [{ data: [honored, missed], backgroundColor: ['#10b981', '#ef4444'] }] },
          options: { responsive: true, maintainAspectRatio: true }
        });
      } catch (e) { console.warn(e); }
    }
    if (this.dietCanvas?.nativeElement && this.dietPlans.length) {
      try {
        const active = this.dietPlans.filter(p => p.isActive).length;
        const inactive = this.dietPlans.length - active;
        new Chart(this.dietCanvas.nativeElement, {
          type: 'pie',
          data: { labels: ['Actifs', 'Inactifs'], datasets: [{ data: [active, inactive], backgroundColor: ['#3b82f6', '#9ca3af'] }] },
          options: { responsive: true, maintainAspectRatio: true }
        });
      } catch (e) { console.warn(e); }
    }
  }
}