import { Link } from 'react-router';
import { Target, Users, Zap, Heart, Shield, TrendingUp, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-background via-primary/5 to-accent/5 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
              À propos de nous
            </div>
            <h1 className="mb-6">
              Révolutionner le sport <span className="text-primary">amateur</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              StreetLeague est née d'une passion commune : rendre le sport amateur accessible,
              organisé et professionnel pour tous les joueurs et propriétaires de terrains.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                Notre Mission
              </div>
              <h2 className="mb-6">Connecter les passionnés de sport</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Notre mission est de créer un écosystème sportif complet qui facilite la pratique
                sportive amateur, simplifie la gestion des terrains et encourage une communauté
                active et engagée.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Nous croyons que chaque joueur mérite une expérience professionnelle et que chaque
                propriétaire de terrain doit avoir les outils pour optimiser son activité.
              </p>
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
              >
                Découvrir les terrains
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/10 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">10k+</div>
                <div className="text-sm text-muted-foreground">Joueurs actifs</div>
              </div>
              <div className="bg-accent/10 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-accent mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Terrains</div>
              </div>
              <div className="bg-primary/10 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">50k+</div>
                <div className="text-sm text-muted-foreground">Matchs</div>
              </div>
              <div className="bg-accent/10 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-accent mb-2">98%</div>
                <div className="text-sm text-muted-foreground">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">
              Nos Valeurs
            </div>
            <h2 className="mb-4">Ce qui nous anime</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des principes qui guident chaque décision et action
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'Excellence',
                description: 'Nous visons l\'excellence dans tout ce que nous faisons, de la technologie au service client.',
                color: 'primary',
              },
              {
                icon: Users,
                title: 'Communauté',
                description: 'Nous croyons en la force de la communauté et encourageons l\'entraide entre nos membres.',
                color: 'accent',
              },
              {
                icon: Zap,
                title: 'Innovation',
                description: 'Nous innovons constamment pour offrir les meilleures fonctionnalités à nos utilisateurs.',
                color: 'primary',
              },
              {
                icon: Heart,
                title: 'Passion',
                description: 'Notre passion pour le sport guide chaque aspect de notre plateforme.',
                color: 'accent',
              },
              {
                icon: Shield,
                title: 'Sécurité',
                description: 'La sécurité des données et des transactions est notre priorité absolue.',
                color: 'primary',
              },
              {
                icon: TrendingUp,
                title: 'Croissance',
                description: 'Nous aidons nos utilisateurs à grandir, que ce soit en compétences ou en business.',
                color: 'accent',
              },
            ].map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all group"
                >
                  <div className={`w-12 h-12 bg-${value.color}/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 text-${value.color}`} />
                  </div>
                  <h3 className="mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                Notre Histoire
              </div>
              <h2 className="mb-4">Comment tout a commencé</h2>
            </div>

            <div className="space-y-8">
              <div className="bg-background rounded-2xl p-8 border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-primary">
                    2022
                  </div>
                  <div>
                    <h3 className="mb-3">La genèse</h3>
                    <p className="text-muted-foreground">
                      Tout a commencé par une frustration partagée : trouver un terrain de sport
                      disponible était compliqué, et pour les propriétaires, gérer les réservations
                      était un casse-tête. Nous avons décidé de créer une solution.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-2xl p-8 border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-primary">
                    2023
                  </div>
                  <div>
                    <h3 className="mb-3">Le lancement</h3>
                    <p className="text-muted-foreground">
                      Après un an de développement intensif, StreetLeague voit le jour. Les
                      premiers terrains rejoignent la plateforme et les joueurs découvrent une
                      nouvelle façon de pratiquer leur sport.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-2xl p-8 border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-primary">
                    2024
                  </div>
                  <div>
                    <h3 className="mb-3">L'expansion</h3>
                    <p className="text-muted-foreground">
                      StreetLeague atteint 500 terrains et 10 000 joueurs actifs. Nous lançons de
                      nouvelles fonctionnalités comme le suivi de performance et l'organisation de
                      tournois.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 border-2 border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0 font-bold text-primary-foreground">
                    2026
                  </div>
                  <div>
                    <h3 className="mb-3">L'avenir</h3>
                    <p className="text-muted-foreground mb-4">
                      Aujourd'hui, nous continuons d'innover pour devenir la référence du sport
                      amateur. Notre objectif : doubler notre communauté et lancer de nouvelles
                      fonctionnalités révolutionnaires.
                    </p>
                    <Link
                      to="/auth/signup"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all"
                    >
                      Rejoignez l'aventure
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="mb-6">Faites partie de l'histoire</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Rejoignez des milliers de passionnés qui ont choisi StreetLeague
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
            >
              Commencer gratuitement
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-border bg-card rounded-xl font-semibold hover:bg-muted transition-all"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
