/**
 * spa.shell.js
 * - spa.shellの定義（マスターコントローラー）
 * - 機能モジュールの初期化と調整
 * - 機能コンテナのレンダリングと制御
 * - 状態管理
 */

spa.shell = ( function () {
  var
    /**
     * 各種設定
     * @type {Object} configMap 各種設定
     * @type {String} main_html spaコンテナの初期化時のDOM
     * @type {Number} chat_*_time chatコンテナの開閉デュレーション
     * @type {Number} chat_*_height chatコンテナの開閉時のheight
     * @type {String} chat_*_title chatコンテナの開閉時のtitle属性値
     */
    configMap = {
      anchor_schema_map: {
        chat : {
          open: true,
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
        '<div class="spa-shell-chat"></div>',
        '<div class="spa-shell-modal"></div>'].join(''),
      chat_extend_time: 1000,
      chat_retract_time: 300,
      chat_extend_height: 450,
      chat_retract_height: 15,
      chat_extended_title: 'Click to retract',
      chat_retracted_title: 'Click to extend'
    },

    /**
     * 各種状態
     * @type {Object} $container spaコンテナのjQueryObject
     * @type {Object} anchor_map URIアンカーの値
     * @type {Bool} is_chat_retracted chatコンテナが閉じているか否か
     */
    stateMap = {
      $container: null,
      anchor_map: {},
      is_chat_retracted: true
    },

    /**
     * jQueryObjectのキャッシュ
     * @type {Object} jQueryObject
     */
    jqueryMap = {},

    // メソッド群
    copyAnchorMap, setJqueryMap, toggleChat, changeAnchorPart,
    onHashChange, onClickChat, initModule;

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
      $container: $container,
      $chat: $container.find( '.spa-shell-chat' )
    };
  };

  /**
   * chatコンテナを開閉する
   * @param  {Bool} do_extend chatコンテナを開くか否か
   * @param  {Function} callback 開閉後のコールバック関数
   * @return {Bool} [description]
   */
  toggleChat = function ( do_extend, callback ) {
    var
      px_chat_ht = jqueryMap.$chat.height(),
      is_open = px_chat_ht === configMap.chat_extend_height,
      is_closed = px_chat_ht === configMap.chat_retract_height,
      is_sliding = ! is_open && ! is_closed;

    // 開閉中は処理を中断
    if (is_sliding) { return false; }

    // 開閉処理
    if ( do_extend ) {
      // 開く
      jqueryMap.$chat.animate({
        height: configMap.chat_extend_height},
        configMap.chat_extend_time,
        function () {
          // titleを設定
          jqueryMap.$chat.attr( 'title', configMap.chat_extended_title);
          // 状態を変更
          stateMap.is_chat_retracted = false;
          if ( callback ) { callback( jqueryMap.$chat );}
        });

      return true;

    } else {
      // 閉じる
      jqueryMap.$chat.animate({
        height: configMap.chat_retract_height},
        configMap.chat_retract_time,
        function () {
          // titleを設定
          jqueryMap.$chat.attr( 'title', configMap.chat_retracted_title);
          // 状態を変更
          stateMap.is_chat_retracted = true;
          if ( callback ) { callback( jqueryMap.$chat );}
        });

      return true;
    }
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
   * hashchangeのイベンントハンドラ
   * - URIアンカーをアンカーマップに変換
   * - アンカーマップを比較
   * - 状態変化があれば、値に応じてchatコンテナを開閉
   * @param  {[Object]} event [description]
   * @return {[Bool]} [description]
   */
  onHashChange = function ( event ) {
    var
      anchor_map_previous = copyAnchorMap(),
      anchor_map_proposed,
      _s_chat_previous, _s_chat_proposed,
      s_chat_proposed;

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
        case 'open':
          toggleChat( true );
          break;

        case 'closed':
          toggleChat( false );
          break;

        default:
          toggleChat( false );
          delete anchor_map_proposed.chat;
          $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
      }
    }

    return false;
  };

  /**
   * clickchatのイベントハンドラ
   * @return {[Bool]} [description]
   */
  onClickChat = function () {
    changeAnchorPart({
      chat: ( stateMap.is_chat_retracted ? 'open' : 'closed' )
    });

    return false;
  };

  // イベントハンドラ 終了 --------------------------------------------------------

  /**
   * シェルを初期化する
   * - spaコンテナのjQueryObjectを取得してstateMapに保存
   * - spaコンテナにDOMを生成
   * - spaコンテナのjQueryObjectをキャッシュ
   * - chatコンテナの初期化
   * @param  {jQueryObj} $container [description]
   */
  initModule = function ( $container ) {
    // spaコンテナをstateMapに保存
    stateMap.$container = $container;

    // DOMを生成
    $container.html( configMap.main_html );

    // spaコンテナをキャッシュ
    setJqueryMap( $container );

    // chatコンテナを初期化
    stateMap.is_chat_retracted = true;
    jqueryMap.$chat
      .attr( 'title', configMap.chat_retracted_title )
      .on( 'click', onClickChat );

    // uriアンカーのスキーマを設定
    $.uriAnchor.configModule({
      schema_map: configMap.anchor_schema_map
    });

    // chatモジュールを設定して初期化
    spa.chat.configModule( {} );
    spa.chat.initModule( jqueryMap.$chat );

    // hashchangeイベントハンドラの割り当て
    $( window )
      .on( 'hashchange', onHashChange )
      .trigger( 'hashchange' );
  };

  return {
    initModule: initModule
  };
}());
