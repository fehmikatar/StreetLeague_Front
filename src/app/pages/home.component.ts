import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Trophy, Users, Target, TrendingUp, UserPlus, Plus } from 'lucide-angular';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    template: `
    <div class="min-h-screen bg-background">
      <!-- Hero Section -->
      <div class="relative h-64 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20"></div>
        <img
          src="https://images.unsplash.com/photo-1766823968084-a7b6f184fab5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
          alt="Stadium"
          class="h-full w-full object-cover opacity-30"
          onerror="this.style.display='none'"
        />
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="text-center">
            <h1 class="mb-2">Welcome Back, Jordan! 👋</h1>
            <p class="text-muted-foreground">Ready to dominate the street league today?</p>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-8 max-w-7xl">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div *ngFor="let stat of stats" class="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20">
            <div class="flex items-start justify-between mb-4">
              <div class="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <lucide-icon [img]="stat.icon" class="h-6 w-6 text-primary"></lucide-icon>
              </div>
              <span class="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg">{{ stat.change }}</span>
            </div>
            <div class="text-3xl font-bold mb-1">{{ stat.value }}</div>
            <div class="text-sm text-muted-foreground">{{ stat.label }}</div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Profile & Badges -->
          <div class="space-y-6">
            <!-- Profile Card -->
            <div class="bg-card rounded-2xl p-6 border border-border">
              <h3 class="mb-6">Your Sports Profile</h3>
              <div class="flex items-start gap-4 mb-6">
                <div class="relative">
                  <img
                    src="https://images.unsplash.com/photo-1762025930827-9f1dda45aff8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200"
                    alt="Profile"
                    class="h-24 w-24 rounded-2xl object-cover"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
                  />
                  <div class="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-accent items-center justify-center text-primary-foreground font-bold text-2xl" style="display:none">JS</div>
                  <div class="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary border-4 border-card flex items-center justify-center">
                    <span class="text-xs font-bold text-primary-foreground">12</span>
                  </div>
                </div>
                <div class="flex-1">
                  <h4 class="mb-1">Jordan Smith</h4>
                  <p class="text-sm text-muted-foreground mb-3">Multi-Sport Athlete • Level 12</p>
                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-muted-foreground">Next Level</span>
                      <span class="font-semibold">2,450 / 3,000 XP</span>
                    </div>
                    <div class="h-2 bg-muted rounded-full overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-primary to-accent transition-all" style="width:82%"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <div class="text-center p-3 bg-muted/50 rounded-xl">
                  <div class="text-2xl font-bold text-primary">156</div>
                  <div class="text-xs text-muted-foreground">Matches</div>
                </div>
                <div class="text-center p-3 bg-muted/50 rounded-xl">
                  <div class="text-2xl font-bold text-accent">89</div>
                  <div class="text-xs text-muted-foreground">Wins</div>
                </div>
                <div class="text-center p-3 bg-muted/50 rounded-xl">
                  <div class="text-2xl font-bold" style="color:#06D6A0">32h</div>
                  <div class="text-xs text-muted-foreground">Played</div>
                </div>
              </div>
            </div>

            <!-- Badges -->
            <div class="bg-card rounded-2xl p-6 border border-border">
              <div class="flex items-center justify-between mb-6">
                <h3>Badges & Achievements</h3>
                <span class="text-sm text-muted-foreground">4/6 Earned</span>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <div *ngFor="let badge of badges" class="text-center p-4 rounded-xl border-2 transition-all"
                  [class.border-primary]="badge.earned" [class.bg-primary\/5]="badge.earned"
                  [class.border-border]="!badge.earned" [class.bg-muted\/30]="!badge.earned" [class.opacity-50]="!badge.earned">
                  <div class="text-4xl mb-2">{{ badge.icon }}</div>
                  <div class="text-xs font-semibold">{{ badge.name }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Team Roster -->
          <div class="bg-card rounded-2xl p-6 border border-border">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="mb-1">Your Team Roster</h3>
                <p class="text-sm text-muted-foreground">Thunder Strikers</p>
              </div>
              <div class="flex gap-2">
                <button class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                  <lucide-icon [img]="UserPlusIcon" class="h-4 w-4"></lucide-icon>
                  <span class="hidden sm:inline">Recruit</span>
                </button>
                <button class="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/30">
                  <lucide-icon [img]="PlusIcon" class="h-4 w-4"></lucide-icon>
                  <span class="hidden sm:inline">Join Team</span>
                </button>
              </div>
            </div>
            <div class="space-y-3">
              <div *ngFor="let member of teamRoster" class="flex items-center gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all">
                <div class="relative">
                  <div class="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                    {{ member.avatar }}
                  </div>
                  <div class="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card"
                    [class.bg-primary]="member.status === 'online'" [class.bg-muted]="member.status !== 'online'"></div>
                </div>
                <div class="flex-1">
                  <div class="font-semibold">{{ member.name }}</div>
                  <div class="text-sm text-muted-foreground">{{ member.role }}</div>
                </div>
                <button class="px-3 py-1 text-sm rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all">View</button>
              </div>
            </div>
            <button class="w-full mt-4 py-3 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary">
              + Add More Members
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HomeComponent {
    readonly UserPlusIcon = UserPlus;
    readonly PlusIcon = Plus;

    stats = [
        { label: 'Matches Won', value: '48', icon: Trophy, change: '+12%' },
        { label: 'Team Rating', value: '4.8', icon: Target, change: '+0.3' },
        { label: 'Active Members', value: '24', icon: Users, change: '+5' },
        { label: 'Win Rate', value: '72%', icon: TrendingUp, change: '+8%' },
    ];

    badges = [
        { name: 'Champion', icon: '🏆', earned: true },
        { name: 'MVP', icon: '⭐', earned: true },
        { name: 'Team Player', icon: '🤝', earned: true },
        { name: 'Rookie Legend', icon: '🎯', earned: false },
        { name: 'Marathon', icon: '🏃', earned: true },
        { name: 'Perfect Score', icon: '💯', earned: false },
    ];

    teamRoster = [
        { id: 1, name: 'Alex Rivera', role: 'Captain', avatar: 'AR', status: 'online' },
        { id: 2, name: 'Morgan Lee', role: 'Forward', avatar: 'ML', status: 'online' },
        { id: 3, name: 'Jordan Chen', role: 'Defender', avatar: 'JC', status: 'offline' },
        { id: 4, name: 'Taylor Brooks', role: 'Midfielder', avatar: 'TB', status: 'online' },
        { id: 5, name: 'Casey Kim', role: 'Goalkeeper', avatar: 'CK', status: 'offline' },
    ];
}
