import { Link } from 'react-router';
import { Trophy, Users, MapPin, Activity, ArrowRight, Check, Star, Calendar, Shield } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export default function PublicHomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6 animate-fade-in">
                🏆 Plateforme sportive amateur #1
              </div>
              <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl">
                Votre écosystème sportif{' '}
                <span className="text-primary">premium</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Rejoignez des milliers de joueurs et propriétaires de terrains. Organisez, jouez et
                développez votre passion pour le sport.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  to="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Commencer maintenant
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/browse"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-border rounded-xl font-semibold hover:bg-muted transition-all"
                >
                  Explorer les terrains
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-12">
                <div className="text-center md:text-left">
                  <div className="text-3xl font-bold text-primary">10k+</div>
                  <div className="text-sm text-muted-foreground">Joueurs actifs</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Terrains</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-3xl font-bold text-primary">50k+</div>
                  <div className="text-sm text-muted-foreground">Matchs joués</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 rounded-3xl shadow-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <Trophy className="w-32 h-32 text-primary mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-semibold text-foreground">Réservez votre terrain</p>
                  <p className="text-muted-foreground">Jouez maintenant</p>
                </div>
              </div>
              {/* Floating Cards */}
              <div className="absolute top-10 -left-4 bg-card border border-border rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">+42 matchs</div>
                    <div className="text-xs text-muted-foreground">Aujourd'hui</div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-10 -right-4 bg-card border border-border rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">4.8/5</div>
                    <div className="text-xs text-muted-foreground">Note moyenne</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
              Fonctionnalités
            </div>
            <h2 className="mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une plateforme complète pour gérer votre activité sportive amateur
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Trophy,
                title: 'Matchs & Tournois',
                description: 'Organisez et participez à des compétitions',
                color: 'primary',
              },
              {
                icon: MapPin,
                title: 'Réservation de terrains',
                description: 'Trouvez et réservez des espaces sportifs',
                color: 'accent',
              },
              {
                icon: Users,
                title: 'Gestion d\'équipes',
                description: 'Créez et gérez vos équipes facilement',
                color: 'primary',
              },
              {
                icon: Activity,
                title: 'Suivi de performance',
                description: 'Analysez vos progrès et votre santé',
                color: 'accent',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-background rounded-2xl p-6 border border-border hover:border-primary/50 transition-all group hover:shadow-xl"
                >
                  <div className={`w-12 h-12 bg-${feature.color}/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-${feature.color}/20 transition-all group-hover:scale-110`}>
                    <Icon className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  <h3 className="mb-2 text-lg">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">
              Comment ça marche
            </div>
            <h2 className="mb-4">Simple et rapide</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Commencez à jouer en 3 étapes simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Créez votre compte',
                description: 'Inscrivez-vous gratuitement en quelques secondes',
              },
              {
                step: '02',
                title: 'Trouvez un terrain',
                description: 'Parcourez les terrains disponibles près de chez vous',
              },
              {
                step: '03',
                title: 'Réservez et jouez',
                description: 'Réservez votre créneau et profitez du jeu',
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all">
                  <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                  <h3 className="mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Owners */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 rounded-3xl p-8 md:p-12 border-2 border-primary/20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-semibold mb-4">
                  Pour les propriétaires
                </div>
                <h2 className="mb-6">Propriétaire d'un terrain ?</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Référencez votre espace sportif et maximisez son utilisation. Gérez les
                  réservations, fixez vos tarifs et développez votre activité.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Gestion simplifiée des réservations',
                    'Visibilité auprès de milliers de joueurs',
                    'Système de paiement sécurisé',
                    'Statistiques et analyses détaillées',
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:scale-105"
                >
                  Ajouter mon terrain
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl shadow-2xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <Shield className="w-32 h-32 text-primary mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-semibold text-foreground">Gestion sécurisée</p>
                    <p className="text-muted-foreground">Contrôle total</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
              Témoignages
            </div>
            <h2 className="mb-4">Ce qu'ils en pensent</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des milliers de joueurs et propriétaires nous font confiance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Marc Dupont',
                role: 'Joueur amateur',
                content: 'StreetLeague a transformé ma façon de jouer. Je trouve facilement des terrains et des partenaires de jeu.',
                rating: 5,
              },
              {
                name: 'Sophie Martin',
                role: 'Propriétaire de terrain',
                content: 'Grâce à cette plateforme, mon terrain est réservé à 90%. La gestion est simplifiée et efficace.',
                rating: 5,
              },
              {
                name: 'Ahmed Benali',
                role: 'Capitaine d\'équipe',
                content: 'L\'organisation des matchs et tournois n\'a jamais été aussi simple. Un outil indispensable !',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">{testimonial.content}</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                    {testimonial.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="mb-6">Prêt à commencer ?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Rejoignez StreetLeague aujourd'hui et transformez votre expérience sportive
          </p>
          <Link
            to="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Créer mon compte gratuitement
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            Aucune carte bancaire requise • Annulation gratuite
          </p>
        </div>
      </section>
    </div>
  );
}
