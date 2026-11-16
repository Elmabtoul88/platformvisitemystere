# Documentation Frontend - Espace Mystery Shopper (Auditeur)

Ce document décrit l'ensemble des fonctionnalités et parcours offerts aux **mystery shoppers (auditeurs)** sur la plateforme MissionView.

**Public cible :** Mystery Shoppers (Auditeurs qualité)  
**Accès requis :** Compte utilisateur avec rôle `shopper`.

---

## 🧭 Parcours & Cycle de Vie d'une Mission

```mermaid
flowchart LR
    A["1. Découverte\n(/ ou /map)"] --> B["2. Candidature\n& Quiz"]
    B --> C["3. Validation Admin\n(Créneau & Magasin)"]
    C --> D["4. Réalisation terrain\n& Questionnaire multi-étapes"]
    D --> E["5. Revue Admin\n& Rémunération"]
```

---

## 📑 Pages et Fonctionnalités Shopper

### 1. Découverte des Missions Disponibles (`/` et `/map`)
* **Vue Cartes (`/`)** :
  * Filtres par ville, catégorie, date limite et rémunération.
  * Cartes de missions optimisées : titre, enseigne, adresse, ville, gain en DH/EUR et date limite d'échéance.
  * Indicateur clair des missions expirantes.
* **Vue Carte Interactive (`/map`)** :
  * Intégration de la bibliothèque **Leaflet**.
  * Affichage de repères (marqueurs) pour chaque magasin possédant des coordonnées GPS valides (latitude et longitude).
  * Fenêtre popup au clic affichant le nom du magasin, son adresse et un lien direct pour postuler à la mission associée.

---

### 2. Détail & Candidature (`/missions/:missionId/details`)
* Consultation du briefing complet, des consignes de visite et des critères de validation.
* **Passage des Quiz de Qualification** : Test de validation des connaissances de l'auditeur sur les scénarios de visite de l'enseigne avant validation de sa postulation.
* Notification en cas de succès et bascule de l'état en « Candidature transmise ».

---

### 3. Missions Assignées (`/missions/assigned`)
* Liste des missions attribuées suite à l'approbation de l'administrateur (ou via assignation directe d'exception).
* Affichage du **magasin assigné** et du **créneau horaire officiel** d'intervention.
* Bouton d'accès immédiat au rapport d'audit : **« Remplir le Questionnaire »**.

---

### 4. Questionnaire d'Audit Multi-étapes (`/report/:missionId`)
Le questionnaire d'audit est découpé par **sections thématiques** (ex: Accueil, Propreté, Conseil, Passage en caisse) pour offrir une expérience ergonomique et sans perte de données :
* **Brouillon Automatique Local (Auto-Save)** :
  * Sauvegarde automatique locale en temps réel (`localStorage`) des réponses, commentaires, sélections et notations de l'auditeur.
  * Détection automatique à l'ouverture : bandeau interactif proposant de reprendre l'enquête là où l'auditeur s'était arrêté ou de repartir de zéro.
  * Indicateur visuel d'état de sauvegarde automatique (« Brouillon auto ») dans l'en-tête du questionnaire.
  * Nettoyage automatique du brouillon local dès confirmation de transmission du rapport final.
* **Compression Client des Photos d'Enquête** :
  * Compression automatique dans le navigateur (`src/lib/imageCompression.js`) avant tout téléversement.
  * Réduction automatique des photos haute résolution prises sur smartphone (8-12 Mo ramenés à ~300-600 Ko en format WebP/JPEG haute fidélité).
  * Gain d'autonomie et de vitesse de transmission sur les réseaux mobiles 4G/5G, et économie massive de stockage sur l'hébergement cPanel.
* **Navigation progressive étape par étape** :
  * Affichage exclusif de la **Section 1** avec ses questions dédiées.
  * Bouton **« Section Suivante »** pour passer à la Section 2 après validation des champs requis.
  * Bouton **« Section Précédente »** pour revenir en arrière et ajuster une réponse.
  * Barre de progression visuelle indiquant le pourcentage d'avancement de l'enquête.
  * Étape finale : Bouton **« Soumettre le Rapport d'Audit »** avec récapitulatif.
* **Types de réponses pris en charge** :
  * Notation par étoiles (Rating 1 à 5).
  * Texte libre et commentaires détaillés.
  * Choix unique (boutons radio) et choix multiple (cases à cocher).
  * Téléversement de photos justificatives (ticket de caisse, devanture) avec prévisualisation et compression.
  * Enregistrement vocal audio directement dans le navigateur.
  * Horodatage automatique de la visite.

---

### 5. Missions Terminées & Indemnisations (`/missions/completed`)
* Historique complet des missions réalisées.
* **Statuts de rapport** :
  * **En attente de révision** : Rapport soumis à l'administrateur.
  * **Approuvé & Validé** : Rapport conforme, indemnisation validée.
  * **Refusé** : Motif explicite communiqué par l'administrateur pour transparence.
* Registre des gains accumulés et détails des virements bancaires reçus.

---

### 6. Profil & Coordonnées Bancaires (`/settings`)
* Gestion des informations personnelles, ville de résidence et numéro de téléphone pour les rappels de missions.
* Saisie et mise à jour du **RIB / IBAN** pour la perception des indemnités de visite.
* Téléversement du Curriculum Vitae (CV) et de la photo de profil.

---

### 7. Progressive Web App (PWA) & Mode Hors Ligne
* **Dossier dédié `pwa/`** et fichiers publics (`manifest.json`, `sw.js`, `offline.html`, `icons/`).
* **Installation en 1 clic** :
  * Bandeau d'installation automatique sur smartphones Android (Google Chrome) et Safari iOS (« Ajouter à l'écran d'accueil »).
  * Lancement en plein écran (`standalone`) sans barre d'adresse navigateur, offrant l'expérience d'une application native.
* **Résilience Réseau** :
  * Mise en cache des polices et ressources statiques via Service Worker (`stale-while-revalidate`).
  * Stratégie réseau d'abord (`network-first`) pour les flux API dynamiques.
  * Écran de secours élégant (`offline.html`) aux couleurs d'Emberton Group en cas de coupure de connexion réseau sur le terrain.
