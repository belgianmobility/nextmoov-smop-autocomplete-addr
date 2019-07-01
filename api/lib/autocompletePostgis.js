
const { Pool: PgPool } = require('pg');

const CONFIG = require('../config');

const pgPool = new PgPool({
  connectionString: CONFIG.postgisConnection,
  min: 25,
  max: 50,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 5000,
});


async function getTextFromDb(allResults) {
  const pgClient = await pgPool.connect();

  const highwaysRaw = await pgClient.query(`
        SELECT id, osm_id, geom_geojson as geo, name, name_fr, name_nl, name_de, name_en
        FROM osm_highways highway
        WHERE id = ANY($1)
     `, [allResults.collectedHighwayIds]);

  const adminsRaw = await pgClient.query(`
        SELECT id, name, name_fr, name_nl, name_de, name_en
        FROM osm_admin_boundaries admin
        WHERE id = ANY($1)
     `, [allResults.collectedAdminIds]);

  const housesRaw = await pgClient.query(`
        SELECT rel_street.member_id as street_osmid, rel_house.number, rel_house.geom_geojson AS geo
        FROM 
            osm_house_link_member AS rel_house, 
            osm_house_link_member AS rel_street,
            osm_highways AS highway
        WHERE 
            highway.id = ANY($1)
            AND rel_house.role = 'house'
            AND rel_street.role = 'street' 
            AND rel_street.member_id = highway.osm_id
            AND rel_street.osm_id = rel_house.osm_id
     `, [allResults.collectedHighwayIds]);

  const pgClientEndPromise = pgClient.release();

  // ----- Transform data.
  const houses = {};

  for (const houseRow of housesRaw.rows) {
    if (!houses.hasOwnProperty(houseRow.street_osmid)) {
      houses[houseRow.street_osmid] = {};
    }

    houses[houseRow.street_osmid][houseRow.number] = JSON.parse(houseRow.geo).coordinates;
  }


  const arrToObjId = (acc, cur) => {
    if (cur.geo) {
      cur.geo = JSON.parse(cur.geo).coordinates;
    }

    acc[cur.id] = cur;
    return acc;
  };


  await pgClientEndPromise;

  return {
    admins: adminsRaw.rows.reduce(arrToObjId, {}),
    highways: highwaysRaw.rows.reduce(arrToObjId, {}),
    houses,
  };
}

module.exports = {
  getTextFromDb,
};
