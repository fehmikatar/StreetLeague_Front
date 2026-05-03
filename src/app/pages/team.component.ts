import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideAngularModule, Users, Shield, Plus, Loader2, X, RefreshCcw, Eye, Sparkles, ChevronLeft, ChevronRight } from 'lucide-angular';
import { TeamService, Team, TeamPayload } from '../services/team.service';
import { MatchResponse, MatchingService, PlayerProfileMatchingRequest } from '../services/matching.service';
import { UserService } from '../services/user.service';

type SmartMatchProfileType = 'PLAYER' | 'TEAM';

interface SmartMatchAvailability {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface SmartMatchRequiredPosition {
  position: string;
  neededCount: number;
}

interface SmartMatchPlayerProfile {
  type: 'PLAYER';
  name: string;
  sportType: string;
  skillLevel: string;
  position: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  availability: SmartMatchAvailability[];
  preferredPlayStyle: string;
  rating: number | null;
}

interface SmartMatchTeamProfile {
  type: 'TEAM';
  teamName: string;
  sportType: string;
  teamLevel: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  requiredPositions: SmartMatchRequiredPosition[];
  schedule: SmartMatchAvailability[];
  description: string;
}

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background">
      <div class="relative h-48 overflow-hidden border-b border-border">
        <div class="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-20"></div>
        <div class="absolute inset-0 flex items-center">
          <div class="container mx-auto px-4 max-w-7xl">
            <div class="flex items-center gap-6">
              <div class="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl border-4 border-background">
                <lucide-icon [name]="ShieldIcon" [size]="48" class="text-white"></lucide-icon>
              </div>
              <div>
                <h1 class="mb-2">Équipes</h1>
                <div class="flex items-center gap-4 text-sm text-muted-foreground">
                  <span class="flex items-center gap-1">
                    <lucide-icon [name]="UsersIcon" [size]="16"></lucide-icon>
                    {{ teams.length }} Équipe(s)
                  </span>
                  <span *ngIf="isAdmin">Mode admin: vue globale des équipes</span>
                  <span *ngIf="!isAdmin">Mode utilisateur: la liste peut être filtrée côté backend</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-8 max-w-7xl">
        <div class="flex justify-end gap-3 mb-6">
          <button (click)="openSmartMatchModal()" class="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-500/90 transition-all shadow-lg shadow-amber-500/30">
            <lucide-icon [name]="SparklesIcon" [size]="16"></lucide-icon>
            Smart Match
          </button>
          <button *ngIf="isAdmin" (click)="openManageRequests()" class="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-xl hover:bg-muted/70 transition-all border border-border">
            <lucide-icon [name]="EyeIcon" [size]="16"></lucide-icon>
            Manage Request
          </button>
          <button *ngIf="isAdmin" (click)="openCreateModal()" class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
            <lucide-icon [name]="PlusIcon" [size]="16"></lucide-icon>
            Créer une équipe
          </button>
        </div>

        <div *ngIf="errorBanner" class="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300 flex items-center justify-between gap-4">
          <span>{{ errorBanner }}</span>
          <button (click)="loadTeams()" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors">
            <lucide-icon [name]="RefreshCcwIcon" [size]="14"></lucide-icon>
            Réessayer
          </button>
        </div>

        <div *ngIf="showSmartMatchModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div class="bg-card rounded-2xl border border-border p-6 w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold text-foreground">Smart Match</h3>
              <button (click)="closeSmartMatchModal()" class="p-2 hover:bg-muted rounded-lg transition-colors">
                <lucide-icon [name]="XIcon" [size]="20" class="text-muted-foreground"></lucide-icon>
              </button>
            </div>

            <div *ngIf="!smartMatchType" class="space-y-4">
              <p class="text-sm text-muted-foreground">Choisissez un type de profil. Ensuite, nous poserons les questions une par une.</p>
              <div class="grid sm:grid-cols-2 gap-4">
                <button (click)="selectSmartMatchType('PLAYER')" class="p-4 rounded-xl border border-border hover:border-primary/60 hover:bg-primary/5 text-left transition-all">
                  <div class="font-semibold">PLAYER</div>
                  <div class="text-sm text-muted-foreground mt-1">Profil joueur pour matching intelligent.</div>
                </button>
                <button (click)="selectSmartMatchType('TEAM')" class="p-4 rounded-xl border border-border hover:border-primary/60 hover:bg-primary/5 text-left transition-all">
                  <div class="font-semibold">TEAM</div>
                  <div class="text-sm text-muted-foreground mt-1">Profil équipe avec besoins de postes.</div>
                </button>
              </div>
            </div>

            <div *ngIf="smartMatchType" class="space-y-4">
              <div class="flex items-center justify-between text-xs text-muted-foreground">
                <span>Type: {{ smartMatchType }}</span>
                <span>Formulaire de Matching</span>
              </div>

              <div *ngIf="!smartMatchSubmitted" class="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div class="h-full bg-primary transition-all w-full"></div>
              </div>

              <div *ngIf="smartMatchError" class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                {{ smartMatchError }}
              </div>

              <div *ngIf="!smartMatchSubmitted" class="space-y-6 py-2">
                <div *ngIf="smartMatchType === 'PLAYER'" class="space-y-4">
                  <!-- Nom (Auto-rempli) -->
                  <div>
                    <label class="block text-sm font-semibold mb-1.5">Nom complet</label>
                    <input [(ngModel)]="smartPlayerProfile.name" readonly class="w-full px-4 py-2 bg-muted/50 border border-border rounded-xl focus:outline-none cursor-not-allowed opacity-70">
                  </div>

                  <!-- Sport -->
                  <div>
                    <label class="block text-sm font-semibold mb-1.5 text-primary">Quel sport pratiquez-vous ? *</label>
                    <select [(ngModel)]="smartPlayerProfile.sportType" class="w-full px-4 py-2 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none">
                      <option value="" disabled>Sélectionner un sport</option>
                      <option *ngFor="let sport of smartSportTypeOptions" [value]="sport">{{ sport }}</option>
                    </select>
                  </div>

                  <!-- Niveau -->
                  <div>
                    <label class="block text-sm font-semibold mb-1.5 text-primary">Quel est votre niveau ? *</label>
                    <select [(ngModel)]="smartPlayerProfile.skillLevel" class="w-full px-4 py-2 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none">
                      <option value="" disabled>Sélectionner un niveau</option>
                      <option *ngFor="let level of smartLevelOptions" [value]="level">{{ level }}</option>
                    </select>
                  </div>

                  <!-- Poste -->
                  <div>
                    <label class="block text-sm font-semibold mb-1.5 text-primary">Quel est votre poste préféré ? *</label>
                    <select [(ngModel)]="smartPlayerProfile.position" class="w-full px-4 py-2 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none">
                      <option value="" disabled>Sélectionner un poste</option>
                      <option *ngFor="let pos of smartPlayerPositionsForSelectedSport" [value]="pos">{{ pos }}</option>
                    </select>
                  </div>

                  <!-- Ville -->
                  <div>
                    <label class="block text-sm font-semibold mb-1.5 text-primary">Dans quelle ville habitez-vous ? *</label>
                    <input [(ngModel)]="smartPlayerProfile.city" placeholder="Ex: Tunis, Sousse..." class="w-full px-4 py-2 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none">
                  </div>

                  <!-- Disponibilités -->
                  <div>
                    <label class="block text-sm font-semibold mb-1.5 text-primary">Quelles sont vos disponibilités ? *</label>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select [(ngModel)]="smartPlayerAvailabilityDraft.dayOfWeek" class="px-3 py-2 bg-muted border border-border rounded-xl text-sm">
                        <option value="" disabled>Jour</option>
                        <option *ngFor="let day of smartDayOfWeekOptions" [value]="day">{{ day }}</option>
                      </select>
                      <input [(ngModel)]="smartPlayerAvailabilityDraft.startTime" type="time" class="px-3 py-2 bg-muted border border-border rounded-xl text-sm">
                      <input [(ngModel)]="smartPlayerAvailabilityDraft.endTime" type="time" class="px-3 py-2 bg-muted border border-border rounded-xl text-sm">
                    </div>
                    <button (click)="addSmartPlayerAvailability()" class="mt-2 text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                      <lucide-icon [name]="PlusIcon" [size]="14"></lucide-icon> Ajouter un créneau
                    </button>
                    <div *ngIf="smartPlayerProfile.availability.length > 0" class="flex flex-wrap gap-2 mt-2">
                      <div *ngFor="let avail of smartPlayerProfile.availability; let i = index" class="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] flex items-center gap-1.5">
                        {{ avail.dayOfWeek }} ({{ avail.startTime }} - {{ avail.endTime }})
                        <button (click)="smartPlayerProfile.availability.splice(i, 1)" class="hover:text-red-500">✕</button>
                      </div>
                    </div>
                  </div>

                  <!-- Style -->
                  <div>
                    <label class="block text-sm font-semibold mb-1.5">Quel est votre style de jeu ?</label>
                    <select [(ngModel)]="smartPlayerProfile.preferredPlayStyle" class="w-full px-4 py-2 bg-muted border border-border rounded-xl outline-none">
                      <option value="">Indifférent</option>
                      <option *ngFor="let style of smartPlayStyleOptions" [value]="style">{{ style }}</option>
                    </select>
                  </div>
                </div>

                <div *ngIf="smartMatchType === 'TEAM'" class="space-y-4">
                  <!-- Nom Team -->
                  <div>
                    <label class="block text-sm font-semibold mb-1.5 text-primary">Nom de l'équipe *</label>
                    <input [(ngModel)]="smartTeamProfile.teamName" placeholder="Ex: Les Aigles" class="w-full px-4 py-2 bg-muted border border-border rounded-xl outline-none">
                  </div>

                  <!-- Sport Team -->
                  <div>
                    <label class="block text-sm font-semibold mb-1.5 text-primary">Sport de l'équipe *</label>
                    <select [(ngModel)]="smartTeamProfile.sportType" class="w-full px-4 py-2 bg-muted border border-border rounded-xl outline-none">
                      <option value="" disabled>Sélectionner un sport</option>
                      <option *ngFor="let sport of smartSportTypeOptions" [value]="sport">{{ sport }}</option>
                    </select>
                  </div>

                  <!-- Niveau Team -->
                  <div>
                    <label class="block text-sm font-semibold mb-1.5 text-primary">Niveau de l'équipe *</label>
                    <select [(ngModel)]="smartTeamProfile.teamLevel" class="w-full px-4 py-2 bg-muted border border-border rounded-xl outline-none">
                      <option value="" disabled>Sélectionner un niveau</option>
                      <option *ngFor="let level of smartLevelOptions" [value]="level">{{ level }}</option>
                    </select>
                  </div>

                  <!-- Ville Team -->
                  <div>
                    <label class="block text-sm font-semibold mb-1.5 text-primary">Ville de l'équipe *</label>
                    <input [(ngModel)]="smartTeamProfile.city" placeholder="Ex: Tunis" class="w-full px-4 py-2 bg-muted border border-border rounded-xl outline-none">
                  </div>

                  <!-- Postes Requis -->
                  <div>
                    <label class="block text-sm font-semibold mb-1.5 text-primary">Postes recherchés *</label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select [(ngModel)]="smartTeamRequiredPositionDraft.position" class="px-3 py-2 bg-muted border border-border rounded-xl text-sm">
                        <option value="" disabled>Poste</option>
                        <option *ngFor="let pos of smartTeamPositionsForSelectedSport" [value]="pos">{{ pos }}</option>
                      </select>
                      <input [(ngModel)]="smartTeamRequiredPositionDraft.neededCount" type="number" min="1" placeholder="Nombre" class="px-3 py-2 bg-muted border border-border rounded-xl text-sm">
                    </div>
                    <button (click)="addSmartTeamPosition()" class="mt-2 text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                      <lucide-icon [name]="PlusIcon" [size]="14"></lucide-icon> Ajouter un poste
                    </button>
                    <div *ngIf="smartTeamProfile.requiredPositions.length > 0" class="flex flex-wrap gap-2 mt-2">
                      <div *ngFor="let pos of smartTeamProfile.requiredPositions; let i = index" class="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] flex items-center gap-1.5">
                        {{ pos.position }} (x{{ pos.neededCount }})
                        <button (click) ="smartTeamProfile.requiredPositions.splice(i, 1)" class="hover:text-red-500">✕</button>
                      </div>
                    </div>
                  </div>

                  <!-- Description -->
                  <div>
                    <label class="block text-sm font-semibold mb-1.5 text-primary">Description de l'équipe *</label>
                    <textarea [(ngModel)]="smartTeamProfile.description" rows="3" placeholder="Décrivez votre équipe" class="w-full px-4 py-2 bg-muted border border-border rounded-xl outline-none"></textarea>
                  </div>
                </div>
              </div>

              <!-- Résultats (Affiche seulement après soumission) -->
              <div *ngIf="smartMatchSubmitted" class="space-y-4 py-2">
                <div *ngIf="smartMatchSubmitting" class="flex flex-col items-center gap-3 py-10">
                  <lucide-icon [name]="Loader2Icon" [size]="40" class="animate-spin text-primary"></lucide-icon>
                  <p class="font-medium">Analyse intelligente en cours...</p>
                </div>

                <div *ngIf="!smartMatchSubmitting && smartMatchRecommendations.length === 0" class="text-center py-10">
                  <p class="text-muted-foreground">Désolé, nous n'avons pas trouvé de correspondances pour le moment.</p>
                  <button (click)="smartMatchSubmitted = false" class="mt-4 text-primary font-bold hover:underline">Modifier le formulaire</button>
                </div>

                <div *ngIf="!smartMatchSubmitting && smartMatchRecommendations.length > 0" class="grid grid-cols-1 gap-4">
                  <p class="text-sm font-bold text-foreground">Top {{ smartMatchRecommendations.length }} Recommandations :</p>
                  <div *ngFor="let rec of smartMatchRecommendations; let idx = index" class="bg-card rounded-2xl border border-border p-4 hover:shadow-lg transition-all border-l-4 border-l-primary">
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="font-bold">#{{ idx + 1 }} - {{ rec.name }}</h4>
                      <span class="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase">{{ rec.score }}% Match</span>
                    </div>
                    <p class="text-xs text-muted-foreground mb-4">{{ rec.matchDetails }}</p>
                    <div class="flex gap-2">
                      <button (click)="viewRecommendedTeam(rec)" class="flex-1 py-2 text-xs bg-muted rounded-xl hover:bg-muted/70 transition-all font-semibold">Voir détails</button>
                      <button (click)="joinRecommendedTeam(rec)" 
                        [disabled]="isJoining(rec.id) || pendingTeamIds.has(rec.id)" 
                        [class.bg-emerald-500]="pendingTeamIds.has(rec.id)"
                        [class.text-white]="pendingTeamIds.has(rec.id)"
                        class="flex-1 py-2 text-xs bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all font-bold disabled:opacity-60">
                        {{ isJoining(rec.id) ? 'Envoi...' : (pendingTeamIds.has(rec.id) ? 'Déjà envoyé' : 'Rejoindre') }}
                      </button>
                    </div>
                  </div>
                  <button (click)="smartMatchSubmitted = false" class="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted">Modifier mes réponses</button>
                </div>
              </div>

              <div *ngIf="!smartMatchSubmitted" class="flex justify-end gap-3 pt-4 border-t border-border mt-4">
                <button (click)="resetSmartMatchState()" class="px-4 py-2 rounded-xl bg-muted hover:bg-muted/70 font-semibold transition-colors">
                  Réinitialiser
                </button>
                <button (click)="submitSmartMatchForm()" class="px-8 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 transition-all">
                  Matcher !
                </button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="showTeamFormModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-card rounded-2xl border border-border p-6 w-full max-w-lg shadow-2xl">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-foreground">{{ editingTeamId ? 'Modifier une équipe' : 'Créer une équipe' }}</h3>
              <button (click)="closeFormModal()" class="p-2 hover:bg-muted rounded-lg transition-colors">
                <lucide-icon [name]="XIcon" [size]="20" class="text-muted-foreground"></lucide-icon>
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">Nom de l'équipe *</label>
                <input [(ngModel)]="teamForm.name" placeholder="Ex: Les Aigles"
                  class="w-full px-4 py-2 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1">Sport *</label>
                  <select [(ngModel)]="teamForm.sport" class="w-full px-4 py-2 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="" disabled>Sélectionner un sport</option>
                    <option *ngFor="let sport of sportOptions" [value]="sport">{{ sport }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">Niveau *</label>
                  <select [(ngModel)]="teamForm.level" class="w-full px-4 py-2 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="AMATEUR">Amateur</option>
                    <option value="INTERMEDIATE">Intermédiaire</option>
                    <option value="ADVANCED">Avancé</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Ville</label>
                <input [(ngModel)]="teamForm.city" placeholder="Ex: Paris"
                  class="w-full px-4 py-2 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Description</label>
                <textarea [(ngModel)]="teamForm.description" rows="3" placeholder="Décrivez brièvement l'équipe"
                  class="w-full px-4 py-2 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Logo (URL optionnelle)</label>
                <input [(ngModel)]="teamForm.logo" placeholder="https://example.com/logo.png"
                  class="w-full px-4 py-2 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
              </div>
            </div>

            <div class="flex gap-3 justify-end mt-6">
              <button (click)="closeFormModal()" class="px-4 py-2 bg-muted text-foreground rounded-xl hover:bg-muted/70 transition-colors">Annuler</button>
              <button (click)="submitTeam()" [disabled]="saving || !teamForm.name || !teamForm.sport || !teamForm.level"
                class="px-5 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                <lucide-icon *ngIf="saving" [name]="Loader2Icon" [size]="16" class="animate-spin"></lucide-icon>
                {{ saving ? (editingTeamId ? 'Mise à jour...' : 'Création...') : (editingTeamId ? 'Mettre à jour' : 'Créer') }}
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="loading" class="flex flex-col items-center py-20 gap-3 text-muted-foreground">
          <lucide-icon [name]="Loader2Icon" [size]="32" class="animate-spin"></lucide-icon>
          Chargement des équipes...
        </div>

        <div *ngIf="!loading && teams.length === 0" class="text-center py-20 text-muted-foreground">
          <div class="text-6xl mb-4">⚽</div>
          <p class="font-semibold mb-2 text-lg">Aucune équipe trouvée</p>
          <p class="text-sm mb-6">Le backend peut retourner une liste vide selon votre rôle.</p>
          <button (click)="loadTeams()" class="px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all">
            Actualiser
          </button>
        </div>

        <div *ngIf="!loading && teams.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let team of teams" class="bg-card rounded-2xl border border-border hover:border-primary/50 transition-all hover:shadow-xl overflow-hidden">
            <div class="h-20 bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
              <div class="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <lucide-icon [name]="ShieldIcon" [size]="32" class="text-white"></lucide-icon>
              </div>
            </div>
            <div class="p-6">
              <h3 class="mb-1">{{ team.name || 'Équipe sans nom' }}</h3>
              <p class="text-sm text-muted-foreground mb-2">{{ team.sport || '-' }} • {{ team.city || '-' }}</p>
              <p class="text-xs text-muted-foreground mb-2">Niveau: {{ team.level || '-' }}</p>
              <p class="text-xs text-muted-foreground mb-2">Statut: {{ team.status || '-' }}</p>
              <p class="text-xs text-muted-foreground mb-4">Créée le: {{ team.createdAt ? (team.createdAt | date:'short') : '-' }}</p>

              <div class="flex gap-2">
                <button (click)="viewTeam(team)" class="flex-1 py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all inline-flex items-center justify-center gap-1">
                  <lucide-icon [name]="EyeIcon" [size]="14"></lucide-icon>
                  Détail
                </button>
                <button *ngIf="isPlayer" (click)="joinTeam(team)" [disabled]="isJoining(team.id)" class="flex-1 py-2 text-sm bg-emerald-500/10 text-emerald-700 rounded-lg hover:bg-emerald-500/20 transition-all disabled:opacity-60">
                  {{ isJoining(team.id) ? 'Envoi...' : 'Rejoindre' }}
                </button>
                <button *ngIf="isAdmin" (click)="openEditModal(team)" class="flex-1 py-2 text-sm bg-muted rounded-lg hover:bg-muted/70 transition-all">Modifier</button>
                <button *ngIf="isAdmin" (click)="deleteTeam(team)" [disabled]="isDeleting(team.id)" class="flex-1 py-2 text-sm bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-60">
                  {{ isDeleting(team.id) ? 'Suppression...' : 'Supprimer' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="toast" class="fixed bottom-6 right-6 bg-card border border-border rounded-xl px-4 py-3 shadow-xl text-sm font-medium text-foreground z-50">
        {{ toast }}
      </div>
    </div>
  `
})
export class TeamComponent implements OnInit {
  readonly ShieldIcon = Shield;
  readonly UsersIcon = Users;
  readonly PlusIcon = Plus;
  readonly Loader2Icon = Loader2;
  readonly XIcon = X;
  readonly RefreshCcwIcon = RefreshCcw;
  readonly EyeIcon = Eye;
  readonly SparklesIcon = Sparkles;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;

  showSmartMatchModal = false;
  smartMatchType: SmartMatchProfileType | null = null;
  smartMatchStepIndex = 0;
  smartMatchError: string | null = null;
  smartMatchOutputJson = '';
  smartMatchSubmitting = false;
  smartMatchRecommendations: MatchResponse[] = [];
  pendingTeamIds = new Set<number>();
  smartMatchSubmitted = false;

  readonly smartSportTypeOptions: string[] = ['FOOTBALL', 'BASKETBALL', 'TENNIS', 'PADEL', 'VOLLEYBALL', 'HANDBALL'];
  readonly smartLevelOptions: string[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  readonly smartPlayStyleOptions: string[] = ['CASUAL', 'COMPETITIVE'];
  readonly smartDayOfWeekOptions: string[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  readonly smartYesNoOptions: string[] = ['YES', 'NO'];
  readonly smartPositionBySport: Record<string, string[]> = {
    FOOTBALL: ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'],
    BASKETBALL: ['POINT_GUARD', 'SHOOTING_GUARD', 'SMALL_FORWARD', 'POWER_FORWARD', 'CENTER'],
    TENNIS: ['SINGLES', 'DOUBLES_SPECIALIST'],
    PADEL: ['LEFT_SIDE', 'RIGHT_SIDE'],
    VOLLEYBALL: ['SETTER', 'OUTSIDE_HITTER', 'OPPOSITE', 'MIDDLE_BLOCKER', 'LIBERO'],
    HANDBALL: ['GOALKEEPER', 'LEFT_WING', 'RIGHT_WING', 'PIVOT', 'BACK']
  };

  smartPlayerProfile: SmartMatchPlayerProfile = this.createEmptyPlayerProfile();
  smartTeamProfile: SmartMatchTeamProfile = this.createEmptyTeamProfile();
  smartPlayerAvailabilityDraft: SmartMatchAvailability = { dayOfWeek: '', startTime: '', endTime: '' };
  smartPlayerAddMoreAvailability: 'YES' | 'NO' = 'NO';
  smartTeamRequiredPositionDraft: SmartMatchRequiredPosition = { position: '', neededCount: 1 };
  smartTeamAddMorePositions: 'YES' | 'NO' = 'NO';
  smartTeamScheduleDraft: SmartMatchAvailability = { dayOfWeek: '', startTime: '', endTime: '' };
  smartTeamAddMoreSchedule: 'YES' | 'NO' = 'NO';

  toast: string | null = null;
  errorBanner: string | null = null;
  loading = true;
  teams: Team[] = [];
  currentRole = (localStorage.getItem('user_type') || '').toUpperCase();

  showTeamFormModal = false;
  saving = false;
  editingTeamId: number | null = null;
  editingTeamMeta: { createdAt?: string; createdById?: number } | null = null;
  deletingTeamIds = new Set<number>();
  joiningTeamIds = new Set<number>();
  categories: any[] = [];
  readonly fallbackSports: string[] = ['Football', 'Basketball', 'Tennis', 'Padel'];
  loadingCategories = false;
  teamForm: TeamPayload = {
    name: '',
    sport: '',
    level: 'AMATEUR',
    city: '',
    description: '',
    logo: null,
    status: 'ACTIVE'
  };

  constructor(
    public router: Router,
    private teamService: TeamService,
    private matchingService: MatchingService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadTeams();
  }

  get isAdmin(): boolean {
    return this.currentRole === 'ROLE_ADMIN' || this.currentRole === 'ADMIN';
  }

  get isPlayer(): boolean {
    return [
      'ROLE_PLAYER',
      'PLAYER',
      'ROLE_JOUEUR',
      'JOUEUR',
      'ROLE_USER',
      'USER'
    ].includes(this.currentRole);
  }

  loadTeams(showLoader = true) {
    if (showLoader) {
      this.loading = true;
    }
    this.errorBanner = null;
    this.teamService.getTeams().subscribe({
      next: (data: Team[]) => {
        this.teams = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        const message = this.getReadableErrorMessage(err);
        this.errorBanner = `Impossible de charger les équipes: ${message}`;
        this.showToast(this.errorBanner);
        this.cdr.detectChanges();
      }
    });
  }

  viewTeam(team: Team) {
    this.router.navigate(['/app/team', team.id]);
  }

  openManageRequests(): void {
    this.router.navigate(['/app/admin/team-requests']);
  }

  openCreateModal() {
    this.editingTeamId = null;
    this.editingTeamMeta = null;
    this.teamForm = {
      name: '',
      sport: '',
      level: 'AMATEUR',
      city: '',
      description: '',
      logo: null,
      status: 'ACTIVE'
    };
    this.showTeamFormModal = true;
    if (this.categories.length === 0) {
      this.loadCategories();
    }
  }

  openEditModal(team: Team) {
    this.editingTeamId = team.id;
    this.editingTeamMeta = null;
    this.showTeamFormModal = true;
    this.teamService.getTeamById(team.id).subscribe({
      next: (data) => {
        const rawData = data as any;
        const createdById = Number(rawData?.createdById ?? rawData?.created_by_id ?? rawData?.createdBy?.id ?? 0);
        this.editingTeamMeta = {
          createdAt: rawData?.createdAt || rawData?.created_at,
          createdById: Number.isFinite(createdById) && createdById > 0 ? createdById : undefined
        };

        this.teamForm = {
          name: data.name || '',
          sport: data.sport || data.sportType || '',
          level: data.level || 'AMATEUR',
          city: data.city || data.location || '',
          description: data.description || '',
          logo: data.logo || null,
          status: data.status || 'ACTIVE'
        };
      },
      error: (err) => {
        this.closeFormModal();
        this.showToast(`Erreur chargement édition: ${this.getReadableErrorMessage(err)}`);
      }
    });

    if (this.categories.length === 0) {
      this.loadCategories();
    }
  }

  closeFormModal() {
    this.showTeamFormModal = false;
    this.saving = false;
    if (this.editingTeamId === null) {
      this.editingTeamMeta = null;
    }
  }

  loadCategories() {
    this.loadingCategories = true;
    this.teamService.getCategories().subscribe({
      next: (data) => {
        this.categories = data || [];
        if (!this.teamForm.sport && this.sportOptions.length > 0) {
          this.teamForm.sport = this.sportOptions[0];
        }
        this.loadingCategories = false;
      },
      error: () => {
        this.categories = [];
        if (!this.teamForm.sport && this.sportOptions.length > 0) {
          this.teamForm.sport = this.sportOptions[0];
        }
        this.loadingCategories = false;
      }
    });
  }

  submitTeam() {
    if (!this.teamForm.name || !this.teamForm.sport || !this.teamForm.level) return;

    this.saving = true;
    const normalizeOptional = (value?: string | null): string | undefined => {
      const trimmed = (value || '').trim();
      return trimmed.length > 0 ? trimmed : undefined;
    };

    const normalizedSport = (this.teamForm.sport || '').trim();
    const normalizedName = (this.teamForm.name || '').trim();

    const payload: TeamPayload = {
      ...this.teamForm,
      name: normalizedName,
      sport: normalizedSport,
      level: this.teamForm.level,
      description: normalizeOptional(this.teamForm.description),
      city: normalizeOptional(this.teamForm.city),
      logo: normalizeOptional(this.teamForm.logo || null) ?? null,
      status: this.teamForm.status || 'ACTIVE'
    };

    const wasEditing = this.editingTeamId !== null;
    const editingId = this.editingTeamId;
    const localUserId = Number(localStorage.getItem('user_id'));
    const effectiveUserId = Number.isFinite(localUserId) && localUserId > 0 ? localUserId : undefined;

    if (wasEditing) {
      const fallbackCreatorId = Number(localStorage.getItem('user_id'));
      const createdById = this.editingTeamMeta?.createdById
        ?? (Number.isFinite(fallbackCreatorId) && fallbackCreatorId > 0 ? fallbackCreatorId : undefined);

      if (this.editingTeamMeta?.createdAt) {
        payload.createdAt = this.editingTeamMeta.createdAt;
      }
      if (createdById) {
        payload.createdById = createdById;
        payload.created_by_id = createdById;
        payload.createdBy = { id: createdById };
      }
    }

    const previousTeams = [...this.teams];
    const optimisticTeam: Team = {
      id: wasEditing ? (editingId || 0) : -(Date.now()),
      name: payload.name,
      sport: payload.sport,
      level: payload.level,
      description: payload.description || '',
      city: payload.city || '',
      logo: payload.logo || '',
      status: payload.status || 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    // Non-blocking UX: close immediately and reflect change optimistically.
    if (wasEditing && editingId !== null) {
      this.teams = this.teams.map((team) => (team.id === editingId ? optimisticTeam : team));
    } else {
      this.teams = [optimisticTeam, ...this.teams];
    }

    this.showTeamFormModal = false;
    this.saving = false;
    this.editingTeamId = null;
    this.editingTeamMeta = null;
    this.showToast(wasEditing ? 'Mise à jour en cours...' : 'Création en cours...');

    const operation$ = wasEditing && editingId !== null
      ? this.teamService.updateTeam(editingId, payload, effectiveUserId)
      : this.teamService.createTeam(payload, effectiveUserId);

    operation$.subscribe({
      next: (savedTeam: Team) => {
        const effectiveTeam = savedTeam && savedTeam.id ? savedTeam : optimisticTeam;

        if (wasEditing && editingId !== null) {
          this.teams = this.teams.map((team) => (team.id === editingId ? effectiveTeam : team));
        } else {
          const withoutDuplicate = this.teams.filter((team) => team.id !== optimisticTeam.id && team.id !== effectiveTeam.id);
          this.teams = [effectiveTeam, ...withoutDuplicate];
        }
        this.showToast(wasEditing ? 'Équipe mise à jour avec succès.' : 'Équipe créée avec succès.');
        // Keep UI responsive: refresh in background without blocking the list.
        this.loadTeams(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.teams = previousTeams;
        const action = wasEditing ? 'la mise à jour' : 'la création';
        this.showToast(`Erreur pendant ${action}: ${this.getReadableErrorMessage(err)}`);
        this.cdr.detectChanges();
      }
    });
  }

  get sportOptions(): string[] {
    const fromCategories = (this.categories || [])
      .map((cat: any) => String(cat?.nom || cat?.name || '').trim())
      .filter((name: string) => !!name);

    const options = fromCategories.length > 0 ? fromCategories : this.fallbackSports;
    return Array.from(new Set(options));
  }

  deleteTeam(team: Team) {
    const confirmDelete = window.confirm(`Supprimer l'équipe "${team.name || '-' }" ?`);
    if (!confirmDelete) {
      return;
    }

    const previousTeams = [...this.teams];
    this.deletingTeamIds.add(team.id);
    this.teams = this.teams.filter((t) => t.id !== team.id);

    this.teamService.deleteTeam(team.id).subscribe({
      next: () => {
        this.deletingTeamIds.delete(team.id);
        this.showToast('Équipe supprimée avec succès.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.deletingTeamIds.delete(team.id);
        this.teams = previousTeams;
        this.showToast(`Erreur suppression: ${this.getReadableErrorMessage(err)}`);
        this.cdr.detectChanges();
      }
    });
  }

  isDeleting(teamId: number): boolean {
    return this.deletingTeamIds.has(teamId);
  }

  isJoining(teamId: number): boolean {
    return this.joiningTeamIds.has(teamId);
  }

  joinTeam(team: Team): void {
    const userIdRaw = localStorage.getItem('user_id');
    const userId = Number(userIdRaw);

    if (!Number.isFinite(userId) || userId <= 0) {
      this.showToast('Impossible d\'envoyer la demande: utilisateur non identifié.');
      return;
    }

    if (!team?.id) {
      this.showToast('Impossible d\'envoyer la demande: équipe invalide.');
      return;
    }

    this.joiningTeamIds.add(team.id);
    this.teamService.requestJoinTeam(team.id, 'I want to join this team').subscribe({
      next: () => {
        this.joiningTeamIds.delete(team.id);
        this.showToast(`Demande d'adhésion envoyée à l'admin de "${team.name}".`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.joiningTeamIds.delete(team.id);
        const httpError = err as HttpErrorResponse;
        const errorMessage = this.teamService.extractErrorMessage(err);
        
        if (httpError?.status === 409 || (httpError?.status === 400 && errorMessage.toLowerCase().includes('already'))) {
          this.showToast('Vous avez déjà une demande en attente pour cette équipe.');
        } else {
          this.showToast(`Échec envoi demande: ${this.getReadableErrorMessage(err)}`);
        }
        this.cdr.detectChanges();
      }
    });
  }

  private getReadableErrorMessage(error: unknown): string {
    const baseMessage = this.teamService.extractErrorMessage(error);
    const httpError = error as HttpErrorResponse;

    if ([400, 401, 403, 404, 500].includes(httpError?.status ?? -1)) {
      return `[${httpError.status}] ${baseMessage}`;
    }

    return baseMessage;
  }

  showToast(msg: string) {
    this.toast = msg;
    setTimeout(() => (this.toast = null), 3000);
  }

  get smartMatchSteps(): string[] {
    if (this.smartMatchType === 'PLAYER') {
      return [
        'sportType',
        'skillLevel',
        'position',
        'city',
        'availability',
        'preferredPlayStyle'
      ];
    }

    if (this.smartMatchType === 'TEAM') {
      return [
        'teamName',
        'teamSportType',
        'teamLevel',
        'teamCity',
        'requiredPositions',
        'description'
      ];
    }

    return [];
  }

  get smartMatchProgress(): number {
    const total = this.smartMatchSteps.length || 1;
    return ((this.smartMatchStepIndex + 1) / total) * 100;
  }

  get currentSmartMatchStep(): string {
    return this.smartMatchSteps[this.smartMatchStepIndex] || '';
  }

  get currentSmartMatchQuestion(): string {
    switch (this.currentSmartMatchStep) {
      case 'sportType': return 'Quel sport pratiquez-vous ?';
      case 'skillLevel': return 'Quel est votre niveau ?';
      case 'position': return 'Quel est votre poste préféré ?';
      case 'city': return 'Dans quelle ville habitez-vous ?';
      case 'availability': return 'Quelles sont vos disponibilités ?';
      case 'preferredPlayStyle': return 'Quel est votre style de jeu ?';
      case 'teamName': return 'Nom de l\'équipe';
      case 'teamSportType': return 'Sport de l\'équipe';
      case 'teamLevel': return 'Niveau de l\'équipe';
      case 'teamCity': return 'Ville de l\'équipe';
      case 'requiredPositions': return 'Postes recherchés';
      case 'description': return 'Description de l\'équipe';
      default: return '';
    }
  }

  get canGoSmartMatchBack(): boolean {
    return this.smartMatchType !== null && this.smartMatchStepIndex > 0;
  }

  get isSmartMatchOnReviewStep(): boolean {
    return ['review', 'teamReview'].includes(this.currentSmartMatchStep);
  }

  get smartMatchPrimaryActionLabel(): string {
    if (this.currentSmartMatchStep === 'review' && this.smartMatchType === 'PLAYER') {
      if (this.smartMatchSubmitting) {
        return 'Analyse...';
      }
      return this.smartMatchSubmitted ? 'Terminer' : 'Envoyer et recommander';
    }
    if (this.currentSmartMatchStep === 'teamReview') {
      return 'Terminer';
    }
    return 'Suivant';
  }

  get smartPlayerPositionsForSelectedSport(): string[] {
    return this.smartPositionBySport[this.smartPlayerProfile.sportType] || [];
  }

  get smartTeamPositionsForSelectedSport(): string[] {
    return this.smartPositionBySport[this.smartTeamProfile.sportType] || [];
  }

  openSmartMatchModal(): void {
    this.showSmartMatchModal = true;
    this.resetSmartMatchState();
    
    // Auto-populate user name
    const storedName = localStorage.getItem('user_name');
    if (storedName) {
      this.smartPlayerProfile.name = storedName;
    } else {
      this.userService.getUserProfile().subscribe(profile => {
        if (profile) {
          this.smartPlayerProfile.name = `${profile.firstName} ${profile.lastName}`.trim();
        }
      });
    }
  }

  closeSmartMatchModal(): void {
    this.showSmartMatchModal = false;
    this.resetSmartMatchState();
  }

  selectSmartMatchType(type: SmartMatchProfileType): void {
    this.smartMatchType = type;
    this.smartMatchStepIndex = 0;
    this.smartMatchError = null;
    this.smartMatchOutputJson = '';
  }

  submitSmartMatchForm(): void {
    this.smartMatchError = null;
    const fail = (msg: string) => { this.smartMatchError = msg; };

    if (this.smartMatchType === 'PLAYER') {
      if (!this.smartPlayerProfile.sportType) { fail("Veuillez sélectionner un sport."); return; }
      if (!this.smartPlayerProfile.skillLevel) { fail("Veuillez sélectionner votre niveau."); return; }
      if (!this.smartPlayerProfile.position) { fail("Veuillez sélectionner votre poste."); return; }
      if (!this.smartPlayerProfile.city.trim()) { fail("La ville est obligatoire."); return; }
      if (this.smartPlayerProfile.availability.length === 0) { fail("Veuillez ajouter au moins un créneau de disponibilité."); return; }
      
      this.submitPlayerSmartMatchAndRecommend();
    } else if (this.smartMatchType === 'TEAM') {
      if (!this.smartTeamProfile.teamName.trim()) { fail("Le nom de l'équipe est obligatoire."); return; }
      if (!this.smartTeamProfile.sportType) { fail("Veuillez sélectionner le sport de l'équipe."); return; }
      if (!this.smartTeamProfile.teamLevel) { fail("Veuillez sélectionner le niveau de l'équipe."); return; }
      if (!this.smartTeamProfile.city.trim()) { fail("La ville de l'équipe est obligatoire."); return; }
      if (this.smartTeamProfile.requiredPositions.length === 0) { fail("Veuillez ajouter au moins un poste recherché."); return; }
      if (!this.smartTeamProfile.description.trim()) { fail("La description est obligatoire."); return; }

      this.showToast("Profil équipe validé !");
      this.closeSmartMatchModal();
    }
  }

  smartMatchBack(): void {
    if (!this.canGoSmartMatchBack) {
      return;
    }
    this.smartMatchError = null;
    this.smartMatchStepIndex = Math.max(0, this.smartMatchStepIndex - 1);
  }

  smartMatchNext(): void {
    this.smartMatchError = null;
    const step = this.currentSmartMatchStep;

    if (!this.validateSmartMatchStep(step)) {
      return;
    }

    if (step === 'availability') {
      if (this.smartPlayerProfile.availability.length === 0 && this.smartPlayerAvailabilityDraft.dayOfWeek) {
        this.addSmartPlayerAvailability();
      }
    }

    if (step === 'requiredPositions') {
      if (this.smartTeamProfile.requiredPositions.length === 0 && this.smartTeamRequiredPositionDraft.position) {
        this.addSmartTeamPosition();
      }
    }

    if (step === 'preferredPlayStyle') {
      if (!this.smartMatchSubmitted) {
        this.submitPlayerSmartMatchAndRecommend();
        return;
      }
    }

    if (step === 'description') {
      this.closeSmartMatchModal();
      return;
    }

    if (this.smartMatchStepIndex < this.smartMatchSteps.length - 1) {
      this.smartMatchStepIndex += 1;
      const newStep = this.currentSmartMatchStep;
      if (newStep === 'review' || newStep === 'teamReview') {
        this.smartMatchOutputJson = this.smartMatchType === 'PLAYER'
          ? JSON.stringify(this.buildPlayerJsonOutput(), null, 2)
          : JSON.stringify(this.buildTeamJsonOutput(), null, 2);
      }
    }
  }

  private validateSmartMatchStep(step: string): boolean {
    const fail = (message: string): boolean => {
      this.smartMatchError = message;
      return false;
    };

    switch (step) {
      case 'name':
        return (this.smartPlayerProfile.name || '').trim().length > 0 || fail('Le nom du joueur est obligatoire.');
      case 'sportType': {
        if (!this.smartSportTypeOptions.includes(this.smartPlayerProfile.sportType)) {
          return fail('Sport Type invalide. Veuillez sélectionner une valeur de la liste.');
        }
        if (!this.smartPlayerPositionsForSelectedSport.includes(this.smartPlayerProfile.position)) {
          this.smartPlayerProfile.position = '';
        }
        return true;
      }
      case 'skillLevel':
        return this.smartLevelOptions.includes(this.smartPlayerProfile.skillLevel) || fail('Skill Level invalide.');
      case 'position':
        return this.smartPlayerPositionsForSelectedSport.includes(this.smartPlayerProfile.position) || fail('Position invalide pour le sport sélectionné.');
      case 'city':
        return (this.smartPlayerProfile.city || '').trim().length > 0 || fail('La ville est obligatoire.');
      case 'latitude':
        return this.isValidLatitude(this.smartPlayerProfile.latitude) || fail('Latitude invalide (-90 à 90).');
      case 'longitude':
        return this.isValidLongitude(this.smartPlayerProfile.longitude) || fail('Longitude invalide (-180 à 180).');
      case 'availability':
        return this.smartPlayerProfile.availability.length > 0 || fail('Veuillez ajouter au moins un créneau de disponibilité.');
      case 'teamName':
        return (this.smartTeamProfile.teamName || '').trim().length > 0 || fail('Le nom de l\'équipe est obligatoire.');
      case 'teamSportType': {
        if (!this.smartSportTypeOptions.includes(this.smartTeamProfile.sportType)) {
          return fail('Veuillez sélectionner un sport.');
        }
        return true;
      }
      case 'teamLevel':
        return this.smartLevelOptions.includes(this.smartTeamProfile.teamLevel) || fail('Niveau équipe invalide.');
      case 'teamCity':
        return (this.smartTeamProfile.city || '').trim().length > 0 || fail('La ville de l\'équipe est obligatoire.');
      case 'requiredPositions':
        return this.smartTeamProfile.requiredPositions.length > 0 || fail('Veuillez ajouter au moins un poste recherché.');
      case 'description':
        return (this.smartTeamProfile.description || '').trim().length > 0 || fail('La description est obligatoire.');
      default:
        return true;
    }
  }

  private buildPlayerJsonOutput(): SmartMatchPlayerProfile {
    return {
      type: 'PLAYER',
      name: this.smartPlayerProfile.name.trim(),
      sportType: this.smartPlayerProfile.sportType,
      skillLevel: this.smartPlayerProfile.skillLevel,
      position: this.smartPlayerProfile.position,
      city: this.smartPlayerProfile.city.trim(),
      latitude: this.smartPlayerProfile.latitude || 36.8065,
      longitude: this.smartPlayerProfile.longitude || 10.1815,
      availability: [...this.smartPlayerProfile.availability],
      preferredPlayStyle: this.smartPlayerProfile.preferredPlayStyle || '',
      rating: this.smartPlayerProfile.rating || 4.5
    };
  }

  private buildPlayerMatchingRequest(): PlayerProfileMatchingRequest {
    const payload = this.buildPlayerJsonOutput();
    return {
      type: 'PLAYER',
      name: payload.name,
      sportType: payload.sportType,
      skillLevel: payload.skillLevel,
      position: payload.position,
      city: payload.city,
      latitude: Number(payload.latitude),
      longitude: Number(payload.longitude),
      availability: payload.availability,
      preferredPlayStyle: payload.preferredPlayStyle || '',
      rating: payload.rating
    };
  }

  private buildTeamJsonOutput(): SmartMatchTeamProfile {
    return {
      type: 'TEAM',
      teamName: this.smartTeamProfile.teamName.trim(),
      sportType: this.smartTeamProfile.sportType,
      teamLevel: this.smartTeamProfile.teamLevel,
      city: this.smartTeamProfile.city.trim(),
      latitude: this.smartTeamProfile.latitude || 36.8065,
      longitude: this.smartTeamProfile.longitude || 10.1815,
      requiredPositions: [...this.smartTeamProfile.requiredPositions],
      schedule: [...this.smartTeamProfile.schedule],
      description: this.smartTeamProfile.description.trim()
    };
  }

  private createEmptyPlayerProfile(): SmartMatchPlayerProfile {
    return {
      type: 'PLAYER',
      name: '',
      sportType: '',
      skillLevel: '',
      position: '',
      city: '',
      latitude: null,
      longitude: null,
      availability: [],
      preferredPlayStyle: '',
      rating: null
    };
  }

  private createEmptyTeamProfile(): SmartMatchTeamProfile {
    return {
      type: 'TEAM',
      teamName: '',
      sportType: '',
      teamLevel: '',
      city: '',
      latitude: null,
      longitude: null,
      requiredPositions: [],
      schedule: [],
      description: ''
    };
  }

  public resetSmartMatchState(): void {
    this.smartMatchType = null;
    this.smartMatchStepIndex = 0;
    this.smartMatchError = null;
    this.smartMatchOutputJson = '';
    this.smartMatchSubmitting = false;
    this.smartMatchRecommendations = [];
    this.smartMatchSubmitted = false;
    this.smartPlayerProfile = this.createEmptyPlayerProfile();
    this.smartTeamProfile = this.createEmptyTeamProfile();
    this.smartPlayerAvailabilityDraft = { dayOfWeek: '', startTime: '', endTime: '' };
    this.smartPlayerAddMoreAvailability = 'NO';
    this.smartTeamRequiredPositionDraft = { position: '', neededCount: 1 };
    this.smartTeamAddMorePositions = 'NO';
    this.smartTeamScheduleDraft = { dayOfWeek: '', startTime: '', endTime: '' };
    this.smartTeamAddMoreSchedule = 'NO';
  }

  private isValidLatitude(value: number | null): boolean {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric >= -90 && numeric <= 90;
  }

  private isValidLongitude(value: number | null): boolean {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric >= -180 && numeric <= 180;
  }

  private isValidTime(value: string): boolean {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value || '');
  }

  private isStartBeforeEnd(startTime: string, endTime: string): boolean {
    return startTime < endTime;
  }

  private submitPlayerSmartMatchAndRecommend(): void {
    this.smartMatchSubmitting = true;
    this.smartMatchError = null;

    const payload = this.buildPlayerMatchingRequest();
    this.matchingService.getBestTeamsForProfile(payload, 5).subscribe({
      next: (recommendations) => {
        this.smartMatchRecommendations = recommendations || [];
        this.smartMatchSubmitted = true;
        this.smartMatchSubmitting = false;
        this.loadPendingRequests(); // Check which recommendations already have pending requests
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.smartMatchSubmitting = false;
        this.smartMatchError = `Envoi vers backend échoué: ${this.teamService.extractErrorMessage(err)}`;
        this.cdr.detectChanges();
      }
    });
  }

  viewRecommendedTeam(rec: MatchResponse): void {
    if (!rec?.id) {
      return;
    }
    this.router.navigate(['/app/team', rec.id]);
  }

  joinRecommendedTeam(rec: MatchResponse): void {
    if (!rec?.id) return;
    
    this.joiningTeamIds.add(rec.id);
    this.teamService.requestJoinTeam(rec.id, 'Je souhaite rejoindre votre équipe via Smart Match').subscribe({
      next: () => {
        this.joiningTeamIds.delete(rec.id);
        this.pendingTeamIds.add(rec.id);
        this.showToast(`Demande d'adhésion envoyée à l'admin de "${rec.name}".`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.joiningTeamIds.delete(rec.id);
        const httpError = err as HttpErrorResponse;
        const errorMessage = this.teamService.extractErrorMessage(err);
        
        if (httpError?.status === 409 || (httpError?.status === 400 && errorMessage.toLowerCase().includes('already'))) {
          this.pendingTeamIds.add(rec.id);
          this.showToast('Vous avez déjà une demande en attente pour cette équipe.');
        } else {
          this.showToast(`Échec envoi demande: ${this.getReadableErrorMessage(err)}`);
        }
        this.cdr.detectChanges();
      }
    });
  }

  loadPendingRequests(): void {
    this.teamService.getJoinRequests().subscribe({
      next: (requests) => {
        this.pendingTeamIds.clear();
        (requests || []).forEach(req => {
          if (req.teamId && req.status === 'PENDING') {
            this.pendingTeamIds.add(req.teamId);
          }
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load pending requests', err)
    });
  }

  addSmartPlayerAvailability(): void {
    if (!this.smartPlayerAvailabilityDraft.dayOfWeek || !this.smartPlayerAvailabilityDraft.startTime || !this.smartPlayerAvailabilityDraft.endTime) return;
    
    if (this.isStartBeforeEnd(this.smartPlayerAvailabilityDraft.startTime, this.smartPlayerAvailabilityDraft.endTime)) {
      this.smartPlayerProfile.availability.push({ ...this.smartPlayerAvailabilityDraft });
      this.smartPlayerAvailabilityDraft = { dayOfWeek: '', startTime: '', endTime: '' };
    } else {
      this.smartMatchError = "L'heure de début doit être avant l'heure de fin.";
    }
  }

  addSmartTeamPosition(): void {
    if (!this.smartTeamRequiredPositionDraft.position || !this.smartTeamRequiredPositionDraft.neededCount) return;
    
    this.smartTeamProfile.requiredPositions.push({ ...this.smartTeamRequiredPositionDraft });
    this.smartTeamRequiredPositionDraft = { position: '', neededCount: 1 };
  }
}
