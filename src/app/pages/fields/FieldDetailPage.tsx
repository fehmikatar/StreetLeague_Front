import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  MapPin,
  Users,
  DollarSign,
  Star,
  Calendar,
  Clock,
  Phone,
  Mail,
  ChevronLeft,
  Heart,
  Share2,
  Check,
  X,
  Wifi,
  Car,
  ShowerHead,
  Sun,
  Moon,
} from 'lucide-react';

// This would typically come from route params and API
const MOCK_FIELD = {
  id: '1',
  name: 'Municipal Football Field',
  address: '123 Rue du Sport',
  city: 'Paris',
  postalCode: '75001',
  sportType: 'Football',
  surface: 'Natural Grass',
  capacity: 22,
  pricePerHour: 50,
  rating: 4.8,
  reviewsCount: 156,
  images: [
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800',
    'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
  ],
  description:
    'Professional-grade football field with pristine natural grass. Perfect for competitive matches and training sessions. Features modern facilities including changing rooms, showers, and ample parking.',
  amenities: [
    { name: 'Vestiaires', icon: ShowerHead, available: true },
    { name: 'Douches', icon: ShowerHead, available: true },
    { name: 'Parking', icon: Car, available: true },
    { name: 'Éclairage', icon: Sun, available: true },
    { name: 'WiFi', icon: Wifi, available: true },
    { name: 'Cafétéria', icon: Users, available: false },
  ],
  owner: {
    name: 'City Sports Council',
    phone: '+33 1 23 45 67 89',
    email: 'contact@municipal-sports.fr',
    verified: true,
  },
  availability: [
    { day: 'Monday', slots: ['09:00-12:00', '14:00-18:00', '18:00-22:00'] },
    { day: 'Tuesday', slots: ['09:00-12:00', '14:00-18:00', '18:00-22:00'] },
    { day: 'Wednesday', slots: ['09:00-12:00', '14:00-18:00', '18:00-22:00'] },
    { day: 'Thursday', slots: ['09:00-12:00', '14:00-18:00', '18:00-22:00'] },
    { day: 'Friday', slots: ['09:00-12:00', '14:00-18:00', '18:00-22:00'] },
    { day: 'Saturday', slots: ['08:00-12:00', '13:00-22:00'] },
    { day: 'Sunday', slots: ['08:00-12:00', '13:00-22:00'] },
  ],
  rules: [
    'No metal cleats allowed on natural grass',
    'Maximum 22 players at a time',
    'Booking must be made at least 24h in advance',
    'Cancellations accepted up to 12h before booking time',
    'Keep the facility clean and respect the equipment',
  ],
  reviews: [
    {
      id: '1',
      author: 'Alex Rivera',
      avatar: 'AR',
      rating: 5,
      date: '2026-01-28',
      comment: 'Excellent field with great maintenance. The grass quality is top-notch!',
    },
    {
      id: '2',
      author: 'Morgan Lee',
      avatar: 'ML',
      rating: 5,
      date: '2026-01-25',
      comment: 'Perfect location and facilities. Always clean and well-maintained.',
    },
    {
      id: '3',
      author: 'Jordan Chen',
      avatar: 'JC',
      rating: 4,
      date: '2026-01-20',
      comment: 'Great field overall. Only minor issue is parking can get crowded on weekends.',
    },
  ],
};

export default function FieldDetailPage() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  const handleBooking = () => {
    if (selectedDate && selectedTimeSlot) {
      // Navigate to booking confirmation
      navigate(`/booking/confirm?field=${MOCK_FIELD.id}&date=${selectedDate}&time=${selectedTimeSlot}`);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'fill-accent text-accent' : 'text-muted'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to fields
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-card rounded-2xl overflow-hidden border border-border">
              <div className="relative aspect-video">
                <img
                  src={MOCK_FIELD.images[selectedImage]}
                  alt={MOCK_FIELD.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-3 rounded-full backdrop-blur-md transition-all ${
                      isFavorite
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card/80 hover:bg-card'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-3 rounded-full bg-card/80 backdrop-blur-md hover:bg-card transition-all">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex gap-2 overflow-x-auto">
                {MOCK_FIELD.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative h-20 w-28 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      selectedImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Field Information */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2>{MOCK_FIELD.name}</h2>
                    {MOCK_FIELD.owner.verified && (
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold flex items-center gap-1">
                        <Check className="h-4 w-4" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {MOCK_FIELD.address}, {MOCK_FIELD.city} {MOCK_FIELD.postalCode}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    {renderStars(MOCK_FIELD.rating)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {MOCK_FIELD.rating} ({MOCK_FIELD.reviewsCount} reviews)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{MOCK_FIELD.sportType}</div>
                  <div className="text-sm text-muted-foreground">Sport Type</div>
                </div>
                <div className="text-center border-x border-border">
                  <div className="text-2xl font-bold text-accent mb-1">{MOCK_FIELD.capacity}</div>
                  <div className="text-sm text-muted-foreground">Max Players</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: '#06D6A0' }}>
                    {MOCK_FIELD.surface}
                  </div>
                  <div className="text-sm text-muted-foreground">Surface</div>
                </div>
              </div>

              <div>
                <h3 className="mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{MOCK_FIELD.description}</p>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-4">Amenities & Facilities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {MOCK_FIELD.amenities.map((amenity) => {
                  const Icon = amenity.icon;
                  return (
                    <div
                      key={amenity.name}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        amenity.available
                          ? 'bg-primary/5 border border-primary/20'
                          : 'bg-muted/30 border border-border'
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          amenity.available ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      />
                      <span className={amenity.available ? '' : 'text-muted-foreground line-through'}>
                        {amenity.name}
                      </span>
                      {amenity.available ? (
                        <Check className="h-4 w-4 text-primary ml-auto" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground ml-auto" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rules */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-4">Field Rules & Guidelines</h3>
              <ul className="space-y-3">
                {MOCK_FIELD.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reviews */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3>Reviews ({MOCK_FIELD.reviewsCount})</h3>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                  Write a Review
                </button>
              </div>

              <div className="space-y-4">
                {MOCK_FIELD.reviews.map((review) => (
                  <div key={review.id} className="p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                        {review.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold">{review.author}</div>
                            <div className="flex items-center gap-1 mt-1">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 border border-border sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Price per hour</div>
                  <div className="text-3xl font-bold text-primary">{MOCK_FIELD.pricePerHour}€</div>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    <Clock className="inline h-4 w-4 mr-2" />
                    Select Time Slot
                  </label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="">Choose a time slot</option>
                    <option value="09:00-12:00">09:00 - 12:00</option>
                    <option value="14:00-18:00">14:00 - 18:00</option>
                    <option value="18:00-22:00">18:00 - 22:00</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTimeSlot}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary mb-4"
              >
                Book Now
              </button>

              <div className="pt-4 border-t border-border">
                <h4 className="mb-3">Contact Owner</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{MOCK_FIELD.owner.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>{MOCK_FIELD.owner.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}