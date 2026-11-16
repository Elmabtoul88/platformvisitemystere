# 🌟 Emberton Group - Plateforme de Visites Mystères & Audits Qualité

> Plateforme web et mobile (PWA) de référence pour le pilotage d'enquêtes mystères et l'évaluation de la performance client d'exception pour enseignes de prestige et réseaux de points de vente.

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.x-lightgrey?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-blue?logo=prisma)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple?logo=pwa)](https://developer.mozilla.org/fr/docs/Web/Progressive_web_apps)

---

## 🌐 Déploiements en Production

| Composant | URL de Production | Description |
| :--- | :--- | :--- |
| **Application Web (Frontend)** | [https://app.embertongroup.com](https://app.embertongroup.com) | Espace auditeurs (shoppers), clients et administration |
| **API REST (Backend)** | [https://api.embertongroup.com/api/](https://api.embertongroup.com/api/) | Services Express.js, authentification JWT et Prisma ORM |
| **Dépôt Git Officiel** | [platformvisitemystere](https://github.com/Elmabtoul88/platformvisitemystere.git) | Code source complet frontend, backend & documentation |

---

## 🚀 Fonctionnalités Clés

### 👥 1. Espace Mystery Shopper (Auditeur de Terrain)
* **Catalogue des Missions Disponibles (`/`)** : Interface claire et lumineuse haute visibilité (fond `slate-50`, cartes blanches à fort contraste), filtrage instantané par ville, catégorie, date limite et rémunération.
* **Carte Interactive des Points de Vente (`/map`)** : Carte Leaflet affichant les boutiques à auditer avec repères GPS, popups d'information et lien direct de candidature.
* **Candidature & Quiz de Qualification (`/missions/:id/details`)** : Validation des connaissances des consignes avant sélection.
* **Questionnaire d'Audit Multi-étapes (`/report/:id`)** :
  * Progression fluide section par section (Accueil, Propreté, Conseil, Caisse, etc.).
  * **Sauvegarde automatique locale (Brouillon auto)** : Reprise d'enquête immédiate en cas de rafraîchissement ou coupure réseau.
  * **Compression automatique des photos** dans le navigateur (réduction de 8-12 Mo à ~400 Ko en WebP/JPEG) pour un envoi ultra-rapide en 4G/5G.
  * Prise en charge des notes par étoiles, questions à choix multiples, justifications texte, enregistrements audio vocaux et géolocalisation.
* **Missions Assignées & Terminées** : Suivi des créneaux horaires, magasins attribués, statuts d'approbation et indemnités perçues.
* **Messagerie Directe (`/chat`)** : Discussion instantanée avec l'administrateur coordinateur.
* **Coordonnées Bancaires (`/settings`)** : Saisie sécurisée du RIB / IBAN et gestion du profil.

### 🛡️ 2. Espace Administrateur (`/admin`)
* **Tableau de Bord & KPIs** : Statistiques en temps réel, graphiques d'évolution (Recharts), taux d'acceptation et alertes de suivi.
* **Gestion Complète des Missions (`/admin/missions`)** :
  * Création, modification et clôture des missions.
  * **Assignation d'Exception (Directe)** : Attribution immédiate d'un auditeur sans passage de quiz.
  * **Prolongation de Date Limite** : Action rapide pour reporter l'échéance d'une mission.
  * **Éditeur d'Enquêtes Avancé** : Modélisation des sections, questions pondérées et critères d'évaluation.
* **Revue des Rapports & Export PDF Exécutif** : Validation ou refus motivé des audits et génération de rapports multi-pages téléchargeables avec synthèses et notes moyennes.
* **Gestion du Réseau de Magasins (`/admin/stores`)** :
  * Création manuelle ou **Import en masse via fichiers Excel (.xlsx, .csv)** avec détection intelligente des colonnes.
  * Téléchargement de modèles Excel préremplis et coordonnées GPS optionnelles.
* **Candidatures & Créneaux (`/admin/applications`)** : Validation des candidatures avec sélection du point de vente et du créneau horaire.
* **Gestion des Utilisateurs (`/admin/users`)** : Supervision des comptes shoppers, clients et administrateurs avec activation/désactivation en 1 clic.
* **Gestion des Règlements & Paiements (`/admin/payments`)** : Registre centralisé des indemnisations et coordonnées bancaires des auditeurs.
* **Sécurité & Journaux d'Audit (`/admin/security`)** : Indicateurs RBAC, politique de mots de passe et sessions chiffrées.

### 👔 3. Espace Client Partenaire (`/client`)
* Consultation sécurisée des rapports d'audit validés concernant leurs points de vente.
* Évaluation de la conformité de service, analyses graphiques et téléchargement des synthèses d'expérience client.

### 📱 4. Progressive Web App (PWA) & Mode Hors-Ligne
* Fichiers de configuration dédiés (`public/manifest.json`, `public/sw.js`, `public/offline.html`).
* Composant d'installation natif mobile (`PwaInstallPrompt`) pour Android et iOS.
* Navigation plein écran (`standalone`) et mise en cache des ressources critiques.

---

## 🛠️ Stack Technique

```
├── Frontend
│   ├── Next.js 15.2 (App Router & Server Actions)
│   ├── React 19
│   ├── Tailwind CSS & Shadcn UI
│   ├── TanStack Query v5 (Cache intelligent & déduplication)
│   ├── Leaflet & React-Leaflet (Cartographie interactive)
│   ├── Recharts (Visualisations graphiques & diagrammes radar)
│   └── jsPDF & jsPDF-AutoTable (Moteur de génération PDF)
│
├── Backend API
│   ├── Node.js 18+ LTS & Express.js
│   ├── Prisma ORM v5 (Accès base de données relationnelle)
│   ├── MySQL 8.0 (Stockage relationnel)
│   ├── JWT & Bcrypt (Authentification & hachage)
│   ├── Express Rate Limit (Protection coulissante anti-brute force)
│   ├── Multer (Téléversement sécurisé de photos, CV et audios)
│   └── Nodemailer (Service de notification SMTP transactionnel)
```

---

## 📂 Structure du Répertoire

```
platformvisitemystere/
├── backend/                  # API REST Express.js & Prisma ORM
│   ├── middleware/           # RBAC, Rate-Limiting, Multer, Erreurs
│   ├── prisma/               # Schéma Prisma ORM (schema.prisma)
│   ├── routes/               # Routes Express (missions, stores, auth, etc.)
│   ├── services/             # Envoi d'emails (mailer.js), base URLs
│   ├── test/                 # Suites de tests automatisés (Jest/Supertest)
│   ├── app.js                # Point d'entrée principal de l'API
│   └── .env.example          # Gabarit des variables d'environnement backend
│
├── docs/                     # Documentation technique détaillée
│   ├── api/                  # Spécifications OpenAPI/REST (missions, admin, auth, reports)
│   ├── deployment/           # Guide de déploiement cPanel (Passenger)
│   ├── frontend/             # Guides des espaces Shopper, Client et Admin
│   └── blueprint.md          # Architecture globale et spécifications produit
│
├── public/                   # Fichiers publics PWA, icônes et scripts
│   ├── icons/                # Icônes PWA (192x192, 512x512, maskable)
│   ├── manifest.json         # Manifeste PWA
│   ├── sw.js                 # Service Worker PWA
│   └── offline.html          # Page hors-ligne PWA
│
├── src/                      # Code source Frontend Next.js
│   ├── app/                  # Routes Next.js App Router
│   │   ├── admin/            # Espace Administrateur (missions, stores, payments, etc.)
│   │   ├── client/           # Espace Client Partenaire
│   │   ├── missions/         # Vues Shopper (assigned, completed, details)
│   │   ├── report/           # Formulaire de rapport d'audit multi-étapes
│   │   ├── map/              # Carte géographique Leaflet
│   │   ├── chat/             # Messagerie instantanée auditeur-admin
│   │   ├── settings/         # Paramètres, profil et coordonnées bancaires
│   │   └── (auth)/           # Pages de connexion, inscription et réinitialisation
│   ├── components/           # Composants UI réutilisables (MissionCard, Filters, etc.)
│   ├── context/              # Contextes React (AuthContext, MessageContext, QueryProvider)
│   ├── lib/                  # Utilitaires (imageCompression, adminReportUtils)
│   └── services/             # Client HTTP Axios et appels d'API
│
├── database/                 # Sauvegardes et schémas SQL (missionview_db.sql)
├── server.js                 # Point d'entrée serveur de production (Phusion Passenger / cPanel)
├── .env.example              # Gabarit des variables d'environnement frontend
└── package.json              # Dépendances et scripts npm
```

---

## 💻 Démarrage en Développement Local

### 1. Cloner le Répertoire
```bash
git clone https://github.com/Elmabtoul88/platformvisitemystere.git
cd platformvisitemystere
```

### 2. Configurer les Variables d'Environnement
Copiez les fichiers d'exemple :
```bash
# Frontend
cp .env.example .env

# Backend
cp backend/.env.example backend/.env
```
Renseignez vos accès MySQL et clés secrètes dans `backend/.env`.

### 3. Installer les Dépendances
```bash
# Frontend
npm install

# Backend
cd backend
npm install
npx prisma generate
cd ..
```

### 4. Lancer les Serveurs Locaux
```bash
# Lancer le Backend API (Port 5000)
cd backend
node app.js

# Dans un autre terminal, lancer le Frontend Next.js (Port 3000 ou 9002)
npm run dev
```

L'application est accessible sur `http://localhost:3000` et l'API sur `http://localhost:5000/api/`.

---

## 🚢 Déploiement en Production (cPanel & Passenger)

Consultez le guide détaillé pas à pas dans :
👉 [Guide de Déploiement cPanel](docs/deployment/cpanel.md)

### Résumé des commandes de build :
```bash
# Compilation optimisée Next.js
npm run build

# Démarrage en mode production
$env:PORT="9002"; $env:NODE_ENV="production"; node server.js
```

---

## 🔒 Sécurité & Bonnes Pratiques
* **Tokens JWT** : Chiffrement systématique avec expiration et contrôle RBAC strict sur chaque endpoint sensible.
* **Rate-Limiting** : Protection contre les attaques par force brute (10 tentatives / 15 minutes sur `/api/auth`).
* **Validation des Entrées** : Validation systématique des corps de requêtes via schémas Joi.
* **Fichiers .env** : Exclus du contrôle de version Git pour éviter toute fuite de mots de passe.

---

## 📄 Licence & Droits d'Auteur
© 2024-2026 **Emberton Group**. Tous droits réservés.  
Plateforme développée pour l'audit et l'excellence de l'expérience client.
