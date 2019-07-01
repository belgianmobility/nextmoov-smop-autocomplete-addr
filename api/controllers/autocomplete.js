
const geolib = require('geolib');

const { getElasticResults } = require('../lib/autocompleteElastic');
const { getTextFromDb } = require('../lib/autocompletePostgis');


async function post_address(info) {
  const postData = await info.readRequestData();
  const { text } = postData;

  if (typeof postData.position !== 'undefined') {
    if (typeof postData.distanceWeighting === 'undefined') {
      postData.distanceWeighting = 10;
    }
  }

  // ----- Query ElasticSearch.
  const allResults = await getElasticResults(text);

  // ----- Query Postgis.
  const dbData = await getTextFromDb(allResults);
  const finalResultsIds = {};
  const results = [];

  for (const res of allResults.results) {
    let numberStr = '';

    if (res.numbers.length > 0) {
      numberStr = ` ${res.numbers.join(' ')}`;
    }

    for (const admin of res.adminBoundaries) {
      // ---- Check for duplicate.
      let alreadyThere = false;

      for (const id of admin.highwayIds) {
        if (finalResultsIds[id]) {
          alreadyThere = true;
          break;
        }
      }

      if (!alreadyThere) {
        let adminStr = '';

        if (admin.hasOwnProperty('text')) {
          adminStr = `, ${admin.text}`;
        } else {
          adminStr = `, ${dbData.admins[admin.adminId].name}`;
        }

        const allOsmId = [];
        let geoStreet;
        let geoHouse = false;

        for (const id of admin.highwayIds) {
          finalResultsIds[id] = true;
          allOsmId.push(dbData.highways[id].osm_id);

          if (res.numbers.length > 0) {
            if (dbData.houses[dbData.highways[id].osm_id]) {
              if (dbData.houses[dbData.highways[id].osm_id][res.numbers[0]]) {
                geoHouse = dbData.houses[dbData.highways[id].osm_id][res.numbers[0]];
                break;
              } else {
                geoStreet = dbData.highways[id].geo;
              }
            } else {
              geoStreet = dbData.highways[id].geo;
            }
          } else {
            geoStreet = dbData.highways[id].geo;
          }
        }

        const geo = geoHouse || geoStreet;
        const resObj = {
          _source: {
            multiLang: {
              fr: res.text + numberStr + adminStr,
              nl: res.text + numberStr + adminStr,
              de: res.text + numberStr + adminStr,
              en: res.text + numberStr + adminStr,
            },
            geo: {
              lat: geo[0],
              lon: geo[1],
            },
            house: !!geoHouse,
            score: res.score,
            maxScore: res.maxScore,
          },
        };

        if (typeof postData.position !== 'undefined') {
          const { position } = postData;

          resObj._source.distance = geolib.getDistance(
            { latitude: position[0], longitude: position[1] },
            { latitude: geo[0], longitude: geo[1] },
          );

          resObj._source.distanceScore = resObj._source.score + ((res.maxScore * (postData.distanceWeighting / 100)) * (1000 / resObj._source.distance));
        }

        results.push(resObj);
      }
    }
  }

  if (typeof postData.position !== 'undefined') {
    results.sort((a, b) => b._source.distanceScore - a._source.distanceScore);
  }

  return results;
}


module.exports = {
  post_address,
};
