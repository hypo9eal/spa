/**
 * cache.js
 */

/* eslint-env node */
/* eslint no-console: 1 */

'use strict';

var
  redis = require( 'redis' ),
  client = redis.createClient(),
  makeString, deleteKey, getValue, setValue;

client.on( 'error', function ( err ) {
  console.log( '[Redis] Error: ' + err );
});

makeString = function ( key_data ) {
  return ( typeof key_data === 'string' ) ?
    key_data : JSON.stringify( key_data );
};

deleteKey = function ( key ) {
  client.del( makeString( key ) );
};

getValue = function ( key, hit_callback, miss_callback ) {
  client.get(
    makeString( key ),
    function ( err, reply ) {
      if( reply ) {
        console.log( 'HIT' );
        hit_callback( reply );
      }
      else {
        console.log( 'MISS' );
        miss_callback();
      }
    }
  );
};

setValue = function ( key, value) {
  client.set(
    makeString( key ),
    makeString( value )
  );
};

module.exports = {
  deleteKey: deleteKey,
  getValue: getValue,
  setValue: setValue
};
