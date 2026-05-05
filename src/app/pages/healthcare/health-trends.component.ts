// health-trends.component.ts
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Chart from 'chart.js/auto';
import { firstValueFrom } from 'rxjs';
import { HealthProfileService, HealthProfileResponse, ActivityRecommendation } from '../../services/health-profile.service';
import { MedicalRecordService, MedicalRecordResponse } from '../../services/medical-record.service';

@Component({
  selector: 'app-health-trends',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <div class="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <a routerLink="/app/healthcare" class="bg-white hover:bg-gray-100 text-green-700 px-4 py-2 rounded-xl shadow-md transition">← Health Dashboard</a>
          <div>
            <h1 class="text-3xl font-bold text-gray-800">📈 Health Trends</h1>
            <p class="text-gray-600">Evolution of your body indicators</p>
          </div>
        </div>
      </div>

      <div *ngIf="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
        <p class="mt-2">Loading your data...</p>
      </div>

      <div *ngIf="!isLoading">
        <!-- 3 Cartes -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
            <p class="text-sm text-gray-500">Current BMI</p>
            <p class="text-2xl font-bold">{{ currentBMI !== null ? currentBMI.toFixed(1) : '—' }}</p>
            <p class="text-xs text-gray-400">Category: {{ bmiCategory }}</p>
            <div class="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-green-500 rounded-full" [style.width]="bmiPercent + '%'"></div>
            </div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
            <p class="text-sm text-gray-500">Active Injuries</p>
            <p class="text-2xl font-bold">{{ activeInjuries }}</p>
            <p class="text-xs text-gray-400">under treatment</p>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
            <p class="text-sm text-gray-500">Completed Injuries</p>
            <p class="text-2xl font-bold">{{ completedInjuries }}</p>
            <p class="text-xs text-gray-400">healed</p>
          </div>
        </div>

        <!-- 2 Graphiques -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div class="bg-white rounded-xl p-4 shadow-sm border">
            <h3 class="font-semibold text-gray-700 mb-3">📉 BMI Evolution</h3>
            <canvas #bmiChart style="height: 250px; width: 100%"></canvas>
            <p class="text-xs text-gray-500 mt-3 text-center">{{ bmiTrend }}</p>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border">
            <h3 class="font-semibold text-gray-700 mb-3">🩺 Injury Distribution</h3>
            <canvas #injuryChart style="height: 250px; width: 100%"></canvas>
            <p class="text-xs text-gray-500 mt-3 text-center" *ngIf="medicalRecords.length === 0">No medical records</p>
          </div>
        </div>

        <!-- Diagnostic IA -->
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 shadow-sm mt-6">
          <h3 class="font-bold text-gray-800 flex items-center gap-2">
            <span>🔍</span> Health Diagnosis
          </h3>
          <div class="mt-3 space-y-2 text-gray-700 text-sm">
            <p *ngFor="let diag of diagnostics" class="flex items-start gap-2">
              <span class="text-green-600">•</span> {{ diag }}
            </p>
          </div>
        </div>

        <!-- Programme d'activités dynamique -->
        <div class="bg-white rounded-xl shadow-sm border mt-6 overflow-hidden" *ngIf="!isAdmin">
          <div class="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex justify-between items-center">
            <h3 class="font-bold text-white flex items-center gap-2">
              <span>🗓️</span> Your Dynamic Sport Program (Based on your BMI: {{ bmiCategory }})
            </h3>
            <span class="bg-white/20 text-white text-xs px-3 py-1 rounded-full">Weekly Plan</span>
          </div>
          
          <div *ngIf="isPlanLoading" class="p-8 text-center text-gray-500">
            <div class="inline-block animate-spin rounded-full h-6 w-6 border-4 border-green-500 border-t-transparent mb-2"></div>
            <p>Generating your personalized program...</p>
          </div>

          <div *ngIf="!isPlanLoading && activityPlan.length > 0" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div *ngFor="let activity of activityPlan" class="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition flex flex-col">
                <div class="flex justify-between items-start mb-2">
                  <span class="font-bold text-emerald-700">{{ activity.dayOfWeek }}</span>
                  <span class="text-xs px-2 py-1 rounded-md font-medium" 
                    [ngClass]="{
                      'bg-green-100 text-green-700': activity.intensity === 'Faible' || activity.intensity === 'Low',
                      'bg-yellow-100 text-yellow-700': activity.intensity.includes('Modérée') || activity.intensity.includes('Moderate') || activity.intensity.includes('Faible à Modérée') || activity.intensity.includes('Low to Moderate'),
                      'bg-red-100 text-red-700': activity.intensity.includes('Élevée') || activity.intensity.includes('High')
                    }">
                    {{ activity.intensity }}
                  </span>
                </div>
                <h4 class="font-semibold text-gray-800 mb-1">{{ activity.activityName }}</h4>
                <div class="flex items-center text-sm text-gray-500 mb-3 gap-1">
                  <span>⏱️</span> {{ activity.durationMinutes }} min
                </div>
                <p class="text-sm text-gray-600 flex-1">{{ activity.description }}</p>
              </div>
            </div>
          </div>

          <div *ngIf="!isPlanLoading && activityPlan.length === 0" class="p-8 text-center text-gray-500">
            <p>Could not generate program (Missing BMI).</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HealthTrendsComponent implements OnInit, AfterViewInit {
  @ViewChild('bmiChart') bmiCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('injuryChart') injuryCanvas!: ElementRef<HTMLCanvasElement>;

  healthProfile: HealthProfileResponse | null = null;
  medicalRecords: MedicalRecordResponse[] = [];
  isLoading = true;
  isAdmin = false;

  currentBMI: number | null = null;
  bmiCategory = '';
  bmiPercent = 0;
  bmiTrend = '';
  activeInjuries = 0;
  completedInjuries = 0;
  diagnostics: string[] = [];

  activityPlan: ActivityRecommendation[] = [];
  isPlanLoading = false;

  private bmiChartInstance: Chart | null = null;
  private injuryChartInstance: Chart | null = null;

  constructor(
    private healthProfileService: HealthProfileService,
    private medicalRecordService: MedicalRecordService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadUserData();
  }

  ngAfterViewInit() {
    setTimeout(() => this.renderCharts(), 500);
  }

  private getCurrentUserId(): number | null {
    const id = localStorage.getItem('user_id');
    return id ? parseInt(id, 10) : null;
  }

  private async loadUserData() {
    const role = localStorage.getItem('user_type');
    this.isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN' || role === 'ROLE_FIELD_OWNER' || role === 'FIELD_OWNER';
    const userId = this.getCurrentUserId();

    if (!userId && !this.isAdmin) {
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    try {
      if (this.isAdmin) {
        this.medicalRecords = await firstValueFrom(this.medicalRecordService.getAll()).catch(() => []);
        const profiles = await firstValueFrom(this.healthProfileService.getAll()).catch(() => []);
        if (profiles.length > 0) {
          const bmis = profiles.filter(p => p.bmi).map(p => p.bmi!);
          if (bmis.length > 0) {
            this.currentBMI = bmis.reduce((a, b) => a + b, 0) / bmis.length;
            this.bmiCategory = 'Global Average';
            this.bmiPercent = Math.min((this.currentBMI / 40) * 100, 100);
          }
        }
      } else {
        this.healthProfile = await firstValueFrom(this.healthProfileService.getByUserId(userId!)).catch(() => null);

        if (this.healthProfile) {
          this.currentBMI = this.healthProfile.bmi;
          this.bmiCategory = this.healthProfile.bmiCategory || this.getBmiCategory(this.currentBMI);
          this.bmiPercent = this.currentBMI ? Math.min((this.currentBMI / 40) * 100, 100) : 0;

          this.medicalRecords = await firstValueFrom(
            this.medicalRecordService.getByHealthProfileId(this.healthProfile.id)
          ).catch(() => []);
        }
      }

      this.computeStats();
      this.generateDiagnostics();
      this.cdr.detectChanges();
      setTimeout(() => this.renderCharts(), 300);

      if (!this.isAdmin && this.healthProfile) {
        this.isPlanLoading = true;
        this.healthProfileService.getActivityPlan(userId!).subscribe({
          next: (plan) => {
            this.activityPlan = plan;
            this.isPlanLoading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error loading dynamic program:', err);
            this.isPlanLoading = false;
            this.cdr.detectChanges();
          }
        });
      }

    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private getBmiCategory(bmi: number | null): string {
    if (!bmi) return 'Not defined';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obesity';
  }

  private computeStats() {
    this.activeInjuries = this.medicalRecords.filter(r => r.recoveryStatus === 'IN_PROGRESS').length;
    this.completedInjuries = this.medicalRecords.filter(r => r.recoveryStatus === 'COMPLETED').length;
    this.bmiTrend = this.currentBMI ? `Current BMI: ${this.currentBMI.toFixed(1)} - ${this.bmiCategory}` : 'BMI not available';
  }

  private generateDiagnostics() {
    const diag: string[] = [];

    if (this.currentBMI) {
      if (this.currentBMI >= 30) {
        diag.push(`⚠️ High BMI (${this.currentBMI.toFixed(1)}): cardiovascular risk. Consult a doctor.`);
      } else if (this.currentBMI >= 25) {
        diag.push(`📈 Overweight (BMI ${this.currentBMI.toFixed(1)}). Increase physical activity.`);
      } else if (this.currentBMI < 18.5) {
        diag.push(`⚠️ Underweight (BMI ${this.currentBMI.toFixed(1)}). Nutritional monitoring recommended.`);
      } else {
        diag.push(`✅ Normal BMI (${this.currentBMI.toFixed(1)}). Maintain a healthy lifestyle.`);
      }
    } else {
      diag.push(`📊 No BMI data. Complete your health profile.`);
    }

    if (this.activeInjuries > 0) {
      diag.push(`🩺 ${this.activeInjuries} injury(ies) in progress. Follow treatment protocols.`);
    }
    if (this.completedInjuries > 0) {
      diag.push(`✅ ${this.completedInjuries} injuries completed. Congratulations on your recovery!`);
    }
    if (this.activeInjuries === 0 && this.completedInjuries === 0 && this.medicalRecords.length === 0) {
      diag.push(`📋 No injury history. Keep up your good practices!`);
    }

    this.diagnostics = diag;
  }

  private destroyCharts() {
    if (this.bmiChartInstance) {
      this.bmiChartInstance.destroy();
      this.bmiChartInstance = null;
    }
    if (this.injuryChartInstance) {
      this.injuryChartInstance.destroy();
      this.injuryChartInstance = null;
    }
  }

  private renderCharts() {
    this.destroyCharts();
    if (!this.healthProfile && !this.isAdmin) return;

    // Graphique IMC
    if (this.bmiCanvas?.nativeElement && this.currentBMI) {
      try {
        this.bmiChartInstance = new Chart(this.bmiCanvas.nativeElement, {
          type: 'line',
          data: {
            labels: ['Current'],
            datasets: [{
              label: 'BMI',
              data: [this.currentBMI],
              borderColor: '#1DB954',
              borderWidth: 3,
              fill: true,
              backgroundColor: 'rgba(29,185,84,0.1)',
              pointRadius: 6,
              pointBackgroundColor: '#1DB954'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { position: 'bottom' } }
          }
        });
      } catch (e) { console.warn(e); }
    }

    // Graphique blessures
    if (this.injuryCanvas?.nativeElement && this.medicalRecords.length > 0) {
      try {
        const statusCount: Record<string, number> = {};
        this.medicalRecords.forEach(r => {
          statusCount[r.recoveryStatus] = (statusCount[r.recoveryStatus] || 0) + 1;
        });

        const labels = Object.keys(statusCount);
        const data = labels.map(key => statusCount[key]);

        const colorMap: Record<string, string> = {
          'PENDING': '#f59e0b',
          'IN_PROGRESS': '#1DB954',
          'COMPLETED': '#10b981',
          'COMPLICATED': '#ef4444',
          'REFERRED': '#9ca3af'
        };

        const backgroundColors = labels.map(label => colorMap[label] || '#9ca3af');

        this.injuryChartInstance = new Chart(this.injuryCanvas.nativeElement, {
          type: 'pie',
          data: {
            labels: labels.map(l => this.getStatusLabel(l)),
            datasets: [{
              data: data,
              backgroundColor: backgroundColors,
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { position: 'bottom' } }
          }
        });
      } catch (e) { console.warn(e); }
    }
  }

  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'Pending',
      'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Completed',
      'COMPLICATED': 'Complicated',
      'REFERRED': 'Referred'
    };
    return labels[status] || status;
  }
}