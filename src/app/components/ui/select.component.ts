import { Component, Input, Output, EventEmitter, ViewChild, TemplateRef, forwardRef, ContentChild, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, ChevronDown, Check, ChevronUp } from 'lucide-angular';

@Component({
    selector: 'app-select',
    standalone: true,
    imports: [CommonModule, OverlayModule, LucideAngularModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectComponent),
            multi: true
        }
    ],
    template: `
    <div 
      cdkOverlayOrigin 
      #triggerNode="cdkOverlayOrigin" 
      (click)="toggle()"
      class="w-full relative"
    >
      <ng-content select="[select-trigger]"></ng-content>
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="triggerNode"
      [cdkConnectedOverlayOpen]="isOpen"
      (backdropClick)="isOpen = false"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      [cdkConnectedOverlayOffsetY]="4"
      [cdkConnectedOverlayMinWidth]="triggerNodeWidth"
    >
      <div 
        class="bg-popover text-popover-foreground z-50 overflow-x-hidden overflow-y-auto rounded-md border shadow-md relative min-w-[8rem] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        [attr.data-state]="isOpen ? 'open' : 'closed'"
        [class]="contentClass"
      >
        <div class="p-1 w-full">
          <ng-content select="[select-content]"></ng-content>
        </div>
      </div>
    </ng-template>
  `
})
export class SelectComponent implements ControlValueAccessor, AfterContentInit {
    @Input() contentClass = '';
    @Input() disabled = false;

    isOpen = false;
    value: any = null;
    triggerNodeWidth: number | string = '100%';

    private onChange: (value: any) => void = () => { };
    private onTouched: () => void = () => { };

    @ContentChildren(forwardRef(() => SelectItemComponent), { descendants: true })
    items!: QueryList<any>;

    ngAfterContentInit() {
        this.updateSelectedValue();
        this.items.changes.subscribe(() => this.updateSelectedValue());
    }

    toggle() {
        if (!this.disabled) {
            this.isOpen = !this.isOpen;
        }
    }

    selectOption(value: any) {
        this.value = value;
        this.onChange(this.value);
        this.onTouched();
        this.isOpen = false;
        this.updateSelectedValue();
    }

    updateSelectedValue() {
        if (this.items) {
            this.items.forEach(item => {
                item.selected = item.value === this.value;
            });
        }
    }

    writeValue(value: any): void {
        if (value !== undefined) {
            this.value = value;
            this.updateSelectedValue();
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

@Component({
    selector: 'app-select-trigger',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <button [class]="getClasses()" type="button" [disabled]="disabled">
      <ng-content></ng-content>
      <lucide-icon [img]="ChevronDownIcon" class="size-4 opacity-50"></lucide-icon>
    </button>
  `
})
export class SelectTriggerComponent {
    @Input() className = '';
    @Input() size: 'default' | 'sm' = 'default';
    @Input() disabled = false;
    readonly ChevronDownIcon = ChevronDown;

    getClasses() {
        const sizeClass = this.size === 'sm' ? "h-8" : "h-9";
        const base = "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50";
        return `${base} ${sizeClass} ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-select-item',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <div 
      [class]="getClasses()" 
      [attr.data-disabled]="disabled ? true : null"
      (click)="onClick()"
    >
      <span class="absolute right-2 flex size-3.5 items-center justify-center">
        <lucide-icon *ngIf="selected" [img]="CheckIcon" class="size-4"></lucide-icon>
      </span>
      <ng-content></ng-content>
    </div>
  `
})
export class SelectItemComponent {
    @Input() value: any;
    @Input() disabled = false;
    @Input() className = '';

    selected = false;
    readonly CheckIcon = Check;

    constructor(private select: SelectComponent) { }

    getClasses() {
        const base = "focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50";
        return `${base} ${this.disabled ? 'opacity-50 pointer-events-none' : 'hover:bg-accent hover:text-accent-foreground cursor-pointer'} ${this.className}`.trim();
    }

    onClick() {
        if (!this.disabled) {
            this.select.selectOption(this.value);
        }
    }
}

@Component({
    selector: 'app-select-label',
    standalone: true,
    imports: [CommonModule],
    template: `<div class="text-muted-foreground px-2 py-1.5 text-xs font-semibold {{className}}"><ng-content></ng-content></div>`
})
export class SelectLabelComponent {
    @Input() className = '';
}

@Component({
    selector: 'app-select-separator',
    standalone: true,
    imports: [CommonModule],
    template: `<div class="bg-border pointer-events-none -mx-1 my-1 h-px {{className}}"></div>`
})
export class SelectSeparatorComponent {
    @Input() className = '';
}

@Component({
    selector: 'app-select-group',
    standalone: true,
    imports: [CommonModule],
    template: `<div class="w-full {{className}}"><ng-content></ng-content></div>`
})
export class SelectGroupComponent {
    @Input() className = '';
}

export const SelectModule = [
    SelectComponent,
    SelectTriggerComponent,
    SelectItemComponent,
    SelectLabelComponent,
    SelectSeparatorComponent,
    SelectGroupComponent
];
