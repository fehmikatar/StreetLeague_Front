import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { catchError, of } from 'rxjs';
import { Review, ReviewsComponent } from '../reviews/reviews.component';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-feedback-list',
  standalone: true,
  imports: [CommonModule, ReviewsComponent],
  template: `
    <div *ngIf="errorMessage" class="feedback-list-error">{{ errorMessage }}</div>
    <app-reviews [reviews]="reviews"></app-reviews>
  `,
  styles: [`
    .feedback-list-error {
      margin-bottom: 0.75rem;
      padding: 0.85rem 1rem;
      border-radius: 0.9rem;
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
      font-weight: 600;
      font-size: 0.9rem;
    }
  `]
})
export class FeedbackListComponent implements OnChanges {
  @Input() sportSpaceId: number | string | null = null;

  reviews: Review[] = [];
  errorMessage = '';

  constructor(private feedbackService: FeedbackService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sportSpaceId'] && this.sportSpaceId !== null && this.sportSpaceId !== '') {
      this.loadFeedbacks();
    }
  }

  private loadFeedbacks(): void {
    this.errorMessage = '';

    this.feedbackService.getFeedbacksForPlayer(this.sportSpaceId as number | string).pipe(
      catchError((error) => {
        this.errorMessage = error?.error?.error || error?.error?.message || 'Impossible de charger les avis du terrain.';
        return of([]);
      })
    ).subscribe((feedbacks) => {
      this.reviews = feedbacks.map((feedback) => ({
        userName: feedback.userName,
        rating: feedback.rating,
        comment: feedback.censoredComment || feedback.comment,
        isToxic: feedback.isToxic
      }));
    });
  }
}
