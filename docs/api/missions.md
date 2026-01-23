# MissionView API Documentation - Missions (Shopper)

This document outlines the mission-related endpoints accessible by **shoppers**.

**Base URL:** `/api/missions`

**Authentication:** All endpoints require a valid JWT token in the `Authorization: Bearer <token>` header.

---

## Get Available Missions

Retrieves a list of missions currently available for application.

-   **URL:** `/`
-   **Method:** `GET`
-   **Access:** Private (Shopper Role)
-   **Query Parameters (Optional):**
    -   `category`: Filter by mission category (e.g., `Restaurant`, `Retail`)
    -   `location`: Filter by location (implementation TBD)
    -   `date`: Filter by deadline (implementation TBD)
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:**
        ```json
        [
          {
            "id": 1,
            "title": "Fast Food Drive-Thru Accuracy",
            "description": "Order a specific meal combo via drive-thru...",
            "deadline": "2024-08-20T23:59:59.000Z",
            "reward": 25,
            "location": "34.0580,-118.2350",
            "category": "Restaurant",
            "businessName": "Burger Bonanza"
          },
          // ... more available missions
        ]
        ```
-   **Error Responses:**
    -   **Code:** 401 Unauthorized (Missing or invalid token)
    -   **Code:** 403 Forbidden (User role is not 'shopper')
    -   **Code:** 500 Internal Server Error

---

## Get Mission Details

Retrieves detailed information about a specific mission. Only accessible if the mission is 'available' or assigned to the requesting shopper.

-   **URL:** `/:id`
-   **Method:** `GET`
-   **Access:** Private (Shopper Role)
-   **URL Parameters:**
    -   `id`: The ID of the mission to retrieve.
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:**
        ```json
        {
          "id": 1,
          "title": "Fast Food Drive-Thru Accuracy",
          "description": "Order a specific meal combo via drive-thru...",
          "deadline": "2024-08-20T23:59:59.000Z",
          "reward": 25,
          "location": "34.0580,-118.2350",
          "category": "Restaurant",
          "businessName": "Burger Bonanza",
          "status": "available", // or 'assigned', 'submitted' etc. if assigned to user
          "assignedTo": ["123"] // Array of user IDs if assigned
        }
        ```
-   **Error Responses:**
    -   **Code:** 401 Unauthorized
    -   **Code:** 403 Forbidden
    -   **Code:** 404 Not Found (Mission doesn't exist or is not accessible to the user)
    -   **Code:** 500 Internal Server Error

---

## Apply for Mission

Allows a shopper to apply for an available mission. On successful application, the mission status typically changes to 'assigned' and an assignment record is created.

-   **URL:** `/:id/apply`
-   **Method:** `POST`
-   **Access:** Private (Shopper Role)
-   **URL Parameters:**
    -   `id`: The ID of the mission to apply for.
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:** `{ "message": "Successfully applied and assigned to the mission" }`
-   **Error Responses:**
    -   **Code:** 400 Bad Request
        -   `{ "message": "Mission is no longer available for application" }`
        -   `{ "message": "You have already applied for or are assigned to this mission" }`
    -   **Code:** 401 Unauthorized
    -   **Code:** 403 Forbidden
    -   **Code:** 404 Not Found `{ "message": "Mission not found" }`
    -   **Code:** 500 Internal Server Error

---

## Get Assigned Missions

Retrieves a list of missions currently assigned to the logged-in shopper (status 'assigned' or 'submitted').

-   **URL:** `/assigned`
-   **Method:** `GET`
-   **Access:** Private (Shopper Role)
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:** (Array of mission objects, similar to Get Available Missions, but status is 'assigned' or 'submitted')
        ```json
        [
          {
            "id": 3,
            "title": "Coffee Shop Speed of Service",
            // ... other fields
            "status": "assigned"
          },
          {
             "id": 2,
             "title": "Retail Store Cleanliness Check",
             // ... other fields
             "status": "submitted"
          }
          // ... more assigned/submitted missions
        ]
        ```
-   **Error Responses:**
    -   **Code:** 401 Unauthorized
    -   **Code:** 403 Forbidden
    -   **Code:** 500 Internal Server Error

---

## Get Completed Missions

Retrieves a list of missions that the logged-in shopper has completed (status 'approved' or 'refused'). Includes basic report status info.

-   **URL:** `/completed`
-   **Method:** `GET`
-   **Access:** Private (Shopper Role)
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:** (Array of mission objects with added report details)
        ```json
        [
          {
            "id": 4,
            "title": "Completed: Hotel Check-in Experience",
            // ... other mission fields
            "status": "approved",
            "reportSubmittedAt": "2024-08-15T10:00:00.000Z",
            "reportStatus": "approved",
            "refusalReason": null
          },
           {
            "id": 7,
            "title": "Refused: Library Ambiance Check",
            // ... other mission fields
            "status": "refused",
            "reportSubmittedAt": "2024-08-12T14:30:00.000Z",
            "reportStatus": "refused",
            "refusalReason": "Report was too brief..."
          }
          // ... more completed/refused missions
        ]
        ```
-   **Error Responses:**
    -   **Code:** 401 Unauthorized
    -   **Code:** 403 Forbidden
    -   **Code:** 500 Internal Server Error

---
