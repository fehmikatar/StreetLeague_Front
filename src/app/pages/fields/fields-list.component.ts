import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, MapPin, Plus, Edit, Trash, Star, ArrowLeft, Loader2 } from 'lucide-angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-fields-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background p-4 md:p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center gap-3 mb-6">
          <a routerLink="/app/home" class="p-2 bg-card border border-border rounded-xl hover:bg-muted transition-all">
            <lucide-icon [name]="ArrowLeftIcon" [size]="18"></lucide-icon>
          </a>
          <span class="text-sm text-muted-foreground">Accueil</span>
        </div>
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="mb-2">Mes Terrains</h1>
            <p class="text-muted-foreground">Gérez vos espaces sportifs</p>
          </div>
          <a routerLink="/app/fields/add" class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
            <lucide-icon [name]="PlusIcon" [size]="16"></lucide-icon>Ajouter un terrain
          </a>
        </div>

        <div *ngIf="notification" class="mb-4 bg-primary/10 border border-primary/20 rounded-xl p-3 text-primary text-sm font-medium">
          {{ notification }}
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="flex flex-col items-center gap-3 py-20 text-muted-foreground">
          <lucide-icon [name]="Loader2Icon" [size]="32" class="animate-spin"></lucide-icon>
          Chargement des terrains...
        </div>

        <!-- Empty -->
        <div *ngIf="!loading && fields.length === 0" class="text-center py-20 text-muted-foreground">
          <div class="text-5xl mb-4">🏟️</div>
          <p class="font-semibold mb-2">Aucun terrain pour le moment</p>
          <a routerLink="/app/fields/add" class="text-primary hover:underline text-sm">Ajouter votre premier terrain →</a>
        </div>

        <!-- Fields Grid -->
        <div *ngIf="!loading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let field of fields" class="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all hover:shadow-xl">
            <div class="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <lucide-icon [name]="MapPinIcon" [size]="64" class="text-primary/40"></lucide-icon>
            </div>
            <div class="p-6">
              <h3 class="mb-2">{{ field.name }}</h3>
              <div class="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <lucide-icon [name]="MapPinIcon" [size]="16"></lucide-icon>{{ field.address || field.location }}
              </div>
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{{ field.sportType || 'Sport' }}</span>
                <span class="text-primary font-semibold">{{ field.pricePerHour || field.price }}€/h</span>
              </div>
              <div class="flex gap-2">
                <a [routerLink]="['/app/fields', field.id]" class="flex-1 py-2 text-center text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all">Détails</a>
                <button (click)="deleteField(field)" class="p-2 bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-all text-destructive" title="Supprimer">
                  <lucide-icon [name]="TrashIcon" [size]="16"></lucide-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class FieldsListComponent implements OnInit {
  readonly PlusIcon = Plus;
  readonly MapPinIcon = MapPin;
  readonly StarIcon = Star;
  readonly EditIcon = Edit;
  readonly TrashIcon = Trash;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly Loader2Icon = Loader2;

  loading = true;
  notification = '';
  fields: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const userId = localStorage.getItem('user_id');
    const url = userId
      ? `${environment.apiUrl}/sport-spaces/owner/${userId}`
      : `${environment.apiUrl}/sport-spaces`;

    this.http.get<any[]>(url).subscribe({
      next: (data) => { this.fields = data; this.loading = false; },
      error: () => {
        // Fallback: load all fields if owner endpoint fails
        this.http.get<any[]>(`${environment.apiUrl}/sport-spaces`).subscribe({
          next: (data) => { this.fields = data; this.loading = false; },
          error: () => { this.loading = false; }
        });
      }
    });
  }

  deleteField(field: any) {
    if (!confirm(`Supprimer "${field.name}" ?`)) return;
    this.http.delete(`${environment.apiUrl}/sport-spaces/${field.id}`).subscribe({
      next: () => {
        this.fields = this.fields.filter(f => f.id !== field.id);
        this.showNotification(`✅ Terrain "${field.name}" supprimé`);
      },
      error: () => this.showNotification('❌ Erreur lors de la suppression')
    });
  }

  private showNotification(msg: string) {
    this.notification = msg;
    setTimeout(() => { this.notification = ''; }, 3000);
  }
}
