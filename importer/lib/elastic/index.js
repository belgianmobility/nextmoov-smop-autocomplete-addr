
const { Elastic } = require('./elastic.js');
const indexer = require('./indexer');

const logger = require('../logger');
const CONFIG = require('../../config');


async function getMtimeVersion() {
  try {
    const elastic = await Elastic.getClient(CONFIG.elasticConnection);

    const response = await elastic.get({
      index: 'meta',
      type: 'meta',
      id: 'meta',
    });

    return [response._source.mtime, response._source.version];
  } catch (err) {
    // logger.error('ERROR', err);
    return [0, 0];
  }
}

async function setMtimeVersion(mtime, version) {
  try {
    const elastic = await Elastic.getClient(CONFIG.elasticConnection);

    await elastic.update({
      index: 'meta',
      type: 'meta',
      id: 'meta',
      body: {
        doc: {
          mtime,
          version,
        },
        doc_as_upsert: true,
      },
    });
  } catch (err) {
    logger.error('ERROR', err);
  }
}

module.exports = {
  getMtimeVersion,
  setMtimeVersion,
  indexer,
};
