import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-skeleton',
    standalone: true,
    imports: [CommonModule],
    template: `<div [class]="getClasses()"></div>`
})
export class SkeletonComponent {
    @Input() className = '';

    getClasses() {
        return `bg-accent animate-pulse rounded-md ${this.className}`.trim();
    }
}
