import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import {
    LucideAngularModule, Home, Users, Trophy, MapPin,
    MessageSquare, Activity, Gift, Settings, Map,
    LogOut, Menu, X, Bell, User, Heart
} from 'lucide-angular';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterModule, LucideAngularModule],
    templateUrl: './app-layout.component.html',
})
export class AppLayoutComponent implements OnInit {
    userName = '';
    userEmail = '';
    userType = '';
    mobileMenuOpen = false;
    unreadNotifications = 3;

    readonly HomeIcon = Home;
    readonly UsersIcon = Users;
    readonly TrophyIcon = Trophy;
    readonly MapPinIcon = MapPin;
    readonly MessageSquareIcon = MessageSquare;
    readonly ActivityIcon = Activity;
    readonly GiftIcon = Gift;
    readonly SettingsIcon = Settings;
    readonly MapIcon = Map;
    readonly LogOutIcon = LogOut;
    readonly MenuIcon = Menu;
    readonly XIcon = X;
    readonly BellIcon = Bell;
    readonly UserIcon = User;
    readonly HeartIcon = Heart;

    navItems = [
        { path: '/app', icon: this.HomeIcon, label: 'Dashboard' },
        { path: '/app/home', icon: this.HomeIcon, label: 'Home' },
        { path: '/app/team', icon: this.UsersIcon, label: 'Team' },
        { path: '/app/matches', icon: this.TrophyIcon, label: 'Matches' },
        { path: '/app/booking', icon: this.MapPinIcon, label: 'Booking' },
        { path: '/app/fields', icon: this.MapIcon, label: 'Terrains' },
        { path: '/app/community', icon: this.MessageSquareIcon, label: 'Community' },
        { path: '/app/performance', icon: this.ActivityIcon, label: 'Performance' },
        { path: '/app/healthcare', icon: this.HeartIcon, label: 'Santé' },
        { path: '/app/sponsors', icon: this.GiftIcon, label: 'Sponsors' },
        { path: '/app/user-profile', icon: this.UserIcon, label: 'Mon Profil' },
        { path: '/app/notifications', icon: this.BellIcon, label: 'Notifications' },
        { path: '/app/admin', icon: this.SettingsIcon, label: 'Admin' },
    ];

    constructor(private router: Router) { }

    ngOnInit() {
        // Check authentication
        const token = localStorage.getItem('auth_token');
        if (!token) {
            this.router.navigate(['/auth/login']);
            return;
        }

        // Load user data
        this.userName = localStorage.getItem('user_name') || 'Utilisateur';
        this.userEmail = localStorage.getItem('user_email') || '';
        this.userType = localStorage.getItem('user_type') || 'player';
    }

    handleLogout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_type');
        this.router.navigate(['/auth/login']);
    }

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }

    closeMobileMenu() {
        this.mobileMenuOpen = false;
    }

    getUserInitials(): string {
        return this.userName.substring(0, 2).toUpperCase();
    }

    get isOwner(): boolean {
        return this.userType === 'owner';
    }
}
