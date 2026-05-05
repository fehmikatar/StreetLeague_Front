import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Trophy, Users, MapPin, Activity, ArrowRight, Check, Star, Calendar, Shield } from 'lucide-angular';

@Component({
    selector: 'app-public-home-page',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    template: `
    <div class="min-h-screen">
      <!-- Hero -->
      <section class="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <div class="max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div class="text-center md:text-left">
              <div class="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
                🏆 Plateforme sportive amateur #1
              </div>
              <h1 class="mb-6 text-4xl md:text-5xl lg:text-6xl">
                Votre écosystème sportif <span class="text-primary">premium</span>
              </h1>
              <p class="text-lg md:text-xl text-muted-foreground mb-8">
                Rejoignez des milliers de joueurs et propriétaires de terrains. Organisez, jouez et développez votre passion pour le sport.
              </p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a routerLink="/auth/signup" class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-105">
                  Commencer maintenant
                  <lucide-icon [img]="ArrowRightIcon" class="w-5 h-5"></lucide-icon>
                </a>
                <a routerLink="/browse" class="inline-flex items-center justify-center px-8 py-4 border-2 border-border rounded-xl font-semibold hover:bg-muted transition-all">
                  Explorer les terrains
                </a>
              </div>
              <div class="grid grid-cols-3 gap-4 mt-12">
                <div class="text-center md:text-left">
                  <div class="text-3xl font-bold text-primary">10k+</div>
                  <div class="text-sm text-muted-foreground">Joueurs actifs</div>
                </div>
                <div class="text-center md:text-left">
                  <div class="text-3xl font-bold text-primary">500+</div>
                  <div class="text-sm text-muted-foreground">Terrains</div>
                </div>
                <div class="text-center md:text-left">
                  <div class="text-3xl font-bold text-primary">50k+</div>
                  <div class="text-sm text-muted-foreground">Matchs joués</div>
                </div>
              </div>
            </div>
            <div class="relative">
              <div class="aspect-square bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 rounded-3xl shadow-2xl flex items-center justify-center">
                <div class="text-center p-8">
                  <lucide-icon [img]="TrophyIcon" class="w-32 h-32 text-primary mx-auto mb-4 opacity-50"></lucide-icon>
                  <p class="text-xl font-semibold text-foreground">Réservez votre terrain</p>
                  <p class="text-muted-foreground">Jouez maintenant</p>
                </div>
              </div>
              <div class="absolute top-10 -left-4 bg-card border border-border rounded-2xl p-4 shadow-lg">
                <div class="flex items-center gap-2">
                  <div class="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <lucide-icon [img]="CalendarIcon" class="w-5 h-5 text-primary"></lucide-icon>
                  </div>
                  <div>
                    <div class="text-sm font-semibold">+42 matchs</div>
                    <div class="text-xs text-muted-foreground">Aujourd'hui</div>
                  </div>
                </div>
              </div>
              <div class="absolute bottom-10 -right-4 bg-card border border-border rounded-2xl p-4 shadow-lg">
                <div class="flex items-center gap-2">
                  <div class="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                    <lucide-icon [img]="StarIcon" class="w-5 h-5 text-accent"></lucide-icon>
                  </div>
                  <div>
                    <div class="text-sm font-semibold">4.8/5</div>
                    <div class="text-xs text-muted-foreground">Note moyenne</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section id="features" class="py-20 bg-card">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-16">
            <div class="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">Fonctionnalités</div>
            <h2 class="mb-4">Tout ce dont vous avez besoin</h2>
            <p class="text-xl text-muted-foreground max-w-2xl mx-auto">Une plateforme complète pour gérer votre activité sportive amateur</p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div *ngFor="let feature of features" class="bg-background rounded-2xl p-6 border border-border hover:border-primary/50 transition-all group hover:shadow-xl">
              <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all group-hover:scale-110">
                <lucide-icon [img]="feature.icon" class="w-6 h-6 text-primary"></lucide-icon>
              </div>
              <h3 class="mb-2 text-lg">{{ feature.title }}</h3>
              <p class="text-muted-foreground">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="py-20 bg-background">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-16">
            <div class="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">Comment ça marche</div>
            <h2 class="mb-4">Simple et rapide</h2>
            <p class="text-xl text-muted-foreground max-w-2xl mx-auto">Commencez à jouer en 3 étapes simples</p>
          </div>
          <div class="grid md:grid-cols-3 gap-8">
            <div *ngFor="let step of steps; let i = index" class="relative">
              <div class="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all">
                <div class="text-6xl font-bold text-primary/10 mb-4">{{ step.num }}</div>
                <h3 class="mb-3">{{ step.title }}</h3>
                <p class="text-muted-foreground">{{ step.description }}</p>
              </div>
              <div *ngIf="i < 2" class="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- For Owners -->
      <section class="py-20 bg-card">
        <div class="max-w-7xl mx-auto px-4">
          <div class="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 rounded-3xl p-8 md:p-12 border-2 border-primary/20">
            <div class="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div class="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-semibold mb-4">Pour les propriétaires</div>
                <h2 class="mb-6">Propriétaire d'un terrain ?</h2>
                <p class="text-lg text-muted-foreground mb-6">Référencez votre espace sportif et maximisez son utilisation.</p>
                <ul class="space-y-3 mb-8">
                  <li *ngFor="let item of ownerBenefits" class="flex items-center gap-3">
                    <div class="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <lucide-icon [img]="CheckIcon" class="w-4 h-4 text-primary-foreground"></lucide-icon>
                    </div>
                    <span>{{ item }}</span>
                  </li>
                </ul>
                <a routerLink="/auth/signup" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:scale-105">
                  Ajouter mon terrain
                  <lucide-icon [img]="ArrowRightIcon" class="w-5 h-5"></lucide-icon>
                </a>
              </div>
              <div class="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl shadow-2xl flex items-center justify-center">
                <div class="text-center p-8">
                  <lucide-icon [img]="ShieldIcon" class="w-32 h-32 text-primary mx-auto mb-4 opacity-50"></lucide-icon>
                  <p class="text-xl font-semibold text-foreground">Gestion sécurisée</p>
                  <p class="text-muted-foreground">Contrôle total</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials -->
      <section class="py-20 bg-background">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-16">
            <div class="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">Témoignages</div>
            <h2 class="mb-4">Ce qu'ils en pensent</h2>
            <p class="text-xl text-muted-foreground max-w-2xl mx-auto">Des milliers de joueurs et propriétaires nous font confiance</p>
          </div>
          <div class="grid md:grid-cols-3 gap-8">
            <div *ngFor="let t of testimonials" class="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all">
              <div class="flex gap-1 mb-4">
                <lucide-icon *ngFor="let s of getStars(t.rating)" [img]="StarIcon" class="w-5 h-5 fill-primary text-primary"></lucide-icon>
              </div>
              <p class="text-muted-foreground mb-6">{{ t.content }}</p>
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                  {{ t.name.substring(0, 2).toUpperCase() }}
                </div>
                <div>
                  <div class="font-semibold">{{ t.name }}</div>
                  <div class="text-sm text-muted-foreground">{{ t.role }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div class="max-w-4xl mx-auto px-4 text-center">
          <h2 class="mb-6">Prêt à commencer ?</h2>
          <p class="text-xl text-muted-foreground mb-8">Rejoignez StreetLeague aujourd'hui et transformez votre expérience sportive</p>
          <a routerLink="/auth/signup" class="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-105">
            Créer mon compte gratuitement
            <lucide-icon [img]="ArrowRightIcon" class="w-5 h-5"></lucide-icon>
          </a>
          <p class="text-sm text-muted-foreground mt-4">Aucune carte bancaire requise • Annulation gratuite</p>
        </div>
      </section>
    </div>
  `,
})
export class PublicHomePageComponent {
    readonly TrophyIcon = Trophy;
    readonly StarIcon = Star;
    readonly ArrowRightIcon = ArrowRight;
    readonly CheckIcon = Check;
    readonly ShieldIcon = Shield;
    readonly CalendarIcon = Calendar;

    features = [
        { icon: Trophy, title: 'Matchs & Tournois', description: 'Organisez et participez à des compétitions' },
        { icon: MapPin, title: 'Réservation de terrains', description: 'Trouvez et réservez des espaces sportifs' },
        { icon: Users, title: "Gestion d'équipes", description: 'Créez et gérez vos équipes facilement' },
        { icon: Activity, title: 'Suivi de performance', description: 'Analysez vos progrès et votre santé' },
    ];

    steps = [
        { num: '01', title: 'Créez votre compte', description: 'Inscrivez-vous gratuitement en quelques secondes' },
        { num: '02', title: 'Trouvez un terrain', description: 'Parcourez les terrains disponibles près de chez vous' },
        { num: '03', title: 'Réservez et jouez', description: 'Réservez votre créneau et profitez du jeu' },
    ];

    ownerBenefits = [
        'Gestion simplifiée des réservations',
        'Visibilité auprès de milliers de joueurs',
        'Système de paiement sécurisé',
        'Statistiques et analyses détaillées',
    ];

    testimonials = [
        { name: 'Marc Dupont', role: 'Joueur amateur', content: 'StreetLeague a transformé ma façon de jouer. Je trouve facilement des terrains et des partenaires de jeu.', rating: 5 },
        { name: 'Sophie Martin', role: 'Propriétaire de terrain', content: "Grâce à cette plateforme, mon terrain est réservé à 90%. La gestion est simplifiée et efficace.", rating: 5 },
        { name: 'Ahmed Benali', role: "Capitaine d'équipe", content: "L'organisation des matchs et tournois n'a jamais été aussi simple. Un outil indispensable !", rating: 5 },
    ];

    getStars(n: number) { return Array(n).fill(0); }
}
