import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Calendar, Clock, MapPin, Plus, Check, X, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="p-6 space-y-6">
      <div class="flex items-center gap-3 mb-2">
        <a routerLink="/app/healthcare" class="p-2 bg-card border border-border rounded-xl hover:bg-muted transition-all">
          <lucide-icon [name]="arrowLeftIcon" [size]="18"></lucide-icon>
        </a>
        <span class="text-sm text-muted-foreground">Santé</span>
      </div>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Rendez-vous</h1>
          <p class="text-muted-foreground">Consultations médicales et séances de rééducation</p>
        </div>
        <button (click)="planifier()" class="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          <lucide-icon [name]="plusIcon" [size]="16"></lucide-icon>
          Planifier
        </button>
      </div>
      <div *ngIf="notification" class="bg-primary/10 border border-primary/20 rounded-xl p-3 text-primary text-sm font-medium">
        {{ notification }}
      </div>

      <!-- Upcoming Appointments -->
      <div>
        <h2 class="text-lg font-semibold text-foreground mb-3">À Venir</h2>
        <div class="space-y-3">
          <div *ngFor="let apt of upcoming" class="bg-card rounded-xl border border-border p-5">
            <div class="flex items-start justify-between">
              <div class="flex items-start gap-4">
                <div class="p-3 bg-primary/10 rounded-xl">
                  <lucide-icon [name]="calendarIcon" [size]="20" class="text-primary"></lucide-icon>
                </div>
                <div>
                  <h3 class="font-semibold text-foreground">{{apt.title}}</h3>
                  <p class="text-sm text-muted-foreground">{{apt.doctor}}</p>
                  <div class="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span class="flex items-center gap-1">
                      <lucide-icon [name]="clockIcon" [size]="14"></lucide-icon> {{apt.time}}
                    </span>
                    <span class="flex items-center gap-1">
                      <lucide-icon [name]="locationIcon" [size]="14"></lucide-icon> {{apt.location}}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <button (click)="confirmAppointment(apt)" class="p-2 hover:bg-green-50 rounded-lg transition-colors" title="Confirmer">
                  <lucide-icon [name]="checkIcon" [size]="16" class="text-green-500"></lucide-icon>
                </button>
                <button (click)="cancelAppointment(apt)" class="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Cancel">
                  <lucide-icon [name]="cancelIcon" [size]="16" class="text-red-500"></lucide-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Past Appointments -->
      <div>
        <h2 class="text-lg font-semibold text-foreground mb-3">Passés</h2>
        <div class="space-y-3">
          <div *ngFor="let apt of past" class="bg-card rounded-xl border border-border p-5 opacity-70">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-muted rounded-xl">
                <lucide-icon [name]="calendarIcon" [size]="20" class="text-muted-foreground"></lucide-icon>
              </div>
              <div>
                <h3 class="font-semibold text-foreground">{{apt.title}}</h3>
                <p class="text-sm text-muted-foreground">{{apt.doctor}} • {{apt.date}}</p>
              </div>
              <span class="ml-auto text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Terminé</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AppointmentsComponent {
  readonly calendarIcon = Calendar;
  readonly clockIcon = Clock;
  readonly locationIcon = MapPin;
  readonly plusIcon = Plus;
  readonly checkIcon = Check;
  readonly cancelIcon = X;
  readonly arrowLeftIcon = ArrowLeft;
  notification = '';

  planifier() {
    this.showNotification('✅ Formulaire de planification ouvert.');
  }
  confirmAppointment(apt: any) {
    this.showNotification(`✅ Rendez-vous confirmé : ${apt.title}`);
  }
  cancelAppointment(apt: any) {
    this.upcoming = this.upcoming.filter(a => a !== apt);
    this.showNotification(`❌ Rendez-vous annulé : ${apt.title}`);
  }
  private showNotification(msg: string) {
    this.notification = msg;
    setTimeout(() => { this.notification = ''; }, 3000);
  }

  upcoming = [
    { title: 'Contrôle Médical Sportif', doctor: 'Dr. Moreau', time: 'Lundi 10 Mars • 10:30', location: 'Cabinet Médical Sport, Paris 8' },
    { title: 'Séance Physiothérapie', doctor: 'M. Lefevre (Kiné)', time: 'Mercredi 12 Mars • 14:00', location: 'Centre Kiné-Sport, Paris 16' },
  ];

  past = [
    { title: 'Bilan Annuel', doctor: 'Dr. Martin', date: '15 Jan 2026' },
    { title: 'Consultation Cardiologique', doctor: 'Dr. Rousseau', date: '22 Déc 2025' },
    { title: 'IRM Genou', doctor: 'Dr. Bernard', date: '5 Nov 2025' },
  ];
}
