import { Component, Input, Output, EventEmitter, TemplateRef, ViewChild, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ButtonComponent } from './button.component';

@Component({
    selector: 'app-alert-dialog',
    standalone: true,
    imports: [CommonModule],
    template: `
    <ng-template #dialogTemplate>
      <div 
        class="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg {{contentClass}}"
      >
        <ng-content select="[alert-dialog-header]"></ng-content>
        <ng-content></ng-content>
        <ng-content select="[alert-dialog-footer]"></ng-content>
      </div>
    </ng-template>

    <div (click)="open()">
      <ng-content select="[alert-dialog-trigger]"></ng-content>
    </div>
  `
})
export class AlertDialogComponent {
    @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
    @Input() contentClass = '';
    @Output() opened = new EventEmitter<void>();
    @Output() closed = new EventEmitter<void>();

    private dialogRef: DialogRef | null = null;

    constructor(public dialog: Dialog) { }

    open() {
        this.dialogRef = this.dialog.open(this.dialogTemplate, {
            panelClass: ['fixed', 'inset-0', 'z-50', 'bg-black/50', 'data-[state=open]:animate-in', 'data-[state=closed]:animate-out', 'data-[state=closed]:fade-out-0', 'data-[state=open]:fade-in-0']
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
}

@Component({
    selector: 'app-alert-dialog-header',
    standalone: true,
    template: `<div [class]="getClasses()"><ng-content></ng-content></div>`
})
export class AlertDialogHeaderComponent {
    @Input() className = '';
    getClasses() { return `flex flex-col gap-2 text-center sm:text-left ${this.className}`.trim(); }
}

@Component({
    selector: 'app-alert-dialog-footer',
    standalone: true,
    template: `<div [class]="getClasses()"><ng-content></ng-content></div>`
})
export class AlertDialogFooterComponent {
    @Input() className = '';
    getClasses() { return `flex flex-col-reverse gap-2 sm:flex-row sm:justify-end ${this.className}`.trim(); }
}

@Component({
    selector: 'app-alert-dialog-title',
    standalone: true,
    template: `<h2 [class]="getClasses()"><ng-content></ng-content></h2>`
})
export class AlertDialogTitleComponent {
    @Input() className = '';
    getClasses() { return `text-lg font-semibold ${this.className}`.trim(); }
}

@Component({
    selector: 'app-alert-dialog-description',
    standalone: true,
    template: `<p [class]="getClasses()"><ng-content></ng-content></p>`
})
export class AlertDialogDescriptionComponent {
    @Input() className = '';
    getClasses() { return `text-muted-foreground text-sm ${this.className}`.trim(); }
}

@Component({
    selector: 'app-alert-dialog-action',
    standalone: true,
    imports: [ButtonComponent],
    template: `
    <app-button [className]="className" (click)="onClick()">
      <ng-content></ng-content>
    </app-button>
  `
})
export class AlertDialogActionComponent {
    @Input() className = '';
    @Output() action = new EventEmitter<void>();

    constructor(@Optional() public dialogRef: DialogRef) { }

    onClick() {
        this.action.emit();
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }
}

@Component({
    selector: 'app-alert-dialog-cancel',
    standalone: true,
    imports: [ButtonComponent],
    template: `
    <app-button variant="outline" [className]="className" (click)="onClick()">
      <ng-content></ng-content>
    </app-button>
  `
})
export class AlertDialogCancelComponent {
    @Input() className = '';

    constructor(@Optional() public dialogRef: DialogRef) { }

    onClick() {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }
}

export const AlertDialogModule = [
    AlertDialogComponent,
    AlertDialogHeaderComponent,
    AlertDialogFooterComponent,
    AlertDialogTitleComponent,
    AlertDialogDescriptionComponent,
    AlertDialogActionComponent,
    AlertDialogCancelComponent
];
