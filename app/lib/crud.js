/**
 * crud.js
 */

/* eslint-env node */
/* eslint no-console: 1 */

'use strict';

var
  path = require( 'path' ),
  mongoose = require( 'mongoose' ),
  fs = require( 'fs' ),

  Schema,
  modelMap = {
    'user': {}
  },

  capitalizeFirstLetter, loadSchema,
  checkType, readObj, constructObj, updateObj, destroyObj;

mongoose.connect( 'mongodb://localhost/spa' );
Schema = mongoose.Schema;

capitalizeFirstLetter = function ( str ) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

loadSchema = function ( schema_name, schema_path ) {
  var schema;
  fs.readFile( schema_path, 'utf-8', function ( err, data ) {
    schema = new Schema( JSON.parse( data ), {
      collection: schema_name
    });

    modelMap[ schema_name ] = mongoose.model(
      capitalizeFirstLetter( schema_name ),
      schema );
  });
};

( function () {
  var schema_name, schema_path;
  for ( schema_name in modelMap ) {
    if ( modelMap.hasOwnProperty( schema_name ) ) {
      schema_path = path.join( __dirname, schema_name + '.json' );
      loadSchema( schema_name, schema_path);
    }
  }
}() );

checkType = function ( obj_type ) {
  if ( ! modelMap[ obj_type ] ) {
    return ( {
      error_msg: 'Object Type "' + obj_type + 'is not supported.'
    } );
  }
  return true;
};

readObj = function ( obj_type, find_map, callback ) {
  var
    type_check = checkType( obj_type ),
    model;

  if ( type_check !== true ) {
    callback( type_check );
    return;
  }

  model = modelMap[ obj_type ];
  model.find( find_map, function ( err, obj ) {
    callback( err, obj );
  } );
};

constructObj = function ( obj_type, obj_map, callback ) {
  var
    type_check = checkType( obj_type ),
    obj;

  if ( type_check !== true ) {
    callback( type_check );
    return;
  }

  obj = new modelMap[ obj_type ]( {
    name: obj_map.name,
    is_online: obj_map.is_online,
    css_map: obj_map.css_map
  } );

  obj.save( function ( err, obj ) {
    callback ( err, obj );
  });
};

updateObj = function ( obj_type, find_map, update_map, callback ) {
  var
    type_check = checkType( obj_type ),
    set_map = {},
    prop_name,
    model;

  if ( type_check !== true ) {
    callback( type_check );
    return;
  }

  model = modelMap[ obj_type ];

  for ( prop_name in update_map ) {
    if ( update_map.hasOwnProperty( prop_name)
      && update_map[ prop_name ] !== undefined ) {
      set_map[ prop_name ] = update_map[ prop_name ];
    }
  }

  model.update(
    find_map,
    {
      $set: set_map
    },
    function ( err, obj ) {
      callback ( err, obj );
    });
};

destroyObj = function ( obj_type, find_map, callback ) {
  var
    type_check = checkType( obj_type ),
    model;

  if ( type_check !== true ) {
    callback( type_check );
    return;
  }

  model = modelMap[ obj_type ];
  model.remove( {
    _id: find_map._id
  },
  function ( err, obj ) {
    callback( err, obj);
  });
};

module.exports = {
  checkType: checkType,
  read: readObj,
  construct: constructObj,
  update: updateObj,
  destroy: destroyObj
};
