import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ProductService, CartResponse } from '../../services/product.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  orders: CartResponse[] = [];
  selectedOrder: CartResponse | null = null;
  loading = false;
  error = '';
  showAllCarts = false;

  statuses = [
    { value: 'EN_COURS_DE_TRAITEMENT', label: 'En cours de traitement' },
    { value: 'EXPEDIE', label: 'Expédié' },
    { value: 'LIVRE', label: 'Livré' }
  ];

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
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
  }

  closeDetails(): void {
    this.selectedOrder = null;
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
