# MissionView: Mystery Shopper Platform

Welcome to MissionView, a comprehensive web application designed to manage mystery shopping operations. This platform connects business **Clients**, who create missions, with **Shoppers**, who execute them, all under the supervision of an **Admin**.

This document provides a complete overview of the application's features, user roles, technical architecture, and data structure.

## Table of Contents

1.  [Core Functionalities](#core-functionalities)
2.  [User Roles & Features](#user-roles--features)
    *   [Shopper](#shopper)
    *   [Administrator (Admin)](#administrator-admin)
    *   [Client](#client)
3.  [Technical Stack](#technical-stack)
4.  [Mock Data & "Database"](#mock-data--database)
    *   [Missions](#missions)
    *   [Users](#users)
    *   [Reports](#reports)
    *   [Applications](#applications)
    *   [Survey Questions](#survey-questions)
5.  [Getting Started & Login Credentials](#getting-started--login-credentials)

---

## Core Functionalities

-   **Multi-Role Authentication**: Secure login and signup system catering to three distinct user roles: Shopper, Admin, and Client.
-   **Mission Management**: Admins can create, edit, assign, and delete missions. Clients can view progress on missions they own.
-   **Dynamic Survey Engine**: Admins can build custom surveys for each mission with various question types, including text, ratings, multiple-choice, image uploads, GPS capture, and audio recording.
-   **Interactive Reporting**: Shoppers can fill out and submit detailed reports for their assigned missions through a dynamic form generated from the survey engine.
-   **Admin Review Workflow**: Admins have a dedicated interface to review submitted reports, approve or refuse applications, and manage user accounts.
-   **Client Data Dashboard**: Clients have a dashboard to view the status of their missions, see aggregated statistics on approved reports, and export data as CSV or PDF.
-   **Interactive Map View**: Shoppers can view available and assigned missions on a geographic map.
-   **Responsive UI**: The application is built with a modern, responsive design that works on both desktop and mobile devices.

---

## User Roles & Features

The application is built around three key user roles.

### Shopper

The Shopper is the core user who performs the mystery shopping tasks.

-   **Dashboard**: View a filterable list of all available missions.
-   **Mission Details**: View detailed descriptions, rewards, and deadlines for any mission.
-   **Assigned Missions**: A personal list of missions that have been assigned.
-   **Report Submission**: Start, fill out, and submit a detailed survey for an assigned mission.
-   **Completed Missions**: View a history of all approved missions and a summary of total earnings.
-   **Settings**: Update personal details, notification preferences, and appearance (dark/light mode).
-   **Chat**: Communicate with an administrator.

### Administrator (Admin)

The Admin has full control over the platform and manages all operations.

-   **Admin Dashboard**: An overview of key platform statistics, including pending reports, active missions, and user counts, visualized with charts.
-   **Mission Management**: Full CRUD (Create, Read, Update, Delete) capabilities for all missions.
-   **Survey Creation**: Create and edit the dynamic survey for any mission.
-   **Application Review**: Approve or refuse applications submitted by shoppers for missions.
-   **Direct Assignment**: Assign missions directly to one or more active shoppers.
-   **Report Review**: Review submitted reports, approve them (which triggers simulated payment), or refuse them with a reason.
-   **User Management**: View all users, edit user details (name, role, status), and activate/deactivate accounts.
-   **Chat Hub**: View a list of all shoppers and initiate a direct chat with any of them.

### Client

The Client is the business stakeholder who wants to see the results of their missions.

-   **Client Dashboard**: A centralized view of all missions associated with the client's account, showing their current status.
-   **Mission Progress View**: For each mission, the client can see:
    -   Key stats: Number of submitted vs. approved reports and the overall approval rate.
    -   A data table of all approved reports with key answers.
    -   A "Monthly Performance Comparison" section with a radar chart and data table showing the average score for rating-based questions, aggregated by month.
    -   **Data Export**: Ability to export the approved report data as a **CSV (Excel)** or **PDF** file.

---

## Technical Stack

-   **Framework**: Next.js (with App Router)
-   **Language**: JavaScript (React)
-a   **UI Components**: ShadCN UI
-   **Styling**: Tailwind CSS
-   **Charts**: Recharts
-   **Mapping**: Leaflet & React-Leaflet
-   **Data Export**: `xlsx` for CSV/Excel and `jspdf` / `jspdf-autotable` for PDF.
-   **State Management**: React Context API for global authentication state.
-   **Forms**: React Hook Form

---

## Mock Data & "Database"

The application currently runs on a simulated, in-memory database defined in `src/lib/mock-data.js` and `src/app/admin/users/users-mock.js`. All "server actions" directly mutate these JavaScript arrays to simulate persistence across the application.

#### Missions (`mockMissions`)

-   **`id`**: Unique identifier (e.g., `mission-1`).
-   **`title`**, **`description`**, **`businessName`**: Textual details of the mission.
-   **`deadline`**: JavaScript `Date` object.
-   **`reward`**: The monetary reward for completion.
-   **`location`**: A string representing the location (can be an address or "lat,lng" coordinates).
-   **`category`**: The type of mission (e.g., 'Retail', 'Restaurant').
-   **`status`**: The current state of the mission (`available`, `pending_approval`, `assigned`, `submitted`, `approved`, `refused`).
-   **`assignedTo`**: An array of user IDs of shoppers assigned to the mission.
-   **`appliedBy`**: An array of user IDs of shoppers who have applied.
-   **`clientId`**: The ID of the `client` user who owns this mission.

#### Users (`mockUsers`)

-   **`id`**: Unique identifier (e.g., `user-shopper-1`).
-   **`name`**, **`email`**, **`password`**: User credentials.
-   **`role`**: The user's role (`shopper`, `admin`, or `client`).
-   **`status`**: `active` or `inactive`.
-   **Other Profile Data**: `city`, `telephone`, `motivation`, `cvUrl`, `birthYear`, `gender`, `profilePicUrl`, etc.

#### Reports (`mockReports`)

-   **`id`**: Unique identifier for the report.
-   **`missionId`**, **`userId`**: Foreign keys linking to the mission and shopper.
-   **`answers`**: An object where keys are dynamically generated (e.g., `q_[questionId]_[questionType]`) and values are objects containing `{ type, value }`.
-   **`submittedAt`**: JavaScript `Date` object.
-   **`status`**: `submitted`, `approved`, or `refused`.
-   **`refusalReason`**: A string explaining why a report was refused.

#### Applications (`mockApplications`)

-   **`id`**: Unique identifier.
-   **`mission_id`**, **`user_id`**: Foreign keys.
-   **`status`**: `pending`, `approved`, or `refused`.
-   **`applied_at`**: JavaScript `Date` object.

#### Survey Questions (`mockSurveyQuestions`)

-   An object where each key is a `missionId`.
-   The value is an array of question objects, defining the structure of the survey for that mission (e.g., `id`, `type`, `text`, `isRequired`, `options`).

---

## Getting Started & Login Credentials

To explore the different roles, use the following credentials on the login page:

-   **Admin**:
    -   Email: `admin@example.com`
    -   Password: `password123`
-   **Client**:
    -   Email: `client@gourmet.com`
    -   Password: `password123`
-   **Shopper**:
    -   Email: `alex@example.com`
    -   Password: `password123`
