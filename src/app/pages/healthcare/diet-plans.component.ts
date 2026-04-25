// diet-plans.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DietPlanService, DietPlanResponse, DietPlanRequest } from '../../services/diet-plan.service';
import { HealthProfileService, HealthProfileResponse } from '../../services/health-profile.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-diet-plans',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <!-- En-tête -->
      <div class="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 shadow-sm">
        <div class="flex flex-wrap justify-between items-center">
          <div class="flex items-center gap-4">
            <a routerLink="/app/healthcare" class="bg-white hover:bg-gray-100 text-green-700 px-4 py-2 rounded-xl shadow-md transition">← Dashboard Santé</a>
            <div>
              <h1 class="text-3xl font-bold text-gray-800">🥗 Plans alimentaires</h1>
              <p class="text-gray-600 mt-1">Gestion des régimes et recommandations nutritionnelles</p>
            </div>
          </div>
          <button (click)="openModal()" class="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl shadow-md transition">+ Nouveau plan</button>
        </div>
      </div>

      <!-- Barre de recherche de calories -->
      <div class="bg-white rounded-xl shadow p-4 border border-gray-200">
        <h3 class="font-semibold text-gray-800 mb-2">🔍 Calories d'un aliment</h3>
        <div class="flex gap-2">
          <input type="text" [(ngModel)]="calorieSearch" (input)="searchCalories()" placeholder="Ex: pomme, riz, poulet..." class="flex-1 p-2 border rounded-lg">
        </div>
        <div *ngIf="calorieResult !== null" class="mt-2 p-2 bg-green-100 rounded">{{ calorieSearch }} : {{ calorieResult }} kcal/100g</div>
        <div *ngIf="calorieSuggestions.length" class="mt-2 flex flex-wrap gap-1">
          <button *ngFor="let sugg of calorieSuggestions" (click)="selectCalorieSuggestion(sugg)" class="bg-blue-100 px-2 py-1 rounded text-sm">{{ sugg.name }} ({{ sugg.calories }} kcal)</button>
        </div>
      </div>

      <!-- Recommandations personnalisées -->
      <div class="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl p-4 shadow">
        <h3 class="font-bold text-green-800">💡 Vos besoins personnalisés</h3>
        <div class="grid grid-cols-3 gap-3 text-center mt-2">
          <div><p class="text-xs">Protéines</p><p class="font-bold text-green-700">{{ proteinRecommendation }} g/j</p></div>
          <div><p class="text-xs">Eau</p><p class="font-bold text-blue-700">{{ waterRecommendation }} L/j</p></div>
          <div><p class="text-xs">Vitamines</p><p class="font-bold text-purple-700 text-sm">{{ vitaminAdvice }}</p></div>
        </div>
      </div>

      <!-- Toast -->
      <div *ngIf="notification" class="fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm animate-bounce"
           [class.bg-green-600]="notificationType === 'success'"
           [class.bg-red-600]="notificationType === 'error'">{{ notification }}</div>

      <!-- Chargement -->
      <div *ngIf="isLoading" class="text-center py-12">Chargement...</div>

      <!-- Tableau des plans -->
      <div *ngIf="!isLoading" class="bg-white rounded-2xl border shadow-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Patient</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Nom du plan</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Cal/jour</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Actif</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of plans" (click)="selectPlan(p)" class="hover:bg-gray-50 cursor-pointer">
              <td class="px-6 py-4 text-sm">{{ p.id }}</td>
              <td class="px-6 py-4 text-sm">{{ getPatientName(p.healthProfileId) }}</td>
              <td class="px-6 py-4 text-sm font-medium">{{ p.planName }}</td>
              <td class="px-6 py-4 text-sm">
                {{ p.dailyCalories || '-' }}
                <span *ngIf="p.dailyCalories && getCalorieCoherenceIcon(p.dailyCalories)" class="ml-1 text-xs">{{ getCalorieCoherenceIcon(p.dailyCalories) }}</span>
              </td>
              <td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-full" [class.bg-green-100]="p.isActive">{{ p.isActive ? '✅ Actif' : '❌ Inactif' }}</span></td>
              <td class="px-6 py-4 text-right space-x-2">
                <button (click)="openModal(p); $event.stopPropagation()" class="text-green-600 hover:text-green-900">✏️</button>
                <button *ngIf="!p.isActive" (click)="activate(p.id); $event.stopPropagation()" class="text-blue-600 hover:text-blue-900">Activer</button>
                <button *ngIf="p.isActive" (click)="deactivate(p.id); $event.stopPropagation()" class="text-orange-600 hover:text-orange-900">Désactiver</button>
                <button (click)="deletePlan(p.id); $event.stopPropagation()" class="text-red-600 hover:text-red-900">🗑️</button>
                <button (click)="downloadPlan(p); $event.stopPropagation()" class="text-blue-600 hover:text-blue-900">📥</button>
              </td>
            </tr>
            <tr *ngIf="plans.length===0"><td colspan="6" class="text-center py-10 text-gray-400">Aucun plan alimentaire</td></tr>
          </tbody>
        </table>
      </div>

      <!-- DÉTAILS DU PLAN SÉLECTIONNÉ -->
      <div *ngIf="selectedPlan" class="mt-8 bg-white rounded-2xl border shadow-lg p-6 space-y-6">
        <!-- Informations générales -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 border-b pb-4">
          <div><span class="font-semibold">Patient :</span> {{ getPatientName(selectedPlan.healthProfileId) }}</div>
          <div><span class="font-semibold">Nom du plan :</span> {{ selectedPlan.planName }}</div>
          <div><span class="font-semibold">Calories plan :</span> {{ selectedPlan.dailyCalories || '-' }} kcal/jour</div>
          <div><span class="font-semibold">Actif :</span> {{ selectedPlan.isActive ? 'Oui' : 'Non' }}</div>
        </div>

        <!-- Cohérence avec objectif -->
        <div class="bg-yellow-50 p-4 rounded-xl border border-yellow-300">
          <h3 class="font-bold text-yellow-800 text-lg">⚖️ Cohérence avec votre objectif</h3>
          <div *ngIf="selectedPlan.dailyCalories && selectedPlan.dailyCalories > 0; else noCalories">
            <div class="mt-2 p-3 bg-white rounded-lg">
              <p class="text-sm" [ngClass]="coherenceResult.isOk ? 'text-green-700' : 'text-red-700'">{{ coherenceResult.message }}</p>
              <div *ngIf="!coherenceResult.isOk && coherenceResult.suggestedCalories" class="mt-2">
                <p class="text-sm font-semibold">👉 Calories recommandées : <span class="text-blue-700">{{ coherenceResult.suggestedCalories }} kcal/jour</span></p>
                <button (click)="updatePlanCalories(coherenceResult.suggestedCalories!)" class="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm">Appliquer</button>
              </div>
            </div>
          </div>
          <ng-template #noCalories>
            <p class="text-gray-600 text-sm">Aucune calorie renseignée pour ce plan.</p>
          </ng-template>
        </div>

        <!-- Besoins caloriques personnalisés -->
        <div class="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <h3 class="font-bold text-blue-800">🎯 Vos besoins caloriques personnalisés</h3>
          <div class="grid grid-cols-3 gap-3 mt-2 text-center">
            <div class="bg-white p-2 rounded"><p class="text-xs">Perte</p><p class="text-xl font-bold text-blue-600">{{ weightLossCalories }}</p><button (click)="updatePlanCalories(weightLossCalories)" class="mt-1 text-xs bg-blue-500 text-white px-2 py-1 rounded">Appliquer</button></div>
            <div class="bg-white p-2 rounded"><p class="text-xs">Maintien</p><p class="text-xl font-bold text-green-600">{{ maintenanceCalories }}</p><button (click)="updatePlanCalories(maintenanceCalories)" class="mt-1 text-xs bg-green-500 text-white px-2 py-1 rounded">Appliquer</button></div>
            <div class="bg-white p-2 rounded"><p class="text-xs">Gain</p><p class="text-xl font-bold text-purple-600">{{ weightGainCalories }}</p><button (click)="updatePlanCalories(weightGainCalories)" class="mt-1 text-xs bg-purple-500 text-white px-2 py-1 rounded">Appliquer</button></div>
          </div>
        </div>

        <!-- Analyse nutritionnelle -->
        <div class="border-t pt-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold">🍎 Analyse nutritionnelle</h3>
            <button (click)="analyzeNutrition(selectedPlan)" class="bg-indigo-600 text-white px-3 py-1 rounded text-sm">Analyser</button>
          </div>
          <div *ngIf="nutritionScore" class="mt-2 flex items-center gap-4">
            <div class="bg-gray-200 p-2 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold" [ngClass]="{'text-green-600': nutritionScore === 'A' || nutritionScore === 'B', 'text-yellow-600': nutritionScore === 'C', 'text-orange-600': nutritionScore === 'D', 'text-red-600': nutritionScore === 'E'}">{{ nutritionScore }}</div>
            <div>Score Nutri-Score (A = excellent, E = insuffisant)</div>
          </div>
          <p *ngIf="!nutritionScore" class="text-gray-500 text-sm mt-2">Cliquez sur Analyser pour évaluer la qualité des repas.</p>
        </div>

        <!-- Liste de courses intelligente -->
        <div class="border-t pt-4">
          <div class="flex justify-between items-center flex-wrap gap-2">
            <h3 class="text-lg font-bold">🛒 Liste de courses intelligente</h3>
            <div class="flex gap-2">
              <button (click)="generateShoppingList(selectedPlan)" class="bg-purple-600 text-white px-3 py-1 rounded text-sm">Générer</button>
              <button (click)="openModal(selectedPlan)" class="text-blue-600 underline text-sm">Modifier les suggestions</button>
            </div>
          </div>
          <div *ngIf="shoppingListCategories.length" class="mt-3">
            <div *ngFor="let cat of shoppingListCategories" class="mt-3">
              <h4 class="font-semibold bg-gray-100 px-2 py-1 rounded">{{ cat }}</h4>
              <div class="grid grid-cols-2 gap-2 mt-1">
                <label *ngFor="let item of shoppingList[cat]" class="flex items-center gap-2 text-sm">
                  <input type="checkbox" [(ngModel)]="item.checked"> {{ item.name }}
                </label>
              </div>
            </div>
            <button (click)="exportShoppingListToPdf()" class="mt-3 bg-green-600 text-white px-3 py-1 rounded text-sm">📄 Exporter PDF</button>
          </div>
          <div *ngIf="!shoppingListCategories.length && shoppingListGenerated" class="mt-2 p-3 bg-yellow-50 border border-yellow-300 rounded">
            <p class="text-sm text-yellow-800">⚠️ Aucun ingrédient extrait.</p>
            <p class="text-sm">Assurez-vous que le champ <strong>"Suggestions de repas"</strong> contient des aliments (ex: "riz, poulet, brocolis").</p>
            <button (click)="openModal(selectedPlan)" class="mt-2 text-blue-600 underline">Ajouter des suggestions</button>
          </div>
          <div *ngIf="!shoppingListGenerated" class="text-gray-500 text-sm mt-2">Cliquez sur "Générer" pour créer la liste de courses.</div>
        </div>
      </div>

      <!-- Modal création / modification -->
      <div *ngIf="modalVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between">
            <h2 class="text-xl font-bold">{{ editingId ? 'Modifier' : 'Nouveau' }} plan alimentaire</h2>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          <form #planForm="ngForm" (ngSubmit)="save()" class="p-6 space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label>Patient *</label><select [(ngModel)]="form.healthProfileId" name="healthProfileId" required class="w-full p-2 border rounded"><option *ngFor="let hp of healthProfiles" [value]="hp.id">{{ getPatientName(hp.id) }}</option></select></div>
              <div><label>Nom du plan *</label><input type="text" [(ngModel)]="form.planName" name="planName" required class="w-full p-2 border rounded"></div>
              <div><label>Calories par jour</label><input type="number" [(ngModel)]="form.dailyCalories" name="dailyCalories" class="w-full p-2 border rounded"></div>
              <div><label>Date début *</label><input type="date" [(ngModel)]="form.startDate" name="startDate" required class="w-full p-2 border rounded"></div>
              <div><label>Date fin</label><input type="date" [(ngModel)]="form.endDate" name="endDate" class="w-full p-2 border rounded"></div>
              <div><label>Créé par *</label><input type="text" [(ngModel)]="form.createdBy" name="createdBy" required class="w-full p-2 border rounded"></div>
              <div><label>Statut</label><select [(ngModel)]="form.isActive" name="isActive" class="w-full p-2 border rounded"><option [ngValue]="true">Actif</option><option [ngValue]="false">Inactif</option></select></div>
            </div>
            <div><label>Description</label><textarea rows="2" [(ngModel)]="form.description" class="w-full p-2 border rounded"></textarea></div>
            <div><label>Suggestions de repas</label><textarea rows="3" [(ngModel)]="form.mealSuggestions" class="w-full p-2 border rounded" placeholder="Ex: Petit-déjeuner : flocons d'avoine, lait ; Déjeuner : riz, poulet, brocolis ; Dîner : poisson, quinoa, salade"></textarea></div>
            <div><label>Restrictions alimentaires</label><textarea rows="2" [(ngModel)]="form.dietaryRestrictions" class="w-full p-2 border rounded"></textarea></div>
            <div><label>Objectifs nutritionnels</label><textarea rows="2" [(ngModel)]="form.nutritionalGoals" class="w-full p-2 border rounded"></textarea></div>
            <div class="flex justify-end gap-3"><button type="button" (click)="closeModal()" class="px-4 py-2 border rounded-lg">Annuler</button><button type="submit" class="px-5 py-2 bg-green-600 text-white rounded-lg">{{ editingId ? 'Mettre à jour' : 'Créer' }}</button></div>
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
  // Data
  plans: DietPlanResponse[] = [];
  healthProfiles: HealthProfileResponse[] = [];
  users: any[] = [];
  isLoading = true;
  modalVisible = false;
  editingId: number | null = null;
  isSubmitting = false;
  form: DietPlanRequest = {
    healthProfileId: 0, planName: '', description: '', dailyCalories: 0, mealSuggestions: '',
    startDate: '', endDate: '', isActive: true, dietaryRestrictions: '', nutritionalGoals: '', createdBy: ''
  };
  notification = '';
  notificationType: 'success' | 'error' = 'success';

  // Selected plan
  selectedPlan: DietPlanResponse | null = null;

  // Calorie search
  calorieSearch = '';
  calorieResult: number | null = null;
  calorieSuggestions: { name: string; calories: number }[] = [];
  private calorieDatabase: Map<string, number> = new Map([
    ['pomme', 52], ['banane', 89], ['orange', 47], ['fraise', 32], ['kiwi', 61], ['poire', 57], ['raisin', 69], ['ananas', 50],
    ['mangue', 60], ['pastèque', 30], ['melon', 34], ['cerise', 50], ['pêche', 39], ['abricot', 48], ['prune', 46], ['framboise', 52],
    ['myrtille', 57], ['citron', 29], ['pamplemousse', 42], ['clémentine', 47], ['brocoli', 34], ['carotte', 41], ['tomate', 18],
    ['concombre', 15], ['salade', 15], ['épinard', 23], ['chou', 25], ['chou-fleur', 25], ['courgette', 17], ['aubergine', 25],
    ['poivron', 31], ['haricot vert', 31], ['petit pois', 81], ['maïs', 86], ['patate douce', 86], ['pomme de terre', 77],
    ['riz', 130], ['pâtes', 131], ['pain', 265], ['quinoa', 120], ['avoine', 389], ['lentilles', 116], ['pois chiches', 132],
    ['poulet', 165], ['dinde', 135], ['boeuf', 250], ['veau', 172], ['porc', 242], ['agneau', 294], ['poisson', 120], ['saumon', 208],
    ['thon', 184], ['crevette', 99], ['oeuf', 155], ['lait', 42], ['yaourt', 59], ['fromage', 402], ['beurre', 717], ['huile olive', 884],
    ['amande', 579], ['noix', 654], ['noisette', 628], ['cacahuète', 567], ['chocolat noir', 546], ['miel', 304], ['avocat', 160],
  ]);

  // Personal needs
  maintenanceCalories = 2000;
  weightLossCalories = 1500;
  weightGainCalories = 2300;
  proteinRecommendation = 120;
  waterRecommendation = 2.5;
  vitaminAdvice = 'Vit. D, B12, fer';
  userHealthProfile: HealthProfileResponse | null = null;

  // Coherence
  coherenceResult: { message: string; suggestedCalories?: number; isOk: boolean } = { message: '', isOk: false };

  // Nutrition analysis
  nutritionScore: string | null = null;

  // Shopping list
  shoppingList: { [cat: string]: { name: string; checked: boolean }[] } = {};
  shoppingListCategories: string[] = [];
  shoppingListGenerated = false;

  constructor(
    private dietService: DietPlanService,
    private healthProfileService: HealthProfileService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadHealthProfiles();
    this.loadUserProfileAndCalories();
  }

  loadHealthProfiles() {
    this.healthProfileService.getAll().subscribe({
      next: (profiles) => { this.healthProfiles = profiles; this.loadUsers(); },
      error: () => { this.showNotification('Erreur chargement profils santé', 'error'); this.loadUsers(); }
    });
  }

  loadUsers() {
    this.userService.getAll().subscribe({
      next: (users) => { this.users = users; this.loadPlans(); },
      error: () => this.loadPlans()
    });
  }

  loadPlans() {
    this.isLoading = true;
    this.dietService.getAll().subscribe({
      next: (data) => { this.plans = data; this.isLoading = false; },
      error: () => { this.showNotification('Erreur chargement plans', 'error'); this.isLoading = false; }
    });
  }

  getPatientName(healthProfileId: number): string {
    const profile = this.healthProfiles.find(hp => hp.id === healthProfileId);
    if (!profile) return `Profil ${healthProfileId}`;
    const user = this.users.find(u => u.id === profile.userId);
    return user ? `${user.firstName} ${user.lastName}` : `Profil ${healthProfileId}`;
  }

  async loadUserProfileAndCalories() {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    try {
      const profile = await firstValueFrom(this.healthProfileService.getByUserId(parseInt(userId)));
      this.userHealthProfile = profile ?? null;
      if (this.userHealthProfile) {
        const w = this.userHealthProfile.weight;
        const h = this.userHealthProfile.height;
        const a = this.userHealthProfile.age;
        const gender = (this.userHealthProfile as any).gender || 'MALE';
        let bmr = 0;
        if (gender === 'MALE') bmr = 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);
        else bmr = 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
        this.maintenanceCalories = Math.round(bmr * 1.55);
        this.weightLossCalories = Math.max(1200, this.maintenanceCalories - 500);
        this.weightGainCalories = this.maintenanceCalories + 300;
        this.proteinRecommendation = Math.round(w * 1.6);
        this.waterRecommendation = parseFloat((w * 0.035).toFixed(1));
        this.vitaminAdvice = 'Vit. C, D, calcium (adapté à votre profil)';
      }
    } catch(e) { console.warn('Profil santé non trouvé, valeurs par défaut'); }
  }

  private evaluateCoherence(planCalories: number): { message: string; suggestedCalories?: number; isOk: boolean } {
    if (!planCalories || planCalories <= 0) return { message: 'Aucune calorie renseignée.', isOk: false };
    const diffLoss = Math.abs(planCalories - this.weightLossCalories);
    const diffMain = Math.abs(planCalories - this.maintenanceCalories);
    const diffGain = Math.abs(planCalories - this.weightGainCalories);
    const tolerance = 150;
    if (diffLoss <= tolerance) return { message: '✅ Parfait ! Ce plan correspond à votre objectif de perte de poids.', isOk: true };
    if (diffMain <= tolerance) return { message: '✅ Parfait ! Ce plan correspond à votre objectif de maintien.', isOk: true };
    if (diffGain <= tolerance) return { message: '✅ Parfait ! Ce plan correspond à votre objectif de gain musculaire.', isOk: true };
    let suggested = this.maintenanceCalories;
    let closest = diffMain;
    if (diffLoss < closest) { closest = diffLoss; suggested = this.weightLossCalories; }
    if (diffGain < closest) { suggested = this.weightGainCalories; }
    return { message: `⚠️ Ces calories (${planCalories} kcal) ne correspondent pas à vos objectifs.`, suggestedCalories: suggested, isOk: false };
  }

  getCalorieCoherenceIcon(calories: number): string {
    const diffLoss = Math.abs(calories - this.weightLossCalories);
    const diffMain = Math.abs(calories - this.maintenanceCalories);
    const diffGain = Math.abs(calories - this.weightGainCalories);
    if (diffLoss <= 150 || diffMain <= 150 || diffGain <= 150) return '✅';
    return '⚠️';
  }

  updatePlanCalories(calories: number) {
    if (this.selectedPlan && calories > 0) {
      this.selectedPlan.dailyCalories = calories;
      this.dietService.update(this.selectedPlan.id, { ...this.selectedPlan, dailyCalories: calories }).subscribe({
        next: () => {
          this.showNotification(`Plan mis à jour : ${calories} kcal/jour`, 'success');
          this.loadPlans();
          this.selectedPlan = this.plans.find(p => p.id === this.selectedPlan!.id) || null;
          this.coherenceResult = this.evaluateCoherence(calories);
          this.updateRecommendationsForCalories(calories);
        },
        error: () => this.showNotification('Erreur mise à jour', 'error')
      });
    }
  }

  private updateRecommendationsForCalories(calories: number) {
    let weight = this.userHealthProfile?.weight || 70;
    let factor = 1.6;
    if (calories === this.weightLossCalories) factor = 2.2;
    else if (calories === this.weightGainCalories) factor = 2.0;
    this.proteinRecommendation = Math.round(weight * factor);
    if (calories === this.weightLossCalories) this.vitaminAdvice = 'Vit. D, B12, fer (régime hypocalorique)';
    else if (calories === this.weightGainCalories) this.vitaminAdvice = 'Vit. C, E, zinc (récupération musculaire)';
    else this.vitaminAdvice = 'Vit. A, C, D, calcium (équilibre)';
  }

  searchCalories() {
    const q = this.calorieSearch.trim().toLowerCase();
    if (!q) { this.calorieResult = null; this.calorieSuggestions = []; return; }
    const matches: { name: string; calories: number }[] = [];
    for (const [food, cal] of this.calorieDatabase.entries()) {
      if (food.includes(q) || q.includes(food)) matches.push({ name: food, calories: cal });
    }
    if (matches.length === 1) {
      this.calorieResult = matches[0].calories;
      this.calorieSearch = matches[0].name;
      this.calorieSuggestions = [];
    } else if (matches.length > 1) {
      this.calorieResult = null;
      this.calorieSuggestions = matches;
    } else {
      this.calorieResult = null;
      this.calorieSuggestions = [];
    }
  }

  selectCalorieSuggestion(sugg: { name: string; calories: number }) {
    this.calorieSearch = sugg.name;
    this.calorieResult = sugg.calories;
    this.calorieSuggestions = [];
  }

  async selectPlan(plan: DietPlanResponse) {
    this.selectedPlan = plan;
    this.nutritionScore = null;
    this.shoppingList = {};
    this.shoppingListCategories = [];
    this.shoppingListGenerated = false;
    await this.loadUserProfileAndCalories();
    this.coherenceResult = this.evaluateCoherence(plan.dailyCalories || 0);
  }

  analyzeNutrition(plan: DietPlanResponse) {
    const meals = plan.mealSuggestions || '';
    const words = meals.toLowerCase().split(/\W+/);
    let good = 0, bad = 0;
    const goodList = ['légume', 'fruit', 'poisson', 'oléagineux', 'avoine', 'quinoa', 'légumineuse'];
    const badList = ['sucre', 'frit', 'gras', 'soda', 'charcuterie', 'beurre', 'crème', 'friture'];
    words.forEach(w => {
      if (goodList.some(g => w.includes(g))) good++;
      if (badList.some(b => w.includes(b))) bad++;
    });
    const score = good - bad;
    if (score >= 3) this.nutritionScore = 'A';
    else if (score >= 1) this.nutritionScore = 'B';
    else if (score >= -1) this.nutritionScore = 'C';
    else if (score >= -3) this.nutritionScore = 'D';
    else this.nutritionScore = 'E';
    this.showNotification(`Score Nutri-Score : ${this.nutritionScore}`, 'success');
  }

  generateShoppingList(plan: DietPlanResponse) {
    this.shoppingListGenerated = true;
    const meals = plan.mealSuggestions || '';
    if (!meals.trim()) {
      this.shoppingListCategories = [];
      this.shoppingList = {};
      this.showNotification('Aucune suggestion de repas. Modifiez le plan pour ajouter des aliments.', 'error');
      return;
    }
    const categoryMap = new Map<string, string[]>([
      ['🍎 Fruits', ['pomme', 'banane', 'orange', 'fraise', 'kiwi', 'poire', 'raisin', 'ananas', 'mangue', 'pastèque', 'melon', 'cerise', 'pêche', 'abricot', 'prune', 'framboise', 'myrtille', 'citron', 'pamplemousse']],
      ['🥦 Légumes', ['brocoli', 'carotte', 'tomate', 'concombre', 'salade', 'épinard', 'chou', 'chou-fleur', 'courgette', 'aubergine', 'poivron', 'haricot vert', 'petit pois', 'maïs', 'patate douce', 'pomme de terre', 'navet', 'radis', 'endive']],
      ['🍚 Féculents', ['riz', 'pâtes', 'pain', 'quinoa', 'avoine', 'semoule', 'boulgour', 'lentilles', 'pois chiches', 'haricots rouges', 'soja', 'tofu']],
      ['🍗 Protéines', ['poulet', 'dinde', 'boeuf', 'veau', 'porc', 'agneau', 'poisson', 'saumon', 'thon', 'sardine', 'crevette', 'oeuf', 'lait', 'yaourt', 'fromage', 'fromage blanc']],
      ['🥑 Matières grasses', ['huile olive', 'beurre', 'margarine', 'crème fraîche', 'amande', 'noix', 'noisette', 'cacahuète', 'avocat']],
      ['🍰 Autres', []]
    ]);
    const words = meals.toLowerCase().split(/[\s,;:]+/);
    const list: { [cat: string]: Set<string> } = {};
    for (const cat of categoryMap.keys()) list[cat] = new Set();
    words.forEach(w => {
      if (w.length < 2) return;
      let found = false;
      for (const [cat, keywords] of categoryMap.entries()) {
        if (keywords.some(k => w.includes(k))) {
          list[cat].add(w);
          found = true;
          break;
        }
      }
      if (!found) list['🍰 Autres'].add(w);
    });
    this.shoppingList = {};
    this.shoppingListCategories = [];
    for (const [cat, items] of Object.entries(list)) {
      if (items.size > 0) {
        this.shoppingList[cat] = Array.from(items).map(name => ({ name, checked: false }));
        this.shoppingListCategories.push(cat);
      }
    }
    if (this.shoppingListCategories.length === 0) {
      this.showNotification('Aucun ingrédient reconnu. Utilisez des mots comme "riz, poulet, brocolis".', 'error');
    } else {
      this.showNotification('Liste de courses générée !', 'success');
    }
  }

  exportShoppingListToPdf() {
    if (!this.shoppingListCategories.length) return;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Liste de courses</title><style>body{font-family:sans-serif;margin:40px;}ul{list-style:none;}</style></head><body><h2>🛒 Liste de courses</h2>${this.shoppingListCategories.map(cat => `<h3>${cat}</h3><ul>${this.shoppingList[cat].map(item => `<li><input type="checkbox"> ${item.name}</li>`).join('')}</ul>`).join('')}<p>Généré le ${new Date().toLocaleString()}</p></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `liste_courses_${this.selectedPlan?.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
    this.showNotification('Liste exportée (HTML)', 'success');
  }

  downloadPlan(plan: DietPlanResponse) {
    const patientName = this.getPatientName(plan.healthProfileId);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Plan alimentaire - ${patientName}</title><style>body{font-family:sans-serif;margin:40px;}</style></head><body><h1>Plan alimentaire</h1><p>Nom : ${plan.planName}</p><p>Calories : ${plan.dailyCalories || '-'} kcal/jour</p><p>Suggestions : ${plan.mealSuggestions || '-'}</p><p>Généré le ${new Date().toLocaleString()}</p></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan_${plan.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
    this.showNotification('Fiche téléchargée', 'success');
  }

  openModal(p?: DietPlanResponse) {
    if (p) {
      this.editingId = p.id;
      this.form = { ...p };
      this.form.startDate = p.startDate ? p.startDate.slice(0,10) : '';
      this.form.endDate = p.endDate ? p.endDate.slice(0,10) : '';
    } else {
      this.editingId = null;
      this.form = {
        healthProfileId: this.healthProfiles.length ? this.healthProfiles[0].id : 0,
        planName: '', description: '', dailyCalories: 0, mealSuggestions: '', startDate: '', endDate: '',
        isActive: true, dietaryRestrictions: '', nutritionalGoals: '', createdBy: ''
      };
    }
    this.modalVisible = true;
  }

  closeModal() { this.modalVisible = false; }

  save() {
    if (this.isSubmitting) return;
    if (!this.form.healthProfileId || !this.form.planName || !this.form.startDate || !this.form.createdBy) {
      this.showNotification('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }
    this.isSubmitting = true;
    const obs = this.editingId ? this.dietService.update(this.editingId, this.form) : this.dietService.create(this.form);
    obs.subscribe({
      next: () => { this.loadPlans(); this.closeModal(); this.showNotification(this.editingId ? 'Plan modifié' : 'Plan créé', 'success'); this.isSubmitting = false; },
      error: (err) => { this.showNotification(err.error?.message || 'Erreur', 'error'); this.isSubmitting = false; }
    });
  }

  deletePlan(id: number) {
    if (confirm('Supprimer définitivement ce plan ?')) {
      this.dietService.delete(id).subscribe({
        next: () => { this.loadPlans(); this.showNotification('Plan supprimé', 'success'); if (this.selectedPlan?.id === id) this.selectedPlan = null; },
        error: () => this.showNotification('Erreur suppression', 'error')
      });
    }
  }

  activate(id: number) {
    this.dietService.activate(id).subscribe({
      next: () => { this.loadPlans(); this.showNotification('Plan activé', 'success'); },
      error: () => this.showNotification('Erreur activation', 'error')
    });
  }

  deactivate(id: number) {
    this.dietService.deactivate(id).subscribe({
      next: () => { this.loadPlans(); this.showNotification('Plan désactivé', 'success'); },
      error: () => this.showNotification('Erreur désactivation', 'error')
    });
  }

  private showNotification(msg: string, type: 'success' | 'error') {
    this.notification = msg;
    this.notificationType = type;
    setTimeout(() => this.notification = '', 4000);
  }
}