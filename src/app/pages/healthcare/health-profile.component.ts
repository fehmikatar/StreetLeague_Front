import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, User, Heart, AlertTriangle, Edit, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-health-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="p-6 space-y-6">
      <div class="flex items-center gap-3 mb-2">
        <a routerLink="/app/healthcare" class="p-2 bg-card border border-border rounded-xl hover:bg-muted transition-all">
          <lucide-icon [name]="arrowLeftIcon" [size]="18"></lucide-icon>
        </a>
        <span class="text-sm text-muted-foreground">Santé</span>
      </div>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Profil Santé</h1>
          <p class="text-muted-foreground">Informations médicales et conditions de santé</p>
        </div>
        <button (click)="toggleEdit()" class="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          <lucide-icon [name]="editIcon" [size]="16"></lucide-icon>
          {{ editing ? 'Sauvegarder' : 'Modifier' }}
        </button>
      </div>
      <div *ngIf="editing" class="bg-primary/10 border border-primary/20 rounded-xl p-3 text-primary text-sm font-medium">
        ✏️ Mode édition activé — Les modifications seraient sauvegardées.
      </div>

      <!-- Personal Info -->
      <div class="bg-card rounded-xl border border-border p-6">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <lucide-icon [name]="userIcon" [size]="32" class="text-primary"></lucide-icon>
          </div>
          <div>
            <h2 class="text-xl font-semibold text-foreground">Fehmi Katar</h2>
            <p class="text-muted-foreground">Joueur • 28 ans</p>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div *ngFor="let info of personalInfo" class="bg-muted rounded-lg p-3">
            <p class="text-xs text-muted-foreground mb-1">{{info.label}}</p>
            <p class="font-semibold text-foreground">{{info.value}}</p>
          </div>
        </div>
      </div>

      <!-- Medical Conditions -->
      <div class="bg-card rounded-xl border border-border p-6">
        <div class="flex items-center gap-2 mb-4">
          <lucide-icon [name]="alertIcon" [size]="20" class="text-accent"></lucide-icon>
          <h3 class="font-semibold text-foreground">Conditions Médicales</h3>
        </div>
        <div class="space-y-2">
          <div *ngFor="let condition of conditions" class="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span class="text-foreground">{{condition.name}}</span>
            <span class="text-xs px-2 py-1 rounded-full"
              [ngClass]="condition.severity === 'low' ? 'bg-green-100 text-green-700' : condition.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'">
              {{condition.severityLabel}}
            </span>
          </div>
        </div>
      </div>

      <!-- Blood type and allergies -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-card rounded-xl border border-border p-6">
          <div class="flex items-center gap-2 mb-3">
            <lucide-icon [name]="heartIcon" [size]="20" class="text-red-500"></lucide-icon>
            <h3 class="font-semibold text-foreground">Groupe Sanguin</h3>
          </div>
          <p class="text-4xl font-bold text-primary">A+</p>
        </div>
        <div class="bg-card rounded-xl border border-border p-6">
          <h3 class="font-semibold text-foreground mb-3">Allergies</h3>
          <div class="flex flex-wrap gap-2">
            <span *ngFor="let allergy of allergies" class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
              {{allergy}}
            </span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HealthProfileComponent {
  readonly userIcon = User;
  readonly editIcon = Edit;
  readonly alertIcon = AlertTriangle;
  readonly heartIcon = Heart;
  readonly arrowLeftIcon = ArrowLeft;
  editing = false;
  toggleEdit() { this.editing = !this.editing; }

  personalInfo = [
    { label: 'Taille', value: '178 cm' },
    { label: 'Poids', value: '75 kg' },
    { label: 'IMC', value: '23.7' },
    { label: 'Sport Principal', value: 'Football' },
  ];

  conditions = [
    { name: 'Légère hypertension', severity: 'medium', severityLabel: 'Modéré' },
    { name: 'Légère myopie', severity: 'low', severityLabel: 'Léger' },
  ];

  allergies = ['Arachides', 'Pénicilline'];
}
