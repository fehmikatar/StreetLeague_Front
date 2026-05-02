import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-stats.component.html',
  styleUrls: ['./admin-stats.component.css']
})
export class AdminStatsComponent implements OnInit {
  topProducts: any[] = [];
  abandonedByCity: any[] = [];
  highDemandProducts: any[] = [];
  promoStats: any[] = [];
  loading = true;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;

    this.productService.getTopSellingProductsStats().subscribe({
      next: (data: any[]) => {
        this.topProducts = data;
      },
      error: (error: any) => {
        console.error('Error loading top products', error);
      }
    });

    this.productService.getHighDemandProducts().subscribe({
      next: (data: any[]) => {
        this.highDemandProducts = data;
      },
      error: (error: any) => {
        console.error('Error loading high demand products', error);
      }
    });

    this.productService.getAbandonedCartStatsCity().subscribe({
      next: (data: any[]) => {
        this.abandonedByCity = data;
      },
      error: (error: any) => {
        console.error('Error loading abandoned stats', error);
      }
    });

    this.productService.getPromoCodeUsageStats().subscribe({
      next: (data: any[]) => {
        this.promoStats = data;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading promo stats', error);
        this.loading = false;
      }
    });
  }

  get lostRevenueTotal(): number {
    return this.abandonedByCity.reduce((sum, item) => sum + (item.lostRevenue || 0), 0);
  }

  get totalOrdersFromPromos(): number {
    return this.promoStats.reduce((sum, item) => sum + (item.usageCount || 0), 0);
  }
}
