
const fs = require('fs');
const http = require('http');

const logger = require('./lib/logger');
const downloadOsmFile = require('./lib/downloader');
const importOsmFile = require('./lib/imposm');
const dbOptimier = require('./lib/db-optimizer');
const elastic = require('./lib/elastic');

const CONFIG = require('./config');

const VERSION = '1.0.0';


function connectElastic(resolve) {
  const req = http.request(`http://${CONFIG.elasticConnection}`, { method: 'HEAD' }, (res) => {
    resolve();
  });

  req.on('error', (e) => {
    console.log('Elastic down, waiting...');
    setTimeout(connectElastic.bind(null, resolve), 5000);
  });

  req.end();
}

function waitElastic() {
  return new Promise((resolve, reject) => {
    connectElastic(resolve);
  });
}

async function main() {
  try {
    logger.info('Downloading OSM file...');
    await downloadOsmFile();

    // ----- Wait elastic server.
    await waitElastic();

    // ---- Check if file has already been imported.
    const [elasticMTime, elasticVersion] = await elastic.getMtimeVersion();
    const osmMTime = Math.floor(fs.statSync(CONFIG.osmFilePath).mtime.getTime() / 1000);

    if ((elasticMTime === osmMTime) && (elasticVersion === VERSION)) {
      logger.info('File already imported: nothing to do.');
    } else {
      logger.info('Importing OSM file...');
      await importOsmFile();
      await dbOptimier();

      await elastic.indexer();
      await elastic.setMtimeVersion(osmMTime, VERSION);
    }
  } catch (err) {
    logger.error(err);
  }
}

main().then(() => { logger.info("That's all folks!"); });
