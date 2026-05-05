import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ProductService, CartResponse } from '../../services/product.service';
import { QRCodeComponent } from 'angularx-qrcode';
import { RealTimeNotificationService } from '../../services/real-time-notification.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, QRCodeComponent],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit, OnDestroy {
  orders: CartResponse[] = [];
  selectedOrder: CartResponse | null = null;
  loading = false;
  error = '';
  showAllCarts = false;
  private notificationSubscription: Subscription | null = null;
  private pollingSubscription: Subscription | null = null;
  currentQrData: string = '';
  tunnelUrl: string = 'https://streetleague-api-2026.loca.lt';

  statuses = [
    { value: 'EN_COURS_DE_TRAITEMENT', label: 'En cours de traitement' },
    { value: 'EXPEDIE', label: 'Expédié' },
    { value: 'LIVRE', label: 'Livré' }
  ];

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private realTimeNotifService: RealTimeNotificationService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.listenForUpdates();
    this.startPolling();
  }

  listenForUpdates(): void {
    this.notificationSubscription = this.realTimeNotifService.messages$.subscribe(msg => {
      if (msg && msg.type === 'ORDER_UPDATE') {
        console.log('AdminOrdersComponent: Real-time update received:', msg);
        this.loadOrders(); // Refresh the list
      }
    });
  }

  startPolling(): void {
    // Fallback: Refresh every 5 seconds to ensure "automatic" update
    this.pollingSubscription = new Subscription();
    const intervalId = setInterval(() => {
      this.loadOrders();
    }, 5000);
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
    // Use the dynamic tunnel URL configured in the UI
    const backendBase = this.tunnelUrl.replace(/\/$/, '');
    return `${backendBase}/api/cart/confirm-delivery/${order.deliveryConfirmationCode}`;
  }

  toggleDiagnostics(): void {
    this.showAllCarts = !this.showAllCarts;
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = '';
    console.log('AdminOrdersComponent: Requesting all orders...');
    this.productService.getAllOrders().subscribe({
      next: (data) => {
        console.log('AdminOrdersComponent: Received orders:', data);
        this.orders = data || [];
        this.loading = false;
        
        // Update selectedOrder if it's currently open
        if (this.selectedOrder) {
          const updated = this.orders.find(o => o.id === this.selectedOrder?.id);
          if (updated) {
            this.selectedOrder = updated;
            this.currentQrData = this.getConfirmationUrl(updated);
          }
        }

        // The data is there, we force a view update just in case
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des commandes';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('AdminOrdersComponent: Error loading orders', err);
      }
    });
  }

  viewDetails(order: CartResponse): void {
    this.selectedOrder = order;
    this.currentQrData = this.getConfirmationUrl(order);
  }

  closeDetails(): void {
    this.selectedOrder = null;
    this.currentQrData = '';
  }

  updateStatus(order: CartResponse, newStatus: string): void {
    this.productService.updateOrderStatus(order.id, newStatus).subscribe({
      next: (updatedOrder) => {
        order.deliveryStatus = updatedOrder.deliveryStatus;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du statut', err);
      }
    });
  }

  getStatusLabel(value: string | undefined): string {
    if (!value) return 'En attente';
    const status = this.statuses.find(s => s.value === value);
    return status ? status.label : value;
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'EN_COURS_DE_TRAITEMENT': return 'status-processing';
      case 'EXPEDIE': return 'status-shipped';
      case 'LIVRE': return 'status-delivered';
      default: return 'status-unknown';
    }
  }
}
