import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ShoppingCart, Trash2, ArrowRight, Minus, Plus, ShoppingBag, MapPin, Truck, CheckCircle } from 'lucide-angular';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
  template: `
    <div class="h-full bg-background/50">
      <div class="container mx-auto px-4 py-8 max-w-5xl">
        <h1 class="text-3xl font-bold mb-8 flex items-center gap-3">
           <lucide-icon [name]="ShoppingCartIcon" [size]="32" class="text-primary"></lucide-icon>
           Mon Panier
        </h1>

        <div *ngIf="loading" class="flex justify-center p-12">
           <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div *ngIf="!loading && (!cart || !cart.items || cart.items.length === 0)" class="bg-card rounded-3xl p-12 text-center border border-border shadow-sm flex flex-col items-center justify-center">
           <lucide-icon [name]="ShoppingBagIcon" [size]="64" class="text-muted/50 mb-6"></lucide-icon>
           <h2 class="text-2xl font-bold mb-2">Votre panier est bien vide !</h2>
           <p class="text-muted-foreground mb-8 text-lg">Il est temps de s'équiper ! Découvrez notre boutique officielle.</p>
           <a routerLink="/app/sponsors" class="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-1 inline-flex">
              Visiter la boutique
           </a>
        </div>

        <div *ngIf="!loading && cart && cart.items && cart.items.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           <!-- Items List OR Checkout Form -->
           <div class="lg:col-span-2 space-y-4">
              
              <!-- CART VIEW -->
              <ng-container *ngIf="!checkoutStep && !orderSuccess">
                 <div *ngFor="let item of cart.items" class="bg-card border border-border rounded-2xl p-4 flex gap-6 items-center shadow-sm relative overflow-hidden group">
                    <div class="h-24 w-24 bg-background rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-border/50">
                       <img *ngIf="item.product?.images?.length > 0" [src]="item.product.images[0]" class="h-full w-full object-contain p-2">
                       <span *ngIf="!item.product?.images?.length" class="text-3xl">🛒</span>
                    </div>
                    
                    <div class="flex-1">
                       <h3 class="font-bold text-lg mb-1 pr-8">{{ item.product?.nom }}</h3>
                       <div class="text-sm text-muted-foreground mb-3 uppercase tracking-wide">{{ item.product?.category?.nom || item.product?.category?.name || 'Équipement' }}</div>
                       
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
                    <lucide-icon [name]="Trash2Icon" [size]="16"></lucide-icon> Vider tout le panier
                 </button>
              </ng-container>

              <!-- CHECKOUT VIEW -->
              <ng-container *ngIf="checkoutStep && !orderSuccess">
                 <div class="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
                       <lucide-icon [name]="TruckIcon" [size]="28" class="text-primary"></lucide-icon>
                       Details de Livraison
                    </h2>
                    
                    <div class="space-y-5">
                       <div class="grid grid-cols-2 gap-4">
                          <div>
                             <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Nom Complet</label>
                             <input type="text" [(ngModel)]="checkoutForm.name" class="w-full h-12 px-4 bg-background border border-border rounded-xl focus:border-primary focus:outline-none transition-colors">
                          </div>
                          <div>
                             <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Téléphone</label>
                             <input type="text" [(ngModel)]="checkoutForm.phone" class="w-full h-12 px-4 bg-background border border-border rounded-xl focus:border-primary focus:outline-none transition-colors">
                          </div>
                       </div>

                       <div>
                          <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Adresse complète</label>
                          <textarea [(ngModel)]="checkoutForm.address" rows="2" class="w-full p-4 bg-background border border-border rounded-xl focus:border-primary focus:outline-none transition-colors resize-none"></textarea>
                       </div>

                       <div class="bg-primary/5 border border-primary/20 rounded-xl p-5">
                          <label class="text-sm font-bold flex items-center gap-2 mb-2">
                             <lucide-icon [name]="MapPinIcon" [size]="18" class="text-primary"></lucide-icon>
                             Sélectionnez votre Gouvernorat
                          </label>
                          <p class="text-xs text-muted-foreground mb-3">
                             Les frais de livraison sont calculés automatiquement. 
                             <span *ngIf="cartTotal < 300" class="font-bold text-primary block mt-1">💡 Astuce : Livraison GRATUITE à partir de 300 DT d'achats !</span>
                             <span *ngIf="cartTotal >= 300" class="font-bold text-green-600 block mt-1">🎉 Félicitations, la livraison est GRATUITE !</span>
                          </p>
                          <select [(ngModel)]="checkoutForm.governorate" name="governorate" class="w-full h-12 px-4 bg-background border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-sm font-bold cursor-pointer">
                             <option *ngFor="let gov of governorates" [value]="gov.name">{{ gov.name }} ({{ gov.fee }} DT)</option>
                          </select>
                       </div>

                       <button (click)="checkoutStep = false" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mt-4">
                          ← Revenir au panier
                       </button>
                    </div>
                 </div>
              </ng-container>

              <!-- SUCCESS VIEW -->
              <div *ngIf="orderSuccess" class="bg-card border border-border rounded-2xl p-12 text-center shadow-sm flex flex-col items-center">
                 <div class="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <lucide-icon [name]="CheckCircleIcon" [size]="40"></lucide-icon>
                 </div>
                 <h2 class="text-3xl font-black mb-4 uppercase tracking-tighter">Commande Confirmée !</h2>
                  <p class="text-muted-foreground mb-8">Merci pour votre achat. Votre commande est en cours de préparation.</p>
                  <a routerLink="/app/orders" class="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-1">
                     Voir ma commande & QR Code
                  </a>
               </div>

           </div>

           <!-- Summary Sidebar -->
           <div class="lg:col-span-1">
             <div class="bg-card border border-border rounded-3xl p-6 shadow-xl sticky top-24">
               <h3 class="text-xl font-bold mb-6">Récapitulatif</h3>
               
               <div class="space-y-4 mb-6">
                 <div class="flex justify-between items-center text-muted-foreground">
                   <span>Sous-total ({{ cartItemCount }} articles)</span>
                   <span class="font-semibold text-foreground">{{ formatPrice(cartTotal) }}</span>
                 </div>
                 <div class="flex justify-between items-center text-muted-foreground">
                   <span>Frais de livraison</span>
                   <span *ngIf="deliveryFee === 0" class="font-semibold text-green-500">Offert</span>
                   <span *ngIf="deliveryFee > 0" class="font-semibold text-primary">+ {{ formatPrice(deliveryFee) }}</span>
                 </div>
                 <div class="h-px bg-border w-full my-4"></div>
                 <div class="flex justify-between items-center">
                   <span class="text-lg font-bold">Total TTC</span>
                   <span class="text-3xl font-black text-primary">{{ formatPrice(cartTotal + deliveryFee) }}</span>
                 </div>
               </div>

               <button *ngIf="!checkoutStep && !orderSuccess" (click)="goToCheckout()" class="w-full h-14 bg-primary text-primary-foreground rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg shadow-primary/30 hover:-translate-y-1 transition-all">
                  Checkout now <lucide-icon [name]="ArrowRightIcon" [size]="20"></lucide-icon>
               </button>

               <button *ngIf="checkoutStep && !orderSuccess" (click)="confirmOrder()" [disabled]="processing" class="w-full h-14 bg-black text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50">
                  <ng-container *ngIf="!processing">Confirmer définitivement</ng-container>
                  <ng-container *ngIf="processing">Traitement...</ng-container>
               </button>
               
               <div class="mt-4 text-center text-xs text-muted-foreground opacity-60">
                 Paiement 100% sécurisé via Payplug / Stripe
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
  readonly MapPinIcon = MapPin;
  readonly TruckIcon = Truck;
  readonly CheckCircleIcon = CheckCircle;

  cart: any = null;
  loading = true;
  toastMessage: string | null = null;

  checkoutStep = false;
  orderSuccess = false;
  processing = false;

  checkoutForm = {
     name: '',
     phone: '',
     address: '',
     governorate: 'Tunis'
  };

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

  constructor(private productService: ProductService, private router: Router) {}

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
      error: () => this.showToast('Erreur de mise à jour')
    });
  }

  removeItem(itemId: number) {
    this.productService.removeFromCart(itemId).subscribe({
      next: () => {
        this.loadCart();
        this.showToast('Article supprimé');
      },
      error: () => this.showToast('Error during deletion')
    });
  }

  clearCart() {
    if(!confirm("Êtes-vous sûr de vouloir vider le panier ?")) return;
    this.productService.clearCart().subscribe({
      next: () => {
        this.cart = null;
        this.showToast('Panier vidé');
        this.loadCart();
      },
      error: () => this.showToast('Erreur lors du vidage')
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

  get deliveryFee(): number {
     if (this.cartTotal >= 300) return 0;
     const gov = this.governorates.find(g => g.name === this.checkoutForm.governorate);
     return gov ? gov.fee : 3;
  }

  goToCheckout() {
     this.checkoutStep = true;
  }

  confirmOrder() {
     if (!this.checkoutForm.name || !this.checkoutForm.phone || !this.checkoutForm.address) {
        alert("Veuillez remplir vos informations de livraison.");
        return;
     }

     this.processing = true;
     // Simuler le traitement de la commande (idéalement, on appelle un OrderService ici)
     setTimeout(() => {
        this.productService.clearCart().subscribe({
           next: () => {
              this.cart = null;
              this.processing = false;
              this.orderSuccess = true;
              this.showToast('Commande confirmée avec succès !');
           },
           error: () => {
              this.processing = false;
              alert('Erreur lors de la validation de la commande.');
           }
        });
     }, 1500);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(price).replace('TND', 'DT');
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    setTimeout(() => this.toastMessage = null, 3000);
  }
}
