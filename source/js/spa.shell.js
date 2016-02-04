/*
  spa.shell.js
*/

spa.shell = ( function () {
  var
    configMap = {
      main_html: [
        '<div class="spa-shell-head">',
        '<div class="spa-shell-head-logo"></div>',
        '<div class="spa-shell-head-acct"></div>',
        '<div class="spa-shell-head-search"></div>',
        '</div>',
        '<div class="spa-shell-main">',
        '<div class="spa-shell-main-nav"></div>',
        '<div class="spa-shell-main-content"></div>',
        '</div>',
        '<div class="spa-shell-foot"></div>',
        '<div class="spa-shell-chat"></div>',
        '<div class="spa-shell-modal"></div>'].join('')
    },
    stateMap = {
      $container: null
    },
    jqueryMap = {},
    setJqueryMap, initModule;

  /**
   * private jQuryオブジェクトをキャッシュする
   * @param {jQueryObject} $container [description]
   */
  setJqueryMap = function ( $container ) {
    var $container = stateMap.$container;
    jqueryMap.$container = $container;
  };

  /**
   * public シェルを初期化する
   * - コンテナのjQueryObjectを取得してstateMapに保存
   * - コンテナにDOMを生成
   * - コンテナのjQueryObjectをキャッシュ
   * @param  {jQueryObj} $container [description]
   */
  initModule = function ( $container ) {
    stateMap.$container = $container;
    $container.html( configMap.main_html );
    setJqueryMap( $container );
  };

  return {
    initModule: initModule
  };
}());
