import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
   LucideAngularModule, ShoppingBag, ShoppingCart, Loader2,
   Search, ArrowRight, ArrowLeft, Tag, Star, X, Heart, Plus, Edit, Trash2, Package, Truck, CheckCircle
} from 'lucide-angular';
import { ProductService, Product, Category, ProductRequest } from '../services/product.service';
import { RealTimeNotificationService } from '../services/real-time-notification.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
   selector: 'app-sponsors',
   standalone: true,
   imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
   template: `
    <div class="min-h-screen bg-background font-sans pb-20">
      
      <!-- Top Banner -->
      <div class="bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold text-center py-2.5 uppercase tracking-widest relative z-20 shadow-md">
        Livraison gratuite dès 300DT d'achat &nbsp;|&nbsp; Retours gratuits sous 30 jours
      </div>

      <!-- Main Header -->
      <div class="bg-card sticky top-0 z-40 shadow-sm border-b border-border">
        <div class="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <h1 (click)="selectCategory(null)" class="text-xl sm:text-3xl font-black tracking-tighter uppercase text-foreground cursor-pointer">STREETLEAGUE</h1>
          
          <div class="flex-1 max-w-xl mx-4 relative hidden md:block">
             <input type="text" [(ngModel)]="searchKeyword" (keyup.enter)="applyFilters()" placeholder="Search items, sports..." class="w-full h-10 bg-muted/50 rounded-full pl-5 pr-14 text-sm focus:outline-none focus:ring-2 ring-primary/50 transition-all border border-border focus:border-primary">
             <button type="button" (click)="applyFilters(); cdr.detectChanges()" class="absolute right-0 top-0 h-10 w-12 bg-primary text-primary-foreground rounded-r-full flex items-center justify-center hover:opacity-90 transition-colors cursor-pointer">
               <lucide-icon [img]="SearchIcon" [size]="16"></lucide-icon>
             </button>
          </div>

          <div class="flex items-center gap-4 sm:gap-6">
             <a *ngIf="isAdmin" routerLink="/app/admin/orders" title="Admin Orders" class="relative group cursor-pointer hover:text-primary transition-colors text-foreground">
                <lucide-icon [img]="PackageIcon" [size]="20"></lucide-icon>
             </a>
             <button *ngIf="isAdmin" type="button" (click)="openAddModal(); cdr.detectChanges()" title="Add Product" class="relative group cursor-pointer hover:opacity-70 transition-opacity">
                <lucide-icon [img]="PlusIcon" [size]="20" class="text-primary"></lucide-icon>
             </button>
             <button type="button" (click)="openOrders(); cdr.detectChanges()" class="hidden sm:block text-[11px] font-bold uppercase tracking-wider hover:text-primary transition-colors text-foreground cursor-pointer">
                My Orders
             </button>
             <button type="button" (click)="isCartOpen = true; cdr.detectChanges()" class="relative group cursor-pointer hover:text-primary transition-colors text-foreground">
                <lucide-icon [img]="ShoppingBagIcon" [size]="22"></lucide-icon>
                <div *ngIf="cartItemCount > 0" class="absolute -top-1.5 -right-2 h-4 w-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center font-bold text-[9px]">
                   {{ cartItemCount }}
                </div>
             </button>
          </div>
        </div>
        <div class="md:hidden px-4 py-3 bg-card border-t border-border">
              <div class="relative w-full">
                 <input type="text" [(ngModel)]="searchKeyword" (keyup.enter)="applyFilters()" placeholder="Search..." class="w-full h-10 bg-muted/50 rounded-full pl-5 pr-14 text-sm focus:outline-none border border-border">
                 <button type="button" (click)="applyFilters(); cdr.detectChanges()" class="absolute right-0 top-0 h-10 w-12 bg-primary text-primary-foreground rounded-r-full flex items-center justify-center cursor-pointer">
                   <lucide-icon [img]="SearchIcon" [size]="16"></lucide-icon>
                 </button>
              </div>
        </div>
      </div>

      <div class="bg-background">
        
        <!-- Category Bubbles -->
        <div *ngIf="!loadingCategories && categories.length > 0" class="py-6 px-4 bg-card border-b border-border overflow-x-auto hide-scrollbar relative z-30 pointer-events-auto">
          <div class="container mx-auto flex gap-6 lg:gap-10 justify-start min-w-max">
            <button type="button" (click)="selectCategory(null); cdr.detectChanges()" class="flex flex-col items-center gap-2 group flex-shrink-0 cursor-pointer">
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-border p-1 group-hover:border-primary transition-colors" [class.border-primary]="selectedCategoryId === null" [class.ring-2]="selectedCategoryId === null" [class.ring-primary]="selectedCategoryId === null">
                <div class="w-full h-full bg-gradient-to-br from-primary/10 to-accent/20 rounded-full flex items-center justify-center text-2xl shadow-inner">✨</div>
              </div>
              <span class="text-[11px] sm:text-[12px] font-bold text-muted-foreground pb-1" [class.text-primary]="selectedCategoryId === null && selectedGender === null" [class.border-b-2]="selectedCategoryId === null && selectedGender === null" [class.border-primary]="selectedCategoryId === null && selectedGender === null">TRENDING</span>
            </button>

            <button *ngFor="let cat of categories; let i = index" type="button" (click)="selectCategory(cat.id!); cdr.detectChanges()" class="flex flex-col items-center gap-2 group flex-shrink-0 cursor-pointer">
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-border p-1 group-hover:border-primary transition-colors" [class.border-primary]="selectedCategoryId === cat.id" [class.ring-2]="selectedCategoryId === cat.id" [class.ring-primary]="selectedCategoryId === cat.id">
                <div class="w-full h-full bg-muted rounded-full overflow-hidden flex items-center justify-center shadow-inner">
                   <img *ngIf="$any(cat).image" [src]="$any(cat).image" class="w-full h-full object-cover">
                   <div *ngIf="!$any(cat).image" class="text-xl sm:text-2xl font-black text-muted-foreground group-hover:text-primary transition-colors">{{ (cat.nom || cat.name || 'C').charAt(0) | uppercase }}</div>
                </div>
              </div>
              <span class="text-[11px] sm:text-[12px] font-medium text-muted-foreground group-hover:text-primary transition-colors text-center w-16 sm:w-20 truncate pb-1" [class.font-bold]="selectedCategoryId === cat.id" [class.text-primary]="selectedCategoryId === cat.id" [class.border-b-2]="selectedCategoryId === cat.id" [class.border-primary]="selectedCategoryId === cat.id">
                {{ cat.nom || cat.name }}
              </span>
            </button>
          </div>
        </div>

         <div class="container mx-auto max-w-[1400px] px-4 py-8 relative z-30">
           <!-- Hero Banner (Home only) -->
           <div *ngIf="selectedCategoryId === null" (click)="selectCategory(null); cdr.detectChanges()" class="w-full h-[250px] sm:h-[400px] bg-gradient-to-r from-primary to-accent rounded-2xl mb-10 overflow-hidden relative group cursor-pointer shadow-lg border border-border">
              <img src="https://images.unsplash.com/photo-1556817411-31ae72fa3ea8?q=80&w=2000&auto=format&fit=crop" class="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000">
              <div class="absolute inset-x-6 sm:inset-x-12 bottom-8 sm:bottom-12 z-10 text-white">
                 <div class="text-[10px] font-black tracking-[0.3em] mb-2 uppercase text-white/80">SUMMER COLLECTION 2026</div>
                 <h2 class="text-3xl sm:text-6xl font-black uppercase tracking-tighter leading-none mb-6">Gear up for action!</h2>
                 <button type="button" class="inline-flex bg-card text-foreground text-xs font-bold px-8 py-3.5 rounded-full hover:bg-white hover:text-black transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-pointer">DISCOVER OFFERS &rarr;</button>
              </div>
           </div>

           <!-- Filters & Gender Selection -->
           <div *ngIf="selectedCategoryId !== null" class="flex flex-col gap-4 mb-6 relative z-30 pointer-events-auto">
              
              <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                 <button 
                   type="button"
                   (click)="selectGender(''); cdr.detectChanges()" 
                   class="px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border cursor-pointer relative z-30"
                   [ngClass]="!selectedGender ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary'">
                   SEE ALL
                 </button>
                 <button 
                   *ngFor="let g of ['Men', 'Women', 'Kids', 'Accessories']"
                   type="button"
                   (click)="selectGender(g); cdr.detectChanges()" 
                   class="px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border cursor-pointer relative z-30"
                   [ngClass]="selectedGender === g ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary'">
                   {{ g }}
                 </button>
              </div>

              <div class="bg-card border text-xs border-border rounded-xl p-3 flex gap-3 overflow-x-auto min-w-max hide-scrollbar shadow-sm items-center">
                 <div class="font-bold flex items-center shrink-0 uppercase tracking-wider text-muted-foreground mr-2">
                    <lucide-icon [img]="SearchIcon" [size]="16" class="mr-2"></lucide-icon> Filters
                 </div>
                 <input type="text" [(ngModel)]="searchKeyword" (keyup.enter)="applyFilters()" placeholder="Keyword..." class="w-32 h-9 px-3 bg-background border border-border rounded-lg focus:border-primary outline-none shrink-0 transition-colors hidden sm:block">
                 <input type="number" [(ngModel)]="minPrice" (keyup.enter)="applyFilters()" placeholder="Min Price (DT)" class="w-24 h-9 px-3 bg-background border border-border rounded-lg focus:border-primary outline-none shrink-0 transition-colors">
                 <input type="number" [(ngModel)]="maxPrice" (keyup.enter)="applyFilters()" placeholder="Max Price (DT)" class="w-24 h-9 px-3 bg-background border border-border rounded-lg focus:border-primary outline-none shrink-0 transition-colors">
                 <button type="button" (click)="applyFilters(); cdr.detectChanges()" class="h-9 px-6 bg-primary text-primary-foreground font-bold rounded-lg shrink-0 uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer">Filter</button>
                 <button *ngIf="isAdmin" type="button" (click)="openAddModal(); cdr.detectChanges()" class="h-9 px-4 bg-accent text-accent-foreground font-bold rounded-lg shrink-0 uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 ml-2 relative z-30 cursor-pointer">
                    <lucide-icon [img]="PlusIcon" [size]="14"></lucide-icon> Add
                 </button>
              </div>
           </div>

           <!-- Section Title -->
           <div class="mb-6 flex items-center justify-between">
              <h2 class="text-xl sm:text-2xl font-black uppercase tracking-tighter text-foreground flex items-center gap-2">
                 {{ selectedCategoryId === null ? 'Great Deals' : 'SELECTION' }}
                 <span *ngIf="selectedCategoryId === null" class="text-destructive">🔥</span>
              </h2>
              <div class="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">{{ products.length }} Items</div>
           </div>

            <!-- Empty State -->
            <div *ngIf="!loadingProducts && products.length === 0" class="bg-white border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center py-24 text-center px-4">
               <div class="text-5xl mb-4 opacity-50">📭</div>
               <h3 class="text-lg font-black mb-1 uppercase tracking-tighter">No items found</h3>
               <p class="text-gray-500 text-sm">We have no matching products.</p>
            </div>

           <!-- Product Grid -->
           <div *ngIf="!loadingProducts && products.length > 0" class="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
              
              <div *ngFor="let prod of products" class="group relative flex flex-col bg-white hover:z-10 rounded-sm">
                 <a *ngIf="!isAdmin" [routerLink]="['/app/sponsors', prod.id]" class="absolute inset-0 z-10"></a>

                 <div class="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden isolate">
                    <img *ngIf="prod.images && prod.images.length > 0" [src]="prod.images[0]" [alt]="prod.nom" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                    <div *ngIf="!prod.images || prod.images.length === 0" class="flex items-center justify-center w-full h-full text-5xl opacity-10">🛍️</div>
                    
                    <button 
                       *ngIf="!isAdmin"
                       type="button"
                       (click)="addToCart(prod); $event.stopPropagation(); cdr.detectChanges()"
                       [disabled]="prod.stock === 0 || ($any(prod).status && $any(prod).status !== 'EN_STOCK' && $any(prod).status !== 'IN_STOCK') || addingToCartId === prod.id"
                       class="absolute bottom-3 left-3 right-3 h-11 bg-primary/95 backdrop-blur-sm text-primary-foreground font-bold text-[11px] uppercase tracking-widest shadow-lg rounded-xl lg:opacity-0 lg:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20 flex items-center justify-center disabled:opacity-50 hover:bg-primary hover:shadow-primary/30 cursor-pointer">
                       <span *ngIf="addingToCartId !== prod.id">{{ prod.stock === 0 ? 'Indisponible' : 'Ajout Rapide' }}</span>
                       <lucide-icon *ngIf="addingToCartId === prod.id" [img]="Loader2Icon" [size]="16" class="animate-spin"></lucide-icon>
                    </button>
                  </div>

                 <button 
                   type="button"
                   (click)="toggleFavorite(prod); $event.stopPropagation(); cdr.detectChanges()"
                   class="absolute top-3 right-3 p-2.5 rounded-full z-20 bg-card shadow-sm hover:scale-110 transition-transform cursor-pointer">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" 
                          [attr.fill]="isFavorite(prod.id) ? 'currentColor' : 'none'" 
                          [attr.stroke]="isFavorite(prod.id) ? 'transparent' : 'currentColor'" 
                          [class.text-destructive]="isFavorite(prod.id)"
                          [class.text-muted-foreground]="!isFavorite(prod.id)"
                          stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                     </svg>
                  </button>

                 <div *ngIf="prod.stock < 5 && prod.stock > 0" class="absolute top-3 left-0 bg-destructive text-destructive-foreground text-[10px] font-black px-3 py-1 rounded-r-lg uppercase z-20 shadow-sm">Fast Out</div>
                 <div *ngIf="prod.stock === 0 || $any(prod).status === 'RUPTURE_DE_STOCK'" class="absolute top-3 left-0 bg-muted-foreground text-white text-[10px] font-black px-3 py-1 rounded-r-lg uppercase z-20 shadow-sm">Épuisé</div>
                 <div *ngIf="$any(prod).status === 'ARRIVING_SOON' || $any(prod).status === 'EN_ARRIVAGE'" class="absolute top-3 left-0 bg-accent text-accent-foreground text-[10px] font-black px-3 py-1 rounded-r-lg uppercase z-20 shadow-sm">Bientôt</div>

                 <div class="py-4 px-4 flex flex-col flex-1">
                    <div *ngIf="prod.category?.nom === 'Clothing' || prod.category?.name === 'Clothing'" class="flex gap-1.5 mb-2">
                       <div *ngFor="let col of CLOTHING_COLORS" class="relative group/color">
                          <div [style.background-color]="col.hex" class="w-3.5 h-3.5 rounded-full border border-border/50 shadow-sm transition-transform group-hover/color:scale-110"></div>
                          <div *ngIf="isColorOutOfStock(prod, col.name)" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <div class="w-[120%] h-[1.5px] bg-red-500 rotate-[45deg] shadow-sm"></div>
                          </div>
                          <span class="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover/color:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30 font-bold uppercase tracking-tighter">{{ col.name }}</span>
                       </div>
                    </div>
                    <div class="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors">{{ prod.nom }}</div>
                    <div class="flex items-center justify-between mb-4 mt-auto">
                       <span class="text-lg sm:text-xl font-black text-foreground">{{ formatPrice(prod.prix) }}</span>
                       <div class="text-[9px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{{ prod.stock }} in stock</div>
                    </div>
                    <div class="text-[10px] font-bold text-muted-foreground tracking-wider uppercase truncate mb-4">{{ prod.category?.nom || prod.category?.name || 'Clothing' }}</div>

                    <div *ngIf="isAdmin" class="flex gap-2 pt-3 mt-auto border-t border-border/50">
                       <button type="button" (click)="editProduct(prod); $event.stopPropagation(); $event.preventDefault(); cdr.detectChanges()" class="flex-1 h-9 bg-amber-500 text-white font-black text-[10px] uppercase tracking-tight rounded-lg shadow-sm flex items-center justify-center hover:bg-amber-600 active:scale-95 transition-all gap-2 cursor-pointer">
                          <lucide-icon [img]="EditIcon" [size]="14"></lucide-icon> Modifier
                       </button>
                       <button type="button" (click)="deleteProduct(prod.id); $event.stopPropagation(); $event.preventDefault(); cdr.detectChanges()" class="h-9 w-9 bg-red-600 text-white rounded-lg flex items-center justify-center hover:bg-red-700 active:scale-95 transition-all shadow-sm cursor-pointer">
                          <lucide-icon [img]="Trash2Icon" [size]="14"></lucide-icon>
                       </button>
                    </div>
                 </div>
              </div>
           </div>
  
           <!-- Pagination -->
           <div *ngIf="totalPages > 1" class="flex items-center justify-center gap-4 mt-16 mb-8 pt-8 border-t border-border">
             <button type="button" (click)="prevPage(); cdr.detectChanges()" [disabled]="currentPage === 0" class="w-12 h-12 border-2 border-primary rounded-xl flex items-center justify-center text-primary hover:bg-primary/10 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer">
               <lucide-icon [img]="ArrowLeftIcon" [size]="20"></lucide-icon>
             </button>
             <span class="text-xs font-black tracking-[0.2em] uppercase text-foreground">{{ currentPage + 1 }} / {{ totalPages }}</span>
             <button type="button" (click)="nextPage(); cdr.detectChanges()" [disabled]="currentPage >= totalPages - 1" class="w-12 h-12 border-2 border-primary rounded-xl flex items-center justify-center text-primary hover:bg-primary/10 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer">
               <lucide-icon [img]="ArrowRightIcon" [size]="20"></lucide-icon>
             </button>
           </div>
        </div>

      <!-- Add Product Modal (Admin Only) -->
      <div *ngIf="isAddModalOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
         <div class="absolute inset-0 bg-black/60 backdrop-blur-md" (click)="closeAddModal()"></div>
         <div class="relative bg-card border border-border shadow-[0_0_50px_rgba(0,0,0,0.3)] rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            <div class="bg-green-500 px-8 py-6 flex items-center justify-between text-white relative">
               <h2 class="text-2xl font-black">{{ editingId ? 'Modifier le produit' : 'Add un produit' }}</h2>
               <button type="button" (click)="closeAddModal(); $event.stopPropagation(); cdr.detectChanges()" class="h-10 w-10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all active:scale-90 cursor-pointer text-white">
                  <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
               </button>
            </div>
            <div class="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
               <form class="space-y-6">
                  <!-- Nom & Brand -->
                  <div class="grid grid-cols-2 gap-6">
                     <div class="space-y-2">
                        <label class="text-sm font-bold text-foreground ml-1">Nom</label>
                        <input type="text" [(ngModel)]="newProduct.nom" name="nom" class="w-full h-12 px-4 bg-muted/20 border border-border focus:border-primary rounded-xl text-sm font-medium transition-all outline-none" placeholder="ex: pull taraji">
                     </div>
                     <div class="space-y-2">
                        <label class="text-sm font-bold text-foreground ml-1">Brand</label>
                        <input type="text" [(ngModel)]="newProduct.marque" name="marque" class="w-full h-12 px-4 bg-muted/20 border border-border focus:border-primary rounded-xl text-sm font-medium transition-all outline-none" placeholder="ex: taraji store">
                     </div>
                  </div>

                  <!-- Description -->
                  <div class="space-y-2">
                     <label class="text-sm font-bold text-foreground ml-1">Description</label>
                     <textarea [(ngModel)]="newProduct.description" name="desc" rows="3" class="w-full p-4 bg-muted/20 border border-border focus:border-primary rounded-xl text-sm font-medium transition-all outline-none resize-none" placeholder="Description du produit..."></textarea>
                  </div>

                  <!-- Price & Stock Global -->
                  <div class="grid grid-cols-2 gap-6">
                     <div class="space-y-2">
                        <label class="text-sm font-bold text-foreground ml-1">Price (DT)</label>
                        <input type="number" [(ngModel)]="newProduct.prix" name="prix" class="w-full h-12 px-4 bg-muted/20 border border-border focus:border-primary rounded-xl text-sm font-medium transition-all outline-none">
                     </div>
                     <div class="space-y-2">
                        <label class="text-sm font-bold text-foreground ml-1">Stock Global</label>
                        <input type="number" [(ngModel)]="newProduct.stock" name="stock" readonly class="w-full h-12 px-4 bg-muted/20 border border-border rounded-xl text-sm font-medium outline-none cursor-not-allowed opacity-80">
                     </div>
                  </div>

                  <!-- Category & Status -->
                  <div class="grid grid-cols-2 gap-6">
                     <div class="space-y-2">
                        <label class="text-sm font-bold text-foreground ml-1">Category</label>
                        <select [(ngModel)]="newProduct.categoryId" name="cat" class="w-full h-12 px-4 bg-muted/20 border border-border focus:border-primary rounded-xl text-sm font-medium transition-all outline-none appearance-none">
                           <option [ngValue]="null">Select Category...</option>
                           <option *ngFor="let c of categories" [value]="c.id">{{ c.nom || c.name }}</option>
                        </select>
                     </div>
                     <div class="space-y-2">
                        <label class="text-sm font-bold text-foreground ml-1">Status du Produit</label>
                        <select [(ngModel)]="newProduct.status" name="status" class="w-full h-12 px-4 bg-muted/20 border border-border focus:border-primary rounded-xl text-sm font-medium transition-all outline-none appearance-none">
                           <option value="EN_STOCK">EN STOCK</option>
                           <option value="EN_ARRIVAGE">EN ARRIVAGE</option>
                           <option value="RUPTURE_DE_STOCK">RUPTURE DE STOCK</option>
                        </select>
                     </div>
                  </div>

                  <!-- Variantes Section -->
                  <div class="border border-border rounded-2xl p-6 space-y-6">
                     <h3 class="font-bold text-foreground border-b border-border pb-4">Variantes (Sizes & Pointures)</h3>
                     
                     <div class="space-y-4">
                        <div class="space-y-2">
                           <label class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Type d'Article</label>
                           <select [(ngModel)]="productType" name="type" (change)="onTypeChange()" class="w-full h-12 px-4 bg-muted/20 border border-border focus:border-primary rounded-xl text-sm font-medium transition-all outline-none appearance-none">
                              <option value="">Sélectionner un type...</option>
                              <option value="vetement">Clothing (Pull, Short, Tenue)</option>
                              <option value="chaussure">Footwear (Crampons, Baskets)</option>
                           </select>
                        </div>

                        <div *ngIf="productType === 'chaussure'" class="space-y-2">
                           <label class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Genre / Categorie</label>
                           <select [(ngModel)]="productGender" name="gender" (change)="onGenderChange()" class="w-full h-12 px-4 bg-muted/20 border border-border focus:border-primary rounded-xl text-sm font-medium transition-all outline-none appearance-none">
                              <option value="">Genre...</option>
                              <option value="homme">Homme</option>
                              <option value="femme">Femme</option>
                              <option value="enfant">Enfant</option>
                           </select>
                        </div>

                        <!-- Sizes Selection -->
                        <div *ngIf="productType" class="space-y-3">
                           <label class="text-xs font-bold text-muted-foreground">Cochez les tailles disponibles :</label>
                           <div class="flex flex-wrap gap-2">
                              <button *ngFor="let size of availableSizes" type="button" 
                                 (click)="toggleSize(size)"
                                 class="h-10 px-4 rounded-full text-xs font-black transition-all border flex items-center justify-center cursor-pointer"
                                 [ngClass]="selectedSizes.includes(size) ? 'bg-green-500 text-white border-green-500' : 'bg-muted/20 text-muted-foreground border-border hover:border-primary'">
                                 {{ size }}
                              </button>
                           </div>
                        </div>

                        <!-- Colors Selection -->
                        <div *ngIf="productType === 'vetement'" class="space-y-3">
                           <label class="text-xs font-bold text-muted-foreground">Couleurs disponibles :</label>
                           <div class="flex flex-wrap gap-4">
                              <button *ngFor="let col of CLOTHING_COLORS" type="button" 
                                 (click)="toggleColor(col.name)"
                                 class="flex flex-col items-center gap-1 group cursor-pointer">
                                 <div [style.background-color]="col.hex" 
                                    class="w-10 h-10 rounded-full border-2 shadow-sm flex items-center justify-center transition-all group-hover:scale-110"
                                    [class.border-green-500]="selectedColors.includes(col.name)"
                                    [class.border-border]="!selectedColors.includes(col.name)">
                                    <div *ngIf="selectedColors.includes(col.name)" class="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                                       <lucide-icon [img]="CheckIcon" [size]="14"></lucide-icon>
                                    </div>
                                 </div>
                                 <span class="text-[10px] font-bold uppercase tracking-tighter" [class.text-green-600]="selectedColors.includes(col.name)">{{ col.name }}</span>
                              </button>
                           </div>
                        </div>

                        <!-- Stock for each size -->
                        <div *ngIf="selectedSizes.length > 0" class="space-y-3 pt-4 border-t border-border/50">
                           <label class="text-xs font-bold text-muted-foreground">Stock pour chaque taille :</label>
                           <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <div *ngFor="let size of selectedSizes" class="flex items-center gap-2 bg-muted/10 border border-border p-2 rounded-xl">
                                 <span class="text-xs font-black w-8 text-center text-primary">{{ size }}</span>
                                 <input type="number" [(ngModel)]="variantStocks[size]" [name]="'stock-'+size" (ngModelChange)="calculateTotalStock()" class="w-full bg-transparent border-none outline-none text-right text-sm font-bold" placeholder="0">
                              </div>
                           </div>
                           <p class="text-[10px] text-muted-foreground italic">* Mettez le stock à 0 pour afficher la taille en "rupture de stock".</p>
                        </div>

                        <!-- Stock for each color -->
                        <div *ngIf="selectedColors.length > 0" class="space-y-3 pt-4 border-t border-border/50">
                           <label class="text-xs font-bold text-muted-foreground">Stock pour chaque couleur :</label>
                           <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <div *ngFor="let col of selectedColors" class="flex items-center gap-2 bg-muted/10 border border-border p-2 rounded-xl">
                                 <span class="text-[10px] font-black w-12 truncate text-primary uppercase">{{ col }}</span>
                                 <input type="number" [(ngModel)]="colorStocks[col]" [name]="'cstock-'+col" (ngModelChange)="calculateTotalStock()" class="w-full bg-transparent border-none outline-none text-right text-sm font-bold" placeholder="0">
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <!-- Image Section -->
                  <div class="space-y-2">
                     <label class="text-sm font-bold text-foreground ml-1">Image (URL ou Fichier)</label>
                     <div class="flex items-center gap-4">
                        <input type="text" [(ngModel)]="newImageUrl" name="imgUrl" class="flex-1 h-12 px-4 bg-muted/20 border border-border focus:border-primary rounded-xl text-sm font-medium transition-all outline-none" placeholder="https://...">
                        <span class="text-xs font-black text-muted-foreground">OU</span>
                        <div class="relative">
                           <input type="file" (change)="onFileSelected($event)" class="absolute inset-0 opacity-0 cursor-pointer z-10">
                           <button type="button" class="h-12 px-6 bg-muted/30 hover:bg-muted/50 text-green-600 font-bold rounded-xl transition-all flex items-center gap-2">
                              Choisir un fichier
                           </button>
                        </div>
                        <div *ngIf="isUploading" class="animate-spin text-primary">
                           <lucide-icon [img]="Loader2Icon" [size]="20"></lucide-icon>
                        </div>
                     </div>
                  </div>
               </form>
            </div>
            <div class="p-6 bg-white border-t border-border flex items-center justify-end gap-4">
               <button type="button" (click)="closeAddModal(); $event.stopPropagation(); cdr.detectChanges()" class="px-8 py-3 font-bold text-sm hover:bg-muted rounded-2xl transition-all cursor-pointer">Cancel</button>
               <button type="button" (click)="submitNewProduct(); cdr.detectChanges()" [disabled]="addingProduct || isUploading" class="px-10 h-14 bg-green-500 text-white font-black uppercase text-sm tracking-tighter rounded-2xl shadow-lg hover:bg-green-600 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer">
                  <lucide-icon *ngIf="addingProduct" [img]="Loader2Icon" [size]="18" class="animate-spin"></lucide-icon>
                  {{ editingId ? 'Enregistrer les modifications' : 'Add le produit' }}
               </button>
            </div>
         </div>
      </div>

      <!-- Floating Mobile Cart Button -->
      <button 
        *ngIf="cartItemCount > 0"
        type="button"
        (click)="isCartOpen = true; cdr.detectChanges()" 
        class="md:hidden fixed bottom-24 right-6 h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center z-40 hover:scale-105 transition-transform cursor-pointer">
        <lucide-icon [img]="ShoppingCartIcon" [size]="24"></lucide-icon>
        <span class="absolute top-0 right-0 translate-x-1 -translate-y-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-primary">{{ cartItemCount }}</span>
      </button>

      <!-- Cart Drawer Overlay -->
      <div *ngIf="isCartOpen" (click)="isCartOpen = false; cdr.detectChanges()" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] animate-in fade-in transition-all"></div>
      
      <!-- Cart Drawer Panel -->
      <div *ngIf="isCartOpen" class="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-card border-l border-border shadow-2xl z-[101] flex flex-col animate-in slide-in-from-right transition-all duration-300">
        <div class="flex items-center justify-between p-6 border-b border-border">
           <div class="flex items-center gap-3">
              <div class="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary"><lucide-icon [img]="ShoppingCartIcon" [size]="20"></lucide-icon></div>
              <h2 class="text-xl font-bold">My Cart</h2>
           </div>
           <button type="button" (click)="isCartOpen = false; cdr.detectChanges()" class="h-10 w-10 bg-muted/50 rounded-full flex items-center justify-center hover:bg-muted cursor-pointer"><lucide-icon [img]="XIcon" [size]="20"></lucide-icon></button>
        </div>
        <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
           <div *ngIf="!cart || !cart.items || cart.items.length === 0" class="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
              <p>Your cart is empty.</p>
              <button type="button" (click)="isCartOpen = false; cdr.detectChanges()" class="px-6 py-2 bg-primary text-primary-foreground rounded-xl mt-2 font-medium cursor-pointer">Continue Shopping</button>
           </div>
           <div *ngFor="let item of cart?.items" class="flex gap-4 bg-muted/20 p-3 rounded-2xl border border-border/50 relative group">
              <div class="h-20 w-20 bg-card rounded-xl border border-border/50 overflow-hidden shrink-0"><img *ngIf="item.productImage" [src]="item.productImage" class="object-cover h-full w-full"></div>
              <div class="flex flex-col flex-1 py-1">
                <h4 class="font-bold text-sm line-clamp-2 leading-tight pr-6">{{ item.productName }}</h4>
                <div class="flex items-center gap-3 mt-2 mb-auto">
                   <button type="button" (click)="decreaseQuantity(item); cdr.detectChanges()" class="h-7 w-7 rounded-md bg-background border border-border flex items-center justify-center hover:bg-muted cursor-pointer">-</button>
                   <span class="text-sm font-bold w-4 text-center">{{ item.quantity }}</span>
                   <button type="button" (click)="increaseQuantity(item); cdr.detectChanges()" class="h-7 w-7 rounded-md bg-background border border-border flex items-center justify-center hover:bg-muted cursor-pointer">+</button>
                </div>
                <div class="font-black text-primary mt-1">{{ formatPrice(item.price * item.quantity) }}</div>
              </div>
              <button type="button" (click)="removeFromCart(item.id); cdr.detectChanges()" class="absolute top-3 right-3 text-muted-foreground hover:text-destructive p-1 bg-card rounded-full cursor-pointer"><lucide-icon [img]="XIcon" [size]="16"></lucide-icon></button>
           </div>
        </div>
        <div *ngIf="cart?.items?.length > 0" class="p-6 border-t border-border bg-card">
           <div class="flex items-center justify-between mb-4"><span class="text-muted-foreground">Total to pay</span><span class="text-2xl font-black">{{ formatPrice(cartTotal) }}</span></div>
           <button type="button" (click)="openCheckout(); cdr.detectChanges()" class="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all cursor-pointer">Checkout now <lucide-icon [img]="ArrowRightIcon" [size]="20"></lucide-icon></button>
        </div>
      </div>

      <div *ngIf="isCheckoutOpen" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
         <div class="absolute inset-0 bg-black/60 backdrop-blur-md" (click)="isCheckoutOpen = false; cdr.detectChanges()"></div>
         <div class="relative bg-card border border-border shadow-[0_0_50px_rgba(0,0,0,0.3)] rounded-[2rem] w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div class="flex items-center justify-between p-8 border-b border-border bg-white relative z-10">
               <h2 class="text-2xl font-black">Finalize Order</h2>
               <button type="button" (click)="isCheckoutOpen = false; cdr.detectChanges()" class="h-10 w-10 bg-muted/50 rounded-full flex items-center justify-center hover:bg-muted cursor-pointer transition-all active:scale-90"><lucide-icon [img]="XIcon" [size]="20"></lucide-icon></button>
            </div>
            
            <div class="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-white">
               <!-- Delivery Information -->
               <div class="space-y-6">
                  <h3 class="font-bold text-foreground border-b border-border pb-3">Delivery Information</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div class="space-y-2">
                        <label class="text-sm font-bold text-foreground ml-1">Full Name</label>
                        <input type="text" [(ngModel)]="checkoutData.clientName" class="w-full h-12 px-4 bg-muted/20 border border-border focus:border-primary rounded-xl text-sm font-medium transition-all outline-none" placeholder="ibtihel baccari">
                     </div>
                     <div class="space-y-2">
                        <label class="text-sm font-bold text-foreground ml-1">Phone Number</label>
                        <input type="text" [(ngModel)]="checkoutData.clientPhone" class="w-full h-12 px-4 bg-muted/20 border border-border focus:border-primary rounded-xl text-sm font-medium transition-all outline-none" placeholder="94385191">
                     </div>
                  </div>
                  <div class="space-y-2">
                     <label class="text-sm font-bold text-foreground ml-1">Full Address</label>
                     <input type="text" [(ngModel)]="checkoutData.clientAddress" (ngModelChange)="onAddressChange()" class="w-full h-12 px-4 bg-muted/20 border border-border focus:border-primary rounded-xl text-sm font-medium transition-all outline-none" placeholder="sfax">
                  </div>
                  <div class="grid grid-cols-2 gap-6">
                     <div class="space-y-2">
                        <label class="text-sm font-bold text-foreground ml-1">Postal Code</label>
                        <input type="text" [(ngModel)]="checkoutData.clientPostalCode" class="w-full h-12 px-4 bg-muted/20 border border-border focus:border-primary rounded-xl text-sm font-medium transition-all outline-none">
                     </div>
                     <div class="space-y-2">
                        <label class="text-sm font-bold text-foreground ml-1">City / Governorate</label>
                        <select [(ngModel)]="checkoutData.clientCity" (change)="onAddressChange()" class="w-full h-12 px-4 bg-muted/20 border border-border focus:border-primary rounded-xl text-sm font-medium transition-all outline-none appearance-none">
                           <option *ngFor="let gov of governorates" [value]="gov.name">{{ gov.name }}</option>
                        </select>
                     </div>
                  </div>
               </div>

               <!-- Delivery Mode -->
               <div class="space-y-6">
                  <h3 class="font-bold text-foreground border-b border-border pb-3">Delivery Mode</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div (click)="checkoutData.deliveryMode = 'LIVRAISON_DOMICILE'; onAddressChange()" 
                        class="flex items-center gap-4 p-5 border rounded-2xl cursor-pointer transition-all group"
                        [class.border-green-500]="checkoutData.deliveryMode === 'LIVRAISON_DOMICILE'"
                        [class.bg-green-500/5]="checkoutData.deliveryMode === 'LIVRAISON_DOMICILE'">
                        <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                           [class.border-green-500]="checkoutData.deliveryMode === 'LIVRAISON_DOMICILE'"
                           [class.border-muted-foreground/30]="checkoutData.deliveryMode !== 'LIVRAISON_DOMICILE'">
                           <div *ngIf="checkoutData.deliveryMode === 'LIVRAISON_DOMICILE'" class="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div class="flex flex-col">
                           <span class="font-bold text-sm">Home Delivery</span>
                           <span class="text-[10px] font-bold" [class.text-green-600]="cartTotal >= 300" [class.text-muted-foreground]="cartTotal < 300">
                              {{ cartTotal >= 300 ? 'Free (Order >= 300 DT)' : backendDeliveryFee + ',000 DT Fee' }}
                           </span>
                        </div>
                     </div>
                     <div (click)="checkoutData.deliveryMode = 'RETRAIT_MAGASIN'; onAddressChange()" 
                        class="flex items-center gap-4 p-5 border rounded-2xl cursor-pointer transition-all group"
                        [class.border-green-500]="checkoutData.deliveryMode === 'RETRAIT_MAGASIN'"
                        [class.bg-green-500/5]="checkoutData.deliveryMode === 'RETRAIT_MAGASIN'">
                        <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                           [class.border-green-500]="checkoutData.deliveryMode === 'RETRAIT_MAGASIN'"
                           [class.border-muted-foreground/30]="checkoutData.deliveryMode !== 'RETRAIT_MAGASIN'">
                           <div *ngIf="checkoutData.deliveryMode === 'RETRAIT_MAGASIN'" class="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div class="flex flex-col">
                           <span class="font-bold text-sm">Store Pickup</span>
                           <span class="text-[10px] font-bold text-muted-foreground">Free</span>
                        </div>
                     </div>
                  </div>
               </div>

               <!-- Payment Mode -->
               <div class="space-y-6">
                  <h3 class="font-bold text-foreground border-b border-border pb-3">Payment</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div (click)="checkoutData.paymentMode = 'ESPECE'" 
                        class="flex items-center gap-4 p-5 border rounded-2xl cursor-pointer transition-all group"
                        [class.border-green-500]="checkoutData.paymentMode === 'ESPECE'"
                        [class.bg-green-500/5]="checkoutData.paymentMode === 'ESPECE'">
                        <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                           [class.border-green-500]="checkoutData.paymentMode === 'ESPECE'"
                           [class.border-muted-foreground/30]="checkoutData.paymentMode !== 'ESPECE'">
                           <div *ngIf="checkoutData.paymentMode === 'ESPECE'" class="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div class="flex flex-col">
                           <span class="font-bold text-sm">{{ checkoutData.deliveryMode === 'RETRAIT_MAGASIN' ? 'Cash in Store' : 'Cash on Delivery' }}</span>
                           <span class="text-[10px] font-bold text-muted-foreground uppercase">{{ checkoutData.deliveryMode === 'RETRAIT_MAGASIN' ? 'Espece en magasin' : 'Espece à la livraison' }}</span>
                        </div>
                     </div>
                     <div (click)="checkoutData.paymentMode = 'CARTE'" 
                        class="flex items-center gap-4 p-5 border rounded-2xl cursor-pointer transition-all group"
                        [class.border-green-500]="checkoutData.paymentMode === 'CARTE'"
                        [class.bg-green-500/5]="checkoutData.paymentMode === 'CARTE'">
                        <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                           [class.border-green-500]="checkoutData.paymentMode === 'CARTE'"
                           [class.border-muted-foreground/30]="checkoutData.paymentMode !== 'CARTE'">
                           <div *ngIf="checkoutData.paymentMode === 'CARTE'" class="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div class="flex flex-col">
                           <span class="font-bold text-sm">Credit Card</span>
                           <span class="text-[10px] font-bold text-muted-foreground uppercase">Paiement sécurisé</span>
                        </div>
                     </div>
                  </div>

                  <!-- Card Fields -->
                  <div *ngIf="checkoutData.paymentMode === 'CARTE'" class="p-6 bg-muted/20 rounded-2xl border border-border space-y-4 animate-in slide-in-from-top-2">
                     <div class="space-y-2">
                        <label class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Card Number</label>
                        <input type="text" [(ngModel)]="checkoutData.cardNumber" name="cnum" class="w-full h-12 px-4 bg-white border border-border focus:border-primary rounded-xl text-sm font-medium transition-all outline-none" placeholder="xxxx xxxx xxxx xxxx">
                     </div>
                     <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                           <label class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Expiry Date</label>
                           <input type="text" [(ngModel)]="checkoutData.expiryDate" name="exp" class="w-full h-12 px-4 bg-white border border-border focus:border-primary rounded-xl text-sm font-medium transition-all outline-none" placeholder="MM/YY">
                        </div>
                        <div class="space-y-2">
                           <label class="text-xs font-bold text-muted-foreground uppercase tracking-wider">CVV</label>
                           <input type="password" [(ngModel)]="checkoutData.cvv" name="cvv" class="w-full h-12 px-4 bg-white border border-border focus:border-primary rounded-xl text-sm font-medium transition-all outline-none" placeholder="xxx">
                        </div>
                     </div>
                  </div>
               </div>

               <!-- Promo Code -->
               <div class="space-y-6">
                  <h3 class="font-bold text-foreground border-b border-border pb-3">Promo Code</h3>
                  <div class="flex items-center gap-3">
                     <input type="text" [(ngModel)]="promoCodeInput" name="promo" class="flex-1 h-12 px-4 bg-muted/20 border border-border focus:border-primary rounded-xl text-sm font-medium transition-all outline-none" placeholder="ENTER PROMO CODE">
                     <button type="button" (click)="applyPromoCode()" class="h-12 px-8 bg-green-500 text-white font-black rounded-xl hover:bg-green-600 transition-all active:scale-95 text-xs uppercase cursor-pointer">Apply</button>
                  </div>
               </div>
            </div>

            <!-- Footer Details -->
            <div class="p-8 border-t border-border bg-white shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] relative z-10">
               <div class="space-y-3 mb-6">
                  <div class="flex items-center justify-between text-sm font-bold text-muted-foreground/60">
                     <span>Subtotal</span>
                     <span>{{ formatPrice(cartTotal) }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm font-bold text-muted-foreground/60">
                     <span>Delivery Fee</span>
                     <span>+ {{ formatPrice(checkoutDeliveryFee) }}</span>
                  </div>
               </div>
               <div class="flex items-center justify-between mb-8">
                  <span class="text-xl font-black">Final Total</span>
                  <div class="flex flex-col items-end">
                     <span class="text-3xl font-black text-green-500">{{ formatPrice(finalTotal) }}</span>
                     <span *ngIf="isCalculatingFee" class="text-[10px] text-green-600 animate-pulse font-bold uppercase tracking-widest">Calculating fee...</span>
                  </div>
               </div>
               <button type="button" (click)="confirmCheckout(); cdr.detectChanges()" class="w-full h-16 bg-green-500 text-white font-black uppercase text-sm tracking-tighter rounded-2xl shadow-xl shadow-green-500/20 hover:bg-green-600 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer">
                  <lucide-icon [img]="ShoppingCartIcon" [size]="20"></lucide-icon>
                  Confirm Order
               </button>
            </div>
         </div>
      </div>


      <!-- Orders Tracker -->
      <div *ngIf="isOrdersOpen" class="fixed inset-0 z-[120] flex justify-end">
         <div class="absolute inset-0 bg-background/80 backdrop-blur-sm" (click)="isOrdersOpen = false; cdr.detectChanges()"></div>
         <div class="relative w-full max-w-md bg-card h-full shadow-2xl flex flex-col animate-in slide-in-from-right border-l border-border">
            <div class="flex items-center justify-between p-6 border-b border-border bg-card/50 backdrop-blur-md">
               <h2 class="text-xl font-black">My Orders</h2>
               <button type="button" (click)="isOrdersOpen = false; cdr.detectChanges()" class="p-2 hover:bg-muted rounded-full cursor-pointer"><lucide-icon [img]="XIcon" [size]="20"></lucide-icon></button>
            </div>
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
               <div *ngFor="let order of myOrders" class="p-4 border border-border rounded-2xl bg-background shadow-sm hover:border-primary/30 transition-colors">
                  <div class="flex items-center justify-between mb-3">
                      <div class="text-[10px] font-black text-primary uppercase tracking-wider">#{{ order.orderCode }}</div>
                      <div class="px-3 py-1 text-xs font-black rounded-full border" 
                           [class.bg-yellow-500/10]="order.deliveryStatus === 'PENDING'"
                           [class.text-yellow-600]="order.deliveryStatus === 'PENDING'"
                           [class.bg-green-500/10]="order.deliveryStatus === 'DELIVERED'"
                           [class.text-green-600]="order.deliveryStatus === 'DELIVERED'">
                           {{ order.deliveryStatus }}
                      </div>
                  </div>
                  <div class="text-lg font-black mb-1">{{ formatPrice(order.totalAmount) }}</div>
                  <div class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{{ order.orderDate | date:'medium' }}</div>
               </div>
            </div>
         </div>
      </div>

      <!-- Toast -->
      <div *ngIf="toast" class="fixed bottom-6 right-6 bg-card border border-border rounded-xl px-5 py-4 shadow-2xl flex items-center gap-3 z-[200] animate-in slide-in-from-bottom-5">
        <div class="h-8 w-8 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
           <lucide-icon [img]="CheckIcon" [size]="16"></lucide-icon>
        </div>
        <p class="text-sm font-medium pr-4">{{ toast }}</p>
      </div>

    </div>
  `,
   styles: [`
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;  
      overflow: hidden;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #cbd5e1;
    }
  `]
})
export class SponsorsComponent implements OnInit, OnDestroy {
   readonly ShoppingBagIcon = ShoppingBag;
   readonly ShoppingCartIcon = ShoppingCart;
   readonly Loader2Icon = Loader2;
   readonly SearchIcon = Search;
   readonly ArrowRightIcon = ArrowRight;
   readonly ArrowLeftIcon = ArrowLeft;
   readonly TagIcon = Tag;
   readonly StarIcon = Star;
   readonly XIcon = X;
   readonly HeartIcon = Heart;
   readonly PlusIcon = Plus;
   readonly EditIcon = Edit;
   readonly Trash2Icon = Trash2;
   readonly PackageIcon = Package;
   readonly TruckIcon = Truck;
   readonly CheckIcon = CheckCircle;

   private notificationSubscription: Subscription | null = null;

   categories: Category[] = [];
   products: Product[] = [];

   // AI Recommendation Map: product_id -> {rank, score, priority}
   aiRankMap: Map<number, { rank: number; score: number; priority: string }> = new Map();
   aiFlaskAvailable = false;

   loadingCategories = false;
   loadingProducts = false;
   selectedCategoryId: number | null = null;
   selectedGender: string | null = null;
   addingToCartId: number | null = null;
   toast: string | null = null;

   // Search & Pagination State
   searchKeyword: string = '';
   minPrice: number | null = null;
   maxPrice: number | null = null;
   currentPage: number = 0;
   totalPages: number = 1;
   pageSize: number = 50; 

   // Cart & Favorites State
   isCartOpen = false;
   isCheckoutOpen = false;
   isOrdersOpen = false;
   cart: any = null;
   cartItemCount = 0;
   myOrders: any[] = [];
   favoriteProductIds: Set<number> = new Set();

   // Checkout State
   checkoutData = {
      clientName: '',
      clientAddress: '',
      clientPostalCode: '',
      clientCity: 'Tunis',
      clientPhone: '',
      deliveryMode: 'LIVRAISON_DOMICILE',
      paymentMode: 'ESPECE',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      clientEmail: ''
   };
   promoCodeInput = '';

   governorates = [
      { name: 'Tunis', fee: 3 },
      { name: 'Ariana', fee: 3 },
      { name: 'Ben Arous', fee: 3 },
      { name: 'Manouba', fee: 3 },
      { name: 'Bizerte', fee: 5 },
      { name: 'Nabeul', fee: 5 },
      { name: 'Zaghouan', fee: 5 },
      { name: 'Sousse', fee: 7 },
      { name: 'Kairouan', fee: 7 },
      { name: 'Monastir', fee: 7 },
      { name: 'Mahdia', fee: 7 },
      { name: 'Siliana', fee: 7 },
      { name: 'Béja', fee: 7 },
      { name: 'Sfax', fee: 9 },
      { name: 'Jendouba', fee: 9 },
      { name: 'Le Kef', fee: 9 },
      { name: 'Sidi Bouzid', fee: 9 },
      { name: 'Kasserine', fee: 9 },
      { name: 'Gafsa', fee: 9 },
      { name: 'Gabès', fee: 12 },
      { name: 'Medenine (Jerba)', fee: 12 },
      { name: 'Tataouine', fee: 12 },
      { name: 'Tozeur', fee: 12 },
      { name: 'Kébili', fee: 12 }
   ];

   // Admin Add Product State
   isAddModalOpen = false;
   isEditMode = false;
   addingProduct = false;
   newImageUrl = '';
   isUploading = false;
   editingId: number | null = null;
   newProduct: any = { nom: '', marque: '', description: '', prix: 0, stock: 10, categoryId: null, images: [], status: 'EN_STOCK', variants: [] };

   // Admin Size Selection State
   productType: 'chaussure' | 'vetement' | '' = '';
   productGender: 'homme' | 'femme' | 'enfant' | '' = '';
   selectedSizes: string[] = [];
   selectedColors: string[] = [];
   variantStocks: { [size: string]: number } = {};
   colorStocks: { [color: string]: number } = {};

   // Delivery State
   backendDeliveryFee: number = 7;
   isCalculatingFee: boolean = false;
   private addressSubject = new Subject<string>();

   readonly SIZES_CHAUSSURE_HOMME = ['40', '41', '42', '43', '44', '45'];
   readonly SIZES_CHAUSSURE_FEMME = ['36', '37', '38', '39', '40'];
   readonly SIZES_CHAUSSURE_ENFANT = ['23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35'];
   readonly SIZES_VETEMENT = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
   readonly CLOTHING_COLORS = [
      { name: 'Gris', hex: '#808080' },
      { name: 'Bleu', hex: '#0000FF' },
      { name: 'Noir', hex: '#000000' },
      { name: 'Marron', hex: '#8B4513' },
      { name: 'Blanc', hex: '#FFFFFF' }
   ];

   get availableSizes(): string[] {
      if (this.productType === 'vetement') return this.SIZES_VETEMENT;
      if (this.productType === 'chaussure') {
         if (this.productGender === 'homme') return this.SIZES_CHAUSSURE_HOMME;
         if (this.productGender === 'femme') return this.SIZES_CHAUSSURE_FEMME;
         if (this.productGender === 'enfant') return this.SIZES_CHAUSSURE_ENFANT;
      }
      return [];
   }

   onTypeChange() {
      if (this.isEditMode && this.selectedSizes.length > 0) return;

      if (this.productType !== 'chaussure') {
         this.productGender = '';
      }
      this.selectedSizes = [];
      this.selectedColors = [];
      this.colorStocks = {};
      this.variantStocks = {};
      this.availableSizes.forEach(size => {
         this.selectedSizes.push(size);
         this.variantStocks[size] = (this.newProduct.stock && this.newProduct.stock > 0) ? this.newProduct.stock : 15;
      });

      if (this.productType === 'vetement') {
         this.CLOTHING_COLORS.forEach(col => {
            this.selectedColors.push(col.name);
            this.colorStocks[col.name] = (this.newProduct.stock && this.newProduct.stock > 0) ? this.newProduct.stock : 15;
         });
      }
      this.calculateTotalStock();
      this.cdr.detectChanges();
   }

   onGenderChange() {
      this.selectedSizes = [];
      this.selectedColors = [];
      this.variantStocks = {};
      this.colorStocks = {};

      this.availableSizes.forEach(size => {
         this.selectedSizes.push(size);
         this.variantStocks[size] = (this.newProduct.stock && this.newProduct.stock > 0) ? this.newProduct.stock : 15;
      });

      if (this.productType === 'vetement') {
         this.CLOTHING_COLORS.forEach(col => {
            this.selectedColors.push(col.name);
            this.colorStocks[col.name] = (this.newProduct.stock && this.newProduct.stock > 0) ? this.newProduct.stock : 15;
         });
      }
   }

   toggleColor(colorName: string) {
      const index = this.selectedColors.indexOf(colorName);
      if (index > -1) {
         this.selectedColors.splice(index, 1);
      } else {
         this.selectedColors.push(colorName);
         if (!this.colorStocks[colorName] || this.colorStocks[colorName] === 0) {
            this.colorStocks[colorName] = (this.newProduct.stock > 0) ? this.newProduct.stock : 15;
         }
      }
      this.selectedColors = [...this.selectedColors];
      this.calculateTotalStock();
      this.cdr.detectChanges();
   }

   toggleSize(size: string) {
      const index = this.selectedSizes.indexOf(size);
      if (index > -1) {
         this.selectedSizes.splice(index, 1);
         delete this.variantStocks[size];
      } else {
         this.selectedSizes.push(size);
         if (!this.variantStocks[size] || this.variantStocks[size] === 0) {
            this.variantStocks[size] = (this.newProduct.stock > 0) ? this.newProduct.stock : 15;
         }
      }
      this.selectedSizes = [...this.selectedSizes];
      this.calculateTotalStock();
      this.cdr.detectChanges();
   }

   onFileSelected(event: any) {
      const file: File = event.target.files[0];
      if (file) {
         this.isUploading = true;
         this.cdr.detectChanges();

         const reader = new FileReader();
         reader.onload = (e: any) => {
            this.newImageUrl = e.target.result; // data:image/png;base64,...
            this.isUploading = false;
            this.showToast('Image processed successfully!');
            this.cdr.detectChanges();
         };
         reader.onerror = (error) => {
            console.error('File reading error:', error);
            this.isUploading = false;
            this.showToast('Error reading file');
            this.cdr.detectChanges();
         };
         reader.readAsDataURL(file);
      }
   }

   constructor(
      private productService: ProductService, 
      public cdr: ChangeDetectorRef,
      private realTimeNotifService: RealTimeNotificationService
   ) { }

   get isAdmin(): boolean {
      return localStorage.getItem('user_type') === 'ROLE_ADMIN';
   }

   ngOnInit() {
      this.loadCategories();
      this.loadProducts();
      this.loadCart();
      this.loadFavorites();
      this.loadAIRecommendations();
      this.listenForUpdates();

      // Setup debounced address calculation
      this.addressSubject.pipe(
         debounceTime(400),
         distinctUntilChanged()
      ).subscribe(() => {
         this.calculateBackendDelivery();
      });
   }

   onAddressChange() {
      const full = `${this.checkoutData.clientAddress} ${this.checkoutData.clientCity}`.trim();
      this.addressSubject.next(full);
   }

   loadAIRecommendations() {
      const userIdStr = localStorage.getItem('user_id');
      if (!userIdStr) return;
      const userId = parseInt(userIdStr, 10);
      if (isNaN(userId)) return;

      this.productService.getAIRecommendations(userId, 50).subscribe({
         next: (res) => {
            this.aiFlaskAvailable = res.flask_available ?? false;
            this.aiRankMap.clear();
            (res.ranked_products || []).forEach(r => {
               this.aiRankMap.set(Number(r.product_id), { 
                  rank: r.rank, 
                  score: r.recommendation_score, 
                  priority: r.priority ?? 'Normal' 
               });
            });
            this.sortProductsByAI();
            this.cdr.detectChanges();
         },
         error: (err) => console.warn('AI recommandations non disponibles:', err)
      });
   }

   sortProductsByAI() {
      if (this.aiRankMap.size === 0) return;
      this.products = [...this.products].sort((a, b) => {
         const ra = this.aiRankMap.get(Number(a.id));
         const rb = this.aiRankMap.get(Number(b.id));
         const scoreA = ra ? ra.score : 0;
         const scoreB = rb ? rb.score : 0;
         return scoreB - scoreA; 
      });
   }

   getAIPriority(productId: number | string): string | undefined {
      return this.aiRankMap.get(Number(productId))?.priority;
   }

   getAIScore(productId: number | string): number {
      return this.aiRankMap.get(Number(productId))?.score ?? 0;
   }

   getAIRank(productId: number | string): number {
      return this.aiRankMap.get(Number(productId))?.rank ?? 999;
   }

   isColorOutOfStock(prod: any, colorName: string): boolean {
      if (!prod.variants || prod.variants.length === 0) {
         return prod.stock === 0;
      }
      const variantWithColor = prod.variants.find((v: any) => v.color?.toLowerCase() === colorName.toLowerCase());
      if (!variantWithColor) return true; 
      return variantWithColor.stock === 0;
   }

   loadCart() {
      this.productService.getCart().subscribe({
         next: (res) => {
            this.cart = res;
            this.cartItemCount = res?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
         },
         error: (err) => console.error('Error loading cart', err)
      });
   }

   loadFavorites() {
      this.productService.getMyFavorites().subscribe({
         next: (res) => {
            const favList = res.content || [];
            favList.forEach((fav: any) => {
               if (fav.product && fav.product.id) {
                  this.favoriteProductIds.add(fav.product.id);
               }
            });
         },
         error: (err) => console.error('Error loading favorites', err)
      });
   }

   loadCategories() {
      this.loadingCategories = true;
      this.productService.getCategories().subscribe({
         next: (res: any) => {
            if (res && res.content) {
               this.categories = res.content;
            } else if (Array.isArray(res)) {
               this.categories = res;
            } else {
               this.categories = [];
            }
            this.loadingCategories = false;
         },
         error: (err: any) => {
            console.error('Error loading categories', err);
            this.loadingCategories = false;
         }
      });
   }

   loadProducts() {
      this.loadingProducts = true;
      const failsafe = setTimeout(() => {
         if (this.loadingProducts) {
            this.loadingProducts = false;
            this.cdr.detectChanges();
         }
      }, 10000);

      const keywordToUse = [this.selectedGender, this.searchKeyword].filter(Boolean).join(' ') || null;
      const criteria = {
         categoryId: this.selectedCategoryId,
         keyword: keywordToUse,
         minPrice: this.minPrice,
         maxPrice: this.maxPrice
      };

      this.productService.searchProducts(criteria, this.currentPage, this.pageSize).subscribe({
         next: (res: any) => {
            clearTimeout(failsafe);
            let fetched = res.content || res as any;
            if (!fetched) fetched = [];
            if (res.totalPages !== undefined) this.totalPages = res.totalPages;
            this.products = fetched;
            this.sortProductsByAI();
            this.loadingProducts = false;
            this.cdr.detectChanges();
         },
         error: (err: any) => {
            clearTimeout(failsafe);
            this.loadingProducts = false;
            this.products = [];
            this.cdr.detectChanges();
         }
      });
   }

   selectCategory(categoryId: number | null) {
      this.selectedCategoryId = categoryId;
      this.selectedGender = null;
      this.searchKeyword = '';
      this.minPrice = null;
      this.maxPrice = null;
      this.currentPage = 0;
      this.loadProducts();
   }

   selectGender(genre: string) {
      if (!genre) {
         this.selectedGender = null;
      } else if (this.selectedGender === genre) {
         this.selectedGender = null;
      } else {
         this.selectedGender = genre;
      }
      this.currentPage = 0;
      this.loadProducts();
   }

   applyFilters() {
      this.currentPage = 0;
      this.loadProducts();
   }

   nextPage() {
      if (this.currentPage < this.totalPages - 1) {
         this.currentPage++;
         this.loadProducts();
      }
   }

   prevPage() {
      if (this.currentPage > 0) {
         this.currentPage--;
         this.loadProducts();
      }
   }

   addToCart(product: Product) {
      const status = (product as any).status;
      const isAvailable = !status || status === 'EN_STOCK' || status === 'IN_STOCK' || status === 'EN_STOCK';
      if (product.stock === 0 || !isAvailable) {
         this.showToast('Item currently unavailable');
         return;
      }

      this.addingToCartId = product.id;
      this.productService.addToCart(product.id, 1).subscribe({
         next: () => {
            this.addingToCartId = null;
            this.showToast(`${product.nom} added to cart!`);
            this.loadCart();
         },
         error: (err: any) => {
            this.addingToCartId = null;
            this.showToast("❌ Error adding to cart");
         }
      });
   }

   removeFromCart(itemId: number) {
      this.productService.removeFromCart(itemId).subscribe({
         next: () => {
            this.showToast('Item removed from cart');
            this.loadCart();
         },
         error: (err) => this.showToast('Error during removal')
      });
   }

   isFavorite(productId: number): boolean {
      return this.favoriteProductIds.has(productId);
   }

   toggleFavorite(product: Product) {
      if (this.isFavorite(product.id)) {
         this.favoriteProductIds.delete(product.id);
         this.productService.removeFromFavorites(product.id).subscribe({
            error: () => this.favoriteProductIds.add(product.id)
         });
      } else {
         this.favoriteProductIds.add(product.id);
         this.productService.addToFavorites(product.id).subscribe({
            next: (res) => {
               if (res !== null) this.showToast(`${product.nom} added to wishlist ❤️`);
            },
            error: () => this.favoriteProductIds.delete(product.id)
         });
      }
   }

   get cartTotal(): number {
      if (!this.cart || !this.cart.items) return 0;
      return this.cart.items.reduce((acc: number, item: any) => acc + ((item.price || 0) * item.quantity), 0);
   }

   get checkoutDeliveryFee(): number {
      if (this.checkoutData.deliveryMode !== 'LIVRAISON_DOMICILE') return 0;
      let total = this.cart?.total || this.cartTotal;
      if (total >= 300) return 0;
      return this.backendDeliveryFee;
   }

   get finalTotal(): number {
      let t = this.cart?.total || this.cartTotal;
      return t + this.checkoutDeliveryFee;
   }

   openCheckout() {
      if (this.cartItemCount === 0) return;
      this.isCartOpen = false;
      this.isCheckoutOpen = true;
      this.backendDeliveryFee = 7;
   }

   calculateBackendDelivery() {
      const fullLocation = `${this.checkoutData.clientAddress} ${this.checkoutData.clientCity}`.trim();
      if (fullLocation.length < 3) return;

      this.isCalculatingFee = true;
      this.productService.calculateDeliveryFee(fullLocation).subscribe({
         next: (fee) => {
            this.backendDeliveryFee = fee;
            this.isCalculatingFee = false;
            this.cdr.detectChanges();
         },
         error: (err) => {
            this.isCalculatingFee = false;
            this.backendDeliveryFee = 7; 
         }
      });
   }

   confirmCheckout() {
      if (!this.checkoutData.clientName || !this.checkoutData.clientAddress || !this.checkoutData.clientPhone || !this.checkoutData.clientPostalCode || !this.checkoutData.clientCity) {
         this.showToast('Please fill in your delivery information');
         return;
      }
      this.productService.checkoutCart(this.checkoutData).subscribe({
         next: () => {
            this.showToast('Order confirmed successfully 🎉');
            this.isCheckoutOpen = false;
            this.loadCart();
            this.openOrders();
         },
         error: (err: any) => this.showToast('Error validating the order')
      });
   }

   openOrders() {
      this.isOrdersOpen = true;
      this.productService.getMyOrders().subscribe({
         next: (data) => this.myOrders = data || [],
         error: () => console.error('Error retrieving orders')
      });
   }

   formatPrice(price: number): string {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(price).replace('TND', 'DT');
   }

   openAddModal() {
      this.editingId = null;
      this.newProduct = {
         nom: '', marque: '', description: '', prix: 0, stock: 10,
         categoryId: this.selectedCategoryId || (this.categories && this.categories.length > 0 && this.categories[0].id ? this.categories[0].id : null),
         images: [], status: 'EN_STOCK', variants: []
      };
      this.newImageUrl = '';
      this.productType = '';
      this.productGender = '';
      this.selectedSizes = [];
      this.selectedColors = [];
      this.variantStocks = {};
      this.colorStocks = {};
      this.isEditMode = false;
      this.isAddModalOpen = true;
   }

   closeAddModal() {
      this.isAddModalOpen = false;
      this.editingId = null;
      this.isEditMode = false;
      this.cdr.detectChanges();
   }

   editProduct(product: Product) {
      this.editingId = product.id;
      this.isEditMode = true;
      this.isAddModalOpen = true;
      
      // Auto-detect product type based on category
      const catName = (product.category?.nom || product.category?.name || '').toLowerCase();
      if (catName.includes('shoe') || catName.includes('chaussure') || catName.includes('crampon') || catName.includes('basket')) {
         this.productType = 'chaussure';
      } else if (catName.includes('cloth') || catName.includes('vêtement') || catName.includes('habit') || catName.includes('pull')) {
         this.productType = 'vetement';
      } else {
         this.productType = '';
      }

      this.productService.getProductById(product.id).subscribe({
         next: (fullProduct: Product) => {
            this.newProduct = {
               nom: fullProduct.nom || product.nom || '',
               marque: fullProduct.marque || product.marque || '',
               description: fullProduct.description || product.description || '',
               prix: fullProduct.prix || product.prix || 0,
               stock: fullProduct.stock ?? product.stock ?? 0,
               categoryId: fullProduct.category?.id || product.category?.id,
               images: [...(fullProduct.images || [])],
               status: fullProduct.status || 'EN_STOCK',
               variants: fullProduct.variants || []
            };
            this.newImageUrl = (this.newProduct.images.length > 0) ? this.newProduct.images[0] : '';
            
            // Auto-detect gender if it's a shoe
            if (this.productType === 'chaussure' && fullProduct.variants && fullProduct.variants.length > 0) {
               const firstSize = fullProduct.variants[0].size;
               if (firstSize) {
                  if (this.SIZES_CHAUSSURE_HOMME.includes(firstSize)) this.productGender = 'homme';
                  else if (this.SIZES_CHAUSSURE_FEMME.includes(firstSize)) this.productGender = 'femme';
                  else if (this.SIZES_CHAUSSURE_ENFANT.includes(firstSize)) this.productGender = 'enfant';
               }
            }

            this.autoDetectSizesFromVariants();
            this.calculateTotalStock();
            this.cdr.detectChanges();
         }
      });
   }

   autoDetectSizesFromVariants() {
      this.selectedSizes = [];
      this.selectedColors = [];
      this.variantStocks = {};
      this.colorStocks = {};
      
      if (this.newProduct.variants && this.newProduct.variants.length > 0) {
         this.newProduct.variants.forEach((v: any) => {
            if (v.size && v.size !== 'null') {
               if (!this.selectedSizes.includes(v.size)) this.selectedSizes.push(v.size);
               this.variantStocks[v.size] = Math.max(this.variantStocks[v.size] || 0, v.stock || 0);
            }
            if (v.color && v.color !== 'null') {
               const standard = this.CLOTHING_COLORS.find(c => c.name.toLowerCase() === v.color.toLowerCase());
               const colorKey = standard ? standard.name : v.color;
               if (!this.selectedColors.includes(colorKey)) this.selectedColors.push(colorKey);
               this.colorStocks[colorKey] = Math.max(this.colorStocks[colorKey] || 0, v.stock || 0);
            }
         });
      }
   }

   deleteProduct(id: number) {
      if (confirm('Are you sure you want to delete this product?')) {
         this.productService.deleteProduct(id).subscribe({
            next: () => {
               this.showToast('Product deleted successfully');
               this.loadProducts();
            }
         });
      }
   }

   submitNewProduct() {
      if (!this.newProduct.nom || !this.newProduct.description || this.newProduct.prix <= 0 || !this.newProduct.categoryId) {
         alert("Please fill all required fields correctly.");
         return;
      }

      if (this.newImageUrl) this.newProduct.images = [this.newImageUrl];

      if (this.selectedSizes.length > 0 || this.selectedColors.length > 0) {
         const newVariants: any[] = [];
         const sizes = this.selectedSizes.length > 0 ? this.selectedSizes : ['Unique'];
         const colors = this.selectedColors.length > 0 ? this.selectedColors : [''];

         sizes.forEach(size => {
            colors.forEach(color => {
               const sStock = Number(this.variantStocks[size] || 0);
               const cStock = Number(this.colorStocks[color] || 0);
               const finalStock = (size !== 'Unique' && color !== '') ? Math.min(sStock, cStock) : Math.max(sStock, cStock);
               
               newVariants.push({
                  size: size,
                  color: color,
                  sku: (this.newProduct.nom.replace(/\s+/g, '-').toUpperCase() + '-' + size + '-' + (color || 'U') + '-' + Math.floor(Math.random() * 1000)),
                  stock: finalStock,
                  priceAdjustment: 0
               });
            });
         });
         this.newProduct.variants = newVariants;
         this.newProduct.stock = newVariants.reduce((sum, v) => sum + v.stock, 0);
      }

      this.addingProduct = true;
      const obs = this.editingId
         ? this.productService.updateProduct(this.editingId, this.newProduct)
         : this.productService.createProduct(this.newProduct);

      obs.subscribe({
         next: () => {
            this.addingProduct = false;
            this.closeAddModal();
            this.showToast('Product saved successfully!');
            
            // Recharger les produits et forcer la détection de changements
            this.loadProducts();
            this.cdr.detectChanges();
         },
         error: (err) => {
            this.addingProduct = false;
            console.error('Error saving product:', err);
            this.showToast('❌ Error saving product');
            this.cdr.detectChanges();
         }
      });
   }

   decreaseQuantity(item: any) {
      if (item.quantity > 1) {
         item.quantity--;
         this.productService.updateCartItem(item.id, item.quantity).subscribe({
            next: () => this.loadCart()
         });
      } else {
         this.removeFromCart(item.id);
      }
   }

   increaseQuantity(item: any) {
      item.quantity++;
      this.productService.updateCartItem(item.id, item.quantity).subscribe({
         next: () => this.loadCart(),
         error: () => {
            item.quantity--;
            this.showToast("Insufficient stock");
         }
      });
   }

   showToast(msg: string) {
      this.toast = msg;
      this.cdr.detectChanges();
      setTimeout(() => {
         this.toast = null;
         this.cdr.detectChanges();
      }, 3000);
   }

   listenForUpdates(): void {
      this.notificationSubscription = this.realTimeNotifService.messages$.subscribe(msg => {
         if (msg && (msg.type === 'ORDER_UPDATE' || msg.type === 'PRODUCT_UPDATE' || msg.type === 'LOW_STOCK')) {
            this.loadProducts(); 
            this.loadCart();
         }
      });
   }

   applyPromoCode() {
      if (!this.promoCodeInput.trim()) {
         this.showToast('Please enter a promo code');
         return;
      }
      this.showToast('Applying promo code...');
      setTimeout(() => {
         this.showToast('Promo code applied successfully! 🎉');
         this.cdr.detectChanges();
      }, 1000);
   }

   ngOnDestroy(): void {
      if (this.notificationSubscription) this.notificationSubscription.unsubscribe();
   }

   calculateTotalStock() {
      let total = 0;
      if (this.selectedSizes.length > 0) {
         Object.values(this.variantStocks).forEach(v => total += (Number(v) || 0));
      } else if (this.selectedColors.length > 0) {
         Object.values(this.colorStocks).forEach(v => total += (Number(v) || 0));
      }
      this.newProduct.stock = total;
   }
}
