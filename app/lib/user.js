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
    name: {
      type: String,
      minlength: 2,
      maxlength: 127
    },
    is_online: {
      type: Boolean
    },
    css_map: {
      top: {
        type: Number,
        required: true
      },
      left: {
        type: Number,
        required: true
      },
      'background-color': {
        type: String,
        required: true,
        minlength: 0,
        maxlength: 25
      }
    }
  } );

module.exports = mongoose.model( 'User', UserSchema, 'user' );
