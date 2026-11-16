# MissionView API Documentation - Authentication

This document outlines the authentication endpoints for the MissionView API.

**Base URL:** `/api/auth`

---

## Register User

Registers a new user account. Defaults role to 'shopper' if not provided.

-   **URL:** `/register`
-   **Method:** `POST`
-   **Access:** Public
-   **Request Body:**

    ```json
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "password": "password123",
      "role": "shopper", // Optional, defaults to 'shopper'. Can be 'admin'.
      "telephone": "+15551234567", // Optional
      "city": "Anytown", // Optional
      "motivation": "...", // Optional
      "birthYear": 1990, // Optional
      "gender": "male", // Optional ('male', 'female', 'other', 'prefer_not_say')
      "cvUrl": "/path/to/cv.pdf" // Optional
    }
    ```

-   **Success Response:**
    -   **Code:** 201 Created
    -   **Content:**
        ```json
        {
          "message": "User registered successfully. Please log in.",
          "userId": 123
        }
        ```
-   **Error Responses:**
    -   **Code:** 400 Bad Request
        -   **Content:** `{ "message": "Please add all required fields (name, email, password)" }`
        -   **Content:** `{ "message": "Password must be at least 6 characters long" }`
        -   **Content:** `{ "message": "User already exists with this email" }`
    -   **Code:** 500 Internal Server Error
        -   **Content:** `{ "message": "Server error during registration" }`

---

## Login User

Authenticates an existing user and returns a JWT token.

-   **URL:** `/login`
-   **Method:** `POST`
-   **Access:** Public
-   **Request Body:**

    ```json
    {
      "email": "john.doe@example.com",
      "password": "password123"
    }
    ```

-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:**
        ```json
        {
          "_id": 123,
          "name": "John Doe",
          "email": "john.doe@example.com",
          "role": "shopper", // or 'admin'
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // JWT Token
        }
        ```
-   **Error Responses:**
    -   **Code:** 400 Bad Request
        -   **Content:** `{ "message": "Email ou mot de passe incorrect." }`
    -   **Code:** 403 Forbidden
        -   **Content:** `{ "message": "Votre compte est inactif. Veuillez contacter le support." }`
    -   **Code:** 404 Not Found
        -   **Content:** `{ "message": "Compte non trouvé. Veuillez vous inscrire." }`
    -   **Code:** 429 Too Many Requests (Rate Limiting anti-brute-force)
        -   **Trigger:** 10 échecs consécutifs d'authentification sur une fenêtre de 15 minutes par adresse IP (compatible proxys cPanel `x-forwarded-for`).
        -   **Headers renvoyés:**
            - `Retry-After: <secondes>`
            - `X-RateLimit-Limit: 10`
            - `X-RateLimit-Remaining: 0`
            - `X-RateLimit-Reset: <timestamp_unix>`
        -   **Content:**
            ```json
            {
              "success": false,
              "status": 429,
              "error": "Trop de tentatives de connexion.",
              "message": "Trop de tentatives de connexion infructueuses. Pour votre sécurité, veuillez patienter X minute(s) avant de réessayer.",
              "retryAfterMinutes": 15
            }
            ```
    -   **Code:** 500 Internal Server Error
        -   **Content:** `{ "message": "Erreur serveur interne." }`

---

## Forgot Password

Demande de réinitialisation de mot de passe par email.

-   **URL:** `/forgot-password`
-   **Method:** `POST`
-   **Access:** Public
-   **Request Body:** `{ "email": "user@example.com" }`
-   **Success Response:** `200 OK` `{ "success": true, "message": "Un email avec les instructions vous a été envoyé." }`

---

## Reset Password

Application du nouveau mot de passe avec le token de sécurité temporaire reçu par email.

-   **URL:** `/reset-password/:token`
-   **Method:** `POST`
-   **Access:** Public
-   **Request Body:** `{ "password": "NewStrongPassword2026!" }`
-   **Success Response:** `200 OK` `{ "success": true, "message": "Mot de passe réinitialisé avec succès." }`
