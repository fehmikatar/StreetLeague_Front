import { Component, Input, Output, EventEmitter, forwardRef, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { LucideAngularModule, Search } from 'lucide-angular';

@Component({
    selector: 'app-command',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="getClasses()">
      <ng-content></ng-content>
    </div>
  `
})
export class CommandComponent {
    @Input() className = '';

    getClasses() {
        return `bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-command-input',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CommandInputComponent), multi: true }],
    template: `
    <div class="flex h-9 items-center gap-2 border-b px-3" data-slot="command-input-wrapper">
      <lucide-icon [img]="SearchIcon" class="size-4 shrink-0 opacity-50"></lucide-icon>
      <input
        type="text"
        [placeholder]="placeholder"
        [value]="value"
        [disabled]="disabled"
        (input)="onInput($event)"
        (blur)="onTouched()"
        [class]="getClasses()"
        data-slot="command-input"
      />
    </div>
  `
})
export class CommandInputComponent implements ControlValueAccessor {
    @Input() placeholder = 'Search...';
    @Input() className = '';
    @Input() disabled = false;

    value = '';
    readonly SearchIcon = Search;

    onChange: any = () => { };
    onTouched: any = () => { };

    getClasses() {
        return `placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50 ${this.className}`.trim();
    }

    onInput(event: Event) {
        const target = event.target as HTMLInputElement;
        this.value = target.value;
        this.onChange(this.value);
    }

    writeValue(val: string): void { this.value = val || ''; }
    registerOnChange(fn: any): void { this.onChange = fn; }
    registerOnTouched(fn: any): void { this.onTouched = fn; }
    setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
}

@Component({
    selector: 'app-command-list',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="getClasses()" data-slot="command-list">
      <ng-content></ng-content>
    </div>
  `
})
export class CommandListComponent {
    @Input() className = '';

    getClasses() {
        return `max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-command-empty',
    standalone: true,
    imports: [CommonModule],
    template: `<div class="py-6 text-center text-sm" data-slot="command-empty"><ng-content></ng-content></div>`
})
export class CommandEmptyComponent { }

@Component({
    selector: 'app-command-group',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="getClasses()" data-slot="command-group">
      <div *ngIf="heading" class="px-2 py-1.5 text-xs font-medium text-muted-foreground" cmkd-group-heading>
        {{heading}}
      </div>
      <ng-content></ng-content>
    </div>
  `
})
export class CommandGroupComponent {
    @Input() className = '';
    @Input() heading = '';

    getClasses() {
        return `text-foreground overflow-hidden p-1 ${this.className}`.trim();
    }
}

@Component({
    selector: 'app-command-separator',
    standalone: true,
    imports: [CommonModule],
    template: `<div [class]="getClasses()" data-slot="command-separator"></div>`
})
export class CommandSeparatorComponent {
    @Input() className = '';
    getClasses() { return `bg-border -mx-1 h-px ${this.className}`.trim(); }
}

@Component({
    selector: 'app-command-item',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div 
      [class]="getClasses()" 
      data-slot="command-item"
      [attr.data-disabled]="disabled ? 'true' : null"
      (click)="onClick()"
    >
      <ng-content></ng-content>
    </div>
  `
})
export class CommandItemComponent {
    @Input() className = '';
    @Input() value = '';
    @Input() disabled = false;
    @Output() selected = new EventEmitter<string>();

    getClasses() {
        return `relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 hover:bg-accent hover:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground ${this.className}`.trim();
    }

    onClick() {
        if (!this.disabled) {
            this.selected.emit(this.value);
        }
    }
}

@Component({
    selector: 'app-command-shortcut',
    standalone: true,
    imports: [CommonModule],
    template: `<span [class]="getClasses()" data-slot="command-shortcut"><ng-content></ng-content></span>`
})
export class CommandShortcutComponent {
    @Input() className = '';
    getClasses() { return `text-muted-foreground ml-auto text-xs tracking-widest ${this.className}`.trim(); }
}

export const CommandModule = [
    CommandComponent,
    CommandInputComponent,
    CommandListComponent,
    CommandEmptyComponent,
    CommandGroupComponent,
    CommandSeparatorComponent,
    CommandItemComponent,
    CommandShortcutComponent
];
