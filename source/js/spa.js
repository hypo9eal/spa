/**
 * spa.js
 * - spaの定義
 * - spaの初期化
 */

var spa = ( function ( $ ) {
  'use strict';

  var initModule;

  /**
   * public spaを初期化する
   * - シェルを初期化する
   * @param  {Object} $container spaコンテナのjQueryObject
   */
  initModule = function ( $container ) {
    spa.model.initModule();
    spa.shell.initModule( $container );
  };

  return { initModule: initModule };
}( jQuery ));
