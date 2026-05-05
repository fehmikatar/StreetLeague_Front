// Angular 19 Reactive Forms take care of the heavy lifting.
// We just need a wrapper to provide the styling of Radix UI.
import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-label',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label [for]="for" [class]="getClasses()">
      <ng-content></ng-content>
    </label>
  `
})
export class LabelComponent {
  @Input() for = '';
  @Input() className = '';
  @Input() disabled = false;

  getClasses() {
    return `text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${this.disabled ? 'cursor-not-allowed opacity-70' : ''} ${this.className}`.trim();
  }
}

export const LabelModule = [LabelComponent];
