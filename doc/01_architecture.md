# Architecture

The Rally Point application is built on a modern, containerized architecture that separates the frontend and backend concerns. This allows for independent development and scaling of each part of the application. The entire environment is orchestrated using Docker Compose.

## Components

The application is composed of the following services:

1.  **Frontend**: A single-page application (SPA) built with vanilla JavaScript, HTML, and CSS. It is served by a lightweight web server.
2.  **Backend (Strapi)**: A headless CMS (Strapi) that provides a RESTful API for content management. It is responsible for managing users, events, points of interest (POIs), and other application data.
3.  **Database (MySQL)**: A MySQL database that stores all the application data for Strapi.
4.  **Socket Server**: A Node.js server using WebSockets for real-time communication features, such as chat or notifications.
5.  **Reverse Proxy (Caddy)**: Caddy acts as a reverse proxy, directing traffic to the appropriate services. It handles routing for the frontend, the Strapi API, and the socket server. It also provides logging and can be configured for SSL.
6.  **Container Management (Portainer)**: A web-based UI for managing the Docker environment.

## Architecture Diagram

Here is a diagram illustrating the flow of requests and the interaction between the services:

```
+-----------------+      +-----------------+      +--------------------+
|   User Browser  |----->|   Caddy (Reverse  |----->|  Frontend (Static) |
+-----------------+      |      Proxy)     |      +--------------------+
                         +-----------------+
                                |      ^
                                |      |
      +-------------------------+      +-------------------------+
      |                                                          |
      v                                                          v
+-----------------+      +-----------------+      +--------------------+
| Strapi (Backend) |<---->|  MySQL Database |      | Socket Server      |
+-----------------+      +-----------------+      +--------------------+

```

### Request Flow

1.  The user's browser sends a request to the main application URL.
2.  Caddy receives the request and, depending on the URL, routes it to the appropriate service:
    *   Requests for the main application are served the static frontend files (HTML, CSS, JS).
    *   API requests (e.g., `/api/...`) are proxied to the Strapi backend.
    *   WebSocket connections (e.g., `/socket/...`) are proxied to the Socket Server.
3.  The frontend application, once loaded in the browser, makes API calls to the Strapi backend to fetch and display data.
4.  The Strapi backend interacts with the MySQL database to store and retrieve data.
5.  For real-time features, the frontend establishes a WebSocket connection with the Socket Server.
