import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ShoppingBag, ShoppingCart, Loader2, Search, ArrowRight, ArrowLeft, Tag, Star, X, Heart, Plus, Edit, Trash2, Package } from 'lucide-angular';
import { ProductService, Product, Category, ProductRequest } from '../services/product.service';

@Component({
   selector: 'app-sponsors',
   standalone: true,
   imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
   template: `
    <div class="min-h-screen bg-background font-sans pb-20">
      
      <!-- TOP PROMO BANNER -->
      <div class="bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold text-center py-2.5 uppercase tracking-widest relative z-20 shadow-md">
        Livraison gratuite dès 300€ d'achat &nbsp;|&nbsp; Retours gratuits sous 30 jours
      </div>

      <!-- NAVBAR STORE -->
      <div class="bg-card sticky top-0 z-40 shadow-sm border-b border-border">
        <div class="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <h1 class="text-xl sm:text-3xl font-black tracking-tighter uppercase text-foreground">STREETLEAGUE</h1>
          
          <div class="flex-1 max-w-xl mx-4 relative hidden md:block">
             <input type="text" [(ngModel)]="searchKeyword" (keyup.enter)="applyFilters()" placeholder="Rechercher des articles, sports..." class="w-full h-10 bg-muted/50 rounded-full pl-5 pr-14 text-sm focus:outline-none focus:ring-2 ring-primary/50 transition-all border border-border focus:border-primary">
             <button (click)="applyFilters()" class="absolute right-0 top-0 h-10 w-12 bg-primary text-primary-foreground rounded-r-full flex items-center justify-center hover:opacity-90 transition-colors">
               <lucide-icon [img]="SearchIcon" [size]="16"></lucide-icon>
             </button>
          </div>

          <div class="flex items-center gap-4 sm:gap-6">
             <a *ngIf="isAdmin" routerLink="/app/admin/orders" title="Commandes Administrateur" class="relative group cursor-pointer hover:text-primary transition-colors text-foreground">
                <lucide-icon [img]="PackageIcon" [size]="20"></lucide-icon>
             </a>
             <button *ngIf="isAdmin" (click)="openAddModal()" title="Ajouter Produit" class="relative group cursor-pointer hover:opacity-70 transition-opacity">
                <lucide-icon [img]="PlusIcon" [size]="20" class="text-primary"></lucide-icon>
             </button>
             <button (click)="openOrders()" class="hidden sm:block text-[11px] font-bold uppercase tracking-wider hover:text-primary transition-colors text-foreground">
                Mes Commandes
             </button>
             <button (click)="isCartOpen = true" class="relative group cursor-pointer hover:text-primary transition-colors text-foreground">
                <lucide-icon [img]="ShoppingBagIcon" [size]="22"></lucide-icon>
                <div *ngIf="cartItemCount > 0" class="absolute -top-1.5 -right-2 h-4 w-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center font-bold text-[9px]">
                   {{ cartItemCount }}
                </div>
             </button>
          </div>
        </div>
        <!-- Mobile Search Bar (Visible only on small screens) -->
        <div class="md:hidden px-4 py-3 bg-card border-t border-border">
             <div class="relative w-full">
                <input type="text" [(ngModel)]="searchKeyword" (keyup.enter)="applyFilters()" placeholder="Rechercher..." class="w-full h-10 bg-muted/50 rounded-full pl-5 pr-14 text-sm focus:outline-none border border-border">
                <button (click)="applyFilters()" class="absolute right-0 top-0 h-10 w-12 bg-primary text-primary-foreground rounded-r-full flex items-center justify-center">
                  <lucide-icon [img]="SearchIcon" [size]="16"></lucide-icon>
                </button>
             </div>
        </div>
      </div>

      <!-- MAIN CONTENT -->
      <div class="bg-background">
        
        <!-- CIRCULAR CATEGORIES CAROUSEL -->
        <div *ngIf="!loadingCategories && categories.length > 0" class="py-6 px-4 bg-card border-b border-border overflow-x-auto hide-scrollbar relative z-30 pointer-events-auto">
          <div class="container mx-auto flex gap-6 lg:gap-10 justify-start min-w-max">
            <!-- Toujours afficher "Tout / Tendance" en premier -->
            <button (click)="selectCategory(null)" class="flex flex-col items-center gap-2 group flex-shrink-0">
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-border p-1 group-hover:border-primary transition-colors" [class.border-primary]="selectedCategoryId === null" [class.ring-2]="selectedCategoryId === null" [class.ring-primary]="selectedCategoryId === null">
                <div class="w-full h-full bg-gradient-to-br from-primary/10 to-accent/20 rounded-full flex items-center justify-center text-2xl shadow-inner">✨</div>
              </div>
              <span class="text-[11px] sm:text-[12px] font-bold text-muted-foreground pb-1" [class.text-primary]="selectedCategoryId === null && selectedGenre === null" [class.border-b-2]="selectedCategoryId === null && selectedGenre === null" [class.border-primary]="selectedCategoryId === null && selectedGenre === null">TENDANCES</span>
            </button>


            
            <!-- DYNAMIC CATEGORIES -->
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
           <!-- BIG PROMO BANNER -->
           <div *ngIf="selectedCategoryId === null" class="w-full h-[250px] sm:h-[400px] bg-gradient-to-r from-primary to-accent rounded-2xl mb-10 overflow-hidden relative group cursor-pointer shadow-lg border border-border">
             <img src="https://images.unsplash.com/photo-1556817411-31ae72fa3ea8?q=80&w=2000&auto=format&fit=crop" class="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000">
             <div class="absolute inset-x-6 sm:inset-x-12 bottom-8 sm:bottom-12 z-10 text-white">
                <div class="text-[10px] font-black tracking-[0.3em] mb-2 uppercase text-white/80">COLLECTION ÉTÉ 2026</div>
                <h2 class="text-3xl sm:text-6xl font-black uppercase tracking-tighter leading-none mb-6">Équipez-vous pour l'action !</h2>
                <div class="inline-flex bg-card text-foreground text-xs font-bold px-8 py-3.5 rounded-full hover:bg-white hover:text-black transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">DÉCOUVRIR LES OFFRES &rarr;</div>
             </div>
           </div>

           <!-- FILTERS BAR -->
           <div *ngIf="selectedCategoryId !== null" class="flex flex-col gap-4 mb-6 relative z-30 pointer-events-auto">
              
              <!-- GENRE SELECTION PILLS (Conditional) -->
              <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                 <button 
                   (click)="selectGenre('')" 
                   class="px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border cursor-pointer relative z-30"
                   [ngClass]="!selectedGenre ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary'">
                   TOUT VOIR
                 </button>
                 <button 
                   *ngFor="let g of ['Homme', 'Femme', 'Enfant', 'Accessoires']"
                   (click)="selectGenre(g)" 
                   class="px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border cursor-pointer relative z-30"
                   [ngClass]="selectedGenre === g ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary'">
                   {{ g }}
                 </button>
              </div>

              <!-- SEARCH AND PRICE FILTERS -->
              <div class="bg-card border text-xs border-border rounded-xl p-3 flex gap-3 overflow-x-auto min-w-max hide-scrollbar shadow-sm items-center">
                 <div class="font-bold flex items-center shrink-0 uppercase tracking-wider text-muted-foreground mr-2">
                    <lucide-icon [img]="SearchIcon" [size]="16" class="mr-2"></lucide-icon> Filtres
                 </div>
                 <input type="text" [(ngModel)]="searchKeyword" (keyup.enter)="applyFilters()" placeholder="Mot clé..." class="w-32 h-9 px-3 bg-background border border-border rounded-lg focus:border-primary outline-none shrink-0 transition-colors hidden sm:block">
                 <input type="number" [(ngModel)]="minPrice" (keyup.enter)="applyFilters()" placeholder="Prix Min (€)" class="w-24 h-9 px-3 bg-background border border-border rounded-lg focus:border-primary outline-none shrink-0 transition-colors">
                 <input type="number" [(ngModel)]="maxPrice" (keyup.enter)="applyFilters()" placeholder="Prix Max (€)" class="w-24 h-9 px-3 bg-background border border-border rounded-lg focus:border-primary outline-none shrink-0 transition-colors">
                 <button (click)="applyFilters()" class="h-9 px-6 bg-primary text-primary-foreground font-bold rounded-lg shrink-0 uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer">Filtrer</button>
                 <button *ngIf="isAdmin" (click)="openAddModal()" class="h-9 px-4 bg-accent text-accent-foreground font-bold rounded-lg shrink-0 uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 ml-2 relative z-30">
                    <lucide-icon [img]="PlusIcon" [size]="14"></lucide-icon> Ajouter
                 </button>
              </div>
           </div>

           <div class="mb-6 flex items-center justify-between">
              <h2 class="text-xl sm:text-2xl font-black uppercase tracking-tighter text-foreground flex items-center gap-2">
                 {{ selectedCategoryId === null ? 'Nos Bonnes Affaires' : 'SÉLECTION' }}
                 <span *ngIf="selectedCategoryId === null" class="text-destructive">🔥</span>
              </h2>
              <div class="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">{{ products.length }} Articles</div>
           </div>



            <!-- Empty Products -->
            <div *ngIf="!loadingProducts && products.length === 0" class="bg-white border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center py-24 text-center px-4">
               <div class="text-5xl mb-4 opacity-50">📭</div>
               <h3 class="text-lg font-black mb-1 uppercase tracking-tighter">Aucun article ici</h3>
               <p class="text-gray-500 text-sm">Nous n'avons pas de produits correspondants.</p>
            </div>

           <!-- PRODUCT GRID (Vibrant SHEIN Structure) -->
           <div *ngIf="!loadingProducts && products.length > 0" class="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
              
              <div *ngFor="let prod of products" class="group relative flex flex-col bg-white hover:z-10 rounded-sm">
                 <a *ngIf="!isAdmin" [routerLink]="['/app/sponsors', prod.id]" class="absolute inset-0 z-10"></a>

                 <!-- Image Portrait Ratio -->
                 <div class="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden isolate">
                    <img *ngIf="prod.images && prod.images.length > 0" [src]="prod.images[0]" [alt]="prod.nom" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                    <div *ngIf="!prod.images || prod.images.length === 0" class="flex items-center justify-center w-full h-full text-5xl opacity-10">🛍️</div>
                    
                    <!-- Fast Add to Cart (Desktop Hover Only, Hidden for Admin) -->
                    <button 
                       *ngIf="!isAdmin"
                       (click)="addToCart(prod); $event.stopPropagation()"
                       [disabled]="prod.stock === 0 || ($any(prod).status && $any(prod).status !== 'EN_STOCK') || addingToCartId === prod.id"
                       class="absolute bottom-3 left-3 right-3 h-11 bg-primary/95 backdrop-blur-sm text-primary-foreground font-bold text-[11px] uppercase tracking-widest shadow-lg rounded-xl lg:opacity-0 lg:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20 flex items-center justify-center disabled:opacity-50 hover:bg-primary hover:shadow-primary/30">
                       <span *ngIf="addingToCartId !== prod.id">Ajout Rapide</span>
                       <lucide-icon *ngIf="addingToCartId === prod.id" [img]="Loader2Icon" [size]="16" class="animate-spin"></lucide-icon>
                    </button>

                  </div>

                  <!-- Admin buttons at CARD level (outside overflow-hidden isolate) -->
                  <div *ngIf="isAdmin" class="absolute bottom-0 left-0 right-0 flex gap-2 p-2" style="z-index:50">
                     <button type="button" (click)="editProduct(prod); $event.stopPropagation(); $event.preventDefault()" class="flex-1 h-10 bg-amber-500 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-xl flex items-center justify-center hover:bg-amber-600 active:scale-95 transition-all" style="position:relative;z-index:50">
                        &#x270F;&#xFE0F; Modifier
                     </button>
                     <button type="button" (click)="deleteProduct(prod.id); $event.stopPropagation(); $event.preventDefault()" class="h-10 w-10 bg-red-600 text-white rounded-xl flex items-center justify-center hover:bg-red-700 active:scale-95 transition-all shadow-xl" style="position:relative;z-index:50">
                        &#x1F5D1;&#xFE0F;
                     </button>
                  </div>

                 <!-- Favorite Heart -->
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

                 <!-- Status Badges -->
                 <div *ngIf="prod.stock < 5 && prod.stock > 0" class="absolute top-3 left-0 bg-destructive text-destructive-foreground text-[10px] font-black px-3 py-1 rounded-r-lg uppercase z-20 shadow-sm">Fast Out</div>
                 <div *ngIf="prod.stock === 0 || $any(prod).status === 'RUPTURE_DE_STOCK'" class="absolute top-3 left-0 bg-muted-foreground text-white text-[10px] font-black px-3 py-1 rounded-r-lg uppercase z-20 shadow-sm">Épuisé</div>
                 <div *ngIf="$any(prod).status === 'EN_ARRIVAGE'" class="absolute top-3 left-0 bg-accent text-accent-foreground text-[10px] font-black px-3 py-1 rounded-r-lg uppercase z-20 shadow-sm">Bientôt</div>

                 <!-- Info Details -->
                 <div class="py-4 px-4 flex flex-col flex-1">
                    <!-- Title -->
                    <div class="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors">{{ prod.nom }}</div>
                    
                    <!-- Price -->
                    <div class="flex items-center gap-2 mb-2 mt-auto">
                       <span class="text-lg sm:text-xl font-black text-foreground">{{ formatPrice(prod.prix) }}</span>
                    </div>

                    <!-- Category indicator -->
                    <div class="text-[10px] font-bold text-muted-foreground tracking-wider uppercase truncate">{{ prod.category?.nom || prod.category?.name || 'Vêtement' }}</div>
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
               <h2 class="text-xl font-bold">{{ editingId ? 'Modifier le produit' : 'Ajouter un produit' }}</h2>
               <button (click)="closeAddModal()" class="p-2 hover:bg-muted rounded-full transition-colors"><lucide-icon [img]="XIcon" [size]="20"></lucide-icon></button>
            </div>
            <form class="space-y-4">
               <div class="grid grid-cols-2 gap-4">
                  <div>
                     <label class="text-sm font-semibold">Nom</label>
                     <input type="text" [(ngModel)]="newProduct.nom" name="nom" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                  </div>
                  <div>
                     <label class="text-sm font-semibold">Marque</label>
                     <input type="text" [(ngModel)]="newProduct.marque" name="marque" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                  </div>
               </div>
               <div>
                  <label class="text-sm font-semibold">Description</label>
                  <textarea [(ngModel)]="newProduct.description" name="desc" rows="3" class="w-full p-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary"></textarea>
               </div>
               <div class="grid grid-cols-2 gap-4">
                  <div>
                     <label class="text-sm font-semibold">Prix (€)</label>
                     <input type="number" [(ngModel)]="newProduct.prix" name="prix" step="0.01" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                  </div>
                  <div>
                     <label class="text-sm font-semibold">Stock Initial</label>
                     <input type="number" [(ngModel)]="newProduct.stock" name="stock" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                  </div>
               </div>
               <div class="grid grid-cols-2 gap-4">
                  <div>
                     <label class="text-sm font-semibold">Catégorie</label>
                     <select [(ngModel)]="newProduct.categoryId" name="catId" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                        <option *ngFor="let cat of categories" [ngValue]="cat.id">{{ cat.nom || cat.name }}</option>
                     </select>
                  </div>
                  <div>
                     <label class="text-sm font-semibold">Statut du Produit</label>
                     <select [(ngModel)]="newProduct.status" name="status" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                        <option value="EN_STOCK">EN STOCK</option>
                        <option value="RUPTURE_DE_STOCK">RUPTURE DE STOCK</option>
                        <option value="EN_ARRIVAGE">EN ARRIVAGE</option>
                     </select>
                  </div>
               </div>
               <div>
                  <label class="text-sm font-semibold">URL de l'image (Optionnel)</label>
                  <input type="text" [(ngModel)]="newImageUrl" name="img" placeholder="https://..." class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
               </div>
            </form>
            <div class="mt-6 flex justify-end gap-3 border-t border-border pt-4">
               <button (click)="closeAddModal()" class="px-5 py-2.5 font-bold hover:bg-muted rounded-xl transition-colors">Annuler</button>
               <button (click)="submitNewProduct()" [disabled]="addingProduct" class="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 flex items-center gap-2">
                  <lucide-icon *ngIf="addingProduct" [img]="Loader2Icon" [size]="18" class="animate-spin"></lucide-icon>
                  {{ editingId ? 'Enregistrer les modifications' : 'Ajouter le produit' }}
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
                        <input type="text" [(ngModel)]="checkoutData.clientAddress" name="cAddress" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                     </div>
                     <div>
                        <label class="text-sm font-semibold">Postal Code</label>
                        <input type="text" [(ngModel)]="checkoutData.clientPostalCode" name="cPostal" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                     </div>
                     <div>
                        <label class="text-sm font-semibold">City</label>
                        <input type="text" [(ngModel)]="checkoutData.clientCity" name="cCity" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                     </div>
                  </div>

                  <h3 class="font-bold text-lg border-b border-border pb-2 mt-6">Delivery Mode</h3>
                  <div class="flex gap-4 flex-col sm:flex-row">
                     <label class="flex-1 p-4 border border-border rounded-xl flex items-center gap-3 cursor-pointer group hover:border-primary" [class.border-primary]="checkoutData.deliveryMode === 'LIVRAISON_DOMICILE'" [class.bg-primary]="checkoutData.deliveryMode === 'LIVRAISON_DOMICILE'" [class.bg-opacity-5]="checkoutData.deliveryMode === 'LIVRAISON_DOMICILE'">
                        <input type="radio" name="deliveryMode" [(ngModel)]="checkoutData.deliveryMode" value="LIVRAISON_DOMICILE" class="hidden">
                        <div class="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                           <div *ngIf="checkoutData.deliveryMode === 'LIVRAISON_DOMICILE'" class="w-2.5 h-2.5 bg-primary rounded-full"></div>
                        </div>
                        <div>
                           <div class="font-bold group-hover:text-primary">Home Delivery</div>
                           <div class="text-xs text-muted-foreground">{{ (cart?.total || cartTotal) >= 300 ? 'Free (Over 300€)' : '7€ Fee' }}</div>
                        </div>
                     </label>
                     <label class="flex-1 p-4 border border-border rounded-xl flex items-center gap-3 cursor-pointer group hover:border-primary" [class.border-primary]="checkoutData.deliveryMode === 'RETRAIT_MAGASIN'" [class.bg-primary]="checkoutData.deliveryMode === 'RETRAIT_MAGASIN'" [class.bg-opacity-5]="checkoutData.deliveryMode === 'RETRAIT_MAGASIN'">
                        <input type="radio" name="deliveryMode" [(ngModel)]="checkoutData.deliveryMode" value="RETRAIT_MAGASIN" class="hidden">
                        <div class="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                           <div *ngIf="checkoutData.deliveryMode === 'RETRAIT_MAGASIN'" class="w-2.5 h-2.5 bg-primary rounded-full"></div>
                        </div>
                        <div>
                           <div class="font-bold group-hover:text-primary">Store Pickup</div>
                           <div class="text-xs text-muted-foreground">Free</div>
                        </div>
                     </label>
                  </div>

                  <h3 class="font-bold text-lg border-b border-border pb-2 mt-6">Payment</h3>
                  <div class="flex gap-4 flex-col sm:flex-row">
                     <label class="flex-1 p-4 border border-border rounded-xl flex items-center gap-3 cursor-pointer group hover:border-primary" [class.border-primary]="checkoutData.paymentMode === 'ESPECE'" [class.bg-primary]="checkoutData.paymentMode === 'ESPECE'" [class.bg-opacity-5]="checkoutData.paymentMode === 'ESPECE'">
                        <input type="radio" name="paymentMode" [(ngModel)]="checkoutData.paymentMode" value="ESPECE" class="hidden">
                        <div class="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                           <div *ngIf="checkoutData.paymentMode === 'ESPECE'" class="w-2.5 h-2.5 bg-primary rounded-full"></div>
                        </div>
                        <div class="font-bold group-hover:text-primary">Cash on Delivery</div>
                     </label>
                     <label class="flex-1 p-4 border border-border rounded-xl flex items-center gap-3 cursor-pointer group hover:border-primary" [class.border-primary]="checkoutData.paymentMode === 'CARTE'" [class.bg-primary]="checkoutData.paymentMode === 'CARTE'" [class.bg-opacity-5]="checkoutData.paymentMode === 'CARTE'">
                        <input type="radio" name="paymentMode" [(ngModel)]="checkoutData.paymentMode" value="CARTE" class="hidden">
                        <div class="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                           <div *ngIf="checkoutData.paymentMode === 'CARTE'" class="w-2.5 h-2.5 bg-primary rounded-full"></div>
                        </div>
                        <div class="font-bold group-hover:text-primary">Online (Card)</div>
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
                  <span>{{ (checkoutData.deliveryMode === 'LIVRAISON_DOMICILE' && (cart?.total || cartTotal) < 300) ? '+ 7,00 €' : 'Free' }}</span>
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
                  <div class="flex items-center justify-between mb-3 border-b border-border pb-3">
                     <div>
                        <div class="text-xs text-muted-foreground">Order from {{ order.createdAt | date:'dd/MM/yyyy' }}</div>
                        <div class="font-bold text-primary">{{ formatPrice(order.total) }}</div>
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

   categories: Category[] = [];
   products: Product[] = [];

   loadingCategories = false;
   loadingProducts = false;
   selectedCategoryId: number | null = null;
   selectedGenre: string | null = null;
   addingToCartId: number | null = null;
   toast: string | null = null;

   // Search & Pagination State
   searchKeyword: string = '';
   minPrice: number | null = null;
   maxPrice: number | null = null;
   currentPage: number = 0;
   totalPages: number = 1;
   pageSize: number = 12;

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
      clientCity: '',
      clientPhone: '',
      deliveryMode: 'LIVRAISON_DOMICILE',
      paymentMode: 'ESPECE',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      clientEmail: ''
   };
   promoCodeInput = '';

   // Admin Add Product State
   isAddModalOpen = false;
   addingProduct = false;
   newImageUrl = '';
   editingId: number | null = null;
   newProduct: any = { nom: '', marque: '', description: '', prix: 0, stock: 10, categoryId: 0, images: [], status: 'EN_STOCK' };

   constructor(private productService: ProductService, private cdr: ChangeDetectorRef) { }

   get isAdmin(): boolean {
      return localStorage.getItem('user_type') === 'ROLE_ADMIN';
   }

   ngOnInit() {
      this.loadCategories();
      this.loadProducts();
      this.loadCart();
      this.loadFavorites();
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

      const keywordToUse = [this.selectedGenre, this.searchKeyword].filter(Boolean).join(' ') || null;

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
         this.selectedGenre = null;
         this.searchKeyword = '';
         this.minPrice = null;
         this.maxPrice = null;
         this.currentPage = 0;
         this.cdr.detectChanges();
         this.loadProducts();
         this.showToast('Filtrage sport...');
      } catch (e) {
         console.error('Error in selectCategory:', e);
      }
   }

   selectGenre(genre: string) {
      console.log('Interaction: selectGenre', genre);
      try {
         if (!genre) {
            this.selectedGenre = null;
         } else if (this.selectedGenre === genre) {
            this.selectedGenre = null;
         } else {
            this.selectedGenre = genre;
         }
         this.currentPage = 0;
         this.cdr.detectChanges();
         this.loadProducts();
         this.showToast('Filtrage genre...');
      } catch (e) {
         console.error('Error in selectGenre:', e);
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
      if (product.stock === 0 || ((product as any).status && (product as any).status !== 'EN_STOCK')) {
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

   get finalTotal(): number {
      let t = this.cart?.total || this.cartTotal;
      if (this.checkoutData.deliveryMode === 'LIVRAISON_DOMICILE' && t < 300) {
         t += 7;
      }
      return t;
   }

   openCheckout() {
      if (this.cartItemCount === 0) return;
      this.isCartOpen = false;
      this.isCheckoutOpen = true;
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
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
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
         categoryId: this.selectedCategoryId || (this.categories.length > 0 ? this.categories[0].id! : 0), 
         images: [],
         status: 'EN_STOCK'
      };
      this.newImageUrl = '';
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
               categoryId: fullProduct.category?.id || product.category?.id || (this.categories.length > 0 ? this.categories[0].id! : 0),
               images: [...(fullProduct.images || product.images || [])],
               status: fullProduct.status || product.status || 'EN_STOCK'
            };
            this.newImageUrl = (this.newProduct.images.length > 0) ? this.newProduct.images[0] : '';
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
               categoryId: product.category?.id || (this.categories.length > 0 ? this.categories[0].id! : 0),
               images: [...(product.images || [])],
               status: product.status || 'EN_STOCK'
            };
            this.newImageUrl = (this.newProduct.images.length > 0) ? this.newProduct.images[0] : '';
            this.cdr.detectChanges();
         }
      });
   }

   deleteProduct(id: number) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
         this.productService.deleteProduct(id).subscribe({
            next: () => {
               this.showToast('Produit supprimé avec succès');
               this.loadProducts();
            },
            error: (err) => {
               console.error('Error deleting product', err);
               this.showToast('Erreur lors de la suppression');
            }
         });
      }
   }

   submitNewProduct() {
      if (!this.newProduct.nom || this.newProduct.prix <= 0) {
         alert("Le nom et le prix (supérieur à 0) sont obligatoires.");
         return;
      }

      if (this.newImageUrl) {
         this.newProduct.images = [this.newImageUrl];
      } else {
         this.newProduct.images = [];
      }

      this.addingProduct = true;
      
      const obs = this.editingId 
         ? this.productService.updateProduct(this.editingId, this.newProduct)
         : this.productService.createProduct(this.newProduct);

      obs.subscribe({
         next: () => {
            this.addingProduct = false;
            this.closeAddModal();
            this.showToast(this.editingId ? 'Produit mis à jour avec succès !' : 'Produit ajouté avec succès !');
            this.loadProducts(); // Refresh list to show the new/updated product immediately
         },
         error: (err) => {
            console.error("Error saving product:", err);
            this.addingProduct = false;
            alert("Une erreur est survenue lors de l'enregistrement du produit.");
         }
      });
   }

   decreaseQuantity(item: any) {
      if (item.quantity > 1) {
         this.productService.updateCartItem(item.id, item.quantity - 1).subscribe({
            next: () => this.loadCart(),
            error: () => this.showToast("Error updating quantity")
         });
      } else {
         this.removeFromCart(item.id);
      }
   }

   increaseQuantity(item: any) {
      this.productService.updateCartItem(item.id, item.quantity + 1).subscribe({
         next: () => this.loadCart(),
         error: () => this.showToast("Insufficient stock for this item")
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
