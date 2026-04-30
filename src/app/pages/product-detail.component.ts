import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Heart, ShoppingCart, Loader2, Star, Truck, ShieldCheck, Undo2 } from 'lucide-angular';
import { ProductService, Product, ProductVariant } from '../services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background pb-20">
      
      <div class="bg-card border-b border-border sticky top-0 z-40 shadow-sm backdrop-blur-md bg-card/90">
        <div class="container mx-auto px-4 h-16 flex items-center justify-between">
           <button (click)="goBack()" class="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <lucide-icon [name]="ArrowLeftIcon" [size]="20"></lucide-icon>
              Back to Store
           </button>
        </div>
      </div>

      <div *ngIf="loading" class="flex flex-col items-center justify-center min-h-[60vh]">
         <lucide-icon [name]="Loader2Icon" [size]="48" class="animate-spin text-primary/50 mb-4"></lucide-icon>
         <p class="text-muted-foreground">Loading details...</p>
      </div>

      <div *ngIf="!loading && !product" class="flex flex-col items-center justify-center min-h-[60vh] text-center">
         <div class="text-6xl mb-6">🔍</div>
         <h2 class="text-2xl font-bold mb-2">Product not found</h2>
         <p class="text-muted-foreground mb-6">The product you are looking for does not exist or has been removed.</p>
         <button (click)="goBack()" class="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold">Return to Store</button>
      </div>

      <div *ngIf="!loading && product" class="container mx-auto px-4 py-8 max-w-7xl">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <!-- Image Gallery -->
          <div class="space-y-4">
             <div class="aspect-square bg-card rounded-3xl border border-border p-8 flex items-center justify-center relative overflow-hidden group">
                <!-- Sale Badge -->
                <div *ngIf="product.stock === 0" class="absolute top-4 left-4 z-10 bg-background/90 text-foreground font-bold px-4 py-1.5 rounded-lg border border-border">Out of stock</div>
                <div *ngIf="(product.stock || 0) > 0 && (product.stock || 0) < 10" class="absolute top-4 left-4 z-10 bg-destructive/10 text-destructive font-bold px-4 py-1.5 rounded-lg backdrop-blur-sm">Limited stock</div>

                <img *ngIf="currentImage" [src]="currentImage" [alt]="product.nom" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500">
                <div *ngIf="!currentImage" class="text-8xl">🛒</div>
             </div>

             <!-- Thumbnails -->
             <div *ngIf="product.images && (product.images.length || 0) > 1" class="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                <button *ngFor="let img of product.images; let i = index" 
                        (click)="setCurrentImage(img)"
                        [class.border-primary]="currentImage === img"
                        [class.border-transparent]="currentImage !== img"
                        class="w-20 h-20 shrink-0 bg-card rounded-xl p-2 border-2 hover:border-primary/50 transition-colors overflow-hidden">
                   <img [src]="img" class="w-full h-full object-contain">
                </button>
             </div>
          </div>

          <!-- Product Details -->
          <div class="flex flex-col">
             
             <!-- Header -->
             <div class="mb-6">
                <div class="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">{{ product.category?.nom || product.category?.name || 'General Category' }}</div>
                <h1 class="text-3xl lg:text-5xl font-extrabold mb-4 leading-tight">{{ product.nom }}</h1>
                <div class="flex items-center gap-4 text-sm text-muted-foreground">
                   <div class="flex items-center gap-1 text-amber-400">
                      <lucide-icon [name]="StarIcon" [size]="16" class="fill-current"></lucide-icon>
                      <lucide-icon [name]="StarIcon" [size]="16" class="fill-current"></lucide-icon>
                      <lucide-icon [name]="StarIcon" [size]="16" class="fill-current"></lucide-icon>
                      <lucide-icon [name]="StarIcon" [size]="16" class="fill-current"></lucide-icon>
                      <lucide-icon [name]="StarIcon" [size]="16" class="fill-current opacity-50"></lucide-icon>
                      <span class="text-foreground ml-1 font-medium">4.5</span>
                   </div>
                   <span>•</span>
                   <span>124 Reviews</span>
                </div>
             </div>

             <!-- Price -->
             <div class="text-4xl font-black text-foreground mb-8">
                {{ formatPrice(selectedPrice) }}
             </div>

             <div class="h-px w-full bg-border mb-8"></div>

             <!-- Variants Selection -->
             <div *ngIf="colorVariants.length > 0" class="mb-6">
                <h3 class="text-sm font-semibold mb-3">Available colors</h3>
                <div class="flex flex-wrap gap-3">
                   <button *ngFor="let color of colorVariants" 
                           (click)="selectColor(color)"
                           [class.ring-2]="selectedColor === color"
                           class="px-4 py-2 rounded-xl text-sm font-medium border border-border shadow-sm hover:border-primary transition-all bg-card ring-primary ring-offset-2 ring-offset-background">
                      {{ color }}
                   </button>
                </div>
             </div>

             <div *ngIf="sizeVariants.length > 0" class="mb-8">
                <h3 class="text-sm font-semibold mb-3 flex items-center justify-between">
                   Available sizes
                </h3>
                <div class="flex flex-wrap gap-3">
                   <button *ngFor="let size of sizeVariants" 
                           (click)="selectSize(size)"
                           [class.bg-primary]="selectedSize === size"
                           [class.text-primary-foreground]="selectedSize === size"
                           [class.bg-card]="selectedSize !== size"
                           class="w-14 h-12 rounded-xl text-sm font-bold border border-border hover:border-primary transition-all flex items-center justify-center">
                      {{ size }}
                   </button>
                </div>
             </div>

             <!-- Action Buttons -->
             <div class="flex gap-4 mb-8">
                <button (click)="addToCart()"
                        [disabled]="(product.stock || 0) === 0 || addingToCart || (!selectedVariant && (product.variants?.length || 0) > 0)"
                        class="flex-1 h-14 bg-primary text-primary-foreground rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1">
                   <lucide-icon *ngIf="!addingToCart" [name]="ShoppingCartIcon" [size]="24"></lucide-icon>
                   <lucide-icon *ngIf="addingToCart" [name]="Loader2Icon" [size]="24" class="animate-spin"></lucide-icon>
                   <span *ngIf="(product.stock || 0) > 0">Add to cart</span>
                   <span *ngIf="(product.stock || 0) === 0">Out of stock</span>
                </button>
                
                <button (click)="toggleFavorite()"
                        class="h-14 w-14 bg-card border border-border rounded-2xl flex items-center justify-center hover:bg-muted transition-colors"
                        [class.text-red-500]="isFavorite"
                        [class.border-red-500]="isFavorite">
                   <lucide-icon [name]="HeartIcon" [size]="24" [class.fill-current]="isFavorite"></lucide-icon>
                </button>
             </div>

             <!-- Assurances -->
             <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 bg-muted/40 p-6 rounded-2xl">
                <div class="flex items-center gap-3">
                   <div class="h-10 w-10 bg-background rounded-full flex items-center justify-center shadow-sm text-primary">
                      <lucide-icon [name]="TruckIcon" [size]="20"></lucide-icon>
                   </div>
                   <div class="text-sm">
                      <div class="font-bold">Fast Delivery</div>
                      <div class="text-muted-foreground">In 48-72h</div>
                   </div>
                </div>
                <div class="flex items-center gap-3">
                   <div class="h-10 w-10 bg-background rounded-full flex items-center justify-center shadow-sm text-primary">
                      <lucide-icon [name]="Undo2Icon" [size]="20"></lucide-icon>
                   </div>
                   <div class="text-sm">
                      <div class="font-bold">Easy Return</div>
                      <div class="text-muted-foreground">30 days included</div>
                   </div>
                </div>
             </div>

             <!-- Description Accordion / Content -->
             <div class="space-y-6">
                <div>
                   <h3 class="text-xl font-bold mb-3 border-b border-border pb-2">Product description</h3>
                   <div class="text-muted-foreground leading-relaxed whitespace-pre-line text-sm md:text-base">
                      {{ product.description }}
                   </div>
                </div>
             </div>

          </div>

        </div>
      </div>

      <!-- Toast Notification -->
      <div *ngIf="toast" class="fixed bottom-6 right-6 bg-card border border-border rounded-xl px-5 py-4 shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
        <div class="h-8 w-8 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center shrink-0">✓</div>
        <p class="text-sm font-medium pr-4">{{ toast }}</p>
      </div>

    </div>
  `,
  styles: [`
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class ProductDetailComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly HeartIcon = Heart;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly Loader2Icon = Loader2;
  readonly StarIcon = Star;
  readonly TruckIcon = Truck;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly Undo2Icon = Undo2;

  productId!: number;
  product: Product | null = null;
  loading = true;
  
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productId = +id;
        this.loadProduct();
        this.checkIfFavorite();
      }
    });
  }

  loadProduct() {
    this.loading = true;
    this.productService.getProductById(this.productId).subscribe({
      next: (res) => {
        this.product = res;
        if (this.product.images?.length > 0) {
          this.currentImage = this.product.images[0];
        }
        this.extractVariants();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error', err);
        this.loading = false;
      }
    });
  }

  extractVariants() {
    if (!this.product?.variants || this.product.variants.length === 0) return;
    
    const sizes = new Set<string>();
    const colors = new Set<string>();

    this.product.variants.forEach(v => {
      if (v.size) sizes.add(v.size);
      if (v.color) colors.add(v.color);
    });

    this.sizeVariants = Array.from(sizes);
    this.colorVariants = Array.from(colors);

    // Auto-select first available
    if (this.sizeVariants.length > 0) this.selectSize(this.sizeVariants[0]);
    if (this.colorVariants.length > 0) this.selectColor(this.colorVariants[0]);
    
    this.updateSelectedVariant();
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
    this.productService.checkIfFavorite(this.productId).subscribe({
      next: (res) => this.isFavorite = res,
      error: () => this.isFavorite = false
    });
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
                this.showToast('Product added to wishlist ❤️');
             }
         },
         error: () => {
             this.isFavorite = false; // rollback
             this.showToast("Error adding to favorites");
         }
      });
    }
  }

  addToCart() {
    if (!this.product) return;
    
    // Safety check if variants exist but none selected
    if (this.product.variants && this.product.variants.length > 0 && !this.selectedVariant) {
       alert("Please select a size/color.");
       return;
    }

    this.addingToCart = true;
    this.productService.addToCart(this.product.id, 1, this.selectedVariant?.id).subscribe({
      next: () => {
        this.addingToCart = false;
        this.showToast('Item added to cart!');
      },
      error: () => {
        this.addingToCart = false;
        alert("Error adding to cart.");
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  }

  showToast(msg: string) {
    this.toast = msg;
    setTimeout(() => this.toast = null, 3000);
  }
}
