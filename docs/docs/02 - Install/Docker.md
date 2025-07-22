---
sidebar_position: 1
---

# Use Docker
:::note
There are multiple ways you can host BookLogr. This guide goes through the recommended way of installing it on your own hardware but depending on your needs certain steps can be altered as you deem neccessary.
:::

## Prerequisites
* Linux server (tested with Ubuntu 24.04)
* [Docker](https://www.docker.com)

## Steps to set up the server

### 1. Create directory
Create a directory to store `docker-compose.yml` file in and move to that directory.
```sh
mkdir ./booklogr
cd ./booklogr
```

### 1. Download docker-compose file
#### 1.1. Use SQLite as database (recommended)
Download `docker-compose.yml` file from the [repository](https://github.com/Mozzo1000/booklogr)
```sh
curl --output docker-compose.yml "https://raw.githubusercontent.com/Mozzo1000/booklogr/refs/heads/main/docker-compose.yml"
```

#### 1.2. Use PostgreSQL as database
Download `docker-compose.yml` and `.env` files from the [repository](https://github.com/Mozzo1000/booklogr)
```sh
curl --output docker-compose.yml "https://raw.githubusercontent.com/Mozzo1000/booklogr/refs/heads/main/docker-compose.postgres.yml"
curl --output .env "https://raw.githubusercontent.com/Mozzo1000/booklogr/refs/heads/main/.env.example"
```

### 3. Configure .env
Set the environment variables as needed inside the `docker-compose.yml` file or edit the `.env` file (if using PostgreSQL).
See [Environment variables](/docs/Configuration/Environment-variables) for more information.
The provided `docker-compose.yml` files have the minimum required environment variables set and should work out of the box.

### 4. Start the containers
Start all containers
```sh
docker compose up -d
```

🎉 The web interface should now be available on http://localhost:5150

## Steps to set up reverse proxy (nginx)
It is recommended to use a reverse proxy for the docker containers when wanting to access them externally.
This will guide you through how to set it up with Nginx but other software may work as well.

### 1. Create Nginx configuration file for api service
`sudo nano /etc/nginx/sites-available/api.booklogr`

Paste the following inside the file,

```nginx
server {
    server_name api.YOUR_DOMAIN;

    location / {
            proxy_pass http://127.0.0.1:5002;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
Change *api.YOURDOMAIN* to the public domain you want the api service to be accessible from.

### 2. Create Nginx configuration file for web interface
Create Nginx configuration file for auth service
`sudo nano /etc/nginx/sites-available/booklogr`

Paste the following inside the file,
```nginx
server {
    server_name YOUR_DOMAIN;

    location / {
            proxy_pass http://127.0.0.1:5150;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
Change *YOURDOMAIN* to the public domain you want the web interface to be accessible from.

### 3. Enable configuration files
```bash
sudo ln -s /etc/nginx/sites-available/api.booklogr /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/booklogr /etc/nginx/sites-enabled/
```

### 4. Restart Nginx service
`sudo systemctl restart nginx`

🎉 You should now be able to go to **YOUR_DOMAIN** and have a working BookLogr service running! 🎉

:::tip
It is recommended to use an SSL certificate for all web services, especially if you are hosting BookLogr for external use.
:::

## Use traefik as reverse proxy
:::warning
This is a community provided setup for using traefik with BookLogr. This is not officially supported.  
See [issue #23](https://github.com/Mozzo1000/booklogr/issues/23) for more information.
:::
```yml
# docker-compose.yml
services:
    booklogr-api:
        container_name: "booklogr-api"
        image: mozzo/booklogr:v1.5.0
        environment:
            - DATABASE_URL=sqlite:///books.db
            - AUTH_SECRET_KEY=ADD STRONG SECRET HERE
        labels:
            - "traefik.enable=true"
            - "traefik.http.routers.booklogr-api.entrypoints=https"
            - "traefik.http.routers.booklogr-api.rule=Host(`booklogr-api.YOURDOMAIN.TLD`)"
            - "traefik.http.routers.booklogr-api.tls=true"
            - "traefik.http.routers.booklogr-api.tls.certresolver=YOURRESOLVER"
            - "traefik.http.routers.booklogr-api.service=booklogr-api"
            - "traefik.http.services.booklogr-api.loadbalancer.server.port=5000"
            - "traefik.docker.network=proxy"
        networks:
        - proxy

    booklogr-web:
        container_name: "booklogr-web"
        image: mozzo/booklogr-web:v1.5.0
        environment:
            - BL_API_ENDPOINT=https://booklogr-api.YOURDOMAIN.TLD/ 
            - BL_GOOGLE_ID=XXX.apps.googleusercontent.com # CHANGE THIS TO YOUR OWN GOOGLE ID
            - BL_DEMO_MODE=false
        labels:
            - "traefik.enable=true"
            - "traefik.http.routers.booklogr.entrypoints=https"
            - "traefik.http.routers.booklogr.rule=Host(`booklogr.YOURDOMAIN.TLD`)"
            - "traefik.http.routers.booklogr.tls=true"
            - "traefik.http.routers.booklogr.tls.certresolver=YOURRESOLVER"
            - "traefik.http.routers.booklogr.service=booklogr"
            - "traefik.http.services.booklogr.loadbalancer.server.port=80"
            - "traefik.docker.network=proxy"
        networks:
            - proxy

networks:
    proxy:
        external: true
```