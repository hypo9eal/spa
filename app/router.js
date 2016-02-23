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

  User = require( './user' ),

  publicRoot = path.join( __dirname, 'public' );

router.route( '/' )
  .get(function ( req, res ) {
    res.sendFile( path.join( publicRoot, 'spa.html' ) );
  });

router.route( '/api/user' )
  .get( function ( req, res ) {
    User.find( {}, function ( err, user ) {
      if ( err ) {
        res.send( err );
      }
      res.json( user );
    });
  })

  .post( function ( req, res ) {
    var user = new User();

    user.name = req.body.name;
    user.is_online = req.body.is_online;
    user.css_map = req.body.css_map;

    user.save( function ( err, user ) {
      if ( err ) {
        res.send( err );
      }
      res.json( user );
    });
  });

router.route( '/api/user/:id([a-z0-9]+)' )
  .get( function ( req, res ) {
    User.findById( req.params.id, function ( err, user ) {
      if ( err ) {
        res.send( err );
      }
      res.json( user );
    });
  })

  .put( function ( req, res ) {
    User.findById( req.params.id, function ( err, user ) {
      if( err ) {
        res.send( err );
      }

      user.name = req.body.name;
      user.is_online = req.body.is_online;
      user.css_map = req.body.css_map;

      user.save( function ( err, user ) {
        if ( err ) {
          res.send( err );
        }
        res.json( user );
      });
    });
  })

  .delete( function ( req, res ) {
    User.remove( {
      _id: req.params.id
    },
    function ( err, user ) {
      if ( err ) {
        res.send( err );
      }
      res.json( {
        message: 'Successfully deleated',
        user: user
      });
    });
  });

module.exports = router;
