import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MedicalRecordService, MedicalRecordResponse, MedicalRecordRequest } from '../../services/medical-record.service';
import { HealthProfileService, HealthProfileResponse } from '../../services/health-profile.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <!-- En-tête avec dégradé vert -->
      <div class="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 shadow-sm">
        <div class="flex flex-wrap justify-between items-center">
          <div class="flex items-center gap-4">
            <a routerLink="/app/healthcare" 
               class="bg-white hover:bg-gray-100 text-green-700 px-4 py-2 rounded-xl shadow-md transition duration-200 flex items-center gap-2">
              ← Dashboard Santé
            </a>
            <div>
              <h1 class="text-3xl font-bold text-gray-800">🩺 Dossiers médicaux</h1>
              <p class="text-gray-600 mt-1">Gestion des antécédents et suivis</p>
            </div>
          </div>
          <button (click)="openModal()" 
                  class="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl shadow-md transition duration-200 flex items-center gap-2">
            <span class="text-xl">+</span> Nouveau dossier
          </button>
        </div>
      </div>

      <!-- Toast notification -->
      <div *ngIf="notification" 
           class="fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-bounce"
           [class.bg-green-600]="notificationType === 'success'"
           [class.bg-red-600]="notificationType === 'error'">
        {{ notification }}
      </div>

      <!-- Chargement -->
      <div *ngIf="isLoading" class="text-center py-12 text-gray-500">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
        <p class="mt-2">Chargement des dossiers...</p>
      </div>

      <!-- Tableau des dossiers -->
      <div *ngIf="!isLoading" class="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnostic</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date blessure</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rétablissement</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr *ngFor="let r of records" 
                  (click)="showDetails(r)" 
                  class="hover:bg-gray-50 cursor-pointer transition duration-150">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ r.id }}</td>
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
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button (click)="openModal(r); $event.stopPropagation()" class="text-green-600 hover:text-green-900">✏️ Modifier</button>
                  <button (click)="deleteRecord(r.id); $event.stopPropagation()" class="text-red-600 hover:text-red-900">🗑️ Supprimer</button>
                  <button (click)="downloadRecord(r); $event.stopPropagation()" class="text-blue-600 hover:text-blue-900" title="Télécharger fiche">📥</button>
                </td>
              </tr>
              <tr *ngIf="records.length === 0">
                <td colspan="7" class="px-6 py-10 text-center text-gray-400">Aucun dossier médical trouvé</td>
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
          <h2 class="text-xl font-bold text-gray-800">{{ editingId ? 'Modifier le dossier' : 'Nouveau dossier médical' }}</h2>
          <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form #recordForm="ngForm" (ngSubmit)="save()" class="p-6 space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
              <select [(ngModel)]="form.healthProfileId" name="healthProfileId" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
                <option *ngFor="let hp of healthProfiles" [value]="hp.id">{{ getPatientName(hp.id) }}</option>
              </select>
              <div *ngIf="recordForm.submitted && !form.healthProfileId" class="text-red-500 text-xs mt-1">Champ requis</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Diagnostic *</label>
              <input type="text" [(ngModel)]="form.diagnosis" name="diagnosis" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date de blessure *</label>
              <input type="date" [(ngModel)]="form.injuryDate" name="injuryDate" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type de blessure</label>
              <select [(ngModel)]="form.injuryType" name="injuryType" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
                <option *ngFor="let type of injuryTypes" [value]="type">{{ type }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Statut de rétablissement</label>
              <select [(ngModel)]="form.recoveryStatus" name="recoveryStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
                <option *ngFor="let st of recoveryStatuses" [value]="st">{{ st }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date retour prévue</label>
              <input type="date" [(ngModel)]="form.expectedRecoveryDate" name="expectedRecoveryDate" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date retour réelle</label>
              <input type="date" [(ngModel)]="form.actualRecoveryDate" name="actualRecoveryDate" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Traitement</label>
              <input type="text" [(ngModel)]="form.treatment" name="treatment" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Médicaments</label>
              <input type="text" [(ngModel)]="form.medication" name="medication" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Médecin traitant ID</label>
              <input type="number" [(ngModel)]="form.treatedByDoctorId" name="treatedByDoctorId" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes du médecin</label>
            <textarea rows="3" [(ngModel)]="form.doctorNotes" name="doctorNotes" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
          </div>
          <div>
            <label class="flex items-center gap-2">
              <input type="checkbox" [(ngModel)]="form.requiresFollowUp" name="requiresFollowUp"> Nécessite un suivi
            </label>
          </div>
          <div class="flex justify-end gap-3 pt-4 border-t">
            <button type="button" (click)="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Annuler</button>
            <button type="submit" [disabled]="recordForm.invalid && recordForm.submitted" 
                    class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ editingId ? 'Mettre à jour' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de détails -->
    <div *ngIf="detailsVisible && selectedRecord" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-gradient-to-r from-green-50 to-emerald-100 px-6 py-4 flex justify-between items-center border-b">
          <h2 class="text-xl font-bold text-gray-800">📄 Détails du dossier médical</h2>
          <button (click)="closeDetails()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Patient :</span> {{ getPatientName(selectedRecord.healthProfileId) }}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Diagnostic :</span> {{ selectedRecord.diagnosis }}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Date blessure :</span> {{ selectedRecord.injuryDate | date:'dd/MM/yyyy' }}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Type blessure :</span> {{ selectedRecord.injuryType || '-' }}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Statut rétablissement :</span> {{ selectedRecord.recoveryStatus }}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Retour prévue :</span> {{ (selectedRecord.expectedRecoveryDate | date:'dd/MM/yyyy') || '-' }}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Retour réelle :</span> {{ (selectedRecord.actualRecoveryDate | date:'dd/MM/yyyy') || '-' }}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Traitement :</span> {{ selectedRecord.treatment || '-' }}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Médicaments :</span> {{ selectedRecord.medication || '-' }}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Médecin ID :</span> {{ selectedRecord.treatedByDoctorId || '-' }}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Suivi nécessaire :</span> {{ selectedRecord.requiresFollowUp ? 'Oui' : 'Non' }}</div>
            <div class="col-span-2 bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Notes médecin :</span> {{ selectedRecord.doctorNotes || '-' }}</div>
            <div class="col-span-2 bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Créé le :</span> {{ selectedRecord.createdAt | date:'dd/MM/yyyy HH:mm' }}</div>
            <div class="col-span-2 bg-gray-50 p-3 rounded-lg"><span class="font-semibold">Dernière mise à jour :</span> {{ selectedRecord.updatedAt | date:'dd/MM/yyyy HH:mm' }}</div>
          </div>
          <div class="flex justify-end mt-4">
            <button (click)="downloadRecord(selectedRecord)" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
              📥 Télécharger la fiche HTML
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
  isLoading = true;
  modalVisible = false;
  detailsVisible = false;
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
    recoveryStatus: 'PENDING',    // ← valeur par défaut valide pour le backend
    treatment: '',
    medication: '',
    requiresFollowUp: false,
    treatedByDoctorId: undefined
  };
  injuryTypes = ['MUSCLE_STRAIN','MUSCLE_TEAR','CRAMP','SPRAIN','DISLOCATION','FRACTURE','STRESS_FRACTURE','LIGAMENT_TEAR','TENDONITIS','CONCUSSION','BRUISE','CUT','OTHER'];
  recoveryStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'COMPLICATED', 'REFERRED']; // ← aligné backend
  notification = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(
    private medicalService: MedicalRecordService,
    private healthProfileService: HealthProfileService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadHealthProfiles();
  }

  loadHealthProfiles() {
    this.healthProfileService.getAll().subscribe({
      next: (profiles) => {
        this.healthProfiles = profiles;
        this.loadUsers();
      },
      error: (err) => {
        console.error('Erreur chargement profils santé', err);
        this.showNotification('Erreur chargement profils santé', 'error');
        this.loadUsers();
      }
    });
  }

  loadUsers() {
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users = users;
        this.loadRecords();
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs', err);
        this.loadRecords();
      }
    });
  }

  loadRecords() {
    this.isLoading = true;
    this.medicalService.getAll().subscribe({
      next: (data: MedicalRecordResponse[]) => {
        this.records = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement dossiers', err);
        this.showNotification('Erreur chargement dossiers', 'error');
        this.isLoading = false;
      }
    });
  }

  getPatientName(healthProfileId: number): string {
    const profile = this.healthProfiles.find(hp => hp.id === healthProfileId);
    if (!profile) return `Profil ${healthProfileId}`;
    const user = this.users.find(u => u.id === profile.userId);
    return user ? `${user.firstName} ${user.lastName}` : `Profil ${healthProfileId}`;
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
  <title>Dossier médical - ${patientName}</title>
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
  <div class="header"><h1>🩺 Dossier médical</h1><p>Généré le ${new Date().toLocaleString()}</p></div>
  <div class="content">
    <div class="section"><h3>👤 Patient</h3><div class="info-grid">
      <div class="label">Nom :</div><div class="value">${patientName}</div>
    </div></div>
    <div class="section"><h3>📋 Diagnostic</h3><div class="info-grid">
      <div class="label">Diagnostic :</div><div class="value">${record.diagnosis}</div>
      <div class="label">Type de blessure :</div><div class="value">${record.injuryType || '-'}</div>
      <div class="label">Date de blessure :</div><div class="value">${new Date(record.injuryDate).toLocaleDateString()}</div>
    </div></div>
    <div class="section"><h3>🩺 Rétablissement</h3><div class="info-grid">
      <div class="label">Statut :</div><div class="value">${record.recoveryStatus}</div>
      <div class="label">Retour prévue :</div><div class="value">${record.expectedRecoveryDate ? new Date(record.expectedRecoveryDate).toLocaleDateString() : '-'}</div>
      <div class="label">Retour réelle :</div><div class="value">${record.actualRecoveryDate ? new Date(record.actualRecoveryDate).toLocaleDateString() : '-'}</div>
    </div></div>
    <div class="section"><h3>💊 Traitement</h3><div class="info-grid">
      <div class="label">Traitement :</div><div class="value">${record.treatment || '-'}</div>
      <div class="label">Médicaments :</div><div class="value">${record.medication || '-'}</div>
      <div class="label">Suivi nécessaire :</div><div class="value">${record.requiresFollowUp ? 'Oui' : 'Non'}</div>
    </div></div>
    <div class="section"><h3>👨‍⚕️ Notes médicales</h3><div class="info-grid">
      <div class="label">Notes :</div><div class="value">${record.doctorNotes || '-'}</div>
      <div class="label">Médecin ID :</div><div class="value">${record.treatedByDoctorId || '-'}</div>
    </div></div>
  </div>
  <footer>Document confidentiel - Données médicales</footer>
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
    this.showNotification('Fiche HTML téléchargée', 'success');
  }

  openModal(r?: MedicalRecordResponse) {
    if (r) {
      this.editingId = r.id;
      this.form = { ...r };
      // Formater les dates pour l'input date (YYYY-MM-DD)
      this.form.injuryDate = r.injuryDate ? r.injuryDate.substring(0,10) : '';
      this.form.expectedRecoveryDate = r.expectedRecoveryDate ? r.expectedRecoveryDate.substring(0,10) : '';
      this.form.actualRecoveryDate = r.actualRecoveryDate ? r.actualRecoveryDate.substring(0,10) : '';
    } else {
      this.editingId = null;
      this.form = {
        healthProfileId: this.healthProfiles.length > 0 ? this.healthProfiles[0].id : 0,
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
  }

  closeModal() {
    this.modalVisible = false;
  }

  save() {
    // Validation des champs obligatoires
    if (!this.form.healthProfileId || !this.form.diagnosis || !this.form.injuryDate) {
      this.showNotification('Veuillez remplir les champs obligatoires (Patient, Diagnostic, Date blessure)', 'error');
      return;
    }

    const payload = { ...this.form };
    
    const obs = this.editingId
      ? this.medicalService.update(this.editingId, payload)
      : this.medicalService.create(payload);

    obs.subscribe({
      next: () => {
        this.loadRecords();
        this.closeModal();
        this.showNotification(this.editingId ? 'Dossier modifié' : 'Dossier créé', 'success');
      },
      error: (err) => {
        console.error('Erreur détaillée:', err);
        let errorMsg = 'Erreur lors de l\'enregistrement';
        if (err.error?.errors) {
          errorMsg = Object.values(err.error.errors).join(', ');
        } else if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.message) {
          errorMsg = err.message;
        }
        this.showNotification(errorMsg, 'error');
      }
    });
  }

  deleteRecord(id: number) {
    if (confirm('Supprimer définitivement ce dossier ?')) {
      this.medicalService.delete(id).subscribe({
        next: () => {
          this.loadRecords();
          this.showNotification('Dossier supprimé', 'success');
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          this.showNotification('Erreur suppression: ' + (err.error?.message || err.message), 'error');
        }
      });
    }
  }

  private showNotification(msg: string, type: 'success' | 'error') {
    this.notification = msg;
    this.notificationType = type;
    setTimeout(() => this.notification = '', 4000);
  }
}