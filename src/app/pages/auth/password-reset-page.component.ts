import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Mail, Check } from 'lucide-angular';

@Component({
  selector: 'app-password-reset-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center p-4">
      <div class="w-full max-w-md">

        <!-- Success State -->
        <div *ngIf="isSubmitted" class="bg-card rounded-3xl shadow-2xl p-8 border border-border">
          <div class="text-center">
            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <lucide-icon [img]="CheckIcon" class="w-8 h-8 text-primary"></lucide-icon>
            </div>
            <h2 class="mb-4">Email envoyé !</h2>
            <p class="text-muted-foreground mb-8">
              Nous avons envoyé un lien de réinitialisation à <strong>{{ email }}</strong>.
              Vérifiez votre boîte de réception et suivez les instructions.
            </p>
            <div class="space-y-4">
              <a routerLink="/auth/login" class="block w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all text-center">
                Retour à la connexion
              </a>
              <button (click)="isSubmitted = false" class="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                Renvoyer l'email
              </button>
            </div>
          </div>
        </div>

        <!-- Form State -->
        <div *ngIf="!isSubmitted">
          <div class="text-center mb-8">
            <img src="/logo.png" alt="StreetLeague" class="h-50 w-auto mx-auto mb-4" />
            <h1 class="mb-3">Mot de passe oublié ?</h1>
            <p class="text-muted-foreground">Entrez votre email pour recevoir un lien de réinitialisation</p>
          </div>
          <div class="bg-card rounded-3xl shadow-2xl p-8 border border-border">
            <form (ngSubmit)="handleSubmit()" class="space-y-6">
              <div>
                <label for="email" class="block mb-2">Adresse email</label>
                <div class="relative">
                  <lucide-icon [img]="MailIcon" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"></lucide-icon>
                  <input id="email" type="email" [(ngModel)]="email" name="email" placeholder="votre@email.com" required
                    class="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                </div>
              </div>
              <button type="submit" [disabled]="isLoading"
                class="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50">
                {{ isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation' }}
              </button>
            </form>
            <div class="mt-6 text-center">
              <a routerLink="/auth/login" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <lucide-icon [img]="ArrowLeftIcon" class="w-4 h-4"></lucide-icon>
                Retour à la connexion
              </a>
            </div>
          </div>
          <div class="mt-8 text-center">
            <p class="text-sm text-muted-foreground">
              Vous n'avez pas encore de compte ?
              <a routerLink="/auth/signup" class="text-primary font-semibold hover:underline">Inscrivez-vous</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PasswordResetPageComponent {
  email = '';
  isSubmitted = false;
  isLoading = false;

  readonly ArrowLeftIcon = ArrowLeft;
  readonly MailIcon = Mail;
  readonly CheckIcon = Check;

  handleSubmit() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.isSubmitted = true;
    }, 1500);
  }
}
