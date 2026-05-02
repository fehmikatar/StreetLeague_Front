import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { HealthProfileService, HealthProfileResponse, HealthProfileRequest, ActivityRecommendation } from '../../services/health-profile.service';
import { UserService } from '../../services/user.service';

Chart.register(...registerables);

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
}

interface SavedScore {
  date: string;
  score: number;
  params: {
    intensity: number;
    sleepHours: number;
    caloriesIn: number;
    duration: number;
  };
}

@Component({
  selector: 'app-health-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <!-- EN-TÊTE UNIFIÉ STYLE "DOSSIER MÉDICAL" -->
      <div class="bg-emerald-50/80 backdrop-blur-sm rounded-3xl p-6 mb-10 border border-emerald-100/50 flex flex-wrap justify-between items-center gap-6 shadow-sm">
        <div class="flex items-center gap-6">
          <a routerLink="/app/healthcare" class="bg-white px-4 py-2 rounded-xl text-xs font-bold text-green-700 shadow-sm border border-green-100 hover:bg-green-50 transition-all flex items-center gap-2">
            ← Health Dashboard
          </a>
          <div class="flex items-center gap-3">
            <div class="text-3xl">🩺</div>
            <div>
              <h1 class="text-2xl font-black text-slate-800 tracking-tight">Health Profiles</h1>
              <p class="text-slate-500 text-xs font-medium">Biometric parameters & metabolism</p>
            </div>
          </div>
        </div>
        <button (click)="openModal()" class="bg-[#1DB954] hover:bg-[#1aa34a] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 transform hover:scale-105">
          + New Profile
        </button>
      </div>

      <!-- Toast -->
      <div *ngIf="notification" class="fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm animate-bounce" [class.bg-green-600]="notificationType === 'success'" [class.bg-red-600]="notificationType === 'error'">{{ notification }}</div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="text-center py-12"><div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div><p class="mt-2">Loading...</p></div>

      <!-- Tableau des profils -->
      <div *ngIf="!isLoading" class="bg-white rounded-2xl border shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">{{ isAdmin ? 'ID' : '' }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Patient</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Age</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Weight/Height</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">BMI</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                <th class="px-6 py-3 text-right text-xs font-black text-gray-500 uppercase tracking-widest">ACTIONS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr *ngFor="let p of profiles" (click)="showDetails(p)" class="hover:bg-gray-50 cursor-pointer">
                <td class="px-6 py-4 text-sm">{{ isAdmin ? p.id : '' }}</td>
                <td class="px-6 py-4 text-sm">{{ getUserName(p.userId) }}</td>
                <td class="px-6 py-4 text-sm">{{ p.age }}</td>
                <td class="px-6 py-4 text-sm">{{ p.weight }} kg / {{ p.height }} cm</td>
                <td class="px-6 py-4 text-sm font-medium">{{ p.bmi | number:'1.1-1' }}</td>
                <td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-full" [class.bg-green-100]="p.bmiCategory === 'Weight normal'" [class.bg-yellow-100]="p.bmiCategory === 'Overweight'" [class.bg-red-100]="p.bmiCategory === 'Obesity'">{{ p.bmiCategory }}</span></td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button (click)="openModal(p); $event.stopPropagation()" class="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all shadow-sm border border-amber-100" title="Edit">✏️</button>
                    <button (click)="downloadProfilee(p); $event.stopPropagation()" class="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all shadow-sm border border-blue-100" title="Download">📥</button>
                    <button (click)="deleteProfilee(p.id); $event.stopPropagation()" class="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all shadow-sm border border-red-100" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="profiles.length === 0"><td colspan="7" class="text-center py-10 text-gray-400">No profile found</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Détails du profil sélectionné -->
      <div *ngIf="selectedProfilee" id="patient-details" class="mt-8 space-y-8 animate-fade-in">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Colonne Gauche -->
          <div class="lg:col-span-1 space-y-8">
            <!-- Bilan général (NOUVEAU) -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-200 shadow-lg">
              <h3 class="font-black text-gray-800 text-sm uppercase mb-4 flex items-center gap-2">📋 Santé globale</h3>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between"><span class="text-gray-600">Âge :</span><span class="font-bold">{{ selectedProfilee.age }} ans</span></div>
                <div class="flex justify-between"><span class="text-gray-600">IMC :</span><span class="font-bold">{{ selectedProfilee.bmi | number:'1.1-1' }} ({{ selectedProfilee.bmiCategory }})</span></div>
                <div class="flex justify-between"><span class="text-gray-600">Forme :</span><span class="font-bold">{{ selectedProfilee.fitnessStatus }}</span></div>
                <div class="flex justify-between"><span class="text-gray-600">Score moyen (3 derniers) :</span><span class="font-bold text-green-700">{{ averageRecentScore }} / 100</span></div>
                <div class="mt-3 pt-2 border-t border-blue-200 text-xs text-gray-500">{{ healthSummaryMessage }}</div>
              </div>
            </div>

            <!-- Score Santé -->
            <div class="bg-white p-6 rounded-3xl border shadow-lg relative overflow-hidden group">
              <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-6xl">🧬</div>
              <h3 class="font-black text-gray-800 text-sm uppercase mb-6 flex items-center gap-2">🌟 Overall Score</h3>
              <div class="flex flex-col items-center">
                <div class="relative w-40 h-40">
                  <svg class="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" stroke-width="8"/>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="url(#healthGrad)" stroke-width="8" 
                            stroke-dasharray="283" [attr.stroke-dashoffset]="283 - (283 * healthScore / 100)" 
                            stroke-linecap="round" transform="rotate(-90 50 50)"/>
                    <defs>
                      <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#f87171"/><stop offset="50%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#34d399"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-4xl font-black text-gray-800">{{ healthScore }}</span>
                    <span class="text-[10px] font-bold text-gray-400 uppercase">Points</span>
                  </div>
                </div>
                <p class="text-xs text-center mt-6 font-bold text-gray-600 px-4 leading-relaxed">{{ healthScoreMessage }}</p>
              </div>
            </div>

            <!-- Metabolism & Needs -->
            <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg text-gray-800">
              <h3 class="font-bold text-sm uppercase mb-6 flex items-center gap-2 text-gray-700">🔥 Metabolism & Needs</h3>
              <div class="space-y-4">
                <div (click)="showBmrModal = true" class="bg-gray-50 p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-green-50 transition border border-gray-100">
                  <span class="text-sm font-medium text-gray-500">BMR (Base)</span>
                  <span class="text-xl font-black text-gray-800">{{ bmr }} <span class="text-xs font-normal text-gray-400">kcal</span></span>
                </div>
                <div (click)="showMaintenanceModal = true" class="bg-gray-50 p-4 rounded-2xl flex justify-between items-center border-l-4 border-green-500 cursor-pointer hover:bg-green-50 transition shadow-sm">
                  <span class="text-sm font-medium text-gray-500">Maintenance</span>
                  <span class="text-xl font-black text-green-700">{{ maintenanceCalories }} <span class="text-xs font-normal text-gray-400">kcal</span></span>
                </div>
                <div (click)="showWeightLossModal = true" class="bg-gray-50 p-4 rounded-2xl flex justify-between items-center border-l-4 border-orange-500 cursor-pointer hover:bg-orange-50 transition shadow-sm">
                  <span class="text-sm font-medium text-gray-500">Weight Loss</span>
                  <span class="text-xl font-black text-orange-700">{{ weightLossCalories }} <span class="text-xs font-normal text-gray-400">kcal</span></span>
                </div>
              </div>
              <p class="text-[10px] mt-6 text-gray-400 italic text-center">Harris-Benedict Formula (Moderate activity)</p>
            </div>

            <!-- SMART NUTRITION LINK -->
            <div class="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden group">
               <div class="absolute -top-10 -right-10 w-32 h-32 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-all"></div>
               <h3 class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">🥗 Smart Nutrition</h3>
               <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs font-bold text-gray-500">Daily Goal</p>
                    <p class="text-2xl font-black tracking-tight text-green-600">{{ maintenanceCalories }} kcal</p>
                  </div>
                  <a routerLink="/app/healthcare/diet" class="bg-green-50 hover:bg-green-100 text-green-600 p-3 rounded-2xl transition-all shadow-sm">➡️</a>
               </div>
               <p class="text-[10px] text-gray-400 mt-4 leading-relaxed italic font-medium">Synchronized with your weekly sports program.</p>
            </div>
          </div>

          <!-- Colonne Droite -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Expert Advice -->
            <div class="bg-white p-6 rounded-3xl border shadow-lg">
              <h3 class="font-black text-gray-800 text-sm uppercase mb-4 flex items-center gap-2">💡 Expert Advice</h3>
              <div class="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex gap-4">
                <span class="text-3xl">🛡️</span>
                <p class="text-sm text-amber-900 leading-relaxed font-medium">{{ personalizedAdvice }}</p>
              </div>
            </div>

            <!-- Plan d'activité hebdomadaire -->
            <div id="activity-plan-section" class="rounded-xl overflow-hidden border shadow-xl bg-white mb-6">
              <div class="bg-gradient-to-r from-green-700 to-emerald-700 px-6 py-5">
                <div class="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h3 class="font-bold text-white text-xl flex items-center gap-2">🗓️ Smart Sports Program</h3>
                    <p class="text-green-200 text-sm mt-1">Personalized by BMI: {{ selectedProfilee.bmiCategory }}</p>
                  </div>
                  <div class="flex items-center gap-3">
                    <button (click)="togglePlanMode()" class="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 rounded-full transition">
                      {{ showImcBasedPlan ? '📋 Normal Plan (with injuries)' : '📊 BMI-based Plan (ignore injuries)' }}
                    </button>
                    <div class="flex flex-col items-end">
                      <span class="bg-white/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm shadow-sm font-bold border border-white/10">
                        Cycle: Week {{ currentWeek }}/4
                      </span>
                      <span class="text-green-200 text-[10px] mt-1 italic">Changes in {{ daysUntilNextWeek }} days</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Alerte quotidienne -->
              <div *ngIf="todayActivity && !isPlanLoading" class="bg-green-600 px-6 py-3 flex items-center justify-between text-white animate-pulse-slow">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">⚡</span>
                  <div>
                    <p class="text-xs font-bold uppercase opacity-80">Today's Activity: {{ todayActivity.dayOfWeek }}</p>
                    <p class="font-bold text-lg">{{ todayActivity.activityName }} ({{ todayActivity.durationMinutes }} min)</p>
                  </div>
                </div>
                <div class="hidden md:block text-right">
                  <p class="text-xs opacity-80">Intensity</p>
                  <p class="font-medium">{{ todayActivity.intensity }}</p>
                </div>
              </div>

              <!-- Medical Alert -->
              <div *ngIf="!isPlanLoading && activityPlan.length > 0 && activityPlan[0].description.includes('🩹') && !showImcBasedPlan" class="bg-red-100 border-l-8 border-red-500 px-6 py-4 flex items-center gap-4">
                <span class="text-3xl">🩺</span>
                <div>
                  <p class="text-red-900 font-bold">RECOVERY MODE ACTIVE</p>
                  <p class="text-red-700 text-sm">This plan considers your injury. Click "BMI-based Plan" to see the program based only on your body composition.</p>
                </div>
              </div>

              <div *ngIf="isPlanLoading" class="p-12 text-center text-gray-500">
                <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent mb-4"></div>
                <p class="text-lg font-medium">Synchronizing...</p>
              </div>

              <!-- Tableau d'activités -->
              <div class="px-6 py-3 bg-gray-50 border-b flex justify-center">
                <button (click)="isTableVisible = !isTableVisible" class="text-green-700 font-bold hover:underline flex items-center gap-2">
                  {{ isTableVisible ? '⬇️ Hide table' : '⬇️ Show full program' }}
                </button>
              </div>
              
              <div *ngIf="isTableVisible && !isPlanLoading && activityPlan.length > 0" class="p-6 animate-fade-in">
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div class="lg:col-span-3 overflow-x-auto">
                    <table class="min-w-full border-collapse">
                      <thead>
                        <tr class="text-left text-xs font-bold text-green-700 uppercase tracking-widest border-b border-green-200">
                          <th class="pb-3 px-2">Day</th>
                          <th class="pb-3">Activity</th>
                          <th class="pb-3 text-center">Duration</th>
                          <th class="pb-3 text-center">Intensity</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-green-100">
                        <ng-container *ngFor="let act of activityPlan; let i = index">
                          <tr *ngIf="act.durationMinutes > 0" class="group transition-all hover:bg-green-50" [class.bg-green-50]="i === currentDayIndex">
                            <td class="py-4 px-2">
                              <div class="flex items-center gap-2">
                                <span *ngIf="i === currentDayIndex" class="text-green-600 animate-bounce">📍</span>
                                <span class="font-bold" [class.text-green-700]="i === currentDayIndex">{{ act.dayOfWeek }}</span>
                              </div>
                            </td>
                            <td class="py-4">
                              <p class="font-bold text-gray-800">{{ act.activityName }}</p>
                              <p class="text-xs text-gray-400 mt-0.5">{{ act.description }}</p>
                            </td>
                            <td class="py-4 text-center font-medium text-gray-600">{{ act.durationMinutes }} min</td>
                            <td class="py-4 text-center">
                              <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm"
                                [ngClass]="{
                                  'bg-green-100 text-green-700': act.intensity === 'Faible',
                                  'bg-amber-100 text-amber-700': act.intensity.includes('Modérée') || act.intensity.includes('Moderate'),
                                  'bg-rose-100 text-rose-700': act.intensity.includes('Élevée') || act.intensity.includes('High')
                                }">
                                {{ act.intensity }}
                              </span>
                            </td>
                          </tr>
                        </ng-container>
                      </tbody>
                    </table>
                  </div>
                  <div class="bg-green-50 rounded-2xl p-5 border border-green-100 shadow-inner">
                    <h4 class="font-black text-green-800 text-sm uppercase mb-4">📊 Week Summary {{ currentWeek }}</h4>
                    <div class="space-y-4">
                      <div class="bg-white p-3 rounded-xl shadow-sm border border-green-100">
                        <p class="text-xs text-green-600 font-bold uppercase">Total Volume</p>
                        <p class="text-2xl font-black text-green-700">{{ weeklySummary.totalMinutes }} min</p>
                      </div>
                      <div class="bg-white p-3 rounded-xl shadow-sm border border-green-100">
                        <p class="text-xs text-green-600 font-bold uppercase">Intensity Dominante</p>
                        <p class="text-lg font-black text-green-700">{{ weeklySummary.intensityLevel }}</p>
                      </div>
                      <div class="bg-white p-3 rounded-xl shadow-sm border border-green-100">
                        <p class="text-xs text-green-600 font-bold uppercase">Goal Focus</p>
                        <p class="text-sm font-bold text-gray-700">{{ weeklySummary.focus }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div *ngIf="isTableVisible && !isPlanLoading && activityPlan.length === 0" class="p-12 text-center text-gray-400">
                <p>No plan generated. Check BMI.</p>
              </div>
            </div>

            <!-- Health Score Chart -->
            <div class="bg-white rounded-xl shadow border p-5">
              <h3 class="text-lg font-bold text-gray-800 mb-3">📈 Health Score Evolution</h3>
              <canvas id="healthScoreChart" width="400" height="200" style="max-width:100%; height:auto;"></canvas>
              <p class="text-xs text-gray-500 mt-2">Based on the last 7 predictions.</p>
            </div>

            <!-- Prediction History -->
            <div class="bg-white rounded-xl shadow border p-5">
              <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-bold text-gray-800">📋 Latest Predictions</h3>
                <button *ngIf="scoresHistory.length > 0" (click)="clearAllScores()" class="text-xs text-red-600 hover:underline">Clear all</button>
              </div>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200" *ngIf="scoresHistory.length > 0; else noScores">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-3 py-2 text-left text-xs">Date</th>
                      <th class="px-3 py-2 text-left text-xs">Score</th>
                      <th class="px-3 py-2 text-left text-xs">Intensity</th>
                      <th class="px-3 py-2 text-left text-xs">Sleep</th>
                      <th class="px-3 py-2 text-left text-xs">Calories</th>
                      <th class="px-3 py-2 text-left text-xs">Duration</th>
                      <th class="px-3 py-2 text-right text-xs">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of scoresHistory.slice(0,10)">
                      <td class="px-3 py-2 text-sm">{{ item.date | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td class="px-3 py-2 text-sm font-bold text-green-600">{{ item.score }}</td>
                      <td class="px-3 py-2 text-sm">{{ item.params.intensity }}</td>
                      <td class="px-3 py-2 text-sm">{{ item.params.sleepHours }}</td>
                      <td class="px-3 py-2 text-sm">{{ item.params.caloriesIn }}</td>
                      <td class="px-3 py-2 text-sm">{{ item.params.duration }}</td>
                      <td class="px-3 py-2 text-right"><button (click)="deleteScore(item.date)" class="text-red-500">🗑️</button></td>
                    </tr>
                  </tbody>
                </table>
                <ng-template #noScores><div class="text-center py-6 text-gray-400 italic">No recorded score.</div></ng-template>
              </div>
            </div>

            <div class="flex justify-end"><button (click)="downloadProfilee(selectedProfilee)" class="bg-green-600 text-white px-4 py-2 rounded-lg">📥 Download File</button></div>
          </div>
        </div>
      </div>

      <!-- MODAL BMR -->
      <div *ngIf="showBmrModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" (click)="closeAllModals()">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 class="text-xl font-bold">📊 Basal Metabolic Rate (BMR) Details</h2>
            <button (click)="closeAllModals()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          <div class="p-6">
            <p class="text-gray-600 mb-4">BMR is the minimum energy at rest. Adapted to your profile ({{ selectedProfilee?.gender === 'MALE' ? 'Male' : 'Female' }}, BMI {{ selectedProfilee?.bmi | number:'1.1-1' }}).</p>
            <div class="overflow-x-auto">
              <table class="min-w-full border-collapse border border-green-200">
                <thead class="bg-green-50"><tr><th class="border p-2 text-left">Category</th><th class="border p-2 text-left">Value / Advice</th></tr></thead>
                <tbody>
                  <tr><td class="border p-2 font-bold">Calculated BMR</td><td class="border p-2">{{ bmr }} kcal/day</td></tr>
                  <tr><td class="border p-2 font-bold">Proteins (g)</td><td class="border p-2">{{ getBmrMacro('proteins') }}</td></tr>
                  <tr><td class="border p-2 font-bold">Lipids (g)</td><td class="border p-2">{{ getBmrMacro('lipids') }}</td></tr>
                  <tr><td class="border p-2 font-bold">Carbs (g)</td><td class="border p-2">{{ getBmrMacro('carbs') }}</td></tr>
                  <tr><td class="border p-2 font-bold">Recommendation</td><td class="border p-2">{{ getBmrAdviceDetail() }}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL MAINTIEN -->
      <div *ngIf="showMaintenanceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" (click)="closeAllModals()">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 class="text-xl font-bold">⚖️ Details – Maintenance Calories</h2>
            <button (click)="closeAllModals()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          <div class="p-6">
            <p class="text-gray-600 mb-4">Daily intake to stabilize your weight with moderate activity.</p>
            <div class="overflow-x-auto">
              <table class="min-w-full border-collapse border border-green-200">
                <thead class="bg-green-50"><tr><th class="border p-2">Macronutriment</th><th class="border p-2">Grammes / jour</th><th class="border p-2">Calories</th></tr></thead>
                <tbody>
                  <tr><td class="border p-2 font-bold">Proteins</td><td class="border p-2">{{ getMaintenanceMacro('proteins_g') }}</td><td class="border p-2">{{ getMaintenanceMacro('proteins_kcal') }}</td></tr>
                  <tr><td class="border p-2 font-bold">Lipides</td><td class="border p-2">{{ getMaintenanceMacro('lipids_g') }}</td><td class="border p-2">{{ getMaintenanceMacro('lipids_kcal') }}</td></tr>
                  <tr><td class="border p-2 font-bold">Glucides</td><td class="border p-2">{{ getMaintenanceMacro('carbs_g') }}</td><td class="border p-2">{{ getMaintenanceMacro('carbs_kcal') }}</td></tr>
                  <tr class="bg-gray-50"><td class="border p-2 font-bold">Total</td><td class="border p-2"></td><td class="border p-2 font-bold">{{ maintenanceCalories }} kcal</td></tr>
                </tbody>
              </table>
            </div>
            <p class="text-sm text-gray-500 mt-4 italic">{{ getMaintenanceAdvice() }}</p>
          </div>
        </div>
      </div>

      <!-- MODAL PERTE DE POIDS -->
      <div *ngIf="showWeightLossModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" (click)="closeAllModals()">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 class="text-xl font-bold">🔥 Details – Weight Loss (Moderate deficit)</h2>
            <button (click)="closeAllModals()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          <div class="p-6">
            <p class="text-gray-600 mb-4">Goal: lose about 0.5 kg per week.</p>
            <div class="overflow-x-auto">
              <table class="min-w-full border-collapse border border-green-200">
                <thead class="bg-green-50"><tr><th class="border p-2">Macronutriment</th><th class="border p-2">Grammes / jour</th><th class="border p-2">Calories</th></tr></thead>
                <tbody>
                  <tr><td class="border p-2 font-bold">Proteins</td><td class="border p-2">{{ getWeightLossMacro('proteins_g') }}</td><td class="border p-2">{{ getWeightLossMacro('proteins_kcal') }}</td></tr>
                  <tr><td class="border p-2 font-bold">Lipides</td><td class="border p-2">{{ getWeightLossMacro('lipids_g') }}</td><td class="border p-2">{{ getWeightLossMacro('lipids_kcal') }}</td></tr>
                  <tr><td class="border p-2 font-bold">Glucides</td><td class="border p-2">{{ getWeightLossMacro('carbs_g') }}</td><td class="border p-2">{{ getWeightLossMacro('carbs_kcal') }}</td></tr>
                  <tr class="bg-gray-50"><td class="border p-2 font-bold">Total</td><td class="border p-2"></td><td class="border p-2 font-bold">{{ weightLossCalories }} kcal</td></tr>
                </tbody>
              </table>
            </div>
            <p class="text-sm text-gray-500 mt-4 italic">{{ getWeightLossAdvice() }}</p>
          </div>
        </div>
      </div>

      <!-- ==================== CHAT INTELLIGENT ==================== -->
      <!-- Bouton flottant pour ouvrir/fermer le chat -->
      <button (click)="toggleChat()" class="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-all transform hover:scale-110">
        <span class="text-2xl">💬</span>
      </button>

      <!-- Widget Chat (caché par défaut) -->
      <div *ngIf="chatVisible" class="fixed bottom-24 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in">
        <div class="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 flex justify-between items-center text-white">
          <div class="flex items-center gap-2">
            <span class="text-xl">🤖</span>
            <span class="font-bold">Coach Santé IA</span>
          </div>
          <button (click)="toggleChat()" class="text-white hover:text-gray-200">&times;</button>
        </div>
<div class="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50" #chatScrollContainer>
          <div class="text-center text-xs text-gray-400">Posez une question ou demandez à calculer votre score.</div>
          <div *ngFor="let msg of chatMessages" [class.text-right]="msg.sender === 'user'" class="flex">
            <div [class.bg-green-100]="msg.sender === 'user'" [class.bg-gray-200]="msg.sender !== 'user'" class="rounded-xl px-3 py-2 max-w-[80%] text-sm">
              {{ msg.text }}
            </div>
          </div>
          <div *ngIf="chatLoading" class="flex justify-start"><div class="bg-gray-200 rounded-xl px-3 py-2 text-sm italic">...</div></div>
        </div>
        <div class="border-t p-3 flex gap-2 bg-white">
          <input type="text" [(ngModel)]="chatInput" (keyup.enter)="sendChatMessage()" placeholder="Ex: Calcule mon score avec intensité 5, sommeil 7, calories 2500, durée 60" class="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
          <button (click)="sendChatMessage()" [disabled]="!chatInput.trim() || chatLoading" class="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50">Envoyer</button>
        </div>
        <div class="bg-gray-50 text-[10px] text-gray-400 text-center py-1">Paramètres: intensité (1-10), sommeil (h), calories (kcal), durée (min)</div>
      </div>

      <!-- MODAL création / modification -->
      <div *ngIf="modalVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between">
            <h2 class="text-xl font-bold">{{ editingId ? 'Edit' : 'New' }} Health Profile</h2>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          <form #profileForm="ngForm" (ngSubmit)="save()" class="p-6 space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label>User *</label><select *ngIf="users.length>0" [(ngModel)]="form.userId" name="userId" required class="w-full p-2 border rounded" [disabled]="!isAdmin"><option *ngFor="let u of users" [value]="u.id">{{ u.firstName }} {{ u.lastName }}</option></select><input *ngIf="users.length===0" type="number" [(ngModel)]="form.userId" name="userId" required class="w-full p-2 border rounded" placeholder="User ID" [disabled]="!isAdmin"></div>
              <div><label>Age *</label><input type="number" [(ngModel)]="form.age" name="age" required class="w-full p-2 border rounded"></div>
              <div><label>Weight (kg) *</label><input type="number" step="0.1" [(ngModel)]="form.weight" name="weight" required class="w-full p-2 border rounded"></div>
              <div><label>Height (cm) *</label><input type="number" step="0.1" [(ngModel)]="form.height" name="height" required class="w-full p-2 border rounded"></div>
              <div><label>Gender *</label><select [(ngModel)]="form.gender" name="gender" required class="w-full p-2 border rounded"><option value="MALE">Male</option><option value="FEMALE">Female</option></select></div>
              <div><label>Sports Position</label><input type="text" [(ngModel)]="form.sportPosition" class="w-full p-2 border rounded"></div>
              <div><label>Fitness Status</label><select [(ngModel)]="form.fitnessStatus" class="w-full p-2 border rounded"><option value="ACTIVE">Active</option><option value="LIMITED">Limited</option><option value="INJURED">Injured</option><option value="RECOVERING">Recovering</option><option value="RESTING">Resting</option></select></div>
              <div><label>Emergency Contact</label><input type="text" [(ngModel)]="form.emergencyContact" class="w-full p-2 border rounded"></div>
              <div><label>Emergency Phone *</label><input type="text" [(ngModel)]="form.emergencyPhone" name="emergencyPhone" required pattern="^\\d{8,}$" class="w-full p-2 border rounded"></div>
              <div><label>Blood Type</label><select [(ngModel)]="form.bloodType" class="w-full p-2 border rounded"><option *ngFor="let bt of bloodTypes" [value]="bt">{{ bt }}</option></select></div>
            </div>
            <div><label>Allergies</label><textarea rows="2" [(ngModel)]="form.allergies" class="w-full p-2 border rounded"></textarea></div>
            <div><label>Medical Conditions</label><textarea rows="2" [(ngModel)]="form.medicalConditions" class="w-full p-2 border rounded"></textarea></div>
            <div *ngIf="form.weight > 0 && form.height > 0" class="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div class="flex justify-between items-center">
                <div><p class="text-xs font-bold text-blue-600 uppercase">BMI Preview</p><p class="text-xl font-black text-blue-800">{{ getPreviewBmi() | number:'1.1-1' }} <span class="text-sm font-normal">({{ getPreviewBmiCategory() }})</span></p></div>
                <div class="text-right"><p class="text-[10px] text-blue-500 italic">The sports program will be dynamically generated based on these values.</p></div>
              </div>
            </div>
            <div class="flex justify-end gap-3"><button type="button" (click)="closeModal()" class="px-4 py-2 border rounded-lg">Cancel</button><button type="submit" class="px-5 py-2 bg-green-600 text-white rounded-lg">{{ editingId ? 'Update' : 'Create' }}</button></div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    input.ng-invalid.ng-touched, select.ng-invalid.ng-touched, textarea.ng-invalid.ng-touched { border-color: #ef4444; }
    .animate-bounce { animation: bounce 0.5s ease-in-out; }
    @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-pulse-slow { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
  `]
})
export class HealthProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  profiles: HealthProfileResponse[] = [];
  users: User[] = [];
  private userMap = new Map<number, string>();
  isLoading = true;
  isAdmin = false;
  currentUserId: number | null = null;
  modalVisible = false;
  selectedProfilee: HealthProfileResponse | null = null;
  isSubmitting = false;
  editingId: number | null = null;
  form: HealthProfileRequest & { gender?: string } = {
    userId: 0, weight: 0, height: 0, age: 0, sportPosition: '', fitnessStatus: 'ACTIVE',
    emergencyContact: '', emergencyPhone: '00000000', bloodType: 'A+', allergies: '',
    medicalConditions: '', gender: 'MALE'
  };
  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  notification = '';
  notificationType: 'success' | 'error' = 'success';

  bmr = 0;
  maintenanceCalories = 0;
  weightLossCalories = 0;
  weightGainCalories = 0;
  healthScore = 0;
  healthScoreMessage = '';
  personalizedAdvice = '';

  activityPlan: ActivityRecommendation[] = [];
  isPlanLoading = false;
  currentWeek = 1;
  currentDayIndex = 0;
  daysUntilNextWeek = 0;
  todayActivity: ActivityRecommendation | null = null;
  weeklySummary = { totalMinutes: 0, intensityLevel: '', focus: '' };

  scoresHistory: SavedScore[] = [];

  showBmrModal = false;
  showMaintenanceModal = false;
  showWeightLossModal = false;

  showImcBasedPlan: boolean = false;
  isTableVisible: boolean = false;

  // Chat
  chatVisible = false;
  chatInput = '';
  chatMessages: { sender: 'user' | 'bot'; text: string }[] = [];
  chatLoading = false;

  private apiBaseUrl = 'http://localhost:8085/api/health-profiles';
  private chatApiUrl = 'http://localhost:8085/api/chat';

  constructor(
    private healthService: HealthProfileService,
    private userService: UserService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.initUserData();
    this.loadProfilees();
    this.loadScoresHistory();
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    const today = new Date().getDay();
    this.currentDayIndex = today === 0 ? 6 : today - 1;
  }

  private initUserData() {
    const role = localStorage.getItem('user_type');
    this.isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN' || role === 'ROLE_FIELD_OWNER' || role === 'FIELD_OWNER';
    const userIdStr = localStorage.getItem('user_id');
    this.currentUserId = userIdStr && !isNaN(parseInt(userIdStr)) ? parseInt(userIdStr) : null;
    this.loadUsers();
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
  }

  ngAfterViewInit() {
    setTimeout(() => this.drawHealthScoreChart(), 500);
  }

  // ---------- CHAT LOGIC ----------
  toggleChat() {
    this.chatVisible = !this.chatVisible;
    if (this.chatVisible) {
      setTimeout(() => this.scrollChatToBottom(), 100);
    }
  }

  scrollChatToBottom() {
    const container = document.querySelector('#chatMessages');
    if (container) container.scrollTop = container.scrollHeight;
  }

  sendChatMessage() {
    const msg = this.chatInput.trim();
    if (!msg || this.chatLoading) return;
    this.chatMessages.push({ sender: 'user', text: msg });
    this.chatInput = '';
    this.scrollChatToBottom();
    this.chatLoading = true;

    // Appel au backend Spring Boot
    this.http.post<{ reply: string; healthScore?: number }>(this.chatApiUrl, { message: msg }).subscribe({
      next: (res) => {
        this.chatLoading = false;
        let botReply = res.reply;
        // Extraire le score numérique si présent
        const scoreMatch = botReply.match(/Score\s*:\s*(\d+)/i);
        if (scoreMatch && res.healthScore !== undefined && res.healthScore !== null) {
          const scoreValue = Math.round(res.healthScore);
          botReply = `✅ Score calculé : ${scoreValue}/100. ${botReply.replace(/Score\s*:\s*\d+/i, '').trim()}`;
          // Enregistrer le score avec les paramètres extraits de la question
          this.extractAndSaveScore(msg, scoreValue);
        }
        this.chatMessages.push({ sender: 'bot', text: botReply });
        this.scrollChatToBottom();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.chatLoading = false;
        console.error('Chat error', err);
        this.chatMessages.push({ sender: 'bot', text: 'Désolé, une erreur est survenue. Veuillez réessayer.' });
        this.scrollChatToBottom();
        this.cdr.detectChanges();
      }
    });
  }

  private extractAndSaveScore(userMessage: string, score: number) {
    // Extraction des paramètres depuis la phrase (ex: intensité 5, sommeil 7, calories 2500, durée 60)
    const intensityMatch = userMessage.match(/intensité\s*(\d+)/i) || userMessage.match(/intensity\s*(\d+)/i);
    const sleepMatch = userMessage.match(/sommeil\s*(\d+)/i) || userMessage.match(/sleep\s*(\d+)/i);
    const caloriesMatch = userMessage.match(/calories\s*(\d+)/i);
    const durationMatch = userMessage.match(/durée\s*(\d+)/i) || userMessage.match(/duration\s*(\d+)/i);

    const params = {
      intensity: intensityMatch ? parseInt(intensityMatch[1], 10) : 5,
      sleepHours: sleepMatch ? parseFloat(sleepMatch[1]) : 7,
      caloriesIn: caloriesMatch ? parseInt(caloriesMatch[1], 10) : 2500,
      duration: durationMatch ? parseInt(durationMatch[1], 10) : 60
    };

    const newScore: SavedScore = {
      date: new Date().toISOString(),
      score: score,
      params: params
    };

    const targetUserId = this.selectedProfilee ? this.selectedProfilee.userId : (this.currentUserId || 0);
    const key = `healthScores_${targetUserId}`;
    let existing: SavedScore[] = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(newScore);
    existing.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    localStorage.setItem(key, JSON.stringify(existing));
    this.loadScoresHistory();
    this.updateHealthScoreFromHistory();
    this.showNotification(`Score ${score} enregistré !`, 'success');
  }

  private updateHealthScoreFromHistory() {
    const recent = this.scoresHistory.slice(0, 3);
    if (recent.length === 0) {
      this.healthScore = 0;
      this.healthScoreMessage = 'Aucun score';
    } else {
      const avg = recent.reduce((sum, s) => sum + s.score, 0) / recent.length;
      this.healthScore = Math.round(avg);
      if (this.healthScore >= 80) this.healthScoreMessage = 'Excellent';
      else if (this.healthScore >= 60) this.healthScoreMessage = 'Bon';
      else this.healthScoreMessage = 'À améliorer';
    }
    this.cdr.detectChanges();
  }

  get averageRecentScore(): number {
    const recent = this.scoresHistory.slice(0, 3);
    if (recent.length === 0) return 0;
    return Math.round(recent.reduce((sum, s) => sum + s.score, 0) / recent.length);
  }

  get healthSummaryMessage(): string {
    const avg = this.averageRecentScore;
    if (avg === 0) return 'Aucune donnée de score. Utilisez le chat pour évaluer votre santé.';
    if (avg >= 80) return 'Excellent état de santé général. Continuez vos bonnes habitudes !';
    if (avg >= 60) return 'Bon niveau. Quelques ajustements nutritionnels ou de récupération pourraient améliorer votre score.';
    return 'Attention : votre score santé est faible. Consultez les recommandations personnalisées.';
  }

  // ---------- FIN CHAT ----------

  loadScoresHistory() {
    const targetUserId = this.selectedProfilee ? this.selectedProfilee.userId : (this.currentUserId || 0);
    const key = `healthScores_${targetUserId}`;
    const stored = localStorage.getItem(key);
    this.scoresHistory = stored ? JSON.parse(stored) : [];
    this.scoresHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.updateHealthScoreFromHistory();
    this.drawHealthScoreChart();
  }

  deleteScore(date: string) {
    const targetUserId = this.selectedProfilee ? this.selectedProfilee.userId : (this.currentUserId || 0);
    const key = `healthScores_${targetUserId}`;
    this.scoresHistory = this.scoresHistory.filter(s => s.date !== date);
    localStorage.setItem(key, JSON.stringify(this.scoresHistory));
    this.updateHealthScoreFromHistory();
    this.showNotification('Score deleted', 'success');
    this.drawHealthScoreChart();
  }

  clearAllScores() {
    const targetUserId = this.selectedProfilee ? this.selectedProfilee.userId : (this.currentUserId || 0);
    const key = `healthScores_${targetUserId}`;
    if (confirm('Delete all history?')) {
      this.scoresHistory = [];
      localStorage.removeItem(key);
      this.updateHealthScoreFromHistory();
      this.showNotification('History cleared', 'success');
      this.drawHealthScoreChart();
    }
  }

  private handleStorageChange(event: StorageEvent) {
    const targetUserId = this.selectedProfilee ? this.selectedProfilee.userId : (this.currentUserId || 0);
    const key = `healthScores_${targetUserId}`;
    if (event.key === key) this.loadScoresHistory();
  }

  drawHealthScoreChart() {
    const canvas = document.getElementById('healthScoreChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const all = [...this.scoresHistory].reverse();
    const last7 = all.slice(-7);
    const labels = last7.map(s => new Date(s.date).toLocaleDateString());
    const data = last7.map(s => s.score);
    // Destroy existing chart if any
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();
    new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ label: 'Health Score', data, borderColor: '#1DB954', backgroundColor: 'rgba(29,185,84,0.1)', tension: 0.2, fill: true }] },
      options: { responsive: true, maintainAspectRatio: true }
    });
  }

  loadUsers() {
    if (this.isAdmin) {
      this.userService.getAll().subscribe({
        next: (users) => {
          this.users = users;
          users.forEach(u => this.userMap.set(u.id, `${u.firstName} ${u.lastName}`));
        },
        error: () => { }
      });
    } else {
      const userName = localStorage.getItem('user_name') || 'User';
      if (this.currentUserId) {
        const user: User = { id: this.currentUserId, firstName: userName.split(' ')[0], lastName: userName.split(' ')[1] || '', email: '' };
        this.users = [user];
        this.userMap.set(user.id, `${user.firstName} ${user.lastName}`);
        this.form.userId = user.id;
      } else {
        this.users = [];
        this.form.userId = 0;
      }
    }
  }

  loadProfilees() {
    this.isLoading = true;
    if (this.isAdmin) {
      this.healthService.getAll().subscribe({
        next: (data) => {
          this.profiles = data.map(p => ({ ...p, gender: (p as any).gender || 'MALE', bmiCategory: p.bmiCategory || this.getBmiCategory(p.bmi || 0) }));
          this.isLoading = false;
          this.cdr.detectChanges();
          if (this.profiles.length > 0 && !this.selectedProfilee) {
            this.showDetails(this.profiles[0]);
          }
        },
        error: () => { this.showNotification('Error loading profiles', 'error'); this.isLoading = false; this.cdr.detectChanges(); }
      });
    } else if (this.currentUserId) {
      this.healthService.getByUserId(this.currentUserId).subscribe({
        next: (p) => {
          this.profiles = p ? [{ ...p, gender: (p as any).gender || 'MALE', bmiCategory: p.bmiCategory || this.getBmiCategory(p.bmi || 0) }] : [];
          this.isLoading = false;
          this.cdr.detectChanges();
          if (this.profiles.length > 0 && !this.selectedProfilee) {
            this.showDetails(this.profiles[0]);
          }
        },
        error: () => { this.profiles = []; this.isLoading = false; this.cdr.detectChanges(); }
      });
    } else {
      this.profiles = [];
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  getUserName(userId: number): string {
    if (this.userMap.has(userId)) return this.userMap.get(userId)!;
    const user = this.users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : `User ${userId}`;
  }

  private getBmiCategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Weight normal';
    if (bmi < 30) return 'Overweight';
    return 'Obesity';
  }

  showDetails(profile: HealthProfileResponse) {
    if (!profile) return;
    this.selectedProfilee = profile;
    setTimeout(() => {
      const element = document.getElementById('patient-details');
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    this.computeMetrics(profile);
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDays = (now.getTime() - startOfYear.getTime()) / 86400000;
    const weekNum = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
    this.currentWeek = ((weekNum - 1) % 4) + 1;
    this.loadActivityPlanFromBackend(profile.userId, this.currentWeek);
    this.loadScoresHistory();
    setTimeout(() => this.drawHealthScoreChart(), 300);
  }

  closeDetails() {
    this.selectedProfilee = null;
    this.activityPlan = [];
  }

  private computeMetrics(profile: HealthProfileResponse) {
    if (profile.bmr && profile.maintenanceCalories) {
      this.bmr = profile.bmr;
      this.maintenanceCalories = profile.maintenanceCalories;
      this.weightLossCalories = profile.weightLossCalories || this.maintenanceCalories - 500;
      this.weightGainCalories = profile.weightGainCalories || this.maintenanceCalories + 300;
      this.healthScore = profile.healthScore || 0;
      this.healthScoreMessage = profile.healthScoreMessage || '';
      this.personalizedAdvice = profile.personalizedAdvice || '';
    } else {
      const isMale = profile.gender === 'MALE';
      const w = profile.weight, h = profile.height, a = profile.age;
      let bmrCalc = isMale ? (88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a))
        : (447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a));
      this.bmr = Math.round(bmrCalc);
      this.maintenanceCalories = Math.round(this.bmr * 1.375);
      this.weightLossCalories = Math.max(1200, this.maintenanceCalories - 500);
      this.weightGainCalories = this.maintenanceCalories + 300;
      // Le score santé initial sera remplacé par l'historique
      this.healthScore = 0;
      this.healthScoreMessage = 'Utilisez le chat pour évaluer votre santé';
      this.personalizedAdvice = profile.personalizedAdvice || 'Complétez vos données pour obtenir des recommandations.';
    }
    this.updateHealthScoreFromHistory();
  }

  togglePlanMode() {
    this.showImcBasedPlan = !this.showImcBasedPlan;
    if (this.selectedProfilee) {
      this.loadActivityPlanFromBackend(this.selectedProfilee.userId, this.currentWeek);
    }
  }

  loadActivityPlanFromBackend(userId: number, week?: number) {
    this.isPlanLoading = true;
    this.activityPlan = [];
    const timeout = setTimeout(() => this.generateFallbackPlan(), 3000);
    const cacheBuster = `?_=${new Date().getTime()}`;
    let url: string;
    if (this.showImcBasedPlan) {
      url = `${this.apiBaseUrl}/user/${userId}/activities/${week}/ignore-injuries${cacheBuster}`;
    } else {
      url = `${this.apiBaseUrl}/user/${userId}/activities/${week}${cacheBuster}`;
    }
    this.http.get<ActivityRecommendation[]>(url).subscribe({
      next: (plan) => {
        clearTimeout(timeout);
        if (plan && plan.length) {
          this.activityPlan = plan.map(act => {
            if (act.durationMinutes === 0 || act.activityName.toLowerCase().includes('repos')) {
              return {
                ...act,
                activityName: 'Active Recovery',
                durationMinutes: 20,
                intensity: 'Low',
                description: 'Light stretching and mobility.'
              };
            }
            return act;
          });
          this.isPlanLoading = false;
          this.processPlanMetadata();
        } else {
          this.generateFallbackPlan();
        }
      },
      error: () => {
        clearTimeout(timeout);
        this.generateFallbackPlan();
      }
    });
  }

  private processPlanMetadata() {
    if (!this.activityPlan.length) return;
    this.todayActivity = this.activityPlan[this.currentDayIndex] || this.activityPlan[0];
    const totalMinutes = this.activityPlan.reduce((acc, a) => acc + a.durationMinutes, 0);
    const intensities = this.activityPlan.map(a => a.intensity);
    const freq: Record<string, number> = {};
    intensities.forEach(i => freq[i] = (freq[i] || 0) + 1);
    let maxIntensity = '', maxCount = 0;
    for (const [int, count] of Object.entries(freq)) {
      if (count > maxCount) { maxCount = count; maxIntensity = int; }
    }
    this.weeklySummary = {
      totalMinutes,
      intensityLevel: maxIntensity || 'Moderate',
      focus: this.selectedProfilee?.bmiCategory || 'Maintenance'
    };
    const now = new Date();
    const nextMonday = new Date();
    nextMonday.setDate(now.getDate() + (7 - (now.getDay() || 7) + 1));
    nextMonday.setHours(0, 0, 0, 0);
    this.daysUntilNextWeek = Math.ceil((nextMonday.getTime() - now.getTime()) / (1000 * 3600 * 24));
  }

  private generateFallbackPlan() {
    if (!this.selectedProfilee) {
      this.isPlanLoading = false;
      return;
    }
    const bmi = this.selectedProfilee.bmi || 0;
    const isMale = this.selectedProfilee.gender === 'MALE';
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let activities: string[][] = [];
    if (bmi < 18.5) {
      activities = isMale ? [
        ['Strength Training', '50', 'High', 'Dumbbells, heavy loads.'],
        ['Yoga', '30', 'Low', 'Active recovery.'],
        ['Leg Day (Power)', '50', 'High', 'Squats, lunges.'],
        ['Light Cardio', '30', 'Low', 'Cycling or walking.'],
        ['Full Body Explosion', '45', 'High', 'Free weights.'],
        ['Swimming', '40', 'Moderate', 'Volume.'],
        ['Stretching', '20', 'Low', 'Deep stretching.']
      ] : [
        ['Toning Pilates', '45', 'Moderate', 'Gentle strengthening.'],
        ['Power walking', '40', 'Low', 'Gentle endurance.'],
        ['Vinyasa Yoga', '50', 'Moderate', 'Flexibility.'],
        ['Core Training', '30', 'Moderate', 'Abs.'],
        ['Elastic Resistance', '40', 'Moderate', 'Toning.'],
        ['Dance / Zumba', '45', 'Moderate', 'Fun cardio.'],
        ['Relaxing walk', '30', 'Low', 'Active recovery.']
      ];
    } else if (bmi < 25) {
      activities = isMale ? [
        ['Running (8km)', '45', 'High', 'Steady pace.'],
        ['Cross-training HIIT', '50', 'High', 'High intensity.'],
        ['Swimming (Crawl)', '45', 'High', 'Speed.'],
        ['Stretching', '30', 'Low', 'Flexibility.'],
        ['Boxing / Bag', '45', 'High', 'Explosiveness.'],
        ['Football / Basketball', '60', 'High', 'Sport cardio.'],
        ['Cycling', '45', 'Moderate', 'Active endurance.']
      ] : [
        ['Jogging (5km)', '40', 'Moderate', 'Endurance.'],
        ['Fitness HIIT', '45', 'Moderate', 'Sculpt.'],
        ['Swimming (Mixed)', '45', 'Moderate', 'Full body.'],
        ['Power Yoga', '40', 'Moderate', 'Strength.'],
        ['Cardio Dance', '40', 'Moderate', 'Rhythm.'],
        ['Tennis / Hiking', '60', 'Moderate', 'Outdoors.'],
        ['Pilates', '45', 'Moderate', 'Posture.']
      ];
    } else {
      activities = [
        ['Brisk walking', '45', 'Moderate', 'Cardio without impact.'],
        ['Water aerobics', '45', 'Moderate', 'Protected joints.'],
        ['Stationary bike', '40', 'Low', 'Gentle resistance.'],
        ['Beginner Yoga', '30', 'Low', 'Mobility.'],
        ['Forest walk', '50', 'Low', 'Nature.'],
        ['Gentle swimming', '30', 'Low', 'Relaxation.'],
        ['Stretching', '20', 'Low', 'Stretching.']
      ];
    }
    this.activityPlan = activities.map((a, i) => ({
      dayOfWeek: days[i],
      activityName: a[0],
      durationMinutes: parseInt(a[1]),
      intensity: a[2],
      description: a[3]
    }));
    this.isPlanLoading = false;
    this.processPlanMetadata();
  }

  scrollToActivityTable() {
    const element = document.getElementById('activity-plan-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      element.classList.add('ring-4', 'ring-green-400', 'rounded-xl');
      setTimeout(() => element.classList.remove('ring-4', 'ring-green-400'), 1500);
    }
  }

  getBmiAdvice(): string {
    if (!this.selectedProfilee) return '';
    const bmi = this.selectedProfilee.bmi;
    if (bmi < 18.5) return '🍽️ Increase protein and strength training';
    if (bmi < 25) return '⚖️ Maintain cardio + strength';
    if (bmi < 30) return '🚶 Prioritize walking and water aerobics';
    return '🩺 Gentle activities, medical advice recommended';
  }

  openBmrModal() { this.showBmrModal = true; }
  openMaintenanceModal() { this.showMaintenanceModal = true; }
  openWeightLossModal() { this.showWeightLossModal = true; }
  closeAllModals() {
    this.showBmrModal = false;
    this.showMaintenanceModal = false;
    this.showWeightLossModal = false;
  }

  getBmrMacro(type: string): string {
    if (!this.selectedProfilee) return '—';
    const weight = this.selectedProfilee.weight;
    const bmi = this.selectedProfilee.bmi;
    let proteinPerKg = 1.2;
    if (bmi < 18.5) proteinPerKg = 1.8;
    else if (bmi < 25) proteinPerKg = 1.6;
    else if (bmi < 30) proteinPerKg = 1.5;
    else proteinPerKg = 1.4;
    const proteinsG = Math.round(proteinPerKg * weight);
    const lipidsKcal = this.bmr * 0.25;
    const lipidsG = Math.round(lipidsKcal / 9);
    const carbsKcal = this.bmr - (proteinsG * 4) - (lipidsG * 9);
    const carbsG = Math.round(carbsKcal / 4);
    if (type === 'proteins') return `${proteinsG} g`;
    if (type === 'lipids') return `${lipidsG} g`;
    if (type === 'carbs') return `${carbsG} g`;
    return '';
  }

  getBmrAdviceDetail(): string {
    if (!this.selectedProfilee) return '';
    const isMale = this.selectedProfilee.gender === 'MALE';
    const bmi = this.selectedProfilee.bmi;
    if (bmi < 18.5) return isMale ? 'Increase protein and strength training.' : 'Prioritize quality protein and fats.';
    if (bmi < 25) return isMale ? 'Protein/carb balance for performance.' : 'Varied diet, keep it up.';
    if (bmi < 30) return isMale ? 'Reduce carbs, increase fiber.' : 'Control portions, vegetables and lean protein.';
    return isMale ? 'Consult a nutritionist.' : 'Prioritize low-calorie foods.';
  }

  getMaintenanceMacro(type: string): string {
    if (!this.selectedProfilee) return '—';
    const proteinsKcal = this.maintenanceCalories * 0.30;
    const lipidsKcal = this.maintenanceCalories * 0.25;
    const carbsKcal = this.maintenanceCalories * 0.45;
    const proteinsG = Math.round(proteinsKcal / 4);
    const lipidsG = Math.round(lipidsKcal / 9);
    const carbsG = Math.round(carbsKcal / 4);
    const map: any = {
      proteins_g: proteinsG, proteins_kcal: Math.round(proteinsKcal),
      lipids_g: lipidsG, lipids_kcal: Math.round(lipidsKcal),
      carbs_g: carbsG, carbs_kcal: Math.round(carbsKcal)
    };
    return map[type] ?? '';
  }

  getMaintenanceAdvice(): string {
    if (!this.selectedProfilee) return '';
    const bmi = this.selectedProfilee.bmi;
    if (bmi < 18.5) return '⚠️ Underweight: these calories are a minimum. Add snacks.';
    if (bmi < 25) return '✅ Excellent balance. Vary whole carbs.';
    if (bmi < 30) return '📉 Watch out for hidden fats, steam cooking.';
    return '🩺 Medical follow-up recommended.';
  }

  getWeightLossMacro(type: string): string {
    if (!this.selectedProfilee) return '—';
    const proteinsKcal = this.weightLossCalories * 0.35;
    const lipidsKcal = this.weightLossCalories * 0.20;
    const carbsKcal = this.weightLossCalories * 0.45;
    const proteinsG = Math.round(proteinsKcal / 4);
    const lipidsG = Math.round(lipidsKcal / 9);
    const carbsG = Math.round(carbsKcal / 4);
    const map: any = {
      proteins_g: proteinsG, proteins_kcal: Math.round(proteinsKcal),
      lipids_g: lipidsG, lipids_kcal: Math.round(lipidsKcal),
      carbs_g: carbsG, carbs_kcal: Math.round(carbsKcal)
    };
    return map[type] ?? '';
  }

  getWeightLossAdvice(): string {
    if (!this.selectedProfilee) return '';
    const isMale = this.selectedProfilee.gender === 'MALE';
    const bmi = this.selectedProfilee.bmi;
    if (bmi < 18.5) return '⚠️ Weight loss not recommended. Aim for muscle gain.';
    if (bmi < 25) return isMale ? 'Light deficit, not below 1800 kcal.' : 'Moderate deficit + cardio 3x/week.';
    if (bmi < 30) return isMale ? 'Reduce sugars, increase vegetables.' : 'Spread meals to avoid cravings.';
    return 'Consult a professional before a restrictive diet.';
  }

  downloadProfilee(profile: HealthProfileResponse) {
    const userName = this.getUserName(profile.userId);
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Health Profile - ${userName}</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; margin: 40px; background: #eff6ff; color: #1e293b; }
    .card { max-width: 800px; margin: auto; background: white; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); overflow: hidden; }
    .header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .section { margin-bottom: 25px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
    .section h3 { color: #2563eb; margin-bottom: 10px; font-size: 18px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .label { font-weight: bold; color: #64748b; font-size: 13px; }
    .value { font-weight: 600; color: #1e293b; }
    footer { text-align: center; padding: 15px; color: #94a3b8; font-size: 11px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header"><h1>🩺 Athlete Health Profile</h1><p>${userName}</p></div>
    <div class="content">
      <div class="section"><h3>👤 Biometrics</h3><div class="grid">
        <div><div class="label">Age</div><div class="value">${profile.age} years</div></div>
        <div><div class="label">BMI</div><div class="value">${profile.bmi?.toFixed(1)} (${profile.bmiCategory})</div></div>
        <div><div class="label">Height</div><div class="value">${profile.height} cm</div></div>
        <div><div class="label">Weight</div><div class="value">${profile.weight} kg</div></div>
      </div></div>
      <div class="section"><h3>⚽ Sports & Fitness</h3><div class="grid">
        <div><div class="label">Position</div><div class="value">${profile.sportPosition || '-'}</div></div>
        <div><div class="label">Fitness Status</div><div class="value">${profile.fitnessStatus}</div></div>
      </div></div>
      <div class="section"><h3>🏥 Medical Info</h3><div class="grid">
        <div><div class="label">Blood Type</div><div class="value">${profile.bloodType || '-'}</div></div>
        <div><div class="label">Allergies</div><div class="value">${profile.allergies || 'None'}</div></div>
      </div></div>
      <div class="section"><h3>🚨 Emergency Contact</h3><div class="grid">
        <div><div class="label">Contact Name</div><div class="value">${profile.emergencyContact || '-'}</div></div>
        <div><div class="label">Phone</div><div class="value">${profile.emergencyPhone || '-'}</div></div>
      </div></div>
    </div>
    <footer>STREET LEAGUE - Athlete Management System</footer>
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profil_sante_${profile.userId}.html`;
    a.click();
    URL.revokeObjectURL(url);
    this.showNotification('Profile report downloaded', 'success');
  }

  openModal(p?: HealthProfileResponse) {
    if (p) {
      this.editingId = p.id;
      this.form = {
        userId: p.userId, weight: p.weight, height: p.height, age: p.age,
        sportPosition: p.sportPosition || '', fitnessStatus: p.fitnessStatus,
        emergencyContact: p.emergencyContact || '', emergencyPhone: p.emergencyPhone || '00000000',
        bloodType: p.bloodType || 'A+', allergies: p.allergies || '', medicalConditions: p.medicalConditions || '',
        gender: (p as any).gender || 'MALE'
      };
    } else {
      this.editingId = null;
      const defaultUserId = this.isAdmin ? (this.users.length ? this.users[0].id : 0) : (this.currentUserId || 0);
      this.form = {
        userId: defaultUserId, weight: 0, height: 0, age: 0, sportPosition: '', fitnessStatus: 'ACTIVE',
        emergencyContact: '', emergencyPhone: '00000000', bloodType: 'A+', allergies: '',
        medicalConditions: '', gender: 'MALE'
      };
    }
    this.modalVisible = true;
  }

  closeModal() { this.modalVisible = false; }

  getPreviewBmi(): number {
    if (this.form.weight > 0 && this.form.height > 0) {
      return this.form.weight / ((this.form.height / 100) * (this.form.height / 100));
    }
    return 0;
  }

  getPreviewBmiCategory(): string {
    const bmi = this.getPreviewBmi();
    if (bmi === 0) return '—';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Weight normal';
    if (bmi < 30) return 'Overweight';
    return 'Obesity';
  }

  save() {
    if (this.isSubmitting) return;
    if (!this.form.userId || this.form.userId <= 0 || !this.form.weight || !this.form.height || !this.form.age || !this.form.emergencyPhone?.match(/^\d{8,}$/)) {
      this.showNotification('Please fill all required fields', 'error');
      return;
    }
    this.isSubmitting = true;
    const payload: HealthProfileRequest = { ...this.form };
    const obs = this.editingId ? this.healthService.update(this.editingId, payload) : this.healthService.create(payload);
    obs.subscribe({
      next: (profile) => {
        this.loadProfilees();
        this.closeModal();
        this.showNotification(this.editingId ? 'Profile updated' : 'Profile created', 'success');
        if (this.selectedProfilee && this.selectedProfilee.id === profile.id) {
          this.selectedProfilee = profile;
          this.computeMetrics(profile);
          this.showImcBasedPlan = true;
          const now = new Date();
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          const pastDays = (now.getTime() - startOfYear.getTime()) / 86400000;
          const weekNum = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
          this.currentWeek = ((weekNum - 1) % 4) + 1;
          this.loadActivityPlanFromBackend(profile.userId, this.currentWeek);
        } else if (!this.selectedProfilee) {
          this.showImcBasedPlan = true;
          this.showDetails(profile);
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        this.isSubmitting = false;
        let errorMsg = 'Error during save';
        if (err.error?.errors) errorMsg = Object.values(err.error.errors).join(', ');
        else if (err.error?.message) errorMsg = err.error.message;
        this.showNotification(errorMsg, 'error');
      }
    });
  }

  deleteProfilee(id: number) {
    if (confirm('Permanently delete this profile?')) {
      this.healthService.delete(id).subscribe({
        next: () => {
          this.loadProfilees();
          if (this.selectedProfilee?.id === id) this.closeDetails();
          this.showNotification('Profile deleted', 'success');
        },
        error: () => this.showNotification('Delete error', 'error')
      });
    }
  }

  private showNotification(msg: string, type: 'success' | 'error') {
    this.notification = msg;
    this.notificationType = type;
    setTimeout(() => this.notification = '', 4000);
  }
}