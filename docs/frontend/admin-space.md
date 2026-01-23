# MissionView Documentation - Admin Space (Frontend)

This document describes the features and functionalities available in the Admin section of the MissionView frontend application.

**Target Audience:** Administrators

**Access:** Requires login with an account having the 'admin' role.

---

## Overview

The Admin Space provides tools to manage the entire MissionView platform, including users, missions, reports, and system settings.

---

## Key Sections

### 1. Dashboard (`/admin`)

-   **Purpose:** Provides a high-level overview of the platform's status and key metrics.
-   **Features:**
    -   **Summary Cards:** Quick view of important numbers (e.g., Pending Reports, Active Missions, Registered Shoppers).
    -   **Quick Actions:** Buttons for common tasks like creating missions, managing users, etc.
    -   **Statistics Overview:** Visual charts and graphs displaying:
        -   Mission Status Distribution (Pie Chart)
        -   Report Status Distribution (Pie Chart)
        -   New Shopper Registrations Over Time (Line Chart)
        -   Missions per Category (Bar Chart)
        -   Average Reward per Category (Bar Chart)
        -   Mission Completion Rate (Donut Chart)
-   **Data Source:** `/api/admin/stats`

### 2. Manage Missions (`/admin/missions`)

-   **Purpose:** View, create, edit, delete, and assign missions.
-   **Features:**
    -   **Mission List Table:** Displays all missions with key details (Title, Business, Location, Deadline, Reward, Status, Assigned Users, Submitted Reports Count).
    -   **Search/Filtering:** Input field to search missions by various criteria.
    -   **Create New Mission Button:** Navigates to the mission creation flow (`/admin/missions/new`).
    -   **Actions Dropdown (per mission):**
        -   **Assign/Reassign:** Opens a dialog to assign the mission to one or more active shoppers (uses autocomplete search).
        -   **Review Reports:** Navigates to the report review page (`/admin/missions/:missionId/reports`) for submitted/completed missions.
        -   **Edit Mission Details:** Navigates to the mission edit page (`/admin/missions/:missionId/edit`).
        -   **Edit Survey:** Navigates to the survey editor page (`/admin/missions/:missionId/survey/create`).
        -   **Delete Mission:** Opens a confirmation dialog before deleting the mission (only allowed for specific statuses).
-   **Data Source:** `/api/admin/missions`, `/api/admin/users` (for assignment dialog)
-   **Key Actions:** `createMission`, `updateMission`, `deleteMission`, `assignMission` (via API calls / Server Actions)

### 3. Create/Edit Mission (`/admin/missions/new`, `/admin/missions/:missionId/edit`)

-   **Purpose:** Define or modify the core details of a mission.
-   **Features:**
    -   Form fields for Title, Business Name, Description, Location, Category (Select), Deadline (Date Picker), Reward (Number Input).
    -   *(Edit Only)*: Field to modify the mission's current `status`.
    -   Save button triggers API call (`createMission` or `updateMission`).
    -   On successful creation (`/new`), redirects to the Survey Creation page (`/admin/missions/:newMissionId/survey/create`).
    -   On successful update (`/edit`), redirects back to the Manage Missions list.
-   **Data Source:** `/api/admin/missions/:id` (for edit), Mock categories initially.
-   **Key Actions:** `createMission`, `updateMission`

### 4. Create/Edit Survey (`/admin/missions/:missionId/survey/create`)

-   **Purpose:** Build the dynamic survey form associated with a mission.
-   **Features:**
    -   Buttons to add different question types (Text, Multiple Choice, Checkboxes, Rating, Image Upload, GPS Capture, Audio Recording).
    -   Interface to define question text, options (for multi/checkbox), required status, and type-specific settings (e.g., max rating, max images, max audio duration).
    -   Drag-and-drop functionality to reorder questions.
    -   Remove question functionality.
    -   Save Survey button triggers API call (`saveSurvey`).
-   **Data Source:** `/api/admin/missions/:missionId/survey` (to load existing questions for editing)
-   **Key Actions:** `saveSurvey`

### 5. Review Reports (`/admin/missions/:missionId/reports`)

-   **Purpose:** Review reports submitted by shoppers for a specific mission.
-   **Features:**
    -   Displays mission summary information.
    -   Lists all reports submitted for the mission, grouped by shopper.
    -   Each report card shows:
        -   Shopper Name & Avatar
        -   Submission Timestamp
        -   Report Status (Submitted, Approved, Refused)
        -   Rendered answers based on the survey question types (including images, map links, audio players).
        -   Refusal reason (if refused).
    -   **Actions (for 'submitted' reports):**
        -   **Approve Button:** Triggers `approveReportAction`, updates report/mission status, simulates payment.
        -   **Refuse Button:** Opens a dialog to enter a refusal reason, triggers `refuseReportAction`, updates report/mission status.
-   **Data Source:** `/api/admin/missions/:missionId/reports`, `/api/admin/missions/:missionId/survey` (to interpret answers)
-   **Key Actions:** `approveReportAction`, `refuseReportAction`

### 6. Manage Users (`/admin/users`)

-   **Purpose:** View and manage all user accounts (shoppers and other admins).
-   **Features:**
    -   **User List Table:** Displays users with details (Name, Email, Role, Status, Registered Date, Missions Done).
    -   **Search/Filtering:** Input field to search users.
    -   **Actions Dropdown (per user):**
        -   **View Details:** Navigates to the user detail page (`/admin/users/:userId`).
        -   **Edit User:** Navigates to the user edit page (`/admin/users/:userId/edit`).
        -   **Activate/Deactivate User:** Triggers `toggleUserStatusAction` to change the user's `status`. (Disabled for admins).
-   **Data Source:** `/api/admin/users`
-   **Key Actions:** `toggleUserStatusAction`

### 7. User Detail View (`/admin/users/:userId`)

-   **Purpose:** Display comprehensive information about a specific user.
-   **Features:**
    -   Displays Avatar, Name, Email, City, Role, Status.
    -   Shows Registration Date, Birth Year, Gender, Telephone.
    -   Displays Shopper Motivation (if applicable).
    -   Displays CV download link (if uploaded).
    -   Shows Performance stats (Completed Missions).
    -   Button to navigate to the Edit User page.
-   **Data Source:** `/api/admin/users/:id`

### 8. Edit User (`/admin/users/:userId/edit`)

-   **Purpose:** Modify details of a specific user account.
-   **Features:**
    -   Form to edit Name, City, Telephone, Motivation, Birth Year, Gender.
    -   Select inputs to change Role and Status.
    -   Email is typically read-only.
    -   Save button triggers `updateUserAction`.
-   **Data Source:** `/api/admin/users/:id` (to prefill form)
-   **Key Actions:** `updateUserAction`

### 9. Admin Chat (`/admin/chat`, `/admin/chat/:userId`)

-   **Purpose:** Communicate directly with shoppers.
-   **Features:**
    -   **Chat List (`/admin/chat`):** Displays a list of all shoppers, searchable. Shows unread message badges. Clicking a shopper navigates to the individual chat.
    -   **Individual Chat (`/admin/chat/:userId`):**
        -   Real-time (simulated) chat interface.
        -   Displays chat history with the selected shopper.
        -   Input field and Send button to send messages.
        -   Handles message sending/receiving simulation.
        -   Updates notification count in `localStorage`.
-   **Data Source:** Mock data (chat is simulated). In a real app: WebSocket connection and chat backend.

### 10. Admin Settings (`/admin/settings`)

-   **Purpose:** Configure administrator-specific settings.
-   **Features:**
    -   View Admin Account Info (read-only email).
    -   Toggle switches for Admin Notification Preferences (e.g., new user signup, report submitted).
    -   Placeholder for future system configuration settings.
    -   Save button (simulated persistence).
-   **Data Source:** Mock data / Local state. In a real app: API endpoint to save admin preferences.

---

## Navigation

-   Admin users see a different set of navigation links in the header compared to shoppers.
-   The profile dropdown menu links to `/admin/settings` and `/admin/chat`.

---

## Authentication & Authorization

-   Access to all `/admin/*` routes is protected and requires an active session with the `admin` role.
-   Middleware on the backend (`authorize('admin')`) enforces this restriction on API calls.
-   Frontend routing logic redirects non-admin users away from `/admin` routes.
