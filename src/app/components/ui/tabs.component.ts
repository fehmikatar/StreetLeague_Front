import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit, TemplateRef, Optional, SkipSelf, Host } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-tabs',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="getClasses()" data-slot="tabs">
      <ng-content></ng-content>
    </div>
  `
})
export class TabsComponent {
    @Input() className = '';
    @Input() value: string = '';
    @Output() valueChange = new EventEmitter<string>();

    getClasses() {
        return `flex flex-col gap-2 ${this.className}`.trim();
    }

    selectTab(tabValue: string) {
        if (this.value !== tabValue) {
            this.value = tabValue;
            this.valueChange.emit(this.value);
        }
    }
}

@Component({
    selector: 'app-tabs-list',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="getClasses()" data-slot="tabs-list" role="tablist">
      <ng-content></ng-content>
    </div>
  `
})
export class TabsListComponent {
    @Input() className = '';

    getClasses() {
        return `bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] flex ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-tabs-trigger',
    standalone: true,
    imports: [CommonModule],
    template: `
    <button
      role="tab"
      type="button"
      [disabled]="disabled"
      [attr.aria-selected]="isActive"
      [class]="getClasses()"
      (click)="onClick()"
      data-slot="tabs-trigger"
    >
      <ng-content></ng-content>
    </button>
  `
})
export class TabsTriggerComponent {
    @Input() value: string = '';
    @Input() disabled = false;
    @Input() className = '';

    constructor(@Optional() @Host() private tabsContext: TabsComponent) { }

    get isActive(): boolean {
        return this.tabsContext ? this.tabsContext.value === this.value : false;
    }

    getClasses() {
        const baseClasses = "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
        const activeClasses = this.isActive
            ? "bg-card dark:text-foreground dark:border-input dark:bg-input/30"
            : "";

        return `${baseClasses} ${activeClasses} ${this.className}`.trim();
    }

    onClick() {
        if (!this.disabled && this.tabsContext) {
            this.tabsContext.selectTab(this.value);
        }
    }
}

@Component({
    selector: 'app-tabs-content',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div 
      *ngIf="isActive" 
      role="tabpanel" 
      [hidden]="!isActive" 
      [class]="getClasses()" 
      data-slot="tabs-content"
    >
      <ng-content></ng-content>
    </div>
  `
})
export class TabsContentComponent {
    @Input() value: string = '';
    @Input() className = '';

    constructor(@Optional() @Host() private tabsContext: TabsComponent) { }

    get isActive(): boolean {
        return this.tabsContext ? this.tabsContext.value === this.value : false;
    }

    getClasses() {
        return `flex-1 outline-none ${this.className}`.trim();
    }
}

export const TabsModule = [TabsComponent, TabsListComponent, TabsTriggerComponent, TabsContentComponent];
