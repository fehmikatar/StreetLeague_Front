import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Eye, EyeOff, Mail, Lock, User, AlertCircle, Building2, X, UserPlus, Loader2 } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';

type UserType = 'player' | 'owner';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <!-- Logo/Brand -->
      <a routerLink="/" class="flex items-center gap-2 mb-8 group">
        <div class="shadow-lg shadow-primary/20 bg-white p-2 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-all">
          <img src="/logo.png" alt="StreetLeague" class="h-8 w-auto" />
        </div>
        <span class="font-bold text-2xl tracking-tight text-foreground">StreetLeague</span>
      </a>

      <!-- Signup Card -->
      <div class="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden relative">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
        
        <div class="p-8">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold mb-2">Rejoindre la ligue ✨</h1>
            <p class="text-muted-foreground text-sm">Créez votre compte en quelques secondes</p>
          </div>

          <!-- Alert Note -->
          <div class="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <lucide-icon [img]="UserPlusIcon" class="w-5 h-5 text-primary shrink-0 mt-0.5"></lucide-icon>
            <p class="text-sm text-primary/90">
              Vous avez déjà un compte ? <a routerLink="/auth/login" class="font-bold underline hover:text-primary transition-colors">Connectez-vous</a>
            </p>
          </div>

          <form (ngSubmit)="onSubmit()" #signupForm="ngForm" class="space-y-4">
            
            <!-- Type Selector -->
            <div class="grid grid-cols-2 gap-3 mb-2">
              <button 
                type="button"
                (click)="accountType = 'player'"
                class="py-2.5 rounded-xl border font-semibold text-sm transition-all text-center flex items-center justify-center gap-2"
                [ngClass]="accountType === 'player' ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-background border-border text-muted-foreground hover:bg-muted'">
                Joueur
              </button>
              <button 
                type="button"
                (click)="accountType = 'manager'"
                class="py-2.5 rounded-xl border font-semibold text-sm transition-all text-center flex items-center justify-center gap-2"
                [ngClass]="accountType === 'manager' ? 'bg-accent/10 border-accent text-accent shadow-sm' : 'bg-background border-border text-muted-foreground hover:bg-muted'">
                Gérant de terrain
              </button>
            </div>

            <!-- Nom -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-foreground ml-1">Nom complet</label>
              <div class="relative group">
                <lucide-icon [img]="UserIcon" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors"></lucide-icon>
                <input 
                  type="text" 
                  name="name"
                  [(ngModel)]="name"
                  required
                  class="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  placeholder="Zinédine Zidane"
                />
              </div>
            </div>

            <!-- Email -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-foreground ml-1">Adresse email</label>
              <div class="relative group">
                <lucide-icon [img]="MailIcon" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors"></lucide-icon>
                <input 
                  type="email" 
                  name="email"
                  [(ngModel)]="email"
                  required
                  class="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-foreground ml-1">Mot de passe</label>
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
              <p class="text-xs text-muted-foreground ml-1 mt-1">8 caractères minimum conseillés</p>
            </div>

            <div *ngIf="error" class="text-red-500 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {{ error }}
            </div>

            <!-- Submit -->
            <button 
              type="submit" 
              [disabled]="!signupForm.form.valid || loading"
              class="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-primary/20 mt-2"
            >
              <lucide-icon *ngIf="loading" [img]="Loader2Icon" class="w-4 h-4 animate-spin"></lucide-icon>
              {{ loading ? 'Création en cours...' : 'Créer mon compte' }}
            </button>
            <p class="text-center text-xs text-muted-foreground mt-4">
              En vous inscrivant, vous acceptez nos <a href="#" class="underline hover:text-foreground">Conditions d'utilisation</a>
            </p>
          </form>

        </div>
      </div>
    </div>
  `,
})
export class SignupPageComponent {
  accountType: 'player' | 'manager' = 'player';
  name = '';
  email = '';
  password = '';
  loading = false;
  error = '';

  readonly UserPlusIcon = UserPlus;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly UserIcon = User;
  readonly Loader2Icon = Loader2;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  onSubmit() {
    this.loading = true;
    this.error = '';

    const nameParts = this.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;
    const backendRole = this.accountType === 'player' ? 'ROLE_PLAYER' : 'ROLE_FIELD_OWNER';

    const payload = { firstName, lastName, email: this.email, password: this.password, role: backendRole };
    console.log('Sending register payload:', payload);

    this.authService.register(payload).subscribe({
      next: (res: any) => {
        // Automatically log them in after a successful register
        this.authService.login({ email: this.email, password: this.password }).subscribe({
          next: () => {
            this.loading = false;
            // Both player and field owner go to /app/home after registration
            this.router.navigate(['/app/home']);
          },
          error: () => {
            this.loading = false;
            // Registered OK but auto-login failed, send to login page
            this.router.navigate(['/auth/login']);
          }
        });
      },
      error: (err: any) => {
        this.loading = false;
        const msg = this.authService.getErrorMessage(err);
        console.error('Registration error details:', err.status, msg, err.error);
        this.error = msg || "Erreur lors de la création du compte. Vérifiez que l'email n'est pas déjà utilisé.";
      }
    });
  }
}
