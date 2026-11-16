# Documentation API - Authentification & Comptes

Ce document décrit l'ensemble des endpoints liés à l'authentification, à la sécurité et à la gestion des mots de passe.

**Base URL :** `https://api.embertongroup.com/api/auth` (et `https://api.embertongroup.com/api/users`)

---

## 1. Connexion Utilisateur (`POST /api/auth`)

Authentifie un utilisateur (shopper, client ou administrateur) et retourne un jeton JWT avec les métadonnées de l'utilisateur.

- **URL :** `POST https://api.embertongroup.com/api/auth`
- **Accès :** Public
- **Protection Anti-Brute-Force :** Rate Limiting coulissant (10 tentatives maximum par tranche de 15 minutes par IP). En cas de dépassement, code HTTP 429 avec en-tête `Retry-After`.
- **Corps JSON :**
  ```json
  {
    "email": "auditeur@example.com",
    "password": "MotDePasse123!"
  }
  ```
- **Réponse Succès (200 OK) :**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": 12,
      "name": "Jean Dupont",
      "email": "auditeur@example.com",
      "role": "shopper",
      "status": "active",
      "city": "Casablanca",
      "profilePicUrl": "/uploads/avatar.webp"
    }
  }
  ```
- **Erreurs Possibles :**
  - **400 Bad Request :** Mot de passe incorrect ou email mal formé.
  - **403 Forbidden :** Compte inactif (`"Votre compte est inactif. Veuillez contacter le support."`).
  - **404 Not Found :** Aucun compte associé à cette adresse email.
  - **429 Too Many Requests :** Trop de tentatives infructueuses (`"Trop de tentatives de connexion. Réessayez dans 15 minutes."`).

---

## 2. Inscription d'un Auditeur (`POST /api/users`)

Crée un nouveau compte mystery shopper.

- **URL :** `POST https://api.embertongroup.com/api/users`
- **Accès :** Public
- **Corps JSON :**
  ```json
  {
    "name": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "password": "Password123!",
    "role": "shopper",
    "city": "Paris",
    "telephone": "+33 6 12 34 56 78",
    "birth_year": 1995,
    "gender": "male",
    "motivation": "Passionné par l'expérience client dans le commerce de luxe"
  }
  ```
- **Réponse Succès (200 OK) :**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": 13,
      "name": "Jean Dupont",
      "email": "jean.dupont@example.com",
      "role": "shopper"
    }
  }
  ```

---

## 3. Mot de Passe Oublié (`POST /api/auth/forgot-password`)

Génère un jeton de réinitialisation sécurisé à usage unique (valable 30 minutes) et transmet un email HTML contenant le lien de renouvellement.

- **URL :** `POST https://api.embertongroup.com/api/auth/forgot-password`
- **Accès :** Public
- **Corps JSON :** `{ "email": "jean.dupont@example.com" }`
- **Réponse Succès (200 OK) :**
  ```json
  {
    "success": true,
    "message": "Un email contenant le lien de réinitialisation vous a été envoyé."
  }
  ```

---

## 4. Vérification du Jeton de Réinitialisation (`POST /api/auth/verify-reset-token`)

Valide la validité et la non-expiration du jeton avant l'affichage du formulaire de saisie du nouveau mot de passe.

- **URL :** `POST https://api.embertongroup.com/api/auth/verify-reset-token`
- **Corps JSON :** `{ "userId": 13, "token": "a1b2c3d4..." }`
- **Réponse Succès (200 OK) :** `{ "valid": true, "message": "Jeton valide." }`

---

## 5. Définition du Nouveau Mot de Passe (`POST /api/auth/reset-password`)

Met à jour le mot de passe utilisateur et invalide immédiatement le jeton de récupération.

- **URL :** `POST https://api.embertongroup.com/api/auth/reset-password`
- **Corps JSON :**
  ```json
  {
    "userId": 13,
    "token": "a1b2c3d4...",
    "password": "NouveauSuperMotDePasse2026!"
  }
  ```
- **Réponse Succès (200 OK) :**
  ```json
  {
    "success": true,
    "message": "Votre mot de passe a été réinitialisé avec succès."
  }
  ```
