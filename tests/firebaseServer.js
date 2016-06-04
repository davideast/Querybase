/// <reference path="../typings/tsd.d.ts" />

const FirebaseServer = require('firebase-server');

/**
 * Creates a default FirebaseServer
 * @param {Object} config - The object to configure the server 
 *                 { port: Number, url: String, data: Object}
 */
function firebaseServer(config) {
  config = config || { port: 5000, url: 'test.firebaseio.com', data: {}};
  const server = new FirebaseServer(config.port, config.url, config.data);
  return server;
}

module.exports = firebaseServer;