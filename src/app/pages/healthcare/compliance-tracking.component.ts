import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ClipboardList, CheckCircle, Circle, TrendingUp, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-compliance-tracking',
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
      <div>
        <h1 class="text-2xl font-bold text-foreground">Compliance Tracking</h1>
        <p class="text-muted-foreground">Compliance with your health programs and medical recommendations</p>
      </div>

      <!-- Overall Score -->
      <div class="bg-card rounded-xl border border-border p-6">
        <div class="flex items-center gap-6">
          <div class="relative w-24 h-24">
            <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" stroke-width="3"/>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1DB954" stroke-width="3" stroke-dasharray="78, 100"/>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xl font-bold text-primary">78%</span>
            </div>
          </div>
          <div>
            <h2 class="text-xl font-semibold text-foreground">Global Compliance Score</h2>
            <p class="text-muted-foreground">Good level • Some improvements possible</p>
            <div class="flex items-center gap-2 mt-2">
              <lucide-icon [name]="trendIcon" [size]="16" class="text-green-500"></lucide-icon>
              <span class="text-sm text-green-500">+12% this month</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Programs -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-foreground">Current Programs</h2>
        <div *ngFor="let program of programs" class="bg-card rounded-xl border border-border p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-foreground">{{program.title}}</h3>
            <span class="text-primary font-semibold">{{program.completion}}%</span>
          </div>
          <div class="w-full bg-muted rounded-full h-2 mb-3">
            <div class="bg-primary h-2 rounded-full transition-all" [style.width.%]="program.completion"></div>
          </div>
          <div class="space-y-2">
            <div *ngFor="let task of program.tasks" class="flex items-center gap-3">
              <lucide-icon [name]="task.done ? checkIcon : circleIcon" [size]="16"
                [ngClass]="task.done ? 'text-green-500' : 'text-muted-foreground'">
              </lucide-icon>
              <span class="text-sm" [ngClass]="task.done ? 'text-muted-foreground line-through' : 'text-foreground'">{{task.label}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ComplianceTrackingComponent {
  readonly checkIcon = CheckCircle;
  readonly circleIcon = Circle;
  readonly trendIcon = TrendingUp;
  readonly arrowLeftIcon = ArrowLeft;

  programs = [
    {
      title: 'Cardio Program',
      completion: 85,
      tasks: [
        { label: '30 min cardio 3x/week', done: true },
        { label: 'Max heart rate < 160 bpm', done: true },
        { label: 'Weekly blood pressure measurement', done: false },
      ]
    },
    {
      title: 'Nutrition',
      completion: 70,
      tasks: [
        { label: '2000-2400 kcal/day', done: true },
        { label: 'Proteins > 100g/day', done: true },
        { label: 'Limit sodium < 2g/day', done: false },
        { label: 'Hydration > 2.5L/day', done: false },
      ]
    },
    {
      title: 'Medical Tracking',
      completion: 60,
      tasks: [
        { label: 'Monthly blood pressure check', done: true },
        { label: 'Daily medication intake', done: true },
        { label: 'Physio appointment (3x/week)', done: false },
        { label: 'Quarterly blood test', done: false },
      ]
    }
  ];
}
