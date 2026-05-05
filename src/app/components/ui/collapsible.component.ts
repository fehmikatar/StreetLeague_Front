import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-collapsible',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="className">
      <ng-content select="[collapsible-trigger]"></ng-content>
      <div 
        [@collapseExpand]="isOpen ? 'expanded' : 'collapsed'"
        [style.display]="isOpen ? 'block' : 'none'"
      >
        <ng-content select="[collapsible-content]"></ng-content>
      </div>
    </div>
  `,
    animations: [
        trigger('collapseExpand', [
            state('collapsed', style({ height: '0', overflow: 'hidden' })),
            state('expanded', style({ height: '*', overflow: 'hidden' })),
            transition('expanded <=> collapsed', animate('200ms ease-out'))
        ])
    ]
})
export class CollapsibleComponent {
    @Input() isOpen = false;
    @Input() className = '';

    toggle() {
        this.isOpen = !this.isOpen;
    }
}

@Component({
    selector: 'app-collapsible-trigger',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div (click)="handleClick()" [class]="className">
      <ng-content></ng-content>
    </div>
  `
})
export class CollapsibleTriggerComponent {
    @Input() collapsibleRef!: CollapsibleComponent;
    @Input() className = '';

    handleClick() {
        if (this.collapsibleRef) {
            this.collapsibleRef.toggle();
        }
    }
}

@Component({
    selector: 'app-collapsible-content',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="className">
      <ng-content></ng-content>
    </div>
  `
})
export class CollapsibleContentComponent {
    @Input() className = '';
}

export const CollapsibleModule = [
    CollapsibleComponent,
    CollapsibleTriggerComponent,
    CollapsibleContentComponent
];
