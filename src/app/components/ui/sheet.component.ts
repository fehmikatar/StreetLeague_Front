import { Component, Input, Output, EventEmitter, TemplateRef, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';
import { Dialog, DialogModule } from '@angular/cdk/dialog';

@Component({
    selector: 'app-sheet',
    standalone: true,
    imports: [CommonModule, DialogModule, LucideAngularModule],
    template: `
    <div (click)="openDialog()">
      <ng-content select="[sheet-trigger]"></ng-content>
    </div>

    <ng-template #sheetTemplate>
      <div 
        class="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500"
        style="animation-fill-mode: forwards;"
        [class]="getSideClasses()"
      >
        <ng-content select="[sheet-content]"></ng-content>
        <button 
          (click)="closeDialog()"
          class="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
        >
          <lucide-icon [img]="XIcon" class="size-4"></lucide-icon>
          <span class="sr-only">Close</span>
        </button>
      </div>
    </ng-template>
  `
})
export class SheetComponent implements OnDestroy {
    @Input() side: 'top' | 'right' | 'bottom' | 'left' = 'right';
    @Input() className = '';

    @ViewChild('sheetTemplate') sheetTemplate!: TemplateRef<any>;
    private dialogRef: any;
    readonly XIcon = X;

    constructor(private dialog: Dialog) { }

    openDialog() {
        this.dialogRef = this.dialog.open(this.sheetTemplate, {
            panelClass: ['w-full', 'h-full', 'pointer-events-none'],
            backdropClass: 'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            hasBackdrop: true,
        });

        // Add pointer events auto to the actual content panel
        this.dialogRef.containerInstance._elementRef.nativeElement.classList.add('flex', 'justify-end'); // For right side by default
    }

    closeDialog() {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }

    ngOnDestroy() {
        this.closeDialog();
    }

    getSideClasses() {
        let sideClass = '';
        switch (this.side) {
            case 'right': sideClass = 'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm'; break;
            case 'left': sideClass = 'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm'; break;
            case 'top': sideClass = 'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b'; break;
            case 'bottom': sideClass = 'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t'; break;
        }
        return `pointer-events-auto ${sideClass} ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-sheet-header',
    standalone: true,
    imports: [CommonModule],
    template: `<div class="flex flex-col gap-1.5 p-4 {{className}}"><ng-content></ng-content></div>`
})
export class SheetHeaderComponent {
    @Input() className = '';
}

@Component({
    selector: 'app-sheet-footer',
    standalone: true,
    imports: [CommonModule],
    template: `<div class="mt-auto flex flex-col gap-2 p-4 {{className}}"><ng-content></ng-content></div>`
})
export class SheetFooterComponent {
    @Input() className = '';
}

@Component({
    selector: 'app-sheet-title',
    standalone: true,
    imports: [CommonModule],
    template: `<h2 class="text-foreground font-semibold {{className}}"><ng-content></ng-content></h2>`
})
export class SheetTitleComponent {
    @Input() className = '';
}

@Component({
    selector: 'app-sheet-description',
    standalone: true,
    imports: [CommonModule],
    template: `<p class="text-muted-foreground text-sm {{className}}"><ng-content></ng-content></p>`
})
export class SheetDescriptionComponent {
    @Input() className = '';
}

export const SheetModule = [
    SheetComponent,
    SheetHeaderComponent,
    SheetFooterComponent,
    SheetTitleComponent,
    SheetDescriptionComponent
];
