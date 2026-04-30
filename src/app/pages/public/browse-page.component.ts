import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, MapPin, Star, Clock, DollarSign, Search, Filter, ArrowRight, Lock } from 'lucide-angular';

@Component({
    selector: 'app-browse-page',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
    template: `
    <div class="min-h-screen">
      <!-- Hero -->
      <section class="bg-gradient-to-br from-background via-primary/5 to-accent/5 py-20">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center max-w-3xl mx-auto">
            <div class="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">Explore fields</div>
            <h1 class="mb-6">Find the <span class="text-primary">perfect</span> field</h1>
            <p class="text-xl text-muted-foreground mb-8">Browse our selection of sports fields available near you</p>
            <div class="max-w-2xl mx-auto">
              <div class="relative">
                <lucide-icon [img]="SearchIcon" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"></lucide-icon>
                <input type="text" [(ngModel)]="searchQuery" placeholder="Search by name or location..."
                  class="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-border focus:border-primary transition-colors bg-card focus:outline-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Filters & Results -->
      <section class="py-12 bg-card">
        <div class="max-w-7xl mx-auto px-4">
          <div class="mb-8">
            <div class="flex items-center gap-4 flex-wrap">
              <div class="flex items-center gap-2">
                <lucide-icon [img]="FilterIcon" class="w-5 h-5 text-muted-foreground"></lucide-icon>
                <span class="font-semibold">Sport type:</span>
              </div>
              <div class="flex gap-2 flex-wrap">
                <button *ngFor="let type of sportTypes" (click)="selectedType = type"
                  class="px-4 py-2 rounded-xl font-semibold transition-all"
                  [class.bg-primary]="selectedType === type" [class.text-primary-foreground]="selectedType === type"
                  [class.bg-muted]="selectedType !== type" [class.hover:bg-muted/80]="selectedType !== type">
                  {{ type === 'all' ? 'All' : type }}
                </button>
              </div>
            </div>
          </div>
          <div class="mb-6">
            <p class="text-muted-foreground">
              <span class="font-semibold text-foreground">{{ filteredFields.length }}</span> fields available
            </p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let field of filteredFields" class="bg-background border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all group">
              <div class="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                <div class="absolute inset-0 flex items-center justify-center">
                  <lucide-icon [img]="MapPinIcon" class="w-16 h-16 text-primary/40"></lucide-icon>
                </div>
                <div class="absolute top-4 right-4">
                  <span class="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">{{ field.type }}</span>
                </div>
              </div>
              <div class="p-6">
                <h3 class="mb-2 text-lg group-hover:text-primary transition-colors">{{ field.name }}</h3>
                <div class="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <lucide-icon [img]="MapPinIcon" class="w-4 h-4"></lucide-icon>
                  <span>{{ field.location }}</span>
                </div>
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-1">
                    <lucide-icon [img]="StarIcon" class="w-4 h-4 text-primary"></lucide-icon>
                    <span class="font-semibold">{{ field.rating }}</span>
                    <span class="text-sm text-muted-foreground">({{ field.reviews }} reviews)</span>
                  </div>
                  <div class="flex items-center gap-1 text-primary font-semibold">
                    <span>\${{ field.price }}</span>
                    <span class="text-xs text-muted-foreground">/hour</span>
                  </div>
                </div>
                <div class="pt-4 border-t border-border">
                  <div class="bg-muted/50 rounded-xl p-4 text-center">
                    <div class="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                      <lucide-icon [img]="LockIcon" class="w-4 h-4"></lucide-icon>
                      <span class="text-sm font-medium">Log in to book</span>
                    </div>
                    <a routerLink="/auth/login" class="text-primary font-semibold hover:underline text-sm inline-flex items-center gap-1">
                      Log in
                      <lucide-icon [img]="ArrowRightIcon" class="w-3 h-3"></lucide-icon>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div *ngIf="filteredFields.length === 0" class="text-center py-12">
            <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <lucide-icon [img]="SearchIcon" class="w-8 h-8 text-muted-foreground"></lucide-icon>
            </div>
            <h3 class="mb-2">No fields found</h3>
            <p class="text-muted-foreground mb-6">Try changing your search criteria</p>
            <button (click)="resetFilters()" class="px-6 py-2 border border-border rounded-xl hover:bg-muted transition-all">Reset</button>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div class="max-w-4xl mx-auto px-4 text-center">
          <div class="bg-card border-2 border-primary/20 rounded-3xl p-12">
            <h2 class="mb-6">Want to go further?</h2>
            <p class="text-xl text-muted-foreground mb-8">Create your account to book fields, organize matches and track your performances</p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a routerLink="/auth/signup" class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg">
                Create a free account
                <lucide-icon [img]="ArrowRightIcon" class="w-5 h-5"></lucide-icon>
              </a>
              <a routerLink="/auth/login" class="inline-flex items-center justify-center px-8 py-4 border-2 border-border rounded-xl font-semibold hover:bg-muted transition-all">Log in</a>
            </div>
            <p class="text-sm text-muted-foreground mt-6">No credit card required • Sign up in 30 seconds</p>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class BrowsePageComponent {
    readonly MapPinIcon = MapPin;
    readonly StarIcon = Star;
    readonly SearchIcon = Search;
    readonly FilterIcon = Filter;
    readonly ArrowRightIcon = ArrowRight;
    readonly LockIcon = Lock;

    searchQuery = '';
    selectedType = 'all';
    sportTypes = ['all', 'Football', 'Basketball', 'Tennis', 'Multisport', 'Volleyball'];

    fields = [
        { id: '1', name: 'Central Park Football Field', location: 'Paris 15th', type: 'Football', price: '50', rating: 4.8, reviews: 124 },
        { id: '2', name: 'Premium Basketball Court', location: 'Lyon 3rd', type: 'Basketball', price: '40', rating: 4.9, reviews: 89 },
        { id: '3', name: 'Elite Club Tennis Court', location: 'Marseille 8th', type: 'Tennis', price: '35', rating: 4.7, reviews: 156 },
        { id: '4', name: 'City Multisport Field', location: 'Paris 12th', type: 'Multisport', price: '45', rating: 4.6, reviews: 92 },
        { id: '5', name: 'Urban Football Stadium', location: 'Toulouse 1st', type: 'Football', price: '60', rating: 4.9, reviews: 201 },
        { id: '6', name: 'Beach Volleyball Court', location: 'Nice 6th', type: 'Volleyball', price: '30', rating: 4.5, reviews: 67 },
    ];

    get filteredFields() {
        return this.fields.filter(f => {
            const matchesSearch = f.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || f.location.toLowerCase().includes(this.searchQuery.toLowerCase());
            const matchesType = this.selectedType === 'all' || f.type === this.selectedType;
            return matchesSearch && matchesType;
        });
    }

    resetFilters() {
        this.searchQuery = '';
        this.selectedType = 'all';
    }
}
