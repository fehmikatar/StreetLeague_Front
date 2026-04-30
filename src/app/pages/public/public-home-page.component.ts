import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Trophy, Users, MapPin, Activity, ArrowRight, Check, Star, Calendar, Shield } from 'lucide-angular';

@Component({
    selector: 'app-public-home-page',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    template: `
    <div class="min-h-screen">
      <!-- Hero -->
      <section class="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <div class="max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div class="text-center md:text-left">
              <div class="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
                🏆 #1 Amateur Sports Platform
              </div>
              <h1 class="mb-6 text-4xl md:text-5xl lg:text-6xl">
                Your <span class="text-primary">premium</span> sports ecosystem
              </h1>
              <p class="text-lg md:text-xl text-muted-foreground mb-8">
                Join thousands of players and field owners. Organize, play and grow your passion for sport.
              </p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a routerLink="/auth/signup" class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-105">
                  Get started now
                  <lucide-icon [img]="ArrowRightIcon" class="w-5 h-5"></lucide-icon>
                </a>
                <a routerLink="/browse" class="inline-flex items-center justify-center px-8 py-4 border-2 border-border rounded-xl font-semibold hover:bg-muted transition-all">
                  Explore fields
                </a>
              </div>
              <div class="grid grid-cols-3 gap-4 mt-12">
                <div class="text-center md:text-left">
                  <div class="text-3xl font-bold text-primary">10k+</div>
                  <div class="text-sm text-muted-foreground">Active players</div>
                </div>
                <div class="text-center md:text-left">
                  <div class="text-3xl font-bold text-primary">500+</div>
                  <div class="text-sm text-muted-foreground">Fields</div>
                </div>
                <div class="text-center md:text-left">
                  <div class="text-3xl font-bold text-primary">50k+</div>
                  <div class="text-sm text-muted-foreground">Matches played</div>
                </div>
              </div>
            </div>
            <div class="relative">
              <div class="aspect-square bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 rounded-3xl shadow-2xl flex items-center justify-center">
                <div class="text-center p-8">
                  <lucide-icon [img]="TrophyIcon" class="w-32 h-32 text-primary mx-auto mb-4 opacity-50"></lucide-icon>
                  <p class="text-xl font-semibold text-foreground">Book your field</p>
                  <p class="text-muted-foreground">Play now</p>
                </div>
              </div>
              <div class="absolute top-10 -left-4 bg-card border border-border rounded-2xl p-4 shadow-lg">
                <div class="flex items-center gap-2">
                  <div class="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <lucide-icon [img]="CalendarIcon" class="w-5 h-5 text-primary"></lucide-icon>
                  </div>
                  <div>
                    <div class="text-sm font-semibold">+42 matches</div>
                    <div class="text-xs text-muted-foreground">Today</div>
                  </div>
                </div>
              </div>
              <div class="absolute bottom-10 -right-4 bg-card border border-border rounded-2xl p-4 shadow-lg">
                <div class="flex items-center gap-2">
                  <div class="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                    <lucide-icon [img]="StarIcon" class="w-5 h-5 text-accent"></lucide-icon>
                  </div>
                  <div>
                    <div class="text-sm font-semibold">4.8/5</div>
                    <div class="text-xs text-muted-foreground">Average rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section id="features" class="py-20 bg-card">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-16">
            <div class="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">Features</div>
            <h2 class="mb-4">Everything you need</h2>
            <p class="text-xl text-muted-foreground max-w-2xl mx-auto">A complete platform to manage your amateur sports activity</p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div *ngFor="let feature of features" class="bg-background rounded-2xl p-6 border border-border hover:border-primary/50 transition-all group hover:shadow-xl">
              <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all group-hover:scale-110">
                <lucide-icon [img]="feature.icon" class="w-6 h-6 text-primary"></lucide-icon>
              </div>
              <h3 class="mb-2 text-lg">{{ feature.title }}</h3>
              <p class="text-muted-foreground">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="py-20 bg-background">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-16">
            <div class="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">How it works</div>
            <h2 class="mb-4">Simple and fast</h2>
            <p class="text-xl text-muted-foreground max-w-2xl mx-auto">Start playing in 3 simple steps</p>
          </div>
          <div class="grid md:grid-cols-3 gap-8">
            <div *ngFor="let step of steps; let i = index" class="relative">
              <div class="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all">
                <div class="text-6xl font-bold text-primary/10 mb-4">{{ step.num }}</div>
                <h3 class="mb-3">{{ step.title }}</h3>
                <p class="text-muted-foreground">{{ step.description }}</p>
              </div>
              <div *ngIf="i < 2" class="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- For Owners -->
      <section class="py-20 bg-card">
        <div class="max-w-7xl mx-auto px-4">
          <div class="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 rounded-3xl p-8 md:p-12 border-2 border-primary/20">
            <div class="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div class="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-semibold mb-4">For Owners</div>
                <h2 class="mb-6">Own a field?</h2>
                <p class="text-lg text-muted-foreground mb-6">List your sports space and maximize its use.</p>
                <ul class="space-y-3 mb-8">
                  <li *ngFor="let item of ownerBenefits" class="flex items-center gap-3">
                    <div class="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <lucide-icon [img]="CheckIcon" class="w-4 h-4 text-primary-foreground"></lucide-icon>
                    </div>
                    <span>{{ item }}</span>
                  </li>
                </ul>
                <a routerLink="/auth/signup" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:scale-105">
                  Add my field
                  <lucide-icon [img]="ArrowRightIcon" class="w-5 h-5"></lucide-icon>
                </a>
              </div>
              <div class="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl shadow-2xl flex items-center justify-center">
                <div class="text-center p-8">
                  <lucide-icon [img]="ShieldIcon" class="w-32 h-32 text-primary mx-auto mb-4 opacity-50"></lucide-icon>
                  <p class="text-xl font-semibold text-foreground">Secure management</p>
                  <p class="text-muted-foreground">Total control</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials -->
      <section class="py-20 bg-background">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-16">
            <div class="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">Testimonials</div>
            <h2 class="mb-4">What they think</h2>
            <p class="text-xl text-muted-foreground max-w-2xl mx-auto">Thousands of players and owners trust us</p>
          </div>
          <div class="grid md:grid-cols-3 gap-8">
            <div *ngFor="let t of testimonials" class="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all">
              <div class="flex gap-1 mb-4">
                <lucide-icon *ngFor="let s of getStars(t.rating)" [img]="StarIcon" class="w-5 h-5 fill-primary text-primary"></lucide-icon>
              </div>
              <p class="text-muted-foreground mb-6">{{ t.content }}</p>
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                  {{ t.name.substring(0, 2).toUpperCase() }}
                </div>
                <div>
                  <div class="font-semibold">{{ t.name }}</div>
                  <div class="text-sm text-muted-foreground">{{ t.role }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div class="max-w-4xl mx-auto px-4 text-center">
          <h2 class="mb-6">Ready to start?</h2>
          <p class="text-xl text-muted-foreground mb-8">Join StreetLeague today and transform your sports experience</p>
          <a routerLink="/auth/signup" class="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-105">
            Create my account for free
            <lucide-icon [img]="ArrowRightIcon" class="w-5 h-5"></lucide-icon>
          </a>
          <p class="text-sm text-muted-foreground mt-4">No credit card required • Free cancellation</p>
        </div>
      </section>
    </div>
  `,
})
export class PublicHomePageComponent {
    readonly TrophyIcon = Trophy;
    readonly StarIcon = Star;
    readonly ArrowRightIcon = ArrowRight;
    readonly CheckIcon = Check;
    readonly ShieldIcon = Shield;
    readonly CalendarIcon = Calendar;

    features = [
        { icon: Trophy, title: 'Matches & Tournaments', description: 'Organize and participate in competitions' },
        { icon: MapPin, title: 'Field Booking', description: 'Find and book sports spaces' },
        { icon: Users, title: 'Team Management', description: 'Create and manage your teams easily' },
        { icon: Activity, title: 'Performance Tracking', description: 'Analyze your progress and health' },
    ];

    steps = [
        { num: '01', title: 'Create your account', description: 'Sign up for free in seconds' },
        { num: '02', title: 'Find a field', description: 'Browse available fields near you' },
        { num: '03', title: 'Book and play', description: 'Book your slot and enjoy the game' },
    ];

    ownerBenefits = [
        'Simplified booking management',
        'Visibility to thousands of players',
        'Secure payment system',
        'Detailed statistics and analysis',
    ];

    testimonials = [
        { name: 'Marc Dupont', role: 'Amateur player', content: 'StreetLeague has transformed the way I play. I easily find fields and game partners.', rating: 5 },
        { name: 'Sophie Martin', role: 'Field owner', content: 'Thanks to this platform, my field is 90% booked. Management is simplified and effective.', rating: 5 },
        { name: 'Ahmed Benali', role: 'Team captain', content: 'Organizing matches and tournaments has never been easier. An indispensable tool!', rating: 5 },
    ];

    getStars(n: number) { return Array(n).fill(0); }
}
