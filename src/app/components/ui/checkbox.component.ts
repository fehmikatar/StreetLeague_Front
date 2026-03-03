import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, Check } from 'lucide-angular';

@Component({
    selector: 'app-checkbox',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <button
      type="button"
      role="checkbox"
      [attr.aria-checked]="checked"
      [disabled]="disabled"
      [class]="getClasses()"
      (click)="toggle()"
      (blur)="onTouched()"
    >
      <span *ngIf="checked" class="flex items-center justify-center text-current transition-none">
        <lucide-icon [img]="CheckIcon" class="size-3.5"></lucide-icon>
      </span>
    </button>
  `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CheckboxComponent),
            multi: true
        }
    ]
})
export class CheckboxComponent implements ControlValueAccessor {
    @Input() className = '';
    @Input() disabled = false;

    checked = false;
    readonly CheckIcon = Check;

    onChange: any = () => { };
    onTouched: any = () => { };

    getClasses() {
        const baseClasses = "peer border bg-input-background dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50";
        const checkedClasses = this.checked ? "bg-primary text-primary-foreground dark:bg-primary border-primary" : "";
        return `${baseClasses} ${checkedClasses} ${this.className}`.trim();
    }

    toggle() {
        if (!this.disabled) {
            this.checked = !this.checked;
            this.onChange(this.checked);
        }
    }

    writeValue(value: any): void {
        this.checked = !!value;
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
}
