import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { MedicalRecordService, MedicalRecordResponse, MedicalRecordRequest } from '../../services/medical-record.service';
import { HealthProfileService, HealthProfileResponse } from '../../services/health-profile.service';
import { UserService } from '../../services/user.service';
import { DoctorService, DoctorResponse } from '../../services/doctor.service';

@Component({
  selector: 'app-medical-records',
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
              ← Health Dashboard
            </a>
            <div>
              <h1 class="text-3xl font-bold text-gray-800">🩺 Medical Records</h1>
              <p class="text-gray-600 mt-1">Manage history and follow-ups</p>
            </div>
          </div>
          <button *ngIf="isAdmin" (click)="openModal()" 
                  class="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl shadow-md transition duration-200 flex items-center gap-2">
            <span class="text-xl">+</span> New Record
          </button>
        </div>
      </div>

      <!-- Toast -->
      <div *ngIf="notification" 
           class="fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-bounce"
           [class.bg-green-600]="notificationType === 'success'"
           [class.bg-red-600]="notificationType === 'error'">
        {{ notification }}
      </div>

      <!-- Chargement -->
      <div *ngIf="isLoading" class="text-center py-12 text-gray-500">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
        <p class="mt-2">Loading records...</p>
      </div>

      <!-- Tableau -->
      <div *ngIf="!isLoading" class="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div class="px-6 py-4 border-b bg-gray-50/50 flex justify-between items-center">
          <h3 class="font-bold text-gray-700 flex items-center gap-2">📋 Records List <span class="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">{{ records.length }}</span></h3>
          <div class="flex items-center gap-2 text-xs text-amber-600 font-medium" *ngIf="!isAdmin && !currentUserHealthProfileId">
             ⚠️ Missing Profile: please create your health profile first.
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ isAdmin ? 'ID' : '' }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Injury Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recovery</th>
                <th class="px-6 py-3 text-right text-xs font-black text-gray-500 uppercase tracking-widest">ACTIONS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr *ngFor="let r of records" 
                  (click)="showDetails(r)" 
                  class="hover:bg-gray-50 cursor-pointer transition duration-150">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ isAdmin ? r.id : '' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ getPatientName(r.healthProfileId) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ r.diagnosis }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ r.injuryDate | date:'dd/MM/yyyy' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ r.injuryType }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                        [class.bg-yellow-100]="r.recoveryStatus === 'IN_PROGRESS'"
                        [class.bg-green-100]="r.recoveryStatus === 'COMPLETED'"
                        [class.bg-blue-100]="r.recoveryStatus === 'PENDING'"
                        [class.bg-red-100]="r.recoveryStatus === 'COMPLICATED'"
                        [class.bg-gray-100]="r.recoveryStatus === 'REFERRED'">
                    {{ r.recoveryStatus }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex justify-end gap-2">
                    <button *ngIf="isAdmin" (click)="openModal(r); $event.stopPropagation()" 
                            class="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all shadow-sm border border-amber-100" title="Edit">
                      ✏️
                    </button>
                    <button (click)="downloadRecord(r); $event.stopPropagation()" 
                            class="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all shadow-sm border border-blue-100" title="Download">
                      📥
                    </button>
                    <button *ngIf="isAdmin" (click)="deleteRecord(r.id); $event.stopPropagation()" 
                            class="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all shadow-sm border border-red-100" title="Delete">
                      🗑️
                    </button>
                  </div>
                </td>
               </tr>
              <tr *ngIf="records.length === 0">
                <td colspan="7" class="px-6 py-10 text-center text-gray-400">No medical record found</td>
               </tr>
            </tbody>
           </table>
        </div>
      </div>
    </div>

    <!-- Modal de création / modification -->
    <div *ngIf="modalVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-800">{{ editingId ? 'Edit Medical Record' : 'New Medical Record' }}</h2>
          <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form #recordForm="ngForm" (ngSubmit)="save()" class="p-6 space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Patient : pour non-admin sans profil, afficher un message bloquant -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
              <div *ngIf="!isAdmin && !currentUserHealthProfileId" class="text-amber-600 text-sm p-2 bg-amber-50 rounded-lg border border-amber-200 mb-2">
                ⚠️ You must create your health profile before adding a medical record.
              </div>
              <select *ngIf="isAdmin || currentUserHealthProfileId" 
                      [(ngModel)]="form.healthProfileId" name="healthProfileId" required 
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
                <option *ngFor="let hp of healthProfiles" [ngValue]="hp.id">{{ getPatientName(hp.id) }}</option>
              </select>
              <input *ngIf="!isAdmin && !currentUserHealthProfileId" 
                     type="text" disabled value="No health profile available" 
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
              <div *ngIf="recordForm.submitted && !form.healthProfileId && (isAdmin || currentUserHealthProfileId)" class="text-red-500 text-xs mt-1">Required field</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Diagnosis *</label>
              <input type="text" [(ngModel)]="form.diagnosis" name="diagnosis" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Injury Date *</label>
              <input type="date" [(ngModel)]="form.injuryDate" name="injuryDate" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Injury Type</label>
              <select [(ngModel)]="form.injuryType" name="injuryType" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
                <option *ngFor="let type of injuryTypes" [value]="type">{{ type }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Recovery Status</label>
              <select [(ngModel)]="form.recoveryStatus" name="recoveryStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
                <option *ngFor="let st of recoveryStatuses" [value]="st">{{ st }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Expected Recovery Date</label>
              <input type="date" [(ngModel)]="form.expectedRecoveryDate" name="expectedRecoveryDate" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Actual Recovery Date</label>
              <input type="date" [(ngModel)]="form.actualRecoveryDate" name="actualRecoveryDate" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Treatment</label>
              <input type="text" [(ngModel)]="form.treatment" name="treatment" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Medication</label>
              <input type="text" [(ngModel)]="form.medication" name="medication" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Treating Doctor</label>
              <select [(ngModel)]="form.treatedByDoctorId" name="treatedByDoctorId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
                <option [ngValue]="undefined">Select a doctor</option>
                <option *ngFor="let d of doctors" [ngValue]="d.id">Dr. {{ d.firstName }} {{ d.lastName }} ({{ d.specialty }})</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Doctor's Notes</label>
            <textarea rows="3" [(ngModel)]="form.doctorNotes" name="doctorNotes" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
          </div>
          <div>
            <label class="flex items-center gap-2">
              <input type="checkbox" [(ngModel)]="form.requiresFollowUp" name="requiresFollowUp"> Requires follow-up
            </label>
          </div>
          <div class="flex justify-end gap-3 pt-4 border-t">
            <button type="button" (click)="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" [disabled]="(!isAdmin && !currentUserHealthProfileId) || (recordForm.invalid && recordForm.submitted)" 
                    class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ editingId ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de détails -->
    <div *ngIf="detailsVisible && selectedRecord" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-gradient-to-r from-green-50 to-emerald-100 px-6 py-4 flex justify-between items-center border-b">
          <h2 class="text-xl font-bold text-gray-800">📄 Medical Record Details</h2>
          <button (click)="closeDetails()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Patient:</span> {{ getPatientName(selectedRecord.healthProfileId) }}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Diagnosis:</span> {{ selectedRecord.diagnosis }}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Injury Date:</span> {{ selectedRecord.injuryDate | date:'dd/MM/yyyy' }}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Injury Type:</span> {{ selectedRecord.injuryType || '-' }}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Recovery Status:</span> {{ selectedRecord.recoveryStatus }}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Expected Recovery:</span> {{ (selectedRecord.expectedRecoveryDate | date:'dd/MM/yyyy') || '-' }}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Actual Recovery:</span> {{ (selectedRecord.actualRecoveryDate | date:'dd/MM/yyyy') || '-' }}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Treatment:</span> {{ selectedRecord.treatment || '-' }}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Medication:</span> {{ selectedRecord.medication || '-' }}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Treating Doctor:</span> {{ getDoctorName(selectedRecord.treatedByDoctorId) }}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Follow-up needed:</span> {{ selectedRecord.requiresFollowUp ? 'Yes' : 'No' }}</div>
            <div class="col-span-2 bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Doctor Notes:</span> {{ selectedRecord.doctorNotes || '-' }}</div>
            <div class="col-span-2 bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Created at:</span> {{ selectedRecord.createdAt | date:'dd/MM/yyyy HH:mm' }}</div>
            <div class="col-span-2 bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Last update:</span> {{ selectedRecord.updatedAt | date:'dd/MM/yyyy HH:mm' }}</div>
          </div>
          <div class="flex justify-end mt-4">
            <button (click)="downloadRecord(selectedRecord)" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
              📥 Download record HTML
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    input.ng-invalid.ng-touched, select.ng-invalid.ng-touched, textarea.ng-invalid.ng-touched { border-color: #ef4444; }
    .animate-bounce { animation: bounce 0.5s ease-in-out; }
    @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  `]
})
export class MedicalRecordsComponent implements OnInit {
  records: MedicalRecordResponse[] = [];
  healthProfiles: HealthProfileResponse[] = [];
  users: any[] = [];
  doctors: DoctorResponse[] = [];
  isLoading = true;
  isAdmin = false;
  currentUserId: number | null = null;
  currentUserHealthProfileId: number | null = null;
  modalVisible = false;
  detailsVisible = false;
  isSubmitting = false;
  selectedRecord: MedicalRecordResponse | null = null;
  editingId: number | null = null;
  form: MedicalRecordRequest = {
    healthProfileId: 0,
    diagnosis: '',
    injuryDate: '',
    expectedRecoveryDate: '',
    actualRecoveryDate: '',
    doctorNotes: '',
    injuryType: '',
    recoveryStatus: 'PENDING',
    treatment: '',
    medication: '',
    requiresFollowUp: false,
    treatedByDoctorId: undefined
  };
  injuryTypes = ['MUSCLE_STRAIN', 'MUSCLE_TEAR', 'CRAMP', 'SPRAIN', 'DISLOCATION', 'FRACTURE', 'STRESS_FRACTURE', 'LIGAMENT_TEAR', 'TENDONITIS', 'CONCUSSION', 'BRUISE', 'CUT', 'OTHER'];
  recoveryStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'COMPLICATED', 'REFERRED'];
  notification = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(
    private medicalService: MedicalRecordService,
    private healthProfileService: HealthProfileService,
    private userService: UserService,
    private doctorService: DoctorService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const role = localStorage.getItem('user_type');
    this.isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN' || role === 'ROLE_FIELD_OWNER' || role === 'FIELD_OWNER';
    const userIdStr = localStorage.getItem('user_id');
    this.currentUserId = userIdStr ? parseInt(userIdStr, 10) : null;

    this.loadInitialData();
    this.loadDoctors();
  }

  private loadInitialData() {
    this.isLoading = true;
    if (this.isAdmin) {
      this.loadHealthProfiles();
    } else if (this.currentUserId) {
      this.healthProfileService.getByUserId(this.currentUserId).subscribe({
        next: (hp) => {
          if (hp) {
            this.currentUserHealthProfileId = hp.id;
            this.healthProfiles = [hp];
          } else {
            this.healthProfiles = [];
          }
          this.loadUsers();
        },
        error: () => {
          this.healthProfiles = [];
          this.loadUsers();
        }
      });
    } else {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  loadDoctors() {
    this.doctorService.getAll().subscribe({
      next: (data) => {
        this.doctors = data;
        this.cdr.detectChanges();
      },
      error: () => console.error('Error loading doctors')
    });
  }

  getDoctorName(id?: number): string {
    if (!id) return '-';
    const d = this.doctors.find(doc => doc.id === id);
    return d ? `Dr. ${d.firstName} ${d.lastName}` : `Doctor #${id}`;
  }

  loadHealthProfiles() {
    this.healthProfileService.getAll().subscribe({
      next: (profiles) => {
        this.healthProfiles = profiles;
        this.loadUsers();
      },
      error: (err) => {
        this.showNotification('Error loading health profiles', 'error');
        this.loadUsers();
      }
    });
  }

  loadUsers() {
    if (this.isAdmin) {
      this.userService.getAll().subscribe({
        next: (users) => {
          this.users = users;
          this.loadRecords();
        },
        error: (err) => {
          this.loadRecords();
        }
      });
    } else {
      const userName = localStorage.getItem('user_name') || 'User';
      if (this.currentUserId) {
        this.users = [{ id: this.currentUserId, firstName: userName.split(' ')[0], lastName: userName.split(' ')[1] || '' }];
      }
      this.loadRecords();
    }
  }

  loadRecords() {
    this.isLoading = true;
    let obs: Observable<MedicalRecordResponse[]>;

    if (this.isAdmin) {
      obs = this.medicalService.getAll();
    } else if (this.currentUserHealthProfileId) {
      obs = this.medicalService.getByHealthProfileId(this.currentUserHealthProfileId);
    } else {
      this.records = [];
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    obs.subscribe({
      next: (data: MedicalRecordResponse[]) => {
        this.records = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.showNotification('Error loading records', 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getPatientName(healthProfileId: number): string {
    const profile = this.healthProfiles.find(hp => hp.id === healthProfileId);
    if (!profile) return `Profile ${healthProfileId}`;
    const user = this.users.find(u => u.id === profile.userId);
    return user ? `${user.firstName} ${user.lastName}` : `Profile ${healthProfileId}`;
  }

  showDetails(record: MedicalRecordResponse) {
    this.selectedRecord = record;
    this.detailsVisible = true;
  }

  closeDetails() {
    this.detailsVisible = false;
    this.selectedRecord = null;
  }

  downloadRecord(record: MedicalRecordResponse) {
    const patientName = this.getPatientName(record.healthProfileId);
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Medical Record - ${patientName}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; background-color: #f4f7fc; color: #2c3e50; }
    .container { max-width: 800px; margin: auto; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .section { margin-bottom: 25px; border-bottom: 1px solid #ecf0f1; padding-bottom: 15px; }
    .section h3 { color: #16a34a; margin-bottom: 15px; }
    .info-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 12px; }
    .label { font-weight: bold; color: #7f8c8d; }
    .value { color: #2c3e50; }
    footer { background-color: #ecf0f1; text-align: center; padding: 15px; font-size: 12px; color: #7f8c8d; }
  </style>
</head>
<body>
<div class="container">
  <div class="header"><h1>🩺 Medical Record</h1><p>Generated on ${new Date().toLocaleString()}</p></div>
  <div class="content">
    <div class="section"><h3>👤 Patient</h3><div class="info-grid">
      <div class="label">Name:</div><div class="value">${patientName}</div>
    </div></div>
    <div class="section"><h3>📋 Diagnosis</h3><div class="info-grid">
      <div class="label">Diagnosis:</div><div class="value">${record.diagnosis}</div>
      <div class="label">Injury Type:</div><div class="value">${record.injuryType || '-'}</div>
      <div class="label">Injury Date:</div><div class="value">${new Date(record.injuryDate).toLocaleDateString()}</div>
    </div></div>
    <div class="section"><h3>🩺 Recovery</h3><div class="info-grid">
      <div class="label">Status:</div><div class="value">${record.recoveryStatus}</div>
      <div class="label">Expected Return:</div><div class="value">${record.expectedRecoveryDate ? new Date(record.expectedRecoveryDate).toLocaleDateString() : '-'}</div>
      <div class="label">Actual Return:</div><div class="value">${record.actualRecoveryDate ? new Date(record.actualRecoveryDate).toLocaleDateString() : '-'}</div>
    </div></div>
    <div class="section"><h3>💊 Treatment</h3><div class="info-grid">
      <div class="label">Treatment:</div><div class="value">${record.treatment || '-'}</div>
      <div class="label">Medication:</div><div class="value">${record.medication || '-'}</div>
      <div class="label">Follow-up needed:</div><div class="value">${record.requiresFollowUp ? 'Yes' : 'No'}</div>
    </div></div>
    <div class="section"><h3>👨‍⚕️ Medical Notes</h3><div class="info-grid">
      <div class="label">Notes:</div><div class="value">${record.doctorNotes || '-'}</div>
      <div class="label">Doctor ID:</div><div class="value">${record.treatedByDoctorId || '-'}</div>
    </div></div>
  </div>
  <footer>Confidential Document - Medical Data</footer>
</div>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dossier_medical_${record.id}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.showNotification('HTML Record downloaded', 'success');
  }

  // ✅ Bouton toujours actif : la modale s'ouvre même sans profil santé
  openModal(r?: MedicalRecordResponse) {
    if (r) {
      this.editingId = r.id;
      this.form = { ...r };
      this.form.injuryDate = r.injuryDate ? r.injuryDate.substring(0, 10) : '';
      this.form.expectedRecoveryDate = r.expectedRecoveryDate ? r.expectedRecoveryDate.substring(0, 10) : '';
      this.form.actualRecoveryDate = r.actualRecoveryDate ? r.actualRecoveryDate.substring(0, 10) : '';
    } else {
      this.editingId = null;
      // Pour un non-admin sans profil santé, on laisse healthProfileId à 0 (sera invalidé à la sauvegarde)
      const defaultHpId = this.isAdmin ? (this.healthProfiles.length > 0 ? this.healthProfiles[0].id : 0) : (this.currentUserHealthProfileId || 0);
      this.form = {
        healthProfileId: defaultHpId,
        diagnosis: '',
        injuryDate: '',
        expectedRecoveryDate: '',
        actualRecoveryDate: '',
        doctorNotes: '',
        injuryType: '',
        recoveryStatus: 'PENDING',
        treatment: '',
        medication: '',
        requiresFollowUp: false,
        treatedByDoctorId: undefined
      };
    }
    this.modalVisible = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.modalVisible = false;
    this.cdr.detectChanges();
  }

  save() {
    if (this.isSubmitting) return;
    // Vérification spécifique pour les non-admin sans profil
    if (!this.isAdmin && !this.currentUserHealthProfileId) {
      this.showNotification('You cannot create a medical record without a health profile. Please create your health profile first.', 'error');
      return;
    }
    if (!this.form.healthProfileId || !this.form.diagnosis || !this.form.injuryDate) {
      this.showNotification('Please fill required fields (Patient, Diagnosis, Injury Date)', 'error');
      return;
    }
    this.isSubmitting = true;
    const payload = { 
      ...this.form,
      healthProfileId: Number(this.form.healthProfileId),
      treatedByDoctorId: this.form.treatedByDoctorId ? Number(this.form.treatedByDoctorId) : undefined
    };
    const obs = this.editingId ? this.medicalService.update(this.editingId, payload) : this.medicalService.create(payload);
    obs.subscribe({
      next: (res) => { this.loadRecords(); this.closeModal(); this.isSubmitting = false; this.showNotification(this.editingId ? 'Record updated' : 'Record created', 'success'); },
      error: (err) => { this.isSubmitting = false; this.showNotification('Error during save', 'error'); }
    });
  }

  deleteRecord(id: number) {
    if (confirm('Permanently delete this record?')) {
      this.medicalService.delete(id).subscribe({
        next: () => { this.loadRecords(); this.showNotification('Record deleted', 'success'); },
        error: (err) => this.showNotification('Delete error', 'error')
      });
    }
  }

  private showNotification(msg: string, type: 'success' | 'error') {
    this.notification = msg;
    this.notificationType = type;
    setTimeout(() => this.notification = '', 4000);
  }
}