import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertVariant = 'default' | 'destructive';

@Component({
    selector: 'app-alert',
    standalone: true,
    imports: [CommonModule],
    encapsulation: ViewEncapsulation.None,
    template: `
    <div [class]="getClasses()" role="alert">
      <ng-content select="[alert-icon]"></ng-content>
      <div class="col-start-2">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class AlertComponent {
    @Input() variant: AlertVariant = 'default';
    @Input() className = '';

    getClasses() {
        const baseClasses = "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current";
        let variantClasses = this.variant === 'destructive'
            ? "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90"
            : "bg-card text-card-foreground";

        return `${baseClasses} ${variantClasses} ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-alert-title',
    standalone: true,
    imports: [CommonModule],
    template: `<div [class]="getClasses()"><ng-content></ng-content></div>`
})
export class AlertTitleComponent {
    @Input() className = '';
    getClasses() {
        return `line-clamp-1 min-h-4 font-medium tracking-tight ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-alert-description',
    standalone: true,
    imports: [CommonModule],
    template: `<div [class]="getClasses()" data-slot="alert-description"><ng-content></ng-content></div>`
})
export class AlertDescriptionComponent {
    @Input() className = '';
    getClasses() {
        return `text-muted-foreground grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed ${this.className}`.trim();
    }
}

export const AlertModule = [AlertComponent, AlertTitleComponent, AlertDescriptionComponent];
