import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, User, Mail, Phone, MapPin, Camera, Edit, Shield, Bell, LogOut } from 'lucide-angular';
import { Router } from '@angular/router';

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <div class="p-6 max-w-3xl mx-auto space-y-6">
      <h1 class="text-2xl font-bold text-foreground">My Profile</h1>

      <!-- Avatar and basic info -->
      <div class="bg-card rounded-xl border border-border p-6">
        <div class="flex items-start gap-6">
          <div class="relative">
            <div class="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              <lucide-icon [name]="userIcon" [size]="40" class="text-primary"></lucide-icon>
            </div>
            <button class="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
              <lucide-icon [name]="cameraIcon" [size]="12"></lucide-icon>
            </button>
          </div>
          <div class="flex-1">
            <div *ngIf="!editing" class="flex items-start justify-between">
              <div>
                <h2 class="text-xl font-semibold text-foreground">{{profile.name}}</h2>
                <p class="text-muted-foreground">{{profile.role}}</p>
                <div class="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span class="flex items-center gap-1"><lucide-icon [name]="mailIcon" [size]="14"></lucide-icon>{{profile.email}}</span>
                  <span class="flex items-center gap-1"><lucide-icon [name]="phoneIcon" [size]="14"></lucide-icon>{{profile.phone}}</span>
                </div>
              </div>
              <button (click)="editing = true" class="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm">
                <lucide-icon [name]="editIcon" [size]="14"></lucide-icon>
                Edit
              </button>
            </div>

            <div *ngIf="editing" class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-muted-foreground mb-1">First Name</label>
                  <input type="text" class="w-full px-3 py-2 bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm" value="Fehmi">
                </div>
                <div>
                  <label class="block text-xs text-muted-foreground mb-1">Last Name</label>
                  <input type="text" class="w-full px-3 py-2 bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm" value="Katar">
                </div>
              </div>
              <input type="email" class="w-full px-3 py-2 bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm" value="fehmi2013katar@gmail.com">
              <div class="flex gap-2">
                <button (click)="editing = false" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors">Save</button>
                <button (click)="editing = false" class="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm hover:bg-muted/80 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4">
        <div *ngFor="let stat of stats" class="bg-card rounded-xl border border-border p-4 text-center">
          <p class="text-2xl font-bold text-primary">{{stat.value}}</p>
          <p class="text-sm text-muted-foreground">{{stat.label}}</p>
        </div>
      </div>

      <!-- Settings sections -->
      <div class="space-y-3">
        <div *ngFor="let section of sections" class="bg-card rounded-xl border border-border p-5">
          <div class="flex items-center gap-3 mb-3">
            <lucide-icon [name]="section.icon" [size]="18" class="text-primary"></lucide-icon>
            <h3 class="font-semibold text-foreground">{{section.title}}</h3>
          </div>
          <div class="space-y-2 pl-7">
            <div *ngFor="let item of section.items" class="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <span class="text-sm text-foreground">{{item.label}}</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [checked]="item.value" class="sr-only peer">
                <div class="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors"></div>
                <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserProfileComponent {
    readonly userIcon = User;
    readonly mailIcon = Mail;
    readonly phoneIcon = Phone;
    readonly locationIcon = MapPin;
    readonly cameraIcon = Camera;
    readonly editIcon = Edit;
    readonly shieldIcon = Shield;
    readonly bellIcon = Bell;

    editing = false;

    profile = { name: 'Fehmi Katar', role: 'Player • Admin', email: 'fehmi2013katar@gmail.com', phone: '+33 6 12 34 56 78' };

    stats = [
        { label: 'Matches Played', value: '47' },
        { label: 'Goals Scored', value: '23' },
        { label: 'Teams', value: '3' },
    ];

    sections = [
        {
            title: 'Notifications', icon: Bell, items: [
                { label: 'New matches', value: true },
                { label: 'Team messages', value: true },
                { label: 'Booking reminders', value: true },
                { label: 'Newsletters', value: false },
            ]
        },
        {
            title: 'Privacy', icon: Shield, items: [
                { label: 'Public profile', value: true },
                { label: 'Share statistics', value: false },
            ]
        }
    ];
}
