import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-scroll-area',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="getClasses()">
      <div 
        #viewport
        class="h-full w-full rounded-[inherit] overflow-hidden focus-visible:ring-ring/50 transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
        style="overflow: auto;"
      >
        <ng-content></ng-content>
      </div>
      <ng-content select="app-scroll-bar"></ng-content>
    </div>
  `
})
export class ScrollAreaComponent {
    @Input() className = '';
    @ViewChild('viewport') viewport!: ElementRef<HTMLDivElement>;

    getClasses() {
        return `relative overflow-hidden ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-scroll-bar',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="getClasses()">
      <div class="bg-border relative flex-1 rounded-full"></div>
    </div>
  `
})
export class ScrollBarComponent {
    @Input() className = '';
    @Input() orientation: 'vertical' | 'horizontal' = 'vertical';

    getClasses() {
        const base = "flex touch-none p-px transition-colors select-none";
        const orientClass = this.orientation === "vertical"
            ? "h-full w-2.5 border-l border-l-transparent absolute top-0 right-0"
            : "h-2.5 flex-col border-t border-t-transparent absolute bottom-0 left-0 w-full";

        return `${base} ${orientClass} ${this.className}`.trim();
    }
}

export const ScrollAreaModule = [ScrollAreaComponent, ScrollBarComponent];
