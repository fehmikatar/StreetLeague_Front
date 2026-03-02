import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  ChevronLeft,
  Check,
  AlertCircle,
} from 'lucide-react';
import { FormField, Input, Select, Textarea } from '@/app/components/forms/FormField';
import { LoadingState } from '@/app/components/states/LoadingState';
import { InlineSuccess } from '@/app/components/states/SuccessState';

interface FormData {
  fieldId: string;
  date: string;
  timeSlot: string;
  duration: string;
  playerCount: string;
  teamName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  specialRequests: string;
  paymentMethod: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const MOCK_FIELDS = [
  { id: '1', name: 'Municipal Football Field', pricePerHour: 50 },
  { id: '2', name: 'Central Basketball Court', pricePerHour: 35 },
  { id: '3', name: 'Tennis Club Premium', pricePerHour: 25 },
];

const TIME_SLOTS = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00',
  '19:00 - 20:00',
  '20:00 - 21:00',
  '21:00 - 22:00',
];

export default function BookingForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<FormData>({
    fieldId: '',
    date: '',
    timeSlot: '',
    duration: '1',
    playerCount: '',
    teamName: '',
    contactName: localStorage.getItem('user_name') || '',
    contactEmail: localStorage.getItem('user_email') || '',
    contactPhone: '',
    specialRequests: '',
    paymentMethod: 'card',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'fieldId':
        return value ? '' : 'Please select a field';
      case 'date':
        if (!value) return 'Date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today ? '' : 'Date must be today or in the future';
      case 'timeSlot':
        return value ? '' : 'Please select a time slot';
      case 'playerCount':
        if (!value) return 'Number of players is required';
        const count = parseInt(value);
        return count > 0 && count <= 50 ? '' : 'Must be between 1 and 50';
      case 'contactName':
        return value.trim() ? '' : 'Name is required';
      case 'contactEmail':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? '' : 'Invalid email address';
      case 'contactPhone':
        const phoneRegex = /^[\d\s+()-]{10,}$/;
        return phoneRegex.test(value) ? '' : 'Invalid phone number';
      case 'agreeToTerms':
        return value ? '' : 'You must accept the terms and conditions';
      default:
        return '';
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Validate on change if field has been touched
    if (touched.has(name)) {
      const error = validateField(name, newValue);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const fieldValue = type === 'checkbox' ? checked : value;

    setTouched((prev) => new Set(prev).add(name));
    const error = validateField(name, fieldValue);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateStep = (step: number): boolean => {
    const fieldsToValidate: { [key: number]: string[] } = {
      1: ['fieldId', 'date', 'timeSlot', 'playerCount'],
      2: ['contactName', 'contactEmail', 'contactPhone'],
      3: ['paymentMethod', 'agreeToTerms'],
    };

    const fields = fieldsToValidate[step] || [];
    const newErrors: FormErrors = {};
    let isValid = true;

    fields.forEach((field) => {
      const error = validateField(field, formData[field as keyof FormData]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
      setTouched((prev) => new Set(prev).add(field));
    });

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(3)) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setSubmitSuccess(true);

    // Redirect after success
    setTimeout(() => {
      navigate('/booking/confirmation');
    }, 2000);
  };

  const selectedField = MOCK_FIELDS.find((f) => f.id === formData.fieldId);
  const totalCost = selectedField ? selectedField.pricePerHour * parseInt(formData.duration || '1') : 0;

  const steps = [
    { number: 1, title: 'Booking Details', icon: Calendar },
    { number: 2, title: 'Contact Info', icon: Users },
    { number: 3, title: 'Payment', icon: CreditCard },
  ];

  if (isSubmitting) {
    return <LoadingState message="Processing your booking..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </button>
          <h1 className="mb-2">Book a Field</h1>
          <p className="text-muted-foreground">Reserve your sports venue in just a few steps</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {submitSuccess && (
          <div className="mb-6">
            <InlineSuccess message="Booking submitted successfully! Redirecting..." />
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                        isCompleted
                          ? 'bg-primary text-primary-foreground'
                          : isActive
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-semibold ${isActive ? 'text-primary' : ''}`}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-4 rounded transition-all ${
                        isCompleted ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-card rounded-2xl p-8 border border-border space-y-6">
            {/* Step 1: Booking Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="mb-6">Booking Details</h3>

                <FormField
                  label="Select Field"
                  required
                  error={touched.has('fieldId') ? errors.fieldId : undefined}
                >
                  <Select
                    name="fieldId"
                    value={formData.fieldId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!errors.fieldId && touched.has('fieldId')}
                  >
                    <option value="">Choose a field...</option>
                    {MOCK_FIELDS.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.name} - {field.pricePerHour}€/hour
                      </option>
                    ))}
                  </Select>
                </FormField>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    label="Date"
                    required
                    error={touched.has('date') ? errors.date : undefined}
                  >
                    <Input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min={new Date().toISOString().split('T')[0]}
                      error={!!errors.date && touched.has('date')}
                    />
                  </FormField>

                  <FormField
                    label="Time Slot"
                    required
                    error={touched.has('timeSlot') ? errors.timeSlot : undefined}
                  >
                    <Select
                      name="timeSlot"
                      value={formData.timeSlot}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={!!errors.timeSlot && touched.has('timeSlot')}
                    >
                      <option value="">Choose a time...</option>
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField label="Duration (hours)" required>
                    <Select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                    >
                      <option value="1">1 hour</option>
                      <option value="2">2 hours</option>
                      <option value="3">3 hours</option>
                      <option value="4">4 hours</option>
                    </Select>
                  </FormField>

                  <FormField
                    label="Number of Players"
                    required
                    hint="Expected number of participants"
                    error={touched.has('playerCount') ? errors.playerCount : undefined}
                  >
                    <Input
                      type="number"
                      name="playerCount"
                      value={formData.playerCount}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g., 22"
                      min="1"
                      max="50"
                      error={!!errors.playerCount && touched.has('playerCount')}
                    />
                  </FormField>
                </div>

                <FormField label="Team Name" hint="Optional">
                  <Input
                    type="text"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    placeholder="Enter your team name"
                  />
                </FormField>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="mb-6">Contact Information</h3>

                <FormField
                  label="Full Name"
                  required
                  error={touched.has('contactName') ? errors.contactName : undefined}
                >
                  <Input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Your full name"
                    error={!!errors.contactName && touched.has('contactName')}
                  />
                </FormField>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    label="Email Address"
                    required
                    error={touched.has('contactEmail') ? errors.contactEmail : undefined}
                  >
                    <Input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="your.email@example.com"
                      error={!!errors.contactEmail && touched.has('contactEmail')}
                    />
                  </FormField>

                  <FormField
                    label="Phone Number"
                    required
                    error={touched.has('contactPhone') ? errors.contactPhone : undefined}
                  >
                    <Input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="+33 6 12 34 56 78"
                      error={!!errors.contactPhone && touched.has('contactPhone')}
                    />
                  </FormField>
                </div>

                <FormField label="Special Requests" hint="Any special requirements or notes">
                  <Textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Let us know if you have any special requirements..."
                  />
                </FormField>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="mb-6">Payment & Confirmation</h3>

                {/* Booking Summary */}
                <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl">
                  <h4 className="mb-4">Booking Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Field</span>
                      <span className="font-semibold">{selectedField?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date & Time</span>
                      <span className="font-semibold">
                        {formData.date} at {formData.timeSlot}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-semibold">{formData.duration} hour(s)</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-primary/20">
                      <span className="font-semibold">Total Cost</span>
                      <span className="text-2xl font-bold text-primary">{totalCost}€</span>
                    </div>
                  </div>
                </div>

                <FormField label="Payment Method" required>
                  <Select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
                    <option value="card">Credit / Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank">Bank Transfer</option>
                  </Select>
                </FormField>

                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex-1">
                    <label htmlFor="agreeToTerms" className="text-sm">
                      I agree to the{' '}
                      <a href="#" className="text-primary hover:underline">
                        Terms and Conditions
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-primary hover:underline">
                        Cancellation Policy
                      </a>
                    </label>
                    {touched.has('agreeToTerms') && errors.agreeToTerms && (
                      <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.agreeToTerms}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-6 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 disabled:opacity-50"
                >
                  Confirm Booking
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
