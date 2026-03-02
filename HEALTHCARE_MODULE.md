# Module Healthcare - StreetLeague

## 📋 Vue d'ensemble

Le **Module Healthcare** est un système complet de gestion de la santé et du bien-être des athlètes, intégrant suivi médical, nutrition, rendez-vous, et analyses prédictives.

## ✨ Fonctionnalités implémentées

### 1. **Health Dashboard** (`/app/healthcare`)
- Vue d'ensemble centralisée de toutes les métriques de santé
- Indicateurs de santé actuels (poids, IMC, masse grasse, masse musculaire)
- Graphiques de tendances (poids & IMC)
- Historique médical récent
- Rendez-vous à venir
- Plan diététique actif
- Alertes de santé personnalisées
- Accès rapide à tous les sous-modules

### 2. **Health Profile** (`/app/healthcare/profile`)
- **CRUD complet** du profil de santé
- **Informations personnelles**: nom, date de naissance, genre, groupe sanguin, taille
- **Métriques de santé**: poids, masse grasse, masse musculaire, fréquence cardiaque au repos, tension artérielle
- **Historique médical**: allergies, conditions chroniques, médicaments, contact d'urgence
- **Niveau de fitness**: niveau d'activité, heures d'entraînement hebdomadaires
- Calculateur d'IMC intégré avec statut de santé
- Mode édition avec validation
- Conseils de santé personnalisés

### 3. **Medical Records** (`/app/healthcare/records`)
- **CRUD complet** des dossiers médicaux
- Types d'événements: blessures, examens, résultats de laboratoire, diagnostics, traitements
- Recherche et filtrage avancés
- Détails complets: date, médecin, établissement, diagnostic, traitement, médicaments, notes
- Statuts: actif, complété, archivé
- Export de dossiers
- Statistiques de dossiers

### 4. **Appointments** (`/app/healthcare/appointments`)
- **CRUD complet** des rendez-vous
- Types: médical, nutrition, entraînement, examen, suivi
- Calendrier des rendez-vous à venir et passés
- Informations détaillées: médecin, date, heure, durée, établissement, adresse, téléphone
- Statuts: en attente, confirmé, complété, annulé
- Notifications et rappels
- Confirmation et annulation de rendez-vous

### 5. **Diet Plans** (`/app/healthcare/diet`)
- **CRUD complet** des plans nutritionnels
- Objectifs: perte de poids, gain musculaire, maintien, performance, récupération
- Macros détaillées: calories, protéines, glucides, lipides
- Distribution des macros (graphique circulaire)
- Suivi de progression
- Nombre de repas quotidiens
- Objectif d'hydratation
- Durée du plan avec dates de début/fin
- Conseils nutritionnels

### 6. **Health Trends** (`/app/healthcare/trends`)
- **Analyse de tendances à long terme**
- Évolution du poids et de l'IMC
- Composition corporelle (masse grasse vs masse musculaire)
- Santé cardiovasculaire (fréquence cardiaque, tension artérielle)
- Métriques de performance (endurance, force, flexibilité, vitesse)
- Adhésion au plan nutritionnel
- Insights clés et recommandations
- Sélection de période (semaine, mois, 3 mois, année)

### 7. **Health Alerts** (`/app/healthcare/alerts`)
- **Système d'alertes prédictives**
- Types d'alertes: avertissement, info, succès, critique
- Catégories: signes vitaux, rendez-vous, médicaments, nutrition, entraînement, récupération
- Niveaux de priorité: bas, moyen, élevé
- Filtrage par catégorie et priorité
- Marquer comme lu / non lu
- Alertes actionnables avec boutons d'action
- Insights prédictifs de santé:
  - Fenêtre d'entraînement optimale
  - Alertes de qualité de sommeil
  - Timing nutritionnel
  - Rappels d'hydratation

### 8. **Compliance Tracking** (`/app/healthcare/compliance`)
- **Suivi d'adhérence aux recommandations**
- Tâches par catégorie: médicaments, nutrition, exercice, examens, hydratation, sommeil
- Fréquences: quotidien, hebdomadaire, mensuel
- Objectifs et progression
- Suivi des séries (streaks)
- Graphiques d'adhérence:
  - Répartition hebdomadaire par catégorie
  - Tendance d'adhérence globale mensuelle
  - Vue radar de conformité
- Badges et récompenses
- Insights de conformité (forces et axes d'amélioration)
- Statistiques: adhérence globale, série la plus longue, tâches complétées

## 🎨 Design System

Le module respecte strictement le design system de StreetLeague:
- **Couleur primaire**: #1DB954 (vert)
- **Couleur secondaire**: #0F172A (bleu foncé)
- **Couleur d'accentuation**: #F97316 (orange)
- **Typographie**: Poppins (titres), Inter (contenu)
- **Composants UI**: Utilisation cohérente des composants existants (cards, buttons, inputs, charts)
- **Responsive Design**: Compatible desktop, tablette et mobile

## 🗺️ Routes

```typescript
/app/healthcare                    → Health Dashboard
/app/healthcare/profile            → Health Profile
/app/healthcare/records            → Medical Records
/app/healthcare/appointments       → Appointments
/app/healthcare/diet               → Diet Plans
/app/healthcare/trends             → Health Trends
/app/healthcare/alerts             → Health Alerts
/app/healthcare/compliance         → Compliance Tracking
```

## 📊 Opérations CRUD

| Entité | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| **Health Profile** | ✅ | ✅ | ✅ | - |
| **Medical Record** | ✅ | ✅ | ✅ | ✅ |
| **Appointment** | ✅ | ✅ | ✅ | ✅ |
| **Diet Plan** | ✅ | ✅ | ✅ | ✅ |
| **Health Metric** | - | ✅ | ✅ | - |

## 📱 Fonctionnalités avancées

### 1. **Analyse de tendances**
- Reconnaissance de patterns à long terme
- Graphiques interactifs (Recharts)
- Comparaisons temporelles
- Insights automatisés

### 2. **Alertes prédictives**
- Notifications basées sur les données de santé
- Alertes de rendez-vous à venir
- Recommandations d'entraînement optimales
- Alertes de récupération nécessaire

### 3. **Intégration d'appareils externes**
- Structure prête pour la connexion avec wearables
- Synchronisation automatique des métriques
- Support pour balance connectée, moniteur cardiaque, etc.

### 4. **Suivi de conformité**
- Gamification avec badges et streaks
- Visualisations radar pour vue d'ensemble
- Tracking d'adhérence multi-catégories
- Rapports de progression

## 🔄 Navigation

Le module Healthcare est accessible depuis:
1. **Page Performance** (`/app/performance`) → Lien "Healthcare Module"
2. **Navigation directe** → `/app/healthcare`

## 🎯 Données mock

Toutes les pages utilisent des données mock réalistes pour démonstration. En production, ces données seraient connectées à:
- **Supabase** pour la persistance
- **API médicales** pour les données de santé
- **Wearables API** pour les données des appareils
- **Système de notifications** pour les alertes

## 🚀 Prochaines étapes recommandées

Pour la mise en production:

1. **Backend Supabase**
   - Créer les tables: `health_profiles`, `medical_records`, `appointments`, `diet_plans`, `health_metrics`, `compliance_tasks`, `health_alerts`
   - Configurer les Row Level Security (RLS)
   - Créer les relations entre tables

2. **Intégration API**
   - Connecter les formulaires CRUD aux endpoints Supabase
   - Implémenter l'authentification et les autorisations
   - Gérer les uploads de fichiers (résultats de laboratoire, documents)

3. **Notifications**
   - Système de notifications push
   - Rappels de rendez-vous
   - Alertes de santé critiques

4. **Wearables**
   - Intégration Fitbit, Apple Health, Google Fit
   - Synchronisation automatique des métriques

5. **Compliance**
   - Note: Figma Make n'est pas destiné à collecter des IIP ou à sécuriser des données sensibles. Pour une application de santé en production, des mesures de sécurité et de conformité RGPD/HIPAA seraient nécessaires.

## ✅ Éléments supprimés

Les anciennes pages ont été supprimées:
- ❌ `/src/app/pages/health/PersonalHealth.tsx`
- ❌ `/src/app/pages/health/InjuryManagement.tsx`
- ❌ `/src/app/pages/health/Recommendations.tsx`
- ❌ `/src/app/pages/health/TeamHealth.tsx`
- ❌ `/src/app/pages/health/HealthProfessional.tsx`
- ❌ `/src/app/pages/health/Wearables.tsx`
- ❌ `/src/app/pages/health/AlertSystem.tsx`

Remplacées par le module Healthcare unifié et moderne.

## 📦 Composants réutilisés

Le module réutilise intelligemment les composants existants:
- Charts (Recharts)
- Forms (inputs, selects, textareas)
- Cards et layouts
- Icons (Lucide React)
- Navigation (React Router)

## 🎨 Captures d'écran des fonctionnalités

Chaque page inclut:
- Header avec navigation breadcrumb
- Statistiques en temps réel
- Graphiques interactifs
- Formulaires CRUD intuitifs
- États vides, chargement et erreurs
- Responsive design complet

---

**Développé avec ❤️ pour StreetLeague**
