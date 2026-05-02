import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { finalize } from 'rxjs';
import { ReviewsService } from '../../services/reviews.service';

export interface Review {
  userName: string;
  rating: number;
  comment: string;
  isToxic?: boolean;
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnChanges {
  @Input() reviews: Review[] = [];

  currentPage = 0;
  pageSize = 3;
  showReviews = false;
  summary = '';
  isLoadingSummary = false;
  summaryError = '';

  constructor(
    private reviewsService: ReviewsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reviews'] && this.currentPage >= this.totalPages) {
      this.currentPage = Math.max(this.totalPages - 1, 0);
    }
  }

  get visibleReviews(): Review[] {
    const start = this.currentPage * this.pageSize;
    return this.reviews.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(Math.ceil(this.reviews.length / this.pageSize), 1);
  }

  get emptySlots(): null[] {
    return Array.from({ length: Math.max(this.pageSize - this.visibleReviews.length, 0) }, () => null);
  }

  get canGoPrev(): boolean {
    return this.currentPage > 0;
  }

  get canGoNext(): boolean {
    return this.currentPage < this.totalPages - 1;
  }

  toggleReviews(): void {
    this.showReviews = !this.showReviews;
  }

  prevPage(): void {
    if (this.canGoPrev) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.canGoNext) {
      this.currentPage++;
    }
  }

  summarizeReviews(): void {
    if (this.reviews.length === 0 || this.isLoadingSummary) {
      return;
    }

    const comments = this.reviews.map((review) => review.comment);

    this.summary = '';
    this.summaryError = '';
    this.isLoadingSummary = true;

    this.reviewsService.summarizeReviews(comments).pipe(
      finalize(() => {
        this.isLoadingSummary = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (summary) => {
        this.summary = summary;
        this.summaryError = '';
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        this.summaryError = error.message || 'Impossible de générer le résumé des avis.';
        this.summary = '';
        this.cdr.detectChanges();
      }
    });
  }

  getStars(rating: number): boolean[] {
    const normalizedRating = Math.max(0, Math.min(5, rating));
    return Array.from({ length: 5 }, (_, index) => index < normalizedRating);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
