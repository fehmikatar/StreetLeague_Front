import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppointmentService, AppointmentResponse, AppointmentRequest } from '../../services/appointment.service';
import { HealthAiService } from '../../services/health-ai.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <!-- En-tête -->
      <div class="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 shadow-sm">
        <div class="flex flex-wrap justify-between items-center">
          <div class="flex items-center gap-4">
            <a routerLink="/app/healthcare" 
               class="bg-white hover:bg-gray-100 text-green-700 px-4 py-2 rounded-xl shadow-md transition duration-200 flex items-center gap-2">
              ← Dashboard Santé
            </a>
            <div>
              <h1 class="text-3xl font-bold text-gray-800">📅 Rendez-vous médicaux</h1>
              <p class="text-gray-600 mt-1">Gestion des consultations et suivis</p>
            </div>
          </div>
          <button (click)="openCreateModal()" 
                  class="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl shadow-md transition duration-200 flex items-center gap-2">
            <span class="text-xl">+</span> Nouveau rendez-vous
          </button>
        </div>
      </div>

      <!-- CARTE IA -->
      <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border-l-4 border-indigo-500 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="bg-indigo-500 p-2 rounded-full">
            <span class="text-white text-sm"></span>
          </div>
          <div class="flex-1">
            <p class="text-xs text-indigo-600 font-semibold">IA ANALYSE EN TEMPS RÉEL</p>
            <p class="text-sm text-gray-700">{{ iaRecommendation }}</p>
            <div class="flex gap-4 mt-2 text-xs text-gray-500">
              <span *ngIf="iaComplianceRate > 0">📊 Compliance: {{ iaComplianceRate }}%</span>
              <span *ngIf="iaUpcomingCount > 0">📅 À venir: {{ iaUpcomingCount }}</span>
              <span *ngIf="iaPendingCount > 0">⏳ En attente: {{ iaPendingCount }}</span>
              <span *ngIf="iaMissedCount > 0">⚠️ Manqués: {{ iaMissedCount }}</span>
            </div>
          </div>
          <div *ngIf="iaLoading" class="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>

      <!-- Toast notification -->
      <div *ngIf="notification.message" 
           class="fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-bounce"
           [class.bg-green-600]="notification.type === 'success'"
           [class.bg-red-600]="notification.type === 'error'">
        {{ notification.message }}
      </div>

      <!-- Chargement -->
      <div *ngIf="loading" class="text-center py-12 text-gray-500">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
        <p class="mt-2">Chargement des rendez-vous...</p>
      </div>

      <div *ngIf="!loading">
        <!-- Rendez-vous à venir -->
        <div>
          <h2 class="text-lg font-semibold text-gray-800 mb-3">📅 À venir</h2>
          <div class="space-y-3">
            <div *ngFor="let apt of upcomingAppointments" class="bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition">
              <div class="flex flex-wrap justify-between items-start gap-4">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-800">{{ apt.reason }}</h3>
                  <p class="text-sm text-gray-500">Médecin ID: {{ apt.doctorId }}</p>
                  <div class="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                    <span>📅 {{ apt.appointmentDate | date:'dd/MM/yyyy HH:mm' }}</span>
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="statusClass(apt.status)">{{ apt.status }}</span>
                  </div>
                  <p *ngIf="apt.notes" class="text-xs text-gray-400 mt-1">{{ apt.notes }}</p>
                </div>
                <div class="flex gap-2">
                  <button (click)="updateStatus(apt.id, 'CONFIRMED')" *ngIf="apt.status === 'PENDING'" class="p-2 text-green-600 hover:bg-green-50 rounded" title="Confirmer">✓</button>
                  <button (click)="updateStatus(apt.id, 'CANCELLED')" *ngIf="apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED'" class="p-2 text-red-600 hover:bg-red-50 rounded" title="Annuler">✗</button>
                  <button (click)="openEditModal(apt)" class="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Modifier">✏️</button>
                  <button (click)="deleteAppointment(apt.id)" class="p-2 text-red-600 hover:bg-red-50 rounded" title="Supprimer">🗑️</button>
                </div>
              </div>
            </div>
            <div *ngIf="upcomingAppointments.length === 0" class="text-center text-gray-400 py-4">Aucun rendez-vous à venir</div>
          </div>
        </div>

        <!-- Rendez-vous passés / annulés -->
        <div class="mt-8">
          <h2 class="text-lg font-semibold text-gray-800 mb-3">📋 Passés / Annulés</h2>
          <div class="space-y-3">
            <div *ngFor="let apt of pastAppointments" class="bg-gray-50 rounded-xl border p-4 opacity-80">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-semibold text-gray-700">{{ apt.reason }}</h3>
                  <p class="text-sm text-gray-500">Médecin ID: {{ apt.doctorId }}</p>
                  <p class="text-sm text-gray-500">{{ apt.appointmentDate | date:'dd/MM/yyyy HH:mm' }}</p>
                  <span class="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="statusClass(apt.status)">{{ apt.status }}</span>
                </div>
                <button (click)="deleteAppointment(apt.id)" class="p-2 text-red-500 hover:bg-red-50 rounded" title="Supprimer">🗑️</button>
              </div>
            </div>
            <div *ngIf="pastAppointments.length === 0" class="text-center text-gray-400 py-4">Aucun rendez-vous passé</div>
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
              <label class="block text-sm font-medium text-gray-700 mb-1">Utilisateur ID *</label>
              <input type="number" [(ngModel)]="formData.userId" name="userId" required
                     class="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
                     [class.border-red-500]="appointmentForm.submitted && (!formData.userId || formData.userId <= 0)">
              <div *ngIf="appointmentForm.submitted && (!formData.userId || formData.userId <= 0)" class="text-red-500 text-xs mt-1">
                L'ID utilisateur est requis et doit être supérieur à 0.
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Médecin ID *</label>
              <input type="number" [(ngModel)]="formData.doctorId" name="doctorId" required
                     class="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
                     [class.border-red-500]="appointmentForm.submitted && (!formData.doctorId || formData.doctorId <= 0)">
              <div *ngIf="appointmentForm.submitted && (!formData.doctorId || formData.doctorId <= 0)" class="text-red-500 text-xs mt-1">
                L'ID du médecin est requis et doit être supérieur à 0.
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date et heure *</label>
              <input type="datetime-local" [(ngModel)]="formData.appointmentDate" name="appointmentDate" required
                     class="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
                     [class.border-red-500]="appointmentForm.submitted && !formData.appointmentDate">
              <div *ngIf="appointmentForm.submitted && !formData.appointmentDate" class="text-red-500 text-xs mt-1">
                La date et l'heure sont requises.
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Motif *</label>
              <textarea [(ngModel)]="formData.reason" name="reason" required rows="2"
                        class="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
                        [class.border-red-500]="appointmentForm.submitted && !formData.reason"></textarea>
              <div *ngIf="appointmentForm.submitted && !formData.reason" class="text-red-500 text-xs mt-1">
                Le motif est requis.
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea [(ngModel)]="formData.notes" rows="2" class="w-full p-2 border rounded"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select [(ngModel)]="formData.status" name="status" class="w-full p-2 border rounded">
                <option value="PENDING">En attente</option>
                <option value="CONFIRMED">Confirmé</option>
                <option value="COMPLETED">Terminé</option>
                <option value="CANCELLED">Annulé</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button type="button" (click)="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Annuler</button>
            <button type="button" (click)="saveAppointment()" [disabled]="appointmentForm.invalid && appointmentForm.submitted"
                    class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              Enregistrer
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
  loading = false;
  modalVisible = false;
  modalTitle = '';
  editingId: number | null = null;
  formData: AppointmentRequest = {
    userId: 1,
    doctorId: 1,
    appointmentDate: '',
    reason: '',
    status: 'PENDING',
    notes: ''
  };
  notification = { message: '', type: 'success' };

  // IA
  iaRecommendation: string = ' Analyse de vos rendez-vous en cours...';
  iaLoading: boolean = false;
  iaComplianceRate: number = 0;
  iaUpcomingCount: number = 0;
  iaPendingCount: number = 0;
  iaMissedCount: number = 0;

  constructor(
    private appointmentService: AppointmentService,
    private healthAiService: HealthAiService
  ) {}

  ngOnInit() { 
    this.loadAppointments(); 
  }

  loadAppointments() {
    this.loading = true;
    this.appointmentService.getAll().subscribe({
      next: (data: AppointmentResponse[]) => { 
        this.appointments = data; 
        this.loading = false;
        this.generateIARecommendation();
      },
      error: (err) => { 
        this.showNotification('Erreur chargement: ' + err.message, 'error'); 
        this.loading = false;
      }
    });
  }

  generateIARecommendation() {
    this.iaLoading = true;
    
    const now = new Date();
    const pendingCount = this.appointments.filter(a => a.status === 'PENDING').length;
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
        recommendation = `⚠️ Vous avez ${missedCount} rendez-vous manqué(s) (taux de compliance: ${complianceRate}%). Contactez votre médecin pour reprogrammer.`;
      } 
      else if (pendingCount > 2) {
        recommendation = `📅 Vous avez ${pendingCount} rendez-vous en attente de confirmation. Pensez à les valider rapidement.`;
      } 
      else if (upcomingCount === 0 && totalCount > 0) {
        recommendation = `📋 Aucun rendez-vous à venir. Planifiez votre bilan de santé annuel. Taux de compliance: ${complianceRate}%`;
      } 
      else if (upcomingCount > 3) {
        recommendation = `📊 Charge de rendez-vous élevée (${upcomingCount} dans les 30 jours). Espacez vos consultations.`;
      } 
      else if (complianceRate >= 80) {
        recommendation = `✅ Excellente compliance médicale (${complianceRate}%). Votre planning est équilibré. Continuez ainsi !`;
      }
      else if (complianceRate >= 50) {
        recommendation = `👍 Compliance moyenne (${complianceRate}%). Essayez d'honorer tous vos rendez-vous.`;
      }
      else if (totalCount > 0) {
        recommendation = `📊 Compliance faible (${complianceRate}%). Les rendez-vous réguliers sont essentiels.`;
      }
      else {
        recommendation = `📅 Aucun rendez-vous enregistré. Pensez à planifier vos consultations médicales.`;
      }
      
      this.iaRecommendation = `: ${recommendation}`;
      this.iaLoading = false;
    }, 500);
  }

  get upcomingAppointments(): AppointmentResponse[] {
    const now = new Date();
    return this.appointments.filter(apt => new Date(apt.appointmentDate) >= now && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED')
      .sort((a,b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
  }

  get pastAppointments(): AppointmentResponse[] {
    const now = new Date();
    return this.appointments.filter(apt => new Date(apt.appointmentDate) < now || apt.status === 'CANCELLED' || apt.status === 'COMPLETED')
      .sort((a,b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
  }

  statusClass(status: string): string {
    switch(status) {
      case 'PENDING': return 'badge-warning';
      case 'CONFIRMED': return 'badge-success';
      case 'COMPLETED': return 'badge-info';
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  openCreateModal() {
    this.modalTitle = 'Nouveau rendez-vous';
    this.editingId = null;
    this.formData = { userId: 1, doctorId: 1, appointmentDate: '', reason: '', status: 'PENDING', notes: '' };
    this.modalVisible = true;
  }

  openEditModal(apt: AppointmentResponse) {
    this.modalTitle = 'Modifier le rendez-vous';
    this.editingId = apt.id;
    this.formData = {
      userId: apt.userId,
      doctorId: apt.doctorId,
      appointmentDate: apt.appointmentDate.slice(0,16),
      reason: apt.reason,
      status: apt.status,
      notes: apt.notes
    };
    this.modalVisible = true;
  }

  closeModal() { this.modalVisible = false; }

  saveAppointment() {
    if (!this.formData.userId || this.formData.userId <= 0) {
      this.showNotification('L\'ID utilisateur est requis et doit être valide.', 'error');
      return;
    }
    if (!this.formData.doctorId || this.formData.doctorId <= 0) {
      this.showNotification('L\'ID médecin est requis et doit être valide.', 'error');
      return;
    }
    if (!this.formData.appointmentDate) {
      this.showNotification('La date et l\'heure sont requises.', 'error');
      return;
    }
    if (!this.formData.reason || !this.formData.reason.trim()) {
      this.showNotification('Le motif est requis.', 'error');
      return;
    }

    const request: AppointmentRequest = { ...this.formData, appointmentDate: new Date(this.formData.appointmentDate).toISOString() };
    (this.editingId ? this.appointmentService.update(this.editingId, request) : this.appointmentService.create(request))
      .subscribe({
        next: () => { 
          this.loadAppointments(); 
          this.closeModal(); 
          this.showNotification(this.editingId ? 'Modifié' : 'Créé', 'success');
        },
        error: (err) => this.showNotification('Erreur: ' + err.message, 'error')
      });
  }

  deleteAppointment(id: number) {
    if (confirm('Supprimer ce rendez-vous ?')) {
      this.appointmentService.delete(id).subscribe({
        next: () => { 
          this.loadAppointments(); 
          this.showNotification('Supprimé', 'success');
        },
        error: (err) => this.showNotification('Erreur suppression', 'error')
      });
    }
  }

  updateStatus(id: number, status: string) {
    this.appointmentService.updateStatus(id, status).subscribe({
      next: () => { 
        this.loadAppointments(); 
        this.showNotification(`Statut: ${status}`, 'success');
      },
      error: () => this.showNotification('Erreur mise à jour statut', 'error')
    });
  }

  private showNotification(msg: string, type: 'success' | 'error') {
    this.notification = { message: msg, type };
    setTimeout(() => this.notification.message = '', 3000);
  }
}