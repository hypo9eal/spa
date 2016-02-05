/**
 * spa.chat.js
 * - spa.chatの定義（chatモジュール）
 */

spa.chat = ( function () {
  var
    configMap = {
      main_html: [
        '<div>test</div>'
      ].join( '' ),
      settable_map: {}
    },
    stateMap = {
      $container: null
    },
    jqueryMap = {},

    setJqueryMap, configModule, initModule;

  // ユーティリティメソッド 開始 ---------------------------------------------------

  // ユーティリティメソッド 終了 ---------------------------------------------------

  // DOM関連メソッド 開始 --------------------------------------------------------

  /**
   * jQuryオブジェクトをキャッシュする
   */
  setJqueryMap = function () {
    var $container = stateMap.$container;
    jqueryMap = {
      $container: $container
    };
  };

  // DOM関連メソッド 終了 --------------------------------------------------------

  // イベントハンドラ 開始 --------------------------------------------------------

  // イベントハンドラ 終了 --------------------------------------------------------

  /**
   * モジュールの設定をする
   * @param  {Object} input_map 適用する設定のマップオブジェクト
   * @return {Bool} [description]
   */
  configModule = function ( input_map ) {
    spa.util.setConfigMap({
      input_map: input_map,
      settable_map: configMap.settable_map,
      config_map: configMap
    });
    return true;
  };

  /**
   * モジュールを初期化する
   * - DOMの生成
   * - jQueryオブジェクトのキャッシュを作成
   * @param  {[type]} $container [description]
   * @return {[type]} [description]
   */
  initModule = function ( $container ) {
    $container.html( configMap.main_html );
    stateMap.$container = $container;
    setJqueryMap();
    return true;
  };

  return {
    configModule: configModule,
    initModule: initModule
  };
}());
