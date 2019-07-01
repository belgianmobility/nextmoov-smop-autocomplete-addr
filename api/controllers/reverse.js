
const proj4 = require('proj4');
const { Client: PgClient } = require('pg');

const CONFIG = require('../config');

function empty2default(value, defaultValue) {
  if (value !== '') {
    return value;
  }
  return defaultValue;
}

async function post_address(info) {
  const postData = await info.readRequestData();
  const postgisPoint = proj4('EPSG:4326', 'EPSG:3857', postData.coords.reverse());

  const pgClient = new PgClient({ connectionString: CONFIG.postgisConnection });
  await pgClient.connect();

  const data = await pgClient.query(`
        SELECT * 
        FROM osm_highways
        WHERE 
            name <> '' AND
            ST_DWithin(
              geom, 
              ST_SetSRID(ST_Point($1, $2), 3857), 
              75
            )
        ORDER BY ST_Distance(geom, ST_SetSRID(ST_Point($1, $2), 3857))
        LIMIT 1
     `, postgisPoint);

  await pgClient.end();

  return {
    fr: empty2default(data.rows[0].name_fr, data.rows[0].name),
    nl: empty2default(data.rows[0].name_nl, data.rows[0].name),
    de: empty2default(data.rows[0].name_de, data.rows[0].name),
    en: empty2default(data.rows[0].name_en, data.rows[0].name),
  };
}


module.exports = {
  post_address,
};
