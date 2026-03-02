import { useState } from 'react';
import { Link } from 'react-router';
import { MapPin, Users, DollarSign, Plus, Search, Filter } from 'lucide-react';

interface Field {
  id: string;
  name: string;
  address: string;
  city: string;
  sportType: string;
  capacity: number;
  pricePerHour: number;
  image: string;
  amenities: string[];
}

const MOCK_FIELDS: Field[] = [
  {
    id: '1',
    name: 'Municipal Football Field',
    address: '123 Rue du Sport',
    city: 'Paris',
    sportType: 'Football',
    capacity: 22,
    pricePerHour: 50,
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400',
    amenities: ['Vestiaires', 'Douches', 'Parking', 'Éclairage'],
  },
  {
    id: '2',
    name: 'Central Basketball Court',
    address: '45 Avenue des Champions',
    city: 'Lyon',
    sportType: 'Basketball',
    capacity: 10,
    pricePerHour: 35,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
    amenities: ['Vestiaires', 'Parking', 'Éclairage'],
  },
  {
    id: '3',
    name: 'Tennis Club Premium',
    address: '78 Boulevard des Sports',
    city: 'Marseille',
    sportType: 'Tennis',
    capacity: 4,
    pricePerHour: 25,
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400',
    amenities: ['Vestiaires', 'Cafétéria', 'Parking'],
  },
];

export default function FieldsListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const userType = localStorage.getItem('user_type');

  const filteredFields = MOCK_FIELDS.filter((field) => {
    const matchesSearch =
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === 'all' || field.sportType === selectedSport;
    return matchesSearch && matchesSport;
  });

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="mb-2">Available fields</h1>
              <p className="text-muted-foreground">
                Find the perfect field for your sports activity
              </p>
            </div>
            {userType === 'owner' && (
              <Link
                to="/fields/add"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Ajouter un terrain
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or city..."
                className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Sport filter */}
            <div className="md:w-64">
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="all">All sports</option>
                <option value="Football">Football</option>
                <option value="Basketball">Basketball</option>
                <option value="Tennis">Tennis</option>
                <option value="Volleyball">Volleyball</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Fields Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredFields.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="mb-2">Aucun terrain trouvé</h3>
            <p className="text-muted-foreground">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFields.map((field) => (
              <div
                key={field.id}
                className="bg-card rounded-2xl shadow-md border border-border overflow-hidden hover:shadow-xl transition-all group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={field.image}
                    alt={field.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    {field.sportType}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="mb-3 line-clamp-1">{field.name}</h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {field.address}, {field.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{field.capacity} joueurs</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary font-semibold">
                        <DollarSign className="w-4 h-4" />
                        <span>{field.pricePerHour}€/h</span>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {field.amenities.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        className="px-2 py-1 bg-muted text-xs rounded-md"
                      >
                        {amenity}
                      </span>
                    ))}
                    {field.amenities.length > 3 && (
                      <span className="px-2 py-1 bg-muted text-xs rounded-md">
                        +{field.amenities.length - 3}
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <button className="w-full bg-accent text-accent-foreground py-2 rounded-lg font-semibold hover:bg-accent/90 transition-all">
                    Consult
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}