import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { LucideAngularModule, Menu, X, Home, Info, Phone, Grid, LogIn } from 'lucide-angular';

@Component({
    selector: 'app-public-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterModule, LucideAngularModule],
    templateUrl: './public-layout.component.html',
})
export class PublicLayoutComponent {
    mobileMenuOpen = false;

    readonly MenuIcon = Menu;
    readonly XIcon = X;
    readonly HomeIcon = Home;
    readonly InfoIcon = Info;
    readonly PhoneIcon = Phone;
    readonly GridIcon = Grid;
    readonly LogInIcon = LogIn;

    navItems = [
        { path: '/', icon: this.HomeIcon, label: 'Accueil' },
        { path: '/about', icon: this.InfoIcon, label: 'À propos' },
        { path: '/browse', icon: this.GridIcon, label: 'Explorer' },
        { path: '/contact', icon: this.PhoneIcon, label: 'Contact' },
    ];

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }

    closeMobileMenu() {
        this.mobileMenuOpen = false;
    }
}
