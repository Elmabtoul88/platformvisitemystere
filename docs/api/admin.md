# MissionView API Documentation - Administration

Ce document décrit l'ensemble des points d'accès (endpoints) réservés aux **administrateurs** dans l'application MissionView.

**URL de base :** `/api` (ou `/api/admin`)  
**Authentification :** Requiert un jeton JWT valide transmis dans l'en-tête `Authorization: Bearer <token>` ou `x-auth-token: <token>`, avec rôle `admin`.

---

## 1. Gestion des Utilisateurs (`/api/users` & `/api/admin/users`)

### Liste de tous les utilisateurs
* **URL :** `GET /api/users`
* **Accès :** Admin
* **Description :** Retourne la liste complète des utilisateurs avec rôles, statuts, dates d'inscription et compteurs de missions.

### Détail d'un utilisateur
* **URL :** `GET /api/users/:id`
* **Accès :** Admin / Shopper propriétaire

### Modifier un utilisateur
* **URL :** `PUT /api/users/:id`
* **Corps :** `{ name, city, telephone, motivation, birth_year, gender, role, status }`

### Basculer le statut d'un utilisateur (Actif / Inactif)
* **URL :** `PATCH /api/users/:id/status`
* **Corps :** `{ currentStatus: "active" | "inactive" }`
* **Réponse :** `{ success: true, newStatus: "inactive", message: "Statut mis à jour avec succès" }`

---

## 2. Gestion des Missions (`/api/missions` & `/api/admin/missions`)

### Récupérer toutes les missions (Vue Admin)
* **URL :** `GET /api/missions/admin/all`
* **Accès :** Admin
* **Description :** Retourne l'ensemble des missions, y compris celles expirées et terminées, avec compteurs de rapports soumis et magasins associés.

### Créer une nouvelle mission
* **URL :** `POST /api/missions`
* **Corps :** `{ title, description, location, deadline, reward, category, business_id }`

### Modifier une mission
* **URL :** `PATCH /api/missions/:id`
* **Corps :** `{ title, description, deadline, reward, location, category, status }`

### Supprimer une mission
* **URL :** `DELETE /api/missions/:id`

---

## 3. Assignation de Missions & Exception (`/api/assignements`)

### Assignation Manuelle d'Exception (Directe)
Permet d'assigner immédiatement un auditeur à une mission et un magasin spécifique sans exiger la validation préalable des quiz ni une candidature en attente.
* **URL :** `POST /api/assignements/multi`
* **Accès :** Admin
* **Corps :**
  ```json
  {
    "mission_id": 12,
    "user_ids": [5, 8],
    "store_id": 3
  }
  ```
* **Réponse :** `{ "success": true, "inserted": 2, "message": "Assignation d'exception effectuée" }`

---

## 4. Gestion des Magasins & Réseau (`/api/stores`)

### Liste des magasins avec missions rattachées
* **URL :** `GET /api/stores/missions`
* **Accès :** Authentifié
* **Réponse :** Tableau des magasins avec `id`, `name`, `city`, `address`, `latitude`, `longitude`, `category`, `mission_id`, `active`.

### Créer un magasin manuellement
* **URL :** `POST /api/stores`
* **Corps :** `{ name, city, address, mission_id, category, latitude, longitude, active }`

### Import en masse de magasins (Excel / CSV)
* **URL :** `POST /api/stores/batch`
* **Corps :** Tableau d'objets magasins normalisés extraits du fichier Excel.
* **Réponse :** `{ "success": true, "count": 25, "message": "25 magasins importés" }`

### Activer / Désactiver un magasin
* **URL :** `PATCH /api/stores/:id/toggle`
* **Réponse :** `{ "success": true, "active": false, "message": "Statut du point de vente modifié" }`

---

## 5. Gestion des Candidatures (`/api/applications`)

### Liste des candidatures
* **URL :** `GET /api/applications`
* **Filtres :** Par mission ou par statut (`applied`, `approved`, `rejected`).

### Valider une candidature avec magasin et créneau horaire
* **URL :** `PATCH /api/applications/patch/:id`
* **Corps :** `{ status: "approved", store_id: 3, slot_time: "2026-11-15 14:00:00" }`

---

## 6. Revue des Rapports d'Audit (`/api/reports`)

### Liste des rapports soumis
* **URL :** `GET /api/reports/mission/:missionId`
* **Description :** Retourne les réponses, photos et enregistrements audio soumis par les auditeurs.

### Valider / Rejeter un rapport
* **URL :** `PATCH /api/reports/review/:reportId`
* **Corps :** `{ status: "approved" | "refused", feedback: "Audit complet et conforme" }`

---

## 7. Gestion des Paiements (`/api/paiyments`)

### Consulter le registre financier des paiements
* **URL :** `GET /api/paiyments/all`
* **Description :** Liste toutes les indemnisations dues pour les missions approuvées, avec RIB/IBAN du shopper.

### Valider un paiement
* **URL :** `PATCH /api/paiyments/:id`
* **Description :** Marque la mission comme payée et enregistre la date du virement.

---

## 8. Messagerie Directe (`/api/chat_messages`)

### Liste des conversations administrateur
* **URL :** `GET /api/chat_messages/:adminId`
* **Description :** Retourne la liste des auditeurs ayant échangé avec le support, avec compteur de messages non lus.

### Envoyer un message
* **URL :** `POST /api/chat_messages`
* **Corps :** `{ sender_id: 1, receiver_id: 10, message_text: "Bonjour, merci de confirmer votre créneau." }`

---

## 9. Automatisation & Rappels Automatiques

### Vérification automatique des dates limites (Cron / Webhook)
* **URL :** `POST /api/notifications/check-expiring-missions`
* **URL :** `POST /api/user-notifications/check-user-deadlines`
* **Description :** Détecte les missions proches de l'échéance et envoie des emails de rappel aux auditeurs et administrateurs.
