/**
 * spa.data.js
 * - spa.dataの定義（データモジュール）
 */

/* global io: false */

spa.data = ( function () {
  'use strict';

  var
    stateMap = {
      sio: null
    },

    makeSio, getSio, removeSio, initModule;

  /**
   * [makeSio description]
   * @return {[type]} [description]
   */
  makeSio = function () {
    var socket = io( '/chat' );

    return {
      emit: function ( event_name, data ) {
        socket.emit( event_name, data );
      },
      on: function ( event_name, callback ) {
        socket.on( event_name, function () {
          callback( arguments );
        } );
      }
    };
  };

  /**
   * [getSio description]
   * @return {[type]} [description]
   */
  getSio = function () {
    if ( ! stateMap.sio ) {
      stateMap.sio = makeSio();
    }
    return stateMap.sio;
  };

  /**
   * [removeSio description]
   * @return {[type]} [description]
   */
  removeSio = function () {
    if ( stateMap.sio ) {
      stateMap.sio = null;
    }
    return;
  };

  /**
   * [initModule description]
   * @return {[type]} [description]
   */
  initModule = function () {

  };

  return {
    getSio: getSio,
    removeSio: removeSio,
    initModule: initModule
  };
}());
