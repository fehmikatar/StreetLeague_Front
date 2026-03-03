import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-accordion',
    standalone: true,
    imports: [CommonModule, CdkAccordionModule, LucideAngularModule],
    template: `
    <cdk-accordion class="w-full" [multi]="type === 'multiple'">
      <ng-content></ng-content>
    </cdk-accordion>
  `,
})
export class AccordionComponent {
    @Input() type: 'single' | 'multiple' = 'single';
}

@Component({
    selector: 'app-accordion-item',
    standalone: true,
    imports: [CommonModule, CdkAccordionModule, LucideAngularModule],
    animations: [
        trigger('bodyExpansion', [
            state('collapsed, void', style({ height: '0px', visibility: 'hidden' })),
            state('expanded', style({ height: '*', visibility: 'visible' })),
            transition('expanded <=> collapsed, void => collapsed',
                animate('200ms cubic-bezier(0.4,0.0,0.2,1)')),
        ])
    ],
    template: `
    <cdk-accordion-item
      #accordionItem="cdkAccordionItem"
      class="border-b last:border-b-0 block"
      role="button"
      tabindex="0"
      [attr.id]="'accordion-header-' + id"
      [attr.aria-expanded]="accordionItem.expanded"
      [attr.aria-controls]="'accordion-body-' + id"
    >
      <div 
        (click)="accordionItem.toggle()"
        class="focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-center justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
      >
        <ng-content select="[accordion-trigger]"></ng-content>
        <lucide-icon 
          [img]="ChevronDownIcon" 
          class="text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200"
          [class.rotate-180]="accordionItem.expanded"
        ></lucide-icon>
      </div>
      
      <div
        role="region"
        [style.display]="accordionItem.expanded ? '' : 'none'"
        [attr.id]="'accordion-body-' + id"
        [attr.aria-labelledby]="'accordion-header-' + id"
        [@bodyExpansion]="accordionItem.expanded ? 'expanded' : 'collapsed'"
        class="overflow-hidden text-sm"
      >
        <div class="pt-0 pb-4">
          <ng-content select="[accordion-content]"></ng-content>
        </div>
      </div>
    </cdk-accordion-item>
  `,
})
export class AccordionItemComponent {
    @Input() id = Math.random().toString(36).substring(2, 9);
    readonly ChevronDownIcon = ChevronDown;
}

export const AccordionModule = [AccordionComponent, AccordionItemComponent];
