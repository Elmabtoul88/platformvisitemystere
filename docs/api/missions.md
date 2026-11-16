# Documentation API - Missions (`/api/missions`)

Ce document décrit les points d'entrée de gestion et consultation des missions sur la plateforme **Emberton Group**.

**Base URL :** `https://api.embertongroup.com/api/missions`  
**Authentification :** En-tête `Authorization: Bearer <token>` ou `x-auth-token: <token>`.

---

## 1. Missions Côté Shopper (Auditeur)

### Récupérer les missions avec statut auditeur (`/missionsApp/:userId`)
Retourne l'ensemble des missions disponibles enrichies du statut de candidature et de rapport pour l'auditeur connecté.

- **URL :** `/missionsApp/:userId`
- **Méthode :** `GET`
- **Accès :** Privé (`shopper` ou `admin`)
- **Réponse Succès (200 OK) :**
  ```json
  {
    "status": 200,
    "data": [
      {
        "id": 1,
        "title": "Audit Accueil & Merchandising - Casablanca",
        "description": "Visite mystère en boutique de luxe...",
        "deadline": "2026-12-31T23:59:59.000Z",
        "reward": 450,
        "category": "Mode & Luxe",
        "status": "available",
        "has_applied": false,
        "application_status": "available",
        "report_status": null,
        "stores": [
          {
            "id": 10,
            "name": "Boutique Maarif",
            "city": "Casablanca",
            "address": "Boulevard Al Massira",
            "latitude": 33.5852,
            "longitude": -7.6324
          }
        ]
      }
    ]
  }
  ```

---

### Récupérer les statistiques de l'auditeur (`/stats/:userId`)
Fournit les métriques globales du shopper pour le tableau de bord de l'accueil.

- **URL :** `/stats/:userId`
- **Méthode :** `GET`
- **Accès :** Privé (`shopper` ou `admin`)
- **Réponse Succès (200 OK) :**
  ```json
  {
    "status": 200,
    "data": {
      "total": 12,
      "available": 8,
      "applied": 3,
      "pending": 1,
      "approved": 2,
      "refused": 0,
      "totalEarned": 1350
    }
  }
  ```

---

### Détails d'une Mission Spécifique (`/:id`)
Récupère les détails, briefing, scénario et magasins associés à une mission.

- **URL :** `/:id`
- **Méthode :** `GET`
- **Accès :** Privé (`shopper`, `admin`, `client`)
- **Réponse Succès (200 OK) :** Retourne l'objet mission complet avec ses magasins et métadonnées.

---

### Vérification d'Accès au Questionnaire (`/:missionId/check-access/:userId`)
Valide si l'auditeur a bien été approuvé pour cette mission avant de lui permettre de saisir le questionnaire d'audit.

- **URL :** `/:missionId/check-access/:userId`
- **Méthode :** `GET`
- **Accès :** Privé (`shopper`)
- **Réponse Succès (200 OK) :** `{ "success": true, "hasAccess": true, "mission": { ... } }`

---

## 2. Missions Côté Administration (`admin`)

### Liste complète pour l'administration (`/admin/all`)
Récupère toutes les missions (disponibles, terminées, archivées) avec les compteurs de candidatures et rapports associés.

- **URL :** `/admin/all`
- **Méthode :** `GET`
- **Accès :** Privé (`admin` uniquement)

---

### Création d'une Mission avec Quiz (`/quiz_mission`)
Crée une mission avec ses fichiers PDF joints (briefing, scénario, questionnaire), ses magasins et ses quiz de qualification éventuels.

- **URL :** `/quiz_mission`
- **Méthode :** `POST`
- **Accès :** Privé (`admin` uniquement)
- **Format :** `multipart/form-data`

---

### Assignation d'Exception / Directe (`/assign-direct`)
Attribue manuellement une mission et un magasin spécifique à un auditeur sans exiger de quiz préalable.

- **URL :** `/assign-direct`
- **Méthode :** `POST`
- **Accès :** Privé (`admin` uniquement)
- **Corps JSON :**
  ```json
  {
    "missionId": 1,
    "userId": 5,
    "storeId": 10,
    "timeSlot": "14:00 - 16:00"
  }
  ```
- **Réponse Succès (200 OK) :** `{ "success": true, "message": "Auditeur assigné avec succès" }`

---

### Prolongation de la Date Limite (`/extend-deadline`)
Modifie l'échéance de la mission pour permettre à d'autres auditeurs d'intervenir.

- **URL :** `/extend-deadline`
- **Méthode :** `POST`
- **Accès :** Privé (`admin` uniquement)
- **Corps JSON :**
  ```json
  {
    "missionId": 1,
    "newDeadline": "2026-12-31"
  }
  ```

---

### Modification & Suppression (`PUT /:id`, `DELETE /:id`)
- **`PUT /:id`** : Mise à jour des informations de la mission.
- **`DELETE /:id`** : Suppression sécurisée de la mission et de ses dépendances.
