# SMOP - Autocomplete - Addresses

General information : [nextmoov-smop-general](https://github.com/nextmoov/nextmoov-smop-general)

## How to use

All modules provides a Dockerfile for easy startup:

```
docker-compose up
```

Tested with docker-compose version 1.21.0.

## Modules

### ElasticSearch

Take care to set system settings:

```
sysctl -w vm.max_map_count=262144
```

### Database

Postgresql 11 with Postgis extension enabled.

### Importer

### Api
