import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpBackend } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { firstValueFrom, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DietPlanService, DietPlanResponse, DietPlanRequest } from '../../services/diet-plan.service';
import { HealthProfileService, HealthProfileResponse } from '../../services/health-profile.service';
import { MedicalRecordService, MedicalRecordResponse } from '../../services/medical-record.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-diet-plans',
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
            <div class="text-3xl">🥗</div>
            <div>
              <h1 class="text-2xl font-black text-slate-800 tracking-tight">Nutrition Plans</h1>
              <p class="text-slate-500 text-xs font-medium">Smart Nutrition & Planning</p>
            </div>
          </div>
        </div>
        <button (click)="openModal()" class="bg-[#1DB954] hover:bg-[#1aa34a] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 transform hover:scale-105">
          + New Plan
        </button>
      </div>

      <!-- Barre de recherche de calories -->
      <div class="bg-white rounded-xl shadow p-4 border border-gray-200">
        <h3 class="font-semibold text-gray-800 mb-2">🔍 Food Calorie Search</h3>
        <div class="flex gap-2">
          <input type="text" [(ngModel)]="calorieSearch" (input)="searchCalories()" placeholder="Ex: apple, rice, chicken..." class="flex-1 p-2 border rounded-lg">
          <div *ngIf="isSearchingCalories" class="flex items-center">
            <div class="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <div *ngIf="isSearchingCalories" class="text-xs text-gray-500 mt-1">Searching the web...</div>
        <div *ngIf="calorieResult !== null" class="mt-2 p-2 bg-green-100 rounded">🍎 {{ calorieSearch }} : {{ calorieResult }} kcal/100g</div>
        <div *ngIf="calorieSuggestions.length" class="mt-2 flex flex-wrap gap-1">
          <button *ngFor="let sugg of calorieSuggestions" (click)="selectCalorieSuggestion(sugg)" class="bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-sm transition">{{ sugg.name }} ({{ sugg.calories }} kcal)</button>
        </div>
      </div>

      <!-- INTELLIGENT NUTRITION DASHBOARD -->
      <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-10 relative overflow-hidden group" *ngIf="userHealthProfile">
        <div class="absolute top-0 right-0 w-32 h-32 bg-[#1DB954]/5 rounded-bl-full pointer-events-none transition-all duration-700 group-hover:bg-[#1DB954]/10"></div>
        
        <div class="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
          <div>
            <h3 class="font-black text-slate-800 text-3xl tracking-tight flex items-center gap-3">
              Smart Nutrition
              <div class="px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest flex items-center gap-2" style="background: #1DB95420; color: #1DB954; border: 1px solid #1DB95440;">
                <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background: #1DB954;"></span> AI SYNC
              </div>
            </h3>
            <p class="text-slate-500 mt-2 text-sm font-medium">Biometric analysis and sports synchronization.</p>
            <p *ngIf="medicalAdvice" class="mt-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full inline-block">{{ medicalAdvice }}</p>
          </div>
          
          <div class="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button (click)="dailyGoal = 'loss'; updateDailyRecommendation()" 
                    [class.bg-white]="dailyGoal === 'loss'" [class.shadow-md]="dailyGoal === 'loss'" 
                    [style.color]="dailyGoal === 'loss' ? '#1DB954' : '#64748b'"
                    class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300">
              📉 Deficit
            </button>
            <button (click)="dailyGoal = 'maintain'; updateDailyRecommendation()" 
                    [class.bg-white]="dailyGoal === 'maintain'" [class.shadow-md]="dailyGoal === 'maintain'"
                    [style.color]="dailyGoal === 'maintain' ? '#1DB954' : '#64748b'"
                    class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300">
              ⚖️ Maintenance
            </button>
            <button (click)="dailyGoal = 'gain'; updateDailyRecommendation()" 
                    [class.bg-white]="dailyGoal === 'gain'" [class.shadow-md]="dailyGoal === 'gain'"
                    [style.color]="dailyGoal === 'gain' ? '#1DB954' : '#64748b'"
                    class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300">
              📈 Surplus
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          <!-- Column 1 -->
          <div class="lg:col-span-4 flex flex-col gap-6">
            <div class="bg-slate-50 rounded-3xl p-8 border border-slate-100 relative overflow-hidden group/card hover:border-[#1DB954]/30 transition-all">
              <div class="absolute top-0 left-0 w-full h-1" style="background: #1DB954;"></div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Calorie Goal</p>
              <div class="flex items-end gap-2">
                <p class="font-black text-5xl text-slate-800 tracking-tighter">{{ targetDailyCalories }}</p>
                <p class="font-bold mb-1" style="color: #1DB954;">kcal</p>
              </div>
            </div>
            <div class="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center justify-between">
              <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hydration</p>
                <p class="font-black text-3xl text-slate-800">{{ waterRecommendation }} <span class="text-sm font-bold" style="color: #1DB954;">L/day</span></p>
              </div>
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style="background: #1DB95410; border: 1px solid #1DB95420;">💧</div>
            </div>
          </div>

          <!-- Column 2 -->
          <div class="lg:col-span-4 bg-slate-50 rounded-3xl p-8 border border-slate-100">
            <h4 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">📊 Macros (Calculated)</h4>
            <div class="space-y-6">
              <div>
                <div class="flex justify-between text-sm font-bold mb-2"><span class="text-slate-600">🥩 Protein</span><span class="text-slate-800">{{ proteinRecommendation }}g</span></div>
                <div class="w-full bg-slate-200 rounded-full h-2"><div class="h-2 rounded-full" style="background: #1DB954; width: 60%;"></div></div>
              </div>
              <div>
                <div class="flex justify-between text-sm font-bold mb-2"><span class="text-slate-600">🌾 Carbs</span><span class="text-slate-800">{{ macros.carbs }}g</span></div>
                <div class="w-full bg-slate-200 rounded-full h-2"><div class="h-2 rounded-full" style="background: #F97316; width: 45%;"></div></div>
              </div>
              <div>
                <div class="flex justify-between text-sm font-bold mb-2"><span class="text-slate-600">🥑 Fat</span><span class="text-slate-800">{{ macros.fat }}g</span></div>
                <div class="w-full bg-slate-200 rounded-full h-2"><div class="h-2 rounded-full" style="background: #334155; width: 30%;"></div></div>
              </div>
            </div>
          </div>
          
          <!-- Column 3 - Menu du jour avec calories -->
          <div class="lg:col-span-4 bg-slate-50 rounded-3xl p-6 border border-slate-100">
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-xs font-black text-slate-500 uppercase tracking-widest">🍽️ Today's Diet</h4>
              <span class="text-[10px] font-bold px-2 py-1 rounded-full border" [style.background]="dailyMeals.totalCal <= targetDailyCalories + 50 ? '#d1fae5' : '#fee2e2'" [style.color]="dailyMeals.totalCal <= targetDailyCalories + 50 ? '#065f46' : '#991b1b'">{{ dailyMeals.totalCal }} / {{ targetDailyCalories }} kcal</span>
            </div>
            <div class="space-y-3">
              <div class="p-4 bg-white rounded-2xl border border-slate-100 hover:border-[#1DB954]/20 transition-all shadow-sm">
                <div class="flex justify-between items-center mb-1">
                  <p class="text-[10px] font-black uppercase tracking-widest" style="color: #F97316;">🌅 Breakfast</p>
                  <span class="text-[10px] font-bold text-slate-400">{{ dailyMeals.breakfastCal }} kcal</span>
                </div>
                <p class="text-sm text-slate-700 font-medium leading-snug">{{ dailyMeals.breakfast }}</p>
              </div>
              <div class="p-4 bg-white rounded-2xl border border-slate-100 hover:border-[#1DB954]/20 transition-all shadow-sm">
                <div class="flex justify-between items-center mb-1">
                  <p class="text-[10px] font-black uppercase tracking-widest" style="color: #1DB954;">☀️ Lunch</p>
                  <span class="text-[10px] font-bold text-slate-400">{{ dailyMeals.lunchCal }} kcal</span>
                </div>
                <p class="text-sm text-slate-700 font-medium leading-snug">{{ dailyMeals.lunch }}</p>
              </div>
              <div class="p-4 bg-white rounded-2xl border border-slate-100 hover:border-[#1DB954]/20 transition-all shadow-sm">
                <div class="flex justify-between items-center mb-1">
                  <p class="text-[10px] font-black uppercase tracking-widest" style="color: #6366f1;">🍏 Snack</p>
                  <span class="text-[10px] font-bold text-slate-400">{{ dailyMeals.snackCal }} kcal</span>
                </div>
                <p class="text-sm text-slate-700 font-medium leading-snug">{{ dailyMeals.snack }}</p>
              </div>
              <div class="p-4 bg-white rounded-2xl border border-slate-100 hover:border-[#1DB954]/20 transition-all shadow-sm">
                <div class="flex justify-between items-center mb-1">
                  <p class="text-[10px] font-black uppercase tracking-widest" style="color: #334155;">🌙 Dinner</p>
                  <span class="text-[10px] font-bold text-slate-400">{{ dailyMeals.dinnerCal }} kcal</span>
                </div>
                <p class="text-sm text-slate-700 font-medium leading-snug">{{ dailyMeals.dinner }}</p>
              </div>
            </div>
            <!-- Calorie progress bar -->
            <div class="mt-4">
              <div class="w-full bg-slate-200 rounded-full h-2">
                <div class="h-2 rounded-full transition-all" [style.width]="getCalorieProgressWidth() + '%'" [style.background]="dailyMeals.totalCal <= targetDailyCalories + 50 ? '#1DB954' : '#ef4444'"></div>
              </div>
              <p class="text-[10px] text-slate-400 mt-1 text-center">Adapted to your profile ({{ userHealthProfile.weight }}kg, {{ userHealthProfile.height }}cm)</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div *ngIf="notification" class="fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm animate-bounce"
           [class.bg-green-600]="notificationType === 'success'"
           [class.bg-red-600]="notificationType === 'error'">{{ notification }}</div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="text-center py-12 text-slate-400">
        <div class="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p class="text-xs font-bold">Loading plans...</p>
      </div>

      <!-- Tableau des plans -->
      <div *ngIf="!isLoading" class="bg-white rounded-2xl border shadow-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">{{ isAdmin ? 'ID' : '' }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Patient</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Plan Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Cal/day</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Active</th>
              <th class="px-6 py-3 text-right text-xs font-black text-gray-500 uppercase tracking-widest">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of plans" (click)="selectPlan(p)" class="hover:bg-gray-50 cursor-pointer">
              <td class="px-6 py-4 text-sm">{{ isAdmin ? p.id : '' }}</td>
              <td class="px-6 py-4 text-sm">{{ getPatientName(p.healthProfileId) }}</td>
              <td class="px-6 py-4 text-sm font-medium">{{ p.planName }}</td>
              <td class="px-6 py-4 text-sm">
                {{ p.dailyCalories || '-' }}
                <span *ngIf="p.dailyCalories && getCalorieCoherenceIcon(p.dailyCalories)" class="ml-1 text-xs">{{ getCalorieCoherenceIcon(p.dailyCalories) }}</span>
              </td>
              <td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-full" [class.bg-green-100]="p.isActive">{{ p.isActive ? '✅ Active' : '❌ Inactive' }}</span></td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <button (click)="openModal(p); $event.stopPropagation()" 
                          class="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all shadow-sm border border-amber-100" title="Edit">
                    ✏️
                  </button>
                  <button *ngIf="!p.isActive" (click)="activate(p.id); $event.stopPropagation()" 
                          class="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all shadow-sm border border-emerald-100 font-bold text-xs" title="Activate">
                    🚀 Activate
                  </button>
                  <button *ngIf="p.isActive" (click)="deactivate(p.id); $event.stopPropagation()" 
                          class="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all shadow-sm border border-slate-100 font-bold text-xs" title="Deactivate">
                    ⏸️ Deactivate
                  </button>
                  <button (click)="downloadPlan(p); $event.stopPropagation()" 
                          class="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all shadow-sm border border-blue-100" title="Download Plan">
                    📥
                  </button>
                  <button (click)="deletePlan(p.id); $event.stopPropagation()" 
                          class="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all shadow-sm border border-red-100" title="Delete">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="plans.length===0"><td colspan="6" class="text-center py-10 text-gray-400">No diet plan found</td></tr>
          </tbody>
        </table>
      </div>

      <!-- DÉTAILS DU PLAN SÉLECTIONNÉ -->
      <div *ngIf="selectedPlan" class="mt-8 bg-white rounded-2xl border shadow-lg p-6 space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div class="flex flex-wrap gap-8">
            <div>
              <p class="text-sm text-gray-500">Patient</p>
              <p class="font-bold text-gray-800 text-lg">{{ getPatientName(selectedPlan.healthProfileId) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Plan Name</p>
              <p class="font-bold text-gray-800 text-lg">{{ selectedPlan.planName }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Set Calories</p>
              <p class="font-bold text-gray-800 text-lg">{{ selectedPlan.dailyCalories || '-' }} kcal/day</p>
            </div>
          </div>
          <div>
            <span class="px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border" [ngClass]="selectedPlan.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'">{{ selectedPlan.isActive ? '✅ Plan Active' : '❌ Inactive' }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-6">
            <div>
              <h4 class="text-sm font-black text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">🍽️ MEAL SUGGESTIONS</h4>
              <div class="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 whitespace-pre-line leading-relaxed shadow-inner">
                {{ selectedPlan.mealSuggestions || 'No suggestions provided.' }}
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <h4 class="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">⚠️ RESTRICTIONS</h4>
                <p class="text-xs text-orange-800 font-bold">{{ selectedPlan.dietaryRestrictions || 'None' }}</p>
              </div>
              <div class="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <h4 class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">🎯 GOALS</h4>
                <p class="text-xs text-blue-800 font-bold">{{ selectedPlan.nutritionalGoals || 'General health' }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="flex justify-between items-center">
              <h4 class="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">🛒 AUTOMATED SHOPPING LIST</h4>
              <button (click)="exportShoppingListToPdf()" class="text-[10px] font-black text-blue-600 hover:underline">EXPORT HTML</button>
            </div>
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-h-[400px] overflow-y-auto">
              <div *ngIf="!shoppingListCategories.length" class="text-center py-10 text-slate-400 italic text-sm">
                 Generating from suggestions...
              </div>
              <div *ngFor="let cat of shoppingListCategories" class="mb-6 last:mb-0">
                <h5 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-50 pb-1">{{ cat }}</h5>
                <div class="space-y-2">
                  <div *ngFor="let item of shoppingList[cat]" class="flex items-center gap-3">
                    <input type="checkbox" [(ngModel)]="item.checked" class="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500">
                    <span class="text-sm font-bold text-slate-700" [class.line-through]="item.checked" [class.text-slate-400]="item.checked">{{ item.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Creation/Edit -->
      <div *ngIf="modalVisible" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b border-slate-100 px-8 py-6 flex justify-between items-center z-20">
            <h2 class="text-2xl font-black text-slate-800 tracking-tight">{{ editingId ? 'Update' : 'Create' }} Diet Plan</h2>
            <div class="flex items-center gap-3">
              <button *ngIf="!editingId" type="button" (click)="autoFillForm()" class="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-1">
                ✨ AI AUTO-FILL
              </button>
              <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600 text-3xl transition-colors">&times;</button>
            </div>
          </div>
          <form #planForm="ngForm" (ngSubmit)="save()" class="p-8 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-500 uppercase tracking-widest">Patient *</label>
                <select [(ngModel)]="form.healthProfileId" name="healthProfileId" required class="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20" [disabled]="!isAdmin">
                  <option *ngFor="let hp of healthProfiles" [value]="hp.id">{{ getPatientName(hp.id) }}</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-500 uppercase tracking-widest">Plan Name *</label>
                <input type="text" [(ngModel)]="form.planName" name="planName" required class="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20">
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-500 uppercase tracking-widest">Daily Calories</label>
                <input type="number" [(ngModel)]="form.dailyCalories" name="dailyCalories" class="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20">
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-500 uppercase tracking-widest">Start Date *</label>
                <input type="date" [(ngModel)]="form.startDate" name="startDate" required class="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20">
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-500 uppercase tracking-widest">Created By *</label>
                <input type="text" [(ngModel)]="form.createdBy" name="createdBy" required class="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20">
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-500 uppercase tracking-widest">Status</label>
                <select [(ngModel)]="form.isActive" name="isActive" class="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20">
                  <option [ngValue]="true">Active</option>
                  <option [ngValue]="false">Inactive</option>
                </select>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-black text-slate-500 uppercase tracking-widest">Meal Suggestions</label>
              <textarea rows="4" [(ngModel)]="form.mealSuggestions" name="mealSuggestions" placeholder="Breakfast: eggs, oats... Lunch: chicken, rice..." class="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"></textarea>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-500 uppercase tracking-widest">Restrictions</label>
                <textarea rows="2" [(ngModel)]="form.dietaryRestrictions" name="dietaryRestrictions" class="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"></textarea>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-black text-slate-500 uppercase tracking-widest">Nutritional Goals</label>
                <textarea rows="2" [(ngModel)]="form.nutritionalGoals" name="nutritionalGoals" class="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"></textarea>
              </div>
            </div>
            <div class="flex justify-end gap-4 pt-4 border-t border-slate-100">
              <button type="button" (click)="closeModal()" class="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all">Cancel</button>
              <button type="submit" class="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition-all transform active:scale-95">{{ editingId ? 'Update' : 'Create' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-bounce { animation: bounce 0.5s ease-in-out; }
    @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  `]
})
export class DietPlansComponent implements OnInit {
  plans: DietPlanResponse[] = [];
  healthProfiles: HealthProfileResponse[] = [];
  users: any[] = [];
  isLoading = true;
  isAdmin = false;
  currentUserId: number | null = null;
  currentUserHealthProfileId: number | null = null;

  modalVisible = false;
  editingId: number | null = null;
  isSubmitting = false;
  form: DietPlanRequest = {
    healthProfileId: 0, planName: '', description: '', dailyCalories: 0, mealSuggestions: '',
    startDate: '', endDate: '', isActive: true, dietaryRestrictions: '', nutritionalGoals: '', createdBy: ''
  };

  notification = '';
  notificationType: 'success' | 'error' = 'success';
  selectedPlan: DietPlanResponse | null = null;

  // Calorie search
  calorieSearch = '';
  calorieResult: number | null = null;
  calorieSuggestions: any[] = [];
  isSearchingCalories = false;
  private searchSubject = new Subject<string>();

  // AI & Recommendation
  dailyGoal: string = 'maintain';
  targetDailyCalories: number = 2000;
  proteinRecommendation = 120;
  waterRecommendation = 2.5;
  userHealthProfile: HealthProfileResponse | null = null;
  
  // Advanced features
  nutritionScore: string | null = null;
  shoppingList: { [cat: string]: { name: string; checked: boolean }[] } = {};
  shoppingListCategories: string[] = [];
  dailyMeals: any = { 
    breakfast: '', lunch: '', snack: '', dinner: '', 
    breakfastCal: 0, lunchCal: 0, snackCal: 0, dinnerCal: 0, totalCal: 0 
  };
  macros = { carbs: 0, fat: 0 };
  medicalAdvice: string = '';
  
  private bypassClient!: HttpClient;

  constructor(
    private dietService: DietPlanService,
    private healthProfileService: HealthProfileService,
    private medicalService: MedicalRecordService,
    private userService: UserService,
    private httpBackend: HttpBackend,
    private cdr: ChangeDetectorRef
  ) {
    this.bypassClient = new HttpClient(httpBackend);
  }

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(query => {
      this.performSearch(query);
    });

    const role = localStorage.getItem('user_type');
    this.isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN' || role === 'ROLE_FIELD_OWNER' || role === 'FIELD_OWNER';
    const userId = localStorage.getItem('user_id');
    this.currentUserId = userId ? parseInt(userId, 10) : null;
    
    this.loadUserProfilee();
  }

  loadUserProfilee() {
    if (!this.currentUserId) {
      this.loadHealthProfiles();
      return;
    }
    this.healthProfileService.getByUserId(this.currentUserId).subscribe({
      next: (hp) => {
        if (hp) {
          this.userHealthProfile = hp;
          this.currentUserHealthProfileId = hp.id;
          this.loadMedicalContext(hp.id);
        }
        this.loadHealthProfiles();
      },
      error: () => this.loadHealthProfiles()
    });
  }

  loadMedicalContext(hpId: number) {
    this.medicalService.getByHealthProfileId(hpId).subscribe({
      next: (records) => {
        const text = (records || []).map(r => r.diagnosis + ' ' + r.treatment).join(' ').toLowerCase();
        if (text.includes('fatigue') || text.includes('anemia')) this.medicalAdvice = '💡 Increase Magnesium & Iron.';
        else if (text.includes('inflammation')) this.medicalAdvice = '🛡️ Anti-inflammatory focus.';
        else if (text.includes('diabetes')) this.medicalAdvice = '📉 Low Glycemic Index focus.';
        this.updateDailyRecommendation();
      },
      error: () => this.updateDailyRecommendation()
    });
  }

  loadHealthProfiles() {
    if (this.isAdmin) {
      this.healthProfileService.getAll().subscribe({
        next: (profiles) => { this.healthProfiles = profiles; this.loadUsers(); },
        error: () => { this.showNotification('Error loading health profiles', 'error'); this.loadUsers(); }
      });
    } else if (this.currentUserId) {
      this.healthProfileService.getByUserId(this.currentUserId).subscribe({
        next: (p) => {
          this.healthProfiles = p ? [p] : [];
          this.loadUsers();
        },
        error: () => { this.healthProfiles = []; this.loadUsers(); }
      });
    } else {
      this.loadUsers();
    }
  }

  loadUsers() {
    if (this.isAdmin) {
      this.userService.getAll().subscribe({
        next: (users) => { this.users = users; this.loadPlans(); },
        error: () => this.loadPlans()
      });
    } else {
      const userName = localStorage.getItem('user_name') || 'User';
      if (this.currentUserId) {
        this.users = [{ id: this.currentUserId, firstName: userName.split(' ')[0], lastName: userName.split(' ')[1] || '' }];
      }
      this.loadPlans();
    }
  }

  loadPlans() {
    this.isLoading = true;
    const request$ = this.isAdmin 
      ? this.dietService.getAll() 
      : this.currentUserHealthProfileId ? this.dietService.getByHealthProfileId(this.currentUserHealthProfileId) : null;

    if (request$) {
      request$.subscribe({
        next: (data) => {
          this.plans = data;
          this.isLoading = false;
          if (this.plans.length > 0 && !this.selectedPlan) {
            this.selectPlan(this.plans[0]);
          }
          this.cdr.detectChanges();
        },
        error: () => { this.showNotification('Error loading plans', 'error'); this.isLoading = false; }
      });
    } else {
      this.plans = [];
      this.isLoading = false;
    }
  }

  getPatientName(hpId: number): string {
    const profile = this.healthProfiles.find(hp => hp.id === hpId);
    if (!profile) return `Profile #${hpId}`;
    const user = this.users.find(u => u.id === profile.userId);
    return user ? `${user.firstName} ${user.lastName}` : `User #${profile.userId}`;
  }

  selectPlan(plan: DietPlanResponse) {
    this.selectedPlan = plan;
    this.analyzeNutrition(plan);
    this.generateShoppingList(plan);
    this.cdr.detectChanges();
  }

  updateDailyRecommendation() {
    if (!this.userHealthProfile) return;
    const w = this.userHealthProfile.weight || 70;
    const h = this.userHealthProfile.height || 175;
    const a = this.userHealthProfile.age || 25;
    
    let bmr = (10 * w) + (6.25 * h) - (5 * a) + 5;
    let maintain = Math.round(bmr * 1.5);
    
    if (this.dailyGoal === 'loss') this.targetDailyCalories = maintain - 500;
    else if (this.dailyGoal === 'gain') this.targetDailyCalories = maintain + 400;
    else this.targetDailyCalories = maintain;
    
    this.proteinRecommendation = Math.round(w * (this.dailyGoal === 'gain' ? 2.2 : 1.8));
    this.waterRecommendation = Number((w * 0.035).toFixed(1));

    const proteinCals = this.proteinRecommendation * 4;
    const remainingCals = Math.max(500, this.targetDailyCalories - proteinCals);
    this.macros.fat = Math.round((remainingCals * 0.3) / 9);
    this.macros.carbs = Math.round((remainingCals * 0.7) / 4);

    this.generateSampleMeals();
    this.cdr.detectChanges();
  }

  generateSampleMeals() {
    const mealDB: any = {
      loss: {
        breakfasts: ['Oatmeal & Berries', 'Spinach Omelet', 'Greek Yogurt'],
        lunches: ['Grilled Chicken Salad', 'Lentil Soup', 'Quinoa bowl'],
        dinners: ['Baked Fish', 'Tofu Stir-fry', 'Turkey Zucchini'],
        snacks: ['Green Apple', 'Almonds', 'Rice Cake']
      },
      maintain: {
        breakfasts: ['Avocado Toast', 'Smoothie Bowl', 'Scrambled Eggs'],
        lunches: ['Turkey Wrap', 'Salmon Bowl', 'Chicken Pasta'],
        dinners: ['Steak & Cauliflower', 'Shrimp Pesto', 'Lentil Curry'],
        snacks: ['Peanut Butter & Apple', 'Protein Bar', 'Yogurt & Honey']
      },
      gain: {
        breakfasts: ['Maxi Pancakes', 'Double Porridge', 'Bacon & Eggs'],
        lunches: ['Double Burger', 'Beef Lasagna', 'Salmon & Rice Bowl'],
        dinners: ['Homemade Pizza', 'Sirloin & Potatoes', 'Creamy Gnocchi'],
        snacks: ['Gainer Shake', 'Turkey Sandwich', 'Dates & Cashews']
      }
    };

    const goal = (this.dailyGoal as keyof typeof mealDB) || 'maintain';
    const db = mealDB[goal];
    const day = new Date().getDate();
    
    this.dailyMeals.breakfast = db.breakfasts[day % 3];
    this.dailyMeals.lunch = db.lunches[day % 3];
    this.dailyMeals.dinner = db.dinners[day % 3];
    this.dailyMeals.snack = db.snacks[day % 3];

    this.dailyMeals.breakfastCal = Math.round(this.targetDailyCalories * 0.25);
    this.dailyMeals.lunchCal = Math.round(this.targetDailyCalories * 0.35);
    this.dailyMeals.snackCal = Math.round(this.targetDailyCalories * 0.10);
    this.dailyMeals.dinnerCal = this.targetDailyCalories - this.dailyMeals.breakfastCal - this.dailyMeals.lunchCal - this.dailyMeals.snackCal;
    this.dailyMeals.totalCal = this.targetDailyCalories;
  }

  getCalorieProgressWidth(): number {
    return 100;
  }

  searchCalories() {
    const q = this.calorieSearch.trim();
    if (q.length < 3) {
      this.calorieResult = null;
      this.calorieSuggestions = [];
      return;
    }
    this.searchSubject.next(q);
  }

  performSearch(q: string) {
    this.isSearchingCalories = true;
    this.bypassClient.get<any[]>(`http://localhost:8085/api/diet-plans/search-calories`, { params: { query: q } }).subscribe({
      next: (results) => { this.calorieSuggestions = results || []; this.isSearchingCalories = false; },
      error: () => { this.isSearchingCalories = false; }
    });
  }

  selectCalorieSuggestion(sugg: any) {
    this.calorieSearch = sugg.name;
    this.calorieResult = sugg.calories;
    this.calorieSuggestions = [];
  }

  getCalorieCoherenceIcon(cal: number): string {
    return Math.abs(cal - this.targetDailyCalories) < 200 ? '✅' : '⚠️';
  }

  analyzeNutrition(plan: DietPlanResponse) {
    const meals = (plan.mealSuggestions || '').toLowerCase();
    const score = (['vegetable', 'fruit', 'fish', 'nuts', 'oat'].filter(g => meals.includes(g)).length) - 
                  (['sugar', 'fried', 'fat'].filter(b => meals.includes(b)).length);
    if (score >= 2) this.nutritionScore = 'A';
    else if (score >= 0) this.nutritionScore = 'B';
    else this.nutritionScore = 'C';
  }

  generateShoppingList(plan: DietPlanResponse) {
    const meals = (plan.mealSuggestions || '').toLowerCase().split(/[\s,;:]+/);
    const categoryMap = new Map<string, string[]>([
      ['🍎 Fruits', ['apple', 'banana', 'orange', 'strawberry']],
      ['🥦 Vegetables', ['broccoli', 'carrot', 'tomato', 'salad']],
      ['🍚 Grains', ['rice', 'pasta', 'quinoa', 'oat']],
      ['🍗 Proteins', ['chicken', 'turkey', 'beef', 'fish', 'egg']],
      ['🥑 Fats', ['oil', 'butter', 'almond', 'avocado']]
    ]);
    this.shoppingList = {}; this.shoppingListCategories = [];
    categoryMap.forEach((keys, cat) => {
      const items = meals.filter(w => keys.some(k => w.includes(k)));
      if (items.length) {
        this.shoppingList[cat] = Array.from(new Set(items)).map(name => ({ name, checked: false }));
        this.shoppingListCategories.push(cat);
      }
    });
  }

  exportShoppingListToPdf() {
    const html = `<!DOCTYPE html><html><body><h2>🛒 Shopping List</h2>${this.shoppingListCategories.map(cat => `<h3>${cat}</h3><ul>${this.shoppingList[cat].map(i => `<li>[ ] ${i.name}</li>`).join('')}</ul>`).join('')}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'shopping_list.html'; a.click();
    this.showNotification('Exported!', 'success');
  }

  downloadPlan(plan: DietPlanResponse) {
    const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;"><h1>🥗 ${plan.planName}</h1><p>Calories: ${plan.dailyCalories} kcal</p><p>${plan.mealSuggestions}</p></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `plan_${plan.id}.html`; a.click();
    this.showNotification('Downloaded!', 'success');
  }

  autoFillForm() {
    if (!this.userHealthProfile) return;
    this.form.dailyCalories = this.targetDailyCalories;
    this.form.mealSuggestions = `🌅 Breakfast: ${this.dailyMeals.breakfast}\n☀️ Lunch: ${this.dailyMeals.lunch}\n🌙 Dinner: ${this.dailyMeals.dinner}`;
    this.form.nutritionalGoals = `Goal: ${this.dailyGoal.toUpperCase()}\nProtein: ${this.proteinRecommendation}g | Water: ${this.waterRecommendation}L`;
    this.form.planName = `${this.dailyGoal.charAt(0).toUpperCase() + this.dailyGoal.slice(1)} Plan - ${new Date().toLocaleDateString()}`;
    this.showNotification('✨ AI Pre-filled!', 'success');
  }

  openModal(p?: DietPlanResponse) {
    if (p) {
      this.editingId = p.id; this.form = { ...p };
      this.form.startDate = p.startDate ? p.startDate.slice(0, 10) : '';
    } else {
      this.editingId = null;
      this.form = {
        healthProfileId: this.currentUserHealthProfileId || 0, planName: '', description: '', dailyCalories: 2000, 
        mealSuggestions: '', startDate: new Date().toISOString().slice(0,10), endDate: '',
        isActive: true, dietaryRestrictions: '', nutritionalGoals: '', createdBy: localStorage.getItem('user_name') || ''
      };
    }
    this.modalVisible = true;
  }

  closeModal() { this.modalVisible = false; }

  save() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    const obs = this.editingId ? this.dietService.update(this.editingId, this.form) : this.dietService.create(this.form);
    obs.subscribe({
      next: () => { this.loadPlans(); this.closeModal(); this.showNotification('Saved!', 'success'); this.isSubmitting = false; },
      error: (err) => { this.showNotification(err.error?.message || 'Error', 'error'); this.isSubmitting = false; }
    });
  }

  deletePlan(id: number) {
    if (confirm('Delete?')) this.dietService.delete(id).subscribe(() => { this.loadPlans(); this.showNotification('Deleted!', 'success'); });
  }

  activate(id: number) { this.dietService.activate(id).subscribe(() => { this.loadPlans(); this.showNotification('Activated!', 'success'); }); }
  deactivate(id: number) { this.dietService.deactivate(id).subscribe(() => { this.loadPlans(); this.showNotification('Deactivated!', 'success'); }); }

  private showNotification(msg: string, type: 'success' | 'error') {
    this.notification = msg; this.notificationType = type;
    setTimeout(() => this.notification = '', 3000);
  }
}