import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize, forkJoin, of } from 'rxjs';
import { LucideAngularModule, Calendar, Clock, MapPin, Loader2, X, MessageSquare, Users } from 'lucide-angular';
import { BookingService, Reservation, FieldFeedback } from '../../services/booking.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.css'
})
export class MyBookingsComponent implements OnInit {
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly MapPinIcon = MapPin;
  readonly Loader2Icon = Loader2;
  readonly XIcon = X;
  readonly MessageSquareIcon = MessageSquare;
  readonly UsersIcon = Users;
  readonly ratingChoices = [1, 2, 3, 4, 5];

  myReservations: Reservation[] = [];
  teamReservations: Reservation[] = [];
  filteredMyReservations: Reservation[] = [];
  filteredTeamReservations: Reservation[] = [];
  userFeedbacks: FieldFeedback[] = [];

  loading = true;
  cancelingReservationId: number | null = null;
  confirmingReservationId: number | null = null;
  activeFeedbackFormKey: string | null = null;

  fieldFilter = '';
  statusFilter = '';
  dateFilter = '';

  private currentUserId = '';
  private feedbackByFieldId: Record<string, FieldFeedback> = {};
  private feedbackDrafts: Record<string, { rating: number; comment: string; submitting: boolean; error: string }> = {};

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.currentUserId = localStorage.getItem('user_id') || '';
    this.bookingService.refreshFields();
    this.loadBookings();
  }

  get fieldOptions(): string[] {
    return [...new Set([...this.myReservations, ...this.teamReservations].map((reservation) => reservation.fieldName).filter(Boolean))]
      .sort((left, right) => left.localeCompare(right));
  }

  loadBookings(): void {
    const feedbacks$ = this.currentUserId ? this.bookingService.getUserFieldFeedbacks(this.currentUserId) : of([]);

    this.loading = true;
    forkJoin({
      myReservations: this.bookingService.getMyBookings(),
      teamReservations: this.bookingService.getMyTeamBookings(),
      feedbacks: feedbacks$
    })
      .pipe(finalize(() => { this.loading = false; }))
      .subscribe({
        next: ({ myReservations, teamReservations, feedbacks }) => {
          this.myReservations = myReservations;
          this.teamReservations = teamReservations.filter((reservation) => reservation.userId !== this.currentUserId);
          this.userFeedbacks = feedbacks;
          this.feedbackByFieldId = feedbacks.reduce<Record<string, FieldFeedback>>((accumulator, feedback) => {
            accumulator[feedback.fieldId] = feedback;
            return accumulator;
          }, {});
          console.log('Réservations reçues:', this.myReservations);
          console.log('Réservations équipe reçues:', this.teamReservations);
          this.applyFilters();
        },
        error: () => {
          this.myReservations = [];
          this.teamReservations = [];
          this.filteredMyReservations = [];
          this.filteredTeamReservations = [];
          this.userFeedbacks = [];
          this.feedbackByFieldId = {};
        }
      });
  }

  applyFilters(): void {
    this.filteredMyReservations = this.filterReservations(this.myReservations);
    this.filteredTeamReservations = this.filterReservations(this.teamReservations);
  }

  cancelReservation(reservation: Reservation): void {
    const shouldCancel = confirm(`Êtes-vous sûr de vouloir annuler la réservation pour "${reservation.fieldName}" ?`);
    if (!shouldCancel) {
      return;
    }

    this.cancelingReservationId = reservation.id;
    this.bookingService.cancelReservation(reservation.id)
      .pipe(finalize(() => { this.cancelingReservationId = null; }))
      .subscribe({
        next: () => {
          this.loadBookings();
        },
        error: () => {
          this.loadBookings();
        }
      });
  }

  confirmReservationPresence(reservation: Reservation): void {
    const shouldConfirm = confirm(`Confirmer votre présence pour "${reservation.fieldName}" le ${this.formatReservationShortDate(reservation)} à ${reservation.time} ?`);
    if (!shouldConfirm) {
      return;
    }

    this.confirmingReservationId = reservation.id;
    this.bookingService.confirmReservationPresence(reservation.id)
      .pipe(finalize(() => { this.confirmingReservationId = null; }))
      .subscribe({
        next: () => {
          this.loadBookings();
        },
        error: (err) => {
          const errorMsg = err?.error?.error || err?.error?.message || err?.message || 'Erreur lors de la confirmation';
          alert('Impossible de confirmer la présence: ' + errorMsg);
        }
      });
  }

  isAwaitingConfirmation(reservation: Reservation): boolean {
    return this.bookingService.isAwaitingPresenceConfirmation(reservation.status);
  }

  canConfirmReservation(reservation: Reservation): boolean {
    return this.isAwaitingConfirmation(reservation) && !this.isReservationFinished(reservation);
  }

  canCancelReservation(reservation: Reservation): boolean {
    return ['pending_confirmation', 'reminder_sent', 'confirmed'].includes(reservation.status)
      && !this.isReservationFinished(reservation);
  }

  canManageFeedback(reservation: Reservation): boolean {
    return this.hasExistingFeedback(reservation) || this.isFeedbackEligible(reservation);
  }

  hasExistingFeedback(reservation: Reservation): boolean {
    return !!this.feedbackByFieldId[reservation.fieldId];
  }

  getExistingFeedback(reservation: Reservation): FieldFeedback | null {
    return this.feedbackByFieldId[reservation.fieldId] || null;
  }

  isFeedbackFormOpen(section: 'mine' | 'team', reservation: Reservation): boolean {
    return this.activeFeedbackFormKey === this.getFeedbackFormKey(section, reservation);
  }

  openFeedbackForm(section: 'mine' | 'team', reservation: Reservation): void {
    const formKey = this.getFeedbackFormKey(section, reservation);
    const existingFeedback = this.getExistingFeedback(reservation);
    const draft = this.getFeedbackDraft(reservation.fieldId);

    if (existingFeedback) {
      draft.rating = existingFeedback.rating;
      draft.comment = existingFeedback.comment;
      draft.error = '';
    }

    this.activeFeedbackFormKey = this.activeFeedbackFormKey === formKey ? null : formKey;
  }

  selectFeedbackRating(fieldId: string, rating: number): void {
    const draft = this.getFeedbackDraft(fieldId);
    draft.rating = rating;
  }

  submitFeedback(reservation: Reservation): void {
    const draft = this.getFeedbackDraft(reservation.fieldId);
    const existingFeedback = this.getExistingFeedback(reservation);

    if (!this.currentUserId) {
      draft.error = 'Utilisateur introuvable.';
      return;
    }

    if (draft.rating < 1 || draft.comment.trim().length < 10) {
      draft.error = 'Veuillez choisir une note et écrire au moins 10 caractères.';
      return;
    }

    draft.submitting = true;
    draft.error = '';

    const payload = {
      reservationId: reservation.id,
      userId: this.currentUserId,
      fieldId: reservation.fieldId,
      fieldName: reservation.fieldName,
      rating: draft.rating,
      comment: draft.comment.trim()
    };

    const request$ = existingFeedback?.id
      ? this.bookingService.updateFieldFeedback(existingFeedback.id, payload)
      : this.bookingService.saveFieldFeedback(payload);

    request$
      .pipe(finalize(() => { draft.submitting = false; }))
      .subscribe({
        next: (feedback) => {
          this.userFeedbacks = [feedback, ...this.userFeedbacks.filter((item) => item.fieldId !== feedback.fieldId)];
          this.feedbackByFieldId[feedback.fieldId] = feedback;
          this.feedbackDrafts[reservation.fieldId] = {
            rating: feedback.rating,
            comment: feedback.comment,
            submitting: false,
            error: ''
          };
          this.activeFeedbackFormKey = null;
        },
        error: (err) => {
          draft.error = err?.error?.error || err?.error?.message || err?.message || 'Impossible d\'enregistrer votre avis.';
        }
      });
  }

  getFeedbackDraft(fieldId: string): { rating: number; comment: string; submitting: boolean; error: string } {
    if (!this.feedbackDrafts[fieldId]) {
      this.feedbackDrafts[fieldId] = {
        rating: 0,
        comment: '',
        submitting: false,
        error: ''
      };
    }

    return this.feedbackDrafts[fieldId];
  }

  getStarState(rating: number, value: number): boolean {
    return value <= rating;
  }

  getStatusColor(status: Reservation['status']): string {
    switch (status) {
      case 'pending_confirmation':
      case 'reminder_sent':
        return 'bg-orange-400';
      case 'cancelled':
        return 'bg-red-600';
      case 'completed':
        return 'bg-sky-500';
      case 'confirmed':
      default:
        return 'bg-emerald-500';
    }
  }

  getStatusBadge(status: Reservation['status']): string {
    switch (status) {
      case 'pending_confirmation':
      case 'reminder_sent':
        return 'bg-orange-100 text-orange-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-sky-100 text-sky-700';
      case 'confirmed':
      default:
        return 'bg-emerald-100 text-emerald-700';
    }
  }

  getStatusLabel(status: Reservation['status']): string {
    switch (status) {
      case 'pending_confirmation':
        return 'EN ATTENTE';
      case 'reminder_sent':
        return 'RAPPEL';
      case 'cancelled':
        return 'ANNULÉE';
      case 'completed':
        return 'TERMINÉE';
      case 'confirmed':
      default:
        return 'CONFIRMÉE';
    }
  }

  getTotalPrice(reservation: Reservation): number {
    if (typeof reservation.totalPrice === 'number' && Number.isFinite(reservation.totalPrice)) {
      return reservation.totalPrice;
    }

    const field = this.bookingService.fields.find(f => f.id === reservation.fieldId);
    const fallbackRate = field?.price ?? 0;
    return Number((fallbackRate * reservation.duration).toFixed(2));
  }

  formatReservationDate(reservation: Reservation): string {
    return this.formatDateTime(reservation.date, reservation.time, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatReservationShortDate(reservation: Reservation): string {
    return this.formatDateTime(reservation.date, reservation.time, {
      day: 'numeric',
      month: 'short'
    });
  }

  getStartLabel(reservation: Reservation): string {
    return this.formatDateTime(reservation.date, reservation.time, {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEndLabel(reservation: Reservation): string {
    const endDate = this.getReservationEndDate(reservation);
    if (!endDate) {
      return '';
    }

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(endDate);
  }

  getDurationLabel(reservation: Reservation): string {
    return `${reservation.duration}h`;
  }

  getFeedbackButtonLabel(section: 'mine' | 'team', reservation: Reservation): string {
    if (this.hasExistingFeedback(reservation)) {
      return this.isFeedbackFormOpen(section, reservation) ? 'Fermer' : 'Modifier mon avis';
    }

    return this.isFeedbackFormOpen(section, reservation) ? 'Annuler' : 'Donner mon avis';
  }

  trackByRatingValue(_: number, value: number): number {
    return value;
  }

  private filterReservations(source: Reservation[]): Reservation[] {
    let filtered = [...source];

    if (this.fieldFilter) {
      filtered = filtered.filter((reservation) => reservation.fieldName === this.fieldFilter);
    }

    if (this.statusFilter) {
      filtered = filtered.filter((reservation) => reservation.status === this.statusFilter);
    }

    if (this.dateFilter) {
      filtered = filtered.filter((reservation) => reservation.date === this.dateFilter);
    }

    filtered.sort((left, right) => {
      const leftRank = this.getStatusPriority(left.status);
      const rightRank = this.getStatusPriority(right.status);
      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      return this.getReservationStartTimestamp(right) - this.getReservationStartTimestamp(left);
    });

    return filtered;
  }

  private getStatusPriority(status: Reservation['status']): number {
    switch (status) {
      case 'pending_confirmation':
      case 'reminder_sent':
        return 0;
      case 'confirmed':
        return 1;
      case 'completed':
        return 2;
      case 'cancelled':
      default:
        return 3;
    }
  }

  private isReservationFinished(reservation: Reservation): boolean {
    if (reservation.status === 'cancelled' || reservation.status === 'completed') {
      return true;
    }

    const endDate = this.getReservationEndDate(reservation);
    return endDate == null || endDate.getTime() <= Date.now();
  }

  private isFeedbackEligible(reservation: Reservation): boolean {
    return ['confirmed', 'completed'].includes(reservation.status)
      && this.isReservationFinished(reservation);
  }

  private getReservationStartTimestamp(reservation: Reservation): number {
    const start = new Date(`${reservation.date}T${reservation.time}:00`);
    return Number.isNaN(start.getTime()) ? 0 : start.getTime();
  }

  private getReservationEndDate(reservation: Reservation): Date | null {
    const startTime = this.getReservationStartTimestamp(reservation);
    if (startTime === 0) {
      return null;
    }

    return new Date(startTime + reservation.duration * 60 * 60 * 1000);
  }

  private formatDateTime(date: string, time: string, options: Intl.DateTimeFormatOptions): string {
    const value = new Date(`${date}T${time}:00`);
    if (Number.isNaN(value.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('fr-FR', options).format(value);
  }

  private getFeedbackFormKey(section: 'mine' | 'team', reservation: Reservation): string {
    return `${section}:${reservation.id}`;
  }
}
