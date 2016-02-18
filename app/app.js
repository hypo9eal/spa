/**
 * app.js
 */

/* eslint-env node */
/* eslint no-console: 0 */

'use strict';

var
  express = require( 'express' ),
  app = express(),
  http = require( 'http' ).Server( app ),
  path = require( 'path' ),
  morgan = require( 'morgan' ),
  bodyParser = require( 'body-parser' ),
  methodOverride = require( 'method-override' ),
  errorhandler = require( 'errorhandler' ),
  basicAuth = require( 'basic-auth' ),
  routes = require( './routes' ),

  env = process.env.NODE_ENV || 'development',
  publicRoot = path.join( __dirname, 'public' ),
  auth;

// サーバ構成 開始 ---------------------------------------------------------------

app.use( bodyParser.json() );
app.use( methodOverride( 'X-HTTP-Method-Override' ) );
app.use( express.static( publicRoot ) );

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

auth = function ( req, res, next ) {
  var
    unauthorized,
    user;

  unauthorized = function ( res ) {
    res.set( 'WWW-Authenticate', 'Basic realm=Authorization required.' );
    return res.sendStatus( 401 );
  };

  user = basicAuth( req );

  if( ! user || ! user.name || ! user.pass ) {
    return unauthorized( res );
  }

  if ( user.name === 'foo' && user.pass === 'bar' ) {
    return next();
  }
  else {
    return unauthorized( res );
  }
};

routes.configRoutes( app, http, auth );

// サーバ構成 終了 ---------------------------------------------------------------

http.listen( 4000 );
console.log(
  'Node: Listening on port %d in %s mode',
  http.address().port, app.settings.env
);
