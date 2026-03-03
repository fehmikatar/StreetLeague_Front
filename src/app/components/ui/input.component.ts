import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-input',
    standalone: true,
    imports: [CommonModule],
    template: `
    <input
      [type]="type"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [class]="getClasses()"
      [value]="value"
      (input)="onInput($event)"
      (blur)="onTouched()"
    />
  `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputComponent),
            multi: true
        }
    ]
})
export class InputComponent implements ControlValueAccessor {
    @Input() type = 'text';
    @Input() placeholder = '';
    @Input() className = '';
    @Input() disabled = false;

    value: string = '';

    onChange: any = () => { };
    onTouched: any = () => { };

    getClasses(): string {
        const baseClasses = "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";
        return `${baseClasses} ${this.className}`.trim();
    }

    onInput(event: Event) {
        const target = event.target as HTMLInputElement;
        this.value = target.value;
        this.onChange(this.value);
    }

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
}
