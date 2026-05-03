import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
   LucideAngularModule, ShoppingBag, ShoppingCart, Loader2,
   Search, ArrowRight, ArrowLeft, Tag, Star, X, Heart, Plus, Edit, Trash2, Package, Truck, CheckCircle
} from 'lucide-angular';
import { ProductService, Product, Category, ProductRequest } from '../services/product.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
   selector: 'app-sponsors',
   standalone: true,
   imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
   template: `
    <div class="min-h-screen bg-background font-sans pb-20">
      
 
      <div class="bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold text-center py-2.5 uppercase tracking-widest relative z-20 shadow-md">
        Livraison gratuite dès 300DT d'achat &nbsp;|&nbsp; Retours gratuits sous 30 jours
      </div>

   
      <div class="bg-card sticky top-0 z-40 shadow-sm border-b border-border">
        <div class="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <h1 class="text-xl sm:text-3xl font-black tracking-tighter uppercase text-foreground">STREETLEAGUE</h1>
          
          <div class="flex-1 max-w-xl mx-4 relative hidden md:block">
             <input type="text" [(ngModel)]="searchKeyword" (keyup.enter)="applyFilters()" placeholder="Search items, sports..." class="w-full h-10 bg-muted/50 rounded-full pl-5 pr-14 text-sm focus:outline-none focus:ring-2 ring-primary/50 transition-all border border-border focus:border-primary">
             <button (click)="applyFilters()" class="absolute right-0 top-0 h-10 w-12 bg-primary text-primary-foreground rounded-r-full flex items-center justify-center hover:opacity-90 transition-colors">
               <lucide-icon [img]="SearchIcon" [size]="16"></lucide-icon>
             </button>
          </div>

          <div class="flex items-center gap-4 sm:gap-6">
             <a *ngIf="isAdmin" routerLink="/app/admin/orders" title="Admin Orders" class="relative group cursor-pointer hover:text-primary transition-colors text-foreground">
                <lucide-icon [img]="PackageIcon" [size]="20"></lucide-icon>
             </a>
             <button *ngIf="isAdmin" (click)="openAddModal()" title="Add Product" class="relative group cursor-pointer hover:opacity-70 transition-opacity">
                <lucide-icon [img]="PlusIcon" [size]="20" class="text-primary"></lucide-icon>
             </button>
             <button (click)="openOrders()" class="hidden sm:block text-[11px] font-bold uppercase tracking-wider hover:text-primary transition-colors text-foreground">
                My Orders
             </button>
             <button (click)="isCartOpen = true" class="relative group cursor-pointer hover:text-primary transition-colors text-foreground">
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
                <button (click)="applyFilters()" class="absolute right-0 top-0 h-10 w-12 bg-primary text-primary-foreground rounded-r-full flex items-center justify-center">
                  <lucide-icon [img]="SearchIcon" [size]="16"></lucide-icon>
                </button>
             </div>
        </div>
      </div>

      <div class="bg-background">
        
        <div *ngIf="!loadingCategories && categories.length > 0" class="py-6 px-4 bg-card border-b border-border overflow-x-auto hide-scrollbar relative z-30 pointer-events-auto">
          <div class="container mx-auto flex gap-6 lg:gap-10 justify-start min-w-max">
            <button (click)="selectCategory(null)" class="flex flex-col items-center gap-2 group flex-shrink-0">
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-border p-1 group-hover:border-primary transition-colors" [class.border-primary]="selectedCategoryId === null" [class.ring-2]="selectedCategoryId === null" [class.ring-primary]="selectedCategoryId === null">
                <div class="w-full h-full bg-gradient-to-br from-primary/10 to-accent/20 rounded-full flex items-center justify-center text-2xl shadow-inner">✨</div>
              </div>
              <span class="text-[11px] sm:text-[12px] font-bold text-muted-foreground pb-1" [class.text-primary]="selectedCategoryId === null && selectedGender === null" [class.border-b-2]="selectedCategoryId === null && selectedGender === null" [class.border-primary]="selectedCategoryId === null && selectedGender === null">TRENDING</span>
            </button>


            
            <button *ngFor="let cat of categories; let i = index" (click)="selectCategory(cat.id!)" class="flex flex-col items-center gap-2 group flex-shrink-0">
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
           <div *ngIf="selectedCategoryId === null" class="w-full h-[250px] sm:h-[400px] bg-gradient-to-r from-primary to-accent rounded-2xl mb-10 overflow-hidden relative group cursor-pointer shadow-lg border border-border">
             <img src="https://images.unsplash.com/photo-1556817411-31ae72fa3ea8?q=80&w=2000&auto=format&fit=crop" class="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000">
             <div class="absolute inset-x-6 sm:inset-x-12 bottom-8 sm:bottom-12 z-10 text-white">
                <div class="text-[10px] font-black tracking-[0.3em] mb-2 uppercase text-white/80">SUMMER COLLECTION 2026</div>
                <h2 class="text-3xl sm:text-6xl font-black uppercase tracking-tighter leading-none mb-6">Gear up for action!</h2>
                <div class="inline-flex bg-card text-foreground text-xs font-bold px-8 py-3.5 rounded-full hover:bg-white hover:text-black transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">DISCOVER OFFERS &rarr;</div>
             </div>
           </div>

           <div *ngIf="selectedCategoryId !== null" class="flex flex-col gap-4 mb-6 relative z-30 pointer-events-auto">
              
              <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                 <button 
                   (click)="selectGender('')" 
                   class="px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border cursor-pointer relative z-30"
                   [ngClass]="!selectedGender ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary'">
                   SEE ALL
                 </button>
                 <button 
                   *ngFor="let g of ['Men', 'Women', 'Kids', 'Accessories']"
                   (click)="selectGender(g)" 
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
                 <button (click)="applyFilters()" class="h-9 px-6 bg-primary text-primary-foreground font-bold rounded-lg shrink-0 uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer">Filter</button>
                 <button *ngIf="isAdmin" (click)="openAddModal()" class="h-9 px-4 bg-accent text-accent-foreground font-bold rounded-lg shrink-0 uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 ml-2 relative z-30">
                    <lucide-icon [img]="PlusIcon" [size]="14"></lucide-icon> Add
                 </button>
              </div>
           </div>

           <div class="mb-6 flex items-center justify-between">
              <h2 class="text-xl sm:text-2xl font-black uppercase tracking-tighter text-foreground flex items-center gap-2">
                 {{ selectedCategoryId === null ? 'Great Deals' : 'SELECTION' }}
                 <span *ngIf="selectedCategoryId === null" class="text-destructive">🔥</span>
              </h2>
              <div class="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">{{ products.length }} Items</div>
           </div>



            <div *ngIf="!loadingProducts && products.length === 0" class="bg-white border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center py-24 text-center px-4">
               <div class="text-5xl mb-4 opacity-50">📭</div>
               <h3 class="text-lg font-black mb-1 uppercase tracking-tighter">No items found</h3>
               <p class="text-gray-500 text-sm">We have no matching products.</p>
            </div>

           <div *ngIf="!loadingProducts && products.length > 0" class="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
              
              <div *ngFor="let prod of products" class="group relative flex flex-col bg-white hover:z-10 rounded-sm">
                 <a *ngIf="!isAdmin" [routerLink]="['/app/sponsors', prod.id]" class="absolute inset-0 z-10"></a>

                 <div class="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden isolate">
                    <img *ngIf="prod.images && prod.images.length > 0" [src]="prod.images[0]" [alt]="prod.nom" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                    <div *ngIf="!prod.images || prod.images.length === 0" class="flex items-center justify-center w-full h-full text-5xl opacity-10">🛍️</div>
                    
                    <button 
                       *ngIf="!isAdmin"
                       (click)="addToCart(prod); $event.stopPropagation()"
                       [disabled]="prod.stock === 0 || ($any(prod).status && $any(prod).status !== 'EN_STOCK' && $any(prod).status !== 'IN_STOCK') || addingToCartId === prod.id"
                       class="absolute bottom-3 left-3 right-3 h-11 bg-primary/95 backdrop-blur-sm text-primary-foreground font-bold text-[11px] uppercase tracking-widest shadow-lg rounded-xl lg:opacity-0 lg:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20 flex items-center justify-center disabled:opacity-50 hover:bg-primary hover:shadow-primary/30">
                       <span *ngIf="addingToCartId !== prod.id">{{ prod.stock === 0 ? 'Indisponible' : 'Ajout Rapide' }}</span>
                       <lucide-icon *ngIf="addingToCartId === prod.id" [img]="Loader2Icon" [size]="16" class="animate-spin"></lucide-icon>
                    </button>

                  </div>

                  <div *ngIf="isAdmin" class="absolute bottom-0 left-0 right-0 flex gap-2 p-2" style="z-index:50">
                     <button type="button" (click)="editProduct(prod); $event.stopPropagation(); $event.preventDefault()" class="flex-1 h-10 bg-amber-500 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-xl flex items-center justify-center hover:bg-amber-600 active:scale-95 transition-all" style="position:relative;z-index:50">
                        &#x270F;&#xFE0F; Modifier
                     </button>
                     <button type="button" (click)="deleteProduct(prod.id); $event.stopPropagation(); $event.preventDefault()" class="h-10 w-10 bg-red-600 text-white rounded-xl flex items-center justify-center hover:bg-red-700 active:scale-95 transition-all shadow-xl" style="position:relative;z-index:50">
                        &#x1F5D1;&#xFE0F;
                     </button>
                  </div>

                 <button 
                  (click)="toggleFavorite(prod); $event.stopPropagation()"
                  class="absolute top-3 right-3 p-2.5 rounded-full z-20 bg-card shadow-sm hover:scale-110 transition-transform">
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


                 <!-- Info Details -->
                 <div class="py-4 px-4 flex flex-col flex-1">
                    <!-- Color indicator -->
                    <div *ngIf="prod.category?.nom === 'Clothing' || prod.category?.name === 'Clothing'" class="flex gap-1.5 mb-2">
                       <div *ngFor="let col of CLOTHING_COLORS" class="relative group/color">
                          <div [style.background-color]="col.hex" 
                             class="w-3.5 h-3.5 rounded-full border border-border/50 shadow-sm transition-transform group-hover/color:scale-110">
                          </div>
                          <!-- Out of stock indicator (slash) -->
                          <div *ngIf="isColorOutOfStock(prod, col.name)" 
                             class="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <div class="w-[120%] h-[1.5px] bg-red-500 rotate-[45deg] shadow-sm"></div>
                          </div>
                          <!-- Tooltip -->
                          <span class="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover/color:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30 font-bold uppercase tracking-tighter">
                             {{ col.name }}
                          </span>
                       </div>
                    </div>

                    <!-- Title -->
                    <div class="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors">{{ prod.nom }}</div>
                    
                    <!-- Price -->
                    <div class="flex items-center gap-2 mb-2 mt-auto">
                       <span class="text-lg sm:text-xl font-black text-foreground">{{ formatPrice(prod.prix) }}</span>
                    </div>

                    <!-- Category indicator -->
                    <div class="text-[10px] font-bold text-muted-foreground tracking-wider uppercase truncate">{{ prod.category?.nom || prod.category?.name || 'Clothing' }}</div>
                 </div>
              </div>
              
           </div>
 
           <!-- Loading state -->
           <div *ngIf="loadingProducts" class="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
              <lucide-icon [img]="Loader2Icon" [size]="40" class="animate-spin"></lucide-icon>
           </div>

           <!-- Pagination -->
           <div *ngIf="totalPages > 1" class="flex items-center justify-center gap-4 mt-16 mb-8 pt-8 border-t border-border">
             <button (click)="prevPage()" [disabled]="currentPage === 0" class="w-12 h-12 border-2 border-primary rounded-xl flex items-center justify-center text-primary hover:bg-primary/10 disabled:opacity-30 disabled:pointer-events-none transition-colors">
               <lucide-icon [img]="ArrowLeftIcon" [size]="20"></lucide-icon>
             </button>
             <span class="text-xs font-black tracking-[0.2em] uppercase text-foreground">{{ currentPage + 1 }} / {{ totalPages }}</span>
             <button (click)="nextPage()" [disabled]="currentPage >= totalPages - 1" class="w-12 h-12 border-2 border-primary rounded-xl flex items-center justify-center text-primary hover:bg-primary/10 disabled:opacity-30 disabled:pointer-events-none transition-colors">
               <lucide-icon [img]="ArrowRightIcon" [size]="20"></lucide-icon>
             </button>
           </div>
           
        </div>
      </div>

      <!-- Quick Add Product Modal (Admin Only) -->
      <div *ngIf="isAddModalOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
         <div class="absolute inset-0 bg-background/80 backdrop-blur-sm" (click)="closeAddModal()"></div>
         <div class="relative bg-card border border-border shadow-2xl rounded-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
            <div class="flex items-center justify-between mb-6">
               <h2 class="text-xl font-bold">{{ editingId ? 'Modifier le produit' : 'Add un produit' }}</h2>
               <button (click)="closeAddModal()" class="p-2 hover:bg-muted rounded-full transition-colors"><lucide-icon [img]="XIcon" [size]="20"></lucide-icon></button>
            </div>
            <form class="space-y-4">
               <div class="grid grid-cols-2 gap-4">
                  <div>
                     <label class="text-sm font-semibold">Nom</label>
                     <input type="text" [(ngModel)]="newProduct.nom" name="nom" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                  </div>
                  <div>
                     <label class="text-sm font-semibold">Brand</label>
                     <input type="text" [(ngModel)]="newProduct.marque" name="marque" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                  </div>
               </div>
               <div>
                  <label class="text-sm font-semibold">Description</label>
                  <textarea [(ngModel)]="newProduct.description" name="desc" rows="3" class="w-full p-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary"></textarea>
               </div>
              <div class="grid grid-cols-2 gap-4">
                  <div>
                     <label class="text-sm font-semibold">Price (DT)</label>
                     <input type="number" [(ngModel)]="newProduct.prix" name="prix" step="0.01" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                  </div>
                  <div>
                     <label class="text-sm font-semibold">Stock Global</label>
                     <input type="number" [(ngModel)]="newProduct.stock" name="stock" [readonly]="selectedSizes.length > 0 || selectedColors.length > 0" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary disabled:opacity-50" [placeholder]="(selectedSizes.length > 0 || selectedColors.length > 0) ? 'Calculé à partir des variantes' : 'Stock total'">
                  </div>
               </div>
               <div class="grid grid-cols-2 gap-4">
                  <div>
                     <label class="text-sm font-semibold">Category</label>
                     <select [(ngModel)]="newProduct.categoryId" name="catId" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                        <option *ngFor="let cat of categories" [ngValue]="cat.id">{{ cat.nom || cat.name }}</option>
                     </select>
                  </div>
                  <div>
                     <label class="text-sm font-semibold">Status du Produit</label>
                     <select [(ngModel)]="newProduct.status" name="status" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                        <option value="EN_STOCK">EN STOCK</option>
                        <option value="RUPTURE_DE_STOCK">RUPTURE DE STOCK</option>
                        <option value="EN_ARRIVAGE">EN ARRIVAGE</option>
                     </select>
                  </div>
               </div>

               <!-- Sélecteur de Sizes Dynamique -->
               <div class="p-4 bg-muted/20 border border-border rounded-xl space-y-4">
                  <h3 class="text-sm font-bold border-b border-border pb-2">Variantes (Sizes & Pointures)</h3>
                  <div class="grid grid-cols-2 gap-4">
                     <div>
                        <label class="text-xs font-semibold text-muted-foreground">Type d'Article</label>
                        <select [(ngModel)]="productType" (change)="onTypeChange()" name="pType" class="w-full h-9 px-3 mt-1 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary">
                           <option value="">Sélectionner un type...</option>
                           <option value="chaussure">Shoes</option>
                           <option value="vetement">Clothing (Pull, Short, Tenue...)</option>
                        </select>
                     </div>
                     <div *ngIf="productType === 'chaussure'">
                        <label class="text-xs font-semibold text-muted-foreground">Gender</label>
                        <select [(ngModel)]="productGender" (change)="onGenderChange()" name="pGender" class="w-full h-9 px-3 mt-1 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary">
                           <option value="">Sélectionner...</option>
                           <option value="homme">Men</option>
                           <option value="femme">Women</option>
                           <option value="enfant">Kids</option>
                        </select>
                     </div>
                  </div>
                  
                  <div *ngIf="availableSizes.length > 0" class="pt-2">
                     <label class="text-xs font-semibold text-muted-foreground mb-2 block">Cochez les tailles disponibles :</label>
                     <div class="flex flex-wrap gap-2">
                        <button type="button" *ngFor="let size of availableSizes" (click)="toggleSize(size)" 
                           [class.bg-primary]="selectedSizes.includes(size)" [class.text-primary-foreground]="selectedSizes.includes(size)" [class.border-primary]="selectedSizes.includes(size)"
                           class="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-sm font-bold transition-colors hover:border-primary bg-background text-foreground">
                           {{ size }}
                        </button>
                     </div>
                  </div>
                  
                  <!-- Sélecteur de Couleurs (Vetement Only) -->
                  <div *ngIf="productType === 'vetement'" class="pt-4 border-t border-border/30">
                      <label class="text-xs font-semibold text-muted-foreground mb-2 block">Couleurs disponibles :</label>
                      <div class="flex flex-wrap gap-3">
                         <button type="button" *ngFor="let col of CLOTHING_COLORS" (click)="toggleColor(col.name)"
                            class="group relative flex flex-col items-center gap-1">
                            <div [style.background-color]="col.hex" 
                               [class.ring-2]="selectedColors.includes(col.name)"
                               class="w-8 h-8 rounded-full border border-border ring-offset-2 ring-primary transition-all group-hover:scale-110 shadow-sm">
                               <lucide-icon *ngIf="selectedColors.includes(col.name)" [img]="CheckIcon" [size]="14" class="text-white absolute inset-0 m-auto drop-shadow-md"></lucide-icon>
                            </div>
                            <span class="text-[9px] font-bold uppercase" [class.text-primary]="selectedColors.includes(col.name)">{{ col.name }}</span>
                         </button>
                      </div>
                   </div>

                   <div *ngIf="selectedSizes.length > 0" class="mt-4 border-t border-border/50 pt-4">
                      <label class="text-xs font-semibold text-muted-foreground mb-2 block">Stock pour chaque taille :</label>
                      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                         <div *ngFor="let size of selectedSizes" class="flex items-center gap-2 bg-background border border-border rounded-lg px-2 py-1 focus-within:border-primary transition-colors">
                            <span class="text-sm font-bold w-10 text-center text-muted-foreground border-r border-border pr-2">{{ size }}</span>
                            <input type="number" [(ngModel)]="variantStocks[size]" [name]="'stock_'+size" min="0" class="w-full h-8 bg-transparent text-sm focus:outline-none text-right font-bold" placeholder="0">
                         </div>
                      </div>
                      <div class="text-[10px] text-muted-foreground mt-2">
                         * Mettez le stock à 0 pour afficher la taille en "rupture de stock" (grisée avec un /).
                      </div>
                   </div>
 
                   <div *ngIf="selectedColors.length > 0" class="mt-4 border-t border-border/50 pt-4">
                      <label class="text-xs font-semibold text-muted-foreground mb-2 block">Stock pour chaque couleur :</label>
                      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                         <div *ngFor="let color of selectedColors" class="flex items-center gap-2 bg-background border border-border rounded-lg px-2 py-1 focus-within:border-primary transition-colors">
                            <span class="text-[10px] font-bold w-14 truncate text-muted-foreground border-r border-border pr-2">{{ color }}</span>
                            <input type="number" [(ngModel)]="colorStocks[color]" [name]="'cstock_'+color" min="0" class="w-full h-8 bg-transparent text-sm focus:outline-none text-right font-bold" placeholder="0">
                         </div>
                      </div>
                   </div>
               </div>
               <div>
                  <label class="text-sm font-semibold">Image (URL ou Fichier)</label>
                  <div class="flex gap-2 items-center mt-1">
                     <input type="text" [(ngModel)]="newImageUrl" name="img" placeholder="https://..." class="flex-1 h-11 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                     <span class="text-sm font-bold text-muted-foreground">OU</span>
                     <input type="file" (change)="onFileSelected($event)" accept="image/*" class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors">
                  </div>
                  <div *ngIf="isUploading" class="text-xs text-primary mt-1 flex items-center gap-1">
                     <lucide-icon [img]="Loader2Icon" [size]="14" class="animate-spin"></lucide-icon> Téléchargement en cours...
                  </div>
               </div>
            </form>
            <div class="mt-6 flex justify-end gap-3 border-t border-border pt-4">
               <button (click)="closeAddModal()" class="px-5 py-2.5 font-bold hover:bg-muted rounded-xl transition-colors">Cancel</button>
               <button (click)="submitNewProduct()" [disabled]="addingProduct" class="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 flex items-center gap-2">
                  <lucide-icon *ngIf="addingProduct" [img]="Loader2Icon" [size]="18" class="animate-spin"></lucide-icon>
                  {{ editingId ? 'Enregistrer les modifications' : 'Add le produit' }}
               </button>
            </div>
         </div>
      </div>

      <!-- Toast Notification -->
      <div *ngIf="toast" class="fixed bottom-6 right-6 bg-card border border-border rounded-xl px-5 py-4 shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
        <div [ngClass]="isToastError ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'" class="h-8 w-8 rounded-full flex items-center justify-center shrink-0">
          {{ isToastError ? '❌' : '✓' }}
        </div>
        <p class="text-sm font-medium pr-4">{{ toast }}</p>
      </div>

      <!-- Floating Mobile Cart Button -->
      <button 
        *ngIf="cartItemCount > 0"
        (click)="isCartOpen = true" 
        class="md:hidden fixed bottom-24 right-6 h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center z-40 hover:scale-105 transition-transform cursor-pointer">
        <lucide-icon [img]="ShoppingCartIcon" [size]="24"></lucide-icon>
        <span class="absolute top-0 right-0 translate-x-1 -translate-y-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-primary">
          {{ cartItemCount }}
        </span>
      </button>

      <!-- Cart Drawer Overlay -->
      <div *ngIf="isCartOpen" 
           (click)="isCartOpen = false"
           class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] animate-in fade-in transition-all"></div>
      
      <!-- Cart Drawer Panel -->
      <div *ngIf="isCartOpen"
           class="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-card border-l border-border shadow-2xl z-[101] flex flex-col animate-in slide-in-from-right transition-all duration-300">
        
        <!-- Drawer Header -->
        <div class="flex items-center justify-between p-6 border-b border-border">
           <div class="flex items-center gap-3">
              <div class="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                 <lucide-icon [img]="ShoppingCartIcon" [size]="20"></lucide-icon>
              </div>
              <h2 class="text-xl font-bold">My Cart</h2>
              <span class="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs font-bold">{{ cartItemCount }}</span>
           </div>
           <button (click)="isCartOpen = false" class="h-10 w-10 bg-muted/50 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
              <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
           </button>
        </div>

        <!-- Drawer Content (Items) -->
        <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
           <div *ngIf="!cart || !cart.items || cart.items.length === 0" class="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
              <lucide-icon [img]="ShoppingBagIcon" [size]="48" class="opacity-20"></lucide-icon>
              <p>Your cart is empty.</p>
              <button (click)="isCartOpen = false" class="px-6 py-2 bg-primary text-primary-foreground rounded-xl mt-2 font-medium">
                 Continue Shopping
              </button>
           </div>
           
           <ng-container *ngIf="cart && cart.items && cart.items.length > 0">
             <div *ngFor="let item of cart.items" class="flex gap-4 bg-muted/20 p-3 rounded-2xl border border-border/50 relative group">
                <div class="h-20 w-20 bg-card rounded-xl border border-border/50 flex items-center justify-center overflow-hidden shrink-0">
                  <img *ngIf="item.productImage" [src]="item.productImage" class="object-cover h-full w-full">
                  <span *ngIf="!item.productImage">🛒</span>
                </div>
                <div class="flex flex-col flex-1 py-1">
                  <h4 class="font-bold text-sm line-clamp-2 leading-tight pr-6">{{ item.productName || 'Article' }}</h4>
                  <div class="flex items-center gap-3 mt-2 mb-auto">
                     <button (click)="decreaseQuantity(item)" class="h-7 w-7 rounded-md bg-background border border-border flex items-center justify-center hover:bg-muted font-bold transition-colors">-</button>
                     <span class="text-sm font-bold w-4 text-center">{{ item.quantity }}</span>
                     <button (click)="increaseQuantity(item)" class="h-7 w-7 rounded-md bg-background border border-border flex items-center justify-center hover:bg-muted font-bold transition-colors">+</button>
                  </div>
                  <div class="font-black text-primary mt-1">{{ formatPrice(item.price * item.quantity) }}</div>
                </div>
                <!-- Remove item button -->
                <button (click)="removeFromCart(item.id)" class="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 p-1 bg-card rounded-full shadow-sm hover:bg-background">
                   <lucide-icon [img]="XIcon" [size]="16"></lucide-icon>
                </button>
             </div>
           </ng-container>
        </div>

        <!-- Drawer Footer (Total & Checkout) -->
        <div *ngIf="cart && cart.items && cart.items.length > 0" class="p-6 border-t border-border bg-card">
           <div class="flex items-center justify-between mb-4">
              <span class="text-muted-foreground">Total to pay</span>
              <span class="text-2xl font-black">{{ formatPrice(cart?.total || cartTotal) }}</span>
           </div>
           <button (click)="openCheckout()" class="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all hover:shadow-lg shadow-primary/25 hover:-translate-y-1">
              Checkout now <lucide-icon [img]="ArrowRightIcon" [size]="20"></lucide-icon>
           </button>
        </div>
      </div>

      <!-- Checkout Drawer/Modal -->
      <div *ngIf="isCheckoutOpen" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
         <div class="absolute inset-0 bg-background/80 backdrop-blur-sm" (click)="isCheckoutOpen = false"></div>
         <div class="relative bg-card border border-border shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div class="flex items-center justify-between p-6 border-b border-border bg-card relative z-10">
               <h2 class="text-2xl font-black">Finalize Order</h2>
               <button (click)="isCheckoutOpen = false" class="p-2 hover:bg-muted rounded-full transition-colors"><lucide-icon [img]="XIcon" [size]="20"></lucide-icon></button>
            </div>
            
            <div class="flex-1 overflow-y-auto p-6 space-y-6">
               <form class="space-y-4">
                  <h3 class="font-bold text-lg border-b border-border pb-2">Delivery Information</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label class="text-sm font-semibold">Full Name</label>
                        <input type="text" [(ngModel)]="checkoutData.clientName" name="cName" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                     </div>
                     <div>
                        <label class="text-sm font-semibold">Phone Number</label>
                        <input type="text" [(ngModel)]="checkoutData.clientPhone" name="cPhone" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                     </div>
                     <div class="md:col-span-2">
                        <label class="text-sm font-semibold">Full Address</label>
                        <input type="text" [(ngModel)]="checkoutData.clientAddress" name="cAddress" (ngModelChange)="onAddressChange()" placeholder="Ex: Avenue Habib Bourguiba, Tunis" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                     </div>
                     <div>
                        <label class="text-sm font-semibold">Postal Code</label>
                        <input type="text" [(ngModel)]="checkoutData.clientPostalCode" name="cPostal" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                     </div>
                     <div>
                        <label class="text-sm font-semibold">City / Gouvernorat</label>
                        <select [(ngModel)]="checkoutData.clientCity" name="cCity" (ngModelChange)="onAddressChange()" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary cursor-pointer">
                           <option *ngFor="let gov of governorates" [value]="gov.name">{{ gov.name }}</option>
                        </select>
                     </div>
                  </div>

                  <h3 class="font-bold text-lg border-b border-border pb-2 mt-6">Delivery Mode</h3>
                  <div class="flex gap-4 flex-col sm:flex-row">
                     <label class="flex-1 p-4 border rounded-xl flex items-center gap-3 cursor-pointer transition-colors hover:border-primary" 
                            [ngClass]="checkoutData.deliveryMode === 'LIVRAISON_DOMICILE' ? 'border-primary bg-primary/10' : 'border-border'">
                        <input type="radio" name="deliveryMode" [(ngModel)]="checkoutData.deliveryMode" value="LIVRAISON_DOMICILE" class="hidden">
                        <div class="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                           <div *ngIf="checkoutData.deliveryMode === 'LIVRAISON_DOMICILE'" class="w-2.5 h-2.5 bg-primary rounded-full"></div>
                        </div>
                        <div>
                           <div class="font-bold">Home Delivery</div>
                           <div class="text-xs text-muted-foreground">{{ (cart?.total || cartTotal) >= 300 ? 'Free (Over 300DT)' : (isCalculatingFee ? 'Calculating...' : (backendDeliveryFee > 0 ? formatPrice(backendDeliveryFee) + ' Fee' : 'Address required')) }}</div>
                        </div>
                     </label>

                     
                     <label class="flex-1 p-4 border rounded-xl flex items-center gap-3 cursor-pointer transition-colors hover:border-primary" 
                            [ngClass]="checkoutData.deliveryMode === 'RETRAIT_MAGASIN' ? 'border-primary bg-primary/10' : 'border-border'">
                        <input type="radio" name="deliveryMode" [(ngModel)]="checkoutData.deliveryMode" value="RETRAIT_MAGASIN" class="hidden">
                        <div class="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                           <div *ngIf="checkoutData.deliveryMode === 'RETRAIT_MAGASIN'" class="w-2.5 h-2.5 bg-primary rounded-full"></div>
                        </div>
                        <div>
                           <div class="font-bold">Store Pickup</div>
                           <div class="text-xs text-muted-foreground">Free</div>
                        </div>
                     </label>
                  </div>

                  <h3 class="font-bold text-lg border-b border-border pb-2 mt-6">Payment</h3>
                  <div class="flex gap-4 flex-col sm:flex-row">
                     <label class="flex-1 p-4 border rounded-xl flex items-center gap-3 cursor-pointer transition-colors hover:border-primary" 
                            [ngClass]="checkoutData.paymentMode === 'ESPECE' ? 'border-primary bg-primary/10' : 'border-border'">
                        <input type="radio" name="paymentMode" [(ngModel)]="checkoutData.paymentMode" value="ESPECE" class="hidden">
                        <div class="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                           <div *ngIf="checkoutData.paymentMode === 'ESPECE'" class="w-2.5 h-2.5 bg-primary rounded-full"></div>
                        </div>
                        <div class="font-bold">{{ checkoutData.deliveryMode === 'RETRAIT_MAGASIN' ? 'Cash in Store' : 'Cash on Delivery' }}</div>
                     </label>
                     <label class="flex-1 p-4 border rounded-xl flex items-center gap-3 cursor-pointer transition-colors hover:border-primary" 
                            [ngClass]="checkoutData.paymentMode === 'CARTE' ? 'border-primary bg-primary/10' : 'border-border'">
                        <input type="radio" name="paymentMode" [(ngModel)]="checkoutData.paymentMode" value="CARTE" class="hidden">
                        <div class="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                           <div *ngIf="checkoutData.paymentMode === 'CARTE'" class="w-2.5 h-2.5 bg-primary rounded-full"></div>
                        </div>
                        <div class="font-bold">Online (Card)</div>
                     </label>
                  </div>

                  <!-- Credit Card Details Form -->
                  <div *ngIf="checkoutData.paymentMode === 'CARTE'" class="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300">
                     <div class="flex items-center gap-2 text-primary mb-2">
                        <lucide-icon [img]="ShoppingCartIcon" [size]="18"></lucide-icon>
                        <span class="font-bold text-sm">Payment Details</span>
                     </div>
                     <div class="space-y-1">
                        <label class="text-sm font-semibold opacity-70">Card Number</label>
                        <input type="text" [(ngModel)]="checkoutData.cardNumber" name="cardNumber" placeholder="0000 0000 0000 0000" class="w-full h-11 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                     </div>
                     <div class="flex gap-4">
                        <div class="flex-1 space-y-1">
                           <label class="text-sm font-semibold opacity-70">Expiry Date</label>
                           <input type="text" [(ngModel)]="checkoutData.expiryDate" name="expiryDate" placeholder="MM/YY" class="w-full h-11 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                        </div>
                        <div class="flex-1 space-y-1">
                           <label class="text-sm font-semibold opacity-70">CVV (8 digits)</label>
                           <input type="password" [(ngModel)]="checkoutData.cvv" name="cvv" placeholder="********" class="w-full h-11 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                        </div>
                     </div>
                     <div class="space-y-1">
                        <label class="text-sm font-semibold opacity-70">Confirmation Email</label>
                        <input type="email" [(ngModel)]="checkoutData.clientEmail" name="clientEmail" placeholder="client@example.com" class="w-full h-11 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                     </div>
                  </div>
                  
                  <div class="mt-6 pt-4 border-t border-border">
                     <label class="text-sm font-semibold">Promo Code</label>
                     <div class="flex gap-2 mt-1">
                        <input type="text" [(ngModel)]="promoCodeInput" name="promo" placeholder="Have a code?" class="flex-1 h-11 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                        <button (click)="applyPromoCode()" type="button" class="px-4 bg-muted hover:bg-muted/80 rounded-xl font-semibold">Apply</button>
                     </div>
                     <div *ngIf="cart?.appliedPromoCode" class="text-xs text-green-500 font-bold bg-green-500/10 px-3 py-1.5 rounded-md mt-2 inline-block">
                        Code {{ cart.appliedPromoCode }} applied! (-{{ formatPrice(cart.discount) }})
                     </div>
                  </div>
               </form>
            </div>
            
            <div class="p-6 border-t border-border bg-card shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] relative z-10">
               <div class="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Subtotal</span>
                  <span>{{ formatPrice(cart?.subtotal || cartTotal) }}</span>
               </div>
               <div *ngIf="cart?.discount > 0" class="flex justify-between text-sm text-green-500 mb-1">
                  <span>Discount</span>
                  <span>-{{ formatPrice(cart.discount) }}</span>
               </div>
               <div class="flex justify-between text-sm text-muted-foreground mb-3">
                  <span>Delivery Fee</span>
                  <span>{{ checkoutDeliveryFee > 0 ? '+ ' + formatPrice(checkoutDeliveryFee) : 'Free' }}</span>
               </div>
               <div class="flex items-center justify-between mb-4">
                  <span class="text-lg font-bold">Final Total</span>
                  <span class="text-2xl font-black text-primary">{{ formatPrice(finalTotal) }}</span>
               </div>
               <button (click)="confirmCheckout()" class="w-full py-4 bg-primary text-primary-foreground font-black rounded-xl text-lg flex items-center justify-center gap-2 hover:bg-primary/90 hover:-translate-y-1 transition-all shadow-xl shadow-primary/25">
                  <lucide-icon [img]="ShoppingCartIcon" [size]="20"></lucide-icon> Confirm Order
               </button>
            </div>
         </div>
      </div>

      <!-- Orders Tracker Drawer -->
      <div *ngIf="isOrdersOpen" class="fixed inset-0 z-[120] flex justify-end">
         <div class="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" (click)="isOrdersOpen = false"></div>
         <div class="relative w-full max-w-md bg-card h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-border">
            <div class="flex items-center justify-between p-6 border-b border-border bg-card/50 backdrop-blur-md">
               <div class="flex items-center gap-3">
                  <div class="p-2 bg-primary/10 rounded-xl">
                     <lucide-icon [img]="PackageIcon" [size]="24" class="text-primary"></lucide-icon>
                  </div>
                  <h2 class="text-xl font-black">My Orders</h2>
               </div>
               <button (click)="isOrdersOpen = false" class="p-2 hover:bg-muted rounded-full transition-colors">
                  <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
               </button>
            </div>
            
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
               <div *ngIf="myOrders.length === 0" class="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <lucide-icon [img]="PackageIcon" [size]="48" class="opacity-20 mb-4"></lucide-icon>
                  <p class="font-bold">No orders yet.</p>
               </div>
               <div *ngFor="let order of myOrders" class="p-4 border border-border rounded-2xl bg-background shadow-sm hover:shadow-md transition-shadow">
                  <div class="flex items-center justify-between mb-3">
                      <div class="flex-1 min-w-0">
                         <div class="text-[10px] font-black text-primary uppercase tracking-wider truncate mb-0.5">#{{ order.orderCode || 'COMMANDE' }}</div>
                         <div class="text-[10px] text-muted-foreground">{{ order.createdAt | date:'dd/MM/yyyy HH:mm' }}</div>
                         <div class="font-black text-foreground mt-1">{{ formatPrice(order.total) }}</div>
                         <div *ngIf="order.deliveryStatus === 'EXPEDIE'" class="mt-2 text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                            <lucide-icon [img]="TruckIcon" [size]="10"></lucide-icon>
                            Code: <span class="text-primary">{{ order.deliveryConfirmationCode?.substring(0, 8).toUpperCase() }}</span>
                         </div>
                      </div>
                     <div class="px-3 py-1 text-xs font-black rounded-full border" 
                          [ngClass]="{
                            'bg-yellow-500/10 text-yellow-600 border-yellow-500/20': order.deliveryStatus === 'EN_COURS_DE_TRAITEMENT',
                            'bg-blue-500/10 text-blue-600 border-blue-500/20': order.deliveryStatus === 'EXPEDIE',
                            'bg-green-500/10 text-green-600 border-green-500/20': order.deliveryStatus === 'LIVRE'
                          }">
                        {{ 
                          order.deliveryStatus === 'EN_COURS_DE_TRAITEMENT' ? 'Processing' : 
                          order.deliveryStatus === 'EXPEDIE' ? 'Shipped' : 
                          order.deliveryStatus === 'LIVRE' ? 'Delivered' : order.deliveryStatus 
                        }}
                     </div>
                  </div>
                  <div class="space-y-2">
                     <div *ngFor="let item of order.items" class="flex items-center justify-between text-sm">
                        <span class="flex-1 truncate pr-4 text-muted-foreground">{{ item.quantity }}x {{ item.productName }}</span>
                     </div>
                  </div>
                  <div class="mt-4 pt-3 border-t border-border flex flex-col gap-1 text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl">
                     <div class="font-bold text-foreground">{{ order.clientName }}</div>
                     <div class="flex items-start gap-1"><span class="font-semibold w-16">Delivery:</span> <span class="flex-1">{{ order.clientAddress }}, {{ order.clientPostalCode }} {{ order.clientCity }}</span></div>
                     <div class="flex items-start gap-1"><span class="font-semibold w-16">Mode:</span> <span class="flex-1">{{ order.deliveryMode === 'RETRAIT_MAGASIN' ? 'Pickup' : 'Home' }} (Payment: {{ order.paymentMode }})</span></div>
                  </div>
               </div>
            </div>
         </div>
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
  `]
})
export class SponsorsComponent implements OnInit {
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
   pageSize: number = 50; // Augmente a 50 pour que le tri IA fonctionne sur tout le catalogue

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
   isEditMode = false; // Added missing property
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

   constructor(private productService: ProductService, private cdr: ChangeDetectorRef) { }

   get isAdmin(): boolean {
      return localStorage.getItem('user_type') === 'ROLE_ADMIN';
   }

   ngOnInit() {
      this.loadCategories();
      this.loadProducts();
      this.loadCart();
      this.loadFavorites();
      this.loadAIRecommendations();

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

   /** Charge le classement IA depuis Flask via Spring Boot */
   loadAIRecommendations() {
      const userIdStr = localStorage.getItem('user_id');
      if (!userIdStr) return;
      const userId = parseInt(userIdStr, 10);
      if (isNaN(userId)) return;

      this.productService.getAIRecommendations(userId, 50).subscribe({
         next: (res) => {
            this.aiFlaskAvailable = res.flask_available;
            this.aiRankMap.clear();
            (res.ranked_products || []).forEach(r => {
               this.aiRankMap.set(Number(r.product_id), { rank: r.rank, score: r.recommendation_score, priority: r.priority });
            });
            // Re-trier les produits déjà chargés selon le score IA
            this.sortProductsByAI();
            this.cdr.detectChanges();
         },
         error: (err) => console.warn('AI recommandations non disponibles:', err)
      });
   }

   /** Trie le tableau products selon le score IA (HIGH en premier) */
   sortProductsByAI() {
      if (this.aiRankMap.size === 0) return;
      console.log('Current User ID in LocalStorage:', localStorage.getItem('user_id'));
      console.log('Ranked Products Array length:', this.products.length);
      this.products = [...this.products].sort((a, b) => {
         const ra = this.aiRankMap.get(Number(a.id));
         const rb = this.aiRankMap.get(Number(b.id));
         const scoreA = ra ? ra.score : 0;
         const scoreB = rb ? rb.score : 0;
         return scoreB - scoreA; // décroissant
      });
   }

   /** Retourne la priorité IA d'un produit (HIGH / MEDIUM / LOW / undefined) */
   getAIPriority(productId: number | string): string | undefined {
      return this.aiRankMap.get(Number(productId))?.priority;
   }

   /** Retourne le score IA brut d'un produit (0-100) */
   getAIScore(productId: number | string): number {
      return this.aiRankMap.get(Number(productId))?.score ?? 0;
   }

   /** Rang IA du produit (1 = meilleur) */
   getAIRank(productId: number | string): number {
      return this.aiRankMap.get(Number(productId))?.rank ?? 999;
   }

   /** Vérifie si une couleur spécifique est en rupture de stock pour un produit */
   isColorOutOfStock(prod: any, colorName: string): boolean {
      // Si le produit n'a pas de variants, on considère tout en stock par défaut ou selon le stock global
      if (!prod.variants || prod.variants.length === 0) {
         return prod.stock === 0;
      }
      // On cherche si un variant possède cette couleur et un stock > 0
      const variantWithColor = prod.variants.find((v: any) => v.color?.toLowerCase() === colorName.toLowerCase());
      if (!variantWithColor) return true; // Pas de variant = pas disponible
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
            this.showToast('HTTP Error: ' + err.message);
            this.loadingCategories = false;
         }
      });
   }

   loadProducts() {
      this.loadingProducts = true;

      // Failsafe: force loading state to false after 10s if request hangs
      const failsafe = setTimeout(() => {
         if (this.loadingProducts) {
            console.warn('Backend request timed out. Forcing UI unblock.');
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

      const requestArgs = this.productService.searchProducts(criteria, this.currentPage, this.pageSize);

      requestArgs.subscribe({
         next: (res: any) => {
            clearTimeout(failsafe);
            let fetched = res.content || res as any;
            if (!fetched) {
               fetched = [];
            }
            if (res.totalPages !== undefined) {
               this.totalPages = res.totalPages;
            }
            this.products = fetched;
            // Appliquer le tri IA si déjà chargé
            this.sortProductsByAI();
            this.loadingProducts = false;
            this.cdr.detectChanges();
         },
         error: (err: any) => {
            clearTimeout(failsafe);
            console.error('Error loading products', err);
            this.loadingProducts = false;
            this.products = [];
            this.cdr.detectChanges();
         }
      });
   }

   selectCategory(categoryId: number | null) {
      console.log('Interaction: selectCategory', categoryId);
      try {
         this.selectedCategoryId = categoryId;
         this.selectedGender = null;
         this.searchKeyword = '';
         this.minPrice = null;
         this.maxPrice = null;
         this.currentPage = 0;
         this.cdr.detectChanges();
         this.loadProducts();
         this.showToast('Filtering sport...');
      } catch (e) {
         console.error('Error in selectCategory:', e);
      }
   }

   selectGender(genre: string) {
      console.log('Interaction: selectGender', genre);
      try {
         if (!genre) {
            this.selectedGender = null;
         } else if (this.selectedGender === genre) {
            this.selectedGender = null;
         } else {
            this.selectedGender = genre;
         }
         this.currentPage = 0;
         this.cdr.detectChanges();
         this.loadProducts();
         this.showToast('Filtering gender...');
      } catch (e) {
         console.error('Error in selectGender:', e);
      }
   }

   applyFilters() {
      this.currentPage = 0;
      this.loadProducts();
   }

   forceRefresh() {
      console.log('Forcing refresh...');
      this.cdr.detectChanges();
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
            console.error('Cart add error:', err);
            this.addingToCartId = null;
            const msg = err.error?.message || err.message || "Error adding to cart";
            this.showToast("❌ " + msg);
         }
      });
   }

   removeFromCart(itemId: number) {
      this.productService.removeFromCart(itemId).subscribe({
         next: () => {
            this.showToast('Item removed from cart');
            this.loadCart();
         },
         error: (err) => {
            console.error('Error removing from cart', err);
            this.showToast('Error during removal');
         }
      });
   }

   isFavorite(productId: number): boolean {
      return this.favoriteProductIds.has(productId);
   }

   toggleFavorite(product: Product) {
      if (this.isFavorite(product.id)) {
         this.favoriteProductIds.delete(product.id);
         this.productService.removeFromFavorites(product.id).subscribe({
            next: () => this.showToast(`${product.nom} removed from favorites`),
            error: () => {
               this.favoriteProductIds.add(product.id);
               this.showToast('Error removing from favorites');
            }
         });
      } else {
         this.favoriteProductIds.add(product.id);
         this.productService.addToFavorites(product.id).subscribe({
            next: (res) => {
               if (res !== null) {
                  this.showToast(`${product.nom} added to wishlist ❤️`);
               }
            },
            error: () => {
               this.favoriteProductIds.delete(product.id);
               this.showToast('Error adding to favorites');
            }
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
      this.backendDeliveryFee = 7; // Initial fallback
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
            console.error('Delivery calculation error:', err);
            this.isCalculatingFee = false;
            this.backendDeliveryFee = 7; // Default
         }
      });
   }

   applyPromoCode() {
      if (!this.promoCodeInput) return;
      this.productService.applyPromoCodeCart(this.promoCodeInput).subscribe({
         next: () => {
            this.showToast('Promo code applied!');
            this.promoCodeInput = '';
            this.loadCart();
         },
         error: () => this.showToast('Invalid promo code')
      });
   }

   confirmCheckout() {
      if (!this.checkoutData.clientName || !this.checkoutData.clientAddress || !this.checkoutData.clientPhone || !this.checkoutData.clientPostalCode || !this.checkoutData.clientCity) {
         this.showToast('Please fill in your delivery information (name, address, phone, postal code, city)');
         return;
      }
      this.productService.checkoutCart(this.checkoutData).subscribe({
         next: () => {
            this.showToast('Order confirmed successfully 🎉');
            this.isCheckoutOpen = false;
            this.loadCart(); // Reload cart, it should be empty now
            this.openOrders(); // Open tracking
         },
         error: (err: any) => {
            console.error('Confirm checkout error:', err);
            let msg = 'Error validating the order';
            if (err.error && typeof err.error === 'string') {
               msg = err.error;
            } else if (err.error && err.error.error) {
               msg = err.error.error;
            } else if (err.error && err.error.message) {
               msg = err.error.message;
            } else if (err.status === 400) {
               msg = 'Please check your input fields (Name, Address, Postal Code, etc).';
            }
            this.showToast(msg);
         }
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

   // --- Admin Methods ---
   openAddModal() {
      this.editingId = null;
      this.newProduct = {
         nom: '',
         marque: '',
         description: '',
         prix: 0,
         stock: 10,
         categoryId: this.selectedCategoryId || (this.categories && this.categories.length > 0 && this.categories[0].id ? this.categories[0].id : null),
         images: [],
         status: 'EN_STOCK',
         variants: []
      };
      this.newImageUrl = '';
      this.productType = '';
      this.productGender = '';
      this.selectedSizes = [];
      this.selectedColors = [];
      this.variantStocks = {};
      this.colorStocks = {};
      this.isAddModalOpen = true;
   }

   closeAddModal() {
      this.isAddModalOpen = false;
      this.editingId = null;
   }

   editProduct(product: Product) {
      this.editingId = product.id;
      this.isAddModalOpen = true;
      // Always fetch full product details to ensure description and all fields are populated
      this.productService.getProductById(product.id).subscribe({
         next: (fullProduct: Product) => {
            this.newProduct = {
               nom: fullProduct.nom || product.nom || '',
               marque: fullProduct.marque || product.marque || '',
               description: fullProduct.description || product.description || '',
               prix: fullProduct.prix || product.prix || 0,
               stock: fullProduct.stock ?? product.stock ?? 0,
               categoryId: fullProduct.category?.id || product.category?.id || (this.categories && this.categories.length > 0 ? this.categories[0].id : null),
               images: [...(fullProduct.images || product.images || [])],
               status: fullProduct.status || product.status || 'EN_STOCK',
               variants: fullProduct.variants || product.variants || []
            };
            this.newImageUrl = (this.newProduct.images.length > 0) ? this.newProduct.images[0] : '';
            this.autoDetectSizesFromVariants();
            this.cdr.detectChanges();
         },
         error: () => {
            // Fallback to data from the list if API call fails
            this.newProduct = {
               nom: product.nom || '',
               marque: product.marque || '',
               description: product.description || '',
               prix: product.prix || 0,
               stock: product.stock || 0,
               categoryId: product.category?.id || (this.categories && this.categories.length > 0 ? this.categories[0].id : null),
               images: [...(product.images || [])],
               status: product.status || 'EN_STOCK',
               variants: product.variants || []
            };
            this.newImageUrl = (this.newProduct.images.length > 0) ? this.newProduct.images[0] : '';
            this.autoDetectSizesFromVariants();
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

         const firstSize = this.selectedSizes[0];
         if (this.SIZES_VETEMENT.includes(firstSize)) {
            this.productType = 'vetement';
         } else if (this.SIZES_CHAUSSURE_HOMME.includes(firstSize)) {
            this.productType = 'chaussure';
            this.productGender = 'homme';
         } else if (this.SIZES_CHAUSSURE_FEMME.includes(firstSize)) {
            this.productType = 'chaussure';
            this.productGender = 'femme';
         } else if (this.SIZES_CHAUSSURE_ENFANT.includes(firstSize)) {
            this.productType = 'chaussure';
            this.productGender = 'enfant';
         } else {
            this.productType = '';
            this.productGender = '';
         }
      } else {
         this.productType = '';
         this.productGender = '';
      }
   }

   deleteProduct(id: number) {
      if (confirm('Are you sure you want to delete this product?')) {
         this.productService.deleteProduct(id).subscribe({
            next: () => {
               this.showToast('Product deleted successfully');
               this.loadProducts();
            },
            error: (err) => {
               console.error('Error deleting product', err);
               this.showToast('Error during deletion');
            }
         });
      }
   }

   submitNewProduct() {
      // Frontend validation
      if (!this.newProduct.nom) {
         alert("Le nom du produit est obligatoire.");
         return;
      }
      if (!this.newProduct.description) {
         alert("La description est obligatoire.");
         return;
      }
      if (this.newProduct.prix <= 0) {
         alert("Le prix doit être strictement positif.");
         return;
      }
      if (!this.newProduct.categoryId || this.newProduct.categoryId === 0) {
         alert("Veuillez sélectionner une catégorie.");
         return;
      }

      if (this.newImageUrl) {
         this.newProduct.images = [this.newImageUrl];
      } else if (!this.editingId) {
         // Only clear if adding a new product without image
         this.newProduct.images = [];
      }

      // Map selected sizes and colors to variants
      if (this.selectedSizes.length > 0 || this.selectedColors.length > 0) {
         const currentVariants = this.newProduct.variants || [];
         const newVariants: any[] = [];

         const sizes = this.selectedSizes.length > 0 ? this.selectedSizes : ['Unique'];
         const colors = this.selectedColors.length > 0 ? this.selectedColors : [''];

         sizes.forEach(size => {
            colors.forEach(color => {
               const sVal: any = this.variantStocks[size];
               const sStock = (sVal !== undefined && sVal !== null) ? Number(sVal) : 0;
               
               const cVal: any = this.colorStocks[color];
               const cStock = (cVal !== undefined && cVal !== null) ? Number(cVal) : 0;
               
               let finalStock = 0;
               if (size !== 'Unique' && color !== '') {
                  finalStock = Math.min(sStock, cStock);
               } else if (size !== 'Unique') {
                  finalStock = sStock;
               } else if (color !== '') {
                  finalStock = cStock;
               } else {
                  finalStock = Math.min(sStock, cStock);
               }
               
               // Normalize for comparison
               const normalizedSize = size;
               const normalizedColor = color || '';

               const existingVariant = currentVariants.find((v: any) => {
                  const dbSize = (!v.size || v.size === 'null') ? 'Unique' : String(v.size).trim();
                  const dbColor = (!v.color || v.color === 'null') ? '' : String(v.color).trim();
                  return dbSize === String(normalizedSize).trim() && dbColor === String(normalizedColor).trim();
               });

               if (existingVariant) {
                  existingVariant.stock = finalStock;
                  if (!existingVariant.sku || existingVariant.sku.trim() === '') {
                      existingVariant.sku = (this.newProduct.nom.replace(/\s+/g, '-').toUpperCase() + '-' + size + '-' + (color || 'U') + '-' + Math.floor(Math.random() * 1000)).replace('--', '-').replace(/-$/, '');
                  }
                  newVariants.push(existingVariant);
               } else {
                  const generatedSku = (this.newProduct.nom.replace(/\s+/g, '-').toUpperCase() + '-' + size + '-' + (color || 'U') + '-' + Math.floor(Math.random() * 1000)).replace('--', '-').replace(/-$/, '');
                  newVariants.push({
                     size: size,
                     color: color,
                     sku: generatedSku,
                     stock: finalStock,
                     priceAdjustment: 0
                  });
               }
            });
         });
         this.newProduct.variants = newVariants;

         // Automatically update global stock as the sum of all variant stocks
         const totalStock = newVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
         this.newProduct.stock = totalStock;

         // If total stock is 0, set status to OUT_OF_STOCK
         if (totalStock === 0) {
            this.newProduct.status = 'RUPTURE_DE_STOCK';
         } else if (this.newProduct.status === 'RUPTURE_DE_STOCK') {
            // If it was out of stock but now has items, set to EN_STOCK
            this.newProduct.status = 'EN_STOCK';
         }
      } else {
         this.newProduct.variants = [];
      }

      this.addingProduct = true;

      const obs = this.editingId
         ? this.productService.updateProduct(this.editingId, this.newProduct)
         : this.productService.createProduct(this.newProduct);

      obs.subscribe({
         next: () => {
            this.addingProduct = false;
            this.closeAddModal();
            this.showToast(this.editingId ? 'Product updated successfully!' : 'Product added successfully!');
            this.loadProducts(); // Refresh list to show the new/updated product immediately
         },
         error: (err) => {
            console.error("Error saving product:", err);
            this.addingProduct = false;

            let errorMessage = "Une erreur est survenue lors de l'enregistrement du produit.";

            // Extract validation details if available
            if (err.error && err.error.error === 'Validation failed' && err.error.details) {
               const details = err.error.details;
               const detailMsgs = Object.keys(details).map(key => `${key}: ${details[key]}`);
               errorMessage = "Erreur de validation :\n" + detailMsgs.join("\n");
            } else if (err.error && err.error.error) {
               errorMessage = err.error.error;
            }

            alert(errorMessage);
         }
      });
   }

   decreaseQuantity(item: any) {
      if (item.quantity > 1) {
         // Optimistic update: update UI immediately
         item.quantity = item.quantity - 1;
         this.productService.updateCartItem(item.id, item.quantity).subscribe({
            next: () => this.loadCart(),
            error: () => {
               item.quantity = item.quantity + 1; // rollback
               this.showToast("Error updating quantity");
            }
         });
      } else {
         this.removeFromCart(item.id);
      }
   }

   increaseQuantity(item: any) {
      // Optimistic update: update UI immediately
      item.quantity = item.quantity + 1;
      this.productService.updateCartItem(item.id, item.quantity).subscribe({
         next: () => this.loadCart(),
         error: () => {
            item.quantity = item.quantity - 1; // rollback
            this.showToast("Insufficient stock for this item");
         }
      });
   }

   showToast(msg: string) {
      this.toast = msg;
      // Add logic to hide the toast later
      setTimeout(() => this.toast = null, 3000);
   }

   get isToastError(): boolean {
      if (!this.toast) return false;
      const errorKeywords = ['Error', 'Error', 'Failed', 'Please', 'insufficient'];
      return errorKeywords.some(key => this.toast!.toLowerCase().includes(key.toLowerCase()));
   }

}
