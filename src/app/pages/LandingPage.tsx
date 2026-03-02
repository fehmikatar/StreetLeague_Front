import { Link } from 'react-router';
import { Trophy, Users, MapPin, Activity, ArrowRight, Check } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-light">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-primary">StreetLeague</h1>
          <div className="flex items-center gap-4">
            <Link
              to="/auth/login"
              className="px-4 py-2 text-card-foreground hover:text-primary transition-colors font-semibold"
            >
              Connexion
            </Link>
            <Link
              to="/auth/signup"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
                Plateforme sportive amateur #1
              </div>
              <h1 className="mb-6 text-5xl md:text-6xl">
                Votre écosystème sportif{' '}
                <span className="text-primary">premium</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Rejoignez des milliers de joueurs et propriétaires de terrains. Organisez, jouez et
                développez votre passion pour le sport.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                >
                  Commencer maintenant
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-border rounded-lg font-semibold hover:bg-muted transition-all"
                >
                  En savoir plus
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
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
              },
              {
                icon: MapPin,
                title: 'Réservation de terrains',
                description: 'Trouvez et réservez des espaces sportifs',
              },
              {
                icon: Users,
                title: 'Gestion d\'équipes',
                description: 'Créez et gérez vos équipes facilement',
              },
              {
                icon: Activity,
                title: 'Suivi de performance',
                description: 'Analysez vos progrès et votre santé',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-bg-light rounded-2xl p-6 border border-border hover:border-primary/50 transition-all group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* For Owners */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8 md:p-12 border border-primary/20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
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
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
                >
                  Ajouter mon terrain
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-card">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="mb-6">Prêt à commencer ?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Rejoignez StreetLeague aujourd'hui et transformez votre expérience sportive
          </p>
          <Link
            to="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
          >
            Créer mon compte gratuitement
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-primary mb-4">StreetLeague</h3>
              <p className="text-sm text-muted-foreground">
                L'écosystème sportif amateur premium
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Tarifs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    À propos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Confidentialité
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/20 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 StreetLeague. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}