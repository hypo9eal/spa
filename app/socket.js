/**
 * socket.js
 */

/* eslint-env node */
/* eslint no-console: 0 */

'use strict';

var
  express = require( 'express' ),
  app = express(),
  http = require( 'http' ).Server( app ),
  io = require( 'socket.io' )( http ),
  path = require( 'path' ),
  chokidar = require( 'chokidar' ),

  publicRoot = path.join( __dirname, 'public' ),
  watcher;

watcher = chokidar
  .watch( 'public/js/_data.js', { ignored: '' } )
  .on( 'change', function ( path ) {
    console.log(path + ' is updated');
    if ( path.indexOf( '/js/' ) >= 0 ) {
      io.emit( 'script', path.replace( /public/, '' ) );
    }
  });

app.use( express.static( publicRoot ) );

app.get( '/', function ( req, res ) {
  res.sendFile( path.join( publicRoot, 'socket.html' ) );
} );

http.listen( 5000, function () {
  console.log('Listening on port 5000');
} );
