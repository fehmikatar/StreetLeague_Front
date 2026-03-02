# StreetLeague Front Office - Guide Complet

## Vue d'ensemble

Le Front Office de StreetLeague est une interface utilisateur complète conçue avec une cohérence totale avec le Back Office existant. Il utilise la même palette de couleurs, typographie, et principes de design.

## Design System

### Couleurs
- **Primary (Vert)**: `#1DB954` - Actions principales, éléments actifs
- **Secondary (Bleu marine)**: `#0F172A` - Éléments structurants
- **Accent (Orange)**: `#F97316` - Interactions clés, CTA secondaires
- **Error Red**: `#DC2626` - Erreurs, alertes destructives
- **Muted**: Variations de gris pour les éléments secondaires

### Typographie
- **Titres (h1-h4)**: Poppins (600-700)
- **Corps de texte**: Inter (400-600)
- **Taille de base**: 16px

### Composants de base
- **Border Radius**: 1rem (16px) pour les cartes, 0.75rem (12px) pour les boutons
- **Spacing**: Système cohérent basé sur des multiples de 4px
- **Shadows**: `shadow-lg shadow-primary/30` pour les éléments interactifs

## Structure des Pages

### 1. Pages Principales

#### Home (`/`)
- Dashboard personnalisé de l'utilisateur
- Statistiques rapides
- Profil utilisateur et badges
- Roster d'équipe

#### User Profile (`/user-profile`)
**Sections:**
- Profile: Informations personnelles, édition inline
- Security: Changement de mot de passe, 2FA
- Preferences: Langue, fuseau horaire, visibilité
- Notifications: Paramètres de notification (email, push, SMS)

**Fonctionnalités:**
- Mode édition avec boutons Save/Cancel
- Validation en temps réel
- États de succès/erreur inline

#### Notifications Center (`/notifications`)
**Fonctionnalités:**
- Filtres par type (Match, Team, Booking, Health, Sponsor, System)
- Filtres par statut (Unread, Read, Archived)
- Recherche en temps réel
- Actions: Mark as read, Archive, Delete
- Badges de comptage non lus
- Timeline temporelle relative

### 2. Vues Détaillées

#### Field Detail (`/fields/:id`)
**Sections:**
- Galerie d'images avec sélection
- Informations du terrain (sport, capacité, surface)
- Équipements et installations
- Règles du terrain
- Système d'évaluation et reviews
- Sidebar de réservation avec:
  - Sélecteur de date
  - Sélecteur de créneau horaire
  - Prix calculé dynamiquement
  - Informations de contact du propriétaire

#### Match Detail (`/matches/:id`)
**États:**
- Upcoming: Informations pré-match, bouton "I'm Attending"
- Live: Score en temps réel avec badge animé
- Completed: Statistiques complètes, timeline, MVP

**Onglets:**
- Overview: Détails du match, météo, arbitre
- Lineup: Composition des deux équipes
- Statistics: Stats comparatives (possession, tirs, etc.)

#### Booking Form (`/booking-form`)
**Multi-step form avec validation:**
1. **Booking Details**: Terrain, date, horaire, durée
2. **Contact Info**: Nom, email, téléphone
3. **Payment**: Récapitulatif, méthode de paiement

**Fonctionnalités:**
- Validation inline sur blur
- Messages d'erreur contextuels
- Progress stepper visuel
- Récapitulatif dynamique du prix

### 3. Composants d'États Réutilisables

#### Loading States
```tsx
import { LoadingState, CardSkeleton, TableSkeleton, ListSkeleton } from '@/app/components/states';

// Loader plein écran
<LoadingState message="Loading data..." fullScreen />

// Skeletons spécifiques
<CardSkeleton />
<TableSkeleton rows={5} />
<ListSkeleton items={3} />
```

#### Error States
```tsx
import { ErrorState, InlineError } from '@/app/components/states';

// Erreur plein écran avec retry
<ErrorState 
  title="Failed to load"
  message="Could not fetch data"
  onRetry={() => refetch()}
/>

// Erreur inline
<InlineError message="Invalid email format" />
```

#### Empty States
```tsx
import { EmptyState, CompactEmptyState } from '@/app/components/states';

// Empty state avec action
<EmptyState
  icon={Inbox}
  title="No messages yet"
  description="Start a conversation"
  action={{ label: "New Message", onClick: handleNew }}
/>

// Compact version
<CompactEmptyState
  icon={Users}
  message="No team members"
  action={{ label: "Invite", onClick: handleInvite }}
/>
```

#### Success States
```tsx
import { SuccessState, InlineSuccess } from '@/app/components/states';

// Success plein écran
<SuccessState
  title="Booking Confirmed!"
  message="Your reservation has been processed"
  action={{ label: "View Details", onClick: goToBooking }}
/>

// Success inline (toast-like)
<InlineSuccess message="Profile updated successfully" />
```

### 4. Composants de Formulaires

#### FormField avec validation
```tsx
import { FormField, Input, Select, Textarea } from '@/app/components/forms/FormField';

<FormField
  label="Email Address"
  required
  error={errors.email}
  hint="We'll never share your email"
>
  <Input
    type="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    error={!!errors.email}
  />
</FormField>
```

**Props disponibles:**
- `label`: Texte du label
- `required`: Affiche un astérisque rouge
- `error`: Message d'erreur (texte rouge avec icône)
- `success`: Message de succès (texte vert avec icône)
- `hint`: Texte d'aide (gris avec icône info)

## Navigation

### Desktop
- **Sidebar gauche**: Navigation principale
- **Top bar**: Notifications + accès profil
- **Responsive**: Adaptable aux différentes tailles d'écran

### Mobile
- **Top header**: Logo + menu hamburger
- **Bottom navigation**: 5 items principaux
- **Drawer menu**: Menu coulissant avec toutes les options

## Routes

```typescript
// Pages publiques
/landing          - Landing page
/auth/login       - Connexion
/auth/signup      - Inscription

// Pages authentifiées
/                 - Home Dashboard
/user-profile     - Profil & paramètres
/notifications    - Centre de notifications

// Terrains
/fields           - Liste des terrains
/fields/:id       - Détail d'un terrain
/fields/add       - Ajout de terrain (propriétaires)

// Matchs
/matches          - Liste des matchs
/matches/:id      - Détail d'un match

// Réservations
/booking          - Liste des réservations
/booking-form     - Formulaire de réservation

// Performance & Santé
/performance      - Dashboard performance
/performance/...  - Sous-pages santé

// Autres
/team             - Gestion d'équipe
/community        - Communauté
/sponsors         - Sponsors
/admin            - Administration
```

## Bonnes Pratiques

### 1. Cohérence Visuelle
- Toujours utiliser les classes Tailwind du design system
- Respecter les espacements (p-4, p-6, p-8)
- Utiliser les border-radius cohérents (rounded-xl, rounded-2xl)

### 2. États UI
- Toujours afficher un état de chargement
- Gérer les erreurs avec messages clairs
- Afficher des empty states engageants
- Confirmer les actions avec succès

### 3. Formulaires
- Validation inline après le premier blur
- Messages d'erreur contextuels
- Désactivation des boutons pendant soumission
- Feedback visuel immédiat

### 4. Accessibilité
- Labels pour tous les inputs
- Contrastes de couleur conformes
- Navigation au clavier
- États focus visibles

### 5. Responsive
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Test sur toutes les tailles d'écran

## Intégration API

Tous les composants utilisent des données mock. Pour l'intégration backend:

1. Remplacer les `MOCK_DATA` par des appels API
2. Utiliser les états Loading/Error appropriés
3. Gérer la pagination si nécessaire
4. Implémenter le caching si approprié

## Performance

- Lazy loading des images avec `ImageWithFallback`
- Skeleton loaders pendant le chargement
- Optimisation des re-renders avec React.memo si nécessaire
- Code splitting par routes

## Prochaines Étapes

1. Intégration complète avec le backend
2. Tests unitaires et E2E
3. Optimisations de performance
4. Internationalisation (i18n)
5. Dark mode complet
6. PWA capabilities
