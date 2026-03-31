import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, MapPin, Clock, Calendar, DollarSign, Search, Star, Filter, CheckCircle } from 'lucide-angular';
import { BookingService, Field } from '../services/booking.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background p-4 md:p-6">
      <div class="max-w-7xl mx-auto">
        <div class="mb-8">
          <h1 class="mb-2">Réserver un Terrain</h1>
          <p class="text-muted-foreground">Trouvez et réservez le terrain parfait pour votre prochaine session</p>
        </div>

        <!-- Search & Filters -->
        <div class="bg-card rounded-2xl p-6 border border-border mb-8">
          <div class="grid md:grid-cols-3 gap-4">
            <div class="relative">
              <lucide-icon [img]="SearchIcon" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"></lucide-icon>
              <input type="text" [(ngModel)]="search" placeholder="Rechercher..." class="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <select [(ngModel)]="selectedType" class="px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all">
              <option value="all">Tous les sports</option>
              <option *ngFor="let t of sportTypes" [value]="t">{{ t }}</option>
            </select>
            <input type="date" [(ngModel)]="selectedDate" class="px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
          </div>
        </div>

        <!-- Fields Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let field of filteredFields" class="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all hover:shadow-xl group">
            <div class="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative">
              <div class="absolute inset-0 flex items-center justify-center">
                <lucide-icon [img]="MapPinIcon" class="w-16 h-16 text-primary/40"></lucide-icon>
              </div>
              <div class="absolute top-4 right-4"><span class="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">{{ field.type }}</span></div>
              <div *ngIf="field.available" class="absolute top-4 left-4 flex items-center gap-1 bg-card text-primary text-xs font-semibold px-2 py-1 rounded-full">
                <lucide-icon [img]="CheckCircleIcon" class="w-3 h-3"></lucide-icon>
                Disponible
              </div>
            </div>
            <div class="p-6">
              <h3 class="mb-2 group-hover:text-primary transition-colors">{{ field.name }}</h3>
              <div class="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <lucide-icon [img]="MapPinIcon" class="w-4 h-4"></lucide-icon><span>{{ field.location }}</span>
              </div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-1">
                  <lucide-icon [img]="StarIcon" class="w-4 h-4 text-primary"></lucide-icon>
                  <span class="font-semibold">{{ field.rating }}</span>
                  <span class="text-sm text-muted-foreground">({{ field.reviews }})</span>
                </div>
                <div class="font-semibold text-primary">{{ field.price }}€/h</div>
              </div>
              <div class="flex gap-4 text-sm text-muted-foreground mb-4">
                <span class="flex items-center gap-1"><lucide-icon [img]="ClockIcon" class="w-4 h-4"></lucide-icon>{{ field.hours }}</span>
              </div>
              <a [routerLink]="['/app/booking-form', field.id]" class="w-full block text-center py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                Réserver maintenant
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class BookingComponent implements OnInit {
  readonly MapPinIcon = MapPin;
  readonly ClockIcon = Clock;
  readonly SearchIcon = Search;
  readonly StarIcon = Star;
  readonly CheckCircleIcon = CheckCircle;

  search = '';
  selectedType = 'all';
  selectedDate = '';
  sportTypes = ['Football', 'Basketball', 'Tennis', 'Multisport', 'Volleyball'];

  fields: Field[] = [];

  constructor(private bookingService: BookingService) { }

  ngOnInit() {
    this.bookingService.fields$.subscribe(f => this.fields = f);
  }

  get filteredFields() {
    return this.fields.filter(f => {
      const matchesSearch = !this.search || f.name.toLowerCase().includes(this.search.toLowerCase()) || f.location.toLowerCase().includes(this.search.toLowerCase());
      const matchesType = this.selectedType === 'all' || f.type === this.selectedType;
      return matchesSearch && matchesType;
    });
  }
}

