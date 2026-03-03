import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Utensils, Coffee, Apple, ShoppingCart, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-diet-plans',
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
      <div>
        <h1 class="text-2xl font-bold text-foreground">Régime Alimentaire</h1>
        <p class="text-muted-foreground">Plans nutritionnels adaptés à vos objectifs sportifs</p>
      </div>

      <!-- Daily Calories -->
      <div class="bg-card rounded-xl border border-border p-6">
        <h2 class="font-semibold text-foreground mb-4">Bilan Calorique du Jour</h2>
        <div class="flex items-center gap-6">
          <div class="relative w-24 h-24">
            <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" stroke-width="3"/>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1DB954" stroke-width="3" stroke-dasharray="70, 100"/>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-sm font-bold text-foreground">70%</span>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex gap-8">
              <div><p class="text-xs text-muted-foreground">Consommé</p><p class="font-bold text-foreground">1,640 kcal</p></div>
              <div><p class="text-xs text-muted-foreground">Objectif</p><p class="font-bold text-foreground">2,340 kcal</p></div>
              <div><p class="text-xs text-muted-foreground">Restant</p><p class="font-bold text-primary">700 kcal</p></div>
            </div>
            <div class="flex gap-4 text-sm">
              <span class="text-blue-500">Protéines: 120g</span>
              <span class="text-yellow-500">Glucides: 210g</span>
              <span class="text-red-500">Lipides: 65g</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Today's Meals -->
      <div>
        <h2 class="text-lg font-semibold text-foreground mb-3">Repas du Jour</h2>
        <div class="space-y-3">
          <div *ngFor="let meal of meals" class="bg-card rounded-xl border border-border p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-primary/10 rounded-lg">
                  <lucide-icon [name]="meal.icon" [size]="18" class="text-primary"></lucide-icon>
                </div>
                <div>
                  <h3 class="font-semibold text-foreground">{{meal.name}}</h3>
                  <p class="text-xs text-muted-foreground">{{meal.time}}</p>
                </div>
              </div>
              <span class="text-primary font-semibold">{{meal.calories}} kcal</span>
            </div>
            <div class="pl-11 space-y-1">
              <p *ngFor="let food of meal.foods" class="text-sm text-muted-foreground flex justify-between">
                <span>{{food.name}}</span><span>{{food.portion}}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DietPlansComponent {
  readonly arrowLeftIcon = ArrowLeft;
  meals = [
    { name: 'Petit-déjeuner', time: '07:30', calories: 520, icon: Coffee, foods: [{ name: 'Flocons d\'avoine', portion: '80g' }, { name: 'Banane', portion: '1 pc' }, { name: 'Lait d\'amande', portion: '200ml' }] },
    { name: 'Déjeuner', time: '12:30', calories: 720, icon: Utensils, foods: [{ name: 'Poulet grillé', portion: '180g' }, { name: 'Riz complet', portion: '150g' }, { name: 'Légumes vapeur', portion: '200g' }] },
    { name: 'Collation', time: '16:00', calories: 200, icon: Apple, foods: [{ name: 'Pomme', portion: '1 pc' }, { name: 'Amandes', portion: '30g' }] },
    { name: 'Dîner', time: '19:30', calories: 200, icon: ShoppingCart, foods: [{ name: 'À planifier', portion: '—' }] },
  ];
}
