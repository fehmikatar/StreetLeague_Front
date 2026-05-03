import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppointmentService, AppointmentResponse, AppointmentRequest } from '../../services/appointment.service';
import { HealthAiService } from '../../services/health-ai.service';
import { DoctorService, DoctorResponse } from '../../services/doctor.service';
import { UserService } from '../../services/user.service';
import { HealthProfileService } from '../../services/health-profile.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <!-- EN-TÊTE UNIFIÉ STYLE "DOSSIER MÉDICAL" -->
      <div class="bg-emerald-50/80 backdrop-blur-sm rounded-3xl p-6 mb-10 border border-emerald-100/50 flex flex-wrap justify-between items-center gap-6 shadow-sm">
        <div class="flex items-center gap-6">
          <a routerLink="/app/healthcare" class="bg-white px-4 py-2 rounded-xl text-xs font-bold text-green-700 shadow-sm border border-green-100 hover:bg-green-50 transition-all flex items-center gap-2">
            ← Health Dashboard
          </a>
          <div class="flex items-center gap-3">
            <div class="text-3xl">📅</div>
            <div>
              <h1 class="text-2xl font-black text-slate-800 tracking-tight">Medical Appointments</h1>
              <p class="text-slate-500 text-xs font-medium">Manage Appts & Follow-ups</p>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div *ngIf="!isAdmin && !hasProfilee" class="text-xs text-amber-600 font-bold bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 animate-pulse">
            ⚠️ Create your health profile first!
          </div>
          <button (click)="openCreateModal()" class="bg-[#1DB954] hover:bg-[#1aa34a] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 transform hover:scale-105">
            + New Appointment
          </button>
        </div>
      </div>

      <!-- CARTE IA -->
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-l-4 shadow-sm" style="border-left-color: #1DB954;">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-full" style="background: #1DB954;">
            <span class="text-white text-sm">✨</span>
          </div>
          <div class="flex-1">
            <p class="text-xs font-bold" style="color: #1DB954;">REAL-TIME AI ANALYSIS</p>
            <p class="text-sm text-gray-700">{{ iaRecommendation }}</p>
            <div class="flex gap-4 mt-2 text-xs text-gray-500">
              <span *ngIf="iaComplianceRate > 0">📊 Compliance: {{ iaComplianceRate }}%</span>
              <span *ngIf="iaUpcomingCount > 0">📅 Upcoming: {{ iaUpcomingCount }}</span>
              <span *ngIf="iaPendingCount > 0">⏳ Pending: {{ iaPendingCount }}</span>
              <span *ngIf="iaMissedCount > 0">⚠️ Missed: {{ iaMissedCount }}</span>
            </div>
          </div>
          <div *ngIf="iaLoading" class="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style="border-color: #1DB954;"></div>
        </div>
      </div>


      <!-- Toast notification -->
      <div *ngIf="notification.message" 
           class="fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-bounce"
           [class.bg-green-600]="notification.type === 'success'"
           [class.bg-red-600]="notification.type === 'error'">
        {{ notification.message }}
      </div>

      <!-- Loading...>
      <div *ngIf="loading" class="text-center py-12 text-gray-500">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
        <p class="mt-2">Loading appointments...</p>
      </div>

      <div *ngIf="!loading">
        <!-- Appointments à venir -->
        <div>
          <h2 class="text-lg font-semibold text-gray-800 mb-3">📅 Upcoming</h2>
          <div class="space-y-3">
            <div *ngFor="let apt of upcomingAppointments" class="bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition">
              <div class="flex flex-wrap justify-between items-start gap-4">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-800">{{ apt.reason }}</h3>
                  <p class="text-sm text-gray-500">👨‍⚕️ {{ getDoctorName(apt.doctorId) }}</p>
                  <div class="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                    <span>📅 {{ apt.appointmentDate | date:'dd/MM/yyyy HH:mm' }}</span>
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="statusClass(apt.status)">{{ apt.status }}</span>
                  </div>
                  <p *ngIf="apt.notes" class="text-xs text-gray-400 mt-1 italic">Notes: {{ apt.notes }}</p>
                  <div *ngIf="apt.patientFeedback" class="mt-1 flex items-center justify-between bg-amber-50/50 px-2 py-1 rounded group">
                    <p class="text-xs text-amber-600 font-medium">💬 Review: {{ apt.patientFeedback }}</p>
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button (click)="openFeedbackModal(apt)" class="text-amber-500 hover:text-amber-700 text-[10px] font-bold">Edit</button>
                      <button (click)="removeFeedback(apt.id)" class="text-red-400 hover:text-red-600 text-[10px] font-bold">Clear</button>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2 items-center">
                  <button (click)="openFeedbackModal(apt)" class="bg-amber-50 text-amber-600 px-2 py-1 rounded text-xs font-bold border border-amber-200 hover:bg-amber-100 transition-colors">
                    ⭐ Review
                  </button>
                  <button (click)="updateStatus(apt.id, 'CONFIRMED')" *ngIf="apt.status === 'SCHEDULED'" class="p-2 text-green-600 hover:bg-green-50 rounded" title="Confirmer">✓</button>
                  <button (click)="updateStatus(apt.id, 'CANCELLED')" *ngIf="apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED'" class="p-2 text-red-600 hover:bg-red-50 rounded" title="Cancel">✗</button>
                  <button (click)="openEditModal(apt)" class="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Edit">✏️</button>
                  <button (click)="deleteAppointment(apt.id)" class="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete">🗑️</button>
                </div>
              </div>
            </div>
            <div *ngIf="upcomingAppointments.length === 0" class="text-center text-gray-400 py-4">No upcoming appointments</div>
          </div>
        </div>

        <!-- Appointments passés / annulés -->
        <div class="mt-8">
          <h2 class="text-lg font-semibold text-gray-800 mb-3">📋 Past / Cancelled</h2>
          <div class="space-y-3">
            <div *ngFor="let apt of pastAppointments" class="bg-gray-50 rounded-xl border p-4 opacity-80">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-semibold text-gray-700">{{ apt.reason }}</h3>
                  <p class="text-sm text-gray-500">👨‍⚕️ {{ getDoctorName(apt.doctorId) }}</p>
                  <p class="text-sm text-gray-500">{{ apt.appointmentDate | date:'dd/MM/yyyy HH:mm' }}</p>
                  <span class="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="statusClass(apt.status)">{{ apt.status }}</span>
                  <div *ngIf="apt.patientFeedback" class="mt-2 flex items-center justify-between bg-amber-50/50 px-2 py-1 rounded group">
                    <p class="text-xs text-amber-600 font-medium">💬 Review: {{ apt.patientFeedback }}</p>
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button (click)="openFeedbackModal(apt)" class="text-amber-500 hover:text-amber-700 text-[10px] font-bold">Edit</button>
                      <button (click)="removeFeedback(apt.id)" class="text-red-400 hover:text-red-600 text-[10px] font-bold">Clear</button>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button (click)="openFeedbackModal(apt)" class="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors">
                    ⭐ Review
                  </button>
                  <button (click)="deleteAppointment(apt.id)" class="p-2 text-red-500 hover:bg-red-50 rounded" title="Delete">🗑️</button>
                </div>
              </div>
            <div *ngIf="pastAppointments.length === 0" class="text-center text-gray-400 py-4">No past appointments</div>
          </div>
        </div>
      </div>

      <!-- Section Avis / Contact Responsable -->
      <div class="mt-12 bg-amber-50 rounded-2xl p-6 border border-amber-100 shadow-sm">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-amber-100 rounded-lg text-amber-600">
              <span class="text-xl">✍️</span>
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-800">Need help or want to give feedback?</h2>
              <p class="text-sm text-gray-600">Send a message directly to the field manager.</p>
            </div>
          </div>
          <div class="space-y-3">
            <textarea [(ngModel)]="generalFeedbackText" rows="3" 
                      placeholder="Ex: I would like to suggest an improvement for medical follow-up..."
                      class="w-full p-3 border border-amber-200 rounded-xl focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white"></textarea>
            <div class="flex justify-end">
              <button (click)="submitGeneralFeedback()" [disabled]="!generalFeedbackText.trim() || isSubmittingGeneral"
                      class="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-all flex items-center gap-2">
                <span *ngIf="isSubmittingGeneral" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Send to manager
              </button>
            </div>
          </div>
        </div>
      </div>

    <!-- Modal Avis / Feedback -->
    <div *ngIf="feedbackModalVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-800">⭐ Give your review</h2>
          <button (click)="feedbackModalVisible = false" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <p class="text-sm text-gray-600 mb-4">Your review will be sent to the field manager to improve our services.</p>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Your message</label>
            <textarea [(ngModel)]="feedbackText" rows="4" placeholder="Ex: Very good service, punctual doctor..."
                      class="w-full p-3 border rounded-xl focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button (click)="feedbackModalVisible = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-all">Cancel</button>
            <button (click)="submitFeedback()" [disabled]="!feedbackText.trim() || isSubmitting"
                    class="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-all flex items-center gap-2">
              <span *ngIf="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Send review
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Création / Modification -->
    <div *ngIf="modalVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 class="text-xl font-bold mb-4">{{ modalTitle }}</h2>
        <form #appointmentForm="ngForm">
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
              <ng-container *ngIf="!isAdmin">
                <input type="text" [value]="getCurrentUserName()" disabled
                       class="w-full p-2 border rounded bg-gray-50 text-gray-500">
              </ng-container>
              <ng-container *ngIf="isAdmin">
                <select [(ngModel)]="formData.userId" name="userId" required
                        class="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
                        [class.border-red-500]="appointmentForm.submitted && (!formData.userId || formData.userId <= 0)">
                  <option *ngFor="let u of users" [value]="u.id">{{ u.firstName }} {{ u.lastName }} (ID: {{u.id}})</option>
                </select>
              </ng-container>
              <div *ngIf="appointmentForm.submitted && (!formData.userId || formData.userId <= 0)" class="text-red-500 text-xs mt-1">
                User ID is required.
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
              <select [(ngModel)]="formData.doctorId" name="doctorId" required
                      class="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
                      [class.border-red-500]="appointmentForm.submitted && !formData.doctorId">
                <option [value]="0" disabled>Select a doctor</option>
                <option *ngFor="let d of doctors" [value]="d.id" [disabled]="!d.isAvailable">
                  Dr. {{ d.firstName }} {{ d.lastName }} ({{ d.specialty }}) - {{ d.isAvailable ? 'AVAILABLE' : 'BUSY' }}
                </option>
              </select>
              <div *ngIf="getSelectedDoctor()" class="mt-2 p-2 bg-blue-50 text-blue-700 text-[10px] rounded border border-blue-100 italic">
                🕒 Hours: {{ getSelectedDoctor()?.workingHoursStart }} - {{ getSelectedDoctor()?.workingHoursEnd }}
              </div>
              <div *ngIf="appointmentForm.submitted && !formData.doctorId" class="text-red-500 text-xs mt-1">
                Doctor selection is required.
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date et heure *</label>
              <input type="datetime-local" [(ngModel)]="formData.appointmentDate" name="appointmentDate" required
                     class="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
                     [class.border-red-500]="appointmentForm.submitted && !formData.appointmentDate">
              <div *ngIf="appointmentForm.submitted && !formData.appointmentDate" class="text-red-500 text-xs mt-1">
                Date and time are required.
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <textarea [(ngModel)]="formData.reason" name="reason" required rows="2"
                        class="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
                        [class.border-red-500]="appointmentForm.submitted && !formData.reason"></textarea>
              <div *ngIf="appointmentForm.submitted && !formData.reason" class="text-red-500 text-xs mt-1">
                Reason is required.
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea [(ngModel)]="formData.notes" rows="2" class="w-full p-2 border rounded"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select [(ngModel)]="formData.status" name="status" class="w-full p-2 border rounded">
                <option value="SCHEDULED">Scheduled</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button type="button" (click)="closeModal()" [disabled]="isSubmitting" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="button" (click)="saveAppointment()" [disabled]="(appointmentForm.invalid && appointmentForm.submitted) || isSubmitting"
                    class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
              <span *ngIf="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {{ isSubmitting ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .badge-warning { background-color: #fef3c7; color: #92400e; }
    .badge-success { background-color: #d1fae5; color: #065f46; }
    .badge-info { background-color: #dbeafe; color: #1e40af; }
    .badge-danger { background-color: #fee2e2; color: #991b1b; }
    .badge-secondary { background-color: #e5e7eb; color: #374151; }
    .animate-bounce { animation: bounce 0.5s ease-in-out; }
    @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  `]
})
export class AppointmentsComponent implements OnInit {
  appointments: AppointmentResponse[] = [];
  loading = true;
  isAdmin = false;
  currentUserId: number | null = null;
  hasProfilee = false;
  modalVisible = false;
  modalTitle = '';
  isSubmitting = false;
  editingId: number | null = null;
  formData: AppointmentRequest = {
    userId: 1,
    doctorId: 1,
    appointmentDate: '',
    reason: '',
    status: 'SCHEDULED', // Aligné avec l'enum backend AppointmentStatus
    notes: ''
  };
  doctors: DoctorResponse[] = [];
  users: any[] = [];
  notification = { message: '', type: 'success' };

  feedbackModalVisible = false;
  feedbackText = '';
  selectedAptForFeedback: AppointmentResponse | null = null;
  
  // General Feedback
  generalFeedbackText = '';
  isSubmittingGeneral = false;

  // IA
  iaRecommendation: string = ' Analyzing your appointments...';
  iaLoading: boolean = false;
  iaComplianceRate: number = 0;
  iaUpcomingCount: number = 0;
  iaPendingCount: number = 0;
  iaMissedCount: number = 0;

  constructor(
    private appointmentService: AppointmentService,
    private healthAiService: HealthAiService,
    private doctorService: DoctorService,
    private userService: UserService,
    private healthProfileService: HealthProfileService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const userIdStr = localStorage.getItem('user_id');
    const parsedId = userIdStr ? parseInt(userIdStr, 10) : null;
    this.currentUserId = (parsedId && !isNaN(parsedId)) ? parsedId : null;
    console.log('AppointmentsComponent: currentUserId =', this.currentUserId);
    
    const role = localStorage.getItem('user_type');
    this.isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN' || role === 'ROLE_FIELD_OWNER' || role === 'FIELD_OWNER';

    if (this.currentUserId) {
      this.healthProfileService.getByUserId(this.currentUserId).subscribe({
        next: (hp) => this.hasProfilee = !!hp,
        error: () => this.hasProfilee = false
      });
    }

    this.loadAppointments();
    this.loadDoctors();
    this.loadUsers();
  }

  getSelectedDoctor(): DoctorResponse | undefined {
    return this.doctors.find(d => d.id == this.formData.doctorId);
  }

  loadUsers() {
    if (this.isAdmin) {
      this.userService.getAll().subscribe({
        next: (data) => this.users = data,
        error: () => console.error('Error loading users')
      });
    }
  }

  getCurrentUserName(): string {
    return localStorage.getItem('user_name') || 'User';
  }

  loadDoctors() {
    this.doctorService.getAll().subscribe({
      next: (data) => this.doctors = data,
      error: () => console.error('Error loading doctors')
    });
  }

  getDoctorName(id: number): string {
    const d = this.doctors.find(doc => doc.id === id);
    return d ? `Dr. ${d.firstName} ${d.lastName}` : `Doctor #${id}`;
  }


  loadAppointments() {
    this.loading = true;
    if (this.isAdmin) {
      this.appointmentService.getAll().subscribe({
        next: (data: AppointmentResponse[]) => {
          this.appointments = data;
          this.loading = false;
          this.cdr.detectChanges();
          this.generateIARecommendation();
        },
        error: (err: any) => {
          this.showNotification('Loading error: ' + err.message, 'error');
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else if (this.currentUserId) {
      this.appointmentService.getByUserId(this.currentUserId).subscribe({
        next: (data: AppointmentResponse[]) => {
          this.appointments = data;
          this.loading = false;
          this.cdr.detectChanges();
          this.generateIARecommendation();
        },
        error: (err: any) => {
          this.showNotification('Loading error: ' + err.message, 'error');
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.appointments = [];
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  generateIARecommendation() {
    this.iaLoading = true;

    const now = new Date();
    const pendingCount = this.appointments.filter(a => a.status === 'SCHEDULED').length;
    const upcomingCount = this.appointments.filter(apt =>
      new Date(apt.appointmentDate) >= now &&
      apt.status !== 'CANCELLED' &&
      apt.status !== 'COMPLETED'
    ).length;
    const missedCount = this.appointments.filter(a =>
      new Date(a.appointmentDate) < now &&
      a.status !== 'CANCELLED' &&
      a.status !== 'COMPLETED'
    ).length;
    const confirmedCount = this.appointments.filter(a => a.status === 'CONFIRMED').length;
    const completedCount = this.appointments.filter(a => a.status === 'COMPLETED').length;
    const totalCount = this.appointments.length;

    const complianceRate = totalCount > 0 ? Math.round(((confirmedCount + completedCount) / totalCount) * 100) : 0;

    this.iaComplianceRate = complianceRate;
    this.iaUpcomingCount = upcomingCount;
    this.iaPendingCount = pendingCount;
    this.iaMissedCount = missedCount;

    setTimeout(() => {
      let recommendation = '';

      if (missedCount > 0) {
        recommendation = `⚠️ You have ${missedCount} missed appointment(s) (compliance rate: ${complianceRate}%). Contact your doctor to reschedule.`;
      }
      else if (pendingCount > 2) {
        recommendation = `📅 You have ${pendingCount} appointments pending confirmation. Please validate them quickly.`;
      }
      else if (upcomingCount === 0 && totalCount > 0) {
        recommendation = `📋 No upcoming appointments. Schedule your annual health checkup. Compliance rate: ${complianceRate}%`;
      }
      else if (upcomingCount > 3) {
        recommendation = `📊 High appointment load (${upcomingCount} in 30 days). Space out your consultations.`;
      }
      else if (complianceRate >= 80) {
        recommendation = `✅ Excellent medical compliance (${complianceRate}%). Your schedule is balanced. Keep it up!`;
      }
      else if (complianceRate >= 50) {
        recommendation = `👍 Average compliance (${complianceRate}%). Try to honor all your appointments.`;
      }
      else if (totalCount > 0) {
        recommendation = `📊 Low compliance (${complianceRate}%). Regular appointments are essential.`;
      }
      else {
        recommendation = `📅 No appointments recorded. Consider scheduling your medical consultations.`;
      }

      this.iaRecommendation = `: ${recommendation}`;
      this.iaLoading = false;
    }, 500);
  }

  get upcomingAppointments(): AppointmentResponse[] {
    const now = new Date();
    return this.appointments.filter(apt => new Date(apt.appointmentDate) >= now && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED')
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
  }

  get pastAppointments(): AppointmentResponse[] {
    const now = new Date();
    return this.appointments.filter(apt => new Date(apt.appointmentDate) < now || apt.status === 'CANCELLED' || apt.status === 'COMPLETED')
      .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
  }

  statusClass(status: string): string {
    switch (status) {
      case 'SCHEDULED': return 'badge-warning';
      case 'CONFIRMED': return 'badge-success';
      case 'COMPLETED': return 'badge-info';
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  openCreateModal() {
    if (!this.isAdmin && !this.hasProfilee) {
      this.showNotification('Action blocked: Create your health profile first to take an appointment.', 'error');
      return;
    }
    this.modalTitle = 'New Appointment';
    this.editingId = null;
    
    // Utiliser l'ID utilisateur actuel ou 1 par défaut pour l'admin
    const defaultUserId = this.isAdmin ? (this.users.length > 0 ? this.users[0].id : 1) : (this.currentUserId || 1);
    
    // Sélectionner le premier médecin disponible
    const firstAvailableDoctor = this.doctors.find(d => d.isAvailable) || this.doctors[0];
    const defaultDoctorId = firstAvailableDoctor ? firstAvailableDoctor.id : 0;

    this.formData = { 
      userId: defaultUserId, 
      doctorId: defaultDoctorId, 
      appointmentDate: '', 
      reason: '', 
      status: 'SCHEDULED', 
      notes: '' 
    };
    this.modalVisible = true;
  }

  openEditModal(apt: AppointmentResponse) {
    this.modalTitle = 'Edit Appointment';
    this.editingId = apt.id;
    this.formData = {
      userId: apt.userId,
      doctorId: apt.doctorId,
      appointmentDate: apt.appointmentDate.slice(0, 16),
      reason: apt.reason,
      status: apt.status,
      notes: apt.notes
    };
    this.modalVisible = true;
  }

  closeModal() { this.modalVisible = false; }

  saveAppointment() {
    if (this.isSubmitting) return;
    if (!this.formData.userId || this.formData.userId <= 0) {
      this.showNotification('User ID is required and must be valid.', 'error');
      return;
    }
    if (!this.formData.doctorId || this.formData.doctorId <= 0) {
      this.showNotification('Doctor ID is required and must be valid.', 'error');
      return;
    }
    if (!this.formData.appointmentDate) {
      this.showNotification('Date and time are required.', 'error');
      return;
    }
    if (!this.formData.reason || this.formData.reason.trim().length < 5) {
      this.showNotification('Reason must contain at least 5 characters.', 'error');
      return;
    }

    this.isSubmitting = true;
    
    // Préparation de la date pour éviter les problèmes de timezone
    const dateObj = new Date(this.formData.appointmentDate);
    const isoDate = dateObj.toISOString();

    const request: AppointmentRequest = { 
      ...this.formData, 
      appointmentDate: isoDate 
    };

    (this.editingId ? this.appointmentService.update(this.editingId, request) : this.appointmentService.create(request))
      .subscribe({
        next: () => {
          this.loadAppointments();
          this.closeModal();
          this.showNotification(this.editingId ? 'Appointment updated successfully' : 'Appointment created successfully', 'success');
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error creating Appts:', err);
          const errorMsg = err.error?.message || err.message || 'Error during save';
          this.showNotification('Failed: ' + errorMsg, 'error');
          this.isSubmitting = false;
        }
      });
  }

  deleteAppointment(id: number) {
    if (confirm('Delete this appointment?')) {
      this.appointmentService.delete(id).subscribe({
        next: () => {
          this.loadAppointments();
          this.showNotification('Deleted', 'success');
        },
        error: (err) => this.showNotification('Delete error', 'error')
      });
    }
  }

  updateStatus(id: number, status: string) {
    this.appointmentService.updateStatus(id, status).subscribe({
      next: () => {
        this.loadAppointments();
        this.showNotification(`Status: ${status}`, 'success');
      },
      error: () => this.showNotification('Status update error', 'error')
    });
  }

  openFeedbackModal(apt: AppointmentResponse) {
    this.selectedAptForFeedback = apt;
    this.feedbackText = apt.patientFeedback || '';
    this.feedbackModalVisible = true;
  }

  submitFeedback() {
    if (!this.selectedAptForFeedback || !this.feedbackText.trim()) return;
    
    this.isSubmitting = true;
    const aptId = this.selectedAptForFeedback.id;
    const isUpdate = !!this.selectedAptForFeedback.patientFeedback;

    const action = isUpdate 
      ? this.appointmentService.updateFeedback(aptId, this.feedbackText)
      : this.appointmentService.sendFeedback(aptId, this.feedbackText);

    action.subscribe({
      next: () => {
        this.loadAppointments();
        this.feedbackModalVisible = false;
        this.showNotification(isUpdate ? 'Review updated!' : 'Review sent!', 'success');
        this.isSubmitting = false;
      },
      error: () => {
        this.showNotification('Error sending review', 'error');
        this.isSubmitting = false;
      }
    });
  }

  removeFeedback(id: number) {
    if (confirm('Do you want to delete your review?')) {
      this.appointmentService.deleteFeedback(id).subscribe({
        next: () => {
          this.loadAppointments();
          this.showNotification('Review deleted', 'success');
        },
        error: () => this.showNotification('Error during deletion', 'error')
      });
    }
  }

  submitGeneralFeedback() {
    if (!this.generalFeedbackText.trim() || this.isSubmittingGeneral) return;
    
    if (!this.currentUserId) {
      this.showNotification('Missing user ID. Please log in again.', 'error');
      return;
    }

    this.isSubmittingGeneral = true;
    // On utilise l'ID 0 ou null pour indiquer un avis général au responsable
    this.appointmentService.sendGeneralFeedback(this.currentUserId, this.generalFeedbackText).subscribe({
      next: () => {
        this.showNotification('Message sent to manager!', 'success');
        this.generalFeedbackText = '';
        this.isSubmittingGeneral = false;
      },
      error: (err) => {
        console.error('General feedback error:', err);
        this.showNotification('Failed to send.', 'error');
        this.isSubmittingGeneral = false;
      }
    });
  }

  private showNotification(msg: string, type: 'success' | 'error') {
    this.notification = { message: msg, type };
    setTimeout(() => this.notification.message = '', 3000);
  }
}