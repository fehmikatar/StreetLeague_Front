import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ShoppingBag, ShoppingCart, Loader2, Search, ArrowRight, Tag, Star, X, Heart, Plus } from 'lucide-angular';
import { ProductService, Product, Category, ProductRequest } from '../services/product.service';

@Component({
  selector: 'app-sponsors',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Boutique Header -->
      <div class="relative overflow-hidden bg-card border-b border-border">
        <div class="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-background"></div>
        <div class="container mx-auto px-4 py-12 max-w-7xl relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              <lucide-icon [name]="TagIcon" [size]="16"></lucide-icon> Boutique Officielle
            </div>
            <h1 class="text-4xl font-bold mb-3">StreetLeague Store</h1>
            <p class="text-muted-foreground max-w-xl text-lg">
              Équipez-vous comme un pro avec nos équipements sportifs officiels. Des ballons aux maillots de qualité.
            </p>
          </div>
          <button (click)="isCartOpen = true" class="relative hidden md:flex h-24 w-24 rounded-3xl bg-gradient-to-br from-primary to-accent items-center justify-center shadow-2xl flex-shrink-0 hover:scale-105 transition-all cursor-pointer group">
             <lucide-icon [name]="ShoppingBagIcon" [size]="48" class="text-white group-hover:scale-110 transition-transform"></lucide-icon>
             <div *ngIf="cartItemCount > 0" class="absolute -top-3 -right-3 h-8 w-8 bg-destructive text-destructive-foreground rounded-full border-4 border-card flex items-center justify-center font-bold text-sm shadow-lg">
                {{ cartItemCount }}
             </div>
          </button>
        </div>
      </div>

      <div class="container mx-auto px-4 py-8 max-w-7xl">
        
        <!-- Loading Categories -->
        <div *ngIf="loadingCategories" class="flex items-center gap-2 mb-8 text-muted-foreground text-sm">
           <lucide-icon [name]="Loader2Icon" [size]="16" class="animate-spin"></lucide-icon> Chargement des catégories...
        </div>

        <!-- Categories Filter Row -->
        <div *ngIf="!loadingCategories && categories.length > 0" class="mb-8 overflow-x-auto pb-4 hide-scrollbar">
          <div class="flex gap-3">
            <button 
              (click)="selectCategory(null)"
              [class.bg-primary]="selectedCategoryId === null"
              [class.text-primary-foreground]="selectedCategoryId === null"
              [class.bg-card]="selectedCategoryId !== null"
              class="whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-medium border border-border shadow-sm hover:border-primary/50 transition-all">
              Toutes les catégories
            </button>
            <button 
              *ngFor="let cat of categories"
              (click)="selectCategory(cat.id!)"
              [class.bg-primary]="selectedCategoryId === cat.id"
              [class.text-primary-foreground]="selectedCategoryId === cat.id"
              [class.bg-card]="selectedCategoryId !== cat.id"
              class="whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-medium border border-border shadow-sm hover:border-primary/50 transition-all">
              {{ cat.nom || cat.name }}
            </button>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex flex-col min-h-[400px]">
          
          <!-- View: All Categories Hub -->
          <div *ngIf="!loadingCategories && selectedCategoryId === null" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let cat of categories" 
                 (click)="selectCategory(cat.id!)"
                 class="group bg-card rounded-3xl p-8 border border-border cursor-pointer hover:border-primary/50 hover:shadow-2xl transition-all flex flex-col items-center justify-center text-center shadow-sm">
               <div class="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300">
                 <lucide-icon [name]="TagIcon" [size]="36"></lucide-icon>
               </div>
               <h3 class="text-2xl font-bold group-hover:text-primary transition-colors">{{ cat.nom || cat.name }}</h3>
               <p class="text-muted-foreground mt-3">{{ cat.description || 'Découvrez nos équipements pour cette discipline.' }}</p>
               
               <div class="mt-8 flex items-center gap-2 text-sm font-bold text-primary bg-primary/5 px-4 py-2 rounded-lg">
                 Voir les articles <lucide-icon [name]="ArrowRightIcon" [size]="16" class="group-hover:translate-x-2 transition-transform"></lucide-icon>
               </div>
            </div>

            <!-- Empty Categories state -->
            <div *ngIf="categories.length === 0" class="col-span-full py-12 text-center text-muted-foreground">
               Aucune catégorie disponible.
            </div>
          </div>

          <!-- View: Products for selected category -->
          <ng-container *ngIf="selectedCategoryId !== null">
            
            <!-- Filter Bar -->
            <div class="bg-card border border-border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
              <div class="flex-1 relative">
                <lucide-icon [name]="SearchIcon" [size]="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
                <input type="text" [(ngModel)]="searchKeyword" (keyup.enter)="applyFilters()" placeholder="Rechercher un produit..." class="w-full h-11 pl-10 pr-4 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors">
              </div>
              <div class="flex gap-4">
                <input type="number" [(ngModel)]="minPrice" (keyup.enter)="applyFilters()" placeholder="Prix min (€)" class="w-28 h-11 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                <input type="number" [(ngModel)]="maxPrice" (keyup.enter)="applyFilters()" placeholder="Prix max (€)" class="w-28 h-11 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                <button (click)="applyFilters()" class="h-11 px-6 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors">Filtrer</button>
                <button *ngIf="isAdmin" (click)="openAddModal()" class="h-11 px-4 bg-accent text-accent-foreground font-bold rounded-xl hover:bg-accent/90 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap">
                   <lucide-icon [name]="PlusIcon" [size]="18"></lucide-icon> <span class="hidden sm:inline">Ajouter</span>
                </button>
              </div>
            </div>

            <!-- Loading Products -->
            <div *ngIf="loadingProducts" class="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
               <lucide-icon [name]="Loader2Icon" [size]="40" class="animate-spin text-primary/50"></lucide-icon>
               <p>Recherche des articles...</p>
            </div>

          <!-- Empty Products -->
          <div *ngIf="!loadingProducts && products.length === 0" class="flex-1 bg-card border border-dashed border-border rounded-3xl flex flex-col items-center justify-center py-20 text-center px-4">
             <div class="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <lucide-icon [name]="SearchIcon" [size]="32" class="text-muted-foreground"></lucide-icon>
             </div>
             <h3 class="text-xl font-bold mb-2">Aucun produit trouvé</h3>
             <p class="text-muted-foreground max-w-md">Nous n'avons pas encore de produits disponibles dans cette catégorie pour le moment.</p>
          </div>

          <!-- Product Grid -->
          <div *ngIf="!loadingProducts && products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div *ngFor="let prod of products" class="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all flex flex-col h-full">
              
              <!-- Product Image -->
              <div class="aspect-square bg-muted relative overflow-hidden group-hover:bg-primary/5 transition-colors flex items-center justify-center p-6">
                <!-- Favorite Heart Button -->
                <button 
                  (click)="toggleFavorite(prod); $event.stopPropagation()"
                  class="absolute top-3 right-3 h-9 w-9 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-background transition-colors z-20 shadow-sm"
                  [class.text-red-500]="isFavorite(prod.id)"
                  [class.bg-background]="isFavorite(prod.id)">
                  <lucide-icon [name]="HeartIcon" [size]="18" [class.fill-current]="isFavorite(prod.id)"></lucide-icon>
                </button>

                <img *ngIf="prod.images && prod.images.length > 0" [src]="prod.images[0]" [alt]="prod.nom" class="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500">
                <div *ngIf="!prod.images || prod.images.length === 0" class="text-6xl group-hover:scale-110 transition-transform duration-300">
                  🛒
                </div>
                
                <div *ngIf="prod.stock < 5 && prod.stock > 0" class="absolute top-3 left-3 bg-destructive/10 text-destructive text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm">
                  Plus que {{ prod.stock }} !
                </div>
                <div *ngIf="prod.stock === 0" class="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <span class="bg-card text-foreground font-bold px-4 py-2 rounded-xl shadow-lg border border-border">Rupture de stock</span>
                </div>
              </div>

              <!-- Product Info -->
              <div class="p-5 flex flex-col flex-1">
                <div class="flex items-start justify-between gap-2 mb-2">
                  <a [routerLink]="['/app/sponsors', prod.id]" class="font-bold text-lg leading-tight line-clamp-2 hover:text-primary transition-colors cursor-pointer text-foreground hover:underline">{{ prod.nom }}</a>
                </div>
                
                <div class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  {{ prod.category?.nom || prod.category?.name || 'Général' }}
                </div>
                
                <div class="mt-auto pt-4 flex items-center justify-between border-t border-border">
                  <div class="text-xl font-black text-foreground">{{ formatPrice(prod.prix) }}</div>
                  
                  <button 
                    (click)="addToCart(prod)"
                    [disabled]="prod.stock === 0 || addingToCartId === prod.id"
                    class="h-10 w-10 flex items-center justify-center bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 hover:shadow-lg shadow-primary/20 hover:-translate-y-1">
                    <lucide-icon *ngIf="addingToCartId !== prod.id" [name]="ShoppingCartIcon" [size]="18"></lucide-icon>
                    <lucide-icon *ngIf="addingToCartId === prod.id" [name]="Loader2Icon" [size]="18" class="animate-spin"></lucide-icon>
                  </button>
                </div>
              </div>

            </div>
          </div>
          </ng-container>

          <!-- Pagination -->
          <div *ngIf="selectedCategoryId !== null && totalPages > 1" class="flex items-center justify-center gap-4 mt-12 mb-8">
             <button (click)="prevPage()" [disabled]="currentPage === 0" class="px-5 py-2.5 bg-card border border-border rounded-xl font-bold hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Précédent</button>
             <span class="text-sm font-semibold text-muted-foreground">Page {{ currentPage + 1 }} sur {{ totalPages }}</span>
             <button (click)="nextPage()" [disabled]="currentPage >= totalPages - 1" class="px-5 py-2.5 bg-card border border-border rounded-xl font-bold hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Suivant</button>
          </div>
          
        </div>
      </div>

      <!-- Quick Add Product Modal (Admin Only) -->
      <div *ngIf="isAddModalOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
         <div class="absolute inset-0 bg-background/80 backdrop-blur-sm" (click)="closeAddModal()"></div>
         <div class="relative bg-card border border-border shadow-2xl rounded-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
            <div class="flex items-center justify-between mb-6">
               <h2 class="text-xl font-bold">Ajouter un produit</h2>
               <button (click)="closeAddModal()" class="p-2 hover:bg-muted rounded-full transition-colors"><lucide-icon [name]="XIcon" [size]="20"></lucide-icon></button>
            </div>
            <form class="space-y-4">
               <div>
                  <label class="text-sm font-semibold">Nom</label>
                  <input type="text" [(ngModel)]="newProduct.nom" name="nom" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
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
               <div>
                  <label class="text-sm font-semibold">Catégorie</label>
                  <select [(ngModel)]="newProduct.categoryId" name="catId" class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                     <option *ngFor="let cat of categories" [ngValue]="cat.id">{{ cat.nom || cat.name }}</option>
                  </select>
               </div>
               <div>
                  <label class="text-sm font-semibold">URL de l'image (Optionnel)</label>
                  <input type="text" [(ngModel)]="newImageUrl" name="img" placeholder="https://..." class="w-full h-11 px-3 mt-1 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
               </div>
            </form>
            <div class="mt-6 flex justify-end gap-3 border-t border-border pt-4">
               <button (click)="closeAddModal()" class="px-5 py-2.5 font-bold hover:bg-muted rounded-xl transition-colors">Annuler</button>
               <button (click)="submitNewProduct()" [disabled]="addingProduct" class="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 flex items-center gap-2">
                  <lucide-icon *ngIf="addingProduct" [name]="Loader2Icon" [size]="18" class="animate-spin"></lucide-icon>
                  Ajouter le produit
               </button>
            </div>
         </div>
      </div>

      <!-- Toast Notification -->
      <div *ngIf="toast" class="fixed bottom-6 right-6 bg-card border border-border rounded-xl px-5 py-4 shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
        <div class="h-8 w-8 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center shrink-0">
          ✓
        </div>
        <p class="text-sm font-medium pr-4">{{ toast }}</p>
      </div>

      <!-- Floating Mobile Cart Button -->
      <button 
        *ngIf="cartItemCount > 0"
        (click)="isCartOpen = true" 
        class="md:hidden fixed bottom-24 right-6 h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center z-40 hover:scale-105 transition-transform cursor-pointer">
        <lucide-icon [name]="ShoppingCartIcon" [size]="24"></lucide-icon>
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
                 <lucide-icon [name]="ShoppingCartIcon" [size]="20"></lucide-icon>
              </div>
              <h2 class="text-xl font-bold">Mon Panier</h2>
              <span class="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs font-bold">{{ cartItemCount }}</span>
           </div>
           <button (click)="isCartOpen = false" class="h-10 w-10 bg-muted/50 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
              <lucide-icon [name]="XIcon" [size]="20"></lucide-icon>
           </button>
        </div>

        <!-- Drawer Content (Items) -->
        <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
           <div *ngIf="!cart || !cart.items || cart.items.length === 0" class="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
              <lucide-icon [name]="ShoppingBagIcon" [size]="48" class="opacity-20"></lucide-icon>
              <p>Votre panier est vide.</p>
              <button (click)="isCartOpen = false" class="px-6 py-2 bg-primary text-primary-foreground rounded-xl mt-2 font-medium">
                 Reprendre mes achats
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
                  <div class="text-xs text-muted-foreground mt-1 mb-auto">Quantité: {{ item.quantity }}</div>
                  <div class="font-black text-primary">{{ formatPrice(item.price * item.quantity) }}</div>
                </div>
                <!-- Remove item button -->
                <button (click)="removeFromCart(item.id)" class="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 p-1 bg-card rounded-full shadow-sm hover:bg-background">
                   <lucide-icon [name]="XIcon" [size]="16"></lucide-icon>
                </button>
             </div>
           </ng-container>
        </div>

        <!-- Drawer Footer (Total & Checkout) -->
        <div *ngIf="cart && cart.items && cart.items.length > 0" class="p-6 border-t border-border bg-card">
           <div class="flex items-center justify-between mb-4">
              <span class="text-muted-foreground">Total à payer</span>
              <span class="text-2xl font-black">{{ formatPrice(cartTotal) }}</span>
           </div>
           <button class="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all hover:shadow-lg shadow-primary/25 hover:-translate-y-1">
              Commander maintenant <lucide-icon [name]="ArrowRightIcon" [size]="20"></lucide-icon>
           </button>
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
  readonly TagIcon = Tag;
  readonly StarIcon = Star;
  readonly XIcon = X;
  readonly HeartIcon = Heart;
  readonly PlusIcon = Plus;

  categories: Category[] = [];
  products: Product[] = [];
  
  loadingCategories = false;
  loadingProducts = false;
  selectedCategoryId: number | null = null;
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
  cart: any = null;
  cartItemCount = 0;
  favoriteProductIds: Set<number> = new Set();

  // Admin Add Product State
  isAddModalOpen = false;
  addingProduct = false;
  newImageUrl = '';
  newProduct: ProductRequest = { nom: '', description: '', prix: 0, stock: 10, categoryId: 0, images: [] };

  constructor(private productService: ProductService) {}

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
      error: (err) => console.error('Erreur chargement panier', err)
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
      error: (err) => console.error('Erreur chargement favoris', err)
    });
  }

  loadCategories() {
    this.loadingCategories = true;
    this.productService.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res;
        this.loadingCategories = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement catégories', err);
        this.loadingCategories = false;
      }
    });
  }

  loadProducts() {
    if (this.selectedCategoryId === null) {
      this.products = [];
      return;
    }

    this.loadingProducts = true;
    
    const criteria = {
      categoryId: this.selectedCategoryId,
      keyword: this.searchKeyword || null,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice
    };

    const requestArgs = this.productService.searchProducts(criteria, this.currentPage, this.pageSize);

    requestArgs.subscribe({
      next: (res: any) => {
        let fetched = res.content || res as any; // Handle Pagination structure vs raw list
        if (!fetched) {
           fetched = [];
        }
        if (res.totalPages !== undefined) {
           this.totalPages = res.totalPages;
        }
        this.products = fetched;
        this.loadingProducts = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement produits', err);
        this.loadingProducts = false;
        this.products = [];
      }
    });
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

  selectCategory(categoryId: number | null) {
    if (this.selectedCategoryId === categoryId) return;
    this.selectedCategoryId = categoryId;
    this.searchKeyword = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.currentPage = 0;
    this.loadProducts();
  }

  addToCart(product: Product) {
    if (product.stock === 0) return;
    
    this.addingToCartId = product.id;
    this.productService.addToCart(product.id, 1).subscribe({
      next: () => {
        this.addingToCartId = null;
        this.showToast(`${product.nom} ajouté au panier !`);
        this.loadCart(); // reload immediately
      },
      error: (err: any) => {
        console.error(err);
        this.addingToCartId = null;
        this.showToast("❌ Erreur lors de l'ajout au panier");
      }
    });
  }

  removeFromCart(itemId: number) {
    this.productService.removeFromCart(itemId).subscribe({
       next: () => {
          this.showToast('Article retiré du panier');
          this.loadCart();
       },
       error: () => this.showToast('Erreur lors du retrait')
    });
  }

  isFavorite(productId: number): boolean {
    return this.favoriteProductIds.has(productId);
  }

  toggleFavorite(product: Product) {
    if (this.isFavorite(product.id)) {
      this.favoriteProductIds.delete(product.id);
      this.productService.removeFromFavorites(product.id).subscribe({
        next: () => this.showToast(`${product.nom} retiré des favoris`),
        error: () => {
           this.favoriteProductIds.add(product.id);
           this.showToast('Erreur lors du retrait des favoris');
        }
      });
    } else {
      this.favoriteProductIds.add(product.id);
      this.productService.addToFavorites(product.id).subscribe({
         next: (res) => {
            if (res !== null) {
               this.showToast(`${product.nom} ajouté aux listes de souhaits ❤️`);
            }
         },
         error: () => {
            this.favoriteProductIds.delete(product.id);
            this.showToast('Erreur lors de l\'ajout aux favoris');
         }
      });
    }
  }

  get cartTotal(): number {
    if (!this.cart || !this.cart.items) return 0;
    return this.cart.items.reduce((acc: number, item: any) => acc + ((item.price || 0) * item.quantity), 0);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  }

  // --- Admin Methods ---
  openAddModal() {
    this.newProduct = { 
       nom: '', 
       description: '', 
       prix: 0, 
       stock: 10, 
       categoryId: this.selectedCategoryId || (this.categories.length > 0 ? this.categories[0].id! : 0), 
       images: [] 
    };
    this.newImageUrl = '';
    this.isAddModalOpen = true;
  }

  closeAddModal() {
    this.isAddModalOpen = false;
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
     
     this.productService.createProduct(this.newProduct).subscribe({
        next: () => {
           this.addingProduct = false;
           this.closeAddModal();
           this.showToast('Produit ajouté avec succès !');
           this.loadProducts(); // Refresh list to show the new product immediately
        },
        error: (err) => {
           console.error("Error creating product:", err);
           this.addingProduct = false;
           alert("Une erreur est survenue lors de l'ajout du produit.");
        }
     });
  }

  showToast(msg: string) {
    this.toast = msg;
    setTimeout(() => this.toast = null, 3000);
  }

}
