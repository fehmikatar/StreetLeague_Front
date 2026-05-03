import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Calendar, Clock3, Mail, MapPin, Phone, UserRound } from 'lucide-angular';
import { BookingService, Reservation } from '../services/booking.service';

@Component({
  selector: 'app-owner-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background p-4 md:p-6">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center gap-3 mb-6">
          <a routerLink="/app/fields" class="p-2 bg-card border border-border rounded-xl hover:bg-muted transition-all">
            <lucide-icon [img]="ArrowLeftIcon" class="w-5 h-5"></lucide-icon>
          </a>
          <div>
            <h1 class="text-2xl font-bold text-foreground">Réservations de mes terrains</h1>
            <p class="text-muted-foreground">Consultez les réservations reçues sur tous vos terrains</p>
          </div>
        </div>

        <div *ngIf="loading" class="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
          Chargement des réservations...
        </div>

        <div *ngIf="!loading && reservations.length === 0" class="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          Aucune réservation trouvée pour vos terrains.
        </div>

        <div *ngIf="!loading && reservations.length > 0" class="space-y-4">
          <article *ngFor="let reservation of reservations" class="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div class="space-y-3">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-full px-2.5 py-1 text-xs font-semibold"
                    [ngClass]="getStatusClass(reservation.status)">
                    {{ getStatusLabel(reservation.status) }}
                  </span>
                  <span class="text-sm font-semibold text-foreground">{{ reservation.fieldName }}</span>
                </div>

                <div class="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <div class="flex items-center gap-2">
                    <lucide-icon [img]="UserIcon" class="w-4 h-4"></lucide-icon>
                    <span>{{ reservation.userName || ('Utilisateur #' + (reservation.userId || '?')) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <lucide-icon [img]="MapPinIcon" class="w-4 h-4"></lucide-icon>
                    <span>{{ reservation.location || 'Localisation non précisée' }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <lucide-icon [img]="CalendarIcon" class="w-4 h-4"></lucide-icon>
                    <span>{{ reservation.date }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <lucide-icon [img]="ClockIcon" class="w-4 h-4"></lucide-icon>
                    <span>{{ reservation.time }} • {{ reservation.duration }}h</span>
                  </div>
                </div>
              </div>

              <div class="space-y-2 text-sm md:min-w-[220px]">
                <a *ngIf="reservation.userEmail" [href]="'mailto:' + reservation.userEmail"
                  class="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 font-medium text-primary hover:bg-primary/15 transition-all">
                  <lucide-icon [img]="MailIcon" class="w-4 h-4"></lucide-icon>
                  <span>{{ reservation.userEmail }}</span>
                </a>
                <a *ngIf="reservation.userPhone" [href]="'tel:' + reservation.userPhone"
                  class="flex items-center gap-2 rounded-xl bg-accent/10 px-3 py-2 font-medium text-accent hover:bg-accent/15 transition-all">
                  <lucide-icon [img]="PhoneIcon" class="w-4 h-4"></lucide-icon>
                  <span>{{ reservation.userPhone }}</span>
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  `
})
export class OwnerBookingsComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock3;
  readonly MailIcon = Mail;
  readonly MapPinIcon = MapPin;
  readonly PhoneIcon = Phone;
  readonly UserIcon = UserRound;

  loading = true;
  reservations: Reservation[] = [];

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.bookingService.getMyOwnerReservations().subscribe({
      next: (reservations) => {
        if (reservations.length > 0) {
          this.reservations = reservations;
          this.loading = false;
          return;
        }

        const ownerId = localStorage.getItem('user_id');
        if (!ownerId) {
          this.reservations = [];
          this.loading = false;
          return;
        }

        this.bookingService.getOwnerReservations(ownerId).subscribe({
          next: (fallbackReservations) => {
            if (fallbackReservations.length > 0) {
              this.reservations = fallbackReservations;
              this.loading = false;
              return;
            }

            this.bookingService.getOwnerReservationsFromOwnedFields(ownerId).subscribe({
              next: (fieldBasedReservations) => {
                this.reservations = fieldBasedReservations;
                this.loading = false;
              },
              error: (fieldFallbackError) => {
                console.error('Erreur lors du fallback par terrains owner:', fieldFallbackError);
                this.reservations = [];
                this.loading = false;
              }
            });
          },
          error: (fallbackError) => {
            console.error('Erreur lors du fallback des réservations owner:', fallbackError);
            this.bookingService.getOwnerReservationsFromOwnedFields(ownerId).subscribe({
              next: (fieldBasedReservations) => {
                this.reservations = fieldBasedReservations;
                this.loading = false;
              },
              error: (fieldFallbackError) => {
                console.error('Erreur lors du fallback par terrains owner:', fieldFallbackError);
                this.reservations = [];
                this.loading = false;
              }
            });
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des réservations owner:', error);
        this.reservations = [];
        this.loading = false;
      }
    });
  }

  getStatusLabel(status: Reservation['status']): string {
    switch (status) {
      case 'pending_confirmation':
        return 'En attente';
      case 'reminder_sent':
        return 'Confirmation requise';
      case 'completed':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
      case 'confirmed':
      default:
        return 'Confirmée';
    }
  }

  getStatusClass(status: Reservation['status']): string {
    switch (status) {
      case 'pending_confirmation':
        return 'bg-amber-100 text-amber-700';
      case 'reminder_sent':
        return 'bg-orange-100 text-orange-700';
      case 'completed':
        return 'bg-sky-100 text-sky-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'confirmed':
      default:
        return 'bg-emerald-100 text-emerald-700';
    }
  }
}
