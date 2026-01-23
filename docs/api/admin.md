# MissionView API Documentation - Admin

This document outlines the endpoints specifically for **administrators**.

**Base URL:** `/api/admin`

**Authentication:** All endpoints require a valid JWT token in the `Authorization: Bearer <token>` header, and the token must correspond to a user with the `admin` role.

---

## User Management

Endpoints for managing user accounts.

### Get All Users

Retrieves a list of all users in the system.

-   **URL:** `/users`
-   **Method:** `GET`
-   **Access:** Private (Admin Role)
-   **Query Parameters (Optional):**
    -   `role`: Filter by user role (e.g., `shopper`, `admin`)
    -   `status`: Filter by status (`active`, `inactive`)
    -   `page`, `limit`: For pagination (implementation TBD)
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:** (Array of user objects)
        ```json
        [
          {
            "id": 123,
            "name": "John Doe",
            "email": "john.doe@example.com",
            "role": "shopper",
            "status": "active",
            "city": "Anytown",
            "registration_date": "2024-01-15T10:00:00.000Z",
            "completed_missions": 5
          },
          // ... more users
        ]
        ```
-   **Error Responses:** 401, 403, 500

### Get User by ID

Retrieves detailed information for a specific user.

-   **URL:** `/users/:id`
-   **Method:** `GET`
-   **Access:** Private (Admin Role)
-   **URL Parameters:**
    -   `id`: The ID of the user to retrieve.
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:**
        ```json
        {
          "id": 123,
          "name": "John Doe",
          "email": "john.doe@example.com",
          "role": "shopper",
          "status": "active",
          "telephone": "+15551234567",
          "city": "Anytown",
          "motivation": "...",
          "birthYear": 1990,
          "gender": "male",
          "cvUrl": "/path/to/cv.pdf",
          "registrationDate": "2024-01-15T10:00:00.000Z",
          "completedMissions": 5
        }
        ```
-   **Error Responses:** 401, 403, 404 (User not found), 500

### Update User

Updates specific details of a user account.

-   **URL:** `/users/:id`
-   **Method:** `PUT`
-   **Access:** Private (Admin Role)
-   **URL Parameters:**
    -   `id`: The ID of the user to update.
-   **Request Body:** (Include only fields to be updated)
    ```json
    {
      "name": "John A. Doe", // Optional
      "role": "shopper",     // Optional (Use with caution)
      "status": "inactive",  // Optional ('active', 'inactive')
      "city": "New City",    // Optional
      "motivation": "Updated motivation", // Optional
      "telephone": "+15559876543", // Optional
      "birthYear": 1991,     // Optional
      "gender": "male"       // Optional
    }
    ```
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:** `{ "message": "User updated successfully" }`
-   **Error Responses:** 400 (No valid fields), 401, 403, 404 (User not found), 500

### Toggle User Status

Activates or deactivates a user account.

-   **URL:** `/users/:id/status`
-   **Method:** `PATCH`
-   **Access:** Private (Admin Role)
-   **URL Parameters:**
    -   `id`: The ID of the user whose status to toggle.
-   **Request Body:**
    ```json
    {
      "currentStatus": "active" // or "inactive"
    }
    ```
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:** `{ "message": "User status updated to inactive", "newStatus": "inactive" }`
-   **Error Responses:** 400 (Missing/invalid `currentStatus`), 401, 403, 404 (User not found), 500

---

## Mission Management

Endpoints for creating, viewing, updating, and deleting missions.

### Create Mission

Creates a new mission.

-   **URL:** `/missions`
-   **Method:** `POST`
-   **Access:** Private (Admin Role)
-   **Request Body:**
    ```json
    {
      "title": "New Retail Experience Audit",
      "description": "Visit the flagship store and evaluate product displays...",
      "deadline": "2024-09-30T23:59:59.000Z",
      "reward": 40,
      "location": "34.0522,-118.2437", // Lat,Lng or Address
      "category": "Retail",
      "businessName": "Trendy Threads Co."
    }
    ```
-   **Success Response:**
    -   **Code:** 201 Created
    -   **Content:** `{ "message": "Mission created successfully", "missionId": 15 }`
-   **Error Responses:** 400 (Missing fields), 401, 403, 500

### Get All Missions (Admin View)

Retrieves a list of all missions, potentially with more details than the shopper view (e.g., assigned users list).

-   **URL:** `/missions`
-   **Method:** `GET`
-   **Access:** Private (Admin Role)
-   **Query Parameters (Optional):** Filters for status, category, etc. (TBD)
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:** (Array of mission objects with assignment/report info)
        ```json
        [
          {
            "id": 1,
            "title": "Dinner Service Evaluation...",
            "businessName": "Gourmet Place Inc.",
            "location": "34.0550,-118.2450",
            "deadline": "...",
            "reward": 50,
            "status": "submitted",
            "category": "Restaurant",
            "assignedTo": [123, 456], // Array of assigned user IDs
            "submittedReportsCount": 2
          },
          // ... more missions
        ]
        ```
-   **Error Responses:** 401, 403, 500

### Update Mission

Updates details of an existing mission.

-   **URL:** `/missions/:id`
-   **Method:** `PUT`
-   **Access:** Private (Admin Role)
-   **URL Parameters:**
    -   `id`: The ID of the mission to update.
-   **Request Body:** (Include only fields to be updated)
    ```json
    {
      "title": "Updated Mission Title", // Optional
      "description": "Updated description.", // Optional
      "deadline": "2024-10-15T23:59:59.000Z", // Optional
      "reward": 45, // Optional
      "location": "34.0600,-118.2500", // Optional
      "category": "Service", // Optional
      "businessName": "Trendy Threads Updated", // Optional
      "status": "available" // Optional - Allows admin to change status
    }
    ```
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:** `{ "message": "Mission updated successfully" }`
-   **Error Responses:** 400 (No valid fields), 401, 403, 404 (Mission not found), 500

### Delete Mission

Deletes a mission and its associated assignments and reports.

-   **URL:** `/missions/:id`
-   **Method:** `DELETE`
-   **Access:** Private (Admin Role)
-   **URL Parameters:**
    -   `id`: The ID of the mission to delete.
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:** `{ "message": "Mission and associated data deleted successfully" }`
-   **Error Responses:** 400 (Cannot delete if assigned/submitted), 401, 403, 404 (Mission not found), 500

---

## Assignment Management

Endpoints for assigning missions to users.

### Assign Mission to User

Assigns a specific user to a specific mission.

-   **URL:** `/missions/:missionId/assign`
-   **Method:** `POST`
-   **Access:** Private (Admin Role)
-   **URL Parameters:**
    -   `missionId`: The ID of the mission.
-   **Request Body:**
    ```json
    {
      "userId": 123 // The ID of the user to assign
    }
    ```
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:** `{ "message": "Mission assigned successfully" }` OR `{ "message": "User is already assigned to this mission" }`
-   **Error Responses:** 400 (Missing `userId`, Invalid user/mission state), 401, 403, 404 (Mission/User not found), 500

---

## Report Review

Endpoints for reviewing submitted reports.

### Get Reports for Mission

Retrieves all submitted reports for a specific mission.

-   **URL:** `/missions/:missionId/reports`
-   **Method:** `GET`
-   **Access:** Private (Admin Role)
-   **URL Parameters:**
    -   `missionId`: The ID of the mission.
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:** (Array of report objects, potentially including shopper details)
        ```json
        [
          {
            "id": 456,
            "mission_id": 2,
            "user_id": 123,
            "answers": { /* Parsed answers */ },
            "submitted_at": "...",
            "status": "submitted",
            "refusal_reason": null,
            "shopperName": "John Doe",
            "shopperEmail": "john.doe@example.com"
          },
          // ... more reports
        ]
        ```
-   **Error Responses:** 401, 403, 500

### Approve Report

Approves a submitted report and updates the mission status (and optionally user stats).

-   **URL:** `/reports/:reportId/approve`
-   **Method:** `PATCH`
-   **Access:** Private (Admin Role)
-   **URL Parameters:**
    -   `reportId`: The ID of the report to approve.
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:** `{ "success": true, "message": "Report approved and payment processed (simulated)." }`
-   **Error Responses:** 400 (Report not 'submitted'), 401, 403, 404 (Report not found), 500

### Refuse Report

Refuses a submitted report, providing a reason, and updates the mission status.

-   **URL:** `/reports/:reportId/refuse`
-   **Method:** `PATCH`
-   **Access:** Private (Admin Role)
-   **URL Parameters:**
    -   `reportId`: The ID of the report to refuse.
-   **Request Body:**
    ```json
    {
      "reason": "The submitted photos were unclear."
    }
    ```
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:** `{ "success": true, "message": "Report refused and shopper notified (simulated)." }`
-   **Error Responses:** 400 (Missing `reason`, Report not 'submitted'), 401, 403, 404 (Report not found), 500

---

## Survey Management

Endpoints for managing survey questions associated with missions.

### Save Survey Questions

Creates or updates the survey questions for a specific mission.

-   **URL:** `/missions/:missionId/survey`
-   **Method:** `POST`
-   **Access:** Private (Admin Role)
-   **URL Parameters:**
    -   `missionId`: The ID of the mission.
-   **Request Body:** (Array of question objects)
    ```json
    [
      { "id": "q_1", "type": "rating", "text": "Rate cleanliness", "isRequired": true, "maxRating": 5 },
      { "id": "q_2", "type": "text", "text": "Comments", "isRequired": false },
      // ... more questions
    ]
    ```
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:** `{ "success": true, "message": "Survey saved successfully." }`
-   **Error Responses:** 400 (Invalid questions format), 401, 403, 404 (Mission not found), 500

### Get Survey Questions

Retrieves the survey questions for a specific mission.

-   **URL:** `/missions/:missionId/survey`
-   **Method:** `GET`
-   **Access:** Private (Admin Role) - *May also be needed by Shopper when fetching mission details for report submission.*
-   **URL Parameters:**
    -   `missionId`: The ID of the mission.
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:** (Array of question objects)
        ```json
        [
          { "id": "q_1", "type": "rating", "text": "Rate cleanliness", ... },
          { "id": "q_2", "type": "text", "text": "Comments", ... },
          // ...
        ]
        ```
-   **Error Responses:** 401, 403, 404 (Mission not found), 500

---

## Dashboard Statistics

Endpoint for retrieving aggregated statistics for the admin dashboard.

### Get Dashboard Stats

Retrieves key statistics about users, missions, and reports.

-   **URL:** `/stats`
-   **Method:** `GET`
-   **Access:** Private (Admin Role)
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:**
        ```json
        {
          "totalUsers": 55,
          "totalShoppers": 50,
          "totalMissions": 25,
          "pendingReports": 5,
          "approvedMissions": 10,
          "missionStatusCounts": {
            "available": 8,
            "assigned": 5,
            "submitted": 2,
            "approved": 10,
            "refused": 0
          },
          "missionsByCategory": [
            { "category": "Retail", "count": 12 },
            { "category": "Restaurant", "count": 8 },
            { "category": "Service", "count": 5 }
          ],
          "reportStatusCounts": {
             "submitted": 2,
             "approved": 15, // Includes reports from approved missions
             "refused": 1
          }
        }
        ```
-   **Error Responses:** 401, 403, 500

---
