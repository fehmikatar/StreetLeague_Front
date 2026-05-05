import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-tooltip',
    standalone: true,
    imports: [CommonModule, OverlayModule],
    template: `
    <div 
      cdkOverlayOrigin 
      #trigger="cdkOverlayOrigin" 
      (mouseenter)="onMouseEnter()" 
      (mouseleave)="onMouseLeave()"
      (focus)="onMouseEnter()"
      (blur)="onMouseLeave()"
      tabindex="0"
    >
      <ng-content select="[tooltip-trigger]"></ng-content>
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="isOpen"
      [cdkConnectedOverlayPositions]="positions"
    >
      <div 
        [@tooltipAnimation]
        class="bg-primary text-primary-foreground z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance mt-2 mb-2 relative"
        [class]="contentClass"
      >
        <ng-content select="[tooltip-content]"></ng-content>
        <div class="bg-primary absolute size-2.5 rotate-45 rounded-[2px]" [ngClass]="getArrowClasses()"></div>
      </div>
    </ng-template>
  `,
    animations: [
        trigger('tooltipAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.95)' }),
                animate('150ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'scale(1)' }))
            ]),
            transition(':leave', [
                animate('100ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
            ])
        ])
    ]
})
export class TooltipComponent {
    @Input() contentClass = '';
    @Input() align: 'start' | 'center' | 'end' = 'center';
    @Input() side: 'top' | 'bottom' | 'left' | 'right' = 'top';
    @Input() delayDuration = 200;

    isOpen = false;
    private timeoutId: any;

    positions = this.getPositions();

    onMouseEnter() {
        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => {
            this.isOpen = true;
        }, this.delayDuration);
    }

    onMouseLeave() {
        clearTimeout(this.timeoutId);
        this.isOpen = false;
    }

    getArrowClasses() {
        switch (this.side) {
            case 'bottom': return "top-0 -translate-y-1/2 left-1/2 -translate-x-1/2";
            case 'top': return "bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2";
            case 'left': return "right-0 translate-x-1/2 top-1/2 -translate-y-1/2";
            case 'right': return "left-0 -translate-x-1/2 top-1/2 -translate-y-1/2";
        }
    }

    getPositions() {
        switch (this.side) {
            case 'top':
                return [{ originX: this.align as any, originY: 'top' as any, overlayX: this.align as any, overlayY: 'bottom' as any, offsetY: -4 }];
            case 'bottom':
            default:
                return [{ originX: this.align as any, originY: 'bottom' as any, overlayX: this.align as any, overlayY: 'top' as any, offsetY: 4 }];
        }
    }
}
