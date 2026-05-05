# Esprit-PIDEV_SE-4SE2-2526-streetleague (Frontend)

<div align="center">
  <img src="https://img.shields.io/badge/Angular_17+-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Jasmine-8A4182?style=for-the-badge&logo=jasmine&logoColor=white" alt="Jasmine">
</div>

---

## 📖 Description

**StreetLeague** est une plateforme innovante dédiée à la gestion du sport amateur. L'application permet d'organiser des compétitions, de gérer la réservation de terrains (SportSpaces) et de récolter des feedbacks de la communauté. Ce repository contient l'**Application Frontend** (Angular) utilisée par les joueurs, propriétaires de terrains et administrateurs.

## 👥 Membres de l'Équipe & Répartition

- **Fehmi Katar** : Interfaces de réservation, Gestion des Terrains (SportSpace), Feedbacks, Interface d'Authentification , profils utilisateurs et Tests Unitaires 

## 🏗️ Structure du Projet Angular

* 📂 **`src/app/pages/`** : Les composants d'écrans principaux (UI).
* 📂 **`src/app/services/`** : Services Angular qui communiquent avec l'API Spring Boot.
* 📂 **`src/app/core/`** : Intercepteurs, guards (sécurité) et modèles métier.
* 📂 **`src/`** : Fichiers statiques et configurations globales (styles, environnements).

## 🛠️ Instructions de lancement

### Pré-requis
- Node.js (v18+)
- Angular CLI

### Déploiement Local
1. **Cloner le repository**
   ```bash
   git clone https://github.com/fehmikatar/Esprit-PIDEV_SE-4SE2-2526-streetleague.git
   cd streetLeaguefront-angular
   ```
2. **Installer les dépendances**
   ```bash
   npm install
   ```
3. **Lancer l'application**
   ```bash
   ng serve
   ```
L'application sera accessible sur `http://localhost:4200/`. (Assurez-vous que le backend tourne sur le port `8080`).

## ⚙️ Tests Unitaires
Les tests ont été réalisés académiquement à l'aide de la syntaxe **Jasmine**. 
Fichiers testés : `booking.service.spec.ts`, `user.service.spec.ts`, `notification.service.spec.ts`.

---
**Module de Projet Intégré (PI)** - École Supérieure Privée d'Ingénierie et de Technologies (ESPRIT)
