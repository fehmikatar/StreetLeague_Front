import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowLeft, ArrowRight } from 'lucide-angular';
import EmblaCarousel, { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';

@Component({
    selector: 'app-carousel',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <div class="relative {{className}}" role="region" aria-roledescription="carousel" (keydown)="handleKeyDown($event)">
      <div #emblaNode class="overflow-hidden" data-slot="carousel-content">
        <div class="flex {{orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col'}}">
          <ng-content></ng-content>
        </div>
      </div>
      
      <button
        *ngIf="showControls"
        (click)="scrollPrev()"
        [disabled]="!canScrollPrev"
        class="absolute size-8 rounded-full border bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 {{orientation === 'horizontal' ? 'top-1/2 -left-12 -translate-y-1/2' : '-top-12 left-1/2 -translate-x-1/2 rotate-90'}} {{previousBtnClass}}"
      >
        <lucide-icon [img]="ArrowLeftIcon" class="h-4 w-4"></lucide-icon>
        <span class="sr-only">Previous slide</span>
      </button>

      <button
        *ngIf="showControls"
        (click)="scrollNext()"
        [disabled]="!canScrollNext"
        class="absolute size-8 rounded-full border bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 {{orientation === 'horizontal' ? 'top-1/2 -right-12 -translate-y-1/2' : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90'}} {{nextBtnClass}}"
      >
        <lucide-icon [img]="ArrowRightIcon" class="h-4 w-4"></lucide-icon>
        <span class="sr-only">Next slide</span>
      </button>
    </div>
  `
})
export class CarouselComponent implements AfterViewInit, OnDestroy {
    @ViewChild('emblaNode') emblaNode!: ElementRef;

    @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
    @Input() opts: EmblaOptionsType = {};
    @Input() className = '';
    @Input() showControls = true;
    @Input() previousBtnClass = '';
    @Input() nextBtnClass = '';

    @Output() emblaReady = new EventEmitter<EmblaCarouselType>();

    readonly ArrowLeftIcon = ArrowLeft;
    readonly ArrowRightIcon = ArrowRight;

    emblaApi?: EmblaCarouselType;
    canScrollPrev = false;
    canScrollNext = false;

    ngAfterViewInit() {
        this.emblaApi = EmblaCarousel(this.emblaNode.nativeElement, {
            ...this.opts,
            axis: this.orientation === 'horizontal' ? 'x' : 'y'
        });

        this.emblaReady.emit(this.emblaApi);

        this.emblaApi.on('reInit', () => this.onSelect());
        this.emblaApi.on('select', () => this.onSelect());
        this.onSelect();
    }

    ngOnDestroy() {
        if (this.emblaApi) {
            this.emblaApi.destroy();
        }
    }

    onSelect() {
        if (!this.emblaApi) return;
        this.canScrollPrev = this.emblaApi.canScrollPrev();
        this.canScrollNext = this.emblaApi.canScrollNext();
    }

    scrollPrev() {
        this.emblaApi?.scrollPrev();
    }

    scrollNext() {
        this.emblaApi?.scrollNext();
    }

    handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            this.scrollPrev();
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            this.scrollNext();
        }
    }
}

@Component({
    selector: 'app-carousel-item',
    standalone: true,
    template: `
    <div [class]="getClasses()" role="group" aria-roledescription="slide">
      <ng-content></ng-content>
    </div>
  `
})
export class CarouselItemComponent {
    @Input() className = '';
    @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';

    getClasses() {
        const spacing = this.orientation === 'horizontal' ? 'pl-4' : 'pt-4';
        return `min-w-0 shrink-0 grow-0 basis-full ${spacing} ${this.className}`.trim();
    }
}

export const CarouselModule = [CarouselComponent, CarouselItemComponent];
