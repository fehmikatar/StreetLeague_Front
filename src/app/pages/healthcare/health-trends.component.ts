// health-trends.component.ts
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Chart from 'chart.js/auto';
import { firstValueFrom } from 'rxjs';
import { HealthProfileService, HealthProfileResponse } from '../../services/health-profile.service';
import { MedicalRecordService, MedicalRecordResponse } from '../../services/medical-record.service';

@Component({
  selector: 'app-health-trends',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <div class="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <a routerLink="/app/healthcare" class="bg-white hover:bg-gray-100 text-blue-700 px-4 py-2 rounded-xl shadow-md transition">← Dashboard Santé</a>
          <div>
            <h1 class="text-3xl font-bold text-gray-800">📈 Tendances santé</h1>
            <p class="text-gray-600">Évolution de vos indicateurs corporels</p>
          </div>
        </div>
      </div>

      <div *ngIf="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        <p class="mt-2">Chargement de vos données...</p>
      </div>

      <div *ngIf="!isLoading && !healthProfile" class="text-center py-12 bg-yellow-50 rounded-xl">
        <p class="text-gray-600">⚠️ Aucun profil santé trouvé.</p>
        <a routerLink="/app/healthcare/profile" class="text-blue-600 underline">Créez votre profil santé</a>
      </div>

      <div *ngIf="!isLoading && healthProfile">
        <!-- 3 Cartes -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
            <p class="text-sm text-gray-500">IMC actuel</p>
            <p class="text-2xl font-bold">{{ currentBMI !== null ? currentBMI.toFixed(1) : '—' }}</p>
            <p class="text-xs text-gray-400">Catégorie : {{ bmiCategory }}</p>
            <div class="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full" [style.width]="bmiPercent + '%'"></div>
            </div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
            <p class="text-sm text-gray-500">Blessures actives</p>
            <p class="text-2xl font-bold">{{ activeInjuries }}</p>
            <p class="text-xs text-gray-400">en cours de traitement</p>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
            <p class="text-sm text-gray-500">Blessures terminées</p>
            <p class="text-2xl font-bold">{{ completedInjuries }}</p>
            <p class="text-xs text-gray-400">guéries</p>
          </div>
        </div>

        <!-- 2 Graphiques -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div class="bg-white rounded-xl p-4 shadow-sm border">
            <h3 class="font-semibold text-gray-700 mb-3">📉 Évolution de l'IMC</h3>
            <canvas #bmiChart style="height: 250px; width: 100%"></canvas>
            <p class="text-xs text-gray-500 mt-3 text-center">{{ bmiTrend }}</p>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border">
            <h3 class="font-semibold text-gray-700 mb-3">🩺 Répartition des blessures</h3>
            <canvas #injuryChart style="height: 250px; width: 100%"></canvas>
            <p class="text-xs text-gray-500 mt-3 text-center" *ngIf="medicalRecords.length === 0">Aucun dossier médical</p>
          </div>
        </div>

        <!-- Diagnostic IA -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 shadow-sm mt-6">
          <h3 class="font-bold text-gray-800 flex items-center gap-2">
            <span>🔍</span> Diagnostic santé
          </h3>
          <div class="mt-3 space-y-2 text-gray-700 text-sm">
            <p *ngFor="let diag of diagnostics" class="flex items-start gap-2">
              <span class="text-blue-600">•</span> {{ diag }}
            </p>
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

  currentBMI: number | null = null;
  bmiCategory = '';
  bmiPercent = 0;
  bmiTrend = '';
  activeInjuries = 0;
  completedInjuries = 0;
  diagnostics: string[] = [];

  private bmiChartInstance: Chart | null = null;
  private injuryChartInstance: Chart | null = null;

  constructor(
    private healthProfileService: HealthProfileService,
    private medicalRecordService: MedicalRecordService,
    private cdr: ChangeDetectorRef
  ) {}

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
    const userId = this.getCurrentUserId();
    if (!userId) {
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    try {
      this.healthProfile = await firstValueFrom(this.healthProfileService.getByUserId(userId)).catch(() => null);
      
      if (this.healthProfile) {
        this.currentBMI = this.healthProfile.bmi;
        this.bmiCategory = this.healthProfile.bmiCategory || this.getBmiCategory(this.currentBMI);
        this.bmiPercent = this.currentBMI ? Math.min((this.currentBMI / 40) * 100, 100) : 0;
        
        this.medicalRecords = await firstValueFrom(
          this.medicalRecordService.getByHealthProfileId(this.healthProfile.id)
        ).catch(() => []);
      }
      
      this.computeStats();
      this.generateDiagnostics();
      this.cdr.detectChanges();
      setTimeout(() => this.renderCharts(), 300);
      
    } catch (err) {
      console.error('Erreur chargement des données:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private getBmiCategory(bmi: number | null): string {
    if (!bmi) return 'Non défini';
    if (bmi < 18.5) return 'Sous-poids';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Surpoids';
    return 'Obésité';
  }

  private computeStats() {
    this.activeInjuries = this.medicalRecords.filter(r => r.recoveryStatus === 'IN_PROGRESS').length;
    this.completedInjuries = this.medicalRecords.filter(r => r.recoveryStatus === 'COMPLETED').length;
    this.bmiTrend = this.currentBMI ? `IMC actuel : ${this.currentBMI.toFixed(1)} - ${this.bmiCategory}` : 'IMC non disponible';
  }

  private generateDiagnostics() {
    const diag: string[] = [];
    
    if (this.currentBMI) {
      if (this.currentBMI >= 30) {
        diag.push(`⚠️ IMC élevé (${this.currentBMI.toFixed(1)}) : risque cardiovasculaire. Consultez un médecin.`);
      } else if (this.currentBMI >= 25) {
        diag.push(`📈 Surpoids (IMC ${this.currentBMI.toFixed(1)}). Augmentez l'activité physique.`);
      } else if (this.currentBMI < 18.5) {
        diag.push(`⚠️ Insuffisance pondérale (IMC ${this.currentBMI.toFixed(1)}). Suivi nutritionnel conseillé.`);
      } else {
        diag.push(`✅ IMC normal (${this.currentBMI.toFixed(1)}). Maintenez une bonne hygiène de vie.`);
      }
    } else {
      diag.push(`📊 Aucune donnée IMC. Complétez votre profil santé.`);
    }

    if (this.activeInjuries > 0) {
      diag.push(`🩺 ${this.activeInjuries} blessure(s) en cours. Respectez les protocoles de traitement.`);
    }
    if (this.completedInjuries > 0) {
      diag.push(`✅ ${this.completedInjuries} blessure(s) terminées. Félicitations pour votre rétablissement !`);
    }
    if (this.activeInjuries === 0 && this.completedInjuries === 0 && this.medicalRecords.length === 0) {
      diag.push(`📋 Aucun historique de blessure. Continuez vos bonnes pratiques !`);
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
    if (!this.healthProfile) return;

    // Graphique IMC
    if (this.bmiCanvas?.nativeElement && this.currentBMI) {
      try {
        this.bmiChartInstance = new Chart(this.bmiCanvas.nativeElement, {
          type: 'line',
          data: { 
            labels: ['Actuel'], 
            datasets: [{ 
              label: 'IMC', 
              data: [this.currentBMI], 
              borderColor: '#3b82f6', 
              borderWidth: 3,
              fill: true, 
              backgroundColor: 'rgba(59,130,246,0.1)',
              pointRadius: 6,
              pointBackgroundColor: '#3b82f6'
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
          'IN_PROGRESS': '#3b82f6',
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
      'PENDING': 'En attente',
      'IN_PROGRESS': 'En cours',
      'COMPLETED': 'Terminé',
      'COMPLICATED': 'Compliqué',
      'REFERRED': 'Référencé'
    };
    return labels[status] || status;
  }
}