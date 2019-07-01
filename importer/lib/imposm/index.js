
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const logger = require('../logger');
const CONFIG = require('../../config');


function spawnImposm(args, loggerStream = null) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    const imposmProcess = spawn(
      CONFIG.imposmExecutablePath,
      args,
    );

    imposmProcess.on('error', (err) => {
      reject(err);
    });

    imposmProcess.stdout.on('data', (data) => {
      stdout = data.toString();
    });

    if (loggerStream !== null) {
      imposmProcess.stdout.pipe(loggerStream);
      imposmProcess.stderr.pipe(loggerStream);
    }

    imposmProcess.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(code);
      }
    });
  });
}

async function importOsmFile() {
  const mappingFile = path.join(path.dirname(module.filename), 'mapping.yml');

  logger.info(`Reading ${CONFIG.osmFilePath}...`);

  await spawnImposm([
    'import',
    '-mapping', mappingFile,
    '-cachedir', CONFIG.cacheDir,
    '-read', CONFIG.osmFilePath,
    '-overwritecache',
  ], fs.createWriteStream(CONFIG.imposmLogFilePath, { flags: 'w' }));

  logger.info('Writing to DB...');

  await spawnImposm([
    'import',
    '-mapping', mappingFile,
    '-cachedir', CONFIG.cacheDir,
    '-write',
    '-connection', CONFIG.postgisConnection,
  ], fs.createWriteStream(CONFIG.imposmLogFilePath, { flags: 'a' }));


  logger.info('Deploy production tables...');

  await spawnImposm([
    'import',
    '-mapping', mappingFile,
    '-connection', CONFIG.postgisConnection,
    '-deployproduction',
  ], fs.createWriteStream(CONFIG.imposmLogFilePath, { flags: 'a' }));
}

module.exports = importOsmFile;
