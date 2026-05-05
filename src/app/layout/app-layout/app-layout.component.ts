import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import {
    LucideAngularModule, Home, Users, Trophy, MapPin, Calendar,
    MessageSquare, Activity, Gift, Settings, Map,
    LogOut, Menu, X, Bell, User, Heart, ShoppingCart, Swords, Tags, Megaphone
} from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { PendingChangesService } from '../../services/pending-changes.service';
import { WebRtcCallService } from '../../services/webrtc-call.service';
import { CallOverlayComponent } from '../../components/call-overlay/call-overlay.component';
import { IncomingCallComponent } from '../../components/incoming-call/incoming-call.component';
import { WebSocketNotificationsComponent } from '../../components/websocket-notifications/websocket-notifications.component';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [
        CommonModule, 
        RouterOutlet, 
        RouterModule, 
        LucideAngularModule, 
        CallOverlayComponent, 
        IncomingCallComponent,
        WebSocketNotificationsComponent
    ],
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
    readonly CalendarIcon = Calendar;
    readonly LogOutIcon = LogOut;
    readonly MenuIcon = Menu;
    readonly XIcon = X;
    readonly BellIcon = Bell;
    readonly UserIcon = User;
    readonly HeartIcon = Heart;
    readonly ShoppingCartIcon = ShoppingCart;
    readonly SwordsIcon = Swords;
    readonly TagsIcon = Tags;
    readonly MegaphoneIcon = Megaphone;

    navItems = [
        { path: '/app', icon: this.HomeIcon, label: 'Admin Dashboard', roles: ['ROLE_ADMIN'] },
        { path: '/app/admin', icon: this.SettingsIcon, label: 'Admin Settings', roles: ['ROLE_ADMIN'] },
        { path: '/app/admin/users', icon: this.UsersIcon, label: 'Users Management', roles: ['ROLE_ADMIN'] },
        { path: '/app/admin/categories', icon: this.TagsIcon, label: 'Categories Management', roles: ['ROLE_ADMIN'] },
        { path: '/app/admin/loyalty', icon: this.GiftIcon, label: 'Loyalty Management', roles: ['ROLE_ADMIN'] },
        { path: '/app/admin/promotions', icon: this.TagsIcon, label: 'Promotions Management', roles: ['ROLE_ADMIN'] },
        { path: '/app/admin/advertisements', icon: this.MegaphoneIcon, label: 'Advertisements', roles: ['ROLE_ADMIN'] },
        { path: '/app/home', icon: this.HomeIcon, label: 'Home' },
        { path: '/app/fields/add', icon: this.MapPinIcon, label: 'Add Field', roles: ['ROLE_FIELD_OWNER', 'ROLE_ADMIN'] },
        { path: '/app/team', icon: this.UsersIcon, label: 'Teams' },
        { path: '/app/competitions', icon: this.TrophyIcon, label: 'Competitions' },
        { path: '/app/matches', icon: this.SwordsIcon, label: 'Matches' },
        { path: '/app/booking', icon: this.MapPinIcon, label: 'Booking' },
        { path: '/my-bookings', icon: this.CalendarIcon, label: 'My Bookings' },
        { path: '/app/owner-bookings', icon: this.CalendarIcon, label: 'Field Bookings', roles: ['ROLE_FIELD_OWNER', 'ROLE_ADMIN'] },
        { path: '/app/fields', icon: this.MapIcon, label: 'Fields', roles: ['ROLE_FIELD_OWNER', 'ROLE_ADMIN'] },
        { path: '/app/performance', icon: this.ActivityIcon, label: 'Performance' },
        { path: '/app/performances/ai-coach', icon: this.ActivityIcon, label: 'AI Coach' },
        { path: '/app/healthcare', icon: this.HeartIcon, label: 'Healthcare' },
        { path: '/app/smart-matching', icon: this.SwordsIcon, label: 'Smart Match' },
        { path: '/app/sponsors', icon: this.GiftIcon, label: 'Shop (Sponsors)' },
        { path: '/app/favorites', icon: this.HeartIcon, label: 'My Favorites' },
        { path: '/app/loyalty', icon: this.GiftIcon, label: 'Loyalty Program' },
        { path: '/app/orders', icon: this.ShoppingCartIcon, label: 'My Orders' },
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

    constructor(
        private router: Router,
        private authService: AuthService,
        private pendingChangesService: PendingChangesService,
        private webRtcCallService: WebRtcCallService
    ) { }

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
        this.userName = localStorage.getItem('user_name') || 'Utilisateur';
        this.userEmail = localStorage.getItem('user_email') || '';
        this.userType = localStorage.getItem('user_type') || 'ROLE_PLAYER';

        // Initialize WebRTC call service so it can receive incoming calls from any page
        const userId = localStorage.getItem('user_id') || '0';
        this.webRtcCallService.connectOwnStomp(userId, this.userName);
    }

    handleLogout() {
        // Notify all services/components that logout is happening - allows them to save pending changes
        this.pendingChangesService.notifyBeforeLogout();

        // Give a moment for auto-save to complete
        setTimeout(() => {
            this.authService.logout();
            this.router.navigate(['/auth/login']);
        }, 100);
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
