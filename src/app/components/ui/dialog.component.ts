import { Component, Input, Output, EventEmitter, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
    selector: 'app-dialog',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <ng-template #dialogTemplate>
      <div 
        class="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg {{contentClass}}"
      >
        <ng-content select="[dialog-header]"></ng-content>
        <ng-content></ng-content>
        <ng-content select="[dialog-footer]"></ng-content>

        <button 
          (click)="close()"
          class="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
        >
          <lucide-icon [img]="XIcon" class="h-4 w-4"></lucide-icon>
          <span class="sr-only">Close</span>
        </button>
      </div>
    </ng-template>

    <div (click)="open()">
      <ng-content select="[dialog-trigger]"></ng-content>
    </div>
  `
})
export class DialogComponent {
    @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
    @Input() contentClass = '';
    @Output() opened = new EventEmitter<void>();
    @Output() closed = new EventEmitter<void>();

    private dialogRef: DialogRef | null = null;
    readonly XIcon = X;

    constructor(public dialog: Dialog) { }

    open() {
        this.dialogRef = this.dialog.open(this.dialogTemplate, {
            panelClass: ['fixed', 'inset-0', 'z-50', 'bg-black/50', 'data-[state=open]:animate-in', 'data-[state=open]:fade-in-0']
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
    selector: 'app-dialog-header',
    standalone: true,
    template: `<div [class]="getClasses()"><ng-content></ng-content></div>`
})
export class DialogHeaderComponent {
    @Input() className = '';
    getClasses() { return `flex flex-col gap-2 text-center sm:text-left ${this.className}`.trim(); }
}

@Component({
    selector: 'app-dialog-footer',
    standalone: true,
    template: `<div [class]="getClasses()"><ng-content></ng-content></div>`
})
export class DialogFooterComponent {
    @Input() className = '';
    getClasses() { return `flex flex-col-reverse gap-2 sm:flex-row sm:justify-end ${this.className}`.trim(); }
}

@Component({
    selector: 'app-dialog-title',
    standalone: true,
    template: `<h2 [class]="getClasses()"><ng-content></ng-content></h2>`
})
export class DialogTitleComponent {
    @Input() className = '';
    getClasses() { return `text-lg leading-none font-semibold ${this.className}`.trim(); }
}

@Component({
    selector: 'app-dialog-description',
    standalone: true,
    template: `<p [class]="getClasses()"><ng-content></ng-content></p>`
})
export class DialogDescriptionComponent {
    @Input() className = '';
    getClasses() { return `text-muted-foreground text-sm ${this.className}`.trim(); }
}

export const DialogModule = [
    DialogComponent,
    DialogHeaderComponent,
    DialogFooterComponent,
    DialogTitleComponent,
    DialogDescriptionComponent
];
