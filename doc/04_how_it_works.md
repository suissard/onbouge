# How It Works

This document provides a deeper look into the functionality of the Rally Point application, including its core features, data model, and the interaction between the frontend and the backend API.

## Core Features

*   **User Profiles**: Users can register and create profiles that include their favorite activities, skill level, and available equipment.
*   **Authentication**: Full authentication system with email/password registration and login.
*   **Events and Points of Interest (POIs)**: Users can create, view, and join events. They can also create and browse POIs, which are locations for sports activities.
*   **Dynamic Menu**: The application's navigation menu is dynamically generated from data provided by the Strapi API.
*   **Single-Page Application (SPA)**: The frontend is a SPA, which means that page content is loaded dynamically for a smoother user experience.

## Data Model

The application's data is managed by Strapi. The main content types are:

1.  **User**: Represents an application user. It likely includes fields such as:
    *   `username`
    *   `email`
    *   `password`
    *   `activities` (relation to activity categories)
    *   `level`
    *   `equipment`

2.  **Event**: Represents an event created by a user. It likely includes fields such as:
    *   `title`
    *   `description`
    *   `date`
    *   `time`
    *   `location` (relation to a POI)
    *   `organizer` (relation to a User)
    *   `participants` (relation to Users)

3.  **POI (Point of Interest)**: Represents a location where sports can be played. It likely includes fields such as:
    *   `name`
    *   `address`
    *   `latitude`
    *   `longitude`
    *   `description`
    *   `activities_available` (relation to activity categories)

4.  **FAQ**: Represents a frequently asked question and its answer. It likely includes fields such as:
    *   `question`
    *   `answer`
    *   `category`

These content types are defined in the Strapi admin panel and can be customized to extend the application's functionality.

## Frontend-Backend Interaction

The frontend application (in the `/public` directory) is built with vanilla JavaScript and communicates with the backend via the Strapi API.

*   **API Calls**: The frontend uses the `fetch` API to make RESTful requests to the Strapi backend. For example, it fetches a list of events to display on the events page.
*   **Data Fetching**: The core logic for interacting with the Strapi API can be found in the JavaScript files in `/public/js`. Key files likely include:
    *   `main.js`: For general application logic.
    *   `agenda.js`, `pois.js`, `users.js`: For logic specific to those pages.
*   **Rendering**: The frontend dynamically renders the data it receives from the API into the HTML structure.
*   **Authentication Flow**:
    1.  A user registers or logs in via a form on the frontend.
    2.  The frontend sends the user's credentials to the Strapi `/api/auth/local` endpoint.
    3.  If successful, Strapi returns a JSON Web Token (JWT).
    4.  The frontend stores this JWT (e.g., in `localStorage`) and includes it in the `Authorization` header for all subsequent requests to protected API endpoints.

This separation of concerns between the frontend and backend allows for a flexible and scalable application. The frontend can be updated or even completely replaced without affecting the backend, as long as the API contract is maintained.
