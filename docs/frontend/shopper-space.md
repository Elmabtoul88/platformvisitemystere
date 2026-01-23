# MissionView Documentation - Shopper Space (Frontend)

This document describes the features and functionalities available to **shoppers** in the MissionView frontend application.

**Target Audience:** Mystery Shoppers

**Access:** Requires login with an account having the 'shopper' role.

---

## Overview

The Shopper Space allows users to find, apply for, manage, and report on mystery shopping missions.

---

## Key Sections

### 1. Available Missions (Homepage `/`)

-   **Purpose:** Browse and discover missions available for application.
-   **Features:**
    -   **Mission List:** Displays available missions as cards.
    -   **Filtering:** Provides options to filter missions by Location, Deadline (Before), and Category.
    -   **Mission Card:** Shows key mission details (Title, Business, Location, Deadline, Reward, Category). Includes:
        -   **View Details Button:** Navigates to the Mission Details page (`/missions/:missionId/details`).
        -   **Apply Now Button:** (Deprecated/Removed - Application happens on details page).
-   **Data Source:** `/api/missions` (fetches status 'available')

### 2. Mission Details (`/missions/:missionId/details`)

-   **Purpose:** View detailed information about a specific available mission and apply for it.
-   **Features:**
    -   Displays full mission details: Title, Business Name, Category, Description, Location, Deadline, Reward.
    -   **Apply for this Mission Button:** If the mission status is 'available', triggers an API call (`/api/missions/:id/apply`). On success, redirects to the Assigned Missions page. Shows loading state during application.
    -   Displays an error message if the mission is not found or no longer available.
-   **Data Source:** `/api/missions/:id`
-   **Key Actions:** `applyForMission` (via API call)

### 3. Assigned Missions (`/missions/assigned`)

-   **Purpose:** View missions currently assigned to the shopper that require action (report submission).
-   **Features:**
    -   Lists missions with status 'assigned' or 'submitted'.
    -   **Mission Card:** Displays mission details. Includes:
        -   **Start Report Button:** (For status 'assigned') Navigates to the Report Submission page (`/report/:missionId`).
        -   **View Report Button:** (For status 'submitted') Navigates to the Report Submission page (`/report/:missionId`) - allows viewing/editing if implemented.
-   **Data Source:** `/api/missions/assigned`

### 4. Completed Missions (`/missions/completed`)

-   **Purpose:** View missions that have been completed, reviewed, and either approved (paid) or refused.
-   **Features:**
    -   **Total Earnings Card:** Displays the sum of rewards from all approved missions.
    -   Lists missions with status 'approved' or 'refused'.
    -   **Mission Card:** Displays mission details alongside:
        -   **Report Summary:** Shows submission date and final status (Approved/Refused).
        -   **Payment Info:** Displays the reward amount and indicates payment status (Paid for approved).
        -   **Refusal Reason:** Shows the reason provided by the admin if the report was refused.
-   **Data Source:** `/api/missions/completed`

### 5. Report Submission (`/report/:missionId`)

-   **Purpose:** Allow shoppers to fill out and submit the survey/report for an assigned mission.
-   **Features:**
    -   Displays mission title and description.
    -   Dynamically renders form fields based on the `survey_questions` fetched for the mission.
    -   Supports various question types: Text, Rating (Stars), Multiple Choice (Radio), Checkboxes, Image Upload (with preview and removal), GPS Capture (Button trigger), Audio Recording (Start/Stop/Playback/Remove).
    -   Handles required field validation on the client-side before submission.
    -   **Submit Report Button:** Triggers the `submitReport` server action/API call (`/api/missions/:missionId/reports`). Shows loading state. On success, redirects to Completed Missions page.
    -   Displays error message if the user is not assigned or the mission is not in a submittable state.
-   **Data Source:** `/api/missions/:id` (for mission details), `/api/admin/missions/:missionId/survey` (for questions - *needs access adjustment or separate shopper endpoint*)
-   **Key Actions:** `submitReport` (via Server Action / API call)

### 6. Mission Map (`/map`)

-   **Purpose:** Provide a geographical view of available and assigned missions.
-   **Features:**
    -   Uses Leaflet.js to display an interactive map.
    -   Attempts to get the user's current location and center the map.
    -   Displays markers for missions:
        -   Yellow markers for 'available' missions.
        -   Green markers for 'assigned' or 'submitted' missions assigned to the current user.
        -   Blue marker for the user's current location (if available).
    -   Clicking markers shows a popup with basic mission info and a link to details or the report page.
    -   Recenter button to center the map on the user's current location.
    -   Handles location errors gracefully.
-   **Data Source:** `/api/missions` (available), `/api/missions/assigned`

### 7. Shopper Settings (`/settings`)

-   **Purpose:** Allow shoppers to manage their profile and notification preferences.
-   **Features:**
    -   **Personal Details:**
        -   View/Update Profile Picture (simulated upload).
        -   View Name and Email (read-only).
        -   Placeholder for Password Change.
    -   **Additional Information:**
        -   Update City, Motivation, Birth Year, Gender.
        -   Upload/View CV (simulated upload).
    -   **Appearance:** Toggle Dark/Light mode.
    -   **Notification Preferences:** Toggle switches for email/push notifications (New Mission, Deadline Reminder, Report Status).
    -   **Share Profile:** Buttons to share profile link on social media (Twitter, Facebook, LinkedIn) or copy link.
    -   **Save Changes Button:** Simulates saving all updated settings.
-   **Data Source:** Mock data / Local state. In a real app: `/api/users/profile` (GET/PUT) endpoints.

### 8. Shopper Chat (`/chat`)

-   **Purpose:** Allow shoppers to communicate with administrators.
-   **Features:**
    -   Real-time (simulated) chat interface.
    -   Displays chat history with Admin.
    -   Input field and Send button.
    -   Simulates sending messages and receiving replies from Admin.
    -   Updates notification count in `localStorage` upon receiving messages.
-   **Data Source:** Mock data. In a real app: WebSocket connection and chat backend.

---

## Navigation

-   Shoppers see navigation links relevant to their tasks (Available, Assigned, Completed, Map, Chat, Settings).
-   The profile dropdown menu links to `/settings` and `/chat`.

---

## Authentication & Authorization

-   Access to shopper-specific routes requires an active session with the `shopper` role.
-   Frontend routing logic redirects unauthenticated users to `/login` and admin users away from shopper routes.
-   API calls are protected by JWT authentication middleware on the backend.
