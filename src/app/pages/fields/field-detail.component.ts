import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, MapPin, Star, Clock, Calendar, Users, ArrowLeft, CheckCircle } from 'lucide-angular';
import { OwnerFeedbackComponent } from '../../components/owner-feedback/owner-feedback.component';
import { environment } from '../../../environments/environment';

interface FieldDetailViewModel {
    id: string;
    name: string;
    address: string;
    location: string;
    description: string;
    sportType: string;
    capacity: number | null;
    hourlyRate: number;
    averageRating: number | null;
    reviewCount: number;
    isAvailable: boolean;
}

@Component({
    selector: 'app-field-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule, OwnerFeedbackComponent],
    template: `
    <div class="min-h-screen bg-background p-4 md:p-6">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center gap-4 mb-8">
          <a routerLink="/app/fields" class="p-2 bg-card border border-border rounded-xl hover:bg-muted transition-all">
            <lucide-icon [img]="ArrowLeftIcon" class="w-5 h-5"></lucide-icon>
          </a>
          <h1>Détails du Terrain</h1>
        </div>

        <div *ngIf="loading" class="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground mb-6">
          Chargement du terrain...
        </div>

        <div *ngIf="!loading && errorMessage" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 mb-6">
          {{ errorMessage }}
        </div>

        <ng-container *ngIf="!loading && field">
        <div class="grid lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2">
            <div class="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mb-6">
              <lucide-icon [img]="MapPinIcon" class="w-24 h-24 text-primary/40"></lucide-icon>
            </div>
            <div class="bg-card rounded-2xl p-6 border border-border">
              <h2 class="mb-2">{{ field.name }}</h2>
              <div class="flex items-center gap-2 text-muted-foreground mb-4"><lucide-icon [img]="MapPinIcon" class="w-4 h-4"></lucide-icon><span>{{ field.address || field.location || 'Adresse non renseignée' }}</span></div>
              <div class="flex items-center gap-4 mb-6">
                <div class="flex items-center gap-1"><lucide-icon [img]="StarIcon" class="w-5 h-5 text-primary"></lucide-icon><span class="font-bold">{{ field.averageRating !== null ? (field.averageRating | number:'1.1-1') : 'N/A' }}</span><span class="text-muted-foreground">({{ field.reviewCount }} avis)</span></div>
                <div class="flex items-center gap-1"><lucide-icon [img]="CheckCircleIcon" class="w-5 h-5 text-primary"></lucide-icon><span class="font-semibold" [class.text-primary]="field.isAvailable" [class.text-red-500]="!field.isAvailable">{{ field.isAvailable ? 'Disponible' : 'Indisponible' }}</span></div>
              </div>
              <p class="text-muted-foreground mb-6">{{ field.description || 'Aucune description fournie pour ce terrain.' }}</p>
              <div class="grid grid-cols-2 gap-4">
                <div class="flex items-center gap-2 text-sm"><lucide-icon [img]="ClockIcon" class="w-4 h-4 text-primary"></lucide-icon><span>{{ field.sportType || 'Sport non renseigné' }}</span></div>
                <div class="flex items-center gap-2 text-sm"><lucide-icon [img]="UsersIcon" class="w-4 h-4 text-primary"></lucide-icon><span>Jusqu'à {{ field.capacity || '?' }} joueurs</span></div>
              </div>
            </div>

            <div class="mt-6">
              <app-owner-feedback [sportSpaceId]="fieldId"></app-owner-feedback>
            </div>
          </div>
          <div class="space-y-6">
            <div class="bg-card rounded-2xl p-6 border border-border sticky top-6">
              <div class="text-3xl font-bold text-primary mb-1">{{ field.hourlyRate }}€<span class="text-base font-normal text-muted-foreground">/heure</span></div>
              <div class="space-y-4 mt-4">
                <div>
                  <label class="block mb-2 text-sm font-semibold">Date</label>
                  <input type="date" class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                </div>
                <div>
                  <label class="block mb-2 text-sm font-semibold">Horaire</label>
                  <select class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                    <option>10:00 - 11:00</option>
                    <option>11:00 - 12:00</option>
                    <option>14:00 - 15:00</option>
                    <option>18:00 - 19:00</option>
                  </select>
                </div>
                <a [routerLink]="['/app/booking-form', fieldId]" class="block w-full py-3 text-center bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                  Réserver maintenant
                </a>
              </div>
            </div>
          </div>
        </div>
        </ng-container>
      </div>
    </div>
  `,
})
export class FieldDetailComponent implements OnInit {
    readonly ArrowLeftIcon = ArrowLeft;
    readonly MapPinIcon = MapPin;
    readonly StarIcon = Star;
    readonly ClockIcon = Clock;
    readonly UsersIcon = Users;
    readonly CheckCircleIcon = CheckCircle;
    fieldId = '';
    field: FieldDetailViewModel | null = null;
    loading = true;
    errorMessage = '';

    constructor(
        private route: ActivatedRoute,
        private http: HttpClient
    ) { }

    ngOnInit() {
        this.fieldId = this.route.snapshot.paramMap.get('id') || '';

        if (!this.fieldId) {
            this.loading = false;
            this.errorMessage = 'Terrain introuvable.';
            return;
        }

        this.http.get<any>(`${environment.apiUrl}/sport-spaces/${this.fieldId}`).subscribe({
            next: (field) => {
                this.field = {
                    id: String(field.id),
                    name: field.name || 'Terrain',
                    address: field.address || '',
                    location: field.location || '',
                    description: field.description || '',
                    sportType: field.sportType || '',
                    capacity: typeof field.capacity === 'number' ? field.capacity : null,
                    hourlyRate: Number(field.hourlyRate ?? 0),
                    averageRating: typeof field.averageRating === 'number' ? field.averageRating : null,
                    reviewCount: Number(field.reviewCount ?? 0),
                    isAvailable: field.isAvailable !== false
                };
                this.loading = false;
            },
            error: (error) => {
                console.error('Erreur lors du chargement du terrain:', error);
                this.errorMessage = error?.error?.error || error?.error?.message || 'Impossible de charger ce terrain.';
                this.loading = false;
            }
        });
    }
}
