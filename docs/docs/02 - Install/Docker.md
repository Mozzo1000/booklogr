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

## Set up the server

### Step 1 - Create directory
Create a directory to store `docker-compose.yml` file in and move to that directory.
```sh
mkdir ./booklogr
cd ./booklogr
```

### Step 2  - Download docker-compose file
#### Use SQLite as database (recommended)
Download `docker-compose.yml` file from the [repository](https://github.com/Mozzo1000/booklogr)
```sh
curl --output docker-compose.yml "https://raw.githubusercontent.com/Mozzo1000/booklogr/refs/heads/main/docker-compose.yml"
```

#### Use PostgreSQL as database
Download `docker-compose.yml` and `.env` files from the [repository](https://github.com/Mozzo1000/booklogr)
```sh
curl --output docker-compose.yml "https://raw.githubusercontent.com/Mozzo1000/booklogr/refs/heads/main/docker-compose.postgres.yml"
curl --output .env "https://raw.githubusercontent.com/Mozzo1000/booklogr/refs/heads/main/.env.example"
```

### Step 3 - Configure .env
Set the environment variables as needed inside the `docker-compose.yml` file or edit the `.env` file (if using PostgreSQL).
See [ENV-variables.md](ENV-variables) for more information.
The provided `docker-compose.yml` files have the minimum required environment variables set and should work out of the box.

### Step 4 - Start the containers
Start all containers
```sh
docker compose up -d
```

🎉 The web interface should now be available on http://localhost:5150

## Set up reverse proxy (nginx)
It is recommended to use a reverse proxy for the docker containers when wanting to access them externally.
This will guide you through how to set it up with Nginx but other software may work as well.

### Step 1 - Create Nginx configuration file for api service
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

### Step 2 - Create Nginx configuration file for web interface
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

### Step 3 - Enable configuration files
```bash
sudo ln -s /etc/nginx/sites-available/api.booklogr /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/booklogr /etc/nginx/sites-enabled/
```

### Step 4 - Restart Nginx service
`sudo systemctl restart nginx`

🎉 You should now be able to go to **YOUR_DOMAIN** and have a working BookLogr service running! 🎉

:::tip
It is recommended to use an SSL certificate for all web services, especially if you are hosting BookLogr for external use.
:::