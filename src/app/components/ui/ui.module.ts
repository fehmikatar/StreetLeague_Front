import { NgModule } from '@angular/core';

import { AccordionModule } from './accordion.component';
import { AlertDialogModule } from './alert-dialog.component';
import { AlertModule } from './alert.component';
import { AspectRatioModule } from './aspect-ratio.component';
import { AvatarModule } from './avatar.component';
import { BadgeModule } from './badge.component';
import { BreadcrumbModule } from './breadcrumb.component';
import { ButtonComponent } from './button.component';
import { CalendarModule } from './calendar.component';
import { CardModule } from './card.component';
import { CarouselModule } from './carousel.component';
import { ChartModule } from './chart.component';
import { CheckboxComponent } from './checkbox.component';
import { CollapsibleModule } from './collapsible.component';
import { CommandModule } from './command.component';
import { ContextMenuModule } from './context-menu.component';
import { DialogModule } from './dialog.component';
import { DrawerModule } from './drawer.component';
import { DropdownMenuModule } from './dropdown-menu.component';
import { FormModule } from './form.component';
import { HoverCardComponent } from './hover-card.component';
import { InputOtpModule } from './input-otp.component';
import { InputComponent } from './input.component';
import { LabelModule } from './label.component';
import { MenubarModule } from './menubar.component';
import { NavigationMenuModule } from './navigation-menu.component';
import { PaginationModule } from './pagination.component';
import { PopoverComponent } from './popover.component';
import { ProgressComponent } from './progress.component';
import { RadioGroupModule } from './radio-group.component';
import { ResizableModule } from './resizable.component';
import { ScrollAreaModule } from './scroll-area.component';
import { SelectModule } from './select.component';
import { SeparatorComponent } from './separator.component';
import { SheetModule } from './sheet.component';
import { SidebarModule } from './sidebar.component';
import { SkeletonComponent } from './skeleton.component';
import { SliderComponent } from './slider.component';
import { TableModule } from './table.component';
import { ToasterComponent } from './sonner.component';
import { SwitchComponent } from './switch.component';
import { TabsModule } from './tabs.component';
import { ToggleComponent } from './toggle.component';
import { ToggleGroupModule } from './toggle-group.component';
import { TextareaComponent } from './textarea.component';
import { TooltipComponent } from './tooltip.component';

const UI_COMPONENTS = [
    ...AccordionModule,
    ...AlertDialogModule,
    ...AlertModule,
    ...AspectRatioModule,
    ...AvatarModule,
    ...BadgeModule,
    ...BreadcrumbModule,
    ButtonComponent,
    ...CalendarModule,
    ...CardModule,
    ...CarouselModule,
    ...ChartModule,
    CheckboxComponent,
    ...CollapsibleModule,
    ...CommandModule,
    ...ContextMenuModule,
    ...DialogModule,
    ...DrawerModule,
    ...DropdownMenuModule,
    ...FormModule,
    HoverCardComponent,
    ...InputOtpModule,
    InputComponent,
    ...LabelModule,
    ...MenubarModule,
    ...NavigationMenuModule,
    ...PaginationModule,
    PopoverComponent,
    ProgressComponent,
    ...RadioGroupModule,
    ...ResizableModule,
    ...ScrollAreaModule,
    ...SelectModule,
    SeparatorComponent,
    ...SheetModule,
    ...SidebarModule,
    SkeletonComponent,
    SliderComponent,
    ...TableModule,
    ToasterComponent,
    SwitchComponent,
    ...TabsModule,
    TextareaComponent,
    TooltipComponent,
];

@NgModule({
    imports: [...UI_COMPONENTS],
    exports: [...UI_COMPONENTS]
})
export class UiModule { }
