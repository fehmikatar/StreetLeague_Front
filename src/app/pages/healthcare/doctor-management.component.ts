import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { DoctorService, DoctorResponse, DoctorRequest } from '../../services/doctor.service';

@Component({
  selector: 'app-doctor-management',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <!-- Header -->
      <div class="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 shadow-sm">
        <div class="flex flex-wrap justify-between items-center">
          <div class="flex items-center gap-4">
            <a routerLink="/app/healthcare" class="p-2 bg-white/50 rounded-xl hover:bg-white transition-all text-green-700 shadow-sm border border-green-100">
              <span class="text-xl">🏠</span>
            </a>
            <div>
              <h1 class="text-2xl font-black text-gray-800 tracking-tight">🩺 Doctor Network</h1>
              <p class="text-green-700/70 text-sm font-medium">Manage and view sports medical specialists</p>
            </div>
          </div>
          <button *ngIf="isAdmin" (click)="openModal()" class="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-green-200 flex items-center gap-2">
            <span>+</span> Add Doctor
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

      <!-- Search filter -->
      <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div class="relative">
          <input type="text"
                 [(ngModel)]="searchTerm"
                 (input)="onSearchInput()"
                 placeholder="🔍 Search by name, specialty or license..."
                 class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500">
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="text-center py-12 text-gray-500">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
        <p class="mt-2">Loading doctors...</p>
      </div>

      <!-- Doctors table -->
      <div *ngIf="!isLoading" class="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div class="px-6 py-4 border-b bg-gray-50/50 flex justify-between items-center">
          <h3 class="font-bold text-gray-700 flex items-center gap-2">
            📋 Doctors List
            <span class="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">{{ filteredDoctors.length }}</span>
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Hours</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-right text-xs font-black text-gray-500 uppercase tracking-widest">ACTIONS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr *ngFor="let doctor of filteredDoctors" class="hover:bg-gray-50 transition duration-150">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ doctor.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Dr. {{ doctor.firstName }} {{ doctor.lastName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{{ doctor.specialty }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ doctor.licenseNumber }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ doctor.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ doctor.workingHoursStart }} - {{ doctor.workingHoursEnd }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span (click)="toggleAvailability(doctor)"
                        class="cursor-pointer px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-all"
                        [class.bg-green-100]="doctor.isAvailable"
                        [class.bg-red-100]="!doctor.isAvailable"
                        [class.text-green-800]="doctor.isAvailable"
                        [class.text-red-800]="!doctor.isAvailable">
                    {{ doctor.isAvailable ? '🟢 Available' : '🔴 Unavailable' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div *ngIf="isAdmin" class="flex justify-end gap-2">
                    <button (click)="openModal(doctor); $event.stopPropagation()"
                            class="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all shadow-sm border border-amber-100" title="Edit">
                      ✏️
                    </button>
                    <button (click)="deleteDoctor(doctor.id); $event.stopPropagation()"
                            class="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all shadow-sm border border-red-100" title="Delete">
                      🗑️
                    </button>
                  </div>
                  <span *ngIf="!isAdmin" class="text-gray-400 text-xs italic">Read-only</span>
                </td>
              </tr>
              <tr *ngIf="filteredDoctors.length === 0">
                <td colspan="8" class="px-6 py-10 text-center text-gray-400">No doctors found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Create / Edit -->
    <div *ngIf="modalVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" (click)="closeModal()">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-800">{{ editingId ? 'Edit Doctor' : 'Add New Doctor' }}</h2>
          <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form #doctorForm="ngForm" (ngSubmit)="saveDoctor()" class="p-6 space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input type="text" [(ngModel)]="form.firstName" name="firstName" required
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input type="text" [(ngModel)]="form.lastName" name="lastName" required
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Specialty *</label>
              <select [(ngModel)]="form.specialty" name="specialty" required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
                <option *ngFor="let spec of sportsSpecialties" [value]="spec">{{ spec }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
              <input type="text" [(ngModel)]="form.licenseNumber" name="licenseNumber" required
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" [(ngModel)]="form.email" name="email" required email
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input type="text" [(ngModel)]="form.phoneNumber" name="phoneNumber" required
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Working Hours Start *</label>
              <input type="text" [(ngModel)]="form.workingHoursStart" name="workingHoursStart" required placeholder="09:00"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Working Hours End *</label>
              <input type="text" [(ngModel)]="form.workingHoursEnd" name="workingHoursEnd" required placeholder="17:00"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
            </div>
            <div class="col-span-2">
              <label class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="form.isAvailable" name="isAvailable">
                <span class="text-sm text-gray-700">Available for appointments</span>
              </label>
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-4 border-t">
            <button type="button" (click)="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" [disabled]="doctorForm.invalid && doctorForm.submitted"
                    class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ editingId ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    input.ng-invalid.ng-touched, select.ng-invalid.ng-touched {
      border-color: #ef4444;
    }
    .animate-bounce {
      animation: bounce 0.5s ease-in-out;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
  `]
})
export class DoctorManagementComponent implements OnInit {
  doctors: DoctorResponse[] = [];
  filteredDoctors: DoctorResponse[] = [];
  isLoading = true;
  modalVisible = false;
  editingId: number | null = null;
  searchTerm = '';
  notification = '';
  notificationType: 'success' | 'error' = 'success';
  private searchDebounceTimer: any;

  sportsSpecialties = [
    'Médecin du sport',
    'Physiothérapie',
    'Nutrition sportive',
    'Cardiologie du sport',
    'Orthopédie',
    'Psychologie du sport',
    'Ostéopathie',
    'Podologie',
    'Radiologie sportive'
  ];

  form: DoctorRequest = {
    firstName: '',
    lastName: '',
    specialty: this.sportsSpecialties[0],
    licenseNumber: '',
    email: '',
    phoneNumber: '',
    workingHoursStart: '',
    workingHoursEnd: '',
    isAvailable: true
  };

  isAdmin = false;

  constructor(
    private doctorService: DoctorService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const role = localStorage.getItem('user_type');
    this.isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN' || role === 'ROLE_FIELD_OWNER' || role === 'FIELD_OWNER';
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.isLoading = true;
    this.doctorService.getAll().subscribe({
      next: (data) => {
        this.doctors = data;
        this.filterDoctors(); // Met à jour la liste filtrée immédiatement
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.showNotification('Failed to load doctors', 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Recherche avec debounce pour éviter de surcharger
  onSearchInput(): void {
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.filterDoctors();
    }, 300);
  }

  filterDoctors(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredDoctors = [...this.doctors];
    } else {
      this.filteredDoctors = this.doctors.filter(doc =>
        doc.firstName.toLowerCase().includes(term) ||
        doc.lastName.toLowerCase().includes(term) ||
        doc.specialty.toLowerCase().includes(term) ||
        doc.licenseNumber.toLowerCase().includes(term) ||
        doc.email.toLowerCase().includes(term)
      );
    }
    this.cdr.detectChanges();
  }

  toggleAvailability(doctor: DoctorResponse): void {
    const newStatus = !doctor.isAvailable;
    this.doctorService.updateAvailability(doctor.id, newStatus).subscribe({
      next: (updated) => {
        // Mise à jour immédiate dans le tableau local sans rechargement
        const index = this.doctors.findIndex(d => d.id === doctor.id);
        if (index !== -1) {
          this.doctors[index].isAvailable = updated.isAvailable;
          this.filterDoctors(); // Rafraîchir la recherche
        }
        this.showNotification(`Doctor is now ${updated.isAvailable ? 'available' : 'unavailable'}`, 'success');
        this.cdr.detectChanges();
      },
      error: () => this.showNotification('Failed to update availability', 'error')
    });
  }

  openModal(doctor?: DoctorResponse): void {
    if (doctor) {
      this.editingId = doctor.id;
      this.form = {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialty: doctor.specialty,
        licenseNumber: doctor.licenseNumber,
        email: doctor.email,
        phoneNumber: doctor.phoneNumber,
        workingHoursStart: doctor.workingHoursStart,
        workingHoursEnd: doctor.workingHoursEnd,
        isAvailable: doctor.isAvailable
      };
    } else {
      this.editingId = null;
      this.form = {
        firstName: '',
        lastName: '',
        specialty: this.sportsSpecialties[0],
        licenseNumber: '',
        email: '',
        phoneNumber: '',
        workingHoursStart: '',
        workingHoursEnd: '',
        isAvailable: true
      };
    }
    this.modalVisible = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.modalVisible = false;
  }

  saveDoctor(): void {
    if (!this.form.firstName || !this.form.lastName || !this.form.specialty ||
      !this.form.licenseNumber || !this.form.email || !this.form.phoneNumber ||
      !this.form.workingHoursStart || !this.form.workingHoursEnd) {
      this.showNotification('Please fill all required fields', 'error');
      return;
    }

    const request = { ...this.form };
    const obs = this.editingId
      ? this.doctorService.update(this.editingId, request)
      : this.doctorService.create(request);

    obs.subscribe({
      next: (savedDoctor) => {
        this.loadDoctors(); // Recharge la liste complète pour être synchro
        this.closeModal();
        this.showNotification(this.editingId ? 'Doctor updated' : 'Doctor created', 'success');
      },
      error: (err) => {
        const msg = err.error?.message || 'Operation failed';
        this.showNotification(msg, 'error');
      }
    });
  }

  deleteDoctor(id: number): void {
    if (confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
      this.doctorService.delete(id).subscribe({
        next: () => {
          this.loadDoctors();
          this.showNotification('Doctor deleted', 'success');
        },
        error: () => this.showNotification('Delete failed', 'error')
      });
    }
  }

  private showNotification(msg: string, type: 'success' | 'error'): void {
    this.notification = msg;
    this.notificationType = type;
    setTimeout(() => (this.notification = ''), 4000);
  }
}