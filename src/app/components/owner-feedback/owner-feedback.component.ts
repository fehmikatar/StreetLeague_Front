import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { catchError, of } from 'rxjs';
import { Feedback, FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-owner-feedback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="owner-feedback-list">
      <div *ngIf="errorMessage" class="owner-feedback-error">{{ errorMessage }}</div>

      <div *ngIf="!errorMessage && feedbacks.length === 0" class="owner-feedback-empty">
        Aucun feedback reçu pour ce terrain.
      </div>

      <article *ngFor="let feedback of feedbacks" class="owner-feedback-card">
        <div class="owner-feedback-header">
          <div>
            <div class="owner-feedback-user">{{ feedback.userName }}</div>
            <div class="owner-feedback-date">{{ feedback.createdAt | date:'dd/MM/yyyy HH:mm' }}</div>
          </div>

          <div class="owner-feedback-meta">
            <span class="owner-feedback-rating">{{ '★'.repeat(feedback.rating) }}<span class="owner-feedback-rating-empty">{{ '☆'.repeat(5 - feedback.rating) }}</span></span>
            <span *ngIf="feedback.isToxic" class="owner-feedback-toxic-badge">⚠️ Toxique</span>
          </div>
        </div>

        <p class="owner-feedback-comment">{{ feedback.comment }}</p>

        <button
          *ngIf="feedback.isToxic"
          type="button"
          class="owner-feedback-delete"
          (click)="deleteFeedback(feedback.id)">
          Supprimer
        </button>
      </article>
    </div>
  `,
  styles: [`
    .owner-feedback-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .owner-feedback-card {
      border: 1px solid rgba(148, 163, 184, 0.22);
      border-radius: 1rem;
      background: #ffffff;
      padding: 0.9rem;
    }

    .owner-feedback-header {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .owner-feedback-user {
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
    }

    .owner-feedback-date {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.2rem;
    }

    .owner-feedback-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .owner-feedback-rating {
      color: #f59e0b;
      font-size: 0.9rem;
    }

    .owner-feedback-rating-empty {
      color: #94a3b8;
    }

    .owner-feedback-toxic-badge {
      background: #fee2e2;
      color: #b91c1c;
      border-radius: 999px;
      padding: 0.25rem 0.55rem;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .owner-feedback-comment {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.5;
      color: #334155;
      white-space: pre-line;
    }

    .owner-feedback-delete {
      margin-top: 0.75rem;
      border: none;
      border-radius: 0.75rem;
      background: #dc2626;
      color: #ffffff;
      padding: 0.6rem 0.9rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .owner-feedback-delete:hover {
      background: #b91c1c;
    }

    .owner-feedback-empty,
    .owner-feedback-error {
      padding: 0.85rem 0.95rem;
      border-radius: 0.9rem;
      font-size: 0.9rem;
    }

    .owner-feedback-empty {
      background: #f8fafc;
      color: #64748b;
      border: 1px dashed #cbd5e1;
    }

    .owner-feedback-error {
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
      font-weight: 600;
    }
  `]
})
export class OwnerFeedbackComponent implements OnChanges {
  @Input() sportSpaceId: number | string | null = null;

  feedbacks: Feedback[] = [];
  errorMessage = '';

  constructor(
    private feedbackService: FeedbackService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sportSpaceId'] && this.sportSpaceId !== null && this.sportSpaceId !== '') {
      this.loadFeedbacks();
    }
  }

  deleteFeedback(feedbackId: number): void {
    if (!confirm('Supprimer ce feedback toxique ?')) {
      return;
    }

    this.feedbackService.deleteFeedbackAsOwner(feedbackId).subscribe({
      next: () => {
        this.feedbacks = this.feedbacks.filter((feedback) => feedback.id !== feedbackId);
        if (this.feedbacks.length === 0) {
          this.loadFeedbacks();
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error?.error?.error || error?.error?.message || 'Impossible de supprimer le feedback.';
        this.cdr.detectChanges();
      }
    });
  }

  private loadFeedbacks(): void {
    this.errorMessage = '';

    this.feedbackService.getFeedbacksForOwner(this.sportSpaceId as number | string).pipe(
      catchError((error) => {
        const ownerId = localStorage.getItem('user_id');
        if (!ownerId) {
          this.errorMessage = error?.error?.error || error?.error?.message || 'Impossible de charger les feedbacks owner.';
          return of([]);
        }

        return this.feedbackService.getFeedbacksForOwnerByOwnerId(ownerId).pipe(
          catchError((fallbackError) => {
            return this.feedbackService.getFeedbacksForPlayer(this.sportSpaceId as number | string).pipe(
              catchError((publicFallbackError) => {
                this.errorMessage = publicFallbackError?.error?.error || publicFallbackError?.error?.message || fallbackError?.error?.error || fallbackError?.error?.message || 'Impossible de charger les feedbacks owner.';
                return of([]);
              })
            );
          })
        );
      })
    ).subscribe((feedbacks) => {
      const filteredFeedbacks = feedbacks.filter((feedback) => Number(feedback.sportSpaceId) === Number(this.sportSpaceId));

      if (filteredFeedbacks.length > 0 || !localStorage.getItem('user_id')) {
        this.feedbacks = filteredFeedbacks;
        this.cdr.detectChanges();
        return;
      }

      this.feedbackService.getFeedbacksForPlayer(this.sportSpaceId as number | string).subscribe({
        next: (playerFeedbacks) => {
          this.feedbacks = playerFeedbacks;
          this.cdr.detectChanges();
        },
        error: () => {
          this.feedbacks = filteredFeedbacks;
          this.cdr.detectChanges();
        }
      });
    });
  }
}
