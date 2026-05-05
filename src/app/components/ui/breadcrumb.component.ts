import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronRight, MoreHorizontal } from 'lucide-angular';

@Component({
    selector: 'app-breadcrumb',
    standalone: true,
    imports: [CommonModule],
    template: `<nav aria-label="breadcrumb"><ng-content></ng-content></nav>`
})
export class BreadcrumbComponent { }

@Component({
    selector: 'app-breadcrumb-list',
    standalone: true,
    imports: [CommonModule],
    template: `
    <ol [class]="getClasses()">
      <ng-content></ng-content>
    </ol>
  `
})
export class BreadcrumbListComponent {
    @Input() className = '';
    getClasses() { return `text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5 ${this.className}`.trim(); }
}

@Component({
    selector: 'app-breadcrumb-item',
    standalone: true,
    imports: [CommonModule],
    template: `
    <li [class]="getClasses()">
      <ng-content></ng-content>
    </li>
  `
})
export class BreadcrumbItemComponent {
    @Input() className = '';
    getClasses() { return `inline-flex items-center gap-1.5 ${this.className}`.trim(); }
}

@Component({
    selector: 'app-breadcrumb-link',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <a [routerLink]="href" [class]="getClasses()">
      <ng-content></ng-content>
    </a>
  `
})
export class BreadcrumbLinkComponent {
    @Input() href: string | any[] = '/';
    @Input() className = '';
    getClasses() { return `hover:text-foreground transition-colors ${this.className}`.trim(); }
}

@Component({
    selector: 'app-breadcrumb-page',
    standalone: true,
    imports: [CommonModule],
    template: `
    <span role="link" aria-disabled="true" aria-current="page" [class]="getClasses()">
      <ng-content></ng-content>
    </span>
  `
})
export class BreadcrumbPageComponent {
    @Input() className = '';
    getClasses() { return `text-foreground font-normal ${this.className}`.trim(); }
}

@Component({
    selector: 'app-breadcrumb-separator',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <li role="presentation" aria-hidden="true" [class]="getClasses()">
      <ng-content>
        <lucide-icon [img]="ChevronRightIcon"></lucide-icon>
      </ng-content>
    </li>
  `
})
export class BreadcrumbSeparatorComponent {
    @Input() className = '';
    readonly ChevronRightIcon = ChevronRight;
    getClasses() { return `[&>svg]:size-3.5 ${this.className}`.trim(); }
}

@Component({
    selector: 'app-breadcrumb-ellipsis',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <span role="presentation" aria-hidden="true" [class]="getClasses()">
      <lucide-icon [img]="MoreHorizontalIcon" class="size-4"></lucide-icon>
      <span class="sr-only">More</span>
    </span>
  `
})
export class BreadcrumbEllipsisComponent {
    @Input() className = '';
    readonly MoreHorizontalIcon = MoreHorizontal;
    getClasses() { return `flex size-9 items-center justify-center ${this.className}`.trim(); }
}

export const BreadcrumbModule = [
    BreadcrumbComponent,
    BreadcrumbListComponent,
    BreadcrumbItemComponent,
    BreadcrumbLinkComponent,
    BreadcrumbPageComponent,
    BreadcrumbSeparatorComponent,
    BreadcrumbEllipsisComponent
];
