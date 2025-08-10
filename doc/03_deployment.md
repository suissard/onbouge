# Deployment Guide

This guide outlines the process of deploying the Rally Point application to a production environment. It assumes you have a server (e.g., a VPS from a cloud provider) with a domain name pointed to its IP address.

## Prerequisites

*   A server with a fresh installation of a modern Linux distribution (e.g., Ubuntu 22.04).
*   **Docker and Docker Compose** installed on the server.
*   A registered domain name (e.g., `your-app.com`).
*   **DNS configured**: Your domain's A record should point to your server's IP address.

## Production Setup

The deployment process is similar to the development setup but with a few key differences, primarily related to security and domain configuration.

1.  **Clone the Repository**

    Connect to your server via SSH and clone the project repository.

    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Configure Environment Variables for Production**

    Create a `.env` file in the project root. The production configuration will be more stringent.

    ```env
    # .env (Production)

    # -- General Settings --
    # Your actual domain name
    MY_DOMAIN=your-app.com

    # -- MySQL Database Settings --
    # Use strong, randomly generated passwords
    DATABASE_CLIENT=mysql
    DATABASE_HOST=mysql
    DATABASE_PORT=3306
    DATABASE_NAME=strapi_prod_db
    DATABASE_USER=strapi_prod_user
    DATABASE_PASSWORD=a_very_strong_and_secret_password
    MYSQL_ROOT_PASSWORD=another_very_strong_and_secret_password

    # -- Strapi Settings --
    STRAPI_DB_CLIENT=${DATABASE_CLIENT}
    STRAPI_DB_HOST=${DATABASE_HOST}
    STRAPI_DB_PORT=${DATABASE_PORT}
    STRAPI_DB_NAME=${DATABASE_NAME}
    STRAPI_DB_USER=${DATABASE_USER}
    STRAPI_DB_PASSWORD=${DATABASE_PASSWORD}

    # -- Strapi Application Keys (IMPORTANT: Generate new, secure keys) --
    APP_KEYS=generate_a_new_secure_key
    API_TOKEN_SALT=generate_a_new_secure_salt
    ADMIN_JWT_SECRET=generate_a_new_secure_secret
    JWT_SECRET=generate_a_new_secure_jwt_secret
    ```

    **CRITICAL**: For production, you **must** use strong, unique passwords and generate new, random strings for all Strapi keys. Do not use the default or development values.

3.  **Caddyfile for Production**

    The `Caddyfile` is already set up to use the `MY_DOMAIN` environment variable. When you run Docker Compose, Caddy will automatically provision SSL certificates for your domain using Let's Encrypt, enabling HTTPS.

    Ensure your `Caddyfile` is configured to handle HTTPS traffic. The provided `Caddyfile` should work out of the box, as Caddy enables HTTPS by default for domain names.

4.  **Start the Application**

    With the configuration in place, start the application.

    ```bash
    docker-compose up -d
    ```

    Docker Compose will start all the services. Caddy will automatically obtain and manage SSL certificates for your domain.

## Accessing the Production Application

*   **Frontend**: `https://your-app.com`
*   **Strapi Admin**: `https://your-app.com:1337/admin` (or configure Caddy to proxy it to a subpath like `your-app.com/admin`)

## Security Considerations

*   **Firewall**: Configure a firewall on your server (e.g., `ufw` on Ubuntu) to only allow traffic on necessary ports (e.g., 80 for HTTP, 443 for HTTPS).
*   **Regular Updates**: Keep your server and Docker images up to date with the latest security patches.
*   **Backups**: Regularly back up your database and any uploaded files. You can create a script to dump the MySQL database and archive the Strapi `public/uploads` directory.
*   **Remove Portainer (Optional)**: For a production environment, you might consider removing the Portainer service from your `docker-compose.yml` to reduce the attack surface. You can manage Docker from the command line.

## Monitoring

You should monitor the health of your application. You can check the logs of the containers using:

```bash
docker-compose logs -f <service_name>
```

For example, to view the logs for the Strapi container:

```bash
docker-compose logs -f strapi
```

Consider setting up a more robust logging and monitoring solution for your production environment.
