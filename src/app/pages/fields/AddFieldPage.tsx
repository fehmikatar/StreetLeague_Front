import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  MapPin,
  Building2,
  Users,
  DollarSign,
  Clock,
  Image as ImageIcon,
  Plus,
  X,
  AlertCircle,
  Check,
} from 'lucide-react';

interface FieldFormData {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  surface: string;
  capacity: string;
  sportType: string;
  pricePerHour: string;
  description: string;
  amenities: string[];
  openingHours: {
    weekdays: { start: string; end: string };
    weekends: { start: string; end: string };
  };
  images: File[];
}

const SPORT_TYPES = [
  'Football',
  'Basketball',
  'Tennis',
  'Volleyball',
  'Handball',
  'Badminton',
  'Autre',
];

const AMENITIES = [
  'Vestiaires',
  'Douches',
  'Parking',
  'Éclairage',
  'Bancs',
  'Accès handicapé',
  'Wi-Fi',
  'Cafétéria',
];

export default function AddFieldPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<FieldFormData>({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    surface: '',
    capacity: '',
    sportType: '',
    pricePerHour: '',
    description: '',
    amenities: [],
    openingHours: {
      weekdays: { start: '08:00', end: '22:00' },
      weekends: { start: '09:00', end: '20:00' },
    },
    images: [],
  });

  const handleInputChange = (field: keyof FieldFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newFiles].slice(0, 5), // Max 5 images
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (stepNumber: number): boolean => {
    setError('');

    if (stepNumber === 1) {
      if (!formData.name || !formData.address || !formData.city || !formData.postalCode) {
        setError('Veuillez remplir tous les champs obligatoires');
        return false;
      }
    }

    if (stepNumber === 2) {
      if (!formData.surface || !formData.capacity || !formData.sportType || !formData.pricePerHour) {
        setError('Veuillez remplir tous les champs obligatoires');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    setError('');

    // Simulation d'envoi
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/fields');
      }, 2000);
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-lg p-12 border border-border text-center max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h2 className="mb-2">Terrain ajouté avec succès !</h2>
          <p className="text-muted-foreground">
            Votre terrain a été enregistré et sera visible après validation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">Ajouter un nouveau terrain</h1>
          <p className="text-muted-foreground">
            Remplissez les informations pour référencer votre espace sportif
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    s <= step
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      s < step ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-2xl mx-auto mt-2 text-sm">
            <span className={step >= 1 ? 'text-primary font-semibold' : 'text-muted-foreground'}>
              Localisation
            </span>
            <span className={step >= 2 ? 'text-primary font-semibold' : 'text-muted-foreground'}>
              Détails
            </span>
            <span className={step >= 3 ? 'text-primary font-semibold' : 'text-muted-foreground'}>
              Services
            </span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          {/* Error message */}
          {error && (
            <div className="mb-6 bg-error-red/10 border border-error-red/20 rounded-lg p-3 flex items-center gap-2 text-error-red">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Localisation */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-card-foreground mb-2">
                  Nom du terrain *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: Terrain de football Municipal"
                    className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-card-foreground mb-2">
                  Adresse *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 Rue du Sport"
                    className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-card-foreground mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Paris"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-card-foreground mb-2">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="75001"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Détails */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-card-foreground mb-2">
                    Surface (m²) *
                  </label>
                  <input
                    type="number"
                    value={formData.surface}
                    onChange={(e) => handleInputChange('surface', e.target.value)}
                    placeholder="1000"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-card-foreground mb-2">
                    Capacité (joueurs) *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', e.target.value)}
                      placeholder="22"
                      className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-card-foreground mb-2">
                  Type de sport *
                </label>
                <select
                  value={formData.sportType}
                  onChange={(e) => handleInputChange('sportType', e.target.value)}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">Sélectionnez un sport</option>
                  {SPORT_TYPES.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-card-foreground mb-2">
                  Prix par heure (€) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="number"
                    value={formData.pricePerHour}
                    onChange={(e) => handleInputChange('pricePerHour', e.target.value)}
                    placeholder="50"
                    className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-card-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Décrivez votre terrain..."
                  rows={4}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Services */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-card-foreground mb-3">
                  Équipements disponibles
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {AMENITIES.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formData.amenities.includes(amenity)
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{amenity}</span>
                        {formData.amenities.includes(amenity) && (
                          <Check className="w-5 h-5" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Horaires d'ouverture
                </label>
                <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                  <div>
                    <p className="text-sm font-medium mb-2">Semaine (Lun-Ven)</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          Ouverture
                        </label>
                        <input
                          type="time"
                          value={formData.openingHours.weekdays.start}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              openingHours: {
                                ...prev.openingHours,
                                weekdays: { ...prev.openingHours.weekdays, start: e.target.value },
                              },
                            }))
                          }
                          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          Fermeture
                        </label>
                        <input
                          type="time"
                          value={formData.openingHours.weekdays.end}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              openingHours: {
                                ...prev.openingHours,
                                weekdays: { ...prev.openingHours.weekdays, end: e.target.value },
                              },
                            }))
                          }
                          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Week-end (Sam-Dim)</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          Ouverture
                        </label>
                        <input
                          type="time"
                          value={formData.openingHours.weekends.start}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              openingHours: {
                                ...prev.openingHours,
                                weekends: { ...prev.openingHours.weekends, start: e.target.value },
                              },
                            }))
                          }
                          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          Fermeture
                        </label>
                        <input
                          type="time"
                          value={formData.openingHours.weekends.end}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              openingHours: {
                                ...prev.openingHours,
                                weekends: { ...prev.openingHours.weekends, end: e.target.value },
                              },
                            }))
                          }
                          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-card-foreground mb-3">
                  Photos du terrain (max 5)
                </label>
                <div className="space-y-3">
                  {formData.images.length < 5 && (
                    <label className="border-2 border-dashed border-border hover:border-primary rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-muted/20 hover:bg-muted/40">
                      <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium text-card-foreground">
                        Cliquez pour ajouter des photos
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG jusqu'à 10MB
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-error-red text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-all"
              >
                Précédent
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
              >
                Suivant
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? 'Envoi...' : 'Publier le terrain'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}