import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Heart, HeartCrack, ShoppingCart, Loader2, Star, Tag, Folder, Plus, X, FolderHeart, ArrowRight, Trash2, Search, Filter, AlertTriangle, Bell } from 'lucide-angular';
import { ProductService, Product, FavoriteResponse, FavoriteCategory } from '../services/product.service';
import { RealTimeNotificationService } from '../services/real-time-notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background flex flex-col md:flex-row">
      
      <!-- Sidebar Categories -->
      <div class="w-full md:w-80 bg-card border-r border-border md:min-h-[calc(100vh-80px)] p-6 shrink-0 flex flex-col select-none">
        
        <div class="flex items-center gap-3 mb-8">
           <div class="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <lucide-icon [img]="HeartIcon" [size]="24" class="fill-current"></lucide-icon>
           </div>
           <div>
              <h1 class="text-xl font-black">Wishlist</h1>
              <p class="text-xs text-muted-foreground">Manage your favorite equipment</p>
           </div>
        </div>

        <!-- Advanced Search Multi-table -->
        <div class="mb-8 p-4 bg-muted/30 rounded-2xl border border-border">
          <h3 class="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 px-1">Advanced Search</h3>
          <div class="space-y-3">
            <div class="relative">
              <lucide-icon [img]="SearchIcon" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
              <input 
                type="text" 
                [(ngModel)]="searchProductName" 
                (input)="onSearch()"
                placeholder="Product name..." 
                class="w-full h-9 pl-9 pr-3 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary">
            </div>
            <div class="relative">
              <lucide-icon [img]="FilterIcon" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
              <input 
                type="text" 
                [(ngModel)]="searchCategoryName" 
                (input)="onSearch()"
                placeholder="Category name..." 
                class="w-full h-9 pl-9 pr-3 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary">
            </div>
          </div>
        </div>

        <div class="space-y-1">
           <!-- All Favorites -->
           <button 
             (click)="selectCategory(null)"
             [class.bg-primary]="selectedCategoryId === null && !showLowStockOnly"
             [class.text-primary-foreground]="selectedCategoryId === null && !showLowStockOnly"
             [class.hover:bg-muted]="selectedCategoryId !== null || showLowStockOnly"
             class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-left">
             <lucide-icon [img]="FolderHeartIcon" [size]="18" [class.text-primary]="selectedCategoryId !== null || showLowStockOnly"></lucide-icon>
             All My Favorites
           </button>

           <!-- Low Stock Alert Filter -->
           <button 
             (click)="toggleLowStockFilter()"
             [class.bg-amber-500]="showLowStockOnly"
             [class.text-white]="showLowStockOnly"
             [class.hover:bg-muted]="!showLowStockOnly"
             class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-left mt-1">
             <lucide-icon [img]="AlertTriangleIcon" [size]="18" [class.text-amber-500]="!showLowStockOnly"></lucide-icon>
             Almost Out of Stock
           </button>


           <div class="pt-6 pb-2">
              <span class="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-4">My Collections</span>
           </div>

           <!-- Loading Categories -->
           <div *ngIf="loadingCategories" class="flex justify-center py-4">
              <lucide-icon [img]="Loader2Icon" [size]="20" class="animate-spin text-primary/50"></lucide-icon>
           </div>

           <!-- Dynamic Categories -->
           <button 
             *ngFor="let cat of categories"
             (click)="selectCategory(cat.id)"
             [class.bg-primary]="selectedCategoryId === cat.id"
             [class.text-primary-foreground]="selectedCategoryId === cat.id"
             [class.hover:bg-muted]="selectedCategoryId !== cat.id"
             class="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold text-left group">
             <div class="flex items-center gap-3 truncate pr-2">
               <lucide-icon [img]="FolderIcon" [size]="18" [class.text-primary]="selectedCategoryId !== cat.id"></lucide-icon>
               <span class="truncate">{{ cat.name }}</span>
             </div>
             <lucide-icon [img]="ArrowRightIcon" [size]="16" class="opacity-0 group-hover:opacity-100 transition-opacity" [class.hidden]="selectedCategoryId === cat.id"></lucide-icon>
           </button>
        </div>

        <button (click)="openCreateModal()" class="mt-8 w-full flex items-center justify-center gap-2 border-2 border-dashed border-border py-4 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all font-bold">
           <lucide-icon [img]="PlusIcon" [size]="20"></lucide-icon> New List
        </button>
      </div>

      <!-- Main Content -->
      <div class="flex-1 p-6 md:p-10">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-bold">
             {{ selectedCategoryName }}
          </h2>
          <div *ngIf="showLowStockOnly" class="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-bold animate-pulse">
            <lucide-icon [img]="AlertTriangleIcon" [size]="16"></lucide-icon>
            Limited Availability Items
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loadingList" class="flex justify-center p-20">
           <lucide-icon [img]="Loader2Icon" [size]="48" class="animate-spin text-primary/50"></lucide-icon>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loadingList && favorites.length === 0" class="bg-card rounded-3xl p-16 text-center border border-dashed border-border flex flex-col items-center justify-center max-w-2xl mx-auto shadow-sm">
           <div class="h-24 w-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
              <lucide-icon [img]="HeartCrackIcon" [size]="40" class="text-muted-foreground/50"></lucide-icon>
           </div>
           <h2 class="text-2xl font-bold mb-3">No matching items</h2>
           <p class="text-muted-foreground text-lg mb-8">Try adjusting your search filters or browse the store!</p>
           <a routerLink="/app/sponsors" class="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:-translate-y-1">
              Explore Store
           </a>
        </div>

        <!-- Favorites Grid -->
        <div *ngIf="!loadingList && favorites.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div *ngFor="let fav of favorites" class="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all flex flex-col h-full relative">
              
              <!-- Low Stock Banner -->
              <div *ngIf="fav.product.stock > 0 && fav.product.stock <= 6" class="absolute top-0 left-0 right-0 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-3 z-40 flex items-center justify-center gap-1.5 shadow-sm">
                <lucide-icon [img]="AlertTriangleIcon" [size]="12"></lucide-icon>
                Almost Sold Out! Only {{ fav.product.stock }} Left
              </div>

              <!-- Manage Dropdown overlay -->
              <div class="absolute top-3 left-3 z-30" [class.mt-6]="fav.product.stock > 0 && fav.product.stock <= 6">
                 <select 
                    (change)="onMoveFavorite(fav.id, $event)"
                    class="h-9 truncate pl-3 pr-8 bg-background/80 backdrop-blur-sm focus:outline-none focus:ring-2 ring-primary rounded-xl text-xs font-bold shadow-sm border border-border cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Move to a collection...">
                    <option value="" disabled selected>📦 Move...</option>
                    <option [value]="0">All My Favorites</option>
                    <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
                 </select>
              </div>

              <!-- Remove Favorite Button -->
              <button 
                (click)="removeFromFavorites(fav.product.id)"
                class="absolute top-3 right-3 h-9 w-9 bg-destructive/10 backdrop-blur-sm rounded-full flex items-center justify-center text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all z-20 shadow-sm opacity-0 group-hover:opacity-100"
                [class.mt-6]="fav.product.stock > 0 && fav.product.stock <= 6">
                <lucide-icon [img]="Trash2Icon" [size]="16"></lucide-icon>
              </button>

              <!-- Product Image -->
              <div class="aspect-square bg-muted relative overflow-hidden flex items-center justify-center p-6 cursor-pointer" [routerLink]="['/app/sponsors', fav.product.id]">
                <img *ngIf="fav.product.images && fav.product.images.length > 0" [src]="fav.product.images[0]" class="object-contain w-full h-full">
                <div *ngIf="!fav.product.images || fav.product.images.length === 0" class="text-6xl">
                  🛒
                </div>
              </div>

              <!-- Product Info -->
              <div class="p-5 flex flex-col flex-1">
                <div class="flex items-center justify-between mb-1">
                  <div class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {{ fav.product.category?.nom || fav.product.category?.name || 'Équipement' }}
                  </div>
                  <div *ngIf="fav.category" class="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full truncate max-w-[100px]">
                    {{ fav.category.name }}
                  </div>
                </div>
                
                <a [routerLink]="['/app/sponsors', fav.product.id]" class="font-bold text-lg leading-tight line-clamp-2 mb-3 hover:text-primary transition-colors cursor-pointer text-foreground hover:underline">
                  {{ fav.product.nom }}
                </a>
                
                <!-- Stock Status Tag -->
                <div *ngIf="fav.product.stock > 0 && fav.product.stock <= 6" class="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-[10px] font-bold w-fit">
                  <lucide-icon [img]="AlertTriangleIcon" [size]="12"></lucide-icon>
                  High Demand - Order Soon
                </div>

                <div class="mt-auto pt-4 flex items-center justify-between border-t border-border">
                  <div class="text-xl font-black text-foreground">{{ formatPrice(fav.product.prix) }}</div>
                  
                  <button 
                    (click)="addToCart(fav.product)"
                    class="h-10 px-4 flex items-center gap-2 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:shadow-primary/25 hover:-translate-y-0.5"
                    [disabled]="addingToCartId === fav.product.id">
                    <lucide-icon *ngIf="addingToCartId !== fav.product.id" [img]="ShoppingCartIcon" [size]="18"></lucide-icon>
                    <lucide-icon *ngIf="addingToCartId === fav.product.id" [img]="Loader2Icon" [size]="18" class="animate-spin"></lucide-icon>
                    <span class="text-sm">Cart</span>
                  </button>
                </div>
              </div>

            </div>
        </div>
      </div>
      
      <!-- Create Category Modal -->
      <div *ngIf="isCreateModalOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
         <div class="absolute inset-0 bg-background/80 backdrop-blur-sm" (click)="closeCreateModal()"></div>
         <div class="relative bg-card border border-border shadow-2xl rounded-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 class="text-xl font-bold mb-4">New Collection</h3>
            <p class="text-sm text-muted-foreground mb-4">Give a name to your new wishlist to organize your finds.</p>
            <input type="text" [(ngModel)]="newCategoryName" placeholder="Ex: Soccer Gear..." class="w-full h-11 px-4 bg-background border border-border rounded-xl mb-6 focus:outline-none focus:border-primary font-medium" (keyup.enter)="submitCategory()">
            
            <div class="flex gap-3">
               <button (click)="closeCreateModal()" class="flex-1 py-2.5 font-bold hover:bg-muted rounded-xl transition-colors">Cancel</button>
               <button (click)="submitCategory()" [disabled]="creatingCategory || !newCategoryName.trim()" class="flex-1 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
                  Create List
               </button>
            </div>
         </div>
      </div>

      <!-- Toast Notification -->
      <div *ngIf="toastMessage" class="fixed bottom-6 right-6 bg-card border border-border rounded-xl px-5 py-4 shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
        <div class="h-8 w-8 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center shrink-0">✓</div>
        <p class="text-sm font-medium pr-4">{{ toastMessage }}</p>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;  
      overflow: hidden;
    }
  `]
})
export class FavoritesComponent implements OnInit, OnDestroy {
  readonly HeartIcon = Heart;
  readonly HeartCrackIcon = HeartCrack;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly Loader2Icon = Loader2;
  readonly StarIcon = Star;
  readonly TagIcon = Tag;
  readonly FolderIcon = Folder;
  readonly FolderHeartIcon = FolderHeart;
  readonly PlusIcon = Plus;
  readonly XIcon = X;
  readonly ArrowRightIcon = ArrowRight;
  readonly Trash2Icon = Trash2;
  readonly SearchIcon = Search;
  readonly FilterIcon = Filter;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly BellIcon = Bell;

  private notificationSubscription: Subscription | null = null;

  triggeringCheck = false;

  favorites: FavoriteResponse[] = [];
  categories: FavoriteCategory[] = [];
  selectedCategoryId: number | null = null;
  searchProductName = '';
  searchCategoryName = '';
  showLowStockOnly = false;

  loadingList = true;
  loadingCategories = true;

  isCreateModalOpen = false;
  newCategoryName = '';
  creatingCategory = false;

  addingToCartId: number | null = null;
  toastMessage: string | null = null;

  constructor(
    private productService: ProductService,
    private realTimeNotifService: RealTimeNotificationService
  ) { }

  ngOnInit() {
    this.loadCategories();
    this.loadFavorites();
    this.listenForUpdates();
  }

  get selectedCategoryName(): string {
    if (this.showLowStockOnly) return 'Low Stock Alerts';
    if (this.selectedCategoryId === -1) return 'Search Results';
    if (this.selectedCategoryId === null) return 'All My Favorites';
    const cat = this.categories.find(c => c.id === this.selectedCategoryId);
    return cat ? cat.name : 'My List';
  }

  loadCategories() {
    this.loadingCategories = true;
    this.productService.getFavoriteCategories().subscribe({
      next: (res) => {
        this.categories = res || [];
        this.loadingCategories = false;
      },
      error: () => this.loadingCategories = false
    });
  }

  toggleLowStockFilter() {
    this.showLowStockOnly = !this.showLowStockOnly;
    if (this.showLowStockOnly) {
      this.selectedCategoryId = null;
      this.searchProductName = '';
      this.searchCategoryName = '';
      this.loadLowStockFavorites();
    } else {
      this.loadFavorites();
    }
  }

  loadLowStockFavorites() {
    this.loadingList = true;
    this.productService.getLowStockFavorites().subscribe({
      next: (res) => {
        this.favorites = (res || []).map(p => ({ id: 0, product: p }));
        this.loadingList = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingList = false;
      }
    });
  }

  loadFavorites() {
    this.loadingList = true;
    if (this.selectedCategoryId === null) {
      this.productService.getMyFavorites(0, 500).subscribe({
        next: (res) => {
          this.favorites = (res as any).content || res || [];
          this.loadingList = false;
        },
        error: (err) => {
          console.error(err);
          this.loadingList = false;
        }
      });
    } else {
      this.productService.getFavoritesByCategory(this.selectedCategoryId).subscribe({
        next: (res) => {
          this.favorites = res || [];
          this.loadingList = false;
        },
        error: (err) => {
          console.error(err);
          this.loadingList = false;
        }
      });
    }
  }

  onSearch() {
    if (!this.searchProductName && !this.searchCategoryName) {
      this.loadFavorites();
      return;
    }

    this.showLowStockOnly = false;
    this.loadingList = true;
    this.productService.searchFavorites(this.searchProductName, this.searchCategoryName).pipe().subscribe({
      next: (res) => {
        this.favorites = res || [];
        this.loadingList = false;
        this.selectedCategoryId = -1; // Marker for search
      },
      error: (err) => {
        console.error(err);
        this.loadingList = false;
      }
    });
  }

  selectCategory(id: number | null) {
    if (this.selectedCategoryId === id && !this.showLowStockOnly) return;
    this.selectedCategoryId = id;
    this.showLowStockOnly = false;
    this.searchProductName = '';
    this.searchCategoryName = '';
    this.loadFavorites();
  }

  openCreateModal() {
    this.newCategoryName = '';
    this.isCreateModalOpen = true;
  }

  closeCreateModal() {
    this.isCreateModalOpen = false;
  }

  submitCategory() {
    if (!this.newCategoryName.trim()) return;
    this.creatingCategory = true;
    this.productService.createFavoriteCategory(this.newCategoryName).subscribe({
      next: (cat) => {
        this.categories.push(cat);
        this.creatingCategory = false;
        this.closeCreateModal();
        this.showToast('List created successfully!');
      },
      error: () => {
        this.creatingCategory = false;
        this.showToast('Error creating list');
      }
    });
  }

  onMoveFavorite(favId: number, event: any) {
    const value = event.target.value;
    if (value === "") return;
    const catId = +value;

    this.productService.categorizeFavorite(favId, catId).subscribe({
      next: () => {
        this.showToast('Item moved!');
        if (this.selectedCategoryId !== null && catId !== this.selectedCategoryId) {
          this.favorites = this.favorites.filter(f => f.id !== favId);
        } else {
          // Update local favorite state if needed
          const fav = this.favorites.find(f => f.id === favId);
          if (fav) {
             const newCat = this.categories.find(c => c.id === catId);
             fav.category = newCat;
          }
        }
      },
      error: () => {
        this.showToast('Error while moving');
        event.target.value = ""; 
      }
    });
  }

  removeFromFavorites(productId: number | undefined) {
    if (!productId) return;
    this.productService.removeFromFavorites(productId).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(f => f.product?.id !== productId);
        this.showToast('Item removed from favorites');
      },
      error: () => this.showToast('Error removing item')
    });
  }

  addToCart(product: Product | undefined) {
    if (!product) return;
    this.addingToCartId = product.id;
    this.productService.addToCart(product.id, 1).subscribe({
      next: () => {
        this.addingToCartId = null;
        this.showToast(`${product.nom} added to cart`);
      },
      error: () => {
        this.addingToCartId = null;
        this.showToast("Error adding to cart");
      }
    });
  }

  formatPrice(price: number | undefined): string {
    if (price === undefined || price === null) return '0,00 DT';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(price).replace('TND', 'DT');
  }

  triggerManualCheck() {
    this.triggeringCheck = true;
    this.productService.triggerStockCheck().subscribe({
      next: () => {
        this.triggeringCheck = false;
        this.showToast('Stock check triggered! Real-time notifications will be sent for low-stock items.');
        // Refresh the list as well to show potential new banner
        this.loadFavorites();
      },
      error: (err) => {
        this.triggeringCheck = false;
        console.error(err);
        this.showToast('Failed to trigger stock check');
      }
    });
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    setTimeout(() => this.toastMessage = null, 3000);
  }

  listenForUpdates(): void {
    this.notificationSubscription = this.realTimeNotifService.messages$.subscribe(msg => {
      if (msg && (msg.type === 'PRODUCT_UPDATE' || msg.type === 'LOW_STOCK' || msg.type === 'ORDER_UPDATE')) {
        console.log('FavoritesComponent: Real-time update received:', msg);
        this.loadFavorites(); 
      }
    });
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }
}
