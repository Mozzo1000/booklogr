---
sidebar_position: 1
---

# Use Docker
:::note
There are multiple ways you can host BookLogr. This guide goes through the recommended way of installing it on your own hardware but depending on your needs certain steps can be altered as you deem necessary.
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

### 2. Download docker-compose file
#### 2.1. Use SQLite as database (recommended)
Download `docker-compose.yml` file from the [repository](https://github.com/Mozzo1000/booklogr)
```sh
curl --output docker-compose.yml "https://raw.githubusercontent.com/Mozzo1000/booklogr/refs/heads/main/docker-compose.yml"
```

#### 2.2. Use PostgreSQL as database
Download `docker-compose.yml` and `.env` files from the [repository](https://github.com/Mozzo1000/booklogr)
```sh
curl --output docker-compose.yml "https://raw.githubusercontent.com/Mozzo1000/booklogr/refs/heads/main/docker-compose.postgres.yml"
curl --output .env "https://raw.githubusercontent.com/Mozzo1000/booklogr/refs/heads/main/.env.example"
```

### 3. Configure .env
Set the environment variables as needed inside the `docker-compose.yml` file or edit the `.env` file.
See [Environment variables](/docs/Configuration/Environment-variables) for more information.
The provided `docker-compose.yml` files have the minimum required environment variables set except for setting a random `AUTH_SECRET_KEY` string.
A secret key is required for BookLogr to start in multi-user mode.
```sh
echo "AUTH_SECRET_KEY=$(openssl rand -hex 32)" >> .env
```
If you would prefer to use single-user mode you do not need to set the `AUTH_SECRET_KEY` variable but instead need to set the `SINGLE_USER_MODE` and `BL_SINGLE_USER_MODE` environment variables to `true`.
```sh
cat <<EOF >> .env
SINGLE_USER_MODE=true
BL_SINGLE_USER_MODE=true
EOF
```

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

Paste the following inside the file:

```nginx
server {
    server_name api.YOUR_DOMAIN;

    location / {
            proxy_pass http://127.0.0.1:5000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
Change *api.YOUR_DOMAIN* to the public domain you want the API service to be accessible from.

### 2. Create Nginx configuration file for web interface
`sudo nano /etc/nginx/sites-available/booklogr`

Paste the following inside the file:
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
Change *YOUR_DOMAIN* to the public domain you want the web interface to be accessible from.

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

## Use Traefik as reverse proxy
:::warning
This is a community provided setup for using Traefik with BookLogr. This is not officially supported.  
See [issue #23](https://github.com/Mozzo1000/booklogr/issues/23) for more information.
:::
```yml
# docker-compose.yml
services:
    booklogr-api:
        container_name: "booklogr-api"
        image: mozzo/booklogr:latest
        environment:
            - DATABASE_URL=sqlite:///books.db
            - AUTH_SECRET_KEY=ADD_STRONG_SECRET_HERE
        labels:
            - "traefik.enable=true"
            - "traefik.http.routers.booklogr-api.entrypoints=https"
            - "traefik.http.routers.booklogr-api.rule=Host(`booklogr-api.YOUR_DOMAIN`)"
            - "traefik.http.routers.booklogr-api.tls=true"
            - "traefik.http.routers.booklogr-api.tls.certresolver=YOUR_RESOLVER"
            - "traefik.http.routers.booklogr-api.service=booklogr-api"
            - "traefik.http.services.booklogr-api.loadbalancer.server.port=5000"
            - "traefik.docker.network=proxy"
        networks:
        - proxy

    booklogr-web:
        container_name: "booklogr-web"
        image: mozzo/booklogr-web:latest
        environment:
            - BL_API_ENDPOINT=https://booklogr-api.YOUR_DOMAIN/ 
            - BL_GOOGLE_ID=XXX.apps.googleusercontent.com # CHANGE THIS TO YOUR OWN GOOGLE ID
            - BL_DEMO_MODE=false
        labels:
            - "traefik.enable=true"
            - "traefik.http.routers.booklogr.entrypoints=https"
            - "traefik.http.routers.booklogr.rule=Host(`booklogr.YOUR_DOMAIN`)"
            - "traefik.http.routers.booklogr.tls=true"
            - "traefik.http.routers.booklogr.tls.certresolver=YOUR_RESOLVER"
            - "traefik.http.routers.booklogr.service=booklogr"
            - "traefik.http.services.booklogr.loadbalancer.server.port=80"
            - "traefik.docker.network=proxy"
        networks:
            - proxy

networks:
    proxy:
        external: true
```
## Use Nginx Proxy Manager as reverse proxy
Based on https://raw.githubusercontent.com/Mozzo1000/booklogr/refs/heads/main/docker-compose.yml

### Proxy Host
You need to create 2 Proxy Host
- one for the api - target the 5000 (i.e https://booklogr-api.mydomain.com)
- one for the frontend - target 5150 (i.e https://booklogr.mydomain.com)

### Update the compose.yaml
Set the url to target the api via the Proxy Host configured previously
```console
BL_API_ENDPOINT=https://booklogr-api.mydomain.com
```



