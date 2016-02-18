/**
 * spa.chat.js
 * - spa.chatの定義（チャットモジュール）
 * - chatモジュールの初期化と調整
 * - chatコンテナの開閉
 * - chatモジュールの状態管理
 */

/* eslint-env browser, jquery */
/* eslint no-console: 1 */

spa.chat = ( function () {
  'use strict';

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
     * @type {String} chat_model モデルのchatオブジェクト
     * @type {String} people_model モデルのpeopleオブジェクト
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
        '<div class="spa-chat-list">',
        '<div class="spa-chat-list-box"></div>',
        '</div>',
        '<div class="spa-chat-msg">',
        '<div class="spa-chat-msg-log"></div>',
        '<div class="spa-chat-msg-in">',
        '<form action="" class="spa-chat-msg-form">',
        '<input type="text">',
        '<input type="submit" style="display:none">',
        '<div class="spa-chat-msg-send">send</div>',
        '</form>',
        '</div>',
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
      slider_opened_title: 'Tap to close',
      slider_closeed_title: 'Tap to open',

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

    setJqueryMap, setPxSizes, setSliderPosition,
    scrollChat, writeChat, writeAlert, clearChat,
    onTapToggle, onSubmitMsg, onTapList,
    onSetchatee, onUpdatechat, onListchange,
    onLogin, onLogout,
    configModule,initModule,
    removeSlider, handleResize;

  // ユーティリティメソッド 開始 ---------------------------------------------------

  // ユーティリティメソッド 終了 ---------------------------------------------------

  // DOM関連メソッド 開始 --------------------------------------------------------

  /**
   * jQuryオブジェクトをキャッシュする
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
      $list_box: $slider.find( '.spa-chat-list-box' ),
      $msg_log: $slider.find( '.spa-chat-msg-log' ),
      $msg_in: $slider.find( '.spa-chat-msg-in' ),
      $input: $slider.find( '.spa-chat-msg-in input[type=text]' ),
      $send: $slider.find( '.spa-chat-msg-send' ),
      $form: $slider.find( '.spa-chat-msg-form' ),
      $document: $(document),
      $window: $(window)
    };
  };

  /**
   * - chatコンテナのfont-sizeを元に各種設定値のem->px変換をする
   * - chatコンテナの高さを設定する
   */
  setPxSizes = function () {
    var px_per_em, window_height_em, opened_height_em;
    px_per_em = spa.util_b.getEmSize( jqueryMap.$slider.get( 0 ) );
    window_height_em = Math.floor(
      ( jqueryMap.$window.height() / px_per_em ) + 0.5
    );

    opened_height_em =
      window_height_em > configMap.window_height_min_em
      ? configMap.slider_opened_em : configMap.slider_opened_min_em;

    stateMap.px_per_em = px_per_em;
    stateMap.slider_closed_px = configMap.slider_closed_em * px_per_em;
    stateMap.slider_opened_px = opened_height_em * px_per_em;
    jqueryMap.$sizer.css({
      height: ( opened_height_em - 3 ) * px_per_em
    });
  };

  /**
   * public chatコンテナを開閉する
   * @param {String} position_type 開閉状態を指定する
   * @param {Function} callback
   * @return {Boolean} 指定した位置に移動したか否か
   */
  setSliderPosition = function ( position_type, callback ) {
    var
      height_px, animate_time, slider_title, toggle_text;

    // chatコンテナがopenで、匿名ユーザーの場合
    if ( position_type === 'opened'
      && configMap.people_model.get_user().get_is_anon() ) {
      return false;
    }

    // chatコンテナが既に指定した位置にある場合
    if ( stateMap.position_type === position_type ) {
      // それがopenの場合
      if ( position_type === 'opened' ) {
        jqueryMap.$input.focus();
      }
      return true;
    }

    switch ( position_type ) {
      case 'opened':
        height_px = stateMap.slider_opened_px;
        animate_time = configMap.slider_open_time;
        slider_title = configMap.slider_opened_title;
        toggle_text = '=';
        jqueryMap.$input.focus();
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
   * @return {Boolean} 削除したか否か
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
   * @return {Boolean} 高さを調整したか否か
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

  /**
   * チャットログをスクロールする
   */
  scrollChat = function () {
    var $msg_log = jqueryMap.$msg_log;
    $msg_log.animate( {
      scrollTop: $msg_log.prop( 'scrollHeight' ) - $msg_log.height()
    }, 150 );
  };

  /**
   * チャットログにメッセージを表示する
   * @param  {String} person_name 送信者名
   * @param  {String} text メッセージの内容
   * @param  {Boolean} is_user 送信者が自分か否か
   */
  writeChat = function ( person_name, text, is_user ) {
    var msg_class = is_user ? 'spa-chat-msg-log-me' : 'spa-chat-msg-log-msg';

    jqueryMap.$msg_log.append( [
      '<div class="',
      msg_class,
      '">',
      spa.util_b.encodeHtml( person_name ),
      ': ',
      spa.util_b.encodeHtml( text ),
      '</div>' ].join('')
    );

    scrollChat();
  };

  /**
   * チャットログにアラートを表示する
   * @param  {String} alert_text アラートの内容
   */
  writeAlert = function ( alert_text ) {
    jqueryMap.$msg_log.append( [
      '<div class="spa-chat-msg-log-alert">',
      spa.util_b.encodeHtml( alert_text ),
      '</div>' ].join('')
    );

    scrollChat();
  };

  /**
   * チャットログを消去する
   */
  clearChat = function () {
    jqueryMap.$msg_log.empty();
  };

  // DOM関連メソッド 終了 --------------------------------------------------------

  // イベントハンドラ 開始 --------------------------------------------------------

  /**
   * @param  {Object} event イベントオブジェクト
   */
  onTapToggle = function ( event ) {
    var set_chat_anchor = configMap.set_chat_anchor;

    event.stopPropagation();

    if ( stateMap.position_type === 'opened' ) {
      set_chat_anchor( 'closed' );
    }
    else if ( stateMap.position_type === 'closed') {
      set_chat_anchor( 'opened' );
    }
  };

  /**
   * メッセージ送信のイベントハンドラ
   * - メッセージのwhitespaceをトリムする
   * - メッセージを送信する
   * - フォーム部品にリアクションさせる
   * @param  {[type]} event イベントオブジェクト
   */
  onSubmitMsg = function ( event ) {
    var msg_text = jqueryMap.$input.val();

    event.preventDefault();

    if ( msg_text.trim() === '' ) { return false; }

    configMap.chat_model.send_msg( msg_text );
    jqueryMap.$input.focus();
    jqueryMap.$send.addClass( 'spa-x-select' );
    setTimeout( function () {
      jqueryMap.$send.removeClass( 'spa-x-select' );
    }, 250 );
  };

  /**
   * ユーザーリスト選択のイベントハンドラ
   * - data-id属性からチャット相手のidを取得する
   * - チャット相手を設定する
   * @param  {Object} event イベントオブジェクト
   */
  onTapList = function ( event ) {
    var
      $tapped = $( event.elem_target ),
      chatee_id;

    event.preventDefault();

    if ( ! $tapped.hasClass( 'spa-chat-list-name' ) ) { return false; }
    chatee_id = $tapped.attr( 'data-id' );

    if ( ! chatee_id ) { return false; }
    configMap.chat_model.set_chatee( chatee_id );
  };

  /**
   * spa-setchateeのイベントハンドラ
   * - 新しいチャット相手がいなければアラートを表示する
   * - 選択されたユーザーを強調表示する
   * - チャット相手が変更されたことをアラートする
   * - チャットエリアのタイトルを変更する
   * @param  {Object} event イベントオブジェクト
   * @param  {Object} arg_map チャット相手情報のオブジェクト
   * @return {Boolean} チャット相手を変更したか否か
   */
  onSetchatee = function ( event, arg_map ) {
    var
      new_chatee = arg_map.new_chatee,
      old_chatee = arg_map.old_chatee;

    jqueryMap.$input.focus();
    if ( ! new_chatee ) {
      if ( old_chatee ) {
        writeAlert( old_chatee.name + 'has left the chat' );
      }
      else {
        writeAlert( 'Your friend has left the chat');
      }
      jqueryMap.$title.text( 'Chat' );
      return false;
    }

    jqueryMap.$list_box
      .find( '.spa-chat-list-name' )
      .removeClass ( 'spa-x-select' )
      .end()
      .find( '[data-id=' + arg_map.new_chatee.id + ']' )
      .addClass( 'spa-x-select' );

    writeAlert( 'Now chatting with ' + arg_map.new_chatee.name );
    jqueryMap.$title.text( 'Chat with ' + arg_map.new_chatee.name );
    return true;
  };

  /**
   * spa-listchangeのイベントハンドラ
   * - バックエンドからユーザーリストを取得する
   * - 自分を除外する
   * - ユーザーリストを表示する
   * @param  {Object} event イベントオブジェクト
   */
  onListchange = function ( event ) {
    var
      list_html = String(),
      people_db = configMap.people_model.get_db(),
      chatee = configMap.chat_model.get_chatee();

    people_db().each( function ( person, idx ) {
      var select_class = '';

      if ( person.get_is_anon() || person.get_is_user() ) {
        return true;
      }

      if ( chatee && chatee.id === person.id ) {
        select_class = ' spa-x-select';
      }

      list_html += [
        '<div class="spa-chat-list-name',
        select_class,
        '" data-id="',
        person.id,
        '">',
        spa.util_b.encodeHtml( person.name ),
        '</div>' ].join('');
    });

    if ( ! list_html ) {
      list_html = [
        '<div class="spa-chat-list-note">',
        'To chat alone is the fate of all great souls<br><br>',
        'No one is online',
        '</div>' ].join('');

      clearChat();
    }
    jqueryMap.$list_box.html( list_html );
  };

  /**
   * spa-updatechatのイベントハンドラ
   * -
   * @param  {Object} event イベントオブジェクト
   * @param  {Object} msg_map 送信メッセージのオブジェクト
   */
  onUpdatechat = function ( event, msg_map ) {
    var
      is_user,
      sender_id = msg_map.sender_id,
      msg_text = msg_map.msg_text,
      chatee = configMap.chat_model.get_chatee() || {},
      sender = configMap.people_model.get_by_cid( sender_id );

    if ( ! sender ) {
      writeAlert( msg_text );
      return false;
    }

    is_user = sender.get_is_user();

    if ( ! ( is_user || sender_id === chatee.id ) ) {
      configMap.chat_model.set_chatee( sender_id );
    }

    writeChat( sender.name, msg_text, is_user );

    if ( is_user ) {
      jqueryMap.$input.val( '' );
      jqueryMap.$input.focus();
    }
  };

  /**
   * spa-loginのイベントハンドラ
   * - chatアンカーをopenedにする
   * @param  {Object} event イベントオブジェクト
   * @param  {Object} login_user ユーザー情報オブジェクト
   */
  onLogin = function ( event, login_user ) {
    configMap.set_chat_anchor( 'opened' );
  };

  /**
   * spa-logoutのイベントハンドラ
   * - chatアンカーをclosedにする
   * - チャットエリアのタイトルを変更する
   * - チャットログを消去する
   * @param  {Object} event イベントオブジェクト
   * @param  {[type]} logout_user ユーザー情報オブジェクト
   */
  onLogout = function ( event, logout_user ) {
    configMap.set_chat_anchor( 'closed' );
    jqueryMap.$title.text( 'Chat' );
    clearChat();
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
    stateMap.$append_target = $append_target;
    $append_target.append( configMap.main_html );
    setJqueryMap();
    setPxSizes();

    jqueryMap.$toggle.prop( 'title', configMap.slider_closed_title );
    stateMap.position_type = 'closed';

    jqueryMap.$document.on(
      'spa-listchange', onListchange );

    jqueryMap.$document.on(
      'spa-setchatee', onSetchatee );

    jqueryMap.$document.on(
      'spa-updatechat', onUpdatechat );

    jqueryMap.$document.on(
      'spa-login', onLogin );

    jqueryMap.$document.on(
      'spa-logout', onLogout );

    jqueryMap.$head.on( 'utap', onTapToggle );
    jqueryMap.$list_box.on( 'utap', onTapList );
    jqueryMap.$send.on( 'utap', onSubmitMsg );
    jqueryMap.$form.on( 'submit', onSubmitMsg );
  };

  return {
    setSliderPosition: setSliderPosition,
    configModule: configModule,
    initModule: initModule,
    removeSlider: removeSlider,
    handleResize: handleResize
  };
}());
