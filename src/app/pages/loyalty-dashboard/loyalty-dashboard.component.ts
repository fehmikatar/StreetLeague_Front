import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoyaltyService } from '../../services/loyalty.service';
import { ApiService } from '../../services/api.service';
import { LoyaltyClient, LoyaltyProgram, LoyaltyTransaction } from '../../models/loyalty.model';
import { LucideAngularModule, Trophy, Gift, History, Coins, ArrowRight, Sparkles, ShoppingBag } from 'lucide-angular';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-loyalty-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DatePipe],
  templateUrl: './loyalty-dashboard.component.html',
  styles: [`
    .dialog-overlay { background-color: rgba(0, 0, 0, 0.5); }
  `]
})
export class LoyaltyDashboardComponent implements OnInit {
  loyaltyService = inject(LoyaltyService);
  apiService = inject(ApiService);

  // Icons
  TrophyIcon = Trophy;
  GiftIcon = Gift;
  HistoryIcon = History;
  CoinsIcon = Coins;
  ArrowRightIcon = ArrowRight;
  SparklesIcon = Sparkles;
  ShoppingBagIcon = ShoppingBag;

  client = signal<LoyaltyClient | null>(null);
  transactions = signal<LoyaltyTransaction[]>([]);
  programs = signal<LoyaltyProgram[]>([]);
  isLoading = signal(true);

  redeemAmornt = signal<number>(0);
  redeemReason = signal<string>('');
  isRedeeming = signal(false);
  redeemOpen = signal(false);

  userId = this.apiService.getUserId() || 0;

  ngOnInit() {
    this.fetchLoyaltyData();
  }

  fetchLoyaltyData() {
    if (!this.userId) {
      this.isLoading.set(false);
      return;
    }
    this.isLoading.set(true);

    this.loyaltyService.getClientByUser(this.userId).subscribe({
      next: (clientData) => {
        this.client.set(clientData);
        this.loyaltyService.getUserTransactions(this.userId).subscribe({
          next: (txData) => {
            this.transactions.set(txData);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false)
        });
      },
      error: (err) => {
        // If 404, user is not enrolled. Fetch all programs
        if (err.status === 404 || !this.client()) {
          this.loyaltyService.getAllPrograms().subscribe({
            next: (programs) => {
              this.programs.set(programs);
              this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false)
          });
        } else {
          this.isLoading.set(false);
        }
      }
    });
  }

  handleEnroll(programId: number) {
    this.loyaltyService.enrollUser({ userId: this.userId, programId }).subscribe({
      next: () => {
        toast.success("Successfully joined the program!");
        this.fetchLoyaltyData();
      },
      error: (err) => {
        console.error("Enrollment failed", err);
        toast.error("Failed to join program.");
      }
    });
  }

  handleRedeem() {
    if (this.redeemAmornt() <= 0 || !this.redeemReason()) return;
    this.isRedeeming.set(true);

    this.loyaltyService.redeemPoints(this.userId, this.redeemAmornt(), this.redeemReason()).subscribe({
      next: () => {
        this.redeemOpen.set(false);
        this.isRedeeming.set(false);
        this.redeemAmornt.set(0);
        this.redeemReason.set('');
        toast.success("Points successfully redeemed!");
        this.fetchLoyaltyData();
      },
      error: (err) => {
        console.error("Failed to redeem points", err);
        toast.error("Failed to redeem points.");
        this.isRedeeming.set(false);
      }
    });
  }

  getProgressValue(): number {
    const total = this.client()?.totalPointsEarned || 0;
    return Math.min(100, (total % 1000) / 10);
  }

  getPointsToNextTier(): number {
    const total = this.client()?.totalPointsEarned || 0;
    return 1000 - (total % 1000);
  }
}
