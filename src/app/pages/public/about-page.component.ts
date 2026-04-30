import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Target, Users, Zap, Heart, Shield, TrendingUp, ArrowRight } from 'lucide-angular';

@Component({
    selector: 'app-about-page',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    template: `
    <div class="min-h-screen">
      <!-- Hero -->
      <section class="bg-gradient-to-br from-background via-primary/5 to-accent/5 py-20">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center max-w-3xl mx-auto">
            <div class="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">About Us</div>
            <h1 class="mb-6">Revolutionizing <span class="text-primary">amateur</span> sport</h1>
            <p class="text-xl text-muted-foreground">StreetLeague was born from a shared passion: making amateur sport accessible, organized and professional for all players and field owners.</p>
          </div>
        </div>
      </section>

      <!-- Mission -->
      <section class="py-20 bg-card">
        <div class="max-w-7xl mx-auto px-4">
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div class="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">Our Mission</div>
              <h2 class="mb-6">Connecting sport enthusiasts</h2>
              <p class="text-lg text-muted-foreground mb-6">Our mission is to create a complete sports ecosystem that facilitates amateur sports practice, simplifies field management and encourages an active and engaged community.</p>
              <a routerLink="/browse" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg">
                Discover fields
                <lucide-icon [img]="ArrowRightIcon" class="w-5 h-5"></lucide-icon>
              </a>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-primary/10 rounded-2xl p-6 text-center"><div class="text-4xl font-bold text-primary mb-2">10k+</div><div class="text-sm text-muted-foreground">Active players</div></div>
              <div class="bg-accent/10 rounded-2xl p-6 text-center"><div class="text-4xl font-bold text-accent mb-2">500+</div><div class="text-sm text-muted-foreground">Fields</div></div>
              <div class="bg-primary/10 rounded-2xl p-6 text-center"><div class="text-4xl font-bold text-primary mb-2">50k+</div><div class="text-sm text-muted-foreground">Matches</div></div>
              <div class="bg-accent/10 rounded-2xl p-6 text-center"><div class="text-4xl font-bold text-accent mb-2">98%</div><div class="text-sm text-muted-foreground">Satisfaction</div></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Values -->
      <section class="py-20 bg-background">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-16">
            <div class="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">Our Values</div>
            <h2 class="mb-4">What drives us</h2>
            <p class="text-xl text-muted-foreground max-w-2xl mx-auto">Principles that guide every decision and action</p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div *ngFor="let value of values" class="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all group">
              <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <lucide-icon [img]="value.icon" class="w-6 h-6 text-primary"></lucide-icon>
              </div>
              <h3 class="mb-3">{{ value.title }}</h3>
              <p class="text-muted-foreground">{{ value.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Story -->
      <section class="py-20 bg-card">
        <div class="max-w-7xl mx-auto px-4">
          <div class="max-w-3xl mx-auto">
            <div class="text-center mb-12">
              <div class="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">Our Story</div>
              <h2 class="mb-4">How it all started</h2>
            </div>
            <div class="space-y-8">
              <div *ngFor="let s of story; let last = last" class="rounded-2xl p-8 border"
                [class.bg-background]="!last" [class.border-border]="!last"
                [class.bg-gradient-to-br]="last" [class.from-primary\/10]="last" [class.to-accent\/10]="last" [class.border-primary\/20]="last" [class.border-2]="last">
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                    [class.bg-primary\/10]="!last" [class.text-primary]="!last"
                    [class.bg-primary]="last" [class.text-primary-foreground]="last">
                    {{ s.year }}
                  </div>
                  <div>
                    <h3 class="mb-3">{{ s.title }}</h3>
                    <p class="text-muted-foreground">{{ s.desc }}</p>
                    <a *ngIf="last" routerLink="/auth/signup" class="inline-flex items-center gap-2 px-6 py-3 mt-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all">
                      Join the adventure
                      <lucide-icon [img]="ArrowRightIcon" class="w-5 h-5"></lucide-icon>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div class="max-w-4xl mx-auto px-4 text-center">
          <h2 class="mb-6">Be part of the story</h2>
          <p class="text-xl text-muted-foreground mb-8">Join thousands of enthusiasts who have chosen StreetLeague</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/auth/signup" class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl">
              Start for free
              <lucide-icon [img]="ArrowRightIcon" class="w-5 h-5"></lucide-icon>
            </a>
            <a routerLink="/contact" class="inline-flex items-center justify-center px-8 py-4 border-2 border-border bg-card rounded-xl font-semibold hover:bg-muted transition-all">
              Contact us
            </a>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class AboutPageComponent {
    readonly ArrowRightIcon = ArrowRight;

    values = [
        { icon: Target, title: 'Excellence', description: "We aim for excellence in everything we do." },
        { icon: Users, title: 'Community', description: "We believe in the power of community and encourage mutual aid." },
        { icon: Zap, title: 'Innovation', description: 'We constantly innovate to offer the best features.' },
        { icon: Heart, title: 'Passion', description: 'Our passion for sport guides every aspect of our platform.' },
        { icon: Shield, title: 'Security', description: 'Data and transaction security is our top priority.' },
        { icon: TrendingUp, title: 'Growth', description: 'We help our users grow in skills or business.' },
    ];

    story = [
        { year: '2022', title: 'The Genesis', desc: 'It all started with a shared frustration: finding an available sports field was complicated. We decided to create a solution.', last: false },
        { year: '2023', title: 'The Launch', desc: 'After a year of intensive development, StreetLeague was born. The first fields joined the platform.', last: false },
        { year: '2024', title: 'Expansion', desc: 'StreetLeague reached 500 fields and 10,000 active players. We launched new features like performance tracking.', last: false },
        { year: '2026', title: 'The Future', desc: 'Today, we continue to innovate to become the reference for amateur sport.', last: true },
    ];
}
