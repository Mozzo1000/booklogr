---
sidebar_position: 1
---

# Getting started

## Prerequisites
* Linux server (tested with Ubuntu 24.04)
* [Docker](https://www.docker.com)

## Steps to set up the server

### Automatic setup (recommended)
The easiest way to get BookLogr running is using the official setup script. This script checks your prerequisites, downloads the neccessary files helps you configure your environment interactively.

#### 1. Create directory
Create a directory and move to that directory.
```sh
mkdir ./booklogr
cd ./booklogr
```

#### 2. Run the setup script
:::warning Review the Script
As a best practice for security, you should always inspect scripts from the internet before executing them. You can view the source code of the setup script [here](https://raw.githubusercontent.com/Mozzo1000/booklogr/refs/heads/main/setup.sh).
:::
```sh
curl -sL https://raw.githubusercontent.com/Mozzo1000/booklogr/main/setup.sh | bash
```
The setup script will prompt you for selecting Single-user or Multi-user mode, you can read more about this at [Single-user mode](/docs/Configuration/Single-user-mode).

After the setup has finished the containers will start up automatically and Booklogr should be available on http://localhost:5150

---
### Manual setup
If you prefer a manual installation or need a specific database backend (like PostgreSQL), please refer to our [Detailed Docker Instructions.](/docs/Install/Docker)

#### 1. Create directory
```sh
mkdir ./booklogr
cd ./booklogr
```
#### 2. Download docker-compose file
```sh
curl -o docker-compose.yml "https://raw.githubusercontent.com/Mozzo1000/booklogr/main/docker-compose.yml"
```

#### 3. Configure .env
A secret key is required for BookLogr to start in multi-user mode. Create a .env file and generate a random string:
```sh
echo "AUTH_SECRET_KEY=$(openssl rand -hex 32)" > .env
```
If you rather would like to use single-user mode you do not need to set the `AUTH_SECRET_KEY` variable but instead need to set the `SINGLE_USER_MODE`  and `BL_SINGLE_USER_MODE` environment variable to `true`.
```sh
cat <<EOF > .env
SINGLE_USER_MODE=true
BL_SINGLE_USER_MODE=true
EOF
```

See [Environment variables](/docs/Configuration/Environment-variables) for more information.

#### 4. Start the containers
```sh
docker compose up -d
```

🎉 BookLogr should now be available on http://localhost:5150