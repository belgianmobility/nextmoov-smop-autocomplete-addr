[< Back to general](https://github.com/nextmoov/nextmoov-smop-general)

# SMOP - Autocomplete - Addresses

## How to use

All modules provides a Dockerfile for easy startup:

```
docker-compose up
```

Tested with docker-compose version 1.21.0.

## Modules

### Database

Postgresql 11 with Postgis extension enabled.

### Importer

The importer will automatically download latest version of belgium-latest.osm.pbf from Geofabrik (See [General - Data](https://github.com/nextmoov/nextmoov-smop-general#maps) for more information) and index it if it changed.

### Api

After startup you can contact the API on http://localhost:8082/autocomplete/address.

You can POST the following JSON :

```
{
    "text": "rue de la vierge 35, marche",
    "position": [50.84547, 4.35767]
}
```

or with a position to give more importance to near locations :

```
{
    "text": "rue de la vierge 35, marche"
}
```

Example of reply :

```

```
