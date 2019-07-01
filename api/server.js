
const http = require('http');
const fs = require('fs');
const url = require('url');
const utf8 = require('utf8');

const controllers = {};

fs.readdirSync(`${__dirname}/controllers`).forEach((file) => {
  const res = /^(.*)\.js/.exec(file);

  if (res) {
    controllers[res[1]] = require(`./controllers/${file}`);
  }
});


const CONFIG = require('./config.js');

function errorHandler(response, err) {
  console.log('ERROR', err);

  response.writeHead(500, { 'Content-Type': 'text/plain' });
  response.end(':-(');
}

function doneHandler(response, obj) {
  const content = utf8.encode(JSON.stringify(obj));

  response.writeHead(200, {
    'Content-Type': 'application/json',
    'Content-Length': content.length,
    'Access-Control-Allow-Origin': '*',
  });

  response.end(content, 'binary');
}

function readRequestBody(request) {
  return new Promise(((resolve, reject) => {
    let postData = '';

    request.on('data', (chunk) => {
      postData += chunk;
    });

    request.on('end', () => {
      if (request.headers['content-type'] && (request.headers['content-type'].match(/application\/json/))) {
        try {
          resolve(JSON.parse(postData));
        } catch (err) {
          reject(err);
        }
      } else {
        resolve(postData);
      }
    });
  }));
}

http.createServer((request, response) => {
  // CORS Preflight.
  if (request.method.toLowerCase() === 'options') {
    // TODO Check if method really exists or send 404.
    response.writeHead(200, {
      'Content-Length': 0,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': request.headers['access-control-request-method'],
      'Access-Control-Allow-Headers': request.headers['access-control-request-headers'],
      'Access-Control-Max-Age': 86400,
    });
    response.end();
    return;
  }

  try {
    const urlObj = url.parse(request.url, true);
    const pathParts = urlObj.pathname.replace(/^\/|\/$/g, '').split('/');

    let handled = false;
    const controllerName = pathParts.shift();

    if (controllers[controllerName]) {
      const controller = controllers[controllerName];
      const functionName = `${request.method.toLowerCase()}_${pathParts.shift()}`;

      if (typeof controller[functionName] === 'function') {
        const info = {
          readRequestData: readRequestBody.bind(null, request),
          urlObj,
          pathParts,
        };

        controller[functionName](info)
          .then(doneHandler.bind(null, response))
          .catch(errorHandler.bind(null, response));

        handled = true;
      }
    }

    if (!handled) {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end(`404 ${http.STATUS_CODES[404]}`);
    }
  } catch (err) {
    errorHandler(response, err);
  }
}).listen(CONFIG.server_port);

console.log(`Server running at http://localhost:${CONFIG.server_port}/`);
