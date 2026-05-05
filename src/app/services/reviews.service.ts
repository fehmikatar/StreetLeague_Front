import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

interface FeedbackSummaryResponse {
  summary?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private readonly apiUrl = `${environment.apiUrl}/feedbacks/summary`;

  constructor(private http: HttpClient) {}

  summarizeReviews(comments: string[]): Observable<string> {
    const normalizedComments = comments
      .map((comment) => comment.trim())
      .filter((comment) => comment.length > 0);

    if (normalizedComments.length === 0) {
      return throwError(() => new Error('Aucun commentaire à résumer.'));
    }

    return this.http.post<FeedbackSummaryResponse>(this.apiUrl, {
      comments: normalizedComments
    }).pipe(
      map((response) => response.summary?.trim() || ''),
      map((summary) => {
        if (!summary) {
          throw new Error('Aucun résumé n\'a été généré par l\'IA.');
        }

        return summary;
      }),
      catchError((error) => {
        const apiMessage = error?.error?.error?.message || error?.message || 'Erreur inconnue lors de l\'analyse des avis.';
        return throwError(() => new Error(apiMessage));
      })
    );
  }
}
