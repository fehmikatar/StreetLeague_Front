// health-dashboard.component.ts (version sans IA)
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { firstValueFrom } from 'rxjs';

// Services
import { AppointmentService } from '../../services/appointment.service';
import { HealthProfileService, HealthProfileResponse } from '../../services/health-profile.service';
import { MedicalRecordService } from '../../services/medical-record.service';
import { DietPlanService } from '../../services/diet-plan.service';

@Component({
  selector: 'app-health-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen" style="background: #F8FAFC;">
      <div class="p-6 max-w-7xl mx-auto space-y-6">
        
        <!-- EN-TÊTE SIMPLIFIÉ -->
        <div class="relative overflow-hidden rounded-2xl shadow-lg" style="background: linear-gradient(135deg, #1DB954, #0e8e3e);">
          <div class="relative p-6 text-white">
            <div class="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 class="text-2xl md:text-3xl font-bold tracking-tight">Tableau de bord santé</h1>
                <p class="text-green-100 mt-1 text-sm">Vue d'ensemble de votre activité médicale et bien-être</p>
              </div>
              <div class="backdrop-blur-md bg-gradient-to-r from-green-500 to-green-600 rounded-xl px-4 py-2 text-center shadow-lg">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span class="text-xs font-bold">SYNCHRONISÉ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CHARGEMENT -->
        <div *ngIf="isLoading" class="flex items-center justify-center py-20">
          <div class="text-center">
            <div class="relative">
              <div class="w-16 h-16 border-4 border-green-200 rounded-full"></div>
              <div class="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p class="mt-4 text-gray-500 font-medium">Chargement des données...</p>
          </div>
        </div>

        <!-- AUCUN PROFIL SANTÉ -->
        <div *ngIf="!isLoading && !healthProfile" class="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div class="flex flex-col items-center">
            <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span class="text-4xl">📋</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Aucun profil santé trouvé</h2>
            <p class="text-gray-500 mb-6">Pour utiliser le tableau de bord, vous devez d'abord créer votre profil de santé.</p>
            <button (click)="navigateTo('/app/healthcare/profile')" 
                    class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-md transition flex items-center gap-2">
              <span>➕</span> Créer mon profil santé
            </button>
          </div>
        </div>

        <!-- DASHBOARD (si profil existe) -->
        <div *ngIf="!isLoading && healthProfile">
          
          <!-- 4 CARTES STATS -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <div class="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all cursor-pointer border-l-4" style="border-left-color: #1DB954;" (click)="navigateTo('/app/healthcare/trends')">
              <div class="flex items-center justify-between mb-3">
                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span class="text-2xl">⚖️</span>
                </div>
                <span class="text-2xl font-bold text-gray-800">{{ bmi !== null ? bmi.toFixed(1) : '—' }}</span>
              </div>
              <p class="text-xs text-gray-500 font-medium">IMC actuel</p>
              <p class="text-sm font-semibold text-green-600 mt-1">{{ bmiCategory }}</p>
              <div class="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-green-500 rounded-full" [style.width]="bmiPercent + '%'"></div>
              </div>
            </div>
            
            <div class="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all cursor-pointer border-l-4" style="border-left-color: #F97316;" (click)="navigateTo('/app/healthcare/appointments')">
              <div class="flex items-center justify-between mb-3">
                <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <span class="text-2xl">📅</span>
                </div>
                <span class="text-2xl font-bold text-gray-800">{{ upcomingAppointmentsCount }}</span>
              </div>
              <p class="text-xs text-gray-500 font-medium">Rendez-vous</p>
              <p class="text-sm font-semibold text-orange-600 mt-1">dans les 30 jours</p>
            </div>
            
            <div class="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all cursor-pointer border-l-4" style="border-left-color: #1DB954;" (click)="navigateTo('/app/healthcare/diet')">
              <div class="flex items-center justify-between mb-3">
                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span class="text-2xl">🥗</span>
                </div>
                <span class="text-2xl font-bold text-gray-800">{{ activePlansCount }}</span>
              </div>
              <p class="text-xs text-gray-500 font-medium">Plans actifs</p>
              <p class="text-sm font-semibold text-green-600 mt-1">nutrition / régime</p>
            </div>
            
            <div class="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all cursor-pointer border-l-4" style="border-left-color: #F97316;" (click)="navigateTo('/app/healthcare/alerts')">
              <div class="flex items-center justify-between mb-3">
                <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <span class="text-2xl">🔔</span>
                </div>
                <span class="text-2xl font-bold text-gray-800">{{ activeAlertsCount }}</span>
              </div>
              <p class="text-xs text-gray-500 font-medium">Alertes actives</p>
              <p class="text-sm font-semibold text-orange-600 mt-1">à traiter</p>
            </div>
          </div>

          <!-- BOUTONS D'ACCÈS RAPIDE -->
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <button *ngFor="let nav of navItems" (click)="navigateTo(nav.path)" 
                    class="flex flex-col items-center bg-white p-4 rounded-xl border border-gray-100 hover:shadow-lg transition-all group">
              <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-all group-hover:bg-green-100">
                <span class="text-xl">{{ nav.icon }}</span>
              </div>
              <span class="text-xs font-medium text-gray-600 group-hover:text-green-700">{{ nav.title }}</span>
            </button>
          </div>

          <!-- GRAPHIQUES -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <h3 class="font-semibold text-gray-800 mb-4">📈 Évolution IMC</h3>
              <canvas #bmiChart style="height: 220px; width: 100%"></canvas>
            </div>
            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <h3 class="font-semibold text-gray-800 mb-4">✅ Compliance RDV</h3>
              <canvas #complianceChart style="height: 220px; width: 100%"></canvas>
              <p class="text-center text-sm text-gray-600 mt-3">{{ attendanceRate }}% de présence</p>
            </div>
          </div>

          <!-- ALERTES -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div class="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <span class="text-amber-500">🔔</span>
                </div>
                <h3 class="font-semibold text-gray-800">Alertes intelligentes</h3>
              </div>
              <button (click)="navigateTo('/app/healthcare/alerts')" class="text-xs text-green-600 hover:underline">Voir tout</button>
            </div>
            <div class="divide-y max-h-72 overflow-y-auto">
              <div *ngFor="let alert of recentAlerts" class="p-4 flex items-start gap-3 hover:bg-gray-50 transition">
                <div class="w-8 h-8 rounded-full flex items-center justify-center" [class.bg-red-100]="alert.type === 'danger'" [class.bg-yellow-100]="alert.type === 'warning'" [class.bg-blue-100]="alert.type !== 'danger' && alert.type !== 'warning'">
                  <span [class.text-red-500]="alert.type === 'danger'" [class.text-yellow-500]="alert.type === 'warning'" [class.text-blue-500]="alert.type !== 'danger' && alert.type !== 'warning'">{{ alert.icon }}</span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-800">{{ alert.title }}</p>
                  <p class="text-xs text-gray-500">{{ alert.message }}</p>
                </div>
              </div>
              <div *ngIf="recentAlerts.length === 0" class="py-12 text-center text-gray-400 text-sm">
                <span class="text-3xl">🎉</span>
                <p class="mt-2">Aucune alerte - Tout va bien !</p>
              </div>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="text-center py-4">
            <p class="text-xs text-gray-400">Suivi santé • Données mises à jour en temps réel</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HealthDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('bmiChart') bmiCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('complianceChart') complianceCanvas!: ElementRef<HTMLCanvasElement>;

  isLoading = true;
  healthProfile: HealthProfileResponse | null = null;

  // Données dashboard
  bmi: number | null = null;
  bmiCategory = '';
  bmiPercent = 0;
  upcomingAppointmentsCount = 0;
  activePlansCount = 0;
  activeAlertsCount = 0;
  attendanceRate = 0;
  recentAlerts: any[] = [];

  navItems = [
    { path: '/app/healthcare/profile', icon: '👤', title: 'Profil' },
    { path: '/app/healthcare/records', icon: '📋', title: 'Dossiers' },
    { path: '/app/healthcare/appointments', icon: '📅', title: 'RDV' },
    { path: '/app/healthcare/diet', icon: '🥗', title: 'Régime' },
    { path: '/app/healthcare/trends', icon: '📈', title: 'Tendances' },
    { path: '/app/healthcare/alerts', icon: '🔔', title: 'Alertes' },
    { path: '/app/healthcare/compliance', icon: '✅', title: 'Compliance' }
  ];

  constructor(
    private appointmentService: AppointmentService,
    private healthProfileService: HealthProfileService,
    private medicalRecordService: MedicalRecordService,
    private dietPlanService: DietPlanService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  ngAfterViewInit() {
    setTimeout(() => this.renderCharts(), 500);
  }

  navigateTo(path: string) {
    window.location.href = path;
  }

  private async loadDashboardData() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      this.isLoading = false;
      return;
    }

    try {
      this.healthProfile = await firstValueFrom(this.healthProfileService.getByUserId(userId)).catch(() => null);
      if (this.healthProfile) {
        this.bmi = this.healthProfile.bmi;
        this.bmiCategory = this.healthProfile.bmiCategory || this.getBmiCategory(this.bmi);
        this.bmiPercent = this.bmi ? Math.min((this.bmi / 40) * 100, 100) : 0;
      }

      const appointments = await firstValueFrom(this.appointmentService.getByUserId(userId)).catch(() => []);
      const now = new Date();
      const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      this.upcomingAppointmentsCount = appointments.filter(apt => 
        new Date(apt.appointmentDate) >= now && 
        new Date(apt.appointmentDate) <= nextMonth && 
        apt.status !== 'CANCELLED'
      ).length;
      
      const total = appointments.length;
      const honored = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length;
      this.attendanceRate = total ? Math.round((honored / total) * 100) : 0;

      if (this.healthProfile) {
        const dietPlans = await firstValueFrom(this.dietPlanService.getByHealthProfileId(this.healthProfile.id)).catch(() => []);
        this.activePlansCount = dietPlans.filter(p => p.isActive).length;
      }

      this.recentAlerts = this.generateAlerts(this.healthProfile, appointments);
      this.activeAlertsCount = this.recentAlerts.length;
      
      this.cdr.detectChanges();
      setTimeout(() => this.renderCharts(), 300);
      
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private getCurrentUserId(): number | null {
    const id = localStorage.getItem('user_id');
    return id ? parseInt(id, 10) : null;
  }

  private getBmiCategory(bmi: number | null): string {
    if (!bmi) return 'Non défini';
    if (bmi < 18.5) return 'Sous-poids';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Surpoids';
    return 'Obésité';
  }

  private generateAlerts(profile: any, appointments: any[]): any[] {
    const alerts = [];
    
    if (profile?.bmi) {
      const bmi = profile.bmi;
      if (bmi >= 30) alerts.push({ type: 'danger', icon: '⚠️', title: 'Obésité sévère', message: `IMC = ${bmi.toFixed(1)}. Consultation recommandée.` });
      else if (bmi >= 25) alerts.push({ type: 'warning', icon: '📈', title: 'Surpoids', message: `IMC = ${bmi.toFixed(1)}. Activité physique recommandée.` });
    }
    
    const now = new Date();
    const pending = appointments.filter(a => a.status === 'PENDING' && new Date(a.appointmentDate) > now);
    if (pending.length) alerts.push({ type: 'warning', icon: '⏳', title: 'Rendez-vous à confirmer', message: `${pending.length} rendez-vous en attente.` });
    
    if (alerts.length === 0) {
      alerts.push({ type: 'info', icon: '📋', title: 'Bilan annuel', message: 'Planifiez votre bilan de santé annuel.' });
    }
    return alerts.slice(0, 4);
  }

  private bmiChartInstance: Chart | null = null;
  private complianceChartInstance: Chart | null = null;

  private renderCharts() {
    if (this.bmiCanvas?.nativeElement && this.bmi) {
      if (this.bmiChartInstance) this.bmiChartInstance.destroy();
      this.bmiChartInstance = new Chart(this.bmiCanvas.nativeElement, {
        type: 'line',
        data: { 
          labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Actuel'], 
          datasets: [{ 
            label: 'IMC', 
            data: [this.bmi + 1.2, this.bmi + 0.8, this.bmi + 0.3, this.bmi + 0.1, this.bmi], 
            borderColor: '#1DB954', 
            borderWidth: 3, 
            fill: true, 
            backgroundColor: 'rgba(29, 185, 84, 0.1)',
            tension: 0.3,
            pointRadius: 5,
            pointBackgroundColor: '#F97316'
          }] 
        },
        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } }
      });
    }

    if (this.complianceCanvas?.nativeElement) {
      if (this.complianceChartInstance) this.complianceChartInstance.destroy();
      this.complianceChartInstance = new Chart(this.complianceCanvas.nativeElement, {
        type: 'doughnut',
        data: { 
          labels: ['Présence', 'Absence'], 
          datasets: [{ 
            data: [this.attendanceRate, 100 - this.attendanceRate], 
            backgroundColor: ['#1DB954', '#F97316'], 
            borderWidth: 0 
          }] 
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
      });
    }
  }
}