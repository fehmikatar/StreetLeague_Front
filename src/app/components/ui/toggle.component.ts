import { Component, Input, Output, EventEmitter, forwardRef, HostBinding, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-toggle',
    standalone: true,
    imports: [CommonModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ToggleComponent),
            multi: true
        }
    ],
    template: `
    <button
      type="button"
      [class]="getClasses()"
      [attr.data-state]="pressed ? 'on' : 'off'"
      [disabled]="disabled"
      [attr.aria-pressed]="pressed"
      (click)="toggle()"
    >
      <ng-content></ng-content>
    </button>
  `
})
export class ToggleComponent implements ControlValueAccessor {
    @Input() variant: 'default' | 'outline' = 'default';
    @Input() size: 'default' | 'sm' | 'lg' = 'default';
    @Input() className = '';
    @Input() disabled = false;

    @Input() pressed = false;
    @Output() pressedChange = new EventEmitter<boolean>();

    private onChange: (value: boolean) => void = () => { };
    private onTouched: () => void = () => { };

    getClasses() {
        const base = "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap";
        const variantClass = this.variant === 'outline' ? "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground" : "bg-transparent";

        let sizeClass = "h-9 px-2 min-w-9";
        if (this.size === 'sm') sizeClass = "h-8 px-1.5 min-w-8";
        if (this.size === 'lg') sizeClass = "h-10 px-2.5 min-w-10";

        return `${base} ${variantClass} ${sizeClass} ${this.className}`.trim();
    }

    toggle() {
        if (this.disabled) return;
        this.pressed = !this.pressed;
        this.pressedChange.emit(this.pressed);
        this.onChange(this.pressed);
        this.onTouched();
    }

    writeValue(value: any): void {
        if (value !== undefined) {
            this.pressed = !!value;
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
