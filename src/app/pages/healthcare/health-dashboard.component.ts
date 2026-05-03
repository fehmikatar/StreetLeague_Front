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
    <div class="min-h-screen" style="background: #F8FAFC;">
      <div class="p-6 max-w-7xl mx-auto space-y-6">
        
        <!-- EN-TÊTE AVEC SÉLECTEUR ADMIN -->
        <div class="relative overflow-hidden rounded-2xl shadow-lg" style="background: linear-gradient(135deg, #1DB954, #0e8e3e);">
          <div class="relative p-6 text-white">
            <div class="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 class="text-2xl md:text-3xl font-bold tracking-tight">Tableau de bord santé</h1>
                <p *ngIf="!isAdmin" class="text-green-100 mt-1 text-sm">Vue d'ensemble de votre activité médicale et bien-être</p>
                <p *ngIf="isAdmin && selectedUserName" class="text-green-100 text-sm mt-1">
                  👤 Utilisateur consulté : <strong>{{ selectedUserName }}</strong>
                </p>
              </div>
              <div class="flex items-center gap-3">
                <!-- Sélecteur d'utilisateur (visible uniquement pour admin / field owner) -->
                <div *ngIf="isAdmin" class="relative">
                  <select [(ngModel)]="selectedUserId" (change)="onUserChange()"
                          class="bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white">
                    <option *ngFor="let user of userList" [value]="user.id" class="text-gray-900">
                      {{ user.firstName }} {{ user.lastName }} (ID: {{ user.id }})
                    </option>
                  </select>
                  <div *ngIf="selectedUserId !== currentUserId" class="text-xs text-yellow-200 mt-1">
                    ⚡ Visualisation des données de {{ selectedUserName }}
                  </div>
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

        <!-- VUE GLOBALE POUR ADMIN / FIELD OWNER (tableau de tous les utilisateurs) - visible directement -->
        <div *ngIf="!isLoading && isAdmin && showGlobalView" class="bg-white rounded-2xl shadow-lg p-5">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-gray-800">👥 Tous les utilisateurs</h3>
            <button (click)="toggleGlobalView()" class="text-xs text-green-600 hover:underline">
              Masquer la vue générale
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left">ID</th>
                  <th class="px-4 py-2 text-left">Nom</th>
                  <th class="px-4 py-2 text-left">IMC</th>
                  <th class="px-4 py-2 text-left">RDV à venir</th>
                  <th class="px-4 py-2 text-left">Plans actifs</th>
                  <th class="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of userList" class="border-t hover:bg-green-50 cursor-pointer" (click)="selectUser(user.id)">
                  <td class="px-4 py-2">{{ user.id }}</td>
                  <td class="px-4 py-2 font-medium">{{ user.firstName }} {{ user.lastName }}</td>
                  <td class="px-4 py-2">{{ getUserBmiFormatted(user.id) }}</td>
                  <td class="px-4 py-2">{{ getUserAppointmentsCount(user.id) }}</td>
                  <td class="px-4 py-2">{{ getUserActivePlansCount(user.id) }}</td>
                  <td class="px-4 py-2"><button class="text-green-600" (click)="selectUser(user.id); $event.stopPropagation()">👁️ Voir détails</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div *ngIf="!isLoading && isAdmin && !showGlobalView" class="text-right">
          <button (click)="toggleGlobalView()" class="text-sm text-green-600 hover:underline">📊 Afficher la vue générale de tous les utilisateurs</button>
        </div>

        <!-- AUCUN PROFIL SANTÉ POUR L'UTILISATEUR COURANT -->
        <div *ngIf="!isLoading && !healthProfile" class="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div class="flex flex-col items-center">
            <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span class="text-4xl">📋</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Aucun profil santé trouvé</h2>
            <p class="text-gray-500 mb-6">Cet utilisateur n'a pas encore créé son profil de santé.</p>
            <button *ngIf="!isAdmin" (click)="navigateTo('/app/healthcare/profile')" 
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

          <!-- BOUTONS D'ACCÈS RAPIDE (avec le bouton Docteurs) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
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

  // Raccourcis de navigation (ajout du lien vers la gestion des médecins)
public get navItems() {
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
    return [...baseItems, { path: '/app/healthcare/doctors', icon: '👨‍⚕️', title: 'Docteurs' }];
  }
  return baseItems;
}

  constructor(
    private appointmentService: AppointmentService,
    private healthProfileService: HealthProfileService,
    private medicalRecordService: MedicalRecordService,
    private dietPlanService: DietPlanService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUserId = this.getCurrentUserId();
    const role = localStorage.getItem('user_type');
    this.isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN' || role === 'ROLE_FIELD_OWNER' || role === 'FIELD_OWNER';
    
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
    for (const user of this.userList) {
      const profile = await firstValueFrom(this.healthProfileService.getByUserId(user.id)).catch(() => null);
      if (profile) {
        this.userBmiMap.set(user.id, profile.bmi || 0);
      } else {
        this.userBmiMap.set(user.id, 0);
      }
      const appointments = await firstValueFrom(this.appointmentService.getByUserId(user.id)).catch(() => []);
      const now = new Date();
      const upcoming = appointments.filter(apt => new Date(apt.appointmentDate) >= now && apt.status !== 'CANCELLED').length;
      this.userAppointmentsMap.set(user.id, upcoming);
      if (profile) {
        const plans = await firstValueFrom(this.dietPlanService.getByHealthProfileId(profile.id)).catch(() => []);
        const active = plans.filter(p => p.isActive).length;
        this.userActivePlansMap.set(user.id, active);
      } else {
        this.userActivePlansMap.set(user.id, 0);
      }
    }
    this.cdr.detectChanges();
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
    if (!this.selectedUserId) return;
    this.isLoading = true;
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
    const alerts: any[] = [];
    
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