# MissionView API Documentation - Reports

This document outlines the report submission and retrieval endpoints.

**Base URL:** `/api/missions/:missionId/reports` (for submission) or `/api/reports/:reportId` (for specific retrieval by admin maybe)

**Authentication:** All endpoints require a valid JWT token in the `Authorization: Bearer <token>` header.

---

## Submit Report

Submits a report for a specific mission the user is assigned to.

-   **URL:** `/api/missions/:missionId/reports`
-   **Method:** `POST`
-   **Access:** Private (Shopper Role)
-   **URL Parameters:**
    -   `missionId`: The ID of the mission being reported on.
-   **Request Body:**

    ```json
    {
      "answers": {
        "q_1700000000001_rating": { "type": "rating", "value": 5 },
        "q_1700000000002_multiple_choice": { "type": "multiple_choice", "value": "Very Helpful" },
        "q_1700000000003_text": { "type": "text", "value": "Store was clean..." },
        "q_1700000000004_image_upload": { "type": "image_upload", "value": ["https://picsum.photos/seed/img1/400/300"] },
        "q_1700000000013_gps_capture": { "type": "gps_capture", "value": { "lat": 34.05, "lng": -118.25 } },
        "q_1700000000014_audio_recording": { "type": "audio_recording", "value": "/uploads/audio_abc.webm" }
        // ... other answers based on survey questions
      }
    }
    ```
    *(Note: The keys in `answers` should correspond to the `id` and `type` of the survey questions, following the pattern `q_<question_id>_<question_type>` used in the frontend form generation)*

-   **Success Response:**
    -   **Code:** 201 Created
    -   **Content:**
        ```json
        {
          "message": "Report submitted successfully",
          "reportId": 456
        }
        ```
-   **Error Responses:**
    -   **Code:** 400 Bad Request
        -   `{ "message": "Report answers are required" }`
        -   `{ "message": "Cannot submit report for mission with status: <status>" }`
    -   **Code:** 401 Unauthorized
    -   **Code:** 403 Forbidden `{ "message": "You are not assigned to this mission" }`
    -   **Code:** 500 Internal Server Error

---

## Get Report Details

Retrieves details for a specific report. Accessible by the shopper who submitted it or an admin.

-   **URL:** `/api/missions/:missionId/reports/:reportId`
-   **Method:** `GET`
-   **Access:** Private (Shopper owner or Admin Role)
-   **URL Parameters:**
    -   `missionId`: The ID of the mission the report belongs to.
    -   `reportId`: The ID of the report to retrieve.
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:**
        ```json
        {
            "id": 456,
            "mission_id": 2,
            "user_id": 123,
            "answers": { // Parsed JSON
                "q_1700000000001_rating": { "type": "rating", "value": 5 },
                // ... other answers
            },
            "submitted_at": "2024-08-16T15:30:00.000Z",
            "status": "submitted", // or 'approved', 'refused'
            "refusal_reason": null // or "Reason text"
        }
        ```
-   **Error Responses:**
    -   **Code:** 401 Unauthorized
    -   **Code:** 403 Forbidden `{ "message": "You are not authorized to view this report" }`
    -   **Code:** 404 Not Found `{ "message": "Report not found" }`
    -   **Code:** 500 Internal Server Error

---
