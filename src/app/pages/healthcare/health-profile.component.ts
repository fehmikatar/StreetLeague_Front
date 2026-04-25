// health-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { HealthProfileService, HealthProfileResponse, HealthProfileRequest } from '../../services/health-profile.service';
import { UserService } from '../../services/user.service';

Chart.register(...registerables);

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
}

@Component({
  selector: 'app-health-profile',
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
              <h1 class="text-3xl font-bold text-gray-800">📋 Profils de santé</h1>
              <p class="text-gray-600 mt-1">Gestion des profils médicaux et sportifs</p>
            </div>
          </div>
          <button (click)="openModal()" class="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl shadow-md transition">+ Nouveau profil</button>
        </div>
      </div>

      <!-- Toast -->
      <div *ngIf="notification" class="fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm animate-bounce" [class.bg-green-600]="notificationType === 'success'" [class.bg-red-600]="notificationType === 'error'">{{ notification }}</div>

      <!-- Chargement -->
      <div *ngIf="isLoading" class="text-center py-12"><div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div><p class="mt-2">Chargement...</p></div>

      <!-- Tableau des profils -->
      <div *ngIf="!isLoading" class="bg-white rounded-2xl border shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Patient</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Âge</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Poids/Taille</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">IMC</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Catégorie</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr *ngFor="let p of profiles" (click)="showDetails(p)" class="hover:bg-gray-50 cursor-pointer">
                <td class="px-6 py-4 text-sm">{{ p.id }}</td>
                <td class="px-6 py-4 text-sm">{{ getUserName(p.userId) }}</td>
                <td class="px-6 py-4 text-sm">{{ p.age }}</td>
                <td class="px-6 py-4 text-sm">{{ p.weight }} kg / {{ p.height }} cm</td>
                <td class="px-6 py-4 text-sm font-medium">{{ p.bmi | number:'1.1-1' }}</td>
                <td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-full" [class.bg-green-100]="p.bmiCategory === 'Poids normal'" [class.bg-yellow-100]="p.bmiCategory === 'Surpoids'" [class.bg-red-100]="p.bmiCategory === 'Obésité'">{{ p.bmiCategory }}</span></td>
                <td class="px-6 py-4 text-right space-x-2">
                  <button (click)="openModal(p); $event.stopPropagation()" class="text-green-600 hover:text-green-900">✏️</button>
                  <button (click)="deleteProfile(p.id); $event.stopPropagation()" class="text-red-600 hover:text-red-900">🗑️</button>
                  <button (click)="downloadProfile(p); $event.stopPropagation()" class="text-blue-600 hover:text-blue-900">📥</button>
                </td>
              </tr>
              <tr *ngIf="profiles.length === 0"><td colspan="7" class="text-center py-10 text-gray-400">Aucun profil</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Détails du profil sélectionné (sous le tableau) -->
      <div *ngIf="selectedProfile" class="mt-8 bg-white rounded-2xl border shadow-lg p-6 space-y-6">
        <div class="flex justify-between items-center border-b pb-4">
          <h2 class="text-xl font-bold text-gray-800">📄 Détails du patient</h2>
          <button (click)="closeDetails()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <!-- Informations classiques -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 p-3 rounded"><span class="font-semibold">Patient :</span> {{ getUserName(selectedProfile.userId) }}</div>
          <div class="bg-gray-50 p-3 rounded"><span class="font-semibold">Âge :</span> {{ selectedProfile.age }}</div>
          <div class="bg-gray-50 p-3 rounded"><span class="font-semibold">Poids :</span> {{ selectedProfile.weight }} kg</div>
          <div class="bg-gray-50 p-3 rounded"><span class="font-semibold">Taille :</span> {{ selectedProfile.height }} cm</div>
          <div class="bg-gray-50 p-3 rounded"><span class="font-semibold">IMC :</span> {{ selectedProfile.bmi | number:'1.1-1' }}</div>
          <div class="bg-gray-50 p-3 rounded"><span class="font-semibold">Catégorie IMC :</span> {{ selectedProfile.bmiCategory }}</div>
          <div class="bg-gray-50 p-3 rounded"><span class="font-semibold">Sexe :</span> {{ selectedProfile.gender === 'MALE' ? 'Homme' : 'Femme' }}</div>
          <div class="bg-gray-50 p-3 rounded"><span class="font-semibold">Position sportive :</span> {{ selectedProfile.sportPosition || '-' }}</div>
          <div class="bg-gray-50 p-3 rounded"><span class="font-semibold">Statut fitness :</span> {{ selectedProfile.fitnessStatus }}</div>
          <div class="bg-gray-50 p-3 rounded"><span class="font-semibold">Groupe sanguin :</span> {{ selectedProfile.bloodType || '-' }}</div>
          <div class="bg-gray-50 p-3 rounded"><span class="font-semibold">Contact urgence :</span> {{ selectedProfile.emergencyContact || '-' }}</div>
          <div class="bg-gray-50 p-3 rounded"><span class="font-semibold">Tél urgence :</span> {{ selectedProfile.emergencyPhone }}</div>
          <div class="col-span-2 bg-gray-50 p-3 rounded"><span class="font-semibold">Allergies :</span> {{ selectedProfile.allergies || 'Aucune' }}</div>
          <div class="col-span-2 bg-gray-50 p-3 rounded"><span class="font-semibold">Conditions médicales :</span> {{ selectedProfile.medicalConditions || 'Aucune' }}</div>
          <div class="col-span-2 bg-gray-50 p-3 rounded"><span class="font-semibold">Dernière mise à jour :</span> {{ selectedProfile.lastUpdated | date:'dd/MM/yyyy HH:mm' }}</div>
        </div>

        <!-- Score santé global -->
        <div class="bg-teal-50 p-4 rounded-xl border border-teal-200">
          <h3 class="font-bold text-teal-800 text-lg">🌟 Score de santé global</h3>
          <div class="flex flex-col md:flex-row items-center gap-6">
            <div class="relative w-32 h-32">
              <svg class="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" stroke-width="8"/>
                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#grad)" stroke-width="8"
                        stroke-dasharray="283" [attr.stroke-dashoffset]="283 - (283 * healthScore / 100)"
                        stroke-linecap="round" transform="rotate(-90 50 50)"/>
                <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#ef4444"/><stop offset="50%" stop-color="#f59e0b"/>
                  <stop offset="100%" stop-color="#10b981"/>
                </linearGradient></defs>
                <text x="50" y="55" text-anchor="middle" class="text-xl font-bold fill-gray-800">{{ healthScore }}</text>
              </svg>
            </div>
            <div class="flex-1 text-center md:text-left">
              <p class="text-sm text-gray-700">{{ healthScoreMessage }}</p>
              <div class="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                <span class="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs">IMC: {{ selectedProfile.bmi | number:'1.1-1' }}</span>
                <span class="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs">Âge: {{ selectedProfile.age }}</span>
                <span class="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs">Fitness: {{ selectedProfile.fitnessStatus }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recommandations personnalisées -->
        <div class="bg-amber-50 p-4 rounded-xl border border-amber-200">
          <h3 class="font-bold text-amber-800 text-lg">💡 Recommandations personnalisées</h3>
          <p class="text-sm text-gray-700">{{ personalizedAdvice }}</p>
        </div>

        <!-- BMR et besoins caloriques -->
        <div class="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <h3 class="font-bold text-blue-800 text-lg">🔥 Métabolisme de base & besoins caloriques</h3>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div><span class="font-semibold">BMR :</span> {{ bmr }} kcal/jour</div>
            <div><span class="font-semibold">Maintien :</span> {{ maintenanceCalories }} kcal/jour</div>
            <div><span class="font-semibold">Perte de poids :</span> {{ weightLossCalories }} kcal/jour</div>
            <div><span class="font-semibold">Gain musculaire :</span> {{ weightGainCalories }} kcal/jour</div>
          </div>
          <p class="text-xs text-blue-700 mt-2">📌 Basé sur la formule de Harris & Benedict (niveau d'activité modéré).</p>
        </div>

        <!-- Plan d'activité -->
        <div class="bg-purple-50 p-4 rounded-xl border border-purple-200">
          <h3 class="font-bold text-purple-800 text-lg">🏋️ Plan d'activité hebdomadaire personnalisé</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-purple-100">
                <tr><th class="p-2 text-left">Jour</th><th class="p-2 text-left">Exercice</th><th class="p-2 text-left">Durée</th><th class="p-2 text-left">Intensité</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let act of activityPlan" class="border-b border-purple-100">
                  <td class="p-2 font-medium">{{ act.day }}</td>
                  <td class="p-2">{{ act.exercise }}</td>
                  <td class="p-2">{{ act.duration }}</td>
                  <td class="p-2">{{ act.intensity }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-xs text-purple-700 mt-2">✨ Basé sur IMC={{ selectedProfile.bmi | number:'1.1-1' }}, statut={{ selectedProfile.fitnessStatus }}, sport={{ selectedProfile.sportPosition || 'général' }}</p>
        </div>

        <!-- Graphique d'évolution du poids -->
        <div *ngIf="weightHistory.length" class="border-t pt-4">
          <h3 class="text-lg font-bold text-gray-800 mb-2">📈 Évolution du poids (6 derniers mois)</h3>
          <canvas id="weightChart" width="400" height="200" style="max-width:100%; height:auto;"></canvas>
          <p class="text-xs text-gray-500 mt-2">Historique automatique à chaque modification du poids.</p>
        </div>

        <div class="flex justify-end">
          <button (click)="downloadProfile(selectedProfile)" class="bg-green-600 text-white px-4 py-2 rounded-lg">📥 Télécharger la fiche HTML</button>
        </div>
      </div>

      <!-- Modal création / modification (inchangée) -->
      <div *ngIf="modalVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between">
            <h2 class="text-xl font-bold">{{ editingId ? 'Modifier' : 'Nouveau' }} profil santé</h2>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          <form #profileForm="ngForm" (ngSubmit)="save()" class="p-6 space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label>Utilisateur *</label><select *ngIf="users.length>0" [(ngModel)]="form.userId" name="userId" required class="w-full p-2 border rounded"><option *ngFor="let u of users" [value]="u.id">{{ u.firstName }} {{ u.lastName }}</option></select><input *ngIf="users.length===0" type="number" [(ngModel)]="form.userId" name="userId" required class="w-full p-2 border rounded" placeholder="ID utilisateur"></div>
              <div><label>Âge *</label><input type="number" [(ngModel)]="form.age" name="age" required class="w-full p-2 border rounded"></div>
              <div><label>Poids (kg) *</label><input type="number" step="0.1" [(ngModel)]="form.weight" name="weight" required class="w-full p-2 border rounded"></div>
              <div><label>Taille (cm) *</label><input type="number" step="0.1" [(ngModel)]="form.height" name="height" required class="w-full p-2 border rounded"></div>
              <div><label>Sexe *</label><select [(ngModel)]="form.gender" name="gender" required class="w-full p-2 border rounded"><option value="MALE">Homme</option><option value="FEMALE">Femme</option></select></div>
              <div><label>Position sportive</label><input type="text" [(ngModel)]="form.sportPosition" class="w-full p-2 border rounded"></div>
              <div><label>Statut fitness</label><select [(ngModel)]="form.fitnessStatus" class="w-full p-2 border rounded"><option value="ACTIVE">Actif</option><option value="LIMITED">Limité</option><option value="INJURED">Blessé</option><option value="RECOVERING">Rétablissement</option><option value="RESTING">Repos</option></select></div>
              <div><label>Contact urgence</label><input type="text" [(ngModel)]="form.emergencyContact" class="w-full p-2 border rounded"></div>
              <div><label>Téléphone urgence *</label><input type="text" [(ngModel)]="form.emergencyPhone" name="emergencyPhone" required pattern="^\\d{8,}$" class="w-full p-2 border rounded"></div>
              <div><label>Groupe sanguin</label><select [(ngModel)]="form.bloodType" class="w-full p-2 border rounded"><option *ngFor="let bt of bloodTypes" [value]="bt">{{ bt }}</option></select></div>
            </div>
            <div><label>Allergies</label><textarea rows="2" [(ngModel)]="form.allergies" class="w-full p-2 border rounded"></textarea></div>
            <div><label>Conditions médicales</label><textarea rows="2" [(ngModel)]="form.medicalConditions" class="w-full p-2 border rounded"></textarea></div>
            <div class="flex justify-end gap-3"><button type="button" (click)="closeModal()" class="px-4 py-2 border rounded-lg">Annuler</button><button type="submit" class="px-5 py-2 bg-green-600 text-white rounded-lg">{{ editingId ? 'Mettre à jour' : 'Créer' }}</button></div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    input.ng-invalid.ng-touched, select.ng-invalid.ng-touched, textarea.ng-invalid.ng-touched { border-color: #ef4444; }
    .animate-bounce { animation: bounce 0.5s ease-in-out; }
    @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  `]
})
export class HealthProfileComponent implements OnInit {
  profiles: HealthProfileResponse[] = [];
  users: User[] = [];
  private userMap = new Map<number, string>();
  isLoading = true;
  modalVisible = false;
  detailsVisible = false; // gardé pour compatibilité, mais on utilise selectedProfile
  selectedProfile: HealthProfileResponse | null = null;
  editingId: number | null = null;

  form: HealthProfileRequest & { gender?: string } = {
    userId: 0, weight: 0, height: 0, age: 0, sportPosition: '', fitnessStatus: 'ACTIVE',
    emergencyContact: '', emergencyPhone: '00000000', bloodType: 'A+', allergies: '',
    medicalConditions: '', gender: 'MALE'
  };

  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  notification = '';
  notificationType: 'success' | 'error' = 'success';

  // Métiers avancés
  bmr = 0;
  maintenanceCalories = 0;
  weightLossCalories = 0;
  weightGainCalories = 0;
  activityPlan: { day: string; exercise: string; duration: string; intensity: string }[] = [];
  healthScore = 0;
  healthScoreMessage = '';
  personalizedAdvice = '';
  weightHistory: { date: string; weight: number }[] = [];

  constructor(
    private healthService: HealthProfileService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadUsersFromLocalStorage();
  }

  loadUsersFromLocalStorage() {
    const userId = localStorage.getItem('user_id');
    const userName = localStorage.getItem('user_name') || 'Utilisateur';
    if (userId && !isNaN(parseInt(userId))) {
      const user: User = {
        id: parseInt(userId),
        firstName: userName.split(' ')[0],
        lastName: userName.split(' ')[1] || '',
        email: ''
      };
      this.users = [user];
      this.userMap.set(user.id, `${user.firstName} ${user.lastName}`);
      this.form.userId = user.id;
    } else {
      this.users = [];
      this.form.userId = 0;
    }
    this.loadProfiles();
  }

  loadProfiles() {
    this.isLoading = true;
    this.healthService.getAll().subscribe({
      next: (data) => {
        this.profiles = data.map(p => ({
          ...p,
          gender: (p as any).gender || 'MALE',
          bmiCategory: p.bmiCategory || this.getBmiCategory(p.bmi || 0)
        }));
        this.isLoading = false;
      },
      error: () => {
        this.showNotification('Erreur chargement profils', 'error');
        this.isLoading = false;
      }
    });
  }

  getUserName(userId: number): string {
    if (this.userMap.has(userId)) return this.userMap.get(userId)!;
    const user = this.users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : `Utilisateur ${userId}`;
  }

  private getBmiCategory(bmi: number): string {
    if (bmi < 18.5) return 'Sous-poids';
    if (bmi < 25) return 'Poids normal';
    if (bmi < 30) return 'Surpoids';
    return 'Obésité';
  }

  // ========== BMR ==========
  computeBmrAndCalories(profile: HealthProfileResponse) {
    const weight = profile.weight;
    const height = profile.height;
    const age = profile.age;
    const gender = (profile as any).gender || 'MALE';
    let bmr = 0;
    if (gender === 'MALE') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    this.bmr = Math.round(bmr);
    this.maintenanceCalories = Math.round(bmr * 1.55);
    this.weightLossCalories = Math.max(1200, this.maintenanceCalories - 500);
    this.weightGainCalories = this.maintenanceCalories + 300;
  }

  // ========== Plan d'activité ==========
  generateActivityPlan(profile: HealthProfileResponse) {
    const bmi = profile.bmi || 0;
    const fitness = profile.fitnessStatus;
    const sport = profile.sportPosition?.toLowerCase() || '';
    const isInjured = fitness === 'INJURED' || fitness === 'RECOVERING';
    const isOverweight = bmi >= 25;
    const isObese = bmi >= 30;

    let plan: { day: string; exercise: string; duration: string; intensity: string }[] = [];

    if (isInjured) {
      plan = [
        { day: 'Lundi', exercise: 'Étirements doux / mobilité articulaire', duration: '15 min', intensity: 'Faible' },
        { day: 'Mercredi', exercise: 'Renforcement isométrique (sans douleur)', duration: '20 min', intensity: 'Faible' },
        { day: 'Vendredi', exercise: 'Marche ou vélo très léger', duration: '20 min', intensity: 'Faible' },
        { day: 'Dimanche', exercise: 'Repos actif (étirements)', duration: '10 min', intensity: 'Très faible' }
      ];
    } else if (isObese) {
      plan = [
        { day: 'Lundi', exercise: 'Marche rapide', duration: '30 min', intensity: 'Modérée' },
        { day: 'Mercredi', exercise: 'Natation ou aquagym', duration: '30 min', intensity: 'Modérée' },
        { day: 'Vendredi', exercise: 'Vélo elliptique', duration: '25 min', intensity: 'Modérée' },
        { day: 'Samedi', exercise: 'Renforcement léger (squats, gainage)', duration: '20 min', intensity: 'Faible' }
      ];
    } else if (isOverweight) {
      plan = [
        { day: 'Lundi', exercise: 'Course à pied (alternance marche/course)', duration: '35 min', intensity: 'Modérée' },
        { day: 'Mardi', exercise: 'Circuit training (pompes, fentes, gainage)', duration: '25 min', intensity: 'Élevée' },
        { day: 'Jeudi', exercise: 'Vélo ou rameur', duration: '40 min', intensity: 'Modérée' },
        { day: 'Samedi', exercise: 'Sport collectif ou randonnée', duration: '60 min', intensity: 'Variable' }
      ];
    } else {
      if (sport.includes('foot') || sport.includes('basket') || sport.includes('volley')) {
        plan = [
          { day: 'Lundi', exercise: 'Entraînement spécifique (technique)', duration: '45 min', intensity: 'Élevée' },
          { day: 'Mercredi', exercise: 'Renforcement musculaire (explosivité)', duration: '30 min', intensity: 'Élevée' },
          { day: 'Vendredi', exercise: 'Match ou opposition', duration: '60 min', intensity: 'Maximale' },
          { day: 'Samedi', exercise: 'Récupération active (étirements, mobilité)', duration: '20 min', intensity: 'Faible' }
        ];
      } else {
        plan = [
          { day: 'Lundi', exercise: 'Course à pied', duration: '30 min', intensity: 'Modérée' },
          { day: 'Mercredi', exercise: 'Musculation (full body)', duration: '40 min', intensity: 'Élevée' },
          { day: 'Vendredi', exercise: 'Yoga ou Pilates', duration: '30 min', intensity: 'Modérée' },
          { day: 'Samedi', exercise: 'Sortie longue (vélo, rando)', duration: '60 min', intensity: 'Modérée' }
        ];
      }
    }
    this.activityPlan = plan;
  }

  // ========== Score santé ==========
  computeHealthScore(profile: HealthProfileResponse): number {
    let score = 0;
    const bmi = profile.bmi || 0;
    if (bmi >= 18.5 && bmi <= 25) score += 40;
    else if (bmi < 18.5) score += 20;
    else if (bmi < 30) score += 15;
    else score += 5;
    switch (profile.fitnessStatus) {
      case 'ACTIVE': score += 30; break;
      case 'RECOVERING': score += 15; break;
      case 'LIMITED': score += 10; break;
      case 'INJURED': score += 5; break;
      default: score += 20;
    }
    if (profile.age < 50) score += 15;
    else if (profile.age < 65) score += 10;
    else score += 5;
    const hasCondition = profile.medicalConditions && profile.medicalConditions.trim().length > 5;
    score += hasCondition ? 5 : 15;
    return Math.min(100, Math.round(score));
  }

  getHealthScoreMessage(score: number): string {
    if (score >= 80) return '🌟 Excellent état de santé ! Continuez ainsi.';
    if (score >= 60) return '👍 Bon état de santé, quelques axes d’amélioration.';
    if (score >= 40) return '⚠️ Santé à surveiller. Consultez les recommandations.';
    return '❌ Urgence médicale probable. Prenez rendez-vous rapidement.';
  }

  // ========== Recommandations ==========
  generatePersonalizedAdvice(profile: HealthProfileResponse): string {
    const bmi = profile.bmi || 0;
    const age = profile.age;
    const sport = profile.sportPosition?.toLowerCase() || '';
    const medical = profile.medicalConditions?.toLowerCase() || '';
    let advice = '';
    if (bmi >= 30) advice += '🆘 Obésité sévère : consultez un nutritionniste et pratiquez une activité douce (natation, marche). ';
    else if (bmi >= 25) advice += '🏃‍♂️ Surpoids : privilégiez les aliments riches en fibres et une activité régulière (30 min/jour). ';
    else if (bmi < 18.5) advice += '🍎 Insuffisance pondérale : augmentez les apports en protéines et bonnes graisses (avocat, oléagineux). ';
    else advice += '✅ IMC idéal : maintenez une alimentation équilibrée et variée. ';
    if (age >= 50) advice += '📆 Bilan annuel recommandé (coloscopie, PSA). ';
    else if (age >= 65) advice += '🩺 Vaccins antigrippal et pneumocoque. ';
    if (!sport) advice += '🚶 10 000 pas par jour améliorent la santé cardiovasculaire. ';
    if (medical.includes('diabète')) advice += '🍬 Contrôlez votre glycémie quotidiennement. ';
    if (medical.includes('hypertension')) advice += '❤️ Réduisez le sel et surveillez votre tension. ';
    if (advice === '') advice = 'Continuez vos bonnes habitudes !';
    return advice;
  }

  // ========== Historique du poids ==========
  loadWeightHistory(userId: number) {
    const key = `weight_history_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      this.weightHistory = JSON.parse(stored);
    } else {
      this.weightHistory = [];
      const currentWeight = this.selectedProfile?.weight || 70;
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        this.weightHistory.push({
          date: date.toISOString().slice(0,10),
          weight: Math.round((currentWeight + (Math.random() - 0.5) * 2) * 10) / 10
        });
      }
      localStorage.setItem(key, JSON.stringify(this.weightHistory));
    }
  }

  drawWeightChart() {
    const canvas = document.getElementById('weightChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const labels = this.weightHistory.map(h => h.date.slice(5));
    const data = this.weightHistory.map(h => h.weight);
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Poids (kg)',
          data: data,
          borderColor: '#1DB954',
          backgroundColor: 'rgba(29,185,84,0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: { responsive: true, maintainAspectRatio: true }
    });
  }

  saveWeightMeasurement(userId: number, newWeight: number) {
    const key = `weight_history_${userId}`;
    let history = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)!) : [];
    const today = new Date().toISOString().slice(0,10);
    const existingIndex = history.findIndex((h: any) => h.date === today);
    if (existingIndex >= 0) history[existingIndex].weight = newWeight;
    else history.push({ date: today, weight: newWeight });
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    history = history.filter((h: any) => new Date(h.date) >= sixMonthsAgo);
    localStorage.setItem(key, JSON.stringify(history));
    this.weightHistory = history;
  }

  // ========== Affichage des détails sous le tableau ==========
  showDetails(profile: HealthProfileResponse) {
    this.selectedProfile = profile;
    this.computeBmrAndCalories(profile);
    this.generateActivityPlan(profile);
    this.healthScore = this.computeHealthScore(profile);
    this.healthScoreMessage = this.getHealthScoreMessage(this.healthScore);
    this.personalizedAdvice = this.generatePersonalizedAdvice(profile);
    this.loadWeightHistory(profile.userId);
    setTimeout(() => this.drawWeightChart(), 100);
  }

  closeDetails() {
    this.selectedProfile = null;
    // Optionnel : réinitialiser les variables pour éviter l’affichage du graphique sur le prochain profil
    this.weightHistory = [];
  }

  // ========== Téléchargement HTML ==========
  downloadProfile(profile: HealthProfileResponse) {
    const userName = this.getUserName(profile.userId);
    const genderText = (profile as any).gender === 'MALE' ? 'Homme' : 'Femme';
    const bmiVal = profile.bmi?.toFixed(1) || '?';
    const bmrVal = this.bmr;
    const maintenance = this.maintenanceCalories;
    const weightLoss = this.weightLossCalories;
    const weightGain = this.weightGainCalories;
    const activityTableRows = this.activityPlan.map(a => `
      <tr><td class="p-2">${a.day}</td><td class="p-2">${a.exercise}</td><td class="p-2">${a.duration}</td><td class="p-2">${a.intensity}</td></tr>
    `).join('');

    const htmlContent = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Fiche santé avancée - ${userName}</title>
<style>body{font-family:'Segoe UI',sans-serif;margin:40px;background:#f4f7fc}.container{max-width:900px;margin:auto;background:#fff;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,0.1);overflow:hidden}.header{background:linear-gradient(135deg,#2ecc71,#27ae60);color:#fff;padding:30px;text-align:center}.content{padding:30px}.section{margin-bottom:25px;border-bottom:1px solid #ecf0f1;padding-bottom:15px}.section h3{color:#27ae60}.info-grid{display:grid;grid-template-columns:1fr 2fr;gap:12px}.label{font-weight:700;color:#7f8c8d}table{width:100%;border-collapse:collapse;margin-top:10px}th,td{padding:8px;text-align:left;border-bottom:1px solid #ddd}th{background:#f2f2f2}.bmi-badge{padding:5px 12px;border-radius:20px;color:#fff;display:inline-block}.normal{background:#2ecc71}.surpoids{background:#f39c12}.obesite{background:#e74c3c}.sous-poids{background:#3498db}footer{background:#ecf0f1;text-align:center;padding:15px;font-size:12px}</style>
</head>
<body><div class="container"><div class="header"><h1>🏥 Fiche de santé avancée</h1><p>Généré le ${new Date().toLocaleString()}</p></div>
<div class="content">
<div class="section"><h3>👤 Identité</h3><div class="info-grid"><div class="label">Patient :</div><div class="value">${userName}</div><div class="label">Âge :</div><div class="value">${profile.age} ans</div><div class="label">Sexe :</div><div class="value">${genderText}</div><div class="label">Groupe sanguin :</div><div class="value">${profile.bloodType || 'Non renseigné'}</div></div></div>
<div class="section"><h3>📊 Mesures corporelles</h3><div class="info-grid"><div class="label">Poids :</div><div class="value">${profile.weight} kg</div><div class="label">Taille :</div><div class="value">${profile.height} cm</div><div class="label">IMC :</div><div class="value">${bmiVal}</div><div class="label">Catégorie :</div><div class="value"><span class="bmi-badge ${profile.bmiCategory?.toLowerCase().replace('é','e').replace('ô','o')}">${profile.bmiCategory}</span></div></div></div>
<div class="section"><h3>🔥 Besoins caloriques</h3><div class="info-grid"><div class="label">Métabolisme de base (BMR) :</div><div class="value">${bmrVal} kcal/j</div><div class="label">Maintien :</div><div class="value">${maintenance} kcal/j</div><div class="label">Perte de poids :</div><div class="value">${weightLoss} kcal/j</div><div class="label">Gain musculaire :</div><div class="value">${weightGain} kcal/j</div></div></div>
<div class="section"><h3>🏋️ Plan d'activité hebdomadaire</h3><table><thead><tr><th>Jour</th><th>Exercice</th><th>Durée</th><th>Intensité</th></tr></thead><tbody>${activityTableRows}</tbody></table></div>
<div class="section"><h3>🏅 Sport & forme</h3><div class="info-grid"><div class="label">Position sportive :</div><div class="value">${profile.sportPosition || '-'}</div><div class="label">Statut fitness :</div><div class="value">${profile.fitnessStatus}</div></div></div>
<div class="section"><h3>🚨 Urgences</h3><div class="info-grid"><div class="label">Contact d'urgence :</div><div class="value">${profile.emergencyContact || '-'}</div><div class="label">Téléphone :</div><div class="value">${profile.emergencyPhone}</div></div></div>
<div class="section"><h3>🩺 Antécédents</h3><div class="info-grid"><div class="label">Allergies :</div><div class="value">${profile.allergies || 'Aucune'}</div><div class="label">Conditions médicales :</div><div class="value">${profile.medicalConditions || 'Aucune'}</div></div></div>
</div><footer>Document confidentiel - Générateur santé avancé</footer></div></body></html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fiche_sante_avancee_${profile.id}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.showNotification('Fiche HTML enrichie téléchargée', 'success');
  }

  // ========== CRUD Modal ==========
  openModal(p?: HealthProfileResponse) {
    if (p) {
      this.editingId = p.id;
      this.form = {
        userId: p.userId,
        weight: p.weight,
        height: p.height,
        age: p.age,
        sportPosition: p.sportPosition || '',
        fitnessStatus: p.fitnessStatus,
        emergencyContact: p.emergencyContact || '',
        emergencyPhone: p.emergencyPhone || '00000000',
        bloodType: p.bloodType || 'A+',
        allergies: p.allergies || '',
        medicalConditions: p.medicalConditions || '',
        gender: (p as any).gender || 'MALE'
      };
    } else {
      this.editingId = null;
      const defaultUserId = this.users.length > 0 ? this.users[0].id : 0;
      this.form = {
        userId: defaultUserId,
        weight: 0,
        height: 0,
        age: 0,
        sportPosition: '',
        fitnessStatus: 'ACTIVE',
        emergencyContact: '',
        emergencyPhone: '00000000',
        bloodType: 'A+',
        allergies: '',
        medicalConditions: '',
        gender: 'MALE'
      };
    }
    this.modalVisible = true;
  }

  closeModal() { this.modalVisible = false; }

  save() {
    if (!this.form.userId || this.form.userId <= 0 || !this.form.weight || !this.form.height || !this.form.age || !this.form.emergencyPhone?.match(/^\d{8,}$/)) {
      this.showNotification('Veuillez remplir tous les champs obligatoires (ID utilisateur valide, poids, taille, âge, téléphone 8 chiffres)', 'error');
      return;
    }
    const payload: HealthProfileRequest = { ...this.form };
    const obs = this.editingId
      ? this.healthService.update(this.editingId, payload)
      : this.healthService.create(payload);
    obs.subscribe({
      next: () => {
        this.loadProfiles();
        this.saveWeightMeasurement(this.form.userId, this.form.weight);
        this.closeModal();
        this.showNotification(this.editingId ? 'Profil mis à jour' : 'Profil créé', 'success');
      },
      error: (err) => {
        let errorMsg = 'Erreur lors de l\'enregistrement';
        if (err.error?.errors) errorMsg = Object.values(err.error.errors).join(', ');
        else if (err.error?.message) errorMsg = err.error.message;
        this.showNotification(errorMsg, 'error');
      }
    });
  }

  deleteProfile(id: number) {
    if (confirm('Supprimer définitivement ce profil ?')) {
      this.healthService.delete(id).subscribe({
        next: () => {
          this.loadProfiles();
          this.showNotification('Profil supprimé', 'success');
        },
        error: () => this.showNotification('Erreur suppression', 'error')
      });
    }
  }

  private showNotification(msg: string, type: 'success' | 'error') {
    this.notification = msg;
    this.notificationType = type;
    setTimeout(() => this.notification = '', 4000);
  }
}