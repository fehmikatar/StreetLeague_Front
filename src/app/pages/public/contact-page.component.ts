import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Mail, Phone, MapPin, Clock, Send, MessageSquare, HelpCircle } from 'lucide-angular';

@Component({
    selector: 'app-contact-page',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
    <div class="min-h-screen">
      <!-- Hero -->
      <section class="bg-gradient-to-br from-background via-primary/5 to-accent/5 py-20">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center max-w-3xl mx-auto">
            <div class="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">Contact</div>
            <h1 class="mb-6">Besoin d'aide ? <span class="text-primary">Contactez-nous</span></h1>
            <p class="text-xl text-muted-foreground">Notre équipe est là pour répondre à toutes vos questions et vous accompagner dans votre expérience StreetLeague.</p>
          </div>
        </div>
      </section>

      <!-- Contact Info & Form -->
      <section class="py-20 bg-card">
        <div class="max-w-7xl mx-auto px-4">
          <div class="grid lg:grid-cols-3 gap-8">
            <!-- Contact Cards -->
            <div class="space-y-6">
              <div class="bg-background rounded-2xl p-6 border border-border hover:shadow-lg transition-all">
                <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4"><lucide-icon [img]="MailIcon" class="w-6 h-6 text-primary"></lucide-icon></div>
                <h3 class="mb-2">Email</h3>
                <p class="text-muted-foreground mb-3">Envoyez-nous un email, nous répondons en moins de 24h</p>
                <a href="mailto:contact@streetleague.fr" class="text-primary font-semibold hover:underline">contact@streetleague.fr</a>
              </div>
              <div class="bg-background rounded-2xl p-6 border border-border hover:shadow-lg transition-all">
                <div class="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4"><lucide-icon [img]="PhoneIcon" class="w-6 h-6 text-accent"></lucide-icon></div>
                <h3 class="mb-2">Téléphone</h3>
                <p class="text-muted-foreground mb-3">Appelez-nous du lundi au vendredi</p>
                <a href="tel:+33123456789" class="text-primary font-semibold hover:underline">+33 1 23 45 67 89</a>
              </div>
              <div class="bg-background rounded-2xl p-6 border border-border hover:shadow-lg transition-all">
                <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4"><lucide-icon [img]="ClockIcon" class="w-6 h-6 text-primary"></lucide-icon></div>
                <h3 class="mb-2">Horaires</h3>
                <p class="text-muted-foreground">Lundi - Vendredi<br/>9h00 - 18h00</p>
              </div>
              <div class="bg-background rounded-2xl p-6 border border-border hover:shadow-lg transition-all">
                <div class="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4"><lucide-icon [img]="MapPinIcon" class="w-6 h-6 text-accent"></lucide-icon></div>
                <h3 class="mb-2">Adresse</h3>
                <p class="text-muted-foreground">123 Avenue du Sport<br/>75001 Paris, France</p>
              </div>
            </div>

            <!-- Form -->
            <div class="lg:col-span-2">
              <div class="bg-background rounded-2xl p-8 border border-border">
                <div class="mb-8">
                  <h2 class="mb-3">Envoyez-nous un message</h2>
                  <p class="text-muted-foreground">Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.</p>
                </div>
                <div *ngIf="submitted" class="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 text-primary font-semibold">
                  ✓ Message envoyé ! Nous vous répondrons dans les 24 heures.
                </div>
                <form (ngSubmit)="handleSubmit()" class="space-y-6">
                  <div class="grid md:grid-cols-2 gap-6">
                    <div>
                      <label for="name" class="block mb-2">Nom complet</label>
                      <input id="name" type="text" [(ngModel)]="name" name="name" placeholder="John Doe" required class="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                    </div>
                    <div>
                      <label for="email" class="block mb-2">Email</label>
                      <input id="email" type="email" [(ngModel)]="email" name="email" placeholder="john@example.com" required class="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                    </div>
                  </div>
                  <div>
                    <label for="subject" class="block mb-2">Sujet</label>
                    <input id="subject" type="text" [(ngModel)]="subject" name="subject" placeholder="Comment puis-je vous aider ?" required class="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                  </div>
                  <div>
                    <label for="message" class="block mb-2">Message</label>
                    <textarea id="message" [(ngModel)]="message" name="message" placeholder="Décrivez votre demande..." required rows="6" class="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"></textarea>
                  </div>
                  <button type="submit" class="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                    <lucide-icon [img]="SendIcon" class="w-5 h-5"></lucide-icon>
                    Envoyer le message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="py-20 bg-background">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-16">
            <div class="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">FAQ</div>
            <h2 class="mb-4">Questions fréquentes</h2>
            <p class="text-xl text-muted-foreground max-w-2xl mx-auto">Trouvez rapidement les réponses aux questions les plus courantes</p>
          </div>
          <div class="max-w-3xl mx-auto space-y-4">
            <div *ngFor="let faq of faqs" class="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="HelpCircleIcon" class="w-5 h-5 text-primary"></lucide-icon>
                </div>
                <div>
                  <h3 class="mb-2">{{ faq.question }}</h3>
                  <p class="text-muted-foreground">{{ faq.answer }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class ContactPageComponent {
    readonly MailIcon = Mail;
    readonly PhoneIcon = Phone;
    readonly MapPinIcon = MapPin;
    readonly ClockIcon = Clock;
    readonly SendIcon = Send;
    readonly HelpCircleIcon = HelpCircle;

    name = '';
    email = '';
    subject = '';
    message = '';
    submitted = false;

    handleSubmit() {
        this.submitted = true;
        this.name = '';
        this.email = '';
        this.subject = '';
        this.message = '';
        setTimeout(() => { this.submitted = false; }, 5000);
    }

    faqs = [
        { question: 'Comment créer un compte ?', answer: "Cliquez sur \"S'inscrire\" en haut de la page, remplissez le formulaire et choisissez votre type de compte." },
        { question: 'Comment réserver un terrain ?', answer: 'Parcourez les terrains disponibles, sélectionnez celui qui vous convient, choisissez une date et un horaire, puis confirmez votre réservation.' },
        { question: 'Quels sont les moyens de paiement acceptés ?', answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard), PayPal et les virements bancaires.' },
        { question: 'Comment ajouter mon terrain sur la plateforme ?', answer: 'Créez un compte propriétaire, accédez à votre tableau de bord et cliquez sur "Add un terrain".' },
        { question: 'Puis-je annuler une réservation ?', answer: "Oui, vous pouvez annuler gratuitement jusqu'à 24h avant le début de la réservation." },
    ];
}
