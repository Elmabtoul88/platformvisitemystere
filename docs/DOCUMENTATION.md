# SEC Visite Mystère - Documentation Platforme

Cette documentation détaille les fonctionnalités de la plateforme MissionView pour les trois rôles utilisateurs : Shopper, Administrateur et Client.

## 1. Site Public (Vitrine Corporate)
Inspiré par l'esthétique premium d'Emberton Group, le site public sert de vitrine avant connexion.
- **Accueil** : Présentation stratégique, statistiques globales, méthodologie d'audit et appels à l'action.
- **À Propos** : Histoire de l'entreprise, valeurs d'intégrité et secteurs d'expertise (Luxe, Retail, Banque, etc.).
- **Services** : Détail des prestations (Visites Mystères, Audits de Conformité, Business Intelligence).
- **Contact** : Formulaire de demande de devis, coordonnées et carte interactive.
- **Authentification** : Système de connexion et d'inscription (Sign-up) avec interface split-screen.

---

## 2. Espace Shopper (Audit & Gains)
Le shopper est l'utilisateur terrain qui réalise les missions.
- **Tableau de Bord** : Liste filtrable des missions disponibles (par ville, catégorie, date).
- **Carte des Missions** : Visualisation géographique des opportunités autour de soi via Géolocalisation.
- **Processus de Candidature** :
    - Étape 1 : Consultation des détails (récompense, profil recherché).
    - Étape 2 : Sélection multi-magasins (choisir un ou plusieurs points de vente).
    - Étape 3 : Quiz de qualification (vérification du profil).
- **Suivi des Missions** :
    - Onglet "Assignées" : Missions prêtes à être réalisées.
    - Onglet "Candidatures" : Suivi des statuts (En attente, Refusée avec motif, Approuvée).
- **Exécution de Mission** :
    - Consultation obligatoire des documents (Briefing, Scénario).
    - Quiz de validation des connaissances (débloque le questionnaire final).
    - Questionnaire final dynamique (Texte, Photo, GPS, Audio, Évaluation par étoiles).
- **Terminées & Gains** :
    - Historique complet avec filtres avancés (Recherche, Statut de paiement, Plage de dates).
    - Statistiques financières (Total gagné, Total payé, En attente, Refusé).
- **Paramètres** :
    - Profil personnel et photo.
    - **Coordonnées Bancaires** : Enregistrement du RIB/IBAN pour les virements.
    - Apparence : Mode sombre/clair.
- **Messagerie** : Chat direct avec l'administration.

---

## 3. Espace Administrateur (Gestion & Pilotage)
L'admin gère l'intégralité du flux opérationnel.
- **Dashboard Analytique** : Graphiques Recharts sur les statuts de missions, les rapports et la croissance du réseau.
- **Gestion des Missions** :
    - Création et édition de missions (Détails, PDFs, Quiz de profil).
    - **Survey Builder** : Créateur de formulaires dynamique (sections, types de champs variés).
    - Attribution directe : Assigner manuellement des missions à des shoppers spécifiques.
- **Validation des Candidatures** : Examiner les profils, valider les points de vente et planifier les dates de visite.
- **Revue des Rapports** :
    - Audit des réponses et médias soumis (photos, audios).
    - Approbation (déclenche le processus de paiement) ou Refus (avec motif).
- **Gestion des Paiements** :
    - Console centrale des virements à effectuer.
    - Consultation des coordonnées bancaires des shoppers.
    - Enregistrement des références de transaction et notes internes.
    - Export des listes de paiement en format **Excel/CSV**.
    - Statistiques de volume financier.
- **Gestion des Utilisateurs** : Annuaire complet, consultation des CVs, activation/désactivation de comptes.
- **Chat Hub** : Centre de messagerie pour répondre aux questions des shoppers.

---

## 4. Espace Client (Reporting Business)
Le client (enseigne) consulte les résultats de ses audits.
- **Dashboard Client** : Vue d'ensemble de ses projets et statuts en temps réel.
- **Analyse de Mission** :
    - Statistiques de performance (Taux d'approbation).
    - Tableau des rapports approuvés avec filtres.
    - Export des données brutes en **CSV** ou rapports de synthèse en **PDF**.

---

## 5. Structure Technique
- **Frontend** : Next.js 15 (App Router), React, Tailwind CSS, ShadCN UI.
- **State** : React Context (Auth).
- **Visualisation** : Recharts (Graphiques), Leaflet (Cartographie).
- **Export** : XLSX (Excel), jsPDF (PDF).
