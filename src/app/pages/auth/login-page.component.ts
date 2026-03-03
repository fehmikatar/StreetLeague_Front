import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-angular';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="mb-4">
          <a routerLink="/" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            Retour
          </a>
        </div>
        <div class="text-center mb-8">
          <img src="/logo.png" alt="StreetLeague" class="h-50 w-auto mx-auto mb-3" />
          <p class="text-muted-foreground">Connectez-vous à votre compte</p>
        </div>
        <div class="bg-card rounded-2xl shadow-lg p-8 border border-border">
          <form (ngSubmit)="handleSubmit()" class="space-y-6">
            <div *ngIf="error" class="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2 text-destructive">
              <lucide-icon [img]="AlertCircleIcon" class="w-5 h-5 flex-shrink-0"></lucide-icon>
              <p class="text-sm">{{ error }}</p>
            </div>
            <div class="space-y-2">
              <label for="email" class="block text-sm font-semibold text-card-foreground">Email</label>
              <div class="relative">
                <lucide-icon [img]="MailIcon" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"></lucide-icon>
                <input id="email" type="email" [(ngModel)]="email" name="email"
                  placeholder="votre.email@exemple.com"
                  class="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  [disabled]="loading" />
              </div>
            </div>
            <div class="space-y-2">
              <label for="password" class="block text-sm font-semibold text-card-foreground">Mot de passe</label>
              <div class="relative">
                <lucide-icon [img]="LockIcon" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"></lucide-icon>
                <input id="password" [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password"
                  placeholder="••••••••"
                  class="w-full pl-10 pr-12 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  [disabled]="loading" />
                <button type="button" (click)="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors">
                  <lucide-icon [img]="showPassword ? EyeOffIcon : EyeIcon" class="w-5 h-5"></lucide-icon>
                </button>
              </div>
            </div>
            <div class="flex justify-end">
              <a routerLink="/auth/password-reset" class="text-sm text-primary hover:text-primary/80 transition-colors">Mot de passe oublié ?</a>
            </div>
            <button type="submit" [disabled]="loading"
              class="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg">
              {{ loading ? 'Connexion...' : 'Se connecter' }}
            </button>
          </form>
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-border"></div></div>
            <div class="relative flex justify-center text-sm"><span class="px-4 bg-card text-muted-foreground">ou</span></div>
          </div>
          <div class="text-center">
            <p class="text-sm text-muted-foreground">
              Pas encore de compte ?
              <a routerLink="/auth/signup" class="text-primary font-semibold hover:text-primary/80 transition-colors">Inscrivez-vous</a>
            </p>
          </div>
        </div>
        <p class="text-center mt-6 text-sm text-muted-foreground">
          En vous connectant, vous acceptez nos
          <a href="#" class="text-primary hover:underline">Conditions d'utilisation</a> et notre
          <a href="#" class="text-primary hover:underline">Politique de confidentialité</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginPageComponent {
  email = '';
  password = '';
  showPassword = false;
  error = '';
  loading = false;

  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly AlertCircleIcon = AlertCircle;

  constructor(private router: Router) { }

  handleSubmit() {
    this.error = '';
    if (!this.email || !this.password) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }
    this.loading = true;
    setTimeout(() => {
      localStorage.setItem('auth_token', 'mock_token_' + Date.now());
      localStorage.setItem('user_email', this.email);
      localStorage.setItem('user_name', this.email.split('@')[0]);
      localStorage.setItem('user_type', 'player');
      this.router.navigate(['/app']);
    }, 1000);
  }
}
