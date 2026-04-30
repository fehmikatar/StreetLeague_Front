import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Trophy, MapPin, Calendar, Activity, Users, TrendingUp, Clock, Star, ArrowRight, Bell, Target } from 'lucide-angular';
import { Subscription } from 'rxjs';
import { BookingService, Reservation, Notification } from '../services/booking.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background p-4 md:p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Welcome Header -->
        <div class="mb-8">
          <h1 class="mb-2">Welcome, <span class="text-primary">{{ userName }}</span> 👋</h1>
          <p class="text-muted-foreground">Here is an overview of your sports activity</p>
        </div>

        <!-- Quick Actions -->
        <div class="grid md:grid-cols-4 gap-4 mb-8">
          <a routerLink="/app/booking" class="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <lucide-icon [img]="CalendarIcon" class="w-6 h-6 text-primary"></lucide-icon>
              </div>
              <div><div class="font-semibold mb-1">Book</div><div class="text-sm text-muted-foreground">A field</div></div>
            </div>
          </a>
          <a routerLink="/app/matches" class="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <lucide-icon [img]="TrophyIcon" class="w-6 h-6 text-accent"></lucide-icon>
              </div>
              <div><div class="font-semibold mb-1">Matches</div><div class="text-sm text-muted-foreground">View all</div></div>
            </div>
          </a>
          <a routerLink="/app/team" class="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <lucide-icon [img]="UsersIcon" class="w-6 h-6 text-primary"></lucide-icon>
              </div>
              <div><div class="font-semibold mb-1">Team</div><div class="text-sm text-muted-foreground">Manage</div></div>
            </div>
          </a>
          <a routerLink="/app/performance" class="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <lucide-icon [img]="ActivityIcon" class="w-6 h-6 text-accent"></lucide-icon>
              </div>
              <div><div class="font-semibold mb-1">Stats</div><div class="text-sm text-muted-foreground">View performance</div></div>
            </div>
          </a>
        </div>

        <!-- Stats Grid -->
        <div class="grid md:grid-cols-4 gap-4 mb-8">
          <div *ngFor="let stat of stats" class="bg-card rounded-2xl p-6 border border-border">
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <lucide-icon [img]="stat.icon" class="w-6 h-6 text-primary"></lucide-icon>
              </div>
              <span class="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-lg">{{ stat.trend }}</span>
            </div>
            <div class="text-3xl font-bold mb-1">{{ stat.value }}</div>
            <div class="text-sm text-muted-foreground">{{ stat.label }}</div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Upcoming Matches -->
          <div class="lg:col-span-2">
            <div class="bg-card rounded-2xl p-6 border border-border">
              <div class="flex items-center justify-between mb-6">
                <h3 class="flex items-center gap-2">
                  <lucide-icon [img]="CalendarIcon" class="w-5 h-5 text-primary"></lucide-icon>
                  Upcoming Matches {{ upcomingMatches.length > 0 ? '(' + upcomingMatches.length + ')' : '' }}
                </h3>
                <a routerLink="/app/matches" class="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
                  View all <lucide-icon [img]="ArrowRightIcon" class="w-4 h-4"></lucide-icon>
                </a>
              </div>
              <div class="space-y-4">
                <div *ngIf="upcomingMatches.length === 0" class="text-center py-6 text-muted-foreground">
                  No matches scheduled at the moment.
                </div>
                <a *ngFor="let match of upcomingMatches" [routerLink]="['/app/matches', match.id]" class="block bg-muted/50 rounded-xl p-4 hover:bg-muted transition-all group">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">{{ match.type }}</span>
                        <h4 class="font-semibold group-hover:text-primary transition-colors">{{ match.title }}</h4>
                      </div>
                      <div class="flex items-center gap-4 text-sm text-muted-foreground">
                        <div class="flex items-center gap-1"><lucide-icon [img]="MapPinIcon" class="w-4 h-4"></lucide-icon><span>{{ match.location }}</span></div>
                        <div class="flex items-center gap-1"><lucide-icon [img]="ClockIcon" class="w-4 h-4"></lucide-icon><span>{{ match.time }} ({{match.duration}}h)</span></div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-sm font-semibold">{{ formatDate(match.date) }}</div>
                    </div>
                  </div>
                </a>
                <a routerLink="/app/booking" class="block bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 text-center border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all mt-4">
                  <lucide-icon [img]="TargetIcon" class="w-8 h-8 text-primary mx-auto mb-2"></lucide-icon>
                  <div class="font-semibold mb-1">Organize a new match</div>
                  <div class="text-sm text-muted-foreground">Book a field and invite your team</div>
                </a>
              </div>
            </div>
          </div>

          <!-- Recent Activity & Performance -->
          <div class="space-y-6">
            <div class="bg-card rounded-2xl p-6 border border-border">
              <div class="flex items-center justify-between mb-6">
                <h3 class="flex items-center gap-2"><lucide-icon [img]="BellIcon" class="w-5 h-5 text-accent"></lucide-icon>Recent Activity</h3>
                <a routerLink="/app/notifications" class="text-sm text-primary font-semibold hover:underline">View all</a>
              </div>
              <div class="space-y-4">
                <div *ngFor="let activity of recentActivities | slice:0:3" class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" [ngClass]="activity.bgColor || 'bg-muted'">
                    <lucide-icon [img]="activity.icon" class="w-5 h-5" [ngClass]="activity.iconColor || 'text-muted-foreground'"></lucide-icon>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold text-sm mb-1">{{ activity.title }}</div>
                    <div class="text-sm text-muted-foreground mb-1 truncate">{{ activity.message }}</div>
                    <div class="text-xs text-muted-foreground">{{ activity.time }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-card rounded-2xl p-6 border border-border">
              <div class="flex items-center gap-2 mb-4">
                <lucide-icon [img]="TrendingUpIcon" class="w-5 h-5 text-primary"></lucide-icon>
                <h3>Progress this month</h3>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Matches won</span><span class="font-semibold">75%</span></div>
                <div class="w-full h-2 bg-muted rounded-full overflow-hidden"><div class="h-full bg-primary rounded-full" style="width:75%"></div></div>
                <div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Monthly goal</span><span class="font-semibold">8/10</span></div>
                <div class="w-full h-2 bg-muted rounded-full overflow-hidden"><div class="h-full bg-accent rounded-full" style="width:80%"></div></div>
              </div>
              <a routerLink="/app/performance" class="mt-6 flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary/10 text-primary rounded-xl font-semibold hover:bg-primary/20 transition-all">
                View full stats <lucide-icon [img]="ArrowRightIcon" class="w-4 h-4"></lucide-icon>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  readonly CalendarIcon = Calendar;
  readonly TrophyIcon = Trophy;
  readonly UsersIcon = Users;
  readonly ActivityIcon = Activity;
  readonly MapPinIcon = MapPin;
  readonly ClockIcon = Clock;
  readonly ArrowRightIcon = ArrowRight;
  readonly BellIcon = Bell;
  readonly TargetIcon = Target;
  readonly TrendingUpIcon = TrendingUp;

  userName = '';

  stats = [
    { label: 'Matches played', value: '24', icon: Trophy, trend: '+12%' },
    { label: 'Hours played', value: '48h', icon: Clock, trend: '+8%' },
    { label: 'Fields visited', value: '12', icon: MapPin, trend: '+3' },
    { label: 'Average rating', value: '4.8', icon: Star, trend: '+0.2' },
  ];

  upcomingMatches: Reservation[] = [];
  recentActivities: Notification[] = [];

  private subs: Subscription = new Subscription();

  constructor(private bookingService: BookingService) { }

  ngOnInit() {
    this.userName = localStorage.getItem('user_name') || 'User';

    const userId = '1'; // Adjust later when user profile is stored in auth token
    this.subs.add(
      this.bookingService.getUserReservations(userId).subscribe(reservations => {
        // Filter only confirmed current/future matches
        this.upcomingMatches = reservations.filter(r => r.status === 'confirmed');
      })
    );
    this.subs.add(
      this.bookingService.notifications$.subscribe(notifs => {
        this.recentActivities = notifs;
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  }
}

