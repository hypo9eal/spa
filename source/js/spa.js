/**
 * spa.js
 * - spaの定義
 * - spaの初期化
 */

/* eslint-env browser, jquery */

var spa = ( function ( $ ) {
  'use strict';

  var initModule;

  /**
   * public spaを初期化する
   * - シェルを初期化する
   * @param  {Object} $container spaコンテナのjQueryObject
   */
  initModule = function ( $container ) {
    spa.data.initModule();
    spa.model.initModule();
    spa.shell.initModule( $container );
  };

  return { initModule: initModule };
}( jQuery ));
