import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Placeholder for the React Recharts wrapper.
 * In Angular, consider using libraries like ng2-charts (Chart.js) or ngx-echarts.
 */
@Component({
    selector: 'app-chart-container',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="getClasses()" [attr.data-chart]="chartId" [style]="cssVars">
      <div class="flex aspect-video justify-center items-center text-xs text-muted-foreground border border-dashed rounded-lg bg-muted/20 p-4 text-center">
        Chart Placeholder<br />(Recharts is React-only, use ng2-charts or ngx-echarts)
      </div>
      <ng-content></ng-content>
    </div>
  `
})
export class ChartContainerComponent {
    @Input() className = '';
    @Input() config: any = {};
    @Input() chartId = 'chart-' + Math.random().toString(36).substring(2, 9);

    getClasses() {
        return `flex flex-col gap-4 [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden ${this.className}`.trim();
    }

    get cssVars() {
        let vars: any = {};
        if (this.config) {
            Object.entries(this.config).forEach(([key, value]: [string, any]) => {
                if (value && value.color) {
                    vars[`--color-${key}`] = value.color;
                }
            });
        }
        return vars;
    }
}

export const ChartModule = [ChartContainerComponent];
