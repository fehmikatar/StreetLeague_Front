import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, MapPin, Calendar, Clock, Save, ArrowLeft } from 'lucide-angular';

@Component({
    selector: 'app-add-field',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
    template: `
    <div class="min-h-screen bg-background p-4 md:p-6">
      <div class="max-w-3xl mx-auto">
        <div class="flex items-center gap-4 mb-8">
          <a routerLink="/app/fields" class="p-2 bg-card border border-border rounded-xl hover:bg-muted transition-all">
            <lucide-icon [img]="ArrowLeftIcon" class="w-5 h-5"></lucide-icon>
          </a>
          <div>
            <h1 class="mb-1">Ajouter un Terrain</h1>
            <p class="text-muted-foreground">Référencez votre espace sportif</p>
          </div>
        </div>
        <div class="bg-card rounded-2xl p-8 border border-border">
          <form (ngSubmit)="submit()" class="space-y-6">
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block mb-2 font-semibold">Nom du terrain</label>
                <input [(ngModel)]="name" name="name" type="text" placeholder="Terrain Parc Central" class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div>
                <label class="block mb-2 font-semibold">Type de sport</label>
                <select [(ngModel)]="type" name="type" class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                  <option *ngFor="let t of sportTypes" [value]="t">{{ t }}</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block mb-2 font-semibold">Adresse</label>
              <div class="relative">
                <lucide-icon [img]="MapPinIcon" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"></lucide-icon>
                <input [(ngModel)]="address" name="address" type="text" placeholder="123 Rue du Sport, Paris" class="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
            </div>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block mb-2 font-semibold">Prix par heure (€)</label>
                <input [(ngModel)]="price" name="price" type="number" placeholder="50" class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div>
                <label class="block mb-2 font-semibold">Capacité (joueurs)</label>
                <input [(ngModel)]="capacity" name="capacity" type="number" placeholder="22" class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
            </div>
            <div>
              <label class="block mb-2 font-semibold">Description</label>
              <textarea [(ngModel)]="description" name="description" rows="4" placeholder="Décrivez votre terrain..." class="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"></textarea>
            </div>
            <div *ngIf="saved" class="bg-primary/10 border border-primary/20 rounded-xl p-4 text-primary font-semibold">✓ Terrain ajouté avec succès !</div>
            <button type="submit" class="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2">
              <lucide-icon [img]="SaveIcon" class="w-5 h-5"></lucide-icon>
              Enregistrer le terrain
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class AddFieldComponent {
    readonly ArrowLeftIcon = ArrowLeft;
    readonly MapPinIcon = MapPin;
    readonly SaveIcon = Save;

    name = '';
    type = 'Football';
    address = '';
    price = '';
    capacity = '';
    description = '';
    saved = false;
    sportTypes = ['Football', 'Basketball', 'Tennis', 'Multisport', 'Volleyball'];

    submit() {
        this.saved = true;
        setTimeout(() => { this.saved = false; }, 3000);
    }
}
