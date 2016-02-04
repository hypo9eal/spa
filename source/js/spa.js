/*
  spa.js
*/

var spa = ( function ( $ ) {
  var initModule;

  /**
   * public spaを初期化する
   * @param  {jQueryObject} $container [description]
   */
  initModule = function ( $container ) {
    spa.shell.initModule( $container );
  };

  return { initModule: initModule };
}( jQuery ));
