import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Heart, ShoppingCart, Loader2, Star, Truck, ShieldCheck, Undo2, Search, Plus, Minus, AlertCircle, ShoppingBag } from 'lucide-angular';
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
           <button (click)="goBack()" class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">
              <lucide-icon [name]="ArrowLeftIcon" [size]="16"></lucide-icon>
              Retour Boutique
           </button>
           <span class="text-[10px] font-bold text-muted-foreground opacity-30">{{ debugInfo }}</span>
        </div>
      </div>

      <!-- Loading State (Non-blocking) -->
      <div *ngIf="loading" class="flex flex-col items-center justify-center min-h-[60vh]">
         <div class="loader-static"></div>
         <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-4">Chargement instantané...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="!loading && errorMessage" class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
         <div class="h-16 w-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mb-6">
            <lucide-icon [name]="AlertCircleIcon" [size]="32"></lucide-icon>
         </div>
         <h2 class="text-2xl font-black mb-2 uppercase tracking-tighter">Oups ! Erreur de chargement</h2>
         <p class="text-muted-foreground mb-8 max-w-sm text-sm">{{ errorMessage }}</p>
         <button (click)="loadProduct()" class="btn-static px-8 h-12 bg-primary text-black font-black uppercase text-xs">RÉESSAYER</button>
      </div>

      <!-- Product Detail (Stable Layout) -->
      <div *ngIf="!loading && product" class="container mx-auto px-4 py-8 max-w-7xl">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <!-- LEFT: Image (Static) -->
          <div class="space-y-6">
             <div class="bg-card border border-border rounded-lg overflow-hidden aspect-square flex items-center justify-center p-8 relative">
                <div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <span *ngIf="product.stock === 0" class="bg-black text-white px-3 py-1 text-[9px] font-black uppercase">Rupture</span>
                  <span *ngIf="product.stock > 0 && product.stock < 10" class="bg-red-600 text-white px-3 py-1 text-[9px] font-black uppercase">Stock Faible</span>
                </div>
                <img *ngIf="currentImage" [src]="currentImage" [alt]="product.nom" class="w-full h-full object-contain">
                <div *ngIf="!currentImage" class="text-6xl opacity-10">📦</div>
             </div>

             <!-- Static Miniatures -->
             <div *ngIf="product.images && product.images.length > 1" class="flex gap-3 overflow-x-auto pb-2">
                <button *ngFor="let img of product.images" 
                        (click)="setCurrentImage(img)"
                        class="w-20 h-20 rounded border-2 transition-all p-1 bg-white shrink-0"
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
                <p *ngIf="product.marque" class="text-xs font-bold text-muted-foreground uppercase mt-1">Marque : {{ product.marque }}</p>
             </div>

             <div class="flex items-center gap-4 mb-8">
                <span class="text-3xl font-black text-primary">{{ formatPrice(selectedPrice) }}</span>
                <span class="h-4 w-px bg-border"></span>
                 <span *ngIf="($any(product).status === 'EN_STOCK' || !$any(product).status) && product.stock > 0" class="text-[10px] font-bold text-green-600 uppercase">✓ En Stock</span>
                 <span *ngIf="$any(product).status === 'RUPTURE_DE_STOCK' || product.stock === 0" class="text-[10px] font-bold text-red-600 uppercase">✗ Épuisé</span>
                 <span *ngIf="$any(product).status === 'EN_ARRIVAGE' && product.stock > 0" class="text-[10px] font-bold text-amber-500 uppercase">⏳ En Arrivage</span>
             </div>

             <div class="prose prose-sm mb-10 text-muted-foreground font-medium">
                {{ product.description }}
                
                <div class="mt-4 pt-4 border-t border-border/50">
                    <span class="uppercase tracking-wider text-[10px] font-black text-muted-foreground">Tailles Disponibles:</span>
                    <span *ngIf="sizeVariants.length > 0" class="ml-2 font-bold text-foreground text-sm">{{ sizeVariants.join(', ') }}</span>
                    <span *ngIf="sizeVariants.length === 0" class="ml-2 font-bold text-foreground text-sm uppercase">XS, S, M, L, XL, 2XL, 3XL, 4XL, 5XL</span>
                </div>
             </div>

             <!-- Selection & Actions -->
             <div class="space-y-8 border-t border-border pt-8">
                
                <!-- Sizes -->
                <div *ngIf="sizeVariants.length > 0">
                   <h3 class="text-[10px] font-black uppercase tracking-[0.2em] mb-4">Choisir Taille</h3>
                   <div class="flex flex-wrap gap-2">
                      <button *ngFor="let s of sizeVariants" 
                              (click)="selectSize(s)"
                              class="w-12 h-12 rounded border flex items-center justify-center font-bold text-sm transition-all"
                              [class.bg-primary]="selectedSize === s"
                              [class.text-black]="selectedSize === s"
                              [class.border-primary]="selectedSize === s"
                              [class.border-border]="selectedSize !== s">
                         {{ s }}
                      </button>
                   </div>
                </div>

                <!-- Quantity & Add -->
                <div class="flex flex-col gap-4">
                   <div class="flex items-center gap-4">
                      <div class="flex border rounded h-12 w-32 overflow-hidden shadow-sm">
                         <button (click)="decrementQuantity()" class="flex-1 hover:bg-muted font-bold text-lg">-</button>
                         <input type="number" [(ngModel)]="quantity" class="w-12 text-center font-bold border-x outline-none bg-transparent" readonly>
                         <button (click)="incrementQuantity()" class="flex-1 hover:bg-muted font-bold text-lg">+</button>
                      </div>
                      <div class="flex-1 flex flex-col items-end">
                         <span class="text-[9px] font-black uppercase opacity-40">Total</span>
                         <span class="text-xl font-black">{{ formatPrice(selectedPrice * quantity) }}</span>
                      </div>
                   </div>

                   <div class="flex gap-3 h-14">
                      <button (click)="addToCart()"
                              [disabled]="product.stock === 0 || addingToCart || ($any(product).status && $any(product).status !== 'EN_STOCK')"
                              class="flex-1 bg-primary text-black font-black uppercase text-xs tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale">
                         <ng-container *ngIf="addingToCart">Chargement...</ng-container>
                         <ng-container *ngIf="!addingToCart && product.stock === 0">ÉPUISÉ</ng-container>
                         <ng-container *ngIf="!addingToCart && product.stock > 0 && $any(product).status === 'RUPTURE_DE_STOCK'">RUPTURE DE STOCK</ng-container>
                         <ng-container *ngIf="!addingToCart && product.stock > 0 && $any(product).status === 'EN_ARRIVAGE'">BIENTÔT DISPONIBLE</ng-container>
                         <ng-container *ngIf="!addingToCart && ($any(product).status === 'EN_STOCK' || !$any(product).status) && product.stock > 0">AJOUTER AU PANIER</ng-container>
                      </button>

                      <button (click)="toggleFavorite()"
                              class="w-14 h-full flex items-center justify-center border-2 transition-all active:scale-90"
                              [class.bg-red-500]="isFavorite"
                              [class.border-red-500]="isFavorite"
                              [class.text-white]="isFavorite"
                              [class.border-border]="!isFavorite">
                         <lucide-icon [name]="HeartIcon" [size]="20" [class.fill-current]="isFavorite"></lucide-icon>
                      </button>
                   </div>
                </div>

                <div class="flex gap-8 p-4 bg-muted/50 rounded-lg">
                   <div class="flex flex-col gap-1">
                      <span class="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Livraison Express</span>
                      <span class="text-[10px] font-bold">24-48 HEURES</span>
                   </div>
                   <div class="flex flex-col gap-1">
                      <span class="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Paiement Sécurisé</span>
                      <span class="text-[10px] font-bold">CARTE / CASH</span>
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
         <h2 class="text-2xl font-black mb-2 uppercase tracking-tighter">Produit introuvable</h2>
         <p class="text-muted-foreground mb-8 max-w-sm text-sm">Cet article n'existe plus ou est momentanément indisponible.</p>
         <button (click)="goBack()" class="btn-static px-8 h-12 bg-primary text-black font-black uppercase text-xs">RETOUR À LA BOUTIQUE</button>
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
  
  // State
  addingToCart = false;
  isFavorite = false;
  toast: string | null = null;
  quantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

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
              ? "Produit introuvable (404)." 
              : "Erreur de connexion au serveur.";
            return of(null);
          })
        );
      }),
      catchError(outerErr => {
         console.error('Outer stream error:', outerErr);
         this.loading = false;
         this.errorMessage = "Erreur système inattendue.";
         this.cdr.detectChanges();
         return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe(res => {
      this.loading = false;
      
      if (!res && !this.errorMessage) {
        this.errorMessage = "L'article demandé n'est pas disponible.";
      }
      
      if (res) {
         this.handleProductData(res);
         this.debugInfo = `ID ${res.id} chargé.`;
         this.checkIfFavorite();
      } else {
         this.debugInfo = 'Erreur ou non trouvé.';
      }
      this.cdr.detectChanges();
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
      this.errorMessage = "Erreur lors de l'analyse des données reçues.";
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
    this.selectedSize = size;
    this.updateSelectedVariant();
  }

  selectColor(color: string) {
    this.selectedColor = color;
    this.updateSelectedVariant();
  }

  updateSelectedVariant() {
    if (!this.product?.variants) return;
    
    this.selectedVariant = this.product.variants.find(v => {
      const sizeMatch = this.sizeVariants.length === 0 || v.size === this.selectedSize;
      const colorMatch = this.colorVariants.length === 0 || v.color === this.selectedColor;
      return sizeMatch && colorMatch;
    }) || null;
  }

  get selectedPrice(): number {
    if (!this.product) return 0;
    const basePrice = this.product.prix || 0;
    const adjustment = this.selectedVariant?.priceAdjustment || 0;
    return basePrice + adjustment;
  }

  setCurrentImage(img: string) {
    this.currentImage = img;
  }

  goBack() {
    this.router.navigate(['/app/sponsors']);
  }

  checkIfFavorite() {
    this.productService.checkIfFavorite(this.productId).pipe(
      timeout(5000),
      take(1),
      catchError(() => of(false))
    ).subscribe(res => this.isFavorite = res);
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
    
    // Block if product is not EN_STOCK (backend would reject anyway)
    const productStatus = (this.product as any).status;
    if (productStatus && productStatus !== 'EN_STOCK') {
      this.showToast(productStatus === 'EN_ARRIVAGE' 
        ? '⏳ Ce produit est en arrivage et sera bientôt disponible !'
        : '❌ Ce produit est actuellement indisponible.');
      return;
    }
    if (this.product.stock === 0) {
      this.showToast('❌ Ce produit est épuisé.');
      return;
    }
    
    // Strict enforcement: A size MUST be selected if sizes exist
    if (this.sizeVariants.length > 0 && !this.selectedSize) {
       alert("Veuillez choisir une taille avant d'ajouter au panier.");
       return;
    }
    
    if (this.colorVariants.length > 0 && !this.selectedColor) {
       alert("Veuillez choisir une couleur.");
       return;
    }

    this.addingToCart = true;
    this.cdr.detectChanges();

    this.productService.addToCart(this.product.id, this.quantity, this.selectedVariant?.id).subscribe({
      next: () => {
        this.addingToCart = false;
        this.showToast('Produit ajouté au panier !');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error adding to cart:', err);
        this.addingToCart = false;
        alert("Erreur lors de l'ajout au panier. Vérifiez votre connexion ou contactez l'administrateur.");
        this.cdr.detectChanges();
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
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
