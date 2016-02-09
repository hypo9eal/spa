/**
 * spa.chat.js
 * - spa.chatの定義（チャットモジュール）
 * - chatモジュールの初期化と調整
 * - chatコンテナの開閉
 * - chatモジュールの状態管理
 */

/* eslint-env browser, jquery */

spa.chat = ( function () {
  var
    /**
     * 各種設定
     * @type {Object} main_html 初期化時のDOM
     * @type {Object} settable_map 外部から設定可能な設定のマップ
     * @type {String} slider_open_time chatコンテナの開閉時のデュレーション
     * @type {String} slider_close_time
     * @type {String} slider_opened_em chatコンテナの開閉後の高さ(em)
     * @type {String} slider_closed_em
     * @type {String} slider_opened_min_em chatコンテナの最小高さ(em)
     * @type {String} window_height_min_em windowの最小高さ(em)
     * @type {String} slider_opened_title chatコンテナの開閉後のtitle属性値
     * @type {String} slider_closed_title
     * @type {String} chat_model chatモデルとのやりとりに使用するオブジェクト
     * @type {String} people_model peopleモデルとのやりとりに使用するオブジェクト
     * @type {Function} set_chat_anchor shellから受け取ったsetChatAnchorメソッド
     */
    configMap = {
      main_html: [
        '<div class="spa-chat">',
        '<div class="spa-chat-head">',
        '<div class="spa-chat-head-toggle">+</div>',
        '<div class="spa-chat-head-title">Chat</div>',
        '</div>',
        '<div class="spa-chat-closer">x</div>',
        '<div class="spa-chat-sizer">',
        '<div class="spa-chat-msgs"></div>',
        '<div class="spa-chat-box">',
        '<input type="text" placeholder="hello.">',
        '<div>send</div>',
        '</div>',
        '</div>',
        '</div>'
      ].join( '' ),

      settable_map: {
        slider_open_time: true,
        slider_close_time: true,
        slider_opened_em: true,
        slider_closed_em: true,
        slider_opened_title: true,
        slider_closed_title: true,
        chat_model: true,
        people_model: true,
        set_chat_anchor: true
      },

      slider_open_time: 250,
      slider_close_time: 250,
      slider_opened_em: 18,
      slider_closed_em: 2,
      slider_opened_min_em: 10,
      window_height_min_em: 20,
      slider_opened_title: 'Click to close',
      slider_closeed_title: 'Click to open',

      chat_model: null,
      people_model: null,
      set_chat_anchor: null
    },

    /**
     * 各種状態
     * @type {Object} $append_target chatモジュールの展開先のjQueryObject
     * @type {String} position_type chatコンテナの開閉状態
     * @type {Number} px_per_em emの基準となるfont-size(px)
     * @type {Number} slider_hidden_px chatコンテナの各状態時の高さ
     * @type {Number} slider_closed_px
     * @type {Number} slider_opened_px
     */
    stateMap = {
      $append_target: null,
      position_type: 'closed',
      px_per_em: 0,
      slider_hidden_px: 0,
      slider_closed_px: 0,
      slider_opened_px: 0
    },
    jqueryMap = {},

    setJqueryMap, getEmSize, setPxSizes, setSliderPosition,
    onClickToggle, configModule, initModule,
    removeSlider, handleResize;

  // ユーティリティメソッド 開始 ---------------------------------------------------

  /**
   * private DOM要素のfont-sizeを実測値で返す
   * @param  {Object} elem 対象のDOMObject
   * @return {Number} [description]
   */
  getEmSize = function ( elem ) {
    return Number (
      getComputedStyle( elem, '' ).fontSize.match( /\d*\.?\d*/ )[0]
    );
  };

  // ユーティリティメソッド 終了 ---------------------------------------------------

  // DOM関連メソッド 開始 --------------------------------------------------------

  /**
   * private jQuryオブジェクトをキャッシュする
   */
  setJqueryMap = function () {
    var
      $append_target = stateMap.$append_target,
      $slider = $append_target.find( '.spa-chat' );

    jqueryMap = {
      $slider: $slider,
      $head: $slider.find( '.spa-chat-head' ),
      $toggle: $slider.find( '.spa-chat-head-toggle' ),
      $title: $slider.find( '.spa-chat-head-title' ),
      $sizer: $slider.find( '.spa-chat-sizer' ),
      $msgs: $slider.find( '.spa-chat-msgs' ),
      $box: $slider.find( '.spa-chat-box' ),
      $input: $slider.find( '.spa-chat-input input[type=text]' )
    };
  };

  /**
   * private
   * - chatコンテナのfont-sizeを元に各種設定値のem->px変換をする
   * - chatコンテナの高さを設定する
   */
  setPxSizes = function () {
    var px_per_em, window_height_em, opened_height_em;
    px_per_em = getEmSize( jqueryMap.$slider.get( 0 ) );
    window_height_em = Math.floor(
      ( $(window).height() / px_per_em ) + 0.5
    );

    opened_height_em =
      window_height_em > configMap.window_height_min_em
      ? configMap.slider_opened_em : configMap.slider_opened_min_em;

    stateMap.px_per_em = px_per_em;
    stateMap.slider_closed_px = configMap.slider_closed_em * px_per_em;
    stateMap.slider_opened_px = opened_height_em * px_per_em;
    jqueryMap.$sizer.css({
      height: ( opened_height_em - 2 ) * px_per_em
    });
  };

  /**
   * public chatコンテナを開閉する
   * @param {String} position_type 開閉状態を指定する
   * @param {Function} callback
   * @return {Bool} 指定した位置に移動したか否か
   */
  setSliderPosition = function ( position_type, callback ) {
    var
      height_px, animate_time, slider_title, toggle_text;

    if ( stateMap.position_type === position_type ) {
      return true;
    }

    switch ( position_type ) {
      case 'opened':
        height_px = stateMap.slider_opened_px;
        animate_time = configMap.slider_open_time;
        slider_title = configMap.slider_opened_title;
        toggle_text = '=';
        break;

      case 'hidden':
        height_px = 0;
        animate_time = configMap.slider_open_time;
        slider_title = '';
        toggle_text = '+';
        break;

      case 'closed':
        height_px = stateMap.slider_closed_px;
        animate_time = configMap.slider_close_time;
        slider_title = configMap.slider_closed_title;
        toggle_text = '+';
        break;

      default: return false;
    }

    stateMap.position_type = '';
    jqueryMap.$slider.animate({
      height: height_px },
      animate_time,
      function () {
        jqueryMap.$toggle.prop( 'title', slider_title );
        jqueryMap.$toggle.text( toggle_text );
        stateMap.position_type = position_type;
        if ( callback ) {
          callback( jqueryMap.$slider );
        }
      }
    );

    return true;
  };

  /**
   * public chatコンテナと付随する各種キャッシュを削除する
   * @return {Bool} [description]
   */
  removeSlider = function () {
    if ( jqueryMap.$slider ) {
      jqueryMap.$slider.remove();
      jqueryMap = {};
    }
    stateMap.$append_target = null;
    stateMap.position_type = 'closed';

    configMap.chat_model = null;
    configMap.people_model = null;
    configMap.set_chat_anchor = null;

    return true;
  };
  /**
   * public chatコンテナの高さを調整する
   * @return {[type]} [description]
   */
  handleResize = function () {
    if ( ! jqueryMap.$slider ) { return false; }

    setPxSizes();
    if ( stateMap.position_type === 'opened' ) {
      jqueryMap.$slider.css({
        height: stateMap.slider_opened_px
      });
      return true;
    }
  };

  // DOM関連メソッド 終了 --------------------------------------------------------

  // イベントハンドラ 開始 --------------------------------------------------------

  /**
   * private
   * @param  {[type]} event [description]
   */
  onClickToggle = function ( event ) {
    var set_chat_anchor = configMap.set_chat_anchor;

    event.stopPropagation();

    if ( stateMap.position_type === 'opened' ) {
      set_chat_anchor( 'closed' );
    } else if ( stateMap.position_type === 'closed') {
      set_chat_anchor( 'opened' );
    }
  };

  // イベントハンドラ 終了 --------------------------------------------------------

  /**
   * public モジュールの設定をする
   * @param  {Object} input_map 適用する設定のマップオブジェクト
   * @return {Object} publicなメソッドを格納したオブジェクト
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
   * public モジュールの初期化をする
   * @param  {Object} $append_target モジュールの展開先のjQueryObject
   */
  initModule = function ( $append_target ) {
    $append_target.append( configMap.main_html );
    stateMap.$append_target = $append_target;
    setJqueryMap();
    setPxSizes();

    jqueryMap.$toggle.prop( 'title', configMap.slider_closed_title );
    jqueryMap.$head.on( 'click', onClickToggle );
    stateMap.position_type = 'closed';

    return true;
  };

  return {
    setSliderPosition: setSliderPosition,
    configModule: configModule,
    initModule: initModule,
    removeSlider: removeSlider,
    handleResize: handleResize
  };
}());
