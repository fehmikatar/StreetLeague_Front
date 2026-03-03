import { Component, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
    selector: 'app-slider',
    standalone: true,
    imports: [CommonModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SliderComponent),
            multi: true
        }
    ],
    template: `
    <div
      #sliderTrack
      [class]="getClasses()"
      (mousedown)="onMouseDown($event)"
      (touchstart)="onTouchStart($event)"
      data-slot="slider"
      [attr.data-disabled]="disabled ? '' : null"
    >
      <span class="bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5" data-slot="slider-track" [attr.data-orientation]="orientation">
        <span 
          class="bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full" 
          data-slot="slider-range" 
          [attr.data-orientation]="orientation"
          [style.left.%]="0" 
          [style.width.%]="getPercent()"
          *ngIf="orientation === 'horizontal'"
        ></span>
        <span 
          class="bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full" 
          data-slot="slider-range" 
          [attr.data-orientation]="orientation"
          [style.bottom.%]="0" 
          [style.height.%]="getPercent()"
          *ngIf="orientation === 'vertical'"
        ></span>
      </span>
      
      <span
        class="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 absolute"
        data-slot="slider-thumb"
        [style.left.%]="orientation === 'horizontal' ? getPercent() : null"
        [style.bottom.%]="orientation === 'vertical' ? getPercent() : null"
        [style.transform]="orientation === 'horizontal' ? 'translate(-50%, 0)' : 'translate(0, 50%)'"
        role="slider"
        [attr.aria-valuemin]="min"
        [attr.aria-valuemax]="max"
        [attr.aria-valuenow]="value"
      ></span>
    </div>
  `
})
export class SliderComponent implements ControlValueAccessor, AfterViewInit {
    @ViewChild('sliderTrack') sliderTrack!: ElementRef;

    @Input() className = '';
    @Input() min = 0;
    @Input() max = 100;
    @Input() step = 1;
    @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
    @Input() disabled = false;

    value = 0;

    private isDragging = false;

    onChange: any = () => { };
    onTouched: any = () => { };

    ngAfterViewInit() {
        // Add global event listeners for drag
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.onTouchEnd.bind(this));
    }

    ngOnDestroy() {
        document.removeEventListener('mousemove', this.onMouseMove.bind(this));
        document.removeEventListener('mouseup', this.onMouseUp.bind(this));
        document.removeEventListener('touchmove', this.onTouchMove.bind(this));
        document.removeEventListener('touchend', this.onTouchEnd.bind(this));
    }

    getClasses() {
        return `relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col ${this.className}`.trim();
    }

    getPercent() {
        return ((this.value - this.min) / (this.max - this.min)) * 100;
    }

    private updateValueFromEvent(clientX: number, clientY: number) {
        if (this.disabled) return;

        const rect = this.sliderTrack.nativeElement.getBoundingClientRect();
        let percentage = 0;

        if (this.orientation === 'horizontal') {
            percentage = (clientX - rect.left) / rect.width;
        } else {
            percentage = 1 - ((clientY - rect.top) / rect.height);
        }

        percentage = Math.max(0, Math.min(1, percentage));

        let newValue = percentage * (this.max - this.min) + this.min;

        // Snap to step
        if (this.step > 0) {
            newValue = Math.round(newValue / this.step) * this.step;
        }

        newValue = Math.max(this.min, Math.min(this.max, newValue));

        if (this.value !== newValue) {
            this.value = newValue;
            this.onChange(this.value);
        }
    }

    onMouseDown(event: MouseEvent) {
        if (this.disabled) return;
        this.isDragging = true;
        this.updateValueFromEvent(event.clientX, event.clientY);
    }

    onMouseMove(event: MouseEvent) {
        if (!this.isDragging || this.disabled) return;
        this.updateValueFromEvent(event.clientX, event.clientY);
    }

    onMouseUp() {
        this.isDragging = false;
    }

    onTouchStart(event: TouchEvent) {
        if (this.disabled) return;
        event.preventDefault(); // Prevent scrolling while touching slider
        this.isDragging = true;
        this.updateValueFromEvent(event.touches[0].clientX, event.touches[0].clientY);
    }

    onTouchMove(event: TouchEvent) {
        if (!this.isDragging || this.disabled) return;
        event.preventDefault(); // Prevent scrolling while dragging slider
        this.updateValueFromEvent(event.touches[0].clientX, event.touches[0].clientY);
    }

    onTouchEnd() {
        this.isDragging = false;
    }

    writeValue(val: number): void {
        if (val !== undefined && val !== null) {
            this.value = Math.max(this.min, Math.min(this.max, val));
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
