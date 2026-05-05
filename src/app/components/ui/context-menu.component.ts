import { Component, Input, Output, EventEmitter, ViewChild, TemplateRef, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { LucideAngularModule, Check, ChevronRight, Circle } from 'lucide-angular';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-context-menu-wrapper',
    standalone: true,
    imports: [CommonModule, OverlayModule],
    template: `
    <div (contextmenu)="onContextMenu($event)">
      <ng-content select="[context-trigger]"></ng-content>
    </div>
    
    <ng-template #menuTemplate>
      <div 
        class="bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md animate-in fade-in-0 zoom-in-95"
        [class]="contentClass"
      >
        <ng-content select="[context-content]"></ng-content>
      </div>
    </ng-template>
  `
})
export class ContextMenuWrapperComponent {
    @Input() contentClass = '';
    @ViewChild('menuTemplate') menuTemplate!: TemplateRef<any>;

    private overlayRef: OverlayRef | null = null;

    constructor(
        private overlay: Overlay,
        private viewContainerRef: ViewContainerRef
    ) { }

    onContextMenu(event: MouseEvent) {
        event.preventDefault();
        this.close();

        const positionStrategy = this.overlay.position()
            .flexibleConnectedTo({ x: event.clientX, y: event.clientY })
            .withPositions([
                { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
                { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
                { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
                { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' }
            ]);

        this.overlayRef = this.overlay.create({
            positionStrategy,
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-transparent-backdrop',
            scrollStrategy: this.overlay.scrollStrategies.close()
        });

        this.overlayRef.backdropClick().subscribe(() => this.close());

        const portal = new TemplatePortal(this.menuTemplate, this.viewContainerRef);
        this.overlayRef.attach(portal);
    }

    close() {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    }
}

@Component({
    selector: 'app-context-menu-label',
    standalone: true,
    imports: [CommonModule],
    template: `<div [class]="getClasses()"><ng-content></ng-content></div>`
})
export class ContextMenuLabelComponent {
    @Input() inset = false;
    @Input() className = '';
    getClasses() { return `px-2 py-1.5 text-sm font-medium text-foreground ${this.inset ? 'pl-8' : ''} ${this.className}`.trim(); }
}

@Component({
    selector: 'app-context-menu-item',
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
export class ContextMenuItemComponent {
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
        if (!this.disabled) {
            this.action.emit();
        }
    }
}

@Component({
    selector: 'app-context-menu-separator',
    standalone: true,
    imports: [CommonModule],
    template: `<div class="bg-border -mx-1 my-1 h-px {{className}}"></div>`
})
export class ContextMenuSeparatorComponent {
    @Input() className = '';
}

@Component({
    selector: 'app-context-menu-shortcut',
    standalone: true,
    imports: [CommonModule],
    template: `<span class="text-muted-foreground ml-auto text-xs tracking-widest {{className}}"><ng-content></ng-content></span>`
})
export class ContextMenuShortcutComponent {
    @Input() className = '';
}

export const ContextMenuModule = [
    ContextMenuWrapperComponent,
    ContextMenuLabelComponent,
    ContextMenuItemComponent,
    ContextMenuSeparatorComponent,
    ContextMenuShortcutComponent
];
