import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ShoppingCart, Trash2, ArrowRight, Minus, Plus, ShoppingBag } from 'lucide-angular';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="h-full bg-background/50">
      <div class="container mx-auto px-4 py-8 max-w-5xl">
        <h1 class="text-3xl font-bold mb-8 flex items-center gap-3">
           <lucide-icon [name]="ShoppingCartIcon" [size]="32" class="text-primary"></lucide-icon>
           My Cart
        </h1>

        <div *ngIf="loading" class="flex justify-center p-12">
           <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div *ngIf="!loading && (!cart || !cart.items || cart.items.length === 0)" class="bg-card rounded-3xl p-12 text-center border border-border shadow-sm flex flex-col items-center justify-center">
           <lucide-icon [name]="ShoppingBagIcon" [size]="64" class="text-muted/50 mb-6"></lucide-icon>
           <h2 class="text-2xl font-bold mb-2">Your cart is empty!</h2>
           <p class="text-muted-foreground mb-8 text-lg">Time to gear up! Discover our official shop.</p>
           <a routerLink="/app/sponsors" class="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-1 inline-flex">
              Visit Shop
           </a>
        </div>

        <div *ngIf="!loading && cart && cart.items && cart.items.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           <!-- Items List -->
           <div class="lg:col-span-2 space-y-4">
              <div *ngFor="let item of cart.items" class="bg-card border border-border rounded-2xl p-4 flex gap-6 items-center shadow-sm relative overflow-hidden group">
                 <div class="h-24 w-24 bg-background rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-border/50">
                    <img *ngIf="item.product?.images?.length > 0" [src]="item.product.images[0]" class="h-full w-full object-contain p-2">
                    <span *ngIf="!item.product?.images?.length" class="text-3xl">🛒</span>
                 </div>
                 
                 <div class="flex-1">
                    <h3 class="font-bold text-lg mb-1 pr-8">{{ item.product?.nom }}</h3>
                    <div class="text-sm text-muted-foreground mb-3 uppercase tracking-wide">{{ item.product?.category?.nom || item.product?.category?.name || 'Equipment' }}</div>
                    
                    <div class="flex flex-wrap items-center gap-4">
                       <span class="font-black text-xl text-primary">{{ formatPrice(item.price ? item.price : item.product?.prix) }}</span>
                       
                       <div class="flex items-center bg-background border border-border rounded-lg h-9">
                          <button (click)="updateQuantity(item.id, item.quantity - 1)" class="w-9 h-full flex items-center justify-center hover:text-primary transition-colors disabled:opacity-50" [disabled]="item.quantity <= 1">
                             <lucide-icon [name]="MinusIcon" [size]="16"></lucide-icon>
                          </button>
                          <span class="w-10 text-center font-bold text-sm">{{ item.quantity }}</span>
                          <button (click)="updateQuantity(item.id, item.quantity + 1)" class="w-9 h-full flex items-center justify-center hover:text-primary transition-colors">
                             <lucide-icon [name]="PlusIcon" [size]="16"></lucide-icon>
                          </button>
                       </div>
                    </div>
                 </div>

                 <button (click)="removeItem(item.id)" class="absolute top-4 right-4 h-10 w-10 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 shadow-sm bg-background border border-border/50 lg:border-transparent lg:bg-transparent lg:opacity-0 max-lg:opacity-100 max-lg:bg-card">
                    <lucide-icon [name]="Trash2Icon" [size]="18"></lucide-icon>
                 </button>
              </div>

              <button (click)="clearCart()" class="text-sm font-medium text-destructive hover:underline flex items-center gap-2 mt-6 px-2">
                 <lucide-icon [name]="Trash2Icon" [size]="16"></lucide-icon> Clear all cart
              </button>
           </div>

           <!-- Summary Sidebar -->
           <div class="lg:col-span-1">
             <div class="bg-card border border-border rounded-3xl p-6 shadow-xl sticky top-24">
               <h3 class="text-xl font-bold mb-6">Summary</h3>
               
               <div class="space-y-4 mb-6">
                 <div class="flex justify-between items-center text-muted-foreground">
                   <span>Subtotal ({{ cartItemCount }} items)</span>
                   <span class="font-semibold text-foreground">{{ formatPrice(cartTotal) }}</span>
                 </div>
                 <div class="flex justify-between items-center text-muted-foreground">
                   <span>Shipping fees</span>
                   <span class="font-semibold text-green-500">Free</span>
                 </div>
                 <div class="h-px bg-border w-full my-4"></div>
                 <div class="flex justify-between items-center">
                   <span class="text-lg font-bold">Total</span>
                   <span class="text-3xl font-black text-primary">{{ formatPrice(cartTotal) }}</span>
                 </div>
               </div>

               <button class="w-full h-14 bg-primary text-primary-foreground rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg shadow-primary/30 hover:-translate-y-1 transition-all">
                  Checkout <lucide-icon [name]="ArrowRightIcon" [size]="20"></lucide-icon>
               </button>
               
               <div class="mt-4 text-center text-xs text-muted-foreground opacity-60">
                 100% Secure Payment via Payplug / Stripe
               </div>
             </div>
           </div>

        </div>
      </div>
      
      <!-- Toast Notification -->
      <div *ngIf="toastMessage" class="fixed bottom-6 right-6 bg-card border border-border rounded-xl px-5 py-4 shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
        <div class="h-8 w-8 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center shrink-0">✓</div>
        <p class="text-sm font-medium pr-4">{{ toastMessage }}</p>
      </div>
    </div>
  `
})
export class CartComponent implements OnInit {
  readonly ShoppingCartIcon = ShoppingCart;
  readonly ShoppingBagIcon = ShoppingBag;
  readonly Trash2Icon = Trash2;
  readonly ArrowRightIcon = ArrowRight;
  readonly MinusIcon = Minus;
  readonly PlusIcon = Plus;

  cart: any = null;
  loading = true;
  toastMessage: string | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.loading = true;
    this.productService.getCart().subscribe({
      next: (res) => {
        this.cart = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  updateQuantity(itemId: number, newQty: number) {
    if (newQty < 1) return;
    this.productService.updateCartItem(itemId, newQty).subscribe({
      next: () => {
        this.loadCart();
      },
      error: () => this.showToast('Update error')
    });
  }

  removeItem(itemId: number) {
    this.productService.removeFromCart(itemId).subscribe({
      next: () => {
        this.loadCart();
        this.showToast('Item removed');
      },
      error: () => this.showToast('Error removing item')
    });
  }

  clearCart() {
    if(!confirm("Are you sure you want to clear the cart?")) return;
    this.productService.clearCart().subscribe({
      next: () => {
        this.cart = null;
        this.showToast('Cart cleared');
        this.loadCart();
      },
      error: () => this.showToast('Error clearing cart')
    });
  }

  get cartTotal(): number {
    if (!this.cart || !this.cart.items) return 0;
    return this.cart.items.reduce((acc: number, item: any) => {
        const p = item.price ? item.price : (item.product?.prix || 0);
        return acc + (p * item.quantity);
    }, 0);
  }

  get cartItemCount(): number {
    if (!this.cart || !this.cart.items) return 0;
    return this.cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    setTimeout(() => this.toastMessage = null, 3000);
  }
}
