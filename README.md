[< Back to general](https://github.com/nextmoov/nextmoov-smop-general)

# SMOP - Autocomplete - Addresses

#### Illustration 
![autocomplete-addr](https://user-images.githubusercontent.com/10850995/70313437-ebf05f00-1815-11ea-9ce9-62714de79343.png)


## Modules

### Database

Postgresql 11 with Postgis extension enabled.

### Importer

The importer will automatically download latest version of belgium-latest.osm.pbf from Geofabrik (See [General - Data](https://github.com/nextmoov/nextmoov-smop-general#maps) for more information) and index it if it changed.

### Api

After startup you can contact the API on http://localhost:8080/autocomplete/address.

You can POST the following JSON :

```JSON
{
    "text": "rue de la vierge 35, marche"
}
```

or with a position to give more importance to near locations :

```JSON
{
    "text": "rue de la vierge 35, marche",
    "position": [50.84547, 4.35767]
}
```

Example of reply :

```JSON
[
    {
        "_source": {
            "multiLang": {
                "fr": "Rue de la Vierge Noire 35, Ville de Bruxelles - Stad Brussel",
                "nl": "Rue de la Vierge Noire 35, Ville de Bruxelles - Stad Brussel",
                "de": "Rue de la Vierge Noire 35, Ville de Bruxelles - Stad Brussel",
                "en": "Rue de la Vierge Noire 35, Ville de Bruxelles - Stad Brussel"
            },
            "geo": {
                "lat": 50.850214326539,
                "lon": 4.34970895454598
            },
            "house": false,
            "score": 40.154068,
            "maxScore": 41.800423,
            "distance": 770,
            "distanceScore": 45.582694363636364
        }
    },
    {
        "_source": {
            "multiLang": {
                "fr": "Rue de la Vierge 35, Marche-en-Famenne",
                "nl": "Rue de la Vierge 35, Marche-en-Famenne",
                "de": "Rue de la Vierge 35, Marche-en-Famenne",
                "en": "Rue de la Vierge 35, Marche-en-Famenne"
            },
            "geo": {
                "lat": 50.2606661241128,
                "lon": 5.4863255584054
            },
            "house": false,
            "score": 41.800423,
            "maxScore": 41.800423,
            "distance": 103100,
            "distanceScore": 41.840966572259944
        }
    },
    {
        "_source": {
            "multiLang": {
                "fr": "Rue Tour de la Vierge 35, Silly",
                "nl": "Rue Tour de la Vierge 35, Silly",
                "de": "Rue Tour de la Vierge 35, Silly",
                "en": "Rue Tour de la Vierge 35, Silly"
            },
            "geo": {
                "lat": 50.6632339724829,
                "lon": 3.89252709550415
            },
            "house": false,
            "score": 40.154068,
            "maxScore": 41.800423,
            "distance": 38580,
            "distanceScore": 40.2624153898393
        }
    },
    {
        "_source": {
            "multiLang": {
                "fr": "Rue Tour de la Vierge 35, Chièvres",
                "nl": "Rue Tour de la Vierge 35, Chièvres",
                "de": "Rue Tour de la Vierge 35, Chièvres",
                "en": "Rue Tour de la Vierge 35, Chièvres"
            },
            "geo": {
                "lat": 50.5815530891363,
                "lon": 3.77317021072205
            },
            "house": false,
            "score": 40.154068,
            "maxScore": 41.800423,
            "distance": 50657,
            "distanceScore": 40.23658457816294
        }
    },
    {
        "_source": {
            "multiLang": {
                "fr": "Rue de la Vierge Noire 35, Verviers",
                "nl": "Rue de la Vierge Noire 35, Verviers",
                "de": "Rue de la Vierge Noire 35, Verviers",
                "en": "Rue de la Vierge Noire 35, Verviers"
            },
            "geo": {
                "lat": 50.4615365362114,
                "lon": 5.97327036152723
            },
            "house": false,
            "score": 40.154068,
            "maxScore": 41.800423,
            "distance": 121972,
            "distanceScore": 40.18833850716558
        }
    },
    {
        "_source": {
            "multiLang": {
                "fr": "Rue de la Vierge Noire 35, Arlon",
                "nl": "Rue de la Vierge Noire 35, Arlon",
                "de": "Rue de la Vierge Noire 35, Arlon",
                "en": "Rue de la Vierge Noire 35, Arlon"
            },
            "geo": {
                "lat": 49.6846346074597,
                "lon": 5.81484212421289
            },
            "house": false,
            "score": 40.154068,
            "maxScore": 41.800423,
            "distance": 165727,
            "distanceScore": 40.17929045801831
        }
    },
    {
        "_source": {
            "multiLang": {
                "fr": "Rue des Vierges 35, Ville de Bruxelles - Stad Brussel",
                "nl": "Rue des Vierges 35, Ville de Bruxelles - Stad Brussel",
                "de": "Rue des Vierges 35, Ville de Bruxelles - Stad Brussel",
                "en": "Rue des Vierges 35, Ville de Bruxelles - Stad Brussel"
            },
            "geo": {
                "lat": 50.8449972495908,
                "lon": 4.34498398783509
            },
            "house": false,
            "score": 35.3689,
            "maxScore": 41.800423,
            "distance": 895,
            "distanceScore": 40.039338324022346
        }
    },
    {
        "_source": {
            "multiLang": {
                "fr": "Rue de la Marche 35, Courcelles",
                "nl": "Rue de la Marche 35, Courcelles",
                "de": "Rue de la Marche 35, Courcelles",
                "en": "Rue de la Marche 35, Courcelles"
            },
            "geo": {
                "lat": 50.455644065451,
                "lon": 4.32839728922016
            },
            "house": false,
            "score": 38.800724,
            "maxScore": 41.800423,
            "distance": 43414,
            "distanceScore": 38.897007279587235
        }
    },
    {
        "_source": {
            "multiLang": {
                "fr": "Rue du Bois de la Vierge 35, Virton",
                "nl": "Rue du Bois de la Vierge 35, Virton",
                "de": "Rue du Bois de la Vierge 35, Virton",
                "en": "Rue du Bois de la Vierge 35, Virton"
            },
            "geo": {
                "lat": 49.622372618311,
                "lon": 5.33074490906322
            },
            "house": false,
            "score": 38.63248,
            "maxScore": 41.800423,
            "distance": 152736,
            "distanceScore": 38.659847760711294
        }
    },
    {
        "_source": {
            "multiLang": {
                "fr": "Sentier de la Vierge 35, Rixensart",
                "nl": "Sentier de la Vierge 35, Rixensart",
                "de": "Sentier de la Vierge 35, Rixensart",
                "en": "Sentier de la Vierge 35, Rixensart"
            },
            "geo": {
                "lat": 50.7130738545255,
                "lon": 4.54247673980294
            },
            "house": false,
            "score": 37.7583,
            "maxScore": 41.800423,
            "distance": 19668,
            "distanceScore": 37.970830114907464
        }
    },
    {
        "_source": {
            "multiLang": {
                "fr": "Rempart de la Vierge 35, Namur",
                "nl": "Rempart de la Vierge 35, Namur",
                "de": "Rempart de la Vierge 35, Namur",
                "en": "Rempart de la Vierge 35, Namur"
            },
            "geo": {
                "lat": 50.4663110093798,
                "lon": 4.8570972083034
            },
            "house": false,
            "score": 37.7583,
            "maxScore": 41.800423,
            "distance": 55012,
            "distanceScore": 37.83428419072202
        }
    },
    {
        "_source": {
            "multiLang": {
                "fr": "Rue de la Marche Blanche 35, Liège",
                "nl": "Rue de la Marche Blanche 35, Liège",
                "de": "Rue de la Marche Blanche 35, Liège",
                "en": "Rue de la Marche Blanche 35, Liège"
            },
            "geo": {
                "lat": 50.6473611331723,
                "lon": 5.48254078329708
            },
            "house": false,
            "score": 37.272507,
            "maxScore": 41.800423,
            "distance": 82394,
            "distanceScore": 37.3232393627934
        }
    },
    {
        "_source": {
            "multiLang": {
                "fr": "Chemin de la Vierge Noire 35, Namur",
                "nl": "Chemin de la Vierge Noire 35, Namur",
                "de": "Chemin de la Vierge Noire 35, Namur",
                "en": "Chemin de la Vierge Noire 35, Namur"
            },
            "geo": {
                "lat": 50.3848543511803,
                "lon": 4.94621309230306
            },
            "house": false,
            "score": 36.27115,
            "maxScore": 41.800423,
            "distance": 66035,
            "distanceScore": 36.33445040584538
        }
    }
]
```
