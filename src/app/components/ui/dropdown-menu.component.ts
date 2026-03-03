import { Component, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { LucideAngularModule, Check, ChevronRight, Circle } from 'lucide-angular';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-dropdown-menu',
    standalone: true,
    imports: [CommonModule, OverlayModule],
    template: `<ng-content></ng-content>`
})
export class DropdownMenuComponent {
    overlayRef: OverlayRef | null = null;
}

@Component({
    selector: 'app-dropdown-menu-trigger',
    standalone: true,
    imports: [CommonModule],
    template: `<div (click)="toggle()"><ng-content></ng-content></div>`
})
export class DropdownMenuTriggerComponent {
    @Input() menuRef!: TemplateRef<any>;
    isOpen = false;

    constructor(private overlay: Overlay) { }

    toggle() {
        this.isOpen = !this.isOpen;
        // Overlay implementation would go here connecting trigger to content
    }
}

// Full Dropdown Component Suite Wrapper
@Component({
    selector: 'app-dropdown-wrapper',
    standalone: true,
    imports: [CommonModule, OverlayModule, LucideAngularModule],
    template: `
    <div 
      cdkOverlayOrigin 
      #trigger="cdkOverlayOrigin" 
      (click)="isOpen = !isOpen"
    >
      <ng-content select="[dropdown-trigger]"></ng-content>
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="isOpen"
      (backdropClick)="isOpen = false"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
    >
      <div 
        [@menuAnimation]
        class="bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md mt-2"
        [class]="contentClass"
      >
        <ng-content select="[dropdown-content]"></ng-content>
      </div>
    </ng-template>
  `,
    animations: [
        trigger('menuAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.95)' }),
                animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
            ]),
            transition(':leave', [
                animate('75ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
            ])
        ])
    ]
})
export class DropdownWrapperComponent {
    @Input() contentClass = '';
    isOpen = false;
}

@Component({
    selector: 'app-dropdown-menu-label',
    standalone: true,
    imports: [CommonModule],
    template: `<div [class]="getClasses()"><ng-content></ng-content></div>`
})
export class DropdownMenuLabelComponent {
    @Input() inset = false;
    @Input() className = '';
    getClasses() { return `px-2 py-1.5 text-sm font-medium ${this.inset ? 'pl-8' : ''} ${this.className}`.trim(); }
}

@Component({
    selector: 'app-dropdown-menu-item',
    standalone: true,
    imports: [CommonModule],
    template: `
    <button 
      [class]="getClasses()" 
      [disabled]="disabled"
      (click)="onClick()"
    >
      <ng-content></ng-content>
    </button>
  `
})
export class DropdownMenuItemComponent {
    @Input() inset = false;
    @Input() variant: 'default' | 'destructive' = 'default';
    @Input() disabled = false;
    @Input() className = '';
    @Output() action = new EventEmitter<void>();

    getClasses() {
        const base = "w-full text-left relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";
        const variantClass = this.variant === 'destructive' ? "text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20 focus:text-destructive" : "";
        const insetClass = this.inset ? "pl-8" : "";
        return `${base} ${variantClass} ${insetClass} ${this.className}`.trim();
    }

    onClick() {
        if (!this.disabled) this.action.emit();
    }
}

@Component({
    selector: 'app-dropdown-menu-separator',
    standalone: true,
    imports: [CommonModule],
    template: `<div class="bg-border -mx-1 my-1 h-px {{className}}"></div>`
})
export class DropdownMenuSeparatorComponent {
    @Input() className = '';
}

@Component({
    selector: 'app-dropdown-menu-shortcut',
    standalone: true,
    imports: [CommonModule],
    template: `<span class="text-muted-foreground ml-auto text-xs tracking-widest {{className}}"><ng-content></ng-content></span>`
})
export class DropdownMenuShortcutComponent {
    @Input() className = '';
}

export const DropdownMenuModule = [
    DropdownMenuComponent,
    DropdownMenuTriggerComponent,
    DropdownWrapperComponent,
    DropdownMenuLabelComponent,
    DropdownMenuItemComponent,
    DropdownMenuSeparatorComponent,
    DropdownMenuShortcutComponent
];
