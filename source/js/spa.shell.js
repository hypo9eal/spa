/**
 * spa.shell.js
 * - spa.shellの定義（マスターコントローラー）
 * - 機能モジュールの初期化と調整
 * - 機能コンテナのレンダリングと制御
 * - 状態管理
 */

/* eslint-env browser, jquery */

spa.shell = ( function () {
  var
    /**
     * 各種設定
     * @type {Object} anchor_schema_map 各種設定
     * @type {String} main_html spaコンテナの初期化時のDOM
     * @type {Number} resize_interval resizeイベントを捕捉する間隔(ms)
     */
    configMap = {
      anchor_schema_map: {
        chat : {
          opened: true,
          closed: true
        }
      },
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
        '<div class="spa-shell-modal"></div>'].join(''),
      resize_interval: 200
    },

    /**
     * 各種状態
     * @type {Object} anchor_map URIアンカーの値
     * @type {Number} タイマーID
     */
    stateMap = {
      anchor_map: {},
      resize_idto: undefined
    },

    /**
     * jQueryObjectのキャッシュ
     * @type {Object} jQueryObject
     */
    jqueryMap = {},

    copyAnchorMap, setJqueryMap, changeAnchorPart,
    onHashChange, onResize, setChatAnchor, initModule;

  // ユーティリティメソッド 開始 ---------------------------------------------------

  /**
   * 現在のURIアンカーの値をコピーする
   * @return {Object} コピーされたオブジェクト
   */
  copyAnchorMap = function () {
    return $.extend( true, {}, stateMap.anchor_map );
  };

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

  /**
   * URIアンカーを変更する
   * @param  {Object} arg_map 変更後のURIアンカーの値を示すオブジェクト
   * @return {Bool} URIアンカーの変更の成否
   */
  changeAnchorPart = function ( arg_map ) {
    var
      anchor_map_revise = copyAnchorMap(),
      bool_return = true,
      key_name, key_name_dep;

    KEYVAL:
    for ( key_name in arg_map ) {
      if ( arg_map.hasOwnProperty( key_name ) ) {
        if ( key_name.indexOf( '_' ) === 0) {
          continue KEYVAL;
        }

        anchor_map_revise[key_name] = arg_map[key_name];

        key_name_dep = '_' + key_name;

        if ( arg_map[key_name_dep] ) {
          anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
        } else {
          delete anchor_map_revise[key_name_dep];
          delete anchor_map_revise['_s' + key_name_dep];
        }
      }
    }

    try {
      $.uriAnchor.setAnchor( anchor_map_revise );
    } catch ( error ) {
      $.uriAnchor.setAnchor( stateMap.anchor_map, null, true);
      bool_return = false;
    }

    return bool_return;
  };

  // DOM関連メソッド 終了 --------------------------------------------------------

  // イベントハンドラ 開始 --------------------------------------------------------

  /**
   * URIアンカーを解析し、chatコンテナを開閉する
   * @param  {Object} event [description]
   * @return {Bool} [description]
   */
  onHashChange = function ( event ) {
    var
      _s_chat_previous, _s_chat_proposed, s_chat_proposed,
      anchor_map_proposed,
      is_ok = true,
      anchor_map_previous = copyAnchorMap();

    event.stopPropagation();

    try {
      anchor_map_proposed = $.uriAnchor.makeAnchorMap();
    } catch ( error ) {
      $.uriAnchor.setAnchor( anchor_map_previous, null, true );
      return false;
    }
    stateMap.anchor_map = anchor_map_proposed;

    _s_chat_previous = anchor_map_previous._s_chat;
    _s_chat_proposed = anchor_map_proposed._s_chat;

    if ( ! anchor_map_previous || _s_chat_previous !== _s_chat_proposed ) {
      s_chat_proposed = anchor_map_proposed.chat;
      switch ( s_chat_proposed ) {
        case 'opened':
          is_ok = spa.chat.setSliderPosition( 'opened' );
          break;

        case 'closed':
          is_ok = spa.chat.setSliderPosition( 'closed' );
          break;

        default:
          spa.chat.setSliderPosition( 'closed' );
          delete anchor_map_proposed.chat;
          $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
      }
    }

    if ( ! is_ok ) {
      if ( anchor_map_previous ) {
        $.uriAnchor.setAnchor( anchor_map_previous, null, true );
        stateMap.anchor_map = anchor_map_previous;
      } else {
        delete anchor_map_proposed.chat;
        $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
      }
    }

    return false;
  };

  /**
   * chatに関するURIアンカーの値を引数にchangeAnchorPartを実行する
   * @param {String} position_type chatコンテナの開閉状態
   * @return {Bool} アンカーが正しく更新されたか否か
   */
  setChatAnchor = function ( position_type ) {
    return changeAnchorPart( { chat : position_type } );
  };

  /**
   * handleResizeを実行するタイマーを実行する
   * - タイマーIDがあればスキップする。なければ新しいタイマーを実行する
   * @return {Bool} [description]
   */
  onResize = function () {
    if ( stateMap.resize_idto ) { return true; }

    spa.chat.handleResize();
    stateMap.resize_idto = setTimeout(
      function () {
        stateMap.resize_idto = undefined;
      },
      configMap.resize_interval
    );

    return true;
  };

  // イベントハンドラ 終了 --------------------------------------------------------

  /**
   * シェルを初期化する
   * - spaコンテナのjQueryObjectを取得してstateMapに保存
   * - spaコンテナにDOMを生成
   * - spaコンテナのjQueryObjectをキャッシュ
   * - chatコンテナの初期化
   * @param  {jQueryObj} $container spaコンテナのjQueryObject
   */
  initModule = function ( $container ) {
    // spaコンテナをstateMapに保存
    stateMap.$container = $container;

    // DOMを生成
    $container.html( configMap.main_html );

    // spaコンテナをキャッシュ
    setJqueryMap( $container );

    // uriアンカーのスキーマを設定
    $.uriAnchor.configModule({
      schema_map: configMap.anchor_schema_map
    });

    // chatモジュールを設定して初期化
    spa.chat.configModule({
      set_chat_anchor: setChatAnchor,
      chat_model: spa.model/*.chat*/,
      people_model: spa.model/*.people*/
    });
    spa.chat.initModule( jqueryMap.$container );

    // hashchangeイベントハンドラの割り当て
    $( window )
      .on( 'resize', onResize )
      .on( 'hashchange', onHashChange )
      .trigger( 'hashchange' );
  };

  return {
    initModule: initModule
  };
}());
