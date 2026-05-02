import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { LucideAngularModule, ShoppingBag, CheckCircle, Truck, Package, MapPin } from 'lucide-angular';
import { QRCodeComponent } from 'angularx-qrcode';
import { CartResponse, ProductService } from '../services/product.service';
import { RealTimeNotificationService } from '../services/real-time-notification.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-user-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, QRCodeComponent],
  template: `
    <div class="min-h-screen bg-background/50 p-4 md:p-8">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <lucide-icon [img]="PackageIcon" class="w-6 h-6 text-primary"></lucide-icon>
          </div>
          <div>
            <h1 class="text-3xl font-black uppercase tracking-tighter">Mes Commandes</h1>
            <p class="text-muted-foreground">Suivez vos achats et montrez votre QR code au livreur</p>
          </div>
        </div>

        <div *ngIf="loading" class="flex justify-center p-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div *ngIf="!loading && orders.length === 0" class="bg-card rounded-3xl p-12 text-center border border-border shadow-sm">
          <lucide-icon [img]="ShoppingBagIcon" class="w-16 h-16 text-muted/30 mx-auto mb-6"></lucide-icon>
          <h2 class="text-2xl font-bold mb-2">Aucune commande trouvee</h2>
          <p class="text-muted-foreground mb-8">Vous n'avez pas encore passe de commande sur StreetLeague.</p>
          <a routerLink="/app/sponsors" class="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-primary/30 transition-all inline-block">
            Decouvrir la boutique
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
                <div class="md:col-span-2 space-y-4">
                  <div *ngFor="let item of order.items" class="flex items-center gap-4 bg-muted/30 p-3 rounded-2xl">
                    <div class="w-12 h-12 bg-background rounded-lg flex items-center justify-center overflow-hidden border border-border/50">
                      <img *ngIf="item.productImage" [src]="item.productImage" class="w-full h-full object-contain p-1">
                      <img *ngIf="!item.productImage && item.product?.images?.length" [src]="item.product?.images?.[0]" class="w-full h-full object-contain p-1">
                      <span *ngIf="!item.productImage && !item.product?.images?.length">📦</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="font-bold text-sm truncate">{{ item.productName || item.product?.nom }}</div>
                      <div class="text-xs text-muted-foreground">Qte: {{ item.quantity }} x {{ formatPrice(item.price) }}</div>
                    </div>
                  </div>

                  <div class="pt-4 border-t border-border/50 flex justify-between items-center">
                    <div class="text-sm font-medium">Total de la commande</div>
                    <div class="text-xl font-black text-primary">{{ formatPrice(order.total) }}</div>
                  </div>
                </div>

                <div class="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex flex-col items-center text-center">
                  <ng-container *ngIf="order.deliveryStatus !== 'LIVRE'">
                    <div class="py-4">
                      <div class="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <lucide-icon [img]="TruckIcon" class="w-8 h-8"></lucide-icon>
                      </div>
                      <h4 class="font-bold text-sm mb-1">Livraison en cours</h4>
                      <p class="text-[10px] text-muted-foreground leading-tight">Votre commande est en route. Le livreur validera la reception lors de la remise.</p>
                      <div class="mt-4 p-2 bg-background rounded-lg border border-border">
                        <span class="text-[10px] font-bold text-muted-foreground block uppercase">Code de confirmation</span>
                        <span class="text-sm font-mono font-bold text-primary">{{ getShortCode(order) }}</span>
                      </div>
                      <div class="mt-4 flex justify-center bg-white p-2 rounded-xl shadow-sm border border-border/50">
                        <qrcode [qrdata]="getConfirmationUrl(order)" [width]="120" [errorCorrectionLevel]="'M'"></qrcode>
                      </div>
                    </div>
                  </ng-container>

                  <ng-container *ngIf="order.deliveryStatus === 'LIVRE'">
                    <div class="py-8">
                      <div class="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <lucide-icon [img]="CheckCircleIcon" class="w-8 h-8"></lucide-icon>
                      </div>
                      <h4 class="font-bold text-green-600">Commande Livree</h4>
                      <p class="text-xs text-muted-foreground">Merci pour votre confiance !</p>
                    </div>
                  </ng-container>
                </div>
              </div>
            </div>

            <div class="bg-muted/30 px-6 py-4 flex items-center gap-2 text-xs text-muted-foreground border-t border-border">
              <lucide-icon [img]="MapPinIcon" class="w-3.5 h-3.5 text-primary"></lucide-icon>
              <span>Livre a : <strong>{{ order.clientAddress }}, {{ order.clientCity }}</strong></span>
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

  orders: CartResponse[] = [];
  loading = true;
  private notificationSubscription: Subscription | null = null;
  private pollingSubscription: Subscription | null = null;

  constructor(
    private productService: ProductService,
    private realTimeNotifService: RealTimeNotificationService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.listenForUpdates();
    this.startPolling();
  }

  loadOrders(): void {
    this.loading = true;
    this.productService.getMyOrders().subscribe({
      next: (data) => {
        this.orders = data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
      }
    });
  }

  listenForUpdates(): void {
    this.notificationSubscription = this.realTimeNotifService.messages$.subscribe((message) => {
      if (message && message.type === 'ORDER_UPDATE') {
        this.loadOrders();
      }
    });
  }

  startPolling(): void {
    const intervalId = setInterval(() => {
      this.loadOrders();
    }, 10000);

    this.pollingSubscription = new Subscription();
    this.pollingSubscription.add(() => clearInterval(intervalId));
  }

  ngOnDestroy(): void {
    this.notificationSubscription?.unsubscribe();
    this.pollingSubscription?.unsubscribe();
  }

  getConfirmationUrl(order: CartResponse): string {
    return `${environment.apiUrl}/cart/confirm-delivery/${order.deliveryConfirmationCode || ''}`;
  }

  getShortCode(order: CartResponse): string {
    if (!order.deliveryConfirmationCode) {
      return 'PENDING';
    }

    return order.deliveryConfirmationCode.substring(0, 8).toUpperCase();
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'EN_COURS_DE_TRAITEMENT':
        return 'En preparation';
      case 'EXPEDIE':
        return 'En cours de livraison';
      case 'LIVRE':
        return 'Livree';
      default:
        return 'En attente';
    }
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'EN_COURS_DE_TRAITEMENT':
        return 'status-processing';
      case 'EXPEDIE':
        return 'status-shipped';
      case 'LIVRE':
        return 'status-delivered';
      default:
        return 'status-unknown';
    }
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) {
      return 'N/A';
    }

    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number | undefined): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(price || 0).replace('TND', 'DT');
  }
}
