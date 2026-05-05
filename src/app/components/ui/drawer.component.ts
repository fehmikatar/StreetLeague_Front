import { Component, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { animate, style, transition, trigger } from '@angular/animations';

export type DrawerDirection = 'top' | 'bottom' | 'left' | 'right';

@Component({
    selector: 'app-drawer',
    standalone: true,
    imports: [CommonModule],
    template: `
    <ng-template #drawerTemplate>
      <div 
        class="group/drawer-content bg-background fixed z-100 flex h-auto flex-col"
        [ngClass]="getDirectionClasses()"
        [class]="contentClass"
        [@drawerAnimation]="direction"
      >
        <div *ngIf="direction === 'bottom'" class="bg-muted mx-auto mt-4 h-2 w-[100px] shrink-0 rounded-full"></div>
        <ng-content select="[drawer-header]"></ng-content>
        <ng-content></ng-content>
        <ng-content select="[drawer-footer]"></ng-content>
      </div>
    </ng-template>

    <div (click)="open()">
      <ng-content select="[drawer-trigger]"></ng-content>
    </div>
  `,
    animations: [
        trigger('drawerAnimation', [
            transition(':enter', [
                style({ transform: 'translateY(100%)' }),
                animate('300ms cubic-bezier(0.32, 0.72, 0, 1)', style({ transform: 'translateY(0)' }))
            ]),
            transition(':leave', [
                animate('300ms cubic-bezier(0.32, 0.72, 0, 1)', style({ transform: 'translateY(100%)' }))
            ])
        ])
    ]
})
export class DrawerComponent {
    @ViewChild('drawerTemplate') drawerTemplate!: TemplateRef<any>;

    @Input() direction: DrawerDirection = 'bottom';
    @Input() contentClass = '';
    @Output() opened = new EventEmitter<void>();
    @Output() closed = new EventEmitter<void>();

    private dialogRef: DialogRef | null = null;

    constructor(public dialog: Dialog) { }

    open() {
        this.dialogRef = this.dialog.open(this.drawerTemplate, {
            panelClass: ['fixed', 'inset-0', 'z-50', 'bg-black/50']
        });

        this.opened.emit();

        this.dialogRef.closed.subscribe(() => {
            this.closed.emit();
        });
    }

    close() {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }

    getDirectionClasses() {
        switch (this.direction) {
            case 'top': return "inset-x-0 top-0 mb-24 max-h-[80vh] rounded-b-lg border-b";
            case 'right': return "inset-y-0 right-0 w-3/4 border-l sm:max-w-sm";
            case 'left': return "inset-y-0 left-0 w-3/4 border-r sm:max-w-sm";
            default: return "inset-x-0 bottom-0 mt-24 max-h-[80vh] rounded-t-lg border-t"; // bottom
        }
    }
}

@Component({
    selector: 'app-drawer-header',
    standalone: true,
    template: `<div class="flex flex-col gap-1.5 p-4 {{className}}"><ng-content></ng-content></div>`
})
export class DrawerHeaderComponent { @Input() className = ''; }

@Component({
    selector: 'app-drawer-title',
    standalone: true,
    template: `<h2 class="text-foreground font-semibold {{className}}"><ng-content></ng-content></h2>`
})
export class DrawerTitleComponent { @Input() className = ''; }

@Component({
    selector: 'app-drawer-description',
    standalone: true,
    template: `<p class="text-muted-foreground text-sm {{className}}"><ng-content></ng-content></p>`
})
export class DrawerDescriptionComponent { @Input() className = ''; }

@Component({
    selector: 'app-drawer-footer',
    standalone: true,
    template: `<div class="mt-auto flex flex-col gap-2 p-4 {{className}}"><ng-content></ng-content></div>`
})
export class DrawerFooterComponent { @Input() className = ''; }

export const DrawerModule = [
    DrawerComponent,
    DrawerHeaderComponent,
    DrawerTitleComponent,
    DrawerDescriptionComponent,
    DrawerFooterComponent
];
