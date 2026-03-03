import { Component, Input, Output, EventEmitter, forwardRef, HostListener, Inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, Minus } from 'lucide-angular';

@Component({
    selector: 'app-input-otp',
    standalone: true,
    imports: [CommonModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputOtpComponent),
            multi: true
        }
    ],
    template: `
    <div class="relative flex items-center gap-2 has-disabled:opacity-50" [class]="containerClassName">
      <input
        #hiddenInput
        type="text"
        [maxLength]="maxLength"
        [value]="value"
        [disabled]="disabled"
        (input)="onInput($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[transparent] bg-transparent"
        style="z-index: 10;"
      />
      <ng-content></ng-content>
    </div>
  `
})
export class InputOtpComponent implements ControlValueAccessor {
    @Input() maxLength = 6;
    @Input() containerClassName = '';
    @Input() disabled = false;

    @ViewChild('hiddenInput') hiddenInput!: ElementRef<HTMLInputElement>;

    value = '';
    isActive = false;

    private onChange: any = () => { };
    private onTouched: any = () => { };

    onInput(event: Event) {
        const target = event.target as HTMLInputElement;
        const cleanValue = target.value.replace(/[^0-9]/g, '').slice(0, this.maxLength);
        this.value = cleanValue;
        target.value = cleanValue;
        this.onChange(this.value);
    }

    onFocus() {
        this.isActive = true;
    }

    onBlur() {
        this.isActive = false;
        this.onTouched();
    }

    writeValue(value: any): void {
        if (value !== undefined && value !== null) {
            this.value = String(value);
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

    focus() {
        if (this.hiddenInput) {
            this.hiddenInput.nativeElement.focus();
        }
    }
}

@Component({
    selector: 'app-input-otp-group',
    standalone: true,
    imports: [CommonModule],
    template: `<div class="flex items-center gap-1 {{className}}"><ng-content></ng-content></div>`
})
export class InputOtpGroupComponent {
    @Input() className = '';
}

@Component({
    selector: 'app-input-otp-slot',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div
      [class]="getClasses()"
      [attr.data-active]="isActive"
    >
      {{ char }}
      <div *ngIf="hasFakeCaret" class="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div class="animate-caret-blink bg-foreground h-4 w-px duration-1000"></div>
      </div>
    </div>
  `
})
export class InputOtpSlotComponent {
    @Input() index!: number;
    @Input() className = '';

    constructor(@Inject(forwardRef(() => InputOtpComponent)) public otpContext: InputOtpComponent) { }

    get char() {
        return this.otpContext.value[this.index] || '';
    }

    get isActive() {
        if (!this.otpContext.isActive) return false;
        const valueLen = this.otpContext.value.length;
        // Active slot is the first empty slot, or the last slot if full
        if (this.index === valueLen && valueLen < this.otpContext.maxLength) return true;
        if (valueLen === this.otpContext.maxLength && this.index === this.otpContext.maxLength - 1) return true;
        return false;
    }

    get hasFakeCaret() {
        return this.isActive && !this.char; // only blink caret if empty
    }

    getClasses() {
        const base = "relative flex h-9 w-9 items-center justify-center border-y border-r text-sm bg-input-background transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px] border-input dark:bg-input/30 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40";
        return `${base} ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-input-otp-separator',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <div role="separator" class="{{className}}">
      <lucide-icon [img]="MinusIcon" class="w-4 h-4 text-muted-foreground"></lucide-icon>
    </div>
  `
})
export class InputOtpSeparatorComponent {
    @Input() className = '';
    readonly MinusIcon = Minus;
}

export const InputOtpModule = [
    InputOtpComponent,
    InputOtpGroupComponent,
    InputOtpSlotComponent,
    InputOtpSeparatorComponent
];
