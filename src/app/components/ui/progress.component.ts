import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-progress',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div 
      role="progressbar"
      [attr.aria-valuemin]="0"
      [attr.aria-valuemax]="100"
      [attr.aria-valuenow]="value"
      data-slot="progress"
      [class]="getClasses()"
    >
      <div
        data-slot="progress-indicator"
        class="bg-primary h-full w-full flex-1 transition-all"
        [style.transform]="'translateX(-' + (100 - (value || 0)) + '%)'"
      ></div>
    </div>
  `
})
export class ProgressComponent implements OnChanges {
    @Input() value: number = 0;
    @Input() className = '';

    ngOnChanges() {
        // Clamp the value
        if (this.value < 0) this.value = 0;
        if (this.value > 100) this.value = 100;
    }

    getClasses() {
        return `bg-primary/20 relative h-2 w-full overflow-hidden rounded-full ${this.className}`.trim();
    }
}
