import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSonnerToaster } from 'ngx-sonner';

@Component({
    selector: 'app-toaster',
    standalone: true,
    imports: [CommonModule, NgxSonnerToaster],
    encapsulation: ViewEncapsulation.None,
    template: `
    <ngx-sonner-toaster
      class="toaster group"
      [theme]="theme"
      [position]="position"
      [richColors]="richColors"
      [expand]="expand"
      [toastOptions]="toastOptions"
    />
  `,
    styles: [`
    .toaster {
      --normal-bg: var(--popover);
      --normal-text: var(--popover-foreground);
      --normal-border: var(--border);
    }
  `]
})
export class ToasterComponent {
    @Input() theme: 'light' | 'dark' | 'system' = 'system';
    @Input() position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center' = 'bottom-right';
    @Input() richColors = false;
    @Input() expand = false;
    @Input() toastOptions = {
        class: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
        descriptionClass: 'group-[.toast]:text-muted-foreground',
        actionButtonClass: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
        cancelButtonClass: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
    };
}
