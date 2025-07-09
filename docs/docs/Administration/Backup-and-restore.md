# Backup and restore
## SQLite
SQLite is a file that is stored where you point your `DATABASE_URL` env variable to. If you want to backup you simply copy the file to another folder.

## PostgreSQL
### Backup database
```
sudo docker exec -t CONTAINER_ID pg_dumpall -c -U POSTGRES_USER > dump_`date +%Y-%m-%d"_"%H_%M_%S`.sql
```

### Restore
:::info
The database needs to be empty in order to be able to restore from backup. Stop all containers and delete the volume from the postgres service. Afterwords, only start up the postgres database. E.g `docker compose up booklogr-db -d`
:::

```
cat dump_2025-01-02_16_06_47.sql | sudo docker exec -i CONTAINER_ID psql -U POSTGRES_USER -d booklogr
```
Lastly, start all other containers, `docker compose up -d`


