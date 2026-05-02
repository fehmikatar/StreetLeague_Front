import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ShoppingBag, Clock, CheckCircle, Truck, QrCode, Package, ChevronRight, MapPin } from 'lucide-angular';
import { ProductService, CartResponse } from '../services/product.service';
import { RealTimeNotificationService } from '../services/real-time-notification.service';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-user-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background/50 p-4 md:p-8">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <lucide-icon [img]="PackageIcon" class="w-6 h-6 text-primary"></lucide-icon>
          </div>
          <div>
            <h1 class="text-3xl font-black uppercase tracking-tighter">Mes Commandes</h1>
            <p class="text-muted-foreground">Suivez l'état de vos achats en temps réel</p>
          </div>
        </div>

        <div *ngIf="loading" class="flex justify-center p-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div *ngIf="!loading && orders.length === 0" class="bg-card rounded-3xl p-12 text-center border border-border shadow-sm">
          <lucide-icon [img]="ShoppingBagIcon" class="w-16 h-16 text-muted/30 mx-auto mb-6"></lucide-icon>
          <h2 class="text-2xl font-bold mb-2">Aucune commande trouvée</h2>
          <p class="text-muted-foreground mb-8">Vous n'avez pas encore passé de commande sur StreetLeague.</p>
          <a routerLink="/app/sponsors" class="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-primary/30 transition-all inline-block">
            Découvrir la boutique
          </a>
        </div>

        <div *ngIf="!loading && orders.length > 0" class="space-y-6">
          <div *ngFor="let order of orders" class="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div class="p-6">
              <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <div class="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Commande #{{ order.orderCode }}</div>
                  <div class="text-sm text-muted-foreground">{{ formatDate(order.createdAt) }}</div>
                </div>
                <div [ngClass]="getStatusClass(order.deliveryStatus)" class="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
                  {{ getStatusLabel(order.deliveryStatus) }}
                </div>
              </div>

              <div class="grid md:grid-cols-3 gap-8 items-start">
                <!-- Items Summary -->
                <div class="md:col-span-3 space-y-4">
                  <div *ngFor="let item of order.items" class="flex items-center gap-4 bg-muted/30 p-3 rounded-2xl">
                    <div class="w-12 h-12 bg-background rounded-lg flex items-center justify-center overflow-hidden border border-border/50">
                       <img *ngIf="item.productImage" [src]="item.productImage" class="w-full h-full object-contain p-1">
                       <span *ngIf="!item.productImage">📦</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="font-bold text-sm truncate">{{ item.productName }}</div>
                      <div class="text-xs text-muted-foreground">Qté: {{ item.quantity }} × {{ formatPrice(item.price) }}</div>
                    </div>
                  </div>
                  
                  <div class="pt-4 border-t border-border/50 flex justify-between items-center">
                    <div class="text-sm font-medium">Total de la commande</div>
                    <div class="text-xl font-black text-primary">{{ formatPrice(order.total) }}</div>
                  </div>
                </div>

                <!-- Order Status Info Section Removed for User -->
              </div>
            </div>
            
            <!-- Address Footer -->
            <div class="bg-muted/30 px-6 py-4 flex items-center gap-2 text-xs text-muted-foreground border-t border-border">
              <lucide-icon [img]="MapPinIcon" class="w-3.5 h-3.5 text-primary"></lucide-icon>
              <span>Livré à : <strong>{{ order.clientAddress }}, {{ order.clientCity }}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .status-processing { @apply bg-blue-100 text-blue-700; }
    .status-shipped { @apply bg-amber-100 text-amber-700; }
    .status-delivered { @apply bg-green-100 text-green-700; }
    .status-unknown { @apply bg-gray-100 text-gray-700; }
  `]
})
export class UserOrdersComponent implements OnInit, OnDestroy {
  readonly PackageIcon = Package;
  readonly ShoppingBagIcon = ShoppingBag;
  readonly CheckCircleIcon = CheckCircle;
  readonly TruckIcon = Truck;
  readonly MapPinIcon = MapPin;
  readonly ClockIcon = Clock;

  orders: CartResponse[] = [];
  loading = true;
  private notificationSubscription: Subscription | null = null;
  private pollingSubscription: Subscription | null = null;

  constructor(
    private productService: ProductService,
    private realTimeNotifService: RealTimeNotificationService
  ) {}

  ngOnInit() {
    this.loadOrders();
    this.listenForUpdates();
    this.startPolling();
  }

  loadOrders() {
    this.loading = true;
    this.productService.getMyOrders().subscribe({
      next: (data) => {
        this.orders = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  listenForUpdates(): void {
    this.notificationSubscription = this.realTimeNotifService.messages$.subscribe(msg => {
      if (msg && msg.type === 'ORDER_UPDATE') {
        this.loadOrders(); 
      }
    });
  }

  startPolling(): void {
    // Fallback: Refresh every 10 seconds for user
    const intervalId = setInterval(() => {
      this.loadOrders();
    }, 10000);
    this.pollingSubscription = new Subscription();
    this.pollingSubscription.add(() => clearInterval(intervalId));
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  getConfirmationUrl(order: CartResponse): string {
    // Force backendBase to the persistent localtunnel URL to bypass firewall
    const backendBase = 'https://streetleague-api-2026.loca.lt';
    return `${backendBase}/api/cart/confirm-delivery/${order.deliveryConfirmationCode}`;
  }

  getShortCode(order: CartResponse): string {
    if (!order.deliveryConfirmationCode) return 'PENDING';
    return order.deliveryConfirmationCode.substring(0, 8).toUpperCase();
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'EN_COURS_DE_TRAITEMENT': return 'En préparation';
      case 'EXPEDIE': return 'En cours de livraison';
      case 'LIVRE': return 'Livrée';
      default: return 'En attente';
    }
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'EN_COURS_DE_TRAITEMENT': return 'status-processing';
      case 'EXPEDIE': return 'status-shipped';
      case 'LIVRE': return 'status-delivered';
      default: return 'status-unknown';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(price).replace('TND', 'DT');
  }
}
