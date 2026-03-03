import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-popover',
    standalone: true,
    imports: [CommonModule, OverlayModule],
    template: `
    <div 
      cdkOverlayOrigin 
      #trigger="cdkOverlayOrigin" 
      (click)="toggle()"
    >
      <ng-content select="[popover-trigger]"></ng-content>
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="isOpen"
      [cdkConnectedOverlayPositions]="positions"
      (backdropClick)="isOpen = false"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
    >
      <div 
        [@popoverAnimation]
        class="bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md outline-hidden mt-1"
        [class]="contentClass"
      >
        <ng-content select="[popover-content]"></ng-content>
      </div>
    </ng-template>
  `,
    animations: [
        trigger('popoverAnimation', [
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
export class PopoverComponent {
    @Input() contentClass = '';
    @Input() align: 'start' | 'center' | 'end' = 'center';

    isOpen = false;

    positions = [
        {
            originX: this.align as any,
            originY: 'bottom' as any,
            overlayX: this.align as any,
            overlayY: 'top' as any,
            offsetY: 4
        },
        {
            originX: this.align as any,
            originY: 'top' as any,
            overlayX: this.align as any,
            overlayY: 'bottom' as any,
            offsetY: -4
        }
    ];

    toggle() {
        this.isOpen = !this.isOpen;
    }
}
