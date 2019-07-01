const { Client: PgClient } = require('pg');
const elasticsearch = require('elasticsearch');

const { Elastic } = require('./elastic.js');
const logger = require('../logger');
const CONFIG = require('../../config');


function getAllLangs(row) {
  const allLang = {};

  if (row.name_fr !== '') allLang[row.name_fr] = true;
  if (row.name_nl !== '') allLang[row.name_nl] = true;
  if (row.name_de !== '') allLang[row.name_de] = true;
  if (row.name_en !== '') allLang[row.name_en] = true;

  if (Object.keys(allLang).length === 0) {
    allLang[row.name] = true;
  }

  return allLang;
}


async function fillIndex(index, type, data) {
  const elastic = await Elastic.getClient(CONFIG.elasticConnection);
  let bulkOpsDone = 0;

  const elasticInsertBulk = async (ops) => {
    try {
      await elastic.bulk({
        body: ops,
      });

      bulkOpsDone += ops.length / 2;
      process.stdout.write(`\r\x1b[2KInserting... ${((bulkOpsDone / data.length) * 100).toFixed(0)} % `);
    } catch (e) {
      logger.error('ES error :', e);
    }
  };

  const startTime = new Date().getTime();

  const chunks = (arr, size) => Array.from(
    { length: Math.ceil(arr.length / size) },
    (v, i) => arr.slice(i * size, i * size + size),
  );

  for (const chunk of chunks(data, 1000)) {
    const bulkOps = [];
    for (const item of chunk) {
      bulkOps.push(
        { index: { _index: index, _type: type, _id: item.text } },
        item,
      );
    }

    await elasticInsertBulk(bulkOps);
  }

  const endTime = new Date().getTime();

  logger.info(`\nInserted ${bulkOpsDone} in ${((endTime - startTime) / 1000).toFixed(3)} s.`);
}


async function getAdminBoundariesFromDB() {
  const client = new PgClient({ connectionString: CONFIG.postgisConnection });
  await client.connect();

  logger.info('Loading data...');

  const res = await client.query(`
        SELECT id, name, name_fr, name_nl, name_de, name_en
        FROM osm_admin_boundaries 
        WHERE admin_level > 6
    `);


  logger.info('Expanding languages...');

  const allData = {};

  for (const row of res.rows) {
    const allLangAdmin = getAllLangs(row);

    for (const lang in allLangAdmin) {
      if (allLangAdmin.hasOwnProperty(lang)) {
        if (!allData.hasOwnProperty(lang)) {
          allData[lang] = [];
        }

        allData[lang].push(row.id);
      }
    }
  }

  logger.info('Closing connection...');

  await client.end();

  logger.info('Done...');

  return allData;
}

async function getHighwaysFromDB() {
  const client = new PgClient({ connectionString: CONFIG.postgisConnection });
  await client.connect();


  const allData = {};


  const resAdmin = await client.query(`
        SELECT admin.id, admin.geom
        FROM osm_admin_boundaries AS admin
        WHERE admin_level > 6
    `);


  let i = 0;
  const startTime = new Date().getTime();

  for (const rowAdmin of resAdmin.rows) {
    const resHighway = await client.query(`
            SELECT highway.id, highway.name, highway.name_fr, highway.name_nl, highway.name_de, highway.name_en
            FROM osm_admin_boundaries admin, osm_highways highway
            WHERE
                admin.id = $1 AND
                st_contains($2, highway.geom) = true
         `, [rowAdmin.id, rowAdmin.geom]);


    for (const rowHighway of resHighway.rows) {
      const allLangHighway = getAllLangs(rowHighway);

      for (const langHighway of Object.keys(allLangHighway)) {
        if (!allData.hasOwnProperty(langHighway)) {
          allData[langHighway] = {};
        }

        if (!allData[langHighway].hasOwnProperty(rowAdmin.id)) {
          allData[langHighway][rowAdmin.id] = {};
        }

        allData[langHighway][rowAdmin.id][rowHighway.id] = true;
      }
    }


    const procent = i * 100 / resAdmin.rows.length;
    const endTime = new Date().getTime();
    const elaspsed = (endTime - startTime) / 1000;
    const remaining = (100 - procent) * (elaspsed / procent);

    logger.info(`${procent.toFixed(0)}%  /  ${elaspsed.toFixed(0)} s  /  ETA ${remaining.toFixed(0)} s`);


    ++i;
  }


  await client.end();

  logger.info(`AllData length = ${Object.keys(allData).length}`);

  return allData;
}

async function main() {
  // ----- Get all administrative boundaries.
  const allAdminBoundaries = await getAdminBoundariesFromDB();
  const allAdminBoundariesDocument = [];

  for (const k in allAdminBoundaries) {
    allAdminBoundariesDocument.push({
      text: k,
      ids: JSON.stringify(allAdminBoundaries[k]),
    });
  }


  // ----- Get all highways.
  const allHighways = await getHighwaysFromDB();
  const allHighwayDocument = [];

  for (const k in allHighways) {
    allHighwayDocument.push({
      text: k,
      admin_boundaries: JSON.stringify(allHighways[k]),
    });
  }


  // ----- Index all data in elastic search.
  const elastic = new elasticsearch.Client({
    host: CONFIG.elasticConnection,
    log: 'error',
  });

  try {
    await elastic.indices.delete({ index: 'address_highway' });
  } catch (err) {
  }

  try {
    await elastic.indices.delete({ index: 'address_admin_boundaries' });
  } catch (err) {
  }

  await fillIndex('address_highway', 'autocomplete', allHighwayDocument);
  await fillIndex('address_admin_boundaries', 'autocomplete', allAdminBoundariesDocument);
}

module.exports = main;
