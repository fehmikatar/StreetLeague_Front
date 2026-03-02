# StreetLeague Front Office - Exemples d'Utilisation

## Table des Matières
1. [États d'Interface](#états-dinterface)
2. [Formulaires avec Validation](#formulaires-avec-validation)
3. [Notifications Toast](#notifications-toast)
4. [Navigation et Liens](#navigation-et-liens)
5. [Composants Réutilisables](#composants-réutilisables)

---

## États d'Interface

### Loading States

#### 1. Chargement Plein Écran
```tsx
import { LoadingState } from '@/app/components/states';

function MyPage() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingState message="Loading your data..." fullScreen />;
  }

  return <div>Content</div>;
}
```

#### 2. Skeleton Loaders
```tsx
import { CardSkeleton, TableSkeleton, ListSkeleton } from '@/app/components/states';

function MyComponent() {
  const [data, setData] = useState(null);

  if (!data) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <TableSkeleton rows={5} />
        <ListSkeleton items={3} />
      </div>
    );
  }

  return <div>{/* Render data */}</div>;
}
```

### Error States

#### 1. Erreur avec Retry
```tsx
import { ErrorState } from '@/app/components/states';

function MyPage() {
  const [error, setError] = useState(null);

  const handleRetry = async () => {
    try {
      const data = await fetchData();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return (
      <ErrorState
        title="Failed to Load Data"
        message={error}
        onRetry={handleRetry}
      />
    );
  }

  return <div>Content</div>;
}
```

#### 2. Erreur Inline dans un Formulaire
```tsx
import { InlineError } from '@/app/components/states';

function MyForm() {
  const [errors, setErrors] = useState({});

  return (
    <form>
      <input name="email" />
      {errors.email && <InlineError message={errors.email} />}
    </form>
  );
}
```

### Empty States

#### 1. Empty State avec Action
```tsx
import { EmptyState } from '@/app/components/states';
import { Inbox } from 'lucide-react';

function MessagesList() {
  const messages = [];

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No messages yet"
        description="Start a conversation with your teammates"
        action={{
          label: "New Message",
          onClick: () => navigate('/messages/new')
        }}
      />
    );
  }

  return <div>{/* Render messages */}</div>;
}
```

#### 2. Compact Empty State
```tsx
import { CompactEmptyState } from '@/app/components/states';
import { Users } from 'lucide-react';

function TeamSection() {
  return (
    <div className="bg-card rounded-2xl p-6">
      <h3>Team Members</h3>
      <CompactEmptyState
        icon={Users}
        message="No team members yet"
        action={{
          label: "Invite Members",
          onClick: handleInvite
        }}
      />
    </div>
  );
}
```

### Success States

#### 1. Success Plein Écran
```tsx
import { SuccessState } from '@/app/components/states';

function BookingConfirmation() {
  return (
    <SuccessState
      title="Booking Confirmed!"
      message="Your reservation has been successfully processed"
      action={{
        label: "View My Bookings",
        onClick: () => navigate('/booking')
      }}
    />
  );
}
```

#### 2. Inline Success
```tsx
import { InlineSuccess } from '@/app/components/states';

function ProfileForm() {
  const [saved, setSaved] = useState(false);

  return (
    <form onSubmit={handleSubmit}>
      {saved && <InlineSuccess message="Profile updated successfully!" />}
      {/* Form fields */}
    </form>
  );
}
```

---

## Formulaires avec Validation

### Formulaire Simple avec Validation

```tsx
import { useState } from 'react';
import { FormField, Input, Select, Textarea } from '@/app/components/forms/FormField';
import { InlineSuccess } from '@/app/components/states';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(new Set());
  const [success, setSuccess] = useState(false);

  const validate = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Name is required';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) 
          ? '' 
          : 'Invalid email address';
      case 'message':
        return value.length >= 10 
          ? '' 
          : 'Message must be at least 10 characters';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched.has(name)) {
      const error = validate(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => new Set(prev).add(name));
    const error = validate(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validate(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form
    await submitForm(formData);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && <InlineSuccess message="Message sent successfully!" />}

      <FormField
        label="Full Name"
        required
        error={touched.has('name') ? errors.name : undefined}
      >
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter your name"
          error={!!errors.name && touched.has('name')}
        />
      </FormField>

      <FormField
        label="Email Address"
        required
        hint="We'll never share your email"
        error={touched.has('email') ? errors.email : undefined}
      >
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="your.email@example.com"
          error={!!errors.email && touched.has('email')}
        />
      </FormField>

      <FormField
        label="Message"
        required
        hint="Minimum 10 characters"
        error={touched.has('message') ? errors.message : undefined}
      >
        <Textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={5}
          placeholder="Your message..."
          error={!!errors.message && touched.has('message')}
        />
      </FormField>

      <button
        type="submit"
        className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
      >
        Send Message
      </button>
    </form>
  );
}
```

---

## Notifications Toast

### Utilisation Basique

```tsx
import { useToast, ToastContainer } from '@/app/components/ui/Toast';

function MyComponent() {
  const toast = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      toast.success('Data saved successfully!');
    } catch (error) {
      toast.error('Failed to save data');
    }
  };

  const showInfo = () => {
    toast.info('This is an informational message');
  };

  return (
    <>
      <button onClick={handleSave}>Save</button>
      <button onClick={showInfo}>Show Info</button>
      
      {/* Render toasts */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </>
  );
}
```

### Toast dans un Contexte Global

```tsx
// contexts/ToastContext.tsx
import { createContext, useContext } from 'react';
import { useToast, ToastContainer } from '@/app/components/ui/Toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </ToastContext.Provider>
  );
}

export const useToastContext = () => useContext(ToastContext);

// Usage in any component:
function MyComponent() {
  const toast = useToastContext();

  const handleAction = () => {
    toast.success('Action completed!');
  };

  return <button onClick={handleAction}>Do Something</button>;
}
```

---

## Navigation et Liens

### Navigation Entre Pages

```tsx
import { Link, useNavigate } from 'react-router';

function MyComponent() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Link component */}
      <Link 
        to="/fields/123"
        className="text-primary hover:underline"
      >
        View Field Details
      </Link>

      {/* Programmatic navigation */}
      <button onClick={() => navigate('/booking')}>
        Book Now
      </button>

      {/* Navigation with state */}
      <button onClick={() => navigate('/matches/456', { 
        state: { from: 'home' } 
      })}>
        View Match
      </button>
    </div>
  );
}
```

### Liens avec État Actif

```tsx
function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav>
      <Link
        to="/home"
        className={`px-4 py-2 rounded-lg ${
          isActive('/home')
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted'
        }`}
      >
        Home
      </Link>
    </nav>
  );
}
```

---

## Composants Réutilisables

### Card Wrapper

```tsx
function Card({ title, children, action }) {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3>{title}</h3>
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all"
          >
            {action.label}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// Usage
<Card 
  title="My Statistics"
  action={{ label: "View All", onClick: () => navigate('/stats') }}
>
  <StatsContent />
</Card>
```

### Stat Widget

```tsx
function StatWidget({ label, value, icon: Icon, trend, color }) {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div 
          className="h-12 w-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
        {trend && (
          <span 
            className="text-sm font-semibold px-2 py-1 rounded-lg"
            style={{ 
              backgroundColor: `${color}20`,
              color 
            }}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

// Usage
<StatWidget
  label="Goals Scored"
  value={28}
  icon={Target}
  trend="+12%"
  color="#1DB954"
/>
```

### Modal Pattern

```tsx
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-2xl p-8 border border-border max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3>{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Usage
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Booking Details"
>
  <BookingForm onSubmit={handleSubmit} />
</Modal>
```

### Badge Component

```tsx
function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-muted text-foreground',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-primary/10 text-primary',
    warning: 'bg-accent/10 text-accent',
    error: 'bg-destructive/10 text-destructive',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
}

// Usage
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Cancelled</Badge>
```

---

## Patterns Avancés

### Fetch avec États

```tsx
function useDataFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [url]);

  return { data, loading, error, refetch };
}

// Usage
function MyPage() {
  const { data, loading, error, refetch } = useDataFetch('/api/fields');

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data?.length) return <EmptyState title="No fields found" />;

  return <FieldsList fields={data} />;
}
```

### Pagination

```tsx
function usePagination(items, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return {
    currentItems,
    currentPage,
    totalPages,
    goToPage,
    nextPage: () => goToPage(currentPage + 1),
    prevPage: () => goToPage(currentPage - 1),
  };
}

// Usage
function ItemsList({ items }) {
  const { currentItems, currentPage, totalPages, goToPage, nextPage, prevPage } = 
    usePagination(items, 10);

  return (
    <div>
      {currentItems.map(item => <ItemCard key={item.id} item={item} />)}
      
      <div className="flex items-center justify-between mt-8">
        <button onClick={prevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={nextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
```

---

Cette documentation fournit des exemples concrets pour tous les composants et patterns du Front Office StreetLeague. Adaptez-les selon vos besoins spécifiques !
