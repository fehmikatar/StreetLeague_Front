import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-aspect-ratio',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [style.padding-bottom.%]="(1 / ratio) * 100" class="relative w-full" data-slot="aspect-ratio">
      <div class="absolute inset-0">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class AspectRatioComponent {
    /**
     * The desired aspect ratio. For example, 16 / 9.
     */
    @Input() ratio: number = 1;
}

export const AspectRatioModule = [AspectRatioComponent];
