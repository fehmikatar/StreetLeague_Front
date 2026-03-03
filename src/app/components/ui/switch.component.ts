import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-switch',
    standalone: true,
    imports: [CommonModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SwitchComponent),
            multi: true
        }
    ],
    template: `
    <button
      type="button"
      role="switch"
      [attr.aria-checked]="checked"
      [disabled]="disabled"
      [class]="getClasses()"
      (click)="toggle()"
      (blur)="onTouched()"
      data-slot="switch"
    >
      <span
        data-slot="switch-thumb"
        [class]="getThumbClasses()"
      ></span>
    </button>
  `
})
export class SwitchComponent implements ControlValueAccessor {
    @Input() checked = false;
    @Input() disabled = false;
    @Input() className = '';
    @Output() checkedChange = new EventEmitter<boolean>();

    onChange: any = () => { };
    onTouched: any = () => { };

    getClasses() {
        const baseClasses = "peer focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50";
        const stateClass = this.checked
            ? "bg-primary"
            : "bg-switch-background dark:bg-input/80";

        return `${baseClasses} ${stateClass} ${this.className}`.trim();
    }

    getThumbClasses() {
        const baseClasses = "bg-card pointer-events-none block size-4 rounded-full ring-0 transition-transform";
        const stateClass = this.checked
            ? "dark:bg-primary-foreground translate-x-[calc(100%-2px)]"
            : "dark:bg-card-foreground translate-x-0";

        return `${baseClasses} ${stateClass}`.trim();
    }

    toggle() {
        if (!this.disabled) {
            this.checked = !this.checked;
            this.checkedChange.emit(this.checked);
            this.onChange(this.checked);
        }
    }

    writeValue(value: any): void {
        if (value !== undefined) {
            this.checked = !!value;
        }
    }

    registerOnChange(fn: any): void { this.onChange = fn; }
    registerOnTouched(fn: any): void { this.onTouched = fn; }
    setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
}
