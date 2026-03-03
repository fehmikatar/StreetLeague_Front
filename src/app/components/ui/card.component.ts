import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-card',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="getClasses()">
      <ng-content></ng-content>
    </div>
  `
})
export class CardComponent {
    @Input() className = '';
    getClasses() {
        return `bg-card text-card-foreground flex flex-col gap-6 rounded-xl border ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-card-header',
    standalone: true,
    imports: [CommonModule],
    template: `<div [class]="getClasses()"><ng-content></ng-content></div>`
})
export class CardHeaderComponent {
    @Input() className = '';
    getClasses() {
        return `grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-card-title',
    standalone: true,
    imports: [CommonModule],
    template: `<h4 [class]="getClasses()"><ng-content></ng-content></h4>`
})
export class CardTitleComponent {
    @Input() className = '';
    getClasses() {
        return `leading-none font-semibold ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-card-description',
    standalone: true,
    imports: [CommonModule],
    template: `<p [class]="getClasses()"><ng-content></ng-content></p>`
})
export class CardDescriptionComponent {
    @Input() className = '';
    getClasses() {
        return `text-muted-foreground text-sm ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-card-content',
    standalone: true,
    imports: [CommonModule],
    template: `<div [class]="getClasses()"><ng-content></ng-content></div>`
})
export class CardContentComponent {
    @Input() className = '';
    getClasses() {
        return `px-6 [&:last-child]:pb-6 ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-card-footer',
    standalone: true,
    imports: [CommonModule],
    template: `<div [class]="getClasses()"><ng-content></ng-content></div>`
})
export class CardFooterComponent {
    @Input() className = '';
    getClasses() {
        return `flex items-center px-6 pb-6 [.border-t]:pt-6 ${this.className}`.trim();
    }
}

export const CardModule = [
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    CardFooterComponent
];
