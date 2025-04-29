# **App Name**: MissionView

## Core Features:

- Mission List: Display a list of available missions, filterable by location, date, and category.
- Report Submission: Provide a form for users to submit mission reports, including ratings, comments, and photo uploads.
- Mission Tracking: Allow users to view assigned and completed missions.

## Style Guidelines:

- Primary color: Teal (#008080) for a sense of trust and professionalism.
- Secondary color: Light gray (#F0F0F0) for backgrounds and neutral elements.
- Accent: Gold (#FFD700) for highlighting important actions or information.
- Use a card-based layout to present missions and reports in a clear, organized manner.
- Employ simple, recognizable icons to represent different mission categories and actions.

## Original User Request:
App Name: Mystère Client

Platform:

    Frontend: React Native (Android & iOS)

    Backend: Express.js (Node.js)

    Database: MySQL

🔍 App Overview:

Mystère Client is a mobile application for managing mystery shopper missions. Businesses can create and assign missions, and mystery shoppers (users) can apply, complete, and submit reports with ratings, photos, and comments. Admins manage users, missions, and results through a secure back office.
👤 User Roles:

    Admin

    Business/Client (who creates missions)

    Mystery Shopper (User)

📲 Frontend (React Native App) Features:
1. Authentication

    Login / Register (Role-based)

    JWT authentication

    Forgot password (email or SMS)

2. Mystery Shopper Dashboard

    View list of available missions (with filters by location, date, category)

    Apply to missions

    Submit mission report (form with rating, comments, photo upload)

    See assigned/completed missions

    Notifications (new missions, deadlines)

3. Business Dashboard

    Create new missions (title, description, deadline, reward, location)

    View applicant list and assign shoppers

    Review submitted reports

    Rate shoppers

4. Profile & Settings

    Edit profile (name, photo, contact)

    View past missions

    Push notification settings

🖥️ Backend (Express.js API):
Auth APIs

    Register/Login (JWT)

    Password reset

Mystery Shopper APIs

    Get missions

    Apply to mission

    Submit report

    Upload photos

    Get notifications

Business APIs

    Create/edit/delete missions

    Assign shoppers

    Review submissions

    Rate shopper

Admin APIs

    Manage users, missions, reports

    View analytics/dashboard

🗄️ MySQL Database Schema (Summary):

    users (user_id, name, email, password, role, profile_pic, ...)

    missions (mission_id, title, description, deadline, location, reward, business_id)

    applications (application_id, user_id, mission_id, status)

    reports (report_id, mission_id, user_id, ratings, comments, photo_url, submitted_at)

    notifications (notif_id, user_id, message, read, created_at)

    ratings (rating_id, report_id, score, feedback)

📦 Additional Requirements:

    Firebase Cloud Messaging for push notifications

    Image upload support (Firebase Storage or similar)

    Secure API with role-based access

    Admin dashboard (can be web or mobile)

    GPS/location support (to validate mission locations)
  