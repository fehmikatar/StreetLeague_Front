import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Home, Search } from 'lucide-angular';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    template: `
    <div class="min-h-screen bg-background flex items-center justify-center p-4">
      <div class="text-center max-w-md">
        <div class="mb-8">
          <div class="text-9xl font-bold text-primary mb-4">404</div>
          <h1 class="mb-4">Page Not Found</h1>
          <p class="text-muted-foreground mb-8">Oops! The page you're looking for doesn't exist. It might have been moved or deleted.</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a routerLink="/" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
            <lucide-icon [img]="HomeIcon" class="h-5 w-5"></lucide-icon>
            Go Home
          </a>
          <button (click)="goBack()" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/70 transition-all">
            <lucide-icon [img]="SearchIcon" class="h-5 w-5"></lucide-icon>
            Go Back
          </button>
        </div>
      </div>
    </div>
  `,
})
export class NotFoundComponent {
    readonly HomeIcon = Home;
    readonly SearchIcon = Search;
    goBack() { history.back(); }
}
