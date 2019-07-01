
const { Client: PgClient } = require('pg');

const CONFIG = require('../../config');
const logger = require('../logger');

async function dbOptimizer() {
  const client = new PgClient({ connectionString: CONFIG.postgisConnection });
  await client.connect();

  await client.query(`
        CREATE INDEX idx_osm_house_link_member_role
        ON osm_house_link_member(role);
    `);

  await client.query(`
        CREATE INDEX idx_osm_house_link_member_member_id
        ON osm_house_link_member(member_id);
    `);


  logger.info('Converting geom to geom_json for osm_highways...');
  await client.query(`
        ALTER TABLE osm_highways
        ADD COLUMN geom_geojson text;
    `);

  await client.query(`
        UPDATE osm_highways
        SET geom_geojson = ST_AsGeoJSON(ST_FlipCoordinates(ST_Transform(ST_Centroid(geom), 4326)));
    `);


  logger.info('Converting geom to geom_json for osm_house_link_member...');
  await client.query(`
        ALTER TABLE osm_house_link_member
        ADD COLUMN geom_geojson text;
    `);

  await client.query(`
        UPDATE osm_house_link_member
        SET geom_geojson = ST_AsGeoJSON(ST_FlipCoordinates(ST_Transform(ST_Centroid(geom), 4326)));
    `);

  await client.end();
}

module.exports = dbOptimizer;
