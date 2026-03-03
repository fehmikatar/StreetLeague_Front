import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, GripVertical } from 'lucide-angular';

@Component({
    selector: 'app-resizable-panel-group',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div
      [attr.data-panel-group-direction]="direction"
      [class]="getClasses()"
    >
      <ng-content></ng-content>
    </div>
  `
})
export class ResizablePanelGroupComponent {
    @Input() direction: 'horizontal' | 'vertical' = 'horizontal';
    @Input() className = '';

    getClasses() {
        return `flex h-full w-full data-[panel-group-direction=vertical]:flex-col ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-resizable-panel',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [style.flex]="defaultSize ? defaultSize + ' ' + defaultSize + ' 0%' : '1 1 0%'">
      <ng-content></ng-content>
    </div>
  `
})
export class ResizablePanelComponent {
    @Input() defaultSize: number | null = null;
}

@Component({
    selector: 'app-resizable-handle',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <div
      [class]="getClasses()"
    >
      <div *ngIf="withHandle" class="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
        <lucide-icon [img]="GripVerticalIcon" class="h-2.5 w-2.5"></lucide-icon>
      </div>
    </div>
  `
})
export class ResizableHandleComponent {
    @Input() withHandle = false;
    @Input() className = '';
    readonly GripVerticalIcon = GripVertical;

    getClasses() {
        return `bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90 ${this.className}`.trim();
    }
}

export const ResizableModule = [
    ResizablePanelGroupComponent,
    ResizablePanelComponent,
    ResizableHandleComponent
];
