/**
 * app.js
 */

/* eslint-env node */
/* eslint no-console: 0 */

'use strict';

var
  express = require( 'express' ),
  app = express(),
  path = require( 'path' ),
  morgan = require( 'morgan' ),
  bodyParser = require( 'body-parser' ),
  errorhandler = require( 'errorhandler' ),

  router = require( './router' ),

  port = process.env.PORT || 4000,
  env = process.env.NODE_ENV || 'development',
  publicRoot = path.join( __dirname, 'public' );

// サーバ構成 開始 ---------------------------------------------------------------

app.use( express.static( publicRoot ) );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );

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

app.use( '/', router );

// サーバ構成 終了 ---------------------------------------------------------------

app.listen( port );
console.log(
  'Node: Listening on port %s in %s mode',
  port, app.settings.env
);
