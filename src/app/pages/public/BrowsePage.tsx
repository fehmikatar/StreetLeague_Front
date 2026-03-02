import { Link } from 'react-router';
import { MapPin, Star, Clock, DollarSign, Search, Filter, ArrowRight, Lock } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

// Mock data for public preview
const mockFields = [
  {
    id: '1',
    name: 'Terrain de foot Parc Central',
    location: 'Paris 15ème',
    type: 'Football',
    price: '50',
    rating: 4.8,
    reviews: 124,
    image: null,
    available: true,
  },
  {
    id: '2',
    name: 'Court de Basketball Premium',
    location: 'Lyon 3ème',
    type: 'Basketball',
    price: '40',
    rating: 4.9,
    reviews: 89,
    image: null,
    available: true,
  },
  {
    id: '3',
    name: 'Terrain de Tennis Club Elite',
    location: 'Marseille 8ème',
    type: 'Tennis',
    price: '35',
    rating: 4.7,
    reviews: 156,
    image: null,
    available: true,
  },
  {
    id: '4',
    name: 'Terrain Multisport City',
    location: 'Paris 12ème',
    type: 'Multisport',
    price: '45',
    rating: 4.6,
    reviews: 92,
    image: null,
    available: true,
  },
  {
    id: '5',
    name: 'Stade de Football Urban',
    location: 'Toulouse 1er',
    type: 'Football',
    price: '60',
    rating: 4.9,
    reviews: 201,
    image: null,
    available: true,
  },
  {
    id: '6',
    name: 'Court de Volley Beach',
    location: 'Nice 6ème',
    type: 'Volleyball',
    price: '30',
    rating: 4.5,
    reviews: 67,
    image: null,
    available: true,
  },
];

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const sportTypes = ['all', 'Football', 'Basketball', 'Tennis', 'Multisport', 'Volleyball'];

  const filteredFields = mockFields.filter((field) => {
    const matchesSearch =
      field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || field.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-background via-primary/5 to-accent/5 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
              Explorer les terrains
            </div>
            <h1 className="mb-6">
              Trouvez le terrain <span className="text-primary">parfait</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Parcourez notre sélection de terrains sportifs disponibles près de chez vous
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher par nom ou localisation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 rounded-2xl border-2 border-border focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          {/* Filters */}
          <div className="mb-8">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">Type de sport :</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {sportTypes.map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? 'default' : 'outline'}
                    onClick={() => setSelectedType(type)}
                    className={`rounded-xl ${
                      selectedType === type
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {type === 'all' ? 'Tous' : type}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">{filteredFields.length}</span> terrains
              disponibles
            </p>
          </div>

          {/* Fields Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFields.map((field) => (
              <div
                key={field.id}
                className="bg-background border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all group"
              >
                {/* Image */}
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin className="w-16 h-16 text-primary/40" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-primary-foreground">
                      {field.type}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="mb-2 text-lg group-hover:text-primary transition-colors">
                    {field.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{field.location}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="font-semibold">{field.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({field.reviews} avis)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-primary font-semibold">
                      <DollarSign className="w-4 h-4" />
                      <span>{field.price}€</span>
                      <span className="text-xs text-muted-foreground">/heure</span>
                    </div>
                  </div>

                  {/* Preview Action */}
                  <div className="pt-4 border-t border-border">
                    <div className="bg-muted/50 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm font-medium">Connectez-vous pour réserver</span>
                      </div>
                      <Link
                        to="/auth/login"
                        className="text-primary font-semibold hover:underline text-sm inline-flex items-center gap-1"
                      >
                        Se connecter
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredFields.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2">Aucun terrain trouvé</h3>
              <p className="text-muted-foreground mb-6">
                Essayez de modifier vos critères de recherche
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                }}
                variant="outline"
                className="rounded-xl"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-card border-2 border-primary/20 rounded-3xl p-12">
            <h2 className="mb-6">Envie d'aller plus loin ?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Créez votre compte pour réserver des terrains, organiser des matchs et suivre vos
              performances
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
              >
                Créer un compte gratuit
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/auth/login"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-border rounded-xl font-semibold hover:bg-muted transition-all"
              >
                Se connecter
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Aucune carte bancaire requise • Inscription en 30 secondes
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">Pourquoi choisir StreetLeague ?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              La meilleure plateforme pour réserver vos terrains sportifs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: 'Réservation instantanée',
                description: 'Réservez en quelques clics, confirmation immédiate',
              },
              {
                icon: Star,
                title: 'Terrains vérifiés',
                description: 'Tous nos terrains sont contrôlés et notés par la communauté',
              },
              {
                icon: DollarSign,
                title: 'Meilleurs prix',
                description: 'Tarifs transparents et compétitifs, sans frais cachés',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
