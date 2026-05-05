import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromotionService } from '../../services/promotion.service';
import { PromotionRequest, PromotionResponse } from '../../models/promotion.model';
import { LucideAngularModule, Plus, Pencil, Trash2, Tag, Loader2, Calendar, Percent } from 'lucide-angular';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-admin-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-promotions.component.html',
  styles: [`
    .dialog-overlay { background-color: rgba(0, 0, 0, 0.5); }
  `]
})
export class AdminPromotionsComponent implements OnInit {
  promotionService = inject(PromotionService);

  // Icons
  PlusIcon = Plus;
  PencilIcon = Pencil;
  Trash2Icon = Trash2;
  TagIcon = Tag;
  Loader2Icon = Loader2;
  CalendarIcon = Calendar;
  PercentIcon = Percent;

  promotions = signal<PromotionResponse[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);

  isModalOpen = signal(false);
  editingPromotion = signal<PromotionResponse | null>(null);

  todayStr = new Date().toISOString().split('T')[0];

  formData: PromotionRequest = {
    name: '',
    promoCode: '',
    discornt: 10,
    startDate: this.todayStr,
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
  };

  ngOnInit() {
    this.fetchPromotions();
  }

  fetchPromotions() {
    this.isLoading.set(true);
    this.promotionService.getAll().subscribe({
      next: (data) => {
        this.promotions.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        toast.error("Failed to load promotions");
        this.isLoading.set(false);
      }
    });
  }

  resetForm() {
    this.formData = {
      name: '',
      promoCode: '',
      discornt: 10,
      startDate: this.todayStr,
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
    };
    this.editingPromotion.set(null);
  }

  openCreateModal() {
    this.resetForm();
    this.isModalOpen.set(true);
  }

  openEditModal(promotion: PromotionResponse) {
    this.editingPromotion.set(promotion);
    this.formData = {
      name: promotion.name,
      promoCode: promotion.promoCode,
      discornt: promotion.discornt,
      startDate: promotion.startDate,
      endDate: promotion.endDate
    };
    this.isModalOpen.set(true);
  }

  handleSubmit() {
    this.isSubmitting.set(true);
    if (this.editingPromotion()) {
      this.promotionService.update(this.editingPromotion()!.id, this.formData).subscribe({
        next: () => {
          this.fetchPromotions();
          this.isModalOpen.set(false);
          this.isSubmitting.set(false);
          toast.success("Promotion updated successfully!");
        },
        error: (err) => {
          console.error(err);
          toast.error("Error updating promotion.");
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.promotionService.create(this.formData).subscribe({
        next: () => {
          this.fetchPromotions();
          this.isModalOpen.set(false);
          this.isSubmitting.set(false);
          toast.success("Promotion created successfully!");
        },
        error: (err) => {
          console.error(err);
          toast.error("Error creating promotion.");
          this.isSubmitting.set(false);
        }
      });
    }
  }

  handleDelete(id: number) {
    if(!confirm('Are yor sure yor want to delete this promotion?')) return;
    this.promotionService.delete(id).subscribe({
      next: () => {
        this.fetchPromotions();
        toast.success("Promotion deleted successfully!");
      },
      error: (err) => {
        console.error(err);
        toast.error("Error deleting promotion.");
      }
    });
  }

  getStatus(startDate: string, endDate: string): string {
    const today = this.todayStr;
    if (endDate < today) return 'Expired';
    if (startDate > today) return 'Upcoming';
    return 'Active';
  }
}
