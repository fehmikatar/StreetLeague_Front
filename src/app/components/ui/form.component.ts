import { Component, Input, Optional, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgControl } from '@angular/forms';
import { LabelComponent } from './label.component';

@Component({
    selector: 'app-form-item',
    standalone: true,
    imports: [CommonModule],
    template: `<div class="grid gap-2 {{className}}"><ng-content></ng-content></div>`
})
export class FormItemComponent {
    @Input() className = '';
}

@Component({
    selector: 'app-form-label',
    standalone: true,
    imports: [CommonModule, LabelComponent],
    template: `
    <app-label [for]="htmlFor" [className]="_getClasses()">
      <ng-content></ng-content>
    </app-label>
  `
})
export class FormLabelComponent {
    @Input() className = '';
    @Input() htmlFor = '';
    @Input() error = false;

    _getClasses() {
        return `${this.error ? 'text-destructive' : ''} ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-form-control',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [attr.aria-describedby]="describedBy" [attr.aria-invalid]="error ? 'true' : null">
      <ng-content></ng-content>
    </div>
  `
})
export class FormControlComponent {
    @Input() error = false;
    @Input() describedBy = '';
}

@Component({
    selector: 'app-form-description',
    standalone: true,
    imports: [CommonModule],
    template: `<p class="text-sm text-muted-foreground {{className}}" [id]="id"><ng-content></ng-content></p>`
})
export class FormDescriptionComponent {
    @Input() className = '';
    @Input() id = '';
}

@Component({
    selector: 'app-form-message',
    standalone: true,
    imports: [CommonModule],
    template: `
    <p *ngIf="error" class="text-sm font-medium text-destructive {{className}}" [id]="id">
      {{ errorMessage }}
      <ng-content></ng-content>
    </p>
  `
})
export class FormMessageComponent {
    @Input() className = '';
    @Input() error = false;
    @Input() id = '';
    @Input() errorMessage = '';
}

export const FormModule = [
    FormItemComponent,
    FormLabelComponent,
    FormControlComponent,
    FormDescriptionComponent,
    FormMessageComponent
];
