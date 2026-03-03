import { Component, Input, Output, EventEmitter, forwardRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, Circle } from 'lucide-angular';

@Component({
    selector: 'app-radio-group',
    standalone: true,
    imports: [CommonModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RadioGroupComponent),
            multi: true
        }
    ],
    template: `
    <div class="grid gap-3 {{className}}" role="radiogroup">
      <ng-content></ng-content>
    </div>
  `
})
export class RadioGroupComponent implements ControlValueAccessor {
    @Input() className = '';
    @Input() value: any = null;
    @Output() valueChange = new EventEmitter<any>();

    private onChange: (value: any) => void = () => { };
    private onTouched: () => void = () => { };

    disabled = false;

    writeValue(value: any): void {
        if (value !== undefined) {
            this.value = value;
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    selectChoice(value: any) {
        if (this.disabled) return;
        this.value = value;
        this.valueChange.emit(this.value);
        this.onChange(this.value);
        this.onTouched();
    }
}

@Component({
    selector: 'app-radio-group-item',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <button
      type="button"
      role="radio"
      [attr.aria-checked]="checked"
      [attr.data-state]="checked ? 'checked' : 'unchecked'"
      [disabled]="disabled || group.disabled"
      [class]="getClasses()"
      (click)="onClick()"
    >
      <span *ngIf="checked" class="relative flex items-center justify-center">
        <lucide-icon [img]="CircleIcon" class="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2"></lucide-icon>
      </span>
    </button>
  `
})
export class RadioGroupItemComponent {
    @Input() value: any;
    @Input() disabled = false;
    @Input() className = '';

    readonly CircleIcon = Circle;

    constructor(public group: RadioGroupComponent) { }

    get checked() {
        return this.group.value === this.value;
    }

    getClasses() {
        const base = "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center";
        return `${base} ${this.className}`.trim();
    }

    onClick() {
        this.group.selectChoice(this.value);
    }
}

export const RadioGroupModule = [RadioGroupComponent, RadioGroupItemComponent];
