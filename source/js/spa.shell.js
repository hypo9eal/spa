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
     * @type {String} main_html spaコンテナの初期化時のDOM
     * @type {Number} chat_*_time chatコンテナの開閉デュレーション
     * @type {Number} chat_*_height chatコンテナの開閉時のheight
     * @type {String} chat_*_title chatコンテナの開閉時のtitle属性値
     */
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
     * @type {Bool} is_chat_retracted chatコンテナが閉じているか否か
     */
    stateMap = {
      $container: null,
      is_chat_retracted: true
    },

    /**
     * jQueryObjectのキャッシュ
     * @type {Object} jQueryObject
     */
    jqueryMap = {},

    // メソッド群
    setJqueryMap, toggleChat, onClickChat, initModule;

  // DOM関連メソッド 開始 --------------------------------------------------------

  /**
   * private jQuryオブジェクトをキャッシュする
   * @param {jQueryObject} $container [description]
   */
  setJqueryMap = function () {
    var $container = stateMap.$container;
    jqueryMap = {
      $container: $container,
      $chat: $container.find( '.spa-shell-chat' )
    };
  };

  /**
   * private chatコンテナを開閉する
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

  // DOM関連メソッド 終了 --------------------------------------------------------

  // イベントハンドラ 開始 --------------------------------------------------------

  onClickChat = function () {
    toggleChat(stateMap.is_chat_retracted);
    return false;
  };

  // イベントハンドラ 終了 --------------------------------------------------------

  /**
   * public シェルを初期化する
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
      .attr( 'title', configMap.chat_retracted_title)
      .on( 'click', onClickChat );
  };

  return {
    initModule: initModule
  };
}());
