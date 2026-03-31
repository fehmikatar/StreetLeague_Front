import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Users, Crown, Shield, Zap, MessageCircle, Calendar, Trophy, Plus, Loader2, X } from 'lucide-angular';
import { TeamService } from '../services/team.service';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Header -->
      <div class="relative h-48 overflow-hidden border-b border-border">
        <div class="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-20"></div>
        <div class="absolute inset-0 flex items-center">
          <div class="container mx-auto px-4 max-w-7xl">
            <div class="flex items-center gap-6">
              <div class="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl border-4 border-background">
                <lucide-icon [name]="ShieldIcon" [size]="48" class="text-white"></lucide-icon>
              </div>
              <div>
                <h1 class="mb-2">Mes Équipes</h1>
                <div class="flex items-center gap-4 text-sm text-muted-foreground">
                  <span class="flex items-center gap-1">
                    <lucide-icon [name]="UsersIcon" [size]="16"></lucide-icon> {{ teams.length }} Équipe(s)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-8 max-w-7xl">
        <div class="flex justify-end mb-6">
          <button (click)="openCreateModal()" class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
            <lucide-icon [name]="PlusIcon" [size]="16"></lucide-icon>
            Créer une équipe
          </button>
        </div>

        <!-- Create Team Modal -->
        <div *ngIf="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-card rounded-2xl border border-border p-6 w-full max-w-lg shadow-2xl">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-foreground">Créer une équipe</h3>
              <button (click)="showCreateModal = false" class="p-2 hover:bg-muted rounded-lg transition-colors">
                <lucide-icon [name]="XIcon" [size]="20" class="text-muted-foreground"></lucide-icon>
              </button>
            </div>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">Nom de l'équipe *</label>
                <input [(ngModel)]="newTeam.name" placeholder="Ex: Les Aigles"
                  class="w-full px-4 py-2 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1">Sport *</label>
                  <select *ngIf="categories.length > 0" [(ngModel)]="newTeam.sport" class="w-full px-4 py-2 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
                    <option *ngFor="let cat of categories" [value]="cat.nom || cat.name">{{ cat.nom || cat.name }}</option>
                  </select>
                  <input *ngIf="categories.length === 0" [(ngModel)]="newTeam.sport" placeholder="Ex: Football"
                    class="w-full px-4 py-2 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">Niveau</label>
                  <select [(ngModel)]="newTeam.level" class="w-full px-4 py-2 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="Amateur">Amateur</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Ville</label>
                <input [(ngModel)]="newTeam.city" placeholder="Ex: Paris"
                  class="w-full px-4 py-2 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
              </div>
            </div>

            <div class="flex gap-3 justify-end mt-6">
              <button (click)="showCreateModal = false" class="px-4 py-2 bg-muted text-foreground rounded-xl hover:bg-muted/70 transition-colors">Annuler</button>
              <button (click)="submitTeam()" [disabled]="creating || !newTeam.name || !newTeam.sport" 
                class="px-5 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                <lucide-icon *ngIf="creating" [name]="Loader2Icon" [size]="16" class="animate-spin"></lucide-icon>
                {{ creating ? 'Création...' : 'Créer' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="flex flex-col items-center py-20 gap-3 text-muted-foreground">
          <lucide-icon [name]="Loader2Icon" [size]="32" class="animate-spin"></lucide-icon>
          Chargement des équipes...
        </div>

        <!-- Empty -->
        <div *ngIf="!loading && teams.length === 0" class="text-center py-20 text-muted-foreground">
          <div class="text-6xl mb-4">⚽</div>
          <p class="font-semibold mb-2 text-lg">Aucune équipe trouvée</p>
          <p class="text-sm mb-6">Rejoignez ou créez une équipe pour commencer !</p>
          <button (click)="openCreateModal()" class="px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all">
            Créer une équipe
          </button>
        </div>

        <!-- Teams Grid -->
        <div *ngIf="!loading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let team of teams" class="bg-card rounded-2xl border border-border hover:border-primary/50 transition-all hover:shadow-xl overflow-hidden">
            <div class="h-20 bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
              <div class="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <lucide-icon [name]="ShieldIcon" [size]="32" class="text-white"></lucide-icon>
              </div>
            </div>
            <div class="p-6">
              <h3 class="mb-1">{{ team.name }}</h3>
              <p class="text-sm text-muted-foreground mb-3">{{ team.sport || team.sportType }} • {{ team.city || team.location || '' }}</p>
              <div class="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                <lucide-icon [name]="UsersIcon" [size]="16"></lucide-icon>
                {{ team.memberCount || team.members?.length || 0 }} membres
              </div>
              <div class="flex gap-2">
                <button (click)="viewTeam(team)" class="flex-1 py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all">Voir l'équipe</button>
                <button (click)="router.navigate(['/app/booking'])" class="flex-1 py-2 text-sm bg-muted rounded-lg hover:bg-muted/70 transition-all">Réserver</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="mt-8 bg-card rounded-2xl p-6 border border-border">
          <h3 class="mb-4">Actions Rapides</h3>
          <div class="flex flex-wrap gap-3">
            <button (click)="router.navigate(['/app/booking'])" class="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all">
              📅 Planifier un entraînement
            </button>
            <button (click)="router.navigate(['/app/matches'])" class="px-4 py-2 bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-all">
              🏆 Voir les matchs
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="toast" class="fixed bottom-6 right-6 bg-card border border-border rounded-xl px-4 py-3 shadow-xl text-sm font-medium text-foreground z-50">
        {{ toast }}
      </div>
    </div>
  `,
})
export class TeamComponent implements OnInit {
  readonly ShieldIcon = Shield;
  readonly UsersIcon = Users;
  readonly TrophyIcon = Trophy;
  readonly ZapIcon = Zap;
  readonly CrownIcon = Crown;
  readonly MessageCircleIcon = MessageCircle;
  readonly CalendarIcon = Calendar;
  readonly PlusIcon = Plus;
  readonly Loader2Icon = Loader2;
  readonly XIcon = X;

  toast: string | null = null;
  loading = true;
  teams: any[] = [];

  showCreateModal = false;
  creating = false;
  categories: any[] = [];
  loadingCategories = false;
  newTeam = {
    name: '',
    sport: '',
    level: 'Amateur',
    city: ''
  };

  constructor(public router: Router, private teamService: TeamService) {}

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.loading = true;
    this.teamService.getAll().subscribe({
      next: (data: any[]) => { this.teams = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  viewTeam(team: any) {
    this.showToast(`Équipe: ${team.name}`);
  }

  openCreateModal() {
    this.newTeam = { name: '', sport: '', level: 'Amateur', city: '' };
    this.showCreateModal = true;
    if (this.categories.length === 0) {
      this.loadCategories();
    }
  }

  loadCategories() {
    this.loadingCategories = true;
    this.teamService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        if (this.categories.length > 0) {
          this.newTeam.sport = this.categories[0].nom || this.categories[0].name;
        }
        this.loadingCategories = false;
      },
      error: () => {
        this.loadingCategories = false;
      }
    });
  }

  submitTeam() {
    if (!this.newTeam.name || !this.newTeam.sport) return;
    
    this.creating = true;
    const userIdStr = localStorage.getItem('user_id');
    const userId = userIdStr ? Number(userIdStr) : 1;

    this.teamService.create(this.newTeam, userId).subscribe({
      next: (res) => {
        this.teams.unshift(res); // Add the new team to the beginning of the list
        this.creating = false;
        this.showCreateModal = false;
        this.showToast('✅ Équipe créée avec succès !');
      },
      error: (err) => {
        console.error('SERVER ERROR DETAIL:', err);
        this.creating = false;
        let msg = '❌ Erreur serveur complète : \n';
        if (err.error) {
          msg += JSON.stringify(err.error);
        } else {
          msg += err.message;
        }
        
        // Use an alert to be absolutely sure the user sees it in case UI freezes
        alert("Erreur lors de la création d'équipe:\n" + msg);
        this.showToast('Erreur: ' + msg.substring(0, 50));
      }
    });
  }

  showToast(msg: string) {
    this.toast = msg;
    setTimeout(() => this.toast = null, 3000);
  }
}
