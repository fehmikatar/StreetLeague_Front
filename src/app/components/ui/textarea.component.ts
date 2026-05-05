import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
    selector: 'app-textarea',
    standalone: true,
    imports: [CommonModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextareaComponent),
            multi: true
        }
    ],
    template: `
    <textarea
      [value]="value"
      [disabled]="disabled"
      [placeholder]="placeholder"
      [class]="getClasses()"
      [attr.rows]="rows"
      [attr.id]="id"
      (input)="onInput($event)"
      (blur)="onTouched()"
      data-slot="textarea"
    ></textarea>
  `
})
export class TextareaComponent implements ControlValueAccessor {
    @Input() className = '';
    @Input() placeholder = '';
    @Input() disabled = false;
    @Input() rows = 3;
    @Input() id = '';

    value = '';

    onChange: any = () => { };
    onTouched: any = () => { };

    getClasses() {
        return `resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${this.className}`.trim();
    }

    onInput(event: Event) {
        const target = event.target as HTMLTextAreaElement;
        this.value = target.value;
        this.onChange(this.value);
    }

    writeValue(val: string): void {
        this.value = val || '';
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
