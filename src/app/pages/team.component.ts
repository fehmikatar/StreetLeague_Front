import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Users, Crown, Shield, Zap, MessageCircle, Calendar, Trophy, Plus } from 'lucide-angular';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Team Header -->
      <div class="relative h-48 overflow-hidden border-b border-border">
        <div class="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-20"></div>
        <div class="absolute inset-0 flex items-center">
          <div class="container mx-auto px-4 max-w-7xl">
            <div class="flex items-center gap-6">
              <div class="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl border-4 border-background">
                <lucide-icon [name]="ShieldIcon" [size]="48" class="text-white"></lucide-icon>
              </div>
              <div>
                <h1 class="mb-2">Thunder Strikers</h1>
                <div class="flex items-center gap-4 text-sm text-muted-foreground">
                  <span class="flex items-center gap-1"><lucide-icon [name]="UsersIcon" [size]="16"></lucide-icon> 6 Members</span>
                  <span class="flex items-center gap-1"><lucide-icon [name]="TrophyIcon" [size]="16"></lucide-icon> Rank #3</span>
                  <span class="flex items-center gap-1"><lucide-icon [name]="ZapIcon" [size]="16"></lucide-icon> 2,450 Points</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-8 max-w-7xl">
        <!-- Team Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-card rounded-2xl p-6 border border-border text-center"><div class="text-3xl font-bold text-primary mb-1">48</div><div class="text-sm text-muted-foreground">Matches Won</div></div>
          <div class="bg-card rounded-2xl p-6 border border-border text-center"><div class="text-3xl font-bold text-accent mb-1">156</div><div class="text-sm text-muted-foreground">Total Goals</div></div>
          <div class="bg-card rounded-2xl p-6 border border-border text-center"><div class="text-3xl font-bold text-green-500 mb-1">72%</div><div class="text-sm text-muted-foreground">Win Rate</div></div>
          <div class="bg-card rounded-2xl p-6 border border-border text-center"><div class="text-3xl font-bold mb-1">4.8</div><div class="text-sm text-muted-foreground">Team Rating</div></div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Team Members -->
          <div class="lg:col-span-2">
            <div class="bg-card rounded-2xl p-6 border border-border">
              <div class="flex items-center justify-between mb-6">
                <h3>Team Members</h3>
                <button (click)="recruitPlayer()" class="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">+ Recruit Player</button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div *ngFor="let member of teamMembers" class="bg-muted/30 rounded-2xl p-5 hover:bg-muted/50 transition-all border border-transparent hover:border-primary/30">
                  <div class="flex items-start gap-4 mb-4">
                    <div class="relative">
                      <div class="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                        {{ member.avatar }}
                      </div>
                      <div class="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card"
                        [ngClass]="member.status === 'online' ? 'bg-green-500' : 'bg-muted'"></div>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <h4 class="text-base">{{ member.name }}</h4>
                        <lucide-icon *ngIf="member.role==='Captain'" [name]="CrownIcon" [size]="16" class="text-accent"></lucide-icon>
                      </div>
                      <p class="text-sm text-muted-foreground mb-1">{{ member.position }}</p>
                      <span class="text-xs px-2 py-1 bg-primary/10 text-primary rounded-lg">{{ member.role }}</span>
                    </div>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="text-center p-2 bg-background/50 rounded-lg"><div class="font-bold text-primary">{{ member.stats.matches }}</div><div class="text-xs text-muted-foreground">Matches</div></div>
                    <div class="text-center p-2 bg-background/50 rounded-lg"><div class="font-bold text-accent">{{ member.stats.goals }}</div><div class="text-xs text-muted-foreground">Goals</div></div>
                    <div class="text-center p-2 bg-background/50 rounded-lg"><div class="font-bold text-green-500">{{ member.stats.assists }}</div><div class="text-xs text-muted-foreground">Assists</div></div>
                  </div>
                  <div class="flex gap-2 mt-4">
                    <button (click)="sendMessage(member.name)" class="flex-1 py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all">
                      <lucide-icon [name]="MessageCircleIcon" [size]="16" class="inline mr-1"></lucide-icon>Message
                    </button>
                    <button (click)="viewProfile(member)" class="flex-1 py-2 text-sm bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-all">View Profile</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <div class="bg-card rounded-2xl p-6 border border-border">
              <h3 class="mb-6">Upcoming Events</h3>
              <div class="space-y-4">
                <div *ngFor="let event of upcomingEvents" class="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all">
                  <div class="flex items-start gap-3">
                    <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <lucide-icon [name]="CalendarIcon" [size]="20" class="text-primary"></lucide-icon>
                    </div>
                    <div>
                      <h4 class="text-sm font-semibold mb-1">{{ event.title }}</h4>
                      <p class="text-xs text-muted-foreground mb-1">{{ event.date }} • {{ event.time }}</p>
                      <p class="text-xs text-accent">{{ event.location }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-card rounded-2xl p-6 border border-border">
              <h3 class="mb-4">Quick Actions</h3>
              <div class="space-y-3">
                <button (click)="router.navigate(['/app/booking'])" class="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">Schedule Practice</button>
                <button (click)="router.navigate(['/app/matches'])" class="w-full py-3 bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/30">Start Challenge</button>
                <button (click)="showToast('Team Settings - coming soon!')" class="w-full py-3 bg-muted text-foreground rounded-xl hover:bg-muted/70 transition-all">Team Settings</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast notification -->
      <div *ngIf="toast" class="fixed bottom-6 right-6 bg-card border border-border rounded-xl px-4 py-3 shadow-xl text-sm font-medium text-foreground z-50 animate-bounce">
        {{ toast }}
      </div>
    </div>
  `,
})
export class TeamComponent {
  readonly ShieldIcon = Shield;
  readonly UsersIcon = Users;
  readonly TrophyIcon = Trophy;
  readonly ZapIcon = Zap;
  readonly CrownIcon = Crown;
  readonly MessageCircleIcon = MessageCircle;
  readonly CalendarIcon = Calendar;
  readonly PlusIcon = Plus;

  toast: string | null = null;

  constructor(public router: Router) { }

  teamMembers = [
    { id: 1, name: 'Alex Rivera', role: 'Captain', position: 'Forward', avatar: 'AR', stats: { matches: 45, goals: 32, assists: 18 }, status: 'online' },
    { id: 2, name: 'Morgan Lee', role: 'Vice Captain', position: 'Midfielder', avatar: 'ML', stats: { matches: 43, goals: 15, assists: 28 }, status: 'online' },
    { id: 3, name: 'Jordan Chen', role: 'Member', position: 'Defender', avatar: 'JC', stats: { matches: 40, goals: 5, assists: 12 }, status: 'offline' },
    { id: 4, name: 'Taylor Brooks', role: 'Member', position: 'Midfielder', avatar: 'TB', stats: { matches: 38, goals: 20, assists: 15 }, status: 'online' },
    { id: 5, name: 'Casey Kim', role: 'Member', position: 'Goalkeeper', avatar: 'CK', stats: { matches: 42, goals: 0, assists: 8 }, status: 'offline' },
    { id: 6, name: 'Sam Taylor', role: 'Member', position: 'Forward', avatar: 'ST', stats: { matches: 35, goals: 28, assists: 10 }, status: 'online' },
  ];

  upcomingEvents = [
    { id: 1, title: 'Team Practice', date: 'Feb 3, 2026', time: '6:00 PM', location: 'Central Arena' },
    { id: 2, title: 'Strategy Meeting', date: 'Feb 5, 2026', time: '7:30 PM', location: 'Online' },
    { id: 3, title: 'Championship Match', date: 'Feb 8, 2026', time: '5:00 PM', location: 'City Stadium' },
  ];

  sendMessage(name: string) {
    this.showToast(`Message envoyé à ${name} ! 💬`);
  }

  viewProfile(member: any) {
    this.showToast(`Profil de ${member.name} — bientôt disponible`);
  }

  recruitPlayer() {
    this.showToast('Invitation envoyée ! Le joueur recevra un email. ✅');
  }

  showToast(msg: string) {
    this.toast = msg;
    setTimeout(() => this.toast = null, 3000);
  }
}
