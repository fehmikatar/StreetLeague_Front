import { Component, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule, Overlay, OverlayRef, OverlayPositionBuilder, FlexibleConnectedPositionStrategy } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-hover-card',
    standalone: true,
    imports: [CommonModule, OverlayModule],
    template: `
    <div 
      cdkOverlayOrigin 
      #trigger="cdkOverlayOrigin" 
      (mouseenter)="onMouseEnter()" 
      (mouseleave)="onMouseLeave()"
    >
      <ng-content select="[hover-card-trigger]"></ng-content>
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="isOpen"
      [cdkConnectedOverlayPositions]="positions"
      (overlayOutsideClick)="isOpen = false"
    >
      <div 
        (mouseenter)="onMouseEnter()" 
        (mouseleave)="onMouseLeave()"
        [@fadeAnimation]
        class="bg-popover text-popover-foreground z-50 w-64 rounded-md border p-4 shadow-md outline-hidden mt-1"
        [class]="contentClass"
      >
        <ng-content select="[hover-card-content]"></ng-content>
      </div>
    </ng-template>
  `,
    animations: [
        trigger('fadeAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(-5px) scale(0.95)' }),
                animate('150ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
            ]),
            transition(':leave', [
                animate('100ms ease-in', style({ opacity: 0, transform: 'translateY(-5px) scale(0.95)' }))
            ])
        ])
    ]
})
export class HoverCardComponent {
    @Input() contentClass = '';
    @Input() align: 'start' | 'center' | 'end' = 'center';

    isOpen = false;
    private timeoutId: any;

    positions = [
        {
            originX: this.align as any,
            originY: 'bottom' as any,
            overlayX: this.align as any,
            overlayY: 'top' as any,
            offsetY: 4
        }
    ];

    onMouseEnter() {
        clearTimeout(this.timeoutId);
        this.isOpen = true;
    }

    onMouseLeave() {
        this.timeoutId = setTimeout(() => {
            this.isOpen = false;
        }, 300);
    }
}
