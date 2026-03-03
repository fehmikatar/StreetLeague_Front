import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';

@Component({
    selector: 'app-navigation-menu',
    standalone: true,
    imports: [CommonModule],
    template: `
    <nav 
      class="group/navigation-menu relative flex max-w-max flex-1 items-center justify-center {{className}}"
      style="z-index: 50;"
    >
      <ul class="group flex flex-1 list-none items-center justify-center gap-1">
        <ng-content></ng-content>
      </ul>
    </nav>
  `
})
export class NavigationMenuComponent {
    @Input() className = '';
}

@Component({
    selector: 'app-navigation-menu-item',
    standalone: true,
    imports: [CommonModule],
    template: `
    <li class="relative" (mouseenter)="open()" (mouseleave)="close()">
      <ng-content select="[nav-trigger], [nav-link]"></ng-content>
      
      <div 
        *ngIf="isOpen"
        class="absolute left-0 top-full flex justify-center mt-1.5"
      >
        <div class="origin-top-center bg-popover text-popover-foreground animate-in zoom-in-90 relative h-auto w-full overflow-hidden rounded-md border shadow-md md:w-max">
          <ng-content select="[nav-content]"></ng-content>
        </div>
      </div>
    </li>
  `
})
export class NavigationMenuItemComponent {
    isOpen = false;
    open() { this.isOpen = true; }
    close() { this.isOpen = false; }
}

@Component({
    selector: 'app-navigation-menu-trigger',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <button [class]="getClasses()">
      <ng-content></ng-content>
      <lucide-icon [img]="ChevronDownIcon" class="relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-hover:-rotate-180" aria-hidden="true"></lucide-icon>
    </button>
  `
})
export class NavigationMenuTriggerComponent {
    @Input() className = '';
    readonly ChevronDownIcon = ChevronDown;

    getClasses() {
        return `group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 focus-visible:ring-ring/50 ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-navigation-menu-content',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="getClasses()">
      <ng-content></ng-content>
    </div>
  `
})
export class NavigationMenuContentComponent {
    @Input() className = '';
    getClasses() {
        return `w-full p-2 pr-2.5 md:w-auto ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-navigation-menu-link',
    standalone: true,
    imports: [CommonModule],
    template: `
    <a [class]="getClasses()" [href]="href" [target]="target">
      <ng-content></ng-content>
    </a>
  `
})
export class NavigationMenuLinkComponent {
    @Input() className = '';
    @Input() href = '#';
    @Input() target = '_self';
    @Input() active = false;

    getClasses() {
        const activeClass = this.active ? "bg-accent/50 text-accent-foreground focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground";
        return `group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:outline-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 ${activeClass} ${this.className}`.trim();
    }
}

export const NavigationMenuModule = [
    NavigationMenuComponent,
    NavigationMenuItemComponent,
    NavigationMenuTriggerComponent,
    NavigationMenuContentComponent,
    NavigationMenuLinkComponent
];
