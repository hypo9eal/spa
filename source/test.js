/**
 * test.js
 */

/* eslint-env node, mocha */
/* global jQuery:true, $:true, $g:true, spa:true */
/* eslint no-console: 0 */

var
  jsdom = require( 'jsdom' ).jsdom,
  window = jsdom('<html></html>').defaultView;

global.jQuery = require( 'jquery' )( window );
global.TAFFY = require( './js/lib/taffy-min.js' ).taffy;
global.$ = jQuery;
global.$g = $({});
global.spa = null;

require( './js/spa.js' );
require( './js/spa.util.js' );
require( './js/spa.data.js' );
require( './js/spa.fake.js' );
require( './js/spa.model.js' );

spa.initModule();
spa.model.setDataMode( 'fake' );

$g.on( 'spa-login', function ( event, user ) {
  console.log( 'Login user is: ', user );
});

spa.model.people.login( 'Nico' );
