import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, LogIn, Mail, Lock, Loader2 } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <!-- Logo/Brand -->
      <a routerLink="/" class="flex items-center gap-2 mb-8 group">
        <div class="relative w-10 h-10 bg-primary rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-all shadow-lg shadow-primary/20">
          <div class="absolute inset-0 bg-white/20 rounded-xl blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span class="text-white font-bold text-xl drop-shadow-md">S</span>
        </div>
        <span class="font-bold text-2xl tracking-tight text-foreground">StreetLeague</span>
      </a>

      <!-- Login Card -->
      <div class="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden relative">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
        
        <div class="p-8">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold mb-2">Welcome back! 👋</h1>
            <p class="text-muted-foreground text-sm">Enter your credentials to access your account</p>
          </div>

          <!-- Alert Note -->
          <div class="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <lucide-icon [img]="LogInIcon" class="w-5 h-5 text-primary shrink-0 mt-0.5"></lucide-icon>
            <p class="text-sm text-primary/90">
              First time? <a routerLink="/auth/signup" class="font-bold underline hover:text-primary transition-colors">Create an account</a>
            </p>
          </div>

          <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="space-y-5">
            <!-- Email -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-foreground ml-1">Email address</label>
              <div class="relative group">
                <lucide-icon [img]="MailIcon" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors"></lucide-icon>
                <input 
                  type="email" 
                  name="email"
                  [(ngModel)]="email"
                  required
                  class="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between ml-1">
                <label class="text-sm font-medium text-foreground">Password</label>
                <a routerLink="/auth/password-reset" class="text-xs text-primary font-medium hover:underline">Forgot?</a>
              </div>
              <div class="relative group">
                <lucide-icon [img]="LockIcon" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors"></lucide-icon>
                <input 
                  type="password" 
                  name="password"
                  [(ngModel)]="password"
                  required
                  class="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div *ngIf="error" class="text-red-500 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {{ error }}
            </div>

            <!-- Submit -->
            <button 
              type="submit" 
              [disabled]="!loginForm.form.valid || loading"
              class="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-primary/20"
            >
              <lucide-icon *ngIf="loading" [img]="Loader2Icon" class="w-4 h-4 animate-spin"></lucide-icon>
              {{ loading ? 'Connecting...' : 'Login' }}
            </button>
          </form>

          <!-- Divider -->
          <div class="mt-8 relative flex items-center justify-center">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-border"></div>
            </div>
            <span class="relative bg-card px-4 text-xs text-muted-foreground uppercase font-medium">Or with</span>
          </div>

          <!-- Social Login (Mock) -->
          <div class="mt-6">
            <button class="w-full py-2.5 bg-muted/50 border border-border text-foreground font-medium rounded-xl hover:bg-muted transition-all flex justify-center items-center gap-3">
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginPageComponent {
  readonly LogInIcon = LogIn;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly Loader2Icon = Loader2;

  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  onSubmit() {
    this.loading = true;
    this.error = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/app']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Login error', err);
        this.error = 'Incorrect credentials or server error.';
      }
    });
  }
}
