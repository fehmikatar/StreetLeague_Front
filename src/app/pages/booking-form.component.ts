import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MapPin, Calendar, Clock, CreditCard, ChevronLeft, Check } from 'lucide-angular';
import { BookingService, Field } from '../services/booking.service';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto space-y-6">
      <div class="flex items-center gap-3">
        <a routerLink="/app/booking" class="p-2 hover:bg-muted rounded-lg transition-colors">
          <lucide-icon [name]="backIcon" [size]="20" class="text-muted-foreground"></lucide-icon>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-foreground">Réserver un Terrain</h1>
          <p class="text-muted-foreground">Complétez les détails de votre réservation</p>
        </div>
      </div>

      <div *ngIf="!field" class="p-4 bg-muted text-center rounded-xl">
        Chargement du terrain...
      </div>

      <ng-container *ngIf="field">
        <!-- Field Summary -->
        <div class="bg-card rounded-xl border border-border p-5">
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
              <lucide-icon [name]="locationIcon" [size]="28" class="text-primary"></lucide-icon>
            </div>
            <div class="flex-1">
              <h2 class="font-semibold text-foreground text-lg">{{ field.name }}</h2>
              <p class="text-muted-foreground flex items-center gap-1 text-sm">
                <lucide-icon [name]="locationIcon" [size]="14"></lucide-icon>
                {{ field.location || 'Localisation inconnue' }}
              </p>
              <p class="text-primary font-semibold mt-1">{{ field.price }} DT/heure</p>
            </div>
          </div>
        </div>

        <!-- Booking Form -->
        <div class="bg-card rounded-xl border border-border p-6 space-y-5">
          <h3 class="font-semibold text-foreground">Details de la réservation</h3>

          <!-- Date -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              <lucide-icon [name]="calendarIcon" [size]="14" class="inline mr-1"></lucide-icon>
              Date
            </label>
            <input type="date" [(ngModel)]="bookingDate" class="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
          </div>

          <!-- Time -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">
                <lucide-icon [name]="clockIcon" [size]="14" class="inline mr-1"></lucide-icon>
                Début
              </label>
              <select [(ngModel)]="bookingTime" class="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
                <option *ngFor="let slot of timeSlots" [value]="slot" [disabled]="!isSlotAvailable(slot)">
                  {{slot}} {{ !isSlotAvailable(slot) ? '(Unavailable)' : '' }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Durée</label>
              <select [(ngModel)]="bookingDuration" class="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
                <option [ngValue]="1">1 heure</option>
                <option [ngValue]="1.5">1h30</option>
                <option [ngValue]="2">2 heures</option>
                <option [ngValue]="3">3 heures</option>
              </select>
            </div>
          </div>

          <!-- Players count -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Nombre de joueurs</label>
            <div class="flex items-center gap-3">
              <button (click)="players = players > 2 ? players - 1 : 2" class="w-10 h-10 bg-muted border border-border rounded-lg hover:bg-primary/10 font-bold">-</button>
              <span class="text-xl font-bold text-foreground w-8 text-center">{{players}}</span>
              <button (click)="players = players < 22 ? players + 1 : 22" class="w-10 h-10 bg-muted border border-border rounded-lg hover:bg-primary/10 font-bold">+</button>
            </div>
          </div>

          <!-- Note -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Note (optionnel)</label>
            <textarea rows="3" placeholder="Instructions pour le gérant..." class="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"></textarea>
          </div>
        </div>

        <!-- Price breakdown -->
        <div class="bg-card rounded-xl border border-border p-5">
          <h3 class="font-semibold text-foreground mb-3">Récapitulatif</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span class="text-muted-foreground">Location ({{bookingDuration}}h)</span><span>{{ field.price * bookingDuration }} DT</span></div>
            <div class="flex justify-between"><span class="text-muted-foreground">Frais de service</span><span>5 DT</span></div>
            <div class="flex justify-between font-bold text-lg border-t border-border pt-2 mt-2">
              <span>Total</span><span class="text-primary">{{ (field.price * bookingDuration) + 5 }} DT</span>
            </div>
          </div>
        </div>

        <!-- Submit -->
        <div *ngIf="notification" class="w-full rounded-xl p-4 text-sm font-medium" 
             [ngClass]="notificationType === 'success' ? 'bg-primary/10 border border-primary/20 text-primary' : 'bg-red-500/10 border border-red-500/20 text-red-500'">
          {{ notification }}
        </div>
        <button (click)="confirmerEtPayer()" [disabled]="paid || !bookingDate || !bookingTime"
          class="w-full text-primary-foreground py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          [ngClass]="paid ? 'bg-green-500 cursor-default' : 'bg-primary hover:bg-primary/90'">
          <lucide-icon [name]="paid ? checkIcon : creditCardIcon" [size]="20"></lucide-icon>
          {{ paid ? 'Réservation Confirmée !' : 'Confirmer et Payer' }}
        </button>
      </ng-container>
    </div>
  `
})
export class BookingFormComponent implements OnInit {
  readonly backIcon = ChevronLeft;
  readonly locationIcon = MapPin;
  readonly calendarIcon = Calendar;
  readonly clockIcon = Clock;
  readonly creditCardIcon = CreditCard;
  readonly checkIcon = Check;

  field: Field | undefined;

  bookingDate: string = '';
  bookingTime: string = '18:00';
  bookingDuration: number = 1;

  players = 10;
  paid = false;
  notification = '';
  notificationType: 'success' | 'error' = 'success';
  timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

  existingReservations: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.bookingService.fields$.subscribe(fields => {
        this.field = fields.find(f => f.id === id);
      });

      this.bookingService.getFieldReservations(id).subscribe(res => {
        this.existingReservations = res;
      });
    }

    // Set default date to today
    const today = new Date();
    this.bookingDate = today.toISOString().split('T')[0];
  }

  isSlotAvailable(time: string): boolean {
    if (!this.field || !this.bookingDate) return true;
    return this.bookingService.isSlotAvailableClientSide(this.existingReservations, this.field.id, this.bookingDate, time, this.bookingDuration);
  }

  confirmerEtPayer() {
    if (!this.field || !this.bookingDate || !this.bookingTime) return;

    if (!this.isSlotAvailable(this.bookingTime)) {
      this.notificationType = 'error';
      this.notification = '❌ Ce créneau horaire est déjà réservé pour cette date.';
      setTimeout(() => { this.notification = ''; }, 3000);
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
      next: (result) => {
        this.paid = true;
        this.notificationType = 'success';
        this.notification = '✅ Réservation confirmée ! Redirection vers vos matchs...';
        setTimeout(() => {
          this.notification = '';
          this.router.navigate(['/app/matches']);
        }, 2000);
      },
      error: (err) => {
        this.notificationType = 'error';
        this.notification = '❌ Erreur de réservation: Ce terrain est peut-être déjà pris.';
        setTimeout(() => { this.notification = ''; }, 3000);
      }
    });
  }
}

