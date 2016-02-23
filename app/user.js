/**
 * user.js
 */

/* eslint-env node */
/* eslint no-console: 0 */

'use strict';

var
  mongoose = require( 'mongoose' ),
  Schema,
  UserSchema;

mongoose.connect( 'mongodb://localhost/spa' );
Schema = mongoose.Schema;

UserSchema = new Schema(
  {
    name: String,
    is_online: Boolean,
    css_map: {
      top: Number,
      left: Number,
      'background-color': String
    }
  } );

module.exports = mongoose.model( 'User', UserSchema, 'user' );
