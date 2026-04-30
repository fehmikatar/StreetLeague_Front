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
        <span class="text-sm text-muted-foreground">Health</span>
      </div>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Appointments</h1>
          <p class="text-muted-foreground">Medical consultations and rehabilitation sessions</p>
        </div>
        <button (click)="planifier()" class="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          <lucide-icon [name]="plusIcon" [size]="16"></lucide-icon>
          Schedule
        </button>
      </div>
      <div *ngIf="notification" class="bg-primary/10 border border-primary/20 rounded-xl p-3 text-primary text-sm font-medium">
        {{ notification }}
      </div>

      <!-- Upcoming Appointments -->
      <div>
        <h2 class="text-lg font-semibold text-foreground mb-3">Upcoming</h2>
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
                <button (click)="confirmAppointment(apt)" class="p-2 hover:bg-green-50 rounded-lg transition-colors" title="Confirm">
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
        <h2 class="text-lg font-semibold text-foreground mb-3">Past</h2>
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
              <span class="ml-auto text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Completed</span>
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
    this.showNotification('✅ Scheduling form opened.');
  }
  confirmAppointment(apt: any) {
    this.showNotification(`✅ Appointment confirmed: ${apt.title}`);
  }
  cancelAppointment(apt: any) {
    this.upcoming = this.upcoming.filter(a => a !== apt);
    this.showNotification(`❌ Appointment canceled: ${apt.title}`);
  }
  private showNotification(msg: string) {
    this.notification = msg;
    setTimeout(() => { this.notification = ''; }, 3000);
  }

  upcoming = [
    { title: 'Sport Medical Control', doctor: 'Dr. Moreau', time: 'Monday March 10 • 10:30', location: 'Sport Medical Center, Paris 8' },
    { title: 'Physiotherapy Session', doctor: 'M. Lefevre (Kiné)', time: 'Wednesday March 12 • 14:00', location: 'Kiné-Sport Center, Paris 16' },
  ];

  past = [
    { title: 'Annual Check-up', doctor: 'Dr. Martin', date: '15 Jan 2026' },
    { title: 'Cardiology Consultation', doctor: 'Dr. Rousseau', date: '22 Dec 2025' },
    { title: 'Knee MRI', doctor: 'Dr. Bernard', date: '5 Nov 2025' },
  ];
}
