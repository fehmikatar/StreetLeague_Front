import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Mail, Check, X, Loader2 } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-password-reset-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <!-- Fake Background -->
    <div class="fixed inset-0 bg-background/20 z-0 hidden md:block"></div>
    
    <!-- Bootstrap Modal Backdrop & Container -->
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      
      <!-- Modal Content (The Dialog) -->
      <div class="relative w-full max-w-md bg-card rounded-xl shadow-2xl flex flex-col my-8 animate-in mt-0 fade-in zoom-in duration-200">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10 rounded-t-xl">
          <div class="flex items-center gap-2">
            <img src="/logo.png" alt="StreetLeague" class="h-6 w-auto" />
            <h2 class="text-xl font-bold text-foreground m-0 leading-none tracking-tight">Réinitialisation</h2>
          </div>
          <a routerLink="/auth/login" class="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
            <lucide-icon [name]="xIcon" [size]="20"></lucide-icon>
            <span class="sr-only">Fermer</span>
          </a>
        </div>

        <div class="p-6">
          <!-- Success State -->
          <div *ngIf="isSubmitted" class="text-center animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <lucide-icon [name]="checkIcon" class="w-8 h-8 text-primary"></lucide-icon>
            </div>
            <h3 class="text-xl font-bold mb-2">Email envoyé !</h3>
            <p class="text-sm text-muted-foreground mb-8">
              Nous avons envoyé un lien de réinitialisation à <br/><strong class="text-foreground">{{ email }}</strong>.<br/>
              Vérifiez votre boîte de réception.
            </p>
            <div class="space-y-4">
              <a routerLink="/auth/login" class="flex items-center justify-center w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all text-sm">
                Retour à la connexion
              </a>
              <button (click)="isSubmitted = false" class="w-full text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">
                Je n'ai rien reçu, renvoyer l'email
              </button>
            </div>
          </div>

          <!-- Form State -->
          <div *ngIf="!isSubmitted" class="animate-in fade-in zoom-in duration-300">
            <div class="text-center mb-6">
              <p class="text-sm text-muted-foreground">Entrez votre email pour recevoir un lien de réinitialisation sécurisé pour votre compte StreetLeague.</p>
            </div>
            
            <form (ngSubmit)="handleSubmit()" class="space-y-5">
              <div class="space-y-2">
                <label for="email" class="block text-sm font-medium text-card-foreground">Adresse Email</label>
                <div class="relative">
                  <lucide-icon [name]="mailIcon" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"></lucide-icon>
                  <input id="email" type="email" [(ngModel)]="email" name="email" placeholder="votre.email@exemple.com" required
                    class="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    [disabled]="isLoading" />
                </div>
              </div>
              <button type="submit" [disabled]="isLoading || !email"
                class="w-full bg-primary text-primary-foreground py-2.5 mt-2 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                <lucide-icon *ngIf="isLoading" [img]="loader2Icon" class="w-4 h-4 animate-spin"></lucide-icon>
                {{ isLoading ? 'Envoi en cours...' : 'Envoyer le lien' }}
              </button>
            </form>
            
            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-border"></div></div>
              <div class="relative flex justify-center text-xs"><span class="px-2 bg-card text-muted-foreground uppercase tracking-wider">Erreur ?</span></div>
            </div>
            
            <div class="text-center flex flex-col gap-3">
              <a routerLink="/auth/login" class="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                <lucide-icon [name]="arrowLeftIcon" class="w-4 h-4"></lucide-icon>
                Retourner à la connexion
              </a>
            </div>
          </div>
        </div>
        
        <!-- Modal Footer -->
        <div *ngIf="!isSubmitted" class="px-6 py-4 border-t border-border bg-muted/30 text-center rounded-b-xl">
          <p class="text-xs text-muted-foreground">
            Pas encore de compte ?
            <a routerLink="/auth/signup" class="text-primary hover:underline font-semibold">Inscrivez-vous ici</a>
          </p>
        </div>

      </div>
    </div>
  `,
})
export class PasswordResetPageComponent {
  email = '';
  isSubmitted = false;
  isLoading = false;

  readonly arrowLeftIcon = ArrowLeft;
  readonly mailIcon = Mail;
  readonly checkIcon = Check;
  readonly xIcon = X;
  readonly loader2Icon = Loader2;

  constructor(private cdr: ChangeDetectorRef, private authService: AuthService) { }

  handleSubmit() {
    if (!this.email) return;
    this.isLoading = true;
    this.authService.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSubmitted = true;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Password reset error', err);
        this.isLoading = false;
        // Even if there's an error, we show success to prevent email enumeration
        this.isSubmitted = true;
        this.cdr.detectChanges();
      }
    });
  }
}
