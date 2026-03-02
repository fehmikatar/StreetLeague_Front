import { useState } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  History,
} from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { BookingHistoryModal } from "@/app/components/modals/BookingHistoryModal";

export function Booking() {
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("2026-02-05");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [showHistory, setShowHistory] = useState(false);

  const facilities = [
    {
      id: 1,
      name: "Central Arena",
      type: "Indoor Basketball Court",
      location: "Downtown, 2.5 km away",
      rating: 4.8,
      price: 45,
      image:
        "https://images.unsplash.com/photo-1768842407056-6c64fe629c2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvb3IlMjBzcG9ydHMlMjBmYWNpbGl0eSUyMGJhc2tldGJhbGx8ZW58MXx8fHwxNzcwMDQ1MTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      amenities: ["Parking", "Locker Rooms", "Equipment"],
    },
    {
      id: 2,
      name: "Green Field Sports Complex",
      type: "Outdoor Soccer Field",
      location: "West District, 4.2 km away",
      rating: 4.6,
      price: 60,
      image:
        "https://images.unsplash.com/photo-1699519638135-a6734c58b361?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdXRkb29yJTIwc29jY2VyJTIwZmllbGR8ZW58MXx8fHwxNzcwMDQ1MTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      amenities: ["Parking", "Showers", "Lighting"],
    },
    {
      id: 3,
      name: "Elite Tennis Club",
      type: "Tennis Courts",
      location: "East Side, 3.8 km away",
      rating: 4.9,
      price: 35,
      image:
        "https://images.unsplash.com/photo-1764439063840-a03b75a477f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW5uaXMlMjBjb3VydCUyMGZhY2lsaXR5fGVufDF8fHx8MTc3MDA0NTE0NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      amenities: ["Pro Shop", "Lounge", "Coaching"],
    },
  ];

  const timeSlots = [
    { time: "08:00 AM", available: true },
    { time: "10:00 AM", available: true },
    { time: "12:00 PM", available: false },
    { time: "02:00 PM", available: true },
    { time: "04:00 PM", available: true },
    { time: "06:00 PM", available: true },
    { time: "08:00 PM", available: false },
  ];

  const handleBooking = () => {
    if (bookingStep < 3) {
      setBookingStep(bookingStep + 1);
    }
  };

  const selectedFacilityData = facilities.find((f) => f.id === selectedFacility);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="mb-2">Smart Booking & Spaces</h1>
              <p className="text-muted-foreground">
                Find and book the perfect sports facility for your team
              </p>
            </div>
            <button
              onClick={() => setShowHistory(true)}
              className="px-4 py-2 bg-muted hover:bg-muted/70 rounded-xl transition-all flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              <span>Historique</span>
            </button>
          </div>

          {/* Booking Steps */}
          <div className="flex items-center gap-4 mt-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    bookingStep >= step
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {bookingStep > step ? <Check className="h-5 w-5" /> : step}
                </div>
                <span
                  className={`hidden sm:inline text-sm ${
                    bookingStep >= step ? "text-foreground font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {step === 1 ? "Select Facility" : step === 2 ? "Choose Time" : "Confirm"}
                </span>
                {step < 3 && (
                  <ChevronRight className="h-5 w-5 text-muted-foreground hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {bookingStep === 1 && (
          <div>
            {/* Map Placeholder */}
            <div className="bg-card rounded-2xl p-6 border border-border mb-8">
              <h3 className="mb-4">Nearby Facilities</h3>
              <div className="h-64 bg-muted rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">Interactive Map View</p>
                  <p className="text-sm text-muted-foreground">
                    Showing {facilities.length} facilities near you
                  </p>
                </div>
              </div>
            </div>

            {/* Facilities Grid */}
            <h3 className="mb-6">Available Facilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.map((facility) => (
                <div
                  key={facility.id}
                  className={`bg-card rounded-2xl overflow-hidden border-2 transition-all cursor-pointer hover:shadow-xl ${
                    selectedFacility === facility.id
                      ? "border-primary shadow-lg shadow-primary/30"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedFacility(facility.id)}
                >
                  <div className="relative h-48">
                    <ImageWithFallback
                      src={facility.image}
                      alt={facility.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="text-sm font-semibold">{facility.rating}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="mb-1">{facility.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{facility.type}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      {facility.location}
                    </div>
                    <div className="flex items-center flex-wrap gap-2 mb-4">
                      {facility.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="text-xs px-2 py-1 bg-muted rounded-lg text-foreground"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <span className="text-xl font-bold">{facility.price}</span>
                        <span className="text-sm text-muted-foreground">/hour</span>
                      </div>
                      {selectedFacility === facility.id && (
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-5 w-5 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleBooking}
                disabled={!selectedFacility}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/30"
              >
                Continue to Time Selection
              </button>
            </div>
          </div>
        )}

        {bookingStep === 2 && selectedFacilityData && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-6 border border-border mb-8">
              <div className="flex items-start gap-4 mb-6">
                <ImageWithFallback
                  src={selectedFacilityData.image}
                  alt={selectedFacilityData.name}
                  className="h-20 w-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="mb-1">{selectedFacilityData.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedFacilityData.type}</p>
                </div>
                <button
                  onClick={() => setBookingStep(1)}
                  className="text-sm text-primary hover:underline"
                >
                  Change
                </button>
              </div>

              {/* Calendar */}
              <div className="mb-6">
                <h4 className="mb-4">Select Date</h4>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const date = new Date(2026, 1, 3 + i);
                    const dateStr = date.toISOString().split("T")[0];
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`p-4 rounded-xl text-center transition-all ${
                          selectedDate === dateStr
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                            : "bg-muted hover:bg-muted/70"
                        }`}
                      >
                        <div className="text-xs text-muted-foreground mb-1">
                          {date.toLocaleDateString("en-US", { weekday: "short" })}
                        </div>
                        <div className="text-lg font-bold">{date.getDate()}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <h4 className="mb-4">Available Time Slots</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`p-4 rounded-xl text-center transition-all ${
                        selectedTime === slot.time
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                          : slot.available
                          ? "bg-muted hover:bg-muted/70"
                          : "bg-muted/30 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <Clock className="h-5 w-5 mx-auto mb-2" />
                      <div className="text-sm font-semibold">{slot.time}</div>
                      {!slot.available && (
                        <div className="text-xs text-muted-foreground mt-1">Booked</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setBookingStep(1)}
                className="px-8 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/70 transition-all"
              >
                <ChevronLeft className="h-5 w-5 inline mr-2" />
                Back
              </button>
              <button
                onClick={handleBooking}
                disabled={!selectedTime}
                className="flex-1 px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/30"
              >
                Continue to Confirmation
              </button>
            </div>
          </div>
        )}

        {bookingStep === 3 && selectedFacilityData && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-6 border border-border mb-8">
              <h3 className="mb-6">Booking Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Facility</span>
                  <span className="font-semibold">{selectedFacilityData.name}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-semibold">
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-semibold">{selectedTime}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-semibold">1 hour</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted-foreground">Price</span>
                  <span className="text-2xl font-bold text-primary">
                    ${selectedFacilityData.price}
                  </span>
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-muted/30 rounded-xl p-6 mb-6">
                <h4 className="mb-4">Payment Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-2">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-primary mb-1">Team Discount Applied!</p>
                    <p className="text-muted-foreground">
                      You saved $5 as a StreetLeague member
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setBookingStep(2)}
                className="px-8 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/70 transition-all"
              >
                <ChevronLeft className="h-5 w-5 inline mr-2" />
                Back
              </button>
              <button className="flex-1 px-8 py-3 bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/30">
                Confirm Booking - ${selectedFacilityData.price}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Booking History Modal */}
      {showHistory && <BookingHistoryModal onClose={() => setShowHistory(false)} />}
    </div>
  );
}