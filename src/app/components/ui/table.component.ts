import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-table',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="relative w-full overflow-x-auto">
      <table [class]="getClasses()">
        <ng-content></ng-content>
      </table>
    </div>
  `
})
export class TableComponent {
    @Input() className = '';
    getClasses() { return `w-full caption-bottom text-sm ${this.className}`.trim(); }
}

@Component({
    selector: 'app-table-header',
    standalone: true,
    imports: [CommonModule],
    template: `<thead [class]="getClasses()"><ng-content></ng-content></thead>`
})
export class TableHeaderComponent {
    @Input() className = '';
    getClasses() { return `[&_tr]:border-b ${this.className}`.trim(); }
}

@Component({
    selector: 'app-table-body',
    standalone: true,
    imports: [CommonModule],
    template: `<tbody [class]="getClasses()"><ng-content></ng-content></tbody>`
})
export class TableBodyComponent {
    @Input() className = '';
    getClasses() { return `[&_tr:last-child]:border-0 ${this.className}`.trim(); }
}

@Component({
    selector: 'app-table-footer',
    standalone: true,
    imports: [CommonModule],
    template: `<tfoot [class]="getClasses()"><ng-content></ng-content></tfoot>`
})
export class TableFooterComponent {
    @Input() className = '';
    getClasses() { return `bg-muted/50 border-t font-medium [&>tr]:last:border-b-0 ${this.className}`.trim(); }
}

@Component({
    selector: 'app-table-row',
    standalone: true,
    imports: [CommonModule],
    template: `<tr [class]="getClasses()" [attr.data-state]="selected ? 'selected' : null"><ng-content></ng-content></tr>`
})
export class TableRowComponent {
    @Input() className = '';
    @Input() selected = false;
    getClasses() { return `hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors ${this.className}`.trim(); }
}

@Component({
    selector: 'app-table-head',
    standalone: true,
    imports: [CommonModule],
    template: `<th [class]="getClasses()"><ng-content></ng-content></th>`
})
export class TableHeadComponent {
    @Input() className = '';
    getClasses() { return `text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] ${this.className}`.trim(); }
}

@Component({
    selector: 'app-table-cell',
    standalone: true,
    imports: [CommonModule],
    template: `<td [class]="getClasses()"><ng-content></ng-content></td>`
})
export class TableCellComponent {
    @Input() className = '';
    getClasses() { return `p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] ${this.className}`.trim(); }
}

@Component({
    selector: 'app-table-caption',
    standalone: true,
    imports: [CommonModule],
    template: `<caption [class]="getClasses()"><ng-content></ng-content></caption>`
})
export class TableCaptionComponent {
    @Input() className = '';
    getClasses() { return `text-muted-foreground mt-4 text-sm ${this.className}`.trim(); }
}

export const TableModule = [
    TableComponent,
    TableHeaderComponent,
    TableBodyComponent,
    TableFooterComponent,
    TableRowComponent,
    TableHeadComponent,
    TableCellComponent,
    TableCaptionComponent
];
