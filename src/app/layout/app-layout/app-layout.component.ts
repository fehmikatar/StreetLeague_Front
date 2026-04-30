import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import {
    LucideAngularModule, Home, Users, Trophy, MapPin,
    MessageSquare, Activity, Gift, Settings, Map,
    LogOut, Menu, X, Bell, User, Heart, ShoppingCart, Swords
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
    readonly ShoppingCartIcon = ShoppingCart;
    readonly SwordsIcon = Swords;

    navItems = [
        { path: '/app', icon: this.HomeIcon, label: 'Admin Dashboard', roles: ['ROLE_ADMIN'] },
        { path: '/app/admin', icon: this.SettingsIcon, label: 'Admin', roles: ['ROLE_ADMIN'] },
        { path: '/app/home', icon: this.HomeIcon, label: 'Home' },
        { path: '/app/fields/add', icon: this.MapPinIcon, label: 'Add a Field', roles: ['ROLE_FIELD_OWNER', 'ROLE_ADMIN'] },
        { path: '/app/team', icon: this.UsersIcon, label: 'Teams' },
        { path: '/app/competitions', icon: this.TrophyIcon, label: 'Competitions' },
        { path: '/app/matches', icon: this.SwordsIcon, label: 'Matches' },
        { path: '/app/booking', icon: this.MapPinIcon, label: 'Booking' },
        { path: '/app/fields', icon: this.MapIcon, label: 'Fields', roles: ['ROLE_FIELD_OWNER', 'ROLE_ADMIN'] },
        { path: '/app/community', icon: this.MessageSquareIcon, label: 'Community' },
        { path: '/app/performance', icon: this.ActivityIcon, label: 'Performance' },
        { path: '/app/healthcare', icon: this.HeartIcon, label: 'Health' },
        { path: '/app/sponsors', icon: this.GiftIcon, label: 'Sponsors (Store)' },
        { path: '/app/favorites', icon: this.HeartIcon, label: 'My Favorites' },
        { path: '/app/user-profile', icon: this.UserIcon, label: 'My Profile' },
        { path: '/app/notifications', icon: this.BellIcon, label: 'Notifications' },
    ];

    get filteredNavItems() {
        let currentRole = this.userType;
        if (currentRole === 'player') currentRole = 'ROLE_PLAYER';
        if (currentRole === 'manager' || currentRole === 'owner') currentRole = 'ROLE_FIELD_OWNER';
        if (currentRole === 'admin') currentRole = 'ROLE_ADMIN';

        return this.navItems.filter(item => {
            if (!item.roles) return true; // Accessible to everyone
            return item.roles.includes(currentRole);
        });
    }

    constructor(private router: Router) { }

    get roleLabel(): string {
        const r = this.userType;
        if (r === 'ROLE_ADMIN') return 'Administrator';
        if (r === 'ROLE_FIELD_OWNER') return 'Field Manager';
        return 'Player';
    }

    ngOnInit() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            this.router.navigate(['/auth/login']);
            return;
        }
        this.userName = localStorage.getItem('user_name') || 'User';
        this.userEmail = localStorage.getItem('user_email') || '';
        this.userType = localStorage.getItem('user_type') || 'ROLE_PLAYER';
    }

    handleLogout() {
        ['auth_token', 'user_name', 'user_email', 'user_type', 'user_id'].forEach(k => localStorage.removeItem(k));
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
        return this.userType === 'owner' || this.userType === 'manager' || this.userType === 'ROLE_FIELD_OWNER';
    }
}
