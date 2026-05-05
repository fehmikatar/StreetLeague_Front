import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MapPin, Calendar, Clock, CreditCard, ChevronLeft, Check, CheckCircle, XCircle } from 'lucide-angular';
import { BookingService, Field } from '../services/booking.service';
import { FeedbackListComponent } from '../components/feedback-list/feedback-list.component';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../services/websocket.service';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule, FeedbackListComponent],
  template: `
    <div class="p-6 max-w-2xl mx-auto space-y-6">
      <div class="flex items-center gap-3">
        <a routerLink="/app/booking" class="p-2 hover:bg-muted rounded-lg transition-colors">
          <lucide-icon [img]="backIcon" [size]="20" class="text-muted-foreground"></lucide-icon>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-foreground">Book a Field</h1>
          <p class="text-muted-foreground">Complete your booking details</p>
        </div>
      </div>

      <div *ngIf="!field" class="p-4 bg-muted text-center rounded-xl">
        Loading field...
      </div>

      <ng-container *ngIf="field">
        <!-- Field Summary -->
        <div class="bg-card rounded-xl border border-border p-5">
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
              <lucide-icon [img]="locationIcon" [size]="28" class="text-primary"></lucide-icon>
            </div>
            <div class="flex-1">
              <h2 class="font-semibold text-foreground text-lg">{{ field.name }}</h2>
              <p class="text-muted-foreground flex items-center gap-1 text-sm">
                <lucide-icon [img]="locationIcon" [size]="14"></lucide-icon>
                {{ field.location || 'Unknown location' }}
              </p>
              <p class="text-primary font-semibold mt-1">{{ field.price }} €/hour</p>
            </div>
          </div>
        </div>

        <!-- Booking Form -->
        <div class="bg-card rounded-xl border border-border p-6 space-y-5">
          <h3 class="font-semibold text-foreground">Booking Details</h3>

          <!-- Date -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              <lucide-icon [img]="calendarIcon" [size]="14" class="inline mr-1"></lucide-icon>
              Date
            </label>
            <input type="date" [(ngModel)]="bookingDate" [min]="minDate"
              (ngModelChange)="onDateOrDurationChange()"
              class="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
          </div>

          <!-- Time + Duration -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">
                <lucide-icon [img]="clockIcon" [size]="14" class="inline mr-1"></lucide-icon>
                Start
              </label>
              <select [(ngModel)]="bookingTime"
                (ngModelChange)="checkCurrentSlot()"
                class="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
                <option *ngFor="let slot of timeSlots" [value]="slot" [disabled]="!isSlotAvailable(slot)">
                  {{ slot }} {{ !isSlotAvailable(slot) ? '(Unavailable)' : '' }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Duration</label>
              <select [(ngModel)]="bookingDuration"
                (ngModelChange)="onDateOrDurationChange()"
                class="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
                <option [ngValue]="1">1 hour</option>
                <option [ngValue]="1.5">1h30</option>
                <option [ngValue]="2">2 hours</option>
                <option [ngValue]="3">3 hours</option>
              </select>
            </div>
          </div>

          <!-- Players count -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Number of players</label>
            <div class="flex items-center gap-3">
              <button (click)="players = players > 2 ? players - 1 : 2"
                class="w-10 h-10 bg-muted border border-border rounded-lg hover:bg-primary/10 font-bold">-</button>
              <span class="text-xl font-bold text-foreground w-8 text-center">{{ players }}</span>
              <button (click)="players = players < 22 ? players + 1 : 22"
                class="w-10 h-10 bg-muted border border-border rounded-lg hover:bg-primary/10 font-bold">+</button>
            </div>
          </div>

          <!-- Note -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Note (optional)</label>
            <textarea rows="3" [(ngModel)]="note" placeholder="Instructions for the manager..."
              class="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"></textarea>
          </div>
        </div>

        <!-- Price breakdown -->
        <div class="bg-card rounded-xl border border-border p-5">
          <h3 class="font-semibold text-foreground mb-3">Summary</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Location ({{ bookingDuration }}h)</span>
              <span>{{ field.price * bookingDuration }} €</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Service fees</span>
              <span>5 €</span>
            </div>
            <div class="flex justify-between font-bold text-lg border-t border-border pt-2 mt-2">
              <span>Total</span>
              <span class="text-primary">{{ (field.price * bookingDuration) + 5 }} €</span>
            </div>
          </div>
        </div>

        <app-feedback-list [sportSpaceId]="fieldId"></app-feedback-list>

        <!-- Notification -->
        <div *ngIf="notification" class="w-full rounded-xl p-4 text-sm font-medium"
          [class.whitespace-pre-line]="true"
          [ngClass]="notificationType === 'success'
            ? 'bg-primary/10 border border-primary/20 text-primary'
            : 'bg-red-500/10 border border-red-500/20 text-red-500'">
          {{ notification }}
        </div>

        <!-- Submit -->
        <button (click)="confirmerEtPayer()"
          [disabled]="paid || !bookingDate || !bookingTime || !slotAvailable"
          class="w-full text-primary-foreground py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          [ngClass]="paid ? 'bg-green-500 cursor-default' : 'bg-primary hover:bg-primary/90'">
          <lucide-icon [img]="paid ? checkIcon : creditCardIcon" [size]="20"></lucide-icon>
          {{ paid ? (lastReservationStatus === 'confirmed' ? 'Attendance confirmed' : 'Booking recorded') : 'Confirm and Pay' }}
        </button>
      </ng-container>
    </div>
  `
})
export class BookingFormComponent implements OnInit, OnDestroy {
  readonly backIcon = ChevronLeft;
  readonly locationIcon = MapPin;
  readonly calendarIcon = Calendar;
  readonly clockIcon = Clock;
  readonly creditCardIcon = CreditCard;
  readonly checkIcon = Check;
  readonly checkCircleIcon = CheckCircle;
  readonly xCircleIcon = XCircle;

  field: Field | undefined;
  fieldId: string = '';
  bookingDate: string = '';
  minDate: string = '';
  bookingTime: string = '18:00';
  bookingDuration: number = 1;
  players = 10;
  note = '';
  paid = false;
  lastReservationStatus: string | null = null;
  notification = '';
  notificationType: 'success' | 'error' = 'success';

  // ✅ État de disponibilité du créneau sélectionné
  slotAvailable: boolean = true;

  timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  existingReservations: any[] = [];
  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private webSocketService: WebSocketService
  ) { }

  ngOnInit() {
    this.bookingService.refreshFields();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fieldId = id;
      this.bookingService.fields$.subscribe(fields => {
        this.field = fields.find(f => f.id === id);
      });

      // Charger les réservations immédiatement
      console.log('🔄 Loading reservations for field:', id);
      this.loadReservations(id);
    }

    this.subscriptions.add(
      this.webSocketService.getNotifications().subscribe(notifications => {
        if (!this.fieldId || notifications.length === 0) {
          return;
        }

        const latestNotification = notifications[0];
        if (latestNotification.type === 'reservation' || latestNotification.type === 'cancellation') {
          this.loadReservations(this.fieldId);
        }
      })
    );

    const today = new Date();
    const tzoffset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
    this.bookingDate = localISOTime;
    this.minDate = localISOTime;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // Appelé quand la date OU la durée change — recharge les résa et revérifie
  onDateOrDurationChange() {
    if (this.fieldId) {
      this.loadReservations(this.fieldId);
    }
  }

  loadReservations(fieldId: string) {
    this.bookingService.getFieldReservations(fieldId).subscribe(res => {
      this.existingReservations = res;
      this.checkCurrentSlot(); // ✅ Revérifier dès que les données arrivent
    });
  }

  // Vérifie si UN créneau donné est libre (utilisé pour désactiver les options)
  isSlotAvailable(time: string): boolean {
    if (!this.field || !this.bookingDate) return true;

    const selectedDateTime = new Date(`${this.bookingDate}T${time}:00`);
    if (selectedDateTime <= new Date()) return false;
    if (!this.bookingService.respectsMinimumAdvanceNotice(this.bookingDate, time)) return false;

    return this.bookingService.isSlotAvailableClientSide(
      this.field.id,
      this.bookingDate,
      time,
      this.bookingDuration,
      this.existingReservations
    );
  }

  // ✅ Vérifie le créneau actuellement sélectionné et met à jour slotAvailable
  checkCurrentSlot() {
    this.slotAvailable = this.isSlotAvailable(this.bookingTime);
  }

  confirmerEtPayer() {
    if (!this.field || !this.bookingDate || !this.bookingTime) return;

    if (!this.bookingService.respectsMinimumAdvanceNotice(this.bookingDate, this.bookingTime)) {
      this.notificationType = 'error';
      this.notification = '⛔ Booking impossible\nIt is no longer possible to book this slot. Bookings must be made at least 2 hours in advance.';
      setTimeout(() => { this.notification = ''; }, 5000);
      return;
    }

    // Double vérification côté client avant envoi
    if (!this.slotAvailable) {
      this.notificationType = 'error';
      this.notification = '❌ This slot is already booked. Please choose another time.';
      setTimeout(() => { this.notification = ''; }, 4000);
      return;
    }

    this.bookingService.reserveField({
      fieldId: this.field.id,
      fieldName: this.field.name,
      title: 'Match sur ' + this.field.name,
      location: this.field.location,
      date: this.bookingDate,
      time: this.bookingTime,
      duration: this.bookingDuration,
      players: this.players,
      type: this.field.type
    }).subscribe({
      next: (saved) => {
        this.loadReservations(this.fieldId);
        this.paid = true;
        this.lastReservationStatus = saved?.status || null;
        this.notificationType = 'success';
        this.notification = saved?.message || '✅ Booking recorded.';

        setTimeout(() => {
          this.notification = '';
          this.router.navigate(['/my-bookings']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Booking error:', err);
        this.notificationType = 'error';

        let errorMsg = `Error ${err?.status || '?'}: `;

        if (err?.status === 409) {
          errorMsg += 'This slot is already booked (conflict). Please choose another time.';
        } else if (err?.error?.error) {
          errorMsg += err.error.error;
        } else if (err?.error?.message) {
          errorMsg += err.error.message;
        } else if (err?.message) {
          errorMsg += err.message;
        } else {
          errorMsg += 'Error during booking with the server.';
        }

        this.notification = `❌ ${errorMsg}`;
        console.log('Server error details:', err?.error);

        setTimeout(() => { this.notification = ''; }, 5000);
        // Recharger les réservations au cas où quelqu'un d'autre aurait réservé
        this.loadReservations(this.fieldId);
      }
    });
  }
}
