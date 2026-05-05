import { Component, Input, Output, EventEmitter, ViewChild, TemplateRef, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { LucideAngularModule, Check, ChevronRight, Circle } from 'lucide-angular';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-menubar',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="getClasses()">
      <ng-content></ng-content>
    </div>
  `
})
export class MenubarComponent {
    @Input() className = '';
    getClasses() {
        return `bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-menubar-menu',
    standalone: true,
    imports: [CommonModule, OverlayModule],
    template: `
    <div 
      cdkOverlayOrigin 
      #trigger="cdkOverlayOrigin" 
      (click)="isOpen = !isOpen"
    >
      <ng-content select="[menubar-trigger]"></ng-content>
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="isOpen"
      (backdropClick)="isOpen = false"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      [cdkConnectedOverlayOffsetY]="8"
    >
      <div 
        [@menuAnimation]
        class="bg-popover text-popover-foreground z-50 min-w-[12rem] overflow-hidden rounded-md border p-1 shadow-md"
        [class]="contentClass"
      >
        <ng-content select="[menubar-content]"></ng-content>
      </div>
    </ng-template>
  `,
    animations: [
        trigger('menuAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.95)', transformOrigin: 'top' }),
                animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
            ]),
            transition(':leave', [
                animate('75ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
            ])
        ])
    ]
})
export class MenubarMenuComponent {
    @Input() contentClass = '';
    isOpen = false;
}

@Component({
    selector: 'app-menubar-trigger',
    standalone: true,
    imports: [CommonModule],
    template: `
    <button [class]="getClasses()">
      <ng-content></ng-content>
    </button>
  `
})
export class MenubarTriggerComponent {
    @Input() className = '';
    getClasses() {
        return `focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none outline-none ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-menubar-item',
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
export class MenubarItemComponent {
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
    selector: 'app-menubar-label',
    standalone: true,
    imports: [CommonModule],
    template: `<div [class]="getClasses()"><ng-content></ng-content></div>`
})
export class MenubarLabelComponent {
    @Input() inset = false;
    @Input() className = '';
    getClasses() { return `px-2 py-1.5 text-sm font-medium text-foreground ${this.inset ? 'pl-8' : ''} ${this.className}`.trim(); }
}

@Component({
    selector: 'app-menubar-separator',
    standalone: true,
    imports: [CommonModule],
    template: `<div class="bg-border -mx-1 my-1 h-px {{className}}"></div>`
})
export class MenubarSeparatorComponent {
    @Input() className = '';
}

@Component({
    selector: 'app-menubar-shortcut',
    standalone: true,
    imports: [CommonModule],
    template: `<span class="text-muted-foreground ml-auto text-xs tracking-widest {{className}}"><ng-content></ng-content></span>`
})
export class MenubarShortcutComponent {
    @Input() className = '';
}

export const MenubarModule = [
    MenubarComponent,
    MenubarMenuComponent,
    MenubarTriggerComponent,
    MenubarItemComponent,
    MenubarLabelComponent,
    MenubarSeparatorComponent,
    MenubarShortcutComponent
];
