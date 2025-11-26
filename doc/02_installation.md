# Installation Guide

This guide provides step-by-step instructions for setting up the Rally Point application in a local development environment.

## Prerequisites

Before you begin, ensure you have the following software installed on your machine:

*   **Docker and Docker Compose**: The application is fully containerized, so Docker is essential. You can download it from the official [Docker website](https://www.docker.com/products/docker-desktop/).
*   **Git**: To clone the repository.
*   **A text editor or IDE**: Such as VS Code, Sublime Text, or any other editor of your choice.

## Setup

1.  **Clone the Repository**

    Open your terminal and clone the project repository from your source control system.

    ```bash
    git clone <repository-url>
    cd onbouge
    ```

2.  **Configure Environment Variables**

    The application uses a `.env` file to manage environment-specific variables. You'll need to create one based on the provided template or example.

    *   Create a file named `.env` in the root of the project.
    *   Add the following variables to the file, replacing the placeholder values with your desired settings:

    ```env
    # .env

    # -- General Settings --
    # Domain used for Caddy (e.g., localhost)
    MY_DOMAIN=localhost

    # -- MySQL Database Settings --
    DATABASE_CLIENT=mysql
    DATABASE_HOST=mysql
    DATABASE_PORT=3306
    DATABASE_NAME=strapi_db
    DATABASE_USER=strapi_user
    DATABASE_PASSWORD=strapi_password
    MYSQL_ROOT_PASSWORD=root_password_change_me

    # -- Strapi Settings --
    # These should match the database settings above
    STRAPI_DB_CLIENT=${DATABASE_CLIENT}
    STRAPI_DB_HOST=${DATABASE_HOST}
    STRAPI_DB_PORT=${DATABASE_PORT}
    STRAPI_DB_NAME=${DATABASE_NAME}
    STRAPI_DB_USER=${DATABASE_USER}
    STRAPI_DB_PASSWORD=${DATABASE_PASSWORD}

    # -- Strapi Application Keys (generate these yourself) --
    APP_KEYS=your_app_keys_here
    API_TOKEN_SALT=your_api_token_salt_here
    ADMIN_JWT_SECRET=your_admin_jwt_secret_here
    JWT_SECRET=your_jwt_secret_here
    ```

    **Note**: You can use an online generator or a command-line tool (like `openssl rand -base64 32`) to create secure random strings for the Strapi application keys.

3.  **Build and Start the Containers**

    Once the `.env` file is configured, you can start the application using Docker Compose.

    ```bash
    **First Time Setup:**
    If this is your first time running the project, use the setup script. It handles dependency installation, container startup, admin account creation, and schema installation.

    ```bash
    npm run setup
    ```

    **Regular Startup:**
    For subsequent runs, you can simply start the containers:

    ```bash
    npm run start
    ```

    These commands will:
    *   Pull/Build necessary Docker images.
    *   Start all containers in the background.

## Accessing the Services

After the containers are up and running, you can access the different parts of the application:

*   **Frontend Application**: `http://localhost:3000`
*   **Strapi Admin Panel**: `http://localhost:1337/admin`
*   **Strapi API**: `http://localhost:1337/api`
*   **Portainer (Docker Management)**: `https://localhost:9443`

## Initial Strapi Configuration

On your first visit to the Strapi admin panel (`http://localhost:1337/admin`), you will be prompted to create an administrator account. This is the root account for managing your Strapi application.

## Stopping the Application

To stop all the running containers, use the following command:

```bash
npm run stop
```

If you also want to remove the data volumes (which will delete all your data), you can use:

```bash
npm run clean
```
