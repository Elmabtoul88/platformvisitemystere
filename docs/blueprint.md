# **App Name**: Emberton Group - Plateforme d'Audit & Visite Mystère

## Vue d'ensemble de la plateforme

La plateforme **Emberton Group** est une solution web et mobile (PWA) de premier plan dédiée à la gestion d'enquêtes mystères et à l'évaluation de la qualité de service pour enseignes de prestige et réseaux de distribution. Elle interconnecte trois profils d'utilisateurs distincts (`admin`, `shopper`, `client`) au sein d'une interface réactive, sécurisée et ergonomique.

---

## 🌐 Environnements & Déploiements

* **Application Frontend Web & PWA** : [https://app.embertongroup.com](https://app.embertongroup.com)
* **API REST Backend** : [https://api.embertongroup.com/api/](https://api.embertongroup.com/api/)
* **Dépôt Git Officiel** : [platformvisitemystere (GitHub)](https://github.com/Elmabtoul88/platformvisitemystere.git)

---

## 🏗️ Architecture Technique

* **Frontend** : Next.js 15 (App Router, Turbopack, Tailwind CSS, Shadcn UI, Recharts, Leaflet, jsPDF, TanStack Query).
* **Application Mobile & PWA** : Progressive Web App complète (`public/manifest.json`, `public/sw.js`, `public/offline.html`, icônes vectorielles PWA, invite d'installation automatique sur smartphones).
* **Point d'entrée Production** : `server.js` (compatible Phusion Passenger sur cPanel / Node.js standalone).
* **Backend API** : Node.js & Express.js (Architecture REST modulaire, middlewares RBAC, compression gzip, Helmet, Winston logger).
* **ORM & Base de Données** : Prisma ORM v5 & MySQL 8 (tables relationnelles avec intégrité référentielle et contraintes de clés étrangères).
* **Sécurité & Authentification** :
  * Tokens JWT chiffrés (SHA-256) avec extraction hybride (Cookies http-only / LocalStorage / En-têtes `Authorization: Bearer`).
  * Hachage Bcrypt des mots de passe.
  * **Rate-Limiting coulissant anti-brute-force** (10 tentatives max / 15 min, en-tête `Retry-After`).
* **Optimisation Médias** : Compression client automatique des photos d'enquêtes avant upload (redimensionnement intelligent max 1600px, compression WebP/JPEG, ~90% d'économie disque sur le serveur).
* **Fiabilité Enquêtes** : Sauvegarde automatique en brouillon local (`localStorage`) avec détection et reprise immédiate en cas de coupure.
* **Exports & Reporting** : Exportation PDF Exécutif multi-pages avec récapitulatifs, tableaux analytiques et pagination dynamique pour Administrateurs et Clients.
* **Moteur d'automatisation** : Planificateur automatique de rappels de créneaux et d'expiration des missions (cron journalier à 9h00 et vérification périodique toutes les 5 minutes).

---

## 🎨 Charte Graphique & Design System (Emberton Group)

L'ensemble de la plateforme utilise le design system institutionnel Emberton Group à fort contraste et haute visibilité :
* **Bleu Marine Principal** : `#041F40` (Bandeaux exécutifs, headers, cartes actives, boutons primaires).
* **Or & Champagne Accent** : `#D6C799` (Pastilles d'accentuation, icônes, éléments de distinction).
* **Vert Émeraude Succès** : `#10b981` / `#059669` (Statuts actifs, validations, scores élevés, coordonnées GPS).
* **Arrière-plan clair et aéré** : `bg-slate-50/90` avec cartes blanches solides `bg-white border-slate-200/80 shadow-sm rounded-2xl`.
* **Typographie** : Police sans-serif moderne, haute lisibilité, hiérarchie claire éliminant les textes gris peu contrastés.

---

## 👥 Rôles Utilisateurs & Espaces

### 1. Administrateur (`admin`)
* **Tableau de Bord & KPIs (`/admin`)** : Supervision en temps réel des statistiques d'audits, graphiques d'évolution des inscriptions, répartition des catégories et taux de complétion.
* **Gestion des Missions (`/admin/missions`)** : Création assistée, modification, prolongation de dates limites, suppression sécurisée.
* **Assignation par Exception** : Attribution manuelle immédiate sans obligation de passage de quiz préalable.
* **Gestion des Candidatures (`/admin/applications`)** : Approbation des candidatures shoppers avec attribution de magasins et de créneaux d'intervention.
* **Gestion des Magasins & Réseau (`/admin/stores`)** :
  * Enregistrement manuel ou **Import en masse via fichiers Excel (.xlsx, .csv)** avec détection intelligente des colonnes et gestion des accents.
  * Coordonnées GPS optionnelles pour affichage sur la carte interactive.
  * Téléchargement de modèles Excel préremplis.
* **Gestion des Utilisateurs (`/admin/users`)** : Consultation, modification des profils shoppers et clients, activation/désactivation en 1 clic.
* **Gestion des Règlements (`/admin/payments`)** : Registre centralisé des indemnisations, validation des paiements aux shoppers avec consultation de leur RIB / IBAN.
* **Messagerie Directe (`/admin/chat`)** : Discussion instantanée avec les auditeurs de terrain.
* **Sécurité & Journaux d'Audit (`/admin/security`)** : Gestion de la robustesse des mots de passe, audit des accès RBAC, paramétrage des alertes emails.

### 2. Mystery Shopper (`shopper`)
* **Découverte des Missions (`/`)** : Liste des missions disponibles dans un thème exécutif clair et lumineux avec filtres par ville, catégorie, date limite et rémunération.
* **Carte Interactive (`/map`)** : Visualisation géographique des boutiques physiques grâce aux coordonnées GPS des magasins avec popups interactifs.
* **Candidature & Quiz de qualification (`/missions/:id/details`)** : Postulation, validation des connaissances sur l'enseigne avant intervention.
* **Questionnaire d'Audit Multi-étapes (`/report/:id`)** : Remplissage fluide section par section avec brouillon automatique local et compression des photos.
* **Missions Assignées (`/missions/assigned`)** : Suivi des missions en cours, créneaux et magasins assignés.
* **Missions Terminées (`/missions/completed`)** : Historique complet, statuts d'approbation et indemnités perçues.
* **Messagerie Directe (`/chat`)** : Échange direct avec l'équipe de coordination Emberton.
* **Paramètres & RIB (`/settings`)** : Gestion du profil, coordonnées bancaires (RIB/IBAN), mot de passe et préférences de notification.

### 3. Client Partenaire (`client`)
* **Espace Dédié (`/client`)** : Consultation des rapports d'audit validés concernant leurs points de vente.
* **Rapports & Statistiques** : Évaluation de la conformité de service, analyses graphiques et téléchargement des synthèses officielles en PDF.

### 4. Pages Publiques d'Information
* **Accueil (`/`)** : Vitrine institutionnelle Emberton Group pour les visiteurs non authentifiés.
* **À propos (`/about`)** : Présentation de l'agence, de ses valeurs d'excellence et de sa méthodologie.
* **Services (`/services`)** : Catalogue des prestations d'audit de l'expérience client.
* **Contact (`/contact`)** : Formulaire et coordonnées de contact (Paris & Casablanca).
* **Tableau de Bord Public (`/dashboard`)** : Métriques globales de la communauté.
* **Espace Connexion & Mot de Passe** : `/login`, `/signup`, `/forgot-password`, `/reset-password`.

---

## 🗄️ Schéma Relationnel MySQL (Prisma ORM)

* `users` : Comptes utilisateurs, rôles (`admin`, `shopper`, `client`), mot de passe haché (Bcrypt), ville, téléphone, motivation, statut actif/inactif.
* `missions` : Titre, description, date limite, rémunération, catégorie, statut (`available`, `completed`, `cancelled`), `assignedTo` (JSON).
* `stores` : Points de vente physiques associés aux missions, nom, adresse, ville, latitude, longitude, catégorie, statut actif.
* `applications` : Candidatures des shoppers (`applied`, `approved`, `rejected`), magasin assigné, créneau horaire, statut du rapport.
* `survey_questions` : Questions d'enquête structurées par sections, pondération, types (texte, radio, checkbox, photo, audio, note, date, heure, oui/non).
* `reports` : Réponses soumises par les shoppers, photos, fichiers audio, notation globale, statut (`submitted`, `approved`, `refused`, `paid`).
* `chat_messages` : Messages échangés entre les auditeurs et l'équipe d'administration.
* `bank_info` : Coordonnées bancaires des auditeurs (titulaire, nom de banque, RIB, SWIFT, pays, devise).
* `paiyments` : Registre des règlements financiers validés.
