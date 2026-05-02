import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { QRCodeComponent } from 'angularx-qrcode';
import { CartResponse, ProductService } from '../../services/product.service';
import { RealTimeNotificationService } from '../../services/real-time-notification.service';
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
  currentQrData = '';

  private notificationSubscription: Subscription | null = null;
  private pollingSubscription: Subscription | null = null;

  statuses = [
    { value: 'EN_COURS_DE_TRAITEMENT', label: 'En cours de traitement' },
    { value: 'EXPEDIE', label: 'Expedie' },
    { value: 'LIVRE', label: 'Livre' }
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
    this.notificationSubscription = this.realTimeNotifService.messages$.subscribe((message) => {
      if (message && message.type === 'ORDER_UPDATE') {
        this.loadOrders();
      }
    });
  }

  startPolling(): void {
    this.pollingSubscription = new Subscription();
    const intervalId = setInterval(() => {
      this.loadOrders();
    }, 5000);
    this.pollingSubscription.add(() => clearInterval(intervalId));
  }

  ngOnDestroy(): void {
    this.notificationSubscription?.unsubscribe();
    this.pollingSubscription?.unsubscribe();
  }

  getConfirmationUrl(order: CartResponse): string {
    return `${environment.apiUrl}/cart/confirm-delivery/${order.deliveryConfirmationCode || ''}`;
  }

  toggleDiagnostics(): void {
    this.showAllCarts = !this.showAllCarts;
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = '';
    this.productService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data || [];
        this.loading = false;

        if (this.selectedOrder) {
          const updatedOrder = this.orders.find((order) => order.id === this.selectedOrder?.id);
          if (updatedOrder) {
            this.selectedOrder = updatedOrder;
            this.currentQrData = this.getConfirmationUrl(updatedOrder);
          }
        }

        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des commandes';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('AdminOrdersComponent: Error loading orders', error);
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
      error: (error) => {
        console.error('Erreur lors de la mise a jour du statut', error);
      }
    });
  }

  getStatusLabel(value: string | undefined): string {
    if (!value) {
      return 'En attente';
    }

    const status = this.statuses.find((entry) => entry.value === value);
    return status ? status.label : value;
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
}
