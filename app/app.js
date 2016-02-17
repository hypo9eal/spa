/**
 * app.js
 */

/* eslint-env node */
/* eslint no-console: 0 */

'use strict';

var
  http = require( 'http' ),
  express = require( 'express' ),
  morgan = require( 'morgan' ),
  bodyParser = require( 'body-parser' ),
  methodOverride = require( 'method-override' ),
  errorhandler = require( 'errorhandler' ),
  routes = require( './routes' ),
  app = express(),
  server = http.createServer( app ),
  env = process.env.NODE_ENV || 'development';

// サーバ構成 開始 ---------------------------------------------------------------

app.use( bodyParser.json() );
app.use( methodOverride( 'X-HTTP-Method-Override' ) );
app.use( express.static( __dirname + '/build' ) );

switch ( env ) {
  case 'development':
    app.use( morgan( 'combined' ) );
    app.use( errorhandler( {
      log: true
    }) );
    break;

  case 'production':
    app.use( errorhandler( {
      log: false
    }) );
    break;
}

routes.configRoutes( app, server );

// サーバ構成 終了 ---------------------------------------------------------------

server.listen( 4000 );
console.log(
  'Node: Listening on port %d in %s mode',
  server.address().port, app.settings.env
);
