import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';

@Component({
    selector: 'app-calendar',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <div class="p-3" [class]="className">
      <div class="flex flex-col sm:flex-row gap-2">
        <div class="flex flex-col gap-4">
          <div class="flex justify-center pt-1 relative items-center w-full">
            <button 
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border bg-background text-foreground hover:bg-accent hover:text-accent-foreground size-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
              (click)="previousMonth()"
            >
              <lucide-icon [img]="ChevronLeftIcon" class="size-4"></lucide-icon>
            </button>
            <div class="text-sm font-medium">{{ currentMonthName }} {{ currentYear }}</div>
            <button 
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border bg-background text-foreground hover:bg-accent hover:text-accent-foreground size-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
              (click)="nextMonth()"
            >
              <lucide-icon [img]="ChevronRightIcon" class="size-4"></lucide-icon>
            </button>
          </div>
          
          <table class="w-full border-collapse space-x-1">
            <thead>
              <tr class="flex">
                <th *ngFor="let day of weekDays" class="text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]">
                  {{ day }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let week of weeks" class="flex w-full mt-2">
                <td *ngFor="let date of week" 
                  class="relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected])]:rounded-md"
                >
                  <button
                    *ngIf="date"
                    (click)="selectDate(date)"
                    [class]="getDayClass(date)"
                    [attr.aria-selected]="isSelected(date) ? 'true' : null"
                  >
                    {{ date.getDate() }}
                  </button>
                  <div *ngIf="!date" class="size-8 p-0"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class CalendarComponent implements OnInit {
    @Input() className = '';
    @Input() selected: Date | null = null;
    @Output() selectedChange = new EventEmitter<Date>();

    currentMonth: Date = new Date();
    weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    weeks: (Date | null)[][] = [];

    readonly ChevronLeftIcon = ChevronLeft;
    readonly ChevronRightIcon = ChevronRight;

    ngOnInit() {
        this.currentMonth = this.selected ? new Date(this.selected) : new Date();
        this.currentMonth.setDate(1);
        this.generateCalendar();
    }

    get currentMonthName(): string {
        return this.currentMonth.toLocaleString('default', { month: 'long' });
    }

    get currentYear(): number {
        return this.currentMonth.getFullYear();
    }

    previousMonth() {
        this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
        this.generateCalendar();
    }

    nextMonth() {
        this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
        this.generateCalendar();
    }

    selectDate(date: Date) {
        this.selected = date;
        this.selectedChange.emit(date);
    }

    isSelected(date: Date): boolean {
        if (!this.selected) return false;
        return date.toDateString() === this.selected.toDateString();
    }

    isToday(date: Date): boolean {
        return date.toDateString() === new Date().toDateString();
    }

    getDayClass(date: Date): string {
        // base ghost button classes + specific day classes
        let base = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground size-8 p-0 font-normal aria-selected:opacity-100";

        if (this.isSelected(date)) {
            base += " bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground";
        } else if (this.isToday(date)) {
            base += " bg-accent text-accent-foreground flex";
        } else {
            base += " bg-transparent";
        }
        return base;
    }

    private generateCalendar() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        this.weeks = [];
        let currentWeek: (Date | null)[] = [];

        for (let i = 0; i < firstDay; i++) {
            currentWeek.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            currentWeek.push(new Date(year, month, day));
            if (currentWeek.length === 7) {
                this.weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            this.weeks.push(currentWeek);
        }
    }
}

export const CalendarModule = [CalendarComponent];
