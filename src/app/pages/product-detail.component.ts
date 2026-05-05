import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Heart, ShoppingCart, Loader2, Star, Truck, ShieldCheck, Undo2, Search, Plus, Minus, AlertCircle, ShoppingBag, Sparkles } from 'lucide-angular';
import { ProductService, Product, ProductVariant } from '../services/product.service';
import { catchError, finalize, map, switchMap, take, takeUntil, timeout, tap } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
  template: `
    <div class="min-h-screen bg-background pb-20 font-sans">
      
      <!-- Top Navigation -->
      <div class="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div class="container mx-auto px-4 h-14 flex items-center justify-between">
           <button type="button" (click)="goBack()" class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors cursor-pointer">
              <lucide-icon [name]="ArrowLeftIcon" [size]="16"></lucide-icon>
              Back to Shop
           </button>
           <span class="text-[10px] font-bold text-muted-foreground opacity-30">{{ debugInfo }}</span>
        </div>
      </div>

      <!-- Loading State (Non-blocking) -->
      <div *ngIf="loading" class="flex flex-col items-center justify-center min-h-[60vh]">
         <div class="loader-static"></div>
         <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-4">Loading...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="!loading && errorMessage" class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
         <div class="h-16 w-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mb-6">
            <lucide-icon [name]="AlertCircleIcon" [size]="32"></lucide-icon>
         </div>
         <h2 class="text-2xl font-black mb-2 uppercase tracking-tighter">Oops! Loading error</h2>
         <p class="text-muted-foreground mb-8 max-w-sm text-sm">{{ errorMessage }}</p>
         <button type="button" (click)="loadProduct()" class="btn-static px-8 h-12 bg-primary text-black font-black uppercase text-xs cursor-pointer">RETRY</button>
      </div>

      <!-- Product Detail (Stable Layout) -->
      <div *ngIf="!loading && product" class="container mx-auto px-4 py-8 max-w-7xl">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <!-- LEFT: Image (Static) -->
          <div class="space-y-6">
             <div class="bg-card border border-border rounded-lg overflow-hidden aspect-square flex items-center justify-center p-8 relative">
                <div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <span *ngIf="product.stock === 0" class="bg-black text-white px-3 py-1 text-[9px] font-black uppercase">Out of Stock</span>
                  <span *ngIf="product.stock > 0 && product.stock < 10" class="bg-red-600 text-white px-3 py-1 text-[9px] font-black uppercase">Low Stock</span>
                </div>
                <img *ngIf="currentImage" [src]="currentImage" [alt]="product.nom" class="w-full h-full object-contain">
                <div *ngIf="!currentImage" class="text-6xl opacity-10">📦</div>
             </div>

             <!-- Static Miniatures -->
             <div *ngIf="product.images && product.images.length > 1" class="flex gap-3 overflow-x-auto pb-2">
                <button type="button" *ngFor="let img of product.images" 
                        (click)="setCurrentImage(img); cdr.detectChanges()"
                        class="w-20 h-20 rounded border-2 transition-all p-1 bg-white shrink-0 cursor-pointer"
                        [class.border-primary]="currentImage === img"
                        [class.border-border]="currentImage !== img">
                   <img [src]="img" class="w-full h-full object-contain">
                </button>
             </div>
          </div>

          <!-- RIGHT: Content (Static) -->
          <div class="flex flex-col">
             <div class="mb-4">
                <span class="text-[10px] font-black uppercase tracking-widest text-primary">{{ product.category?.nom || 'Sport' }}</span>
                <h1 class="text-4xl font-black text-foreground uppercase tracking-tighter mt-1">{{ product.nom }}</h1>
                <p *ngIf="product.marque" class="text-xs font-bold text-muted-foreground uppercase mt-1">Brand : {{ product.marque }}</p>
             </div>

             <div class="flex items-center gap-4 mb-8">
                <span class="text-3xl font-black text-primary">{{ formatPrice(selectedPrice) }}</span>
                <span class="h-4 w-px bg-border"></span>
                  <span *ngIf="($any(product).status === 'EN_STOCK' || $any(product).status === 'IN_STOCK' || !$any(product).status) && product.stock > 0" class="text-[10px] font-bold text-green-600 uppercase">✓ In Stock</span>
                  <span *ngIf="$any(product).status === 'RUPTURE_DE_STOCK' || product.stock === 0" class="text-[10px] font-bold text-red-600 uppercase">✗ Sold Out</span>
                  <span *ngIf="($any(product).status === 'ARRIVING_SOON' || $any(product).status === 'EN_ARRIVAGE') && product.stock > 0" class="text-[10px] font-bold text-amber-500 uppercase">⏳ Coming Soon</span>
             </div>

             <div class="prose prose-sm mb-10 text-muted-foreground font-medium">
                {{ product.description }}
                <div *ngIf="debugInfo" class="mt-1 text-[8px] opacity-40">{{ debugInfo }}</div>
                
                <div class="mt-4 pt-4 border-t border-border/50">
                    <span class="uppercase tracking-wider text-[10px] font-black text-muted-foreground">Available Sizes:</span>
                    <span *ngIf="sizeVariants.length > 0" class="ml-2 font-bold text-foreground text-sm">{{ sizeVariants.join(', ') }}</span>
                    <span *ngIf="sizeVariants.length === 0" class="ml-2 font-bold text-foreground text-sm uppercase">XS, S, M, L, XL, 2XL, 3XL, 4XL, 5XL</span>
                </div>
             </div>

             <!-- Selection & Actions -->
             <div class="space-y-8 border-t border-border pt-8">
                
                 <div *ngIf="sizeVariants.length > 0" class="mb-6">
                    <h3 class="text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                       Size : <span class="text-primary">{{ selectedSize || 'Select' }}</span>
                    </h3>
                    <div class="flex flex-wrap gap-2">
                       <button *ngFor="let s of sizeVariants" 
                               type="button"
                               (click)="selectSize(s); cdr.detectChanges()"
                               class="relative w-12 h-12 flex items-center justify-center text-xs font-black border-2 transition-all rounded-lg overflow-hidden cursor-pointer hover:border-primary active:scale-95 z-10"
                               [class.bg-primary]="selectedSize === s && getVariantStock(s) > 0"
                               [class.text-primary-foreground]="selectedSize === s && getVariantStock(s) > 0"
                               [class.border-primary]="selectedSize === s && getVariantStock(s) > 0"
                               [class.border-border]="selectedSize !== s && getVariantStock(s) > 0"
                               [class.border-gray-300]="getVariantStock(s) === 0"
                               [title]="getVariantStock(s) === 0 ? 'Out of stock' : 'In stock'">
                          <!-- Ligne rouge en diagonale pour Rupture de Stock (SVG robuste) -->
                          <svg *ngIf="getVariantStock(s) === 0" class="absolute inset-0 w-full h-full text-red-500 opacity-70 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                             <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" stroke-width="4" />
                          </svg>
                          <span class="relative z-10">{{ s }}</span>
                       </button>
                    </div>
                 </div>

                 <!-- Couleurs Disponibles -->
                 <div *ngIf="isClothingItem() || colorVariants.length > 0" class="mb-8">
                    <h3 class="text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                       Color : <span class="text-primary">{{ selectedColor || 'Select' }}</span>
                    </h3>
                    <div class="flex flex-wrap gap-4">
                       <!-- We show either the standard colors or the specific variants found -->
                       <button *ngFor="let col of (isClothingItem() ? CLOTHING_COLORS : getCustomColors())" 
                          type="button"
                          (click)="selectColor(col.name); cdr.detectChanges()"
                          class="flex flex-col items-center gap-2 group transition-all cursor-pointer z-10">
                          <div [style.background-color]="col.hex"
                             class="w-10 h-10 rounded-full border border-border shadow-sm relative overflow-hidden transition-transform group-hover:scale-110 active:scale-95"
                             [class.ring-2]="selectedColor === col.name"
                             [class.ring-primary]="selectedColor === col.name"
                             [class.ring-offset-2]="selectedColor === col.name">
                             
                             <!-- Slash si rupture -->
                             <svg *ngIf="!isColorAvailable(col.name)" class="absolute inset-0 w-full h-full text-red-500 opacity-70 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" stroke-width="4" />
                             </svg>
                             
                             <lucide-icon *ngIf="selectedColor === col.name && isColorAvailable(col.name)" [img]="CheckIcon" [size]="14" class="text-white absolute inset-0 m-auto drop-shadow-md"></lucide-icon>
                          </div>
                          <span class="text-[9px] font-bold uppercase" [class.text-primary]="selectedColor === col.name">{{ col.name }}</span>
                       </button>
                    </div>
                 </div>

                <!-- Quantity & Add -->
                <div class="flex flex-col gap-4">
                   <div class="flex items-center gap-4">
                      <div class="flex border rounded h-12 w-32 overflow-hidden shadow-sm">
                         <button type="button" (click)="decrementQuantity(); cdr.detectChanges()" class="flex-1 hover:bg-muted font-bold text-lg cursor-pointer">-</button>
                         <input type="number" [(ngModel)]="quantity" class="w-12 text-center font-bold border-x outline-none bg-transparent" readonly>
                         <button type="button" (click)="incrementQuantity(); cdr.detectChanges()" class="flex-1 hover:bg-muted font-bold text-lg cursor-pointer">+</button>
                      </div>
                      <div class="flex-1 flex flex-col items-end">
                         <span class="text-[9px] font-black uppercase opacity-40">Total</span>
                         <span class="text-xl font-black">{{ formatPrice(selectedPrice * quantity) }}</span>
                      </div>
                   </div>

                   <div class="flex gap-3 h-14">
                      <button type="button" (click)="addToCart(); cdr.detectChanges()"
                              [disabled]="product.stock === 0 || addingToCart || (selectedVariant && selectedVariant.stock === 0) || ($any(product).status && $any(product).status !== 'EN_STOCK' && $any(product).status !== 'IN_STOCK')"
                              class="flex-1 flex items-center justify-center bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed gap-2 cursor-pointer">
                         <lucide-icon *ngIf="!addingToCart && product.stock > 0" [img]="ShoppingCartIcon" [size]="18"></lucide-icon>
                         <lucide-icon *ngIf="addingToCart" [img]="Loader2Icon" [size]="18" class="animate-spin"></lucide-icon>
                         <span *ngIf="addingToCart">Loading...</span>
                         <span *ngIf="!addingToCart && (product.stock === 0 || (selectedVariant && $any(selectedVariant).stock === 0))">Out of Stock</span>
                         <span *ngIf="!addingToCart && product.stock > 0 && (!selectedVariant || $any(selectedVariant).stock > 0) && ($any(product).status === 'ARRIVING_SOON' || $any(product).status === 'EN_ARRIVAGE')">Coming Soon</span>
                         <span *ngIf="!addingToCart && product.stock > 0 && (!selectedVariant || $any(selectedVariant).stock > 0) && ($any(product).status === 'IN_STOCK' || $any(product).status === 'EN_STOCK' || !$any(product).status)">Add to Cart</span>
                      </button>

                      <button type="button" (click)="toggleFavorite(); cdr.detectChanges()"
                              class="w-14 h-full flex items-center justify-center border-2 rounded-lg transition-all active:scale-90 cursor-pointer"
                              [class.bg-red-500]="isFavorite"
                              [class.border-red-500]="isFavorite"
                              [class.text-white]="isFavorite"
                              [class.border-border]="!isFavorite">
                         <lucide-icon [img]="HeartIcon" [size]="20" [class.fill-current]="isFavorite"></lucide-icon>
                      </button>
                   </div>
                </div>

                <div class="flex gap-8 p-4 bg-muted/50 rounded-lg">
                   <div class="flex flex-col gap-1">
                      <span class="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Express Delivery</span>
                      <span class="text-[10px] font-bold">24-48 HOURS</span>
                   </div>
                   <div class="flex flex-col gap-1">
                      <span class="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Secure Payment</span>
                      <span class="text-[10px] font-bold">CARD / CASH</span>
                   </div>
                </div>
             </div>

          </div>
        </div>
      </div>

      <!-- Not Found Fallback -->
      <div *ngIf="!loading && !product && !errorMessage" class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
         <div class="h-16 w-16 bg-muted text-muted-foreground rounded-2xl flex items-center justify-center mb-6">
            <lucide-icon [name]="SearchIcon" [size]="32"></lucide-icon>
         </div>
         <h2 class="text-2xl font-black mb-2 uppercase tracking-tighter">Product not found</h2>
         <p class="text-muted-foreground mb-8 max-w-sm text-sm">This item no longer exists or is temporarily unavailable.</p>
         <button type="button" (click)="goBack()" class="btn-static px-8 h-12 bg-primary text-black font-black uppercase text-xs cursor-pointer">BACK TO SHOP</button>
      </div>

      <!-- Similar AI Products -->
      <div class="container mx-auto px-4 py-16 max-w-7xl border-t border-border/50">
        <div class="flex items-center justify-between mb-8">
           <div class="flex items-center gap-3">
              <lucide-icon [img]="SparklesIcon" [size]="24" class="text-primary"></lucide-icon>
              <h2 class="text-2xl font-black uppercase tracking-tighter">Recommended for you</h2>
           </div>
           <span *ngIf="loadingSimilar" class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <lucide-icon [img]="Loader2Icon" [size]="14" class="animate-spin"></lucide-icon> AI analysis in progress...
           </span>
        </div>
        
        <!-- Empty / Error state -->
        <div *ngIf="!loadingSimilar && similarProducts.length === 0" class="bg-muted/30 border border-border/50 rounded-2xl p-12 text-center">
           <lucide-icon [img]="SparklesIcon" [size]="40" class="mx-auto text-muted-foreground/30 mb-4"></lucide-icon>
           <h3 class="text-sm font-black uppercase tracking-widest text-muted-foreground mb-2">No recommendations</h3>
           <p class="text-xs text-muted-foreground max-w-md mx-auto">AI hasn't found any similar items yet, or you are not logged in.</p>
           <p class="text-[10px] mt-4 font-mono text-muted-foreground opacity-50">{{ debugAiMessage }}</p>
        </div>

        <div *ngIf="!loadingSimilar && similarProducts.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-6">
           <div *ngFor="let sim of similarProducts" 
                (click)="goToProduct(sim.id); cdr.detectChanges()"
                class="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group flex flex-col">
              <div class="aspect-square bg-white p-4 flex items-center justify-center relative overflow-hidden border-b border-border/50">
                 <img *ngIf="sim.images && sim.images.length > 0" [src]="sim.images[0]" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500">
                 <div *ngIf="!sim.images || sim.images.length === 0" class="text-4xl opacity-10">📦</div>
              </div>
              <div class="p-4 flex flex-col flex-1 bg-muted/10">
                 <span class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{{ sim.category?.nom || sim.category?.name || 'Sport' }}</span>
                 <h3 class="text-sm font-black uppercase line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-tight">{{ sim.nom }}</h3>
                 <div class="mt-auto pt-3 border-t border-border/50 flex items-center justify-between">
                    <span class="font-black text-lg text-foreground">{{ formatPrice(sim.prix) }}</span>
                    <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                       <lucide-icon [img]="ArrowLeftIcon" [size]="14" class="rotate-180"></lucide-icon>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <!-- Static Toast -->
      <div *ngIf="toast" class="fixed bottom-6 right-6 bg-black text-white px-6 py-4 rounded shadow-2xl z-[100] border-l-4 border-primary">
         <span class="text-xs font-black uppercase tracking-widest">{{ toast }}</span>
      </div>

    </div>
  `,
  styles: [`
    :host { 
      --primary-gold: #ffb800; 
      --product-red: #d0021b; 
    }

    /* Static Fast Loader */
    .loader-static { 
      width: 40px; 
      height: 40px; 
      border: 4px solid #f3f3f3; 
      border-top: 4px solid var(--primary-gold); 
      border-radius: 50%; 
      animation: spin 0.6s linear infinite; 
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly HeartIcon = Heart;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly ShoppingBagIcon = ShoppingBag;
  readonly Loader2Icon = Loader2;
  readonly SearchIcon = Search;
  readonly PlusIcon = Plus;
  readonly MinusIcon = Minus;
  readonly AlertCircleIcon = AlertCircle;
  readonly TruckIcon = Truck;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly CheckIcon = Star; 
  readonly SparklesIcon = Sparkles;

  readonly CLOTHING_COLORS = [
    { name: 'Grey', hex: '#808080' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Black', hex: '#000000' },
    { name: 'Brown', hex: '#8B4513' },
    { name: 'White', hex: '#FFFFFF' }
  ];

  private destroy$ = new Subject<void>();
  private loadProduct$ = new Subject<number>();

  productId: number = 0;
  product: Product | null = null;
  loading: boolean = true;
  errorMessage: string | null = null;
  debugInfo: string = '';

  currentImage: string | null = null;

  // Variants
  sizeVariants: string[] = [];
  colorVariants: string[] = [];
  selectedSize: string | null = null;
  selectedColor: string | null = null;
  selectedVariant: ProductVariant | null = null;

  // AI Similar Products
  similarProducts: Product[] = [];
  loadingSimilar: boolean = false;
  debugAiMessage: string = 'Initialisation...';

  // State
  addingToCart = false;
  isFavorite = false;
  toast: string | null = null;
  quantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.setupProductLoadingStream();

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productId = +id;
        this.loadProduct$.next(this.productId);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupProductLoadingStream() {
    this.loadProduct$.pipe(
      tap((id: number) => {
        this.loading = true;
        this.product = null;
        this.errorMessage = null;
        this.debugInfo = `Chargement ID: ${id}...`;
        this.cdr.detectChanges();
      }),
      switchMap((id: number) => {
        return this.productService.getProductById(id).pipe(
          timeout(8000),
          catchError(err => {
            console.error('Fetch error:', err);
            this.errorMessage = err.status === 404
              ? "Product not found (404)."
              : "Connection error with the server.";
            return of(null);
          })
        );
      }),
      catchError(outerErr => {
        console.error('Outer stream error:', outerErr);
        this.loading = false;
        this.errorMessage = "Unexpected system error.";
        this.cdr.detectChanges();
        return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe(res => {
      this.loading = false;

      if (!res && !this.errorMessage) {
        this.errorMessage = "The requested item is not available.";
      }

      if (res) {
        this.handleProductData(res);
        this.debugInfo = `ID ${res.id} loaded. Variants: ${res.variants?.length || 0}`;
        this.checkIfFavorite();
        this.loadSimilarProducts();
      } else {
        this.debugInfo = 'Error or not found.';
      }
      this.cdr.detectChanges();
    });
  }

  loadSimilarProducts() {
    const userIdStr = localStorage.getItem('user_id');
    if (!userIdStr) {
       this.debugAiMessage = 'User not logged in (userId missing in cache).';
       this.loadingSimilar = false;
       return;
    }
    const userId = parseInt(userIdStr, 10);
    if (isNaN(userId)) {
       this.debugAiMessage = 'Invalid user.';
       this.loadingSimilar = false;
       return;
    }

    this.loadingSimilar = true;
    this.debugAiMessage = 'Calling Flask ML service via Spring Boot...';
    
    // First, fetch AI recommendations
    this.productService.getAIRecommendations(userId, 20).pipe(
      timeout(8000),
      catchError(err => {
        this.debugAiMessage = `Timeout or network error: ${err.message || 'Server taking too long to respond.'}`;
        this.loadingSimilar = false;
        this.cdr.detectChanges();
        return of(null);
      })
    ).subscribe({
      next: (aiRes) => {
        if (!aiRes) return; // Already handled by catchError

        if (aiRes.flask_available === false) {
          this.debugAiMessage = 'Flask server (AI) is offline or unavailable.';
          this.loadingSimilar = false;
          this.cdr.detectChanges();
          return;
        }

        if (!aiRes.ranked_products || aiRes.ranked_products.length === 0) {
          this.debugAiMessage = 'AI returned 0 recommended products.';
          this.loadingSimilar = false;
          this.cdr.detectChanges();
          return;
        }
        
        // Extract product IDs and sort by AI score
        const aiRankedIds = aiRes.ranked_products
          .sort((a: any, b: any) => b.recommendation_score - a.recommendation_score)
          .map((r: any) => Number(r.product_id))
          .filter((id: number) => id !== this.productId); // Exclude current product
          
        if (aiRankedIds.length === 0) {
          this.debugAiMessage = 'All recommended products were filtered.';
          this.loadingSimilar = false;
          this.cdr.detectChanges();
          return;
        }

        this.debugAiMessage = `AI found ${aiRankedIds.length} products. Retrieving details...`;

        // Now fetch details for these IDs
        this.productService.getAllProducts(0, 100).pipe(
          timeout(8000),
          finalize(() => {
            this.loadingSimilar = false;
            this.cdr.detectChanges();
          })
        ).subscribe({
          next: (prodRes) => {
            const allProducts = prodRes.content || [];
            this.similarProducts = aiRankedIds
              .map((id: number) => allProducts.find(p => p.id === id))
              .filter((p: Product | undefined): p is Product => p !== undefined)
              .slice(0, 4);
              
            if (this.similarProducts.length === 0) {
               this.debugAiMessage = 'Recommended products no longer exist in the database.';
            } else {
               this.debugAiMessage = `Success! ${this.similarProducts.length} products displayed.`;
            }
          },
          error: () => {
            this.debugAiMessage = 'Error retrieving product details.';
          }
        });
      },
      error: (err) => {
        this.debugAiMessage = `Critical error: ${err.message || 'Server not responding.'}`;
        this.loadingSimilar = false;
        this.cdr.detectChanges();
      }
    });
  }

  private handleProductData(res: Product | null) {
    try {
      this.product = res;
      if (this.product) {
        if (this.product.images?.length) {
          this.currentImage = this.product.images[0];
        } else {
          this.currentImage = null;
        }
        this.extractVariants();
      }
    } catch (e) {
      console.error('Data processing error', e);
      this.errorMessage = "Error analyzing received data.";
    }
  }

  loadProduct() {
    if (this.productId) this.loadProduct$.next(this.productId);
  }

  extractVariants() {
    try {
      if (!this.product?.variants || !Array.isArray(this.product.variants) || this.product.variants.length === 0) {
        this.sizeVariants = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
        this.colorVariants = [];
        this.selectedSize = null; // Force choice
        return;
      }

      const sizes = new Set<string>();
      const colors = new Set<string>();

      this.product.variants.forEach(v => {
        if (v && v.size) sizes.add(v.size);
        if (v && v.color) colors.add(v.color);
      });

      this.sizeVariants = Array.from(sizes);
      this.colorVariants = Array.from(colors);

      // Force explicit selection by setting to null
      this.selectedSize = null;
      this.selectedColor = null;

      this.updateSelectedVariant();
    } catch (e) {
      console.error('Error extracting variants', e);
    }
  }

  selectSize(size: string) {
    console.log('Size selected:', size);
    this.selectedSize = size;
    this.updateSelectedVariant();
    this.cdr.detectChanges();
  }

  selectColor(color: string) {
    console.log('Color selected:', color);
    this.selectedColor = color;
    this.updateSelectedVariant();
    this.cdr.detectChanges();
  }

  updateSelectedVariant() {
    if (!this.product?.variants) return;

    this.selectedVariant = this.product.variants.find(v => {
      const vSize = (v.size || '').trim().toLowerCase();
      const sSize = (this.selectedSize || '').trim().toLowerCase();
      const vColor = (v.color || '').trim().toLowerCase();
      const sColor = (this.selectedColor || '').trim().toLowerCase();

      const sizeMatch = this.sizeVariants.length === 0 || vSize === sSize;
      const colorMatch = this.colorVariants.length === 0 || vColor === sColor;
      return sizeMatch && colorMatch;
    }) || null;
  }

  getColorHex(colorName: string): string {
    const found = this.CLOTHING_COLORS.find(c => c.name.toLowerCase() === colorName.toLowerCase());
    return found ? found.hex : '#CCCCCC'; // Default light gray for unknown colors
  }

  getCustomColors(): { name: string, hex: string }[] {
    return this.colorVariants.map(c => ({
      name: c,
      hex: this.getColorHex(c)
    }));
  }

  isClothingItem(): boolean {
    if (!this.product) return false;
    const cat = (this.product.category?.nom || '').toLowerCase();
    const name = (this.product.nom || '').toLowerCase();
    
    const clothingKeywords = ['vetement', 'vêtement', 't-shirt', 'ensemble', 'pull', 'maillot', 'pantalon', 'short', 'football', 'chaussette'];
    return clothingKeywords.some(key => cat.includes(key) || name.includes(key));
  }

  isColorAvailable(colorName: string): boolean {
    if (!this.product?.variants || this.product.variants.length === 0) {
      return (this.product?.stock ?? 0) > 0;
    }
    
    // If a size is selected, check only variants with that size
    const variantsToSearch = this.selectedSize 
      ? this.product.variants.filter(v => (v.size || '').trim().toLowerCase() === this.selectedSize!.trim().toLowerCase())
      : this.product.variants;

    const totalColorStock = variantsToSearch
      .filter(v => (v.color || '').trim().toLowerCase() === colorName.trim().toLowerCase())
      .reduce((sum, v) => sum + (v.stock ?? 0), 0);
    return totalColorStock > 0;
  }

  getVariantStock(size: string): number {
    if (!this.product?.variants || this.product.variants.length === 0) {
      return this.product && this.product.stock !== undefined ? this.product.stock : 0;
    }

    // If a color is selected, check only variants with that color
    const variantsToSearch = this.selectedColor 
      ? this.product.variants.filter(v => (v.color || '').trim().toLowerCase() === this.selectedColor!.trim().toLowerCase())
      : this.product.variants;

    const totalSizeStock = variantsToSearch
      .filter(v => (v.size || '').trim().toLowerCase() === size.trim().toLowerCase())
      .reduce((sum, v) => sum + (v.stock ?? 0), 0);
    return totalSizeStock;
  }

  get selectedPrice(): number {
    const prod = this.product;
    if (!prod) return 0;
    const basePrice = prod.prix || 0;
    const adjustment = this.selectedVariant?.priceAdjustment || 0;
    return basePrice + adjustment;
  }

  setCurrentImage(img: string) {
    this.currentImage = img;
  }

  goToProduct(id: number) {
    this.router.navigate(['/app/sponsors', id]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBack() {
    this.router.navigate(['/app/sponsors']);
  }

  checkIfFavorite() {
    this.productService.checkIfFavorite(this.productId).pipe(
      timeout(5000),
      take(1),
      catchError(() => of(false))
    ).subscribe((res: boolean) => this.isFavorite = res);
  }

  toggleFavorite() {
    const wasFavorite = this.isFavorite;
    this.isFavorite = !this.isFavorite; // Optimistic update

    if (wasFavorite) {
      this.productService.removeFromFavorites(this.productId).subscribe({
        error: () => {
          this.isFavorite = true; // rollback
          this.showToast('Error removing from favorites');
        }
      });
    } else {
      this.productService.addToFavorites(this.productId).subscribe({
        next: (res) => {
          if (res === null) {
            // API constraints: product already in favorites, just keep heart filled
          } else {
            this.showToast('Product added to wishlists ❤️');
          }
        },
        error: () => {
          this.isFavorite = false; // rollback
          this.showToast("Error adding to favorites");
        }
      });
    }
  }

  incrementQuantity() {
    this.quantity++;
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (!this.product) return;

    const productStatus = (this.product as any).status;
    const isAvailable = !productStatus || productStatus === 'EN_STOCK' || productStatus === 'IN_STOCK' || productStatus === 'EN_STOCK';

    if (!isAvailable) {
      this.showToast(
        (productStatus === 'ARRIVING_SOON' || productStatus === 'EN_ARRIVAGE')
          ? '⏳ This product is arriving soon and will be available shortly!'
          : '❌ This product is currently unavailable.'
      );
      return;
    }
    if (this.product.stock === 0 || (this.selectedVariant && this.selectedVariant.stock === 0)) {
      this.showToast('❌ This variant is out of stock.');
      return;
    }

    // Strict enforcement: A size MUST be selected if sizes exist
    if (this.sizeVariants.length > 0 && !this.selectedSize) {
      alert("Please select a size before adding to cart.");
      return;
    }

    if (this.colorVariants.length > 0 && !this.selectedColor) {
      alert("Please select a color.");
      return;
    }

    this.addingToCart = true;
    this.cdr.detectChanges();

    const prod = this.product;
    if (!prod) return;

    this.productService.addToCart(prod.id, this.quantity, this.selectedVariant?.id).subscribe({
      next: () => {
        this.addingToCart = false;
        this.showToast('Product added to cart!');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error adding to cart:', err);
        this.addingToCart = false;
        alert("Error while adding to cart. Please check your connection or contact an administrator.");
        this.cdr.detectChanges();
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(price).replace('TND', 'DT');
  }

  showToast(msg: string) {
    this.toast = msg;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toast = null;
      this.cdr.detectChanges();
    }, 3000);
  }
}
