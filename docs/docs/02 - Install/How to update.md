# How to update
Updating BookLogr is straightforward. Since the application is distributed as Docker images, you simply need to pull the latest versions and restart your containers.

## Before You Update
:::caution Warning
**Always backup your data before updating.**
See [Backup and restore](/docs/Administration/Backup-and-restore) for more information
:::

## Update Process
### 1. Stop the containers
Stop all running containers:

```bash
sudo docker compose down
```

### 2. Check latest versions
Find the latest version on [Github](https://github.com/mozzo1000/booklogr/releases/latest)

### 3. Update version numbers
Edit your `docker-compose.yml` file and update the image versions:

```yaml title="docker-compose.yml"
services:
    booklogr-api:
        image: mozzo/booklogr:v1.8.0 # Update to latest version
        # ... rest of config

    booklogr-web:
        image: mozzo/booklogr-web:v1.8.0 # Update to latest version
        # ... rest of config
```

### 4. Pull new images
Download the updated Docker images:

```bash
sudo docker compose pull
```

### 5. Start the containers
Start the updated containers:

```bash
sudo docker compose up -d
```

:::success
If everything works, your update is complete!
:::