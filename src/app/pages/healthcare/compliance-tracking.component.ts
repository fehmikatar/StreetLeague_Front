import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Chart from 'chart.js/auto';
import { firstValueFrom } from 'rxjs';
import { AppointmentService, AppointmentResponse } from '../../services/appointment.service';
import { HealthProfileService, HealthProfileResponse } from '../../services/health-profile.service';
import { DietPlanService, DietPlanResponse } from '../../services/diet-plan.service';

@Component({
  selector: 'app-compliance-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <div class="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center gap-4">
            <a routerLink="/app/healthcare" class="bg-white hover:bg-gray-100 text-green-700 px-4 py-2 rounded-xl shadow-md transition">← Health Dashboard</a>
            <div><h1 class="text-3xl font-bold text-gray-800">✅ Compliance & Adherence</h1><p class="text-gray-600">Tracking your appointments and nutritional plans</p></div>
          </div>
          <button (click)="downloadFullReport()" 
                  class="bg-[#1DB954] hover:bg-[#1aa34a] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 transform hover:scale-105">
            📥 Download Report
          </button>
        </div>

      <div *ngIf="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
        <p class="mt-2">Loading your data...</p>
      </div>

      <div *ngIf="!isLoading && appointments.length === 0 && dietPlans.length === 0" class="text-center py-12 bg-yellow-50 rounded-xl">
        <p class="text-gray-600">📭 No compliance data.</p>
        <a routerLink="/app/healthcare/appointments" class="text-green-600 underline">Schedule an appointment</a>
      </div>

      <div *ngIf="!isLoading && (appointments.length > 0 || dietPlans.length > 0)">
        <!-- Cartes -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
            <p class="text-sm text-gray-500">Attendance rate</p>
            <p class="text-2xl font-bold">{{ attendanceRate }}%</p>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
            <p class="text-sm text-gray-500">Active Plans</p>
            <p class="text-2xl font-bold">{{ activePlans }}</p>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
            <p class="text-sm text-gray-500">Upcoming Appts (7d)</p>
            <p class="text-2xl font-bold">{{ upcomingAppointments }}</p>
          </div>
        </div>

        <!-- Graphiques -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div class="bg-white rounded-xl p-4 shadow-sm">
            <h3 class="font-semibold text-gray-700 mb-2">📊 Appointment Compliance</h3>
            <canvas #complianceChart style="max-height: 250px;"></canvas>
            <div *ngIf="!appointments.length" class="text-center py-8 text-gray-400">No appointments</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm">
            <h3 class="font-semibold text-gray-700 mb-2">🥗 Diet Plans</h3>
            <canvas #dietChart style="max-height: 250px;"></canvas>
            <div *ngIf="!dietPlans.length" class="text-center py-8 text-gray-400">No diet plan</div>
          </div>
        </div>

        <!-- Detailed Active Plans -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden mt-6">
          <div class="px-6 py-4 border-b bg-gray-50/50 flex justify-between items-center">
            <h3 class="font-bold text-gray-700">📑 Active Nutrition Plans</h3>
            <span class="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Live Status</span>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Plan Name</th>
                  <th class="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                  <th class="px-6 py-3 text-right text-xs font-black text-gray-500 uppercase tracking-widest">ACTIONS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr *ngFor="let p of dietPlans" class="hover:bg-gray-50/80 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">{{ p.planName }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-[10px] font-black rounded-full uppercase tracking-tighter" 
                          [class.bg-emerald-100]="p.isActive" [class.text-emerald-600]="p.isActive"
                          [class.bg-slate-100]="!p.isActive" [class.text-slate-400]="!p.isActive">
                      {{ p.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <div class="flex justify-end gap-2">
                      <button *ngIf="!p.isActive" (click)="togglePlanStatus(p)" 
                              class="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all shadow-sm border border-emerald-100 font-bold text-xs">
                        🚀 Activate
                      </button>
                      <button *ngIf="p.isActive" (click)="togglePlanStatus(p)" 
                              class="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all shadow-sm border border-slate-100 font-bold text-xs">
                        ⏸️ Deactivate
                      </button>
                      <button (click)="downloadDietPlan(p)" 
                              class="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all shadow-sm border border-blue-100">
                        📥 Download
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="!dietPlans.length">
                  <td colspan="3" class="px-6 py-10 text-center text-gray-400 text-sm italic">No diet plans linked to your profile.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Bilan -->
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 shadow-sm mt-6">
          <h3 class="font-bold text-gray-800">📋 Adherence Review</h3>
          <div class="mt-3 space-y-2 text-gray-700 text-sm">
            <p *ngFor="let diag of diagnostics" class="flex items-start gap-2"><span class="text-green-600">•</span> {{ diag }}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ComplianceTrackingComponent implements OnInit, AfterViewInit {
  @ViewChild('complianceChart') complianceCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('dietChart') dietCanvas!: ElementRef<HTMLCanvasElement>;

  appointments: AppointmentResponse[] = [];
  dietPlans: DietPlanResponse[] = [];
  isLoading = true;
  attendanceRate = 0;
  activePlans = 0;
  upcomingAppointments = 0;
  diagnostics: string[] = [];
  isAdmin = false;

  constructor(
    private appointmentService: AppointmentService,
    private healthProfileService: HealthProfileService,
    private dietPlanService: DietPlanService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() { this.loadUserData(); }

  ngAfterViewInit() { setTimeout(() => this.renderCharts(), 500); }

  private getCurrentUserId(): number | null {
    const id = localStorage.getItem('user_id');
    return id ? parseInt(id, 10) : null;
  }

  private async loadUserData() {
    const role = localStorage.getItem('user_type');
    this.isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN' || role === 'ROLE_FIELD_OWNER' || role === 'FIELD_OWNER';
    const userId = this.getCurrentUserId();

    try {
      if (this.isAdmin) {
        this.appointments = await firstValueFrom(this.appointmentService.getAll()).catch(() => []);
        this.dietPlans = await firstValueFrom(this.dietPlanService.getAll()).catch(() => []);
      } else if (userId) {
        this.appointments = await firstValueFrom(this.appointmentService.getByUserId(userId)).catch(() => []);
        const healthProfile = await firstValueFrom(this.healthProfileService.getByUserId(userId)).catch(() => null);
        if (healthProfile) {
          this.dietPlans = await firstValueFrom(this.dietPlanService.getByHealthProfileId(healthProfile.id)).catch(() => []);
        }
      } else {
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }

      this.computeStats();
      this.generateDiagnostics();
      this.cdr.detectChanges();
      setTimeout(() => this.renderCharts(), 200);
    } catch (err) {
      console.error(err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private computeStats() {
    const total = this.appointments.length;
    if (total) {
      const honored = this.appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length;
      this.attendanceRate = Math.round((honored / total) * 100);
    } else {
      this.attendanceRate = 0;
    }
    this.activePlans = this.dietPlans.filter(p => p.isActive).length;
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    this.upcomingAppointments = this.appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= now && aptDate <= nextWeek && apt.status !== 'CANCELLED';
    }).length;
  }

  private generateDiagnostics() {
    const diag: string[] = [];
    if (this.attendanceRate >= 80) diag.push(`🏆 Excellent compliance (${this.attendanceRate}%).`);
    else if (this.attendanceRate >= 50) diag.push(`👍 Average compliance (${this.attendanceRate}%). Improve your regularity.`);
    else if (this.appointments.length > 0) diag.push(`⚠️ Low compliance (${this.attendanceRate}%). Appointments are essential.`);
    else diag.push(`📅 No appointments recorded. Consider scheduling your consultations.`);

    if (this.activePlans === 0 && this.dietPlans.length > 0) diag.push(`🥗 No active diet plan. Please activate one.`);
    else if (this.activePlans > 0) diag.push(`🍎 ${this.activePlans} active plan(s) – stay motivated!`);
    else if (this.dietPlans.length === 0) diag.push(`📝 No diet plan. Consult a nutritionist.`);

    if (this.upcomingAppointments > 0) diag.push(`📅 ${this.upcomingAppointments} appointment(s) in the next 7 days. Remember to confirm.`);
    else if (this.appointments.length > 0) diag.push(`✅ No imminent appointments.`);
    this.diagnostics = diag;
  }

  private renderCharts() {
    if (this.complianceCanvas?.nativeElement && this.appointments.length) {
      try {
        const honored = this.appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length;
        const missed = this.appointments.length - honored;
        new Chart(this.complianceCanvas.nativeElement, {
          type: 'doughnut',
          data: { labels: ['Honored', 'Missed/Cancelled'], datasets: [{ data: [honored, missed], backgroundColor: ['#10b981', '#ef4444'] }] },
          options: { responsive: true, maintainAspectRatio: true }
        });
      } catch (e) { console.warn(e); }
    }
    if (this.dietCanvas?.nativeElement && this.dietPlans.length) {
      try {
        const active = this.dietPlans.filter(p => p.isActive).length;
        const inactive = this.dietPlans.length - active;
        new Chart(this.dietCanvas.nativeElement, {
          type: 'pie',
          data: { labels: ['Active', 'Inactive'], datasets: [{ data: [active, inactive], backgroundColor: ['#3b82f6', '#9ca3af'] }] },
          options: { responsive: true, maintainAspectRatio: true }
        });
      } catch (e) { console.warn(e); }
    }
  }
  downloadFullReport() {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Compliance Report</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; margin: 40px; background: #f8fafc; color: #1e293b; }
    .card { max-width: 900px; margin: auto; background: white; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.05); overflow: hidden; }
    .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 40px; text-align: center; }
    .content { padding: 40px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
    .stat-box { background: #f1f5f9; padding: 20px; border-radius: 16px; text-align: center; }
    .stat-val { font-size: 24px; font-weight: 800; color: #10b981; }
    .stat-lab { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 5px; }
    .diag-list { background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 0 16px 16px 0; }
    .diag-item { margin-bottom: 10px; font-size: 14px; font-weight: 500; }
    footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header"><h1>✅ Compliance & Adherence Report</h1><p>Generated on ${new Date().toLocaleString()}</p></div>
    <div class="content">
      <div class="grid">
        <div class="stat-box"><div class="stat-val">${this.attendanceRate}%</div><div class="stat-lab">Attendance Rate</div></div>
        <div class="stat-box"><div class="stat-val">${this.activePlans}</div><div class="stat-lab">Active Plans</div></div>
        <div class="stat-box"><div class="stat-val">${this.upcomingAppointments}</div><div class="stat-lab">Upcoming Appts</div></div>
      </div>
      <div class="diag-list">
        <h3>📋 AI Adherence Review</h3>
        ${this.diagnostics.map(d => `<div class="diag-item">• ${d}</div>`).join('')}
      </div>
    </div>
    <footer>Confidential Health Compliance Data</footer>
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_report_${new Date().getTime()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  togglePlanStatus(plan: DietPlanResponse) {
    const newStatus = !plan.isActive;
    this.dietPlanService.update(plan.id, { ...plan, isActive: newStatus }).subscribe({
      next: () => {
        plan.isActive = newStatus;
        this.computeStats();
        this.generateDiagnostics();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Toggle error:', err)
    });
  }

  downloadDietPlan(plan: DietPlanResponse) {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Diet Plan - ${plan.planName}</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; margin: 40px; background: #f0fdf4; color: #1e293b; }
    .card { max-width: 800px; margin: auto; background: white; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); overflow: hidden; }
    .header { background: #1db954; color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .section { margin-bottom: 25px; }
    .section h3 { color: #1db954; border-bottom: 2px solid #f0fdf4; padding-bottom: 8px; }
    .info { font-size: 15px; line-height: 1.6; }
    footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 11px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header"><h1>🥗 Nutrition Plan</h1><p>${plan.planName}</p></div>
    <div class="content">
      <div class="section"><h3>🎯 Goal</h3><p class="info">${plan.nutritionalGoals || 'General health maintenance'}</p></div>
      <div class="grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div style="background:#f8fafc; p-4; border-radius:12px; padding:15px; text-align:center;">
          <div style="font-weight:800; font-size:20px; color:#1db954;">${plan.dailyCalories}</div>
          <div style="font-size:10px; color:#64748b; text-transform:uppercase;">Kcal / Day</div>
        </div>
        <div style="background:#f8fafc; p-4; border-radius:12px; padding:15px; text-align:center;">
          <div style="font-weight:800; font-size:20px; color:#1db954;">${plan.isActive ? 'Active' : 'Inactive'}</div>
          <div style="font-size:10px; color:#64748b; text-transform:uppercase;">Status</div>
        </div>
      </div>
      <div class="section"><h3>🍽️ Meal Suggestions</h3><div class="info" style="white-space: pre-line;">${plan.mealSuggestions}</div></div>
      <div class="section"><h3>⚠️ Restrictions</h3><p class="info">${plan.dietaryRestrictions || 'None'}</p></div>
    </div>
    <footer>Personalized Sports Nutrition</footer>
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrition_plan_${plan.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
}