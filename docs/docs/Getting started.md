---
sidebar_position: 1
---

# Getting started

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

### Step 2 - Download docker-compose file
Download `docker-compose.yml` file from the [repository](https://github.com/Mozzo1000/booklogr)
```sh
curl --output docker-compose.yml "https://raw.githubusercontent.com/Mozzo1000/booklogr/refs/heads/main/docker-compose.yml"
```

### Step 3 - Start the containers
Start all containers
```sh
docker compose up -d
```

🎉 Booklogr should now be available on http://localhost:5150