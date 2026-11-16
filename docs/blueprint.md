# **App Name**: MissionView (Visite Mystère)

## Vue d'ensemble de la plateforme

MissionView est une plateforme web d'audit qualité et de gestion d'enquêtes mystères pour réseaux de points de vente et enseignes de prestige. Elle interconnecte trois profils d'utilisateurs au sein d'une interface réactive, sécurisée et performante.

---

## 🏗️ Architecture Technique

* **Frontend** : Next.js 15 (App Router, Turbopack, Tailwind CSS, Shadcn UI, Recharts, Leaflet, jsPDF).
* **Application Mobile & PWA** : Progressive Web App complète générée dans le dossier dédié `pwa/` (Service Worker avec mise en cache dynamique, mode hors ligne `offline.html`, manifest `manifest.json`, invite d'installation PWA sur mobile).
* **Point d'entrée Production cPanel** : `server.js` (compatible Phusion Passenger / cPanel Setup Node.js App).
* **Backend API** : Node.js & Express.js (Architecture REST, middlewares RBAC, compression, Helmet, Winston).
* **ORM & Base de Données** : Prisma ORM v5 & MySQL 8 (tables relationnelles avec intégrité référentielle).
* **Sécurité & Authentification** : Tokens JWT chiffrés (SHA-256), hachage Bcrypt, protection IDOR/RBAC, et **Rate-Limiting coulissant anti-brute-force** (10 tentatives max / 15 min, en-tête `Retry-After`).
* **Optimisation Médias** : Compression client des photos d'enquêtes avant upload (redimensionnement intelligent max 1600px, 82% WebP/JPEG, ~90% d'économie disque sur cPanel).
* **Fiabilité Enquêtes** : Sauvegarde automatique en brouillon local (`localStorage`) avec détection et reprise immédiate.
* **Exports & Reporting** : Exportation PDF Exécutif multi-pages avec récapitulatifs, tableaux analytiques et pagination dynamique pour Administrateurs et Clients.
* **Moteur d'automatisation** : Planificateur automatique de rappels de créneaux et d'expiration des missions (cron journalier à 9h00 et vérification périodique toutes les 5 minutes).

---

## 🎨 Charte Graphique & Design System (Emberton Group)

L'ensemble de la plateforme utilise le design system institutionnel Emberton Group à fort contraste :
* **Bleu Marine Principal** : `#041F40` (Bandeaux, headers, cartes actives, boutons primaires).
* **Or & Champagne Accent** : `#D6C799` (Pastilles d'accentuation, icônes, éléments de distinction).
* **Vert Émeraude Succès** : `#10b981` / `#059669` (Statuts actifs, validations, scores élevés, coordonnées GPS).
* **Arrière-plan clair** : `bg-slate-100/70` avec cartes blanches solides `bg-white border-slate-200 shadow-sm rounded-xl`.
* **Typographie** : Police sans-serif moderne, haute lisibilité, hiérarchie claire.

---

## 👥 Rôles Utilisateurs & Espaces

### 1. Administrateur (`admin`)
* **Tableau de Bord & KPIs** : Supervision en temps réel des statistiques d'audits, graphiques d'évolution des inscriptions, répartition des catégories et taux de complétion.
* **Gestion des Missions** : Création assistée, modification, prolongation de dates limites, suppression sécurisée.
* **Assignation par Exception** : Attribution manuelle immédiate sans obligation de passage de quiz préalable.
* **Gestion des Candidatures** : Approbation des candidatures shoppers avec attribution de magasins et de créneaux d'intervention.
* **Gestion des Magasins & Réseau** : Enregistrement manuel ou import en masse via fichiers Excel (.xlsx, .csv), géolocalisation GPS optionnelle, téléchargement de modèles préremplis.
* **Gestion des Utilisateurs** : Consultation, modification des profils shoppers et clients, activation/désactivation en 1 clic.
* **Gestion des Paiements** : Registre centralisé des indemnisations, validation des paiements aux shoppers avec coordonnées bancaires.
* **Messagerie Directe** : Discussion instantanée avec les auditeurs de terrain.
* **Sécurité & Paramètres** : Gestion de la robustesse des mots de passe, audit des accès RBAC, paramétrage des alertes emails.

### 2. Mystery Shopper (`shopper`)
* **Découverte des Missions** : Liste des missions disponibles avec filtres par ville, catégorie, date limite et rémunération.
* **Carte Interactive (`/map`)** : Visualisation géographique des boutiques physiques grâce aux coordonnées GPS des magasins.
* **Candidature & Quiz de qualification** : Postulation, validation des connaissances sur l'enseigne avant intervention.
* **Questionnaire d'Audit Multi-étapes (`/report/:missionId`)** : Remplissage fluide section par section (Section 1 $\rightarrow$ Suivant $\rightarrow$ Section 2 $\rightarrow$ ... $\rightarrow$ Soumission finale).
* **Types de questions supportées** : Texte libre, échelle d'évaluation (étoiles), choix unique/multiple, téléversement de photos avec prévisualisation, enregistrement audio et géolocalisation.
* **Suivi des Missions** : Missions assignées, missions terminées, historique des gains et paiements reçus.

### 3. Client Partenaire (`client`)
* **Espace Dédié** : Consultation des rapports d'audit validés concernant leurs points de vente.
* **Rapports & Statistiques** : Évaluation de la conformité de service, analyses graphiques et téléchargement des synthèses.

---

## 🗄️ Schéma Relationnel MySQL (Résumé)

* `users` : Comptes utilisateurs, rôles (`admin`, `shopper`, `client`), mot de passe haché, ville, téléphone, motivation, statut.
* `missions` : Titre, description, date limite, rémunération, catégorie, statut (`available`, `completed`, `cancelled`), `assignedTo` (JSON).
* `stores` : Points de vente physiques associés aux missions, nom, adresse, ville, latitude, longitude, catégorie, statut actif.
* `applications` : Candidatures des shoppers (`applied`, `approved`, `rejected`), magasin assigné, créneau horaire, statut du rapport.
* `survey_questions` : Questions d'enquête structurées par sections, pondération, types (texte, radio, checkbox, photo, audio, note).
* `reports` : Réponses soumises par les shoppers, photos, fichiers audio, notation globale, statut (`submitted`, `approved`, `refused`).
* `chat_messages` : Messages échangés entre les auditeurs et l'équipe d'administration.
* `bank_info` : Coordonnées bancaires des auditeurs (RIB, IBAN, nom de la banque).
* `paiyments` : Registre des règlements financiers validés.
