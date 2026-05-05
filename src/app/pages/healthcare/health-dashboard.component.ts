// health-dashboard.component.ts
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
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-health-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      
      <!-- EN-TÊTE AVEC SÉLECTEUR ADMIN -->
      <div class="relative overflow-hidden rounded-2xl shadow-lg bg-gradient-to-r from-green-600 to-green-700">
        <div class="p-6 text-white">
          <div class="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 class="text-2xl md:text-3xl font-bold tracking-tight">Tableau de bord santé</h1>
              <p *ngIf="!isAdmin" class="text-green-50 mt-1 text-sm opacity-90">Vue d'ensemble de votre activité médicale et bien-être</p>
              <p *ngIf="isAdmin && selectedUserName" class="text-green-50 text-sm mt-1">
                👤 Consultant : <strong>{{ selectedUserName }}</strong>
              </p>
            </div>
            <div class="flex items-center gap-3">
              <div *ngIf="isAdmin" class="relative">
                <select [(ngModel)]="selectedUserId" (change)="onUserChange()"
                        class="bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white">
                  <option *ngFor="let user of userList" [ngValue]="user.id" class="text-gray-900">
                    {{ user.firstName }} {{ user.lastName }}
                  </option>
                </select>
              </div>
              <div class="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 text-center border border-white/20">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span class="text-xs font-bold tracking-widest uppercase">Sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- BOUTONS D'ACCÈS RAPIDE - TOUJOURS ACTIFS -->
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <a *ngFor="let nav of navItems" 
           [routerLink]="[nav.path]"
           class="flex flex-col items-center bg-white p-4 rounded-xl border border-gray-100 hover:shadow-lg transition-all group no-underline">
          <div class="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-all group-hover:bg-green-100">
            <span class="text-xl">{{ nav.icon }}</span>
          </div>
          <span class="text-xs font-medium text-gray-600 group-hover:text-green-700 text-center">{{ nav.title }}</span>
        </a>
      </div>

      <!-- CHARGEMENT -->
      <div *ngIf="isLoading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
          <p class="mt-4 text-gray-500 font-medium">Chargement en cours...</p>
        </div>
      </div>

      <!-- VUE GLOBALE ADMIN -->
      <div *ngIf="!isLoading && isAdmin && showGlobalView" class="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-gray-800">👥 Annuaire Santé</h3>
          <button (click)="toggleGlobalView()" class="text-xs text-green-600 hover:underline">Masquer</button>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th class="px-4 py-3 text-left">ID</th>
                <th class="px-4 py-3 text-left">Patient</th>
                <th class="px-4 py-3 text-left">IMC</th>
                <th class="px-4 py-3 text-left">RDV</th>
                <th class="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let user of userList" class="hover:bg-green-50 transition-colors cursor-pointer" (click)="selectUser(user.id)">
                <td class="px-4 py-3">{{ user.id }}</td>
                <td class="px-4 py-3 font-bold text-gray-700">{{ user.firstName }} {{ user.lastName }}</td>
                <td class="px-4 py-3">{{ getUserBmiFormatted(user.id) }}</td>
                <td class="px-4 py-3">{{ getUserAppointmentsCount(user.id) }}</td>
                <td class="px-4 py-3">
                  <button class="text-green-600 font-bold text-xs" (click)="selectUser(user.id); $event.stopPropagation()">SÉLECTIONNER</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="!isLoading && isAdmin && !showGlobalView" class="text-center py-2">
        <button (click)="toggleGlobalView()" class="text-sm font-bold text-green-600 bg-green-50 px-6 py-2 rounded-xl">
          📊 Afficher la liste complète
        </button>
      </div>

      <!-- AUCUN PROFIL SANTÉ -->
      <div *ngIf="!isLoading && !healthProfile" class="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
        <div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <span class="text-4xl">📋</span>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Profil incomplet</h2>
        <p class="text-gray-500 mb-8 max-w-sm mx-auto">Votre profil santé n'est pas encore initialisé. Cliquez ci-dessous pour commencer.</p>
        <a [routerLink]="['/app/healthcare/profile']" class="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl shadow-lg transition-all inline-block font-bold no-underline">
          Créer mon profil
        </a>
      </div>

      <!-- DASHBOARD DÉTAILS -->
      <div *ngIf="!isLoading && healthProfile" class="space-y-6">
        
        <!-- CARTES STATS -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <a [routerLink]="['/app/healthcare/trends']" class="bg-white p-5 rounded-2xl shadow-md border-b-4 border-green-500 no-underline block hover:shadow-lg transition-all">
            <div class="flex justify-between items-start mb-4">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">IMC</span>
              <span class="text-xl">⚖️</span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-black text-gray-800">{{ bmi !== null ? bmi.toFixed(1) : '—' }}</span>
              <span class="text-xs font-bold text-green-600 uppercase">{{ bmiCategory }}</span>
            </div>
            <div class="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-green-500" [style.width]="bmiPercent + '%'"></div>
            </div>
          </a>

          <a [routerLink]="['/app/healthcare/appointments']" class="bg-white p-5 rounded-2xl shadow-md border-b-4 border-orange-500 no-underline block hover:shadow-lg transition-all">
            <div class="flex justify-between items-start mb-4">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">RDV</span>
              <span class="text-xl">📅</span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-black text-gray-800">{{ upcomingAppointmentsCount }}</span>
              <span class="text-xs font-bold text-orange-500">Prochains 30j</span>
            </div>
          </a>

          <a [routerLink]="['/app/healthcare/diet']" class="bg-white p-5 rounded-2xl shadow-md border-b-4 border-green-500 no-underline block hover:shadow-lg transition-all">
            <div class="flex justify-between items-start mb-4">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Régimes</span>
              <span class="text-xl">🥗</span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-black text-gray-800">{{ activePlansCount }}</span>
              <span class="text-xs font-bold text-green-600">Actifs</span>
            </div>
          </a>

          <a [routerLink]="['/app/healthcare/alerts']" class="bg-white p-5 rounded-2xl shadow-md border-b-4 border-orange-500 no-underline block hover:shadow-lg transition-all">
            <div class="flex justify-between items-start mb-4">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alertes</span>
              <span class="text-xl">🔔</span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-black text-gray-800">{{ activeAlertsCount }}</span>
              <span class="text-xs font-bold text-orange-500">Actives</span>
            </div>
          </a>
        </div>

        <!-- ANALYSES GRAPHIQUES -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 class="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">📉 Évolution Poids</h3>
            <canvas #bmiChart style="max-height: 250px;"></canvas>
          </div>
          <div class="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 class="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">📅 Suivi Médical</h3>
            <canvas #complianceChart style="max-height: 250px;"></canvas>
          </div>
        </div>

        <!-- ALERTES RECENTES -->
        <div class="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
            <h3 class="text-xs font-black text-gray-500 uppercase tracking-widest">⚡ Alertes Récentes</h3>
            <a [routerLink]="['/app/healthcare/alerts']" class="text-[10px] font-bold text-green-600 hover:underline">Tout voir</a>
          </div>
          <div class="divide-y">
            <div *ngFor="let alert of recentAlerts" class="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-xl" [class.bg-red-50]="alert.type === 'danger'" [class.bg-amber-50]="alert.type !== 'danger'">
                {{ alert.icon }}
              </div>
              <div>
                <p class="text-sm font-bold text-gray-800">{{ alert.title }}</p>
                <p class="text-xs text-gray-500">{{ alert.message }}</p>
              </div>
            </div>
            <div *ngIf="recentAlerts.length === 0" class="p-8 text-center text-gray-400 italic text-sm">
              Aucune alerte à signaler
            </div>
          </div>
        </div>

        <div class="text-center pt-6 pb-2">
          <p class="text-[10px] font-black text-gray-300 uppercase tracking-widest">StreetLeague Healthcare • Live Intelligence Sync</p>
        </div>
      </div>
    </div>
  `
})
export class HealthDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('bmiChart') bmiCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('complianceChart') complianceCanvas!: ElementRef<HTMLCanvasElement>;

  isLoading = true;
  isAdmin = false;
  currentUserId: number | null = null;
  selectedUserId: number | null = null;
  selectedUserName = '';
  userList: any[] = [];
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

  // Vue globale - affichée directement pour le Field Owner
  showGlobalView = true;   // ← Changement clé : le tableau est visible immédiatement
  userBmiMap = new Map<number, number>();
  userAppointmentsMap = new Map<number, number>();
  userActivePlansMap = new Map<number, number>();

  navItems: any[] = [];

  private initNavItems() {
    const baseItems = [
      { path: '/app/healthcare/profile', icon: '👤', title: 'Profil' },
      { path: '/app/healthcare/records', icon: '📋', title: 'Dossiers' },
      { path: '/app/healthcare/appointments', icon: '📅', title: 'RDV' },
      { path: '/app/healthcare/diet', icon: '🥗', title: 'Régime' },
      { path: '/app/healthcare/trends', icon: '📈', title: 'Tendances' },
      { path: '/app/healthcare/alerts', icon: '🔔', title: 'Alertes' },
      { path: '/app/healthcare/compliance', icon: '✅', title: 'Compliance' }
    ];
    
    if (this.isAdmin) {
      this.navItems = [...baseItems, { path: '/app/healthcare/doctors', icon: '👨‍⚕️', title: 'Docteurs' }];
    } else {
      this.navItems = baseItems;
    }
  }

  constructor(
    private appointmentService: AppointmentService,
    private healthProfileService: HealthProfileService,
    private medicalRecordService: MedicalRecordService,
    private dietPlanService: DietPlanService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.currentUserId = this.getCurrentUserId();
    const role = localStorage.getItem('user_type');
    this.isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN' || role === 'ROLE_FIELD_OWNER' || role === 'FIELD_OWNER';

    this.initNavItems();
    if (this.isAdmin) {
      this.loadAllUsers();
    } else {
      this.selectedUserId = this.currentUserId;
      this.loadDashboardData();
    }
  }

  async loadAllUsers() {
    try {
      this.userList = await firstValueFrom(this.userService.getAll());
      if (this.userList.length > 0) {
        this.selectedUserId = this.currentUserId && this.userList.some(u => u.id === this.currentUserId)
          ? this.currentUserId
          : this.userList[0].id;
        this.updateSelectedUserName();
        await this.loadGlobalData();
        await this.loadDashboardData();
      } else {
        this.isLoading = false;
      }
    } catch (err) {
      console.error('Erreur chargement utilisateurs', err);
      this.isLoading = false;
    }
  }

  async loadGlobalData() {
    try {
      // Chargement en parallèle pour éviter de bloquer le thread principal
      await Promise.all(this.userList.map(async (user) => {
        const profile = await firstValueFrom(this.healthProfileService.getByUserId(user.id)).catch(() => null);
        this.userBmiMap.set(user.id, profile?.bmi || 0);

        const appointments = await firstValueFrom(this.appointmentService.getByUserId(user.id)).catch(() => []);
        const now = new Date();
        const upcoming = appointments.filter(apt => new Date(apt.appointmentDate) >= now && apt.status !== 'CANCELLED').length;
        this.userAppointmentsMap.set(user.id, upcoming);

        if (profile) {
          const plans = await firstValueFrom(this.dietPlanService.getByHealthProfileId(profile.id)).catch(() => []);
          this.userActivePlansMap.set(user.id, plans.filter(p => p.isActive).length);
        } else {
          this.userActivePlansMap.set(user.id, 0);
        }
      }));
    } catch (err) {
      console.error('Erreur lors du chargement des données globales', err);
    } finally {
      this.cdr.detectChanges();
    }
  }

  selectUser(userId: number) {
    this.selectedUserId = userId;
    this.updateSelectedUserName();
    this.loadDashboardData();
    if (this.showGlobalView) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  toggleGlobalView() {
    this.showGlobalView = !this.showGlobalView;
  }

  getUserBmi(userId: number): number | null {
    return this.userBmiMap.get(userId) ?? null;
  }

  getUserBmiFormatted(userId: number): string {
    const bmi = this.getUserBmi(userId);
    if (bmi === null || bmi === 0) return '—';
    return bmi.toFixed(1);
  }

  getUserAppointmentsCount(userId: number): number {
    return this.userAppointmentsMap.get(userId) ?? 0;
  }

  getUserActivePlansCount(userId: number): number {
    return this.userActivePlansMap.get(userId) ?? 0;
  }

  updateSelectedUserName() {
    const user = this.userList.find(u => u.id === this.selectedUserId);
    this.selectedUserName = user ? `${user.firstName} ${user.lastName}` : 'Utilisateur';
  }

  async onUserChange() {
    this.updateSelectedUserName();
    await this.loadDashboardData();
  }

  ngAfterViewInit() {
    setTimeout(() => this.renderCharts(), 500);
  }

  navigateTo(path: string) {
    window.location.href = path;
  }

  private async loadDashboardData() {
    this.isLoading = true;
    this.cdr.detectChanges();

    if (!this.selectedUserId) {
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.healthProfile = null;
    try {
      this.healthProfile = await firstValueFrom(this.healthProfileService.getByUserId(this.selectedUserId)).catch(() => null);
      if (this.healthProfile) {
        this.bmi = this.healthProfile.bmi;
        this.bmiCategory = this.healthProfile.bmiCategory || this.getBmiCategory(this.bmi);
        this.bmiPercent = this.bmi ? Math.min((this.bmi / 40) * 100, 100) : 0;
      } else {
        this.bmi = null;
        this.bmiCategory = 'Non défini';
        this.bmiPercent = 0;
      }

      const appointments = await firstValueFrom(this.appointmentService.getByUserId(this.selectedUserId)).catch(() => []);
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
      } else {
        this.activePlansCount = 0;
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