import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Gift, ExternalLink, Star, TrendingUp } from 'lucide-angular';

@Component({
    selector: 'app-sponsors',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <div class="min-h-screen bg-background p-4 md:p-6">
      <div class="max-w-7xl mx-auto">
        <div class="mb-8">
          <h1 class="mb-2">Sponsors & Partenaires</h1>
          <p class="text-muted-foreground">Découvrez nos partenaires officiels et offres exclusives</p>
        </div>

        <!-- Featured Sponsors -->
        <div class="mb-10">
          <h2 class="mb-6 text-xl font-bold">Sponsors Officiels</h2>
          <div class="grid md:grid-cols-3 gap-6">
            <div *ngFor="let sponsor of featuredSponsors" class="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all hover:shadow-xl group">
              <div class="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform">
                {{ sponsor.emoji }}
              </div>
              <div class="text-xs font-semibold uppercase text-muted-foreground mb-2">{{ sponsor.category }}</div>
              <h3 class="mb-2">{{ sponsor.name }}</h3>
              <p class="text-sm text-muted-foreground mb-4">{{ sponsor.description }}</p>
              <div *ngIf="sponsor.offer" class="bg-primary/10 rounded-xl p-3 mb-4">
                <div class="text-sm font-semibold text-primary">🎁 {{ sponsor.offer }}</div>
              </div>
              <a href="#" class="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline">
                En savoir plus
                <lucide-icon [img]="ExternalLinkIcon" class="w-4 h-4"></lucide-icon>
              </a>
            </div>
          </div>
        </div>

        <!-- Benefits -->
        <div class="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 mb-8">
          <h2 class="mb-6">Avantages membres</h2>
          <div class="grid md:grid-cols-3 gap-6">
            <div *ngFor="let benefit of benefits" class="bg-card rounded-2xl p-6">
              <div class="text-4xl mb-3">{{ benefit.icon }}</div>
              <h3 class="mb-2">{{ benefit.title }}</h3>
              <p class="text-sm text-muted-foreground">{{ benefit.description }}</p>
            </div>
          </div>
        </div>

        <!-- Become Sponsor -->
        <div class="bg-card rounded-2xl p-8 border border-border text-center">
          <lucide-icon [img]="GiftIcon" class="w-16 h-16 text-primary mx-auto mb-4"></lucide-icon>
          <h2 class="mb-4">Devenez partenaire</h2>
          <p class="text-muted-foreground mb-6 max-w-2xl mx-auto">Rejoignez notre réseau de partenaires et bénéficiez d'une visibilité unique auprès de milliers de sportifs passionnés.</p>
          <button class="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
            Contactez-nous
          </button>
        </div>
      </div>
    </div>
  `,
})
export class SponsorsComponent {
    readonly GiftIcon = Gift;
    readonly ExternalLinkIcon = ExternalLink;

    featuredSponsors = [
        { name: 'SportPro', category: 'Équipement sportif', emoji: '👟', description: 'Le leader de l\'équipement sportif de haute performance.', offer: '15% de réduction pour les membres StreetLeague' },
        { name: 'NutriSport', category: 'Nutrition', emoji: '💊', description: 'Suppléments et nutrition pour les sportifs amateurs et professionnels.', offer: 'Kit de démarrage gratuit à l\'inscription' },
        { name: 'ArenaCity', category: 'Terrains', emoji: '🏟️', description: 'Réseau de terrains sportifs premium dans toute la France.', offer: '2 heures offertes par mois' },
        { name: 'SportMedia', category: 'Médias', emoji: '📺', description: 'Plateforme de streaming des matchs et tournois amateurs.', offer: 'Abonnement premium 3 mois offerts' },
        { name: 'HealthPlus', category: 'Santé', emoji: '🏥', description: 'Centres de santé et physiothérapie pour les sportifs.', offer: 'Bilan sportif gratuit' },
        { name: 'TechSport', category: 'Technologie', emoji: '⌚', description: 'Montres et wearables connectés pour tracker vos performances.', offer: '20% sur les appareils connectés' },
    ];

    benefits = [
        { icon: '💰', title: 'Économies exclusives', description: 'Jusqu\'à 30% de réduction chez nos partenaires commerciaux.' },
        { icon: '🎁', title: 'Cadeaux & Surprises', description: 'Des surprises et cadeaux réguliers de nos partenaires.' },
        { icon: '⚡', title: 'Accès Prioritaire', description: 'Accès en avant-première aux nouveaux produits et services.' },
    ];
}
