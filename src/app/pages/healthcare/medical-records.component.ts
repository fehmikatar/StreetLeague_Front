import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, FileText, Plus, Download, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-medical-records',
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
          <h1 class="text-2xl font-bold text-foreground">Medical Records</h1>
          <p class="text-muted-foreground">History of your consultations and exams</p>
        </div>
        <button (click)="ajouter()" class="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          <lucide-icon [name]="plusIcon" [size]="16"></lucide-icon>
          Add
        </button>
      </div>
      <div *ngIf="notification" class="bg-primary/10 border border-primary/20 rounded-xl p-3 text-primary text-sm font-medium">
        {{ notification }}
      </div>

      <!-- Records list -->
      <div class="space-y-3">
        <div *ngFor="let record of records" class="bg-card rounded-xl border border-border p-5 flex items-start justify-between hover:shadow-md transition-shadow">
          <div class="flex items-start gap-4">
            <div class="p-3 bg-primary/10 rounded-lg mt-1">
              <lucide-icon [name]="fileIcon" [size]="20" class="text-primary"></lucide-icon>
            </div>
            <div>
              <h3 class="font-semibold text-foreground">{{record.title}}</h3>
              <p class="text-sm text-muted-foreground">{{record.doctor}} • {{record.date}}</p>
              <p class="text-sm text-foreground mt-1">{{record.summary}}</p>
              <div class="flex flex-wrap gap-1 mt-2">
                <span *ngFor="let tag of record.tags" class="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{{tag}}</span>
              </div>
            </div>
          </div>
          <button (click)="download(record)" class="p-2 hover:bg-muted rounded-lg transition-colors" title="Download">
            <lucide-icon [name]="downloadIcon" [size]="16" class="text-muted-foreground"></lucide-icon>
          </button>
        </div>
      </div>
    </div>
  `
})
export class MedicalRecordsComponent {
  readonly fileIcon = FileText;
  readonly plusIcon = Plus;
  readonly downloadIcon = Download;
  readonly arrowLeftIcon = ArrowLeft;
  notification = '';

  ajouter() { this.showNotification('➕ Record addition form opened.'); }
  download(record: any) { this.showNotification(`⬇️ Downloading: ${record.title}`); }
  private showNotification(msg: string) {
    this.notification = msg;
    setTimeout(() => { this.notification = ''; }, 3000);
  }

  records = [
    { title: 'Annual Health Check-up', doctor: 'Dr. Martin', date: '15 Jan 2026', summary: 'Satisfactory general check-up, mild hypertension to monitor.', tags: ['General', 'Prevention'] },
    { title: 'Cardiology Consultation', doctor: 'Dr. Rousseau', date: '22 Dec 2025', summary: 'Normal ECG, no cardiac issues detected.', tags: ['Cardiology'] },
    { title: 'Right Knee MRI', doctor: 'Dr. Bernard', date: '5 Nov 2025', summary: 'Mild meniscal wear, physiotherapy recommended.', tags: ['Orthopedics', 'Imaging'] },
    { title: 'Blood Test', doctor: 'Central Lab', date: '10 Oct 2025', summary: 'All markers within normal limits, mild Vit D deficiency.', tags: ['Biology'] },
  ];
}
