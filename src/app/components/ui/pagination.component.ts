import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-angular';

@Component({
    selector: 'app-pagination',
    standalone: true,
    imports: [CommonModule],
    template: `
    <nav role="navigation" aria-label="pagination" [class]="getClasses()">
      <ng-content></ng-content>
    </nav>
  `
})
export class PaginationComponent {
    @Input() className = '';
    getClasses() { return `mx-auto flex w-full justify-center ${this.className}`.trim(); }
}

@Component({
    selector: 'app-pagination-content',
    standalone: true,
    imports: [CommonModule],
    template: `
    <ul [class]="getClasses()">
      <ng-content></ng-content>
    </ul>
  `
})
export class PaginationContentComponent {
    @Input() className = '';
    getClasses() { return `flex flex-row items-center gap-1 ${this.className}`.trim(); }
}

@Component({
    selector: 'app-pagination-item',
    standalone: true,
    imports: [CommonModule],
    template: `<li [class]="className"><ng-content></ng-content></li>`
})
export class PaginationItemComponent {
    @Input() className = '';
}

@Component({
    selector: 'app-pagination-link',
    standalone: true,
    imports: [CommonModule],
    template: `
    <a 
      [attr.aria-current]="isActive ? 'page' : null" 
      [class]="getClasses()"
      [href]="href"
    >
      <ng-content></ng-content>
    </a>
  `
})
export class PaginationLinkComponent {
    @Input() className = '';
    @Input() isActive = false;
    @Input() size: 'default' | 'sm' | 'lg' | 'icon' = 'icon';
    @Input() href = '#';

    getClasses() {
        let sizeClass = "h-9 w-9";
        if (this.size === 'default') sizeClass = "h-9 px-4 py-2";
        if (this.size === 'sm') sizeClass = "h-8 px-3 text-xs";
        if (this.size === 'lg') sizeClass = "h-10 px-8";

        let variantClass = this.isActive
            ? "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
            : "hover:bg-accent hover:text-accent-foreground";

        const base = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

        return `${base} ${variantClass} ${sizeClass} ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-pagination-previous',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, PaginationLinkComponent],
    template: `
    <app-pagination-link [href]="href" [isActive]="isActive" size="default" [className]="getClasses()">
      <lucide-icon [img]="ChevronLeftIcon" class="w-4 h-4"></lucide-icon>
      <span class="hidden sm:block">Previous</span>
    </app-pagination-link>
  `
})
export class PaginationPreviousComponent {
    @Input() className = '';
    @Input() href = '#';
    @Input() isActive = false;
    readonly ChevronLeftIcon = ChevronLeft;

    getClasses() { return `gap-1 px-2.5 sm:pl-2.5 ${this.className}`.trim(); }
}

@Component({
    selector: 'app-pagination-next',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, PaginationLinkComponent],
    template: `
    <app-pagination-link [href]="href" [isActive]="isActive" size="default" [className]="getClasses()">
      <span class="hidden sm:block">Next</span>
      <lucide-icon [img]="ChevronRightIcon" class="w-4 h-4"></lucide-icon>
    </app-pagination-link>
  `
})
export class PaginationNextComponent {
    @Input() className = '';
    @Input() href = '#';
    @Input() isActive = false;
    readonly ChevronRightIcon = ChevronRight;

    getClasses() { return `gap-1 px-2.5 sm:pr-2.5 ${this.className}`.trim(); }
}

@Component({
    selector: 'app-pagination-ellipsis',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <span aria-hidden="true" [class]="getClasses()">
      <lucide-icon [img]="MoreHorizontalIcon" class="h-4 w-4"></lucide-icon>
      <span class="sr-only">More pages</span>
    </span>
  `
})
export class PaginationEllipsisComponent {
    @Input() className = '';
    readonly MoreHorizontalIcon = MoreHorizontal;

    getClasses() { return `flex h-9 w-9 items-center justify-center ${this.className}`.trim(); }
}

export const PaginationModule = [
    PaginationComponent,
    PaginationContentComponent,
    PaginationItemComponent,
    PaginationLinkComponent,
    PaginationPreviousComponent,
    PaginationNextComponent,
    PaginationEllipsisComponent
];
