import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-separator',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div
      role="separator"
      [attr.aria-orientation]="decorative ? null : orientation"
      [attr.aria-hidden]="decorative"
      [class]="getClasses()"
    ></div>
  `
})
export class SeparatorComponent {
    @Input() className = '';
    @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
    @Input() decorative = true;

    getClasses() {
        const base = "bg-border shrink-0";
        const orientClass = this.orientation === "horizontal" ? "h-px w-full" : "h-full w-px";
        return `${base} ${orientClass} ${this.className}`.trim();
    }
}
