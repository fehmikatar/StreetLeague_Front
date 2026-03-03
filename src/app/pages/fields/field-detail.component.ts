import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, MapPin, Star, Clock, Calendar, Users, ArrowLeft, CheckCircle } from 'lucide-angular';

@Component({
    selector: 'app-field-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    template: `
    <div class="min-h-screen bg-background p-4 md:p-6">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center gap-4 mb-8">
          <a routerLink="/app/fields" class="p-2 bg-card border border-border rounded-xl hover:bg-muted transition-all">
            <lucide-icon [img]="ArrowLeftIcon" class="w-5 h-5"></lucide-icon>
          </a>
          <h1>Détails du Terrain</h1>
        </div>
        <div class="grid lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2">
            <div class="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mb-6">
              <lucide-icon [img]="MapPinIcon" class="w-24 h-24 text-primary/40"></lucide-icon>
            </div>
            <div class="bg-card rounded-2xl p-6 border border-border">
              <h2 class="mb-2">Terrain de foot Parc Central</h2>
              <div class="flex items-center gap-2 text-muted-foreground mb-4"><lucide-icon [img]="MapPinIcon" class="w-4 h-4"></lucide-icon><span>Paris 15ème</span></div>
              <div class="flex items-center gap-4 mb-6">
                <div class="flex items-center gap-1"><lucide-icon [img]="StarIcon" class="w-5 h-5 text-primary"></lucide-icon><span class="font-bold">4.8</span><span class="text-muted-foreground">(124 avis)</span></div>
                <div class="flex items-center gap-1"><lucide-icon [img]="CheckCircleIcon" class="w-5 h-5 text-primary"></lucide-icon><span class="text-primary font-semibold">Disponible</span></div>
              </div>
              <p class="text-muted-foreground mb-6">Un terrain de football professionnel en gazon synthétique, idéal pour les matchs à 11 ou à 7. Équipé de vestiaires, douches et éclairage LED.</p>
              <div class="grid grid-cols-2 gap-4">
                <div class="flex items-center gap-2 text-sm"><lucide-icon [img]="ClockIcon" class="w-4 h-4 text-primary"></lucide-icon><span>7h - 23h</span></div>
                <div class="flex items-center gap-2 text-sm"><lucide-icon [img]="UsersIcon" class="w-4 h-4 text-primary"></lucide-icon><span>Jusqu'à 22 joueurs</span></div>
              </div>
            </div>
          </div>
          <div class="space-y-6">
            <div class="bg-card rounded-2xl p-6 border border-border sticky top-6">
              <div class="text-3xl font-bold text-primary mb-1">50€<span class="text-base font-normal text-muted-foreground">/heure</span></div>
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
                <a routerLink="/app/booking-form" class="block w-full py-3 text-center bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                  Réserver maintenant
                </a>
              </div>
            </div>
          </div>
        </div>
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

    constructor(private route: ActivatedRoute) { }
    ngOnInit() {
        this.fieldId = this.route.snapshot.paramMap.get('id') || '';
    }
}
