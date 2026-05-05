import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-avatar',
    standalone: true,
    imports: [CommonModule],
    encapsulation: ViewEncapsulation.None,
    template: `
    <div [class]="getClasses()">
      <ng-content></ng-content>
    </div>
  `
})
export class AvatarComponent {
    @Input() className = '';
    getClasses() {
        return `relative flex size-10 shrink-0 overflow-hidden rounded-full ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-avatar-image',
    standalone: true,
    imports: [CommonModule],
    template: `
    <img *ngIf="src" [src]="src" [alt]="alt" [class]="getClasses()" (error)="handleError()" [hidden]="hasError" />
  `
})
export class AvatarImageComponent {
    @Input() src = '';
    @Input() alt = '';
    @Input() className = '';
    hasError = false;

    getClasses() {
        return `aspect-square size-full ${this.className}`.trim();
    }

    handleError() {
        this.hasError = true;
    }
}

@Component({
    selector: 'app-avatar-fallback',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="getClasses()">
      <ng-content></ng-content>
    </div>
  `
})
export class AvatarFallbackComponent {
    @Input() className = '';
    getClasses() {
        return `bg-muted flex size-full items-center justify-center rounded-full ${this.className}`.trim();
    }
}

export const AvatarModule = [AvatarComponent, AvatarImageComponent, AvatarFallbackComponent];
