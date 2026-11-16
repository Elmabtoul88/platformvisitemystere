# Documentation Frontend - Espace Administration (`/admin`)

Ce document détaille l'ensemble des modules, vues et fonctionnalités disponibles pour les **administrateurs** dans l'application web MissionView.

**Public cible :** Administrateurs et Super-Administrateurs  
**Accès requis :** Authentification avec jeton JWT valide et rôle `admin`.

---

## 🎨 Charte Graphique & Structure Commune

Toutes les pages de l'espace administration partagent le design system **Emberton Group** :
* **Arrière-plan neutre** : `bg-slate-100/70` garantissant une aération visuelle.
* **Cartes & Conteneurs** : `bg-white border-slate-200 shadow-sm rounded-xl`.
* **En-têtes standardisés** : Titre en `text-2xl sm:text-3xl font-extrabold text-[#041F40]` avec médaillon d'icône marine et or (`bg-[#041F40] text-[#D6C799]`).
* **Pagination unifiée** : Utilisation du composant standard `<DataPagination>` permettant de choisir le nombre d'éléments affichés (10, 20, 50) et de naviguer avec points de suspension.
* **Zéro opacité sombre** : Remplacement de tous les anciens styles transparents sombres par des cartes blanches éclatantes à haut contraste.

---

## 📑 Modules et Pages Administrateur

### 1. Tableau de Bord (`/admin`)
* **Indicateurs KPI Clés** : Total missions actives, rapports en attente de révision, candidatures à traiter, shoppers enregistrés et paiements validés.
* **Graphiques interactifs (Recharts)** :
  * Répartition des statuts de missions (Available / Completed / Cancelled).
  * Répartition des statuts d'audits (Approved / Submitted / Refused / Paid).
  * Courbe d'évolution des inscriptions d'auditeurs dans le temps.
  * Répartition des missions et rémunérations par catégorie d'enseigne.
* **Raccourcis d'actions rapides** : Création d'une mission, consultation des alertes et accès aux paiements.

---

### 2. Gestion de Toutes les Missions (`/admin/missions`)
* **Tableau de supervision** : Titre, enseigne/client, date limite, statut, auditeurs assignés et nombre de rapports soumis.
* **Filtres avancés** : Par statut (Toutes, Disponibles, Terminées, Expirées) et par terme de recherche.
* **Actions par mission** :
  * **Assignation d'Exception (Directe)** : Permet d'assigner manuellement un auditeur à une mission et un magasin spécifique **sans obligation de passer les quiz ni d'attendre une candidature préalable**.
  * **Prolonger la Date Limite** : Action rapide pour reporter l'échéance des missions approchant du terme.
  * **Revue des Rapports (`/admin/missions/:missionId/reports`)** :
    * Validation ou refus motivé des questionnaires d'audit soumis par les auditeurs.
    * **Export PDF Exécutif** : Génération en un clic d'un rapport de synthèse officiel multi-pages (tableau récapitulatif des auditeurs, notes moyennes, scores de conformité et pagination Emberton Group).
  * **Modifier la Mission (`/admin/missions/:missionId/edit`)** : Ajustement des informations générales.
  * **Modifier l'Enquête (`/admin/missions/:missionId/survey/create`)** : Accès à l'éditeur de questions d'enquête. Pour les missions clôturées (`completed`), un bandeau d'alerte informe l'administrateur avec un bouton d'accès direct aux rapports.
  * **Suppression sécurisée** : Dialogue de confirmation AlertDialog avec contrôle d'intégrité.

---

### 3. Gestion des Magasins & Réseau (`/admin/stores`)
* **Cartes Statistiques KPI en tête de page** :
  1. Total Points de Vente (Réseau complet).
  2. Points Actifs & Inactifs.
  3. Villes Couvertes.
  4. Coordonnées GPS renseignées (visibles sur la carte Shopper).
* **Import & Export Excel (.xlsx, .csv)** :
  * Téléchargement du **Modèle Excel officiel prérempli**.
  * Import en masse de centaines de points de vente en quelques secondes avec détection intelligente des colonnes et gestion des accents.
  * Modal d'instructions détaillée spécifiant que **la latitude et la longitude sont 100% optionnelles**.
* **Recherche & Filtres** : Recherche instantanée par nom, adresse, ville et filtrage combiné par mission et par catégorie.
* **Création & Modification manuelle** : Formulaire propre avec interrupteur actif/inactif et coordonnées GPS optionnelles.

---

### 4. Candidatures & Créneaux (`/admin/applications`)
* **Supervision des postulations** : Liste des auditeurs ayant postulé aux missions.
* **Validation des candidatures** :
  * Attribution du magasin cible.
  * Choix du créneau horaire d'intervention.
  * Envoi automatique d'une notification et d'un email de confirmation au shopper.
* **Refus motivé** : Enregistrement du motif de refus consultable par le shopper.

---

### 5. Utilisateurs & Shoppers (`/admin/users`, `[userId]`, `[userId]/edit`)
* **Annuaire complet** : Tableau responsive des auditeurs, clients et administrateurs avec pagination `<DataPagination>`.
* **Activation / Désactivation en 1 clic** : Bascule immédiate du statut du compte (`active` / `inactive`).
* **Fiche profil détaillée (`[userId]`)** : Coordonnées, ville, téléphone, motivation, historique d'audits, téléchargement du CV et note globale.
* **Édition du compte (`[userId]/edit`)** : Modification des informations personnelles, du rôle et du statut.

---

### 6. Gestion des Paiements (`/admin/payments`)
* **Registre financier centralisé** : Suivi des rémunérations dues suite aux rapports d'audit validés.
* **Coordonnées Bancaires** : Consultation du RIB/IBAN renseigné par chaque auditeur.
* **Validation des règlements** : Marquage des paiements comme « Réglé » avec horodatage et archivage comptable.

---

### 7. Messagerie Directe & Chat (`/admin/chat`, `[userId]`)
* **Centre de messagerie** : Liste des conversations actives avec les mystery shoppers avec compteur de messages non lus.
* **Discussion instantanée (`[userId]`)** : Échange en temps réel pour guider l'auditeur sur le terrain ou lever une ambiguïté sur un rapport. Bulles de discussion contrastées (marine pour admin, ardoise pour shopper).

---

### 8. Sécurité & Confidentialité (`/admin/security`)
* **Indicateurs de sécurité** : Identité vérifiée, session active avec chiffrement JWT SHA-256, contrôle d'accès RBAC.
* **Formulaire de renouvellement de mot de passe** : Saisie sécurisée avec évaluation dynamique de robustesse (barre visuelle à 5 niveaux).
* **Recommandations & Supervision 2FA** : Conseils de sécurité et vérification de la protection multi-facteurs.

---

### 9. Paramètres Système (`/admin/settings`)
* **Adresse de notification** : Consultation de l'email administrateur de référence.
* **Alertes emails automatiques** :
  * Nouvelle inscription shopper.
  * Rapport de mission soumis pour révision.
  * Mission approchant de sa date limite.
* **Sauvegarde asynchrone** avec notification Toast immédiate.
