import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-toggle-group',
    standalone: true,
    imports: [CommonModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ToggleGroupComponent),
            multi: true
        }
    ],
    template: `
    <div [class]="getClasses()" role="group">
      <ng-content></ng-content>
    </div>
  `
})
export class ToggleGroupComponent implements ControlValueAccessor {
    @Input() variant: 'default' | 'outline' = 'default';
    @Input() size: 'default' | 'sm' | 'lg' = 'default';
    @Input() type: 'single' | 'multiple' = 'single';
    @Input() className = '';
    @Input() disabled = false;

    @Input() value: any = null;
    @Output() valueChange = new EventEmitter<any>();

    private onChange: (value: any) => void = () => { };
    private onTouched: () => void = () => { };

    getClasses() {
        const base = "flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs group/toggle-group";
        return `${base} ${this.className}`.trim();
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

    toggleValue(val: any) {
        if (this.disabled) return;

        if (this.type === 'single') {
            this.value = this.value === val ? null : val;
        } else {
            let currentArr = Array.isArray(this.value) ? this.value : [];
            if (currentArr.includes(val)) {
                this.value = currentArr.filter(v => v !== val);
            } else {
                this.value = [...currentArr, val];
            }
        }

        this.valueChange.emit(this.value);
        this.onChange(this.value);
        this.onTouched();
    }

    isToggled(val: any): boolean {
        if (this.type === 'single') {
            return this.value === val;
        }
        return Array.isArray(this.value) && this.value.includes(val);
    }
}

@Component({
    selector: 'app-toggle-group-item',
    standalone: true,
    imports: [CommonModule],
    template: `
    <button
      type="button"
      [class]="getClasses()"
      [attr.data-state]="pressed ? 'on' : 'off'"
      [disabled]="isDisabled"
      [attr.aria-pressed]="pressed"
      (click)="onClick()"
    >
      <ng-content></ng-content>
    </button>
  `
})
export class ToggleGroupItemComponent {
    @Input() value: any;
    @Input() className = '';
    @Input() disabled = false;

    constructor(private group: ToggleGroupComponent) { }

    get pressed(): boolean {
        return this.group.isToggled(this.value);
    }

    get isDisabled(): boolean {
        return this.disabled || this.group.disabled;
    }

    getClasses() {
        const base = "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l";
        const variantClass = this.group.variant === 'outline' ? "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground" : "bg-transparent";

        let sizeClass = "h-9 px-2 min-w-9";
        if (this.group.size === 'sm') sizeClass = "h-8 px-1.5 min-w-8";
        if (this.group.size === 'lg') sizeClass = "h-10 px-2.5 min-w-10";

        return `${base} ${variantClass} ${sizeClass} ${this.className}`.trim();
    }

    onClick() {
        this.group.toggleValue(this.value);
    }
}

export const ToggleGroupModule = [ToggleGroupComponent, ToggleGroupItemComponent];
