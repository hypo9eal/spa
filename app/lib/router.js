/**
 * router.js
 */

/* eslint-env node */
/* eslint no-console: 0 */

'use strict';

var
  express = require( 'express' ),
  router = express.Router(),
  path = require( 'path' ),
  crud = require( './crud' ),

  publicRoot = path.join( __dirname, '../', 'public' );

router.route( '*' )
  .get( function ( req, res, next ) {
    if( req.headers[ 'user-agent' ] &&
      req.headers[ 'user-agent' ].indexOf(
        'Googlebot/2.1; +http://www.google.com/bot.html' ) >= 0 ) {
      res.send( 'This page for Googlebot' );
    }
    else {
      next();
    }
  });
router.route( '/' )
  .get( function ( req, res ) {
    res.sendFile( path.join( publicRoot, 'spa.html' ) );
  });

router.route( '/api/:objType*?')
  .all( function ( req, res, next ) {
    next();
  });

router.route( '/api/:objType([a-z]+)' )
  .get( function ( req, res ) {
    crud.read(
      req.params.objType,
      {},
      function ( err, obj ) {
        if ( err ) {
          res.send( err );
        }
        res.json( obj );
      });
  })

  .post( function ( req, res ) {
    crud.construct(
      req.params.objType,
      req.body,
      function ( err, obj ) {
        if ( err ) {
          res.send( err );
        }
        res.json( obj );
      });
  });

router.route( '/api/:objType([a-z]+)/:_id([a-z0-9]+)' )
  .get( function ( req, res ) {
    crud.read(
      req.params.objType,
      {
        _id: req.params._id
      },
      function ( err, obj ) {
        if ( err ) {
          res.send( err );
        }
        res.json( obj );
      });
  })

  .put( function ( req, res ) {
    crud.update(
      req.params.objType,
      {
        _id: req.params._id
      },
      req.body,
      function ( err, obj ) {
        if ( err ) {
          res.send( err );
        }
        res.json( obj );
      });
  })

  .delete( function ( req, res ) {
    crud.destroy(
      req.params.objType,
      {
        _id: req.params._id
      },
      function ( err, obj ) {
        if ( err ) {
          res.send( err );
        }
        res.json( {
          message: 'Successfully deleated',
          obj: obj
        });
      });
  });

module.exports = router;
