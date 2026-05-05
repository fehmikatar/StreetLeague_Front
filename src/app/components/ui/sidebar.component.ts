import { Component, Input, Injectable, ViewChild, ElementRef, HostListener, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, PanelLeft } from 'lucide-angular';
import { SheetModule } from './sheet.component';
import { ButtonComponent } from './button.component';

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

@Injectable({
    providedIn: 'root'
})
export class SidebarService {
    state: 'expanded' | 'collapsed' = 'expanded';
    open = true;
    openMobile = false;
    isMobile = false; // You'd ideally hook this up to a viewport service

    constructor() {
        this.checkIsMobile();
        window.addEventListener('resize', this.checkIsMobile.bind(this));

        // Check cookie
        const match = document.cookie.match(new RegExp('(^| )' + SIDEBAR_COOKIE_NAME + '=([^;]+)'));
        if (match) {
            const val = match[2];
            this.setOpen(val === 'true');
        }
    }

    checkIsMobile() {
        this.isMobile = window.innerWidth < 768; // Tailwind md breakpoint
    }

    setOpen(value: boolean) {
        this.open = value;
        this.state = value ? 'expanded' : 'collapsed';
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    }

    setOpenMobile(value: boolean) {
        this.openMobile = value;
    }

    toggleSidebar() {
        if (this.isMobile) {
            this.setOpenMobile(!this.openMobile);
        } else {
            this.setOpen(!this.open);
        }
    }
}

@Component({
    selector: 'app-sidebar-provider',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div
      class="group/sidebar-wrapper has-[[data-variant=inset]]:bg-sidebar flex min-h-svh w-full {{className}}"
      [style.--sidebar-width]="SIDEBAR_WIDTH"
      [style.--sidebar-width-icon]="SIDEBAR_WIDTH_ICON"
    >
      <ng-content></ng-content>
    </div>
  `
})
export class SidebarProviderComponent implements OnInit {
    @Input() className = '';
    @Input() defaultOpen = true;

    readonly SIDEBAR_WIDTH = SIDEBAR_WIDTH;
    readonly SIDEBAR_WIDTH_ICON = SIDEBAR_WIDTH_ICON;

    constructor(public sidebarService: SidebarService) { }

    ngOnInit() {
        // If there's no cookie, set default
        if (!document.cookie.includes(SIDEBAR_COOKIE_NAME)) {
            this.sidebarService.setOpen(this.defaultOpen);
        }
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
        if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            this.sidebarService.toggleSidebar();
        }
    }
}

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, SheetModule],
    template: `
    <ng-container *ngIf="collapsible === 'none'; else defaultSidebar">
      <div
        class="bg-sidebar text-sidebar-foreground flex h-full w-[var(--sidebar-width)] flex-col {{className}}"
      >
        <ng-content></ng-content>
      </div>
    </ng-container>
    
    <ng-template #defaultSidebar>
      <ng-container *ngIf="sidebarService.isMobile; else desktopSidebar">
        <!-- We'd ideally use app-sheet correctly here, bypassing the trigger. For now just render an overlay sheet manually or via a service -->
        <!-- In a strict port, it works via Sheet open state. -->
        <app-sheet [side]="side" *ngIf="sidebarService.openMobile">
          <div sheet-content class="bg-sidebar text-sidebar-foreground w-[18rem] p-0 flex h-full flex-col">
            <ng-content></ng-content>
          </div>
        </app-sheet>
      </ng-container>

      <ng-template #desktopSidebar>
        <div
          class="group peer text-sidebar-foreground hidden md:block"
          [attr.data-state]="sidebarService.state"
          [attr.data-collapsible]="sidebarService.state === 'collapsed' ? collapsible : ''"
          [attr.data-variant]="variant"
          [attr.data-side]="side"
        >
          <!-- Gap -->
          <div
            class="relative w-[var(--sidebar-width)] bg-transparent transition-[width] duration-200 ease-linear group-data-[collapsible=offcanvas]:w-0 group-data-[side=right]:rotate-180"
            [class]="variant === 'floating' || variant === 'inset' ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]' : 'group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]'"
          ></div>
          <!-- Container -->
          <div
            class="fixed inset-y-0 z-10 hidden h-svh w-[var(--sidebar-width)] transition-[left,right,width] duration-200 ease-linear md:flex {{className}}"
            [ngClass]="side === 'left' ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]' : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]'"
            [class]="variant === 'floating' || variant === 'inset' ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem+2px)]' : 'group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)] group-data-[side=left]:border-r group-data-[side=right]:border-l'"
          >
            <div class="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm">
              <ng-content></ng-content>
            </div>
          </div>
        </div>
      </ng-template>
    </ng-template>
  `
})
export class SidebarComponent {
    @Input() side: 'left' | 'right' = 'left';
    @Input() variant: 'sidebar' | 'floating' | 'inset' = 'sidebar';
    @Input() collapsible: 'offcanvas' | 'icon' | 'none' = 'offcanvas';
    @Input() className = '';

    constructor(public sidebarService: SidebarService) { }
}

@Component({
    selector: 'app-sidebar-trigger',
    standalone: true,
    imports: [CommonModule, ButtonComponent, LucideAngularModule],
    template: `
    <app-button variant="ghost" size="icon" [className]="className" (click)="onClick()">
      <lucide-icon [img]="PanelLeftIcon"></lucide-icon>
      <span class="sr-only">Toggle Sidebar</span>
    </app-button>
  `
})
export class SidebarTriggerComponent {
    @Input() className = 'h-7 w-7';
    readonly PanelLeftIcon = PanelLeft;

    constructor(public sidebarService: SidebarService) { }

    onClick() {
        this.sidebarService.toggleSidebar();
    }
}

@Component({
    selector: 'app-sidebar-rail',
    standalone: true,
    imports: [CommonModule],
    template: `
    <button
      aria-label="Toggle Sidebar"
      tabindex="-1"
      title="Toggle Sidebar"
      class="hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex in-[[data-side=left]]:cursor-w-resize in-[[data-side=right]]:cursor-e-resize [[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full [[data-side=left][data-collapsible=offcanvas]_&]:-right-2 [[data-side=right][data-collapsible=offcanvas]_&]:-left-2 {{className}}"
      (click)="sidebarService.toggleSidebar()"
    ></button>
  `
})
export class SidebarRailComponent {
    @Input() className = '';
    constructor(public sidebarService: SidebarService) { }
}

@Component({
    selector: 'app-sidebar-inset',
    standalone: true,
    imports: [CommonModule],
    template: `
    <main class="bg-background relative flex w-full flex-1 flex-col md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2 {{className}}">
      <ng-content></ng-content>
    </main>
  `
})
export class SidebarInsetComponent {
    @Input() className = '';
}

@Component({
    selector: 'app-sidebar-header',
    standalone: true,
    imports: [CommonModule],
    template: `<div class="flex flex-col gap-2 p-2 {{className}}"><ng-content></ng-content></div>`
})
export class SidebarHeaderComponent { @Input() className = ''; }

@Component({
    selector: 'app-sidebar-footer',
    standalone: true,
    imports: [CommonModule],
    template: `<div class="flex flex-col gap-2 p-2 {{className}}"><ng-content></ng-content></div>`
})
export class SidebarFooterComponent { @Input() className = ''; }

@Component({
    selector: 'app-sidebar-content',
    standalone: true,
    imports: [CommonModule],
    template: `<div class="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden {{className}}"><ng-content></ng-content></div>`
})
export class SidebarContentComponent { @Input() className = ''; }

@Component({
    selector: 'app-sidebar-group',
    standalone: true,
    imports: [CommonModule],
    template: `<div class="relative flex w-full min-w-0 flex-col p-2 {{className}}"><ng-content></ng-content></div>`
})
export class SidebarGroupComponent { @Input() className = ''; }

@Component({
    selector: 'app-sidebar-group-label',
    standalone: true,
    imports: [CommonModule],
    template: `<div class="text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-none transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 {{className}}"><ng-content></ng-content></div>`
})
export class SidebarGroupLabelComponent { @Input() className = ''; }

@Component({
    selector: 'app-sidebar-menu',
    standalone: true,
    imports: [CommonModule],
    template: `<ul class="flex w-full min-w-0 flex-col gap-1 {{className}}"><ng-content></ng-content></ul>`
})
export class SidebarMenuComponent { @Input() className = ''; }

@Component({
    selector: 'app-sidebar-menu-item',
    standalone: true,
    imports: [CommonModule],
    template: `<li class="group/menu-item relative {{className}}"><ng-content></ng-content></li>`
})
export class SidebarMenuItemComponent { @Input() className = ''; }

@Component({
    selector: 'app-sidebar-menu-button',
    standalone: true,
    imports: [CommonModule],
    template: `
    <button [class]="getClasses()" [attr.data-active]="isActive" [attr.data-size]="size">
      <ng-content></ng-content>
    </button>
  `
})
export class SidebarMenuButtonComponent {
    @Input() isActive = false;
    @Input() variant: 'default' | 'outline' = 'default';
    @Input() size: 'default' | 'sm' | 'lg' = 'default';
    @Input() className = '';

    getClasses() {
        const base = "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0";
        const variantClass = this.variant === 'outline' ? "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";
        let sizeClass = "h-8 text-sm";
        if (this.size === 'sm') sizeClass = "h-7 text-xs";
        if (this.size === 'lg') sizeClass = "h-12 text-sm group-data-[collapsible=icon]:!p-0";
        return `${base} ${variantClass} ${sizeClass} ${this.className}`.trim();
    }
}

export const SidebarModule = [
    SidebarProviderComponent,
    SidebarComponent,
    SidebarTriggerComponent,
    SidebarRailComponent,
    SidebarInsetComponent,
    SidebarHeaderComponent,
    SidebarFooterComponent,
    SidebarContentComponent,
    SidebarGroupComponent,
    SidebarGroupLabelComponent,
    SidebarMenuComponent,
    SidebarMenuItemComponent,
    SidebarMenuButtonComponent
];
