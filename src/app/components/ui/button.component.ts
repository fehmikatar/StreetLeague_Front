import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

@Component({
    selector: 'app-button',
    standalone: true,
    imports: [CommonModule],
    template: `
    <button
      [disabled]="disabled"
      [class]="getClasses()"
      [type]="type"
    >
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
    @Input() variant: ButtonVariant = 'default';
    @Input() size: ButtonSize = 'default';
    @Input() disabled = false;
    @Input() type: 'button' | 'submit' | 'reset' = 'button';
    @Input() className = '';

    getClasses(): string {
        const baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

        let variantClasses = "";
        switch (this.variant) {
            case 'destructive': variantClasses = "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60"; break;
            case 'outline': variantClasses = "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50"; break;
            case 'secondary': variantClasses = "bg-secondary text-secondary-foreground hover:bg-secondary/80"; break;
            case 'ghost': variantClasses = "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"; break;
            case 'link': variantClasses = "text-primary underline-offset-4 hover:underline"; break;
            default: variantClasses = "bg-primary text-primary-foreground hover:bg-primary/90"; break;
        }

        let sizeClasses = "";
        switch (this.size) {
            case 'sm': sizeClasses = "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5"; break;
            case 'lg': sizeClasses = "h-10 rounded-md px-6 has-[>svg]:px-4"; break;
            case 'icon': sizeClasses = "size-9 rounded-md"; break;
            default: sizeClasses = "h-9 px-4 py-2 has-[>svg]:px-3"; break;
        }

        return `${baseClasses} ${variantClasses} ${sizeClasses} ${this.className}`.trim();
    }
}
