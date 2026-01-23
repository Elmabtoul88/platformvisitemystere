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
        -   **Content:** `{ "message": "Please provide email and password" }`
    -   **Code:** 401 Unauthorized
        -   **Content:** `{ "message": "Invalid credentials" }` (Incorrect email or password)
    -   **Code:** 403 Forbidden
        -   **Content:** `{ "message": "Account is inactive. Please contact support." }`
    -   **Code:** 500 Internal Server Error
        -   **Content:** `{ "message": "Server error during login" }`

---

*Note: Forgot password and reset password functionalities are planned for future implementation.*
