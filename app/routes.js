/**
 * routes.js
 */

/* eslint-env node */
/* eslint no-console: 0 */

'use strict';

var configRoutes;

configRoutes = function ( app, server, auth ) {
  app.get( '/', auth, function ( req, res ) {
    res.redirect( '/spa.html' );
  });

  app.all( '/api/:obj_type/*?', function ( req, res, next ) {
    res.set( 'Content-Type', 'text/json' );
    next();
  });

  app.get( '/api/:obj_type/list', function ( req, res ) {
    res.send( {
      title: req.params.obj_type + ' list'
    } );
  });

  app.post( '/api/:obj_type/create', function ( req, res) {
    res.send( {
      title: req.params.obj_type + ' created'
    } );
  });

  app.get( '/api/:obj_type/read/:id([0-9]+)', function ( req, res ) {
    res.send( {
      title: req.params.obj_type + ' with id ' + req.params.id + ' found'
    } );
  });

  app.post( '/api/:obj_type/update/:id([0-9]+)', function ( req, res ) {
    res.send( {
      title: req.params.obj_type + ' with id ' + req.params.id + ' updated'
    } );
  });

  app.get( '/api/:obj_type/delete/:id([0-9]+)', function ( req, res ) {
    res.send( {
      title: req.params.obj_type + ' with id ' + req.params.id + ' deleted'
    } );
  });
};

module.exports = {
  configRoutes: configRoutes
};
