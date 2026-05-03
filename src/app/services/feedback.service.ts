import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Feedback {
  id: number;
  sportSpaceId: number;
  comment: string;
  censoredComment: string;
  isToxic: boolean;
  rating: number;
  userName: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private readonly apiUrl = `${environment.apiUrl}/feedbacks`;

  constructor(private http: HttpClient) {}

  getFeedbacksForPlayer(sportSpaceId: number | string): Observable<Feedback[]> {
    return this.http.get<any[]>(`${this.apiUrl}/space/${sportSpaceId}/player`).pipe(
      map((feedbacks) => feedbacks.map((feedback) => this.mapFeedback(feedback, false)))
    );
  }

  getFeedbacksForOwner(sportSpaceId: number | string): Observable<Feedback[]> {
    return this.http.get<any[]>(`${this.apiUrl}/space/${sportSpaceId}/owner`).pipe(
      map((feedbacks) => feedbacks.map((feedback) => this.mapFeedback(feedback, true)))
    );
  }

  getFeedbacksForOwnerByOwnerId(ownerId: number | string): Observable<Feedback[]> {
    return this.http.get<any[]>(`${this.apiUrl}/owner/${ownerId}`).pipe(
      map((feedbacks) => feedbacks.map((feedback) => this.mapFeedback(feedback, true)))
    );
  }

  deleteFeedbackAsOwner(feedbackId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${feedbackId}/owner/me`);
  }

  private mapFeedback(feedback: any, ownerView: boolean): Feedback {
    const safeComment = ownerView
      ? (feedback.comment || '')
      : (feedback.censoredComment || feedback.comment || '');

    return {
      id: Number(feedback.id),
      sportSpaceId: Number(feedback.sportSpaceId),
      comment: safeComment,
      censoredComment: feedback.censoredComment || safeComment,
      isToxic: !!feedback.isToxic,
      rating: Number(feedback.rating),
      userName: feedback.userName || 'Utilisateur',
      createdAt: feedback.createdAt || new Date().toISOString()
    };
  }
}
